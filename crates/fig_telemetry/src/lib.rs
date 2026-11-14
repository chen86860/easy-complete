use std::path::PathBuf;
use std::time::Duration;

use serde_json::{Value, json};
use tracing::warn;
use uuid::Uuid;

const TELEMETRY_ENABLED_KEY: &str = "telemetry.enabled";
const DEVICE_ID_KEY: &str = "telemetry.device_id";
const LAST_HEARTBEAT_KEY: &str = "telemetry.last_heartbeat_ts";
const COUNTER_KEY_PREFIX: &str = "telemetry.count.";
const ONCE_KEY_PREFIX: &str = "telemetry.once.";
const LAST_TERMINAL_KEY: &str = "telemetry.last_terminal";
/// Set on a fresh install: events are queued on disk, not sent, until the dashboard's
/// permission gate (which carries the telemetry toggle) has been passed.
const CONSENT_PENDING_KEY: &str = "telemetry.consent_pending";
/// Every telemetry state key shares this prefix, so disabling can wipe them all.
const STATE_KEY_PREFIX: &str = "telemetry.";

const QUEUE_FILE_NAME: &str = "telemetry_queue.jsonl";
/// Oldest events are dropped beyond this, so a long offline stretch
/// can't grow the queue file unboundedly.
const QUEUE_MAX_EVENTS: usize = 200;
const HEARTBEAT_INTERVAL_SECS: i64 = 24 * 60 * 60;

static POSTHOG_ENDPOINT: std::sync::OnceLock<String> = std::sync::OnceLock::new();
static POSTHOG_API_KEY: std::sync::OnceLock<String> = std::sync::OnceLock::new();
static QUEUE_LOCK: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());
/// In-process memo of [`track_once`] events already sent, so hot paths skip the state db.
static ONCE_SENT: std::sync::Mutex<Vec<&'static str>> = std::sync::Mutex::new(Vec::new());
/// In-process memo of the last value written by [`set_last_terminal`].
static LAST_TERMINAL: std::sync::Mutex<Option<String>> = std::sync::Mutex::new(None);

/// Call once at app startup.
/// `endpoint` — Cloudflare Workers URL proxying to your PostHog instance,
///              e.g. "https://analytics.example.com/capture/".
/// `api_key`  — PostHog project API key (e.g. "phc_xxx").
/// Either being empty silently disables telemetry.
///
/// If a tokio runtime is running, also flushes any events queued from
/// previous sessions that failed to send.
pub fn init(endpoint: impl Into<String>, api_key: impl Into<String>) {
    let Some((url, key)) = normalize_config(&endpoint.into(), &api_key.into()) else {
        return;
    };
    POSTHOG_ENDPOINT.set(url).ok();
    POSTHOG_API_KEY.set(key).ok();

    if let Ok(handle) = tokio::runtime::Handle::try_current() {
        handle.spawn(async {
            // Give the network stack / proxy a moment on cold boot.
            tokio::time::sleep(Duration::from_secs(10)).await;
            flush_queue().await;
        });
    }
}

/// The endpoint without trailing slashes and the trimmed key, or `None` when either is
/// blank, which leaves telemetry off.
fn normalize_config(endpoint: &str, api_key: &str) -> Option<(String, String)> {
    if endpoint.trim().is_empty() || api_key.trim().is_empty() {
        return None;
    }
    Some((endpoint.trim_end_matches('/').to_owned(), api_key.trim().to_owned()))
}

fn is_enabled() -> bool {
    fig_settings::settings::get_bool_or(TELEMETRY_ENABLED_KEY, true)
}

fn consent_pending() -> bool {
    fig_settings::state::get_bool_or(CONSENT_PENDING_KEY, false)
}

/// Call on a fresh install, before its first event: holds every event in the
/// offline queue until the user has seen the telemetry toggle. The dashboard
/// releases the hold by removing the key once its permission gate is passed.
pub fn hold_until_consent() {
    fig_settings::state::set_value(CONSENT_PENDING_KEY, true).ok();
}

/// Deletes everything telemetry keeps locally (device ID, counters, milestones,
/// queued events) when telemetry is disabled, so re-enabling starts from scratch.
pub fn purge_if_disabled() {
    if is_enabled() {
        return;
    }
    if let Ok(map) = fig_settings::state::all() {
        for key in map.keys().filter(|k| k.starts_with(STATE_KEY_PREFIX)) {
            fig_settings::state::remove_value(key).ok();
        }
    }
    if let Some(path) = queue_path() {
        std::fs::remove_file(path).ok();
    }
    if let Ok(mut sent) = ONCE_SENT.lock() {
        sent.clear();
    }
    if let Ok(mut last) = LAST_TERMINAL.lock() {
        *last = None;
    }
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
    shell_basename(std::env::var("SHELL").ok().as_deref())
}

