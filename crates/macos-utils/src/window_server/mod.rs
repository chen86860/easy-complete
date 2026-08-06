#![allow(non_upper_case_globals)]

mod ax_observer;
mod ui_element;
use std::boxed::Box;
use std::ffi::c_void;
use std::hash::Hash;
use std::pin::Pin;
use std::sync::OnceLock;

use accessibility_sys::{
    AXError, AXIsProcessTrusted, AXObserverRef, AXUIElementCreateApplication, AXUIElementRef,
    kAXApplicationActivatedNotification, kAXApplicationShownNotification, kAXFocusedUIElementChangedNotification,
    kAXFocusedWindowChangedNotification, kAXMainWindowChangedNotification, kAXUIElementDestroyedNotification,
    kAXWindowCreatedNotification, kAXWindowMovedNotification, kAXWindowResizedNotification, pid_t,
};
use ax_observer::AXObserver;
use core_foundation::base::TCFType;
use core_foundation::string::{CFString, CFStringRef};
use dashmap::DashMap;
use flume::Sender;
use objc2::mutability::InteriorMutable;
use objc2::rc::{Allocated, Retained};
use objc2::runtime::AnyObject;
use objc2::{ClassType, DeclaredClass, declare_class, msg_send_id, sel};
use objc2_app_kit::{
    NSApplicationActivationPolicy, NSRunningApplication, NSWorkspace, NSWorkspaceActiveSpaceDidChangeNotification,
    NSWorkspaceDidActivateApplicationNotification, NSWorkspaceDidLaunchApplicationNotification,
    NSWorkspaceDidTerminateApplicationNotification,
};
use objc2_foundation::{NSBundle, NSNotification, NSObject};
use tracing::{debug, error, info, trace, warn};
pub use ui_element::{CGWindowLevelForKey, UIElement};

use crate::util::NotificationCenter;
use crate::util::notification_center::get_app_from_notification;

// The last three are this app and the upstream builds it descends from, listed for the
// same reason `own_bundle_id` exists. They stay hardcoded because `own_bundle_id` reports
// nothing for a dev build launched outside an app bundle, and because this crate sits
// below `fig_util` in the dependency graph so it cannot read `APP_BUNDLE_ID`.
const BLOCKED_BUNDLE_IDS: &[&str] = &[
    "com.apple.ViewBridgeAuxiliary",
    "com.apple.notificationcenterui",
    "com.apple.WebKit.WebContent",
    "com.apple.WebKit.Networking",
    "com.apple.controlcenter",
    "dev.emmmm.easy-complete",
    "com.mschrage.fig",
    "com.amazon.codewhisperer",
];

/// The overlay raises the same accessibility notifications a terminal does, so observing
/// this process makes showing the overlay look like the user focusing another app, which
/// immediately hides it again. Resolved at runtime so that renaming the app keeps working
/// even if the hardcoded entry in [`BLOCKED_BUNDLE_IDS`] goes stale.
fn own_bundle_id() -> Option<&'static str> {
    static OWN_BUNDLE_ID: OnceLock<Option<String>> = OnceLock::new();
    OWN_BUNDLE_ID
        .get_or_init(|| {
            let bundle = NSBundle::mainBundle();
            // SAFETY: reads an immutable property of the process's own bundle.
            unsafe { bundle.bundleIdentifier() }.map(|id| id.to_string())
        })
        .as_deref()
}

/// Electron hosts that only expose their DOM to accessibility once asked, which is what
/// `find_x_term_caret_tree` needs to locate the xterm.js caret.
///
/// Duplicates `fig_util::Terminal::is_xterm`, which cannot be used here: `fig_util`
/// depends on this crate, so the reverse would be a cycle. Keep the two in sync.
pub const XTERM_BUNDLE_IDS: &[&str] = &[
    "com.microsoft.VSCodeInsiders",
    "com.microsoft.VSCode",
    "com.vscodium",
    "com.visualstudio.code.oss",
    "com.todesktop.230313mzl4w4u92",
    "com.todesktop.23052492jqa5xjo",
    "com.exafunction.windsurf",
    "com.exafunction.windsurf-next",
    "com.trae.app",
    "co.zeit.hyper",
    "org.tabby",
    // OpenAI Codex, shipped as ChatGPT.app since the rename.
    "com.openai.codex",
];

