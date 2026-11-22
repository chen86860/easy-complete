use std::process::ExitCode;

use anstream::println;
use crossterm::style::Stylize;
use eyre::Result;
use fig_os_shim::Context;
use fig_util::{CLI_BINARY_NAME, PRODUCT_NAME};

use crate::util::dialoguer_theme;

pub async fn uninstall_command(no_confirm: bool) -> Result<ExitCode> {
    if !no_confirm {
        println!(
            "\nIs {PRODUCT_NAME} not working? Try running {}\n",
            format!("{CLI_BINARY_NAME} doctor").bold().magenta()
        );
        let should_continue = dialoguer::Select::with_theme(&dialoguer_theme())
            .with_prompt(format!("Are you sure want to continue uninstalling {PRODUCT_NAME}?"))
            .items(["Yes", "No"])
            .default(0)
            .interact_opt()?;

        if should_continue == Some(0) {
            println!("Uninstalling {PRODUCT_NAME}");
        } else {
            println!("Cancelled");
            return Ok(ExitCode::FAILURE);
        }
    };

    let ctx = Context::new();
    cfg_if::cfg_if! {
        if #[cfg(target_os = "macos")] {
            uninstall(ctx).await?;
        }
    }

    Ok(ExitCode::SUCCESS)
}

#[cfg(target_os = "macos")]
async fn uninstall(ctx: std::sync::Arc<fig_os_shim::Context>) -> Result<()> {
    fig_install::uninstall(fig_install::InstallComponents::all(), ctx).await?;
    println!("\nRestart your shell to finish: {}", "exec $SHELL".bold().magenta());
    Ok(())
}

#[cfg(all(unix, not(target_os = "macos")))]
async fn uninstall() -> Result<()> {
    eyre::bail!("Guided uninstallation is not supported on this platform. Please uninstall manually.");
}
