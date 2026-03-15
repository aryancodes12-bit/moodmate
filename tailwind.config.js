/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // This is the line that was missing
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}