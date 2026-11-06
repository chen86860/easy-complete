// Theme previews are drawn from the same definitions the suggestion popup loads,
// so a thumbnail always matches what the user gets in the terminal.
import catppuccinLatte from "../../../themes/catppuccin-latte.json";
import catppuccinMocha from "../../../themes/catppuccin-mocha.json";
import claudeLight from "../../../themes/claude-light.json";
import dracula from "../../../themes/dracula.json";
import githubDark from "../../../themes/github-dark.json";
import githubLight from "../../../themes/github-light.json";
import gruvboxDark from "../../../themes/gruvbox-dark.json";
import gruvboxLight from "../../../themes/gruvbox-light.json";
import materialDark from "../../../themes/material-dark.json";
import monokai from "../../../themes/monokai.json";
import nord from "../../../themes/nord.json";
import oneDark from "../../../themes/one-dark.json";
import solarizedDark from "../../../themes/solarized-dark.json";
import solarizedLight from "../../../themes/solarized-light.json";
import tokyoNight from "../../../themes/tokyo-night.json";

type ThemeDefinition = {
  theme: {
    backgroundColor: string;
    textColor: string;
    matchBackgroundColor: string;
    selection: {
      backgroundColor: string;
      textColor: string;
      matchBackgroundColor: string;
    };
    description: { textColor: string; borderColor: string };
  };
};

export type PopupColors = {
  background: string;
  text: string;
  match: string;
  selectionBackground: string;
  selectionText: string;
  selectionMatch: string;
  descriptionText: string;
  border: string;
};

export type ThemeEntry = {
  id: string;
  label: string;
  appearance: "system" | "light" | "dark";
  colors: PopupColors;
  /** Drawn over the lower-right half of the preview, for themes that follow macOS. */
  darkColors?: PopupColors;
};

function toColors({ theme }: ThemeDefinition): PopupColors {
  return {
    background: theme.backgroundColor,
    text: theme.textColor,
    match: theme.matchBackgroundColor,
    selectionBackground: theme.selection.backgroundColor,
    selectionText: theme.selection.textColor,
    selectionMatch: theme.selection.matchBackgroundColor,
    descriptionText: theme.description.textColor,
    border: theme.description.borderColor,
  };
}

// Mirrors `builtInThemes` in packages/autocomplete-app/src/fig/themes.ts.
const DARK: PopupColors = {
  background: "rgb(48,48,48)",
  text: "rgb(180,180,180)",
  match: "rgb(95,89,56)",
  selectionBackground: "rgb(30,90,199)",
  selectionText: "rgb(253,253,253)",
  selectionMatch: "rgb(106,142,218)",
  descriptionText: "rgb(180,180,180)",
  border: "rgb(65,65,65)",
};

const LIGHT: PopupColors = {
  background: "rgb(254,254,254)",
  text: "rgb(7,7,7)",
  match: "rgb(255,239,152)",
  selectionBackground: "rgb(41,105,218)",
  selectionText: "rgb(253,253,253)",
  selectionMatch: "rgb(106,142,218)",
  descriptionText: "rgb(7,7,7)",
  border: "rgb(199,199,199)",
};

export const THEMES: ThemeEntry[] = [
  { id: "dark", label: "Dark", appearance: "dark", colors: DARK },
  { id: "light", label: "Light", appearance: "light", colors: LIGHT },
  {
    id: "system",
    label: "System",
    appearance: "system",
    colors: LIGHT,
    darkColors: DARK,
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    appearance: "dark",
    colors: toColors(githubDark),
  },
  {
    id: "github-light",
    label: "GitHub Light",
    appearance: "light",
    colors: toColors(githubLight),
  },
  {
    id: "claude-light",
    label: "Claude Light",
    appearance: "light",
    colors: toColors(claudeLight),
  },
  { id: "nord", label: "Nord", appearance: "dark", colors: toColors(nord) },
  {
    id: "gruvbox-dark",
    label: "Gruvbox Dark",
    appearance: "dark",
    colors: toColors(gruvboxDark),
  },
  {
    id: "one-dark",
    label: "One Dark",
    appearance: "dark",
    colors: toColors(oneDark),
  },
  {
    id: "catppuccin-latte",
    label: "Catppuccin Latte",
    appearance: "light",
    colors: toColors(catppuccinLatte),
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night",
    appearance: "dark",
    colors: toColors(tokyoNight),
  },
  {
    id: "gruvbox-light",
    label: "Gruvbox Light",
    appearance: "light",
    colors: toColors(gruvboxLight),
  },
  {
    id: "solarized-light",
    label: "Solarized Light",
    appearance: "light",
    colors: toColors(solarizedLight),
  },
  {
    id: "dracula",
    label: "Dracula",
    appearance: "dark",
    colors: toColors(dracula),
  },
  {
    id: "monokai",
    label: "Monokai",
    appearance: "dark",
    colors: toColors(monokai),
  },
  {
    id: "solarized-dark",
    label: "Solarized Dark",
    appearance: "dark",
    colors: toColors(solarizedDark),
  },
  {
    id: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    appearance: "dark",
    colors: toColors(catppuccinMocha),
  },
  {
    id: "material-dark",
    label: "Material Dark",
    appearance: "dark",
    colors: toColors(materialDark),
  },
];
