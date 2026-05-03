/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          green:    "#1a6b3c",
          light:    "#4CAF50",
          pale:     "#f0faf4",
          gold:     "#F4A300",
          darkgold: "#c47f00",
          bg:       "#f4f9f0",
          card:     "#ffffff",
          dark:     "#1a2e1a",
        }
      }
    },
  },
  plugins: [],
}
