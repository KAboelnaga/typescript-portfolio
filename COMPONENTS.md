# Components — what everything does

A reference to every component/module in `src/`, grouped by what it's for.
Written for you (Kareem), not as public docs — assumes you know React/Three.js/GSAP
and just want a map of "what does this file do and why does it exist," not a
tutorial. For *why a specific decision was made*, the comment at the top of
each file usually has the real story (often a direct quote from you); this
file is the bird's-eye version. See [SPEC.md](./SPEC.md) for the original
design spec, [DONE.md](./DONE.md) for the dated build history, and
[TODO.md](./TODO.md) for what's still open.

## How the app is put together

`main.tsx` disables the browser's automatic scroll restoration (a real bug —
see its own comment — the scroll-driven intro breaks if the browser tries to
restore an old scroll position before the page has grown to its full height)
and mounts `App.tsx`, which is just a flat list of every section in the order
they appear on the page, wrapped in `ThemeProvider`. There's no router — this
is a single page, top to bottom.

Two layers run side by side everywhere: normal DOM content (text, forms,
cards — what you'd build in any React app) and two independent Three.js
`<Canvas>` scenes (Hero's and Contact's) sitting behind/around that DOM
content as `position: absolute` backgrounds. GSAP's ScrollTrigger drives
*both* layers off the same scroll position, which is what keeps the 3D camera
moves, the DOM text reveals, and the page's actual scroll position all in
sync.

---

## Entry points

**`App.tsx`** — the whole page, in order: `Navbar`, `SkipIntro`, `Hero`, then
a `<main>` with `Work` → `Projects` → `TechSkillsSlider` → `Skills` →
`Background` → `Contact`, then `Footer`, `ScrollControls`, `CustomCursor`,
`ThemeLightbulb`. `ThemeLightbulb` is lazy-loaded (see "Performance" below).

**`main.tsx`** — mounts `App`, and fixes a real scroll-restoration bug (see
above). Not much else lives here on purpose.

---

## Page sections (in scroll order)

**`Navbar.tsx`** — the fixed pill at the top. Desktop: a horizontally-
scrollable row of section buttons; clicking one GSAP-animates
`window.scrollTo` toward it (not a hard jump) so the pinned 3D beats along
the way actually play, just fast. Mobile (`sm:hidden`): a hamburger button
instead, opening an animated dropdown with the same items — see "Mobile nav"
below. Tracks scroll position itself to highlight the active section.

**`Hero.tsx`** — the opening pinned sequence: your name/title card, then it
hands off entirely to the 3D `Scene` underneath and a handful of overlay
components (`AboutMeContent`, `CodeWordsOverlay`, `ProjectsGlimpseOverlay`)
that `HeroTimeline.tsx` (see below) animates in sync with scroll. The actual
camera/character choreography lives in `scenes/`, not here — this file is
mostly just the DOM overlay markup and refs handed down to the 3D layer.

**`AboutMeContent.tsx`** — the "About me" paragraph shown mid-Hero-pin, using
`WordReveal` (`standalone={false}`) to brighten word-by-word as
`HeroTimeline` scrubs through that beat.

**`CodeWordsOverlay.tsx`** — the flying code-snippet words during the "camera
enters the screen" black pass-through beat. Purely decorative
(`aria-hidden`); `HeroTimeline` queries its child spans directly and animates
each one.

**`ProjectsGlimpseOverlay.tsx`** — the "My Work" title card in the last black
beat before the Hero pin releases into the real Projects section. Was cut
for repeating the Projects heading, restored with different copy after you
asked for something there instead of a bare black screen.

**`Work.tsx`** — "Where I've shipped": the Rustaq case study (stat strip via
`CountUp`, named decisions) plus the smaller "Independent Developer" follow-
up underneath it.

**`Projects.tsx`** — "Things I've built": maps `data/projects.ts` into a
3/2/1-column responsive grid of `ProjectCard`s.

**`ProjectCard.tsx`** — one project card. The whole card is clickable
(priority: live demo, else repo) via `role="link"` + keyboard handling on a
plain `<div>` (can't be a real `<a>` — it also contains two independent real
`<a>` links, "live preview"/"view repo", which can't nest inside another
link). Desktop: hovering shows `ProjectPreviewPopup` floating beside the
card. Mobile (`sm:hidden`): the popup is gone (480px wide, no room on a
phone) — instead the preview image/video renders inline at the card's own
top edge, always visible, no interaction needed.

**`ProjectPreviewPopup.tsx`** — the floating image/video preview, portaled
straight to `document.body` (so a parallaxed ancestor's CSS transform can't
break its `fixed` positioning). Desktop-only in practice — see
`ProjectCard.tsx`'s `(pointer: fine)` gate.

**`TechSkillsSlider.tsx`** — the continuous colored marquee of every skill
between Projects and Skills. Pure CSS-keyframe animation (a doubled list
translated -50%), not GSAP. Pauses on hover.

**`Skills.tsx`** — "What I work with": the real tiered skill list (Daily /
Comfortable / Learning — see `data/skills.ts`), each rendered as a
`SkillTag`.

**`SkillTag.tsx`** — one skill pill. Permanently colored (real brand color
from `data/skillColors.ts`, or the site's green `signal` accent if there's
no real logo for it) — no hover animation, no GSAP; just a colored text
node. Brand colors get dimmed in light mode via `dimForLight()`
(`skillColors.ts`) to keep real WCAG contrast.

**`Background.tsx`** — Education / Competitive programming / Languages,
combined into one three-column section (each column its own entrance
direction) rather than three thin sections back to back.

**`Contact.tsx`** — "Get in touch": direct contact info (email with copy-to-
clipboard, phone, socials, CV download) plus a real working contact form
(EmailJS — falls back to a `mailto:` link if the EmailJS env vars aren't
set). Mounts `ContactScene` (lazy-loaded) as its 3D backdrop.

**`Footer.tsx`** — one line, name + tagline. Uses a non-default `ScrollReveal`
trigger (`start="top bottom"`) because the standard trigger point can never
fire for the very last element on the page — see its own comment for the
real bug this fixed.

---

## Floating, sitewide UI (not scoped to one section)

**`CustomCursor.tsx`** — replaces the native cursor with a dot + an outline
that morphs to trace whatever's hovered. Desktop-only (`pointer: fine`
gated), off under `prefers-reduced-motion`. A single `requestAnimationFrame`
loop, not GSAP tweens — rewritten this way after GSAP's tween-based version
kept producing "cursor stuck" bugs (see its own comment for the full
post-mortem; genuinely worth reading if you touch this file).

