mod common;

use common::*;

#[test]
fn dotfile_status_respects_the_requested_shell() -> Result<()> {
    for shell in ["bash", "zsh", "fish"] {
        let output = cli()
            .args(["integrations", "status", "-f", "json", "dotfiles", shell])
            .assert()
            .success()
            .get_output()
            .stdout
            .clone();
        let report: serde_json::Value = serde_json::from_slice(&output)?;
        let integrations = report["integrations"].as_array().unwrap();
        assert!(!integrations.is_empty());
        assert!(integrations.iter().all(|integration| integration["shell"] == shell));
        assert!(report["errors"].as_array().unwrap().is_empty());
    }
    Ok(())
}

#[test]
fn combined_status_returns_one_json_object() -> Result<()> {
    let output = cli()
        .args(["integrations", "status", "-f", "json", "all"])
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    let report: serde_json::Value = serde_json::from_slice(&output)?;
    assert!(report["dotfiles"]["integrations"].is_array());
    assert!(report.get("ssh").is_none());
    #[cfg(target_os = "macos")]
    assert!(report["input-method"]["installed"].is_boolean());
    Ok(())
}
