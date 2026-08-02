import type {
  DocSection,
  Faq,
  Feature,
  Reason,
  TerminalSupport,
} from "../data.ts";

export type Locale = "en" | "zh-CN";

/** Locales that have a full translation of a given page. */
export const LOCALES: Locale[] = ["en", "zh-CN"];

/** Path prefix per locale. English is served at the root. */
export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  "zh-CN": "/zh",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  "zh-CN": "zh_CN",
};

export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  "zh-CN": "zh-Hans",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  "zh-CN": "中文",
};

/**
 * Every user-visible string on the home page. The JSX lives in `App.tsx` and is
 * shared across locales — only this object changes, so a structural edit can't
 * drift between the English and Chinese pages.
 */
export interface HomeCopy {
  badge: string;
  heroHeading: string;
  heroSubheading: string;
  downloadCta: string;
  githubCta: string;
  brewDivider: string;
  copyLabel: string;
  copiedLabel: string;
  copyErrorLabel: string;
  copyAriaLabel: (command: string) => string;

  marqueeLabel: string;
  featuresLabel: string;
  featuresHeading: string;
  featuresSubheading: string;

  whyLabel: string;
  whyHeading: string;

  terminalsLabel: string;
  terminalsHeading: string;
  terminalsNewPrefix: string;
  terminalsBody: string;
  terminalsLinkLabel: string;
  terminalGuideTitle: (name: string) => string;
  newBadge: string;

  howLabel: string;
  howHeading: string;
  howSubheading: string;
  crateLabel: string;
  flowShellHooks: string;
  flowInputMethod: string;
  flowProtobuf: string;

  faqLabel: string;
  faqHeading: string;

  docsLabel: string;
  docsHeading: string;
  docsSubheading: string;
  docsCta: string;

  ctaHeading: string;
  ctaSubheading: string;
  ctaFootnote: string;
  ctaTagline: string;

  features: Feature[];
  reasons: Reason[];
  faqs: Faq[];
  terminalSupport: TerminalSupport[];
  docSections: DocSection[];
  processes: Array<{ bin: string; crate: string; role: string }>;
}

/** Every user-visible string on the docs hub. */
export interface DocsCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  quickStart: string;
  installGuideCta: string;
  downloadCta: string;
  requirements: string;
  terminalColumn: string;
  trackingColumn: string;
  notesColumn: string;
  newBadge: string;
  /** Bold lead of the terminals callout, kept separate so the markup matches. */
  terminalsCalloutLead: string;
  terminalsCalloutBody: string;
  docSections: DocSection[];
  terminalSupport: TerminalSupport[];
}