fn shell_basename(shell: Option<&str>) -> String {
    shell
        .and_then(|s| {
            std::path::Path::new(s)
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
        })
        .unwrap_or_else(|| "unknown".into())
}

/// Best-effort terminal emulator detection from the process hierarchy.
/// Desktop-origin events have no terminal ancestor (launched by launchd), so
/// they fall back to the terminal of the last session that used autocomplete,
/// recorded by [`set_last_terminal`].
fn terminal_name() -> String {
    fig_util::terminal::Terminal::parent_terminal(&fig_os_shim::Context::new())
        .map(|t| t.internal_id().into_owned())
        .or_else(|| fig_settings::state::get_string(LAST_TERMINAL_KEY).ok().flatten())
        .unwrap_or_else(|| "unknown".into())
}

/// Records the terminal of the session autocomplete last served, so desktop-origin
/// events (the daily heartbeat especially) can be broken down by terminal.
/// Cheap to call on every keystroke: the state db is only written on change.
pub fn set_last_terminal(terminal: &str) {
    if !is_enabled() {
        return;
    }
    let Ok(mut last) = LAST_TERMINAL.lock() else { return };
    if last.as_deref() == Some(terminal) {
        return;
    }
    fig_settings::state::set_value(LAST_TERMINAL_KEY, terminal).ok();
    *last = Some(terminal.to_owned());
}

fn locale() -> &'static str {
    fig_util::system_info::preferred_language().unwrap_or("unknown")
}

fn queue_path() -> Option<PathBuf> {
    fig_util::directories::fig_data_dir()
        .ok()
        .map(|d| d.join(QUEUE_FILE_NAME))
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
    let props = merge_properties(
        json!({
            "app_name":    fig_util::consts::PRODUCT_NAME,
            "app_version": app_version(),
            "os_version":  os_version_string(),
            "shell":       shell_name(),
            "terminal":    terminal_name(),
            "locale":      locale(),
        }),
        &extra_props,
    );
    json!({
        "event":       event,
        "distinct_id": device_id(),
        "properties":  props,
        "timestamp":   chrono::Utc::now().to_rfc3339(),
    })
}

/// `base` with the entries of `extra` added. An entry in `extra` replaces a common
/// property of the same name; anything but an object in `extra` is ignored.
fn merge_properties(mut base: Value, extra: &Value) -> Value {
    if let (Some(obj), Some(extra)) = (base.as_object_mut(), extra.as_object()) {
        obj.extend(extra.iter().map(|(k, v)| (k.clone(), v.clone())));
    }
    base
}

/// The request body for an event. The key is added here, at send time, so it is never
/// part of what the offline queue writes to disk.
fn with_api_key(body: &Value, api_key: &str) -> Value {
    let mut body = body.clone();
    if let Some(obj) = body.as_object_mut() {
        obj.insert("api_key".into(), json!(api_key));
    }
    body
}

async fn send_event(body: &Value) -> Result<(), String> {
    let (Some(endpoint), Some(api_key)) = (POSTHOG_ENDPOINT.get(), POSTHOG_API_KEY.get()) else {
        return Err("telemetry not configured".into());
    };
    let client = http_client().ok_or("failed to build http client")?;
    let body = with_api_key(body, api_key);
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
        if consent_pending() {
            enqueue(&body).await;
        } else if let Err(err) = send_event(&body).await {
            warn!(%err, "Failed to send telemetry event '{event}', queueing for retry");
            enqueue(&body).await;
        }
    });
}

/// Sends `event` at most once per device, e.g. an onboarding milestone.
/// Cheap to call repeatedly: after the first call it is an in-memory check.
pub fn track_once(event: &'static str, extra_props: Value) {
    if !is_enabled() || !is_configured() {
        return;
    }
    {
        let Ok(mut sent) = ONCE_SENT.lock() else { return };
        if sent.contains(&event) {
            return;
        }
        sent.push(event);
    }
    let key = format!("{ONCE_KEY_PREFIX}{event}");
    if fig_settings::state::get_bool_or(&key, false) {
        return;
    }
    fig_settings::state::set_value(&key, true).ok();
    track_with_props(event, extra_props);
}

