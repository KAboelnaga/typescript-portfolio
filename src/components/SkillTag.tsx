import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skillIconPaths } from '../data/skillIcons';
import { skillColors } from '../data/skillColors';
import { onPinsReady } from '../scenes/contactReady';

gsap.registerPlugin(ScrollTrigger);

function SkillIcon({ skill }: { skill: string }) {
  const path = skillIconPaths[skill];
  if (!path) return null;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d={path} />
    </svg>
  );
}

const LETTER_STAGGER = 0.028;

/**
 * "Add a hover effect on every skill that colorize it to its known logo
 * color and animated to be colorized letter by letter." Each character
 * gets its own span so the color sweeps left-to-right on enter and
 * reverses right-to-left on leave, rather than the whole tag flashing at
 * once. Tags with no real brand mark (Django Admin, REST APIs, Unit
 * testing — absent from skillColors.ts) keep the plain border-only hover
 * instead of a fabricated color.
 *
 * "Let me see the skills getting colored on its own when previewed" — the
 * colorize was hover-only, so it never played for anyone who didn't move a
 * mouse over each tag individually. Each tag now also runs the same sweep
 * once, automatically, the first time it scrolls into view (a `once: true`
 * ScrollTrigger on the `<li>` itself — same "fires when the content is
 * actually on screen" pattern as ScrollReveal/StaggerReveal/CountUp
 * elsewhere on this site). "Make the skills stay colored after the
 * animation" — unlike those other three (which now replay every time,
 * see their own comments), this one intentionally does *not* revert: once
 * a tag has been auto-colorized, `coloredRef` latches true and `handleLeave`
 * becomes a no-op for it, so a mouse leaving afterward can't undo it either
 * — colorizing is a one-way "unlocked" state per tag, not a hover toggle
 * that happens to also fire once automatically.
 */
export function SkillTag({ skill }: { skill: string }) {
  const color = skillColors[skill];
  const liRef = useRef<HTMLLIElement>(null);
  const iconWrapRef = useRef<HTMLSpanElement>(null);
  const lettersRef = useRef<HTMLSpanElement>(null);
  const baseColorRef = useRef('');
  const coloredRef = useRef(false);

  const letters = useMemo(() => skill.split(''), [skill]);

  useEffect(() => {
    if (lettersRef.current) {
      baseColorRef.current = getComputedStyle(lettersRef.current).color;
    }
  }, []);

  function handleEnter() {
    if (!color || !lettersRef.current) return;
    const letterEls = Array.from(lettersRef.current.children);
    gsap.to(letterEls, { color, duration: 0.3, stagger: LETTER_STAGGER, ease: 'power1.out' });
    if (iconWrapRef.current) gsap.to(iconWrapRef.current, { color, duration: 0.3 });
  }

  function handleLeave() {
    if (!color || !lettersRef.current || coloredRef.current) return;
    const letterEls = Array.from(lettersRef.current.children);
    gsap.to(letterEls, {
      color: baseColorRef.current,
      duration: 0.25,
      stagger: { each: LETTER_STAGGER, from: 'end' },
      ease: 'power1.out',
    });
    if (iconWrapRef.current) gsap.to(iconWrapRef.current, { color: baseColorRef.current, duration: 0.25 });
  }

  // Gated on `onPinsReady` — a trigger created before every pin on the
  // page exists measures itself against a still-short page and fires far
  // too early once real scrolling reaches that stale offset (found and
  // fixed across ScrollReveal/StaggerReveal/CountUp too, and once more
  // for Footer specifically — see contactReady.ts).
  useEffect(() => {
    if (!color || !liRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let st: ScrollTrigger | null = null;
    const unsubscribe = onPinsReady(() => {
      st = ScrollTrigger.create({
        trigger: liRef.current,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          coloredRef.current = true;
          handleEnter();
        },
      });
    });

    return () => {
      unsubscribe();
      st?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  return (
    <li
      ref={liRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="flex items-center gap-2 rounded border border-surf-3 px-3 py-1.5 font-mono text-sm text-text-mid transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-signal"
    >
      <span ref={iconWrapRef} className="flex shrink-0">
        <SkillIcon skill={skill} />
      </span>
      <span ref={lettersRef}>
        {letters.map((ch, i) => (
          <span key={i} className="inline-block" style={ch === ' ' ? { whiteSpace: 'pre' } : undefined}>
            {ch}
          </span>
        ))}
      </span>
    </li>
  );
}
