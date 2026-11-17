#!/usr/bin/env node
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { generateEcSpec } from "./generate-ec-spec.mjs";
import { localizeSpecIcons } from "./localize-spec-icons.mjs";

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");

// Generates build/specs, the completion specs build-app.sh copies into the app. The
// directory is build output and not committed: build-app.sh runs this script on every
// build.
//
// Source: the workspace package packages/autocomplete-specs. This script builds it
// (build/<name>.js, nested specs, <name>/index.js for diff-versioned ones) and copies
// the result plus icons/<name>.png into build/specs. Remote icons come from the
// package's icons/remote cache (see localize-spec-icons.mjs), so a build is offline
// unless a spec references an icon that is not cached yet.
const specsPackageDir = join(repoDir, "packages", "autocomplete-specs");

const outDir =
  process.env.BUNDLED_SPECS_DIR || join(repoDir, "build", "specs");
const iconListPath = join(
  repoDir,
  "packages",
  "autocomplete-app",
  "src",
  "fig",
  "icons.ts",
);

const concurrency = Number(process.env.BUNDLED_SPECS_CONCURRENCY || 16);

async function writeAsset(path, bytes) {
  const destination = join(outDir, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}

async function runPool(items, task) {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (next < items.length) {
        const item = items[next++];
        await task(item);
      }
    },
  );
  await Promise.all(workers);
}

async function iconNames() {
  const source = await readFile(iconListPath, "utf8");
  const match = source.match(/export const icons:[\s\S]*?=\s*\[([\s\S]*?)\]/);
  if (!match) {
    throw new Error(`Unable to parse icon list from ${iconListPath}`);
  }
  return [...match[1].matchAll(/"([^"]+)"/g)].map(([, name]) => name);
}

// Recursively list every *.js file under `dir`, returning paths relative to `dir`
// (POSIX separators), skipping the icons/ subtree.
async function walkJs(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "icons") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkJs(full, base)));
    } else if (entry.name.endsWith(".js")) {
      out.push(relative(base, full).split("\\").join("/"));
    }
  }
  return out;
}

// Files the compiler emits for consumers of the specs package, not specs: the root barrel
// (index.js) and the map of dynamic imports (dynamic/index.js). The app loads specs one at a
// time through the spec:// protocol and uses neither.
function isSpecFile(rel) {
  return rel !== "index.js" && !rel.startsWith("dynamic/");
}

// The built spec files of the package, as paths relative to build/ ("aws/ec2.js",
// "az/index.js"). A file only counts if its source still exists: the build clears its
// output first, but a turbo cache hit restores files without removing others, so build/
// can still hold the output of a spec that was since deleted or renamed.
async function listBuiltSpecs(packageRoot) {
  const built = await walkJs(join(packageRoot, "build"));
  return built.filter(
    (rel) =>
      isSpecFile(rel) &&
      existsSync(join(packageRoot, "src", `${rel.slice(0, -3)}.ts`)),
  );
}

// One entry per line, so two branches that each add a spec merge without a conflict.
// generate-ec-spec.mjs writes the same format.
function formatIndex(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

function deriveIndexFromJs(allJs) {
  const diffVersioned = new Set();
  for (const rel of allJs) {
    if (rel.endsWith("/index.js")) diffVersioned.add(dirname(rel));
  }
  const completions = new Set(diffVersioned);
  for (const rel of allJs) {
    const stem = rel.slice(0, -3); // strip .js
    if (stem.split("/").pop() !== "index") completions.add(stem);
  }
  return { completions: [...completions], diffVersioned: [...diffVersioned] };
}

async function syncFromPackageRoot(packageRoot, label) {
  process.stdout.write(`Bundling ${label}\n`);

  // Package layout is build/<...>.js plus icons/<name>.png.
  const specsRoot = join(packageRoot, "build");
  const allJs = await listBuiltSpecs(packageRoot);

  // Derive index.json from the files we bundle rather than from the package's
  // build/index.json, so the index always matches what is on disk.
  const { completions, diffVersioned } = deriveIndexFromJs(allJs);

  const keptCompletions = [...completions].sort();
  const keptDiff = [...diffVersioned].sort();

  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });

  // index.json
  await writeAsset(
    "index.json",
    Buffer.from(
      formatIndex({
        completions: keptCompletions,
        diffVersionedCompletions: keptDiff,
      }),
    ),
  );

  // spec files
  let copied = 0;
  await runPool(allJs, async (rel) => {
    const dest = join(outDir, rel);
    await mkdir(dirname(dest), { recursive: true });
    await cp(join(specsRoot, rel), dest);
    copied += 1;
    if (copied % 200 === 0 || copied === allJs.length) {
      process.stdout.write(`Copied ${copied}/${allJs.length} spec files\n`);
    }
  });

  // icons (only those the app references, if present in the package)
  const wantedIcons = new Set(await iconNames());
  const iconsRoot = join(packageRoot, "icons");
  let icons = 0;
  try {
    for (const entry of await readdir(iconsRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".png")) continue;
      if (
        wantedIcons.size &&
        !wantedIcons.has(entry.name.replace(/\.png$/, ""))
      )
        continue;
      await cp(join(iconsRoot, entry.name), join(outDir, "icons", entry.name));
      icons += 1;
    }
  } catch {
    process.stdout.write("warning: no icons/ in package\n");
  }

  process.stdout.write(
    `Bundled ${keptCompletions.length} specs, ${keptDiff.length} diff indexes, and ${icons} icons into ${outDir}\n`,
  );
}

process.stdout.write("Building packages/autocomplete-specs\n");
// Through turbo, so an unchanged specs package is restored from the cache instead of recompiled.
execFileSync("pnpm", ["turbo", "build", "--filter=@easy-complete/autocomplete-specs"], {
  cwd: repoDir,
  stdio: "inherit",
});
await syncFromPackageRoot(specsPackageDir, `specs from ${relative(repoDir, specsPackageDir)}`);

// Bundle the remote icons the specs reference so rendering suggestions stays offline.
await localizeSpecIcons(outDir);

// The spec sources have no spec for our own CLI, so generate it from clap and
// append it to the freshly written bundle. Must run last: the sync modes above
// wipe outDir. Set EC_SPEC_SKIP=1 to opt out.
await generateEcSpec();
