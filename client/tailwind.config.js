/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        mist: '#f4f7fb',
        primary: '#405cf5',
      },
      boxShadow: {
        panel: '0 18px 45px rgba(31, 48, 84, 0.08)',
      },
    },
  },
  plugins: [],
};
