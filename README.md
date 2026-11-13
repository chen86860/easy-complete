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
  <a href="#-license"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue"></a>
  <a href="https://github.com/chen86860/easy-complete/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/chen86860/easy-complete?style=social"></a>
</p>

<p align="center">
  <a href="https://easy-complete.emmmm.dev">Website</a> ·
  <a href="https://github.com/chen86860/easy-complete/releases/latest">Download</a> ·
  <a href="./CHANGELOG.md">Changelog</a> ·
  <a href="./CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <b>English</b> · <a href="./README.zh-CN.md">简体中文</a>
</p>

**Easy Complete** gives your shell fish-style suggestions for hundreds of CLIs (`git`,
`npm`, `docker`, `cargo`, …) — subcommands, flags, arguments and file paths, rendered in a
native overlay that follows your cursor. A lightweight, local-first alternative to Fig.

Completion runs on-device, with no account and no AI requests. Anonymous usage statistics
(never command content) can be turned off with `ec telemetry disable`; the
[Privacy page](https://easy-complete.emmmm.dev/privacy-policy) lists every network request
and how to disable it.

<p align="center">
  <img src="./.github/media/screenshot.png" alt="Easy Complete autocomplete in action">
</p>

## ✨ Features

- **IDE-style inline completions** for hundreds of CLIs, in a native overlay that follows
  your terminal cursor.
- **Ready out of the box** — completions for every supported CLI come with the app, so
  there is nothing to download or configure.
- **Works where you already type** — standalone terminals, IDE terminals, tmux and Zellij
  (see [Supported terminals](#supported-terminals)).
- **`zsh`, `bash` and `fish`** — shell integration is installed and managed for you.

## 💻 Requirements

- macOS 13 (Ventura) or later, Apple Silicon (the published DMG is arm64 only)
- `zsh`, `bash` or `fish`
- **Accessibility** permission, granted when the app first asks for it

## ⚡ Install

### Homebrew (recommended)

```bash
brew install chen86860/tap/easy-complete
```

### DMG

[Download the latest DMG](https://github.com/chen86860/easy-complete/releases/latest/download/Easy-Complete-arm64.dmg)
and drag **Easy Complete.app** into `/Applications`.

### First launch

Open **Easy Complete**, follow the setup steps and grant the **Accessibility** permission
when asked. Then open a new terminal window and type `git ` to try it.

## 🚀 Usage

Start typing in any supported terminal — suggestions appear inline.

| Key         | Action                                                           |
| ----------- | ---------------------------------------------------------------- |
| `↑` / `↓`   | Move through suggestions (also `⇧⇥`, `⌃P` / `⌃N`)                |
| `↩` (Enter) | Accept the highlighted suggestion                                |
| `⇥` (Tab)   | Insert the prefix all suggestions share, or move to the next one |
| `Esc`       | Dismiss the popup                                                |

Settings live in the **Easy Complete menu bar icon**. Useful CLI commands:

```bash
ec doctor                              # diagnose common problems
ec diagnostic                          # print environment / integration status
ec integrations install input-method   # (re)register the macOS input method
ec settings list                       # view settings
ec settings <key> <value>              # change a setting
```

### Supported terminals

| How it connects | Terminals |
| --- | --- |
| Works out of the box | [iTerm2](https://iterm2.com/), [Apple Terminal](https://support.apple.com/guide/terminal/welcome/mac), [VS Code](https://code.visualstudio.com/) and editors built on it ([Cursor](https://cursor.com/), Windsurf, Trae, [Kiro](https://kiro.dev/)), [ChatGPT (Codex)](https://openai.com/codex/) |
| Needs the bundled input method | [Ghostty](https://ghostty.org/), [Kitty](https://sw.kovidgoyal.net/kitty/), [WezTerm](https://wezterm.org/), [Zed](https://zed.dev/), [Alacritty](https://alacritty.org/), [Otty](https://otty.sh/), [Herdr](https://herdr.dev/), [JetBrains IDEs](https://www.jetbrains.com/) |
| Multiplexers | [tmux](https://github.com/tmux/tmux), [Zellij](https://zellij.dev/) (including resurrected sessions) |

**Why do some terminals need an input method?** Terminals such as Ghostty, Kitty and
WezTerm do not tell other apps where the cursor is, so the popup would not know where to
appear. Easy Complete ships a small macOS input method that does one thing: report the
cursor position. If setup finds one of these terminals on your Mac, it offers to turn the
input method on.

## ❓ FAQ

### Completions do not appear

This is almost always a missing **Accessibility** permission, which Easy Complete needs to
place the popup next to your terminal cursor. Approve **Easy Complete** in:

> System Settings → Privacy & Security → Accessibility

Run `ec doctor` to check, or bring the system prompt back with
`ec debug prompt-accessibility`. Terminal windows that were already open before Easy
Complete started are not covered either: open a new one.

See the [docs](https://easy-complete.emmmm.dev/docs) for more troubleshooting.

## 🗑 Uninstall

```bash
ec uninstall
```

This removes the shell and terminal integrations, the input method (only Easy Complete's
own input source), the LaunchAgent and application data — but not the app itself. Finish
with the step for your install method, then run `exec $SHELL`:

| Installed via | Then run                                                                   |
| ------------- | -------------------------------------------------------------------------- |
| Homebrew      | `brew uninstall chen86860/tap/easy-complete`                               |
| DMG           | Move `/Applications/Easy Complete.app` to the Trash                        |
| Source        | `./scripts/uninstall.sh` from the repo (does everything above in one pass) |

## 🛠 Development

Easy Complete is three cooperating processes: the desktop app (`easy-complete`, overlay and
settings UI), a pseudoterminal (`ecterm`) that reads the shell edit buffer, and the `ec`
CLI. They talk over Unix sockets using Protobuf.

[AGENTS.md](./AGENTS.md) is the full architecture and contributor guide: toolchain, crate
map, IPC, build and test commands, bundled specs and the release process.

To build and install from source:

```bash
git clone https://github.com/chen86860/easy-complete.git
cd easy-complete
./scripts/install.sh    # builds, installs to /Applications, sets up shell integration
exec $SHELL
pnpm dev:autocomplete   # optional: watch the autocomplete UI (port 3124)
```

## 🤝 Contributing

Issues and pull requests are welcome. [CONTRIBUTING.md](./CONTRIBUTING.md) has the full guide.

- **Report a bug** — `ec issue` opens a pre-filled report with your diagnostics attached,
  or use the [issue templates](https://github.com/chen86860/easy-complete/issues/new/choose).
  Please include `ec doctor` output.
- **Add or fix a CLI's completions** — completion specs are TypeScript files in
  [`packages/autocomplete-specs/src`](./packages/autocomplete-specs/src), one per CLI. Its
  [README](./packages/autocomplete-specs/README.md) covers creating a spec, live reload
  while you edit, and shipping the change.
- **Before opening a PR** — make sure `cargo clippy --locked --workspace --all-targets -- -D warnings`,
  `pnpm lint` and `pnpm test` pass. You don't need to format by hand: a bot formats every
  pull request and commits the result (`pnpm format` does the same locally). Commits follow
  [Conventional Commits](https://www.conventionalcommits.org/).
- **Security issues** — follow [SECURITY.md](./SECURITY.md) instead of filing a public issue.

## 📜 License

Licensed under the MIT License. Easy Complete is based on the upstream Amazon Q
Developer CLI; its original copyright notice is retained in [LICENSE](./LICENSE).
Third-party copyright and license terms are collected in
[THIRD_PARTY_NOTICES.txt](./THIRD_PARTY_NOTICES.txt).

The license covers the code, not the Easy Complete name, logo, or icon. Forks
must ship under a new name and icon; see [TRADEMARKS.md](./TRADEMARKS.md).

## 🙏 Acknowledgements

The completion specs started from [withfig/autocomplete](https://github.com/withfig/autocomplete),
and the spec libraries and build CLI from
[withfig/autocomplete-tools](https://github.com/withfig/autocomplete-tools), both by Fig
and their contributors under the MIT License. Thanks to everyone who wrote and maintained
them.
