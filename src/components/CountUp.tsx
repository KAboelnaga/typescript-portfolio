import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onPinsReady } from '../scenes/contactReady';

gsap.registerPlugin(ScrollTrigger);

/**
 * "Add that number animation to the numbers of the Rustaq [stats] that
 * when they appear they start incrementing." Parses the comma-formatted
 * target once, counts up from 0 on first scroll-into-view, and
 * re-formats with the same thousands separators each frame — so
 * "1,069" counts 0 -> 1,069 rather than animating the raw string.
 * Respects prefers-reduced-motion by rendering the final value directly.
 *
 * "Redo the animation every time the desired component is active" —
 * recounts from 0 every time it scrolls into view (either direction),
 * resetting back to the placeholder when it scrolls back out, rather than
 * counting up once and staying at the final value forever.
 */
export function CountUp({
  value,
  className,
  style,
}: {
  value: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const target = Number(value.replace(/[^0-9.-]/g, ''));
  const [display, setDisplay] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? value : value.replace(/[0-9]/g, '0'),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || Number.isNaN(target)) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    const counter = { n: 0 };
    let countTween: gsap.core.Tween | null = null;
    const playIn = () => {
      countTween?.kill();
      countTween = gsap.to(counter, {
        n: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => setDisplay(Math.round(counter.n).toLocaleString('en-US')),
      });
    };
    const playOut = () => {
      countTween?.kill();
      counter.n = 0;
      setDisplay(value.replace(/[0-9]/g, '0'));
    };

    let st: ScrollTrigger | null = null;
    // Gated on `onPinsReady` (waits for every pin on the page, not just
    // Hero's — see contactReady.ts) — created too early, this trigger
    // would measure itself against a still-short page and count up while
    // still thousands of pixels below the viewport. Reproduced via
    // Playwright: without this gate, the Work-section stats started
    // counting ~6000px before they were ever visible.
    const unsubscribe = onPinsReady(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, value]);

  return (
    <p ref={ref} className={className} style={style}>
      {display}
    </p>
  );
}
