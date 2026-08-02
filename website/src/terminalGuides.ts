import type { TerminalIntegration } from "./data.ts";

/**
 * Per-terminal guide content. Every page must carry facts that are true for
 * that terminal only — bundle id, process names, and its own quirks — so the
 * set reads as ten real guides rather than one template with the name swapped.
 * Identifiers mirror `crates/fig_util/src/terminal.rs`.
 */
export interface TerminalGuideSection {
  heading: string;
  /** Backticks render as inline code. */
  body: string[];
  code?: string;
}

export interface TerminalGuide {
  slug: string;
  name: string;
  /** Terminal name as used in prose, e.g. "iTerm2" vs "the iTerm2 terminal". */
  integration: TerminalIntegration;
  bundleId: string;
  processNames: string[];
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  intro: string;
  /** The distinguishing fact, shown as a callout under the intro. */
  callout: string;
  sections: TerminalGuideSection[];
}

const INPUT_METHOD_SETUP: TerminalGuideSection = {
  heading: "Set it up",
  body: [
    "Install Easy Complete and approve Accessibility, then quit the terminal completely — macOS loads input methods when a process starts, so a reopened window is not enough.",
    "`ec doctor` reports the shell hook and the input method separately, so it tells you which half is missing.",
  ],
  code: "exec $SHELL\nec doctor",
};

