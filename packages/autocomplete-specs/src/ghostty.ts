import sshSpec from "./ssh";

// Covers Ghostty 1.4.0. Apart from the `+ssh-cache` flags reworked in 1.4,
// releases since 1.0 have only added actions and config keys, and renamed keys
// keep working, so the spec is not versioned.
//
// Every config key is also a `--key=value` flag. Ghostty rejects `--key value`,
// so all flags require the `=`. Keys and actions that only work on Linux (GTK,
// X11, FreeType, systemd) are hidden: Easy Complete runs on macOS, where they
// do nothing. Renamed keys that Ghostty still accepts are left out, and so is
// `link`, which rejects every value in 1.4.0.
//
// Themes, fonts and keybind actions come from the installed ghostty, so user
// themes and installed fonts show up. Each generator names an informational
// action, because a bare `ghostty` opens a terminal window.

// Without a cacheKey the key includes the working directory, and these
// catalogs are the same in every directory
const catalogCache = (cacheKey: string): Fig.Cache => ({
  strategy: "stale-while-revalidate",
  ttl: 1000 * 60 * 60 * 24,
  cacheKey,
});

// `+list-themes --plain` prints "Name (resources)" for bundled themes and
// "Name (user)" for the user's own. A custom generator, so the light: and
// dark: hints still show when ghostty is not on PATH.
const themesGenerator: Fig.Generator = {
  cache: catalogCache("ghostty +list-themes"),
  // A theme can also be light:NAME,dark:NAME
  getQueryTerm: (token) =>
    token.slice(Math.max(token.lastIndexOf(":"), token.lastIndexOf(",")) + 1),
  custom: async (_tokens, executeCommand) => {
    // executeCommand logs why a run failed
    const { stdout } = await executeCommand({
      command: "ghostty",
      args: ["+list-themes", "--plain"],
    }).catch(() => ({ stdout: "" }));
    return [
      {
        name: "light:",
        description: "Theme for light mode, then ,dark: and a theme",
      },
      { name: "dark:", description: "Theme for dark mode" },
      ...stdout.split("\n").flatMap((line) => {
        const match = line.match(/^(.+) \((resources|user)\)$/);
        if (!match) {
          return [];
        }
        return [
          {
            name: match[1],
            description: match[2] === "user" ? "User theme" : "Bundled theme",
          },
        ];
      }),
    ];
  },
};

// `+list-fonts` prints each monospaced family flush left, followed by its
// faces indented
const parseFontFamilies = (out: string): Fig.Suggestion[] =>
  out
    .split("\n")
    .filter((line) => line.trim() !== "" && !/^\s/.test(line))
    .map((name) => ({
      name: name.trimEnd(),
      description: "Monospaced font family",
    }));

const fontsGenerator: Fig.Generator = {
  script: ["ghostty", "+list-fonts"],
  cache: catalogCache("ghostty +list-fonts"),
  postProcess: parseFontFamilies,
};

// `+list-actions --docs` prints each action as "name:" flush left, followed
// by its indented documentation
const parseKeybindActions = (out: string): Fig.Suggestion[] =>
  out.split("\n").flatMap((line, index, lines) => {
    const name = line.match(/^([a-z_]+):$/)?.[1];
    if (!name) {
      return [];
    }
    const paragraph: string[] = [];
    for (const docLine of lines.slice(index + 1)) {
      if (docLine.trim() === "") {
        break;
      }
      paragraph.push(docLine.trim());
    }
    const text = paragraph.join(" ").replaceAll("`", "");
    return [{ name, description: text.match(/^.*?(?=\.(\s|$))/)?.[0] ?? text }];
  });

const keybindActionsGenerator: Fig.Generator = {
  script: ["ghostty", "+list-actions", "--docs"],
  cache: catalogCache("ghostty +list-actions"),
  postProcess: parseKeybindActions,
};

// A bare boolean flag means true
const boolArg: Fig.Arg = {
  name: "bool",
  isOptional: true,
  suggestions: [{ name: "true" }, { name: "false", description: "Default" }],
};

// For these the bare flag changes nothing; only =false does
const onByDefaultBoolArg: Fig.Arg = {
  ...boolArg,
  suggestions: [{ name: "true", description: "Default" }, { name: "false" }],
};

// Packed flag sets take a comma-separated list of names, each optionally
// prefixed with no-, or true or false to set all of them
const flagListArg = (
  name: string,
  flags: [flag: string, description: string, onByDefault?: boolean][],
): Fig.Arg => ({
  name,
  description: "Comma-separated; prefix no- to turn one off",
  generators: {
    getQueryTerm: ",",
    custom: async () => [
      ...flags.flatMap(([flag, description, onByDefault]) => [
        {
          name: flag,
          description: onByDefault ? `${description} (default)` : description,
        },
        {
          name: `no-${flag}`,
          description: onByDefault
            ? `Turn off ${flag}`
            : `Turn off ${flag} (default)`,
        },
      ]),
      { name: "true", description: "Turn on all" },
      { name: "false", description: "Turn off all" },
    ],
  },
});

const colorArg: Fig.Arg = {
  name: "color",
  description: "#RRGGBB, RRGGBB or an X11 color name",
};

const terminalColorArg: Fig.Arg = {
  ...colorArg,
  suggestions: [
    { name: "cell-foreground", description: "Foreground color of the cell" },
    { name: "cell-background", description: "Background color of the cell" },
  ],
};

const durationArg: Fig.Arg = {
  name: "duration",
  description: "Numbers with units (ms, s, m, h, d, w, y), such as 1h30m",
};

const adjustmentArg: Fig.Arg = {
  name: "adjustment",
  description: "Change in pixels (1, -1) or percent (20%, -15%)",
};

const limitArg = (unit: string): Fig.Arg => ({
  name: unit,
  suggestions: [{ name: "unlimited", description: "No limit" }],
});

const fontFamilyArg: Fig.Arg = {
  name: "family",
  generators: fontsGenerator,
};

const fontStyleArg: Fig.Arg = {
  name: "style",
  description: "Style name the font advertises, such as Heavy",
  suggestions: [
    { name: "default", description: "Regular style search (default)" },
    { name: "false", description: "Disable this style" },
  ],
};

const fontVariationArg: Fig.Arg = {
  name: "axis=value",
  description: "Four-letter variation axis, then = and a value",
  suggestions: [
    { name: "wght=", description: "Weight" },
    { name: "wdth=", description: "Width" },
    { name: "slnt=", description: "Slant" },
    { name: "ital=", description: "Italic" },
    { name: "opsz=", description: "Optical size" },
  ],
};

const commandArg: Fig.Arg = {
  name: "command",
  description:
    "Command line, run through the shell unless prefixed with direct:",
  suggestions: [
    { name: "direct:", description: "Run the command without a shell" },
    { name: "shell:", description: "Run the command with /bin/sh -c" },
  ],
};

