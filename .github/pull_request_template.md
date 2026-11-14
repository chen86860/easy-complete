## What and why

<!-- What does this change, and what problem does it solve? Link the issue: "Fixes #123". -->

## How it was tested

<!-- Commands you ran, terminals and shells you tried it in. For UI changes, add a screenshot or a short recording. -->

## Checklist

- [ ] `cargo clippy --locked --workspace --all-targets -- -D warnings` and `cargo test --workspace` pass (Rust changes)
- [ ] `pnpm lint` and `pnpm test` pass (TypeScript changes)
- [ ] Spec changes include the regenerated `bundle/specs`, and `node scripts/sync-bundled-specs.mjs --check` passes
- [ ] The PR title follows [Conventional Commits](https://www.conventionalcommits.org/), e.g. `fix(figterm): ...`
