#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_BASE_URL = "https://specs.q.us-east-1.amazonaws.com/";
const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.env.BUNDLED_SPECS_DIR || join(repoDir, "bundle", "specs");
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
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
      }
      lastError = new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
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
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await task(item);
    }
  });
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
const completions = Array.isArray(index.completions) ? index.completions : [];
const diffVersioned = Array.isArray(index.diffVersionedCompletions)
  ? index.diffVersionedCompletions
  : [];
const diffVersionedSet = new Set(diffVersioned);
const icons = await iconNames();

const files = [
  "index.json",
  ...completions
    .filter((name) => !diffVersionedSet.has(name))
    .map((name) => `${name}.js`),
  ...diffVersioned.map((name) => `${name}/index.js`),
  ...icons.map((name) => `icons/${name}.png`),
];

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

let completed = 0;
await runPool(files, async (path) => {
  await writeAsset(path, await fetchBytes(path));
  completed += 1;
  if (completed % 100 === 0 || completed === files.length) {
    process.stdout.write(`Synced ${completed}/${files.length} bundled spec assets\n`);
  }
});

process.stdout.write(
  `Bundled ${completions.length} specs, ${diffVersioned.length} diff indexes, and ${icons.length} icons into ${outDir}\n`,
);
