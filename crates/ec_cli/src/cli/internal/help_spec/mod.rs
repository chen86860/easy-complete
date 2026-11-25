//! `ec internal help-spec <command> [subcommand…]`: a completion spec for a command that has
//! none, read from its `--help`. The autocomplete overlay calls it when no spec is found.
//!
//! Running a program the user hasn't asked to run must be safe, so `--help` only runs for
//! compiled executables and python / node / ruby scripts, whose argument parsers answer
//! `--help` before doing anything. Shell scripts and anything else may ignore it and just run.
//! A pnpm global command is an `sh` shim; its target is run instead, under the same rules.
//! macOS's own tools (`/usr/bin`, `/bin`…) are skipped too: they have no `--help`, and some
//! (`yes`, `say`) treat it as input. The program gets no stdin and is killed after a timeout.
//!
//! The parsed spec, or the lack of one, is cached per executable version (path, size and
//! modification time), so `--help` runs once. Cache files are named after the command
//! (`gh-pr-<hash>.json`), and a new version's file replaces the old one.

mod parse;

use std::ffi::OsStr;
use std::fs::{self, File};
use std::hash::Hasher;
use std::io::{Read, Write, stdout};
use std::os::unix::fs::PermissionsExt;
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, ExitCode, Stdio};
use std::thread;
use std::time::{Duration, Instant, UNIX_EPOCH};

use clap::Args;
use eyre::Result;
use fig_util::directories;
use tracing::debug;

/// Bump when the parser changes, so cached specs are read again.
const PARSER_VERSION: u32 = 2;
/// Subcommands read below the command (`cmd a b c`).
const MAX_DEPTH: usize = 3;
const TIMEOUT: Duration = Duration::from_secs(2);
/// More output than any help text: a program printing this much isn't printing help.
const MAX_OUTPUT: usize = 512 * 1024;

/// Folders of the system's own tools, never run.
const SYSTEM_DIRS: &[&str] = &[
    "/bin/",
    "/sbin/",
    "/usr/bin/",
    "/usr/sbin/",
    "/usr/libexec/",
    "/System/",
];

#[derive(Debug, Args, PartialEq, Eq)]
pub struct HelpSpecArgs {
    /// The command, as typed (no path)
    command: String,
    /// Subcommands to read the help of (`ec internal help-spec gh pr`)
    subcommands: Vec<String>,
}

impl HelpSpecArgs {
    pub fn execute(self) -> Result<ExitCode> {
        let spec = self.spec();
        let json = match spec {
            Some(spec) => serde_json::to_string(&spec)?,
            None => "null".to_owned(),
        };
        writeln!(stdout(), "{json}")?;
        Ok(ExitCode::SUCCESS)
    }

    fn spec(&self) -> Option<serde_json::Value> {
        if !is_word(&self.command) || self.subcommands.len() > MAX_DEPTH || !self.subcommands.iter().all(|s| is_word(s))
        {
            return None;
        }
        let path = resolve(&self.command, std::env::var_os("PATH").as_deref())?;
        let mut executable = Executable::inspect(&path)?;
        // A pnpm shim runs its target, which is judged and run in its place.
        if let Some(target) = cmd_shim_target(&executable)
            && let Some(target) = Executable::inspect(&target)
        {
            executable = target;
        }
        if !executable.is_safe() {
            debug!(?path, "not running --help: not a known-safe executable");
            return None;
        }

        let mut words = vec![self.command.as_str()];
        words.extend(self.subcommands.iter().map(String::as_str));
        let label = words.join("-");
        let file_name = format!("{label}-{:016x}.json", executable.cache_key(&self.subcommands));
        let cache_dir = directories::cache_dir().ok().map(|dir| dir.join("help-specs"));
        if let Some(cached) = cache_dir
            .as_deref()
            .and_then(|dir| fs::read_to_string(dir.join(&file_name)).ok())
            && let Ok(value) = serde_json::from_str(&cached)
        {
            return value;
        }

        let spec = run_help(&executable.path, &self.subcommands).and_then(|text| {
            let spec = parse::parse(&words, &text);
            (!spec.is_empty()).then(|| serde_json::to_value(spec).ok()).flatten()
        });

        if let Some(dir) = cache_dir {
            let value = spec.clone().unwrap_or(serde_json::Value::Null);
            let _ = fs::create_dir_all(&dir);
            remove_stale(&dir, &label, &file_name);
            let _ = fs::write(dir.join(&file_name), value.to_string());
        }
        spec
    }
}

