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
    use objc::runtime::Class;
    use objc::{
        msg_send,
        sel,
        sel_impl,
    };
    use tracing::{
        debug,
        error,
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
                debug!("Loaded embedded Sparkle.framework");
            }
        });

        Class::get("SPUStandardUpdaterController").is_some()
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
                userDriverDelegate: nil
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
        // SAFETY: SPUUpdater exposes setAutomaticallyChecksForUpdates: as a settable property.
        unsafe {
            let updater: id = msg_send![controller, updater];
            if updater != nil {
                let _: () = msg_send![updater, setAutomaticallyChecksForUpdates: YES];
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
                let _: () = msg_send![controller, checkForUpdates: nil];
            } else {
                let updater: id = msg_send![controller, updater];
                if updater == nil {
                    error!("Sparkle updater instance is unavailable");
                    return false;
                }

                let _: () = msg_send![updater, checkForUpdatesInBackground];
            }
        }

        true
    }

    pub fn start_automatic_checks() {
        // SPUStandardUpdaterController must be created on the main thread.
        // Use exec_async so we never block the caller (event loop may not be
        // running yet when this is called from the tokio async context).
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
