/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#070F1F', 900: '#0C1830', 800: '#14284A', 700: '#1E3A5F' },
        ivory: { DEFAULT: '#E9EFF5', 100: '#F4F7FA', 200: '#DCE5EE', 300: '#C9D5E2' },
        slate2: { 300: '#9AA9C2', 400: '#7388A8', 500: '#4A5F82', 600: '#3A4D6D' },
        silver: { 200: '#E3E6EB', 300: '#CDD2DA', 400: '#B9C0CB' },
        teal: { DEFAULT: '#239C94', dark: '#0F5A55', light: '#5CC7BF' },
        gold: '#239C94'
      },
      fontFamily: {
        serif: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
