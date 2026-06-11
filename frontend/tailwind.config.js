/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        surface:  "#0a0d12",
        panel:    "#0d1117",
        border:   "rgba(255,255,255,0.07)",
      },
    },
  },
  plugins: [],
};