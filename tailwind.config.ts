import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)",
          3: "rgb(var(--surface-3) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          secondary: "rgb(var(--fg-secondary) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          subtle: "rgb(var(--fg-subtle) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          hover: "rgb(var(--primary-hover) / <alpha-value>)",
          fg: "rgb(var(--primary-fg) / <alpha-value>)",
        },
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        preview: "rgb(var(--preview) / <alpha-value>)",
        overlay: "rgb(var(--overlay) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(var(--shadow-color) / 0.06), 0 1px 3px rgb(var(--shadow-color) / 0.08)",
        lifted: "0 4px 12px -2px rgb(var(--shadow-color) / 0.12), 0 2px 4px -2px rgb(var(--shadow-color) / 0.08)",
        overlay: "0 24px 48px -12px rgb(var(--shadow-color) / 0.35), 0 0 0 1px rgb(var(--line) / 1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-subtle": "cubic-bezier(0.34, 1.3, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "hero-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "hero-tilt-in": {
          "0%": { opacity: "0", transform: "perspective(1200px) translateY(28px) rotateX(8deg)" },
          "100%": { opacity: "1", transform: "perspective(1200px) translateY(0) rotateX(0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up-fade": "slide-up-fade 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s infinite linear",
        // CSS (not JS) entrances for above-the-fold content, so it shows before hydration
        "hero-in": "hero-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "hero-tilt-in": "hero-tilt-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
