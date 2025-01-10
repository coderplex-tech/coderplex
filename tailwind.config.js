/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#f472b6', // Softer pink
          dark: '#db2777',  // Deeper pink
        },
        dark: {
          900: '#0a0a0a',   // Slightly softer than pure black
          800: '#141414',   // Subtle dark for cards
          700: '#1c1c1c',   // For hover states
          600: '#2d2d2d',   // For secondary elements
        },
        light: {
          900: '#fafafa',   // Almost white
          800: '#f5f5f5',   // Light gray for cards
          700: '#e5e5e5',   // For hover states
          600: '#d4d4d4',   // For secondary elements
        }
      }
    },
  },
  plugins: [],
}
