/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#171717',
        primary: {
          DEFAULT: '#0066FF', // Vibrant Blue CTA
          light: '#3385FF',
          dark: '#0047B3',
        },
        accent: {
          DEFAULT: '#FF2A7A', // Pink for details
          light: '#FF5C99',
          dark: '#B31D55',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-blue': '0 0 20px rgba(0, 102, 255, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 42, 122, 0.5)',
      }
    },
  },
  plugins: [],
}
