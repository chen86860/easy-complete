# Easy Complete — Landing Page

Marketing site for [Easy Complete](https://github.com/chen86860/easy-complete), built from the
Claude Design source (`Easy Complete.dc.html`).

**Stack:** Vite + React + TypeScript + Tailwind CSS v4, deployed on Cloudflare Workers (static
assets served through a Worker via the `ASSETS` binding).

## Develop

```bash
pnpm install
pnpm dev          # Vite dev server (http://localhost:5173)
```

## Build

```bash
pnpm build        # type-check + Vite build → dist/client
pnpm preview      # preview the production build locally
```

## Deploy to Cloudflare Workers

```bash
pnpm cf-dev       # build + run the Worker locally via Wrangler
pnpm deploy       # build + wrangler deploy
```

Wrangler config lives in `wrangler.jsonc`. The Worker (`src/worker.ts`) fronts the static build
and adds cache headers; `not_found_handling: single-page-application` serves `index.html` for
unknown routes. Download CTAs link directly to the latest GitHub Release DMG.

## Structure

| Path | Role |
|---|---|
| `src/App.tsx` | Full landing page (header, hero, features, why, terminals, architecture, CTA) |
| `src/components/Terminal.tsx` | Animated terminal demo — ports the design's keystroke timeline state machine |
| `src/data.ts` | Page content (features, reasons, terminals, processes) |
| `src/worker.ts` | Cloudflare Worker entry serving the static assets |

The header includes the four accent palettes (green / blue / purple / orange) from the original
design, switchable at runtime via CSS variables.
