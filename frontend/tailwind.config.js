/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0D13",
        bgAlt: "#0E121A",
        surface: "#141924",
        surface2: "#1A2030",
        border: "#232B3D",
        text: "#E9ECF2",
        textMuted: "#8891A3",
        you: "#FF8A5B",
        youDim: "#4A3327",
        twin: "#4DD9E8",
        twinDim: "#1D3A3E",
        gold: "#E8C468",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
