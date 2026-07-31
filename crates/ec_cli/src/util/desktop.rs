use std::process::Command;

use eyre::{Result, eyre};
use fig_os_shim::Env;
use fig_util::env_var::{Q_PARENT, Q_SET_PARENT};
use fig_util::{PRODUCT_NAME, directories, manifest, system_info};

/// Escape hatch that forces the pty wrapper to launch regardless of every other check.
pub const Q_FORCE_FIGTERM_LAUNCH: &str = "Q_FORCE_FIGTERM_LAUNCH";

pub struct LaunchArgs {
    /// Should we wait for the socket to continue execution
    pub wait_for_socket: bool,
    /// Should we open the dashboard right away
    ///
    /// Note that this won't open the dashboard if the app is already running
    pub open_dashboard: bool,
    /// Should we do the first update check or skip it
    pub immediate_update: bool,
    /// Print output to user
    pub verbose: bool,
}

/// Whether shell integration should stand down because the desktop app is not running.
///
/// Remote sessions are exempt. They reach the desktop app over the socket named by
/// `Q_SET_PARENT`/`Q_PARENT` on the user's own machine, so there is never a local
/// process to find and gating on one would disable SSH autocomplete permanently.
pub fn suppress_without_desktop_app(env: &Env) -> bool {
    if env.get_os(Q_FORCE_FIGTERM_LAUNCH).is_some() || is_remote_session(env) {
        return false;
    }

    !desktop_app_running()
}

fn is_remote_session(env: &Env) -> bool {
    env.in_ssh() || env.get_os(Q_SET_PARENT).is_some() || env.get_os(Q_PARENT).is_some() || system_info::is_remote()
}

#[cfg(target_os = "macos")]
pub fn desktop_app_running() -> bool {
    use fig_util::consts::APP_BUNDLE_ID;
    use objc2_app_kit::NSRunningApplication;
    use objc2_foundation::ns_string;

    // Authoritative and cheap: the bundle is registered with the window server for as
    // long as the app lives. A process-table sweep as a fallback would run on every
    // shell start in exactly the case that matters — the app being closed — and is not
    // worth the startup latency.
    let bundle_id = ns_string!(APP_BUNDLE_ID);
    let running_applications = unsafe { NSRunningApplication::runningApplicationsWithBundleIdentifier(bundle_id) };

    !running_applications.is_empty()
}

#[cfg(target_os = "windows")]
pub fn desktop_app_running() -> bool {
    use crate::consts::APP_PROCESS_NAME;

    let output = match std::process::Command::new("tasklist.exe")
        .args(["/NH", "/FI", "IMAGENAME eq fig_desktop.exe"])
        .output()
    {
        Ok(output) => output,
        Err(_) => return false,
    };

    match std::str::from_utf8(&output.stdout) {
        Ok(result) => result.contains(CODEWHISPERER_DESKTOP_PROCESS_NAME),
        Err(_) => false,
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub fn desktop_app_running() -> bool {
    use std::ffi::OsString;

    use fig_util::consts::APP_PROCESS_NAME;
    use sysinfo::{ProcessRefreshKind, RefreshKind, System};

    let s = System::new_with_specifics(RefreshKind::nothing().with_processes(ProcessRefreshKind::nothing()));
    let app_process_name = OsString::from(APP_PROCESS_NAME);
    let mut processes = s.processes_by_exact_name(&app_process_name);
    processes.next().is_some()
}

pub fn launch_fig_desktop(args: LaunchArgs) -> Result<()> {
    if manifest::is_minimal() {
        return Err(eyre!(
            "launching {PRODUCT_NAME} from minimal installs is not yet supported"
        ));
    }

    if system_info::is_remote() {
        return Err(eyre!(
            "launching {PRODUCT_NAME} from remote installs is not yet supported"
        ));
    }

    match desktop_app_running() {
        true => return Ok(()),
        false => {
            if args.verbose {
                println!("Launching {PRODUCT_NAME}...");
            }
        },
    }

    std::fs::remove_file(directories::desktop_socket_path()?).ok();

    let mut common_args = vec![];
    if !args.open_dashboard {
        common_args.push("--no-dashboard");
    }
    if !args.immediate_update {
        common_args.push("--ignore-immediate-update");
    }

    cfg_if::cfg_if! {
        if #[cfg(target_os = "macos")] {
            let output = Command::new("open")
                .args(["-g", "-b", fig_util::consts::APP_BUNDLE_ID, "--args"])
                .args(common_args)
                .output()?;

            if !output.status.success() {
                eyre::bail!("failed to launch: {}", String::from_utf8_lossy(&output.stderr));
            }
        } else if #[cfg(windows)] {
            use std::os::windows::process::CommandExt;
            use windows::Win32::System::Threading::DETACHED_PROCESS;

            Command::new("fig_desktop")
                .creation_flags(DETACHED_PROCESS.0)
                .spawn()?;
        } else {
            let state = fig_settings::State::new();
            let ctx = fig_os_shim::Context::new();
            launch_linux_desktop(ctx, &state)?;
            // Need to wait some time for the app to launch and appear in the process list.
            // 1 second to be safe.
            std::thread::sleep(std::time::Duration::from_millis(1000));
        }
    }

    if !args.wait_for_socket {
        return Ok(());
    }

    if !desktop_app_running() {
        return Err(eyre!("{PRODUCT_NAME} was unable launch successfully"));
    }

    // Wait for socket to exist
    let path = directories::desktop_socket_path()?;

    cfg_if::cfg_if! {
        if #[cfg(windows)] {
            for _ in 0..30 {
                match path.metadata() {
                    Ok(_) => return Ok(()),
                    Err(err) => if let Some(code) = err.raw_os_error() {
                        // Windows can't query socket file existence
                        // Check against arbitrary error code
                        if code == 1920 {
                            return Ok(())
                        }
                    },
                }

                std::thread::sleep(std::time::Duration::from_millis(500));
            }
        } else {
            for _ in 0..30 {
                // Wait for socket to exist
                if path.exists() {
                    return Ok(());
                }

                std::thread::sleep(std::time::Duration::from_millis(500));
            }
        }
    }

    Err(eyre!("failed to connect to socket".to_owned()))
}

