/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#1B2430',
        sand: '#E8E1D3',
        slate: '#4A5A6A',
        rust: '#B5482A',
        gold: '#C89B3C',
        ink: '#12161D',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
