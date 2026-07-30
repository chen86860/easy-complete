# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`Easy Complete` is a macOS terminal autocomplete app — a fork of the Amazon Q Developer CLI. It provides IDE-style inline completions in the terminal via a native overlay window. Key identifiers:

- **App bundle ID**: `dev.emmmm.easy-complete`
- **IME bundle ID**: `dev.emmmm.easy-complete.inputmethod`
- **CLI binary**: `ec`
- **PTY binary**: `ecterm`
- **Desktop binary**: `easy-complete`

## Build & Run

### Rust

```bash
# Build all release binaries
cargo build --release -p fig_desktop -p figterm -p ec_cli -p fig_input_method

# Run a specific crate in dev mode
cargo run --bin ec_cli -- <subcommand>
cargo run --bin easy-complete

# Lint (CI enforces -D warnings)
cargo clippy --locked --workspace --color always -- -D warnings

# Format
cargo fmt

# Test a specific crate
cargo test -p <crate_name>

# Test a single test by name
cargo test -p <crate_name> <test_name>
```

### TypeScript

```bash
# Build all packages
pnpm turbo build --filter="./packages/*"

# Dev watch mode for autocomplete UI (port 3124)
pnpm dev:autocomplete

# Lint all packages
pnpm lint
pnpm lint:fix

# Run tests (Vitest)
pnpm test
pnpm test:ci   # with coverage
```

### Full Install (macOS)

```bash
./scripts/install.sh    # builds Rust + TS, assembles .app, installs to /Applications
./scripts/uninstall.sh  # complete removal
```

### Release

```bash
# Bump version across Cargo.toml and TS packages, then follow the printed steps
./scripts/bump-version.sh <version>   # e.g. ./scripts/bump-version.sh 2.0.18
```

The script outputs the exact next steps:

1. Add a `## v<version>` entry to both `CHANGELOG.md` (English) and `CHANGELOG.zh-CN.md` (Chinese) — keep them in sync, one entry each
2. `git add -A && git commit -m "chore: bump version to v<version>"`
3. `git tag v<version> && git push origin main --tags`

## Architecture

### Multi-Process Design

Three cooperating native processes communicate via Unix domain sockets (protobuf messages):

1. **`easy-complete`** (`fig_desktop`) — Native desktop app. Owns the autocomplete overlay window and settings dashboard, both rendered as React apps inside `wry` WebViews. Handles system tray, window management, and the JS↔Rust bridge via `fig_desktop_api`.

2. **`ecterm`** (`figterm`) — Pseudoterminal that sits between the user's shell and their terminal emulator. Intercepts keystrokes and the shell edit buffer to drive autocomplete. Built on a vendored fork of `alacritty_terminal`.

3. **`ec`** (`ec_cli`) — CLI entry point. Subcommands include `setup`, `integrations`, `hook`, `settings`, `diagnostic`, `inline`, and more.

### IPC

- **Local IPC**: `fig_ipc` — Unix sockets, typed via Protobuf (`proto/` → `fig_proto`)
- **Remote IPC**: `fig_remote_ipc` — WebSocket-based, used for SSH/remote sessions
- Protobuf `.proto` files live in `proto/`; generated Rust types in `fig_proto`; generated TS types in `packages/api-bindings`

### Shell Integration

`fig_integrations` and `fig_install` inject hooks into shell rc files (`.zshrc`, `.bashrc`, fish config). These hooks report shell state (CWD, command text, cursor position) back to `figterm` via IPC on every prompt and keystroke.

`ec init` stands down entirely when the desktop app is not running (`suppress_without_desktop_app`), so VS Code Terminal Suggest, Otty and friends keep their own completions. This is a point-in-time decision made when the shell starts: a terminal opened while the app is down remains uninstrumented for that session. After launching Easy Complete, open a new terminal to enable its completions.

### macOS Input Method (IME)

`fig_input_method` is an IMKit helper app (`EasyCompleteInputMethod.app`) bundled inside the main `.app` at `Contents/Helpers/`. It enables cursor position tracking in terminals that bypass the standard PTY path (Ghostty, Otty, Kitty, WezTerm, Zed, Alacritty).

