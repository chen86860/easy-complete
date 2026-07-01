# Changelog

## v2.0.38

- perf: excluded the `az` (Azure CLI) namespace from bundled completion specs alongside the existing `aws` exclusion, shrinking `bundle/specs` from ~40MB to ~31MB (most users never touch either cloud CLI)
- docs: split the changelog into an English `CHANGELOG.md` and a Chinese `CHANGELOG.zh-CN.md`, matching the existing `README.md` / `README.zh-CN.md` convention; `scripts/bump-version.sh` and `CLAUDE.md` now remind you to add an entry to both files on every release

## v2.0.37

- feat: updated bundled completion specs to `@chen86860/autocomplete-specs@3.0.5`, adding built-in specs for `bash`, `corepack`, `pbcopy`, `sha256sum`, `sleep`, `xattr`, and refreshing standard-library specs such as `brew`, `bun`, `copilot`, `gh`

## v2.0.36

- feat: updated bundled completion specs to `@chen86860/autocomplete-specs@3.0.4`, refreshing `claude`, `dynamic`, `gemini`, `pnpm` specs

## v2.0.35

- perf: added a `dist` release build profile (thin LTO + `codegen-units=1` + `strip` + `panic=abort`), substantially shrinking distributed binaries (e.g. `ec` 18.9MB → 8.6MB) without slowing down local `cargo run --release` iteration
- perf: removed dead code / debug-only polyfills from the autocomplete overlay's main bundle (`@juggle/resize-observer`, `util`, `deep-object-diff` are now dynamically loaded on demand or inlined), shrinking the main chunk from 632KB to 545KB
- ci: added a smoke build for the `dist` profile to surface release-build-specific issues (`panic=abort`/LTO/strip) earlier

## v2.0.34

- feat: bundled completion specs now sync from the npm package `@chen86860/autocomplete-specs`, replacing the old GitHub release zip update flow
- feat: updated bundled completion specs to `@chen86860/autocomplete-specs@3.0.3`, continuing to derive `index.json` from the actual file tree to preserve diff-versioned specs such as `dynamic`

## v2.0.33

- feat: updated bundled completion specs to the `spec-build-number-0.4.0` release of `chen86860/autocomplete-specs`, refreshing standard-library specs such as `claude`, `codex`, `gemini`, `dynamic`

## v2.0.32

- feat: updated bundled completion specs to the `spec-build-number-0.3.0` release of `chen86860/autocomplete-specs`, adding standard-library specs such as `claude`, `codex`, `gemini`, `uvx`
- fix: added a fallback for named Fig icons in the command palette that aren't covered by bundled resources, fixing blank document icons for suggestions like `pnpm dev` package.json scripts

## v2.0.31

- fix: fixed named `fig://icon?...` icons in the command palette being incorrectly rewritten into invalid static asset paths, which left some commands with a blank placeholder instead of an icon
- test: added regression tests for command palette icon URL conversion to ensure named Fig icons and external URLs are no longer mishandled

## v2.0.30

- fix: the release appcast now generates up to 8 deltas by default and pulls the 8 most recent stable releases as Sparkle archive input, covering more upgrade paths from older versions to the latest
- fix: kept appcast delta URLs consistent with GitHub release asset filenames, preventing Sparkle from falling back to the full DMG due to delta 404s

## v2.0.29

- fix: the dashboard now explicitly activates the macOS app when opened from the menu bar or a second launch, avoiding an occasional issue where "show desktop" was triggered and pushed the window into a corner

## v2.0.28

- feat: Fuzzy Matching in settings now defaults to on; both the settings page and the autocomplete runtime default to fuzzy search enabled when the user hasn't written a value to config
- chore: added a shared default-settings entry point to prevent the settings page's displayed state from diverging from actual autocomplete behavior

## v2.0.27

- feat: shipped the repo cleanup and CI quality gate as a stable release, including removal of a duplicate autocomplete package, Easy Complete branding/release metadata cleanup, and PR CI gate plus Rust/JS test fixes
- fix: the release workflow now applies stricter SemVer prerelease detection for `alpha` / `beta` / `rc` tags, preventing prerelease versions from leaking into the stable Sparkle appcast

