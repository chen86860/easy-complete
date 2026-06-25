#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_BASE_URL = "https://specs.q.us-east-1.amazonaws.com/";
const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");
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

// Comma-separated spec namespaces to exclude from the bundle, e.g. "aws,gcloud,az".
// A namespace `ns` drops the top-level `ns` spec and everything under `ns/`. Excluded
// specs are absent from both the files on disk AND the written index.json, so the runtime
// loader never references them (there is no network fallback — see protocol/spec.rs).
//
// Default: "aws" — the AWS CLI specs are ~36 MB / 419 entries and most users never trigger
// them, so they are dropped to roughly halve the bundle (~76 MB -> ~40 MB).
//   BUNDLED_SPECS_EXCLUDE=""            -> bundle every spec (restore aws)
//   BUNDLED_SPECS_EXCLUDE="aws,gcloud,az" -> trim the three big cloud CLIs (~62 MB saved)
// Re-run this script after changing the list; build-app.sh reuses bundle/specs as-is.
const exclude = (process.env.BUNDLED_SPECS_EXCLUDE ?? "aws")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isExcluded(name) {
  return exclude.some((ns) => name === ns || name.startsWith(`${ns}/`));
}

function urlFor(path) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return new URL(encodedPath, SPEC_BASE_URL);
}

async function fetchBytes(path) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(urlFor(path));
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
      if (response.status < 500 && response.status !== 429) {
        throw new Error(
          `Failed to fetch ${path}: ${response.status} ${response.statusText}`,
        );
      }
      lastError = new Error(
        `Failed to fetch ${path}: ${response.status} ${response.statusText}`,
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

async function fetchJson(path) {
  return JSON.parse((await fetchBytes(path)).toString("utf8"));
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

const index = await fetchJson("index.json");
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

// Write a filtered index.json so the runtime loader matches what's actually on disk.
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
  await writeAsset(path, await fetchBytes(path));
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
