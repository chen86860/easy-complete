<p align="center">
  <img src="./assets/logo.png" alt="Easy Complete" width="140px">
</p>

<h1 align="center">Easy Complete</h1>

<p align="center">
  <b>IDE-style inline autocomplete for your macOS terminal.</b><br/>
  An open-source, Fig-style completion engine for <code>zsh</code>, <code>bash</code> & <code>fish</code>.
</p>

<p align="center">
  <a href="https://github.com/chen86860/easy-complete/releases"><img alt="Release" src="https://img.shields.io/github/v/release/chen86860/easy-complete?color=brightgreen"></a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-macOS-lightgrey">
  <img alt="Built with Rust" src="https://img.shields.io/badge/built%20with-Rust-orange">
  <a href="#-license"><img alt="License" src="https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue"></a>
  <a href="https://github.com/chen86860/easy-complete/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/chen86860/easy-complete?style=social"></a>
</p>

<p align="center">
  <b>English</b> · <a href="./README.zh-CN.md">简体中文</a>
</p>

**Easy Complete** is a macOS terminal autocomplete app — IDE-style inline completions
for your shell, rendered in a native overlay window that follows your cursor. It is a
local-first terminal completion engine focused purely on autocomplete —
a lightweight, fully local alternative to Fig.

You get fish-shell-style suggestions for hundreds of CLIs (`git`, `npm`, `docker`,
`cargo`, …): flags, subcommands, file paths, and arguments, completed as you type.

<p align="center">
  <img src="./.github/media/screnshoot.jpeg" alt="Easy Complete autocomplete in action">
</p>

> **Platform:** macOS only (Apple Silicon / ARM64).

## Contents

