import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onHeroReady } from '../scenes/heroReady';

gsap.registerPlugin(ScrollTrigger);

export type RevealVariant = 'up' | 'left' | 'right' | 'scale';

// "Try adding cool animation through every element... it's just too
// static" — a single fade+rise everywhere read as one animation repeated,
// not motion. Each variant is still the same one-shot "first time it
// crosses into view" reveal, just a different starting transform, so
// callers can vary the entrance from section to section (and element to
// element within a section) without a bespoke tween each time.
const FROM: Record<RevealVariant, gsap.TweenVars> = {
  up: { opacity: 0, y: 32 },
  left: { opacity: 0, x: -48 },
  right: { opacity: 0, x: 48 },
  scale: { opacity: 0, y: 14, scale: 0.92 },
};

const TO: Record<RevealVariant, gsap.TweenVars> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, y: 0, scale: 1 },
};

/**
 * Fade+rise (or slide/scale) reveal for normal (non-pinned) document-flow
 * content, e.g. project cards. "Can we redo the animations every time the
 * desired components are active?" — replays every time the element
 * scrolls into view, in either scroll direction, resetting back to its
 * hidden state when it scrolls back out (also either direction) rather
 * than a one-shot "first time only" reveal. Respects
 * prefers-reduced-motion by just skipping the animation entirely (content
 * stays visible, no opacity-0 flash, no repeated motion).
 */
export function ScrollReveal({
  children,
  delay = 0,
  variant = 'up',
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  // "Fires at the wrong moment" bug found while adding the Skills
  // auto-colorize preview (see SkillTag.tsx): a ScrollTrigger created
  // immediately on mount measures its trigger position against whatever
  // the document height is *right then* — for anything below the Hero
  // section, that's still the short pre-model-load layout, since Hero's
  // pin spacer (which adds ~6 viewport-heights) only gets created once the
  // character model finishes loading (see heroReady.ts, already the fix
  // ContactTimeline uses for its own pin for the exact same reason). A
  // stale-short-layout trigger position means "top 88%" ends up firing
  // thousands of pixels early once real scrolling reaches that *stale*
  // pixel offset. Confirmed via Playwright: without this gate, CountUp's
  // Work-section numbers started counting while still ~6000px below the
  // viewport. Waiting for `onHeroReady` before creating the trigger means
  // its first-ever measurement lands on the final, correct layout.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(el, FROM[variant]);
    const playIn = () =>
      gsap.to(el, { ...TO[variant], duration: 0.7, delay, ease: variant === 'scale' ? 'back.out(1.6)' : 'power2.out', overwrite: 'auto' });
    const playOut = () => gsap.to(el, { ...FROM[variant], duration: 0.4, ease: 'power1.in', overwrite: 'auto' });

    let st: ScrollTrigger | null = null;
    const unsubscribe = onHeroReady(() => {
      st = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        end: 'bottom 12%',
        onEnter: playIn,
        onEnterBack: playIn,
        onLeave: playOut,
        onLeaveBack: playOut,
      });
    });

    return () => {
      unsubscribe();
      st?.kill();
    };
  }, [delay, variant]);

  return createElement(Tag, { ref, className }, children);
}
