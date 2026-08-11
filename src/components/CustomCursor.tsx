import { useEffect, useRef } from 'react';

// Elements the cursor treats as "clickable" — outlines around these instead
// of the small dot. `[data-cursor-hover]` is an escape hatch for anything
// non-standard that should count (e.g. a drag surface) without being an
// <a>/<button> itself. No `label` — Contact's form labels wrap their input
// (`<label>Name<input/></label>`), so a bare `label` match grew the outline
// around the *whole* label (including text nowhere near the actual control)
// the instant the pointer touched the "Name"/"Email" text. The input itself
// still matches via `input`.
const HOVER_SELECTOR = 'a, button, input, textarea, select, [role="button"], [data-cursor-hover]';
const DOT_SIZE = 10;
// "The hover selection is taking place over the labels of the boxes" —
// tightly-packed rows (Navbar's pills are only `gap-1` apart, 4px) meant a
// 10px outline padding on the hovered element reached well past its own
// edge and covered a neighbor's label. Narrowed 10px -> 4px -> 2px -> back
// to 4px ("get back to 4 px") — 2px read as too tight.
const OUTLINE_PADDING = 4;
const OUTLINE_RADIUS = 10;
// Lerp factors (0-1, per frame) — how much of the remaining distance to the
// target each frame closes. Dot tracks almost 1:1; the outline eases behind
// it, same relative feel as the old quickTo durations (0.12s dot / 0.35s
// outline) but as a continuous per-frame fraction instead of a tween.
const DOT_LERP = 0.35;
const OUTLINE_LERP = 0.18;

/**
 * "Turn my cursor into a white circular void that, when it hovers on any
 * clickable item, makes an outline outside the hovered item." Two layered
 * fixed divs: a small solid dot that tracks the pointer 1:1(ish), and a
 * ring that's dot-sized by default but morphs to trace the bounding box of
 * whatever's under the pointer. Desktop-only — gated on a fine pointer so
 * touch devices keep native tap behavior, and skipped under
 * prefers-reduced-motion since the whole point of this is motion.
 *
 * Rewritten from a GSAP quickTo/gsap.to hybrid after that version kept
 * producing new "cursor stuck" failure modes (stuck beside a hovered
 * element after scrolling, stuck fully grown after a target="_blank" blur,
 * and — the one that prompted this rewrite — stuck motionless in empty
 * space right after leaving a hovered element). All of those traced back
 * to the same structural issue: hover target and cursor position were
 * driven by *two separate tween systems* (one-shot `gsap.to` calls for
 * transitions, `quickTo` for continuous tracking) racing to own the same
 * `x`/`y` properties, so a transition landing mid-frame could leave the
 * continuous tracker overwritten or never resumed.
 *
 * This version is a single continuous `requestAnimationFrame` loop instead:
 * one function, called every frame, that (1) re-derives what's under the
 * pointer *right now* via `elementFromPoint` at the last known coordinates
 * — not cached hover state from a `pointerover`/`pointerout` pair that
 * could've been missed — and (2) lerps the rendered position/size toward
 * that target by a fixed fraction each frame. There's only ever one thing
 * writing to the DOM per frame, so there's no property to race over, and
 * because the hover target and its `getBoundingClientRect()` are both
 * recomputed fresh every frame (not cached from the moment hover started),
 * scrolling while hovering an in-flow element just naturally tracks it —
 * no separate `scroll` listener needed, unlike the old version.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current;
    const outline = outlineRef.current;
    if (!dot || !outline) return;
    // Re-bound as explicitly non-null: TS's control-flow narrowing from the
    // guard above doesn't carry into the `render` closure defined below
    // (only the declared type does), so `dot`/`outline` would otherwise be
    // seen as nullable again inside it.
    const dotEl: HTMLDivElement = dot;
    const outlineEl: HTMLDivElement = outline;

    document.documentElement.classList.add('custom-cursor-active');

    let mouseX = 0;
    let mouseY = 0;
    let hasMouse = false;
    let visible = false;

    let dotX = 0;
    let dotY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let outlineW = DOT_SIZE;
    let outlineH = DOT_SIZE;
    let outlineR = 999;

    let rafId = 0;

    function render() {
      const target = hasMouse ? document.elementFromPoint(mouseX, mouseY) : null;
      const hit = target ? target.closest(HOVER_SELECTOR) : null;

      let targetX = mouseX;
      let targetY = mouseY;
      let targetW = DOT_SIZE;
      let targetH = DOT_SIZE;
      let targetR = 999;
      if (hit) {
        const rect = hit.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        targetW = rect.width + OUTLINE_PADDING * 2;
        targetH = rect.height + OUTLINE_PADDING * 2;
        targetR = OUTLINE_RADIUS;
      }

      dotX += (mouseX - dotX) * DOT_LERP;
      dotY += (mouseY - dotY) * DOT_LERP;
      outlineX += (targetX - outlineX) * OUTLINE_LERP;
      outlineY += (targetY - outlineY) * OUTLINE_LERP;
      outlineW += (targetW - outlineW) * OUTLINE_LERP;
      outlineH += (targetH - outlineH) * OUTLINE_LERP;
      outlineR += (targetR - outlineR) * OUTLINE_LERP;

      dotEl.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      dotEl.style.opacity = visible && !hit ? '1' : '0';

      outlineEl.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
      outlineEl.style.width = `${outlineW}px`;
      outlineEl.style.height = `${outlineH}px`;
      outlineEl.style.borderRadius = `${outlineR}px`;
      outlineEl.style.opacity = visible ? '1' : '0';

      rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);

    function onPointerMove(e: PointerEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMouse) {
        // First-ever move: snap instantly to the real position instead of
        // lerping in from (0, 0).
        hasMouse = true;
        dotX = outlineX = mouseX;
        dotY = outlineY = mouseY;
      }
      visible = true;
    }

    // Window losing focus (a target="_blank" link stealing it, Cmd+Tab,
    // devtools) or the pointer physically leaving the viewport — hide
    // either way. It reappears correctly positioned on the next real
    // pointermove, since position/hover are re-derived from scratch every
    // frame rather than restored from stale state.
    function onHide() {
      visible = false;
    }

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerleave', onHide);
    window.addEventListener('blur', onHide);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onHide);
      window.removeEventListener('blur', onHide);
    };
  }, []);

  return (
    <>
      {/* "The cursor and its outline are light grey in light mode, let me
          see them in black" — `mix-blend-difference` is what makes this
          cursor visible over anything (it inverts against whatever's
          under it), but it only actually reads as *black* when the
          source color is white — difference(white, backdrop) comes out
          dark whenever the backdrop itself is light, which is exactly
          light mode's page background. `text-hi` broke this: it's
          *theme-reactive* (light in dark mode, dark in light mode, for
          reading actual text), and a *dark* source against light mode's
          *light* background differences out to a light grey — backwards
          from what the blend mode needs. Fixed source color instead
          (`text-hi` isn't even in play here) — white works correctly in
          both themes: near-white result on dark mode's dark background,
          near-black result on light mode's light one. Tailwind has no
          `white` utility here (this project's `colors` config replaces
          the default palette rather than extending it), hence the
          arbitrary-value classes. */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-[10px] w-[10px] rounded-full bg-[#fff] opacity-0 mix-blend-difference will-change-transform"
      />
      <div
        ref={outlineRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] border border-[#fff] opacity-0 mix-blend-difference will-change-transform"
      />
    </>
  );
}
