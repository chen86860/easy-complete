# Contributing to Easy Complete

Thanks for helping out. Bug reports, completion specs, documentation and code are all welcome,
in English or 中文. This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

| I want to… | Where to go |
| --- | --- |
| Report a bug | Run `ec issue`, which opens a report with your diagnostics filled in, or pick a [template](https://github.com/chen86860/easy-complete/issues/new/choose) |
| Ask a question or float an idea | [Discussions](https://github.com/chen86860/easy-complete/discussions) |
| Report a security problem | [SECURITY.md](./SECURITY.md), never a public issue |
| Add or fix completions for a CLI | [Completion specs](#completion-specs) below |
| Change the app itself | [Development setup](#development-setup) below |

Issues labelled [`good first issue`](https://github.com/chen86860/easy-complete/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
are a good place to start. For anything larger than a small fix, open an issue or a discussion
first so the approach can be agreed before you write the code.

## Completion specs

This is the easiest way in: a spec is one TypeScript file describing a CLI's subcommands,
options and arguments. Writing and trying out a spec needs Node.js and pnpm, plus Easy
Complete installed so you can see the result.

Specs live in [`packages/autocomplete-specs/src`](./packages/autocomplete-specs/src), one file
per CLI. The package [README](./packages/autocomplete-specs/README.md) has the details.

**1. Write it and try it**

```bash
pnpm install
cd packages/autocomplete-specs
pnpm create-spec <cli-name>   # scaffold src/<cli-name>.ts
pnpm dev                      # rebuild on save and point the running app at your build
pnpm lint                     # biome and tsc
```

`pnpm dev` needs the `ec` CLI on your `PATH`, which comes with the installed app. Open a new
terminal, type the command and check the suggestions. Ctrl+C turns dev mode off again.

A spec may run commands to build its suggestions, for example `git branch` to list branches.
Keep those read-only, pass what the user typed as separate arguments, never inside a shell
string, and do not call the network. `pnpm lint` checks this (CI runs it on every pull request);
to run only that check, use `pnpm --filter @easy-complete/autocomplete-specs check-commands`.
When a flagged command has been reviewed and is needed, mark it with a comment that gives the
reason:

```ts
// spec-check-allow network: package lookup against crates.io; network generators are kept on purpose
```

The check reads the spec's source and is an aid to review, not a sandbox. It does not follow
commands built by helper functions, executables chosen at run time, or git subcommands such as
`branch` and `config` that read or write depending on their arguments; reviewers check those.

**2. Open a pull request with your file under `src/`**

That is all a spec change needs. The app ships specs from `build/specs/`, which every build
generates from `src/`, so there is nothing to regenerate or commit besides your spec. CI builds
the bundle on your pull request; on a first contribution from a fork, it waits for a
maintainer to approve the run, so the checks stay pending until then.

If your spec uses a remote image as an icon, for example `icon: "https://example.com/logo.png"`,
building the bundle downloads it once into `packages/autocomplete-specs/icons/remote/` and
says so. Commit that file with your spec, so later builds need no network. To build the bundle
locally:

```bash
node scripts/sync-bundled-specs.mjs
```

## Development setup

Easy Complete is macOS only and builds on Apple silicon. You need:

- Rust, at the version pinned in `rust-toolchain.toml` (rustup installs it for you)
- Node.js 24 and pnpm 11 (`corepack enable` picks up the pinned pnpm)

```bash
pnpm install
./scripts/install.sh      # build everything and install the app to /Applications
pnpm dev:autocomplete     # watch the autocomplete UI on port 3124
```

[AGENTS.md](./AGENTS.md) is the full guide to the codebase: the three processes and how they
talk, the crate and package map, bundled specs and the release process.

## Before you open a pull request

Run the checks for the part you touched:

```bash
# Rust
cargo clippy --locked --workspace --all-targets -- -D warnings
cargo test --workspace

# TypeScript
pnpm lint
pnpm test
```

- Formatting is automatic. A bot formats every pull request and commits the result;
  `pnpm format` does the same locally.
- Commits and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/),
  for example `fix(figterm): keep the cursor position after a resize`.
- Keep a pull request to one change. Unrelated cleanups are easier to review on their own.
- Changes to what users see need a screenshot or a short recording.
- Do not edit `CHANGELOG.md`. The maintainer adds the line for your change when merging it.

## Licensing

Easy Complete is released under the [MIT License](./LICENSE). By contributing you agree that
your contribution is licensed under the same terms.
