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
        // Primary: Deep Navy - 传达专业、可信
        navy: {
          50: '#f0f4fa',
          100: '#dce6f2',
          200: '#b8cce4',
          300: '#8aacd1',
          400: '#5a85b8',
          500: '#3a669e',
          600: '#2d4f80',
          700: '#1E3A5F',
          800: '#0F2A4A',
          900: '#081d36',
          950: '#050f1c',
        },
        // Accent: Refined Orange - 活力、转化
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Neutral: Premium warm grays
        ink: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        // Success/Status colors
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
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(15, 42, 74, 0.06), 0 4px 16px -4px rgba(15, 42, 74, 0.04)',
        'medium': '0 4px 12px -2px rgba(15, 42, 74, 0.08), 0 8px 24px -4px rgba(15, 42, 74, 0.06)',
        'premium': '0 10px 30px -8px rgba(15, 42, 74, 0.12), 0 20px 60px -12px rgba(15, 42, 74, 0.08)',
        'accent-glow': '0 8px 24px -4px rgba(249, 115, 22, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
