import { useEffect, useRef, useState } from "react";
import logoUrl from "../assets/logo.png";
import { GITHUB_URL } from "../data.ts";
import { DOWNLOAD_URL } from "../download.ts";
import { LOCALE_PREFIX, type Locale } from "../i18n/types.ts";
import { AppleIcon, ChevronDownIcon, GitHubIcon, GlobeIcon } from "./icons.tsx";

/** Primary navigation — deliberately short: two destinations, two actions. */
const NAV_LABELS: Record<Locale, { features: string; docs: string }> = {
  en: { features: "Features", docs: "Docs" },
  "zh-CN": { features: "功能", docs: "文档" },
};

const FOOTER_LABELS: Record<
  Locale,
  { docs: string; install: string; troubleshooting: string; privacy: string }
> = {
  en: {
    docs: "Docs",
    install: "Install",
    troubleshooting: "Troubleshooting",
    privacy: "Privacy Policy",
  },
  "zh-CN": {
    docs: "文档",
    install: "安装",
    troubleshooting: "故障排查",
    privacy: "隐私政策",
  },
};

const FOOTER_TAGLINE: Record<Locale, string> = {
  en: "Easy Complete · local terminal autocomplete",
  "zh-CN": "Easy Complete · 本地终端自动补全",
};

/** URL of this page in each language that has a translation. */
export type LocaleHrefs = Partial<Record<Locale, string>>;

type LocalePref = "system" | Locale;

const LOCALE_PREF_KEY = "ec-locale-pref";

const MENU_LABELS: Record<Locale, Record<LocalePref, string>> = {
  en: { system: "System default", en: "English", "zh-CN": "中文" },
  "zh-CN": { system: "跟随系统", en: "English", "zh-CN": "中文" },
};

const MENU_TRIGGER_LABEL: Record<Locale, string> = {
  en: "Change language",
  "zh-CN": "切换语言",
};

function readPref(): LocalePref {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(LOCALE_PREF_KEY);
  return stored === "en" || stored === "zh-CN" ? stored : "system";
}

/** Resolves the browser's preferred language to a locale we actually ship. */
function systemLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

/**
 * Language menu: a globe trigger with System default / English / 中文.
 *
 * The stored preference drives which item is checked and where a "System
 * default" pick navigates to. It deliberately does NOT auto-redirect on load —
 * Googlebot executes JS and reports en-US, so redirecting on every visit would
 * bounce the crawler off the Chinese pages and undo their hreflang pairing.
 */
