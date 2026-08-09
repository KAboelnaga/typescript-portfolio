import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Depth cue between normal-flow sections — "parallax effect between every
 * section and the other." Each wrapped block drifts vertically at its own
 * `speed` as it crosses the viewport (scrubbed to real scroll position, not
 * a one-shot reveal like ScrollReveal), so sections with different speeds
 * separate from each other instead of moving in lockstep with the page.
 * Positive speed drifts down-then-up (lags the scroll); negative leads it.
 * Purely a transform — never affects layout/flow.
 */
export function Parallax({
  children,
  speed = 0.1,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(el, { y: (self.progress - 0.5) * -2 * speed * 100 });
      },
    });

    return () => st.kill();
  }, [speed]);

  return createElement(Tag, { ref, className }, children);
}
