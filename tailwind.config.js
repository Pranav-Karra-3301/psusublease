/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D1F60',
        secondary: '#4A3B8B',
        accent: '#3546CB',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F9F9FB',
        'border-light': '#EAEAEF',
        'error': '#D32F2F',
      },
      fontFamily: {
        'vt323': ['var(--font-vt323)', 'monospace'],
        'pixelify': ['var(--font-pixelify-sans)', 'sans-serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      }
    },
  },
  plugins: [],
} 