# @easy-complete/autocomplete-app

The React app rendered inside the autocomplete overlay window. The desktop app
(`fig_desktop`) hosts it in a `wry` WebView and drives it over the JS↔Rust
bridge; in production it is served from `Contents/Resources/autocomplete/`.

## Folders and files

- `fig/` — wrappers around the IPC API that make it nicer to work with
- `parser/` — parses the command line with a shell parser, then a contextual
  parser that applies completion specs
- `generators/` — runs asynchronous requests that produce suggestions dynamically
- `suggestions/` — computes, sorts and filters the suggestion list out of parser
  results and completed generators
- `history/` — shell history sources and the history suggestion list
- `state/` — React state: shell state from the IPC hooks, parser results,
  generator results, the suggestions to display, and window visibility
- `hooks/keypress.ts` — handles keypresses, updating state accordingly
- `components/` — the overlay's presentational components

## How it works

The primary logic lives in `state/` and `App.tsx`, which combine the parts above
into the overlay. `state/` defines a reducer covering every way the state can
change:

- An autocomplete event arrives from the IPC API — update the current buffer,
  cwd and so on.
- The buffer changed — re-parse it. This is asynchronous because specs are
  loaded from disk; the parser result is applied when it completes.
- A generator completed — if its results are not stale, merge them into
  generator state.
- A keypress arrives — depending on the key, move the selection or hide the
  overlay.
- An unrecoverable error occurs — hide the overlay until it can show something
  again.

After every state update, a few checks decide whether suggestions need
recomputing or generators need re-triggering, the latter when the search term
for the current argument has changed.

## Developing

```bash
pnpm dev:autocomplete   # from the repo root; serves on localhost:3124
```

Point the desktop app at the dev server, and unset it when you are done:

```bash
pnpm --filter @easy-complete/autocomplete-app set-host
pnpm --filter @easy-complete/autocomplete-app remove-host
```

The desktop app watches this setting and navigates the overlay as soon as it
changes, so no restart is needed.

**Tip**: to see the real source of console logs instead of `instrument.ts`,
right click the `instrument.ts` label and choose "Blackbox Script".
