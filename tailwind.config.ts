import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // Stacked Prompt Tab Bar animations
        "card-push": {
          "0%": { transform: "translateY(-20px) scale(0.9)", opacity: "0" },
          "60%": { transform: "translateY(4px) scale(1.01)", opacity: "1" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "card-appear": {
          "0%": { transform: "translateY(-10px) scale(0.95)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "card-disappear": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-10px) scale(0.95)", opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "card-push": "card-push 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "card-appear": "card-appear 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "card-disappear": "card-disappear 300ms ease-in both",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
}

export default config