- The IME self-registers with TIS on startup via `TISRegisterInputSource` (requires NSApplication context)
- Integration install/uninstall is managed via `ec integrations install input-method`
- Enabled state is stored in SQLite: `~/Library/Application Support/easy-complete/data.sqlite3`, table `state`, key `input-method=dev.emmmm.easy-complete.inputmethod.enabled`

### WebView UI

The autocomplete overlay and dashboard are React + Tailwind apps in `packages/autocomplete-app` and `packages/dashboard-app`. In production they are served from `Contents/Resources/{autocomplete,dashboard}/`. In dev, Vite serves them on localhost and `fig_desktop` connects to that instead. Both are served over the `ecresource://localhost` custom protocol (`fig_desktop/src/protocol/resource.rs`), which falls back to `index.html` for extension-less paths so SPA routes like `/about` work.

### WebView Lifecycle

Neither webview is built at startup. `AutocompleteLifecycle` in `fig_desktop/src/webview/mod.rs` creates and releases them on demand:

- **Autocomplete** is built when a `figterm` session connects (`RemoteHookHandler::sessions_changed`) and released after the last session disconnects. Window events that need a live window (`Show`, `Devtools`) rebuild it on the spot.
- **Dashboard** is built on `Show`/`Devtools` and fully released on close (`WindowEvent::Close`, distinct from `Hide`), so closing the settings window reclaims its memory.

Because a rebuilt overlay starts blank, native window events are deferred until the app posts `__ec_autocomplete_mounted__` over the IPC bridge, then replayed in order. A 5s timeout drains the queue if that signal never arrives. Two more IPC signals feed startup telemetry: `__ec_autocomplete_ready__` (first suggestions rendered) and `__ec_autocomplete_specs_ready__` (spec preload finished).

Relevant settings:

| Key                                          | Default | Effect                                                                          |
| -------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `autocomplete.keepReady`                     | `false` | Keep the overlay loaded with no terminals connected — faster first suggestion, more memory |
| `developer.autocomplete.releaseDelaySeconds` | `600`   | Idle delay before releasing the overlay, clamped to 1s–24h. Debug only; low values cause constant rebuilds |
| `dashboard.language`                         | unset   | Dashboard UI language: `system`, `en`, or `zh-CN`                                |
| `app.silentLaunch`                           | `false` | Start without opening the dashboard, same as `--no-dashboard`. A `ec://` deep link naming a page overrides it |

### Website Tailwind CSS

The product website under `website/src` uses Tailwind CSS v4. When editing it:

- Prefer canonical utilities and do not leave `suggestCanonicalClasses` warnings in edited files.
- Use the spacing scale for exact equivalents: `py-3.5` instead of `py-[14px]`, `gap-6.5` instead of `gap-[26px]`, and `max-w-310` instead of `max-w-[1240px]`.
- Use Tailwind v4 CSS-variable shorthand: `bg-(--accent)`, `text-(--accent)`, `border-(--accent-line)`, and `font-(--font-display)` instead of `[var(...)]` forms.
- Prefer exact named utilities such as `rounded-md`, `rounded-xl`, and `tracking-wider`.
- Use arbitrary values only when no canonical utility expresses the design, such as a custom `11px` radius or a complex shadow.
- Before finishing website changes, clear Tailwind CSS IntelliSense canonical-class warnings in touched files and run `cd website && pnpm build`.

### Bundled Specs

Completion specs are **bundled into the `.app` at build time**, not fetched at runtime. `scripts/sync-bundled-specs.mjs` assembles them into `bundle/specs/`, which `build-app.sh` copies to `Contents/Resources/specs/`. At runtime the `spec://localhost/<name>.js` custom protocol (`fig_desktop/src/protocol/spec.rs`) reads these local files only — there is **no network fallback**, so a spec absent from the bundle simply has no completion.

