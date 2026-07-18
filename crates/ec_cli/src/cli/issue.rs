use std::process::ExitCode;

use anstream::println;
use clap::Args;
use crossterm::style::Stylize;
use eyre::Result;
use fig_diagnostic::Diagnostics;
use fig_util::system_info::is_remote;
use fig_util::{CLI_BINARY_NAME, GITHUB_REPO_NAME, PRODUCT_NAME};

#[derive(Debug, Args, PartialEq, Eq)]
pub struct IssueArgs {
    /// Force issue creation
    #[arg(long, short = 'f')]
    force: bool,
    /// Issue description
    description: Vec<String>,
}

impl IssueArgs {
    #[allow(unreachable_code)]
    pub async fn execute(&self) -> Result<ExitCode> {
        // Check if fig is running
        if !(self.force || is_remote() || crate::util::desktop::desktop_app_running()) {
            println!(
                "\n→ {PRODUCT_NAME} is not running.\n  Please launch {PRODUCT_NAME} with {} or run {} to create the issue anyways",
                format!("{CLI_BINARY_NAME} launch").magenta(),
                format!("{CLI_BINARY_NAME} issue --force").magenta()
            );
            return Ok(ExitCode::FAILURE);
        }

        let joined_description = self.description.join(" ").trim().to_owned();

        let issue_title = match joined_description.len() {
            0 => dialoguer::Input::with_theme(&crate::util::dialoguer_theme())
                .with_prompt("Issue Title")
                .interact_text()?,
            _ => joined_description,
        };

        IssueCreator {
            title: Some(issue_title),
            expected_behavior: None,
            actual_behavior: None,
            steps_to_reproduce: None,
            additional_environment: None,
        }
        .create_url()
        .await?;

        Ok(ExitCode::SUCCESS)
    }
}

pub struct IssueCreator {
    /// Issue title
    pub title: Option<String>,
    /// Issue description
    pub expected_behavior: Option<String>,
    /// Issue description
    pub actual_behavior: Option<String>,
    /// Issue description
    pub steps_to_reproduce: Option<String>,
    /// Issue description
    pub additional_environment: Option<String>,
}

impl IssueCreator {
    fn build_url(&self, os: &str, environment: &str) -> Result<url::Url> {
        let public_warning = "<!-- This issue is public. Do not include personal or sensitive information. -->";
        let placeholder = "_Please describe._";
        let body = format!(
            "{public_warning}\n\n## Expected behavior\n\n{}\n\n## Actual behavior\n\n{}\n\n## Steps to reproduce\n\n{}\n\n## Environment\n\n**Operating system:** {os}\n\n```yaml\n{environment}\n```",
            self.expected_behavior.as_deref().unwrap_or(placeholder),
            self.actual_behavior.as_deref().unwrap_or(placeholder),
            self.steps_to_reproduce.as_deref().unwrap_or(placeholder),
        );

        let mut params = vec![("body", body)];
        if let Some(title) = &self.title {
            params.push(("title", title.clone()));
        }

        Ok(url::Url::parse_with_params(
            &format!("https://github.com/{GITHUB_REPO_NAME}/issues/new"),
            params,
        )?)
    }

    pub async fn create_url(&self) -> Result<url::Url> {
        println!("Heading over to GitHub...");

        let diagnostics = Diagnostics::new().await;

        let os = match &diagnostics.system_info.os {
            Some(os) => os.to_string(),
            None => "None".to_owned(),
        };

        let diagnostic_info = match diagnostics.user_readable() {
            Ok(diagnostics) => diagnostics,
            Err(err) => {
                eprintln!("Error getting diagnostics: {err}");
                "Error occurred while generating diagnostics".to_owned()
            },
        };

        let environment = match &self.additional_environment {
            Some(context) => format!("{diagnostic_info}\n{context}"),
            None => diagnostic_info,
        };

        // Use GitHub's standard `title` and `body` parameters rather than relying on a
        // repository issue template. This keeps `ec issue` working when templates are
        // renamed, removed, or disabled in the target repository.
        let url = self.build_url(&os, &environment)?;

        if is_remote() || fig_util::open_url_async(url.as_str()).await.is_err() {
            println!("Issue Url: {}", url.as_str().underlined());
        }

        Ok(url)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn issue_url_does_not_depend_on_a_repository_template() {
        let url = IssueCreator {
            title: Some("Completion popup is misplaced".to_owned()),
            expected_behavior: Some("The popup follows the cursor.".to_owned()),
            actual_behavior: Some("The popup appears at the top-left.".to_owned()),
            steps_to_reproduce: Some("Open a terminal and type `git`.".to_owned()),
            additional_environment: None,
        }
        .build_url("macOS 15.5", "version: 2.0.0")
        .unwrap();

        let params = url.query_pairs().collect::<std::collections::HashMap<_, _>>();
        assert_eq!(params.get("title").unwrap(), "Completion popup is misplaced");
        assert!(!params.contains_key("template"));

        let body = params.get("body").unwrap();
        assert!(body.contains("## Expected behavior"));
        assert!(body.contains("The popup follows the cursor."));
        assert!(body.contains("**Operating system:** macOS 15.5"));
        assert!(body.contains("version: 2.0.0"));
    }

    #[test]
    fn issue_url_includes_prompts_for_missing_details() {
        let url = IssueCreator {
            title: None,
            expected_behavior: None,
            actual_behavior: None,
            steps_to_reproduce: None,
            additional_environment: None,
        }
        .build_url("Unknown", "diagnostics unavailable")
        .unwrap();

        let params = url.query_pairs().collect::<std::collections::HashMap<_, _>>();
        assert!(!params.contains_key("title"));
        assert_eq!(params.get("body").unwrap().matches("_Please describe._").count(), 3);
    }
}
