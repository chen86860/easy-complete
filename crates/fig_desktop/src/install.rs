use std::sync::Arc;

use fig_integrations::Integration;
use fig_os_shim::Context;
#[cfg(target_os = "macos")]
use fig_util::directories::fig_data_dir;
#[cfg(target_os = "macos")]
use macos_utils::bundle::get_bundle_path_for_executable;
use semver::Version;
use tracing::{error, warn};

#[allow(unused_imports)]
use crate::utils::is_cargo_debug_build;

const PREVIOUS_VERSION_KEY: &str = "desktop.versionAtPreviousLaunch";

/// Removes command history recorded by earlier versions: the rows in `data.sqlite3` and the
/// plain-text `history` file written before v2.6.0. Nothing records or reads either one anymore;
/// history suggestions come from the shell's own history.
fn purge_recorded_history() {
    match fig_settings::history::History::new().purge() {
        Ok(true) => tracing::info!("Purged recorded command history"),
        Ok(false) => {},
        Err(err) => error!(%err, "Failed to purge recorded command history"),
    }

    if let Ok(dir) = fig_util::directories::fig_data_dir() {
        match std::fs::remove_file(dir.join("history")) {
            Ok(()) => tracing::info!("Removed legacy plain-text history file"),
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => {},
            Err(err) => error!(%err, "Failed to remove legacy plain-text history file"),
        }
    }
}

/// Deletes the input method log on each update. Before v2.6.0 the input method logged at trace
/// level, which made `imk.log` a timeline of every app the user typed in. The migration below
/// restarts the input method on the new binary, which only logs errors.
#[cfg(target_os = "macos")]
fn remove_input_method_log() {
    if let Ok(dir) = fig_util::directories::logs_dir() {
        match std::fs::remove_file(dir.join("imk.log")) {
            Ok(()) => tracing::info!("Removed input method log"),
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => {},
            Err(err) => error!(%err, "Failed to remove input method log"),
        }
    }
}

#[cfg(target_os = "macos")]
fn run_input_method_migration() {
    use fig_integrations::input_method::InputMethod;
    use tokio::time::{Duration, sleep};
    use tracing::warn;

    let input_method = InputMethod::default();
    match input_method.target_bundle_path() {
        Ok(target_bundle_path) if target_bundle_path.exists() => {
            tokio::spawn(async move {
                input_method.terminate().ok();
                if let Err(err) = input_method.migrate().await {
                    warn!(%err, "Failed to migrate input method");
                }

                sleep(Duration::from_secs(1)).await;
                input_method.launch();
            });
        },
        Ok(_) => warn!("Input method bundle path does not exist"),
        Err(err) => warn!(%err, "Failed to get input method bundle path"),
    }
}

/// Tracks whether macOS has ever actually granted us Accessibility, so a grant that silently stops
/// working can be told apart from one that was never given.
#[cfg(target_os = "macos")]
const ACCESSIBILITY_GRANTED_KEY: &str = "desktop.accessibilityGranted";

/// Notes that macOS has actually granted Accessibility. Idempotent, and safe to call from the
/// runtime permission-change handler as well as at launch.
#[cfg(target_os = "macos")]
pub fn record_accessibility_grant() {
    use tracing::warn;

    if fig_settings::state::get_bool_or(ACCESSIBILITY_GRANTED_KEY, false) {
        return;
    }

    if let Err(err) = fig_settings::state::set_value(ACCESSIBILITY_GRANTED_KEY, true) {
        warn!(%err, "Failed to record Accessibility grant");
    }
}

