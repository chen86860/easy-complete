<p align="center">
  <img src="./assets/logo.png" alt="Easy Complete" width="140px">
</p>

<h1 align="center">Easy Complete</h1>

<p align="center">
  <b>为 macOS 终端打造的 IDE 风格行内自动补全。</b><br/>
  一款开源、纯本地、Fig 风格的命令行补全引擎，支持 <code>zsh</code>、<code>bash</code> 与 <code>fish</code>。
</p>

<p align="center">
  <a href="https://github.com/chen86860/easy-complete/releases"><img alt="Release" src="https://img.shields.io/github/v/release/chen86860/easy-complete?color=brightgreen"></a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-macOS-lightgrey">
  <img alt="Built with Rust" src="https://img.shields.io/badge/built%20with-Rust-orange">
  <a href="#-许可证"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue"></a>
  <a href="https://github.com/chen86860/easy-complete/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/chen86860/easy-complete?style=social"></a>
</p>

<p align="center">
  <a href="https://easy-complete.emmmm.dev">官网</a> ·
  <a href="https://github.com/chen86860/easy-complete/releases/latest">下载</a> ·
  <a href="./CHANGELOG.zh-CN.md">更新日志</a> ·
  <a href="./AGENTS.md">参与贡献</a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <b>简体中文</b>
</p>

**Easy Complete** 是一款 macOS 终端自动补全应用——以原生浮层窗口跟随光标，为你的 shell
提供 IDE 风格的行内补全。它只专注于终端自动补全这一件事——是一款轻量、完全本地、
开源的 Fig 替代品。

