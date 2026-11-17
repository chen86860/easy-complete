use std::path::Path;

use fig_util::consts::macos::BUNDLE_CONTENTS_MACOS_PATH;
use fig_util::consts::{APP_BUNDLE_ID, APP_PROCESS_NAME};
use fig_util::directories;
use tokio::fs;
use tracing::warn;

use crate::Error;

#[allow(unused_variables)]
pub(crate) async fn uninstall_desktop(ctx: &fig_os_shim::Context) -> Result<(), Error> {
    let app_path = fig_util::app_bundle_path();

    // The login item belongs to the app bundle (SMAppService.mainAppService), so only the app's
    // own binary can unregister it, and it has to happen before the bundle is removed. This also
    // removes the LaunchAgent that older versions used.
    let app_binary = app_path.join(BUNDLE_CONTENTS_MACOS_PATH).join(APP_PROCESS_NAME);
    if app_binary.exists() {
        run("unregister the login item", &app_binary, &["--unregister-login-item"]).await;
    }

    // Preferences of the app and of its input method
    let input_method_bundle_id = format!("{APP_BUNDLE_ID}.inputmethod");
    for domain in [APP_BUNDLE_ID, input_method_bundle_id.as_str()] {
        run("delete defaults", Path::new("defaults"), &["delete", domain]).await;
    }

    // Drop the Accessibility grant so System Settings does not keep an entry for a removed app
    run(
        "reset the Accessibility permission",
        Path::new("tccutil"),
        &["reset", "Accessibility", APP_BUNDLE_ID],
    )
    .await;

    // Data dir, logs (in the per-user temp dir) and IPC sockets
    let dirs = [
        directories::fig_data_dir(),
        directories::logs_dir(),
        directories::sockets_dir(),
    ];
    for dir in dirs.into_iter().flatten() {
        remove_dir(&dir).await;
    }

    // Homebrew owns the bundle of a cask install: deleting it would leave the cask registered,
    // and `brew upgrade` would install the app again. The CLI tells the user to run brew instead.
    if !installed_with_homebrew() {
        remove_dir(&app_path).await;
    }

    Ok(())
}

/// Whether the app was installed with the Homebrew cask.
pub fn installed_with_homebrew() -> bool {
    let mut prefixes = vec![std::path::PathBuf::from("/opt/homebrew"), "/usr/local".into()];
    if let Some(prefix) = std::env::var_os("HOMEBREW_PREFIX") {
        prefixes.insert(0, prefix.into());
    }
    prefixes
        .iter()
        .any(|prefix| prefix.join("Caskroom").join(HOMEBREW_CASK).is_dir())
}

/// Name of the Homebrew cask in the chen86860/tap tap.
pub const HOMEBREW_CASK: &str = "easy-complete";

async fn run(action: &str, program: &Path, args: &[&str]) {
    match tokio::process::Command::new(program).args(args).output().await {
        Ok(output) if !output.status.success() => {
            tracing::debug!(status = %output.status, "Unable to {action}");
        },
        Ok(_) => {},
        Err(err) => warn!("Failed to {action}: {err}"),
    }
}

async fn remove_dir(dir: &Path) {
    match fs::remove_dir_all(dir).await {
        Ok(()) => {},
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {},
        Err(err) => warn!("Failed to remove {dir:?}: {err}"),
    }
}
