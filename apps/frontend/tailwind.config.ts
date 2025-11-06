// @ts-nocheck
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        primaryLight: "#E0ECFF",
        secondary: "#10B981",
        accent: "#F59E0B",
        neutralBg: "#F9FAFB",
      },
    },
  },
  plugins: [],
};

export default config;