## v2.0.27-beta.1

- prerelease: shipped the large-scale repo cleanup and CI quality gate on a beta tag first, to avoid pushing it directly into stable users' Sparkle latest update channel
- chore: removed the duplicate autocomplete package, standardizing on `packages/autocomplete-app`
- chore: cleaned up leftover upstream branding in the Easy Complete fork's package metadata, release copy, product paths, and test snapshots
- ci: added PR/main-branch quality gates covering JS build/lint/test, website build, and Rust fmt/clippy/test

## v2.0.26

- feat: the Sparkle release pipeline now supports delta updates: release CI keeps the stable DMG download entry point while also generating a versioned Sparkle full-update DMG, pulling recent historical releases as archive input, and uploading `appcast.xml` plus `.delta` update packages
- docs: updated the Sparkle release documentation with delta update CI behavior, local generation commands, and the release assets that need to be uploaded

## v2.0.25

- feat: updated bundled completion specs to the `spec-build-number-0.2.0` release of `chen86860/autocomplete-specs`, and regenerated the bundled `bundle/specs`

## v2.0.24

- feat: added `info!`-level logging to the auto-update path (scheduled-check arming, Sparkle framework loading, updater ready and disabling auto-download, manual/background check triggers, activating the app before the scheduled update prompt) — previously everything was logged only at `debug!` while `fig_log` defaulted to ERROR, leaving no logs to diagnose with; the full auto-update timeline can now be observed with `Q_LOG_LEVEL=info`
- fix: changed the tray's "update unavailable" message from the misleading *"Sparkle.framework is not bundled in this build"* to an accurate description (the updater failed to start: framework missing or initialization failed, see logs for detail)

## v2.0.23

- fix: found the real root cause of auto-update still "not working" — when a background check found a new version, Sparkle's `automaticallyDownloadsUpdates` (leftover `SUAutomaticallyUpdate` default of YES) triggered a **silent download and install**, but this app is ad-hoc signed with `SUEnableInstallerLauncherService` disabled, so the privileged install could never complete — resulting in neither a prompt nor a successful install (only manual checks could prompt). Now `setAutomaticallyDownloadsUpdates: NO` is explicitly set after creating the updater, forcing background checks to show a prompt, and the dirty default is self-healed by rewriting it on every launch
- fix: added `ECSparkleUserDriverDelegate` (`SPUStandardUserDriverDelegate`) so that scheduled-check prompts for the `LSUIElement` menu-bar agent appear immediately in front, instead of being deferred by Sparkle's gentle-reminder behavior — `standardUserDriverShouldHandleShowingScheduledUpdate…` returns `YES`, and `willHandleShowingUpdate` calls `activateIgnoringOtherApps:`

## v2.0.22

