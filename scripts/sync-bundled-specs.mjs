#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SPEC_BASE_URL = "https://specs.q.us-east-1.amazonaws.com/";

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");

// All spec-source settings live in specs.config.json so they can be edited and reviewed
// without touching this script. Env vars still override (handy for CI / one-off tries).
//   { "repo": "owner/repo", "tag": "spec-build-number-X.Y.Z", "exclude": ["aws"] }
const config = JSON.parse(
  await readFile(join(repoDir, "specs.config.json"), "utf8"),
);

// Source: a specs.zip published by the forked spec repo's "Build and release specs"
// workflow. The zip contains specs/<name>.js (+ nested + <name>/index.js for
// diff-versioned) and specs/icons/<name>.png; we derive index.json from the file tree.
//
// PINNED to config.tag — NOT "latest" — so builds are reproducible: the bundle changes
// only when specs.config.json changes. To adopt a newer fork build:
//   1. bump "tag" in specs.config.json to the new spec-build-number-* release
//   2. re-run `node scripts/sync-bundled-specs.mjs`
//   3. commit the regenerated bundle/specs together with the config change
// Overrides: BUNDLED_SPECS_TAG=<tag|latest>, or BUNDLED_SPECS_RELEASE_ZIP=<full-url>,
// or BUNDLED_SPECS_RELEASE_ZIP="" to fall back to the legacy per-file CDN sync.
const SPECS_REPO = config.repo;
const SPECS_TAG = process.env.BUNDLED_SPECS_TAG || config.tag;
const releaseZipUrl =
  process.env.BUNDLED_SPECS_RELEASE_ZIP ??
  (SPECS_TAG === "latest"
    ? `https://github.com/${SPECS_REPO}/releases/latest/download/specs.zip`
    : `https://github.com/${SPECS_REPO}/releases/download/${SPECS_TAG}/specs.zip`);

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
const maxAttempts = Number(process.env.BUNDLED_SPECS_FETCH_ATTEMPTS || 5);

// Spec namespaces to exclude from the bundle (config.exclude, e.g. ["aws","gcloud","az"]).
// A namespace `ns` drops the top-level `ns` spec and everything under `ns/`. Excluded
// specs are absent from both the files on disk AND the written index.json, so the runtime
// loader never references them (there is no network fallback — see protocol/spec.rs).
//
// Default ["aws"]: the AWS CLI specs are ~36 MB / 419 entries and most users never trigger
// them, so they are dropped to roughly halve the bundle. Edit specs.config.json to change.
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

function urlFor(path) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return new URL(encodedPath, SPEC_BASE_URL);
}

