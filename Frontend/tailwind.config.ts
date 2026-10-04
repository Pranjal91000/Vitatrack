import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const v = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: v('bg'),
        surface: v('surface'),
        raised: v('raised'),
        line: v('line'),
        foreground: v('ink'),
        muted: v('muted'),
        primary: { DEFAULT: v('blue'), foreground: v('on-blue') },
        destructive: v('red'),
        success: v('green'),
        warning: v('yellow'),
        // Competition plate colours, used as data colours
        plate: { red: v('red'), blue: v('blue'), yellow: v('yellow'), green: v('green') },
        protein: v('red'),
        carbs: v('yellow'),
        fat: v('green'),
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
      keyframes: {
        'pop-in': { from: { transform: 'scale(.96)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      animation: { 'pop-in': 'pop-in .18s ease-out' },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
