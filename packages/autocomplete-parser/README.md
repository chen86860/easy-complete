# @easy-complete/autocomplete-parser

Turns a tokenized command line into the completion state the overlay renders.

[`@easy-complete/shell-parser`](../shell-parser) splits the raw buffer into
tokens; this package takes those tokens, resolves the matching completion spec
and works out what the user is completing right now.

- `loadSpec.ts` / `loadHelpers.ts` — resolve and load a spec for a command,
  including subcommand and versioned specs. Specs are read over the
  `spec://localhost/` protocol from the ones bundled into the app; there is no
  network fallback
- `parseArguments.ts` — walk the tokens against the spec to determine the
  current subcommand, the option or argument in play, and what may follow
- `tryResolveSpecToSubcommand.ts` — normalize the several shapes a spec module
  can export into a subcommand
- `caches.ts` — cache loaded specs so repeated keystrokes do not reload them