- [Install](#-install)
- [Usage](#-usage)
- [Uninstall](#-uninstall)
- [How it works](#-how-it-works)
- [Development](#-development)
- [License](#-license)

---

## ⚡️ Install

### Download the DMG

Open the GitHub Releases page and download the latest Apple Silicon DMG:

[Go to Releases](https://github.com/chen86860/easy-complete/releases)

Then:

1. Open `Easy-Complete-arm64.dmg`.
2. Drag **Easy Complete.app** into `/Applications`.
3. The build is unsigned, so macOS may quarantine it. Clear the quarantine flag once:

   ```bash
   xattr -dr com.apple.quarantine "/Applications/Easy Complete.app"
   ```

4. Launch **Easy Complete** from `/Applications`.
5. Grant **Accessibility** permission when prompted.
6. Reload your shell:

   ```bash
   exec $SHELL
   ```

On first launch, Easy Complete sets up the bundled CLI binaries, shell integration,
input method, and login startup entries.

### Build from source

For development, or if you need to build locally, clone the repository and run the
installer:

```bash
git clone https://github.com/chen86860/easy-complete.git
cd easy-complete
./install.sh
```

The source installer will:

1. Build the Rust binaries and the TypeScript frontend.
2. Assemble `Easy Complete.app` and copy it to `/Applications`.
3. Symlink the `ec` and `ecterm` CLIs into `~/.local/bin`.
4. Install a LaunchAgent so the app starts on login.
5. Set up shell integration and register the input method.
6. **Prompt you to grant Accessibility permission** (required — see below).

When it finishes, reload your shell:

```bash
exec $SHELL
```

### Grant Accessibility permission

Easy Complete positions the completion popup relative to your focused terminal
window, which requires the macOS **Accessibility** permission. The installer triggers
the system prompt automatically; approve **Easy Complete** in:

> System Settings → Privacy & Security → Accessibility

If completions never appear, this is almost always the cause. Re-trigger the prompt
with:

```bash
ec debug prompt-accessibility
```

---

## 🚀 Usage

Once installed and granted permission, just start typing in any supported terminal —
suggestions appear inline as you type.

| Key             | Action                            |
| --------------- | --------------------------------- |
| `↑` / `↓`       | Move through suggestions          |
| `⇥` (Tab) / `→` | Accept the highlighted suggestion |
| `Esc`           | Dismiss the popup                 |

The settings & onboarding dashboard is available from the **Easy Complete menu bar
icon** (system tray).

Useful CLI commands:

```bash
ec doctor                       # diagnose common problems
ec diagnostic                   # print environment / integration status
ec integrations install input-method   # (re)register the macOS input method
ec settings list                # view settings
ec settings <key> <value>       # change a setting
```

### Supported terminals

Most terminals work out of the box via the PTY integration. Terminals that bypass the
standard PTY path (**Ghostty, Kitty, WezTerm, Zed, Alacritty**) additionally rely on
the bundled input method for cursor tracking — this is registered automatically during
install.

---

## 🗑️ Uninstall

```bash
./scripts/uninstall.sh
```

This removes the app bundle, CLI symlinks, LaunchAgent, input method, shell
integration, and all application data. It surgically removes only Easy Complete's own
input source from the system preferences (your other keyboard layouts and input
methods are left untouched).

---

## 🧩 How it works

Easy Complete runs as three cooperating native processes that talk over Unix domain
sockets (Protobuf messages):

| Binary          | Crate         | Role                                                                                                                             |
| --------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `easy-complete` | `fig_desktop` | Native app host — owns the autocomplete overlay and dashboard (React apps in `wry` WebViews), system tray, and window management |
| `ecterm`        | `figterm`     | Pseudoterminal between your shell and terminal emulator; intercepts the shell edit buffer to drive completions                   |
| `ec`            | `q_cli`       | CLI entry point — `setup`, `integrations`, `diagnostic`, `settings`, and more                                                    |

Shell hooks (`.zshrc`, `.bashrc`, fish config) report shell state — CWD, command text,
cursor position — back to `ecterm` on every prompt and keystroke. On macOS, the
`fig_input_method` helper app reports caret position for terminals that bypass the PTY.

**Identifiers**

- App bundle ID: `dev.emmmm.easy-complete`
- Input method bundle ID: `dev.emmmm.easy-complete.inputmethod`
- App bundle: `/Applications/Easy Complete.app`

---

## 🛠️ Development

### Toolchain

- Rust `1.87.0` (pinned in `rust-toolchain.toml`), edition 2024
- Node `^22`, pnpm `10`
- Turborepo for the TypeScript build graph

### Rust

```bash
# Build all release binaries
cargo build --release -p fig_desktop -p figterm -p q_cli -p fig_input_method

# Run a single crate in dev mode
cargo run --bin q_cli -- <subcommand>
cargo run --bin easy-complete

cargo clippy --locked --workspace --color always -- -D warnings   # lint (CI: -D warnings)
cargo +nightly fmt                                                # format (nightly)
cargo test -p <crate_name>                                        # test a crate
```

### TypeScript

```bash
pnpm turbo build --filter="./packages/*"   # build all packages
pnpm dev:autocomplete                       # watch the autocomplete UI (port 3124)
pnpm lint                                   # lint
pnpm test                                   # run Vitest
```

In dev, Vite serves the WebView UIs on localhost and `fig_desktop` connects to those
instead of the bundled `Contents/Resources/`.

### Key crates

| Crate                   | Role                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| `fig_desktop`           | Native app host: windowing (`tao`), WebView (`wry`), system tray |
| `figterm`               | PTY interceptor, shell edit-buffer tracking                      |
| `q_cli`                 | CLI binary, all `ec` subcommands                                 |
| `fig_input_method`      | macOS input method helper (cursor tracking)                      |
| `fig_integrations`      | Shell/terminal/editor integration install logic                  |
| `fig_ipc` / `fig_proto` | Unix-socket IPC primitives & generated Protobuf types            |

### Key TypeScript packages

| Package               | Role                                   |
| --------------------- | -------------------------------------- |
| `autocomplete-app`    | Autocomplete overlay React UI          |
| `dashboard-app`       | Settings / onboarding React UI         |
| `autocomplete-parser` | CLI spec parser, suggestion generation |
| `shell-parser`        | Shell command-line tokenizer           |
| `api-bindings`        | Generated TS Protobuf IPC bindings     |

---

## 📜 License

Dual licensed under the MIT and Apache 2.0 licenses, inherited from the upstream Amazon
Q Developer CLI.
