/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fbeaf4',
          100: '#f7d4e8',
          200: '#efb3d4',
          300: '#e489c0',
          400: '#d86bae',
          500: '#c85b9d',
          600: '#a44784',
          700: '#7f3665',
          800: '#5f294b',
          900: '#431c35',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark:    '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-in':  'slideIn 0.3s ease-out',
        float:       'float 8s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateY(-10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
