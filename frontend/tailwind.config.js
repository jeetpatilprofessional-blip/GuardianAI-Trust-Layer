/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#006fcf",
          dark: "#0b192c",
          darker: "#040d1a",
          accent: "#00a3e0",
        }
      }
    },
  },
  plugins: [],
}
