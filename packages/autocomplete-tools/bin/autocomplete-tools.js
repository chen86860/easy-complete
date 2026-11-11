#!/usr/bin/env node
// pnpm links a workspace package's bin when it installs, before anything is built, and
// skips the link if the target is missing. So the bin is this committed launcher, which
// loads the CLI that `pnpm build` writes to dist/.
import "../dist/bin.js";
