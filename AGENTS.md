# AGENTS.md

Guidance for coding agents working in this repository.

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
cargo run --bin ec -- <subcommand>
cargo run --bin easy-complete

# Lint (CI enforces -D warnings)
cargo clippy --locked --workspace --all-targets --color always -- -D warnings

# Format Rust and TypeScript (the autofix.ci workflow runs this on every PR)
pnpm format

# Test a specific crate
cargo test -p <crate_name>

# Test a single test by name
cargo test -p <crate_name> <test_name>
```

### TypeScript

```bash
# Build all packages
pnpm turbo build --filter="./packages/*"

# Dev watch mode for the autocomplete UI (port 3124) and the dashboard (port 3125)
pnpm dev:autocomplete
pnpm -C packages/dashboard-app dev

# Lint and format-check all packages (biome; proto uses buf)
pnpm lint
pnpm lint:fix

# Run tests (Vitest)
pnpm test
pnpm test:ci   # with coverage
```

TypeScript is linted and formatted with biome. The root `biome.json` covers `api-bindings`, `api-bindings-wrappers`, `autocomplete-app`, `autocomplete-parser`, `dashboard-app`, `shared` and `shell-parser`; `packages/autocomplete-specs` has its own `biome.json` (formatter only). The forked Fig libraries are not linted.

`build` and `lint` run through Turborepo and are cached by input hash (`turbo.json`): an unchanged package is restored from `.turbo/cache` instead of rebuilt or relinted. `lint` depends on the upstream packages' `build`, so it works on a fresh checkout. CI restores the cache that pushes to `main` save. Use `pnpm turbo build --force` to bypass it.

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

The script also refreshes `Cargo.lock` and regenerates `THIRD_PARTY_NOTICES.txt`. CI checks that file with `pnpm licenses:check` whenever a lockfile or manifest changes, so run `pnpm licenses:generate` after changing dependencies. The script then prints the exact next steps:

1. Add a `## v<version>` entry to both `CHANGELOG.md` (English) and `CHANGELOG.zh-CN.md` (Chinese) — keep them in sync, one entry each. Stable releases only: prereleases get no entry of their own (see below)
2. `git add -A && git commit -m "chore: bump version to v<version>"`
3. `git tag v<version> && git push origin main --tags`

Prereleases use `X.Y.Z-alpha|beta|rc[.N]` tags. They publish as GitHub prereleases (no Homebrew tap update), and every tag also refreshes the `appcast.xml` on the rolling `beta-feed` release, which users who enable `app.betaUpdates` read. Sparkle's version comparator stops at the first `-`, so `CFBundleVersion` / `sparkle:version` drop the separators (`2.4.0-beta.1` → `2.4.0beta1`, via `scripts/sparkle-version.sh`); `CFBundleShortVersionString` keeps the tag form.

Signing, notarization, the Sparkle appcast and deltas, the required GitHub secrets and the local commands for each step are documented in [docs/release-updates.md](docs/release-updates.md). Read it before touching `release.yml` or the `scripts/*sparkle*`, `sign-macos-app.sh`, `notarize-dmg.sh` and `make-dmg.sh` scripts.

Prereleases get no CHANGELOG section. Put their notes in the GitHub prerelease body if needed, and when the stable version ships, write one `## vX.Y.Z` entry covering every change since the previous stable release. Do not mention the beta line in it, and keep entries short and user-facing.

## Architecture

### Multi-Process Design

Three cooperating native processes communicate via Unix domain sockets (protobuf messages):

1. **`easy-complete`** (`fig_desktop`) — Native desktop app. Owns the autocomplete overlay window and settings dashboard, both rendered as React apps inside `wry` WebViews. Handles system tray, window management, and the JS↔Rust bridge via `fig_desktop_api`.

2. **`ecterm`** (`figterm`) — Pseudoterminal that sits between the user's shell and their terminal emulator. Intercepts keystrokes and the shell edit buffer to drive autocomplete. Built on a vendored fork of `alacritty_terminal`.

