/**
 * Notify search engines after a deploy. Runs at the tail of `pnpm deploy`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/notify-search-engines.ts
 *   node --experimental-strip-types scripts/notify-search-engines.ts --dry-run
 *   node --experimental-strip-types scripts/notify-search-engines.ts --check
 *
 * Three independent channels. A missing credential skips that channel, and no
 * failure fails the deploy — the code is already live, so a failed ping is a
 * retryable detail that shouldn't turn the exit code red.
 *
 *   ① Google — Search Console API `sitemaps.submit`.
 *      The only surviving official entry point since the anonymous ping
 *      endpoint (google.com/ping) was retired in January 2024. It means
 *      "re-fetch my sitemap", NOT "re-index these URLs" — what actually decides
 *      whether Google comes back to a page is the `lastmod` in the sitemap, so
 *      this is only worth anything if `INDEXABLE_ROUTES` in `src/server.ts`
 *      carries honest dates. Bump a date only when that page's copy changes.
 *      Google still has no per-URL reindex API for ordinary pages: the Indexing
 *      API officially covers JobPosting and BroadcastEvent only, which this
 *      site is not — so we don't touch it.
 *      Credentials, either one:
 *        GOOGLE_SERVICE_ACCOUNT_KEY_FILE  path to the service account JSON
 *                                         (local; defaults to .secrets/gsc-service-account.json)
 *        GOOGLE_SERVICE_ACCOUNT_KEY       the JSON itself (CI; paste into a secret)
 *      The account needs to be a "full user" on the Search Console property —
 *      owner is an Indexing API requirement we don't need. No GCP IAM role is
 *      required; just enable the Google Search Console API on the project.
 *
 *   ② IndexNow — covers Bing / Yandex / Seznam / Naver. Google does not
 *      participate. Cloudflare Crawler Hints already pushes IndexNow off its
 *      own cache signals; this is the precise version: on deploy, push exactly
 *      the URL list we know changed. Unset INDEXNOW_KEY to rely on Crawler
 *      Hints alone.
 *
 *   ③ Baidu — the only one here that genuinely accepts programmatic per-URL
 *      submissions. Needs BAIDU_PUSH_TOKEN. Worth it for the /zh pages.
 */
import { readFileSync } from "node:fs";

const SITE_ORIGIN = "https://easy-complete.emmmm.dev";
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
/**
 * The property identifier in Search Console. It must match what's registered
 * there exactly: a "domain property" is `sc-domain:`-prefixed, a "URL prefix
 * property" starts with `https://`, and the two are separate resources — the
 * wrong one 404s. Run `--check` to list what the service account can see.
 *
 * If you consolidate onto the root-domain property (`sc-domain:emmmm.dev`,
 * which covers every subdomain), set GSC_SITE_URL to that instead.
 */
const GSC_SITE_URL =
  process.env.GSC_SITE_URL || "sc-domain:easy-complete.emmmm.dev";

const DRY_RUN = process.argv.includes("--dry-run");
const CHECK = process.argv.includes("--check");

type Outcome = { channel: string; ok: boolean; detail: string };

/** Default credential location — drop the file in and it works. Gitignored. */
const DEFAULT_KEY_FILE = new URL(
  "../.secrets/gsc-service-account.json",
  import.meta.url,
);

/** Prefer the file (convenient locally), then the inline JSON (easy as a CI secret). */
function readServiceAccountKey(): string | undefined {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (inline) return inline;

  const path = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
  const target = path
    ? new URL(path, `file://${process.cwd()}/`)
    : DEFAULT_KEY_FILE;

  try {
    return readFileSync(target, "utf8");
  } catch {
    return undefined;
  }
}

/**
 * Read the URLs off the live sitemap rather than importing the local module, so
 * what gets pushed is what actually shipped.
 */
