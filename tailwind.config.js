/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jamaican: {
          green: '#009739',
          black: '#000000',
          gold: '#FED100',
        },
        primary: {
          50: '#e6f7ed',
          100: '#b3e6ca',
          200: '#80d5a7',
          300: '#4dc484',
          400: '#26b86a',
          500: '#009739',
          600: '#008532',
          700: '#006d29',
          800: '#005521',
          900: '#003d18',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
