mod completion_cache;
mod validate;

use std::fmt::Write;
use std::sync::LazyLock;
use std::time::{
    Duration,
    Instant,
    SystemTime,
};

use fig_proto::figterm::figterm_response_message::Response as FigtermResponse;
use fig_proto::figterm::{
    FigtermResponseMessage,
    InlineShellCompletionAcceptRequest,
    InlineShellCompletionRequest,
    InlineShellCompletionResponse,
    InlineShellCompletionSetEnabledRequest,
};
use fig_settings::history::CommandInfo;
use fig_util::Shell;
use flume::Sender;
use regex::Regex;
use tokio::sync::Mutex;
use tracing::{
    error,
    info,
    warn,
};
use validate::validate;

use self::completion_cache::CompletionCache;
use crate::history::{
    self,
    HistoryQueryParams,
    HistorySender,
};

const HISTORY_COUNT_DEFAULT: usize = 49;
const DEBOUNCE_DURATION_DEFAULT: Duration = Duration::from_millis(300);

static INLINE_ENABLED: Mutex<bool> = Mutex::const_new(true);

static LAST_RECEIVED: Mutex<Option<SystemTime>> = Mutex::const_new(None);

static CACHE_ENABLED: LazyLock<bool> =
    LazyLock::new(|| fig_os_shim::Env::new().q_inline_shell_completion_cache_enabled());
static COMPLETION_CACHE: LazyLock<Mutex<CompletionCache>> = LazyLock::new(|| Mutex::new(CompletionCache::new()));

static HISTORY_COUNT: LazyLock<usize> = LazyLock::new(|| {
    fig_os_shim::Env::new()
        .q_inline_shell_completion_history_count()
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(HISTORY_COUNT_DEFAULT)
});
static DEBOUNCE_DURATION: LazyLock<Duration> = LazyLock::new(|| {
    fig_os_shim::Env::new()
        .q_inline_shell_completion_debounce_ms()
        .ok()
        .and_then(|s| s.parse().ok())
        .map_or(DEBOUNCE_DURATION_DEFAULT, Duration::from_millis)
});

pub async fn on_prompt() {
    COMPLETION_CACHE.lock().await.clear();
}

pub async fn handle_request(
    _figterm_request: InlineShellCompletionRequest,
    _session_id: String,
    response_tx: Sender<FigtermResponseMessage>,
    _history_sender: HistorySender,
) {
    if !*INLINE_ENABLED.lock().await {
        return;
    }

    // Inline completions require fig_api_client which has been removed.
    // Return empty response.
    if let Err(err) = response_tx
        .send_async(FigtermResponseMessage {
            response: Some(FigtermResponse::InlineShellCompletion(InlineShellCompletionResponse {
                insert_text: None,
            })),
        })
        .await
    {
        error!(%err, "Failed to send inline_shell_completion completion");
    }
}

pub async fn handle_accept(_figterm_request: InlineShellCompletionAcceptRequest, _session_id: String) {
    // No-op: telemetry removed
}

pub async fn handle_set_enabled(figterm_request: InlineShellCompletionSetEnabledRequest, _session_id: String) {
    *INLINE_ENABLED.lock().await = figterm_request.enabled;
}

fn prompt(history: &[CommandInfo], buffer: &str) -> Option<String> {
    for i in (0..history.len()).rev() {
        let formatted_prompt = history
            .iter()
            .rev()
            .take(i + 1)
            .filter_map(|c| c.command.clone())
            .chain([buffer.into()])
            .enumerate()
            .fold(String::new(), |mut acc, (i, c)| {
                if i > 0 {
                    acc.push('\n');
                }
                let _ = write!(acc, "{:>5}  {c}", i + 1);
                acc
            });

        // 10MB limit
        if formatted_prompt.len() < 10_000_000 {
            return Some(formatted_prompt);
        }
    }
    None
}

static RE_1: LazyLock<Regex> = LazyLock::new(|| Regex::new(&format!("{}\\s+.*", *HISTORY_COUNT + 1)).unwrap());
static RE_2: LazyLock<Regex> = LazyLock::new(|| Regex::new(&format!("{}\\s+.*", *HISTORY_COUNT + 2)).unwrap());

fn clean_completion(response: &str) -> String {
    // only return the first line of the response
    let first_line = match response.split_once('\n') {
        Some((left, _)) => left,
        None => response,
    };

    // replace parts of the prompt that potentially are the next lines without a newline
    let res = RE_1.replace(first_line, "");
    let res = RE_2.replace(&res, "");

    // trim any remaining whitespace
    res.trim_end().to_owned()
}

#[cfg(test)]
mod tests {
    use fig_settings::history::{
        HistoryColumn,
        Order,
        OrderBy,
        WhereExpression,
    };

    use super::*;

    #[test]
    fn test_prompt() {
        let history = vec![
            CommandInfo {
                command: Some("echo world".into()),
                ..Default::default()
            },
            CommandInfo {
                command: Some("echo hello".into()),
                ..Default::default()
            },
        ];

        let prompt = prompt(&history, "echo ").unwrap();
        println!("{prompt}");

        assert_eq!(prompt, "    1  echo hello\n    2  echo world\n    3  echo ");
    }

    #[test]
    fn test_clean_completion() {
        assert_eq!(clean_completion("echo hello"), "echo hello");
        assert_eq!(clean_completion("echo hello\necho world"), "echo hello");
        assert_eq!(clean_completion("echo hello   \necho world\n"), "echo hello");
        assert_eq!(clean_completion("echo hello     "), "echo hello");

        // Trim potential excess lines from the model
        assert_eq!(clean_completion("cd           50      ls"), "cd");
        assert_eq!(
            clean_completion("git add     50  git commit -m \"initial commit\""),
            "git add"
        );
        assert_eq!(clean_completion("cd           51      ls"), "cd");
        assert_eq!(
            clean_completion("git add     51  git commit -m \"initial commit\""),
            "git add"
        );
    }
}
