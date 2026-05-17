import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          50: "#f4f6ee",
          100: "#e5ead3",
          200: "#c5d0a5",
          300: "#a3b576",
          400: "#889e52",
          500: "#7d8e4a",
          600: "#687840",
          700: "#536031",
          800: "#3f4a25",
          900: "#2d361a",
          950: "#1c2210",
        },
        gold: {
          400: "#C9A227",
          500: "#B08018",
          600: "#936B0E",
        },
        terracotta: {
          400: "#c46235",
          500: "#b55228",
          600: "#9a4420",
        },
        cream: "#f0ebe3",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