async function fetchSitemapUrls(): Promise<string[]> {
  const response = await fetch(SITEMAP_URL, {
    headers: { "User-Agent": "easy-complete.emmmm.dev deploy notifier" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch the sitemap: HTTP ${response.status}`);
  }

  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"'),
  );

  if (urls.length === 0) throw new Error("No <loc> parsed out of the sitemap");
  return urls;
}

/**
 * Trade the service account JWT for an access token. Pulling in
 * google-auth-library for one call isn't worth it — sign it by hand.
 */
async function getGoogleAccessToken(serviceAccountKey: string): Promise<string> {
  const { createSign } = await import("node:crypto");
  const key = JSON.parse(serviceAccountKey) as {
    client_email: string;
    private_key: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const base64url = (input: string) => Buffer.from(input).toString("base64url");
  const claim = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/webmasters",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const signature = createSign("RSA-SHA256")
    .update(`${header}.${claim}`)
    .sign(key.private_key, "base64url");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${signature}`,
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };
  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Failed to get an access token: ${payload.error_description || `HTTP ${response.status}`}`,
    );
  }

  return payload.access_token;
}

/**
 * Self-check: list the properties and permission levels this service account
 * can see. Discovering a permission mismatch at deploy time is too late, so
 * this gets its own `pnpm notify:check`.
 */
async function checkGoogleAccess(): Promise<void> {
  const serviceAccountKey = readServiceAccountKey();

  if (!serviceAccountKey) {
    console.error(
      "✗ No service account credential found. Put the JSON at .secrets/gsc-service-account.json,\n" +
        "  or set GOOGLE_SERVICE_ACCOUNT_KEY_FILE / GOOGLE_SERVICE_ACCOUNT_KEY.",
    );
    process.exitCode = 1;
    return;
  }

  const { client_email: clientEmail } = JSON.parse(serviceAccountKey) as {
    client_email: string;
  };
  console.log(
    `Service account: ${clientEmail}\nExpected property: ${GSC_SITE_URL}\n`,
  );

  const token = await getGoogleAccessToken(serviceAccountKey);
  const response = await fetch(
    "https://www.googleapis.com/webmasters/v3/sites",
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    console.error(
      `✗ Failed to list properties: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`,
    );
    process.exitCode = 1;
    return;
  }

  const { siteEntry = [] } = (await response.json()) as {
    siteEntry?: { siteUrl: string; permissionLevel: string }[];
  };

  if (siteEntry.length === 0) {
    console.error(
      "✗ This service account sees no properties in Search Console — the email hasn't been added as a user yet.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("Visible properties:");
  for (const entry of siteEntry) {
    console.log(`  ${entry.permissionLevel.padEnd(20)} ${entry.siteUrl}`);
  }

  const matched = siteEntry.find((entry) => entry.siteUrl === GSC_SITE_URL);

  if (!matched) {
    console.error(
      `\n✗ ${GSC_SITE_URL} is not in that list.\n` +
        '  A "domain property" and a "URL prefix property" are different resources; siteUrl must match exactly.\n' +
        "  Set GSC_SITE_URL to one of the values above (domain properties look like sc-domain:example.com).",
    );
    process.exitCode = 1;
    return;
  }

  // siteRestrictedUser can read the list but gets a 403 on sitemap submit.
  if (matched.permissionLevel === "siteRestrictedUser") {
    console.error(
      `\n✗ Permission is ${matched.permissionLevel}; a restricted user cannot submit sitemaps. Make it a full user.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `\n✓ ${GSC_SITE_URL} has permission ${matched.permissionLevel} — sitemap submission will work.`,
  );
}

async function submitSitemapToGoogle(): Promise<Outcome> {
  const channel = "Google (Search Console sitemaps.submit)";
  const serviceAccountKey = readServiceAccountKey();

  if (!serviceAccountKey) {
    return { channel, ok: true, detail: "skipped: no service account credential" };
  }
  if (DRY_RUN) {
    return { channel, ok: true, detail: `dry-run: would submit ${SITEMAP_URL}` };
  }

  const token = await getGoogleAccessToken(serviceAccountKey);
  const endpoint =
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}` +
    `/sitemaps/${encodeURIComponent(SITEMAP_URL)}`;

  // Success is an empty 204; this method takes no request body.
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} ${body.slice(0, 300)}`);
  }

  return {
    channel,
    ok: true,
    detail: `submitted ${SITEMAP_URL} (property ${GSC_SITE_URL})`,
  };
}

async function pushToIndexNow(urls: string[]): Promise<Outcome> {
  const channel = "IndexNow (Bing / Yandex / Seznam / Naver)";
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return {
      channel,
      ok: true,
      detail:
        "skipped: INDEXNOW_KEY unset (Cloudflare Crawler Hints already pushes)",
    };
  }
  if (DRY_RUN) {
    return { channel, ok: true, detail: `dry-run: would push ${urls.length} URLs` };
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_ORIGIN).host,
      key,
      keyLocation: `${SITE_ORIGIN}/${key}.txt`,
      urlList: urls,
    }),
  });

  // 200 accepted; 202 accepted but the key is still being verified.
  if (!response.ok && response.status !== 202) {
    throw new Error(
      `HTTP ${response.status} ${(await response.text()).slice(0, 300)}`,
    );
  }

  return {
    channel,
    ok: true,
    detail: `pushed ${urls.length} URLs (HTTP ${response.status})`,
  };
}

async function pushToBaidu(urls: string[]): Promise<Outcome> {
  const channel = "Baidu (data.zz.baidu.com)";
  const token = process.env.BAIDU_PUSH_TOKEN;

  if (!token) return { channel, ok: true, detail: "skipped: BAIDU_PUSH_TOKEN unset" };
  if (DRY_RUN) {
    return { channel, ok: true, detail: `dry-run: would push ${urls.length} URLs` };
  }

  const host = new URL(SITE_ORIGIN).host;
  const response = await fetch(
    `http://data.zz.baidu.com/urls?site=${host}&token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: urls.join("\n"),
    },
  );

  const payload = (await response.json()) as {
    success?: number;
    remain?: number;
    message?: string;
  };
  if (!response.ok || payload.success === undefined) {
    throw new Error(payload.message || `HTTP ${response.status}`);
  }

  return {
    channel,
    ok: true,
    detail: `${payload.success} accepted, ${payload.remain} left in today's quota`,
  };
}

if (CHECK) {
  await checkGoogleAccess();
  process.exit(process.exitCode ?? 0);
}

const urls = await fetchSitemapUrls();
console.log(
  `[notify] sitemap has ${urls.length} URLs${DRY_RUN ? " (dry-run, no requests sent)" : ""}\n`,
);

const results = await Promise.allSettled([
  submitSitemapToGoogle(),
  pushToIndexNow(urls),
  pushToBaidu(urls),
]);

let failed = 0;
for (const result of results) {
  if (result.status === "fulfilled") {
    console.log(`  ✓ ${result.value.channel}\n    ${result.value.detail}`);
  } else {
    failed += 1;
    console.warn(
      `  ✗ ${result.reason instanceof Error ? result.reason.message : result.reason}`,
    );
  }
}

// The site is already live; a failed ping just means it wasn't pushed. Re-run
// this script — don't make the deploy look like it failed.
if (failed > 0) {
  console.warn(
    `\n[notify] ${failed} channel(s) failed (the deploy is unaffected; re-run this script on its own)`,
  );
}
