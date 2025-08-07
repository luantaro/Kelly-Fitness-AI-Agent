import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel color palette
        pastel: {
          pink: "#FFE1E6",
          peach: "#FFE5D1",
          lavender: "#E8E1FF",
          mint: "#D1FFE1",
          sky: "#D1F0FF",
          cream: "#FFF8E1",
          sage: "#E1F5E1",
          rose: "#FFE1EB",
          violet: "#F0E1FF",
          aqua: "#E1F9FF",
        },
        // Dark pastel variants
        "pastel-dark": {
          pink: "#4A2C32",
          peach: "#4A3426",
          lavender: "#2E2A4A",
          mint: "#264A32",
          sky: "#26404A",
          cream: "#4A4526",
          sage: "#2A4A2A",
          rose: "#4A2632",
          violet: "#3B264A",
          aqua: "#264A4A",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-gentle": "pulseGentle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
