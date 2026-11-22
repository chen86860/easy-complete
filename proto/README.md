# Proto

The [protocol buffers](https://protobuf.dev/) here define the messages Easy
Complete's processes exchange. Both the Rust crates and the TypeScript packages
are generated from these files, so a change here reaches both sides.

| File                 | Between                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `fig.proto`          | The web UIs (autocomplete, dashboard) and the desktop app                      |
| `local.proto`        | Local processes (`ec` CLI, `figterm`) and the desktop app                      |
| `figterm.proto`      | The CLI and `figterm`                                                          |
| `remote.proto`       | `figterm` and the desktop app                                                  |
| `fig_common.proto`   | Shared types used by the files above                                           |

## Generated code

**Rust**: `crates/fig_proto/build.rs` compiles every `.proto` file in this
folder with prost during `cargo build`. It uses the system `protoc` when it is
3.12 or newer and otherwise downloads protoc 26.1, so no setup is needed.

**TypeScript**: this folder is also the `@easy-complete/proto` workspace
package, used by `api-bindings`, `autocomplete-app` and `dashboard-app`. Its
build runs `buf generate` (with `protoc-gen-es`) and `tsc`, writing to `dist/`:

```shell
pnpm --filter @easy-complete/proto build
```

`pnpm lint` runs `buf lint` and a `buf format` check here; fix formatting with
`pnpm --filter @easy-complete/proto lint:fix`.

## Changing messages

Edit the relevant `.proto` file, then rebuild both sides. Keep changes
wire-compatible: do not reuse or renumber field tags. To retire a field, mark it
`[deprecated = true]` instead of removing it.