const TRACKED_NOTIFICATIONS: &[&str] = &[
    kAXWindowCreatedNotification,
    kAXFocusedWindowChangedNotification,
    kAXMainWindowChangedNotification,
    kAXApplicationShownNotification,
    kAXApplicationActivatedNotification,
    kAXWindowResizedNotification,
    kAXWindowMovedNotification,
    kAXUIElementDestroyedNotification,
];

/// Electron terminals put the terminal, the editor and the sidebar in one window, so moving
/// between them changes neither the focused window nor the active app and fires none of
/// [`TRACKED_NOTIFICATIONS`] — the overlay would sit there until something else happened to hide
/// it. Only these apps need element-level focus tracking, and restricting it to them keeps the
/// notification (which is chatty in web content) away from native terminals that do not need it.
const XTERM_TRACKED_NOTIFICATIONS: &[&str] = &[kAXFocusedUIElementChangedNotification];

/// Which AX notifications to subscribe for an app. Kept separate from the subscribe loop so the
/// element-level notification cannot quietly grow to every tracked app.
fn tracked_notifications(bundle_id: &str) -> Vec<&'static str> {
    let extra: &[&str] = if XTERM_BUNDLE_IDS.contains(&bundle_id) {
        XTERM_TRACKED_NOTIFICATIONS
    } else {
        &[]
    };

    TRACKED_NOTIFICATIONS.iter().chain(extra).copied().collect()
}

#[derive(PartialEq, Eq, Hash, Clone, Debug)]
pub struct ApplicationSpecifier {
    pub pid: pid_t,
    pub bundle_id: String,
}

pub enum WindowServerEvent {
    FocusChanged {
        window: UIElement,
        app: ApplicationSpecifier,
    },
    /// Keyboard focus moved to a different element inside the same window. Only emitted for
    /// [`XTERM_BUNDLE_IDS`]; see [`XTERM_TRACKED_NOTIFICATIONS`].
    FocusedElementChanged {
        element: UIElement,
        app: ApplicationSpecifier,
    },
    WindowDestroyed {
        app: ApplicationSpecifier,
    },
    ActiveSpaceChanged {
        is_fullscreen: bool,
    },
    RequestCaretPositionUpdate,
}

pub struct AccessibilityCallbackData {
    pub app: ApplicationSpecifier,
    pub sender: Sender<WindowServerEvent>,
    /// Web content re-announces focus for an element that already had it. Remembering the last
    /// one keeps those repeats from hiding the overlay while the user is still typing into it.
    pub last_focused_element: Option<UIElement>,
}

unsafe fn app_bundle_id(app: &NSRunningApplication) -> Option<String> {
    app.bundleIdentifier().map(|s| s.to_string())
}

pub struct WindowServer {
    _inner: Pin<Box<WindowServerInner>>,
    observer: Retained<ObserverClass>,
}

// SAFETY: observer id pointer is send + sync safe
unsafe impl Send for WindowServer {}
unsafe impl Sync for WindowServer {}

pub struct WindowServerInner {
    observers: DashMap<ApplicationSpecifier, AXObserver<AccessibilityCallbackData>, fnv::FnvBuildHasher>,
    sender: Sender<WindowServerEvent>,
}

impl WindowServer {
    pub fn new(sender: Sender<WindowServerEvent>) -> Self {
        let (mut inner, observer) = WindowServerInner::new_with_observer(sender);

        let mut center = NotificationCenter::workspace_center();

        // Previously (in Swift) subscribed to the following as no-ops / log only:
        // - NSWorkspaceDidDeactivateApplicationNotification
        unsafe {
            center.subscribe_with_observer(
                NSWorkspaceActiveSpaceDidChangeNotification,
                &observer,
                sel!(activeSpaceChanged:),
            );

            center.subscribe_with_observer(
                NSWorkspaceDidLaunchApplicationNotification,
                &observer,
                sel!(didLaunchApplication:),
            );

            center.subscribe_with_observer(
                NSWorkspaceDidTerminateApplicationNotification,
                &observer,
                sel!(didTerminateApplication:),
            );

            center.subscribe_with_observer(
                NSWorkspaceDidActivateApplicationNotification,
                &observer,
                sel!(didActivateApplication:),
            );
        }

        inner.init();
        Self {
            _inner: inner,
            observer,
        }
    }
}

