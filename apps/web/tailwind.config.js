/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pig: {
          50: '#FFF0F5',
          100: '#FFD6E2',
          200: '#FFADCB',
          300: '#FF85B3',
          400: '#FF5C9B',
          500: '#FF4781',
          600: '#E63570',
          700: '#C4285C',
          800: '#9F1F4A',
          900: '#7A1738',
        },
        sun: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE588',
          300: '#FFD24D',
          400: '#FFC026',
          500: '#FFCC00',
          600: '#E6B800',
          700: '#B38F00',
        },
        cream: {
          50: '#FFFCF7',
          100: '#FFF7E8',
          200: '#FFEFD0',
        },
        ink: {
          50: '#F4F6FA',
          100: '#E1E5EE',
          500: '#4A5874',
          700: '#2E3850',
          900: '#1A2138',
        },
        sea: {
          50: '#E6F3F7',
          100: '#C2E2EA',
          300: '#7AC2D2',
          500: '#3FA0B5',
          700: '#1F7080',
          900: '#0E4853',
        },
        grass: {
          100: '#DDF6CB',
          400: '#95D66B',
          500: '#7AC74F',
          600: '#5BA937',
          700: '#3F8523',
        },
        chili: {
          500: '#E74C3C',
          700: '#B53A2C',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        bubble: '20px',
        soft: '12px',
      },
      boxShadow: {
        card: '0 4px 0 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
