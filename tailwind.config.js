/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgba(var(--color-primary), <alpha-value>)',
        secondary: 'rgba(var(--color-secondary), <alpha-value>)',
        background: 'rgba(var(--color-background), <alpha-value>)',
        surface: 'rgba(var(--color-surface), <alpha-value>)',
        accent: 'rgba(var(--color-accent), <alpha-value>)',
        'text-main': 'rgba(var(--color-text-main), <alpha-value>)',
        'text-muted': 'rgba(var(--color-text-muted), <alpha-value>)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
