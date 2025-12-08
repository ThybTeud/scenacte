/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5E6D3',
        orange: '#FF9933',
        violet: '#2D1B69',
        black: '#1a1a1a',
        white: '#FFFFFF',
        'accent-hover': '#E68A2E',
      },
      fontFamily: {
        ui: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        theater: ['Crimson Text', 'Georgia', 'serif'],
        editor: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        brutal: '4px',
        'brutal-sm': '2px',
        'brutal-lg': '8px',
      },
      boxShadow: {
        brutal: '4px 4px 0 #1a1a1a',
        'brutal-sm': '2px 2px 0 #1a1a1a',
        'brutal-lg': '6px 6px 0 #1a1a1a',
        'brutal-active': '2px 2px 0 #1a1a1a',
      },
      borderWidth: {
        brutal: '2px',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
      },
    },
  },
  plugins: [],
}
