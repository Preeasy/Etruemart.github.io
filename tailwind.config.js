/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5f0',
          100: '#c8e8da',
          200: '#a3d6c2',
          300: '#6ec4a5',
          400: '#3ba87e',
          500: '#2a9d6e',
          600: '#1a7a5e',
          700: '#145a43',
          800: '#0a3d2e',
          900: '#052a1f',
        },
        accent: {
          50: '#fff9e6',
          100: '#fff0b3',
          200: '#ffe680',
          300: '#ffd94d',
          400: '#ffcc1a',
          500: '#d4a017',
          600: '#c99700',
          700: '#b8860b',
          800: '#8b6914',
          900: '#5c450e',
        },
        dark: {
          50: '#f5f0e6',
          100: '#e8dcc8',
          200: '#d4c4a8',
          300: '#b8a888',
          400: '#9c8c68',
          500: '#2a2a2a',
          600: '#1e1e1e',
          700: '#181818',
          800: '#121212',
          900: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