3. **`ec`** (`ec_cli`) — CLI entry point. User-facing subcommands: `settings`, `update`, `diagnostic`, `issue`, `doctor`, `launch`, `quit`, `restart`, `integrations`, `telemetry`, `version`. Hidden ones used by the shell integration and tooling: `init`, `hook`, `internal`, `completion`, `debug`, `uninstall`.

### IPC

- **Local IPC**: `fig_ipc` — Unix sockets, typed via Protobuf (`proto/` → `fig_proto`)
- **Session IPC**: `fig_remote_ipc` — the Unix socket (`$TMPDIR/ecrun/remote.sock`) every `ecterm` session connects to. Despite the name it is local; session connects and disconnects here drive the overlay lifecycle
- Protobuf `.proto` files live in `proto/`; generated Rust types in `fig_proto`; generated TS types in `packages/api-bindings`

### Shell Integration

`fig_integrations` and `fig_install` inject hooks into shell rc files (`.zshrc`, `.bashrc`, fish config). These hooks report shell state (CWD, command text, cursor position) back to `figterm` via IPC on every prompt and keystroke.

`ec init` stands down entirely when the desktop app is not running (`suppress_without_desktop_app`), so VS Code Terminal Suggest, Otty and friends keep their own completions. This is a point-in-time decision made when the shell starts: a terminal opened while the app is down remains uninstrumented for that session. After launching Easy Complete, open a new terminal to enable its completions.

### macOS Input Method (IME)

`fig_input_method` is an IMKit helper app (`EasyCompleteInputMethod.app`) bundled inside the main `.app` at `Contents/Helpers/`. It enables cursor position tracking in terminals that bypass the standard PTY path (Alacritty, Kitty, Nova, WezTerm, JetBrains IDEs, Zed, Rio, Ghostty, Otty, Herdr; see `Terminal::supports_macos_input_method`).

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
| `app.betaUpdates`                            | `false` | Check the rolling `beta-feed` appcast instead of `releases/latest`, so prerelease builds are offered |

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

