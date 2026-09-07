#!/usr/bin/env node
// ── Generate the bundled completion spec for our own CLI (`ec`) ───────────────
//
// The upstream spec package only ships third-party CLIs, so `ec` itself has no
// completion. Rather than hand-maintaining a spec that drifts from the clap
// definitions, we ask the binary for one: `ec completion fig` emits a Fig spec
// straight out of clap (clap_complete_fig), which we normalise to plain ESM and
// drop into bundle/specs/ec.js (plus an `ec` entry in index.json).
//
// Run standalone:            node scripts/generate-ec-spec.mjs
// Point at a built binary:   EC_BINARY=target/dist/ec node scripts/generate-ec-spec.mjs
// Skip (e.g. no toolchain):  EC_SPEC_SKIP=1
//
// sync-bundled-specs.mjs calls this at the end of a sync (bundle/specs is wiped
// first), and build-app.sh re-runs it with the freshly built binary so the
// bundled spec always matches the shipped CLI.

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir =
  process.env.BUNDLED_SPECS_DIR || join(repoDir, "bundle", "specs");

const SPEC_NAME = "ec";

async function exists(path) {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

// Prefer an explicit EC_BINARY, then whatever cargo already built. Falling back
// to `cargo run` keeps a bare `node scripts/generate-ec-spec.mjs` working, at
// the cost of a compile.
async function resolveSpecCommand() {
  const explicit = process.env.EC_BINARY;
  if (explicit) {
    const path = isAbsolute(explicit) ? explicit : join(repoDir, explicit);
    if (!(await exists(path))) {
      throw new Error(`EC_BINARY is not an executable file: ${path}`);
    }
    return { file: path, args: ["completion", "fig"], label: path };
  }

  const cargoOutDir = process.env.CARGO_TARGET_DIR || join(repoDir, "target");
  for (const profile of ["dist", "release", "debug"]) {
    const path = join(cargoOutDir, profile, "ec");
    if (await exists(path)) {
      return { file: path, args: ["completion", "fig"], label: path };
    }
  }

  return {
    file: "cargo",
    args: [
      "run",
      "--quiet",
      "-p",
      "ec_cli",
      "--bin",
      "ec",
      "--",
      "completion",
      "fig",
    ],
    label: "cargo run -p ec_cli -- completion fig",
  };
}

// clap_complete_fig emits TypeScript: `const completion: Fig.Spec = {...}`.
// The bundled specs are plain ESM modules loaded by the webview, so strip the
// type annotation and keep the `export default`.
function toEsmModule(typescriptSource) {
  const stripped = typescriptSource.replace(
    /const\s+completion\s*:\s*Fig\.Spec\s*=/,
    "const completion =",
  );
  if (stripped === typescriptSource) {
    throw new Error(
      "Unexpected `ec completion fig` output: no `const completion: Fig.Spec =` declaration",
    );
  }
  if (!/export\s+default\s+completion/.test(stripped)) {
    throw new Error(
      "Unexpected `ec completion fig` output: no `export default completion`",
    );
  }
  return `${stripped.trimEnd()}\n`;
}

async function updateIndex() {
  const indexPath = join(outDir, "index.json");
  let index;
  try {
    index = JSON.parse(await readFile(indexPath, "utf8"));
  } catch {
    index = { completions: [], diffVersionedCompletions: [] };
  }

  const completions = new Set(index.completions ?? []);
  if (completions.has(SPEC_NAME)) return false;

  completions.add(SPEC_NAME);
  index.completions = [...completions].sort();
  await writeFile(indexPath, JSON.stringify(index));
  return true;
}

export async function generateEcSpec() {
  if (process.env.EC_SPEC_SKIP === "1") {
    process.stdout.write("Skipping ec spec generation (EC_SPEC_SKIP=1)\n");
    return;
  }

  const { file, args, label } = await resolveSpecCommand();
  process.stdout.write(`Generating ${SPEC_NAME} spec from ${label}\n`);

  const { stdout } = await execFileAsync(file, args, {
    cwd: repoDir,
    maxBuffer: 32 * 1024 * 1024,
  });

  const module = toEsmModule(stdout);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, `${SPEC_NAME}.js`), module);
  await updateIndex();

  process.stdout.write(
    `Bundled ${SPEC_NAME} spec (${module.length} bytes) into ${outDir}\n`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateEcSpec().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