/// Replacing the app bundle invalidates its TCC entry while leaving the checkbox in System Settings
/// ticked, so a reinstall can leave autocomplete inert with nothing to indicate why. The
/// once-per-version install script never re-runs for a same-version reinstall, so this check has to
/// live outside it and run on every launch.
///
/// Launch never raises macOS's own Accessibility dialog: the dashboard's permission gate offers the
/// drag guide instead. Only a granted -> revoked transition asks for the dashboard, even on a silent
/// launch, since the app is then known-broken and has no other way to reach the user. A permission
/// that was never granted is left to the dashboard and the tray warning, so users who deliberately
/// withhold it are not nagged on every start.
///
/// Returns whether the dashboard should be shown to surface the lost permission.
#[cfg(target_os = "macos")]
fn reconcile_accessibility_permission() -> bool {
    use macos_utils::accessibility::accessibility_is_enabled;
    use tracing::{info, warn};

    if accessibility_is_enabled() {
        record_accessibility_grant();
        return false;
    }

    if !fig_settings::state::get_bool_or(ACCESSIBILITY_GRANTED_KEY, false) {
        return false;
    }

    info!("Accessibility permission was granted before but is no longer in effect, showing the dashboard");
    // Clear it first so the next launch treats this as a plain missing permission and falls back to
    // the tray warning rather than surfacing the dashboard again.
    if let Err(err) = fig_settings::state::set_value(ACCESSIBILITY_GRANTED_KEY, false) {
        warn!(%err, "Failed to clear Accessibility grant");
    }
    true
}

/// Run items at launch. Returns whether the dashboard must be shown to surface a lost permission,
/// even on a silent launch.
#[allow(unused_variables)]
pub async fn run_install(ctx: Arc<Context>, ignore_immediate_update: bool, is_startup: bool) -> bool {
    #[cfg(target_os = "macos")]
    {
        initialize_fig_dir(&fig_os_shim::Env::new()).await.ok();
    }

    #[cfg(target_os = "macos")]
    let should_run_macos_install = should_run_install_script();

    #[cfg(target_os = "macos")]
    // Add any items that are only once per version
    if should_run_macos_install {
        remove_input_method_log();
        run_input_method_migration();
    }

    purge_recorded_history();

    #[cfg(target_os = "macos")]
    record_input_method_terminals();

    // Runs on every launch, unlike the once-per-version install script below.
    #[cfg(target_os = "macos")]
    let surface_permissions = reconcile_accessibility_permission();
    #[cfg(not(target_os = "macos"))]
    let surface_permissions = false;

    #[cfg(target_os = "macos")]
    if should_run_macos_install {
        // The input method is not installed here: only some terminals need it, and enabling an input
        // source unprompted re-asks users who declined it on every update. It is installed on demand
        // from the dashboard, `ec integrations install input-method`, or the `ec init` prompt in a
        // terminal that needs it.
        // First run (no previous_version) = fresh install; otherwise = update.
        if previous_version().is_none() {
            fig_telemetry::hold_until_consent();
            fig_telemetry::track("app_installed");
        } else {
            fig_telemetry::track_with_props(
                "app_updated",
                serde_json::json!({
                    "previous_version": previous_version().map(|v| v.to_string()).unwrap_or_default(),
                }),
            );
        }
    }

    // is_startup distinguishes login-item/LaunchAgent launches from manual opens,
    // so crash-loop restarts don't inflate "user opened the app" numbers.
    fig_telemetry::track_with_props("app_opened", serde_json::json!({ "is_startup": is_startup }));

    if let Err(err) = set_previous_version(current_version()) {
        error!(%err, "Failed to set previous version");
    }

    // App updates are handled by Sparkle on macOS release builds.

    surface_permissions
}

/// Symlink, and overwrite if it already exists and is invalid or not a symlink
#[cfg(target_os = "macos")]
async fn symlink(src: impl AsRef<std::path::Path>, dst: impl AsRef<std::path::Path>) -> Result<(), std::io::Error> {
    use std::io::ErrorKind;

    let src = src.as_ref();
    let dst = dst.as_ref();

    // Check if the link already exists
    match tokio::fs::symlink_metadata(dst).await {
        Ok(metadata) => {
            // If it's a symlink, check if it points to the right place
            if metadata.file_type().is_symlink()
                && let Ok(read_link) = tokio::fs::read_link(dst).await
                && read_link == src
            {
                return Ok(());
            }

            // If it's not a symlink or it points to the wrong place, delete it
            tokio::fs::remove_file(dst).await?;
        },
        Err(err) if err.kind() == ErrorKind::NotFound => {},
        Err(err) => return Err(err),
    }

    // Create the symlink
    tokio::fs::symlink(src, dst).await
}

