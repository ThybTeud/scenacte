/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          50: '#FFE8E1',
          100: '#FFD4C7',
          200: '#FFAD94',
          300: '#FF8661',
          400: '#FF6B35',
          500: '#FF4D0D',
          600: '#D43700',
          700: '#9C2800',
          800: '#641900',
          900: '#2C0B00',
        },
      },
    },
  },
  plugins: [],
}
