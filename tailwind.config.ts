import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#C8102E",
          dark: "#9E0C24",
          light: "#E8354F",
        },
        ink: {
          DEFAULT: "#1E2430",
          soft: "#2B3242",
        },
      },
    },
  },
  plugins: [],
};

export default config;