#[cfg(target_os = "macos")]
pub async fn initialize_fig_dir(env: &fig_os_shim::Env) -> anyhow::Result<()> {
    use std::fs;

    use fig_integrations::shell::ShellExt;
    use fig_util::Shell;
    use fig_util::consts::{CLI_BINARY_NAME, PTY_BINARY_NAME};

    let local_bin = fig_util::directories::home_local_bin()?;
    if let Err(err) = fs::create_dir_all(&local_bin) {
        error!(%err, "Failed to create {local_bin:?}");
    }

    // Install ecterm to ~/.local/bin
    match get_bundle_path_for_executable(PTY_BINARY_NAME) {
        Some(pty_path) => {
            let link = local_bin.join(PTY_BINARY_NAME);
            if let Err(err) = symlink(&pty_path, link).await {
                error!(%err, "Failed to symlink for {PTY_BINARY_NAME}: {pty_path:?}");
            }

            for shell in Shell::all() {
                let pty_shell_cpy = local_bin.join(format!("{shell} ({PTY_BINARY_NAME})"));
                let pty_path = pty_path.clone();

                tokio::spawn(async move {
                    // Check version if copy already exists, this is because everytime a copy is made the first start is
                    // kinda slow and we want to avoid that
                    if pty_shell_cpy.exists() {
                        let output = tokio::process::Command::new(&pty_shell_cpy)
                            .arg("--version")
                            .output()
                            .await
                            .ok();

                        let version = output
                            .as_ref()
                            .and_then(|output| std::str::from_utf8(&output.stdout).ok())
                            .map(|s| {
                                match s.strip_prefix(PTY_BINARY_NAME) {
                                    Some(s) => s,
                                    None => s,
                                }
                                .trim()
                            });

                        if version == Some(env!("CARGO_PKG_VERSION")) {
                            return;
                        }
                    }

                    if let Err(err) = tokio::fs::remove_file(&pty_shell_cpy).await {
                        error!(%err, "Failed to remove {PTY_BINARY_NAME} shell {shell:?} copy");
                    }
                    if let Err(err) = tokio::fs::copy(&pty_path, &pty_shell_cpy).await {
                        error!(%err, "Failed to copy {PTY_BINARY_NAME} to {}", pty_shell_cpy.display());
                    }
                });
            }
        },
        None => error!("Failed to find {PTY_BINARY_NAME} in bundle"),
    }

    // install the cli to ~/.local/bin
    match get_bundle_path_for_executable(CLI_BINARY_NAME) {
        Some(ec_cli_path) => {
            let dest = local_bin.join(CLI_BINARY_NAME);
            if let Err(err) = symlink(&ec_cli_path, dest).await {
                error!(%err, "Failed to symlink {CLI_BINARY_NAME}");
            }
        },
        None => error!("Failed to find {CLI_BINARY_NAME} in bundle"),
    }

    // Init the shell directory
    std::fs::create_dir(fig_data_dir()?.join("shell")).ok();
    for shell in fig_util::Shell::all().iter() {
        for script_integration in shell.get_script_integrations().unwrap_or_default() {
            if let Err(err) = script_integration.install().await {
                error!(%err, "Failed installing shell integration {}", script_integration.describe());
            }
        }

        for shell_integration in shell.get_shell_integrations(env).unwrap_or_default() {
            if let Err(err) = shell_integration.migrate().await {
                error!(%err, "Failed installing shell integration {}", shell_integration.describe());
            }
        }
    }

    Ok(())
}

#[cfg(target_os = "macos")]
fn should_run_install_script() -> bool {
    let current_version = current_version();
    let previous_version = match previous_version() {
        Some(previous_version) => previous_version,
        None => return true,
    };

    !is_cargo_debug_build() && current_version > previous_version
}

