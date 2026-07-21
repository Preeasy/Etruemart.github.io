import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "amazon-blue": "#131921",
        "amazon-dark-blue": "#232f3e",
        "amazon-orange": "#febd69",
        "amazon-yellow": "#fcd200",
        "amazon-light-gray": "#f3f3f3",
      },
    },
  },
  plugins: [],
};
export default config;
