import handler from "@tanstack/react-start/server-entry";

interface Env {
  SITE_ORIGIN?: string;
}

const INDEXABLE_ROUTES = [
  "/",
  "/install",
  "/terminals/ghostty",
  "/fig-alternative",
  "/troubleshooting",
  "/privacy",
] as const;

function siteOrigin(request: Request, env: Env): string {
  const configuredOrigin = env.SITE_ORIGIN?.trim().replace(/\/$/, "");
  return configuredOrigin || new URL(request.url).origin;
}

/**
 * Collapse trailing-slash and case variants onto the canonical route with a
 * permanent redirect, so crawlers consolidate them instead of treating each
 * variant as its own URL.
 */
function canonicalRedirect(url: URL, origin: string): Response | undefined {
  const pathname = url.pathname;

  if (pathname === "/" || pathname.startsWith("/assets/")) {
    return undefined;
  }

  const trimmed = pathname.replace(/\/+$/, "") || "/";
  const canonical =
    INDEXABLE_ROUTES.find(
      (route) => route.toLowerCase() === trimmed.toLowerCase()
    ) ?? trimmed;

  if (canonical === pathname) {
    return undefined;
  }

  return Response.redirect(`${origin}${canonical}${url.search}`, 301);
}

function textResponse(body: string, contentType: string): Response {
  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": contentType,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = siteOrigin(request, env);

    const redirect = canonicalRedirect(url, origin);
    if (redirect) {
      return redirect;
    }

    if (url.pathname === "/robots.txt") {
      return textResponse(
        [
          "User-agent: *",
          "Allow: /",
          // Cloudflare AI Labyrinth serves generated decoy pages under this
          // path; keep them out of the crawl queue.
          "Disallow: /cdn-cgi/content",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n"),
        "text/plain; charset=utf-8"
      );
    }

    if (url.pathname === "/sitemap.xml") {
      const lastModified = "2026-07-16";
      const urls = INDEXABLE_ROUTES.flatMap((path) => [
        "  <url>",
        `    <loc>${origin}${path}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        "  </url>",
      ]);

      return textResponse(
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
          "",
        ].join("\n"),
        "application/xml; charset=utf-8"
      );
    }

    const response = await handler.fetch(request);

    if (!response.headers.get("Content-Type")?.includes("text/html")) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=300");

    const body = (await response.text()).replaceAll("__SITE_ORIGIN__", origin);

    return new Response(body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  },
};
