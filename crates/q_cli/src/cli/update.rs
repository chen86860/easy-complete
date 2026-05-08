use std::process::ExitCode;

use clap::Args;
use eyre::Result;

#[derive(Debug, Args, PartialEq, Eq)]
pub struct UpdateArgs {
    /// Apply the update without prompting for confirmation
    #[arg(long, short = 'y')]
    pub non_interactive: bool,
    /// Relaunch into dashboard after update
    #[arg(long)]
    pub relaunch_dashboard: bool,
    #[arg(long, hide = true)]
    pub rollout: bool,
}

impl UpdateArgs {
    pub async fn execute(self) -> Result<ExitCode> {
        println!("Auto-update is not available in this build.");
        Ok(ExitCode::SUCCESS)
    }
}
