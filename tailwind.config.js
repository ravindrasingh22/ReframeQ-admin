/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          700: '#334155',
          800: '#1e293b'
        }
      }
    }
  },
  plugins: []
};
