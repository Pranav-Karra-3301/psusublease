/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0052CC',
        accent: '#0052CC',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F5F5F5',
        'border-light': '#E0E0E0',
        'error': '#D32F2F',
      },
      fontFamily: {
        'vt323': ['var(--font-vt323)', 'monospace'],
        'pixelify': ['var(--font-pixelify-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 