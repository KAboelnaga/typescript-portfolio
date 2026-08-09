import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade+rise reveal for normal (non-pinned) document-flow content, e.g.
 * project cards — "adding scrolling effects to the projects elements."
 * Fires once per element the first time it's scrolled into view, not on
 * every scroll up/down. Respects prefers-reduced-motion by just skipping
 * the animation (content stays visible, no opacity-0 flash).
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(el, { opacity: 0, y: 32 });
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power2.out' }),
    });

    return () => st.kill();
  }, [delay]);

  return createElement(Tag, { ref, className }, children);
}
