/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '360px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        success: {
          50: '#F0FDF4',
          600: '#16A34A',
        },
        warning: {
          50: '#FFFBEB',
          300: '#FCD34D',
          500: '#F59E0B',
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          600: '#0891B2',
        },
        task: {
          pending: '#737373',
          'in-progress': '#0891B2',
          blocked: '#F59E0B',
          escalated: '#DC2626',
          completed: '#16A34A',
          reviewed: '#2563EB',
        },
        rescue: {
          'soft-reminder': '#FCD34D',
          warning: '#F59E0B',
          'high-risk': '#EF4444',
          'admin-escalation': '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['28px', { lineHeight: '36px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-strong': ['14px', { lineHeight: '22px', fontWeight: '600' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        overline: [
          '11px',
          {
            lineHeight: '16px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          },
        ],
        button: ['14px', { lineHeight: '20px', fontWeight: '600' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      width: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
        fab: '56px',
      },
      maxWidth: {
        content: '1280px',
        'content-wide': '1440px',
        auth: '400px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        elevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        fab: '0 4px 12px rgba(37, 99, 235, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        check: 'check 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        check: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
