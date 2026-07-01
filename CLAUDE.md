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

# Format (requires nightly)
cargo +nightly fmt

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

### macOS Input Method (IME)

`fig_input_method` is an IMKit helper app (`EasyCompleteInputMethod.app`) bundled inside the main `.app` at `Contents/Helpers/`. It enables cursor position tracking in terminals that bypass the standard PTY path (Ghostty, Kitty, WezTerm, Zed, Alacritty).

- The IME self-registers with TIS on startup via `TISRegisterInputSource` (requires NSApplication context)
- Integration install/uninstall is managed via `ec integrations install input-method`
- Enabled state is stored in SQLite: `~/Library/Application Support/easy-complete/data.sqlite3`, table `state`, key `input-method=dev.emmmm.easy-complete.inputmethod.enabled`

### WebView UI

The autocomplete overlay and dashboard are React + Tailwind apps in `packages/autocomplete-app` and `packages/dashboard-app`. In production they are served from `Contents/Resources/{autocomplete,dashboard}/`. In dev, Vite serves them on localhost and `fig_desktop` connects to that instead.

### Bundled Specs

Completion specs are **bundled into the `.app` at build time**, not fetched at runtime. `scripts/sync-bundled-specs.mjs` assembles them into `bundle/specs/`, which `build-app.sh` copies to `Contents/Resources/specs/`. At runtime the `spec://localhost/<name>.js` custom protocol (`fig_desktop/src/protocol/spec.rs`) reads these local files only — there is **no network fallback**, so a spec absent from the bundle simply has no completion.

**Source.** The default source is the npm package [`@chen86860/autocomplete-specs`](https://www.npmjs.com/package/@chen86860/autocomplete-specs), published from our forked spec repo [`chen86860/autocomplete-specs`](https://github.com/chen86860/autocomplete-specs). The sync script resolves the pinned package version from the npm registry, downloads the package tarball, verifies the npm shasum when available, copies `build/*.js` and `icons/*.png` into `bundle/specs`, then derives `index.json` from the bundled file tree.

**Config + pinning.** All spec-source settings live in `specs.config.json` at the repo root — `package`, `version`, and `exclude` — so they are edited and reviewed without touching the script. The `version` is pinned to a specific npm package version, **not `latest`**, so the bundle changes only when the config changes, never silently. To adopt a newer fork build: bump `version` in `specs.config.json`, re-run the sync, and commit the regenerated `bundle/specs` alongside it (one reviewable change). Env overrides still win: `BUNDLED_SPECS_PACKAGE=<pkg>`, `BUNDLED_SPECS_VERSION=<version|latest>`, `BUNDLED_SPECS_PACKAGE_TARBALL=<full-url>`, `BUNDLED_SPECS_NPM_REGISTRY=<registry>`, `BUNDLED_SPECS_EXCLUDE=<csv>`, or `BUNDLED_SPECS_SOURCE=cdn` to fall back to the legacy per-file CDN sync (`https://specs.q.us-east-1.amazonaws.com/`, frozen 2025-05-05).

To keep the bundle small, the sync script supports excluding whole namespaces via `BUNDLED_SPECS_EXCLUDE` (comma-separated; a namespace `ns` drops the top-level `ns` spec and everything under `ns/`). The filter is applied to **both** the downloaded files and the written `index.json`, so the runtime loader never references excluded specs.

- **Default**: `aws` is excluded (the AWS CLI specs are ~36 MB / 419 entries; bundle drops from ~76 MB to ~40 MB). This is intentional — see the `exclude` constant in `scripts/sync-bundled-specs.mjs`.
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
- LaunchAgent plist: `~/Library/LaunchAgents/dev.emmmm.easy-complete.plist`
- IME symlink target: `~/Library/Input Methods/EasyCompleteInputMethod.app`
- HIToolbox prefs (`com.apple.HIToolbox`) must include the IME bundle ID for Ghostty/Kitty cursor following to work
- `TISCreateInputSourceList` returns NULL when called without NSApplication; always call TIS APIs via `run_on_main` or from within the IME process itself
