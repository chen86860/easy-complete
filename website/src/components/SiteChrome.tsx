import { useEffect, useRef, useState } from "react";
import logoUrl from "../assets/logo.png";
import { GITHUB_URL } from "../data.ts";
import { DOWNLOAD_URL } from "../download.ts";
import { captureEvent } from "../posthog.tsx";
import { LOCALE_PREFIX, type Locale } from "../i18n/types.ts";
import { AppleIcon, ChevronDownIcon, GitHubIcon, GlobeIcon } from "./icons.tsx";

/** Primary navigation — deliberately short: two destinations, two actions. */
const NAV_LABELS: Record<Locale, { features: string; docs: string }> = {
  en: { features: "Features", docs: "Docs" },
  "zh-CN": { features: "功能", docs: "文档" },
};

const FOOTER_LABELS: Record<
  Locale,
  {
    docs: string;
    install: string;
    troubleshooting: string;
    privacy: string;
    moreTools: string;
  }
> = {
  en: {
    docs: "Docs",
    install: "Install",
    troubleshooting: "Troubleshooting",
    privacy: "Privacy policy",
    moreTools: "More tools from EMMMM.DEV",
  },
  "zh-CN": {
    docs: "文档",
    install: "安装",
    troubleshooting: "故障排查",
    privacy: "隐私政策",
    moreTools: "EMMMM.DEV 工具集",
  },
};

/**
 * The sibling site that publishes this one. The link is deliberately plain and
 * followable — `rel="noreferrer"` would still pass link equity, but there's no
 * reason to hide the referrer between two properties we own. Paired with the
 * `Organization` node in `seo.tsx`, it lets crawlers confirm that
 * easy-complete.emmmm.dev and tools.emmmm.dev are the same publisher instead of
 * guessing from a one-way link.
 */
