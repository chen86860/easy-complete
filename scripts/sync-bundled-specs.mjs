#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);

const SPEC_BASE_URL = "https://specs.q.us-east-1.amazonaws.com/";

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");

// Spec filtering settings live in specs.config.json so they can be edited and reviewed
// without touching this script. The package version is pinned by package.json/pnpm-lock.
// Env vars still override source settings for CI / one-off tries.
//   { "exclude": ["aws"] }
const config = JSON.parse(
  await readFile(join(repoDir, "specs.config.json"), "utf8"),
);

// Source: an npm package published from the forked spec repo. The package contains
// build/<name>.js (+ nested + <name>/index.js for diff-versioned), build/index.json,
// and icons/<name>.png. We install it as a normal devDependency so package.json and
// pnpm-lock.yaml are the source of truth for the pinned version.
//
// PINNED by the lockfile — NOT "latest" — so builds are reproducible: the bundle changes
// only when the dependency changes. To adopt a newer fork build:
//   1. bump @chen86860/autocomplete-specs in package.json/pnpm-lock.yaml
//   2. re-run `node scripts/sync-bundled-specs.mjs`
//   3. commit the regenerated bundle/specs together with the dependency update
// Overrides: BUNDLED_SPECS_PACKAGE=<pkg>, BUNDLED_SPECS_VERSION=<version|latest>,
// BUNDLED_SPECS_PACKAGE_TARBALL=<full-url>, BUNDLED_SPECS_NPM_REGISTRY=<registry>,
// or BUNDLED_SPECS_SOURCE=cdn to fall back to the legacy per-file CDN sync.
const SPECS_PACKAGE =
  process.env.BUNDLED_SPECS_PACKAGE ||
  config.package ||
  "@chen86860/autocomplete-specs";
const SPECS_VERSION = process.env.BUNDLED_SPECS_VERSION || config.version;
const SPECS_NPM_REGISTRY =
  process.env.BUNDLED_SPECS_NPM_REGISTRY ||
  config.registry ||
  "https://registry.npmjs.org/";
const packageTarballUrl = process.env.BUNDLED_SPECS_PACKAGE_TARBALL;
const sourceMode = process.env.BUNDLED_SPECS_SOURCE || "dependency";

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

function registryPackageUrl(registry, packageName) {
  const base = registry.endsWith("/") ? registry : `${registry}/`;
  return new URL(encodeURIComponent(packageName), base);
}

async function findPackageRoot(entryPath) {
  let current = dirname(entryPath);
  while (current !== dirname(current)) {
    try {
      const pkg = JSON.parse(
        await readFile(join(current, "package.json"), "utf8"),
      );
      if (pkg.name === SPECS_PACKAGE) {
        return { packageRoot: current, version: pkg.version };
      }
    } catch {
      // Keep walking up until we find the package root.
    }
    current = dirname(current);
  }

  throw new Error(`Unable to locate package root for ${SPECS_PACKAGE}`);
}

async function resolveInstalledPackage() {
  let entryPath;
  try {
    entryPath = require.resolve(SPECS_PACKAGE, { paths: [repoDir] });
  } catch (err) {
    throw new Error(
      `Unable to resolve ${SPECS_PACKAGE}. Run \`pnpm install\` or add it to devDependencies.`,
      { cause: err },
    );
  }

  const resolved = await findPackageRoot(entryPath);
  return { ...resolved, entryPath };
}

async function resolveNpmPackage() {
  if (packageTarballUrl) {
    return {
      version: SPECS_VERSION,
      tarball: packageTarballUrl,
      shasum: undefined,
    };
  }

  if (!SPECS_PACKAGE) {
    throw new Error("Missing specs package name");
  }
  if (!SPECS_VERSION) {
    throw new Error(
      "Missing specs package version. Set BUNDLED_SPECS_VERSION or use the default dependency source.",
    );
  }

  const metadata = JSON.parse(
    (
      await fetchBytes(registryPackageUrl(SPECS_NPM_REGISTRY, SPECS_PACKAGE))
    ).toString(),
  );
  const version =
    SPECS_VERSION === "latest" ? metadata["dist-tags"]?.latest : SPECS_VERSION;
  const release = metadata.versions?.[version];
  if (!release?.dist?.tarball) {
    throw new Error(`Unable to resolve ${SPECS_PACKAGE}@${SPECS_VERSION}`);
  }

  return {
    version,
    tarball: release.dist.tarball,
    shasum: release.dist.shasum,
  };
}

async function syncFromPackageRoot(packageRoot, label) {
  process.stdout.write(`Bundling ${label}\n`);

  // npm package layout is build/<...>.js plus icons/<name>.png.
  const specsRoot = join(packageRoot, "build");
  const allJs = await walkJs(specsRoot); // relative paths, e.g. "aws/ec2.js", "az/index.js"

  // Derive index.json from the files we bundle. This intentionally does not trust
  // the package's build/index.json because package entrypoints such as dynamic/index.js
  // may exist in the tarball without being listed there.
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

  // icons (only those the app references, if present in the archive)
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

// ── Mode A: read the installed npm dependency and assemble bundle/specs ───────
async function syncFromInstalledDependency() {
  const resolved = await resolveInstalledPackage();
  await syncFromPackageRoot(
    resolved.packageRoot,
    `${SPECS_PACKAGE}@${resolved.version} from ${resolved.packageRoot}`,
  );
}

// ── Mode B (legacy): download the npm package tarball explicitly ──────────────
async function syncFromNpmPackage() {
  const resolved = await resolveNpmPackage();
  process.stdout.write(
    `Downloading ${SPECS_PACKAGE}@${resolved.version} from ${resolved.tarball}\n`,
  );
  const packageBytes = await fetchBytes(resolved.tarball);
  if (resolved.shasum) {
    const actual = createHash("sha1").update(packageBytes).digest("hex");
    if (actual !== resolved.shasum) {
      throw new Error(
        `Integrity check failed for ${SPECS_PACKAGE}@${resolved.version}: expected ${resolved.shasum}, got ${actual}`,
      );
    }
  }

  const work = join(tmpdir(), `ec-specs-${process.pid}`);
  await rm(work, { force: true, recursive: true });
  await mkdir(work, { recursive: true });
  const tarPath = join(work, "package.tgz");
  await writeFile(tarPath, packageBytes);
  await execFileAsync("tar", ["-xzf", tarPath, "-C", work]);

  try {
    await syncFromPackageRoot(
      join(work, "package"),
      `${SPECS_PACKAGE}@${resolved.version} from ${resolved.tarball}`,
    );
  } finally {
    await rm(work, { force: true, recursive: true });
  }
}

// ── Mode C (legacy): fetch index.json + each spec file from the per-file CDN ──
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

if (sourceMode === "dependency") {
  await syncFromInstalledDependency();
} else if (sourceMode === "npm") {
  await syncFromNpmPackage();
} else if (sourceMode === "cdn") {
  await syncFromCdn();
} else {
  throw new Error(`Unsupported BUNDLED_SPECS_SOURCE: ${sourceMode}`);
}
