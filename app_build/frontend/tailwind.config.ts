import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'sans-serif'],
        display: ['var(--font-noto-sans-display)', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        l0: 'none',
        l1: '0px 1px 3px 0px rgba(46, 36, 32, 0.06), 0px 1px 2px 0px rgba(46, 36, 32, 0.04)',
        l2: '0px 4px 8px -1px rgba(46, 36, 32, 0.08), 0px 2px 4px -1px rgba(46, 36, 32, 0.04)',
        l3: '0px 10px 16px -3px rgba(46, 36, 32, 0.10), 0px 4px 6px -2px rgba(46, 36, 32, 0.05)',
        l4: '0px 20px 25px -5px rgba(46, 36, 32, 0.12), 0px 10px 10px -5px rgba(46, 36, 32, 0.04)',
        card: '0px 1px 3px 0px rgba(46, 36, 32, 0.06), 0px 1px 2px 0px rgba(46, 36, 32, 0.04)',
        dropdown: '0px 4px 8px -1px rgba(46, 36, 32, 0.08), 0px 2px 4px -1px rgba(46, 36, 32, 0.04)',
        popover: '0px 10px 16px -3px rgba(46, 36, 32, 0.10), 0px 4px 6px -2px rgba(46, 36, 32, 0.05)',
        modal: '0px 20px 25px -5px rgba(46, 36, 32, 0.12), 0px 10px 10px -5px rgba(46, 36, 32, 0.04)',
      },
      colors: {
        /*
         * MeghSetu Light Theme & Coral Pink / Sunset Orange Brand Architecture
         * --bg: #FFFFFF (pure white)
         * --surface: #FFF7F2 (warm tinted card/panels)
         * --text: #2E2420 (warm charcoal)
         * --brand-primary: #EC6F8E (coral pink, dominant)
         * --brand-secondary: #F2703A (sunset orange, accent/hover)
         * --brand-accent: #A83250 (deep wine)
         */

        // Light Theme Canvas & Surfaces
        bg: '#FFFFFF',
        surface: {
          DEFAULT: '#FFF7F2',
          alt: '#F7EBE3',
          card: '#FFF7F2',
        },
        'surface-alt': '#F7EBE3',

        // Primary Text Scale (Warm Charcoal)
        text: {
          DEFAULT: '#2E2420',
          primary: '#2E2420',
          muted: '#6E5D57',
          subtle: '#94827B',
        },

        // Dominant Brand: Coral Pink (#EC6F8E) & Sunset Orange (#F2703A)
        'brand-primary': '#EC6F8E',
        'brand-secondary': '#F2703A',
        'brand-accent': '#A83250',
        brand: {
          DEFAULT: '#EC6F8E',
          primary: '#EC6F8E',
          secondary: '#F2703A',
          accent: '#A83250',
          hover: '#F2703A',
          light: '#F8B4C4',
          dim: 'rgba(236, 111, 142, 0.12)',
          muted: 'rgba(236, 111, 142, 0.06)',
        },
        'brand-light': '#F8B4C4',

        // Accent tokens mapped to brand for backward-compatible utility classes
        accent: {
          DEFAULT: '#EC6F8E',
          hover: '#F2703A',
          dim: 'rgba(236, 111, 142, 0.12)',
          muted: 'rgba(236, 111, 142, 0.06)',
        },

        // Optional secondary chart series (strictly for charts, never for buttons/nav)
        'accent-teal': '#2C8C7D',

        // Institutional Navy (retained for solid dark Header and institutional elements)
        navy: {
          DEFAULT: '#0B2A61',
          950: '#06111F',
          900: '#0B2A61',
          800: '#143875',
          700: '#1c488a',
        },

        slate: {
          700: '#1c488a',
          600: '#2b5f9e',
        },

        // Text hierarchy mapped to warm charcoal for existing ink-* classes
        ink: {
          0: '#2E2420',
          1: '#6E5D57',
          2: '#94827B',
        },

        // Hairline borders
        line: {
          DEFAULT: 'rgba(46, 36, 32, 0.12)',
          soft: 'rgba(46, 36, 32, 0.06)',
        },

        // Severity & operational alert palette (STRICTLY UNTOUCHED)
        amber: {
          DEFAULT: '#f5a623',
          dim: 'rgba(245, 166, 35, 0.16)',
        },
        teal: {
          DEFAULT: '#2bb3a3',
          dim: 'rgba(43, 179, 163, 0.16)',
        },
        red: {
          DEFAULT: '#e5484d',
          dim: 'rgba(229, 72, 77, 0.16)',
        },
        severity: {
          low: '#2bb3a3',
          watch: '#f5a623',
          alert: '#f97316',
          warning: '#e5484d',
        },
      },
      maxWidth: {
        prose: '720px',
      },
    },
  },
  plugins: [],
};

export default config;
