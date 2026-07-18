import { useEffect, useRef, useState, type ReactNode } from "react";
import { Terminal } from "./components/Terminal.tsx";
import logoUrl from "./assets/logo.png";
import {
  GITHUB_URL,
  faqs,
  features,
  processes,
  reasons,
  terminals,
} from "./data.ts";

const SECTION_LABEL =
  "font-mono text-xs uppercase tracking-[.22em] text-(--accent) mb-3.5";

const ACTION_SURFACE =
  "ec-action will-change-transform transition-[transform,filter,box-shadow,background-color,border-color,color] duration-200 ease-[var(--ease-out-quart)]";

const CARD_SURFACE =
  "ec-card will-change-transform transition-[transform,box-shadow,background-color,border-color] duration-[260ms] ease-[var(--ease-out-quart)]";

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
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 }
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

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[1.1em] w-[1.1em] shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.3 12.4c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.8-2.1-1.6-.2-3.1.9-3.9.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.8 1.3 10.4.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1-.1-2.9-1.2-3-3.9ZM14.7 4.6c.7-.9 1.2-2.1 1.1-3.3-1.1 0-2.4.7-3.1 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3.1-1.5Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[1.08em] w-[1.08em] shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"
      />
    </svg>
  );
}

export function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0d12]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(95% 70% at 50% 0%, var(--accent-glow), transparent 56%)",
          }}
        />

        {/* ===== HEADER ===== */}
        <header className="relative z-50 bg-transparent">
          <div className="mx-auto flex max-w-310 items-center justify-between gap-5 px-7 py-3.5">
            <a
              href="/"
              className="flex items-center gap-2.5 font-mono text-[16px] font-bold tracking-[-.01em]"
            >
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-8 rounded-[9px] shadow-[0_0_24px_-12px_var(--accent)]"
              />
              <span>easy-complete</span>
            </a>
            <nav className="flex items-center gap-6.5 text-sm text-[#9aa4b0]">
              <a
                href="#features"
                className="hidden transition-colors hover:text-[#e6edf3] sm:inline"
              >
                Features
              </a>
              <a
                href="#why"
                className="hidden transition-colors hover:text-[#e6edf3] sm:inline"
              >
                Why
              </a>
              <a
                href="#how"
                className="hidden transition-colors hover:text-[#e6edf3] md:inline"
              >
                How it works
              </a>
              <a
                href="#faq"
                className="hidden transition-colors hover:text-[#e6edf3] lg:inline"
              >
                FAQ
              </a>
              <a
                href={GITHUB_URL}
                className="inline-flex items-center gap-1.75 rounded-lg border border-[#2b333d] px-3.25 py-1.75 text-[#e6edf3] transition-colors hover:border-[#475060] hover:bg-[#141a22]"
              >
                <GitHubIcon />
                GitHub
              </a>
              <a
                href="/install"
                className="inline-flex items-center gap-1.75 rounded-lg bg-(--accent) px-4 py-2 font-semibold text-[#06140a] transition hover:brightness-110 hover:shadow-[0_8px_24px_-8px_var(--accent-line)]"
              >
                <AppleIcon />
                Install
              </a>
            </nav>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <section className="relative px-7 pb-7.5 pt-10">
          <div className="relative mx-auto flex max-w-195 flex-col items-center text-center">
            <div className="ec-hero-step mb-6.5 inline-flex items-center gap-2 rounded-full border border-[#232c36] px-3.75 py-1.5 font-mono text-[12.5px] text-[#9aa4b0]">
              <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
              macOS · 100% local · open source
            </div>
            <h1
              className="ec-hero-step m-0 mb-4.5 max-w-155 text-[40px] font-bold leading-[1.03] tracking-[-.035em] text-balance sm:text-[54px]"
              style={{ animationDelay: "90ms" }}
            >
              Autocomplete for your macOS terminal.
            </h1>
            <p
              className="ec-hero-step m-0 mb-7.5 max-w-132.5 text-[18px] leading-[1.6] text-[#909aa6]"
              style={{ animationDelay: "180ms" }}
            >
              Fish-shell-style suggestions for hundreds of CLIs — git, npm,
              docker, cargo. Native, fast, and entirely on-device.
            </p>
            <div
              className="ec-hero-step mb-11 flex flex-wrap justify-center gap-3.25"
              style={{ animationDelay: "270ms" }}
            >
              <a
                href="/install"
                className={`${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-[11px] bg-(--accent) px-6.5 py-3.25 text-[16px] font-semibold text-[#06140a] hover:brightness-110 hover:shadow-[0_14px_34px_-12px_var(--accent-line)]`}
              >
                <AppleIcon />
                Install with Homebrew
              </a>
              <a
                href={GITHUB_URL}
                className={`${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-[11px] border border-[#2c343e] px-6.5 py-3.25 text-[16px] font-medium text-[#e6edf3] hover:border-[#475060] hover:bg-[#141a22]`}
              >
                <GitHubIcon />
                View on GitHub
              </a>
            </div>
            <div
              className="ec-hero-terminal w-full max-w-150"
              style={{ animationDelay: "380ms" }}
            >
              <Terminal showKeys demoSpeed={1} />
            </div>
          </div>
        </section>
      </div>

      {/* ===== FEATURES ===== */}
      <section
        id="features"
        className="mt-10 border-t border-[#141a21] px-7 py-20"
      >
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>Features</div>
          <h2 className="m-0 mb-2 max-w-160 text-[30px] font-bold leading-[1.15] tracking-[-.02em] text-pretty">
            Everything you need to complete a command. Nothing you don't.
          </h2>
          <p className="m-0 mb-10 max-w-140 text-[16px] text-[#8b95a1]">
            One job, done well — no chat, no AI calls, no cloud completions.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
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
        </Reveal>
      </section>

      {/* ===== WHY ===== */}
      <section
        id="why"
        className="border-t border-[#141a21] bg-[#090c11] px-7 py-20"
      >
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>Why Easy Complete</div>
          <h2 className="m-0 mb-11 max-w-140 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Opinionated, on purpose.
          </h2>
          <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
            {reasons.map((r) => (
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
          <div className={SECTION_LABEL}>Supported terminals</div>
          <h2 className="m-0 mb-6.5 max-w-155 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Works everywhere you type.
          </h2>
          <div className="mb-4.5 flex flex-wrap gap-2.75">
            {terminals.map((t) => (
              <span
                key={t}
                className={`${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-full border border-[#232c36] bg-[#0d1219] px-4 py-2.25 font-mono text-sm text-[#cdd6e0] hover:-translate-y-0.5 hover:border-(--accent-line) hover:text-white`}
              >
                <span className="font-bold text-(--accent)">✓</span>
                {t}
              </span>
            ))}
          </div>
          <p className="m-0 max-w-170 text-sm leading-[1.6] text-[#6e7884]">
            Most terminals work out of the box via the PTY integration. Ghostty,
            Kitty, WezTerm, Zed and Alacritty add a bundled input method for
            pixel-accurate cursor tracking — registered automatically at
            install.
          </p>
        </Reveal>
      </section>

      {/* ===== ARCHITECTURE ===== */}
      <section
        id="how"
        className="border-t border-[#141a21] bg-[#090c11] px-7 py-20"
      >
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>How it works</div>
          <h2 className="m-0 mb-2.5 max-w-160 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Three processes, talking over sockets.
          </h2>
          <p className="m-0 mb-10 max-w-150 text-[16px] leading-[1.6] text-[#8b95a1]">
            Native and lightweight, built in Rust. Each process owns one job and
            they coordinate over Unix domain sockets with Protobuf messages.
          </p>

          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            {processes.map((p) => (
              <div
                key={p.bin}
                className={`${CARD_SURFACE} flex flex-col rounded-[14px] border border-[#1c232d] bg-[#0c1118] px-5.5 py-6 hover:-translate-y-0.5 hover:border-[#2a3340]`}
              >
                <div className="mb-1 font-mono text-[16px] font-bold text-(--accent)">
                  {p.bin}
                </div>
                <div className="mb-3.5 font-mono text-xs text-[#5d6773]">
                  crate · {p.crate}
                </div>
                <p className="m-0 text-sm leading-[1.6] text-[#9099a5]">
                  {p.role}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4.5 flex flex-wrap items-center gap-2.5 font-mono text-[12.5px] text-[#6e7884]">
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-3.25 py-2">
              shell hooks → CWD · command text · cursor
            </span>
            <span className="text-(--accent)">⇄</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-3.25 py-2">
              input-method helper → caret position (macOS)
            </span>
            <span className="text-(--accent)">⇄</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-3.25 py-2">
              Protobuf over Unix sockets
            </span>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="border-t border-[#141a21] px-7 py-20">
        <Reveal className="mx-auto max-w-225">
          <div className={SECTION_LABEL}>FAQ</div>
          <h2 className="m-0 mb-7 max-w-155 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Answers before you install.
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {faqs.map((faq) => (
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

      {/* ===== GUIDES ===== */}
      <section className="border-t border-[#141a21] bg-[#090c11] px-7 py-18.5">
        <Reveal className="mx-auto max-w-295">
          <div className={SECTION_LABEL}>Guides</div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
            <div>
              <h2 className="m-0 mb-3 max-w-130 text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
                Get from download to first completion.
              </h2>
              <p className="m-0 max-w-130 text-[16px] leading-[1.65] text-[#828d99]">
                Install Easy Complete, set up cursor tracking for Ghostty, or
                fix a shell integration without digging through the repository.
              </p>
            </div>
            <div className="divide-y divide-[#1c232d] border-y border-[#1c232d]">
              {[
                [
                  "/install",
                  "Install on macOS",
                  "DMG, Accessibility permission, shell reload, and verification.",
                ],
                [
                  "/terminals/ghostty",
                  "Ghostty autocomplete",
                  "Keep the native suggestion window aligned with the cursor.",
                ],
                [
                  "/fig-alternative",
                  "Looking for a Fig alternative?",
                  "See what the focused, local completion engine includes.",
                ],
                [
                  "/troubleshooting",
                  "Troubleshooting",
                  "Diagnose missing suggestions and terminal integrations.",
                ],
              ].map(([href, title, description]) => (
                <a
                  key={href}
                  href={href}
                  className="group grid gap-1 py-4 transition-colors sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-5"
                >
                  <span className="font-semibold text-[#d8e0e9] group-hover:text-(--accent)">
                    {title}
                  </span>
                  <span className="text-sm leading-[1.55] text-[#737e8b]">
                    {description}
                  </span>
                  <span className="hidden font-mono text-(--accent) sm:inline">
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
            Stop memorizing flags.
          </h2>
          <p className="m-0 mb-7.5 text-[18px] text-[#909aa6]">
            Let your terminal remember them for you.
          </p>
          <div className="mb-7.5 flex flex-wrap justify-center gap-3.25">
            <a
              href="/install"
              className={`${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-[11px] bg-(--accent) px-6.5 py-3.25 text-[16px] font-semibold text-[#06140a] hover:brightness-110 hover:shadow-[0_14px_34px_-12px_var(--accent-line)]`}
            >
              <AppleIcon />
              Install with Homebrew
            </a>
            <a
              href={GITHUB_URL}
              className={`${ACTION_SURFACE} inline-flex items-center gap-2.25 rounded-[11px] border border-[#2c343e] px-6.5 py-3.25 text-[16px] font-medium text-[#e6edf3] hover:border-[#475060] hover:bg-[#141a22]`}
            >
              <GitHubIcon />
              View on GitHub
            </a>
          </div>
          <p className="m-0 font-mono text-[13px] leading-[1.7] text-[#5d6773]">
            Requires macOS 12+ · Apple Silicon (ARM64) · MIT / Apache-2.0
            <br />A focused local completion engine built for fast terminal
            autocomplete.
          </p>
        </Reveal>
        <div className="relative mx-auto mt-16 flex max-w-295 flex-wrap items-center justify-between gap-4 border-t border-[#161d25] pt-6.5 text-[13px] text-[#5d6773]">
          <span className="inline-flex items-center gap-2 font-mono">
            <img src={logoUrl} alt="" className="h-5 w-5 rounded-md" />
            easy-complete
          </span>
          <span className="inline-flex items-center gap-4">
            <a
              href="/install"
              className="transition-colors hover:text-[#e6edf3]"
            >
              Install guide
            </a>
            <a
              href="/troubleshooting"
              className="transition-colors hover:text-[#e6edf3]"
            >
              Help
            </a>
            <a
              href="/privacy"
              className="transition-colors hover:text-[#e6edf3]"
            >
              Privacy
            </a>
            <span>cli · terminal · macOS</span>
          </span>
        </div>
      </section>
    </div>
  );
}
