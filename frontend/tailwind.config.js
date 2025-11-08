/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cbnu-red': '#B72654',
        'warm-white': '#FAFAFA',
        'pure-white': '#FFFFFF',
        'charcoal': '#222222',
        'cool-gray': '#6B7280',
        'accent-mint': '#A7F3D0',
        'focus-ring': '#94A3B8',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        'dawangi': '20px',
      },
      boxShadow: {
        'dawangi': '0 8px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
