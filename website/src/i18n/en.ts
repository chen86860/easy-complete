import {
  docSections,
  faqs,
  features,
  newTerminals,
  processes,
  reasons,
  terminalSupport,
} from "../data.ts";
import type { DocsCopy, HomeCopy } from "./types.ts";

export const homeCopyEn: HomeCopy = {
  badge: "macOS · 100% local · open source",
  heroHeading: "Autocomplete for your macOS terminal",
  heroSubheading:
    "Fish-shell-style suggestions for hundreds of CLIs — git, npm, docker, cargo. Native, fast, and entirely on-device.",
  downloadCta: "Download DMG",
  githubCta: "View on GitHub",
  brewDivider: "Or install with Homebrew",
  copyLabel: "Copy",
  copiedLabel: "Copied",
  copyErrorLabel: "Try again",
  copyAriaLabel: (command) => `Copy Homebrew install command: ${command}`,

  marqueeLabel: "Runs in the terminal you already use",
  featuresLabel: "Features",
  featuresHeading:
    "Everything you need to complete a command. Nothing you don't",
  featuresSubheading:
    "One job, done well — no chat, no AI calls, no cloud completions.",

  whyLabel: "Why Easy Complete",
  whyHeading: "Opinionated, on purpose",

  terminalsLabel: "Supported terminals",
  terminalsHeading: "Works everywhere you type",
  terminalsNewPrefix: "New in v2.1.0:",
  terminalsBody:
    "Otty joins the input-method terminals with pixel-accurate cursor tracking, and ChatGPT (Codex) sessions are located through the xterm.js caret. Everything else keeps working through the shell integration installed automatically on first launch.",
  terminalsLinkLabel: "See the full support list",
  terminalGuideTitle: (name) => `${name} autocomplete setup guide`,
  newBadge: "New",

  howLabel: "How it works",
  howHeading: "Three processes, talking over sockets.",
  howSubheading:
    "Native and lightweight, built in Rust. Each process owns one job and they coordinate over Unix domain sockets with Protobuf messages.",
  crateLabel: "crate",
  flowShellHooks: "shell hooks → CWD · command text · cursor",
  flowInputMethod: "input-method helper → caret position (macOS)",
  flowProtobuf: "Protobuf over Unix sockets",

  faqLabel: "FAQ",
  faqHeading: "Answers before you install.",

  docsLabel: "Docs",
  docsHeading: "Get from download to first completion.",
  docsSubheading:
    "Install Easy Complete, check which terminals are supported, set up cursor tracking for Ghostty, or fix a shell integration — without digging through the repository.",
  docsCta: "Browse the docs",

  ctaHeading: "Stop memorizing flags",
  ctaSubheading: "Let your terminal remember them for you",
  ctaFootnote: "Requires macOS 12+ · Apple Silicon (ARM64) · MIT",
  ctaTagline:
    "A focused local completion engine built for fast terminal autocomplete.",

  features,
  reasons,
  faqs,
  terminalSupport,
  docSections,
  processes,
};

export const docsCopyEn: DocsCopy = {
  eyebrow: "Documentation",
  heading: "Install it, wire up your terminal, keep it working.",
  intro:
    "Everything Easy Complete needs from you is on this page — one install command, one macOS permission, and a support list so you know which path your terminal takes.",
  quickStart: "Quick start",
  installGuideCta: "Full install guide",
  downloadCta: "Download DMG",
  requirements: "macOS 12+ · Apple Silicon (ARM64)",
  terminalColumn: "Terminal",
  trackingColumn: "Cursor tracking",
  notesColumn: "Notes",
  newBadge: "New",
  terminalsCalloutLead: `New in v2.1.0 — ${newTerminals.join(" and ")}.`,
  terminalsCalloutBody:
    "Otty gets input-method cursor tracking, and Easy Complete now coexists with Otty-managed shell rc files instead of reporting its own integration as broken. ChatGPT (Codex) sessions are tracked through xterm.js caret detection, the same path VS Code uses.",
  docSections,
  terminalSupport,
};
