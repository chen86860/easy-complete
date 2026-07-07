use std::path::PathBuf;
use std::time::Duration;

use serde_json::{
    Value,
    json,
};
use tracing::warn;
use uuid::Uuid;

const TELEMETRY_ENABLED_KEY: &str = "telemetry.enabled";
const DEVICE_ID_KEY: &str = "telemetry.device_id";
const LAST_HEARTBEAT_KEY: &str = "telemetry.last_heartbeat_ts";
const COUNTER_KEY_PREFIX: &str = "telemetry.count.";

const QUEUE_FILE_NAME: &str = "telemetry_queue.jsonl";
/// Oldest events are dropped beyond this, so a long offline stretch
/// can't grow the queue file unboundedly.
const QUEUE_MAX_EVENTS: usize = 200;
const HEARTBEAT_INTERVAL_SECS: i64 = 24 * 60 * 60;

static POSTHOG_ENDPOINT: std::sync::OnceLock<String> = std::sync::OnceLock::new();
static POSTHOG_API_KEY: std::sync::OnceLock<String> = std::sync::OnceLock::new();
static QUEUE_LOCK: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());

/// Call once at app startup.
/// `endpoint` — Cloudflare Workers URL proxying to your PostHog instance,
///              e.g. "https://analytics.example.com/capture/".
/// `api_key`  — PostHog project API key (e.g. "phc_xxx").
/// Either being empty silently disables telemetry.
///
/// If a tokio runtime is running, also flushes any events queued from
/// previous sessions that failed to send.
pub fn init(endpoint: impl Into<String>, api_key: impl Into<String>) {
    let url = endpoint.into();
    let key = api_key.into();
    if url.trim().is_empty() || key.trim().is_empty() {
        return;
    }
    POSTHOG_ENDPOINT.set(url.trim_end_matches('/').to_owned()).ok();
    POSTHOG_API_KEY.set(key.trim().to_owned()).ok();

    if let Ok(handle) = tokio::runtime::Handle::try_current() {
        handle.spawn(async {
            // Give the network stack / proxy a moment on cold boot.
            tokio::time::sleep(Duration::from_secs(10)).await;
            flush_queue().await;
        });
    }
}

fn is_enabled() -> bool {
    fig_settings::settings::get_bool_or(TELEMETRY_ENABLED_KEY, true)
}

