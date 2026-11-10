#[cfg(target_os = "macos")]
mod macos {
    use std::ffi::CString;
    use std::os::unix::ffi::OsStrExt;
    use std::path::PathBuf;
    use std::sync::{Mutex, OnceLock};

    use objc2::rc::{Allocated, Retained};
    use objc2::runtime::{AnyClass, AnyObject, Bool};
    use objc2::{AnyThread, ClassType, define_class, msg_send};
    use objc2_app_kit::NSApplication;
    use objc2_foundation::{MainThreadMarker, NSBundle, NSObject, ns_string};
    use tracing::{error, info, warn};

    const CONTROLLER_CLASS: &std::ffi::CStr = c"SPUStandardUpdaterController";

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
        if AnyClass::get(CONTROLLER_CLASS).is_some() {
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

        AnyClass::get(CONTROLLER_CLASS).is_some()
    }

    define_class!(
        /// `SPUStandardUserDriverDelegate` that forces Sparkle's *scheduled* (non-user-initiated)
        /// update checks to surface immediately, the same way a manual check does.
        ///
        /// Easy Complete runs as an `LSUIElement` menu-bar agent with no Dock icon and never
        /// becomes the active app. Sparkle 2's default behavior for background-found updates is a
        /// "gentle scheduled reminder" — it defers the update alert until the app is brought to
        /// the foreground, which for an agent app effectively never happens, so the popup is never
        /// seen.
        ///
        /// `standardUserDriverShouldHandleShowingScheduledUpdate:andInImmediateFocus:` returning
        /// YES tells Sparkle to present the regular alert right away, and
        /// `standardUserDriverWillHandleShowingUpdate:forUpdate:state:` activates the process so
        /// the window comes to the front instead of hiding behind other apps.
        // SAFETY: NSObject has no subclassing requirements and the class does not implement Drop.
        #[unsafe(super(NSObject))]
        #[name = "ECSparkleUserDriverDelegate"]
        struct UserDriverDelegate;

        impl UserDriverDelegate {
            #[unsafe(method(standardUserDriverShouldHandleShowingScheduledUpdate:andInImmediateFocus:))]
            fn should_handle_scheduled(&self, _update: *mut AnyObject, _in_immediate_focus: Bool) -> Bool {
                Bool::YES
            }

            #[unsafe(method(standardUserDriverWillHandleShowingUpdate:forUpdate:state:))]
            fn will_handle_showing(&self, _handle: Bool, _update: *mut AnyObject, _state: *mut AnyObject) {
                // Sparkle calls its user driver delegate on the main thread.
                let Some(mtm) = MainThreadMarker::new() else { return };
                info!("Sparkle scheduled update found; activating app to show alert in front");
                #[allow(deprecated, reason = "activate() does not steal focus, which the alert needs")]
                NSApplication::sharedApplication(mtm).activateIgnoringOtherApps(true);
            }
        }
    );

    define_class!(
        /// `SPUUpdaterDelegate` that points Sparkle at the beta feed while `app.betaUpdates` is on.
        ///
        /// `SUFeedURL` follows `releases/latest`, which GitHub never resolves to a prerelease, so
        /// beta builds are published to a separate rolling feed named by the `ECBetaFeedURL`
        /// Info.plist key. Sparkle asks for the feed URL on every check, so toggling the setting
        /// takes effect on the next check without a restart. Returning nil keeps the `SUFeedURL`
        /// default.
        // SAFETY: NSObject has no subclassing requirements and the class does not implement Drop.
        #[unsafe(super(NSObject))]
        #[name = "ECSparkleUpdaterDelegate"]
        struct UpdaterDelegate;

        impl UpdaterDelegate {
            #[unsafe(method_id(feedURLStringForUpdater:))]
            fn feed_url_string(&self, _updater: *mut AnyObject) -> Option<Retained<AnyObject>> {
                // `define_class!` rewrites the body of a `method_id`, so it cannot use early returns.
                if fig_settings::settings::get_bool_or("app.betaUpdates", false) {
                    // The key holds a string written by build-app.sh; a missing key returns nil.
                    let url = NSBundle::mainBundle().objectForInfoDictionaryKey(ns_string!("ECBetaFeedURL"));
                    if url.is_none() {
                        warn!("Beta updates are enabled but ECBetaFeedURL is missing; using the default feed");
                    } else {
                        info!("Checking the beta update feed");
                    }
                    url
                } else {
                    None
                }
            }
        }
    );

    /// Creates one instance of a delegate class and leaks it for the lifetime of the app, since
    /// Sparkle only holds its delegates weakly.
    fn leaked_instance<T: ClassType + AnyThread>(slot: &'static OnceLock<usize>) -> *mut AnyObject {
        *slot.get_or_init(|| {
            // SAFETY: both delegate classes inherit NSObject's plain `init`.
            let obj: Retained<T> = unsafe { msg_send![T::alloc(), init] };
            Retained::into_raw(obj) as usize
        }) as *mut AnyObject
    }

    fn user_driver_delegate() -> *mut AnyObject {
        static DELEGATE: OnceLock<usize> = OnceLock::new();
        leaked_instance::<UserDriverDelegate>(&DELEGATE)
    }

    fn updater_delegate() -> *mut AnyObject {
        static DELEGATE: OnceLock<usize> = OnceLock::new();
        leaked_instance::<UpdaterDelegate>(&DELEGATE)
    }

