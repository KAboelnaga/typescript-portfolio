import { skillIconPaths } from '../data/skillIcons';
import { skillColors, dimForLight } from '../data/skillColors';
import { useTheme } from '../theme/ThemeContext';

function SkillIcon({ skill }: { skill: string }) {
  const path = skillIconPaths[skill];
  if (!path) return null;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d={path} />
    </svg>
  );
}

/**
 * "Bring back the colored skills without animations, make them already
 * colored" — reverses the hover-only colorize (letter-by-letter GSAP
 * sweep) back to a plain, permanently-colored tag: real brand color for
 * anything in `skillColors.ts`, the site's own `signal` green (a live
 * CSS var, so it tracks theme automatically) for everything else. No
 * refs, no GSAP, no enter/leave handlers — the color is just the text
 * color, always.
 *
 * "The colored skills are too bright on light mode, dim them a bit" —
 * brand colors are a single fixed hex (no light/dark variant, unlike
 * `signal`, which already darkens for light mode in tokens.ts), so
 * `dimForLight()` (skillColors.ts) darkens each one just enough to clear
 * WCAG AA contrast, applied in light mode only.
 */
export function SkillTag({ skill }: { skill: string }) {
  const brandColor = skillColors[skill];
  const { mode } = useTheme();
  const displayColor = brandColor && mode === 'light' ? dimForLight(brandColor) : brandColor;

  return (
    <li
      className="flex items-center gap-2 rounded border border-surf-3 px-3 py-1.5 font-mono text-sm transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-signal"
      style={displayColor ? { color: displayColor } : undefined}
    >
      <span className={`flex shrink-0 ${brandColor ? '' : 'text-signal'}`}>
        <SkillIcon skill={skill} />
      </span>
      <span className={brandColor ? '' : 'text-signal'}>{skill}</span>
    </li>
  );
}
