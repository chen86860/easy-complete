# @easy-complete/autocomplete-specs

The completion specs bundled into Easy Complete.

These specs started as a fork of
[withfig/autocomplete](https://github.com/withfig/autocomplete), maintained at
[chen86860/autocomplete-specs](https://github.com/chen86860/autocomplete-specs)
and published to npm as `@chen86860/autocomplete-specs`. They moved into this
repository at that project's `3.1.3` release (`08cc94c`), without its git
history; look there for the history of a spec before the move. The npm package
is no longer published.

## What are completion specs?

A completion spec is a declarative TypeScript schema that describes the
subcommands, options, and arguments for a CLI tool. Easy Complete uses these
schemas to generate command-line suggestions.

Specs live in `src/`. `pnpm build` compiles them into `build/` with
[`autocomplete-tools`](../autocomplete-tools) and then smoke-tests the output.

## Development

Run these from this directory:

```bash
pnpm build             # compile src/ into build/ and smoke-test it
pnpm typecheck
pnpm lint              # biome; pnpm lint:fix to apply fixes
pnpm create-spec <name>
pnpm dev               # rebuild on save and load the specs into the running app
```

`pnpm dev` points the running Easy Complete at `build/` through `ec settings`,
so it needs the `ec` CLI on your `PATH`. Ctrl+C turns dev mode off again.

## Shipping a spec change

The app bundles the specs from `bundle/specs/` at the repository root, which is
committed. After changing a spec, regenerate the bundle and commit it with the
change:

```bash
pnpm -C packages/autocomplete-specs build
node scripts/sync-bundled-specs.mjs
```
