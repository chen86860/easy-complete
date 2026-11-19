# Accessibility

Easy Complete should be usable by anyone who works in a terminal, including people who use
the keyboard only, magnification, larger text, or a screen reader. This document says what
we aim for, what we have and have not checked, and how to tell us when something gets in
your way.

## Priorities

These are the parts of the app we look after first, in this order:

1. **The completion popup** — reading suggestions and choosing one with the keyboard.
2. **First-run setup** — granting permissions and turning on shell integration.
3. **Settings** — the window opened from the menu bar icon.
4. **The `ec` command-line tool** — plain text output that works in any terminal.

## Supported environments

- macOS 13 (Ventura) or later on Apple Silicon, with the terminals listed in the
  [README](./README.md#supported-terminals).
- Keyboard only. The popup never takes focus from your terminal; every action has a key
  (see [Usage](./README.md#-usage)), and keys can be remapped with
  `ec settings autocomplete.keybindings.<key> <action>`.
- The settings window is built so that VoiceOver reads each control together with its
  label, for example "Launch at Login, switch, on".

**What has not been verified:** we have not run a structured test of the app with
VoiceOver, Switch Control, Voice Control or Full Keyboard Access, and we have not
measured color contrast for the bundled themes. No WCAG conformance is claimed.

## Known limitations

| Barrier | Effect | Workaround |
| --- | --- | --- |
| VoiceOver does not announce suggestions | A screen reader user does not hear that the popup opened or which suggestion is highlighted. | None inside the popup yet. `ec settings autocomplete.onlyShowOnTab true` keeps the popup closed until you press `⇥`, so suggestions appear only when you ask for them. |
| Small default text | Suggestions use 12.8 px text by default. | Raise **Font Size** in Settings → Appearance (10–24 px), or run `ec settings autocomplete.fontSize 18`. |
| Contrast varies between themes | Some themes may have low contrast between text, descriptions and the highlighted row. | Pick another one under Settings → Appearance → **Suggestion Popup Theme**. Please tell us which theme is hard to read. |
| The loading indicator ignores Reduce Motion | A small spinner animates while suggestions load, even with **Reduce motion** turned on in macOS. | None yet. |

The **Accessibility** permission that setup asks for is macOS's name for the access Easy
Complete needs to find your terminal cursor. Granting it does not change how the app works
with assistive technologies.

## Reporting a barrier

If something in Easy Complete is hard or impossible for you to use, please
[open an issue](https://github.com/chen86860/easy-complete/issues/new/choose) and start the
title with **"Accessibility:"**. If you would rather not file a public issue, ask in
[GitHub Discussions](https://github.com/chen86860/easy-complete/discussions).

It helps to include, if you can:

- What you were trying to do, and what happened instead.
- Your macOS version, terminal and shell.
- Any assistive technology or system setting you use (VoiceOver, Zoom, larger text,
  Increase contrast, Reduce motion, and so on).
- The output of `ec doctor`.

A description in words is enough. You do not need to send screenshots or recordings, and
you do not need to tell us about any disability.

## What happens next

- You should get a first reply within 7 days.
- The maintainer confirms the problem, adds the
  [`accessibility`](https://github.com/chen86860/easy-complete/labels/accessibility) label, and replies with a workaround if
  there is one.
- Barriers that stop someone from completing one of the [priorities](#priorities) above are
  fixed before cosmetic issues.
- When a fix ships, the issue links to the release, and we ask you to confirm that it works
  for you.

## Contributing

When you change the popup or the settings window:

- Every new action needs a keyboard path, and a new control in the settings window needs an
  accessible name. Reuse `useRowLabel()` from
  [`packages/dashboard-app/src/components/row-label.ts`](./packages/dashboard-app/src/components/row-label.ts).
- Check the change with VoiceOver (`⌘F5`) and with the popup font size set to 24 px, and say
  in the pull request what you checked.
- New animations should respect `prefers-reduced-motion`.
- Do not rely on color alone to show state, such as which suggestion is highlighted.

Coding agents working in this repository should follow the same rules; [AGENTS.md](./AGENTS.md)
covers the rest of the codebase.

## Maintaining this document

The project maintainer keeps this file up to date. It is reviewed when the popup or settings
window changes, and whenever a reported barrier is fixed or added to the table above.
Suggestions for this document are welcome as issues or pull requests.
