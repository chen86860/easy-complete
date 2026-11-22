use std::path::PathBuf;
use std::sync::Arc;

use fig_integrations::Integration;
use fig_integrations::shell::ShellExt;
use fig_os_shim::{Context, Env};
use fig_util::{CLI_BINARY_NAME, PTY_BINARY_NAME, Shell, directories};

use crate::Error;

bitflags::bitflags! {
    /// The different components that can be installed.
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct InstallComponents: u64 {
        /// Removal of the integrations from user's dotfiles
        const SHELL_INTEGRATIONS    = 0b00000001;
        /// This handles the removal of the Easy Complete CLI and pty binaries.
        const BINARY                = 0b00000010;
        const DESKTOP_APP           = 0b00001000;
        const INPUT_METHOD          = 0b00010000;
        const DESKTOP_ENTRY         = 0b00100000;
        const GNOME_SHELL_EXTENSION = 0b01000000;
    }
}

/// Every step runs even when an earlier one fails, so a broken shell integration cannot leave the
/// app and its data behind. The first error is returned at the end; the others are logged.
pub async fn uninstall(components: InstallComponents, ctx: Arc<Context>) -> Result<(), Error> {
    let mut errors: Vec<Error> = vec![];

    for shell in [Shell::Bash, Shell::Zsh, Shell::Fish] {
        match shell.get_shell_integrations(ctx.env()) {
            Ok(integrations) => {
                for integration in integrations {
                    if let Err(err) = integration.uninstall().await {
                        errors.push(err.into());
                    }
                }
            },
            Err(err) => errors.push(err.into()),
        }
    }

    if components.contains(InstallComponents::BINARY) {
        let remove_binary = |path: PathBuf| async move {
            match tokio::fs::remove_file(&path).await {
                Ok(_) => tracing::info!("Removed binary: {path:?}"),
                Err(err) if err.kind() == std::io::ErrorKind::NotFound => {},
                Err(err) => tracing::warn!(%err, "Failed to remove binary: {path:?}"),
            }
        };

        // let folders = [directories::home_local_bin()?, Path::new("/usr/local/bin").into()];
        let folders = match directories::home_local_bin() {
            Ok(folder) => vec![folder],
            Err(err) => {
                errors.push(err.into());
                vec![]
            },
        };

        for folder in folders {
            for binary_name in [CLI_BINARY_NAME, PTY_BINARY_NAME] {
                let binary_path = folder.join(binary_name);
                remove_binary(binary_path).await;
            }

            for shell in Shell::all() {
                let pty_path = folder.join(format!("{shell} ({PTY_BINARY_NAME})"));
                remove_binary(pty_path).await;
            }
        }
    }

    #[cfg(target_os = "macos")]
    if components.contains(InstallComponents::INPUT_METHOD) {
        use fig_integrations::Error;
        use fig_integrations::input_method::{InputMethod, InputMethodError};

        match InputMethod::default().uninstall().await {
            Ok(_) | Err(Error::InputMethod(InputMethodError::CouldNotListInputSources)) => {},
            Err(err) => errors.push(err.into()),
        }
    }

    if components.contains(InstallComponents::DESKTOP_APP) {
        if let Err(err) = super::os::uninstall_desktop(&ctx).await {
            errors.push(err);
        }
        // Must be last -- this will kill the running desktop process if this is
        // called from the desktop app.
        let quit_res = tokio::process::Command::new("killall")
            .args([fig_util::consts::APP_PROCESS_NAME])
            .output()
            .await;
        if let Err(err) = quit_res {
            tracing::warn!("Failed to quit running Fig app: {err}");
        }
    }

    let mut errors = errors.into_iter();
    match errors.next() {
        Some(first) => {
            for err in errors {
                tracing::warn!(%err, "Uninstall step failed");
            }
            Err(first)
        },
        None => Ok(()),
    }
}

pub async fn install(components: InstallComponents, env: &Env) -> Result<(), Error> {
    if components.contains(InstallComponents::SHELL_INTEGRATIONS) {
        let mut errs: Vec<Error> = vec![];
        for shell in Shell::all() {
            match shell.get_shell_integrations(env) {
                Ok(integrations) => {
                    for integration in integrations {
                        if let Err(e) = integration.install().await {
                            errs.push(e.into());
                        }
                    }
                },
                Err(e) => {
                    errs.push(e.into());
                },
            }
        }

        if let Some(err) = errs.pop() {
            return Err(err);
        }
    }

    #[cfg(target_os = "macos")]
    if components.contains(InstallComponents::INPUT_METHOD) {
        use fig_integrations::input_method::InputMethod;
        InputMethod::default().install().await?;
    }

    Ok(())
}
