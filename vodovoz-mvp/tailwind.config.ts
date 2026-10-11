import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Фирменная палитра «Водовоз»: глубокий «ночной» индиго + чистая аква
        ink: {
          50: "#F4F7FB",
          100: "#E8EEF6",
          200: "#D3DCE9",
          300: "#AEBBD0",
          400: "#7F8FAA",
          500: "#5A6B88",
          600: "#3F4F6C",
          700: "#2B3A56",
          800: "#1A2740",
          900: "#0D172B",
        },
        aqua: {
          50: "#EBF7FF",
          100: "#D3EEFF",
          200: "#A8DCFF",
          300: "#6FC4FF",
          400: "#33A6FB",
          500: "#0A88F0",
          600: "#006CD1",
          700: "#0056A8",
          800: "#06488A",
          900: "#0B3C71",
        },
        mint: {
          50: "#E9FBF6",
          100: "#C9F4E7",
          400: "#2DD4A8",
          500: "#14B890",
          600: "#0B9675",
        },
        coral: {
          50: "#FFF1EF",
          100: "#FFDCD6",
          500: "#F2553D",
          600: "#D63E27",
        },
        sun: {
          50: "#FFF8E8",
          100: "#FFEDC2",
          500: "#F5A524",
          600: "#D98A0B",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Unbounded", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(13,23,43,.04), 0 8px 24px -6px rgba(13,23,43,.08)",
        lift: "0 2px 4px rgba(13,23,43,.04), 0 18px 40px -12px rgba(13,23,43,.18)",
        glow: "0 10px 30px -8px rgba(10,136,240,.55)",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(.6)", opacity: ".7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        wave: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        ripple: "ripple 2.2s cubic-bezier(.2,.6,.3,1) infinite",
        "slide-up": "slide-up .35s cubic-bezier(.2,.8,.2,1) both",
        "fade-in": "fade-in .25s ease-out both",
        wave: "wave 3s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