impl Drop for WindowServer {
    fn drop(&mut self) {
        let center = NotificationCenter::workspace_center();
        unsafe {
            center.remove_observer(&self.observer);
        }
    }
}

trait WindowServerHandler {
    fn did_activate_application(&mut self, notif: &NSNotification);
    fn active_space_changed(&mut self, notif: &NSNotification);
    fn did_terminate_application(&mut self, notif: &NSNotification);
    fn did_launch_application(&mut self, notif: &NSNotification);
}

const OBSERVER_CLASS_NAME: &str = "CodeWhisperer_WindowServerObserver";

pub struct Ivars {
    handler: *mut c_void,
}

declare_class! {
    pub struct ObserverClass;

    // - The superclass NSObject does not have any subclassing requirements.
    // - Interior mutability is a safe default.
    // - `ObserverClass` does not implement `Drop`.
    unsafe impl ClassType for ObserverClass {
        type Super = NSObject;
        type Mutability = InteriorMutable;
        const NAME: &'static str = OBSERVER_CLASS_NAME;
    }

    impl DeclaredClass for ObserverClass {
        type Ivars = Ivars;
    }

    unsafe impl ObserverClass {
        #[method_id(initWithHandler:)]
        fn init_with_handler(this: Allocated<Self>, handler: *mut c_void) -> Option<Retained<Self>> {
            let this = this.set_ivars(Ivars {
                handler
            });
            unsafe { msg_send_id![super(this), init] }
        }

        #[method(didActivateApplication:)]
        fn did_activate_application(&self, notif: &NSNotification) {
            let inner = self.ivars().handler as *mut WindowServerInner;
            let inner = unsafe { &mut *inner };
            inner.did_activate_application(notif);
        }

        #[method(activeSpaceChanged:)]
        fn active_space_changed(&self, notif: &NSNotification) {
            let inner = self.ivars().handler as *mut WindowServerInner;
            let inner = unsafe { &mut *inner };
            inner.active_space_changed(notif);
        }

        #[method(didTerminateApplication:)]
        fn did_terminate_application(&self, notif: &NSNotification) {
            let inner = self.ivars().handler as *mut WindowServerInner;
            let inner = unsafe { &mut *inner };
            inner.did_terminate_application(notif);
        }

        #[method(didLaunchApplication:)]
        fn did_launch_application(&self, notif: &NSNotification) {
            let inner = self.ivars().handler as *mut WindowServerInner;
            let inner = unsafe { &mut *inner };
            inner.did_launch_application(notif);
        }
    }
}

impl ObserverClass {
    pub fn new(handler: *mut c_void) -> Retained<Self> {
        unsafe { msg_send_id![Self::alloc(), initWithHandler:handler] }
    }
}

impl WindowServerInner {
    pub fn new(sender: Sender<WindowServerEvent>) -> Self {
        Self {
            observers: Default::default(),
            sender,
        }
    }

    pub fn new_with_observer(sender: Sender<WindowServerEvent>) -> (Pin<Box<Self>>, Retained<ObserverClass>) {
        let pin = Box::pin(Self {
            observers: Default::default(),
            sender,
        });
        let handler = &*pin as *const Self as *mut c_void;
        let r = ObserverClass::new(handler);
        (pin, r)
    }

