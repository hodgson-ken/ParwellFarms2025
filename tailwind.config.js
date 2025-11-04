/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#f8f7fb',
          100: '#f0eef5',
          200: '#ddd8e8',
          300: '#c5bdd6',
          400: '#a99bc0',
          500: '#8b7ba8',  // Main lavender - soft, muted
          600: '#6d5d85',  // Used for buttons and accents
          700: '#5a4d70',
          800: '#4a3f5c',
          900: '#3d344b',
        },
        farm: {
          green: '#4a7c59',
          'footer-green': '#A0B080', // Olive green from footer
          cream: '#f5f1e8',
          brown: '#6b4423',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}

