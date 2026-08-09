import { useEffect, useRef } from 'react';
import gsap from 'gsap';

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
const OUTLINE_PADDING = 10;
const OUTLINE_RADIUS = 10;

/**
 * "Turn my cursor into a white circular void that, when it hovers on any
 * clickable item, makes an outline outside the hovered item." Two layered
 * fixed divs: a small solid dot that tracks the pointer 1:1(ish), and a
 * ring that's dot-sized by default but morphs to trace the bounding box of
 * whatever's under the pointer, growing outward from it (padding, not
 * clipping to its edges). Desktop-only — gated on a fine pointer so touch
 * devices keep native tap behavior, and skipped under
 * prefers-reduced-motion since the whole point of this is motion.
 *
 * Hover state is derived fresh from `e.target` on every single
 * `pointermove`, not from separate `pointerover`/`pointerout` listeners —
 * "sometimes the cursor becomes buggy after leaving a hovered space" was
 * exactly the failure mode of the discrete-event approach: any missed or
 * out-of-order enter/leave pair (fast mouse movement across adjacent
 * elements, a child element swallowing the event, the pointer leaving the
 * window mid-hover) left `hovering` stuck true with no more events left to
 * un-stick it. Re-deriving "what's actually under the pointer right now"
 * every move is self-correcting by construction — there's no persistent
 * state that can drift from reality for more than one frame.
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

    document.documentElement.classList.add('custom-cursor-active');

    gsap.set([dot, outline], { xPercent: -50, yPercent: -50 });
    gsap.set(outline, { width: DOT_SIZE, height: DOT_SIZE, borderRadius: 999 });

    const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const moveOutlineX = gsap.quickTo(outline, 'x', { duration: 0.35, ease: 'power3.out' });
    const moveOutlineY = gsap.quickTo(outline, 'y', { duration: 0.35, ease: 'power3.out' });

    let visible = false;
    let currentTarget: Element | null = null;

    // x/y and width/height/radius always animate together in ONE tween,
    // whether growing onto a target or shrinking back to a dot at the
    // pointer's current position — "the cursor maintains its dimensions and
    // keeps the rectangle there in an empty space after leaving a hovered
    // object" was two separate tweens racing: growToTarget used to animate
    // x/y *and* size together, but the old shrinkToDot only touched
    // width/height/radius, leaving x/y still mid-flight toward the just-left
    // element (or fully overwritten seconds later by unrelated quickTo
    // calls) whenever the pointer left before the grow tween had finished.
    // `overwrite: 'auto'` makes this tween the sole owner of every property
    // it touches the instant it starts, so there's no split-brain state.
    function setOutline(x: number, y: number, width: number, height: number, radius: number, duration: number) {
      gsap.to(outline, { x, y, width, height, borderRadius: radius, duration, ease: 'power3.out', overwrite: 'auto' });
    }

    function onPointerMove(e: PointerEvent) {
      if (!visible) {
        visible = true;
        gsap.to([dot, outline], { opacity: 1, duration: 0.2 });
      }
      moveDotX(e.clientX);
      moveDotY(e.clientY);

      const hit = e.target instanceof Element ? e.target.closest(HOVER_SELECTOR) : null;
      if (hit !== currentTarget) {
        currentTarget = hit;
        if (hit) {
          const rect = hit.getBoundingClientRect();
          setOutline(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width + OUTLINE_PADDING * 2,
            rect.height + OUTLINE_PADDING * 2,
            OUTLINE_RADIUS,
            0.35,
          );
          gsap.to(dot, { opacity: 0, duration: 0.2 });
        } else {
          setOutline(e.clientX, e.clientY, DOT_SIZE, DOT_SIZE, 999, 0.3);
          gsap.to(dot, { opacity: 1, duration: 0.2 });
        }
      } else if (!currentTarget) {
        // Not hovering anything and nothing changed — just keep tracking
        // the pointer smoothly (the fast path; setOutline already handled
        // the transition frame above).
        moveOutlineX(e.clientX);
        moveOutlineY(e.clientY);
      }
    }

    function onPointerLeave(e: PointerEvent) {
      visible = false;
      currentTarget = null;
      gsap.to([dot, outline], { opacity: 0, duration: 0.2 });
      setOutline(e.clientX, e.clientY, DOT_SIZE, DOT_SIZE, 999, 0.2);
    }

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerleave', onPointerLeave);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-[10px] w-[10px] rounded-full bg-text-hi opacity-0 mix-blend-difference"
      />
      <div
        ref={outlineRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] border border-text-hi opacity-0 mix-blend-difference"
      />
    </>
  );
}
