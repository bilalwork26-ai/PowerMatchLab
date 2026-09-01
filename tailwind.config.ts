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
      },
    },
  },
  plugins: [],
};

export default config;
