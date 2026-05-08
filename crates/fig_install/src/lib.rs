pub(crate) mod download;
#[cfg(target_os = "freebsd")]
mod freebsd;
pub mod index;
#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "macos")]
pub mod macos;
#[cfg(windows)]
mod windows;

use std::str::FromStr;
use std::sync::Arc;
use std::time::SystemTimeError;

use fig_os_shim::Context;
use fig_util::manifest::{
    Channel,
    manifest,
};
#[cfg(target_os = "freebsd")]
use freebsd as os;
use index::UpdatePackage;
#[cfg(target_os = "linux")]
use linux as os;
#[cfg(target_os = "macos")]
use macos as os;
#[cfg(target_os = "macos")]
pub use os::uninstall_terminal_integrations;
use thiserror::Error;
use tokio::sync::mpsc::Receiver;
use tracing::error;
#[cfg(windows)]
use windows as os;

mod common;
pub use common::{
    InstallComponents,
    install,
    uninstall,
};

pub const UNINSTALL_URL: &str = "https://pulse.aws/survey/QYFVDA5H";

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("unsupported platform")]
    UnsupportedPlatform,
    #[error(transparent)]
    Util(#[from] fig_util::Error),
    #[error(transparent)]
    Integration(#[from] fig_integrations::Error),
    #[error(transparent)]
    Settings(#[from] fig_settings::Error),
    #[error(transparent)]
    Reqwest(#[from] reqwest::Error),
    #[error("error converting path")]
    PathConversionError(#[from] camino::FromPathBufError),
    #[error(transparent)]
    Semver(#[from] semver::Error),
    #[error(transparent)]
    SystemTime(#[from] SystemTimeError),
    #[error(transparent)]
    Strum(#[from] strum::ParseError),
    #[error("could not determine app version")]
    UnclearVersion,
    #[error("please update from your package manager")]
    PackageManaged,
    #[error("failed to update: `{0}`")]
    UpdateFailed(String),
    #[error("failed to update: `{0}`")]
    UpdateFailedPermissions(String),
    #[cfg(target_os = "macos")]
    #[error("failed to update due to auth error: `{0}`")]
    SecurityFramework(#[from] security_framework::base::Error),
    #[error("your system is not supported on this channel")]
    SystemNotOnChannel,
    #[error("manifest not found")]
    ManifestNotFound,
    #[error("Update in progress")]
    UpdateInProgress,
    #[error("could not convert path to cstring")]
    Nul(#[from] std::ffi::NulError),
    #[error("failed to get system id")]
    SystemIdNotFound,
    #[error("unable to find the bundled metadata")]
    BundleMetadataNotFound,
    #[error("unsupported variant: {0}")]
    UnsupportedVariant(String),
}

impl From<fig_util::directories::DirectoryError> for Error {
    fn from(err: fig_util::directories::DirectoryError) -> Self {
        fig_util::Error::Directory(err).into()
    }
}

// The current selected channel
pub fn get_channel() -> Result<Channel, Error> {
    Ok(match fig_settings::state::get_string("updates.channel")? {
        Some(channel) => Channel::from_str(&channel)?,
        None => {
            let manifest_channel = manifest().default_channel;
            if fig_settings::settings::get_bool_or("app.beta", false) {
                manifest_channel.max(Channel::Beta)
            } else {
                manifest_channel
            }
        },
    })
}

/// The highest channel to display to user
pub fn get_max_channel() -> Channel {
    let state_channel = fig_settings::state::get_string("updates.channel")
        .ok()
        .flatten()
        .and_then(|s| Channel::from_str(&s).ok())
        .unwrap_or(Channel::Stable);
    let manifest_channel = manifest().default_channel;
    let settings_channel = if fig_settings::settings::get_bool_or("app.beta", false) {
        Channel::Beta
    } else {
        Channel::Stable
    };

    [state_channel, manifest_channel, settings_channel]
        .into_iter()
        .max()
        .unwrap()
}

pub async fn check_for_updates(_ignore_rollout: bool, _is_auto_update: bool) -> Result<Option<UpdatePackage>, Error> {
    // Auto-update removed
    Ok(None)
}

#[derive(Debug, Clone)]
pub enum UpdateStatus {
    Percent(f32),
    Message(String),
    Error(String),
    Exit,
}

#[derive(Debug, Clone, Default)]
pub struct UpdateOptions {
    /// Ignores the rollout and forces an update if any newer version is available
    pub ignore_rollout: bool,
    /// If the update is interactive and the user will be able to respond to prompts
    pub interactive: bool,
    /// If to relaunch into dashboard after update (false will launch in background)
    pub relaunch_dashboard: bool,
    /// Whether or not the update is being invoked automatically without the user's approval
    pub is_auto_update: bool,
}

/// Auto-update removed — always reports no update available.
pub async fn update(
    _ctx: Arc<Context>,
    _on_update: Option<Box<dyn FnOnce(Receiver<UpdateStatus>) + Send>>,
    _opts: UpdateOptions,
) -> Result<bool, Error> {
    Ok(false)
}
