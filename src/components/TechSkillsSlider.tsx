import { skillTiers } from '../data/skills';
import { skillColors } from '../data/skillColors';

// Same source of truth as Skills.tsx's tiered list, not a hand-typed
// duplicate — flattened in tier order, no dedupe needed since a skill
// only ever appears in one tier.
const SKILLS = skillTiers.flatMap((group) => group.skills);

/**
 * "A moving slider with my tech skills that I have, between my projects and
 * the about work [Also built]." Continuous CSS-keyframe marquee (see the
 * `marquee` keyframes in index.css) — a doubled list translated by exactly
 * -50%, so the loop is seamless. Pauses on hover so it's readable if
 * someone actually wants to read it; under prefers-reduced-motion the
 * site-wide rule in index.css (`animation-iteration-count: 1`) already
 * settles it after a single instant pass rather than looping forever.
 *
 * "Add it back, but colored" — each skill renders in its own brand color
 * (skillColors.ts, the same map SkillTag.tsx colorizes on hover with)
 * instead of the flat single-tone text the old version used. Skills with
 * no real logo (Django Admin, REST APIs, Unit testing) fall back to the
 * plain low-contrast tone rather than a fabricated color.
 */
export function TechSkillsSlider() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-surf-3 bg-surf-1/40 py-5"
    >
      <div
        className="flex w-max items-center gap-12 [animation:marquee_26s_linear_infinite] hover:[animation-play-state:paused]"
      >
        {[...SKILLS, ...SKILLS].map((skill, i) => (
          <span
            key={i}
            className="flex items-center gap-12 whitespace-nowrap font-mono text-sm uppercase tracking-[0.2em]"
            style={{ color: skillColors[skill] ?? 'var(--color-text-low)' }}
          >
            {skill}
            <span className="text-lamp-glow">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