export const terminalGuides: TerminalGuide[] = [
  {
    slug: "otty",
    name: "Otty",
    integration: "input-method",
    bundleId: "io.appmakes.otty",
    processNames: ["Otty", "otty"],
    seoTitle: "Otty Autocomplete on macOS — Easy Complete",
    seoDescription:
      "Add IDE-style autocomplete to Otty on macOS. Easy Complete tracks the Otty caret through its bundled input method and coexists with Otty's own shell integration.",
    eyebrow: "Otty autocomplete",
    heading: "Autocomplete in Otty, without fighting its shell integration.",
    intro:
      "Otty support landed in Easy Complete v2.1.0: input-method cursor tracking, plus explicit handling for the shell-integration block Otty writes into your rc file.",
    callout:
      "Otty and Easy Complete both write to your shell rc file. Since v2.1.0 they coexist — Easy Complete no longer reports its own integration as broken when Otty owns the end of the file.",
    sections: [
      INPUT_METHOD_SETUP,
      {
        heading: "Why both shell integrations can stay installed",
        body: [
          "Otty appends its block to the absolute end of `~/.bashrc` and rewrites it whenever the app launches. Easy Complete used to require its own block to be last, so each app kept moving the other and the dashboard flip-flopped between working and \"needs setup\".",
          "Easy Complete now accepts its block sitting near the end rather than demanding the last line, and leaves Otty's trailer in place. Otty's block is inert unless `$OTTY_SHELL_INTEGRATION` is set, so it costs nothing in other terminals.",
        ],
      },
      {
        heading: "Launch Easy Complete before you open Otty",
        body: [
          "When the desktop app is not running, the shell integration stands down completely so Otty keeps its own completions. That decision is made once, when the shell starts.",
          "A terminal opened while Easy Complete was closed stays uninstrumented for that whole session — start the app, then open a new Otty tab.",
        ],
      },
      {
        heading: "If the popup drifts from the caret",
        body: [
          "Re-register the bundled input method and restart Otty so macOS reloads it.",
        ],
        code: "ec integrations install input-method",
      },
    ],
  },
  {
    slug: "kitty",
    name: "Kitty",
    integration: "input-method",
    bundleId: "net.kovidgoyal.kitty",
    processNames: ["kitty"],
    seoTitle: "Kitty Autocomplete on macOS — Easy Complete",
    seoDescription:
      "Add IDE-style autocomplete to Kitty on macOS with Easy Complete. Set up input-method cursor tracking and fix suggestions that lag behind the caret.",
    eyebrow: "Kitty autocomplete",
    heading: "Completions that keep up with Kitty.",
    intro:
      "Kitty renders its own glyphs on the GPU and does not expose the caret through the standard path, so Easy Complete reads the cursor position from a bundled macOS input method instead.",
    callout:
      "Kitty runs as a single process for all its windows. Closing every window is not the same as quitting — use ⌘Q so the input method is reloaded on next launch.",
    sections: [
      INPUT_METHOD_SETUP,
      {
        heading: "One process, many windows",
        body: [
          "Because Kitty keeps a single `kitty` process alive behind all its OS windows, re-registering the input method has no effect until that process actually exits.",
          "If suggestions are misaligned after an update, quit Kitty with ⌘Q — not just the window — and reopen it.",
        ],
        code: "ec integrations install input-method",
      },
      {
        heading: "Kitty tabs, splits, and shell state",
        body: [
          "Each Kitty window, tab, and split runs its own shell, so each one reports its own working directory and edit buffer. Suggestions follow whichever pane has focus.",
          "If one split has completions and another does not, the second shell started before Easy Complete was running — reload it.",
        ],
        code: "exec $SHELL",
      },
    ],
  },
  {
    slug: "wezterm",
    name: "WezTerm",
    integration: "input-method",
    bundleId: "com.github.wez.wezterm",
    processNames: ["wezterm", "wezterm-gui"],
    seoTitle: "WezTerm Autocomplete on macOS — Easy Complete",
    seoDescription:
      "Add IDE-style autocomplete to WezTerm on macOS with Easy Complete, including how the multiplexer and wezterm-gui process affect cursor tracking.",
    eyebrow: "WezTerm autocomplete",
    heading: "WezTerm completions, including the panes you multiplex.",
    intro:
      "WezTerm gets pixel-accurate cursor tracking from the bundled macOS input method, and its shell hooks report the edit buffer from every pane.",
    callout:
      "WezTerm ships two binaries: `wezterm` is the CLI front end, `wezterm-gui` is the window you actually type in. Easy Complete matches both, which is why `ec doctor` may name `wezterm-gui`.",
    sections: [
      INPUT_METHOD_SETUP,
      {
        heading: "Multiplexer domains change where completions come from",
        body: [
          "`wezterm connect` and SSH domains run your shell on the remote host. Completions are generated from the shell that is actually running, so a remote pane suggests remote paths and remote binaries.",
          "That also means a remote pane needs Easy Complete's shell integration installed on the remote side to suggest anything beyond the current token.",
        ],
      },
      {
        heading: "If suggestions stop after a config reload",
        body: [
          "Reloading `wezterm.lua` does not restart the GUI process, so the input method stays as it was. Re-register it and restart WezTerm if the popup drifts.",
        ],
        code: "ec integrations install input-method",
      },
    ],
  },
  {
    slug: "alacritty",
    name: "Alacritty",
    integration: "input-method",
    bundleId: "org.alacritty",
    processNames: ["alacritty"],
    seoTitle: "Alacritty Autocomplete on macOS — Easy Complete",
    seoDescription:
      "Add IDE-style autocomplete to Alacritty on macOS with Easy Complete, including how it behaves inside tmux where Alacritty has no native tabs.",
    eyebrow: "Alacritty autocomplete",
    heading: "Alacritty is minimal. Completions do not have to be.",
    intro:
      "Alacritty deliberately ships no tabs, splits, or scrollback UI. Easy Complete adds the completion layer on top through the bundled input method, without changing your prompt.",
    callout:
      "Alacritty has no tabs, so most users reach for tmux. Easy Complete follows the shell inside tmux — it treats tmux as a pseudoterminal to launch within, not as a terminal to skip.",
    sections: [
      INPUT_METHOD_SETUP,
      {
        heading: "Working inside tmux",
        body: [
          "Each Alacritty window is its own `alacritty` process, and inside it tmux owns the panes. Easy Complete instruments the shell in the pane, so completions follow the pane you are typing in.",
          "Attaching to a tmux session created before Easy Complete was running gives you shells that were never instrumented. Start a new window in that session rather than restarting tmux.",
        ],
        code: "tmux new-window",
      },
      {
        heading: "If the popup lands in the wrong place",
        body: [
          "Alacritty positions the caret itself, so cursor tracking depends entirely on the input method. Re-register it, then quit and reopen Alacritty.",
        ],
        code: "ec integrations install input-method",
      },
    ],
  },
  {
    slug: "zed",
    name: "Zed",
    integration: "input-method",
    bundleId: "dev.zed.Zed",
    processNames: ["zed"],
    seoTitle: "Zed Terminal Autocomplete on macOS — Easy Complete",
    seoDescription:
      "Add IDE-style autocomplete to the Zed integrated terminal on macOS with Easy Complete, alongside Zed's own editor completions.",
    eyebrow: "Zed terminal autocomplete",
    heading: "Completions in the Zed terminal panel.",
    intro:
      "Zed's integrated terminal is a real terminal emulator, so Easy Complete treats it like one: shell hooks for the edit buffer, and the bundled input method for the caret.",
    callout:
      "Easy Complete only touches the terminal panel. Zed's editor completions and edit predictions are a separate system and are not affected either way.",
    sections: [
      INPUT_METHOD_SETUP,
      {
        heading: "The panel is one terminal among many",
        body: [
          "Each terminal tab in the panel runs its own shell. A tab restored from a previous session — before Easy Complete was launched — will not have the integration loaded.",
          "Open a new terminal tab, or reload the shell in the existing one.",
        ],
        code: "exec $SHELL",
      },
      {
        heading: "If the popup follows the editor instead of the panel",
        body: [
          "Cursor tracking is per-window. Re-register the input method and restart Zed so it picks up the caret from the terminal panel again.",
        ],
        code: "ec integrations install input-method",
      },
    ],
  },
  {
    slug: "iterm2",
    name: "iTerm2",
    integration: "accessibility",
    bundleId: "com.googlecode.iterm2",
    processNames: ["iTerm2"],
    seoTitle: "iTerm2 Autocomplete on macOS — Easy Complete",
    seoDescription:
      "Add IDE-style autocomplete to iTerm2 on macOS with Easy Complete. iTerm2 uses the Accessibility API rather than the bundled input method.",
    eyebrow: "iTerm2 autocomplete",
    heading: "iTerm2 completions, without an input method.",
    intro:
      "iTerm2 exposes its caret through the macOS Accessibility API, so Easy Complete reads the cursor position directly. There is no input method to register for this one.",
    callout:
      "If a guide tells you to run `ec integrations install input-method`, that advice is for Ghostty, Otty, Kitty, WezTerm, Alacritty, Zed, and JetBrains. In iTerm2 the equivalent fix is re-approving Accessibility.",
    sections: [
      {
        heading: "Set it up",
        body: [
          "Install Easy Complete, approve it under System Settings → Privacy & Security → Accessibility, then reload your shell. iTerm2 needs no further integration.",
          "If the permission prompt never appeared, trigger it again from the CLI.",
        ],
        code: "ec debug prompt-accessibility\nexec $SHELL",
      },
      {
        heading: "It coexists with iTerm2 Shell Integration",
        body: [
          "iTerm2's own Shell Integration writes its own prompt markers and status bar hooks. Easy Complete's hooks are separate and additive — you can keep both installed.",
          "If you have customised `PROMPT_COMMAND` or `precmd` heavily, run `ec doctor` to confirm both hooks still load.",
        ],
        code: "ec doctor",
      },
      {
        heading: "tmux integration mode",
        body: [
          "In `tmux -CC` mode iTerm2 draws native tabs for tmux windows. The shell still runs under tmux, so completions follow the shell as usual — but the caret is reported by whichever native tab has focus.",
          "If suggestions appear in the wrong tab, detach and reattach the tmux session.",
        ],
      },
    ],
  },
];

export const terminalGuideBySlug = new Map(
  terminalGuides.map((guide) => [guide.slug, guide])
);