/// Removes the cached specs of `label` (`gh-pr`) other than `keep`, read from an earlier
/// version of the program or parser, and those named by the hash alone (before 2.10.0-beta.6).
fn remove_stale(dir: &Path, label: &str, keep: &str) {
    let Ok(entries) = fs::read_dir(dir) else { return };
    for entry in entries.flatten() {
        let name = entry.file_name();
        let Some(name) = name.to_str() else { continue };
        if name == keep {
            continue;
        }
        let Some(stem) = name.strip_suffix(".json") else {
            continue;
        };
        let is_hash = |s: &str| s.len() == 16 && s.bytes().all(|b| b.is_ascii_hexdigit());
        let stale = match stem.rsplit_once('-') {
            Some((l, hash)) => l == label && is_hash(hash),
            None => is_hash(stem),
        };
        if stale {
            let _ = fs::remove_file(entry.path());
        }
    }
}

/// A command or subcommand name: no path, no option, nothing the shell would read.
fn is_word(word: &str) -> bool {
    !word.is_empty()
        && word.len() <= 64
        && word.starts_with(|c: char| c.is_ascii_alphanumeric() || c == '_')
        && word.chars().all(|c| c.is_ascii_alphanumeric() || "-_.:+@".contains(c))
}

/// The first executable file named `command` on `path`.
fn resolve(command: &str, path: Option<&OsStr>) -> Option<PathBuf> {
    std::env::split_paths(path?)
        .filter(|dir| dir.is_absolute())
        .map(|dir| dir.join(command))
        .find(|candidate| {
            fs::metadata(candidate).is_ok_and(|meta| meta.is_file() && meta.permissions().mode() & 0o111 != 0)
        })
}

struct Executable {
    /// The real file, symlinks resolved.
    path: PathBuf,
    len: u64,
    modified: u128,
    head: Vec<u8>,
}

impl Executable {
    fn inspect(path: &Path) -> Option<Self> {
        let path = fs::canonicalize(path).ok()?;
        let meta = fs::metadata(&path).ok()?;
        let modified = meta.modified().ok()?.duration_since(UNIX_EPOCH).ok()?.as_nanos();
        let mut head = Vec::with_capacity(256);
        File::open(&path).ok()?.take(256).read_to_end(&mut head).ok()?;
        Some(Self {
            path,
            len: meta.len(),
            modified,
            head,
        })
    }

    fn is_safe(&self) -> bool {
        let path = self.path.to_string_lossy();
        if SYSTEM_DIRS.iter().any(|dir| path.starts_with(dir)) {
            return false;
        }
        is_binary(&self.head) || is_safe_script(&self.head)
    }

    /// FNV-1a: stable across builds, unlike `DefaultHasher`.
    fn cache_key(&self, subcommands: &[String]) -> u64 {
        let mut hasher = Fnv(0xcbf2_9ce4_8422_2325);
        hasher.write(self.path.as_os_str().as_encoded_bytes());
        hasher.write_u64(self.len);
        hasher.write_u128(self.modified);
        hasher.write_u32(PARSER_VERSION);
        for sub in subcommands {
            hasher.write_u8(0);
            hasher.write(sub.as_bytes());
        }
        hasher.finish()
    }
}

struct Fnv(u64);

impl Hasher for Fnv {
    fn finish(&self) -> u64 {
        self.0
    }