const PUBLISHER_SITE_URL = "https://tools.emmmm.dev/";

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
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#2b333d] px-2.5 text-[#9aa4b0] transition-colors hover:border-[#475060] hover:bg-[#141a22] hover:text-[#e6edf3]"
      >
        <GlobeIcon />
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-44 overflow-hidden rounded-xl border border-[#242d38] bg-[#0d1219] py-1 shadow-[0_24px_48px_-16px_rgba(0,0,0,.85)]"
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
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[#151c26] ${
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

const SKIP_LABEL: Record<Locale, string> = {
  en: "Skip to content",
  "zh-CN": "跳到主要内容",
};

const MENU_TOGGLE_LABEL: Record<Locale, { open: string; close: string }> = {
  en: { open: "Open menu", close: "Close menu" },
  "zh-CN": { open: "打开菜单", close: "关闭菜单" },
};

/** The id every page puts on its `<main>`, for the skip link. */
export const MAIN_ID = "main";

function navLinks(locale: Locale) {
  const prefix = LOCALE_PREFIX[locale];
  const labels = NAV_LABELS[locale];
  const homePath = prefix || "/";
  return [
    { href: `${homePath}#features`, label: labels.features, key: "features" },
    { href: `${prefix}/docs`, label: labels.docs, key: "docs" },
  ] as const;
}

/** The mobile menu carries the nav plus the two guides people look for most. */
function mobileMenuLinks(locale: Locale) {
  const labels = FOOTER_LABELS[locale];
  const [install, troubleshooting] = footerLinks(locale).slice(1, 3);
  return [
    ...navLinks(locale),
    { href: install!.href, label: labels.install, key: "install" },
    {
      href: troubleshooting!.href,
      label: labels.troubleshooting,
      key: "troubleshooting",
    },
  ];
}

interface FooterLink {
  href: string;
  label: string;
  /** Off-site, so it needs target/rel — see `PUBLISHER_SITE_URL`. */
  external?: boolean;
}

function footerLinks(locale: Locale): FooterLink[] {
  const prefix = LOCALE_PREFIX[locale];
  const labels = FOOTER_LABELS[locale];
  const troubleshootingPath =
    locale === "zh-CN" ? "/zh/troubleshooting" : "/troubleshooting";
  return [
    { href: `${prefix}/docs`, label: labels.docs },
    { href: `${prefix}/install`, label: labels.install },
    { href: troubleshootingPath, label: labels.troubleshooting },
    { href: "/privacy-policy", label: labels.privacy },
    { href: PUBLISHER_SITE_URL, label: labels.moreTools, external: true },
  ];
}

/** Two bars that turn into an X; animated on the base curve. */
function MenuIcon({ open }: { open: boolean }) {
  const bar =
    "absolute left-0 h-0.5 w-full rounded-full bg-current transition-transform duration-500 ease-(--ease-out-quint)";
  return (
    <span aria-hidden="true" className="relative block h-3 w-4.5">
      <span
        className={`${bar} top-0.5 ${open ? "translate-y-1 rotate-45" : ""}`}
      />
      <span
        className={`${bar} bottom-0.5 ${open ? "-translate-y-1 -rotate-45" : ""}`}
      />
    </span>
  );
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
  // backdrop once a sentinel at the very top of the page scrolls out of view.
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (variant !== "transparent" || !node) return;

    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry?.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [variant]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnDesktop = window.matchMedia("(min-width: 40rem)");
    const onResize = () => closeOnDesktop.matches && setMenuOpen(false);

    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeOnDesktop.addEventListener("change", onResize);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      closeOnDesktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  const opaque = variant !== "transparent" || scrolled || menuOpen;

  return (
    <>
      <a
        href={`#${MAIN_ID}`}
        className="sr-only rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-[#06140a] focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-60"
      >
        {SKIP_LABEL[locale]}
      </a>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-2 w-px"
      />

      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div
          className={`mx-auto flex max-w-310 items-center gap-3 rounded-2xl border py-2 pr-2 pl-3 sm:gap-5 transition-[background-color,border-color] duration-300 sm:pl-5 ${
            opaque
              ? "border-[#1c232d] bg-[#0a0d12]/85 backdrop-blur-md"
              : "border-transparent bg-transparent"
          }`}
        >
          <a
            href={LOCALE_PREFIX[locale] || "/"}
            className="flex shrink-0 items-center gap-2.5 rounded-lg font-mono text-base font-medium whitespace-nowrap"
          >
            <img
              src={logoUrl}
              alt=""
              className="h-8 w-8 rounded-lg"
            />
            <span>Easy Complete</span>
          </a>

          <nav className="ml-auto flex min-w-0 items-center gap-2 text-sm sm:gap-6">
            {navLinks(locale).map((link) => (
              <a
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? "page" : undefined}
                className={`hidden rounded-md transition-colors sm:inline ${
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
              onClick={() =>
                captureEvent("website_github_clicked", {
                  locale,
                  placement: "header",
                })
              }
              aria-label="Easy Complete on GitHub"
              className="hidden h-9 items-center gap-2 rounded-lg border border-[#2b333d] px-3 text-[#e6edf3] transition-[color,background-color,border-color,scale] hover:border-[#475060] hover:bg-[#141a22] active:scale-[.98] sm:inline-flex"
            >
              <GitHubIcon />
              <span>GitHub</span>
            </a>
            <a
              href={DOWNLOAD_URL}
              onClick={() =>
                captureEvent("website_download_clicked", {
                  locale,
                  placement: "header",
                })
              }
              className="hidden h-9 items-center gap-2 rounded-lg bg-(--accent) px-4 font-medium whitespace-nowrap text-[#06140a] transition-[filter,scale] hover:brightness-110 active:scale-[.98] sm:inline-flex"
            >
              <AppleIcon />
              {DOWNLOAD_LABEL[locale]}
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
              aria-label={MENU_TOGGLE_LABEL[locale][menuOpen ? "close" : "open"]}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#cdd6e0] transition-colors hover:bg-[#141a22] hover:text-[#e6edf3] sm:hidden"
            >
              <MenuIcon open={menuOpen} />
            </button>
          </nav>
        </div>
      </header>

      <div
        id="site-mobile-menu"
        inert={!menuOpen}
        className={`fixed inset-0 z-40 bg-[#0a0d12]/95 px-6 pt-24 pb-10 backdrop-blur-md transition-opacity duration-300 sm:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col">
          {[
            ...mobileMenuLinks(locale),
            { href: GITHUB_URL, label: "GitHub", key: "github" },
          ].map((link, index) => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active === link.key ? "page" : undefined}
              style={{ transitionDelay: menuOpen ? `${index * 60}ms` : "0ms" }}
              className={`border-b border-[#161d25] py-4 text-2xl font-medium transition-[opacity,translate,color] duration-500 ease-(--ease-out-quint) ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              } ${
                active === link.key
                  ? "text-(--accent)"
                  : "text-[#e6edf3] hover:text-(--accent)"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={DOWNLOAD_URL}
          onClick={() =>
            captureEvent("website_download_clicked", {
              locale,
              placement: "mobile_menu",
            })
          }
          style={{ transitionDelay: menuOpen ? "300ms" : "0ms" }}
          className={`mt-8 flex items-center justify-center gap-2 rounded-xl bg-(--accent) px-5 py-3.5 text-base font-medium text-[#06140a] transition-[opacity,translate,filter] duration-500 hover:brightness-110 active:scale-[.98] ${
            menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <AppleIcon />
          {DOWNLOAD_LABEL[locale]}
        </a>
      </div>
    </>
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
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener" : undefined}
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
