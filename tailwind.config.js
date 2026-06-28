/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: '#3a4040',
        secondary: {
          DEFAULT: '#D4AF37',
          50: '#F7EED3',
          100: '#F3E5BE',
          200: '#EBD494',
          300: '#E3C36A',
          400: '#DCB241',
          500: '#D4AF37',
          600: '#A98B24',
          700: '#7D671B',
          800: '#514312',
          900: '#251F08',
        },
        accent: {
          light: '#92a188',
          DEFAULT: '#92a188',
          dark: '#748872',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slowZoom': 'slowZoom 20s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
        slowZoom: {
          '0%, 100%': { transform: 'scale(1.05)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(to right, #92a188, #748872)',
      },
    },
  },
  plugins: [],
};