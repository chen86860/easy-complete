pub mod local_state;
pub mod should_figterm_launch;

use std::io::{Read, Write, stdout};
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;
use std::time::Duration;

use anstream::println;
use bytes::{Buf, BytesMut};
use clap::{ArgGroup, Args, Subcommand};
use crossterm::style::Stylize;
use eyre::{ContextCompat, Result};
use fig_install::InstallComponents;
#[cfg(target_os = "macos")]
use fig_integrations::input_method::InputMethod;
use fig_ipc::local::send_hook_to_socket;
use fig_ipc::{BufferedUnixStream, SendMessage};
use fig_os_shim::Context as OsContext;
use fig_proto::figterm::figterm_request_message::Request as FigtermRequest;
use fig_proto::figterm::{FigtermRequestMessage, UpdateShellContextRequest};
use fig_proto::hooks::new_callback_hook;
use fig_proto::local::EnvironmentVariable;
use fig_proto::util::get_shell;
use fig_util::directories;
use fig_util::directories::figterm_socket_path;
use fig_util::env_var::QTERM_SESSION_ID;
use rand::distr::{Alphanumeric, SampleString};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::select;
use tracing::{debug, error, info, trace};

use crate::cli::installation::install_cli;

#[derive(Debug, Args, PartialEq, Eq)]
#[command(group(
        ArgGroup::new("output")
            .args(&["filename", "exit_code"])
            .multiple(true)
            .requires_all(&["filename", "exit_code"])
            ))]
pub struct CallbackArgs {
    handler_id: String,
    #[arg(group = "output")]
    filename: Option<String>,
    #[arg(group = "output")]
    exit_code: Option<i64>,
}

#[derive(Debug, Args, PartialEq, Eq)]
pub struct InstallArgs {
    /// Install only the shell integrations
    #[arg(long)]
    pub dotfiles: bool,
    /// Prompt input method installation
    #[arg(long)]
    pub input_method: bool,
    /// Don't confirm automatic installation.
    #[arg(long)]
    pub no_confirm: bool,
    /// Force installation of q
    #[arg(long)]
    pub force: bool,
    /// Install q globally
    #[arg(long)]
    pub global: bool,
}

impl From<InstallArgs> for InstallComponents {
    fn from(args: InstallArgs) -> Self {
        let InstallArgs {
            dotfiles, input_method, ..
        } = args;
        if dotfiles || input_method {
            let mut install_components = InstallComponents::empty();
            install_components.set(InstallComponents::SHELL_INTEGRATIONS, dotfiles);
            install_components.set(InstallComponents::INPUT_METHOD, input_method);
            install_components
        } else {
            InstallComponents::all()
        }
    }
}

#[derive(Debug, PartialEq, Eq, Subcommand)]
#[command(hide = true, alias = "_")]
pub enum InternalSubcommand {
    /// Command that is run during the PreCmd section of
    /// the shell integrations.
    PreCmd {
        #[arg(long, allow_hyphen_values = true)]
        alias: Option<String>,
    },
    /// Change the local-state file
    LocalState(local_state::LocalStateArgs),
    /// Callback used for the internal pseudoterminal
    Callback(CallbackArgs),
    /// Install the Easy Complete cli
    Install(InstallArgs),
    /// Uninstall the Easy Complete cli
    Uninstall {
        /// Uninstall only the shell integrations
        #[arg(long)]
        dotfiles: bool,
        /// Uninstall only the input method
        #[arg(long)]
        input_method: bool,
        /// Uninstall only the binary
        #[arg(long)]
        binary: bool,
    },
    GetShell,
    /// Detects if Figterm should be launched
    ///
    /// Exit code:
    /// - 0 execute figterm
    /// - 1 dont execute figterm
    /// - 2 fallback to Q_TERM env
    ShouldFigtermLaunch,
    SocketsDir,
    StreamFromSocket,
    FigtermSocketPath {
        session_id: String,
    },
    Uuidgen,
    #[cfg(target_os = "linux")]
    IbusBootstrap,
    #[cfg(target_os = "linux")]
    /// Checks for sandboxing
    DetectSandbox,
    #[cfg(target_os = "macos")]
    AttemptToFinishInputMethodInstallation {
        bundle_path: Option<PathBuf>,
    },
}

