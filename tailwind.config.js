/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#02020a',
        surface: '#0a0a16',
        'surface-2': '#12122a',
        border: '#1e1e3a',
        cyan: '#00d4ff',
        violet: '#9d4edd',
        mint: '#3effa0',
        amber: '#ffb347',
        rose: '#ff6b9d',
        text: '#e8e8f4',
        muted: '#4a4a6a',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