#[cfg(target_os = "linux")]
fn launch_linux_desktop(ctx: std::sync::Arc<fig_os_shim::Context>, state: &fig_settings::State) -> eyre::Result<()> {
    use std::process::Stdio;

    use eyre::Context;
    use fig_integrations::desktop_entry::{EntryContents, local_entry_path};
    use fig_util::APP_PROCESS_NAME;
    use tracing::error;

    if state.get_bool_or("appimage.manageDesktopEntry", false) {
        if let Some(exec) = EntryContents::from_path_sync(&ctx, local_entry_path(&ctx)?)?.get_field("Exec") {
            match Command::new(exec)
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn()
            {
                Ok(_) => return Ok(()),
                Err(err) => {
                    error!(
                        ?err,
                        "Unable to launch desktop app according to the local desktop entry."
                    );
                },
            }
        }
        // Fall back to calling q-desktop if on the user's path
    }

    Command::new(APP_PROCESS_NAME)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .context(format!("Executable '{}' not in the user's path", APP_PROCESS_NAME))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Each of these reaches the desktop app on another machine, or forces the wrapper
    /// outright, so the gate must let them through without ever asking whether a local
    /// desktop process exists.
    #[test]
    fn remote_and_forced_sessions_bypass_the_desktop_app_gate() {
        for (label, env) in [
            ("SSH_CLIENT", Env::from_slice(&[("SSH_CLIENT", "1")])),
            ("SSH_CONNECTION", Env::from_slice(&[("SSH_CONNECTION", "1")])),
            ("SSH_TTY", Env::from_slice(&[("SSH_TTY", "/dev/ttys001")])),
            (Q_SET_PARENT, Env::from_slice(&[(Q_SET_PARENT, "/tmp/parent.sock")])),
            (Q_PARENT, Env::from_slice(&[(Q_PARENT, "/tmp/parent.sock")])),
            (
                Q_FORCE_FIGTERM_LAUNCH,
                Env::from_slice(&[(Q_FORCE_FIGTERM_LAUNCH, "1")]),
            ),
        ] {
            assert!(
                !suppress_without_desktop_app(&env),
                "{label} should exempt the session from the desktop app gate"
            );
        }
    }

    #[test]
    #[ignore = "not in ci"]
    fn test_e2e_desktop_app_running() {
        println!("{}", desktop_app_running());
    }

    #[test]
    #[ignore = "not in ci"]
    fn test_e2e_launch_fig_desktop() {
        launch_fig_desktop(LaunchArgs {
            wait_for_socket: true,
            open_dashboard: true,
            immediate_update: false,
            verbose: true,
        })
        .unwrap();
    }

    #[test]
    #[ignore = "not in ci"]
    #[cfg(target_os = "linux")]
    fn test_e2e_launch_linux_desktop() {
        use fig_os_shim::Context;
        use fig_settings::State;

        launch_linux_desktop(Context::new(), &State::new()).unwrap();
    }
}
