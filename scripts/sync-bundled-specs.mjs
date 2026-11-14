#!/usr/bin/env node
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { generateEcSpec } from "./generate-ec-spec.mjs";
import { localizeSpecIcons, matchesLocalized } from "./localize-spec-icons.mjs";

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");

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

// --check: compare the committed bundle with what a sync would produce, without writing
// anything or using the network. It covers the spec files, index.json and the package
// icons. It does not cover ec.js (generated from the ec binary) or the bytes of the
// downloaded remote icons.
async function checkAgainstPackageRoot(packageRoot) {
  const specsRoot = join(packageRoot, "build");
  const allJs = await listBuiltSpecs(packageRoot);
  const { completions, diffVersioned } = deriveIndexFromJs(allJs);
  const problems = [];

  const bundledJs = new Set((await walkJs(outDir)).filter((rel) => rel !== "ec.js"));
  for (const rel of allJs) {
    if (!bundledJs.delete(rel)) {
      problems.push(`missing from bundle: ${rel}`);
      continue;
    }
    const [built, bundled] = await Promise.all([
      readFile(join(specsRoot, rel), "utf8"),
      readFile(join(outDir, rel), "utf8"),
    ]);
    if (!matchesLocalized(built, bundled)) problems.push(`out of date: ${rel}`);
  }
  for (const rel of bundledJs) problems.push(`not produced by the specs package: ${rel}`);

  const index = JSON.parse(await readFile(join(outDir, "index.json"), "utf8"));
  const sameList = (actual, expected) =>
    JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
  if (
    !sameList(
      index.completions.filter((name) => name !== "ec"),
      completions,
    ) ||
    !sameList(
      index.diffVersionedCompletions,
      diffVersioned,
    )
  ) {
    problems.push("out of date: index.json");
  }

  const wantedIcons = new Set(await iconNames());
  for (const entry of await readdir(join(packageRoot, "icons"), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".png")) continue;
    if (wantedIcons.size && !wantedIcons.has(entry.name.replace(/\.png$/, ""))) continue;
    const source = await readFile(join(packageRoot, "icons", entry.name));
    const bundled = await readFile(join(outDir, "icons", entry.name)).catch(() => null);
    if (!bundled?.equals(source)) problems.push(`out of date: icons/${entry.name}`);
  }

  if (problems.length) {
    const shown = problems.slice(0, 20).join("\n  ");
    const more = problems.length > 20 ? `\n  ... and ${problems.length - 20} more` : "";
    process.stderr.write(
      `bundle/specs does not match packages/autocomplete-specs:\n  ${shown}${more}\n` +
        "Run `node scripts/sync-bundled-specs.mjs` and commit the result.\n",
    );
    process.exit(1);
  }
  process.stdout.write(`bundle/specs is in sync (${allJs.length} spec files checked)\n`);
}

const checkOnly = process.argv.includes("--check");

process.stdout.write("Building packages/autocomplete-specs\n");
// Through turbo, so an unchanged specs package is restored from the cache instead of recompiled.
execFileSync("pnpm", ["turbo", "build", "--filter=@easy-complete/autocomplete-specs"], {
  cwd: repoDir,
  stdio: "inherit",
});
if (checkOnly) {
  await checkAgainstPackageRoot(specsPackageDir);
  process.exit(0);
}
await syncFromPackageRoot(specsPackageDir, `specs from ${relative(repoDir, specsPackageDir)}`);

// Bundle the remote icons the specs reference so rendering suggestions stays offline.
await localizeSpecIcons(outDir);

// The spec sources have no spec for our own CLI, so generate it from clap and
// append it to the freshly written bundle. Must run last: the sync modes above
// wipe outDir. Set EC_SPEC_SKIP=1 to opt out.
await generateEcSpec();
