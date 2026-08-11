import { skillIconPaths } from '../data/skillIcons';
import { skillColors } from '../data/skillColors';

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
 */
export function SkillTag({ skill }: { skill: string }) {
  const brandColor = skillColors[skill];

  return (
    <li
      className="flex items-center gap-2 rounded border border-surf-3 px-3 py-1.5 font-mono text-sm transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-signal"
      style={brandColor ? { color: brandColor } : undefined}
    >
      <span className={`flex shrink-0 ${brandColor ? '' : 'text-signal'}`}>
        <SkillIcon skill={skill} />
      </span>
      <span className={brandColor ? '' : 'text-signal'}>{skill}</span>
    </li>
  );
}
