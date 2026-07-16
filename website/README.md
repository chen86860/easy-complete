# Easy Complete — Landing Page

Marketing site for [Easy Complete](https://github.com/chen86860/easy-complete), built from the
Claude Design source (`Easy Complete.dc.html`).

**Stack:** TanStack Start + React + TypeScript + Tailwind CSS v4, deployed on Cloudflare
Workers with server-side rendering through `@cloudflare/vite-plugin`.

## Develop

```bash
pnpm install
pnpm dev          # Vite dev server (http://localhost:5173)
```

## Build

```bash
pnpm build        # TanStack Start SSR build + TypeScript check
pnpm preview      # preview the production build locally
```

## Deploy to Cloudflare Workers

```bash
pnpm cf-dev       # build + run the Worker locally via Wrangler
pnpm deploy       # build + wrangler deploy
```

Wrangler config lives in `wrangler.jsonc`. The custom server entry (`src/server.ts`) wraps the
TanStack Start Worker entry so the site can keep `/robots.txt`, `/sitemap.xml`, and production
origin injection for canonical/Open Graph URLs. Download CTAs link directly to the latest GitHub
Release DMG.

## Structure

| Path                               | Role                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `src/App.tsx`                      | Full landing page (header, hero, features, why, terminals, architecture, CTA)    |
| `src/routes/__root.tsx`            | TanStack Start document shell, global CSS, and shared document metadata          |
| `src/routes/index.tsx`             | Homepage route rendering `App` with homepage SEO and SoftwareApplication JSON-LD |
| `src/seo.tsx`                      | Route-level canonical, Open Graph, Twitter, and JSON-LD helpers                  |
| `src/routes/install.tsx`           | macOS installation guide                                                         |
| `src/routes/terminals.ghostty.tsx` | Ghostty integration guide                                                        |
| `src/routes/fig-alternative.tsx`   | Fig-alternative positioning page                                                 |
| `src/routes/troubleshooting.tsx`   | Terminal autocomplete troubleshooting guide                                      |
| `src/server.ts`                    | Cloudflare Worker entry wrapping TanStack Start SSR                              |
| `src/router.tsx`                   | TanStack Router configuration                                                    |
| `src/components/Terminal.tsx`      | Animated terminal demo — ports the design's keystroke timeline state machine     |
| `src/data.ts`                      | Page content (features, reasons, terminals, processes)                           |

The header includes the four accent palettes (green / blue / purple / orange) from the original
design, switchable at runtime via CSS variables.

## Search engine access

The Worker serves SSR HTML, route-specific canonical URLs, `/robots.txt`, and `/sitemap.xml`.
Cloudflare zone security rules are managed outside this repository. Rules that challenge traffic
by country, ASN, or bot score should exclude Cloudflare verified crawlers (for example with
`not cf.client.bot`) so Googlebot and Bingbot can receive the same HTTP 200 HTML as users. Verify
the production result with Cloudflare Security Events and the Google Search Console URL
Inspection live test after each security-rule change.
