/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#fff2fb",
          100: "#ffe1f6",
          200: "#ffc2ee",
          300: "#ffa8e6",
          400: "#ff90e8",
          DEFAULT: "#ff90e8",
          hover: "#f962dd",
          600: "#f13fce",
          700: "#c41ea8",
        },
      },
      fontFamily: {
        sans: [
          "Inter var",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        card: "0 1px 2px 0 rgb(15 23 42 / 0.03), 0 8px 24px -8px rgb(15 23 42 / 0.10)",
        "card-hover": "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 16px 32px -12px rgb(15 23 42 / 0.16)",
        brut: "3px 3px 0 0 #000",
        "brut-sm": "2px 2px 0 0 #000",
        "brut-lg": "6px 6px 0 0 #000",
        "brut-pink": "3px 3px 0 0 #000",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
