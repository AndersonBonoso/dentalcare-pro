import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        'dc-primary': '#2563eb',
        'dc-secondary': '#00BFA6',
        'dc-ink': '#1e293b',
        'dc-fg': '#334155',
        'dc-bg': '#f8fafc',
      },
      backgroundImage: {
        'dc-gradient': 'linear-gradient(135deg, #2563eb 0%, #00BFA6 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
export default config

