import type { Config } from "tailwindcss";

/**
 * PowerMatchLab design tokens.
 * Identity: dark navy + PowerMatchLab blue, white/light data surfaces,
 * green positive status, yellow/orange Amazon CTA.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0b1f3a",
          50: "#f2f5fa",
          100: "#dbe4f0",
          200: "#b7c8e0",
          300: "#8aa5cb",
          400: "#5a7bae",
          500: "#3a5a90",
          600: "#2b4472",
          700: "#22375c",
          800: "#152747",
          900: "#0b1f3a",
          950: "#061428",
        },
        brand: {
          DEFAULT: "#1c6dd0",
          50: "#eef5fe",
          100: "#d9e8fc",
          200: "#b6d2f8",
          300: "#86b4f1",
          400: "#4f8ee6",
          500: "#1c6dd0",
          600: "#1657ac",
          700: "#14488c",
          800: "#153e74",
          900: "#153561",
        },
        positive: {
          DEFAULT: "#16a34a",
          50: "#effaf2",
          100: "#d8f3e0",
          500: "#16a34a",
          600: "#128040",
          700: "#0f6634",
        },
        amazon: {
          DEFAULT: "#febd69",
          hover: "#f3a847",
          text: "#0f1111",
          ink: "#232f3e",
        },
        warn: {
          DEFAULT: "#d97706",
          50: "#fff7ed",
          100: "#ffedd5",
        },
        /** Electric cyan accent — energy/data highlight color for the 3D tech theme. */
        cyan: {
          DEFAULT: "#22d3ee",
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 31, 58, 0.06), 0 8px 24px rgba(11, 31, 58, 0.06)",
        "card-hover": "0 4px 10px rgba(11, 31, 58, 0.08), 0 16px 32px rgba(11, 31, 58, 0.12)",
        "glow-brand": "0 0 0 1px rgba(28, 109, 208, 0.35), 0 8px 30px rgba(28, 109, 208, 0.25)",
        "glow-cyan": "0 0 0 1px rgba(34, 211, 238, 0.3), 0 8px 30px rgba(34, 211, 238, 0.2)",
        "glow-soft": "0 0 40px rgba(34, 211, 238, 0.15)",
        "inner-line": "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(11,31,58,0) 0%, rgba(11,31,58,1) 85%), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px)",
        "radial-glow-cyan":
          "radial-gradient(circle at center, rgba(34,211,238,0.35) 0%, rgba(34,211,238,0) 70%)",
        "radial-glow-brand":
          "radial-gradient(circle at center, rgba(28,109,208,0.4) 0%, rgba(28,109,208,0) 70%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-200" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "count-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "dash-flow": "dash-flow 6s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        "count-in": "count-in 0.4s ease-out both",
        marquee: "marquee 32s linear infinite",
        shimmer: "shimmer 5s linear infinite",
        "shimmer-slow": "shimmer 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
