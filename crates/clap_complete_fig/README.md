# clap_complete_fig

Generates [Fig](https://github.com/withfig/autocomplete) completion specs for
[clap](https://github.com/clap-rs/clap) based CLIs. Easy Complete uses it to
produce the spec for its own `ec` CLI: `ec completion fig` prints the spec, and
`scripts/generate-ec-spec.mjs` writes it to `bundle/specs/ec.js`.

This is a fork of `clap_complete_fig` 4.5.2. The clap project removed the crate
from its repository in January 2025 (`chore: Remove clap_complete_fig`), so it
no longer receives updates. The code is unchanged apart from what this
workspace's toolchain requires, and keeps its original licence, MIT or
Apache-2.0, at the copyright holders' choice (`LICENSE-MIT`, `LICENSE-APACHE`).
