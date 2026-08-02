import type { ReactNode } from "react";
import {
  SiteFooter,
  SiteHeader,
  type LocaleHrefs,
} from "./SiteChrome.tsx";
import { LOCALE_PREFIX, type Locale } from "../i18n/types.ts";

const BREADCRUMB_DOCS: Record<Locale, string> = { en: "Docs", "zh-CN": "文档" };

export const GUIDE_HEADING =
  "m-0 mb-4 mt-12 text-[24px] font-bold tracking-[-.025em] text-[#e6edf3]";
export const GUIDE_PARAGRAPH =
  "m-0 mb-5 text-[16px] leading-[1.75] text-[#9aa4b0]";
export const GUIDE_CODE =
  "mb-5 overflow-x-auto rounded-xl border border-[#1c232d] bg-[#0d1219] p-4 font-mono text-[13px] leading-[1.7] text-[#cdd6e0]";

interface GuidePageProps {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  locale?: Locale;
  hrefs?: LocaleHrefs;
}

export function GuidePage({
  eyebrow,
  title,
  intro,
  children,
  locale = "en",
  hrefs,
}: GuidePageProps) {
  const prefix = LOCALE_PREFIX[locale];

  return (
    <div className="min-h-screen bg-[#0a0d12] text-[#e6edf3]">
      <SiteHeader active="docs" locale={locale} hrefs={hrefs} />

      <main className="mx-auto max-w-215 px-7 pb-24 pt-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-10 font-mono text-xs text-[#65707d]"
        >
          <a
            href={`${prefix}/`}
            className="transition-colors hover:text-(--accent)"
          >
            Easy Complete
          </a>
          <span className="px-2">/</span>
          <a
            href={`${prefix}/docs`}
            className="transition-colors hover:text-(--accent)"
          >
            {BREADCRUMB_DOCS[locale]}
          </a>
          <span className="px-2">/</span>
          <span>{eyebrow}</span>
        </nav>

        <p className="mb-4 font-mono text-xs uppercase tracking-[.22em] text-(--accent)">
          {eyebrow}
        </p>
        <h1 className="m-0 mb-5 max-w-190 text-[clamp(2.4rem,7vw,4.7rem)] font-bold leading-[.98] tracking-[-.045em] text-balance">
          {title}
        </h1>
        <p className="m-0 mb-12 max-w-180 text-[19px] leading-[1.65] text-[#9aa4b0]">
          {intro}
        </p>

        <article>{children}</article>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}

export function GuideList({ children }: { children: ReactNode }) {
  return (
    <ul className="m-0 mb-5 list-disc space-y-2 pl-6 text-[16px] leading-[1.7] text-[#9aa4b0]">
      {children}
    </ul>
  );
}

export function GuideCallout({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 rounded-[14px] border border-(--accent-line) bg-(--accent-soft) px-5 py-4 text-[15px] leading-[1.65] text-[#cdd6e0]">
      {children}
    </aside>
  );
}

export function RelatedGuides({
  links,
}: {
  links: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <section className="mt-16 border-t border-[#1c232d] pt-9">
      <h2 className="m-0 mb-5 text-[22px] font-bold">Keep going</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-[#1c232d] bg-[#0d1219] px-5 py-4 transition-colors hover:border-(--accent-line)"
          >
            <span className="block font-semibold text-[#e6edf3] group-hover:text-(--accent)">
              {link.label} →
            </span>
            <span className="mt-1 block text-sm leading-[1.55] text-[#737e8b]">
              {link.description}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
