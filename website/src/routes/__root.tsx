import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import logoUrl from "../assets/logo.png";
import "../index.css";

const TITLE = "Easy Complete — macOS Terminal Autocomplete";
const DESCRIPTION =
  "Easy Complete adds IDE-style inline autocomplete to your macOS terminal. Fast, local, open source, and built for git, npm, docker, cargo, and more.";
const SOCIAL_DESCRIPTION =
  "IDE-style inline autocomplete for your macOS terminal. Native, fast, local, and open source.";

function siteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "__SITE_ORIGIN__";
}

function seoSchema(origin: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "Easy Complete",
        description: "IDE-style inline autocomplete for macOS terminals.",
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/#software`,
        name: "Easy Complete",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "macOS",
        description:
          "Easy Complete adds IDE-style inline autocomplete to your macOS terminal. It is fast, local, open source, and supports hundreds of command-line tools.",
        url: `${origin}/`,
        downloadUrl:
          "https://github.com/chen86860/easy-complete/releases/latest/download/Easy-Complete-arm64.dmg",
        codeRepository: "https://github.com/chen86860/easy-complete",
        softwareRequirements: "macOS 12 or later",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${origin}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Easy Complete?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Easy Complete is a macOS terminal autocomplete app that shows IDE-style inline suggestions for command-line tools.",
            },
          },
          {
            "@type": "Question",
            name: "Does Easy Complete run locally?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Easy Complete runs on-device and does not require an account, telemetry, cloud calls, or AI requests for autocomplete.",
            },
          },
          {
            "@type": "Question",
            name: "Which terminals does Easy Complete support?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Easy Complete supports popular macOS terminals including Ghostty, Kitty, WezTerm, Alacritty, Zed, iTerm2, Apple Terminal, VS Code, and JetBrains IDE terminals.",
            },
          },
          {
            "@type": "Question",
            name: "How do I install Easy Complete?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Download the latest macOS DMG from the Easy Complete GitHub Releases page and follow the install instructions.",
            },
          },
        ],
      },
    ],
  };
}

export const Route = createRootRoute({
  head: () => {
    const origin = siteOrigin();

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { name: "robots", content: "index, follow" },
        { name: "application-name", content: "Easy Complete" },
        { name: "theme-color", content: "#0a0d12" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: SOCIAL_DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${origin}/` },
        { property: "og:site_name", content: "Easy Complete" },
        { property: "og:locale", content: "en_US" },
        { property: "og:image", content: `${origin}/og-image.png` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: "Easy Complete terminal autocomplete preview",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: SOCIAL_DESCRIPTION },
        { name: "twitter:image", content: `${origin}/og-image.png` },
      ],
      links: [
        { rel: "canonical", href: `${origin}/` },
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
      <p className="mb-3 font-mono text-sm uppercase tracking-[.22em] text-[var(--accent)]">
        404
      </p>
      <h1 className="m-0 mb-4 text-[38px] font-bold tracking-[-.03em] sm:text-[52px]">
        Page not found.
      </h1>
      <p className="m-0 mb-8 max-w-[520px] text-[16px] leading-[1.6] text-[#909aa6]">
        The page you requested does not exist. Return to Easy Complete to
        download the macOS terminal autocomplete app.
      </p>
      <a
        href="/"
        className="inline-flex items-center rounded-[11px] bg-[var(--accent)] px-[22px] py-[12px] font-semibold text-[#06140a] transition hover:brightness-110"
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
  const origin = siteOrigin();

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoSchema(origin)),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
