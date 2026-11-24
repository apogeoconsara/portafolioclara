/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#07142A', 900: '#0B1B33', 800: '#13294B', 700: '#1D3A63' },
        ivory: { DEFAULT: '#F6F2E9', 100: '#FBF9F4', 200: '#EDE7DA', 300: '#DDD5C4' },
        slate2: { 300: '#9AA9C2', 400: '#7388A8', 500: '#4A5F82', 600: '#3A4D6D' },
        silver: { 200: '#E3E6EB', 300: '#CDD2DA', 400: '#B9C0CB' },
        gold: '#B08D4F'
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
