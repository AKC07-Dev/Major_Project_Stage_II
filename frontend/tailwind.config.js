/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: {
          DEFAULT: '#111827',
          card: 'rgba(17, 24, 39, 0.7)',
          border: 'rgba(30, 41, 59, 0.8)',
        },
        brand: {
          violet: '#8B5CF6',
          purple: '#7C3AED',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top center, rgba(139, 92, 246, 0.15), transparent 70%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
    },
  },
  plugins: [],
};
