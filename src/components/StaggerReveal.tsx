import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onPinsReady } from '../scenes/contactReady';

gsap.registerPlugin(ScrollTrigger);

/**
 * Pops each direct child in individually, staggered, instead of the whole
 * group fading in as one block — for tag/pill lists (stack tags, skill
 * tags) where a single `ScrollReveal` around the `<ul>` reveals every tag
 * at the exact same instant since they all sit at the same scroll
 * position. Operates on `el.children` directly so it works with whatever
 * the caller renders inside (`<li>`s, `<span>`s, ...).
 *
 * Replays every time the group scrolls into view (either direction),
 * resetting to hidden when it scrolls back out — same "redo the animation
 * every time the desired component is active" behavior as `ScrollReveal`.
 * A `SkillTag`'s own brand-color state (see SkillTag.tsx) is independent
 * of this component's opacity/scale reset, so a tag that's already been
 * colorized stays colored through repeated pop-in/pop-out cycles here.
 */
export function StaggerReveal({
  children,
  stagger = 0.06,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  // Gated on `onPinsReady` (waits for Hero's *and* Contact's pins, not
  // just Hero's) for the same reason as ScrollReveal.tsx — a trigger
  // created before every pin on the page exists measures itself against a
  // still-short page and fires far too early once real scrolling reaches
  // that stale (now-wrong) pixel offset. See contactReady.ts.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = Array.from(el.children);
    if (items.length === 0) return;

    gsap.set(items, { opacity: 0, y: 10, scale: 0.9 });
    const playIn = () =>
      gsap.to(items, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger, ease: 'back.out(1.7)', overwrite: 'auto' });
    const playOut = () =>
      gsap.to(items, { opacity: 0, y: 10, scale: 0.9, duration: 0.3, stagger: stagger / 2, ease: 'power1.in', overwrite: 'auto' });

    let st: ScrollTrigger | null = null;
    const unsubscribe = onPinsReady(() => {
      st = ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        end: 'bottom 10%',
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
  }, [stagger]);

  return createElement(Tag, { ref, className }, children);
}
