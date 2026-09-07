use std::process::ExitCode;

use anstream::println;
use clap::Subcommand;
use crossterm::style::Stylize;
use eyre::Result;
use fig_integrations::Integration as _;
use fig_integrations::shell::ShellExt;
use fig_os_shim::Env;
use fig_util::Shell;
use serde_json::{Map, Value, json};
use tracing::debug;

use super::OutputFormat;

#[derive(Debug, PartialEq, Eq, Subcommand)]
pub enum IntegrationsSubcommands {
    Install {
        /// Integration to install
        #[command(subcommand)]
        integration: Integration,
        /// Suppress status messages
        #[arg(long, short)]
        silent: bool,
    },
    Uninstall {
        /// Integration to uninstall
        #[command(subcommand)]
        integration: Integration,
        /// Suppress status messages
        #[arg(long, short)]
        silent: bool,
    },
    Reinstall {
        /// Integration to reinstall
        #[command(subcommand)]
        integration: Integration,
        /// Suppress status messages
        #[arg(long, short)]
        silent: bool,
    },
    Status {
        /// Integration to check status of
        #[command(subcommand)]
        integration: Integration,
        #[arg(long, short, value_enum, default_value_t)]
        format: OutputFormat,
    },
}

#[derive(Debug, Subcommand, Clone, Copy, PartialEq, Eq)]
#[non_exhaustive]
pub enum Integration {
    Dotfiles {
        /// Limit the operation to a single shell
        #[arg(value_enum)]
        shell: Option<Shell>,
    },
    InputMethod,
    #[cfg(target_os = "linux")]
    AutostartEntry,
    #[cfg(target_os = "linux")]
    GnomeShellExtension,
    /// All supported integrations
    All,
}

impl IntegrationsSubcommands {
    pub async fn execute(self) -> Result<ExitCode> {
        match self {
            IntegrationsSubcommands::Install { integration, silent } => {
                if let Integration::All = integration {
                    install(Integration::Dotfiles { shell: None }, silent).await?;
                    #[cfg(target_os = "macos")]
                    install(Integration::InputMethod, silent).await?;
                } else {
                    install(integration, silent).await?;
                }
                Ok(ExitCode::SUCCESS)
            },
            IntegrationsSubcommands::Uninstall { integration, silent } => {
                if let Integration::All = integration {
                    uninstall(Integration::Dotfiles { shell: None }, silent).await?;
                    #[cfg(target_os = "macos")]
                    uninstall(Integration::InputMethod, silent).await?;
                    #[cfg(target_os = "linux")]
                    uninstall(Integration::AutostartEntry, silent).await?;
                    #[cfg(target_os = "linux")]
                    uninstall(Integration::GnomeShellExtension, silent).await?;
                } else {
                    uninstall(integration, silent).await?;
                }
                Ok(ExitCode::SUCCESS)
            },
            IntegrationsSubcommands::Status { integration, format } => status(integration, format).await,
            IntegrationsSubcommands::Reinstall { integration, silent } => {
                if let Integration::All = integration {
                    uninstall(Integration::Dotfiles { shell: None }, silent).await?;
                    #[cfg(target_os = "macos")]
                    uninstall(Integration::InputMethod, silent).await?;
                    install(Integration::Dotfiles { shell: None }, silent).await?;
                    #[cfg(target_os = "macos")]
                    install(Integration::InputMethod, silent).await?;
                } else {
                    uninstall(integration, silent).await?;
                    install(integration, silent).await?;
                }
                Ok(ExitCode::SUCCESS)
            },
        }
    }
}

fn integration_name(integration: Integration) -> &'static str {
    match integration {
        Integration::Dotfiles { .. } => "dotfiles",
        Integration::InputMethod => "input-method",
        #[cfg(target_os = "linux")]
        Integration::AutostartEntry => "autostart-entry",
        #[cfg(target_os = "linux")]
        Integration::GnomeShellExtension => "gnome-shell-extension",
        Integration::All => "all",
    }
}

