import {
  SiteFooter,
  SiteHeader,
  type LocaleHrefs,
} from "./SiteChrome.tsx";
import {
  INTEGRATION_LABEL,
  type DocLink,
  type TerminalIntegration,
} from "../data.ts";
import { DOWNLOAD_URL } from "../download.ts";
import { LOCALE_PREFIX, type Locale } from "../i18n/types.ts";
import type { DocsCopy } from "../i18n/types.ts";

const BREW_INSTALL_COMMAND = "brew install --cask chen86860/tap/easy-complete";

function DocCard({ link }: { link: DocLink }) {
  return (
    <a
      href={link.href}
      {...(link.external
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
      className="group flex min-w-0 flex-col rounded-[14px] border border-[#1c232d] bg-[#0d1219] px-5 py-4.5 transition-[transform,border-color,background-color] duration-200 ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-(--accent-line) hover:bg-[#0f151d]"
    >
      <span className="font-semibold text-[#e6edf3] group-hover:text-(--accent)">
        {link.label}{" "}
        <span aria-hidden="true" className="font-mono">
          {link.external ? "↗" : "→"}
        </span>
      </span>
      <span className="mt-1.5 text-sm leading-[1.6] text-[#828d99]">
        {link.description}
      </span>
    </a>
  );
}

const INTEGRATION_BADGE: Record<TerminalIntegration, string> = {
  "input-method": "border-(--accent-line) bg-(--accent-soft) text-(--accent)",
  xterm: "border-[#1f3a5f] bg-[#0e1b2b] text-[#58a6ff]",
  accessibility: "border-[#242d38] text-[#8b95a1]",
};

function TerminalMatrix({ copy }: { copy: DocsCopy }) {
  return (
    <div className="mt-6 divide-y divide-[#1c232d] overflow-hidden rounded-[14px] border border-[#1c232d] bg-[#0d1219]">
      <div className="hidden grid-cols-[minmax(0,1fr)_10.5rem_minmax(0,1.6fr)] gap-5 bg-[#0b1016] px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-[#65707d] sm:grid">
        <span>{copy.terminalColumn}</span>
        <span>{copy.trackingColumn}</span>
        <span>{copy.notesColumn}</span>
      </div>
      {copy.terminalSupport.map((terminal) => (
        <div
          key={terminal.name}
          className="grid gap-1.5 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_10.5rem_minmax(0,1.6fr)] sm:items-center sm:gap-5"
        >
          <span className="flex flex-wrap items-center gap-2 font-medium text-[#e6edf3]">
            {terminal.name}
            {terminal.isNew && (
              <span className="rounded-full bg-(--accent-soft) px-1.75 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-(--accent)">
                {copy.newBadge}
              </span>
            )}
          </span>
          <span
            className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[11px] ${
              INTEGRATION_BADGE[terminal.integration]
            }`}
          >
            {INTEGRATION_LABEL[terminal.integration]}
          </span>
          <span className="text-sm leading-[1.6] text-[#737e8b]">
            {terminal.note}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DocsPageView({
  copy,
  locale = "en",
  hrefs,
}: {
  copy: DocsCopy;
  locale?: Locale;
  hrefs?: LocaleHrefs;
}) {
  const prefix = LOCALE_PREFIX[locale];

  return (
    <>
      <div className="min-h-screen bg-[#0a0d12] text-[#e6edf3]">
        <SiteHeader active="docs" locale={locale} hrefs={hrefs} />

        <main className="mx-auto max-w-295 px-7 pb-24 pt-14">
          <p className="mb-4 font-mono text-xs uppercase tracking-[.22em] text-(--accent)">
            {copy.eyebrow}
          </p>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
            <div className="min-w-0">
              <h1 className="m-0 mb-5 max-w-190 text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.02] tracking-[-.04em] text-balance [overflow-wrap:anywhere]">
                {copy.heading}
              </h1>
              <p className="m-0 max-w-180 text-[19px] leading-[1.65] text-[#9aa4b0]">
                {copy.intro}
              </p>
            </div>

            <aside className="min-w-0 rounded-[14px] border border-[#1c232d] bg-[#0d1219] px-5.5 py-5">
              <p className="m-0 mb-3 font-mono text-[11px] uppercase tracking-wider text-[#65707d]">
                {copy.quickStart}
              </p>
              <pre className="m-0 mb-4 overflow-x-auto rounded-xl border border-[#1c232d] bg-[#0b0f15] p-3.5 font-mono text-[12.5px] leading-[1.7] text-[#cdd6e0]">
                {BREW_INSTALL_COMMAND}
              </pre>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`${prefix}/install`}
                  className="inline-flex items-center rounded-[10px] bg-(--accent) px-4.5 py-2.5 text-sm font-semibold text-[#06140a] transition hover:brightness-110"
                >
                  {copy.installGuideCta}
                </a>
                <a
                  href={DOWNLOAD_URL}
                  className="inline-flex items-center rounded-[10px] border border-[#2b333d] px-4.5 py-2.5 text-sm font-medium text-[#e6edf3] transition-colors hover:border-[#475060] hover:bg-[#141a22]"
                >
                  {copy.downloadCta}
                </a>
              </div>
              <p className="m-0 mt-3.5 font-mono text-[11px] leading-[1.7] text-[#5d6773]">
                {copy.requirements}
              </p>
            </aside>
          </div>

          {copy.docSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mt-16 scroll-mt-24 border-t border-[#141a21] pt-10"
            >
              <h2 className="m-0 mb-2.5 text-[26px] font-bold leading-[1.15] tracking-[-.025em]">
                {section.title}
              </h2>
              <p className="m-0 mb-6 max-w-170 text-[16px] leading-[1.65] text-[#828d99]">
                {section.summary}
              </p>

              {section.id === "terminals" && (
                <>
                  <aside className="rounded-[14px] border border-(--accent-line) bg-(--accent-soft) px-5 py-4 text-[15px] leading-[1.65] text-[#cdd6e0]">
                    <strong className="font-semibold text-[#e6edf3]">
                      {copy.terminalsCalloutLead}
                    </strong>{" "}
                    {copy.terminalsCalloutBody}
                  </aside>
                  <TerminalMatrix copy={copy} />
                </>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {section.links.map((link) => (
                  <DocCard key={link.href} link={link} />
                ))}
              </div>
            </section>
          ))}
        </main>

        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