const configKeys: Fig.Option[] = [
  {
    name: "--language",
    description: "GUI language, overriding the system language (GTK only)",
    hidden: true,
    args: { name: "locale" },
  },
  {
    name: "--font-family",
    description: "Font family; repeat to add fallback fonts",
    isRepeatable: true,
    args: fontFamilyArg,
  },
  {
    name: "--font-family-bold",
    description: "Font family for bold text; repeat to add fallbacks",
    isRepeatable: true,
    args: fontFamilyArg,
  },
  {
    name: "--font-family-italic",
    description: "Font family for italic text; repeat to add fallbacks",
    isRepeatable: true,
    args: fontFamilyArg,
  },
  {
    name: "--font-family-bold-italic",
    description: "Font family for bold italic text; repeat to add fallbacks",
    isRepeatable: true,
    args: fontFamilyArg,
  },
  {
    name: "--font-style",
    description: "Named font style for regular text, or false to disable it",
    args: fontStyleArg,
  },
  {
    name: "--font-style-bold",
    description: "Named font style for bold text, or false to disable it",
    args: fontStyleArg,
  },
  {
    name: "--font-style-italic",
    description: "Named font style for italic text, or false to disable it",
    args: fontStyleArg,
  },
  {
    name: "--font-style-bold-italic",
    description:
      "Named font style for bold italic text, or false to disable it",
    args: fontStyleArg,
  },
  {
    name: "--font-synthetic-style",
    description: "Styles to synthesize when the font lacks them",
    args: flagListArg("styles", [
      ["bold", "Synthesize bold", true],
      ["italic", "Synthesize italic", true],
      ["bold-italic", "Synthesize bold italic", true],
    ]),
  },
  {
    name: "--font-feature",
    description: "Font features to enable or disable; repeatable",
    isRepeatable: true,
    args: {
      name: "features",
      description: "Comma-separated; prefix - to disable a feature",
      generators: {
        getQueryTerm: ",",
        // Common OpenType features; which ones work depends on the font
        custom: async () =>
          [
            [
              "calt",
              "Contextual alternates, used for most programming ligatures",
            ],
            ["liga", "Standard ligatures"],
            ["dlig", "Discretionary ligatures"],
            ["zero", "Slashed zero"],
            ...Array.from({ length: 20 }, (_, index) => [
              `ss${String(index + 1).padStart(2, "0")}`,
              `Stylistic set ${index + 1}`,
            ]),
          ].flatMap(([tag, description]) => [
            { name: tag, description },
            { name: `-${tag}`, description: `Disable ${tag}` },
          ]),
      },
    },
  },
  {
    name: "--font-size",
    description: "Font size in points",
    args: { name: "points" },
  },
  {
    name: "--font-variation",
    description: "Variable font axis value; repeatable",
    isRepeatable: true,
    args: fontVariationArg,
  },
  {
    name: "--font-variation-bold",
    description: "Variable font axis value for bold text; repeatable",
    isRepeatable: true,
    args: fontVariationArg,
  },
  {
    name: "--font-variation-italic",
    description: "Variable font axis value for italic text; repeatable",
    isRepeatable: true,
    args: fontVariationArg,
  },
  {
    name: "--font-variation-bold-italic",
    description: "Variable font axis value for bold italic text; repeatable",
    isRepeatable: true,
    args: fontVariationArg,
  },
  {
    name: "--font-codepoint-map",
    description: "Render codepoints with a specific font family; repeatable",
    isRepeatable: true,
    args: {
      name: "codepoints=family",
      description:
        "U+ABCD or U+ABCD-U+DEFG, comma-separated, then = and a font family",
      generators: {
        ...fontsGenerator,
        trigger: "=",
        getQueryTerm: "=",
        postProcess: (out, tokens) =>
          tokens[tokens.length - 1]
            .replace(/^--font-codepoint-map=/, "")
            .includes("=")
            ? parseFontFamilies(out)
            : [],
      },
    },
  },
  {
    name: "--clipboard-codepoint-map",
    description: "Replace codepoints when copying to the clipboard; repeatable",
    isRepeatable: true,
    args: {
      name: "codepoints=replacement",
      description:
        "U+1234 or U+1234-U+5678, then = and a codepoint (U+ABCD) or text",
    },
  },
  {
    name: "--font-thicken",
    description: "Draw fonts with a thicker stroke",
    args: boolArg,
  },
  {
    name: "--font-thicken-strength",
    description: "Strength of font-thicken",
    args: { name: "strength", description: "0 to 255" },
  },
  {
    name: "--font-shaping-break",
    description: "Where to break font shaping into separate runs",
    args: flagListArg("locations", [
      ["cursor", "Break runs under the cursor", true],
    ]),
  },
  {
    name: "--alpha-blending",
    description: "Color space used for alpha blending",
    args: {
      name: "space",
      suggestions: [
        {
          name: "native",
          description: "Native color space of the OS (default)",
        },
        { name: "linear", description: "Linear space" },
        {
          name: "linear-corrected",
          description:
            "Linear space, corrected so text looks like native without darkening artifacts",
        },
      ],
    },
  },
  {
    name: "--adjust-cell-width",
    description: "Adjust the cell width",
    args: adjustmentArg,
  },
  {
    name: "--adjust-cell-height",
    description: "Adjust the cell height",
    args: adjustmentArg,
  },
  {
    name: "--adjust-font-baseline",
    description:
      "Adjust the distance from the bottom of the cell to the text baseline",
    args: adjustmentArg,
  },
  {
    name: "--adjust-underline-position",
    description:
      "Adjust the distance from the top of the cell to the underline",
    args: adjustmentArg,
  },
  {
    name: "--adjust-underline-thickness",
    description: "Adjust the underline thickness",
    args: adjustmentArg,
  },
  {
    name: "--adjust-strikethrough-position",
    description:
      "Adjust the distance from the top of the cell to the strikethrough",
    args: adjustmentArg,
  },
  {
    name: "--adjust-strikethrough-thickness",
    description: "Adjust the strikethrough thickness",
    args: adjustmentArg,
  },
  {
    name: "--adjust-overline-position",
    description: "Adjust the distance from the top of the cell to the overline",
    args: adjustmentArg,
  },
  {
    name: "--adjust-overline-thickness",
    description: "Adjust the overline thickness",
    args: adjustmentArg,
  },
  {
    name: "--adjust-cursor-thickness",
    description: "Adjust the thickness of the bar and outlined cursors",
    args: adjustmentArg,
  },
  {
    name: "--adjust-cursor-height",
    description: "Adjust the cursor height",
    args: adjustmentArg,
  },
  {
    name: "--adjust-box-thickness",
    description: "Adjust the thickness of box drawing characters",
    args: adjustmentArg,
  },
  {
    name: "--adjust-icon-height",
    description: "Adjust the maximum height of Nerd Font icons",
    args: adjustmentArg,
  },
  {
    name: "--grapheme-width-method",
    description: "How to calculate the cell width of a grapheme cluster",
    args: {
      name: "method",
      suggestions: [
        {
          name: "legacy",
          description:
            "Legacy method such as wcswidth, for compatibility with older programs",
        },
        { name: "unicode", description: "Unicode standard (default)" },
      ],
    },
  },
  {
    name: "--freetype-load-flags",
    description: "FreeType load flags (FreeType builds only)",
    hidden: true,
    args: flagListArg("flags", [
      ["hinting", "Enable hinting", true],
      ["force-autohint", "Always use the FreeType auto-hinter"],
      ["monochrome", "Render in 1-bit monochrome"],
      ["autohint", "Enable the FreeType auto-hinter", true],
      ["light", "Use a light hinting style", true],
    ]),
  },
  {
    name: "--theme",
    description: "Color theme, or separate themes for light and dark mode",
    args: {
      name: "theme",
      description: "Name, absolute path, or light:NAME,dark:NAME",
      generators: themesGenerator,
    },
  },
  {
    name: "--background",
    description: "Background color",
    args: colorArg,
  },
  {
    name: "--foreground",
    description: "Foreground color",
    args: colorArg,
  },
  {
    name: "--background-image",
    description: "Background image file (PNG or JPEG)",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--background-image-opacity",
    description: "Background image opacity, relative to background-opacity",
    args: { name: "opacity" },
  },
  {
    name: "--background-image-position",
    description: "Background image position",
    args: {
      name: "position",
      suggestions: [
        { name: "top-left" },
        { name: "top-center" },
        { name: "top-right" },
        { name: "center-left" },
        { name: "center", description: "Default" },
        { name: "center-center", description: "Same as center" },
        { name: "center-right" },
        { name: "bottom-left" },
        { name: "bottom-center" },
        { name: "bottom-right" },
      ],
    },
  },
  {
    name: "--background-image-fit",
    description: "How to scale the background image",
    args: {
      name: "fit",
      suggestions: [
        {
          name: "contain",
          description:
            "Scale to fit inside the terminal, keeping the aspect ratio (default)",
        },
        {
          name: "cover",
          description: "Scale to cover the terminal, keeping the aspect ratio",
        },
        { name: "stretch", description: "Stretch to the terminal size" },
        { name: "none", description: "Don't scale" },
      ],
    },
  },
  {
    name: "--background-image-repeat",
    description: "Repeat the background image to fill the terminal",
    args: boolArg,
  },
  {
    name: "--selection-foreground",
    description: "Foreground color of selected text",
    args: terminalColorArg,
  },
  {
    name: "--selection-background",
    description: "Background color of selected text",
    args: terminalColorArg,
  },
  {
    name: "--selection-clear-on-typing",
    description: "Clear the selection when typing",
    args: onByDefaultBoolArg,
  },
  {
    name: "--selection-clear-on-copy",
    description: "Clear the selection after copying",
    args: boolArg,
  },
  {
    name: "--selection-word-chars",
    description: "Characters that end a word when selecting",
    args: { name: "characters" },
  },
  {
    name: "--minimum-contrast",
    description: "Minimum contrast ratio between text and background",
    args: { name: "ratio", description: "1 (no adjustment) to 21" },
  },
  {
    name: "--palette",
    description: "Set one of the 256 palette colors; repeatable",
    isRepeatable: true,
    args: {
      name: "index=color",
      description: "Index 0 to 255, then = and a color",
    },
  },
  {
    name: "--palette-generate",
    description: "Generate palette colors 16-255 from the base 16 colors",
    args: boolArg,
  },
  {
    name: "--palette-harmonious",
    description: "Reverse the order of the colors palette-generate creates",
    args: boolArg,
  },
  {
    name: "--cursor-color",
    description: "Cursor color",
    args: terminalColorArg,
  },
  {
    name: "--cursor-opacity",
    description: "Cursor opacity",
    args: { name: "opacity", description: "0 to 1" },
  },
  {
    name: "--cursor-style",
    description: "Default cursor style",
    args: {
      name: "style",
      suggestions: [
        { name: "block", description: "Default" },
        { name: "bar" },
        { name: "underline" },
        { name: "block_hollow" },
      ],
    },
  },
  {
    name: "--cursor-style-blink",
    description: "Whether the cursor blinks by default",
    args: {
      name: "bool",
      description: "Unset by default: blink, and let programs turn it off",
      isOptional: true,
      suggestions: ["true", "false"],
    },
  },
  {
    name: "--cursor-text",
    description: "Color of the text under the cursor",
    args: terminalColorArg,
  },
  {
    name: "--cursor-click-to-move",
    description: "Move the cursor at a prompt by clicking",
    args: onByDefaultBoolArg,
  },
  {
    name: "--mouse-hide-while-typing",
    description: "Hide the mouse pointer while typing",
    args: boolArg,
  },
  {
    name: "--scroll-to-bottom",
    description: "When to scroll to the bottom",
    args: flagListArg("events", [
      ["keystroke", "Scroll when a key sends input", true],
      ["output", "Scroll when new output arrives"],
    ]),
  },
  {
    name: "--mouse-shift-capture",
    description: "Whether programs see shift with a mouse click",
    args: {
      name: "mode",
      suggestions: [
        {
          name: "false",
          description:
            "Shift extends the selection, unless the program asks for it (default)",
        },
        {
          name: "true",
          description:
            "Shift is sent to the program, unless the program declines it",
        },
        { name: "always", description: "Shift is always sent to the program" },
        { name: "never", description: "Shift always extends the selection" },
      ],
    },
  },
  {
    name: "--mouse-reporting",
    description: "Report mouse events to programs that request them",
    args: onByDefaultBoolArg,
  },
  {
    name: "--mouse-scroll-multiplier",
    description: "Multiplier for mouse wheel scroll distance",
    args: {
      name: "multiplier",
      description: "Number, or precision:N,discrete:N per device type",
    },
  },
  {
    name: "--background-opacity",
    description: "Background opacity",
    args: { name: "opacity", description: "0 to 1" },
  },
  {
    name: "--background-opacity-cells",
    description:
      "Apply background opacity to cells with their own background color",
    args: boolArg,
  },
  {
    name: "--background-blur",
    description: "Blur the background when it is not opaque",
    args: {
      name: "blur",
      description: "true, false, a radius from 0 to 255, or a glass effect",
      suggestions: [
        { name: "true", description: "Blur" },
        { name: "false", description: "Don't blur (default)" },
        {
          name: "macos-glass-regular",
          description: "Glass effect (macOS 26 and later)",
        },
        {
          name: "macos-glass-clear",
          description: "Highly transparent glass effect (macOS 26 and later)",
        },
      ],
    },
  },
  {
    name: "--unfocused-split-opacity",
    description: "Opacity of unfocused splits",
    args: { name: "opacity", description: "0.15 to 1" },
  },
  {
    name: "--unfocused-split-fill",
    description: "Color used to dim unfocused splits",
    args: colorArg,
  },
  {
    name: "--split-divider-color",
    description: "Color of split dividers",
    args: colorArg,
  },
  {
    name: "--split-preserve-zoom",
    description: "When to keep a zoomed split zoomed",
    args: flagListArg("events", [
      ["navigation", "Move the zoom to the split you navigate to"],
    ]),
  },
  {
    name: "--search-foreground",
    description: "Foreground color of search matches",
    args: terminalColorArg,
  },
  {
    name: "--search-background",
    description: "Background color of search matches",
    args: terminalColorArg,
  },
  {
    name: "--search-selected-foreground",
    description: "Foreground color of the selected search match",
    args: terminalColorArg,
  },
  {
    name: "--search-selected-background",
    description: "Background color of the selected search match",
    args: terminalColorArg,
  },
  {
    name: "--command",
    description: "Command to run in new terminals, usually a shell",
    args: commandArg,
  },
  {
    name: "--initial-command",
    description: "Command to run in the first terminal only",
    args: commandArg,
  },
  {
    name: "--notify-on-command-finish",
    description: "When to notify that a command finished",
    args: {
      name: "when",
      suggestions: [
        { name: "never", description: "Never notify (default)" },
        {
          name: "unfocused",
          description: "Notify when the terminal is not focused",
        },
        { name: "always", description: "Always notify" },
      ],
    },
  },
  {
    name: "--notify-on-command-finish-action",
    description: "How to notify that a command finished",
    args: flagListArg("actions", [
      ["bell", "Ring the bell", true],
      ["notify", "Show a desktop notification"],
    ]),
  },
  {
    name: "--notify-on-command-finish-after",
    description: "Minimum command runtime before notifying",
    args: durationArg,
  },
  {
    name: "--env",
    description: "Extra environment variable for commands; repeatable",
    isRepeatable: true,
    args: {
      name: "name=value",
      description: "Empty value removes the variable",
    },
  },
  {
    name: "--input",
    description: "Data to send to the command on startup; repeatable",
    isRepeatable: true,
    args: {
      name: "input",
      suggestions: [
        {
          name: "raw:",
          description: "Text, with Zig string escapes (default)",
        },
        { name: "path:", description: "Contents of a file" },
      ],
    },
  },
  {
    name: "--wait-after-command",
    description: "Keep the terminal open after the command exits",
    args: boolArg,
  },
  {
    name: "--abnormal-command-exit-runtime",
    description: "Exits faster than this count as abnormal",
    args: { name: "milliseconds" },
  },
  {
    name: "--scrollback-limit-bytes",
    description: "Maximum scrollback size in bytes",
    args: limitArg("bytes"),
  },
  {
    name: "--scrollback-limit-lines",
    description: "Maximum number of scrollback lines",
    args: limitArg("lines"),
  },
  {
    name: "--scrollback-compression",
    description: "Compress scrollback while the terminal is idle",
    args: onByDefaultBoolArg,
  },
  {
    name: "--scrollbar",
    description: "When to show the scrollbar",
    args: {
      name: "when",
      suggestions: [
        { name: "system", description: "Follow the system setting (default)" },
        { name: "never", description: "Never show a scrollbar" },
      ],
    },
  },
  {
    name: "--link-url",
    description: "Make URLs clickable",
    args: onByDefaultBoolArg,
  },
  {
    name: "--link-osc8",
    description: "Make OSC 8 hyperlinks clickable",
    args: onByDefaultBoolArg,
  },
  {
    name: "--link-previews",
    description: "When to show link previews",
    args: {
      name: "when",
      suggestions: [
        { name: "true", description: "For all links (default)" },
        { name: "false", description: "Never" },
        { name: "osc8", description: "Only for OSC 8 hyperlinks" },
      ],
    },
  },
  {
    name: "--maximize",
    description: "Start new windows maximized",
    args: boolArg,
  },
  {
    name: "--fullscreen",
    description: "Start new windows in fullscreen",
    args: {
      name: "mode",
      suggestions: [
        { name: "false", description: "Don't start in fullscreen (default)" },
        { name: "true", description: "Native fullscreen" },
        {
          name: "non-native",
          description: "Non-native fullscreen, hiding the menu bar",
        },
        {
          name: "non-native-visible-menu",
          description: "Non-native fullscreen, keeping the menu bar",
        },
        {
          name: "non-native-padded-notch",
          description:
            "Non-native fullscreen, hiding the menu bar and padding for the notch",
        },
      ],
    },
  },
  {
    name: "--title",
    description: "Fixed window title, ignoring titles set by programs",
    args: { name: "title" },
  },
  {
    name: "--class",
    description: "Application class and ID (GTK only)",
    hidden: true,
    args: { name: "class" },
  },
  {
    name: "--x11-instance-name",
    description: "WM_CLASS instance name (X11 only)",
    hidden: true,
    args: { name: "name" },
  },
  {
    name: "--working-directory",
    description: "Directory to start commands in",
    args: {
      name: "directory",
      suggestions: [
        { name: "home", description: "Your home directory" },
        {
          name: "inherit",
          description: "Working directory of the launching process",
        },
      ],
      generators: { template: "folders" },
    },
  },
  {
    name: "--keybind",
    description: "Key binding as trigger=action; repeatable",
    isRepeatable: true,
    // A keybind is [prefix:]trigger=action[:parameter]: the prefixes come
    // before the first "=", the actions after it
    args: {
      name: "trigger=action",
      description: "Such as cmd+t=new_tab or ctrl+a>n=new_window",
      suggestions: [
        {
          name: "clear",
          description: "Remove all keybinds, including the defaults",
        },
        {
          name: "all:",
          description: "Apply to all terminals, not only the focused one",
        },
        {
          name: "global:",
          description: "Work system-wide, even when Ghostty is not focused",
        },
        {
          name: "unconsumed:",
          description: "Also send the key to the program",
        },
        {
          name: "performable:",
          description: "Only take the key when the action can run",
        },
      ],
      generators: {
        ...keybindActionsGenerator,
        trigger: "=",
        getQueryTerm: "=",
        postProcess: (out, tokens) =>
          tokens[tokens.length - 1].replace(/^--keybind=/, "").includes("=")
            ? parseKeybindActions(out)
            : [],
      },
    },
  },
  {
    name: "--key-remap",
    description: "Remap a modifier key within Ghostty; repeatable",
    isRepeatable: true,
    args: {
      name: "from=to",
      description: "A modifier key, then = and the key it acts as",
      generators: {
        getQueryTerm: "=",
        // Ghostty also accepts control, option, super and command; one name
        // per key is enough
        custom: async () =>
          [
            ["ctrl", "Control"],
            ["alt", "Option"],
            ["shift", "Shift"],
            ["cmd", "Command"],
          ].flatMap(([name, key]) => [
            { name, description: `${key} key, either side` },
            { name: `left_${name}`, description: `Left ${key} key` },
            { name: `right_${name}`, description: `Right ${key} key` },
          ]),
      },
    },
  },
  {
    name: "--window-padding-x",
    description: "Horizontal window padding in points",
    args: { name: "points", description: "One value, or left,right" },
  },
  {
    name: "--window-padding-y",
    description: "Vertical window padding in points",
    args: { name: "points", description: "One value, or top,bottom" },
  },
  {
    name: "--window-padding-balance",
    description: "Balance the padding around the terminal grid",
    args: {
      name: "mode",
      suggestions: [
        { name: "false", description: "No balancing (default)" },
        { name: "true", description: "Balance, with a cap on the top padding" },
        { name: "equal", description: "Balance equally on all sides" },
      ],
    },
  },
  {
    name: "--window-padding-color",
    description: "Color of the window padding",
    args: {
      name: "color",
      suggestions: [
        { name: "background", description: "The background color (default)" },
        { name: "extend", description: "Extend the color of the nearest cell" },
        {
          name: "extend-always",
          description: "Always extend the color of the nearest cell",
        },
      ],
    },
  },
  {
    name: "--window-vsync",
    description: "Synchronize rendering with the display refresh rate",
    args: onByDefaultBoolArg,
  },
  {
    name: "--window-inherit-working-directory",
    description:
      "New windows start in the working directory of the focused window",
    args: onByDefaultBoolArg,
  },
  {
    name: "--tab-inherit-working-directory",
    description: "New tabs start in the working directory of the focused tab",
    args: onByDefaultBoolArg,
  },
  {
    name: "--split-inherit-working-directory",
    description:
      "New splits start in the working directory of the focused split",
    args: onByDefaultBoolArg,
  },
  {
    name: "--window-inherit-font-size",
    description:
      "New windows and tabs keep the font size of the focused window",
    args: onByDefaultBoolArg,
  },
  {
    name: "--window-decoration",
    description: "Window decorations",
    args: {
      name: "decoration",
      suggestions: [
        {
          name: "auto",
          description: "Choose for the OS and desktop (default)",
        },
        { name: "none", description: "No titlebar, borders or tabs" },
        { name: "client", description: "Prefer client-side decorations" },
        {
          name: "server",
          description: "Prefer server-side decorations (Linux only)",
        },
      ],
    },
  },
  {
    name: "--window-title-font-family",
    description:
      "Font family for window and tab titles; any installed family works",
    args: fontFamilyArg,
  },
  {
    name: "--window-subtitle",
    description: "Window subtitle (GTK only)",
    hidden: true,
    args: {
      name: "subtitle",
      suggestions: [
        { name: "false", description: "No subtitle (default)" },
        { name: "working-directory", description: "The working directory" },
      ],
    },
  },
  {
    name: "--window-theme",
    description: "Theme of the window chrome",
    args: {
      name: "theme",
      suggestions: [
        {
          name: "auto",
          description: "Based on the terminal background color (default)",
        },
        { name: "system", description: "The system theme" },
        { name: "light", description: "Light" },
        { name: "dark", description: "Dark" },
        { name: "ghostty", description: "Ghostty's colors (Linux only)" },
      ],
    },
  },
  {
    name: "--window-colorspace",
    description: "Color space for interpreting terminal colors",
    args: {
      name: "colorspace",
      suggestions: [
        { name: "srgb", description: "sRGB (default)" },
        { name: "display-p3", description: "Display P3" },
      ],
    },
  },
  {
    name: "--window-height",
    description: "Initial window height in cells",
    args: { name: "cells" },
  },
  {
    name: "--window-width",
    description: "Initial window width in cells",
    args: { name: "cells" },
  },
  {
    name: "--window-position-x",
    description: "Initial window position from the left, in pixels",
    args: { name: "pixels" },
  },
  {
    name: "--window-position-y",
    description: "Initial window position from the top, in pixels",
    args: { name: "pixels" },
  },
  {
    name: "--window-save-state",
    description: "When to save and restore windows",
    args: {
      name: "when",
      suggestions: [
        { name: "default", description: "Follow the system setting (default)" },
        { name: "never", description: "Never save" },
        { name: "always", description: "Always save on quit" },
      ],
    },
  },
  {
    name: "--window-step-resize",
    description: "Resize windows in steps of the cell size",
    args: boolArg,
  },
  {
    name: "--window-new-tab-position",
    description: "Where to insert new tabs",
    args: {
      name: "position",
      suggestions: [
        { name: "current", description: "After the focused tab (default)" },
        { name: "end", description: "At the end" },
      ],
    },
  },
  {
    name: "--window-show-tab-bar",
    description: "When to show the tab bar (GTK only)",
    hidden: true,
    args: {
      name: "when",
      suggestions: [
        { name: "always", description: "Always" },
        { name: "auto", description: "With two or more tabs (default)" },
        { name: "never", description: "Never" },
      ],
    },
  },
  {
    name: "--window-titlebar-background",
    description: "Titlebar background color (GTK only)",
    hidden: true,
    args: colorArg,
  },
  {
    name: "--window-titlebar-foreground",
    description: "Titlebar foreground color (GTK only)",
    hidden: true,
    args: colorArg,
  },
  {
    name: "--drag-handle",
    description: "When to show the handles for dragging splits",
    args: {
      name: "when",
      suggestions: [
        { name: "always", description: "Always, even with one split" },
        { name: "auto", description: "When useful (default)" },
        { name: "never", description: "Never" },
      ],
    },
  },
  {
    name: "--resize-overlay",
    description: "When to show the size overlay while resizing",
    args: {
      name: "when",
      suggestions: [
        { name: "always", description: "Always" },
        { name: "never", description: "Never" },
        {
          name: "after-first",
          description:
            "Not when a terminal opens, only on later resizes (default)",
        },
      ],
    },
  },
  {
    name: "--resize-overlay-position",
    description: "Position of the resize overlay",
    args: {
      name: "position",
      suggestions: [
        { name: "center", description: "Default" },
        { name: "top-left" },
        { name: "top-center" },
        { name: "top-right" },
        { name: "bottom-left" },
        { name: "bottom-center" },
        { name: "bottom-right" },
      ],
    },
  },
  {
    name: "--resize-overlay-duration",
    description: "How long the resize overlay stays visible",
    args: durationArg,
  },
  {
    name: "--focus-follows-mouse",
    description: "Focus the split under the mouse pointer",
    args: boolArg,
  },
  {
    name: "--clipboard-read",
    description: "Whether programs may read the clipboard (OSC 52)",
    args: {
      name: "access",
      suggestions: [
        { name: "ask", description: "Ask each time (default)" },
        { name: "allow", description: "Allow" },
        { name: "deny", description: "Deny" },
      ],
    },
  },
  {
    name: "--clipboard-write",
    description: "Whether programs may write to the clipboard (OSC 52)",
    args: {
      name: "access",
      suggestions: [
        { name: "ask", description: "Ask each time" },
        { name: "allow", description: "Allow (default)" },
        { name: "deny", description: "Deny" },
      ],
    },
  },
  {
    name: "--clipboard-write-limit-bytes",
    description: "Maximum size of one clipboard write by a program (OSC 5522)",
    args: limitArg("bytes"),
  },
  {
    name: "--clipboard-trim-trailing-spaces",
    description: "Trim trailing whitespace from copied text",
    args: onByDefaultBoolArg,
  },
  {
    name: "--clipboard-paste-protection",
    description: "Confirm before pasting text that looks unsafe",
    args: onByDefaultBoolArg,
  },
  {
    name: "--clipboard-paste-bracketed-safe",
    description: "Treat bracketed pastes as safe",
    args: onByDefaultBoolArg,
  },
  {
    name: "--title-report",
    description: "Let programs read the window title (CSI 21 t)",
    args: boolArg,
  },
  {
    name: "--image-storage-limit",
    description: "Maximum bytes of image data per screen",
    args: { name: "bytes", description: "0 disables image protocols" },
  },
  {
    name: "--copy-on-select",
    description: "Copy selected text automatically",
    args: {
      name: "clipboard",
      suggestions: [
        { name: "none", description: "Don't copy (default)" },
        { name: "primary", description: "Selection clipboard (Linux only)" },
        { name: "clipboard", description: "System clipboard" },
        { name: "both", description: "Selection and system clipboards" },
      ],
    },
  },
  {
    name: "--right-click-action",
    description: "Action for a right click",
    args: {
      name: "action",
      suggestions: [
        {
          name: "context-menu",
          description: "Show the context menu (default)",
        },
        { name: "paste", description: "Paste from the clipboard" },
        { name: "copy", description: "Copy the selection" },
        {
          name: "copy-or-paste",
          description: "Copy the selection, or paste if there is none",
        },
        { name: "ignore", description: "Do nothing" },
      ],
    },
  },
  {
    name: "--middle-click-action",
    description: "Action for a middle click",
    args: {
      name: "action",
      suggestions: [
        {
          name: "primary-paste",
          description:
            "Paste from the selection clipboard, which macOS lacks (default)",
        },
        {
          name: "clipboard-paste",
          description: "Paste from the system clipboard",
        },
        { name: "ignore", description: "Do nothing" },
      ],
    },
  },
  {
    name: "--click-repeat-interval",
    description: "Maximum time between clicks of a double or triple click",
    args: { name: "milliseconds" },
  },
  {
    name: "--config-file",
    description: "Additional config file to load; repeatable",
    isRepeatable: true,
    args: {
      name: "path",
      description: "Prefix ? to ignore a missing file",
      template: "filepaths",
    },
  },
  {
    name: "--config-default-files",
    description: "Load the default config files",
    args: onByDefaultBoolArg,
  },
  {
    name: "--confirm-close-surface",
    description: "Confirm before closing a terminal",
    args: {
      name: "when",
      suggestions: [
        { name: "true", description: "When a process is running (default)" },
        { name: "false", description: "Never" },
        { name: "always", description: "Always" },
      ],
    },
  },
  {
    name: "--quit-after-last-window-closed",
    description: "Quit when the last window closes",
    args: boolArg,
  },
  {
    name: "--quit-after-last-window-closed-delay",
    description:
      "How long to keep running after the last window closes (Linux only)",
    hidden: true,
    args: durationArg,
  },
  {
    name: "--initial-window",
    description: "Open a window when Ghostty starts",
    args: onByDefaultBoolArg,
  },
  {
    name: "--undo-timeout",
    description: "How long an action can be undone",
    args: durationArg,
  },
  {
    name: "--quick-terminal-position",
    description: "Position of the quick terminal",
    args: {
      name: "position",
      suggestions: [
        { name: "top", description: "Top of the screen (default)" },
        { name: "bottom", description: "Bottom of the screen" },
        { name: "left", description: "Left side of the screen" },
        { name: "right", description: "Right side of the screen" },
        { name: "center", description: "Center of the screen" },
      ],
    },
  },
  {
    name: "--quick-terminal-size",
    description: "Size of the quick terminal",
    args: {
      name: "size",
      description: "N% or Npx, optionally followed by a second size",
    },
  },
  {
    name: "--gtk-quick-terminal-layer",
    description: "Wayland layer of the quick terminal (GTK only)",
    hidden: true,
    args: {
      name: "layer",
      suggestions: [
        { name: "overlay", description: "In front of all windows" },
        { name: "top", description: "In front of normal windows (default)" },
        { name: "bottom", description: "Behind normal windows" },
        { name: "background", description: "Behind all windows" },
      ],
    },
  },
  {
    name: "--gtk-quick-terminal-namespace",
    description:
      "Wayland layer-shell namespace of the quick terminal (GTK only)",
    hidden: true,
    args: { name: "namespace" },
  },
  {
    name: "--quick-terminal-screen",
    description: "Screen the quick terminal appears on",
    args: {
      name: "screen",
      suggestions: [
        {
          name: "main",
          description: "The screen with keyboard focus (default)",
        },
        { name: "mouse", description: "The screen under the mouse pointer" },
        {
          name: "macos-menu-bar",
          description: "The screen with the primary menu bar",
        },
      ],
    },
  },
  {
    name: "--quick-terminal-animation-duration",
    description: "Quick terminal animation duration",
    args: { name: "seconds", description: "0 disables the animation" },
  },
  {
    name: "--quick-terminal-autohide",
    description: "Hide the quick terminal when it loses focus",
    args: onByDefaultBoolArg,
  },
  {
    name: "--quick-terminal-space-behavior",
    description: "Quick terminal behavior when switching spaces",
    args: {
      name: "behavior",
      suggestions: [
        { name: "move", description: "Follow to the current space (default)" },
        { name: "remain", description: "Stay in the space where it opened" },
      ],
    },
  },
  {
    name: "--quick-terminal-keyboard-interactivity",
    description:
      "When the quick terminal receives keyboard input (Wayland only)",
    hidden: true,
    args: {
      name: "mode",
      suggestions: [
        { name: "none", description: "Never" },
        { name: "on-demand", description: "When focused (default)" },
        { name: "exclusive", description: "Always" },
      ],
    },
  },
  {
    name: "--shell-integration",
    description: "Shell integration to inject automatically",
    args: {
      name: "shell",
      suggestions: [
        { name: "none", description: "No automatic injection" },
        {
          name: "detect",
          description: "Detect from the shell's file name (default)",
        },
        { name: "bash" },
        { name: "elvish" },
        { name: "fish" },
        { name: "nushell" },
        { name: "zsh" },
      ],
    },
  },
  {
    name: "--shell-integration-features",
    description: "Shell integration features to enable",
    args: flagListArg("features", [
      ["cursor", "Bar cursor at the prompt", true],
      ["sudo", "Wrap sudo to keep terminfo"],
      ["title", "Set the window title", true],
      ["ssh-env", "Forward environment variables over SSH"],
      ["ssh-terminfo", "Install terminfo on SSH hosts"],
      ["path", "Add Ghostty's binary directory to PATH", true],
    ]),
  },
  {
    name: "--command-palette-entry",
    description: "Custom command palette entry; repeatable",
    isRepeatable: true,
    args: {
      name: "entry",
      description: "title:TITLE,action:ACTION[,description:TEXT], or clear",
    },
  },
  {
    name: "--osc-color-report-format",
    description: "Format of replies to OSC color queries",
    args: {
      name: "format",
      suggestions: [
        { name: "none", description: "Don't reply" },
        { name: "8-bit", description: "Unscaled components" },
        {
          name: "16-bit",
          description: "Components scaled to 16 bits (default)",
        },
      ],
    },
  },
  {
    name: "--vt-kam-allowed",
    description: "Allow the keyboard action mode (KAM, ANSI mode 2)",
    args: boolArg,
  },
  {
    name: "--vt-window-resize-allowed",
    description: "Let programs resize the window (CSI 8 t)",
    args: boolArg,
  },
  {
    name: "--vt-xt-checksum-report",
    description: "Report checksums of screen areas (DECRQCRA)",
    args: boolArg,
  },
  {
    name: "--vt-xt-checksum-extension",
    description: "How DECRQCRA checksums are calculated",
    args: flagListArg("options", [
      ["negate", "Report the negated sum", true],
      ["attributes", "Include character attributes", true],
      ["trim", "Omit plain spaces after the first cell", true],
      ["undrawn", "Count unwritten cells as spaces"],
      ["full", "Use the full codepoint of each cell"],
    ]),
  },
  {
    name: "--custom-shader",
    description: "GLSL shader to run after the default shaders; repeatable",
    isRepeatable: true,
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--custom-shader-animation",
    description: "When to animate custom shaders",
    args: {
      name: "when",
      suggestions: [
        {
          name: "true",
          description: "While the terminal is focused (default)",
        },
        { name: "false", description: "Only render on terminal updates" },
        { name: "always", description: "Always, even when unfocused" },
      ],
    },
  },
  {
    name: "--bell-features",
    description: "What happens when the bell rings",
    args: flagListArg("features", [
      ["system", "System notification or sound"],
      ["audio", "Play bell-audio-path"],
      ["attention", "Request attention, bouncing the Dock icon", true],
      ["title", "Add a bell to the title", true],
      ["border", "Draw a border around the terminal"],
    ]),
  },
  {
    name: "--bell-audio-path",
    description: "Audio file played by the audio bell feature",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--bell-audio-volume",
    description: "Audio bell volume, relative to the system volume",
    args: { name: "volume", description: "0 to 1" },
  },
  {
    name: "--app-notifications",
    description: "In-app notifications to show (GTK only)",
    hidden: true,
    args: flagListArg("notifications", [
      ["clipboard-copy", "Text was copied", true],
      ["config-reload", "The config was reloaded", true],
    ]),
  },
  {
    name: "--macos-non-native-fullscreen",
    description: "Use non-native fullscreen",
    args: {
      name: "mode",
      suggestions: [
        { name: "false", description: "Native fullscreen (default)" },
        { name: "true", description: "Non-native, hiding the menu bar" },
        {
          name: "visible-menu",
          description: "Non-native, keeping the menu bar",
        },
        {
          name: "padded-notch",
          description:
            "Non-native, hiding the menu bar and padding for the notch",
        },
      ],
    },
  },
  {
    name: "--macos-window-buttons",
    description: "Show the titlebar window buttons",
    args: {
      name: "visibility",
      suggestions: [
        { name: "visible", description: "Show (default)" },
        { name: "hidden", description: "Hide" },
      ],
    },
  },
  {
    name: "--macos-titlebar-style",
    description: "Titlebar style",
    args: {
      name: "style",
      suggestions: [
        { name: "native", description: "Native titlebar" },
        {
          name: "transparent",
          description: "Native titlebar showing the background color (default)",
        },
        { name: "tabs", description: "Tabs in the titlebar" },
        {
          name: "hidden",
          description: "No titlebar, keeping the window frame",
        },
      ],
    },
  },
  {
    name: "--macos-titlebar-proxy-icon",
    description: "Show the proxy icon in the titlebar",
    args: {
      name: "visibility",
      suggestions: [
        { name: "visible", description: "Show (default)" },
        { name: "hidden", description: "Hide" },
      ],
    },
  },
  {
    name: "--macos-dock-drop-behavior",
    description: "What dropping a file or folder on the Dock icon opens",
    args: {
      name: "behavior",
      suggestions: [
        {
          name: "new-tab",
          description: "A new tab, or a window if none is open (default)",
        },
        { name: "new-window", description: "A new window" },
      ],
    },
  },
  {
    name: "--macos-option-as-alt",
    description: "Treat the Option key as Alt",
    args: {
      name: "keys",
      suggestions: [
        { name: "true", description: "Both Option keys" },
        { name: "false", description: "Neither" },
        { name: "left", description: "Left Option key" },
        { name: "right", description: "Right Option key" },
      ],
    },
  },
  {
    name: "--macos-window-shadow",
    description: "Draw the window shadow",
    args: onByDefaultBoolArg,
  },
  {
    name: "--macos-hidden",
    description: "Hide Ghostty from the Dock and app switcher",
    args: {
      name: "when",
      suggestions: [
        { name: "never", description: "Never hide (default)" },
        { name: "always", description: "Always hide" },
      ],
    },
  },
  {
    name: "--macos-auto-secure-input",
    description: "Turn on Secure Input at password prompts",
    args: onByDefaultBoolArg,
  },
  {
    name: "--macos-secure-input-indication",
    description: "Show an indicator while Secure Input is on",
    args: onByDefaultBoolArg,
  },
  {
    name: "--macos-applescript",
    description: "Provide the AppleScript dictionary",
    args: onByDefaultBoolArg,
  },
  {
    name: "--macos-icon",
    description: "App icon",
    args: {
      name: "icon",
      suggestions: [
        { name: "official", description: "Official icon (default)" },
        { name: "blueprint", description: "Variant" },
        { name: "chalkboard", description: "Variant" },
        { name: "microchip", description: "Variant" },
        { name: "glass", description: "Variant" },
        { name: "holographic", description: "Variant" },
        { name: "paper", description: "Variant" },
        { name: "retro", description: "Variant" },
        { name: "xray", description: "Variant" },
        { name: "custom", description: "File from macos-custom-icon" },
        {
          name: "custom-style",
          description: "Official icon in the macos-icon-* colors",
        },
      ],
    },
  },
  {
    name: "--macos-custom-icon",
    description: "Icon file for macos-icon=custom (PNG, JPEG or ICNS)",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--macos-icon-frame",
    description: "Frame of the custom-style app icon",
    args: {
      name: "material",
      suggestions: [
        { name: "aluminum", description: "Brushed aluminum (default)" },
        { name: "beige", description: "Classic beige" },
        { name: "plastic", description: "Glossy dark plastic" },
        { name: "chrome", description: "Shiny chrome" },
      ],
    },
  },
  {
    name: "--macos-icon-ghost-color",
    description: "Ghost color of the custom-style app icon",
    args: colorArg,
  },
  {
    name: "--macos-icon-screen-color",
    description: "Screen gradient of the custom-style app icon",
    args: {
      name: "colors",
      description: "Comma-separated colors, bottom to top",
    },
  },
  {
    name: "--macos-shortcuts",
    description: "Whether Shortcuts may control Ghostty",
    args: {
      name: "access",
      suggestions: [
        { name: "ask", description: "Ask each time (default)" },
        { name: "allow", description: "Allow" },
        { name: "deny", description: "Deny" },
      ],
    },
  },
  {
    name: "--linux-cgroup",
    description: "Run each terminal in its own systemd scope (Linux only)",
    hidden: true,
    args: {
      name: "when",
      suggestions: [
        { name: "never", description: "Never (default)" },
        { name: "always", description: "Always" },
        {
          name: "single-instance",
          description: "Only in single-instance mode",
        },
      ],
    },
  },
  {
    name: "--linux-cgroup-memory-limit",
    description: "Memory limit per terminal in bytes (Linux only)",
    hidden: true,
    args: { name: "bytes" },
  },
  {
    name: "--linux-cgroup-processes-limit",
    description: "Process limit per terminal (Linux only)",
    hidden: true,
    args: { name: "processes" },
  },
  {
    name: "--linux-cgroup-hard-fail",
    description: "Fail if the systemd scope cannot be created (Linux only)",
    hidden: true,
    args: boolArg,
  },
  {
    name: "--gtk-opengl-debug",
    description: "Log GTK OpenGL debug messages (GTK only)",
    hidden: true,
    args: boolArg,
  },
  {
    name: "--gtk-single-instance",
    description: "Open new windows in the running instance (GTK only)",
    hidden: true,
    args: {
      name: "mode",
      suggestions: [
        {
          name: "detect",
          description: "When launched from a desktop launcher (default)",
        },
        { name: "true", description: "Always" },
        { name: "false", description: "Never" },
      ],
    },
  },
  {
    name: "--gtk-titlebar",
    description: "Show the full GTK titlebar (GTK only)",
    hidden: true,
    args: onByDefaultBoolArg,
  },
  {
    name: "--gtk-tabs-location",
    description: "Side of the window for the tab bar (GTK only)",
    hidden: true,
    args: {
      name: "location",
      suggestions: [
        { name: "top", description: "Top (default)" },
        { name: "bottom", description: "Bottom" },
      ],
    },
  },
  {
    name: "--gtk-tabs-inverted",
    description: "Put the tab close button at the start (GTK only)",
    hidden: true,
    args: boolArg,
  },
  {
    name: "--gtk-titlebar-hide-when-maximized",
    description: "Hide the titlebar when maximized (GTK only)",
    hidden: true,
    args: boolArg,
  },
  {
    name: "--gtk-toolbar-style",
    description: "Appearance of the tab and title bars (GTK only)",
    hidden: true,
    args: {
      name: "style",
      suggestions: [
        { name: "flat", description: "Flat" },
        { name: "raised", description: "Cast a shadow (default)" },
        { name: "raised-border", description: "Subtle border" },
      ],
    },
  },
  {
    name: "--gtk-titlebar-style",
    description: "Style of the GTK titlebar (GTK only)",
    hidden: true,
    args: {
      name: "style",
      suggestions: [
        { name: "native", description: "Separate tab bar (default)" },
        { name: "tabs", description: "Tabs in the titlebar" },
      ],
    },
  },
  {
    name: "--gtk-wide-tabs",
    description: "Let tabs fill the tab bar (GTK only)",
    hidden: true,
    args: onByDefaultBoolArg,
  },
  {
    name: "--gtk-horizontal-tab-scroll",
    description: "Switch tabs with horizontal touchpad scrolling (GTK only)",
    hidden: true,
    args: onByDefaultBoolArg,
  },
  {
    name: "--gtk-custom-css",
    description: "CSS file to load; repeatable (GTK only)",
    hidden: true,
    isRepeatable: true,
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--desktop-notifications",
    description: "Let programs show desktop notifications (OSC 9, OSC 777)",
    args: onByDefaultBoolArg,
  },
  {
    name: "--progress-style",
    description: "Let programs show progress bars (OSC 9;4)",
    args: onByDefaultBoolArg,
  },
  {
    name: "--bold-color",
    description: "Color of bold text",
    args: {
      ...colorArg,
      suggestions: [
        {
          name: "bright",
          description: "Bright palette version of the text color",
        },
      ],
    },
  },
  {
    name: "--faint-opacity",
    description: "Opacity of faint text",
    args: { name: "opacity", description: "0 to 1" },
  },
  {
    name: "--term",
    description: "Value of TERM for commands",
    args: { name: "term", suggestions: ["xterm-ghostty", "xterm-256color"] },
  },
  {
    name: "--enquiry-response",
    description: "Reply to ENQ (0x05) from the running program",
    args: { name: "text" },
  },
  {
    name: "--async-backend",
    description: "Async I/O backend (Linux only)",
    hidden: true,
    args: {
      name: "backend",
      suggestions: [
        { name: "auto", description: "Best available (default)" },
        { name: "epoll", description: "epoll" },
        { name: "io_uring", description: "io_uring" },
      ],
    },
  },
  {
    name: "--auto-update",
    description: "Auto-update behavior",
    args: {
      name: "mode",
      suggestions: [
        { name: "off", description: "Don't check" },
        { name: "check", description: "Check and notify" },
        { name: "download", description: "Check, download and notify" },
      ],
    },
  },
  {
    name: "--auto-update-channel",
    description: "Release channel for updates",
    args: {
      name: "channel",
      suggestions: [
        { name: "stable", description: "Tagged releases" },
        { name: "tip", description: "Builds of every commit to main" },
      ],
    },
  },
];

