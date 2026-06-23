export type ThemeEntry = {
  id: string;
  label: string;
  appearance: "system" | "light" | "dark";
  rootClassName: string;
  bgClassName: string;
  textClassName: string;
  selectionClassName: string;
  accentClassName: string;
};

export const THEMES: ThemeEntry[] = [
  {
    id: "dark",
    label: "Dark",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#1e5ac7] [--dashboard-accent-soft:#5f5938]",
    bgClassName: "bg-[#303030]",
    textClassName: "bg-[#b4b4b4] text-[#b4b4b4]",
    selectionClassName: "bg-[#1e5ac7]",
    accentClassName: "bg-[#5f5938]",
  },
  {
    id: "light",
    label: "Light",
    appearance: "light",
    rootClassName:
      "[--dashboard-accent-color:#2969da] [--dashboard-accent-soft:#fff899]",
    bgClassName: "bg-[#fefefe]",
    textClassName: "bg-[#070707] text-[#070707]",
    selectionClassName: "bg-[#2969da]",
    accentClassName: "bg-[#fff899]",
  },
  {
    id: "system",
    label: "System",
    appearance: "system",
    rootClassName:
      "[--dashboard-accent-color:#1e5ac7] [--dashboard-accent-soft:#5f5938]",
    bgClassName: "bg-[#1c1c1c]",
    textClassName: "bg-[#d0d0d0] text-[#d0d0d0]",
    selectionClassName: "bg-[#1e5ac7]",
    accentClassName: "bg-[#5f5938]",
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#1f6feb] [--dashboard-accent-soft:#388bfd]",
    bgClassName: "bg-[#0d1117]",
    textClassName: "bg-[#c9d1d9] text-[#c9d1d9]",
    selectionClassName: "bg-[#1f6feb]",
    accentClassName: "bg-[#388bfd]",
  },
  {
    id: "github-light",
    label: "GitHub Light",
    appearance: "light",
    rootClassName:
      "[--dashboard-accent-color:#0969da] [--dashboard-accent-soft:#fff8c5]",
    bgClassName: "bg-white",
    textClassName: "bg-[#24292f] text-[#24292f]",
    selectionClassName: "bg-[#0969da]",
    accentClassName: "bg-[#fff8c5]",
  },
  {
    id: "dracula",
    label: "Dracula",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#6272a4] [--dashboard-accent-soft:#bd93f9]",
    bgClassName: "bg-[#282a36]",
    textClassName: "bg-[#f8f8f2] text-[#f8f8f2]",
    selectionClassName: "bg-[#6272a4]",
    accentClassName: "bg-[#bd93f9]",
  },
  {
    id: "nord",
    label: "Nord",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#5e81ac] [--dashboard-accent-soft:#88c0d0]",
    bgClassName: "bg-[#2e3440]",
    textClassName: "bg-[#d8dee9] text-[#d8dee9]",
    selectionClassName: "bg-[#5e81ac]",
    accentClassName: "bg-[#88c0d0]",
  },
  {
    id: "solarized-dark",
    label: "Solarized Dark",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#268bd2] [--dashboard-accent-soft:#2aa198]",
    bgClassName: "bg-[#002b36]",
    textClassName: "bg-[#839496] text-[#839496]",
    selectionClassName: "bg-[#268bd2]",
    accentClassName: "bg-[#2aa198]",
  },
  {
    id: "solarized-light",
    label: "Solarized Light",
    appearance: "light",
    rootClassName:
      "[--dashboard-accent-color:#268bd2] [--dashboard-accent-soft:#2aa198]",
    bgClassName: "bg-[#fdf6e3]",
    textClassName: "bg-[#657b83] text-[#657b83]",
    selectionClassName: "bg-[#268bd2]",
    accentClassName: "bg-[#2aa198]",
  },
  {
    id: "gruvbox-dark",
    label: "Gruvbox Dark",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#458588] [--dashboard-accent-soft:#d79921]",
    bgClassName: "bg-[#282828]",
    textClassName: "bg-[#ebdbb2] text-[#ebdbb2]",
    selectionClassName: "bg-[#458588]",
    accentClassName: "bg-[#d79921]",
  },
  {
    id: "gruvbox-light",
    label: "Gruvbox Light",
    appearance: "light",
    rootClassName:
      "[--dashboard-accent-color:#458588] [--dashboard-accent-soft:#d79921]",
    bgClassName: "bg-[#fbf1c7]",
    textClassName: "bg-[#3c3836] text-[#3c3836]",
    selectionClassName: "bg-[#458588]",
    accentClassName: "bg-[#d79921]",
  },
  {
    id: "one-dark",
    label: "One Dark",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#528bff] [--dashboard-accent-soft:#98c379]",
    bgClassName: "bg-[#282c34]",
    textClassName: "bg-[#abb2bf] text-[#abb2bf]",
    selectionClassName: "bg-[#528bff]",
    accentClassName: "bg-[#98c379]",
  },
  {
    id: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#89b4fa] [--dashboard-accent-soft:#cba6f7]",
    bgClassName: "bg-[#1e1e2e]",
    textClassName: "bg-[#cdd6f4] text-[#cdd6f4]",
    selectionClassName: "bg-[#89b4fa]",
    accentClassName: "bg-[#cba6f7]",
  },
  {
    id: "catppuccin-latte",
    label: "Catppuccin Latte",
    appearance: "light",
    rootClassName:
      "[--dashboard-accent-color:#1e66f5] [--dashboard-accent-soft:#8839ef]",
    bgClassName: "bg-[#eff1f5]",
    textClassName: "bg-[#4c4f69] text-[#4c4f69]",
    selectionClassName: "bg-[#1e66f5]",
    accentClassName: "bg-[#8839ef]",
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#364a82] [--dashboard-accent-soft:#bb9af7]",
    bgClassName: "bg-[#1a1b26]",
    textClassName: "bg-[#a9b1d6] text-[#a9b1d6]",
    selectionClassName: "bg-[#364a82]",
    accentClassName: "bg-[#bb9af7]",
  },
  {
    id: "monokai",
    label: "Monokai",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#75715e] [--dashboard-accent-soft:#ae81ff]",
    bgClassName: "bg-[#272822]",
    textClassName: "bg-[#f8f8f2] text-[#f8f8f2]",
    selectionClassName: "bg-[#75715e]",
    accentClassName: "bg-[#ae81ff]",
  },
  {
    id: "material-dark",
    label: "Material Dark",
    appearance: "dark",
    rootClassName:
      "[--dashboard-accent-color:#546e7a] [--dashboard-accent-soft:#c792ea]",
    bgClassName: "bg-[#263238]",
    textClassName: "bg-[#eeffff] text-[#eeffff]",
    selectionClassName: "bg-[#546e7a]",
    accentClassName: "bg-[#c792ea]",
  },
];

export const DEFAULT_THEME = THEMES[0];

export function getTheme(id: unknown) {
  return THEMES.find((theme) => theme.id === id) ?? DEFAULT_THEME;
}
