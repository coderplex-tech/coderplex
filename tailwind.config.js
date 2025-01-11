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
          900: '#f2efe8',   // Warmer, darker off-white for background
          800: '#eae7e0',   // Warmer beige for cards
          700: '#e2dfd8',   // For hover states
          600: '#d8d5ce',   // For secondary elements
        }
      }
    },
    boxShadow: {
      glow: '0 0 10px rgba(219,39,119,0.2)',
      'glow-hover': '0 0 15px rgba(219,39,119,0.3)',
    },
  },
  plugins: [],
}
