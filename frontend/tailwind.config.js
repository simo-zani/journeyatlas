/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      colors: {
        // Premium Blue & Gold Palette (kept — only its application changes)
        'deep-blue': '#003366',
        'light-blue': '#4A90E2',
        'gold': '#D4AF37',
        'gold-light': '#E8CC6D',
        'gold-dark': '#A9821F',
        'cream': '#F6F3ED',
        'dark-navy': '#0A0E1A',

        // Semantic colors (inherit defaults, but add custom names)
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        // Editorial serif used sparingly for hero/display headings — the
        // contrast against the clean sans UI is what reads as "premium"
        // rather than generic dashboard.
        'display': ['Fraunces', 'ui-serif', 'serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
      },
      borderRadius: {
        'none': '0',
        'sm': '6px',
        'base': '8px',
        'md': '10px',
        'lg': '14px',
        // The app's single "brand radius" constant — cards, modals, tab
        // pills, filter pills and flag chips all use `rounded-xl` so every
        // rounded corner in the app reads as one consistent system. Change
        // it here once instead of touching each component.
        'xl': '20px',
        '2xl': '28px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'base': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'md': '0 6px 16px -4px rgba(15, 23, 42, 0.12), 0 3px 6px -3px rgba(15, 23, 42, 0.08)',
        'lg': '0 20px 40px -12px rgba(15, 23, 42, 0.18), 0 8px 16px -8px rgba(15, 23, 42, 0.1)',
        'xl': '0 30px 60px -15px rgba(15, 23, 42, 0.25), 0 12px 24px -8px rgba(15, 23, 42, 0.12)',
        'glow-gold': '0 0 0 1px rgba(212, 175, 55, 0.25), 0 8px 24px -4px rgba(212, 175, 55, 0.25)',
      },
      transitionTimingFunction: {
        // "ease-out-expo" — the snappy-then-settle curve used across most
        // premium product UI for hovers, modals and page transitions.
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '350': '350ms',
        '450': '450ms',
      },
      animation: {
        'fade-in': 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'rise-in': 'riseIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        riseIn: {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
