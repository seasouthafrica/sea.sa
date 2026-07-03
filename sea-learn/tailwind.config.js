/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Match SEA brand — adjust to exact brand kit values
        'sea-teal': '#2CBCB4',
        'sea-magenta': '#C2185B',
      },
    },
  },
  plugins: [],
};
