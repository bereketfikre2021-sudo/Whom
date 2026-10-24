/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans Ethiopic"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          burgundy: '#561836',
          'burgundy-light': '#7a2450',
          'burgundy-dark': '#3d1028',
          offwhite: '#FEFEFE',
          muted: '#F7F0F2',
          accent: '#F0E8EB',
          primary: '#561836',
          background: '#FEFEFE',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0,0,0,0.08), 0 4px 16px -4px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px -4px rgba(86,24,54,0.12), 0 4px 12px -4px rgba(0,0,0,0.08)',
        'modal': '0 25px 50px -12px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}
