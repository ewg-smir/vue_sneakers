/** @type {import('tailwindcss').Config} */
export default {
  // Указываем, какие файлы (html, js, vue) Tailwind должен сканировать для поиска классов
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
