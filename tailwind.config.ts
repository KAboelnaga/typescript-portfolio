import type { Config } from 'tailwindcss';
import { type, font } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Resolved through CSS custom properties, not tokens.ts's hex values
    // directly, so the dark/light toggle (theme/ThemeContext.tsx) can swap
    // every one of these at runtime without a page reload — see that file
    // for where --color-* actually gets set. index.css's :root block is
    // just the pre-JS bootstrap default (dark), kept in sync with
    // tokens.ts's `color` export by hand.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      void: 'var(--color-void)',
      base: 'var(--color-base)',
      'surf-1': 'var(--color-surf-1)',
      'surf-2': 'var(--color-surf-2)',
      'surf-3': 'var(--color-surf-3)',
      'text-hi': 'var(--color-text-hi)',
      'text-mid': 'var(--color-text-mid)',
      'text-low': 'var(--color-text-low)',
      lamp: 'var(--color-lamp)',
      'lamp-glow': 'var(--color-lamp-glow)',
      signal: 'var(--color-signal)',
    },
    fontFamily: {
      display: [font.display],
      body: [font.body],
      mono: [font.mono],
      about: [font.aboutMe],
    },
    // `base` is a color token too ("page background" — see `colors`
    // above). Tailwind auto-generates a `text-{key}` utility for BOTH
    // font-size keys and color keys, so a font-size key literally named
    // `base` collides with the color one: `.text-base` ends up as ONE
    // merged rule setting `font-size: 1rem` *and* `color: var(--color-base)`
    // — meaning any element written as `text-base` (or `sm:text-base`,
    // etc.) expecting a font size silently also got its text colored the
    // same as the page background, next to invisible. Real bug, not a
    // hypothetical — found via Kareem reporting "text under Get in touch
    // isn't visible" and tracing it to the compiled CSS. Renamed to `md`
    // (a common alternate name for the same "default" size) so it can't
    // collide with any current or future color key.
    fontSize: {
      xs: type.xs,
      sm: type.sm,
      md: type.base,
      lg: type.lg,
      xl: type.xl,
      '2xl': type['2xl'],
      '3xl': type['3xl'],
      '4xl': type['4xl'],
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
