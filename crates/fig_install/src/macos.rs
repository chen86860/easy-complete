use fig_util::consts::APP_BUNDLE_ID;
use fig_util::directories;
use tokio::fs;
use tracing::warn;

use crate::Error;

#[allow(unused_variables)]
pub(crate) async fn uninstall_desktop(ctx: &fig_os_shim::Context) -> Result<(), Error> {
    // TODO:
    // 1. Set title of running ttys "Restart this terminal to finish uninstalling Easy Complete..."
    // 2. Delete webview cache

    // Delete Easy Complete defaults on macOS
    tokio::process::Command::new("defaults")
        .args(["delete", APP_BUNDLE_ID])
        .output()
        .await
        .map_err(|err| warn!("Failed to delete defaults: {err}"))
        .ok();

    // Delete data dir
    if let Ok(fig_data_dir) = directories::fig_data_dir() {
        let state = fig_settings::state::get_string("anonymousId").unwrap_or_default();

        for file in std::fs::read_dir(fig_data_dir).ok().into_iter().flatten().flatten() {
            if let Some(file_name) = file.file_name().to_str() {
                if file_name == "credentials.json" {
                } else if file_name == "state.json" {
                    std::fs::write(file.path(), serde_json::json!({ "anonymousId": state }).to_string())
                        .map_err(|err| warn!("Failed to write state.json: {err}"))
                        .ok();
                } else if let Ok(metadata) = file.metadata() {
                    if metadata.is_dir() {
                        fs::remove_dir_all(file.path())
                            .await
                            .map_err(|err| warn!("Failed to remove data dir: {err}"))
                            .ok();
                    } else {
                        fs::remove_file(file.path())
                            .await
                            .map_err(|err| warn!("Failed to remove data dir: {err}"))
                            .ok();
                    }
                }
            }
        }
    }

    let app_path = fig_util::app_bundle_path();
    if app_path.exists() {
        fs::remove_dir_all(&app_path)
            .await
            .map_err(|err| warn!("Failed to remove {app_path:?}: {err}"))
            .ok();
    }

    Ok(())
}
