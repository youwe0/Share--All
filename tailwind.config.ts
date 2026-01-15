import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          // Deep blacks and charcoals
          bg: '#030712',           // Near black
          'bg-secondary': '#0a0f1a', // Slightly lighter
          surface: '#111827',      // Card backgrounds
          'surface-hover': '#1f2937', // Hover states
          border: '#1f2937',       // Subtle borders
          'border-hover': '#374151', // Hover borders

          // Text hierarchy
          text: '#f9fafb',         // Primary text
          'text-secondary': '#e5e7eb', // Secondary text
          muted: '#9ca3af',        // Muted text
          subtle: '#6b7280',       // Very subtle text

          // Brand accent - Electric blue with glow potential
          accent: '#3b82f6',       // Primary accent
          'accent-light': '#60a5fa', // Light accent
          'accent-dark': '#2563eb', // Dark accent
          'accent-glow': '#3b82f680', // Glow effect

          // Status colors
          success: '#10b981',
          'success-glow': '#10b98140',
          error: '#ef4444',
          'error-glow': '#ef444440',
          warning: '#f59e0b',
          'warning-glow': '#f59e0b40',

          // Gradient stops
          'gradient-start': '#3b82f6',
          'gradient-mid': '#8b5cf6',
          'gradient-end': '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(to right, #3b82f610 1px, transparent 1px), linear-gradient(to bottom, #3b82f610 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, #3b82f615, transparent)',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, #3b82f620 0deg, #8b5cf620 120deg, #06b6d420 240deg, #3b82f620 360deg)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'border-beam': 'border-beam 4s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'border-beam': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