- feat: completion specs are now fetched from Releases on the self-maintained fork [`chen86860/autocomplete-specs`](https://github.com/chen86860/autocomplete-specs) (its CI compiles `src/*.ts` and publishes `specs.zip`); `sync-bundled-specs.mjs` downloads the zip and derives `index.json` from the file tree itself; the old per-file CDN sync is kept as a fallback
- feat: the spec source is now **pinned to a fixed release tag** (`SPECS_TAG`, defaulting to `spec-build-number-0.1.0`) rather than `latest`, so builds are reproducible and never change silently; overridable via `BUNDLED_SPECS_TAG` / `BUNDLED_SPECS_RELEASE_ZIP`
- docs: updated the Bundled Specs section in CLAUDE.md to describe the new source and version-pinning mechanism

## v2.0.21

- perf: trimmed the bundled completion specs — `sync-bundled-specs.mjs` added `BUNDLED_SPECS_EXCLUDE` (defaulting to excluding `aws`), filtering both the on-disk files and `index.json`; bundle size dropped from ~76 MB to ~40 MB (AWS CLI specs are ~36 MB / 419 entries and most users never trigger them)
- feat: the bundled `Info.plist` now includes `LSApplicationCategoryType` (app category) and `NSHumanReadableCopyright` (copyright notice), with the copyright year auto-generated and overridable via the `COPYRIGHT` environment variable
- chore: regenerated `icon.icns`, `AppIcon.iconset`, and per-size icon PNGs from the source `icon.png` so all three stay in sync
- chore: removed `bundle/dmg/VolumeIcon.icns`, which wasn't referenced by any build script
- docs: added a "Bundled Specs" section to CLAUDE.md describing the specs build/exclusion mechanism and the no-network-fallback runtime behavior

## v2.0.20

- fix: fixed auto-update "not detecting automatically" — as an `LSUIElement` background agent, the app couldn't show Sparkle's first-run authorization dialog, which silently disabled scheduled checks; the updater now explicitly sets `setAutomaticallyChecksForUpdates: YES` after creation, and the bundled `Info.plist` declares `SUEnableAutomaticChecks` and `SUScheduledCheckInterval` (1 day)
- feat: added a Troubleshooting card to the settings panel's About page, guiding users to run `ec doctor` in the terminal for diagnostics (the command can be copied with one click)

## v2.0.19

- feat: added the `fig_telemetry` crate, wiring up PostHog telemetry (install count, open count, version distribution), injected via compile-time environment variables `POSTHOG_ENDPOINT` / `POSTHOG_API_KEY`, silently disabled when unconfigured
- feat: reported events now include `app_name`, `app_version`, `os_version`, and an anonymous `device_id` to distinguish clients
- feat: added a telemetry notice section and toggle at the bottom of the onboarding permission gate (enabled by default)
- feat: added a telemetry toggle entry point in the settings panel's About → Privacy card
- feat: the GitHub Actions release workflow now supports injecting telemetry configuration via repository secrets
- fix: fixed auto-update-check failures — `SPUStandardUpdaterController` is now created via `exec_async` on the main thread, and the background check on startup is delayed 5 seconds to ensure the event loop is ready

## v2.0.18

- fix: the dashboard now shows a loading state during the permission check on startup, avoiding a flash of the permissions page
- feat: added a Shell Integration install step to the permission gate, fixing the issue where `.zshrc` wasn't auto-injected after a fresh DMG install; only actionable once accessibility permission is granted
- fix: `ec doctor` warning messages (bash/zsh dotfile check) now show the check item name, matching the error format
- fix: the `ec doctor` terminal integration check no longer prints a meaningless empty `Q_TERM=` line, showing the specific version number instead when there's a version mismatch

## v2.0.17

- feat: update version to 2.0.17 and add auto-update functionality

## v2.0.16

- Enhance dashboard components with new features

## v2.0.15

- Add "Check for Updates" functionality and improve UI elements

## v2.0.14

- Add "Check for Updates" functionality and improve UI elements

## v2.0.13

- Fix check for updates button not working

## v2.0.12

- Fix check for updates button not working

## v2.0.11

- Fix check for updates button not working

## v2.0.10

- Fix check for updates button not working (now triggers Sparkle native update UI)
- Fix dashboard accent color not updating when macOS system accent color changes
- Add changelog support for Sparkle update notifications

## v2.0.9

- Add "Check for Updates" button in the About section of the dashboard
- Enhance DMG background image generation

## v2.0.8

- Add window close button to the dashboard

## v2.0.7

- Fix permission gate readiness state detection

## v2.0.6

- Add permission management with accessibility permission prompts on first launch
- Add settings layout with sidebar navigation

## v2.0.5

- Add launch at login setting
- Initial dashboard settings panel

## v2.0.4

- Add shell history integration settings (merge shells, Ctrl-R toggle, custom history command)

## v2.0.3

- Add fuzzy search and sort method settings

## v2.0.2

- Add font family and font size settings for the autocomplete popup

## v2.0.1

- Initial release of Easy Complete
- IDE-style inline terminal autocomplete via native overlay window
- macOS input method for cursor tracking in Ghostty, Kitty, WezTerm, Zed, Alacritty
