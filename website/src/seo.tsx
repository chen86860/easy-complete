import type { ReactNode } from "react";
import { OG_LOCALE, type Locale } from "./i18n/types.ts";

/** hreflang values. `zh-Hans` targets Simplified Chinese regardless of region. */
const HREFLANG: Record<Locale, string> = {
  en: "en",
  "zh-CN": "zh-Hans",
};

export const SITE_NAME = "Easy Complete";
/** Keep in sync with the workspace `Cargo.toml` version on each release. */
export const APP_VERSION = "2.3.0";
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
  locale?: Locale;
  /**
   * Every language version of this page, including itself. Only declare pairs
   * that actually exist — an hreflang pointing at a missing translation is
   * worse than no hreflang at all.
   */
  alternates?: Array<{ locale: Locale; path: string }>;
}

export function pageHead({
  title,
  description,
  path,
  imageAlt = "Easy Complete terminal autocomplete preview",
  robots = "index, follow",
  locale = "en",
  alternates,
}: PageHeadOptions) {
  const url = absoluteUrl(path);
  const image = absoluteUrl("/og-image.png");

  const alternateLinks = (alternates ?? []).flatMap((alternate) => [
    {
      rel: "alternate",
      hrefLang: HREFLANG[alternate.locale],
      href: absoluteUrl(alternate.path),
    },
  ]);

  // x-default points at the English page, which is the site's canonical entry.
  const xDefault = alternates?.find((alternate) => alternate.locale === "en");

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
      { property: "og:locale", content: OG_LOCALE[locale] },
      ...(alternates ?? [])
        .filter((alternate) => alternate.locale !== locale)
        .map((alternate) => ({
          property: "og:locale:alternate",
          content: OG_LOCALE[alternate.locale],
        })),
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [
      { rel: "canonical", href: url },
      ...alternateLinks,
      ...(xDefault
        ? [
            {
              rel: "alternate",
              hrefLang: "x-default",
              href: absoluteUrl(xDefault.path),
            },
          ]
        : []),
    ],
  };
}

/**
 * Stable identifier for the publisher, shared verbatim with the `Organization`
 * node on tools.emmmm.dev. Both sites emitting the same `@id` is what lets a
 * crawler merge them into one entity — pick a different URL on either side and
 * they stay two unrelated organisations that happen to share a name.
 */
const PUBLISHER_ID = "https://tools.emmmm.dev/#organization";

/**
 * The publisher entity. `sameAs` lists the other properties that belong to it,
 * which is the structured-data half of the footer link back to
 * tools.emmmm.dev — a link says "related", `sameAs` says "same owner".
 */
function publisherSchema() {
  return {
    "@type": "Organization",
    "@id": PUBLISHER_ID,
    name: "EMMMM.DEV",
    url: "https://tools.emmmm.dev",
    email: "help@emmmm.dev",
    sameAs: [
      "https://easy-complete.emmmm.dev/",
      "https://github.com/chen86860",
      "https://x.com/chen86860",
    ],
  };
}

export function homeSchema(locale: Locale = "en") {
  const origin = siteOrigin();
  const homePath = locale === "en" ? "/" : "/zh";

  return {
    "@context": "https://schema.org",
    "@graph": [
      publisherSchema(),
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: SITE_NAME,
        description: "IDE-style inline autocomplete for macOS terminals.",
        inLanguage: HREFLANG[locale],
        publisher: { "@id": PUBLISHER_ID },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/#software`,
        name: SITE_NAME,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "macOS 12 or later on Apple Silicon",
        description: HOME_DESCRIPTION,
        url: absoluteUrl(homePath),
        image: `${origin}/og-image.png`,
        screenshot: `${origin}/og-image.png`,
        softwareVersion: APP_VERSION,
        releaseNotes:
          "https://github.com/chen86860/easy-complete/blob/main/CHANGELOG.md",
        downloadUrl:
          "https://github.com/chen86860/easy-complete/releases/latest/download/Easy-Complete-arm64.dmg",
        codeRepository: "https://github.com/chen86860/easy-complete",
        softwareRequirements: "macOS 12 or later; Apple Silicon (ARM64)",
        license: "https://opensource.org/license/mit",
        publisher: { "@id": PUBLISHER_ID },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };
}

interface GuideSchemaOptions
  extends Pick<PageHeadOptions, "title" | "description" | "path"> {
  /**
   * Short label for the final breadcrumb crumb. Must match the crumb rendered
   * by `GuidePage`, since Google requires the markup and the visible trail to
   * agree. Falls back to the page title only when a guide has no eyebrow.
   */
  crumbLabel?: string;
  locale?: Locale;
}

const DOCS_CRUMB: Record<Locale, string> = { en: "Docs", "zh-CN": "文档" };

export function guideSchema({
  title,
  description,
  path,
  crumbLabel,
  locale = "en",
}: GuideSchemaOptions) {
  const origin = siteOrigin();
  const url = absoluteUrl(path);
  const docsPath = locale === "en" ? "/docs" : "/zh/docs";
  const isDocsRoot = path === docsPath;

  // Mirrors the visible trail: Easy Complete / Docs / <page>.
  const trail = [
    { name: SITE_NAME, item: absoluteUrl(locale === "en" ? "/" : "/zh") },
    ...(isDocsRoot
      ? []
      : [{ name: DOCS_CRUMB[locale], item: absoluteUrl(docsPath) }]),
    { name: crumbLabel ?? title, item: url },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      // Repeated on every guide, not just the home page: the guides are the
      // pages most likely to be crawled in isolation, so they each need to
      // carry the publisher link themselves.
      publisherSchema(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: HREFLANG[locale],
        isPartOf: { "@id": `${origin}/#website` },
        publisher: { "@id": PUBLISHER_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.item,
        })),
      },
    ],
  };
}

export function faqSchema(faqs: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
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
