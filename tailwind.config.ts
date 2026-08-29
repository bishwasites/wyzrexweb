import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        muted: "var(--muted)",
        ink: "var(--ink)",
        "ink-deep": "var(--ink-deep)",
        "ink-fg": "var(--ink-fg)",
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          dark: "var(--gold-dark)",
        },
        // shadcn/ui-standard aliases, mapped onto our own tokens so
        // components pulled from shadcn's registry (bg-card, etc.) resolve
        // correctly instead of being no-ops.
        border: "var(--line)",
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--fg)",
        },
        "muted-foreground": "var(--muted)",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        card: "14px",
        "card-sm": "8px",
        control: "10px",
      },
      maxWidth: {
        container: "1400px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease forwards",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
