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
        // Psychologically supportive color palette
        'abyss': {
          // Deep, grounding blacks and charcoals
          'black': '#0a0a0b',
          'charcoal': '#1a1b1e', 
          'stone': '#2a2b2f',
          'slate': '#3a3b40',
        },
        'warmth': {
          // Warm neutrals for balance
          'ash': '#4a4a4f',
          'ember': '#5a5a60',
          'smoke': '#6a6b71',
          'pearl': '#8a8b91',
        },
        'shadow': {
          // Softer reds for less anxiety
          'crimson': '#8b2635',
          'wine': '#722c3c', 
          'rust': '#a0433f',
          'rose': '#b85555',
        },
        'light': {
          // Hope and integration colors
          'dawn': '#d4af37',    // Warm gold
          'sage': '#87a96b',    // Healing green
          'mist': '#a8b2c8',    // Soft blue-gray
          'pearl': '#f5f1e8',   // Warm white
        },
        'depth': {
          // Deep blues for safety and calm
          'midnight': '#1a1f3a',
          'ocean': '#2c3e5f',
          'twilight': '#34495e',
          'steel': '#455a6e',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.2), 0 0 10px rgba(239, 68, 68, 0.2), 0 0 15px rgba(239, 68, 68, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.4), 0 0 30px rgba(239, 68, 68, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}