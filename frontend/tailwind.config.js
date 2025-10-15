/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#E11D48', // rojo de marca Eventos Perú
          dark: '#111827',
        },
      },
    },
  },
  plugins: [],
}