const BUFFER_SIZE: usize = 1024;

impl InternalSubcommand {
    pub async fn execute(self) -> Result<ExitCode> {
        let ctx = OsContext::new();
        match self {
            InternalSubcommand::Install(args) => {
                let no_confirm = args.no_confirm;
                let force = args.force;
                let global = args.global;
                install_cli(args.into(), no_confirm, force, global).await
            },
            InternalSubcommand::Uninstall {
                dotfiles,
                input_method,
                binary,
            } => {
                let components = if dotfiles || binary || input_method {
                    let mut uninstall_components = InstallComponents::empty();
                    uninstall_components.set(InstallComponents::SHELL_INTEGRATIONS, dotfiles);
                    uninstall_components.set(InstallComponents::INPUT_METHOD, input_method);
                    uninstall_components.set(InstallComponents::BINARY, binary);
                    uninstall_components
                } else {
                    InstallComponents::all()
                };
                if components.contains(InstallComponents::BINARY) {
                    if option_env!("Q_IS_PACKAGE_MANAGED").is_some() {
                        println!("Please uninstall using your package manager");
                    } else {
                        fig_install::uninstall(InstallComponents::BINARY, Arc::clone(&ctx)).await?;
                        println!("\n{}\n", "The binary was successfully uninstalled".bold());
                    }
                }

                let mut components = components;
                components.set(InstallComponents::BINARY, false);
                fig_install::uninstall(components, Arc::clone(&ctx)).await?;
                Ok(ExitCode::SUCCESS)
            },
            InternalSubcommand::PreCmd { alias } => Ok(pre_cmd(alias).await),
            InternalSubcommand::LocalState(local_state) => {
                local_state.execute().await?;
                Ok(ExitCode::SUCCESS)
            },
            InternalSubcommand::Callback(CallbackArgs {
                handler_id,
                filename,
                exit_code,
            }) => {
                trace!("handlerId: {handler_id}");

                let (filename, exit_code) = match (filename, exit_code) {
                    (Some(filename), Some(exit_code)) => {
                        trace!("callback specified filepath ({filename}) and exitCode ({exit_code}) to output!");
                        (filename, exit_code)
                    },
                    _ => {
                        let file_id = Alphanumeric.sample_string(&mut rand::rng(), 9);
                        let tmp_filename = format!("fig-callback-{file_id}");
                        let tmp_path = PathBuf::from("/tmp").join(tmp_filename);
                        let mut tmp_file = std::fs::File::create(&tmp_path)?;
                        let mut buffer = [0u8; BUFFER_SIZE];
                        let mut stdin = std::io::stdin();
                        trace!("Created tmp file: {}", tmp_path.display());

                        loop {
                            let size = stdin.read(&mut buffer)?;
                            if size == 0 {
                                break;
                            }
                            tmp_file.write_all(&buffer[..size])?;
                            trace!("Read {size} bytes\n{}", std::str::from_utf8(&buffer[..size])?);
                        }

                        let filename: String = tmp_path.to_str().context("invalid file path")?.into();
                        trace!("Done reading from stdin!");
                        (filename, -1)
                    },
                };
                let hook = new_callback_hook(&handler_id, &filename, exit_code);

                info!(
                    "Sending 'handlerId: {handler_id}, filename: {filename}, exitcode: {exit_code}' over unix socket!\n"
                );

                match send_hook_to_socket(hook).await {
                    Ok(()) => debug!("Successfully sent hook"),
                    Err(e) => debug!("Couldn't send hook {e}"),
                }

                Ok(ExitCode::SUCCESS)
            },
            InternalSubcommand::GetShell => match get_shell() {
                Ok(shell) => {
                    if write!(stdout(), "{shell}").is_ok() {
                        return Ok(ExitCode::SUCCESS);
                    }
                    Ok(ExitCode::FAILURE)
                },
                Err(_) => Ok(ExitCode::FAILURE),
            },
            InternalSubcommand::ShouldFigtermLaunch => {
                Ok(should_figterm_launch::should_figterm_launch(&OsContext::new()))
            },
            InternalSubcommand::SocketsDir => {
                writeln!(stdout(), "{}", directories::sockets_dir_utf8()?).ok();
                Ok(ExitCode::SUCCESS)
            },
            InternalSubcommand::FigtermSocketPath { session_id } => {
                writeln!(
                    stdout(),
                    "{}",
                    directories::figterm_socket_path(session_id)?.to_string_lossy()
                )
                .ok();
                Ok(ExitCode::SUCCESS)
            },
            InternalSubcommand::StreamFromSocket => {
                let mut stdout = tokio::io::stdout();
                let mut stdin = tokio::io::stdin();

                let mut stdout_buf = BytesMut::with_capacity(1024);
                let mut stream_buf = BytesMut::with_capacity(1024);

                let socket = directories::remote_socket_path()?;
                while let Ok(mut stream) = BufferedUnixStream::connect_timeout(&socket, Duration::from_secs(5)).await {
                    loop {
                        select! {
                            n = stream.read_buf(&mut stdout_buf) => {
                                match n {
                                    Ok(0) | Err(_) => {
                                        break;
                                    }
                                    Ok(mut n) => {
                                        while !stdout_buf.is_empty() {
                                            let m = stdout.write(&stdout_buf[..n]).await?;
                                            stdout.flush().await?;
                                            stdout_buf.advance(m);
                                            n -= m;
                                        }
                                        stdout_buf.clear();
                                    }
                                }
                            }
                            n = stdin.read_buf(&mut stream_buf) => {
                                match n {
                                    Ok(0) | Err(_) => {
                                        break;
                                    }
                                    Ok(mut n) => {
                                        while !stream_buf.is_empty() {
                                            let m = stream.write(&stream_buf[..n]).await?;
                                            stream.flush().await?;
                                            stream_buf.advance(m);
                                            n -= m;
                                        }
                                        stream_buf.clear();
                                    }
                                }
                            }
                        }
                    }
                }
                Ok(ExitCode::SUCCESS)
            },
            InternalSubcommand::Uuidgen => {
                let _ = writeln!(stdout(), "{}", uuid::Uuid::new_v4());
                Ok(ExitCode::SUCCESS)
            },
            #[cfg(target_os = "linux")]
            InternalSubcommand::IbusBootstrap => {
                use std::ffi::OsString;

                use sysinfo::{ProcessRefreshKind, RefreshKind};
                use tokio::process::Command;

                let system = tokio::task::block_in_place(|| {
                    System::new_with_specifics(RefreshKind::nothing().with_processes(ProcessRefreshKind::nothing()))
                });
                let ibus_daemon = OsString::from("ibus-daemon");
                if system.processes_by_name(&ibus_daemon).next().is_none() {
                    info!("Launching 'ibus-daemon'");
                    match Command::new("ibus-daemon").arg("-drxR").output().await {
                        Ok(std::process::Output { status, stdout, stderr }) if !status.success() => {
                            let stdout = String::from_utf8_lossy(&stdout);
                            let stderr = String::from_utf8_lossy(&stderr);
                            eyre::bail!(
                                "Failed to run 'ibus-daemon -drxR': status={status:?} stdout={stdout:?} stderr={stderr:?}"
                            );
                        },
                        Err(err) => eyre::bail!("Failed to run 'ibus-daemon -drxR': {err}"),
                        Ok(_) => writeln!(stdout(), "ibus-daemon is now running").ok(),
                    };
                } else {
                    writeln!(stdout(), "ibus-daemon is already running").ok();
                }
                Ok(ExitCode::SUCCESS)
            },
            #[cfg(target_os = "linux")]
            InternalSubcommand::DetectSandbox => {
                use fig_util::system_info::linux::SandboxKind;
                let exit_code = match fig_util::system_info::linux::detect_sandbox() {
                    SandboxKind::None => {
                        println!("No sandbox detected");
                        0
                    },
                    SandboxKind::Flatpak => {
                        println!("You are in a Flatpak");
                        1
                    },
                    SandboxKind::Snap => {
                        println!("You are in a Snap");
                        1
                    },
                    SandboxKind::Docker => {
                        println!("You are in a Docker container");
                        1
                    },
                    SandboxKind::Container(None) => {
                        println!("You are in a generic container");
                        1
                    },
                    SandboxKind::Container(Some(engine)) => {
                        println!("You are in a {engine} container");
                        1
                    },
                };
                Ok(ExitCode::from(exit_code))
            },
            #[cfg(target_os = "macos")]
            InternalSubcommand::AttemptToFinishInputMethodInstallation { bundle_path } => {
                match InputMethod::finish_input_method_installation(bundle_path) {
                    Ok(_) => Ok(ExitCode::SUCCESS),
                    Err(err) => {
                        println!(
                            "{}",
                            serde_json::to_string(&err).expect("InputMethodError should be serializable")
                        );
                        Ok(ExitCode::FAILURE)
                    },
                }
            },
        }
    }
}

