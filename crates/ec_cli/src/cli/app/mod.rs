use std::time::Duration;

use anstream::println;
use eyre::{Result, bail};
use fig_util::PRODUCT_NAME;

use crate::util::desktop::{LaunchArgs, desktop_app_running, launch_fig_desktop};

pub async fn restart_fig() -> Result<()> {
    if fig_util::system_info::is_remote() {
        bail!("Please restart {PRODUCT_NAME} from your host machine");
    }

    if !desktop_app_running() {
        launch_fig_desktop(LaunchArgs {
            wait_for_socket: true,
            open_dashboard: false,
            immediate_update: true,
            verbose: true,
        })?;

        Ok(())
    } else {
        println!("Restarting {PRODUCT_NAME}");
        crate::util::quit_fig(false).await?;
        tokio::time::sleep(Duration::from_millis(1000)).await;
        launch_fig_desktop(LaunchArgs {
            wait_for_socket: true,
            open_dashboard: false,
            immediate_update: true,
            verbose: false,
        })?;

        Ok(())
    }
}
