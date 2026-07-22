import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        violet: 'rgb(var(--violet) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      borderColor: { subtle: 'rgb(var(--border) / <alpha-value>)' },
      borderRadius: { panel: 'var(--radius-panel)', control: 'var(--radius-control)' },
      boxShadow: { panel: 'var(--shadow-panel)', glow: 'var(--shadow-glow)' },
      fontFamily: { sans: ['Manrope Variable', 'Manrope', 'sans-serif'], mono: ['JetBrains Mono Variable', 'monospace'] },
      letterSpacing: { display: '-0.045em' },
    },
  },
  plugins: [],
} satisfies Config
