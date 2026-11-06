import { useEffect, useRef, useState, type ReactNode } from "react";
import { Terminal } from "./components/Terminal.tsx";
import {
  SiteFooterLinks,
  SiteHeader,
  MAIN_ID,
  type LocaleHrefs,
} from "./components/SiteChrome.tsx";
import { TerminalMarquee } from "./components/TerminalMarquee.tsx";
import { AppleIcon, GitHubIcon } from "./components/icons.tsx";
import logoUrl from "./assets/logo.png";
import { DOWNLOAD_URL } from "./download.ts";
import { GITHUB_URL, featureTerminalLinks } from "./data.ts";
import { homeCopyEn } from "./i18n/en.ts";
import { LOCALE_PREFIX, type HomeCopy, type Locale } from "./i18n/types.ts";
import { captureEvent } from "./posthog.tsx";

const SECTION_LABEL = "mb-3 font-mono text-sm text-(--accent)";

const SECTION_HEADING =
  "m-0 text-[32px] font-semibold leading-[1.15] tracking-[-.015em] text-pretty";

const SECTION_INTRO = "m-0 mt-3 text-base leading-[1.6] text-[#8b95a1]";

const SECTION = "border-t border-[#141a21] px-7 py-24";

const BREW_INSTALL_COMMAND = "brew install chen86860/tap/easy-complete";

function CopyIcon({ copied }: { copied: boolean }) {
  return copied ? (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="m3 8.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <rect x="5.25" y="5.25" width="7.5" height="7.5" rx="1.5" />
      <path d="M3.25 10.75h-.5a1.5 1.5 0 0 1-1.5-1.5v-6.5a1.5 1.5 0 0 1 1.5-1.5h6.5a1.5 1.5 0 0 1 1.5 1.5v.5" />
    </svg>
  );
}

async function writeClipboardText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    let copied = false;
    try {
      textarea.select();
      copied = document.execCommand("copy");
    } finally {
      textarea.remove();
    }
    if (!copied) throw new Error("Clipboard copy failed");
  }
}

interface InstallActionsProps {
  className?: string;
  /** `split` left-aligns from the `lg` breakpoint up, for the split hero. */
  align?: "center" | "split";
  copy: HomeCopy;
  locale: Locale;
  placement: "hero" | "footer_cta";
}

