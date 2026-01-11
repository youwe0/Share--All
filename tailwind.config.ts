import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155',
          text: '#F1F5F9',
          muted: '#94A3B8',
          accent: '#3B82F6',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
