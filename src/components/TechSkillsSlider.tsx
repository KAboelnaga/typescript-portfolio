import { projects } from '../data/projects';

// Derived from real project data (Project.stack), not a hand-typed list
// that could drift from what the case studies actually say. Dedupe with a
// Set, keep first-seen order.
const SKILLS = Array.from(new Set(projects.flatMap((p) => p.stack)));

/**
 * "A moving slider with my tech skills that I have, between my projects and
 * the about work [Also built]." Continuous CSS-keyframe marquee (see the
 * `marquee` keyframes in index.css) — a doubled list translated by exactly
 * -50%, so the loop is seamless. Pauses on hover so it's readable if
 * someone actually wants to read it; under prefers-reduced-motion the
 * site-wide rule in index.css (`animation-iteration-count: 1`) already
 * settles it after a single instant pass rather than looping forever.
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
            className="flex items-center gap-12 whitespace-nowrap font-mono text-sm uppercase tracking-[0.2em] text-text-low"
          >
            {skill}
            <span className="text-lamp-glow">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