async function fetchBytes(url) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
      if (response.status < 500 && response.status !== 429) {
        throw new Error(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
        );
      }
      lastError = new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
      );
    } catch (err) {
      lastError = err;
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
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

// ── Mode A: download the forked repo's specs.zip and assemble bundle/specs ────
async function syncFromReleaseZip() {
  process.stdout.write(`Downloading specs.zip from ${releaseZipUrl}\n`);
  const zipBytes = await fetchBytes(releaseZipUrl);

  const work = join(tmpdir(), `ec-specs-${process.pid}`);
  await rm(work, { force: true, recursive: true });
  await mkdir(work, { recursive: true });
  const zipPath = join(work, "specs.zip");
  await writeFile(zipPath, zipBytes);
  await execFileAsync("unzip", ["-q", zipPath, "-d", work]);

  // Archive layout is specs/<...>.js plus specs/icons/<name>.png.
  const specsRoot = join(work, "specs");
  const allJs = await walkJs(specsRoot); // relative paths, e.g. "aws/ec2.js", "az/index.js"

  // index.json derivation (validated against the upstream index format):
  //   diffVersionedCompletions = directories that contain an `index.js`
  //   completions = every .js stem whose basename != "index", plus the diff names
  const diffVersioned = new Set();
  for (const rel of allJs) {
    if (rel.endsWith("/index.js")) diffVersioned.add(dirname(rel));
  }
  const completions = new Set(diffVersioned);
  for (const rel of allJs) {
    const stem = rel.slice(0, -3); // strip .js
    if (stem.split("/").pop() !== "index") completions.add(stem);
  }

  // Apply the namespace exclusion to names and to the files we copy. Also drop the
  // archive's root-level `index.js` (the compiler's aggregate barrel, not a real spec).
  const keepJs = allJs.filter(
    (rel) => rel !== "index.js" && !isExcluded(rel.slice(0, -3)),
  );
  const keptCompletions = [...completions].filter((n) => !isExcluded(n)).sort();
  const keptDiff = [...diffVersioned].filter((n) => !isExcluded(n)).sort();
  const excludedCount =
    completions.size - keptCompletions.length;

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

  // icons (only those the app references, if present in the archive)
  const wantedIcons = new Set(await iconNames());
  const iconsRoot = join(specsRoot, "icons");
  let icons = 0;
  try {
    for (const entry of await readdir(iconsRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".png")) continue;
      if (wantedIcons.size && !wantedIcons.has(entry.name.replace(/\.png$/, "")))
        continue;
      await cp(join(iconsRoot, entry.name), join(outDir, "icons", entry.name));
      icons += 1;
    }
  } catch {
    process.stdout.write("warning: no icons/ in archive\n");
  }

  await rm(work, { force: true, recursive: true });

  if (exclude.length) {
    process.stdout.write(
      `Excluding [${exclude.join(", ")}] — dropped ${excludedCount} spec entries\n`,
    );
  }
  process.stdout.write(
    `Bundled ${keptCompletions.length} specs, ${keptDiff.length} diff indexes, and ${icons} icons into ${outDir}\n`,
  );
}

// ── Mode B (legacy): fetch index.json + each spec file from the per-file CDN ──
async function syncFromCdn() {
  const index = JSON.parse((await fetchBytes(urlFor("index.json"))).toString());
  const allCompletions = Array.isArray(index.completions)
    ? index.completions
    : [];
  const allDiffVersioned = Array.isArray(index.diffVersionedCompletions)
    ? index.diffVersionedCompletions
    : [];

  const completions = allCompletions.filter((name) => !isExcluded(name));
  const diffVersioned = allDiffVersioned.filter((name) => !isExcluded(name));
  const excludedCount =
    allCompletions.length -
    completions.length +
    (allDiffVersioned.length - diffVersioned.length);
  const diffVersionedSet = new Set(diffVersioned);
  const icons = await iconNames();

  const filteredIndex = {
    ...index,
    completions,
    diffVersionedCompletions: diffVersioned,
  };

  const files = [
    ...completions
      .filter((name) => !diffVersionedSet.has(name))
      .map((name) => `${name}.js`),
    ...diffVersioned.map((name) => `${name}/index.js`),
    ...icons.map((name) => `icons/${name}.png`),
  ];

  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });
  await writeAsset("index.json", Buffer.from(JSON.stringify(filteredIndex)));
  if (exclude.length) {
    process.stdout.write(
      `Excluding [${exclude.join(", ")}] — dropped ${excludedCount} spec entries\n`,
    );
  }

  let completed = 0;
  await runPool(files, async (path) => {
    await writeAsset(path, await fetchBytes(urlFor(path)));
    completed += 1;
    if (completed % 100 === 0 || completed === files.length) {
      process.stdout.write(
        `Synced ${completed}/${files.length} bundled spec assets\n`,
      );
    }
  });

  process.stdout.write(
    `Bundled ${completions.length} specs, ${diffVersioned.length} diff indexes, and ${icons.length} icons into ${outDir}\n`,
  );
}

if (releaseZipUrl) {
  await syncFromReleaseZip();
} else {
  await syncFromCdn();
}
