#!/usr/bin/env node
// Bundles the remote icons that specs reference into <specsDir>/icons/remote/ and
// rewrites the spec files to load them over the local `spec://localhost/`
// protocol, so rendering a suggestion never fetches an image from GitHub, fig.io
// or a tool's website.
//
// The icons are committed in packages/autocomplete-specs/icons/remote/, named by a
// hash of their URL, so a build normally runs offline. Only a URL with no file
// there yet is downloaded, and the download is saved to that directory so it can
// be committed. Only plain string literals are rewritten; URLs built at runtime
// (template literals with `${}`) stay remote. An icon that cannot be downloaded
// after retries (404, 5xx, timeout, or a response that is not an image) is
// swapped for the generic box icon, so the bundle never references a remote
// image. If many downloads fail for reasons other than a dead link, the network
// is probably down and the sync aborts instead of shipping a bundle full of box
// icons.
//
// Standalone: `node scripts/localize-spec-icons.mjs [specsDir]`.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const LOCAL_PREFIX = "spec://localhost/icons/remote/";
const FALLBACK_ICON = "fig://icon?type=box";
// Share of candidates allowed to fail with a non-dead error before the sync aborts.
const MAX_TRANSIENT_FAILURE_RATIO = 0.1;
const IMAGE_EXT = /\.(png|svg|jpe?g|ico|gif|webp)(\?[^"]*)?$/i;
// Hosts that serve images from extension-less URLs.
const IMAGE_HOSTS = new Set([
  "avatars.githubusercontent.com",
  "cdn.simpleicons.org",
]);
const EXT_BY_TYPE = {
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};
const LITERAL = /(icon:)?"(https?:\/\/[^"\s\\]+)"/g;

async function walkJs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "icons") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkJs(path)));
    else if (entry.name.endsWith(".js")) out.push(path);
  }
  return out;
}

function isIconCandidate(url, usedAsIcon) {
  if (usedAsIcon || IMAGE_EXT.test(url)) return true;
  try {
    return IMAGE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

class DeadLink extends Error {}

async function downloadOnce(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if ([400, 404, 410].includes(response.status)) {
    throw new DeadLink(`${response.status} ${response.statusText}`);
  }
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);
  const type = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim();
  const ext = EXT_BY_TYPE[type];
  if (!ext) throw new DeadLink(`not an image (${type || "no content-type"})`);
  return { bytes: Buffer.from(await response.arrayBuffer()), ext };
}

async function download(url) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await downloadOnce(url);
    } catch (err) {
      if (err instanceof DeadLink || attempt >= 4) throw err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");
export const iconCacheDir = join(repoDir, "packages", "autocomplete-specs", "icons", "remote");

const iconName = (url) => createHash("sha256").update(url).digest("hex").slice(0, 16);

export async function localizeSpecIcons(specsDir, cacheDir = iconCacheDir) {
  const files = await walkJs(specsDir);
  const sources = new Map();
  const candidates = new Set();
  for (const file of files) {
    const source = await readFile(file, "utf8");
    sources.set(file, source);
    for (const [, iconKey, url] of source.matchAll(LITERAL)) {
      if (isIconCandidate(url, Boolean(iconKey))) candidates.add(url);
    }
  }

  const outDir = join(specsDir, "icons", "remote");
  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });

  const cached = new Map();
  for (const file of await readdir(cacheDir)) {
    cached.set(file.split(".")[0], file);
  }

  const localByUrl = new Map();
  const failures = [];
  const downloaded = [];
  let transient = 0;
  const queue = [];
  for (const url of candidates) {
    const file = cached.get(iconName(url));
    if (file) {
      await copyFile(join(cacheDir, file), join(outDir, file));
      localByUrl.set(url, `${LOCAL_PREFIX}${file}`);
    } else {
      queue.push(url);
    }
  }
  const toDownload = queue.length;
  await Promise.all(
    Array.from({ length: Math.min(8, queue.length) }, async () => {
      while (queue.length) {
        const url = queue.shift();
        try {
          const { bytes, ext } = await download(url);
          const name = `${iconName(url)}.${ext}`;
          await writeFile(join(cacheDir, name), bytes);
          await writeFile(join(outDir, name), bytes);
          localByUrl.set(url, `${LOCAL_PREFIX}${name}`);
          downloaded.push(name);
        } catch (err) {
          localByUrl.set(url, FALLBACK_ICON);
          failures.push(`${url}: ${err.message ?? err}`);
          if (!(err instanceof DeadLink)) transient += 1;
        }
      }
    }),
  );

  if (transient > 0 && transient > toDownload * MAX_TRANSIENT_FAILURE_RATIO) {
    throw new Error(
      `${transient}/${toDownload} new spec icons failed with network errors; ` +
        "check connectivity and re-run the sync",
    );
  }

  let rewritten = 0;
  for (const [file, source] of sources) {
    const next = source.replace(LITERAL, (match, iconKey = "", url) => {
      const local = localByUrl.get(url);
      return local ? `${iconKey}"${local}"` : match;
    });
    if (next !== source) {
      await writeFile(file, next);
      rewritten += 1;
    }
  }

  process.stdout.write(
    `Localized ${localByUrl.size - failures.length}/${candidates.size} remote spec icons (${toDownload - failures.length} downloaded), replaced ${failures.length} unreachable ones (${rewritten} spec files rewritten)\n`,
  );
  for (const name of downloaded.sort()) {
    process.stdout.write(
      `new icon saved to ${relative(repoDir, join(cacheDir, name))}: commit it with the spec\n`,
    );
  }
  for (const line of failures.sort()) {
    process.stdout.write(
      `unreachable icon replaced with ${FALLBACK_ICON}: ${line}\n`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await localizeSpecIcons(process.argv[2] ?? join(repoDir, "bundle", "specs"));
}