// Ghostty only accepts `--key=value`, for action flags as well. A flag
// without a value must not get one, or the "=" would be inserted after it.
const requireSeparators = (options: Fig.Option[]): Fig.Option[] =>
  options.map((option) =>
    option.args ? { ...option, requiresSeparator: true } : option,
  );

const configOptions = requireSeparators(configKeys);

const configKeySuggestions: Fig.Suggestion[] = configKeys.map(
  ({ name, description, hidden }) => ({
    name: (name as string).slice(2),
    description,
    hidden,
  }),
);

const helpOption: Fig.Option = {
  name: ["--help", "-h"],
  description: "Show help for this action",
};

const plainOption: Fig.Option = {
  name: "--plain",
  description: "Print without formatting",
  args: boolArg,
};

const commandOption: Fig.Option = {
  name: "-e",
  description:
    "Run a command instead of the shell; everything after it is the command",
  args: { name: "command", isCommand: true },
};

const classOption: Fig.Option = {
  name: "--class",
  description: "Application ID of the Ghostty instance to contact",
  requiresSeparator: true,
  args: { name: "class" },
};

const ipcOptions: Fig.Option[] = [
  helpOption,
  classOption,
  // `+new-window` and `+new-tab` hand these keys to the new terminal
  ...configOptions.filter((option) =>
    [
      "--command",
      "--shell-integration",
      "--title",
      "--working-directory",
    ].includes(option.name as string),
  ),
  commandOption,
];