**Source.** The specs live in this repository under `packages/autocomplete-specs` (TypeScript in `src/`, icons in `icons/`). They were forked from [withfig/autocomplete](https://github.com/withfig/autocomplete) and maintained in [chen86860/autocomplete-specs](https://github.com/chen86860/autocomplete-specs) until its 3.1.3 release, which moved here without its git history. `scripts/sync-bundled-specs.mjs` builds that package (`pnpm --filter @easy-complete/autocomplete-specs... build`), copies `build/*.js` and the referenced `icons/*.png` into `bundle/specs`, then derives `index.json` from the bundled file tree.

**Changing a spec.** Edit `packages/autocomplete-specs/src`, run `node scripts/sync-bundled-specs.mjs`, and commit the spec change together with the regenerated `bundle/specs`. CI runs `node scripts/sync-bundled-specs.mjs --check`, an offline comparison of `bundle/specs` with a fresh build, so a forgotten re-sync fails the JavaScript job. Libraries bundled into specs count too: bumping `semver` changes the diff-versioned `*/index.js` files. Inside the package, `pnpm dev` rebuilds on save and points the running app at its `build/` through `ec settings`; `pnpm create-spec <name>` scaffolds a new spec. `pnpm build` in the package compiles and smoke-tests every spec, and `pnpm lint` runs biome and `tsc`; CI runs both through the workspace `build` and `lint`. The sync also re-downloads the remote icons specs reference (`scripts/localize-spec-icons.mjs`), so unrelated icon PNGs can change when a site updates its image.

There is no spec for the AWS CLI or the Azure CLI. Their specs (`aws`, 419 files, and `az`, 230 files) made up 62% of the spec sources and were never bundled, because they are large and most users never trigger them. They were removed from the repository in November 2026; `git log -- packages/autocomplete-specs/src/aws.ts` finds the last commit that had them. `gcloud` is bundled and accounts for about 14 MB of the bundle.

`build-app.sh` only auto-syncs when `bundle/specs/index.json` is missing, so it reuses whatever is already on disk.

**Our own CLI (`ec`).** The spec sources only cover third-party CLIs, so `bundle/specs/ec.js` is generated from clap by `scripts/generate-ec-spec.mjs`: it runs `ec completion fig` (clap_complete_fig), strips the TS type annotation, writes `ec.js`, and adds `ec` to `index.json`. Never hand-edit `bundle/specs/ec.js` — regenerate it. `sync-bundled-specs.mjs` calls it at the end of every sync (the sync wipes `bundle/specs` first), and `build-app.sh` re-runs it with `EC_BINARY=${TARGET_DIR}/ec` so the bundled spec always matches the binary being shipped. Standalone: `EC_BINARY=target/dist/ec node scripts/generate-ec-spec.mjs`; with no `EC_BINARY` it picks `target/{dist,release,debug}/ec` or falls back to `cargo run`. `EC_SPEC_SKIP=1` opts out.

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
| `fig_settings`     | Settings (`settings.json`) and state (`data.sqlite3`) persistence |
| `fig_util`         | Shared constants, directory paths, system info, terminal detection |
| `fig_os_shim`      | Injectable env, filesystem and process info, faked in tests      |
| `fig_remote_ipc`   | Session socket between `ecterm` and the desktop app              |
| `fig_install`      | Install and uninstall of the app's components                     |
| `fig_telemetry`    | Opt-in PostHog events, queued on disk; the only HTTP client      |
| `fig_diagnostic`, `fig_log` | `ec diagnostic` report and logging setup                |
| `macos-utils`      | macOS Accessibility API, NSWorkspace, AppKit ObjC2 bindings      |
| `alacritty_terminal`, `shell-color` | Vendored terminal emulation and shell color parsing |

## Key TypeScript Packages

| Package                 | Role                                   |
| ----------------------- | -------------------------------------- |
| `autocomplete-app`      | Autocomplete overlay React UI          |
| `dashboard-app`         | Settings/onboarding React UI           |
| `autocomplete-parser`   | CLI spec parser, suggestion generation |
| `shell-parser`          | Shell command-line tokenizer           |
| `api-bindings`          | Generated TS Protobuf IPC bindings     |
| `api-bindings-wrappers` | Ergonomic wrappers over `api-bindings` |
| `autocomplete-specs`    | Completion spec sources (`@easy-complete/autocomplete-specs`), bundled into `bundle/specs` |
| `autocomplete-tools`    | Spec build CLI: `compile`, `dev`, `create-spec` |
| `shared`, `fuzzysort`, `types`, `tsconfig` | Shared utilities, vendored fuzzy matcher, global types, base tsconfig |
| `autocomplete-helpers`, `autocomplete-shared`, `autocomplete-generators`, `autocomplete-types` | Fig spec libraries and types, forked from [withfig/autocomplete-tools](https://github.com/withfig/autocomplete-tools); they keep their `@fig/*` / `@withfig/*` names so spec imports are unchanged |

## Toolchain Versions

- Rust: `1.97.0` (pinned in `rust-toolchain.toml`), edition 2024
- Node: `>=24 <25`
- pnpm: `11.14.0` (pinned in `packageManager`)
- biome for TypeScript lint and format; rustfmt and clippy for Rust
- Turborepo handles the TypeScript build graph

## macOS-Specific Notes

- The `.app` bundle lives at `/Applications/Easy Complete.app`; `scripts/build-app.sh` assembles it under `build/`
- Minimum system: macOS 13 (`MACOSX_DEPLOYMENT_TARGET`, set in `build-app.sh` and both workflows, becomes `LSMinimumSystemVersion`). `MIN_MACOS` in `release.yml` writes the matching `depends_on macos:` into the Homebrew cask on each stable release; change the two together
- Launch at login: `SMAppService.mainAppService`. A `~/Library/LaunchAgents/dev.emmmm.easy-complete.plist` left by old versions is removed on launch
- IME symlink target: `~/Library/Input Methods/EasyCompleteInputMethod.app`
- HIToolbox prefs (`com.apple.HIToolbox`) must include the IME bundle ID for Ghostty/Kitty cursor following to work
- `TISCreateInputSourceList` returns NULL when called without NSApplication; always call TIS APIs via `run_on_main` or from within the IME process itself
