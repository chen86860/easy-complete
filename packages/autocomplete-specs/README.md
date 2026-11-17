# @easy-complete/autocomplete-specs

The completion specs Easy Complete ships with: one TypeScript file per CLI,
describing its subcommands, options and arguments. When you type `git checkout `,
the suggestions come from `src/git.ts`.

This is an internal workspace package. It is not published anywhere; the app
gets the specs from a bundle generated out of this package (see
[Shipping a spec change](#shipping-a-spec-change)).

| Path     | What it holds                                                                        |
| -------- | ------------------------------------------------------------------------------------ |
| `src/`   | The specs. `src/<cli>.ts`, or `src/<cli>/` for a CLI with per-version specs          |
| `icons/` | Icons the specs refer to by name; `icons/remote/` caches the remote images specs use |
| `build/` | Compiled output, not committed                                                       |

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

Commit your change under `src/`; nothing else is needed. The app ships
`build/specs/` at the repository root, which is build output, not committed:
`scripts/build-app.sh` regenerates it from this package on every build, and CI
does the same on every pull request.

To build it yourself, from the repository root:

```bash
node scripts/sync-bundled-specs.mjs
```

The script builds this package and then:

- copies the remote icons the specs reference from `icons/remote/`, where they
  are committed under a hash of their URL. An icon not there yet is downloaded
  once and saved there; commit it with the spec;
- generates `ec.js`, the spec for Easy Complete's own CLI, from the `ec`
  binary under `target/`, building it with cargo when there is none. Set
  `EC_SPEC_SKIP=1` to leave it out.

## History

These specs started as a fork of
[withfig/autocomplete](https://github.com/withfig/autocomplete). They were
maintained at
[chen86860/autocomplete-specs](https://github.com/chen86860/autocomplete-specs)
and published to npm as `@chen86860/autocomplete-specs`, which the app used to
install as a dependency. They moved into this repository at that project's
`3.1.3` release (`08cc94c`) without its git history, so look there for the
history of a spec before the move. `3.1.3` is the last version on npm.
