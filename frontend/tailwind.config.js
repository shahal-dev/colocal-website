import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'Poppins', ...fontFamily.sans],
        poppins: ['Poppins', ...fontFamily.sans],
        opensans: ['Open Sans', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