/// Like [`track_with_props`] but awaits the send. For short-lived CLI
/// processes where a spawned task would be dropped on exit.
/// On failure the event is queued for the next long-lived process to flush.
pub async fn track_blocking(event: &str, extra_props: Value) {
    if !is_enabled() || !is_configured() {
        return;
    }
    let body = build_event(event, extra_props);
    if consent_pending() {
        enqueue(&body).await;
    } else if let Err(err) = send_event(&body).await {
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

/// The queue file's new contents after adding `line`: blank lines dropped, and the oldest
/// events dropped once there are more than `max_events`.
fn append_to_queue(existing: &str, line: &str, max_events: usize) -> String {
    let mut lines: Vec<&str> = existing.lines().filter(|l| !l.trim().is_empty()).collect();
    lines.push(line);
    if lines.len() > max_events {
        let excess = lines.len() - max_events;
        lines.drain(..excess);
    }
    let mut content = lines.join("\n");
    content.push('\n');
    content
}

/// The events in a queue file. A line that is not valid JSON is skipped, so one damaged
/// line does not block the rest.
fn parse_queue(contents: &str) -> Vec<Value> {
    contents.lines().filter_map(|l| serde_json::from_str(l).ok()).collect()
}

async fn enqueue(body: &Value) {
    let Some(path) = queue_path() else { return };
    let Ok(line) = serde_json::to_string(body) else { return };

    let _guard = QUEUE_LOCK.lock().await;
    let existing = tokio::fs::read_to_string(&path).await.unwrap_or_default();
    let content = append_to_queue(&existing, &line, QUEUE_MAX_EVENTS);
    if let Err(err) = tokio::fs::write(&path, content).await {
        warn!(%err, "Failed to persist telemetry queue");
    }
}

/// Attempt to send every queued event; failures stay queued.
pub async fn flush_queue() {
    if !is_enabled() || !is_configured() || consent_pending() {
        return;
    }
    let Some(path) = queue_path() else { return };

    let _guard = QUEUE_LOCK.lock().await;
    let Ok(existing) = tokio::fs::read_to_string(&path).await else {
        return;
    };
    let events = parse_queue(&existing);
    if events.is_empty() {
        let _ = tokio::fs::remove_file(&path).await;
        return;
    }

    let mut failed: Vec<String> = Vec::new();
    for event in &events {
        if send_event(event).await.is_err()
            && let Ok(line) = serde_json::to_string(event)
        {
            failed.push(line);
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
    if !is_enabled() {
        return;
    }
    let key = format!("{COUNTER_KEY_PREFIX}{event}");
    let current = fig_settings::state::get_int_or(&key, 0);
    fig_settings::state::set_value(&key, current + 1).ok();
}

/// Whether a heartbeat is due: none was sent yet, or the last one is a day old.
fn heartbeat_due(last: i64, now: i64) -> bool {
    now - last >= HEARTBEAT_INTERVAL_SECS
}

/// The `count()` totals held in the state db, as `(event, total)`. Other telemetry keys
/// and non-integer values are left out.
fn counter_totals(state: &serde_json::Map<String, Value>) -> Vec<(String, i64)> {
    state
        .iter()
        .filter_map(|(k, v)| {
            let name = k.strip_prefix(COUNTER_KEY_PREFIX)?;
            Some((name.to_owned(), v.as_i64()?))
        })
        .collect()
}

fn now_unix() -> i64 {
    chrono::Utc::now().timestamp()
}

/// Send a `daily_heartbeat` event if the last one was ≥24h ago (or never).
/// The event carries all accumulated [`count`] totals as `count_*` properties,
/// which are reset on success. Call this periodically (e.g. hourly) from a
/// long-lived process; it is a no-op when not due.
pub async fn maybe_send_daily_heartbeat() {
    if !is_enabled() || !is_configured() || consent_pending() {
        return;
    }
    let last = fig_settings::state::get_int_or(LAST_HEARTBEAT_KEY, 0);
    let now = now_unix();
    if !heartbeat_due(last, now) {
        return;
    }

    let mut props = serde_json::Map::new();
    let counters = fig_settings::state::all()
        .map(|map| counter_totals(&map))
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

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    #[test]
    fn config_needs_both_values_and_is_normalized() {
        assert_eq!(normalize_config("", "phc_key"), None);
        assert_eq!(normalize_config("https://a.example/capture", "  "), None);
        assert_eq!(
            normalize_config("https://a.example/capture//", " phc_key\n"),
            Some(("https://a.example/capture".to_owned(), "phc_key".to_owned()))
        );
    }

    #[test]
    fn shell_is_reported_by_basename_only() {
        assert_eq!(shell_basename(Some("/bin/zsh")), "zsh");
        assert_eq!(shell_basename(Some("/opt/homebrew/bin/fish")), "fish");
        assert_eq!(shell_basename(Some("bash")), "bash");
        assert_eq!(shell_basename(None), "unknown");
        // A path with no file name must not leak the directory.
        assert_eq!(shell_basename(Some("/")), "unknown");
    }

    #[test]
    fn extra_properties_are_added_to_the_common_ones() {
        let merged = merge_properties(
            json!({ "shell": "zsh", "terminal": "unknown" }),
            &json!({ "previous_version": "2.7.0", "terminal": "ghostty" }),
        );
        assert_eq!(
            merged,
            json!({ "shell": "zsh", "terminal": "ghostty", "previous_version": "2.7.0" })
        );
    }

    #[test]
    fn extra_properties_that_are_not_an_object_are_ignored() {
        let base = json!({ "shell": "zsh" });
        assert_eq!(merge_properties(base.clone(), &json!(null)), base);
        assert_eq!(merge_properties(base.clone(), &json!(["a"])), base);
    }

    #[test]
    fn api_key_is_added_for_sending_without_touching_the_queued_event() {
        let queued = json!({ "event": "app_opened", "properties": {} });
        let sent = with_api_key(&queued, "phc_key");

        assert_eq!(sent["api_key"], "phc_key");
        assert_eq!(sent["event"], "app_opened");
        assert!(queued.get("api_key").is_none());
    }

    #[test]
    fn queue_appends_one_event_per_line() {
        assert_eq!(append_to_queue("", "{\"event\":\"a\"}", 200), "{\"event\":\"a\"}\n");
        assert_eq!(append_to_queue("a\nb\n", "c", 200), "a\nb\nc\n");
        // Blank lines left by an interrupted write are dropped.
        assert_eq!(append_to_queue("a\n\n  \nb", "c", 200), "a\nb\nc\n");
    }

    #[test]
    fn queue_drops_the_oldest_events_beyond_the_limit() {
        assert_eq!(append_to_queue("a\nb\nc\n", "d", 3), "b\nc\nd\n");
        assert_eq!(append_to_queue("a\nb\nc\nd\ne\n", "f", 2), "e\nf\n");

        let full: String = (0..QUEUE_MAX_EVENTS).map(|i| format!("{i}\n")).collect();
        let next = append_to_queue(&full, "new", QUEUE_MAX_EVENTS);
        assert_eq!(next.lines().count(), QUEUE_MAX_EVENTS);
        assert_eq!(next.lines().next(), Some("1"));
        assert_eq!(next.lines().last(), Some("new"));
    }

    #[test]
    fn queue_skips_lines_that_are_not_json() {
        let events = parse_queue("{\"event\":\"a\"}\nnot json\n\n{\"event\":\"b\"}\n");
        assert_eq!(events, vec![json!({ "event": "a" }), json!({ "event": "b" })]);
        assert!(parse_queue("").is_empty());
    }

    #[test]
    fn queued_events_survive_a_round_trip() {
        let event = json!({ "event": "daily_heartbeat", "properties": { "count_shown": 3 } });
        let contents = append_to_queue("", &serde_json::to_string(&event).unwrap(), 200);
        assert_eq!(parse_queue(&contents), vec![event]);
    }

    #[test]
    fn heartbeat_is_due_once_a_day() {
        let day = HEARTBEAT_INTERVAL_SECS;
        // Never sent: the stored timestamp defaults to 0.
        assert!(heartbeat_due(0, 1_800_000_000));
        assert!(!heartbeat_due(1_800_000_000, 1_800_000_000));
        assert!(!heartbeat_due(1_800_000_000, 1_800_000_000 + day - 1));
        assert!(heartbeat_due(1_800_000_000, 1_800_000_000 + day));
        // A clock set back must not trigger a heartbeat.
        assert!(!heartbeat_due(1_800_000_000, 1_700_000_000));
    }

    #[test]
    fn counters_are_read_from_their_own_keys_only() {
        let state = json!({
            "telemetry.count.autocomplete_shown": 142,
            "telemetry.count.autocomplete_accepted": 37,
            "telemetry.count.broken": "12",
            "telemetry.device_id": "fa7ebf5b",
            "telemetry.last_heartbeat_ts": 1_800_000_000,
            "telemetry.once.first_terminal_session": true,
            "input-method.enabled": true,
        });
        let mut totals = counter_totals(state.as_object().unwrap());
        totals.sort();

        assert_eq!(
            totals,
            vec![
                ("autocomplete_accepted".to_owned(), 37),
                ("autocomplete_shown".to_owned(), 142),
            ]
        );
    }

    #[test]
    fn every_local_key_is_covered_by_the_purge_prefix() {
        // purge_if_disabled removes keys by STATE_KEY_PREFIX. A key outside it would
        // survive the user turning telemetry off.
        for key in [
            DEVICE_ID_KEY,
            LAST_HEARTBEAT_KEY,
            COUNTER_KEY_PREFIX,
            ONCE_KEY_PREFIX,
            LAST_TERMINAL_KEY,
            CONSENT_PENDING_KEY,
        ] {
            assert!(key.starts_with(STATE_KEY_PREFIX), "{key} is not purged");
        }
    }
}
