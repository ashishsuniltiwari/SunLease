import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0b1326",
        "on-background": "#dae2fd",
        surface: "#0b1326",
        "surface-dim": "#0b1326",
        "surface-bright": "#31394d",
        "surface-container-lowest": "#060e20",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",
        "on-surface": "#dae2fd",
        "on-surface-variant": "#bbcabf",
        outline: "#86948a",
        "outline-variant": "#3c4a42",
        primary: {
          DEFAULT: "#4edea3",
          container: "#10b981",
          on: "#003824",
          "on-container": "#00422b",
          fixed: "#6ffbbe",
        },
        secondary: {
          DEFAULT: "#ffb95f",
          container: "#ee9800",
          on: "#472a00",
          "on-container": "#5b3800",
          fixed: "#ffddb8",
        },
        tertiary: {
          DEFAULT: "#89ceff",
          container: "#23acf1",
          on: "#00344d",
          "on-container": "#003d59",
          fixed: "#c9e6ff",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
          on: "#690005",
          "on-container": "#ffdad6",
        },
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(78, 222, 163, 0.25)",
        "amber-glow": "0 0 20px rgba(255, 185, 95, 0.25)",
        "red-glow": "0 0 20px rgba(255, 180, 171, 0.25)",
        glass: "0 20px 40px -15px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
export default config;
