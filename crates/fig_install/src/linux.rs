use dbus::gnome_shell::ShellExtensions;
use fig_integrations::Integration;
use fig_integrations::desktop_entry::{AutostartIntegration, DesktopEntryIntegration};
use fig_integrations::gnome_extension::GnomeExtensionIntegration;
use fig_os_shim::Context;
use fig_util::directories::{fig_data_dir_ctx, local_webview_data_dir};
use fig_util::{CLI_BINARY_NAME, PRODUCT_NAME};
use tracing::{error, warn};

use crate::Error;

pub(crate) async fn uninstall_gnome_extension(
    ctx: &Context,
    shell_extensions: &ShellExtensions<Context>,
) -> Result<(), Error> {
    Ok(
        GnomeExtensionIntegration::new(ctx, shell_extensions, None::<&str>, None)
            .uninstall()
            .await?,
    )
}

pub(crate) async fn uninstall_desktop_entries(ctx: &Context) -> Result<(), Error> {
    DesktopEntryIntegration::new(ctx, None::<&str>, None, None)
        .uninstall()
        .await?;
    Ok(AutostartIntegration::uninstall(ctx).await?)
}

pub(crate) async fn uninstall_desktop(ctx: &Context) -> Result<(), Error> {
    let fs = ctx.fs();
    let data_dir_path = fig_data_dir_ctx(fs)?;
    if fs.exists(&data_dir_path) {
        fs.remove_dir_all(&data_dir_path)
            .await
            .map_err(|err| warn!(?err, "Failed to remove data dir"))
            .ok();
    }
    let webview_dir_path = local_webview_data_dir(ctx)?;
    if fs.exists(&webview_dir_path) {
        fs.remove_dir_all(&webview_dir_path)
            .await
            .map_err(|err| warn!(?err, "Failed to remove webview data dir"))
            .ok();
    }
    Ok(())
}