**`ThemeLightbulb.tsx`** — the draggable 3D lightbulb (its own separate
`<Canvas>`) that toggles dark/light mode. Spins continuously; drag adds a
manual offset on top; a plain click (drag distance under a threshold) still
toggles the theme. Lazy-loaded from `App.tsx` — it was the thing quietly
keeping three.js in the main JS bundle even after Hero/Contact's scenes went
lazy (see "Performance" below).

**`ScrollControls.tsx`** — the two floating hint buttons: "scroll down"
(bottom-center, hidden at the very end of the page) and "back to top"
(bottom-right, appears after you've scrolled a bit). Both share a "circular
select" hover-ring animation (`HoverRing`).

**`SkipIntro.tsx`** — the "Skip" pill, visible only while still inside the
Hero pin. Same GSAP-scrollTo-as-fast-forward approach as `Navbar.tsx`.

---

## Reusable scroll-animation building blocks

These aren't page sections — other components wrap their content in these.

**`ScrollReveal.tsx`** — fade+rise (or slide/scale) reveal for normal
document-flow content. Replays every time the element scrolls into view in
either direction (not a one-shot "first time only" reveal). Skips the
animation entirely under `prefers-reduced-motion`.

**`StaggerReveal.tsx`** — same idea as `ScrollReveal`, but pops each *direct
child* in individually with a stagger, for tag/pill lists where one shared
reveal would otherwise show everything at the same instant.

**`Parallax.tsx`** — vertical drift at a configurable `speed` as content
crosses the viewport, scrubbed to real scroll position (not a one-shot
reveal). Pure transform, never affects layout.

**`CountUp.tsx`** — counts a number up from 0 when it scrolls into view
(Work's stat strip). Re-triggers every time, like `ScrollReveal`.
Renders the final value directly under `prefers-reduced-motion`.

**`WordReveal.tsx`** — splits text into per-word spans that brighten
(dim → full contrast) as you scroll past. `standalone` (default `true`) runs
its own `ScrollTrigger`; `AboutMeContent` passes `standalone={false}` since
that text is pinned inside the Hero sequence and `HeroTimeline` drives it
directly instead.

---

## The 3D layer (`src/scenes/`)

**`Scene.tsx`** — Hero's `<Canvas>`. Sets up the background color/fog (live,
theme-reactive), lighting, loads `Character`, and mounts `HeroTimeline` (the
thing that actually drives the camera). Lazy-loaded from `Hero.tsx`.

**`HeroTimeline.tsx`** — the biggest file in the project: the entire Hero
sequence as one GSAP timeline bound to one `ScrollTrigger` pin. Every beat
(intro turn, entrance text, About Me, monitor approach, black pass-through,
flying code words, the "My Work" glimpse) is a time range in
`timeline.ts`'s `HERO_BEATS`, animated here. Also owns the About Me
word-reveal's colors, which are read live via a ref (not baked into the
timeline once) so a theme toggle mid-scroll repaints them correctly without
having to rebuild the whole pinned timeline.

**`Character.tsx`** — loads the character `.glb` model (self-hosted, Draco-
compressed) and groups the "upper body" nodes (head/torso/arms — not
legs/chair) into a pivot so the intro turn can rotate just that part.