    /// The controller is leaked into [`SPARKLE_CONTROLLER`] on creation and never released.
    fn controller_ref(ptr: usize) -> &'static AnyObject {
        // SAFETY: the pointer comes from `Retained::into_raw` in `ensure_controller`.
        unsafe { &*(ptr as *const AnyObject) }
    }

    fn updater(controller: &AnyObject) -> Option<Retained<AnyObject>> {
        // SAFETY: SPUStandardUpdaterController exposes its SPUUpdater as the `updater` property.
        unsafe { msg_send![controller, updater] }
    }

    fn ensure_controller() -> Option<&'static AnyObject> {
        let mut slot = controller_slot().lock().ok()?;
        if let Some(controller) = *slot {
            return Some(controller_ref(controller));
        }

        if !load_sparkle_framework() {
            warn!("Sparkle.framework is not available; updates are disabled");
            return None;
        }

        let Some(class) = AnyClass::get(CONTROLLER_CLASS) else {
            warn!("SPUStandardUpdaterController class is unavailable");
            return None;
        };

        // SAFETY: SPUStandardUpdaterController is provided by Sparkle 2. It retains its updater
        // internally, and we intentionally keep the controller alive for the lifetime of the app.
        let controller: Option<Retained<AnyObject>> = unsafe {
            let allocated: Allocated<AnyObject> = msg_send![class, alloc];
            msg_send![
                allocated,
                initWithStartingUpdater: Bool::YES,
                updaterDelegate: updater_delegate(),
                userDriverDelegate: user_driver_delegate(),
            ]
        };

        let Some(controller) = controller else {
            error!("Failed to create Sparkle updater controller");
            return None;
        };

        let automatically_checks = !fig_settings::settings::get_bool_or("app.disableAutoupdates", false);

        // Automatic downloads are off through `SUAllowsAutomaticUpdates = NO` in Info.plist, so a
        // scheduled check prompts instead of installing silently on quit: a menu-bar agent rarely
        // quits, so users would sit on an old version without knowing an update exists. With that
        // key Sparkle hides the "install automatically" checkbox and reports
        // `automaticallyDownloadsUpdates` as NO whatever the stored default says, including a stale
        // `SUAutomaticallyUpdate = YES` from an older build. `UserDriverDelegate` then brings the
        // prompt to the front for this LSUIElement app.
        if let Some(updater) = updater(&controller) {
            // SAFETY: SPUUpdater exposes automaticallyChecksForUpdates as a settable property.
            unsafe {
                let _: () = msg_send![&*updater, setAutomaticallyChecksForUpdates: Bool::new(automatically_checks)];
            }
            info!("Sparkle updater controller ready");
        } else {
            warn!("Sparkle updater instance is unavailable");
        }

        let ptr = Retained::into_raw(controller) as usize;
        *slot = Some(ptr);
        Some(controller_ref(ptr))
    }

    fn is_main_thread() -> bool {
        // SAFETY: pthread_main_np is a macOS extension returning non-zero on the main thread
        unsafe { libc::pthread_main_np() != 0 }
    }

    fn check_for_update_on_main(show_webview: bool) -> bool {
        let Some(controller) = ensure_controller() else {
            return false;
        };

        // SAFETY: SPUStandardUpdaterController exposes the checkForUpdates: action used by menu
        // items, while its updater exposes checkForUpdatesInBackground for silent checks.
        if show_webview {
            info!("Triggering user-initiated Sparkle update check");
            let sender: *mut AnyObject = std::ptr::null_mut();
            let _: () = unsafe { msg_send![controller, checkForUpdates: sender] };
        } else {
            let Some(updater) = updater(controller) else {
                error!("Sparkle updater instance is unavailable");
                return false;
            };

            info!("Triggering background Sparkle update check");
            let _: () = unsafe { msg_send![&*updater, checkForUpdatesInBackground] };
        }

        true
    }

    pub fn start_automatic_checks() {
        info!("Arming Sparkle scheduled update checks");
        if is_main_thread() {
            let _ = ensure_controller();
        } else {
            dispatch::Queue::main().exec_async(|| {
                let _ = ensure_controller();
            });
        }
    }

    /// Re-applies `app.disableAutoupdates` to a running updater. The controller only reads the
    /// setting when it is created, so without this a toggle takes effect only after a restart.
    pub fn sync_automatic_checks() {
        fn apply() {
            let enabled = !fig_settings::settings::get_bool_or("app.disableAutoupdates", false);
            let controller = if enabled {
                ensure_controller()
            } else {
                // Don't load Sparkle just to switch it off.
                controller_slot().lock().ok().and_then(|slot| *slot).map(controller_ref)
            };
            let Some(controller) = controller else { return };

            if let Some(updater) = updater(controller) {
                // SAFETY: SPUUpdater exposes automaticallyChecksForUpdates as a settable property.
                let _: () = unsafe { msg_send![&*updater, setAutomaticallyChecksForUpdates: Bool::new(enabled)] };
                info!(enabled, "Applied automatic update check setting");
            }
        }

        if is_main_thread() {
            apply();
        } else {
            dispatch::Queue::main().exec_async(apply);
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
pub fn sync_automatic_checks() {
    macos::sync_automatic_checks();
}

#[cfg(not(target_os = "macos"))]
pub fn sync_automatic_checks() {}

#[cfg(target_os = "macos")]
pub async fn check_for_update(show_webview: bool, _relaunch_dashboard: bool) -> bool {
    macos::check_for_update(show_webview)
}

#[cfg(not(target_os = "macos"))]
pub async fn check_for_update(_show_webview: bool, _relaunch_dashboard: bool) -> bool {
    false
}
