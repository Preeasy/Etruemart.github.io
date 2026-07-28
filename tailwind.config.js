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
        navy: {
          50: '#f5f7fa',
          100: '#e8ecf1',
          200: '#d1d9e2',
          300: '#a8b8cc',
          400: '#7a93b5',
          500: '#5a789e',
          600: '#415a80',
          700: '#2d4263',
          800: '#1a2d47',
          900: '#0f1f32',
          950: '#081424',
        },
        accent: {
          50: '#fef7f0',
          100: '#fdebe0',
          200: '#fbd7c0',
          300: '#f8bfa0',
          400: '#f49f75',
          500: '#f0834c',
          600: '#e6662b',
          700: '#c44c20',
          800: '#a03f1f',
          900: '#83381d',
        },
        ink: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.03)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 30px rgba(0, 0, 0, 0.08), 0 20px 60px rgba(0, 0, 0, 0.06)',
        'accent-glow': '0 4px 16px rgba(230, 102, 43, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
