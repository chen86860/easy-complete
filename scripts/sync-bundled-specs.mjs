#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { generateEcSpec } from "./generate-ec-spec.mjs";
import { localizeSpecIcons } from "./localize-spec-icons.mjs";

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");

// Spec filtering settings live in specs.config.json so they can be edited and reviewed
// without touching this script.
//   { "exclude": ["aws"] }
const config = JSON.parse(
  await readFile(join(repoDir, "specs.config.json"), "utf8"),
);

// Source: the workspace package packages/autocomplete-specs. This script builds it
// (build/<name>.js, nested specs, <name>/index.js for diff-versioned ones) and copies
// the result plus icons/<name>.png into bundle/specs, so the bundle always matches
// the spec sources in this repository.
const specsPackageDir = join(repoDir, "packages", "autocomplete-specs");

const outDir =
  process.env.BUNDLED_SPECS_DIR || join(repoDir, "bundle", "specs");
const iconListPath = join(
  repoDir,
  "packages",
  "autocomplete-app",
  "src",
  "fig",
  "icons.ts",
);

const concurrency = Number(process.env.BUNDLED_SPECS_CONCURRENCY || 16);

// Spec namespaces to exclude from the bundle (config.exclude, e.g. ["aws","gcloud","az"]).
// A namespace `ns` drops the top-level `ns` spec and everything under `ns/`. Excluded
// specs are absent from both the files on disk AND the written index.json, so the runtime
// loader never references them (there is no network fallback — see protocol/spec.rs).
//
// Current repo default ["aws", "az"]: the AWS and Azure CLI specs are large and
// most users never trigger them. Edit specs.config.json to change.
// Env override BUNDLED_SPECS_EXCLUDE is comma-separated ("" = exclude nothing) and wins.
// Re-run this script after changing the list; build-app.sh reuses bundle/specs as-is.
const exclude = (
  process.env.BUNDLED_SPECS_EXCLUDE !== undefined
    ? process.env.BUNDLED_SPECS_EXCLUDE.split(",")
    : (config.exclude ?? [])
)
  .map((s) => s.trim())
  .filter(Boolean);

function isExcluded(name) {
  return exclude.some((ns) => name === ns || name.startsWith(`${ns}/`));
}

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
  const allJs = await walkJs(specsRoot); // relative paths, e.g. "aws/ec2.js", "az/index.js"

  // Derive index.json from the files we bundle. This intentionally does not trust
  // the package's build/index.json because entrypoints such as dynamic/index.js
  // may exist in build/ without being listed there.
  const { completions, diffVersioned } = deriveIndexFromJs(allJs);

  // Apply the namespace exclusion to names and to the files we copy. Also drop the
  // package's root-level `index.js` (the compiler's aggregate barrel, not a real spec).
  const keepJs = allJs.filter(
    (rel) => rel !== "index.js" && !isExcluded(rel.slice(0, -3)),
  );
  const keptCompletions = completions.filter((n) => !isExcluded(n)).sort();
  const keptDiff = diffVersioned.filter((n) => !isExcluded(n)).sort();
  const excludedCount = completions.length - keptCompletions.length;

  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });

  // index.json
  await writeAsset(
    "index.json",
    Buffer.from(
      JSON.stringify({
        completions: keptCompletions,
        diffVersionedCompletions: keptDiff,
      }),
    ),
  );

  // spec files
  let copied = 0;
  await runPool(keepJs, async (rel) => {
    const dest = join(outDir, rel);
    await mkdir(dirname(dest), { recursive: true });
    await cp(join(specsRoot, rel), dest);
    copied += 1;
    if (copied % 200 === 0 || copied === keepJs.length) {
      process.stdout.write(`Copied ${copied}/${keepJs.length} spec files\n`);
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

  if (exclude.length) {
    process.stdout.write(
      `Excluding [${exclude.join(", ")}] — dropped ${excludedCount} spec entries\n`,
    );
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