fn is_configured() -> bool {
    POSTHOG_ENDPOINT.get().is_some() && POSTHOG_API_KEY.get().is_some()
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

/// Basename of the user's login shell ($SHELL), e.g. "zsh".
fn shell_name() -> String {
    std::env::var("SHELL")
        .ok()
        .and_then(|s| {
            std::path::Path::new(&s)
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
        })
        .unwrap_or_else(|| "unknown".into())
}

/// Best-effort terminal emulator detection from the process hierarchy.
/// Meaningful for CLI-origin events; desktop-origin events (launched by
/// launchd, no terminal ancestor) report "unknown".
fn terminal_name() -> String {
    fig_util::terminal::Terminal::parent_terminal(&fig_os_shim::Context::new())
        .map_or_else(|| "unknown".into(), |t| t.internal_id().into_owned())
}

fn queue_path() -> Option<PathBuf> {
    fig_util::directories::fig_data_dir().ok().map(|d| d.join(QUEUE_FILE_NAME))
}

fn http_client() -> Option<reqwest::Client> {
    // reqwest sends no User-Agent by default, and UA-less requests are blocked
    // by Cloudflare's bot protection in front of the analytics proxy.
    reqwest::Client::builder()
        .user_agent(format!("{}/{}", fig_util::consts::APP_PROCESS_NAME, app_version()))
        .timeout(Duration::from_secs(5))
        .build()
        .ok()
}

/// Body sent to PostHog, minus the api_key (added at send time so the
/// key is never persisted to disk in the offline queue).
fn build_event(event: &str, extra_props: Value) -> Value {
    let mut props = json!({
        "app_name":    fig_util::consts::PRODUCT_NAME,
        "app_version": app_version(),
        "os_version":  os_version_string(),
        "shell":       shell_name(),
        "terminal":    terminal_name(),
    });
    if let (Some(obj), Some(extra)) = (props.as_object_mut(), extra_props.as_object()) {
        obj.extend(extra.iter().map(|(k, v)| (k.clone(), v.clone())));
    }
    json!({
        "event":       event,
        "distinct_id": device_id(),
        "properties":  props,
        "timestamp":   chrono::Utc::now().to_rfc3339(),
    })
}

async fn send_event(body: &Value) -> Result<(), String> {
    let (Some(endpoint), Some(api_key)) = (POSTHOG_ENDPOINT.get(), POSTHOG_API_KEY.get()) else {
        return Err("telemetry not configured".into());
    };
    let client = http_client().ok_or("failed to build http client")?;
    let mut body = body.clone();
    if let Some(obj) = body.as_object_mut() {
        obj.insert("api_key".into(), json!(api_key));
    }
    let resp = client
        .post(endpoint)
        .json(&body)
        .send()
        .await
        .map_err(|err| err.to_string())?;
    if resp.status().is_success() {
        Ok(())
    } else {
        Err(format!("posthog returned {}", resp.status()))
    }
}

/// Fire-and-forget: sends a single event to PostHog.
/// Returns immediately; the HTTP request runs on a spawned task.
/// On network failure the event is queued on disk and retried on next init.
pub fn track(event: &'static str) {
    track_with_props(event, json!({}));
}

pub fn track_with_props(event: &'static str, extra_props: Value) {
    if !is_enabled() || !is_configured() {
        return;
    }
    let body = build_event(event, extra_props);
    tokio::spawn(async move {
        if let Err(err) = send_event(&body).await {
            warn!(%err, "Failed to send telemetry event '{event}', queueing for retry");
            enqueue(&body).await;
        }
    });
}

/// Like [`track_with_props`] but awaits the send. For short-lived CLI
/// processes where a spawned task would be dropped on exit.
/// On failure the event is queued for the next long-lived process to flush.
pub async fn track_blocking(event: &str, extra_props: Value) {
    if !is_enabled() || !is_configured() {
        return;
    }
    let body = build_event(event, extra_props);
    if let Err(err) = send_event(&body).await {
        warn!(%err, "Failed to send telemetry event '{event}', queueing for retry");
        enqueue(&body).await;
    } else {
        // The network is clearly up — drain anything queued by earlier failures.
        flush_queue().await;
    }
}

// ─── Offline queue ──────────────────────────────────────────────────────────
// JSONL file in the app data dir; one event body per line. The lock only
// guards intra-process access — concurrent writes from another process are
// tolerable for telemetry-grade data (worst case: a dropped line).

async fn enqueue(body: &Value) {
    let Some(path) = queue_path() else { return };
    let Ok(line) = serde_json::to_string(body) else { return };

    let _guard = QUEUE_LOCK.lock().await;
    let existing = tokio::fs::read_to_string(&path).await.unwrap_or_default();
    let mut lines: Vec<&str> = existing.lines().filter(|l| !l.trim().is_empty()).collect();
    lines.push(&line);
    if lines.len() > QUEUE_MAX_EVENTS {
        let excess = lines.len() - QUEUE_MAX_EVENTS;
        lines.drain(..excess);
    }
    let mut content = lines.join("\n");
    content.push('\n');
    if let Err(err) = tokio::fs::write(&path, content).await {
        warn!(%err, "Failed to persist telemetry queue");
    }
}

/// Attempt to send every queued event; failures stay queued.
pub async fn flush_queue() {
    if !is_enabled() || !is_configured() {
        return;
    }
    let Some(path) = queue_path() else { return };

    let _guard = QUEUE_LOCK.lock().await;
    let Ok(existing) = tokio::fs::read_to_string(&path).await else {
        return;
    };
    let events: Vec<Value> = existing
        .lines()
        .filter_map(|l| serde_json::from_str(l).ok())
        .collect();
    if events.is_empty() {
        let _ = tokio::fs::remove_file(&path).await;
        return;
    }

    let mut failed: Vec<String> = Vec::new();
    for event in &events {
        if send_event(event).await.is_err() {
            if let Ok(line) = serde_json::to_string(event) {
                failed.push(line);
            }
        }
    }

    if failed.is_empty() {
        let _ = tokio::fs::remove_file(&path).await;
    } else {
        warn!("{} telemetry events still queued after flush", failed.len());
        let mut content = failed.join("\n");
        content.push('\n');
        let _ = tokio::fs::write(&path, content).await;
    }
}

// ─── Local aggregation for high-frequency events ────────────────────────────
// count() only bumps an integer in the local state db — no network. The
// accumulated totals ride along with the next daily_heartbeat as properties,
// so per-keystroke-scale events cost one request per day, not one each.

/// Increment a local counter for a high-frequency event. Cheap (one SQLite
/// write, no network); reported in aggregate with the daily heartbeat.
pub fn count(event: &str) {
    let key = format!("{COUNTER_KEY_PREFIX}{event}");
    let current = fig_settings::state::get_int_or(&key, 0);
    fig_settings::state::set_value(&key, current + 1).ok();
}

fn now_unix() -> i64 {
    chrono::Utc::now().timestamp()
}

/// Send a `daily_heartbeat` event if the last one was ≥24h ago (or never).
/// The event carries all accumulated [`count`] totals as `count_*` properties,
/// which are reset on success. Call this periodically (e.g. hourly) from a
/// long-lived process; it is a no-op when not due.
pub async fn maybe_send_daily_heartbeat() {
    if !is_enabled() || !is_configured() {
        return;
    }
    let last = fig_settings::state::get_int_or(LAST_HEARTBEAT_KEY, 0);
    let now = now_unix();
    if now - last < HEARTBEAT_INTERVAL_SECS {
        return;
    }

    let mut props = serde_json::Map::new();
    let counters: Vec<(String, i64)> = fig_settings::state::all()
        .map(|map| {
            map.iter()
                .filter_map(|(k, v)| {
                    let name = k.strip_prefix(COUNTER_KEY_PREFIX)?;
                    Some((name.to_owned(), v.as_i64()?))
                })
                .collect()
        })
        .unwrap_or_default();
    for (name, value) in &counters {
        props.insert(format!("count_{name}"), json!(value));
    }

    // Mark sent before the network call: a failed send is queued on disk by
    // track_blocking, and double-counting from retries is worse than a
    // heartbeat riding the offline queue.
    fig_settings::state::set_value(LAST_HEARTBEAT_KEY, now).ok();
    for (name, _) in &counters {
        fig_settings::state::remove_value(format!("{COUNTER_KEY_PREFIX}{name}")).ok();
    }

    track_blocking("daily_heartbeat", Value::Object(props)).await;
}
