import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7B1F3A',
          light: '#A64060',
          lighter: '#F9EFF2',
          dark: '#5A1529',
          darker: '#3D0D1C',
        },
        surface: '#FFFFFF',
        page: '#F9F3F5',
        muted: '#E8DDE0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 32px rgba(61, 13, 28, 0.08)',
      },
    },
  },
  plugins: [forms],
} satisfies Config;