function InstallActions({
  className = "",
  align = "center",
  copy,
  locale,
  placement,
}: InstallActionsProps) {
  const split = align === "split";
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copyBrewCommand = async () => {
    try {
      await writeClipboardText(BREW_INSTALL_COMMAND);
      setCopyState("copied");
      captureEvent("website_homebrew_command_copied", { locale, placement });
    } catch {
      setCopyState("error");
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <div
      className={`flex flex-col items-center ${
        split ? "lg:items-start" : ""
      } ${className}`}
    >
      <div
        className={`flex flex-wrap justify-center gap-3 lg:gap-4 ${
          split ? "lg:justify-start" : ""
        }`}
      >
        <a
          href={DOWNLOAD_URL}
          onClick={() =>
            captureEvent("website_download_clicked", { locale, placement })
          }
          className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-(--accent) px-6 text-base font-medium text-[#06140a] transition-[filter,scale] hover:brightness-110 active:scale-[.98]"
        >
          <AppleIcon />
          {copy.downloadCta}
        </a>
        <a
          href={GITHUB_URL}
          onClick={() =>
            captureEvent("website_github_clicked", { locale, placement })
          }
          className="inline-flex items-center gap-2 h-12 rounded-lg px-3 text-base font-medium text-[#9aa4b0] underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] hover:text-[#e6edf3] hover:decoration-[#475060] active:translate-y-px"
        >
          <GitHubIcon />
          {copy.githubCta}
        </a>
      </div>

      <div
        className="mt-6 flex w-full max-w-120 items-center gap-3"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-[#202832]" />
        <span className="font-mono text-xs text-[#65707d]">
          {copy.brewDivider}
        </span>
        <span className="h-px flex-1 bg-[#202832]" />
      </div>

      <div className="mt-3 inline-flex max-w-full items-stretch overflow-hidden rounded-md border border-[#232c36] bg-[#0c1117] font-mono text-[11px] text-[#8793a1] transition-[background-color,border-color,color] hover:border-[#37424f] hover:bg-[#11171e] hover:text-[#b5c0cc] sm:text-xs">
        <code className="min-w-0 cursor-text px-3 py-2 leading-5 whitespace-normal select-text sm:whitespace-nowrap">
          {BREW_INSTALL_COMMAND}
        </code>
        <button
          type="button"
          onClick={copyBrewCommand}
          className={`inline-flex min-w-24 shrink-0 items-center justify-center gap-1.5 border-l border-[#232c36] px-3 transition-colors hover:bg-[#17202a] active:bg-[#1c2632] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--accent) ${
            copyState === "copied" ? "text-(--accent)" : ""
          }`}
          aria-label={copy.copyAriaLabel(BREW_INSTALL_COMMAND)}
        >
          <CopyIcon copied={copyState === "copied"} />
          <span aria-live="polite">
            {copyState === "copied"
              ? copy.copiedLabel
              : copyState === "error"
                ? copy.copyErrorLabel
                : copy.copyLabel}
          </span>
        </button>
      </div>
    </div>
  );
}

const TERMINAL_LINK_TARGETS = featureTerminalLinks.flatMap((link) =>
  link.names.map((name) => ({ name, link })),
);

const TERMINAL_NAME_PATTERN = new RegExp(
  `(${TERMINAL_LINK_TARGETS.map(({ name }) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})`,
  "g",
);

/** Turns the terminal names in a feature description into links. */
function linkTerminalNames(text: string, locale: Locale): ReactNode[] {
  return text.split(TERMINAL_NAME_PATTERN).map((part, i) => {
    const link = TERMINAL_LINK_TARGETS.find(({ name }) => name === part)?.link;
    if (!link) return part;

    const external = !link.slug;
    const href = link.slug
      ? `${link.zhGuide ? LOCALE_PREFIX[locale] : ""}/terminals/${link.slug}`
      : link.url;
    return (
      <a
        key={i}
        href={href}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        className="text-[#cdd6e0] underline decoration-[#3a4552] underline-offset-3 transition-colors hover:text-(--accent) hover:decoration-(--accent-line)"
      >
        {part}
      </a>
    );
  });
}

export function App({
  copy = homeCopyEn,
  locale = "en",
  hrefs,
}: {
  copy?: HomeCopy;
  locale?: Locale;
  hrefs?: LocaleHrefs;
} = {}) {
  const prefix = LOCALE_PREFIX[locale];
  const docsHref = `${prefix}/docs`;

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#0a0d12]">
      {/* The hero glow is anchored to the page, not to a wrapper around the
          header — a sticky element only sticks within its own parent's box. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-200"
        style={{
          background:
            "radial-gradient(95% 70% at 50% 0%, var(--accent-glow), transparent 56%)",
        }}
      />

      {/* ===== HEADER ===== */}
      <SiteHeader variant="transparent" locale={locale} hrefs={hrefs} />

      <main id={MAIN_ID} className="relative">
        {/* ===== HERO ===== */}
        <section className="relative px-7 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="relative mx-auto grid max-w-310 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16">
            <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="m-0 mb-5 max-w-155 text-[40px] font-semibold leading-[1.05] tracking-[-.025em] text-balance [overflow-wrap:anywhere] sm:text-[56px] lg:mb-6">
                {copy.heroHeading}
              </h1>
              <p className="m-0 mb-8 max-w-132 text-lg leading-[1.6] text-[#909aa6] lg:mb-10">
                {copy.heroSubheading}
              </p>
              <InstallActions
                align="split"
                copy={copy}
                locale={locale}
                placement="hero"
              />
            </div>

            <div className="w-full min-w-0">
              <Terminal showKeys demoSpeed={1} />
            </div>
          </div>
        </section>

        {/* ===== TERMINAL MARQUEE ===== */}
        <TerminalMarquee label={copy.marqueeLabel} />

        {/* ===== FEATURES ===== */}
        <section id="features" className="scroll-mt-20 px-7 py-24">
          <div className="mx-auto max-w-295">
            <div className={SECTION_LABEL}>{copy.featuresLabel}</div>
            <h2 className={`${SECTION_HEADING} max-w-160`}>
              {copy.featuresHeading}
            </h2>
            <p className={`${SECTION_INTRO} mb-12 max-w-140`}>
              {copy.featuresSubheading}
            </p>
            <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {copy.features.map((f) => (
                <div key={f.title} className="border-t border-[#1c232d] pt-5 pb-8">
                  <h3 className="m-0 mb-2 text-[17px] font-medium text-[#e6edf3]">
                    {f.title}
                  </h3>
                  <p className="m-0 text-[15px] leading-[1.6] text-[#8b95a1]">
                    {linkTerminalNames(f.desc, locale)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY ===== */}
        <section id="why" className={`${SECTION} scroll-mt-20 bg-[#090c11]`}>
          <div className="mx-auto max-w-295">
            <div className={SECTION_LABEL}>{copy.whyLabel}</div>
            <h2 className={`${SECTION_HEADING} mb-12 max-w-140`}>
              {copy.whyHeading}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {copy.reasons.map((r) => (
                <div
                  key={r.num}
                  className="flex gap-5 rounded-2xl border border-[#1a212a] bg-[#0c1118] p-6"
                >
                  <div className="pt-1 font-mono text-sm text-(--accent) tabular-nums">
                    {r.num}
                  </div>
                  <div>
                    <h3 className="m-0 mb-2 text-lg font-medium">{r.title}</h3>
                    <p className="m-0 text-[15px] leading-[1.6] text-[#8b95a1]">
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TERMINALS ===== */}
        <section className={SECTION}>
          <div className="mx-auto max-w-295">
            <div className={SECTION_LABEL}>{copy.terminalsLabel}</div>
            <h2 className={`${SECTION_HEADING} mb-8 max-w-155`}>
              {copy.terminalsHeading}
            </h2>
            <div className="mb-6 flex flex-wrap gap-3">
              {copy.terminalSupport.map((t) => {
                const chipClass = `inline-flex h-10 items-center gap-2 rounded-lg border bg-[#0d1219] px-4 font-mono text-sm transition-[color,border-color] hover:border-[#3a4552] hover:text-[#e6edf3] ${
                  t.isNew
                    ? "border-(--accent-line) text-[#e6edf3]"
                    : "border-[#232c36] text-[#cdd6e0]"
                }`;
                const body = (
                  <>
                    {t.name}
                    {t.isNew && (
                      <span className="text-xs text-(--accent)">
                        {copy.newBadge}
                      </span>
                    )}
                  </>
                );

                return t.slug ? (
                  <a
                    key={t.name}
                    href={`/terminals/${t.slug}`}
                    className={chipClass}
                    title={copy.terminalGuideTitle(t.name)}
                  >
                    {body}
                  </a>
                ) : (
                  <span key={t.name} className={chipClass}>
                    {body}
                  </span>
                );
              })}
            </div>
            <p className="m-0 max-w-170 text-[15px] leading-[1.6] text-[#76818d]">
              <strong className="font-medium text-[#cdd6e0]">
                {copy.terminalsNewPrefix}
              </strong>{" "}
              {copy.terminalsBody}{" "}
              <a
                href={`${docsHref}#terminals`}
                className="text-(--accent) underline underline-offset-4 transition-[filter] hover:brightness-125"
              >
                {copy.terminalsLinkLabel}
              </a>
              {copy.terminalsLinkSuffix}
            </p>
          </div>
        </section>

        {/* ===== ARCHITECTURE ===== */}
        <section id="how" className={`${SECTION} scroll-mt-20 bg-[#090c11]`}>
          <div className="mx-auto max-w-295">
            <div className={SECTION_LABEL}>{copy.howLabel}</div>
            <h2 className={`${SECTION_HEADING} max-w-160`}>
              {copy.howHeading}
            </h2>
            <p className={`${SECTION_INTRO} mb-12 max-w-150`}>
              {copy.howSubheading}
            </p>

            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
              {copy.processes.map((p) => (
                <div
                  key={p.bin}
                  className="flex flex-col rounded-2xl border border-[#1c232d] bg-[#0c1118] p-6"
                >
                  <div className="mb-1 font-mono text-base font-medium text-(--accent)">
                    {p.bin}
                  </div>
                  <div className="mb-4 font-mono text-xs text-[#65707d]">
                    {copy.crateLabel} · {p.crate}
                  </div>
                  <p className="m-0 text-[15px] leading-[1.6] text-[#8b95a1]">
                    {p.role}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[13px] text-[#76818d]">
              <span className="rounded-lg border border-dashed border-[#2a333e] px-3 py-2">
                {copy.flowShellHooks}
              </span>
              <span aria-hidden="true" className="text-[#4d5663]">
                ⇄
              </span>
              <span className="rounded-lg border border-dashed border-[#2a333e] px-3 py-2">
                {copy.flowInputMethod}
              </span>
              <span aria-hidden="true" className="text-[#4d5663]">
                ⇄
              </span>
              <span className="rounded-lg border border-dashed border-[#2a333e] px-3 py-2">
                {copy.flowProtobuf}
              </span>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className={`${SECTION} scroll-mt-20`}>
          <div className="mx-auto max-w-225">
            <div className={SECTION_LABEL}>{copy.faqLabel}</div>
            <h2 className={`${SECTION_HEADING} mb-8 max-w-155`}>
              {copy.faqHeading}
            </h2>
            <div className="divide-y divide-[#1c232d] border-y border-[#1c232d]">
              {copy.faqs.map((faq) => (
                <div key={faq.question} className="py-6">
                  <h3 className="m-0 mb-2 text-[17px] font-medium">
                    {faq.question}
                  </h3>
                  <p className="m-0 max-w-180 text-[15px] leading-[1.6] text-[#8b95a1]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DOCS ===== */}
        <section className={`${SECTION} bg-[#090c11]`}>
          <div className="mx-auto max-w-295">
            <div className={SECTION_LABEL}>{copy.docsLabel}</div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
              <div>
                <h2 className={`${SECTION_HEADING} max-w-130`}>
                  {copy.docsHeading}
                </h2>
                <p className={`${SECTION_INTRO} mb-6 max-w-130`}>
                  {copy.docsSubheading}
                </p>
                <a
                  href={docsHref}
                  className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-(--accent-line) bg-(--accent-soft) px-5 text-sm font-medium text-(--accent) transition-[filter,scale] hover:brightness-125 active:scale-[.98]"
                >
                  {copy.docsCta}
                  <span aria-hidden="true" className="font-mono">
                    →
                  </span>
                </a>
              </div>
              <div className="divide-y divide-[#1c232d] border-y border-[#1c232d]">
                {copy.docSections
                  .flatMap((section) => section.links)
                  .filter((link) => !link.external)
                  .map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="group grid gap-1 py-4 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-5"
                    >
                      <span className="font-medium text-[#d8e0e9] transition-colors group-hover:text-(--accent)">
                        {link.label}
                      </span>
                      <span className="text-sm leading-[1.6] text-[#76818d]">
                        {link.description}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden font-mono text-[#4d5663] transition-colors group-hover:text-(--accent) sm:inline"
                      >
                        →
                      </span>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER CTA ===== */}
        <section
          id="get"
          className="relative overflow-hidden border-t border-[#141a21] px-7 pt-28 pb-16 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, var(--accent-glow), transparent 62%)",
            }}
          />
          <div className="relative mx-auto max-w-180">
            <h2 className="m-0 mb-4 text-[36px] font-semibold leading-[1.05] tracking-[-.02em] sm:text-[48px]">
              {copy.ctaHeading}
            </h2>
            <p className="m-0 mb-8 text-lg text-[#909aa6]">
              {copy.ctaSubheading}
            </p>
            <InstallActions
              className="mb-8"
              copy={copy}
              locale={locale}
              placement="footer_cta"
            />
            <p className="m-0 font-mono text-[13px] leading-[1.7] text-[#65707d]">
              {copy.ctaFootnote}
              <br />
              {copy.ctaTagline}
            </p>
          </div>
          <div className="relative mx-auto mt-20 flex max-w-295 flex-wrap items-center justify-between gap-4 border-t border-[#161d25] pt-6 text-[13px] text-[#65707d]">
            <span className="inline-flex items-center gap-2 font-mono">
              <img src={logoUrl} alt="" className="h-5 w-5 rounded-md" />
              Easy Complete
            </span>
            <span className="inline-flex flex-wrap items-center gap-4">
              <SiteFooterLinks locale={locale} />
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
