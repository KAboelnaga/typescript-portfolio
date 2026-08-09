import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { color, lightColor } from './tokens';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'theme-mode';

// CSS custom property name for each token key — kebab-cased, one source
// (this map) shared by both the read and write sides below.
const CSS_VAR: Record<keyof typeof color, string> = {
  void: '--color-void',
  base: '--color-base',
  surf1: '--color-surf-1',
  surf2: '--color-surf-2',
  surf3: '--color-surf-3',
  textHi: '--color-text-hi',
  textMid: '--color-text-mid',
  textLow: '--color-text-low',
  lamp: '--color-lamp',
  lampGlow: '--color-lamp-glow',
  signal: '--color-signal',
};

// Always dark unless the visitor has explicitly toggled it before — not
// driven by prefers-color-scheme. This site's whole visual identity is
// dark-first (see tokens.ts's comments — "no pure white anywhere," depth
// via lightness not shadow); light mode is a brand-new, unverified first
// pass (see lightColor's comment), not an equally-designed alternative to
// hand a majority-light-OS visitor by default.
function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

type ColorMap = Record<keyof typeof color, string>;

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorMap;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  colors: color,
  toggle: () => {},
});

/**
 * Dark/light toggle — "I want to add a 3D light bulb that switches the
 * mode of the website from dark to light mode" (see
 * components/ThemeLightbulb.tsx for the bulb itself; this is just the
 * state + application). `tokens.ts` stays the single source of hex values
 * for BOTH themes — nothing here or in index.css hardcodes a color a
 * second time. Applied via CSS custom properties set directly on
 * `<html>` (tailwind.config.ts's colors all resolve to `var(--color-*)`
 * now), not Tailwind's `dark:` variant — that would mean threading a
 * `dark:` class onto every single color utility across every component,
 * whereas this way existing `bg-void`/`text-text-hi`/etc. classes just
 * pick up the new values automatically. `useLayoutEffect` (not
 * `useEffect`) so the swap happens before paint — no flash of the old
 * theme on toggle.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const tokens = mode === 'light' ? lightColor : color;
    (Object.keys(tokens) as (keyof typeof color)[]).forEach((key) => {
      root.style.setProperty(CSS_VAR[key], tokens[key]);
    });
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggle = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  const colors = mode === 'light' ? lightColor : color;

  return <ThemeContext.Provider value={{ mode, colors, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
