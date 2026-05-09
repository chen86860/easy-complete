/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Helvetica Neue", "sans-serif"],
      },
      colors: {
        // Apple macOS light mode palette
        base: "#f2f2f7",        // systemGroupedBackground
        mantle: "#ffffff",      // sidebar / sheet background
        crust: "#e5e5ea",       // deeper background
        surface0: "#ffffff",    // card / grouped row background
        surface1: "#e5e5ea",    // separator / border
        surface2: "#c7c7cc",    // stronger border
        overlay0: "#aeaeb2",    // placeholder / tertiary
        overlay1: "#8e8e93",    // secondary label
        subtext0: "#636366",    // secondary label (darker)
        subtext1: "#3c3c43",    // secondary label
        text: "#000000",        // primary label
        blue: "#007aff",        // systemBlue
        mauve: "#5856d6",       // systemIndigo
        green: "#34c759",       // systemGreen
        red: "#ff3b30",         // systemRed
        yellow: "#ff9500",      // systemOrange
        peach: "#ff6b35",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
