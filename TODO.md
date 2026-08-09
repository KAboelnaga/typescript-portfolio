# Todo

If what you want isn't listed here or already shipped in [DONE.md](./DONE.md),
it hasn't been decided or started yet — tell Claude to do it.

## Right now: unfinished from the last session

- **Contact's whole-object drag is now a Y-axis nudge + spring-back, not
  free rotation (2026-08-09 (6))** — superseding several older entries
  below that still describe/reference the old rotate-and-persist drag
  (`rootPivot` itself is unchanged and still used for the settle-tween's
  turn and node lookups, just the *interactive drag* on top of it is
  different now). `DRAG_Y_SENSITIVITY`/`DRAG_Y_RANGE`/
  `SPRING_BACK_DURATION` in `ContactTimeline.tsx` are first-pass numbers,
  confirmed to work (Playwright: visible shift during drag, springs back
  within ~1s of release) but not felt out by hand.
- **New pacing numbers are a guess at "a bit slower," not Kareem-tuned
  (2026-08-09 (6)).** `HERO_SCROLL_PIN_VH` (620), `CONTACT_SCROLL_PIN_VH`
  (210), the rebalanced `HERO_BEATS` fractions, and Navbar's
  `PIXELS_PER_SECOND`/`MAX_DURATION` all moved in the "slower" direction
  but by how much was a judgment call, not measured against actual
  scrolling by hand.
- **Light theme is a first pass, unverified — 2026-08-09 (6).**
  `tokens.ts`'s `lightColor` export has real hex values and the toggle
  mechanism works end-to-end (confirmed via Playwright — CSS vars swap,
  persists via localStorage, defaults to dark regardless of OS
  preference), but the actual color choices/contrast ratios were picked
  by eye, not screenshot-reviewed by Kareem the way the dark palette was
  back in Stage 1. Also: the pinned About Me word-reveal
  (`HeroTimeline.tsx`) bakes its colors in once at construction — toggling
  theme mid-session while already scrolled into that beat won't
  retroactively recolor it. Standalone `WordReveal` instances (Experience
  section) don't have this problem.
- **`public/CV.pdf` is a placeholder, not Kareem's real CV (2026-08-09
  (6))** — a genuinely valid PDF (made with `cupsfilter`, not a broken
  file), whose visible text says exactly that. The "Download CV" link in
  the new Experience section already points at this exact path, so
  dropping the real file in as `public/CV.pdf` is the only step needed
  once Kareem has one ready — no code change.
- **Experience section content is mostly placeholder — 2026-08-09 (6).**
  New `data/experience.ts` only contains facts already established
  elsewhere on the site (AASTMT, Rustaq, "open to work") — the ITI
  entry's track/dates and AASTMT's graduation year are honestly
  `[VERIFY]`-flagged, not fabricated. Same open item as About Me's
  existing placeholders, see "Waiting on Kareem" below.
- **Also-built (OtherProjects) items have no preview-image popup, only
  the flagship ProjectCards do (2026-08-09 (6)).** Deliberate — there are
  no screenshot assets for these lighter mentions, and PROJECT_PREVIEWS.md
  already covers how to add them if Kareem ever wants to. The hover
  feedback there is a background tint + glow-dot instead.
- **New flagship project card, unreviewed by Kareem — 2026-08-09 (5).**
  "Zalando.it Product Scraper" replaced SIC/XE (see DONE.md). The
  description/`note` were written by summarizing the repo's own README,
  not dictated by Kareem — worth him reading it over for accuracy/tone
  before treating it as final copy, same as the rest of the project
  copy (see "Copy sign-off generally" below).
- **`PROJECT_PREVIEWS.md`** (new, 2026-08-09 (5)) — a guide for Kareem to
  swap a project's popup image/video himself, including the specific
  steps to replace Pet Society's sign-in-screen placeholder. Linked from
  README.md.
