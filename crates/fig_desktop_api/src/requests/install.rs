use std::fmt::Display;

use anstream::adapter::strip_str;
use fig_integrations::shell::ShellExt;
use fig_os_shim::{ContextArcProvider, ContextProvider, EnvProvider};
use fig_proto::fig::install_response::{InstallationStatus, Response};
use fig_proto::fig::result::Result as ProtoResultEnum;
use fig_proto::fig::server_originated_message::Submessage as ServerOriginatedSubMessage;
use fig_proto::fig::{InstallAction, InstallComponent, InstallRequest, InstallResponse, Result as ProtoResult};
use fig_settings::settings::SettingsProvider;
use fig_settings::state::StateProvider;
use fig_util::Shell;

use super::RequestResult;

#[allow(dead_code)]
async fn integration_status(integration: impl fig_integrations::Integration) -> ServerOriginatedSubMessage {
    ServerOriginatedSubMessage::InstallResponse(InstallResponse {
        response: Some(Response::InstallationStatus(match integration.is_installed().await {
            Ok(_) => InstallationStatus::Installed.into(),
            Err(_) => InstallationStatus::NotInstalled.into(),
        })),
    })
}

#[allow(dead_code)]
fn integration_unsupported() -> ServerOriginatedSubMessage {
    ServerOriginatedSubMessage::InstallResponse(InstallResponse {
        response: Some(Response::InstallationStatus(InstallationStatus::NotSupported.into())),
    })
}

fn integration_result(result: Result<(), impl Display>) -> ServerOriginatedSubMessage {
    ServerOriginatedSubMessage::InstallResponse(InstallResponse {
        response: Some(Response::Result(match result {
            Ok(()) => ProtoResult {
                result: ProtoResultEnum::Ok.into(),
                error: None,
            },
            Err(err) => ProtoResult {
                result: ProtoResultEnum::Error.into(),
                error: Some(err.to_string()),
            },
        })),
    })
}

pub async fn install<Ctx>(request: InstallRequest, ctx: &Ctx) -> RequestResult
where
    Ctx: SettingsProvider + StateProvider + ContextProvider + ContextArcProvider + Send + Sync,
{
    let response = match (request.component(), request.action()) {
        (InstallComponent::Dotfiles, action) => {
            let mut errs: Vec<String> = vec![];
            for shell in Shell::all() {
                match shell.get_shell_integrations(ctx.env()) {
                    Ok(integrations) => {
                        for integration in integrations {
                            let res = match action {
                                InstallAction::Install => integration.install().await,
                                InstallAction::Uninstall => integration.uninstall().await,
                                InstallAction::Status => integration.is_installed().await,
                            };

                            if let Err(err) = res {
                                errs.push(format!(
                                    "{integration}: {}",
                                    strip_str(&err.verbose_message().to_string())
                                ));
                            }
                        }
                    },
                    Err(err) => {
                        errs.push(format!("{shell}: {}", strip_str(&err.verbose_message().to_string())));
                    },
                }
            }

            // Onboarding milestones: the dashboard polls Status until the gate passes.
            match action {
                InstallAction::Status if errs.is_empty() => {
                    fig_telemetry::track_once("onboarding_shell_integration_ready", serde_json::json!({}));
                },
                InstallAction::Install if !errs.is_empty() => {
                    fig_telemetry::track_with_props(
                        "onboarding_install_failed",
                        serde_json::json!({ "component": "dotfiles" }),
                    );
                },
                _ => {},
            }

            match action {
                InstallAction::Install | InstallAction::Uninstall => integration_result(match &errs[..] {
                    [] => Ok(()),
                    errs => Err(errs.join("\n\n")),
                }),
                InstallAction::Status => ServerOriginatedSubMessage::InstallResponse(InstallResponse {
                    response: Some(Response::InstallationStatus(
                        if errs.is_empty() {
                            InstallationStatus::Installed
                        } else {
                            InstallationStatus::NotInstalled
                        }
                        .into(),
                    )),
                }),
            }
        },
        (InstallComponent::Ibus, _) => integration_result(Err("IBus install is legacy")),
        (InstallComponent::Accessibility, InstallAction::Install) => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    use macos_utils::accessibility::{
                        open_accessibility,
                        accessibility_is_enabled,
                        prompt_for_accessibility,
                        show_accessibility_guide,
                        GuideLocale,
                    };

                    let locale = GuideLocale::from_setting(
                        fig_settings::settings::get_string_opt("dashboard.language").as_deref(),
                    );
                    if !accessibility_is_enabled() && !show_accessibility_guide(locale) && !prompt_for_accessibility() {
                        open_accessibility();
                    }

                    integration_result(Ok::<(), &str>(()))
                } else {
                    integration_result(Err("Accessibility permissions cannot be queried"))
                }
            }
        },
        (InstallComponent::Accessibility, InstallAction::Status) => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    use macos_utils::accessibility::accessibility_is_enabled;

                    let enabled = accessibility_is_enabled();
                    if enabled {
                        fig_telemetry::track_once("onboarding_accessibility_granted", serde_json::json!({}));
                    }

                    ServerOriginatedSubMessage::InstallResponse(InstallResponse {
                        response: Some(Response::InstallationStatus(if enabled {
                            InstallationStatus::Installed.into()
                        } else {
                            InstallationStatus::NotInstalled.into()
                        })),
                    })
                } else {
                    integration_result(Err("Accessibility permissions cannot be queried"))
                }
            }
        },
        (InstallComponent::Accessibility, InstallAction::Uninstall) => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    integration_result(Ok::<(), &str>(()))
                } else {
                    integration_result(Err("Accessibility permissions cannot be queried"))
                }
            }
        },
        (InstallComponent::InputMethod, InstallAction::Install) => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    use fig_integrations::input_method::{
                        InputMethod,
                    };
                    use fig_integrations::Integration;

                    integration_result(match InputMethod::default().install().await {
                        Ok(_) => Ok(()),
                        Err(err) => Err(format!("Could not install input method: {err}")),
                    })
                } else {
                    integration_result(Err("Input method install is only supported on macOS"))
                }
            }
        },
        (InstallComponent::InputMethod, InstallAction::Uninstall) => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    use fig_integrations::input_method::{
                        InputMethod,
                        InputMethodError,
                    };
                    use fig_integrations::Error;
                    use fig_integrations::Integration;

                    integration_result(match InputMethod::default().uninstall().await {
                        Ok(_) | Err(Error::InputMethod(InputMethodError::CouldNotListInputSources)) => {
                            Ok(())
                        },
                        Err(err) => Err(format!("Could not uninstall input method: {err}")),
                    })
                } else {
                    integration_result(Err("Input method uninstall is only supported on macOS"))
                }
            }
        },
        (InstallComponent::InputMethod, InstallAction::Status) => {
            cfg_if::cfg_if! {
                if #[cfg(target_os = "macos")] {
                    use fig_integrations::input_method::{
                        InputMethod,
                    };

                    integration_status(InputMethod::default()).await
                } else {
                    integration_unsupported()
                }
            }
        },
        (InstallComponent::DesktopEntry, action) => {
            let _ = action;
            integration_result(Err("Desktop entry is only supported on Linux"))
        },
        (InstallComponent::AutostartEntry, action) => {
            let _ = action;
            integration_result(Err("Autostart entry is only supported on Linux"))
        },
        #[allow(unused_variables)]
        (InstallComponent::GnomeExtension, action) => {
            integration_result(Err("Not supported on platforms other than Linux."))
        },
    };

    RequestResult::Ok(Box::new(response))
}
