import { useCallback, useEffect, useState } from 'react';

// Two floating affordances layered over the whole page (fixed, not scoped
// to any one section) — a scroll hint bottom-center, and a back-to-top
// bottom-right. The scroll-down hint stays visible/clickable pretty much
// everywhere — "I want the scroll part to be always there so that I can
// always click it to scroll down" — except right at the very end of the
// page, where "scroll down" has nothing left to do ("make the scroll
// button disappear if I reached the end of the website"). Back-to-top
// only makes sense once you've actually left the top, so it keeps its own
// threshold. The two never overlap (center vs. right), so showing both at
// once is fine. Deliberately minimal — no button chrome/fill, just an
// icon and a hairline ring that sweeps in on hover/focus (a "circular
// select" cue) — per Kareem: "more minimal... with an animation of the
// circular select on that button when approached."
const BACK_TO_TOP_SHOW_AFTER = 120;
const BOTTOM_HIDE_MARGIN = 24;

function HoverRing() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <circle
        cx="17"
        cy="17"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        // r=15 circle -> circumference = 2*PI*15 ~= 94. Hardcoded (not
        // computed) since Tailwind's arbitrary-value classes need the
        // literal number present as plain text for its build-time scan to
        // find them — a template-interpolated class name never matches.
        className="origin-center -rotate-90 opacity-0 [stroke-dasharray:94] [stroke-dashoffset:94] transition-[stroke-dashoffset,opacity] duration-500 ease-out group-hover:opacity-100 group-hover:[stroke-dashoffset:0] group-focus-visible:opacity-100 group-focus-visible:[stroke-dashoffset:0]"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5M6 11l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const buttonClass =
  'group fixed z-[60] flex items-center gap-3 text-text-low transition-colors duration-300 hover:text-signal focus-visible:text-signal focus-visible:outline-none';

const iconWrapClass = 'relative flex h-[34px] w-[34px] shrink-0 items-center justify-center';

export function ScrollControls() {
  const [scrollY, setScrollY] = useState(0);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    let ticking = false;
    function measure() {
      setScrollY(window.scrollY);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setAtBottom(window.scrollY >= scrollable - BOTTOM_HIDE_MARGIN);
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollDown = useCallback(() => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showBackToTop = scrollY >= BACK_TO_TOP_SHOW_AFTER;
  const showScrollDown = !atBottom;

  return (
    <>
      <button
        type="button"
        aria-label="Scroll down"
        aria-hidden={!showScrollDown}
        tabIndex={showScrollDown ? 0 : -1}
        onClick={scrollDown}
        className={`${buttonClass} bottom-8 left-1/2 -translate-x-1/2 ${
          showScrollDown ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Scroll</span>
        <span className={iconWrapClass}>
          <HoverRing />
          <ChevronDownIcon />
        </span>
      </button>

      <button
        type="button"
        aria-label="Back to top"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        onClick={scrollToTop}
        className={`${buttonClass} bottom-8 right-6 sm:right-10 ${
          showBackToTop ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <span className={iconWrapClass}>
          <HoverRing />
          <ArrowUpIcon />
        </span>
      </button>
    </>
  );
}