- **`ProjectCard` now shows both "live preview" and "view repo" links
  independently (2026-08-09 (4))** — previously the whole card became a
  single `<a>` when `previewUrl` was set, which silently dropped the repo
  link for that card (can't nest an `<a>` inside another `<a>`). Now the
  card is a plain `<article>` with up to two separate link lines at the
  bottom. Kareem: "add both of the other linked repos links."
- **Project preview data is now real, not a stub — 2026-08-09 (3).**
  Looked up Kareem's public GitHub directly rather than waiting: Pet
  Society has a confirmed live `previewUrl`
  (`pet-society-silk.vercel.app`) and `repoUrl`
  (`github.com/KAboelnaga/Pet_Society`); Rustaq has a `repoUrl`
  (`github.com/KAboelnaga/municipal-system`, confirmed public) but
  genuinely no live URL to link (client-identifying details were
  stripped from the portfolio version per its own README). Pet Society's
  `previewImage` was captured via Playwright against the live URL, but
  it's just the sign-in screen (app's behind auth, no demo login) — real
  and accurate, not especially flattering. **Worth swapping for a
  logged-in in-app screenshot if Kareem has one.** SIC/XE still has
  nothing — see "Waiting on Kareem" below, it turned out to be spread
  across four separate small repos, not one project.
- **Contact end-scene turn is now computed from real geometry, not
  guessed — 2026-08-09 (3).** The signed angle between the character's
  actual monitor-facing direction and the direction from him to the real
  end camera position, computed at runtime in `ContactTimeline.tsx`
  (`CONTACT_SCENE_YAW` is now only the fallback). Confirmed by screenshot
  to read as clearly facing the camera, a visibly different pose than the
  earlier same-day guess of reusing `2.2`. `CONTACT_END_CAMERA.fov` is
  now 60 (was 30, then 48, now 60 across three rounds of feedback).
- **Whole-object drag rotation now pivots on the object's actual center**
  (2026-08-09 (3), `Character.tsx`'s new `rootPivot`) instead of the
  GLTF's own off-corner, floor-level origin. `onSceneReady` now hands out
  this centered pivot instead of the raw loaded scene everywhere — a
  drop-in change, nothing else needed to be touched. Confirmed by
  screenshot: a drag that previously swung the object through a wide arc
  now rotates roughly in place.
- **Skewed monitor "ribbons" during the Hero pin's final beat, fixed
  2026-08-09 (3)** — a bug introduced by removing the zoom-out earlier the
  same day (camera now holds still at the extreme-close
  `MONITOR_ZOOM_CAMERA` framing for the whole beat, so its baked-in
  code-line texture sat visible in the background the whole time instead
  of just passing through). Fixed by making the overlay fully opaque
  during that beat instead of reintroducing camera movement.
- **Contact head cursor-follow range raised** 0.22 -> 0.42 rad
  (2026-08-09 (3)) — "make it follow the cursor more." Still a guessed
  number, just a bigger one; not hand-confirmed as "enough" yet.
- **Custom cursor stuck-outline bug fixed 2026-08-09 (2)** — see DONE.md
  for the root cause (discrete `pointerover`/`pointerout` state that could
  desync) and the fix (continuous re-derivation from `pointermove`).
  Confirmed via a synthetic rapid-hover Playwright test; worth trying by
  hand across a real trackpad/mouse to make sure the specific repro Kareem
  hit is actually gone, since the exact original trigger was never
  isolated — the fix is a general hardening, not a targeted patch for one
  identified sequence of events.
- **Scroll-down button is now always visible** (2026-08-09 (2)) — no more
  hide-after-`scrollY-120` behavior. Back-to-top keeps its own
  appear-after-threshold behavior.
- **Hero's projects zoom-out removed 2026-08-09 (2)** — camera now holds
  completely still at `MONITOR_ZOOM_CAMERA` through the end of the pin,
  `projectsTextIn` shows one big "Projects I've built" heading
  (`ProjectsGlimpseOverlay.tsx`), then the pin releases straight into the
  real Projects section. `PROJECTS_REVEAL_YAW` and `MONITOR_GLIMPSE_CAMERA`
  are gone from `timeline.ts` (dead code, deleted, not just unused).
- **A lot from 2026-08-09 still hasn't been felt out by hand** — Contact's
  head-only cursor tracking vs. whole-object free-axis drag (mechanics
  changed twice the same day, re-check fresh rather than against memory of
  an earlier version), the navbar's jump-to-"About" (a computed
  mid-timeline scroll position, not a real DOM anchor), and the tech-skills
  marquee's scroll speed/pause-on-hover feel. All mechanically confirmed
  working, none hand-tuned by Kareem yet.
