import { ScrollReveal } from './ScrollReveal';

export function Footer() {
  return (
    <footer className="px-6 py-10 sm:px-10 lg:px-16">
      {/* "The footer is gone" — real bug, found via Playwright reading the
          live ScrollTrigger instance directly: at the true bottom of the
          page there's no more room left to scroll, and the default "top
          88%" trigger point sat just past the maximum possible scroll
          position — 57px short on a 900px viewport — so it could never
          fire. `top bottom` (fires as soon as any sliver of the element
          enters the viewport) is the standard fix for "the last thing on
          the page" specifically; every other ScrollReveal on the site
          keeps the default. */}
      <ScrollReveal
        start="top bottom"
        className="mx-auto flex w-full max-w-5xl items-center justify-between border-t border-surf-3 pt-6"
      >
        <p className="font-mono text-xs text-text-low">Kareem Aboelnaga</p>
        <p className="font-mono text-xs text-text-low">
          Built with React, Three.js and TypeScript · Alexandria, {new Date().getFullYear()}
        </p>
      </ScrollReveal>
    </footer>
  );
}
