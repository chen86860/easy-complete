# 参与贡献 Easy Complete

[English](./CONTRIBUTING.md) · **简体中文**

感谢你的帮助。欢迎提交问题反馈、补全规则、文档和代码，用中文或 English 都可以。本项目遵守
[行为准则](./CODE_OF_CONDUCT.md)。

## 参与方式

| 我想… | 去哪里 |
| --- | --- |
| 反馈 bug | 运行 `ec issue`，会打开一份已填好诊断信息的报告；也可以选一个[模板](https://github.com/chen86860/easy-complete/issues/new/choose) |
| 提问或讨论想法 | [Discussions](https://github.com/chen86860/easy-complete/discussions) |
| 报告安全问题 | 见 [SECURITY.md](./SECURITY.md)，不要提公开 issue |
| 为某个 CLI 新增或修正补全 | 见下文[补全规则](#补全规则) |
| 修改应用本身 | 见下文[开发环境](#开发环境) |

标有 [`good first issue`](https://github.com/chen86860/easy-complete/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
的 issue 适合入手。比小修复更大的改动，请先开 issue 或 discussion，把方案商量好再写代码。

## 补全规则

这是最容易上手的方式：一个 spec 就是一个 TypeScript 文件，描述某个 CLI 的子命令、选项和参数。
编写和试用 spec 需要 Node.js 和 pnpm，另外要装好 Easy Complete，才能看到效果。

spec 放在 [`packages/autocomplete-specs/src`](./packages/autocomplete-specs/src) 下，每个 CLI
一个文件。详细说明见该包的 [README](./packages/autocomplete-specs/README.md)。

**1. 编写并试用**

```bash
pnpm install
cd packages/autocomplete-specs
pnpm create-spec <cli-name>   # scaffold src/<cli-name>.ts
pnpm dev                      # rebuild on save and point the running app at your build
pnpm lint                     # biome and tsc
```

`pnpm dev` 需要 `PATH` 里有 `ec` 命令，它随应用一起安装。打开一个新终端，输入命令，检查补全建议。
按 Ctrl+C 退出开发模式。

spec 可以运行命令来生成建议，例如用 `git branch` 列出分支。这些命令要保持只读；用户输入的内容
要作为单独的参数传入，不要拼进 shell 字符串；也不要访问网络。`pnpm lint` 会检查这些（CI 在每个
PR 上都会跑）；只想跑这一项检查，用 `pnpm --filter @easy-complete/autocomplete-specs check-commands`。
被标出的命令如果已经审查过、确实需要，用注释标记并写明理由：

```ts
// spec-check-allow network: package lookup against crates.io; network generators are kept on purpose
```

这项检查读取的是 spec 源码，用来辅助审查，并不是沙箱。它不会追踪由辅助函数拼出来的命令、运行时
才确定的可执行文件，也分不清 `branch`、`config` 这类会因参数不同而读或写的 git 子命令；这些由
审查者检查。

**2. 提交 PR，只需包含 `src/` 下的文件**

spec 改动只需要这些。应用发布的是 `build/specs/` 里的 spec，每次构建都会从 `src/` 重新生成，所以
除了你的 spec 之外，没有其他文件需要重新生成或提交。CI 会在你的 PR 上构建 bundle；来自 fork 的
首次贡献需要维护者批准后才会运行，在那之前检查会一直显示等待中。

如果 spec 用远程图片作为图标，例如 `icon: "https://example.com/logo.png"`，构建 bundle 时会把它
下载一次到 `packages/autocomplete-specs/icons/remote/`，并输出提示。把这个文件和 spec 一起提交，
之后的构建就不需要联网。在本地构建 bundle：

```bash
node scripts/sync-bundled-specs.mjs
```

## 开发环境

Easy Complete 只支持 macOS，在 Apple 芯片上构建。你需要：

- Rust，版本以 `rust-toolchain.toml` 为准（rustup 会自动安装）
- Node.js 24 和 pnpm 11（`corepack enable` 会使用锁定的 pnpm 版本）
- Xcode Command Line Tools；`ec_cli` 的 Shell 集成测试还需要 `brew install fish shellcheck`

```bash
pnpm install
./scripts/install.sh      # build everything and install the app to /Applications
pnpm dev:autocomplete     # watch the autocomplete UI on port 3124
```

[AGENTS.md](./AGENTS.md)（英文）是完整的代码库指南：三个进程及其通信方式、crate 和 package
一览、内置 spec 以及发布流程。

## 提交 PR 之前

针对你改动的部分运行检查：

```bash
# Rust
cargo clippy --locked --workspace --all-targets -- -D warnings
cargo test --workspace

# TypeScript
pnpm lint
pnpm test
```

- 格式化是自动的。机器人会格式化每个 PR 并提交结果；本地用 `pnpm format` 也能做到。
- commit 和 PR 标题遵循 [Conventional Commits](https://www.conventionalcommits.org/)，
  例如 `fix(figterm): keep the cursor position after a resize`。
- 一个 PR 只做一件事。无关的清理单独提交更容易审查。
- 用户可见的改动需要附截图或短录屏。
- 不要编辑 `CHANGELOG.md`。维护者会在合并时为你的改动补上对应条目。

## 许可

Easy Complete 以 [MIT 许可证](./LICENSE)发布。提交贡献即表示你同意你的贡献按相同条款授权。
