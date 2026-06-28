use serde_json::{
    Value,
    json,
};
use tracing::warn;
use uuid::Uuid;

const TELEMETRY_ENABLED_KEY: &str = "telemetry.enabled";
const DEVICE_ID_KEY: &str = "telemetry.device_id";

static POSTHOG_ENDPOINT: std::sync::OnceLock<String> = std::sync::OnceLock::new();
static POSTHOG_API_KEY: std::sync::OnceLock<String> = std::sync::OnceLock::new();

/// Call once at app startup.
/// `endpoint` — Cloudflare Workers URL proxying to your PostHog instance,
///              e.g. "https://analytics.example.com/capture/".
/// `api_key`  — PostHog project API key (e.g. "phc_xxx").
/// Either being empty silently disables telemetry.
pub fn init(endpoint: impl Into<String>, api_key: impl Into<String>) {
    let url = endpoint.into();
    let key = api_key.into();
    if url.trim().is_empty() || key.trim().is_empty() {
        return;
    }
    POSTHOG_ENDPOINT.set(url.trim_end_matches('/').to_owned()).ok();
    POSTHOG_API_KEY.set(key.trim().to_owned()).ok();
}

fn is_enabled() -> bool {
    fig_settings::settings::get_bool_or(TELEMETRY_ENABLED_KEY, true)
}

fn device_id() -> String {
    if let Ok(Some(id)) = fig_settings::state::get_string(DEVICE_ID_KEY) {
        return id;
    }
    let id = Uuid::new_v4().to_string();
    fig_settings::state::set_value(DEVICE_ID_KEY, id.as_str()).ok();
    id
}

fn app_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

fn os_version_string() -> String {
    fig_util::system_info::os_version().map_or_else(|| "unknown".into(), |v| v.to_string())
}

/// Fire-and-forget: sends a single event to PostHog.
/// Returns immediately; the HTTP request runs on a spawned task.
pub fn track(event: &'static str) {
    track_with_props(event, json!({}));
}

pub fn track_with_props(event: &'static str, extra_props: Value) {
    if !is_enabled() {
        return;
    }
    let (Some(endpoint), Some(api_key)) = (POSTHOG_ENDPOINT.get().cloned(), POSTHOG_API_KEY.get().cloned()) else {
        return;
    };

    let distinct_id = device_id();
    let mut props = json!({
        "app_name":    fig_util::consts::PRODUCT_NAME,
        "app_version": app_version(),
        "os_version":  os_version_string(),
    });
    if let (Some(obj), Some(extra)) = (props.as_object_mut(), extra_props.as_object()) {
        obj.extend(extra.iter().map(|(k, v)| (k.clone(), v.clone())));
    }

    let body = json!({
        "api_key":     api_key,
        "event":       event,
        "distinct_id": distinct_id,
        "properties":  props,
    });

    tokio::spawn(async move {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(5))
            .build();
        let Ok(client) = client else { return };
        if let Err(err) = client.post(&endpoint).json(&body).send().await {
            warn!(%err, "Failed to send telemetry event '{event}'");
        }
    });
}