// `+ssh` hands ssh everything from its first argument that doesn't start with
// `--`, so it reuses the ssh spec, and its own flags only work before that
const ssh = sshSpec as Fig.Subcommand;
const sshArg = ssh.args as Fig.Arg;

const sshActionOptions = requireSeparators([
  {
    name: "--help",
    description: "Show help for this action",
  },
  {
    name: "--forward-env",
    description:
      "Send COLORTERM, TERM_PROGRAM and TERM_PROGRAM_VERSION to the host",
    args: onByDefaultBoolArg,
  },
  {
    name: "--terminfo",
    description: "Install Ghostty's terminfo on the first connection to a host",
    args: onByDefaultBoolArg,
  },
  {
    name: "--cache",
    description: "Use the cache of hosts that already have the terminfo",
    args: onByDefaultBoolArg,
  },
  {
    name: "--ssh",
    description: "ssh binary to run",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--verbose",
    description: "Print status lines to stderr",
    args: boolArg,
  },
]);

// ssh.ts's host generators look at tokens[1], which is `+ssh` here; give them
// the token being completed so `user@` keeps working
const forCurrentToken = (generator: Fig.Generator): Fig.Generator => ({
  ...generator,
  custom: (tokens, executeCommand, context) =>
    generator.custom(
      [tokens[0], tokens[tokens.length - 1]],
      executeCommand,
      context,
    ),
});

