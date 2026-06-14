/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F0F0F',
          secondary: '#111118',
          card: '#16161F',
        },
        accent: {
          DEFAULT: '#10B981',
          neon: '#00FF9F',
        },
        border: '#1E1E2E',
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        gilroy: ['Gilroy', 'Inter', 'sans-serif'],
        lora: ['Lora', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #10B981, #00FF9F)',
        'button-gradient': 'linear-gradient(135deg, #10B981, #000000)',
      },
    },
  },
  plugins: [],
}