import type { Config } from "tailwindcss";

/**
 * Skylark design tokens.
 *
 * The palette comes from the team's existing identity: blue carries the brand,
 * orange is an accent used for hierarchy and never as a wash, and body copy sits
 * on warm off-white rather than pure white so long passages stay readable
 * against dark grounds.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#050A1F", // deepest ground, used behind the flight scene
          800: "#080E26",
          700: "#0B1230", // panel ground
          600: "#111A3F",
          500: "#1A2550",
        },
        skylark: {
          700: "#0E1C5E",
          600: "#152A8A", // brand blue
          500: "#2A42B8",
          400: "#4C66DD",
        },
        ember: {
          600: "#D94E1F", // deep orange, from the logo's lower wing
          500: "#FF7A00", // accent orange
          400: "#FF9633",
          300: "#FFB866",
        },
        ivory: {
          50: "#FAF9F6",
          100: "#F2F0EA", // primary reading colour
          200: "#DEDBD2",
          300: "#B8B4A8",
        },
        slate: {
          400: "#9CA3AF", // metadata, captions
          500: "#6B7280",
        },
        ink: "#111318",
      },
      fontFamily: {
        sans: ["var(--font-text)", "system-ui", "sans-serif"],
        head: ["var(--font-display)", "var(--font-text)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Display sizes are set in condensed caps, so they take positive
        // tracking rather than the tight negative tracking a wide grotesk wants.
        display: ["clamp(3.25rem, 9vw, 9rem)", { lineHeight: "0.86", letterSpacing: "0.005em", fontWeight: "700" }],
        title: ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "0.9", letterSpacing: "0.01em", fontWeight: "700" }],
        heading: ["clamp(1.5rem, 2.6vw, 2.25rem)", { lineHeight: "1.02", letterSpacing: "0.015em", fontWeight: "600" }],
        sub: ["1.0625rem", { lineHeight: "1.45", fontWeight: "500" }],
        body: ["1.0625rem", { lineHeight: "1.6" }],
        caption: ["0.875rem", { lineHeight: "1.5" }],
        // Field names, section numbers, units.
        meta: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.16em", fontWeight: "500" }],
      },
      maxWidth: { measure: "62ch" },
      transitionTimingFunction: {
        // Motion should read as mass moving, not as UI easing.
        flight: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
