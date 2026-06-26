#![allow(deprecated)]
#![allow(unexpected_cfgs)]

#[cfg(target_os = "macos")]
mod macos {
    use std::ffi::CString;
    use std::os::unix::ffi::OsStrExt;
    use std::path::PathBuf;
    use std::sync::{
        Mutex,
        OnceLock,
    };

    use cocoa::base::{
        NO,
        YES,
        id,
        nil,
    };
    use objc::declare::ClassDecl;
    use objc::runtime::{
        BOOL,
        Class,
        Object,
        Sel,
    };
    use objc::{
        msg_send,
        sel,
        sel_impl,
    };
    use tracing::{
        error,
        info,
        warn,
    };

    static SPARKLE_CONTROLLER: OnceLock<Mutex<Option<usize>>> = OnceLock::new();
    static SPARKLE_LOAD_ATTEMPTED: OnceLock<()> = OnceLock::new();

    fn controller_slot() -> &'static Mutex<Option<usize>> {
        SPARKLE_CONTROLLER.get_or_init(|| Mutex::new(None))
    }

    fn sparkle_binary_path() -> Option<PathBuf> {
        let exe = std::env::current_exe().ok()?;
        let contents = exe.parent()?.parent()?;
        Some(contents.join("Frameworks/Sparkle.framework/Sparkle"))
    }

    fn load_sparkle_framework() -> bool {
        if Class::get("SPUStandardUpdaterController").is_some() {
            return true;
        }

        SPARKLE_LOAD_ATTEMPTED.get_or_init(|| {
            let Some(path) = sparkle_binary_path() else {
                warn!("Unable to determine Sparkle framework path");
                return;
            };

            let Ok(path) = CString::new(path.as_os_str().as_bytes()) else {
                warn!(?path, "Sparkle framework path contains a NUL byte");
                return;
            };

            // SAFETY: Loading the embedded framework makes Sparkle Objective-C classes available
            // without requiring the Rust binary to link against Sparkle at build time.
            let handle = unsafe { libc::dlopen(path.as_ptr(), libc::RTLD_NOW) };
            if handle.is_null() {
                error!("Failed to load embedded Sparkle.framework");
            } else {
                info!("Loaded embedded Sparkle.framework");
            }
        });

        Class::get("SPUStandardUpdaterController").is_some()
    }

    /// Returns a shared `SPUStandardUserDriverDelegate` instance that forces Sparkle's *scheduled*
    /// (non-user-initiated) update checks to surface immediately, the same way a manual check does.
    ///
    /// Easy Complete runs as an `LSUIElement` menu-bar agent with no Dock icon and never becomes
    /// the active app. Sparkle 2's default behavior for background-found updates is a "gentle
    /// scheduled reminder" — it defers the update alert until the app is brought to the foreground,
    /// which for an agent app effectively never happens, so the popup is never seen.
    ///
    /// `standardUserDriverShouldHandleShowingScheduledUpdate:andInImmediateFocus:` returning YES
    /// tells Sparkle to present the regular alert right away, and
    /// `standardUserDriverWillHandleShowingUpdate:forUpdate:state:` activates the process so the
    /// window comes to the front instead of hiding behind other apps.
    fn user_driver_delegate() -> id {
        static DELEGATE: OnceLock<usize> = OnceLock::new();

        extern "C" fn should_handle_scheduled(
            _this: &Object,
            _cmd: Sel,
            _update: id,
            _in_immediate_focus: BOOL,
        ) -> BOOL {
            YES
        }

        extern "C" fn will_handle_showing(_this: &Object, _cmd: Sel, _handle: BOOL, _update: id, _state: id) {
            // SAFETY: NSApplication.sharedApplication is always valid once AppKit is initialized;
            // activateIgnoringOtherApps: simply brings the agent process forward for the alert.
            unsafe {
                if let Some(cls) = Class::get("NSApplication") {
                    let app: id = msg_send![cls, sharedApplication];
                    if app != nil {
                        info!("Sparkle scheduled update found; activating app to show alert in front");
                        let _: () = msg_send![app, activateIgnoringOtherApps: YES];
                    }
                }
            }
        }

        let ptr = DELEGATE.get_or_init(|| {
            let Some(superclass) = Class::get("NSObject") else {
                return 0;
            };
            let Some(mut decl) = ClassDecl::new("ECSparkleUserDriverDelegate", superclass) else {
                return 0;
            };

            // SAFETY: the method signatures match the SPUStandardUserDriverDelegate protocol.
            unsafe {
                decl.add_method(
                    sel!(standardUserDriverShouldHandleShowingScheduledUpdate:andInImmediateFocus:),
                    should_handle_scheduled as extern "C" fn(&Object, Sel, id, BOOL) -> BOOL,
                );
                decl.add_method(
                    sel!(standardUserDriverWillHandleShowingUpdate:forUpdate:state:),
                    will_handle_showing as extern "C" fn(&Object, Sel, BOOL, id, id),
                );
            }

            let cls = decl.register();
            // SAFETY: +[NSObject new] returns a retained instance we intentionally leak for the
            // lifetime of the app (Sparkle holds the delegate weakly).
            let obj: id = unsafe { msg_send![cls, new] };
            obj as usize
        });

        *ptr as id
    }

    fn ensure_controller(starts_updater: bool) -> Option<id> {
        let mut slot = controller_slot().lock().ok()?;
        if let Some(controller) = *slot {
            return Some(controller as id);
        }

        if !load_sparkle_framework() {
            warn!("Sparkle.framework is not available; updates are disabled");
            return None;
        }

        let Some(class) = Class::get("SPUStandardUpdaterController") else {
            warn!("SPUStandardUpdaterController class is unavailable");
            return None;
        };

        // SAFETY: SPUStandardUpdaterController is provided by Sparkle 2. It retains its updater
        // internally, and we intentionally keep the controller alive for the lifetime of the app.
        let controller: id = unsafe {
            let allocated: id = msg_send![class, alloc];
            let starts_updater = if starts_updater { YES } else { NO };
            msg_send![
                allocated,
                initWithStartingUpdater: starts_updater
                updaterDelegate: nil
                userDriverDelegate: user_driver_delegate()
            ]
        };

        if controller == nil {
            error!("Failed to create Sparkle updater controller");
            return None;
        }

        // Arm Sparkle's scheduled background checks explicitly. Without this, Sparkle defers
        // automatic checks until the user answers a first-run "Check for updates automatically?"
        // permission prompt. Easy Complete runs as an LSUIElement (menu-bar-only) agent with no
        // foreground window, so that prompt cannot reliably surface — leaving auto-update silently
        // disabled. Setting the choice programmatically suppresses the prompt and guarantees the
        // scheduled checker is running.
        //
        // We also force setAutomaticallyDownloadsUpdates: NO. Otherwise Sparkle's
        // `automaticallyDownloadsUpdates` (persisted as the SUAutomaticallyUpdate user default,
        // which can be left at YES from a prior install) makes background checks *silently
        // download and install* without ever showing the update alert. Easy Complete ships
        // ad-hoc signed with SUEnableInstallerLauncherService disabled, so that silent install
        // path cannot complete — the net effect is "no popup ever appears" for auto-updates even
        // though manual checks work. Disabling auto-download forces the background check to prompt.
        // SAFETY: SPUUpdater exposes both selectors as settable properties.
        unsafe {
            let updater: id = msg_send![controller, updater];
            if updater != nil {
                let _: () = msg_send![updater, setAutomaticallyChecksForUpdates: YES];
                let _: () = msg_send![updater, setAutomaticallyDownloadsUpdates: NO];
                info!(
                    "Sparkle updater controller ready (automatic checks enabled, auto-download disabled to force a prompt)"
                );
            } else {
                warn!("Sparkle updater instance is unavailable; cannot enable automatic checks");
            }
        }

        *slot = Some(controller as usize);
        Some(controller)
    }

    fn is_main_thread() -> bool {
        // SAFETY: pthread_main_np is a macOS extension returning non-zero on the main thread
        unsafe { libc::pthread_main_np() != 0 }
    }

    fn check_for_update_on_main(show_webview: bool) -> bool {
        let Some(controller) = ensure_controller(false) else {
            return false;
        };

        // SAFETY: SPUStandardUpdaterController exposes the checkForUpdates: action used by menu
        // items, while its updater exposes checkForUpdatesInBackground for silent checks.
        unsafe {
            if show_webview {
                info!("Triggering user-initiated Sparkle update check");
                let _: () = msg_send![controller, checkForUpdates: nil];
            } else {
                let updater: id = msg_send![controller, updater];
                if updater == nil {
                    error!("Sparkle updater instance is unavailable");
                    return false;
                }

                info!("Triggering background Sparkle update check");
                let _: () = msg_send![updater, checkForUpdatesInBackground];
            }
        }

        true
    }

    pub fn start_automatic_checks() {
        // SPUStandardUpdaterController must be created on the main thread.
        // Use exec_async so we never block the caller (event loop may not be
        // running yet when this is called from the tokio async context).
        info!("Arming Sparkle scheduled update checks");
        if is_main_thread() {
            let _ = ensure_controller(true);
        } else {
            dispatch::Queue::main().exec_async(|| {
                let _ = ensure_controller(true);
            });
        }
    }

    pub fn check_for_update(show_webview: bool) -> bool {
        // Sparkle's checkForUpdates: and checkForUpdatesInBackground must be called on the
        // main thread. When invoked from a tokio worker thread (e.g. via the WebView API
        // handler), calling these selectors directly causes an ObjC exception that propagates
        // through Rust's panic machinery as a foreign exception and triggers abort(). Dispatch
        // synchronously to the main queue to ensure the right thread context.
        if is_main_thread() {
            check_for_update_on_main(show_webview)
        } else {
            dispatch::Queue::main().exec_sync(move || check_for_update_on_main(show_webview))
        }
    }
}

#[cfg(target_os = "macos")]
pub fn start_automatic_checks() {
    macos::start_automatic_checks();
}

#[cfg(not(target_os = "macos"))]
pub fn start_automatic_checks() {}

#[cfg(target_os = "macos")]
pub async fn check_for_update(show_webview: bool, _relaunch_dashboard: bool) -> bool {
    macos::check_for_update(show_webview)
}

#[cfg(not(target_os = "macos"))]
pub async fn check_for_update(_show_webview: bool, _relaunch_dashboard: bool) -> bool {
    false
}
