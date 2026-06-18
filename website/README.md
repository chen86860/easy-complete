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

| Path | Role |
|---|---|
| `src/App.tsx` | Full landing page (header, hero, features, why, terminals, architecture, CTA) |
| `src/routes/__root.tsx` | TanStack Start document shell, global CSS, SEO head, and JSON-LD |
| `src/routes/index.tsx` | Homepage route rendering `App` |
| `src/server.ts` | Cloudflare Worker entry wrapping TanStack Start SSR |
| `src/router.tsx` | TanStack Router configuration |
| `src/components/Terminal.tsx` | Animated terminal demo — ports the design's keystroke timeline state machine |
| `src/data.ts` | Page content (features, reasons, terminals, processes) |

The header includes the four accent palettes (green / blue / purple / orange) from the original
design, switchable at runtime via CSS variables.
