/**
 * Design tokens — single source of truth.
 *
 * Imported by tailwind.config.ts (DOM/CSS side) and, from Stage 2 onward,
 * by the R3F scene (light colors, emissive falloff). Never hardcode these
 * hex values anywhere else — import from here.
 */

export const color = {
  // Surfaces — depth is lightness, not shadow. Never pure black.
  void: '#0A0D12',
  base: '#111721',
  surf1: '#171E29',
  surf2: '#1E2733',
  surf3: '#26303D',

  // Text — no pure white anywhere.
  textHi: '#E4E7EB',
  textMid: '#A3ACBA',
  textLow: '#6B7685',

  // Accents
  lamp: '#D99A45',
  lampGlow: '#8A5F2A',
  signal: '#52A398',
} as const;

// Light-mode counterpart — "a 3D light bulb that switches the mode of the
// website from dark to light." Same structure/roles as `color` (depth via
// lightness, no pure white, accents pulled down from full saturation), just
// inverted. `lamp`/`signal` are darkened relative to `color`'s so they still
// clear ~AA contrast against these much lighter surfaces. See
// theme/ThemeContext.tsx for how this actually gets applied — first pass,
// not yet screenshot-verified for contrast the way the dark palette was.
export const lightColor = {
  void: '#F5F3EF',
  base: '#EDEAE4',
  surf1: '#E2DED5',
  surf2: '#D6D1C5',
  surf3: '#C7C1B2',

  textHi: '#1B1B18',
  textMid: '#4A4740',
  textLow: '#7A756A',

  lamp: '#B97324',
  lampGlow: '#8A5F2A',
  signal: '#2F7A70',
} as const;

export type ColorToken = keyof typeof color;

// Type scale (rem)
export const type = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.25rem',
  xl: '1.75rem',
  '2xl': '2.5rem',
  '3xl': '4rem',
  '4xl': '6.5rem',
} as const;

export const font = {
  display: '"Bricolage Grotesque", sans-serif',
  body: '"Instrument Sans", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

// Bricolage Grotesque variable axes: wght 200–800, wdth 75–100, opsz 12–96.
// The name is set wide and heavy; section headings pull narrower. Restraint
// elsewhere — do not vary this axis on anything but these two roles.
export const fontVariation = {
  name: "'wght' 800, 'wdth' 100, 'opsz' 96",
  heading: "'wght' 650, 'wdth' 80, 'opsz' 32",
} as const;