**Source.** The default source is the installed npm dependency [`@chen86860/autocomplete-specs`](https://www.npmjs.com/package/@chen86860/autocomplete-specs), published from our forked spec repo [`chen86860/autocomplete-specs`](https://github.com/chen86860/autocomplete-specs). The version is pinned by root `package.json` plus `pnpm-lock.yaml`. The sync script reads the package from `node_modules`, copies `build/*.js` and `icons/*.png` into `bundle/specs`, then derives `index.json` from the bundled file tree.

**Config + pinning.** `specs.config.json` only stores bundle filtering such as `exclude`. Package pinning lives in the normal JS dependency files, **not `latest`**, so the bundle changes only when the dependency changes, never silently. To adopt a newer fork build: run `corepack pnpm add -D @chen86860/autocomplete-specs@<version> -w`, re-run the sync, and commit `package.json`, `pnpm-lock.yaml`, and the regenerated `bundle/specs` together. Env overrides still win for one-off runs: `BUNDLED_SPECS_EXCLUDE=<csv>`, `BUNDLED_SPECS_PACKAGE=<pkg>`, `BUNDLED_SPECS_SOURCE=npm` with `BUNDLED_SPECS_VERSION=<version|latest>` / `BUNDLED_SPECS_PACKAGE_TARBALL=<full-url>` / `BUNDLED_SPECS_NPM_REGISTRY=<registry>`, or `BUNDLED_SPECS_SOURCE=cdn` to fall back to the legacy per-file CDN sync (`https://specs.q.us-east-1.amazonaws.com/`, frozen 2025-05-05).

To keep the bundle small, the sync script supports excluding whole namespaces via `BUNDLED_SPECS_EXCLUDE` (comma-separated; a namespace `ns` drops the top-level `ns` spec and everything under `ns/`). The filter is applied to **both** the downloaded files and the written `index.json`, so the runtime loader never references excluded specs.

- **Default**: `aws` and `az` are excluded (the AWS and Azure CLI specs are large and most users never trigger them). This is intentional — see `specs.config.json`.
- **Bundle everything**: `BUNDLED_SPECS_EXCLUDE="" node scripts/sync-bundled-specs.mjs`
- **Trim more**: `BUNDLED_SPECS_EXCLUDE="aws,gcloud,az" node scripts/sync-bundled-specs.mjs` (saves another ~26 MB)

`build-app.sh` only auto-syncs when `bundle/specs/index.json` is missing, so it reuses whatever filtered set is already on disk. Re-run the sync script after changing the exclusion list.

## Key Crates

| Crate              | Role                                                             |
| ------------------ | ---------------------------------------------------------------- |
| `fig_desktop`      | Native app host: windowing (`tao`), WebView (`wry`), system tray |
| `figterm`          | PTY interceptor, shell edit buffer tracking                      |
| `ec_cli`           | CLI binary, all `ec` subcommands                                 |
| `fig_input_method` | macOS IMKit input method helper                                  |
| `fig_integrations` | Shell/terminal/editor integration install logic                  |
| `fig_desktop_api`  | Request/response handlers for WebView↔native bridge             |
| `fig_ipc`          | Unix socket IPC primitives                                       |
| `fig_proto`        | Generated Protobuf message types                                 |
| `fig_settings`     | Settings persistence (JSON)                                      |
| `fig_util`         | Shared constants, directory paths, system info                   |
| `macos-utils`      | macOS Accessibility API, NSWorkspace, AppKit ObjC2 bindings      |

## Key TypeScript Packages

| Package                 | Role                                   |
| ----------------------- | -------------------------------------- |
| `autocomplete-app`      | Autocomplete overlay React UI          |
| `dashboard-app`         | Settings/onboarding React UI           |
| `autocomplete-parser`   | CLI spec parser, suggestion generation |
| `shell-parser`          | Shell command-line tokenizer           |
| `api-bindings`          | Generated TS Protobuf IPC bindings     |
| `api-bindings-wrappers` | Ergonomic wrappers over `api-bindings` |

## Toolchain Versions

- Rust: `1.87.0` (pinned in `rust-toolchain.toml`), edition 2024
- Node: `^22.0.0`
- pnpm: `10.0.0`
- Turborepo handles the TypeScript build graph

## macOS-Specific Notes

- The `.app` bundle lives at `/Applications/easy-complete.app`
- Launch at login: `SMAppService.mainAppService` on macOS 13+; `~/Library/LaunchAgents/dev.emmmm.easy-complete.plist` fallback on macOS 12
- IME symlink target: `~/Library/Input Methods/EasyCompleteInputMethod.app`
- HIToolbox prefs (`com.apple.HIToolbox`) must include the IME bundle ID for Ghostty/Kitty cursor following to work
- `TISCreateInputSourceList` returns NULL when called without NSApplication; always call TIS APIs via `run_on_main` or from within the IME process itself
