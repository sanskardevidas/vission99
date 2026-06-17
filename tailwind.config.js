/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-black': '#050505',
        'rich-black': '#0B0B0B',
        charcoal: '#111111',
        'soft-charcoal': '#191919',
        'premium-ivory': '#F7F2EA',
        'warm-ivory': '#FBF7F0',
        'champagne-gold': '#D6B36A',
        'soft-gold': '#E6C979',
        'muted-gold': '#B9975B',
        'warm-beige': '#E8D8BD',
        'stone-gray': '#D8D2C7',
        'muted-gray': '#9B9B9B',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(214,179,106,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(214,179,106,0.8)' },
        },
      },
    },
  },
  plugins: [],
};
