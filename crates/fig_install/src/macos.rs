use std::path::{Path, PathBuf};

use fig_util::consts::macos::BUNDLE_CONTENTS_MACOS_PATH;
use fig_util::consts::{APP_BUNDLE_ID, APP_PROCESS_NAME};
use fig_util::directories;
use tokio::fs;
use tracing::warn;

use crate::Error;

#[allow(unused_variables)]
pub(crate) async fn uninstall_desktop(ctx: &fig_os_shim::Context) -> Result<(), Error> {
    let app_path = fig_util::app_bundle_path();

    // The login item belongs to the app bundle (SMAppService.mainAppService), so only the app's
    // own binary can unregister it, and it has to happen before the bundle is removed. This also
    // removes the LaunchAgent that older versions used.
    let app_binary = app_path.join(BUNDLE_CONTENTS_MACOS_PATH).join(APP_PROCESS_NAME);
    if app_binary.exists() {
        run("unregister the login item", &app_binary, &["--unregister-login-item"]).await;
    }

    // Quit the app first, so it cannot write its caches back while they are being removed
    run("quit the app", Path::new("killall"), &[APP_PROCESS_NAME]).await;

    // Preferences of the app and its input method, under the current and earlier identifiers
    for domain in PREFERENCE_DOMAINS {
        run("delete defaults", Path::new("defaults"), &["delete", domain]).await;
    }

    // Drop the Accessibility grant so System Settings does not keep an entry for a removed app
    run(
        "reset the Accessibility permission",
        Path::new("tccutil"),
        &["reset", "Accessibility", APP_BUNDLE_ID],
    )
    .await;

    // Data dir, logs (in the per-user temp dir) and IPC sockets
    let dirs = [
        directories::fig_data_dir(),
        directories::logs_dir(),
        directories::sockets_dir(),
    ];
    for dir in dirs.into_iter().flatten() {
        remove_path(&dir).await;
    }

    if let Ok(home) = directories::home_dir() {
        for path in home_paths(&home) {
            remove_path(&path).await;
        }
    }
    remove_path(Path::new("/tmp/ecrun")).await;

    // WebKit and the app keep caches in the per-user cache and temp dirs
    for key in ["DARWIN_USER_CACHE_DIR", "DARWIN_USER_TEMP_DIR"] {
        if let Some(dir) = getconf(key).await {
            for path in webkit_leftovers(&dir).await {
                remove_path(&path).await;
            }
        }
    }

    // A Homebrew cask install is removed through brew, so the cask record goes with the app and
    // `brew upgrade` cannot bring it back. Whatever brew leaves (or any other install) is deleted.
    if let Some(brew) = homebrew_cask_brew() {
        uninstall_cask(&brew).await;
    }
    remove_path(&app_path).await;

    Ok(())
}

/// Full name of the Homebrew cask.
const HOMEBREW_CASK: &str = "chen86860/tap/easy-complete";

/// The `brew` executable of the Homebrew prefix that has the cask installed, if any.
fn homebrew_cask_brew() -> Option<PathBuf> {
    let mut prefixes = vec![PathBuf::from("/opt/homebrew"), "/usr/local".into()];
    if let Some(prefix) = std::env::var_os("HOMEBREW_PREFIX") {
        prefixes.insert(0, prefix.into());
    }
    find_cask_brew(prefixes)
}

/// Both checks belong to the same candidate, so a stale prefix cannot hide a later valid one.
fn find_cask_brew(prefixes: Vec<PathBuf>) -> Option<PathBuf> {
    prefixes
        .into_iter()
        .filter(|prefix| prefix.join("Caskroom/easy-complete").is_dir())
        .map(|prefix| prefix.join("bin/brew"))
        .find(|brew| brew.exists())
}

async fn uninstall_cask(brew: &Path) {
    let result = tokio::process::Command::new(brew)
        .args(["uninstall", "--zap", "--cask", HOMEBREW_CASK])
        .output()
        .await;
    match result {
        Ok(output) if output.status.success() => {},
        Ok(output) => warn!(
            "`brew uninstall --zap --cask {HOMEBREW_CASK}` failed ({}): {}",
            output.status,
            String::from_utf8_lossy(&output.stderr).trim()
        ),
        Err(err) => warn!("Failed to run {brew:?}: {err}"),
    }
}

async fn run(action: &str, program: &Path, args: &[&str]) {
    match tokio::process::Command::new(program).args(args).output().await {
        Ok(output) if !output.status.success() => {
            tracing::debug!(status = %output.status, "Unable to {action}");
        },
        Ok(_) => {},
        Err(err) => warn!("Failed to {action}: {err}"),
    }
}

/// Identifiers the app and its WebViews store data under: the bundle id and the executable name
/// (used by WebKit and tao), for this release and for those before the rename.
const APP_IDS: [&str; 4] = [
    APP_BUNDLE_ID,
    "easy-complete",
    "dev.emmmm.autocomplete-v5",
    "autocomplete-v5",
];

const PREFERENCE_DOMAINS: [&str; 6] = [
    APP_BUNDLE_ID,
    "dev.emmmm.easy-complete.inputmethod",
    "easy-complete",
    "dev.emmmm.autocomplete-v5",
    "dev.emmmm.autocomplete-v5.inputmethod",
    "autocomplete-v5",
];