    #[allow(clippy::missing_safety_doc)]
    unsafe fn register(&mut self, ns_app: &NSRunningApplication, from_activation: bool) {
        if !AXIsProcessTrusted() {
            info!("Cannot register to observer window events without accessibility perms");
            return;
        }

        let bundle_id = match app_bundle_id(ns_app) {
            Some(bundle_id) => bundle_id,
            None => {
                debug!("Ignoring empty bundle id");
                return;
            },
        };

        if own_bundle_id() == Some(bundle_id.as_str()) {
            debug!("Ignoring own process {bundle_id:?}");
            return;
        }

        for blocked_bundle in BLOCKED_BUNDLE_IDS {
            if *blocked_bundle == bundle_id {
                debug!("Ignoring bundle id {:?}", bundle_id);
                return;
            }
        }

        if ns_app.activationPolicy() == NSApplicationActivationPolicy::Prohibited {
            debug!("Ignoring application by activation policy");
            return;
        }

        let pid = ns_app.processIdentifier();
        let key = ApplicationSpecifier {
            pid,
            bundle_id: bundle_id.clone(),
        };

        // Created only once the app is known to be worth tracking; nothing releases this
        // ref, so returning early after creating it leaks it.
        let ax_ref = AXUIElementCreateApplication(pid);

        if self.observers.contains_key(&key) {
            debug!("app {} is already registered", key.bundle_id);
            self.deregister(&key.bundle_id)
        }

        if from_activation {
            // In Swift had 0.25s delay before this...?
            let elem = UIElement::from(ax_ref);
            let sender = self.sender.clone();
            let app = key.clone();
            let activated_bundle_id = key.bundle_id.clone();
            tokio::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(250)).await;
                match elem.focused_window() {
                    Ok(window) => {
                        if let Err(e) = sender.send(WindowServerEvent::FocusChanged { window, app }) {
                            warn!("Error sending focus changed event: {e:?}");
                        }
                    },
                    Err(err) => warn!(
                        ?err,
                        "Could not read focused window of {activated_bundle_id:?} after activation"
                    ),
                }
            });
        }

        let is_xterm = XTERM_BUNDLE_IDS.contains(&key.bundle_id.as_str());
        if is_xterm {
            UIElement::from(ax_ref).enable_screen_reader_accessibility().ok();
        }

        let bundle_id = key.bundle_id.clone();
        let mut observer = match AXObserver::create(
            key.pid,
            ax_ref,
            AccessibilityCallbackData {
                app: key.clone(),
                sender: self.sender.clone(),
                last_focused_element: None,
            },
            application_ax_callback,
        ) {
            Ok(observer) => observer,
            Err(err) => {
                warn!(?err, "Could not create accessibility observer for {bundle_id:?}");
                return;
            },
        };

        // Terminals that do not use AppKit views reject some of these, and an app that
        // rejects one still delivers the rest. Subscribing all-or-nothing would leave
        // such a terminal with no window tracking at all, which strands the overlay at
        // whichever window was focused before it.
        let mut subscribed = Vec::new();
        let mut rejected: Vec<(&str, AXError)> = Vec::new();
        for notification in tracked_notifications(&key.bundle_id) {
            match observer.subscribe(notification) {
                Ok(()) => subscribed.push(notification),
                Err(err) => rejected.push((notification, err)),
            }
        }

        if !rejected.is_empty() {
            warn!(?rejected, "Notifications rejected by {bundle_id:?}");
        }

        if subscribed.is_empty() {
            warn!("Error setting up tracking for '{bundle_id:?}': every notification was rejected");
            return;
        }

        debug!(?subscribed, "Began tracking {bundle_id:?}");
        self.observers.insert(key, observer);
    }

    fn deregister(&mut self, bundle_id: &str) {
        self.observers.retain(|key, _| bundle_id != key.bundle_id);
    }

    fn register_all(&mut self) {
        self.deregister_all();

        unsafe {
            let workspace = NSWorkspace::sharedWorkspace();
            if let Some(app) = workspace.frontmostApplication() {
                self.register(&app, true);
            }

            for app in workspace.runningApplications().iter() {
                self.register(app, false)
            }
        }

        info!("Tracking {:?} applications", self.observers.len());
    }

    pub fn init(&mut self) {
        self.register_all();
    }

    fn deregister_all(&mut self) {
        self.observers.clear();
    }
}

impl WindowServerHandler for WindowServerInner {
    fn did_activate_application(&mut self, notif: &NSNotification) {
        unsafe {
            if let Some(app) = get_app_from_notification(notif) {
                let bundle_id = app_bundle_id(&app);
                trace!("Activated application {bundle_id:?}");
                self.register(&app, true);
            }
        }
    }

    fn active_space_changed(&mut self, notif: &NSNotification) {
        unsafe {
            let Some(object) = notif.object() else { return };
            let workspace: Retained<NSWorkspace> = Retained::<AnyObject>::cast(object);
            let Some(app) = workspace.frontmostApplication() else {
                return;
            };
            let pid = app.processIdentifier();
            let ax_app = AXUIElementCreateApplication(pid);
            let app_elem: UIElement = ax_app.into();
            if let Ok(window) = app_elem.focused_window() {
                let fullscreen = window.is_fullscreen();
                if let Ok(is_fullscreen) = fullscreen {
                    if let Err(e) = self
                        .sender
                        .send(WindowServerEvent::ActiveSpaceChanged { is_fullscreen })
                    {
                        warn!("Error sending active space changed notif: {e:?}");
                    }
                }
            }
        }
    }

