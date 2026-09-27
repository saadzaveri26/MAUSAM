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
        l1: '0px 1px 2px 0px rgba(6,17,31,0.10), 0px 1px 2px 0px rgba(6,17,31,0.08)',
        l2: '0px 4px 8px 0px rgba(6,17,31,0.14), 0px 1px 2px 0px rgba(6,17,31,0.08)',
        l3: '0px 8px 16px 0px rgba(6,17,31,0.18), 0px 4px 8px 0px rgba(6,17,31,0.12)',
        l4: '0px 16px 32px 0px rgba(6,17,31,0.22), 0px 8px 16px 0px rgba(6,17,31,0.16)',
        card: '0px 1px 2px 0px rgba(6,17,31,0.10), 0px 1px 2px 0px rgba(6,17,31,0.08)',
        dropdown: '0px 4px 8px 0px rgba(6,17,31,0.14), 0px 1px 2px 0px rgba(6,17,31,0.08)',
        popover: '0px 8px 16px 0px rgba(6,17,31,0.18), 0px 4px 8px 0px rgba(6,17,31,0.12)',
        modal: '0px 16px 32px 0px rgba(6,17,31,0.22), 0px 8px 16px 0px rgba(6,17,31,0.16)',
      },
      colors: {
        /*
         * MeghSetu Redesign — Option A: Deep Navy Monochrome + Single Electric Accent
         * taste-skill rule: "Pick one accent. Remove the rest."
         * Single accent: #0CAAEF (electric cyan-blue)
         */

        // Canvas scale (darkened for depth)
        navy: {
          DEFAULT: '#0B2A61',
          950: '#06111F',
          900: '#0B2A61',
          800: '#143875',
          700: '#1c488a',
        },

        // THE one accent — all interactive elements
        accent: {
          DEFAULT: '#0CAAEF',
          hover: '#3BBEF3',
          dim: 'rgba(12, 170, 239, 0.12)',
          muted: 'rgba(12, 170, 239, 0.06)',
        },
        'accent-blue': '#0CAAEF',

        // Wordmark-only (demoted from UI-wide accent)
        'brand-blue': '#0169DE',
        brand: {
          blue: '#0169DE',
          DEFAULT: '#0169DE',
        },

        // Surfaces
        surface: {
          alt: '#0E3366',
          DEFAULT: '#0E3366',
        },
        'surface-alt': '#0E3366',
        'bg-tint': '#06111F',

        slate: {
          700: '#1c488a',
          600: '#2b5f9e',
        },

        // Text hierarchy
        ink: {
          0: '#E8F0F5',
          1: '#8FA8B8',
          2: '#5A7283',
        },

        // Borders — accent-tinted
        line: {
          DEFAULT: 'rgba(12, 170, 239, 0.10)',
          soft: 'rgba(12, 170, 239, 0.05)',
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
        blue: {
          DEFAULT: '#0CAAEF',
          dim: 'rgba(12, 170, 239, 0.16)',
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
