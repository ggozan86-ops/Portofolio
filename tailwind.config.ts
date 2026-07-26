import type { Config } from "tailwindcss";

/**
 * Tailwind theme configuration.
 *
 * This is the single source of truth for the visual design tokens described
 * in the design brief: background colors, accent colors, type scale, and the
 * spacing/animation primitives that every future section will build on.
 *
 * Colors are exposed as CSS variables in `globals.css` and referenced here,
 * so the same token can be reused in plain CSS (e.g. gradients) without
 * duplicating hex values in two places.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        background: {
          DEFAULT: "var(--color-background)", // #09090B
          secondary: "var(--color-background-secondary)", // #111827
        },
        foreground: {
          DEFAULT: "var(--color-foreground)", // white
          muted: "var(--color-foreground-muted)",
          subtle: "var(--color-foreground-subtle)",
        },
        // Accents
        accent: {
          blue: "var(--color-accent-blue)", // soft blue
          purple: "var(--color-accent-purple)", // soft purple
        },
        border: {
          DEFAULT: "var(--color-border)",
          hover: "var(--color-border-hover)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Strong, intentional type scale (major-third-ish ratio).
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.55" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.375rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
        "7xl": ["4.5rem", { lineHeight: "1.02" }],
      },
      spacing: {
        // Section-level spacing scale used by the spacing system utilities.
        "section-sm": "4rem",
        "section-md": "6rem",
        "section-lg": "8rem",
        "section-xl": "10rem",
      },
      maxWidth: {
        container: "1280px",
        "container-narrow": "960px",
        "container-wide": "1440px",
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
      },
      keyframes: {
        // GPU-friendly: only `transform` and `opacity` are animated.
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out both",
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-scale": "fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
