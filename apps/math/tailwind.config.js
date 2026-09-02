/** @type {import('tailwindcss').Config} */
// 与语文应用同一套佩奇风格设计系统（高饱和粉 + 圆润 + 活泼）
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pig: {
          50:  '#FFF1F4',
          100: '#FFE0E8',
          200: '#FFC2D1',
          300: '#FF99B5',
          400: '#FF7099',
          500: '#FF4781',
          600: '#E83467',
          700: '#C42354',
        },
        sky: {
          50:  '#EFF8FF',
          100: '#DBEEFE',
          200: '#B7DDFD',
          400: '#4FB3FB',
          500: '#1E96F7',
          600: '#0D7AD9',
          700: '#0A5FA8',
        },
        sun: {
          50:  '#FFFBEB',
          100: '#FFF3C4',
          300: '#FFE066',
          500: '#FFCC00',
          600: '#F0B400',
          700: '#C79300',
        },
        grass: {
          50:  '#F0FBE8',
          100: '#DDF6CB',
          500: '#7AC74F',
          600: '#5BA937',
          700: '#3F8523',
        },
        chili: {
          50:  '#FFF1ED',
          500: '#FF6B3D',
          600: '#E54E1F',
        },
        cream: {
          50: '#FFFAF0',
          100: '#FFF7E8',
          200: '#FFEED1',
        },
        ink: {
          900: '#2D1B2E',
          700: '#4A3645',
          500: '#7A6577',
        },
      },
      fontFamily: {
        kid: ['"Comic Sans MS"', '"PingFang SC"', '"Hiragino Sans GB"', 'sans-serif'],
      },
      borderRadius: {
        'soft': '1.5rem',
        'bubble': '2rem',
        'pill': '9999px',
      },
      boxShadow: {
        'bubble':   '0 4px 0 rgba(255, 71, 129, 0.15), 0 8px 24px rgba(255, 71, 129, 0.18)',
        'sky':      '0 4px 0 rgba(30, 150, 247, 0.15), 0 8px 24px rgba(30, 150, 247, 0.18)',
        'grass':    '0 4px 0 rgba(122, 199, 79, 0.20), 0 8px 24px rgba(122, 199, 79, 0.18)',
        'card':     '0 2px 0 rgba(45, 27, 46, 0.04), 0 6px 18px rgba(45, 27, 46, 0.08)',
        'lift':     '0 2px 0 rgba(45, 27, 46, 0.04), 0 12px 32px rgba(45, 27, 46, 0.12)',
      },
    },
  },
  plugins: [],
}