pub async fn pre_cmd(alias: Option<String>) -> ExitCode {
    let Ok(session_id) = std::env::var(QTERM_SESSION_ID) else {
        return ExitCode::FAILURE;
    };

    match figterm_socket_path(&session_id) {
        Ok(figterm_path) => match fig_ipc::socket_connect(figterm_path).await {
            Ok(mut figterm_stream) => {
                let message = FigtermRequestMessage {
                    request: Some(FigtermRequest::UpdateShellContext(UpdateShellContextRequest {
                        update_environment_variables: true,
                        environment_variables: std::env::vars()
                            .map(|(key, value)| EnvironmentVariable {
                                key,
                                value: Some(value),
                            })
                            .collect(),
                        update_alias: true,
                        alias,
                    })),
                };
                if let Err(err) = figterm_stream.send_message(message).await {
                    error!(%err, %session_id, "Failed to send UpdateShellContext to Figterm");
                    ExitCode::FAILURE
                } else {
                    ExitCode::SUCCESS
                }
            },
            Err(err) => {
                error!(%err, %session_id, "Failed to connect to Figterm socket");
                ExitCode::FAILURE
            },
        },
        Err(err) => {
            error!(%err, %session_id, "Failed to get Figterm socket path");
            ExitCode::FAILURE
        },
    }
}

#[cfg(test)]
mod tests {
    use clap::Parser;

    use super::*;

    #[derive(Debug, Parser, PartialEq, Eq)]
    pub struct MockCli {
        #[command(subcommand)]
        pub subcommand: InternalSubcommand,
    }

    #[test]
    fn parse_pre_cmd() {
        assert_eq!(
            MockCli::parse_from(["_", "pre-cmd"]),
            MockCli {
                subcommand: InternalSubcommand::PreCmd { alias: None }
            }
        );

        let alias = format!("a='{} a'\nrd=rmdir", fig_util::CLI_BINARY_NAME);
        assert_eq!(
            MockCli::parse_from(["_", "pre-cmd", "--alias", &alias]),
            MockCli {
                subcommand: InternalSubcommand::PreCmd { alias: Some(alias) }
            }
        );

        let hyphen_alias = "-='cd -'\n...=../..\nga='git add'";
        assert_eq!(
            MockCli::parse_from(["_", "pre-cmd", "--alias", hyphen_alias]),
            MockCli {
                subcommand: InternalSubcommand::PreCmd {
                    alias: Some(hyphen_alias.to_owned())
                }
            }
        );
    }
}