export function LocaleMenu({
  locale,
  hrefs,
  className = "",
}: {
  locale: Locale;
  hrefs: LocaleHrefs;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pref, setPref] = useState<LocalePref>("system");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPref(readPref()), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (choice: LocalePref) => {
    window.localStorage.setItem(LOCALE_PREF_KEY, choice);
    setPref(choice);
    setOpen(false);

    const target = choice === "system" ? systemLocale() : choice;
    const href = hrefs[target];
    if (href && target !== locale) window.location.href = href;
  };

  const items: LocalePref[] = ["system", "en", "zh-CN"];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={MENU_TRIGGER_LABEL[locale]}
        title={MENU_TRIGGER_LABEL[locale]}
        className="inline-flex items-center gap-1 rounded-lg border border-[#2b333d] px-2.5 py-1.75 text-[#9aa4b0] transition-colors hover:border-[#475060] hover:bg-[#141a22] hover:text-[#e6edf3]"
      >
        <GlobeIcon />
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-44 overflow-hidden rounded-xl border border-[#242d38] bg-[#0d1219] py-1 shadow-[0_22px_48px_-16px_rgba(0,0,0,.85)]"
        >
          {items.map((item) => {
            const checked = pref === item;
            return (
              <button
                key={item}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                onClick={() => choose(item)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors hover:bg-[#151c26] ${
                  checked ? "text-(--accent)" : "text-[#cdd6e0]"
                }`}
              >
                <span className="w-3.5 shrink-0 font-mono text-xs">
                  {checked ? "✓" : ""}
                </span>
                {MENU_LABELS[locale][item]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DOWNLOAD_LABEL: Record<Locale, string> = {
  en: "Download",
  "zh-CN": "下载",
};

function navLinks(locale: Locale) {
  const prefix = LOCALE_PREFIX[locale];
  const labels = NAV_LABELS[locale];
  return [
    { href: `${prefix}/#features`, label: labels.features, key: "features" },
    { href: `${prefix}/docs`, label: labels.docs, key: "docs" },
  ] as const;
}

function footerLinks(locale: Locale) {
  const prefix = LOCALE_PREFIX[locale];
  const labels = FOOTER_LABELS[locale];
  // Only the docs hub and install guide are translated; the rest stay English
  // and are linked at their canonical English URLs rather than 404-ing.
  return [
    { href: `${prefix}/docs`, label: labels.docs },
    { href: `${prefix}/install`, label: labels.install },
    { href: "/troubleshooting", label: labels.troubleshooting },
    { href: "/privacy-policy", label: labels.privacy },
  ];
}

interface SiteHeaderProps {
  /** `transparent` sits over the home hero glow; `bordered` is for inner pages. */
  variant?: "transparent" | "bordered";
  active?: "features" | "docs";
  locale?: Locale;
  /** This page's URL per language, when translations exist. */
  hrefs?: LocaleHrefs;
}

export function SiteHeader({
  variant = "bordered",
  active,
  locale = "en",
  hrefs,
}: SiteHeaderProps = {}) {
  // The transparent variant sits over the hero glow, so it only takes on a
  // backdrop once the page has scrolled under it.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "transparent") return;

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const opaque = variant !== "transparent" || scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200 ${
        opaque
          ? "border-b border-[#161d25] bg-[#0a0d12]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0d12]/70"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-310 items-center gap-5 px-7 py-3.5">
        <a
          href={`${LOCALE_PREFIX[locale]}/`}
          className="flex items-center gap-2.5 font-mono text-[16px] font-bold tracking-tight"
        >
          <img
            src={logoUrl}
            alt=""
            className="h-8 w-8 rounded-[9px] shadow-[0_0_24px_-12px_var(--accent)]"
          />
          <span>Easy Complete</span>
        </a>

        <nav className="ml-auto flex items-center gap-2 text-sm sm:gap-6.5">
          {navLinks(locale).map((link) => (
            <a
              key={link.key}
              href={link.href}
              aria-current={active === link.key ? "page" : undefined}
              className={`hidden transition-colors sm:inline ${
                active === link.key
                  ? "text-(--accent)"
                  : "text-[#9aa4b0] hover:text-[#e6edf3]"
              }`}
            >
              {link.label}
            </a>
          ))}

          {hrefs && <LocaleMenu locale={locale} hrefs={hrefs} />}

          <a
            href={GITHUB_URL}
            aria-label="Easy Complete on GitHub"
            className="inline-flex items-center gap-1.75 rounded-lg border border-[#2b333d] px-3.25 py-1.75 text-[#e6edf3] transition-colors hover:border-[#475060] hover:bg-[#141a22]"
          >
            <GitHubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center gap-1.75 rounded-lg bg-(--accent) px-4 py-2 font-semibold text-[#06140a] transition hover:brightness-110 hover:shadow-[0_8px_24px_-8px_var(--accent-line)]"
          >
            <AppleIcon />
            {DOWNLOAD_LABEL[locale]}
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooterLinks({
  className = "",
  locale = "en",
}: {
  className?: string;
  locale?: Locale;
}) {
  return (
    <span className={`flex flex-wrap items-center gap-4 ${className}`}>
      {footerLinks(locale).map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="transition-colors hover:text-[#e6edf3]"
        >
          {link.label}
        </a>
      ))}
    </span>
  );
}

export function SiteFooter({ locale = "en" }: { locale?: Locale } = {}) {
  return (
    <footer className="border-t border-[#161d25] px-7 py-8 text-[13px] text-[#65707d]">
      <div className="mx-auto flex max-w-295 flex-wrap items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 font-mono">
          <img src={logoUrl} alt="" className="h-5 w-5 rounded-md" />
          {FOOTER_TAGLINE[locale]}
        </span>
        <SiteFooterLinks locale={locale} />
      </div>
    </footer>
  );
}