**`SceneLighting.tsx`** — the lights. The desk lamp is the key light, driven
by the same `lamp` color token the DOM's accent color uses, so the 3D scene
and the page never visually drift apart.

**`PreScrollOrbit.tsx`** — before you've scrolled at all, press-and-drag on
the character freely orbits the camera around him. The instant real
scrolling starts, this disables itself and `HeroTimeline` takes over.

**`DevCameraOverlay.tsx`** — dev-only (`import.meta.env.DEV`) readout of live
camera position/rotation/fov, for reading exact values to paste into
`timeline.ts`. Never ships to production.

**`ContactScene.tsx`** — Contact's own independent `<Canvas>` (separate from
Hero's — reuses the cached model file, but its own cloned scene graph so the
two canvases don't fight over the same objects). Lazy-loaded from
`Contact.tsx`.

**`ContactTimeline.tsx`** — Contact's pinned sequence: camera pulls back from
"still behind the screen" to a wide settled shot, character/desk turn to
face the viewer. Once settled, it's interactive: press-and-drag rotates the
whole object (yaw only, clamped range, springs back to the settled
orientation on release), and — when not dragging — just the character's head
subtly tracks the cursor.

**`heroReady.ts`** / **`contactReady.ts`** — tiny pub-sub modules, no UI.
Each later pinned section needs to wait for every *earlier* one's pin spacer
to actually exist before measuring its own `ScrollTrigger` position, or it
measures against a page that's still too short and lands on the wrong scroll
offset. `ContactTimeline` waits on `heroReady`; anything after Contact
(currently just `Footer`) waits on `contactReady` too.

**`timeline.ts`** — single home for every 3D timing/camera constant
(`HERO_BEATS`, `CONTACT_BEATS`, camera positions/targets, `CODE_WORDS`, drag
ranges, etc.). If a number affects the 3D scenes, it should live here, not
hardcoded in a component.

---

## Data (`src/data/`)

Plain data modules, no components — imported by whichever component renders
them.

- **`projects.ts`** — the `Project` type + the actual project list (name,
  description, stack, links, preview image/video path).
- **`skills.ts`** — the tiered skill list (`Daily` / `Comfortable` /
  `Learning`) shown in `Skills.tsx`.
- **`skillIcons.ts`** — real brand-mark SVG path data (vendored from the
  `simple-icons` package, not hand-drawn) for skills that have one.
- **`skillColors.ts`** — real brand colors per skill, with the handful of
  documented exceptions (near-black/near-invisible marks lightened for
  visibility, several colors nudged just enough to clear real WCAG AA
  contrast against this site's actual backgrounds — see the file's own
  comment for the exact numbers) plus the `dimForLight()` helper `SkillTag`
  and `TechSkillsSlider` both use for light mode.
- **`socialIcons.ts`** — same vendoring approach, for GitHub/LinkedIn/etc.

## Theme (`src/theme/`)

- **`tokens.ts`** — the single source of every color hex value, both themes
  (`color` = dark, `lightColor` = light). Never hardcode a color anywhere
  else in the codebase — import from here.
- **`ThemeContext.tsx`** — the dark/light toggle's actual state + the
  `useTheme()` hook. Applies the active theme by writing CSS custom
  properties directly onto `<html>` (so existing `bg-void`/`text-text-hi`/
  etc. classes just pick up new values automatically), not via Tailwind's
  `dark:` variant.

---

## A few things worth knowing before you dig into any of this

- **Performance / lazy-loading**: three separate `<Canvas>` mounts (Hero's
  `Scene`, Contact's `ContactScene`, `ThemeLightbulb`'s mini lightbulb model)
  are all `React.lazy` + `Suspense fallback={null}` from where they're
  mounted, specifically so `three`/`@react-three/fiber`/`@react-three/drei`
  don't block the rest of the page's JS from parsing/running. This mattered
  a lot on mobile — see DONE.md 2026-08-11 (21).
- **`ScrollTrigger` pin ordering**: any new pinned section needs to wait for
  every earlier pin to exist first (`heroReady.ts`/`contactReady.ts`
  pattern), or its first-ever position measurement lands wrong. Same for any
  one-shot `ScrollTrigger` (`ScrollReveal`, `StaggerReveal`, `CountUp`) — all
  four already gate on this; copy that pattern for anything new.
- **Accessibility**: real WCAG AA contrast is verified (not eyeballed) at
  the token level (`tokens.ts`) and per brand color (`skillColors.ts`); keep
  using axe-core (or at minimum compute contrast ratios) if you touch either.
  Also: this site relies on the site-wide `:focus-visible` rule in
  `index.css` for keyboard focus — don't add `focus-visible:outline-none`
  to a new interactive element without a real replacement (a past instance
  of exactly that made several controls invisible to keyboard focus — see
  DONE.md 2026-08-11 (20)).
