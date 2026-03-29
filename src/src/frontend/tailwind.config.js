import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
        // UrbanPulse Hawaiian brand colors
        ocean: {
          900: "#0a1628",
          800: "#0d1f3c",
          700: "#0e263a",
          600: "#122e46",
        },
        coral: {
          DEFAULT: "#FF6B35",
          400: "#ff8555",
          500: "#FF6B35",
          600: "#e55a25",
        },
        teal: {
          DEFAULT: "#00C9B1",
          400: "#33d4bf",
          500: "#00C9B1",
        },
        sand: {
          DEFAULT: "#FFD166",
          400: "#ffda80",
        },
        amber: {
          DEFAULT: "#f59e0b",
          400: "#fbbf24",
          500: "#f59e0b",
        },
        electricCyan: {
          DEFAULT: "#00d4ff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        glass: "0 12px 40px rgba(0,0,0,0.45)",
        coral: "0 0 20px rgba(255,107,53,0.35), 0 0 40px rgba(255,107,53,0.15)",
        amber: "0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)",
        cyan: "0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.15)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "marker-drop": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "60%": { transform: "translateY(4px)", opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-coral": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,107,53,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255,107,53,0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "glow-pulse-amber": {
          "0%, 100%": {
            boxShadow:
              "0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 30px rgba(245,158,11,0.7), 0 0 60px rgba(245,158,11,0.35)",
          },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marker-drop":
          "marker-drop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "fade-up": "fade-up 0.4s ease-out forwards",
        "pulse-coral": "pulse-coral 2s ease-in-out infinite",
        "pulse-amber": "pulse-coral 2s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "glow-pulse-amber": "glow-pulse-amber 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
