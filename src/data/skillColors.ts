// Official (or closest legible) brand colors, keyed to the same names as
// skillIcons.ts — "colorize it to its known logo color" on hover (see
// SkillTag.tsx). Sourced from each project's own brand guidelines, same
// values simple-icons ships. Four exceptions are intentionally lifted off
// the literal hex: Django (092E20), Flask (000000) and SQLite (003B57) are
// all near-black — invisible against this site's near-black dark theme
// background (`void`, #0A0D12) and just as invisible against the near-white
// light theme's #F5F3EF. Each is swapped for a lighter tint from the same
// brand (Django and SQLite both pair their dark mark with a lighter accent
// in their own docs/media kits already); Flask has no real secondary hue,
// so it gets a neutral mid-grey instead of true black. PostgreSQL's literal
// royal blue (#4169E1) isn't invisible but measured under WCAG AA against
// the dark theme (3.45:1 vs the `surf1`-toned marquee background, needs
// 4.5:1) — lightened just enough to clear it (4.55:1). Anything absent here
// (Django Admin, REST APIs, Unit testing) has no real logo, so SkillTag
// skips the colorize effect entirely for it.
export const skillColors: Record<string, string> = {
  Python: '#3776AB',
  Django: '#44B78B',
  PostgreSQL: '#5E80E6',
  React: '#61DAFB',
  JavaScript: '#F7DF1E',
  Git: '#F05032',
  Linux: '#FCC624',
  FastAPI: '#009688',
  Flask: '#8C8C8C',
  Redux: '#764ABC',
  Vite: '#646CFF',
  Tailwind: '#06B6D4',
  Bootstrap: '#7952B3',
  MySQL: '#4479A1',
  SQLite: '#3D8DC9',
  Docker: '#2496ED',
  Apache: '#D22128',
  Bash: '#4EAA25',
  Java: '#EA7D25',
  'Spring Boot': '#6DB33F',
  TypeScript: '#3178C6',
  // Added 2026-08-11 for the Comfortable-tier additions. Three.js's real
  // brand color is pure black (#000000) — same invisible-on-this-site's-
  // near-black-dark-theme problem as Django/Flask/SQLite above, and
  // unlike those three it has no documented lighter secondary color to
  // borrow, so it gets the same neutral-grey treatment Flask already
  // uses (distinguishable, not fabricated — just a visible neutral
  // rather than true black).
  'Gunicorn/WSGI': '#499848',
  SCSS: '#CC6699',
  'Three.js': '#B0B0B0',
  GSAP: '#88CE02',
  'React Hook Form': '#EC5990',
  HTML5: '#E34F26',
  CSS: '#663399',
};

function relLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const chan = (shift: number) => {
    const c = ((n >> shift) & 255) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(16) + 0.7152 * chan(8) + 0.0722 * chan(0);
}

function contrastRatio(hexA: string, hexB: string): number {
  const a = relLuminance(hexA);
  const b = relLuminance(hexB);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function mixToward(hex: string, targetHex: string, amount: number): string {
  const c = parseInt(hex.slice(1), 16);
  const t = parseInt(targetHex.slice(1), 16);
  const mix = (shift: number) => {
    const a = (c >> shift) & 255;
    const b = (t >> shift) & 255;
    return Math.round(a * (1 - amount) + b * amount);
  };
  return (
    '#' +
    [16, 8, 0]
      .map((s) => mix(s).toString(16).padStart(2, '0'))
      .join('')
  );
}

// lightColor.textHi / lightColor.surf1 from tokens.ts — not imported
// directly to avoid a dependency from data/ back into theme/ for two
// constants. `surf1`, not `void`, is the right worst-case target here:
// void (#F5F3EF) is the *lightest* light-mode background, which makes it
// the *easiest* one to contrast a dark-ish color against, not the
// hardest — surf1 (#E2DED5, noticeably lower luminance) is the darkest
// background these colors realistically sit behind (panels/marquee), so
// it's the one that actually has to pass.
const LIGHT_INK = '#1B1B18';
const LIGHT_WORST_BG = '#E2DED5';

/**
 * Brand colors above are picked/verified for legibility against the
 * *dark* theme only. Several read under-contrast or near-invisible
 * against light mode's cream background unchanged — measured with
 * axe-core against the live site: React's cyan was 1.35:1, JavaScript's
 * yellow 1.13:1, both need WCAG AA's 4.5:1 for normal text. A single
 * fixed darkening amount doesn't work across the whole list (it
 * over-darkens colors that were already legible and under-darkens the
 * near-white ones), so this darkens each color just enough — computed
 * from its own starting lightness — to actually clear 4.5:1 against the
 * lightest background these colors realistically sit on (`void`), then
 * stops. Used by both `SkillTag.tsx` and `TechSkillsSlider.tsx`.
 */
export function dimForLight(hex: string): string {
  let amount = 0;
  let result = hex;
  while (contrastRatio(result, LIGHT_WORST_BG) < 4.5 && amount < 1) {
    amount += 0.02;
    result = mixToward(hex, LIGHT_INK, amount);
  }
  return result;
}
