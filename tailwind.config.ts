import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Lavender Dusk primary palette
        lavender: {
          DEFAULT: '#6968A6',
          light: '#8584c0',
          dark: '#54538a',
          50: '#f5f5fa',
          100: '#e8e8f3',
          200: '#d4d4e8',
          300: '#b5b4d4',
          400: '#8f8ebc',
          500: '#6968A6',
          600: '#5a5994',
          700: '#4a4a7a',
          800: '#3f3f65',
          900: '#363654',
        },
        rose: {
          DEFAULT: '#CF9893',
          light: '#dbb0ac',
          dark: '#b87d78',
          50: '#fdf6f5',
          100: '#fbeae9',
          200: '#f7d8d6',
          300: '#f0bdb9',
          400: '#e5a39d',
          500: '#CF9893',
          600: '#b87d78',
          700: '#9a6662',
          800: '#7f5552',
          900: '#6a4847',
        },
        teal: {
          DEFAULT: '#085078',
          light: '#0a6a9e',
          dark: '#063a58',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e5fe',
          300: '#7cd1fd',
          400: '#36b9fa',
          500: '#0c9eeb',
          600: '#087fc9',
          700: '#085078',
          800: '#0b4565',
          900: '#0f3a54',
        },
        dark: {
          // Lavender Dusk backgrounds
          bg: '#0a0a14',              // Deep purple-black
          'bg-secondary': '#12121f',   // Slightly lighter
          surface: '#1a1a2e',          // Card backgrounds
          'surface-hover': '#252540',  // Hover states
          border: '#2a2a45',           // Subtle borders with purple tint
          'border-hover': '#3d3d5c',   // Hover borders

          // Text hierarchy
          text: '#f5f5f7',             // Primary text
          'text-secondary': '#e0e0e5', // Secondary text
          muted: '#9898a8',            // Muted text (purple-gray)
          subtle: '#6a6a7a',           // Very subtle text

          // Brand accent - Lavender
          accent: '#6968A6',           // Primary accent (lavender)
          'accent-light': '#8584c0',   // Light accent
          'accent-dark': '#54538a',    // Dark accent
          'accent-glow': 'rgba(105, 104, 166, 0.5)', // Glow effect

          // Secondary accent - Rose
          secondary: '#CF9893',        // Rose accent
          'secondary-light': '#dbb0ac',
          'secondary-glow': 'rgba(207, 152, 147, 0.5)',

          // Tertiary accent - Deep Teal
          tertiary: '#085078',         // Deep teal
          'tertiary-light': '#0a6a9e',
          'tertiary-glow': 'rgba(8, 80, 120, 0.5)',

          // Status colors
          success: '#4ade80',
          'success-glow': 'rgba(74, 222, 128, 0.4)',
          error: '#f87171',
          'error-glow': 'rgba(248, 113, 113, 0.4)',
          warning: '#fbbf24',
          'warning-glow': 'rgba(251, 191, 36, 0.4)',

          // Gradient stops (Lavender Dusk)
          'gradient-start': '#6968A6',  // Lavender
          'gradient-mid': '#CF9893',    // Rose
          'gradient-end': '#085078',    // Deep Teal
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(to right, rgba(105, 104, 166, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(105, 104, 166, 0.1) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(105, 104, 166, 0.15), transparent)',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, rgba(105, 104, 166, 0.2) 0deg, rgba(207, 152, 147, 0.2) 120deg, rgba(8, 80, 120, 0.2) 240deg, rgba(105, 104, 166, 0.2) 360deg)',
        // Lavender Dusk gradients
        'lavender-dusk': 'linear-gradient(135deg, #6968A6 0%, #CF9893 50%, #085078 100%)',
        'lavender-rose': 'linear-gradient(135deg, #6968A6 0%, #CF9893 100%)',
        'rose-teal': 'linear-gradient(135deg, #CF9893 0%, #085078 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(105, 104, 166, 0.3)',
        'glow-lg': '0 0 40px rgba(105, 104, 166, 0.4)',
        'glow-rose': '0 0 20px rgba(207, 152, 147, 0.3)',
        'glow-teal': '0 0 20px rgba(8, 80, 120, 0.3)',
        'glow-success': '0 0 20px rgba(74, 222, 128, 0.3)',
        'glow-error': '0 0 20px rgba(248, 113, 113, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(105, 104, 166, 0.1)',
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