    fn write(&mut self, bytes: &[u8]) {
        for byte in bytes {
            self.0 ^= u64::from(*byte);
            self.0 = self.0.wrapping_mul(0x0100_0000_01b3);
        }
    }
}

/// Mach-O (thin or universal) or ELF.
fn is_binary(head: &[u8]) -> bool {
    const MAGICS: &[[u8; 4]] = &[
        [0xfe, 0xed, 0xfa, 0xce],
        [0xce, 0xfa, 0xed, 0xfe],
        [0xfe, 0xed, 0xfa, 0xcf],
        [0xcf, 0xfa, 0xed, 0xfe],
        [0xca, 0xfe, 0xba, 0xbe],
        [0xca, 0xfe, 0xba, 0xbf],
        [0x7f, b'E', b'L', b'F'],
    ];
    head.len() >= 4 && MAGICS.iter().any(|magic| head[..4] == *magic)
}

/// A script whose shebang names python, node or ruby, directly or through `env`.
fn is_safe_script(head: &[u8]) -> bool {
    let Some(rest) = head.strip_prefix(b"#!") else {
        return false;
    };
    let line = rest.split(|b| *b == b'\n').next().unwrap_or_default();
    let Ok(line) = std::str::from_utf8(line) else {
        return false;
    };
    let mut words = line.split_whitespace();
    let Some(first) = words.next() else { return false };
    let mut interpreter = basename(first);
    if interpreter == "env" {
        // `#!/usr/bin/env -S node --flag`
        interpreter = match words.find(|w| !w.starts_with('-') && !w.contains('=')) {
            Some(word) => basename(word),
            None => return false,
        };
    }
    let name = interpreter.trim_end_matches(|c: char| c.is_ascii_digit() || c == '.');
    matches!(name, "python" | "node" | "ruby")
}

/// The program a pnpm shim runs. pnpm puts its global commands in `PNPM_HOME` as `sh` scripts
/// (cmd-shim) that end with `# cmd-shim-target=<path>`, absolute or relative to the shim.
fn cmd_shim_target(shim: &Executable) -> Option<PathBuf> {
    const MAX_SHIM: u64 = 64 * 1024;
    if !shim.head.starts_with(b"#!/bin/sh") || shim.len > MAX_SHIM {
        return None;
    }
    let text = fs::read_to_string(&shim.path).ok()?;
    let target = text
        .lines()
        .rev()
        .find(|line| !line.trim().is_empty())?
        .strip_prefix("# cmd-shim-target=")?
        .trim();
    if target.is_empty() {
        return None;
    }
    Some(shim.path.parent()?.join(target))
}

fn basename(path: &str) -> &str {
    path.rsplit('/').next().unwrap_or(path)
}

/// Runs `path [subcommands] --help` and returns what it printed: stdout, or stderr when
/// stdout is empty (some programs print their help there).
fn run_help(path: &Path, subcommands: &[String]) -> Option<String> {
    let mut child = Command::new(path)
        .args(subcommands)
        .arg("--help")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("NO_COLOR", "1")
        .env("TERM", "dumb")
        .env("PAGER", "cat")
        .env("GIT_PAGER", "cat")
        .env("MANPAGER", "cat")
        .env_remove("CLICOLOR_FORCE")
        .env_remove("FORCE_COLOR")
        // Its own process group, so whatever it starts is killed with it.
        .process_group(0)
        .spawn()
        .ok()?;

    let stdout = child.stdout.take().map(read_capped);
    let stderr = child.stderr.take().map(read_capped);
    let finished = wait(&mut child, TIMEOUT);
    if !finished {
        kill(&child);
        let _ = child.wait();
    }
    let stdout = stdout.and_then(|t| t.join().ok()).unwrap_or_default();
    let stderr = stderr.and_then(|t| t.join().ok()).unwrap_or_default();
    if !finished {
        debug!(?path, "--help timed out");
        return None;
    }
    let output = if stdout.trim_ascii().is_empty() { stderr } else { stdout };
    if output.len() >= MAX_OUTPUT {
        return None;
    }
    Some(String::from_utf8_lossy(&output).into_owned())
}

