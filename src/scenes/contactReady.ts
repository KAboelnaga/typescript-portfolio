/**
 * Same pub-sub as `heroReady.ts`, for the same reason, one page-section
 * later: Contact's own pin (~210vh) only gets created once
 * `ContactTimeline.tsx` has waited for `onHeroReady`, which means it lands
 * in a *later* render than the tick where `markHeroReady()` itself fires.
 * Anything positioned after Contact in the document — right now, only
 * `Footer.tsx` — that measures its own scroll-trigger position as soon as
 * Hero is ready is measuring against a page that's still missing Contact's
 * entire pin spacer, landing thousands of pixels short of where it actually
 * ends up.
 *
 * Real bug, found this way: Footer's `ScrollReveal` stayed permanently
 * stuck at `opacity: 0` — scrolled all the way to the true bottom of the
 * page and read the live `ScrollTrigger` instance directly (reached via
 * `window.__heroScrollTrigger.constructor.getAll()`, since `gsap` isn't
 * global): `start`/`end` were ~1800px short of the footer's real position,
 * `progress: 1, isActive: false` — the trigger believed it had already
 * been entered *and left* long before the real footer ever came within
 * 1800px of the viewport. See `onPinsReady` (`ScrollReveal.tsx` and
 * friends) for the actual fix — wait for this too, not just `onHeroReady`.
 */
import { onHeroReady } from './heroReady';

let ready = false;
const listeners: Array<() => void> = [];

export function markContactReady() {
  if (ready) return;
  ready = true;
  listeners.splice(0).forEach((fn) => fn());
}

export function onContactReady(fn: () => void): () => void {
  if (ready) {
    fn();
    return () => {};
  }
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

/**
 * What every position-agnostic scroll-triggered component (`ScrollReveal`,
 * `StaggerReveal`, `CountUp`, `SkillTag`) actually wants: wait for *every*
 * pin currently on the page to exist, not just Hero's, before trusting any
 * `getBoundingClientRect()`-based measurement. Contact is the last pin, so
 * waiting for both (in order — Contact's own creation already depends on
 * Hero's) covers anything anywhere on the page, not just the one component
 * that happened to sit after Contact today.
 */
export function onPinsReady(fn: () => void): () => void {
  let contactUnsub: (() => void) | null = null;
  const heroUnsub = onHeroReady(() => {
    contactUnsub = onContactReady(fn);
  });
  return () => {
    heroUnsub();
    contactUnsub?.();
  };
}
