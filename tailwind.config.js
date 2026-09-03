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
        // ========== NAVY → PINE GREEN — Brand, trust, Nordic editorial (Nordic Slate) ==========
        navy: {
          50:  '#F2F6F3',
          100: '#DFEBE3',
          200: '#C1D7C8',
          300: '#94B5A0',
          400: '#678D78',
          500: '#426A52',
          600: '#335740',
          700: '#284633',
          800: '#2D4A3A',  // pine brand primary (buttons, accents)
          900: '#1F3A2C',  // deep pine — headers / hero base
          950: '#14241B',
        },
        // ========== GOLD → AMBER — Warm detail accent (Scandi warmth) ==========
        gold: {
          50:  '#FBF6EC',
          100: '#F4E8CC',
          200: '#E8D29A',
          300: '#D9B368',
          400: '#CB9B45',
          500: '#C68B3B',  // amber primary
          600: '#A5712C',
          700: '#835823',
          800: '#62431B',
          900: '#4A3316',
        },
        // ========== CORAL → GRAPHITE / INK — Single near-black CTA + price (mono) ==========
        coral: {
          50:  '#F3F3F1',
          100: '#E7E7E4',
          200: '#D0D0CC',
          300: '#A6A6A0',
          400: '#54554F',
          500: '#2A2B2D',  // ink — price / CTA primary
          600: '#1F2022',
          700: '#161719',
          800: '#0F1011',
          900: '#08090A',
        },
        // ========== SAND → COOL PAPER — Mist neutrals (Scandinavian paper) ==========
        sand: {
          50:  '#F4F5F3',   // Cool Paper — default page background
          100: '#ECEDE9',   // section separator band
          200: '#D8DAD6',   // Mist — card border
          300: '#C1C4BE',
          400: '#9DA096',
        },
        // ========== INK — Cool text shades (never warm) ==========
        ink: {
          50:  '#F7F8F6',
          100: '#EFF0ED',
          200: '#E0E1DD',
          300: '#C9CAC5',
          400: '#8E9089',
          500: '#6C6E72',  // Stone — secondary text
          600: '#4A4C50',
          700: '#34363A',
          800: '#1B1C1E',  // Ink — body text
          900: '#111216',  // headings / darkest
        },
        // Legacy aliases (for old pages that still reference them) → remapped to graphite
        accent: {
          50:  '#F3F3F1', 100: '#E7E7E4', 200: '#D0D0CC', 300: '#A6A6A0',
          400: '#54554F', 500: '#2A2B2D', 600: '#1F2022', 700: '#161719',
          800: '#0F1011', 900: '#08090A',
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
        // B2B refined, not too harsh, not too flat — pine/amber/graphite based
        'paper':      '0 1px 2px rgba(31, 58, 44, 0.04), 0 1px 3px rgba(31, 58, 44, 0.03)',
        'card':       '0 2px 6px rgba(31, 58, 44, 0.04), 0 4px 16px rgba(31, 58, 44, 0.04)',
        'card-lg':    '0 4px 14px rgba(31, 58, 44, 0.06), 0 16px 40px rgba(31, 58, 44, 0.06)',
        'card-hover': '0 10px 30px rgba(31, 58, 44, 0.10), 0 3px 10px rgba(31, 58, 44, 0.05)',
        'premium':    '0 18px 50px rgba(31, 58, 44, 0.12), 0 6px 18px rgba(31, 58, 44, 0.06)',
        'gold-glow':  '0 8px 24px rgba(198, 139, 59, 0.20), 0 2px 8px rgba(198, 139, 59, 0.08)',
        'navy-glow':  '0 12px 32px rgba(45, 74, 58, 0.15), 0 4px 12px rgba(45, 74, 58, 0.08)',
        'coral-glow': '0 10px 28px rgba(42, 43, 45, 0.22), 0 3px 10px rgba(42, 43, 45, 0.08)',
      },
      backgroundImage: {
        // Nordic editorial gradients — Deep Pine + Amber + Graphite
        'hero-gradient':
          'radial-gradient(1200px 500px at 0% 0%, rgba(198,139,59,0.10) 0%, transparent 60%), linear-gradient(135deg, #14241B 0%, #1F3A2C 50%, #2D4A3A 100%)',
        'hero-texture':
          'radial-gradient(900px 380px at 90% 10%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(600px 260px at 10% 100%, rgba(198,139,59,0.16) 0%, transparent 60%)',
        'cta-gradient':
          'linear-gradient(135deg, #1F3A2C 0%, #2D4A3A 45%, #C68B3B 200%)',
        'gold-border':
          'linear-gradient(135deg, #D9B368 0%, #C68B3B 100%)',
        'trust-stripe':
          'linear-gradient(90deg, #ECEDE9 0%, #F4F5F3 30%, #ECEDE9 70%, #D8DAD6 100%)',
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