/// Files under the home directory. Most are removed by earlier steps already (integrations,
/// login item, input method); listing them again covers a step that failed or was skipped.
fn home_paths(home: &Path) -> Vec<PathBuf> {
    let library = home.join("Library");
    let mut paths = vec![
        library.join(format!("LaunchAgents/{APP_BUNDLE_ID}.plist")),
        library.join("Input Methods/EasyCompleteInputMethod.app"),
        library.join(format!("Saved Application State/{APP_BUNDLE_ID}.savedState")),
        home.join(".local/share/easy-complete"),
    ];
    // `defaults delete` fails on a domain with no keys and leaves its empty plist behind
    for domain in PREFERENCE_DOMAINS {
        paths.push(library.join(format!("Preferences/{domain}.plist")));
    }
    for binary in ["ec", "ecterm", "ec-chat"] {
        paths.push(home.join(".local/bin").join(binary));
    }
    for id in APP_IDS {
        paths.push(library.join("Caches").join(id));
        paths.push(library.join("WebKit").join(id));
        paths.push(library.join("HTTPStorages").join(id));
        paths.push(library.join("HTTPStorages").join(format!("{id}.binarycookies")));
    }
    paths
}

/// Entries of a per-user cache or temp dir that belong to the app: its own directory and those
/// of the WebKit processes it ran (`com.apple.WebKit.<process>+<id>`). Development builds run
/// unbundled, so WebKit names them after the executable plus a hash (`easy_complete-<hash>`).
async fn webkit_leftovers(dir: &Path) -> Vec<PathBuf> {
    let mut found = vec![];
    let Ok(mut entries) = fs::read_dir(dir).await else {
        return found;
    };
    while let Ok(Some(entry)) = entries.next_entry().await {
        let name = entry.file_name();
        let Some(name) = name.to_str() else { continue };
        let owner = match name.strip_prefix("com.apple.WebKit.") {
            Some(rest) => rest.split_once('+').map_or("", |(_, owner)| owner),
            None => name,
        };
        if APP_IDS.contains(&owner) || owner.starts_with("easy_complete-") {
            found.push(entry.path());
        }
    }
    found
}

async fn getconf(key: &str) -> Option<PathBuf> {
    let output = tokio::process::Command::new("getconf").arg(key).output().await.ok()?;
    let dir = String::from_utf8(output.stdout).ok()?;
    let dir = dir.trim();
    // An absolute path only, so a failed lookup can never resolve against the working directory
    (output.status.success() && dir.starts_with('/')).then(|| PathBuf::from(dir))
}

async fn remove_path(path: &Path) {
    let result = match fs::symlink_metadata(path).await {
        Ok(metadata) if metadata.is_dir() => fs::remove_dir_all(path).await,
        Ok(_) => fs::remove_file(path).await,
        Err(err) => Err(err),
    };
    match result {
        Ok(()) => {},
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {},
        Err(err) => warn!("Failed to remove {path:?}: {err}"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn webkit_leftovers_match_only_the_app() {
        let dir = tempfile::tempdir().unwrap();
        let names = [
            "dev.emmmm.easy-complete",
            "com.apple.WebKit.GPU+dev.emmmm.easy-complete",
            "com.apple.WebKit.Networking+easy_complete-bb8a9ea68e47457e",
            "com.apple.WebKit.WebContent+dev.emmmm.autocomplete-v5",
            "autocomplete-v5",
            // Other apps of the same developer, and other WebKit hosts
            "dev.emmmm.Dropline",
            "dev.emmmm.easy-complete-helper",
            "com.apple.WebKit.GPU+dev.emmmm.Dropline",
            "com.apple.WebKit.GPU+com.apple.Safari",
        ];
        for name in names {
            std::fs::create_dir(dir.path().join(name)).unwrap();
        }

        let mut found: Vec<String> = webkit_leftovers(dir.path())
            .await
            .iter()
            .map(|path| path.file_name().unwrap().to_string_lossy().into_owned())
            .collect();
        found.sort();
        assert_eq!(
            found,
            [
                "autocomplete-v5",
                "com.apple.WebKit.GPU+dev.emmmm.easy-complete",
                "com.apple.WebKit.Networking+easy_complete-bb8a9ea68e47457e",
                "com.apple.WebKit.WebContent+dev.emmmm.autocomplete-v5",
                "dev.emmmm.easy-complete",
            ]
        );
    }

    #[test]
    fn find_cask_brew_skips_a_prefix_without_brew() {
        let dir = tempfile::tempdir().unwrap();
        let stale = dir.path().join("stale");
        let valid = dir.path().join("valid");
        let other = dir.path().join("other");
        std::fs::create_dir_all(stale.join("Caskroom/easy-complete")).unwrap();
        std::fs::create_dir_all(valid.join("Caskroom/easy-complete")).unwrap();
        std::fs::create_dir_all(valid.join("bin")).unwrap();
        std::fs::write(valid.join("bin/brew"), "").unwrap();
        // brew without the cask
        std::fs::create_dir_all(other.join("bin")).unwrap();
        std::fs::write(other.join("bin/brew"), "").unwrap();

        assert_eq!(
            find_cask_brew(vec![other.clone(), stale.clone(), valid.clone()]),
            Some(valid.join("bin/brew"))
        );
        assert_eq!(find_cask_brew(vec![other, stale]), None);
    }

    #[tokio::test]
    async fn remove_path_handles_files_dirs_and_symlinks() {
        let dir = tempfile::tempdir().unwrap();
        let target = dir.path().join("target");
        std::fs::create_dir_all(target.join("nested")).unwrap();
        let file = dir.path().join("file.plist");
        std::fs::write(&file, "x").unwrap();
        let link = dir.path().join("link.app");
        std::os::unix::fs::symlink(&target, &link).unwrap();

        remove_path(&link).await;
        // Removing a symlink must not delete what it points to
        assert!(target.join("nested").exists());
        remove_path(&file).await;
        remove_path(&target).await;
        remove_path(&dir.path().join("missing")).await;

        assert!(!link.exists() && !file.exists() && !target.exists());
    }
}
