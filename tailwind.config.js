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
        gold: {
          50: '#fffcf5',
          100: '#fef3d7',
          200: '#fce5b3',
          300: '#f9d17a',
          400: '#f5b842',
          500: '#D4AF37',
          600: '#c49a2e',
          700: '#a37d25',
          800: '#82631e',
          900: '#695019',
        },
        dark: {
          50: '#ffffff',
          100: '#f8f8f8',
          200: '#e4e4e4',
          300: '#c8c8c8',
          400: '#a0a0a0',
          500: '#787878',
          600: '#5a5a5a',
          700: '#424242',
          800: '#2a2a2a',
          900: '#111111',
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
