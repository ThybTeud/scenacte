/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du design system neobrutalist
        cream: '#F5E6D3',
        orange: '#FF9933',
        violet: '#2D1B69',
        black: '#1a1a1a',
        'accent-hover': '#E68A2E',

        // Sémantiques (gardées pour compatibilité legacy)
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        ui: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        theater: ['Crimson Text', 'Georgia', 'serif'],
        editor: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        brutal: '4px',
      },
      boxShadow: {
        brutal: '4px 4px 0 #1a1a1a',
        'brutal-sm': '2px 2px 0 #1a1a1a',
        'brutal-lg': '6px 6px 0 #1a1a1a',
        'brutal-hover': '6px 6px 0 #1a1a1a',
        'brutal-active': '2px 2px 0 #1a1a1a',
      },
      borderWidth: {
        brutal: '2px',
      },
      spacing: {
        'brutal-offset': '2px',
      },
    },
  },
  plugins: [],
}
