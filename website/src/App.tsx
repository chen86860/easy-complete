import { Terminal } from "./components/Terminal.tsx";
import { GITHUB_URL, features, processes, reasons, terminals } from "./data.ts";

const SECTION_LABEL =
  "font-mono text-xs uppercase tracking-[.22em] text-[var(--accent)] mb-[14px]";

export function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0d12]">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-[#1a212a] bg-[rgba(10,13,18,.74)] backdrop-blur-[12px]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-7 py-[14px]">
          <a
            href="#"
            className="flex items-center gap-[9px] font-mono text-[16px] font-bold tracking-[-.01em]"
          >
            <span className="text-[var(--accent)]">❯</span>
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
              href={GITHUB_URL}
              className="inline-flex items-center gap-[7px] rounded-lg border border-[#2b333d] px-[13px] py-[7px] text-[#e6edf3] transition-colors hover:border-[#475060] hover:bg-[#141a22]"
            >
              GitHub ↗
            </a>
            <a
              href="#get"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-[#06140a] transition hover:brightness-110 hover:shadow-[0_8px_24px_-8px_var(--accent-line)]"
            >
              Install
            </a>
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden px-7 pb-[30px] pt-[74px]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(95% 70% at 50% -6%, var(--accent-glow), transparent 56%)",
          }}
        />
        <div className="relative mx-auto flex max-w-[780px] flex-col items-center text-center">
          <div className="mb-[26px] inline-flex items-center gap-2 rounded-full border border-[#232c36] px-[15px] py-[6px] font-mono text-[12.5px] text-[#9aa4b0]">
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" />
            macOS · 100% local · open source
          </div>
          <h1 className="m-0 mb-[18px] max-w-[620px] text-[40px] font-bold leading-[1.03] tracking-[-.035em] text-balance sm:text-[54px]">
            Autocomplete for your terminal.
          </h1>
          <p className="m-0 mb-[30px] max-w-[530px] text-[18px] leading-[1.6] text-[#909aa6]">
            Fish-shell-style suggestions for hundreds of CLIs — git, npm,
            docker, cargo. Native, fast, and entirely on-device.
          </p>
          <div className="mb-[44px] flex flex-wrap justify-center gap-[13px]">
            <a
              href="#get"
              className="rounded-[11px] bg-[var(--accent)] px-[26px] py-[13px] text-[16px] font-semibold text-[#06140a] transition hover:brightness-110 hover:shadow-[0_14px_34px_-12px_var(--accent-line)]"
            >
              Install for macOS
            </a>
            <a
              href={GITHUB_URL}
              className="rounded-[11px] border border-[#2c343e] px-[26px] py-[13px] text-[16px] font-medium text-[#e6edf3] transition-colors hover:border-[#475060] hover:bg-[#141a22]"
            >
              View on GitHub
            </a>
          </div>
          <div className="w-full max-w-[600px]">
            <Terminal showKeys demoSpeed={1} />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        id="features"
        className="mt-10 border-t border-[#141a21] px-7 py-20"
      >
        <div className="mx-auto max-w-[1180px]">
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
                className="rounded-[14px] border border-[#1c232d] bg-[#0d1219] px-5 py-[22px] transition duration-[180ms] hover:-translate-y-1 hover:border-[var(--accent-line)] hover:shadow-[0_18px_44px_-24px_var(--accent-glow)]"
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
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section
        id="why"
        className="border-t border-[#141a21] bg-[#090c11] px-7 py-20"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className={SECTION_LABEL}>Why Easy Complete</div>
          <h2 className="m-0 mb-11 max-w-[560px] text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Opinionated, on purpose.
          </h2>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {reasons.map((r) => (
              <div
                key={r.num}
                className="flex gap-5 rounded-[14px] border border-[#1a212a] bg-[#0c1118] px-6 py-[26px] transition-colors hover:border-[#2a3340]"
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
        </div>
      </section>

      {/* ===== TERMINALS ===== */}
      <section className="border-t border-[#141a21] px-7 py-[74px]">
        <div className="mx-auto max-w-[1180px]">
          <div className={SECTION_LABEL}>Supported terminals</div>
          <h2 className="m-0 mb-[26px] max-w-[620px] text-[30px] font-bold leading-[1.15] tracking-[-.02em]">
            Works everywhere you type.
          </h2>
          <div className="mb-[18px] flex flex-wrap gap-[11px]">
            {terminals.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-[9px] rounded-full border border-[#232c36] bg-[#0d1219] px-4 py-[9px] font-mono text-sm text-[#cdd6e0] transition-colors hover:border-[var(--accent-line)] hover:text-white"
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
        </div>
      </section>

      {/* ===== ARCHITECTURE ===== */}
      <section
        id="how"
        className="border-t border-[#141a21] bg-[#090c11] px-7 py-20"
      >
        <div className="mx-auto max-w-[1180px]">
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
                className="flex flex-col rounded-[14px] border border-[#1c232d] bg-[#0c1118] px-[22px] py-6"
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
        </div>
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
        <div className="relative mx-auto max-w-[720px]">
          <h2 className="m-0 mb-[14px] text-[34px] font-bold leading-[1.05] tracking-[-.03em] sm:text-[46px]">
            Stop memorizing flags.
          </h2>
          <p className="m-0 mb-[30px] text-[18px] text-[#909aa6]">
            Let your terminal remember them for you.
          </p>
          <div className="mb-[30px] flex flex-wrap justify-center gap-[13px]">
            <a
              href="#get"
              className="rounded-[11px] bg-[var(--accent)] px-[26px] py-[13px] text-[16px] font-semibold text-[#06140a] transition hover:brightness-110 hover:shadow-[0_14px_34px_-12px_var(--accent-line)]"
            >
              Install for macOS
            </a>
            <a
              href={GITHUB_URL}
              className="rounded-[11px] border border-[#2c343e] px-[26px] py-[13px] text-[16px] font-medium text-[#e6edf3] transition-colors hover:border-[#475060] hover:bg-[#141a22]"
            >
              View on GitHub
            </a>
          </div>
          <p className="m-0 font-mono text-[13px] leading-[1.7] text-[#5d6773]">
            Requires macOS 12+ · Apple Silicon or Intel · MIT / Apache-2.0
            <br />A focused fork of the Amazon Q Developer CLI, stripped down to
            pure terminal completion.
          </p>
        </div>
        <div className="relative mx-auto mt-16 flex max-w-[1180px] flex-wrap items-center justify-between gap-4 border-t border-[#161d25] pt-[26px] text-[13px] text-[#5d6773]">
          <span className="font-mono">
            <span className="text-[var(--accent)]">❯</span> easy-complete
          </span>
          <span>cli · terminal · macOS</span>
        </div>
      </section>
    </div>
  );
}
