/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surgct: {
          bg: '#080d1a',
          surface: '#0d172e',
          elevated: '#132247',
          border: '#1e293b',
          cyan: '#06b6d4',
          sky: '#0284c7',
          teal: '#14b8a6',
          emerald: '#10b981',
          violet: '#8b5cf6',
          dark: '#050811',
        },
        dental: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#082f49',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-teal': '0 0 20px -3px rgba(20, 184, 166, 0.35)',
        'glow-sm': '0 0 10px rgba(6, 182, 212, 0.25)',
      },
    },
  },
  plugins: [],
}