const sshCacheDestinationArg: Fig.Arg = {
  name: "destination",
  description: "user@host, host or host:port",
};

const subcommands: Fig.Subcommand[] = [
  {
    name: "+version",
    description: "Output the version and exit",
  },
  {
    name: "+help",
    description: "Output help for the CLI",
  },
  {
    name: "+list-fonts",
    description: "List available fonts",
    options: requireSeparators([
      helpOption,
      {
        name: "--family",
        description: "List this family's faces in the order Ghostty picks them",
        args: fontFamilyArg,
      },
      {
        name: "--style",
        description: "Prefer faces with this style name",
        args: { name: "style" },
      },
      { name: "--bold", description: "Prefer bold faces", args: boolArg },
      { name: "--italic", description: "Prefer italic faces", args: boolArg },
    ]),
  },
  {
    name: "+list-keybinds",
    description: "List available keybinds",
    options: requireSeparators([
      helpOption,
      {
        name: "--default",
        description: "List the default keybinds instead of the configured ones",
        args: boolArg,
      },
      {
        name: "--docs",
        description: "Does nothing yet",
        hidden: true,
        args: boolArg,
      },
      plainOption,
    ]),
  },
  {
    name: "+list-themes",
    description: "List available themes",
    options: requireSeparators([
      helpOption,
      {
        name: "--path",
        description: "Show the path of each theme",
        args: boolArg,
      },
      {
        name: "--plain",
        description: "Print a plain list instead of the interactive preview",
        args: boolArg,
      },
      {
        name: "--color",
        description: "Only list dark or light themes",
        args: {
          name: "scheme",
          suggestions: [
            { name: "all", description: "Default" },
            { name: "dark", description: "Dark themes" },
            { name: "light", description: "Light themes" },
          ],
        },
      },
    ]),
  },
  {
    name: "+list-colors",
    description: "List named RGB colors",
    options: requireSeparators([helpOption, plainOption]),
  },
  {
    name: "+list-actions",
    description: "List keybind actions",
    options: requireSeparators([
      helpOption,
      {
        name: "--docs",
        description: "Print the documentation of each action",
        args: boolArg,
      },
    ]),
  },
  {
    name: "+ssh",
    description:
      "Run ssh with Ghostty's terminal integration for the remote host",
    // ssh chains short flags (-4A), which the root's directive would prevent
    parserDirectives: {},
    // The form the docs suggest for an ssh alias: `ghostty +ssh --`
    subcommands: [
      {
        name: "--",
        description: "Pass the rest of the line to ssh",
        hidden: true,
        loadSpec: "ssh",
      },
    ],
    options: [
      ...sshActionOptions,
      ...(ssh.options as Fig.Option[]).map((option) => ({
        ...option,
        exclusiveOn: sshActionOptions.map(({ name }) => name as string),
      })),
    ],
    args: {
      ...sshArg,
      generators: (sshArg.generators as Fig.Generator[]).map((generator) =>
        generator.custom ? forCurrentToken(generator) : generator,
      ),
    },
  },
  {
    name: "+ssh-cache",
    description: "Manage the cache of hosts with Ghostty's terminfo installed",
    // Ghostty rejects a destination together with any of the action flags
    parserDirectives: { optionsMustPrecedeArguments: true },
    options: requireSeparators([
      helpOption,
      {
        name: "--clear",
        description: "Remove every cached destination",
        isDangerous: true,
        exclusiveOn: ["--add", "--remove", "--prune"],
        args: boolArg,
      },
      {
        name: "--add",
        description: "Add a destination",
        exclusiveOn: ["--clear", "--remove", "--prune"],
        args: sshCacheDestinationArg,
      },
      {
        name: "--remove",
        description: "Remove a destination",
        isDangerous: true,
        exclusiveOn: ["--clear", "--add", "--prune"],
        args: sshCacheDestinationArg,
      },
      {
        name: "--prune",
        description: "Remove destinations older than a duration",
        isDangerous: true,
        exclusiveOn: ["--clear", "--add", "--remove"],
        args: {
          name: "duration",
          description: "Number with a unit (s, m, h, d, w, y)",
          suggestions: ["7d", "30d", "90d", "1y"],
        },
      },
      {
        name: "--host",
        description: "Destination to show",
        hidden: true,
        deprecated: { description: "Pass the destination as an argument" },
        args: sshCacheDestinationArg,
      },
    ]),
    args: {
      ...sshCacheDestinationArg,
      description: "Show the cached entries for this destination",
      isOptional: true,
    },
  },
  {
    name: "+edit-config",
    description: "Open the config file in $VISUAL or $EDITOR",
    options: [helpOption],
  },
  {
    name: "+show-config",
    description: "Print the configuration",
    options: requireSeparators([
      helpOption,
      {
        name: "--default",
        description: "Show the default configuration instead of yours",
        args: boolArg,
      },
      {
        name: "--changes-only",
        description: "Only show options that differ from the default",
        args: onByDefaultBoolArg,
      },
      {
        name: "--docs",
        description: "Print the documentation of each option as a comment",
        args: boolArg,
      },
      {
        name: "--no-pager",
        description: "Don't page the output",
        args: boolArg,
      },
    ]),
  },
  {
    name: "+explain-config",
    description: "Explain a config option or keybind action",
    options: requireSeparators([
      helpOption,
      {
        name: "--option",
        description: "Config option to explain",
        args: { name: "option", suggestions: configKeySuggestions },
      },
      {
        name: "--keybind",
        description: "Keybind action to explain",
        args: { name: "action", generators: keybindActionsGenerator },
      },
      // Only the exact token turns the pager off; --no-pager=true is ignored
      { name: "--no-pager", description: "Don't page the output" },
    ]),
    args: {
      name: "option or action",
      isOptional: true,
      suggestions: configKeySuggestions,
      generators: keybindActionsGenerator,
    },
  },
  {
    name: "+validate-config",
    description: "Check a config file for errors",
    options: requireSeparators([
      helpOption,
      {
        name: "--config-file",
        description: "Config file to check instead of the default one",
        args: { name: "path", template: "filepaths" },
      },
    ]),
  },
  {
    name: "+show-face",
    description: "Show which font face renders a codepoint",
    options: [
      ...requireSeparators([
        helpOption,
        {
          name: "--cp",
          description: "Codepoint to look up",
          args: {
            name: "codepoint",
            description: "Decimal, or hex, octal or binary with 0x, 0o or 0b",
          },
        },
        {
          name: "--string",
          description: "Look up every codepoint of a string",
          args: { name: "string" },
        },
        {
          name: "--style",
          description: "Style to search for",
          args: {
            name: "style",
            suggestions: [
              { name: "regular", description: "Default" },
              { name: "bold" },
              { name: "italic" },
              { name: "bold_italic" },
            ],
          },
        },
        {
          name: "--presentation",
          description: "Force text or emoji presentation",
          args: {
            name: "presentation",
            suggestions: ["text", "emoji"],
          },
        },
      ]),
      // Config keys work here too; only the font ones change the result
      ...configOptions.filter((option) =>
        (option.name as string).startsWith("--font-"),
      ),
    ],
  },
  {
    name: "+crash-report",
    description: "List crash reports",
    options: [helpOption],
  },
  {
    name: "+boo",
    description: "Show the animation from the Ghostty website",
    options: [helpOption],
  },
  {
    name: "+new-window",
    description: "Open a window in the running Ghostty (GTK only)",
    hidden: true,
    options: ipcOptions,
  },
  {
    name: "+new-tab",
    description: "Open a tab in the running Ghostty (GTK only)",
    hidden: true,
    options: [
      ...ipcOptions,
      {
        name: "--surface-id",
        description:
          "Surface whose window gets the tab; 0 means the focused one",
        requiresSeparator: true,
        args: { name: "id" },
      },
    ],
  },
  {
    name: "+toggle-quick-terminal",
    description: "Toggle the quick terminal of the running Ghostty (GTK only)",
    hidden: true,
    options: [helpOption, classOption],
  },
];

const completionSpec: Fig.Spec = {
  name: "ghostty",
  description: "Fast, native terminal emulator",
  // Ghostty doesn't chain short flags: it reads -he as an unknown key
  parserDirectives: { flagsArePosixNoncompliant: true },
  subcommands,
  options: [
    {
      name: ["--help", "-h"],
      description: "Show help",
    },
    {
      name: "--version",
      description: "Show the version",
    },
    commandOption,
    ...configOptions,
  ],
};

export default completionSpec;
