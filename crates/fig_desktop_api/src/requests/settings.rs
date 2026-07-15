use fig_proto::fig::server_originated_message::Submessage as ServerOriginatedSubMessage;
use fig_proto::fig::{GetSettingsPropertyRequest, GetSettingsPropertyResponse, UpdateSettingsPropertyRequest};
use fig_settings::{JsonStore, OldSettings, settings};

use super::{RequestResult, RequestResultImpl};

pub async fn get(request: GetSettingsPropertyRequest) -> RequestResult {
    let res = match request.key {
        #[cfg(target_os = "macos")]
        Some(key) if key == "app.launchOnStartup" => fig_integrations::login_item::is_enabled()
            .map(|enabled| serde_json::to_string(&enabled))
            .map_err(|err| format!("Failed getting launch-at-login status: {err}"))?,
        Some(key) => serde_json::to_string(
            &settings::get_value(&key)
                .map_err(|err| format!("Failed getting settings value for {key}: {err}"))?
                .ok_or_else(|| format!("No value for key '{key}'"))?,
        ),
        None => OldSettings::load()
            .map(|s| {
                let mut map = s.map().clone();
                #[cfg(target_os = "macos")]
                if let Ok(enabled) = fig_integrations::login_item::is_enabled() {
                    map.insert("app.launchOnStartup".to_owned(), enabled.into());
                }
                serde_json::to_string(&map)
            })
            .map_err(|err| format!("Failed getting settings: {err}"))?,
    };

    let json_blob = res.map_err(|err| format!("Could not convert value for key to JSON: {err}"))?;

    let response = ServerOriginatedSubMessage::GetSettingsPropertyResponse(GetSettingsPropertyResponse {
        json_blob: Some(json_blob),
        is_default: None,
    });

    Ok(response.into())
}

pub async fn update(request: UpdateSettingsPropertyRequest) -> RequestResult {
    match (&request.key, request.value) {
        (Some(key), Some(value)) => {
            let value = serde_json::from_str(&value).unwrap_or(serde_json::Value::String(value));
            #[cfg(target_os = "macos")]
            if key == "app.launchOnStartup" {
                let enabled = value
                    .as_bool()
                    .ok_or_else(|| "app.launchOnStartup must be a boolean".to_owned())?;
                let previous = fig_settings::settings::get_value(key)
                    .map_err(|err| format!("Failed reading previous {key}: {err}"))?;
                fig_settings::settings::set_value(key, value.clone())
                    .map_err(|err| format!("Failed setting {key}: {err}"))?;
                if let Err(err) = fig_integrations::login_item::set_enabled(enabled) {
                    match previous {
                        Some(previous) => fig_settings::settings::set_value(key, previous),
                        None => fig_settings::settings::remove_value(key),
                    }
                    .map_err(|rollback_err| format!("{err}; failed rolling back {key}: {rollback_err}"))?;
                    return Err(format!("Failed updating launch at login: {err}").into());
                }
                return RequestResult::success();
            }
            fig_settings::settings::set_value(key, value).map_err(|err| format!("Failed setting {key}: {err}"))?;
        },
        (Some(key), None) => {
            #[cfg(target_os = "macos")]
            if key == "app.launchOnStartup" {
                fig_integrations::login_item::set_enabled(false)
                    .map_err(|err| format!("Failed disabling launch at login: {err}"))?;
            }
            fig_settings::settings::remove_value(key).map_err(|err| format!("Failed removing {key}: {err}"))?;
        },
        (None, _) => {
            return RequestResult::error("No key provided with request");
        },
    }

    RequestResult::success()
}
