/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas para a clínica
        primary: {
          50: '#e6f3f5',
          100: '#cce7eb',
          200: '#99cfd6',
          300: '#66b7c2',
          400: '#339fad',
          500: '#008799',  // Cor principal - azul médico
          600: '#006c7a',
          700: '#00515c',
          800: '#00363d',
          900: '#001b1f',
        },
        secondary: {
          50: '#fef6e6',
          100: '#fdedcc',
          200: '#fbdb99',
          300: '#f9c966',
          400: '#f7b733',
          500: '#f5a500',  // Cor secundária - dourado acolhedor
          600: '#c48400',
          700: '#936300',
          800: '#624200',
          900: '#312100',
        }
      }
    },
  },
  plugins: [],
}
