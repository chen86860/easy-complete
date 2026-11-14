# @easy-complete/autocomplete-specs

The completion specs Easy Complete ships with: one TypeScript file per CLI,
describing its subcommands, options and arguments. When you type `git checkout `,
the suggestions come from `src/git.ts`.

This is an internal workspace package. It is not published anywhere; the app
gets the specs from a bundle generated out of this package (see
[Shipping a spec change](#shipping-a-spec-change)).

| Path     | What it holds                                                               |
| -------- | --------------------------------------------------------------------------- |
| `src/`   | The specs. `src/<cli>.ts`, or `src/<cli>/` for a CLI with per-version specs |
| `icons/` | Icons the specs refer to by name                                            |
| `build/` | Compiled output, not committed                                              |

`pnpm build` clears `build/`, compiles the specs into it with
[`autocomplete-tools`](../autocomplete-tools) and then smoke-tests the output.

## Development

Run these from this directory:

```bash
pnpm create-spec <name> # scaffold src/<name>.ts
pnpm dev                # rebuild on save and load the specs into the running app
pnpm build              # compile src/ into build/ and smoke-test it
pnpm lint               # biome and tsc; pnpm lint:fix applies biome's fixes
pnpm typecheck          # tsc only
```

`pnpm dev` points the running Easy Complete at `build/` through `ec settings`,
so it needs the `ec` CLI on your `PATH`. Ctrl+C turns dev mode off again.

## Shipping a spec change

The app does not read `build/`. It bundles the specs from `bundle/specs/` at the
repository root, which is generated and committed. After changing a spec,
regenerate it **from the repository root** and commit the result together with
your change:

```bash
node scripts/sync-bundled-specs.mjs
```

The script builds this package itself, so there is no separate build step. It
also:

- downloads the remote icons the specs reference, so it needs network access,
  and icons of unrelated specs can change when a site updated its image;
- regenerates `ec.js`, the spec for Easy Complete's own CLI, from the `ec`
  binary under `target/`, building it with cargo when there is none.

CI runs `node scripts/sync-bundled-specs.mjs --check`, which compares
`bundle/specs/` with a fresh build and fails when the two differ. Run it locally
to see whether the bundle is up to date; it is offline and changes nothing.

## History

These specs started as a fork of
[withfig/autocomplete](https://github.com/withfig/autocomplete). They were
maintained at
[chen86860/autocomplete-specs](https://github.com/chen86860/autocomplete-specs)
and published to npm as `@chen86860/autocomplete-specs`, which the app used to
install as a dependency. They moved into this repository at that project's
`3.1.3` release (`08cc94c`) without its git history, so look there for the
history of a spec before the move. `3.1.3` is the last version on npm.
