import { useEffect, useRef, useState, type ReactNode } from "react";
import { Terminal } from "./components/Terminal.tsx";
import {
  SiteFooterLinks,
  SiteHeader,
  type LocaleHrefs,
} from "./components/SiteChrome.tsx";
import { TerminalMarquee } from "./components/TerminalMarquee.tsx";
import { AppleIcon, GitHubIcon } from "./components/icons.tsx";
import logoUrl from "./assets/logo.png";
import { DOWNLOAD_URL } from "./download.ts";
import { GITHUB_URL } from "./data.ts";
import { homeCopyEn } from "./i18n/en.ts";
import { LOCALE_PREFIX, type HomeCopy, type Locale } from "./i18n/types.ts";

const SECTION_LABEL =
  "font-mono text-xs uppercase tracking-[.22em] text-(--accent) mb-3.5";

const ACTION_SURFACE =
  "ec-action will-change-transform transition-[transform,filter,box-shadow,background-color,border-color,color] duration-200 ease-[var(--ease-out-quart)]";

const CARD_SURFACE =
  "ec-card will-change-transform transition-[transform,box-shadow,background-color,border-color] duration-[260ms] ease-[var(--ease-out-quart)]";

const BREW_INSTALL_COMMAND = "brew install --cask chen86860/tap/easy-complete";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (visible || prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`ec-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

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
}

function InstallActions({
  className = "",
  align = "center",
  copy,
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
        className={`flex flex-wrap justify-center gap-3.25 lg:gap-4 ${
          split ? "lg:justify-start" : ""
        }`}
      >
        <a
          href={DOWNLOAD_URL}
          className={`${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-[11px] bg-(--accent) px-6.5 py-3.25 text-[16px] font-semibold text-[#06140a] hover:brightness-110 hover:shadow-[0_14px_34px_-12px_var(--accent-line)]`}
        >
          <AppleIcon />
          {copy.downloadCta}
        </a>
        <a
          href={GITHUB_URL}
          className={`${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-[11px] border border-[#2c343e] px-6.5 py-3.25 text-[16px] font-medium text-[#e6edf3] hover:border-[#475060] hover:bg-[#141a22]`}
        >
          <GitHubIcon />
          {copy.githubCta}
        </a>
      </div>

      <div
        className="mt-4 flex w-full max-w-120 items-center gap-2.5 lg:mt-6"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-[#202832]" />
        <span className="font-mono text-[10px] tracking-wider text-[#596472] uppercase">
          {copy.brewDivider}
        </span>
        <span className="h-px flex-1 bg-[#202832]" />
      </div>

      <div className="group mt-2 inline-flex max-w-full items-stretch lg:mt-3 overflow-hidden rounded-md border border-[#232c36] bg-[#0c1117] font-mono text-[11px] text-[#8793a1] transition-[background-color,border-color,color] hover:border-[#37424f] hover:bg-[#11171e] hover:text-[#b5c0cc] sm:text-xs">
        <code className="min-w-0 cursor-text px-3 py-2 leading-5 whitespace-normal select-text sm:whitespace-nowrap">
          {BREW_INSTALL_COMMAND}
        </code>
        <button
          type="button"
          onClick={copyBrewCommand}
          className={`inline-flex min-w-24 shrink-0 items-center justify-center gap-1.5 border-l border-[#232c36] px-3 transition-colors hover:bg-[#17202a] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--accent) ${
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
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0d12]">
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

      <div className="relative">
        {/* ===== HERO ===== */}
        <section className="relative px-7 pb-12 pt-10 lg:pb-20 lg:pt-16">
          <div className="relative mx-auto grid max-w-310 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-18">
            <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-6.5 inline-flex items-center gap-2 rounded-full border border-[#232c36] px-3.75 py-1.5 font-mono text-[12.5px] text-[#9aa4b0] lg:mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
                {copy.badge}
              </div>
              <h1 className="m-0 mb-4.5 max-w-155 text-[40px] font-bold leading-[1.03] tracking-[-.035em] text-balance [overflow-wrap:anywhere] sm:text-[54px] lg:mb-6 lg:leading-[1.06]">
                {copy.heroHeading}
              </h1>
              <p className="m-0 mb-7.5 max-w-132.5 text-[18px] leading-[1.6] text-[#909aa6] lg:mb-10 lg:text-[19px] lg:leading-[1.72]">
                {copy.heroSubheading}
              </p>
              <InstallActions align="split" copy={copy} />
            </div>

            <div className="w-full min-w-0">
              <Terminal showKeys demoSpeed={1} />
            </div>
          </div>
        </section>
      </div>

      {/* ===== TERMINAL MARQUEE ===== */}
      <TerminalMarquee label={copy.marqueeLabel} />

      {/* ===== FEATURES ===== */}
      <section id="features" className="scroll-mt-20 px-7 py-20">
        <div className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>{copy.featuresLabel}</div>
          <h2 className="m-0 mb-2 max-w-160 text-[30px] font-bold leading-[1.15] tracking-[-.02em] text-pretty">
            {copy.featuresHeading}
          </h2>
          <p className="m-0 mb-10 max-w-140 text-[16px] text-[#8b95a1]">
            {copy.featuresSubheading}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.features.map((f) => (
              <div
                key={f.title}
                className={`${CARD_SURFACE} rounded-[14px] border border-[#1c232d] bg-[#0d1219] px-5 py-5.5 hover:-translate-y-1 hover:border-(--accent-line) hover:shadow-[0_18px_44px_-24px_var(--accent-glow)]`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] border border-(--accent-line) bg-(--accent-soft) font-mono text-[16px] font-bold text-(--accent)">
                  {f.glyph}
                </div>
                <h3 className="m-0 mb-1.75 text-[17px] font-semibold tracking-[-.01em]">
                  {f.title}
                </h3>
                <p className="m-0 text-sm leading-[1.55] text-[#828d99]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section
        id="why"
        className="scroll-mt-20 border-t border-[#141a21] bg-[#090c11] px-7 py-20"
      >
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>{copy.whyLabel}</div>
          <h2 className="m-0 mb-11 max-w-140 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            {copy.whyHeading}
          </h2>
          <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
            {copy.reasons.map((r) => (
              <div
                key={r.num}
                className={`${CARD_SURFACE} flex gap-5 rounded-[14px] border border-[#1a212a] bg-[#0c1118] px-6 py-6.5 hover:-translate-y-0.5 hover:border-[#2a3340]`}
              >
                <div className="pt-0.75 font-mono text-sm font-bold text-(--accent)">
                  {r.num}
                </div>
                <div>
                  <h3 className="m-0 mb-1.75 text-[18px] font-semibold tracking-[-.01em]">
                    {r.title}
                  </h3>
                  <p className="m-0 text-[14.5px] leading-[1.6] text-[#828d99]">
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== TERMINALS ===== */}
      <section className="border-t border-[#141a21] px-7 py-18.5">
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>{copy.terminalsLabel}</div>
          <h2 className="m-0 mb-6.5 max-w-155 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            {copy.terminalsHeading}
          </h2>
          <div className="mb-4.5 flex flex-wrap gap-2.75">
            {copy.terminalSupport.map((t) => {
              const chipClass = `${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-full border bg-[#0d1219] px-4 py-2.25 font-mono text-sm hover:-translate-y-0.5 hover:border-(--accent-line) hover:text-white ${
                t.isNew
                  ? "border-(--accent-line) text-[#e6edf3]"
                  : "border-[#232c36] text-[#cdd6e0]"
              }`;
              const body = (
                <>
                  <span className="font-bold text-(--accent)">✓</span>
                  {t.name}
                  {t.isNew && (
                    <span className="rounded-full bg-(--accent-soft) px-1.75 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--accent)">
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
          <p className="m-0 max-w-170 text-sm leading-[1.6] text-[#6e7884]">
            <strong className="font-semibold text-[#cdd6e0]">
              New in v2.1.0:
            </strong>{" "}
            Otty joins the input-method terminals with pixel-accurate cursor
            tracking, and ChatGPT (Codex) sessions are located through the
            xterm.js caret. Everything else keeps working through the shell
            integration installed automatically on first launch.{" "}
            <a
              href={`${docsHref}#terminals`}
              className="text-(--accent) underline underline-offset-4 transition-colors hover:brightness-125"
            >
              {copy.terminalsLinkLabel}
            </a>
            .
          </p>
        </Reveal>
      </section>

      {/* ===== ARCHITECTURE ===== */}
      <section
        id="how"
        className="scroll-mt-20 border-t border-[#141a21] bg-[#090c11] px-7 py-20"
      >
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>{copy.howLabel}</div>
          <h2 className="m-0 mb-2.5 max-w-160 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            {copy.howHeading}
          </h2>
          <p className="m-0 mb-10 max-w-150 text-[16px] leading-[1.6] text-[#8b95a1]">
            {copy.howSubheading}
          </p>

          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            {copy.processes.map((p) => (
              <div
                key={p.bin}
                className={`${CARD_SURFACE} flex flex-col rounded-[14px] border border-[#1c232d] bg-[#0c1118] px-5.5 py-6 hover:-translate-y-0.5 hover:border-[#2a3340]`}
              >
                <div className="mb-1 font-mono text-[16px] font-bold text-(--accent)">
                  {p.bin}
                </div>
                <div className="mb-3.5 font-mono text-xs text-[#5d6773]">
                  {copy.crateLabel} · {p.crate}
                </div>
                <p className="m-0 text-sm leading-[1.6] text-[#9099a5]">
                  {p.role}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4.5 flex flex-wrap items-center gap-2.5 font-mono text-[12.5px] text-[#6e7884]">
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-3.25 py-2">
              {copy.flowShellHooks}
            </span>
            <span className="text-(--accent)">⇄</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-3.25 py-2">
              {copy.flowInputMethod}
            </span>
            <span className="text-(--accent)">⇄</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-3.25 py-2">
              {copy.flowProtobuf}
            </span>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section
        id="faq"
        className="scroll-mt-20 border-t border-[#141a21] px-7 py-20"
      >
        <Reveal className="mx-auto max-w-225">
          <div className={SECTION_LABEL}>{copy.faqLabel}</div>
          <h2 className="m-0 mb-7 max-w-155 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            {copy.faqHeading}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {copy.faqs.map((faq) => (
              <div
                key={faq.question}
                className={`${CARD_SURFACE} rounded-[14px] border border-[#1c232d] bg-[#0d1219] px-6 py-5 hover:-translate-y-0.5 hover:border-[#2a3340]`}
              >
                <h3 className="m-0 mb-2 text-[17px] font-semibold tracking-[-.01em]">
                  {faq.question}
                </h3>
                <p className="m-0 text-[14.5px] leading-[1.6] text-[#828d99]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== DOCS ===== */}
      <section className="border-t border-[#141a21] bg-[#090c11] px-7 py-18.5">
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>{copy.docsLabel}</div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
            <div>
              <h2 className="m-0 mb-3 max-w-130 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
                {copy.docsHeading}
              </h2>
              <p className="m-0 mb-6 max-w-130 text-[16px] leading-[1.65] text-[#828d99]">
                {copy.docsSubheading}
              </p>
              <a
                href={docsHref}
                className={`${ACTION_SURFACE} inline-flex items-center gap-2 rounded-[10px] border border-(--accent-line) bg-(--accent-soft) px-5 py-2.75 text-sm font-semibold text-(--accent) hover:bg-(--accent-soft) hover:brightness-125`}
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
                    className="group grid gap-1 py-4 transition-colors sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-5"
                  >
                    <span className="font-semibold text-[#d8e0e9] group-hover:text-(--accent)">
                      {link.label}
                    </span>
                    <span className="text-sm leading-[1.55] text-[#737e8b]">
                      {link.description}
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden font-mono text-(--accent) sm:inline"
                    >
                      →
                    </span>
                  </a>
                ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== FOOTER CTA ===== */}
      <section
        id="get"
        className="relative overflow-hidden border-t border-[#141a21] px-7 pb-16 pt-24 text-center"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, var(--accent-glow), transparent 62%)",
          }}
        />
        <Reveal className="relative mx-auto max-w-180">
          <h2 className="m-0 mb-3.5 text-[34px] font-bold leading-[1.05] tracking-[-.03em] sm:text-[46px]">
            {copy.ctaHeading}
          </h2>
          <p className="m-0 mb-7.5 text-[18px] text-[#909aa6]">
            {copy.ctaSubheading}
          </p>
          <InstallActions className="mb-7.5" copy={copy} />
          <p className="m-0 font-mono text-[13px] leading-[1.7] text-[#5d6773]">
            {copy.ctaFootnote}
            <br />
            {copy.ctaTagline}
          </p>
        </Reveal>
        <div className="relative mx-auto mt-16 flex max-w-295 flex-wrap items-center justify-between gap-4 border-t border-[#161d25] pt-6.5 text-[13px] text-[#5d6773]">
          <span className="inline-flex items-center gap-2 font-mono">
            <img src={logoUrl} alt="" className="h-5 w-5 rounded-md" />
            Easy Complete
          </span>
          <span className="inline-flex flex-wrap items-center gap-4">
            <SiteFooterLinks locale={locale} />
          </span>
        </div>
      </section>
    </div>
  );
}
