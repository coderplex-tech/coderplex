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
          light: '#3b82f6', // Lighter blue
          dark: '#2563eb',  // Deeper blue
        },
        dark: {
          900: '#111827',   // Dark background
          800: '#1f2937',   // Dark card background
          700: '#374151',   // Dark hover states
          600: '#4b5563',   // Dark secondary elements
        },
        light: {
          900: '#f9fafb',   // Light background
          800: '#ffffff',   // Light card background
          700: '#f3f4f6',   // Light hover states
          600: '#e5e7eb',   // Light secondary elements
        }
      }
    },
    boxShadow: {
      glow: '0 0 10px rgba(37,99,235,0.2)',
      'glow-hover': '0 0 15px rgba(37,99,235,0.3)',
    },
  },
  plugins: [],
}
