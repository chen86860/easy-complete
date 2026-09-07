mod common;

use common::*;

// Integrations tests for the CLI
//
// This should be used to test interfaces that external code may rely on
// (exit codes, structured output, CLI flags)

#[test]
fn version_flag_has_status_code_zero() -> Result<()> {
    cli()
        .arg("--version")
        .assert()
        .success()
        .stdout(predicate::str::contains(env!("CARGO_PKG_VERSION")));
    Ok(())
}

#[test]
fn version_subcommand_has_status_code_zero() -> Result<()> {
    cli()
        .arg("version")
        .assert()
        .success()
        .stdout(predicate::str::contains(env!("CARGO_PKG_VERSION")));
    Ok(())
}

#[test]
fn help_flag_has_status_code_zero() -> Result<()> {
    cli().arg("--help").assert().success();
    Ok(())
}

#[test]
fn help_all_flag_has_status_code_zero() -> Result<()> {
    cli()
        .arg("--help-all")
        .assert()
        .success()
        .stdout(predicate::str::contains("ec integrations status dotfiles"))
        .stdout(predicate::str::contains("ec internal should-figterm-launch"))
        .stdout(predicate::str::contains("ec telemetry track"));
    Ok(())
}

#[test]
#[cfg(target_os = "macos")]
fn macos_help_omits_linux_integrations_and_retired_build_switching() -> Result<()> {
    cli()
        .args(["integrations", "status", "--help"])
        .assert()
        .success()
        .stdout(predicate::str::contains("autostart-entry").not())
        .stdout(predicate::str::contains("gnome-shell-extension").not());
    cli().args(["debug", "build", "--help"]).assert().code(2);
    Ok(())
}

#[test]
#[cfg(target_os = "macos")]
fn debug_app_launches_desktop_and_propagates_failure() -> Result<()> {
    use std::os::unix::fs::PermissionsExt;

    let temp = tempfile::tempdir()?;
    let bundle = temp.path().join("Test App.app");
    let macos = bundle.join("Contents/MacOS");
    std::fs::create_dir_all(&macos)?;
    for (path, script) in [
        (
            temp.path().join("lsappinfo"),
            "#!/bin/sh\ncase \"$*\" in\n*bundlepath*) printf 'bundlepath=\"%s\"\\n' \"$EC_TEST_BUNDLE_PATH\" ;;\n*name*) printf 'name=\"Test Terminal\"\\n' ;;\n*) printf 'Test App\\n' ;;\nesac\n",
        ),
        (
            macos.join("easy-complete"),
            "#!/bin/sh\nprintf 'desktop-fixture-invoked\\n'\nexit \"$EC_TEST_EXIT_CODE\"\n",
        ),
        (macos.join("ec"), "#!/bin/sh\nprintf 'wrong-cli-invoked\\n'\n"),
    ] {
        std::fs::write(&path, script)?;
        std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o755))?;
    }
    let mut paths = vec![temp.path().to_owned()];
    paths.extend(std::env::split_paths(&std::env::var_os("PATH").unwrap_or_default()));
    for (child_exit, expected_exit) in [("0", 0), ("7", 1)] {
        cli()
            .args(["debug", "app"])
            .env("PATH", std::env::join_paths(&paths)?)
            .env("EC_TEST_BUNDLE_PATH", &bundle)
            .env("EC_TEST_EXIT_CODE", child_exit)
            .assert()
            .code(expected_exit)
            .stdout(predicate::str::contains("desktop-fixture-invoked"))
            .stdout(predicate::str::contains("wrong-cli-invoked").not());
    }
    Ok(())
}
