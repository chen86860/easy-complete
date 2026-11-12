> Forked from the `@withfig/autocomplete-tools` CLI in [withfig/autocomplete-tools](https://github.com/withfig/autocomplete-tools) at `104377c` (2025-01-07), which is no longer maintained. Maintained here as a private workspace package.

# autocomplete-tools

Builds the completion specs in `packages/autocomplete-specs`. Run it from that package through its scripts.

| Command | What it does |
| --- | --- |
| `autocomplete-tools compile [-w] [-o <dir>]` | Bundles every `src/**/*.ts` spec with esbuild into `build/` (or `<dir>`), and writes the spec index files |
| `autocomplete-tools dev [-o <dir>]` | Compiles in watch mode and points the running Easy Complete at the output through `ec settings`, so edits show up on save. Ctrl+C turns dev mode off again |
| `autocomplete-tools create-spec [name]` | Writes a starter spec to `src/<name>.ts` |

Compared with upstream, the `init`, `merge` and `version` commands are gone, settings go through `ec` instead of the `fig`, `cw` and `q` CLIs, and dev mode no longer tails `~/.fig/logs/specs.log`.
