import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import logoUrl from "../assets/logo.png";
import { PostHogAnalytics } from "../posthog";
import { HOME_DESCRIPTION } from "../seo.tsx";
// The three faces that render above the fold. `font-display: swap` otherwise
// leaves them to be discovered only after the stylesheet parses, costing a
// visible FOUT on first paint.
import bodyFontUrl from "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2?url";
import displayFontUrl from "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url";
import monoFontUrl from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url";
import "../index.css";

export const Route = createRootRoute({
  head: () => {
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "application-name", content: "Easy Complete" },
        { name: "theme-color", content: "#0a0d12" },
        // Description fallback for any response without a route-level head —
        // the 404 in particular. The title is deliberately NOT set here: the
        // 404 component hoists its own, and a fallback here would render a
        // second <title> that wins over it.
        { name: "description", content: HOME_DESCRIPTION },
      ],
      links: [
        { rel: "icon", type: "image/png", href: logoUrl },
        { rel: "apple-touch-icon", href: logoUrl },
        ...[displayFontUrl, bodyFontUrl, monoFontUrl].map((href) => ({
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href,
          crossOrigin: "anonymous" as const,
        })),
      ],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0d12] px-7 text-center text-[#e6edf3]">
      {/* React 19 hoists these into <head>; the route head has no 404 hook. */}
      <title>Page not found — Easy Complete</title>
      <meta name="robots" content="noindex, follow" />
      <p className="mb-3 font-mono text-sm uppercase tracking-[.22em] text-(--accent)">
        404
      </p>
      <h1 className="m-0 mb-4 text-[38px] font-bold tracking-[-.03em] sm:text-[52px]">
        Page not found.
      </h1>
      <p className="m-0 mb-8 max-w-130 text-[16px] leading-[1.6] text-[#909aa6]">
        The page you requested does not exist. Return to Easy Complete to
        download the macOS terminal autocomplete app.
      </p>
      <a
        href="/"
        className="inline-flex items-center rounded-[11px] bg-(--accent) px-5.5 py-3 font-semibold text-[#06140a] transition hover:brightness-110"
      >
        Back to home
      </a>
    </main>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  // `lang` has to match the page's actual language, so read it off the route.
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const lang = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh-Hans" : "en";

  return (
    <html lang={lang}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <PostHogAnalytics />
        <Scripts />
      </body>
    </html>
  );
}
