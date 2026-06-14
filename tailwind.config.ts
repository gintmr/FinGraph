import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        panel2: "rgb(var(--color-panel2) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        blue: "rgb(var(--color-blue) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        green: "rgb(var(--color-green) / <alpha-value>)",
        red: "rgb(var(--color-red) / <alpha-value>)"
      },
      boxShadow: {
        glow: "0 18px 50px rgb(var(--color-shadow) / 0.18)",
        amber: "0 16px 40px rgb(var(--color-amber) / 0.14)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgb(var(--color-line) / 0.48) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-line) / 0.48) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
