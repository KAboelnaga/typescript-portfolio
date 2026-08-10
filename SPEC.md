# Portfolio Build Spec — Kareem Aboelnaga

> **This file is significantly stale as of 2026-08-09 and is kept for
> historical context, not as the current source of truth.** It describes
> the *original* pre-build plan — a single ~3.6s autoplaying intro, three
> named projects, no light mode, a 250vh scroll ceiling. Kareem redirected
> almost every part of this substantially over many rounds of direct,
> in-conversation feedback (documented turn-by-turn in `DONE.md`), and the
> site now differs from this document in ways too extensive to keep
> patching inline. **Current authoritative sources, in order of what
> they cover:**
> - **`CONTENT.md`** — all real user-facing copy (Kareem's own file,
>   supersedes section 6 below entirely).
> - **`DONE.md`** — the actual build history, newest first, with the
>   real reasoning behind every design decision as it happened.
> - **`TODO.md`** — what's still open, first-pass, or waiting on Kareem.
> - **`src/scenes/timeline.ts`** — the real current camera/timing
>   constants (still true to section 9's "single home for timing
>   constants" rule below, just with a completely different shot list
>   than section 4 describes).
>
> Genuinely still true: section 1 (stack — no new dependencies added
> beyond what's listed, aside from a one-off `simple-icons` extraction
> that was deliberately *not* kept as a runtime dependency, see DONE.md
> 2026-08-09 (9)); section 3's actual hex values (the dark palette never
> drifted from what's written below, confirmed against CONTENT.md
> verbatim — though **light mode now exists**, contradicting this
> section's "No light mode" instruction, added per direct request);
> section 9's working agreement in spirit.
>
> **The real shot list, briefly:** press-and-drag orbit before scrolling
> starts → scroll-driven intro turn (continuous, one direction, no
> autoplay phase at all — the whole thing is scroll-scrubbed from frame
> one) → entrance text → About Me → a beat that moves the camera through
> the character to his own eye position → rapid zoom into the monitor →
> black pass-through with flying code words → a projects title card,
> still "inside the monitor" → real Work section (Rustaq case study with
> a stat strip, Independent Developer) → real Projects grid (four cards,
> not three) → Skills (tiered, not ranked, with real logos) → About
> (three paragraphs) → Education/Competitive-programming/Languages → own
> independently-pinned Contact scene (camera zooms back out, character
> ends lower-right, drag + cursor-follow once settled). A Navbar
> fast-forwards between sections; a Skip button exists (reversing this
> doc's own "no Skip button" framing further down — CONTENT.md asked for
> one directly).
>
> Read this file for the *reasoning* behind the original design tokens
> and structural rules (still largely honored), not for what the page
> currently does.

Lines marked `[VERIFY]` below are from the original draft and may or may
not still be open — check `TODO.md` for current status before assuming
one is still unresolved.

---

## 0. What this is

A single-page portfolio for a backend / full-stack engineer (Python, Django,
FastAPI, PostgreSQL, React). The page opens with a scripted 3D sequence of a
character at a desk, then hands off to a normal document.

**The page has one job:** get a hiring manager from "who is this" to "here are
three real systems he built" in under thirty seconds.

The 3D is the delivery mechanism, not the content. If WebGL fails, the model
404s, or the visitor is on a phone, the page must still do its job in plain HTML.
Build it in that order: content first, 3D layered on top.

---

## 1. Stack

- Vite + React + **TypeScript** (strict mode on)
- `three`, `@react-three/fiber`, `@react-three/drei`
- `gsap` + `ScrollTrigger` for the camera timeline
- Tailwind for DOM layout
- No component library. No UI kit. Write the CSS.

**Do not add any dependency not listed here without asking me first.**

`gsap` is the choreographer, not drei's `ScrollControls` — the timeline is a
scripted sequence with named beats, and GSAP's timeline API maps to that
directly. Use `ScrollTrigger` with `scrub` for the scroll-driven half.

If camera keyframes become painful to hand-tune, stop and tell me — Theatre.js
is the escape hatch, but don't reach for it unprompted.

---

## 2. The model

`[VERIFY]` I don't know whether the character exports from Claude Design as a
`.glb` file or as Three.js source. Ask me before starting.

