mod common;

use common::*;

#[test]
fn settings_get() -> Result<()> {
    cli()
        .args(["settings", "test-value"])
        .assert()
        .code(predicate::in_iter([0, 1]));

    cli()
        .args(["settings", "test-value", "-f", "json"])
        .assert()
        .stdout(is_json())
        .success();
    Ok(())
}

#[test]
fn settings_list_and_legacy_spellings_return_the_same_json() -> Result<()> {
    let mut outputs = Vec::new();
    for args in [
        vec!["settings", "list", "-f", "json"],
        vec!["settings", "list", "--all", "-f", "json"],
        vec!["settings", "all", "-f", "json"],
        vec!["settings", "list", "-f", "json-pretty"],
    ] {
        let output = cli()
            .args(args)
            .assert()
            .success()
            .stdout(is_json())
            .get_output()
            .stdout
            .clone();
        let values: serde_json::Value = serde_json::from_slice(&output)?;
        assert!(values.is_object());
        outputs.push(values);
    }
    assert!(outputs.windows(2).all(|pair| pair[0] == pair[1]));
    Ok(())
}
