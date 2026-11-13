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
string, and do not call the network.

**2. Regenerate the bundle**

The app does not load `src/` directly. It ships `bundle/specs/`, which is generated and
committed, so a spec change is only complete with the regenerated bundle. From the repository
root:

```bash
node scripts/sync-bundled-specs.mjs
```

This step is heavier than writing the spec:

- It needs network access, because it re-downloads the icons that specs reference.
- It regenerates the spec for Easy Complete's own CLI from the `ec` binary under `target/`.
  With no binary there it builds one with cargo, which needs the Rust toolchain from
  [Development setup](#development-setup) and takes a few minutes the first time.

If you cannot run it, open the pull request with only your change under `src/` and say so. A
maintainer will regenerate the bundle on your branch.

**3. Commit only what belongs to your spec**

That is your file under `src/`, its `bundle/specs/<cli-name>.js`, and one added line in
`bundle/specs/index.json`. The sync can also rewrite icons of unrelated specs when a site
changed its image; drop those with `git restore bundle/specs/icons`.

Check the result before pushing. This is offline and changes nothing:

```bash
node scripts/sync-bundled-specs.mjs --check
```

CI runs the same check. On a first contribution from a fork, CI waits for a maintainer to
approve the run, so the checks stay pending until then.

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
- Do not edit `CHANGELOG.md`. Release notes are written when a version ships.

## Licensing

Easy Complete is released under the [MIT License](./LICENSE). By contributing you agree that
your contribution is licensed under the same terms.