**If `.glb`:**
- Lives at `/public/models/character.glb`
- Run it through `gltf-transform` with Draco compression before committing
- Hard budget: **under 3 MB**. If it won't compress under that, tell me the
  number rather than shipping it.
- Load with `useGLTF`, preload with `useGLTF.preload()`

**If Three.js source:** we adapt — bring me the file and we'll decide together.

The model needs a named node for the head or upper body so the intro rotation
can target it. If the export has no useful node names, say so and we'll rename
them in Blender rather than animating the whole scene root.

---

## 3. Design tokens

Derive every color and size from this. Do not introduce values outside it.

### Color

Dark-native, not an inverted light theme. Every surface is a blue-tinted dark
gray — **never `#000000`**. Pure black kills the elevation steps below and makes
bright text bloom against it.

**Surfaces** — depth is lightness, not shadow. Each step is ~3–4 lightness
points. Do not use `box-shadow` to raise anything; move it up a step instead.

| Token | Hex | Use |
|---|---|---|
| `void` | `#0A0D12` | Behind everything. Letterboxing, the canvas clear color, the intro fade. |
| `base` | `#111721` | Page background. This is the default surface. |
| `surf-1` | `#171E29` | Project cards, any raised block. |
| `surf-2` | `#1E2733` | Hover state for anything on `surf-1`. |
| `surf-3` | `#26303D` | Active/pressed state. Also hairline borders and dividers. |

**Text** — no pure white anywhere.

| Token | Hex | Use | Contrast on `base` |
|---|---|---|---|
| `text-hi` | `#E4E7EB` | Headings, the name, project titles. | ~14:1 |
| `text-mid` | `#A3ACBA` | Body copy, descriptions. | ~7.5:1 |
| `text-low` | `#6B7685` | Mono metadata, years, stack tags. | ~3.6:1 |

`text-low` fails AA for small body text. It is allowed **only** at 14px+ mono
for metadata that isn't load-bearing. If real information ends up in it, promote
it to `text-mid`.

**Accents** — saturation is pulled down from where it would sit in a light
theme. Fully saturated color on a dark surface reads as aggressive and vibrates
at the edges.

| Token | Hex | Use |
|---|---|---|
| `lamp` | `#D99A45` | **Primary accent.** Warm amber. |
| `lamp-glow` | `#8A5F2A` | Ambient glow, emissive falloff, subtle borders. Never text. |
| `signal` | `#52A398` | Links, hover, focus rings. Desaturated teal. |

`[VERIFY]` The contrast figures above are my estimates. Run the real numbers
during the stage 6 a11y pass and tell me if any of them miss.

**The signature idea:** `lamp` is not an arbitrary brand color — it is the color
of the desk lamp inside the 3D scene. The lamp is the key light on the
character's face, the monitor's glow, and the DOM accent, all the same value.
The scene lights the page. Wire the R3F lights to the same constants the CSS
uses so they can never drift apart. Put them in `src/theme/tokens.ts` and import
from both sides — `lamp` as the light color, `lamp-glow` as the emissive falloff.

`signal` is the cool counterweight — it appears only on things the visitor can
interact with, never decoratively. If it shows up on something that isn't
clickable, that's a bug.

**No light mode.** Don't build a toggle, don't write light-mode tokens, don't add
`dark:` variants in Tailwind. The 3D scene is lit for a dark page and a light
theme would require relighting it. Set the tokens as the root values.

> **Superseded 2026-08-09:** Kareem asked directly for a dark/light
> toggle (a clickable 3D light bulb in the navbar). It exists now —
> `theme/tokens.ts`'s `lightColor` export, applied via CSS custom
> properties rather than Tailwind `dark:` variants (see
> `theme/ThemeContext.tsx`), defaulting to dark regardless of OS
> preference since this palette is still the primary, better-verified
> one. See `DONE.md` 2026-08-08/09 for the full history.

Set `<meta name="theme-color" content="#111721">` and
`color-scheme: dark` on `:root` so the browser chrome and form controls match.

### Type

- **Display:** Bricolage Grotesque (variable). Used for the name and section
  headings only. Exploit the variable width axis — the name should be set
  wide and heavy, section headings narrower. Restraint: nowhere else.