#[allow(unused_mut)]
async fn install(integration: Integration, silent: bool) -> Result<()> {
    let mut installed = false;
    let mut errored = false;
    let mut status: Option<&str> = None;

    let result = match integration {
        Integration::All => Ok(()),
        Integration::Dotfiles { shell } => {
            let shells = selected_shells(shell);

            let mut errs: Vec<String> = vec![];
            for shell in &shells {
                match shell.get_shell_integrations(&Env::new()) {
                    Ok(integrations) => {
                        for integration in integrations {
                            match integration.is_installed().await {
                                Ok(_) => {
                                    debug!("Skipping {}", integration.describe());
                                },
                                Err(_) => {
                                    installed = true;
                                    if let Err(e) = integration.install().await {
                                        errs.push(format!(
                                            "{}: {}",
                                            integration.describe().bold(),
                                            e.verbose_message()
                                        ));
                                    }
                                },
                            }
                        }
                    },
                    Err(e) => {
                        errs.push(format!("{shell}: {e}"));
                    },
                }
            }

            if errs.is_empty() {
                Ok(())
            } else {
                Err(eyre::eyre!("\n\n{}", errs.join("\n\n")))
            }
        },
        Integration::InputMethod => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    fig_integrations::input_method::InputMethod::default().install().await?;
                    installed = true;
                    status = Some("You must restart your terminal to finish installing the input method.");
                    Ok(())
                } else {
                    errored = true;
                    Err(eyre::eyre!("Input method integration is only supported on macOS"))
                }
            }
        },
        #[cfg(target_os = "linux")]
        Integration::AutostartEntry => {
            errored = true;
            Err(eyre::eyre!(
                "Installing the autostart entry from the CLI is not supported"
            ))
        },
        #[cfg(target_os = "linux")]
        Integration::GnomeShellExtension => {
            errored = true;
            Err(eyre::eyre!(
                "Installing the GNOME Shell extension from the CLI is not supported"
            ))
        },
    };

    if installed && result.is_ok() {
        fig_telemetry::track_blocking(
            "integration_installed",
            json!({ "integration": integration_name(integration) }),
        )
        .await;
    }

    if installed && result.is_ok() && !silent {
        println!("Installed!");

        if let Some(status) = status {
            println!("{status}");
        }
    }

    if !errored && !installed && !silent {
        println!("Already installed");
    }

    result
}

async fn uninstall(integration: Integration, silent: bool) -> Result<()> {
    let mut uninstalled = false;

    let result = match integration {
        Integration::All => Ok(()),
        Integration::Dotfiles { shell } => {
            let shells = selected_shells(shell);

            let mut errs: Vec<String> = vec![];
            for shell in &shells {
                match shell.get_shell_integrations(&Env::new()) {
                    Ok(integrations) => {
                        for integration in integrations {
                            match integration.is_installed().await {
                                Ok(_) => {
                                    uninstalled = true;
                                    if let Err(e) = integration.uninstall().await {
                                        errs.push(format!(
                                            "{}: {}",
                                            integration.describe().bold(),
                                            e.verbose_message()
                                        ));
                                    }
                                },
                                Err(_) => {
                                    debug!("Skipping {}", integration.describe());
                                },
                            }
                        }
                    },
                    Err(e) => {
                        errs.push(format!("{shell}: {e}"));
                    },
                }
            }

            if errs.is_empty() {
                Ok(())
            } else {
                Err(eyre::eyre!("\n\n{}", errs.join("\n\n")))
            }
        },
        Integration::InputMethod => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    fig_integrations::input_method::InputMethod::default().uninstall().await?;
                    uninstalled = true;
                    Ok(())
                } else {
                    Err(eyre::eyre!("Input method integration is only supported on macOS"))
                }
            }
        },
        #[cfg(target_os = "linux")]
        Integration::AutostartEntry => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "linux")] {
                    use fig_integrations::desktop_entry::AutostartIntegration;
                    use fig_os_shim::Context;
                    AutostartIntegration::uninstall(&Context::new()).await?;
                    uninstalled = true;
                    Ok(())
                } else {
                    Err(eyre::eyre!("The autostart integration is only supported on Linux"))
                }
            }
        },
        #[cfg(target_os = "linux")]
        Integration::GnomeShellExtension => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "linux")] {
                    use std::sync::Arc;
                    use dbus::gnome_shell::ShellExtensions;
                    use fig_integrations::gnome_extension::GnomeExtensionIntegration;
                    use fig_os_shim::Context;
                    let ctx = Context::new();
                    let shell_extensions = ShellExtensions::new(Arc::downgrade(&ctx));
                    uninstalled = GnomeExtensionIntegration::new(&ctx, &shell_extensions, None::<&str>, None).uninstall_manually().await?;
                    Ok(())
                } else {
                    Err(eyre::eyre!("The GNOME Shell extension is only supported on Linux"))
                }
            }
        },
    };

    if uninstalled && result.is_ok() && !silent {
        println!("Uninstalled!");
    }

    if !uninstalled && !silent {
        println!("Not installed");
    }

    result
}

