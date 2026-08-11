# Kareem Aboelnaga — Portfolio

Single-page portfolio: a scripted 3D intro (a character at a desk) that hands
off to a normal, fully-accessible document. Built content-first — the
plain-HTML page works completely on its own; the 3D is layered on top of it,
not the other way around.

- **Source of truth:** [SPEC.md](./SPEC.md) — read this before touching
  design tokens, copy, or the camera timeline.
- **What's done:** [DONE.md](./DONE.md)
- **What's next / open questions:** [TODO.md](./TODO.md) — check here (and
  DONE.md) before asking whether something is already planned.
- **Swapping a project's preview image/video:** [PROJECT_PREVIEWS.md](./PROJECT_PREVIEWS.md)
- **What every component does:** [COMPONENTS.md](./COMPONENTS.md)

## Stack

Vite + React + TypeScript (strict) · Tailwind · three.js +
`@react-three/fiber` + `@react-three/drei` · GSAP + ScrollTrigger

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build
npm run preview   # serve the production build locally
```

## Dev tools

The whole page is scroll-driven, intro turn included (see DONE.md) — no
autoplay to wait for, no Skip button. Before you scroll at all, **press and
drag directly on the character to freely orbit around him**
(`PreScrollOrbit.tsx`); the instant you scroll, dragging disables itself and
the scripted sequence takes over from its starting framing. With
`npm run dev` running, in the browser console:

- **Hero sequence** (intro turn → entrance text → About Me → monitor
  approach → deep black pass-through → code words → projects glimpse):
  `window.__heroTimeline` / `window.__heroScrollTrigger`. Also
  `window.__camera` / `window.__upperBody` for direct references.
- **Contact scene** (its own independent `<Canvas>` — see DONE.md for why
  it's a second canvas, not one shared one): `window.__contactTimeline` /
  `window.__contactScrollTrigger` / `window.__contactCamera`.
- A live camera readout (position/rotation/fov) is pinned bottom-left once
  the Hero sequence's `ScrollTrigger` is created.
- Scrub with `.progress(0-1)`, not `.seek(seconds)` — `.seek()` suppresses
  GSAP's update callbacks by default, so a scrubbed frame can look wrong
  (camera not aimed correctly, since the look-at logic lives in an
  `onUpdate` callback) even though real playback is completely fine. Cost
  real debugging time once already — see DONE.md.
- `OrbitControls` dragging was retired entirely — it fought the
  scroll-driven camera for control. `PreScrollOrbit` (above) replaces it for
  the pre-scroll moment; after scrolling starts, scrubbing via the console
  hooks is the way to explore framings, not dragging.

None of this — the overlay, the hooks, `OrbitControls` — is present in the
production build.