- **`Parallax.tsx` is new**, applied to Projects and Also-built only — not
  Hero or Contact's pinned scenes, since a parallax ScrollTrigger nested
  inside a pinned ancestor goes inert once pinning starts (its trigger
  element's bounding rect stops changing). If "parallax between every
  section" is meant to include the pinned scenes too, that needs a
  different mechanism (e.g. driving it off the pin's own scrub progress
  instead of the child's own enter/exit), not just wrapping more things in
  `<Parallax>`.
- **New `throughEyes` beat hasn't been felt out by a human.** Confirmed by
  screenshot sampling (see DONE.md) that the camera lands right at the
  character's real eye position and the subsequent monitor approach reads
  as fast, but nobody's scrolled through it by hand yet — `throughEyes` /
  `monitorApproach`'s durations and easing in `timeline.ts` are a first
  pass, same caveat as the rest of the Hero sequence's timing.
- **Contact scene framing is now solved** — computed from the character's
  actual world position (see DONE.md) rather than guessed coordinates,
  confirmed by screenshot in both dev and production: lower right, clear of
  the text. `CONTACT_END_CAMERA`'s hardcoded position/target are no longer
  actually used for the *end* framing (only its `fov` still is, now 60,
  raised across three rounds of feedback the same day) —
  `ContactTimeline.tsx` computes position/target (and, as of 2026-08-09
  (3), the turn angle too) at runtime now. If this ever needs
  `CONTACT_END_CAMERA`'s dead position/target fields cleaned up, or the
  runtime offsets (`new THREE.Vector3(2.6, 0.85, 2.1)` etc.) need
  retuning, that's the one to touch, not the timeline.ts constant.
- **Try the Contact drag-to-rotate and cursor-follow interaction yourself.**
  Press-and-drag (once the section is fully settled) rotates the centered
  `rootPivot` (see `Character.tsx` — desk + character together, pivoting
  on the object's own center as of 2026-08-09 (3), not its floor-level
  corner) on two axes (yaw + clamped pitch), while the isolated `headPivot`
  tracks the cursor (range raised to 0.42 rad) only when not dragging.
  Confirmed working via Playwright, including that a small drag no longer
  snaps the whole object before applying and that the rotation stays
  roughly centered in frame rather than swinging wide, but "does it
  actually feel good to use" was never checked by a real hand on a real
  trackpad. `DRAG_SENSITIVITY` and `PITCH_LIMIT` in `ContactTimeline.tsx`
  are still first guesses.
- **Contact scene's monitor screen isn't lit up** — its independent canvas
  never sets the emissive ramp the way Hero's does, so it renders at
  whatever baseline the material file has. Minor, but noticeable if you look
  for it.
- **`AboutMeContent.tsx` has placeholder `[VERIFY]` text**, not real copy —
  see "Waiting on Kareem" below. Mechanism (scroll reveal, pinning,
  fixed-overlay repositioning) is done and verified; the words aren't.
- **`CODE_WORDS` fly-through** content is still a first guess, not tuned
  against how it actually feels scrolling through it in real time.
- **SPEC.md is now significantly stale** — it still describes the original
  A_HERO/B_APPROACH/C_PORTAL design from before any of the scroll-redesign
  conversations. Real behavior as of now: press-and-drag orbit before
  scrolling → scroll-driven intro turn (continuous, no pause) → entrance
  text → About Me → monitor approach (targets the real mesh bounding box) →
  deep black pass-through ("totally inside the monitor") → center-grown
  code words → pull back slightly, glimpse all projects (main three +
  Also-built) still facing the monitor → real Projects section
  (scroll-revealed cards) → Also-built → Contact (own pinned scene, camera
  rotates opposite direction from the intro, character head/torso follows
  cursor once settled). Update SPEC.md to match, or at minimum add a note
  pointing here, so it stops being misleading to whoever reads it next
  (including future-Claude).

## Waiting on Kareem

- **Scraper swapped in for SIC/XE, done 2026-08-09 (5).** It was private;
  Kareem made it public and it showed up immediately
  (`github.com/KAboelnaga/Scraper`). SIC/XE's own unresolved repo
  question (split across four small repos — `SIC`, `SIC-Pass1`,
  `Linker-Loader`, `Modi-SIC`) is moot now that it's off the page
  entirely, not fixed.
- **Pet Society's preview image is just the sign-in screen** (captured
  2026-08-09 (3) via Playwright against the live URL — the app requires
  login and there's no demo account to screenshot past it). Real, not
  fabricated, but not a very compelling preview. If Kareem has (or can
  grab) a logged-in screenshot of the actual feed/dashboard, swap
  `previewImage` in `data/projects.ts` for that.
- **About Me content — the big one.** Real ITI track/dates and freelance
  summary, to replace the `[VERIFY]` placeholders. The new Experience
  section (2026-08-09 (6)) needs the exact same ITI info, plus AASTMT's
  graduation year — one set of real answers covers both places.
- **Real CV/resume file.** `public/CV.pdf` is a placeholder (2026-08-09
  (6)) — drop the real PDF in at that same path and the Experience
  section's download link just works, no code change needed.
- **Copy sign-off generally.** Shipped the spec's drafted hero/project copy
  verbatim; spec itself says to confirm before treating it as final.
- **Repo links resolved 2026-08-09 (3) for Rustaq and Pet Society** —
  both wired to their real public GitHub repos in `data/projects.ts`.
  SIC/XE's is still open, see above (four separate repos, not one).
- **Real contrast-ratio numbers** for the text tokens (spec section 3 flags
  its own figures as estimates).
- **Send-a-message mechanism.** Currently opens the visitor's email client
  via `mailto:` with the message pre-filled — no backend, no third-party
  service. If a real "submits without leaving the page" form is wanted,
  that needs a service (Formspree, Web3Forms, etc.) and an account/API key —
  flagging before adding that dependency, per the working agreement.
- **General camera/timing tuning.** A lot of the numbers in `timeline.ts`
  are first-pass estimates verified by screenshot, not hand-tuned by
  Kareem. Dev console hooks: `window.__heroTimeline` / `__heroScrollTrigger`
  (Hero sequence, from press-and-drag through the projects glimpse) and
  `window.__contactTimeline` / `__contactScrollTrigger` (Contact scene).
  `OrbitControls` dragging was retired entirely (it fought the scroll-driven
  camera for control) — before scrolling starts, press-and-drag directly on
  the character now does free orbit instead (`PreScrollOrbit.tsx`); after
  scrolling starts, the console hooks are the way to scrub and read values.

## Later (not started)

- **Fallback and polish** (spec's old Stage 6): mobile still image (under
  768px, or `hardwareConcurrency <= 4`, or no WebGL2 → don't mount either
  canvas at all, render a static image instead), Lighthouse pass, full a11y
  audit with real contrast numbers, lazy-load the model so DOM text stays
  the LCP element. Bundle size (below) feeds into this.
- `OtherProjects`' timeline entries got `ScrollReveal` 2026-08-09. Contact's
  links/form still only got a hover-color transition, not a `ScrollReveal`
  fade-in — deliberately skipped: they live inside `textRef`, which
  `ContactTimeline` already opacity-tweens as part of the pin, and a nested
  `ScrollReveal` there would fire almost immediately (pinned sections fill
  the viewport right away) rather than in sync with the pin's own timing,
  so it'd be inert, not actually broken — just pointless. If Contact's
  links want their own staggered reveal, it needs to be a beat inside
  `ContactTimeline`'s own GSAP timeline, not a separate ScrollTrigger.
- `PreScrollOrbit`'s drag interaction is desktop-mouse-oriented — touch
  devices get pointerdown/pointermove events too but this hasn't been
  checked for conflicts with native touch-scroll gestures on mobile.
- **2026-08-09's new UI (`Navbar.tsx`, `CustomCursor.tsx`,
  `TechSkillsSlider.tsx`) wasn't checked on a mobile viewport.**
  `CustomCursor` is intentionally desktop-only (`pointer: fine` gate, so
  touch devices keep their native cursor/tap) but `Navbar`'s five-item pill
  hasn't been checked for wrapping/overflow on narrow screens, and the
  marquee's default speed was only judged at desktop width.

## Noticed along the way, not yet addressed

- Production bundle is ~1.28MB / ~367KB gzip (three.js, now loaded on two
  independent canvases' worth of code, though the library itself is only
  shipped once). Vite warns on chunk size. Code-splitting / lazy-mounting is
  explicitly a later-polish concern per spec section 5 — not urgent yet.
- `Django_Blog_Project` on Kareem's GitHub has a committed `.env` and
  `db.sqlite3` (possible leaked secrets) plus a stray `v3.zip` backup.
  Unrelated to this portfolio build — his to handle separately, mentioned
  here so it isn't lost.
- The character model has no dedicated lamp light or mesh of its own (only
  the monitor's `screen_spill` point light is baked in) — the `lamp` key
  light in `SceneLighting.tsx` is entirely an R3F addition, not sourced from
  the model.
- Never got to the bottom of *why* the static `ScrollTrigger.refresh()`
  didn't recalculate Contact's trigger even though the instance's own
  `.refresh()` did (see DONE.md) — worked around it rather than explained
  it. If a similar "refresh doesn't seem to work" symptom shows up again,
  that's worth actually investigating instead of routing around again.
