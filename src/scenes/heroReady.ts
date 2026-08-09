/**
 * Tiny pub-sub so ContactTimeline can wait for HeroTimeline's ScrollTrigger
 * pin to exist before creating its own.
 *
 * Why this exists: ContactTimeline's pin used to create itself immediately
 * on mount (nothing gated it), which usually happens *before* HeroTimeline's
 * — Hero's pin waits on the character model loading. That meant Contact's
 * ScrollTrigger measured its trigger position against a page that was still
 * short (before Hero's much-taller pin spacer existed), landing on a wrong,
 * far-too-early scroll position — the Contact scene would visibly overlap
 * the Hero scene. A `ScrollTrigger.refresh()` after the fact seemed like
 * the obvious fix, but empirically the static `ScrollTrigger.refresh()`
 * (refresh-all) never actually recalculated Contact's trigger, even though
 * calling `.refresh()` on that specific instance did — never got to the
 * bottom of why. Waiting for Hero's pin to genuinely exist before Contact's
 * is ever created sidesteps the mystery: Contact's first-ever measurement
 * is correct because the layout is already correct by the time it happens.
 */
let ready = false;
const listeners: Array<() => void> = [];

export function markHeroReady() {
  if (ready) return;
  ready = true;
  listeners.splice(0).forEach((fn) => fn());
}

export function onHeroReady(fn: () => void): () => void {
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
