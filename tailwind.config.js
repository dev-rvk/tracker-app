const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Using static colors that work with dark: variant
        border: {
          DEFAULT: '#e4e4e7',
          dark: '#27272a',
        },
        input: {
          DEFAULT: '#f4f4f5',
          dark: '#27272a',
        },
        ring: {
          DEFAULT: '#4f46e5',
          dark: '#6366f1',
        },
        background: {
          DEFAULT: '#fafafa',
          dark: '#09090b',
        },
        foreground: {
          DEFAULT: '#09090b',
          dark: '#fafafa',
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f4f4f5',
          foreground: '#18181b',
          dark: '#27272a',
          'dark-foreground': '#fafafa',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f4f4f5',
          foreground: '#71717a',
          dark: '#27272a',
          'dark-foreground': '#a1a1aa',
        },
        accent: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#09090b',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#09090b',
        },
        // Custom tag colors
        tag: {
          health: '#10b981',
          academic: '#6366f1',
          fitness: '#f59e0b',
          work: '#db2777',
        },
        // Zinc palette for explicit use
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      borderRadius: {
        lg: '16px',
        md: '14px',
        sm: '12px',
      },
    },
  },
  plugins: [],
};
