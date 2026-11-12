//! macOS launch-at-login integration.
//!
//! `SMAppService.mainAppService` makes the app a user-manageable Login Item. Versions that
//! still ran on macOS 12 used a per-user LaunchAgent instead, which is removed on launch.

use std::fs;
use std::path::PathBuf;
use std::process::Command;

use objc2::msg_send;
use objc2::rc::Retained;
use objc2::runtime::{AnyClass, AnyObject};
use objc2_foundation::NSError;
use tracing::{debug, warn};

use crate::{Error, Result};

const LEGACY_LABEL: &str = "dev.emmmm.easy-complete";

// Force-load the framework so the dynamic `SMAppService` class lookup works.
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
/// historical Easy Complete LaunchAgent so an upgrade cannot leave a duplicate job behind.
pub fn reconcile(enabled: bool) -> Result<()> {
    remove_legacy_launch_agent(LEGACY_LABEL)?;
    set_sm_app_service_enabled(enabled)
}

/// Enable or disable launch at login.
pub fn set_enabled(enabled: bool) -> Result<()> {
    reconcile(enabled)
}

/// Return whether launch at login is currently enabled by the system.
pub fn is_enabled() -> Result<bool> {
    let service = sm_app_service().ok_or_else(|| Error::Custom("SMAppService is unavailable".into()))?;
    Ok(sm_app_service_status(&service) == ServiceStatus::Enabled)
}

fn sm_app_service() -> Option<Retained<AnyObject>> {
    let class = AnyClass::get(c"SMAppService")?;
    unsafe { msg_send![class, mainAppService] }
}

fn sm_app_service_status(service: &AnyObject) -> ServiceStatus {
    let raw: isize = unsafe { msg_send![service, status] };
    ServiceStatus::from_raw(raw)
}

fn set_sm_app_service_enabled(enabled: bool) -> Result<()> {
    let service = sm_app_service().ok_or_else(|| Error::Custom("SMAppService is unavailable".into()))?;
    let status = sm_app_service_status(&service);

    if enabled && status == ServiceStatus::Enabled {
        return Ok(());
    }
    if !enabled && matches!(status, ServiceStatus::NotRegistered | ServiceStatus::NotFound) {
        return Ok(());
    }

    let result: Result<(), Retained<NSError>> = unsafe {
        if enabled {
            msg_send![&*service, registerAndReturnError: _]
        } else {
            msg_send![&*service, unregisterAndReturnError: _]
        }
    };

    result.map_err(|error| {
        let action = if enabled { "register" } else { "unregister" };
        Error::Custom(
            format!(
                "Failed to {action} the Easy Complete login item: {}",
                error.localizedDescription()
            )
            .into(),
        )
    })
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
}
