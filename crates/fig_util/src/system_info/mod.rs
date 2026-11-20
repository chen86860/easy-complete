use std::borrow::Cow;
use std::sync::OnceLock;

use cfg_if::cfg_if;
use fig_os_shim::Env;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::Error;

/// The support level for different platforms
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SupportLevel {
    /// A fully supported platform
    Supported,
    /// Supported, but with a caveat
    SupportedWithCaveat { info: Cow<'static, str> },
    /// A platform that is currently in development
    InDevelopment { info: Option<Cow<'static, str>> },
    /// A platform that is not supported
    Unsupported,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OSVersion {
    MacOS {
        major: i32,
        minor: i32,
        patch: Option<i32>,
        build: String,
    },
    FreeBsd {
        version: String,
    },
}

impl OSVersion {
    pub fn support_level(&self) -> SupportLevel {
        match self {
            OSVersion::MacOS { major, .. } => {
                // Minimum supported macOS version is 13
                if *major >= 13 {
                    SupportLevel::Supported
                } else {
                    SupportLevel::Unsupported
                }
            },
            OSVersion::FreeBsd { .. } => SupportLevel::InDevelopment { info: None },
        }
    }

    pub fn user_readable(&self) -> Vec<String> {
        vec![format!("{self}")]
    }
}

impl std::fmt::Display for OSVersion {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OSVersion::MacOS {
                major,
                minor,
                patch,
                build,
            } => {
                let patch = patch.unwrap_or(0);
                write!(f, "macOS {major}.{minor}.{patch} ({build})")
            },
            OSVersion::FreeBsd { version } => write!(f, "FreeBSD {version}"),
        }
    }
}

pub fn os_version() -> Option<&'static OSVersion> {
    static OS_VERSION: OnceLock<Option<OSVersion>> = OnceLock::new();
    OS_VERSION
        .get_or_init(|| {
            cfg_if! {
                if #[cfg(target_os = "macos")] {
                    use std::process::Command;
                    use regex::Regex;

                    let version_info = Command::new("sw_vers")
                        .output()
                        .ok()?;

                    let version_info: String = String::from_utf8_lossy(&version_info.stdout).trim().into();

                    let version_regex = Regex::new(r"ProductVersion:\s*(\S+)").unwrap();
                    let build_regex = Regex::new(r"BuildVersion:\s*(\S+)").unwrap();

                    let version: String = version_regex
                        .captures(&version_info)
                        .and_then(|c| c.get(1))
                        .map(|v| v.as_str().into())?;

                    let major = version
                        .split('.')
                        .next()?
                        .parse().ok()?;

                    let minor = version
                        .split('.')
                        .nth(1)?
                        .parse().ok()?;

                    let patch = version.split('.').nth(2).and_then(|p| p.parse().ok());

                    let build = build_regex
                        .captures(&version_info)
                        .and_then(|c| c.get(1))?
                        .as_str()
                        .into();

                    Some(OSVersion::MacOS {
                        major,
                        minor,
                        patch,
                        build,
                    })
                } else if #[cfg(target_os = "freebsd")] {
                    use nix::sys::utsname::uname;

                    let version = uname().ok()?.release().to_string_lossy().into();

                    Some(OSVersion::FreeBsd {
                        version,
                    })

                }
            }
        })
        .as_ref()
}

pub fn in_ssh() -> bool {
    static IN_SSH: OnceLock<bool> = OnceLock::new();
    *IN_SSH.get_or_init(|| Env::new().in_ssh())
}

/// Is the calling binary running on a remote instance
pub fn is_remote() -> bool {
    // TODO(chay): Add detection for inside docker container
    in_ssh() || in_cloudshell() || fig_os_shim::Env::new().q_fake_is_remote()
}

/// Determines if we have an IPC path to a Desktop app from a remote environment
pub fn has_parent() -> bool {
    static HAS_PARENT: OnceLock<bool> = OnceLock::new();
    *HAS_PARENT.get_or_init(|| fig_os_shim::Env::new().has_q_parent())
}

/// This true if the env var `AWS_EXECUTION_ENV=CloudShell`
pub fn in_cloudshell() -> bool {
    static IN_CLOUDSHELL: OnceLock<bool> = OnceLock::new();
    *IN_CLOUDSHELL.get_or_init(|| Env::new().in_cloudshell())
}

pub fn in_codespaces() -> bool {
    static IN_CODESPACES: OnceLock<bool> = OnceLock::new();
    *IN_CODESPACES.get_or_init(|| fig_os_shim::Env::new().in_codespaces())
}

pub fn in_ci() -> bool {
    static IN_CI: OnceLock<bool> = OnceLock::new();
    *IN_CI.get_or_init(|| fig_os_shim::Env::new().in_ci())
}

/// The user's preferred UI language, e.g. `en-US` or `zh-Hans-CN`. Cached for the process.
pub fn preferred_language() -> Option<&'static str> {
    static LANGUAGE: OnceLock<Option<String>> = OnceLock::new();
    LANGUAGE
        .get_or_init(|| {
            cfg_if! {
                if #[cfg(target_os = "macos")] {
                    macos_utils::os::preferred_language()
                } else {
                    std::env::var("LANG").ok().and_then(|lang| {
                        let tag = lang.split('.').next()?.replace('_', "-");
                        (!tag.is_empty() && tag != "C" && tag != "POSIX").then_some(tag)
                    })
                }
            }
        })
        .as_deref()
}

#[cfg(target_os = "macos")]
fn raw_system_id() -> Result<String, Error> {
    let output = std::process::Command::new("ioreg")
        .args(["-rd1", "-c", "IOPlatformExpertDevice"])
        .output()?;

    let output = String::from_utf8_lossy(&output.stdout);

    let machine_id: String = output
        .lines()
        .find(|line| line.contains("IOPlatformUUID"))
        .ok_or(Error::HwidNotFound)?
        .split('=')
        .nth(1)
        .ok_or(Error::HwidNotFound)?
        .trim()
        .trim_start_matches('"')
        .trim_end_matches('"')
        .into();

    Ok(machine_id)
}

#[cfg(target_os = "freebsd")]
fn raw_system_id() -> Result<String, Error> {
    Err(Error::HwidNotFound)
}

pub fn get_system_id() -> Option<&'static str> {
    static SYSTEM_ID: OnceLock<Option<String>> = OnceLock::new();
    SYSTEM_ID
        .get_or_init(|| {
            let hwid = raw_system_id().ok()?;
            let mut hasher = Sha256::new();
            hasher.update(hwid);
            Some(hex::encode(hasher.finalize()))
        })
        .as_deref()
}

pub fn get_platform() -> &'static str {
    if let Some(over_ride) = option_env!("Q_OVERRIDE_PLATFORM") {
        over_ride
    } else {
        std::env::consts::OS
    }
}

pub fn get_arch() -> &'static str {
    if let Some(over_ride) = option_env!("Q_OVERRIDE_ARCH") {
        over_ride
    } else {
        std::env::consts::ARCH
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_system_id() {
        let id = get_system_id();
        assert!(id.is_some());
        assert_eq!(id.unwrap().len(), 64);
    }
}
