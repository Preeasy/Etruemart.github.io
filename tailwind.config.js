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
        // ========== NAVY → DEEP INDIGO — Trust, Stability, Enterprise-grade (Atelier Commerce) ==========
        navy: {
          50:  '#F3F5F9',
          100: '#E4E9F1',
          200: '#C7D2E3',
          300: '#9DB0CE',
          400: '#6E88B3',
          500: '#4A6699',
          600: '#38517C',
          700: '#2C3F62',
          800: '#232F4E',
          900: '#1E2A52',  // brand primary
          950: '#131C38',
        },
        // ========== GOLD → ANTIQUE BRASS — Muted, aged metal, EU luxury detail ==========
        gold: {
          50:  '#FAF6EE',
          100: '#F2E9D6',
          200: '#E4D2AD',
          300: '#D4B87E',
          400: '#C5A165',
          500: '#B08D57',  // brass primary
          600: '#94743F',
          700: '#765B30',
          800: '#5C4724',
          900: '#47361E',
        },
        // ========== CORAL → TERRACOTTA — Single warm CTA action color ==========
        coral: {
          50:  '#FBF2EE',
          100: '#F5DDD2',
          200: '#EBBAA5',
          300: '#DD9276',
          400: '#CC7D5C',
          500: '#C26B4F',  // CTA primary
          600: '#A5553C',
          700: '#844430',
          800: '#663526',
          900: '#4F2A1E',
        },
        // ========== SAND → BONE / LINEN — Warm paper neutrals ==========
        sand: {
          50:  '#F7F4EE',   // Bone Paper — default page background
          100: '#F1EBDE',   // section separator band
          200: '#E4DCCB',   // Linen — card border
          300: '#D3C7A8',
          400: '#BDA86E',
        },
        // ========== INK — Warm text shades (near-black, never cold) ==========
        ink: {
          50:  '#FAF8F4',
          100: '#F2EFE8',
          200: '#E4E0D7',
          300: '#CFC9BC',
          400: '#9F9C93',
          500: '#6B6860',  // Stone — secondary text
          600: '#4A4842',
          700: '#34332F',
          800: '#1F1E1B',  // Ink — body text
          900: '#131210',  // headings / darkest
        },
        // Legacy aliases (for old pages that still reference them) → remapped to terracotta
        accent: {
          50:  '#FBF2EE', 100: '#F5DDD2', 200: '#EBBAA5', 300: '#DD9276',
          400: '#CC7D5C', 500: '#C26B4F', 600: '#A5553C', 700: '#844430',
          800: '#663526', 900: '#4F2A1E',
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
        // B2B refined, not too harsh, not too flat — indigo/brass based
        'paper':      '0 1px 2px rgba(30, 42, 82, 0.04), 0 1px 3px rgba(30, 42, 82, 0.03)',
        'card':       '0 2px 6px rgba(30, 42, 82, 0.04), 0 4px 16px rgba(30, 42, 82, 0.04)',
        'card-lg':    '0 4px 14px rgba(30, 42, 82, 0.06), 0 16px 40px rgba(30, 42, 82, 0.06)',
        'card-hover': '0 10px 30px rgba(30, 42, 82, 0.10), 0 3px 10px rgba(30, 42, 82, 0.05)',
        'premium':    '0 18px 50px rgba(30, 42, 82, 0.12), 0 6px 18px rgba(30, 42, 82, 0.06)',
        'gold-glow':  '0 8px 24px rgba(176, 141, 87, 0.20), 0 2px 8px rgba(176, 141, 87, 0.08)',
        'navy-glow':  '0 12px 32px rgba(30, 42, 82, 0.15), 0 4px 12px rgba(30, 42, 82, 0.08)',
        'coral-glow': '0 10px 28px rgba(194, 107, 79, 0.22), 0 3px 10px rgba(194, 107, 79, 0.08)',
      },
      backgroundImage: {
        // Luxury editorial gradients — Deep Indigo + Antique Brass
        'hero-gradient':
          'radial-gradient(1200px 500px at 0% 0%, rgba(176,141,87,0.10) 0%, transparent 60%), linear-gradient(135deg, #131C38 0%, #1E2A52 50%, #2C3F62 100%)',
        'hero-texture':
          'radial-gradient(900px 380px at 90% 10%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(600px 260px at 10% 100%, rgba(176,141,87,0.16) 0%, transparent 60%)',
        'cta-gradient':
          'linear-gradient(135deg, #1E2A52 0%, #2C3F62 45%, #B08D57 200%)',
        'gold-border':
          'linear-gradient(135deg, #D4B87E 0%, #B08D57 100%)',
        'trust-stripe':
          'linear-gradient(90deg, #F1EBDE 0%, #F7F4EE 30%, #F1EBDE 70%, #E4DCCB 100%)',
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
