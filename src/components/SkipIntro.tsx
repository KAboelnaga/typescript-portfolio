import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { HERO_SCROLL_PIN_VH } from '../scenes/timeline';

gsap.registerPlugin(ScrollToPlugin);

const SKIP_DURATION = 1.4;

/**
 * "Skip intro" — CONTENT.md's micro-copy table lists a `Skip` button that
 * didn't exist before this. Reverses an explicit earlier decision
 * (HeroTimeline.tsx used to document "no autoplay, no Skip button... the
 * whole point of going scroll-driven is that the user already controls
 * the pace") — noting that here rather than silently dropping the old
 * reasoning, since CONTENT.md is a deliberate content spec, not an
 * oversight. Visible only while still inside the Hero pin; animates
 * scroll to the pin's end via the same GSAP ScrollToPlugin approach as
 * Navbar, so it plays out like a fast-forward rather than a hard jump.
 */
export function SkipIntro() {
  const [visible, setVisible] = useState(true);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    function pinEnd() {
      return window.innerHeight * (HERO_SCROLL_PIN_VH / 100);
    }
    function onScroll() {
      setVisible(window.scrollY < pinEnd() - 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function skip() {
    const targetY = window.innerHeight * (HERO_SCROLL_PIN_VH / 100);
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(window, {
      duration: SKIP_DURATION,
      scrollTo: { y: targetY, autoKill: true },
      ease: 'power2.inOut',
    });
  }

  return (
    <button
      type="button"
      onClick={skip}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      // top-20 on mobile, dropping below the Navbar pill instead of
      // overlapping it — at narrow widths the pill has to span nearly the
      // full viewport to fit five items + CV, which put it directly under
      // this button at the original top-4 (found via a mobile-viewport
      // Playwright pass: "Work" was rendering but functionally
      // unreachable, covered by this button sitting on the same z-index
      // right on top of it). sm:top-4 restores the original beside-the-nav
      // position once the pill is comfortably narrower than the viewport.
      className={`fixed left-4 top-20 z-50 rounded-full border border-surf-3 bg-void/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-text-low backdrop-blur transition-all duration-300 hover:text-signal focus-visible:outline-none sm:left-6 sm:top-5 sm:text-xs ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      Skip
    </button>
  );
}
