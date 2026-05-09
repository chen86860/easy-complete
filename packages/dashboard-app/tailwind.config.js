/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#1e1e2e",
        mantle: "#181825",
        crust: "#11111b",
        surface0: "#313244",
        surface1: "#45475a",
        surface2: "#585b70",
        overlay0: "#6c7086",
        overlay1: "#7f849c",
        subtext0: "#a6adc8",
        subtext1: "#bac2de",
        text: "#cdd6f4",
        blue: "#89b4fa",
        mauve: "#cba6f7",
        green: "#a6e3a1",
        red: "#f38ba8",
        yellow: "#f9e2af",
        peach: "#fab387",
      },
    },
  },
  plugins: [],
};
