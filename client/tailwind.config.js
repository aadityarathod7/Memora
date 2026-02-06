/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF7',
          100: '#FFF9E6',
          200: '#FFF3CC',
          300: '#FFEDB3',
          400: '#FFE799',
          500: '#FFE180',
        },
        warm: {
          50: '#FDF8F3',
          100: '#F5E6D8',
          200: '#E8D0B8',
          300: '#D4A574',
          400: '#C4956A',
          500: '#A67B5B',
          600: '#8B6347',
          700: '#704D35',
          800: '#553A28',
          900: '#3A271B',
        },
        terracotta: {
          400: '#E07B54',
          500: '#D66A43',
          600: '#C45A33',
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(139, 99, 71, 0.1)',
        'warm': '0 8px 30px rgba(139, 99, 71, 0.15)',
      }
    },
  },
  plugins: [],
}