你会在输入 `git`、`npm`、`docker`、`cargo` 等数百种命令行工具时，获得类似 fish shell 的
建议：参数、子命令、文件路径、选项，边打边补。
自动补全完全在本机运行——无需账号、无云端调用、无 AI 请求，你的命令内容永远不会离开你的
Mac。应用会收集匿名使用统计（打开次数、每日补全次数——绝不包含命令内容），可随时通过
`ec telemetry disable` 关闭。完整的采集清单见[隐私页面](https://easy-complete.emmmm.dev/privacy-policy)。

<p align="center">
  <img src="./.github/media/screenshot.png" alt="Easy Complete 自动补全效果">
</p>

## 目录

- [功能特性](#-功能特性)
- [系统要求](#-系统要求)
- [安装](#-安装)
- [使用](#-使用)
- [卸载](#-卸载)
- [工作原理](#-工作原理)
- [开发](#-开发)
- [参与贡献](#-参与贡献)
- [许可证](#-许可证)

---

## ✨ 功能特性

- **IDE 风格的行内补全** —— 为数百种 CLI 提供子命令、参数、选项和文件路径补全，以跟随
  终端光标的原生浮层呈现。
- **完全离线** —— 补全 spec 在构建时打包进 `.app`，运行时直接从本地读取，**没有**网络
  回退，无需账号，也不发起任何 AI 请求。
- **兼容你正在用的终端** —— iTerm2、Apple Terminal、VS Code、Cursor、JetBrains 系列
  通过 PTY 集成工作；Ghostty、Kitty、WezTerm、Zed、Alacritty、Otty 则通过随附的输入法
  追踪光标。
- **支持 `zsh`、`bash` 与 `fish`** —— shell 集成由应用自动安装与维护。

---

## 💻 系统要求

| 项目     | 说明                                                 |
| -------- | ---------------------------------------------------- |
| 操作系统 | macOS 12.0（Monterey）及以上                         |
| 架构     | Apple Silicon（arm64）—— 当前发布的 DMG 仅支持 arm64 |
| Shell    | `zsh`、`bash`、`fish`                                |
| 权限     | **辅助功能**（必需，见[下文](#授予辅助功能权限)）    |

---

## ⚡ 安装

### Homebrew（推荐）

```bash
brew install --cask chen86860/tap/easy-complete
```

然后从 `/Applications` 启动 **Easy Complete**，按设置面板的引导操作即可——它会检查
辅助功能权限、shell 集成和输入法，缺什么可一键修复。

### 手动下载 DMG

[下载最新版 DMG](https://github.com/chen86860/easy-complete/releases/latest/download/Easy-Complete-arm64.dmg) ·
[所有 Releases](https://github.com/chen86860/easy-complete/releases)

打开 DMG，把 **Easy Complete.app** 拖到 `/Applications`，启动它，然后按上面同样的设置面板
引导完成配置。

### 从源码构建

如果你要做开发，或需要在本机自行构建，可以克隆仓库并运行安装脚本：

```bash
git clone https://github.com/chen86860/easy-complete.git
cd easy-complete
./scripts/install.sh
```

源码安装脚本会：

1. 构建 Rust 二进制和 TypeScript 前端。
2. 组装出 `Easy Complete.app` 并复制到 `/Applications`。
3. 把 `ec` 和 `ecterm` 两个 CLI 软链到 `~/.local/bin`。
4. 可在设置中开启**登录时启动**（macOS 13+ 使用系统登录项，macOS 12 回退到 LaunchAgent）。
5. 配置 shell 集成并注册输入法。
6. **弹出授予「辅助功能」权限的提示**（必需，见下文）。

完成后，重新加载你的 shell：

```bash
exec $SHELL
```

### 授予「辅助功能」权限

Easy Complete 需要把补全浮层定位到你当前聚焦的终端窗口，这依赖 macOS 的**辅助功能
（Accessibility）**权限。安装脚本会自动触发系统授权弹窗，请在以下位置勾选 **Easy Complete**：

> 系统设置 → 隐私与安全性 → 辅助功能

**如果补全始终不出现，几乎都是这个权限没授予。** 可先用 `ec doctor` 检查，再用下面的命令
重新触发授权弹窗：

```bash
ec debug prompt-accessibility
```

---

## 🚀 使用

安装并授权后，在任意受支持的终端里直接开始输入即可——建议会随输入实时出现在行内。

| 按键            | 操作           |
| --------------- | -------------- |
| `↑` / `↓`       | 在建议间移动   |
| `⇥` (Tab) / `→` | 采用高亮的建议 |
| `Esc`           | 关闭补全浮层   |

设置与引导面板（dashboard）可从**菜单栏的 Easy Complete 图标**打开。

常用 CLI 命令：

```bash
ec doctor                       # 诊断常见问题
ec diagnostic                   # 打印环境 / 集成状态
ec integrations install input-method   # （重新）注册 macOS 输入法
ec settings list                # 查看设置
ec settings <key> <value>       # 修改某项设置
```

### 受支持的终端

大多数终端通过 PTY 集成开箱即用——包括 iTerm2、Apple Terminal、VS Code、Cursor、
ChatGPT（Codex）以及 JetBrains IDE 终端。少数绕过标准 PTY 路径的终端（**Ghostty、Kitty、
WezTerm、Zed、Alacritty、Otty**）还需要依赖随附的输入法来追踪光标位置——这一项会在安装时
自动注册。

---

## 🗑 卸载

先移除集成与应用数据——无论你用哪种方式安装，这一步都适用：

```bash
ec uninstall
```

它会移除 shell 集成、终端集成、输入法注册、LaunchAgent 以及全部应用数据；只会精确移除
Easy Complete 自己的输入源，**不会动**你其它的键盘布局和输入法。该命令**不会**删除应用
包本身，所以请按你的安装方式执行对应的收尾步骤：

| 安装方式 | 收尾命令                                                      |
| -------- | ------------------------------------------------------------- |
| Homebrew | `brew uninstall --cask chen86860/tap/easy-complete`           |
| DMG      | 把 `/Applications/Easy Complete.app` 移到废纸篓               |
| 源码     | 在仓库中执行 `./scripts/uninstall.sh`（一步完成上述全部清理） |

最后执行 `exec $SHELL` 重新加载 shell。

---

## 🧩 工作原理

Easy Complete 由三个相互协作的原生进程组成，通过 Unix 域套接字（Protobuf 消息）通信：

| 二进制          | Crate         | 职责                                                                                           |
| --------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `easy-complete` | `fig_desktop` | 原生应用宿主——承载补全浮层与设置面板（运行于 `wry` WebView 的 React 应用）、系统托盘、窗口管理 |
| `ecterm`        | `figterm`     | 介于 shell 与终端模拟器之间的伪终端；拦截 shell 编辑缓冲区以驱动补全                           |
| `ec`            | `ec_cli`      | CLI 入口——`setup`、`integrations`、`diagnostic`、`settings` 等                                 |

Shell 钩子（`.zshrc`、`.bashrc`、fish 配置）在每次提示符和按键时，把 shell 状态（当前目
录、命令文本、光标位置）回报给 `ecterm`。在 macOS 上，`fig_input_method` 辅助应用负责为绕
过 PTY 的终端上报光标位置。

**标识符**

- 应用 bundle ID：`dev.emmmm.easy-complete`
- 输入法 bundle ID：`dev.emmmm.easy-complete.inputmethod`
- 应用包路径：`/Applications/Easy Complete.app`

---

## 🛠 开发

> [AGENTS.md](./AGENTS.md) 是完整的架构与贡献指南——crate 索引、IPC 结构、WebView 生命
> 周期、内置 spec 与发布流程都在其中。下面只列出跑通本地构建所需的最少命令。

### 工具链

- Rust `1.87.0`（在 `rust-toolchain.toml` 中固定），edition 2024
- Node `>=22.13 <23`，pnpm `11.14`（由 `package.json` 的 `packageManager` 字段固定）
- TypeScript 构建图由 Turborepo 管理

### Rust

```bash
# 构建所有 release 二进制
cargo build --release -p fig_desktop -p figterm -p ec_cli -p fig_input_method

# 以 dev 模式运行单个 crate
cargo run --bin ec -- <子命令>
cargo run --bin easy-complete

cargo clippy --locked --workspace --color always -- -D warnings   # lint（CI 要求 -D warnings）
cargo fmt                                                         # 格式化
cargo test -p <crate_name>                                        # 测试某个 crate
```

### TypeScript

```bash
pnpm turbo build --filter="./packages/*"   # 构建所有包
pnpm dev:autocomplete                       # 监听补全 UI（端口 3124）
pnpm lint                                   # lint
pnpm test                                   # 运行 Vitest
```

开发模式下，Vite 在 localhost 提供 WebView UI，`fig_desktop` 会连接到它，而不是包内
`Contents/Resources/` 下的产物。

### 目录结构

| 路径        | 内容                                                                |
| ----------- | ------------------------------------------------------------------- |
| `crates/`   | Rust workspace——桌面应用、PTY、CLI、输入法、IPC、集成逻辑           |
| `packages/` | TypeScript workspace——补全浮层 UI、设置面板 UI、spec 解析、IPC 绑定 |
| `proto/`    | Rust 与 TypeScript 两侧共用的 Protobuf 定义                         |
| `scripts/`  | 安装、卸载、打包 `.app`、DMG、发布与 spec 同步脚本                  |
| `website/`  | 产品官网                                                            |

逐个 crate 与包的职责说明见 [AGENTS.md](./AGENTS.md)。

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request。

- **反馈问题** —— 运行 `ec issue` 会打开一个已自动附带诊断信息的 Issue 表单，也可以直接
  使用 [Issue 模板](https://github.com/chen86860/easy-complete/issues/new/choose)。
  请附上 `ec doctor` 的输出。
- **提 PR 之前** —— 请先阅读 [AGENTS.md](./AGENTS.md)，并确认
  `cargo clippy --locked --workspace -- -D warnings`、`cargo fmt`、`pnpm lint`
  和 `pnpm test` 全部通过。
- **提交信息**遵循 [Conventional Commits](https://www.conventionalcommits.org/)
  （`feat:`、`fix:`、`refactor:`、`chore:`）。
- **安全问题**请按 [SECURITY.md](./SECURITY.md) 的流程反馈，不要提交公开 Issue。

---

## 📜 许可证

采用 MIT 许可证。Easy Complete 基于上游 Amazon Q Developer CLI，并在
[LICENSE](./LICENSE) 中保留其原始版权声明。
第三方版权与许可证条款集中收录于
[THIRD_PARTY_NOTICES.txt](./THIRD_PARTY_NOTICES.txt)。
