/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        solfege: {
          do: '#EF4444',
          re: '#F97316',
          mi: '#EAB308',
          fa: '#22C55E',
          sol: '#3B82F6',
          la: '#6366F1',
          si: '#A855F7',
        },
      },
      fontFamily: {
        kid: ['"Comic Sans MS"', '"PingFang SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