fn read_capped(mut pipe: impl Read + Send + 'static) -> thread::JoinHandle<Vec<u8>> {
    thread::spawn(move || {
        let mut out = Vec::new();
        let mut buf = [0; 8192];
        loop {
            match pipe.read(&mut buf) {
                Ok(0) | Err(_) => break,
                // Keep reading past the cap, so the program never blocks on a full pipe.
                Ok(n) if out.len() < MAX_OUTPUT => out.extend_from_slice(&buf[..n]),
                Ok(_) => {},
            }
        }
        out
    })
}

/// Waits up to `timeout` for the child; false if it's still running.
fn wait(child: &mut Child, timeout: Duration) -> bool {
    let deadline = Instant::now() + timeout;
    loop {
        match child.try_wait() {
            Ok(Some(_)) | Err(_) => return true,
            Ok(None) if Instant::now() >= deadline => return false,
            Ok(None) => thread::sleep(Duration::from_millis(10)),
        }
    }
}

fn kill(child: &Child) {
    use nix::sys::signal::{Signal, killpg};
    use nix::unistd::Pid;
    if let Ok(pid) = i32::try_from(child.id()) {
        let _ = killpg(Pid::from_raw(pid), Signal::SIGKILL);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn words() {
        assert!(is_word("gh"));
        assert!(is_word("update-branch"));
        assert!(!is_word("-rf"));
        assert!(!is_word("../x"));
        assert!(!is_word("a b"));
        assert!(!is_word("$(x)"));
        assert!(!is_word(""));
    }

    #[test]
    fn stale_cache() {
        let dir = tempfile::tempdir().unwrap();
        let names = [
            "dlv-0123456789abcdef.json",
            "dlv-fedcba9876543210.json",
            "dlv-debug-0123456789abcdef.json",
            "fastboot-0123456789abcdef.json",
            "7c97d6a6d45e1de3.json",
            "notes.txt",
        ];
        for name in names {
            fs::write(dir.path().join(name), "null").unwrap();
        }
        remove_stale(dir.path(), "dlv", "dlv-fedcba9876543210.json");
        let mut left: Vec<String> = fs::read_dir(dir.path())
            .unwrap()
            .map(|e| e.unwrap().file_name().into_string().unwrap())
            .collect();
        left.sort();
        assert_eq!(
            left,
            [
                "dlv-debug-0123456789abcdef.json",
                "dlv-fedcba9876543210.json",
                "fastboot-0123456789abcdef.json",
                "notes.txt",
            ]
        );
    }

    #[test]
    fn pnpm_shims() {
        let dir = tempfile::tempdir().unwrap();
        let dir = fs::canonicalize(dir.path()).unwrap();
        let target = dir.join("global/node_modules/tool/cli.mjs");
        fs::create_dir_all(target.parent().unwrap()).unwrap();
        fs::write(&target, "#!/usr/bin/env node\n").unwrap();
        let shim = |name: &str, body: &str| {
            let path = dir.join(name);
            fs::write(&path, body).unwrap();
            Executable::inspect(&path).unwrap()
        };

        let body = format!(
            "#!/bin/sh\nexec node \"$basedir/x\" \"$@\"\n# cmd-shim-target={}\n",
            target.display()
        );
        assert_eq!(cmd_shim_target(&shim("absolute", &body)), Some(target.clone()));

        let relative = shim(
            "relative",
            "#!/bin/sh\nexec node x\n# cmd-shim-target=global/node_modules/tool/cli.mjs\n",
        );
        let resolved = cmd_shim_target(&relative).unwrap();
        assert_eq!(fs::canonicalize(resolved).unwrap(), target);

        // pnpm's own `pn` launcher: no marker. Markers only count on the last line of an sh script.
        assert_eq!(cmd_shim_target(&shim("pn", "#!/bin/sh\nexec pnpm \"$@\"\n")), None);
        let not_last = format!("#!/bin/sh\n# cmd-shim-target={}\nrm -rf x\n", target.display());
        assert_eq!(cmd_shim_target(&shim("not-last", &not_last)), None);
        let bash = format!("#!/bin/bash\n# cmd-shim-target={}\n", target.display());
        assert_eq!(cmd_shim_target(&shim("bash", &bash)), None);

        // The shim itself is never safe to run; its target is judged on its own.
        assert!(!shim("absolute", &body).is_safe());
        assert!(Executable::inspect(&target).unwrap().is_safe());
    }

    #[test]
    fn shebangs() {
        assert!(is_safe_script(b"#!/usr/bin/env node\nconsole.log()"));
        assert!(is_safe_script(b"#!/usr/bin/env python3\n"));
        assert!(is_safe_script(b"#!/opt/homebrew/opt/python@3.12/bin/python3.12\n"));
        assert!(is_safe_script(b"#!/usr/bin/env -S node --no-warnings\n"));
        assert!(is_safe_script(b"#!/usr/bin/ruby\n"));
        assert!(!is_safe_script(b"#!/bin/sh\n"));
        assert!(!is_safe_script(b"#!/usr/bin/env bash\n"));
        assert!(!is_safe_script(b"#!/usr/bin/env FOO=1\n"));
        assert!(!is_safe_script(b"echo hi\n"));
        assert!(!is_safe_script(b"#!/usr/bin/env nodemon\n"));
    }

    #[test]
    fn binaries() {
        assert!(is_binary(&[0xcf, 0xfa, 0xed, 0xfe, 0, 0]));
        assert!(is_binary(&[0xca, 0xfe, 0xba, 0xbe]));
        assert!(!is_binary(b"#!/b"));
        assert!(!is_binary(&[0xcf]));
    }

    #[test]
    fn system_tools_are_not_run() {
        let ls = Executable::inspect(Path::new("/bin/ls")).unwrap();
        assert!(is_binary(&ls.head));
        assert!(!ls.is_safe());
    }

    fn script(dir: &Path, name: &str, body: &str) -> PathBuf {
        let path = dir.join(name);
        fs::write(&path, body).unwrap();
        fs::set_permissions(&path, fs::Permissions::from_mode(0o755)).unwrap();
        path
    }

    #[test]
    fn resolves_on_path() {
        let dir = tempfile::tempdir().unwrap();
        script(dir.path(), "tool", "#!/bin/sh\n");
        fs::write(dir.path().join("plain"), "").unwrap();
        let path = std::env::join_paths([Path::new("relative"), dir.path()]).unwrap();
        assert_eq!(resolve("tool", Some(&path)), Some(dir.path().join("tool")));
        assert_eq!(resolve("plain", Some(&path)), None);
        assert_eq!(resolve("missing", Some(&path)), None);
    }

    #[test]
    fn runs_help_and_falls_back_to_stderr() {
        let dir = tempfile::tempdir().unwrap();
        let out = script(dir.path(), "out", "#!/bin/sh\necho \"usage: $1 $2\"\n");
        assert_eq!(run_help(&out, &["sub".into()]).as_deref(), Some("usage: sub --help\n"));
        let err = script(dir.path(), "err", "#!/bin/sh\necho usage >&2\nexit 2\n");
        assert_eq!(run_help(&err, &[]).as_deref(), Some("usage\n"));
    }

    #[test]
    fn kills_a_program_that_hangs() {
        let dir = tempfile::tempdir().unwrap();
        let hang = script(dir.path(), "hang", "#!/bin/sh\nsleep 30 &\nwait\n");
        let start = Instant::now();
        assert_eq!(run_help(&hang, &[]), None);
        assert!(start.elapsed() < Duration::from_secs(5));
    }

    #[test]
    fn rejects_endless_output() {
        let dir = tempfile::tempdir().unwrap();
        let yes = script(dir.path(), "yes", "#!/bin/sh\nexec /usr/bin/yes\n");
        assert_eq!(run_help(&yes, &[]), None);
    }
}