- **Body:** Instrument Sans. Everything readable.
- **Utility:** JetBrains Mono. Metadata only — years, roles, stack tags, the
  scroll hint. This is an engineer's page; the mono is vernacular, not decoration.

Self-host the fonts in `/public/fonts` with `font-display: swap`. No Google
Fonts CDN call.

Type scale (rem): `0.75 / 0.875 / 1 / 1.25 / 1.75 / 2.5 / 4 / 6.5`

### Structural rule

**No `01 / 02 / 03` numbering on the projects.** They are not a sequence and
numbering them would imply a ranking that isn't real. Label each project with
its year and the honest role instead — `2025 · sole developer`,
`2024 · frontend only`. That encodes something true.

---

## 4. Shot list

This is the part to get exactly right. Every timing below is a named constant in
`src/scenes/timeline.ts` — no magic numbers in component files.

### Phase 1 — Intro (autoplays on load, not scroll-driven)

Total budget: **3.6 s**. This is a hard ceiling.

| Beat | Time | Camera | Character | DOM |
|---|---|---|---|---|
| `FADE_IN` | 0 → 0.4s | Tight, behind and slightly above the head. Character occupies the left third. | Back of head to camera, facing his monitor. | Black overlay fades out. |
| `TURN` | 0.4 → 1.4s | Slow arc left-to-right around the character, easing to a medium three-quarter. | Head and torso rotate toward camera. | — |
| `HOLD` | 1.4 → 2.4s | Static. Medium-close: shoulders and desk edge in frame. | Settled, facing camera. Subtle idle breathing only. | — |
| `SETTLE` | 2.4 → 3.6s | Pull back and rise to **~30° elevation**, slow continuous zoom-out. | Drifts to lower-right of frame, full desk now visible. | Name, title, intro fade in over the last 0.5s. |

**On the close-up.** You asked for a two-second hold on the face. `HOLD_MS` is a
constant defaulting to `1000`, not `2000`, and the framing is medium-close
rather than tight on the face. Reason: a tight close-up is the harshest possible
test of a generated 3D human, and the model still needs fixes. Shoulders-and-desk
reads as confident; a tight face hold invites scrutiny the geometry may not
survive. Both values are one-line changes — tune them once you can see it
rendering and decide for yourself.

**Skip behaviour, non-negotiable:**
- Any scroll, click, keypress, or touch during the intro snaps immediately to
  the `SETTLE` end state. No "wait for the animation."
- `prefers-reduced-motion: reduce` → skip the whole intro, render the end state
  on first paint.
- A visible **Skip** control, keyboard-focusable, from 0.4s onward.

### Phase 2 — Scroll-driven

`ScrollTrigger` with `scrub: 1`, pinned. **Total scroll distance: 250vh maximum.**
Longer than that and it stops feeling like a sequence and starts feeling broken.

| Scene | Progress | What happens |
|---|---|---|
| `A_HERO` | 0 → 0.30 | Character holds lower-right with desk. Name, title, intro readable. Ambient idle only. |
| `B_APPROACH` | 0.30 → 0.70 | Camera dollies toward the monitor. Character rotates back toward the screen. Monitor emissive intensity ramps `0.2 → 1.0`. Hero text fades out. |
| `C_PORTAL` | 0.70 → 1.00 | Monitor fills frame. Project cards emit outward from the screen surface, staggered ~120ms. Character and scene fade to `void`. |

At `progress: 1.0`, **unpin and hand off to normal document scroll.** Everything
below this point is ordinary HTML. Do not scroll-jack past the portal.

The monitor moment is the one thing on this page worth remembering. Spend the
polish budget there and keep everything around it quiet.

---

## 5. Mobile and fallback

Not an afterthought — build it in the same pass.

- **Under 768px, or `navigator.hardwareConcurrency <= 4`, or no WebGL2:** do not
  mount the canvas at all. Render `/public/images/hero-still.webp` — a static
  render of the `SETTLE` framing — with the DOM text over it. Normal sections below.
- Generate that still by screenshotting the desktop scene at the `SETTLE`
  keyframe. Tell me when it's ready and I'll confirm the framing.
