/** @type {import('tailwindcss').Config} */
const medusaUiPreset = require("@medusajs/ui-preset");

module.exports = {
  darkMode: "class", 
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [medusaUiPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};
