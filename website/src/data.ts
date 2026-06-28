// Page content, ported verbatim from the Claude Design source (Easy Complete.dc.html).

export const GITHUB_URL = "https://github.com/chen86860/easy-complete";

export interface Feature {
  glyph: string;
  title: string;
  desc: string;
}

const glyphs = ["›_", "⌘", "◳", "⚡", "◆", "◐", "⊞", "$", "⇥"];

const featureData: Omit<Feature, "glyph">[] = [
  {
    title: "Inline completions",
    desc: "IDE-style suggestions the instant you type — subcommands, flags, arguments and file paths, ranked for what you actually mean.",
  },
  {
    title: "Hundreds of CLIs",
    desc: "Out-of-the-box specs for git, npm, docker, cargo, aws, kubectl and many more popular tools.",
  },
  {
    title: "Native overlay",
    desc: "A lightweight native window that floats right at your cursor — not a clunky shell hack.",
  },
  {
    title: "Fast & lightweight",
    desc: "Built in Rust. Milliseconds to suggest, with no lag between you and your keystrokes.",
  },
  {
    title: "100% local",
    desc: "No cloud, no account, no AI calls. Your commands never leave your machine.",
  },
  {
    title: "Themeable",
    desc: "Match your terminal's vibe — ships with themes like GitHub Dark and more.",
  },
  {
    title: "Works everywhere",
    desc: "Most terminals work out of the box; Ghostty, Kitty, WezTerm, Zed and Alacritty get pixel-accurate tracking.",
  },
  {
    title: "In-IDE terminals",
    desc: "Completions follow you into the integrated terminals of VS Code and JetBrains IDEs.",
  },
  {
    title: "One-command setup",
    desc: "./install.sh builds, installs and wires up shell integration — then just start typing.",
  },
];

export const features: Feature[] = featureData.map((d, i) => ({
  glyph: glyphs[i] ?? "›_",
  ...d,
}));

export interface Reason {
  num: string;
  title: string;
  desc: string;
}

export const reasons: Reason[] = [
  {
    num: "01",
    title: "Just autocomplete — nothing else",
    desc: "No chat, no AI assistant, no telemetry. One job, done well.",
  },
  {
    num: "02",
    title: "Native, not a plugin",
    desc: "A real macOS app with a true overlay window, not a string of escape codes painted into your prompt.",
  },
  {
    num: "03",
    title: "Privacy by default",
    desc: "Everything runs on-device. Your commands stay yours.",
  },
  {
    num: "04",
    title: "Open source",
    desc: "A focused local completion engine built for fast terminal autocomplete.",
  },
];

export const terminals: string[] = [
  "Ghostty",
  "Kitty",
  "WezTerm",
  "Alacritty",
  "Zed",
  "iTerm2",
  "Apple Terminal",
  "VS Code",
  "JetBrains IDEs",
];

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "What is Easy Complete?",
    answer:
      "Easy Complete is a macOS terminal autocomplete app that shows IDE-style inline suggestions for command-line tools.",
  },
  {
    question: "Does Easy Complete run locally?",
    answer:
      "Yes. Easy Complete runs on-device and does not require an account, telemetry, cloud calls, or AI requests for autocomplete.",
  },
  {
    question: "Which terminals does Easy Complete support?",
    answer:
      "Easy Complete supports Ghostty, Kitty, WezTerm, Alacritty, Zed, iTerm2, Apple Terminal, VS Code, and JetBrains IDE terminals.",
  },
  {
    question: "How do I install Easy Complete?",
    answer:
      "Download the latest macOS DMG from GitHub Releases, open it, and follow the install instructions.",
  },
];

export interface Process {
  bin: string;
  crate: string;
  role: string;
}

export const processes: Process[] = [
  {
    bin: "easy-complete",
    crate: "fig_desktop",
    role: "Native app host — owns the autocomplete overlay and dashboard (React apps in wry WebViews), system tray and window management.",
  },
  {
    bin: "ecterm",
    crate: "figterm",
    role: "Pseudoterminal between your shell and emulator; intercepts the shell edit buffer to drive completions.",
  },
  {
    bin: "ec",
    crate: "q_cli",
    role: "CLI entry point — setup, integrations, diagnostic, settings and more.",
  },
];
