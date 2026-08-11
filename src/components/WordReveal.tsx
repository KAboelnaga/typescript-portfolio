import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../theme/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

/**
 * "See the animation of this text too [majd-portfolio.framer.website] —
 * I would love to make this in the about section text, for example."
 * Splits text into per-word spans, each dimmed (`text-low`) by default,
 * brightening to full contrast (`text-hi`) word by word as the page
 * scrolls past — not the whole block fading in at once.
 *
 * `standalone` (default true) sets up its own scroll-scrubbed
 * ScrollTrigger against the element's own position in the document, for
 * normal in-flow content. Hero's About Me text is pinned/fixed instead —
 * its position never changes while visible — so HeroTimeline drives that
 * instance's `[data-word-reveal]` spans directly off its own beat
 * progress; pass `standalone={false}` there and skip this component's own
 * trigger entirely.
 */
export function WordReveal({
  text,
  className,
  standalone = true,
}: {
  text: string;
  className?: string;
  standalone?: boolean;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const { colors, mode } = useTheme();

  useLayoutEffect(() => {
    if (!standalone || !containerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = containerRef.current.querySelectorAll<HTMLElement>('[data-word-reveal]');
    if (words.length === 0) return;

    const tween = gsap.fromTo(
      words,
      { color: colors.textLow },
      {
        color: colors.textHi,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'bottom 55%',
          scrub: 0.4,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // Rebuilds on theme toggle too, so a standalone WordReveal already
    // scrolled past doesn't get stuck holding the other theme's color.
  }, [standalone, mode, colors]);

  const words = text.split(' ');

  return (
    <span ref={containerRef} className={className}>
      {/* `text-text-low` (a live CSS var), not `style={{ color:
          colors.textLow }}` — GSAP writes this element's inline
          `color` directly once its tween takes over, and an inline
          style here would fight it: any unrelated re-render of this
          component (e.g. a theme toggle, since it reads `useTheme()`
          itself) re-applies the JSX-declared inline color, stomping
          whatever GSAP had rendered back to this default until the
          next scroll event re-drives the tween. A plain class has no
          such conflict — React never touches `color` here again after
          first paint, so GSAP's imperative writes stick, and the CSS
          var itself still updates live on toggle for any span GSAP
          hasn't reached yet. */}
      {words.map((word, i) => (
        <span key={i} data-word-reveal className="text-text-low">
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}
