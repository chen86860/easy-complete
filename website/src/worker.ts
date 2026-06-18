/**
 * Cloudflare Worker entry for the Easy Complete landing page.
 *
 * The site is a static Vite/React build served from the ASSETS binding.
 * The Worker fronts the assets so we can add headers without changing the
 * deploy model.
 */

export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const response = await env.ASSETS.fetch(request);

    // Long-cache fingerprinted assets, keep HTML fresh.
    if (url.pathname.startsWith("/assets/")) {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(response.body, { ...response, headers });
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
