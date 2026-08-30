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
        // ========== NAVY BRAND — Trust, Stability, Enterprise-grade ==========
        navy: {
          50:  '#F3F6FB',
          100: '#E5ECF5',
          200: '#C9D6E8',
          300: '#9FB6D4',
          400: '#6D8EBA',
          500: '#496DA0',
          600: '#365686',
          700: '#2A4469',
          800: '#1A2D4A',
          900: '#0F1E33',
          950: '#081324',
        },
        // ========== GOLD ACCENT — Premium, Quality, Middle Eastern/African prosperity vibes ==========
        gold: {
          50:  '#FBF7EC',
          100: '#F5EBCF',
          200: '#EBD59B',
          300: '#DFB860',
          400: '#D19F3D',
          500: '#B8860B',
          600: '#9A6F08',
          700: '#7A5908',
          800: '#5C440B',
          900: '#47360E',
        },
        // ========== CORAL CTA — Energetic, Action, Commerce ==========
        coral: {
          50:  '#FFF5F0',
          100: '#FFE3D4',
          200: '#FFC1A3',
          300: '#FF9768',
          400: '#F46C38',
          500: '#E84A1E',
          600: '#C93411',
          700: '#A22611',
          800: '#7F2014',
          900: '#621D14',
        },
        // ========== SAND / WARM NEUTRAL — Global markets warm palette ==========
        sand: {
          50:  '#FAF7F2',   // default page background
          100: '#F3EDDF',   // section separator band
          200: '#E8DEC4',   // card border
          300: '#D9C89A',
          400: '#C4AB68',
        },
        // ========== INK — Text shades ==========
        ink: {
          50:  '#FAFAF9',
          100: '#F5F5F3',
          200: '#E8E6E1',
          300: '#D3D0C9',
          400: '#9F9C93',
          500: '#6B6860',
          600: '#4A4842',
          700: '#34332F',
          800: '#1F1E1B',
          900: '#11100E',
        },
        // Legacy aliases (for old pages that still reference them)
        accent: {
          50:  '#FFF5F0', 100: '#FFE3D4', 200: '#FFC1A3', 300: '#FF9768',
          400: '#F46C38', 500: '#E84A1E', 600: '#C93411', 700: '#A22611',
          800: '#7F2014', 900: '#621D14',
        },
        success: {
          50:  '#EEFBF2',
          100: '#D5F6DE',
          200: '#ABE8BB',
          300: '#73D28D',
          400: '#3EB55F',
          500: '#1A9940',
          600: '#107A32',
          700: '#0C5F28',
          800: '#0B4A21',
          900: '#083B1B',
        },
        info: {
          50: '#EEF5FD',
          100: '#D8E9FA',
          500: '#2F6FB5',
          600: '#1F5B9D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        // For elegant section titles - Middle East / EU luxury market appeal
        serif: ['"Playfair Display"', 'Georgia', 'Noto Serif', 'serif'],
        // Distinctive Arabic/MENA-friendly fallback
        emirati: ['"Noto Sans Arabic"', '"Tajawal"', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'display-1': ['3.5rem', { lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700 }],
        'display-2': ['2.75rem', { lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 700 }],
        'display-3': ['2.25rem', { lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 600 }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        // B2B refined, not too harsh, not too flat
        'paper':      '0 1px 2px rgba(15, 30, 51, 0.04), 0 1px 3px rgba(15, 30, 51, 0.03)',
        'card':       '0 2px 6px rgba(15, 30, 51, 0.04), 0 4px 16px rgba(15, 30, 51, 0.04)',
        'card-lg':    '0 4px 14px rgba(15, 30, 51, 0.06), 0 16px 40px rgba(15, 30, 51, 0.06)',
        'card-hover': '0 10px 30px rgba(15, 30, 51, 0.10), 0 3px 10px rgba(15, 30, 51, 0.05)',
        'premium':    '0 18px 50px rgba(15, 30, 51, 0.12), 0 6px 18px rgba(15, 30, 51, 0.06)',
        'gold-glow':  '0 8px 24px rgba(184, 134, 11, 0.20), 0 2px 8px rgba(184, 134, 11, 0.08)',
        'navy-glow':  '0 12px 32px rgba(26, 45, 74, 0.15), 0 4px 12px rgba(26, 45, 74, 0.08)',
        'coral-glow': '0 10px 28px rgba(232, 74, 30, 0.22), 0 3px 10px rgba(232, 74, 30, 0.08)',
      },
      backgroundImage: {
        // Luxury editorial gradients
        'hero-gradient':
          'radial-gradient(1200px 500px at 0% 0%, rgba(184,134,11,0.10) 0%, transparent 60%), linear-gradient(135deg, #0F1E33 0%, #1A2D4A 50%, #2A4469 100%)',
        'hero-texture':
          'radial-gradient(900px 380px at 90% 10%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(600px 260px at 10% 100%, rgba(184,134,11,0.16) 0%, transparent 60%)',
        'cta-gradient':
          'linear-gradient(135deg, #1A2D4A 0%, #2A4469 45%, #B8860B 200%)',
        'gold-border':
          'linear-gradient(135deg, #DFB860 0%, #B8860B 100%)',
        'trust-stripe':
          'linear-gradient(90deg, #F3EDDF 0%, #FAF7F2 30%, #F3EDDF 70%, #E8DEC4 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out both',
        'slide-up':   'slideUp 0.5s ease-out both',
        'fade-slow':  'fadeIn 0.8s ease-out both',
        'float-y':    'floatY 5s ease-in-out infinite',
        'shine':      'shine 2.6s linear infinite',
        'marquee':    'marquee 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shine: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
