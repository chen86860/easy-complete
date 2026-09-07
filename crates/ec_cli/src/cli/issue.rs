use std::process::ExitCode;

use anstream::println;
use clap::Args;
use crossterm::style::Stylize;
use eyre::Result;
use fig_diagnostic::Diagnostics;
use fig_util::system_info::is_remote;
use fig_util::{CLI_BINARY_NAME, GITHUB_REPO_NAME, PRODUCT_NAME};

// Keep the template filename and its prefilled field IDs stable across releases.
const BUG_REPORT_TEMPLATE: &str = "1_bug_report_template.yml";

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
    /// Additional context, separate from the generated diagnostics
    pub additional_environment: Option<String>,
}

impl IssueCreator {
    fn build_url(&self, version: &str, os: Option<&str>, environment: &str) -> Result<url::Url> {
        let mut params = vec![
            ("template", BUG_REPORT_TEMPLATE.to_owned()),
            ("app-version", version.to_owned()),
            ("environment", environment.to_owned()),
        ];

        if let Some(title) = self.title.as_deref() {
            let title = title.trim();
            let title = if title.get(..4).is_some_and(|prefix| prefix.eq_ignore_ascii_case("bug:")) {
                title[4..].trim()
            } else {
                title
            };
            if !title.is_empty() {
                params.push(("title", format!("bug: {title}")));
            }
        }

        // Leave missing fields empty so GitHub's form validation can guide the user.
        for (field, value) in [
            ("os", os),
            ("expected", self.expected_behavior.as_deref()),
            ("actual", self.actual_behavior.as_deref()),
            ("reproduce", self.steps_to_reproduce.as_deref()),
            ("context", self.additional_environment.as_deref()),
        ] {
            if let Some(value) = value.filter(|value| !value.trim().is_empty()) {
                params.push((field, value.to_owned()));
            }
        }

        Ok(url::Url::parse_with_params(
            &format!("https://github.com/{GITHUB_REPO_NAME}/issues/new"),
            params,
        )?)
    }

    pub async fn create_url(&self) -> Result<url::Url> {
        println!("Heading over to GitHub...");

        let diagnostics = Diagnostics::new().await;

        let os = diagnostics.system_info.os.map(ToString::to_string);

        let diagnostic_info = match diagnostics.user_readable() {
            Ok(diagnostics) => diagnostics,
            Err(err) => {
                eprintln!("Error getting diagnostics: {err}");
                "Error occurred while generating diagnostics".to_owned()
            },
        };

        let url = self.build_url(&diagnostics.build_details.version, os.as_deref(), &diagnostic_info)?;

        if is_remote() || fig_util::open_url_async(url.as_str()).await.is_err() {
            println!("Issue Url: {}", url.as_str().underlined());
        }

        Ok(url)
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use super::*;

    fn example_issue() -> IssueCreator {
        IssueCreator {
            title: Some("Completion popup is misplaced".to_owned()),
            expected_behavior: Some("The popup follows the cursor.".to_owned()),
            actual_behavior: Some("The popup appears at the top-left.".to_owned()),
            steps_to_reproduce: Some("Open a terminal and type `git`.".to_owned()),
            additional_environment: Some("Two monitors connected.".to_owned()),
        }
    }

    fn query_params(url: &url::Url) -> HashMap<String, String> {
        url.query_pairs().into_owned().collect()
    }

    #[test]
    fn issue_url_prefills_bug_report_fields() {
        let url = example_issue()
            .build_url("2.3.2", Some("macOS 26.6"), "version = \"2.3.2\"\n")
            .unwrap();

        assert_eq!(url.scheme(), "https");
        assert_eq!(url.host_str(), Some("github.com"));
        assert_eq!(url.path(), format!("/{GITHUB_REPO_NAME}/issues/new"));
        let expected = [
            ("template", BUG_REPORT_TEMPLATE),
            ("title", "bug: Completion popup is misplaced"),
            ("app-version", "2.3.2"),
            ("os", "macOS 26.6"),
            ("environment", "version = \"2.3.2\"\n"),
            ("expected", "The popup follows the cursor."),
            ("actual", "The popup appears at the top-left."),
            ("reproduce", "Open a terminal and type `git`."),
            ("context", "Two monitors connected."),
        ]
        .into_iter()
        .map(|(key, value)| (key.to_owned(), value.to_owned()))
        .collect();
        assert_eq!(query_params(&url), expected);
    }

    #[test]
    fn issue_url_leaves_missing_details_for_the_user() {
        for value in [None, Some("".to_owned()), Some(" \n\t ".to_owned())] {
            let url = IssueCreator {
                title: value.clone(),
                expected_behavior: value.clone(),
                actual_behavior: value.clone(),
                steps_to_reproduce: value.clone(),
                additional_environment: value,
            }
            .build_url("2.3.2", None, "diagnostics unavailable")
            .unwrap();

            let params = query_params(&url);
            for field in [
                "title",
                "body",
                "os",
                "expected",
                "actual",
                "reproduce",
                "context",
                "terminal",
                "checks",
            ] {
                assert!(!params.contains_key(field), "Unexpected prefill for {field}");
            }
        }
    }

    #[test]
    fn issue_url_normalizes_the_bug_title_prefix() {
        for title in ["Popup misplaced", "bug: Popup misplaced", " BUG:Popup misplaced "] {
            let mut issue = example_issue();
            issue.title = Some(title.to_owned());
            let url = issue.build_url("2.3.2", None, "").unwrap();
            assert_eq!(query_params(&url)["title"], "bug: Popup misplaced");
        }
    }

    #[test]
    fn issue_url_preserves_unicode_and_multiline_diagnostics() {
        let details = "第一行 & second = value? #fragment + 100%\n第二行 🐛";
        let diagnostics = "[environment]\nterminal = \"终端\"\ncwd = \"/USER/a & b/#目录\"\n";
        let issue = IssueCreator {
            title: Some("中文 & # + ? = % 🐛".to_owned()),
            expected_behavior: Some(details.to_owned()),
            actual_behavior: Some(details.to_owned()),
            steps_to_reproduce: Some(details.to_owned()),
            additional_environment: Some(details.to_owned()),
        };
        let url = issue.build_url("2.3.2", Some("macOS 26.6"), diagnostics).unwrap();
        let reparsed = url::Url::parse(url.as_str()).unwrap();
        let params = query_params(&reparsed);

        assert_eq!(reparsed.fragment(), None);
        assert_eq!(params["title"], "bug: 中文 & # + ? = % 🐛");
        assert_eq!(params["environment"], diagnostics);
        for field in ["expected", "actual", "reproduce", "context"] {
            assert_eq!(params[field], details);
        }
    }

    #[test]
    fn issue_url_matches_the_repository_template() {
        let template_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../.github/ISSUE_TEMPLATE")
            .join(BUG_REPORT_TEMPLATE);
        let template = std::fs::read_to_string(template_path).expect("The CLI's bug report template must exist");
        let field_ids: Vec<_> = template
            .lines()
            .filter_map(|line| line.trim().strip_prefix("id:"))
            .map(|id| id.trim().trim_matches(['\"', '\'']))
            .collect();
        let url = example_issue().build_url("2.3.2", Some("macOS 26.6"), "").unwrap();

        for (field, _) in url.query_pairs() {
            if !matches!(field.as_ref(), "template" | "title") {
                assert!(field_ids.contains(&field.as_ref()), "Missing template field: {field}");
            }
        }
        assert!(template.lines().any(|line| line == "title: \"bug: \""));
        assert!(template.lines().any(|line| line.trim() == "render: toml"));
    }
}
