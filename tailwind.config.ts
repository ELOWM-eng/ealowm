import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto)', 'serif'],
        display: ['var(--font-gowun)', 'serif'],
      },
      colors: {
        lotus: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#f9d3e8',
          300: '#f0a8cc',
          400: '#e673a8',
          500: '#d94f88',
          600: '#c2306a',
          700: '#a12254',
          800: '#851f46',
          900: '#701e3d',
        },
        teal: {
          50:  '#e1f5ee',
          100: '#b3e8d2',
          200: '#5dcaa5',
          300: '#1d9e75',
          400: '#0f6e56',
          500: '#085041',
        },
        cream: '#fdf8f0',
        ink:   '#1a1410',
      },
      backgroundImage: {
        'lotus-gradient': 'radial-gradient(ellipse at top, #fdf2f8 0%, #fdf8f0 60%)',
      },
    },
  },
  plugins: [],
}
export default config
