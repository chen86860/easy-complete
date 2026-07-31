export type ThemeEntry = {
  id: string;
  label: string;
  appearance: "system" | "light" | "dark";
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
    bgClassName: "bg-[#303030]",
    textClassName: "bg-[#b4b4b4] text-[#b4b4b4]",
    selectionClassName: "bg-[#1e5ac7]",
    accentClassName: "bg-[#5f5938]",
  },
  {
    id: "light",
    label: "Light",
    appearance: "light",
    bgClassName: "bg-[#fefefe]",
    textClassName: "bg-[#070707] text-[#070707]",
    selectionClassName: "bg-[#2969da]",
    accentClassName: "bg-[#fff899]",
  },
  {
    id: "system",
    label: "System",
    appearance: "system",
    bgClassName: "bg-[#1c1c1c]",
    textClassName: "bg-[#d0d0d0] text-[#d0d0d0]",
    selectionClassName: "bg-[AccentColor]",
    accentClassName: "bg-[AccentColor]",
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    appearance: "dark",
    bgClassName: "bg-[#0d1117]",
    textClassName: "bg-[#c9d1d9] text-[#c9d1d9]",
    selectionClassName: "bg-[#1f6feb]",
    accentClassName: "bg-[#388bfd]",
  },
  {
    id: "github-light",
    label: "GitHub Light",
    appearance: "light",
    bgClassName: "bg-white",
    textClassName: "bg-[#24292f] text-[#24292f]",
    selectionClassName: "bg-[#0969da]",
    accentClassName: "bg-[#fff8c5]",
  },
  {
    id: "claude-light",
    label: "Claude Light",
    appearance: "light",
    bgClassName: "bg-[#f3f1e9]",
    textClassName: "bg-[#1a1917] text-[#1a1917]",
    selectionClassName: "bg-[#efe5db]",
    accentClassName: "bg-[#cc785c]",
  },
  {
    id: "nord",
    label: "Nord",
    appearance: "dark",
    bgClassName: "bg-[#2e3440]",
    textClassName: "bg-[#d8dee9] text-[#d8dee9]",
    selectionClassName: "bg-[#5e81ac]",
    accentClassName: "bg-[#88c0d0]",
  },
  {
    id: "gruvbox-dark",
    label: "Gruvbox Dark",
    appearance: "dark",
    bgClassName: "bg-[#282828]",
    textClassName: "bg-[#ebdbb2] text-[#ebdbb2]",
    selectionClassName: "bg-[#458588]",
    accentClassName: "bg-[#d79921]",
  },
  {
    id: "one-dark",
    label: "One Dark",
    appearance: "dark",
    bgClassName: "bg-[#282c34]",
    textClassName: "bg-[#abb2bf] text-[#abb2bf]",
    selectionClassName: "bg-[#528bff]",
    accentClassName: "bg-[#98c379]",
  },
  {
    id: "catppuccin-latte",
    label: "Catppuccin Latte",
    appearance: "light",
    bgClassName: "bg-[#eff1f5]",
    textClassName: "bg-[#4c4f69] text-[#4c4f69]",
    selectionClassName: "bg-[#1e66f5]",
    accentClassName: "bg-[#8839ef]",
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night",
    appearance: "dark",
    bgClassName: "bg-[#1a1b26]",
    textClassName: "bg-[#a9b1d6] text-[#a9b1d6]",
    selectionClassName: "bg-[#364a82]",
    accentClassName: "bg-[#bb9af7]",
  },
];