/// The current version of the desktop app
fn current_version() -> Version {
    Version::parse(env!("CARGO_PKG_VERSION")).unwrap()
}

/// The previous version of the desktop app stored in local state
#[cfg(target_os = "macos")]
fn previous_version() -> Option<Version> {
    fig_settings::state::get_string(PREVIOUS_VERSION_KEY)
        .ok()
        .flatten()
        .and_then(|ref v| Version::parse(v).ok())
}

fn set_previous_version(version: Version) -> anyhow::Result<()> {
    fig_settings::state::set_value(PREVIOUS_VERSION_KEY, version.to_string())?;
    Ok(())
}

/// State key the dashboard reads: names of installed terminals that need the input method.
pub const INPUT_METHOD_TERMINALS_KEY: &str = "input-method.needed-by";

/// Installed terminals whose caret only the input method can follow (Ghostty, Kitty, ...),
/// by display name. Terminal.app and iTerm2 users get an empty list.
#[cfg(target_os = "macos")]
fn installed_input_method_terminals() -> Vec<String> {
    use fig_util::Terminal;
    use fig_util::terminal::{IntelliJVariant, MACOS_TERMINALS};

    let mut names: Vec<String> = MACOS_TERMINALS
        .iter()
        .cloned()
        .chain(std::iter::once(Terminal::Nova))
        .chain(
            IntelliJVariant::all()
                .iter()
                .map(|v| Terminal::IntelliJ(Some(v.clone()))),
        )
        .filter(|terminal| terminal.supports_macos_input_method())
        .filter(|terminal| {
            terminal
                .to_bundle_id()
                .is_some_and(|id| macos_utils::url::path_for_application(&id).is_some())
        })
        .map(|terminal| terminal.to_string())
        .collect();
    names.dedup();
    names
}

/// Refreshed on every launch, so a terminal installed or removed since is picked up.
#[cfg(target_os = "macos")]
fn record_input_method_terminals() {
    let names = installed_input_method_terminals();
    if let Err(err) = fig_settings::state::set_value(INPUT_METHOD_TERMINALS_KEY, serde_json::json!(names)) {
        warn!(%err, "Failed to record terminals that need the input method");
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_current_version() {
        current_version();
    }

    #[cfg(target_os = "macos")]
    #[tokio::test]
    async fn test_symlink() {
        use tempfile::tempdir;

        let tmp_dir = tempdir().unwrap();
        let tmp_dir = tmp_dir.path();

        // folders
        let src_dir_1 = tmp_dir.join("dir_1");
        let src_dir_2 = tmp_dir.join("dir_2");
        let dst_dir = tmp_dir.join("dst");

        std::fs::create_dir_all(&src_dir_1).unwrap();
        std::fs::create_dir_all(&src_dir_2).unwrap();

        // Check that a new symlink is created
        assert!(!dst_dir.exists());
        symlink(&src_dir_1, &dst_dir).await.unwrap();
        assert!(dst_dir.exists());
        assert_eq!(dst_dir.read_link().unwrap(), src_dir_1);

        // Check that the symlink is updated
        symlink(&src_dir_2, &dst_dir).await.unwrap();
        assert!(dst_dir.exists());
        assert_eq!(dst_dir.read_link().unwrap(), src_dir_2);

        // files
        let src_file_1 = src_dir_1.join("file_1");
        let src_file_2 = src_dir_2.join("file_2");
        let dst_file = dst_dir.join("file");

        std::fs::write(&src_file_1, "content 1").unwrap();
        std::fs::write(&src_file_2, "content 2").unwrap();

        // Check that a new symlink is created
        assert!(!dst_file.exists());
        symlink(&src_file_1, &dst_file).await.unwrap();
        assert!(dst_file.exists());
        assert_eq!(std::fs::read_to_string(&dst_file).unwrap(), "content 1");

        // Check that the symlink is updated
        symlink(&src_file_2, &dst_file).await.unwrap();
        assert!(dst_file.exists());
        assert_eq!(std::fs::read_to_string(&dst_file).unwrap(), "content 2");
    }
}
