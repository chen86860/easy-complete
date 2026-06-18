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
import { DOWNLOAD_URL } from "./download.ts";

const SECTION_LABEL =
  "font-mono text-xs uppercase tracking-[.22em] text-[var(--accent)] mb-[14px]";

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
          <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-7 py-[14px]">
            <a
              href="#"
              className="flex items-center gap-[10px] font-mono text-[16px] font-bold tracking-[-.01em]"
            >
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-8 rounded-[9px] shadow-[0_0_24px_-12px_var(--accent)]"
              />
              <span>easy-complete</span>
            </a>
            <nav className="flex items-center gap-[26px] text-sm text-[#9aa4b0]">
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
                className="inline-flex items-center gap-[7px] rounded-lg border border-[#2b333d] px-[13px] py-[7px] text-[#e6edf3] transition-colors hover:border-[#475060] hover:bg-[#141a22]"
              >
                <GitHubIcon />
                GitHub
              </a>
              <a
                href={DOWNLOAD_URL}
                className="inline-flex items-center gap-[7px] rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-[#06140a] transition hover:brightness-110 hover:shadow-[0_8px_24px_-8px_var(--accent-line)]"
              >
                <AppleIcon />
                Install
              </a>
            </nav>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <section className="relative px-7 pb-[30px] pt-10">
          <div className="relative mx-auto flex max-w-[780px] flex-col items-center text-center">
            <div className="ec-hero-step mb-[26px] inline-flex items-center gap-2 rounded-full border border-[#232c36] px-[15px] py-[6px] font-mono text-[12.5px] text-[#9aa4b0]">
              <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" />
              macOS · 100% local · open source
            </div>
            <h1
              className="ec-hero-step m-0 mb-[18px] max-w-[620px] text-[40px] font-bold leading-[1.03] tracking-[-.035em] text-balance sm:text-[54px]"
              style={{ animationDelay: "90ms" }}
            >
              Autocomplete for your macOS terminal.
            </h1>
            <p
              className="ec-hero-step m-0 mb-[30px] max-w-[530px] text-[18px] leading-[1.6] text-[#909aa6]"
              style={{ animationDelay: "180ms" }}
            >
              Fish-shell-style suggestions for hundreds of CLIs — git, npm,
              docker, cargo. Native, fast, and entirely on-device.
            </p>
            <div
              className="ec-hero-step mb-[44px] flex flex-wrap justify-center gap-[13px]"
              style={{ animationDelay: "270ms" }}
            >
              <a
                href={DOWNLOAD_URL}
                className={`${ACTION_SURFACE} inline-flex items-center gap-[9px] rounded-[11px] bg-[var(--accent)] px-[26px] py-[13px] text-[16px] font-semibold text-[#06140a] hover:brightness-110 hover:shadow-[0_14px_34px_-12px_var(--accent-line)]`}
              >
                <AppleIcon />
                Install for macOS
              </a>
              <a
                href={GITHUB_URL}
                className={`${ACTION_SURFACE} inline-flex items-center gap-[9px] rounded-[11px] border border-[#2c343e] px-[26px] py-[13px] text-[16px] font-medium text-[#e6edf3] hover:border-[#475060] hover:bg-[#141a22]`}
              >
                <GitHubIcon />
                View on GitHub
              </a>
            </div>
            <div
              className="ec-hero-terminal w-full max-w-[600px]"
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
        <Reveal className="mx-auto max-w-[1180px]">
          <div className={SECTION_LABEL}>Features</div>
          <h2 className="m-0 mb-2 max-w-[640px] text-[30px] font-bold leading-[1.15] tracking-[-.02em] text-pretty">
            Everything you need to complete a command. Nothing you don't.
          </h2>
          <p className="m-0 mb-10 max-w-[560px] text-[16px] text-[#8b95a1]">
            One job, done well — no chat, no AI calls, no telemetry.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className={`${CARD_SURFACE} rounded-[14px] border border-[#1c232d] bg-[#0d1219] px-5 py-[22px] hover:-translate-y-1 hover:border-[var(--accent-line)] hover:shadow-[0_18px_44px_-24px_var(--accent-glow)]`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--accent-line)] bg-[var(--accent-soft)] font-mono text-[16px] font-bold text-[var(--accent)]">
                  {f.glyph}
                </div>
                <h3 className="m-0 mb-[7px] text-[17px] font-semibold tracking-[-.01em]">
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
        <Reveal className="mx-auto max-w-[1180px]">
          <div className={SECTION_LABEL}>Why Easy Complete</div>
          <h2 className="m-0 mb-11 max-w-[560px] text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Opinionated, on purpose.
          </h2>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {reasons.map((r) => (
              <div
                key={r.num}
                className={`${CARD_SURFACE} flex gap-5 rounded-[14px] border border-[#1a212a] bg-[#0c1118] px-6 py-[26px] hover:-translate-y-[2px] hover:border-[#2a3340]`}
              >
                <div className="pt-[3px] font-mono text-sm font-bold text-[var(--accent)]">
                  {r.num}
                </div>
                <div>
                  <h3 className="m-0 mb-[7px] text-[18px] font-semibold tracking-[-.01em]">
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
      <section className="border-t border-[#141a21] px-7 py-[74px]">
        <Reveal className="mx-auto max-w-[1180px]">
          <div className={SECTION_LABEL}>Supported terminals</div>
          <h2 className="m-0 mb-[26px] max-w-[620px] text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Works everywhere you type.
          </h2>
          <div className="mb-[18px] flex flex-wrap gap-[11px]">
            {terminals.map((t) => (
              <span
                key={t}
                className={`${ACTION_SURFACE} inline-flex items-center gap-[9px] rounded-full border border-[#232c36] bg-[#0d1219] px-4 py-[9px] font-mono text-sm text-[#cdd6e0] hover:-translate-y-[2px] hover:border-[var(--accent-line)] hover:text-white`}
              >
                <span className="font-bold text-[var(--accent)]">✓</span>
                {t}
              </span>
            ))}
          </div>
          <p className="m-0 max-w-[680px] text-sm leading-[1.6] text-[#6e7884]">
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
        <Reveal className="mx-auto max-w-[1180px]">
          <div className={SECTION_LABEL}>How it works</div>
          <h2 className="m-0 mb-[10px] max-w-[640px] text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Three processes, talking over sockets.
          </h2>
          <p className="m-0 mb-10 max-w-[600px] text-[16px] leading-[1.6] text-[#8b95a1]">
            Native and lightweight, built in Rust. Each process owns one job and
            they coordinate over Unix domain sockets with Protobuf messages.
          </p>

          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            {processes.map((p) => (
              <div
                key={p.bin}
                className={`${CARD_SURFACE} flex flex-col rounded-[14px] border border-[#1c232d] bg-[#0c1118] px-[22px] py-6 hover:-translate-y-[2px] hover:border-[#2a3340]`}
              >
                <div className="mb-1 font-mono text-[16px] font-bold text-[var(--accent)]">
                  {p.bin}
                </div>
                <div className="mb-[14px] font-mono text-xs text-[#5d6773]">
                  crate · {p.crate}
                </div>
                <p className="m-0 text-sm leading-[1.6] text-[#9099a5]">
                  {p.role}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-[18px] flex flex-wrap items-center gap-[10px] font-mono text-[12.5px] text-[#6e7884]">
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-[13px] py-2">
              shell hooks → CWD · command text · cursor
            </span>
            <span className="text-[var(--accent)]">⇄</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-[13px] py-2">
              input-method helper → caret position (macOS)
            </span>
            <span className="text-[var(--accent)]">⇄</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2a333e] px-[13px] py-2">
              Protobuf over Unix sockets
            </span>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="border-t border-[#141a21] px-7 py-20">
        <Reveal className="mx-auto max-w-[900px]">
          <div className={SECTION_LABEL}>FAQ</div>
          <h2 className="m-0 mb-[28px] max-w-[620px] text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Answers before you install.
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className={`${CARD_SURFACE} rounded-[14px] border border-[#1c232d] bg-[#0d1219] px-6 py-5 hover:-translate-y-[2px] hover:border-[#2a3340]`}
              >
                <h3 className="m-0 mb-[8px] text-[17px] font-semibold tracking-[-.01em]">
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
        <Reveal className="relative mx-auto max-w-[720px]">
          <h2 className="m-0 mb-[14px] text-[34px] font-bold leading-[1.05] tracking-[-.03em] sm:text-[46px]">
            Stop memorizing flags.
          </h2>
          <p className="m-0 mb-[30px] text-[18px] text-[#909aa6]">
            Let your terminal remember them for you.
          </p>
          <div className="mb-[30px] flex flex-wrap justify-center gap-[13px]">
            <a
              href={DOWNLOAD_URL}
              className={`${ACTION_SURFACE} inline-flex items-center gap-[9px] rounded-[11px] bg-[var(--accent)] px-[26px] py-[13px] text-[16px] font-semibold text-[#06140a] hover:brightness-110 hover:shadow-[0_14px_34px_-12px_var(--accent-line)]`}
            >
              <AppleIcon />
              Install for macOS (ARM64)
            </a>
            <a
              href={GITHUB_URL}
              className={`${ACTION_SURFACE} inline-flex items-center gap-[9px] rounded-[11px] border border-[#2c343e] px-[26px] py-[13px] text-[16px] font-medium text-[#e6edf3] hover:border-[#475060] hover:bg-[#141a22]`}
            >
              <GitHubIcon />
              View on GitHub
            </a>
          </div>
          <p className="m-0 font-mono text-[13px] leading-[1.7] text-[#5d6773]">
            Requires macOS 12+ · Apple Silicon (ARM64) · MIT / Apache-2.0
            <br />A focused fork of the Amazon Q Developer CLI, stripped down to
            pure terminal completion.
          </p>
        </Reveal>
        <div className="relative mx-auto mt-16 flex max-w-[1180px] flex-wrap items-center justify-between gap-4 border-t border-[#161d25] pt-[26px] text-[13px] text-[#5d6773]">
          <span className="inline-flex items-center gap-2 font-mono">
            <img src={logoUrl} alt="" className="h-5 w-5 rounded-[6px]" />
            easy-complete
          </span>
          <span>cli · terminal · macOS</span>
        </div>
      </section>
    </div>
  );
}
