import type { ReactNode } from "react";

export const SITE_NAME = "Easy Complete";
export const HOME_TITLE = "Easy Complete — macOS Terminal Autocomplete";
export const HOME_DESCRIPTION =
  "Easy Complete adds IDE-style inline autocomplete to your macOS terminal. Fast, local, open source, and built for git, npm, docker, cargo, and more.";

export function siteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "__SITE_ORIGIN__";
}

function absoluteUrl(path: string): string {
  return `${siteOrigin()}${path === "/" ? "/" : path}`;
}

interface PageHeadOptions {
  title: string;
  description: string;
  path: string;
  imageAlt?: string;
  robots?: string;
}

export function pageHead({
  title,
  description,
  path,
  imageAlt = "Easy Complete terminal autocomplete preview",
  robots = "index, follow",
}: PageHeadOptions) {
  const url = absoluteUrl(path);
  const image = absoluteUrl("/og-image.png");

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function homeSchema() {
  const origin = siteOrigin();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: SITE_NAME,
        description: "IDE-style inline autocomplete for macOS terminals.",
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/#software`,
        name: SITE_NAME,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "macOS 12 or later on Apple Silicon",
        description: HOME_DESCRIPTION,
        url: `${origin}/`,
        image: `${origin}/og-image.png`,
        downloadUrl:
          "https://github.com/chen86860/easy-complete/releases/latest/download/Easy-Complete-arm64.dmg",
        codeRepository: "https://github.com/chen86860/easy-complete",
        softwareRequirements: "macOS 12 or later; Apple Silicon (ARM64)",
        license: "https://opensource.org/license/mit",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };
}

export function guideSchema({
  title,
  description,
  path,
}: Pick<PageHeadOptions, "title" | "description" | "path">) {
  const origin = siteOrigin();
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: "en",
        isPartOf: { "@id": `${origin}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: `${origin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: url,
          },
        ],
      },
    ],
  };
}

export function SeoJsonLd({ data }: { data: unknown }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
