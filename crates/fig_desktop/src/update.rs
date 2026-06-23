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

        *slot = Some(controller as usize);
        Some(controller)
    }

    pub fn start_automatic_checks() {
        let _ = ensure_controller(true);
    }

    pub fn check_for_update(show_webview: bool) -> bool {
        let Some(controller) = ensure_controller(false) else {
            return false;
        };

        // SAFETY: The controller is an SPUStandardUpdaterController. Its updater object implements
        // Sparkle's public checkForUpdates: and checkForUpdatesInBackground selectors.
        unsafe {
            let updater: id = msg_send![controller, updater];
            if updater == nil {
                error!("Sparkle updater instance is unavailable");
                return false;
            }

            if show_webview {
                let _: () = msg_send![updater, checkForUpdates: nil];
            } else {
                let _: () = msg_send![updater, checkForUpdatesInBackground];
            }
        }

        true
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