- Detect once on mount. No resize thrashing between modes.
- Lazy-load the model: the DOM text renders on first paint, the canvas mounts after.

**Every piece of text on this page is real DOM.** No `<Text3D>`, no text baked
into a texture. If the canvas never mounts, the page is still complete and
readable.

---

## 6. Content

`[VERIFY]` Confirm the copy with me before shipping — I've drafted from what I
know, and the role attributions in particular must stay exactly as written.
Do not upgrade "frontend only" to something more impressive.

**Name:** Kareem Aboelnaga
**Title:** Backend & full-stack engineer — Python, Django, React
**Location:** Alexandria, Egypt

**Intro** (draft, ~35 words — rewrite for rhythm, keep the specificity):
> I build administrative systems that people actually have to use every day —
> permissions, workflows, exports, Arabic-first interfaces. Computer Engineering
> graduate, AASTMT. Currently looking for backend or full-stack work.

**Projects** — three, in this order:

1. **Rustaq Municipality System** — `2025 · sole developer · freelance`
   Django administration system for a municipality in Oman. Multi-branch
   hierarchy, tiered permissions, inspection form exports, heavily customized
   Django Admin in Arabic RTL. Deployed on shared cPanel hosting.
   Stack: `Django` `PostgreSQL` `Arabic RTL`
   No public repo — client work. Do not render a dead GitHub link.

2. **Pet Society** — `2024 · full-stack, team project`
   React and Django app with real-time features via Django Channels.
   Stack: `React` `Django` `Channels` `WebSockets`
   Note in the copy that the WebSocket chat layer was a teammate's work.

3. **SIC/XE Assembler & Linker-Loader** — `2023 · sole developer`
   Two-pass assembler and linking loader for the SIC/XE architecture. Symbol
   tables, relocation records, control section resolution.
   Stack: `C++` `systems`
   This one carries weight with anyone who reads it properly. Give it equal
   visual footing with the other two — do not bury it last by making it smaller.

**Do not add any project not listed above.** If the page looks thin with three,
it looks thin. Three real ones beat six padded ones.

---

## 7. Quality floor

Meet these without announcing them in the UI:

- Lighthouse performance ≥ 85 on desktop, ≥ 70 on mobile
- Largest Contentful Paint under 2.5s — the DOM text is the LCP element, not the canvas
- Visible keyboard focus everywhere, using `signal`. Never `outline: none`.
- Full keyboard traversal. The 3D sequence is never a keyboard trap.
- `prefers-reduced-motion` respected across every animation, DOM and 3D
- Semantic landmarks: `<header>`, `<main>`, `<section>`, one `<h1>`
- Canvas marked `aria-hidden="true"` — it carries no information a screen reader needs
- Target ~55fps desktop. If the scroll scrub stutters, cut scene complexity
  before cutting frames.

---

## 8. Build order

Work in this sequence. **Stop at the end of each stage and show me before continuing.**

1. **Skeleton.** Vite + TS + Tailwind, tokens wired, fonts self-hosted. Full page
   in plain HTML — hero, projects, contact, all content, fully responsive. No 3D
   at all. This must be a shippable portfolio on its own.
2. **Model in frame.** Canvas mounts, model loads, lighting set from the shared
   tokens. Temporary `OrbitControls` plus a dev-only overlay printing live camera
   position and rotation so I can read exact values off each framing.
3. **Intro timeline.** Phase 1 only, using the coordinates I give you from stage 2.
   Skip control and reduced-motion path included in this stage, not bolted on later.
4. **Scroll sequence.** Phase 2, scenes A and B. No portal yet.
5. **The portal.** Scene C. This is the stage that deserves real iteration —
   expect several passes.
6. **Fallback and polish.** Mobile still image, perf pass, a11y audit.

Do not skip ahead. Stage 1 alone is a working portfolio I could deploy tomorrow —
that property is the whole point of the ordering.

---

## 9. Working agreement

- Ask before adding dependencies, changing the token values, or altering the
  timings in section 4.
- Never soften or upgrade the role attributions in section 6.
- If something in this file is wrong or won't work, say so directly instead of
  building around it.
- Keep `src/scenes/timeline.ts` as the single home for all timing and camera
  constants. If a number appears in a component file, it's in the wrong place.
