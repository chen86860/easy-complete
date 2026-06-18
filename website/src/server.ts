import handler from "@tanstack/react-start/server-entry";

interface Env {
  SITE_ORIGIN?: string;
}

function siteOrigin(request: Request, env: Env): string {
  const configuredOrigin = env.SITE_ORIGIN?.trim().replace(/\/$/, "");
  return configuredOrigin || new URL(request.url).origin;
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

    if (url.pathname === "/robots.txt") {
      return textResponse(
        [
          "User-agent: *",
          "Allow: /",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n"),
        "text/plain; charset=utf-8",
      );
    }

    if (url.pathname === "/sitemap.xml") {
      return textResponse(
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          "  <url>",
          `    <loc>${origin}/</loc>`,
          "    <priority>1.0</priority>",
          "  </url>",
          "</urlset>",
          "",
        ].join("\n"),
        "application/xml; charset=utf-8",
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
