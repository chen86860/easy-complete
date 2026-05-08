use std::process::ExitCode;

use anstream::println;
use clap::Subcommand;
use crossterm::style::Stylize;
use eyre::Result;
use fig_ipc::{
    BufferedUnixStream,
    SendMessage,
};
use fig_proto::figterm::figterm_request_message::Request;
use fig_proto::figterm::{
    FigtermRequestMessage,
    InlineShellCompletionSetEnabledRequest,
};
use fig_util::env_var::QTERM_SESSION_ID;
use tracing::error;

use crate::util::CliContext;

const INLINE_ENABLED_SETTINGS_KEY: &str = "inline.enabled";

#[derive(Debug, Clone, PartialEq, Subcommand)]
pub enum InlineSubcommand {
    /// Enables inline
    Enable,
    /// Disables inline
    Disable,
    /// Shows the status of inline
    Status,
}

impl InlineSubcommand {
    pub async fn execute(&self, cli_context: &CliContext) -> Result<ExitCode> {
        let settings = cli_context.settings();

        match self {
            InlineSubcommand::Enable => {
                settings.set_value(INLINE_ENABLED_SETTINGS_KEY, true)?;
                if let Err(err) = send_set_enabled(true).await {
                    error!("Failed to send set enabled message: {err}");
                }
                println!("{}", "Inline enabled".magenta());
            },
            InlineSubcommand::Disable => {
                settings.set_value(INLINE_ENABLED_SETTINGS_KEY, false)?;
                if let Err(err) = send_set_enabled(false).await {
                    error!("Failed to send set enabled message: {err}");
                }
                println!("{}", "Inline disabled".magenta());
            },
            InlineSubcommand::Status => {
                let enabled = settings.get_bool(INLINE_ENABLED_SETTINGS_KEY)?.unwrap_or(true);
                println!("Inline is {}", if enabled { "enabled" } else { "disabled" }.bold());
            },
        }
        Ok(ExitCode::SUCCESS)
    }
}

async fn send_set_enabled(enabled: bool) -> Result<()> {
    let session_id = std::env::var(QTERM_SESSION_ID)?;
    let figterm_socket_path = fig_util::directories::figterm_socket_path(&session_id)?;
    let mut conn = BufferedUnixStream::connect(figterm_socket_path).await?;
    conn.send_message(FigtermRequestMessage {
        request: Some(Request::InlineShellCompletionSetEnabled(
            InlineShellCompletionSetEnabledRequest { enabled },
        )),
    })
    .await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_subcommands() {
        let cli_context = CliContext::new_fake();
        let settings = cli_context.settings();

        InlineSubcommand::Enable.execute(&cli_context).await.unwrap();
        assert!(settings.get_bool(INLINE_ENABLED_SETTINGS_KEY).unwrap().unwrap());
        InlineSubcommand::Status.execute(&cli_context).await.unwrap();

        InlineSubcommand::Disable.execute(&cli_context).await.unwrap();
        assert!(!settings.get_bool(INLINE_ENABLED_SETTINGS_KEY).unwrap().unwrap());
        InlineSubcommand::Status.execute(&cli_context).await.unwrap();
    }
}
