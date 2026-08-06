# @easy-complete/api-bindings-wrappers

Ergonomic wrappers over [`@easy-complete/api-bindings`](../api-bindings), the
generated Protobuf IPC bindings.

The generated bindings mirror the wire format one to one, which makes them
awkward to call directly. This package wraps the ones the UI reaches for most:

- `executeCommand.ts` / `executeCommandWrappers.ts` — run a command on the host
  and read back its output, plus the shell-specific helpers built on top
- `settings.ts` / `state.ts` — typed reads and writes against the settings and
  state stores
- `fs.ts` — filesystem helpers
