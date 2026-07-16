import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import logoUrl from "../assets/logo.png";
import "../index.css";

export const Route = createRootRoute({
  head: () => {
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "application-name", content: "Easy Complete" },
        { name: "theme-color", content: "#0a0d12" },
      ],
      links: [
        { rel: "icon", type: "image/png", href: logoUrl },
        { rel: "apple-touch-icon", href: logoUrl },
      ],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0d12] px-7 text-center text-[#e6edf3]">
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
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
