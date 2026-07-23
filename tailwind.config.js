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
          50: '#fefbf5',
          100: '#fdf0de',
          200: '#fae0c2',
          300: '#f6c694',
          400: '#f2a65e',
          500: '#D4AF37',
          600: '#c49a2e',
          700: '#a37d25',
          800: '#82631e',
          900: '#695019',
        },
        rose: {
          400: '#e8a0b0',
          500: '#d4839a',
        },
        dark: {
          50: '#ffffff',
          100: '#f0f0f0',
          200: '#d8d8d8',
          300: '#b8b8b8',
          400: '#909090',
          500: '#6b6b6b',
          600: '#525252',
          700: '#3d3d3d',
          800: '#1a1a1a',
          900: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