fn selected_shells(shell: Option<Shell>) -> Vec<Shell> {
    shell.map_or_else(|| vec![Shell::Bash, Shell::Zsh, Shell::Fish], |shell| vec![shell])
}

struct IntegrationStatus {
    text: String,
    json: Value,
    failed: bool,
}

impl IntegrationStatus {
    fn installed(installed: bool) -> Self {
        Self {
            text: if installed { "Installed" } else { "Not installed" }.to_owned(),
            json: json!({ "installed": installed }),
            failed: false,
        }
    }
}

async fn query_status(integration: Integration) -> Result<IntegrationStatus> {
    match integration {
        Integration::All => eyre::bail!("Use the combined status query for all integrations"),
        Integration::Dotfiles { shell } => {
            let mut integrations = Vec::new();
            let mut errors = Vec::new();
            let mut text = String::new();
            for shell in selected_shells(shell) {
                match shell.get_shell_integrations(&Env::new()) {
                    Ok(shell_integrations) => {
                        for integration in shell_integrations {
                            let installed = integration.is_installed().await.is_ok();
                            let description = integration.describe();
                            let marker = if installed {
                                "✔ ".green().to_string()
                            } else {
                                "✘ ".red().to_string()
                            };
                            text.push_str(&format!("{marker}{description}\n"));
                            integrations.push(json!({
                                "installed": installed,
                                "description": description,
                                "shell": integration.get_shell(),
                                "file_name": integration.file_name(),
                            }));
                        }
                    },
                    Err(error) => {
                        let error = error.verbose_message();
                        text.push_str(&format!("{shell}: {error}\n"));
                        errors.push(json!({ "shell": shell, "error": error }));
                    },
                }
            }
            Ok(IntegrationStatus {
                text,
                failed: !errors.is_empty(),
                json: json!({ "integrations": integrations, "errors": errors }),
            })
        },
        Integration::InputMethod => {
            #[cfg(target_os = "macos")]
            return Ok(IntegrationStatus::installed(
                fig_integrations::input_method::InputMethod::default()
                    .installation_status()
                    .await
                    .is_ok(),
            ));
            #[cfg(not(target_os = "macos"))]
            eyre::bail!("Input method integration is only supported on macOS")
        },
        #[cfg(target_os = "linux")]
        Integration::AutostartEntry => {
            eyre::bail!("Checking the status of the autostart entry from the CLI is not supported")
        },
        #[cfg(target_os = "linux")]
        Integration::GnomeShellExtension => {
            eyre::bail!("Checking the status of the GNOME Shell extension from the CLI is not supported")
        },
    }
}

async fn status(integration: Integration, format: OutputFormat) -> Result<ExitCode> {
    let report = if integration == Integration::All {
        let mut text = String::new();
        let mut values = Map::new();
        let mut failed = false;
        // These are the integrations whose status can be queried on this platform.
        for integration in [
            Integration::Dotfiles { shell: None },
            #[cfg(target_os = "macos")]
            Integration::InputMethod,
        ] {
            let name = integration_name(integration);
            match query_status(integration).await {
                Ok(report) => {
                    text.push_str(&format!("{name}:\n{}\n", report.text.trim_end()));
                    values.insert(name.to_owned(), report.json);
                    failed |= report.failed;
                },
                Err(error) => {
                    text.push_str(&format!("{name}: {error}\n"));
                    values.insert(name.to_owned(), json!({ "error": error.to_string() }));
                    failed = true;
                },
            }
        }
        IntegrationStatus {
            text,
            json: Value::Object(values),
            failed,
        }
    } else {
        query_status(integration).await?
    };
    format.print(|| report.text.trim_end(), || &report.json);
    Ok(if report.failed {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    })
}

#[cfg(test)]
mod command_tests {
    use super::*;

    #[test]
    fn explicit_shell_limits_the_status_query() {
        for shell in [Shell::Bash, Shell::Zsh, Shell::Fish, Shell::Nu] {
            assert_eq!(selected_shells(Some(shell)), vec![shell]);
        }
        assert_eq!(selected_shells(None), vec![Shell::Bash, Shell::Zsh, Shell::Fish]);
    }
}
