//! macOS launch-at-login integration.
//!
//! macOS 13 and later use `SMAppService.mainAppService`, which makes the app a
//! user-manageable Login Item. macOS 12 falls back to a per-user LaunchAgent.

#![allow(unexpected_cfgs)]

use std::borrow::Cow;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

use fig_util::consts::{APP_BUNDLE_ID, APP_PROCESS_NAME};
use fig_util::launchd_plist::{LaunchdPlist, create_launch_agent};
use objc::runtime::{BOOL, Class, Object};
use objc::{msg_send, sel, sel_impl};
use tracing::{debug, warn};

use crate::{Error, Result};

const LEGACY_LABEL: &str = "dev.emmmm.easy-complete";
const UPSTREAM_LEGACY_LABEL: &str = "com.amazon.codewhisperer.launcher";

// Force-load the framework so the dynamic `SMAppService` class lookup works.
// ServiceManagement itself exists on macOS 12; only SMAppService is 13+.
#[link(name = "ServiceManagement", kind = "framework")]
unsafe extern "C" {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ServiceStatus {
    NotRegistered = 0,
    Enabled = 1,
    RequiresApproval = 2,
    NotFound = 3,
}

impl ServiceStatus {
    fn from_raw(value: isize) -> Self {
        match value {
            1 => Self::Enabled,
            2 => Self::RequiresApproval,
            3 => Self::NotFound,
            _ => Self::NotRegistered,
        }
    }
}

/// Reconcile the persisted launch preference with the platform integration.
///
/// This is intentionally safe to call on every app launch. It also removes the
/// two historical LaunchAgents so an upgrade cannot leave duplicate jobs behind.
pub fn reconcile(enabled: bool) -> Result<()> {
    if sm_app_service().is_some() {
        remove_legacy_launch_agents()?;
        set_sm_app_service_enabled(enabled)
    } else {
        remove_legacy_launch_agent(UPSTREAM_LEGACY_LABEL)?;
        set_legacy_launch_agent_enabled(enabled)
    }
}

/// Enable or disable launch at login using the API supported by this macOS version.
pub fn set_enabled(enabled: bool) -> Result<()> {
    reconcile(enabled)
}

/// Return whether launch at login is currently enabled by the system.
pub fn is_enabled() -> Result<bool> {
    if let Some(service) = sm_app_service() {
        Ok(sm_app_service_status(service) == ServiceStatus::Enabled)
    } else {
        Ok(legacy_launch_agent_path(LEGACY_LABEL)?.exists())
    }
}

/// Whether this OS supports the ServiceManagement login-item API introduced in macOS 13.
pub fn supports_modern_login_item() -> bool {
    sm_app_service().is_some()
}

fn sm_app_service() -> Option<*mut Object> {
    // SMAppService exists only on macOS 13+. Looking the class up dynamically
    // keeps the same binary launchable on macOS 12.
    let class = Class::get("SMAppService")?;
    let service: *mut Object = unsafe { msg_send![class, mainAppService] };
    if service.is_null() { None } else { Some(service) }
}

fn sm_app_service_status(service: *mut Object) -> ServiceStatus {
    let raw: isize = unsafe { msg_send![service, status] };
    ServiceStatus::from_raw(raw)
}

fn set_sm_app_service_enabled(enabled: bool) -> Result<()> {
    let service = sm_app_service().ok_or_else(|| Error::Custom("SMAppService is unavailable".into()))?;
    let status = sm_app_service_status(service);

    if enabled && status == ServiceStatus::Enabled {
        return Ok(());
    }
    if !enabled && matches!(status, ServiceStatus::NotRegistered | ServiceStatus::NotFound) {
        return Ok(());
    }

    let mut error: *mut Object = std::ptr::null_mut();
    let succeeded: BOOL = unsafe {
        if enabled {
            msg_send![service, registerAndReturnError: &mut error]
        } else {
            msg_send![service, unregisterAndReturnError: &mut error]
        }
    };

    if succeeded {
        return Ok(());
    }

    Err(Error::Custom(
        sm_error_message(error, if enabled { "register" } else { "unregister" }).into(),
    ))
}

fn sm_error_message(error: *mut Object, action: &str) -> String {
    if error.is_null() {
        return format!("Failed to {action} the Easy Complete login item");
    }

    unsafe {
        let description: *mut Object = msg_send![error, localizedDescription];
        if description.is_null() {
            return format!("Failed to {action} the Easy Complete login item");
        }
        let utf8: *const std::ffi::c_char = msg_send![description, UTF8String];
        if utf8.is_null() {
            return format!("Failed to {action} the Easy Complete login item");
        }
        format!(
            "Failed to {action} the Easy Complete login item: {}",
            std::ffi::CStr::from_ptr(utf8).to_string_lossy()
        )
    }
}

fn set_legacy_launch_agent_enabled(enabled: bool) -> Result<()> {
    remove_legacy_launch_agent(LEGACY_LABEL)?;
    if !enabled {
        return Ok(());
    }

    let executable = current_app_executable()?;
    let launch_agent = legacy_launch_agent(executable);
    create_launch_agent(&launch_agent).map_err(|error| Error::Custom(error.to_string().into()))?;

    let path = launch_agent
        .get_file_path()
        .map_err(|error| Error::Custom(error.to_string().into()))?;
    let status = Command::new("launchctl").arg("load").arg(path.as_str()).status()?;
    if !status.success() {
        return Err(Error::Custom(
            "launchctl failed to load the Easy Complete LaunchAgent".into(),
        ));
    }

    Ok(())
}

fn legacy_launch_agent(executable: PathBuf) -> LaunchdPlist {
    LaunchdPlist::new(LEGACY_LABEL)
        .program_arguments([
            executable.to_string_lossy().to_string(),
            "--is-startup".to_owned(),
            "--no-dashboard".to_owned(),
        ])
        .associated_bundle_identifiers([APP_BUNDLE_ID])
        .run_at_load(true)
        .keep_alive(false)
}

fn current_app_executable() -> Result<PathBuf> {
    let current = std::env::current_exe()?;
    let bundle = current
        .ancestors()
        .find(|path| path.extension().is_some_and(|extension| extension == "app"))
        .ok_or_else(|| Error::ApplicationNotInstalled(Cow::Borrowed("Easy Complete.app")))?;
    Ok(bundle.join("Contents").join("MacOS").join(APP_PROCESS_NAME))
}

fn remove_legacy_launch_agents() -> Result<()> {
    remove_legacy_launch_agent(LEGACY_LABEL)?;
    remove_legacy_launch_agent(UPSTREAM_LEGACY_LABEL)
}

fn remove_legacy_launch_agent(label: &str) -> Result<()> {
    let path = legacy_launch_agent_path(label)?;
    if !path.exists() {
        return Ok(());
    }

    let uid = unsafe { nix::libc::getuid() };
    let target = format!("gui/{uid}/{label}");

    let bootout = Command::new("launchctl").args(["bootout", &target]).status();
    if let Err(error) = bootout {
        debug!(%error, %label, "Unable to boot out legacy LaunchAgent by label");
    }

    let unload = Command::new("launchctl").arg("unload").arg(&path).status();
    if let Err(error) = unload {
        debug!(%error, %label, "Unable to unload legacy LaunchAgent by path");
    }
    fs::remove_file(&path)?;
    warn!(%label, "Removed legacy launch-at-login entry");

    Ok(())
}

fn legacy_launch_agent_path(label: &str) -> Result<PathBuf> {
    Ok(fig_util::directories::home_dir()?
        .join("Library")
        .join("LaunchAgents")
        .join(format!("{label}.plist")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn service_status_values_match_service_management() {
        assert_eq!(ServiceStatus::from_raw(0), ServiceStatus::NotRegistered);
        assert_eq!(ServiceStatus::from_raw(1), ServiceStatus::Enabled);
        assert_eq!(ServiceStatus::from_raw(2), ServiceStatus::RequiresApproval);
        assert_eq!(ServiceStatus::from_raw(3), ServiceStatus::NotFound);
    }

    #[test]
    fn legacy_labels_cover_both_previous_install_paths() {
        assert_eq!(LEGACY_LABEL, APP_BUNDLE_ID);
        assert_ne!(LEGACY_LABEL, UPSTREAM_LEGACY_LABEL);
    }

    #[test]
    fn macos_12_launch_agent_starts_silently() {
        let plist = legacy_launch_agent(PathBuf::from(
            "/Applications/Easy Complete.app/Contents/MacOS/easy-complete",
        ))
        .plist();
        assert!(plist.contains("<string>--is-startup</string>"));
        assert!(plist.contains("<string>--no-dashboard</string>"));
        assert!(plist.contains("<key>RunAtLoad</key>\n        <true/>"));
        assert!(plist.contains("<key>KeepAlive</key>\n        <false/>"));
    }
}