    fn did_terminate_application(&mut self, notif: &NSNotification) {
        unsafe {
            if let Some(ns_app) = get_app_from_notification(notif) {
                if let Some(bundle_id) = app_bundle_id(&ns_app) {
                    trace!("Terminated application - {bundle_id:?}");

                    let apps = NSWorkspace::sharedWorkspace().runningApplications();

                    let has_running = apps
                        .iter()
                        .any(|running| app_bundle_id(running).map(|id| id == bundle_id).unwrap_or(false));

                    if !has_running {
                        trace!("Deregistering app {bundle_id:?} since no other instances are running");
                        self.deregister(bundle_id.as_str());
                    }
                }
            }
        }
    }

    fn did_launch_application(&mut self, notif: &NSNotification) {
        unsafe {
            if let Some(app) = get_app_from_notification(notif) {
                let bundle_id = app_bundle_id(&app);
                trace!("Launched application - {bundle_id:?}");
                self.register(&app, true)
            }
        }
    }
}

#[unsafe(no_mangle)]
unsafe extern "C" fn application_ax_callback(
    _observer: AXObserverRef,
    element: AXUIElementRef,
    notification_name: CFStringRef,
    refcon: *mut c_void,
) {
    if refcon.is_null() {
        error!("refcon must not be null");
        return;
    }

    let cb_data: &mut AccessibilityCallbackData = &mut *(refcon as *mut AccessibilityCallbackData);
    // get_rule will call CFRetain to increment the RC in objc to make sure element is not freed
    // before we are done with it. CFRelease is called automatically on drop.
    let element = UIElement::from(element);

    let name = CFString::wrap_under_get_rule(notification_name);
    let app = cb_data.app.clone();

    let event_name = name.to_string();

    let event = match &*event_name {
        kAXFocusedWindowChangedNotification | kAXMainWindowChangedNotification => {
            Some(WindowServerEvent::FocusChanged {
                window: element,
                app: app.clone(),
            })
        },
        kAXApplicationActivatedNotification | kAXApplicationShownNotification => {
            element
                .focused_window()
                .ok()
                .map(|window| WindowServerEvent::FocusChanged {
                    window,
                    app: app.clone(),
                })
        },
        kAXFocusedUIElementChangedNotification => {
            if cb_data.last_focused_element.as_ref() == Some(&element) {
                None
            } else {
                cb_data.last_focused_element = Some(element.clone());
                Some(WindowServerEvent::FocusedElementChanged {
                    element,
                    app: app.clone(),
                })
            }
        },
        kAXWindowResizedNotification | kAXWindowMovedNotification => {
            Some(WindowServerEvent::RequestCaretPositionUpdate)
        },
        kAXUIElementDestroyedNotification => {
            // We check to see if there is a valid window for the app, if there is not then we know the final
            // window has been destroyed. This is done via getting an error when trying to get the focused
            // window.
            let ax_app_ref = UIElement::from(AXUIElementCreateApplication(app.pid));
            if ax_app_ref.focused_window().is_err() {
                Some(WindowServerEvent::WindowDestroyed { app: app.clone() })
            } else {
                None
            }
        },

        unknown => {
            info!("Unhandled AX event: {unknown}");
            None
        },
    };

    if let Some(event) = event {
        if let Err(e) = cb_data.sender.send(event) {
            warn!("Error sending focus changed event: {e:?}");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn element_focus_is_tracked_only_for_electron_terminals() {
        let vscode = tracked_notifications("com.microsoft.VSCode");
        assert!(vscode.contains(&kAXFocusedUIElementChangedNotification));

        // Native terminals switch windows, not panes, and the notification is noisy enough that
        // subscribing it everywhere risks hiding the overlay mid-keystroke.
        let ghostty = tracked_notifications("com.mitchellh.ghostty");
        assert!(!ghostty.contains(&kAXFocusedUIElementChangedNotification));
    }

    #[test]
    fn window_level_notifications_are_tracked_everywhere() {
        for bundle_id in ["com.microsoft.VSCode", "com.mitchellh.ghostty", "com.apple.Terminal"] {
            let tracked = tracked_notifications(bundle_id);
            for notification in TRACKED_NOTIFICATIONS {
                assert!(tracked.contains(notification), "{bundle_id} is missing {notification}");
            }
        }
    }
}
