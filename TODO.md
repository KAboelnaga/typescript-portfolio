# Todo

If what you want isn't listed here or already shipped in [DONE.md](./DONE.md),
it hasn't been decided or started yet — tell Claude to do it.

## Right now: unfinished from the last session

- **2026-08-11 (20), done — see DONE.md for the full writeup.** A real
  accessibility/SEO audit against the *live* Vercel deploy: axe-core
  found real WCAG AA contrast failures (the `textLow` token in both
  themes, several brand colors in `skillColors.ts`) and an ARIA violation
  (`role="link"` on `<article>` in `ProjectCard.tsx`), all fixed — 0
  violations now, both themes (was un-checked in light mode entirely
  before this). A real, sitewide keyboard-focus bug found via an actual
  Tab pass (not axe): `focus-visible:outline-none` with no visible
  replacement on Navbar/SkipIntro/ThemeLightbulb/ScrollControls made
  keyboard focus completely invisible on the nav, Skip button, and the
  theme toggle. Also fixed the known `CodeWordsOverlay` opacity bug
  flagged-not-fixed in (16), and added OG/canonical/JSON-LD/robots.txt/
  sitemap.xml. Live network audit found the earlier "1.37MB bundle"
  performance concern overstated (that was the uncompressed dist size;
  real gzipped JS over the wire is 411KB, page load 656ms) — deprioritized
  in favor of what was actually measured as broken.
- **2026-08-11 (19), done — see DONE.md for the full writeup.** Skills
  tags reverted again — (18)'s hover-only colorize replaced with plain,
  permanently-colored tags (no GSAP, no animation at all). Brand colors
  that read too neon in light mode (React's cyan, GSAP's green, etc.)
  are now dimmed ~28% toward light mode's ink color when `mode ===
  'light'`; dark mode is untouched.
- **2026-08-11 (18), done — see DONE.md for the full writeup.** Skills
  tags reverted to hover-only colorize (dropped (17)'s scroll-triggered
  permanent auto-colorize per Kareem's follow-up). About Me word-reveal's
  real "gold turns nearly black in dark mode" bug root-caused (a
  mid-session theme toggle left it playing back whichever theme's colors
  were active when the pinned Hero timeline first built) and fixed with a
  live repaint-in-place on toggle, instead of the unsafe fix of rebuilding
  the whole pinned timeline. Also fixed a smaller related bug found while
  verifying: `WordReveal.tsx`'s per-word inline color default was
  stomping GSAP's live-rendered color on every unrelated re-render.
- **2026-08-11 (17), done — see DONE.md for the full writeup.** Two
  light-mode regressions from earlier this session fixed: Hero/About Me
  text-shadow was hardcoded dark (fogged this theme's own dark text into
  a grey smudge) — now reads `colors.void` from `useTheme()` so it's dark
  in dark mode, light in light mode. Cursor was tied to theme-reactive
  `text-hi` (rendered light-grey in light mode instead of black) — now a
  fixed white source color, which is what makes `mix-blend-difference`
  actually work in both themes. Also: the (15) Comfortable-tier additions
  got real icons/colors fetched from simple-icons (Gunicorn/WSGI, SCSS,
  Three.js, GSAP, React Hook Form, HTML5, and CSS — split out from
  "HTML5/CSS3"), "DRF" renamed to "Django REST Framework", and every
  colorless skill tag (Django Admin, REST APIs, Unit testing, Context
  API, Role-based access control, Django REST Framework) now colorizes
  to the site's own green accent instead of staying plain.
- **2026-08-11 (16), done — see DONE.md for the full writeup.** The 18
  reviewed `CODE_WORDS` lines from (15) written into `timeline.ts`.
  Verified via live DOM state (real opacity/scale values tied to the
  actual text), which surfaced a real, pre-existing bug: two overlapping
  GSAP tweens fight over the same `opacity` property, so no word's
  fade-in ever actually reaches full visibility (caps around 0.36) before
  the fade-out starts pulling it back down. Predates this session, applies
  to the old placeholder snippets too — flagged, not fixed (see "Waiting
  on Kareem").
- **2026-08-11 (15), done — see DONE.md for the full writeup.** Full
  `CONTENT-LIVE.md` rewrite implemented (About Me, Hero title-card cut,
  Work/Rustaq substantially rewritten with a real demo screenshot and
  credentials, Projects cut to 3 cards + real 3-column grid, Skills
  extended with DRF/seven Comfortable entries/a restored Concepts tier,
  Contact copy states + honeypot). Also: a real regression found and
  fixed in (13)'s monitor-screen recentering (was using node position
  alone, not real geometry width — shifted content the wrong direction).
  **Still open:** `CODE_WORDS` — 18 real candidate lines pulled from
  `Pet_Society`/`pneumoxpert 2.0`/this repo and presented in chat per
  CONTENT-LIVE.md's own instruction ("show me the list before writing
  it") — not yet written into `timeline.ts`, needs Kareem's sign-off on
  the specific lines first.
- **2026-08-11 (14), done — see DONE.md for the full writeup.** Contact
  form now actually sends via EmailJS (real keys installed, verified
  end-to-end with a real test send) instead of only opening the
  visitor's email client — still falls back to that if EmailJS isn't
  configured. First real mobile pass (iPhone 13 viewport, Playwright):
  zero horizontal overflow anywhere; two real "stuck" overlap bugs fixed
  (Hero/About Me text vs. the character — text-shadow, a partial fix, see
  "Waiting on Kareem" below for the fuller one; Contact's WhatsApp link
  vs. the fixed lightbulb widget — `pr-24`). Rest of the site (Skills,
  Background, Navbar's horizontal scroll) checked out clean.
- **2026-08-11 (13), done — see DONE.md for the full writeup.** Monitor
  screen mockup recentered (real off-center geometry, not a texture —
  ~30 individual mesh nodes shifted by a computed delta in
  `Character.tsx`). Project cards fully clickable again (live demo
  priority, else repo), on top of the two existing explicit links.
  WhatsApp link added to Contact. Background's overflow root-caused to a
  dead `sm:text-5xl` class (doesn't exist in this project's custom type
  scale) rather than a spacing issue — resized to real scale values.
  About Me's restated heading removed; its paragraph now uses a
  self-hosted Sora instead of the sitewide body font. Full live-copy
  extraction written to `CONTENT-LIVE.md` for review. **Still open,
  needs Kareem's input** (see "Waiting on Kareem" below): a real
  working "send message," 3D background room, projects timeline, and
  mobile-specific fixes.
- **2026-08-10 (12), done — see DONE.md for the full writeup.** Contact's
  end-turn nudged 180° → 210°, same direction as (11).
- **2026-08-10 (11), done — see DONE.md for the full writeup.** Cursor
  hover-outline padding back to 4px (2px read as too tight). Contact's
  end-turn taken to 180° (from (10)'s 90°) — kept turning the same
  direction (10)'s sign flip went instead of reverting to (9)'s, since 90°
  was still the wrong way; 180° now shows him facing the camera dead-on,
  full face visible, monitor behind him.
- **2026-08-10 (10), done — see DONE.md for the full writeup.** Cursor
  hover-outline padding narrowed again, 4px → 2px. Contact's end-turn back
  up to 90° (from (9)'s 30°) and flipped to the opposite direction from
  (8)'s 90° version — same geometry-derived sign logic, just negated.
- **2026-08-10 (9), done — see DONE.md for the full writeup.** Contact's
  whole-object rotation (desk/monitor/character together) now pivots on
  the *character's* own center instead of the assembly's shared center —
  he stays roughly in place through the turn now, desk swings around him.
  End-turn angle back down to 30° (from (8)'s 90°) — with the new pivot it
  now reads as a real partial turn toward camera instead of the near
  side/back view a bare 30° gave against the old pivot. GitHub/LinkedIn
  now render real icons (`data/socialIcons.ts`). Email-copy label got
  `ml-1` so "Email copied" doesn't sit jammed against the address. Cursor
  hover-outline padding narrowed 10px → 4px — was reaching past a hovered
  element into a neighbor's label in tight layouts (Navbar's `gap-1`).
  Real reload bug found and fixed: a fast reload right after real scroll
  input still let the browser restore the old scroll offset despite
  `scrollRestoration = 'manual'`, landing the visitor mid-Hero-pin — fixed
  with two more corrective `scrollTo(0,0)` reassertions (on `load`, and on
  `onPinsReady`), confirmed with six clean repro runs after (was flaky
  before).
- **2026-08-10 (8), done — see DONE.md for the full writeup.** Corrects
  (7) below: the "turn to face the text" ask was about the *Contact*
  end-scene's whole-object turn, not Hero's — Hero's intro-turn rotation
  reverted back to `0`. Contact's whole-object end turn changed from a
  tuned 75° to a plain fixed 90° (same geometry-derived sign as before).
  Also a real bug found in the same scene: drag and cursor-follow were
  gated on scrolling all the way to the *end* of the Contact pin
  (`progress >= 1`) rather than on the object actually finishing its turn
  (`progress >= 0.4`, the end of the `cameraSettle` beat) — a real dead
  zone where the scene looked fully settled but stayed non-interactive
  until well past that. Now gated on the latter.
- **2026-08-10 (7), done — see DONE.md for the full writeup.** ~~Hero
  character now turns -90° during the intro turn to face the entrance
  text~~ — reverted in (8), this was the wrong scene. CustomCursor rewritten from a
  GSAP quickTo/gsap.to hybrid to a single `requestAnimationFrame` + lerp
  loop — fixes a fourth distinct "cursor gets stuck" root cause (frozen in
  empty space right after leaving a hovered link/label), and removes the
  need for a separate `scroll` listener since hover rects are now recomputed
  fresh every frame instead of cached. Footer's name restored (dropped by
  accident in an earlier footer fix) and the deleted `TechSkillsSlider`
  marquee brought back between Projects and Skills, now colored per-skill
  via `skillColors.ts` instead of one flat tone.
- **2026-08-10 (6), done — see DONE.md for the full writeup.** Contact's
  end-turn re-tuned by actually sweeping real angles on a live render (0°
  through the full ~129°) and comparing screenshots, not guessing a second
  time — "reverse the rotate" first read as a sign flip, which rendering
  proved wrong (showed the back of his head); the real issue was
  magnitude, not sign — his face doesn't clear into view until ~-75°.
  Settled there. Also: a third distinct root cause found for the
  recurring "cursor gets stuck" symptom — clicking any of this site's many
  `target="_blank"` links hands focus to the new tab without the pointer
  ever leaving the viewport, so neither `pointermove` nor `pointerleave`
  ever fire to release the outline. Fixed by treating `blur` the same as
  `pointerleave`.
- **2026-08-10 (5) batch, done — see DONE.md for the full writeup.**
  "The footer is gone" turned out to be a real, root-caused bug: the
  exact same class of "measured its position before every pin on the
  page existed" issue 2026-08-10 (4) fixed for `CountUp`/etc., just one
  pin later — Contact's own pin is created in a *later* React render than
  `markHeroReady()` fires, so Footer's `ScrollReveal` (which only waited
  for Hero) cached a position ~1800px short of reality and stayed stuck
  invisible forever. Fixed generally via a new `onPinsReady` (waits for
  every pin, not just Hero's — see `contactReady.ts`), plus a second,
  smaller fix once that was confirmed working: an element this close to
  the true end of the document can never satisfy the default "top 88%"
  threshold (57px short of reachable on a 900px viewport, at true max
  scroll) — `ScrollReveal` gained an optional `start` override, Footer
  uses the standard `top bottom` fix for "last thing on the page." Also:
  "scroll to begin" now reappears every time you return to the top of the
  page, not just once ever; Contact's end framing re-tuned (character
  further right, a fixed 30° turn instead of facing the camera dead-on —
  verified via NDC projection, not eyeballed); cursor-follow raised again
  (0.42 → 0.58 rad); drag-release eased smoother (no more elastic
  overshoot); ThemeLightbulb's idle Y-bob removed, sized up a bit.
- **2026-08-10 (4) batch, done — see DONE.md for the full writeup.** The
  Hero "monitor dive" camera path (through the eyes, into the monitor)
  had a real, verified direction-reversal bug — "I've asked this too many
  times and it never got fixed" — root-caused this time via frame-by-frame
  Playwright sampling of `camera.position` through a real scroll (not
  guessed), fixed by computing the second leg's endpoint along the exact
  same ray as the first instead of an unrelated hand-placed point;
  monotonic on every axis now, confirmed numerically. ThemeLightbulb
  given real depth cues (hover-parallax tilt, idle float, a shadow that
  shifts with the tilt) instead of just spinning in place. Mobile pass:
  one real bug found and fixed (Contact's email/phone text was rendering
  partially behind the fixed Navbar on a short mobile viewport — same
  `pt-28` fix already used for Hero's About Me beat, just missing here);
  rest of the mobile audit (every section, touch-specific behavior —
  cursor correctly off, real `tap()` still toggles the bulb, no horizontal
  overflow) came back clean.
- **2026-08-10 (3) batch — six items plus one TODO carry-over, done — see
  DONE.md for the full writeup.** Contact's end framing recentered
  (verified via NDC projection through the live camera, not eyeballed);
  Navbar completed (Skills/Background were missing entirely) and reordered
  top-to-bottom to match the real scroll sequence (`About · Work ·
  Projects · Skills · Background · Contact · CV`) — caught and fixed a
  mobile regression this caused (pill no longer fit 390px, made it
  horizontally scrollable instead); a real "scroll to begin stays stuck
  until Projects" bug found via a throttled-network Playwright repro and
  fixed (was showing unconditionally regardless of current scroll
  position); `ScrollReveal`/`StaggerReveal`/`CountUp` now replay every
  time their content scrolls into view instead of once ever; Skills'
  auto-colorize now stays colored permanently instead of reverting after
  ~1.1s (the one deliberate exception to the "replay every time" change);
  Contact's monitor screen now runs the same emissive ramp Hero's does
  (real fix, but see DONE.md — the visible effect turned out to be subtle,
  not dramatic, once actually investigated).
- **2026-08-10 priority queue, worked in this order — see DONE.md for the
  full writeup.** Kareem asked to review this file and set a priority
  queue, then named four things directly. Order used: (1) real bugs —
  cursor outline getting stuck at a stale screen position after scrolling
  with the mouse stationary (root cause: only recomputed on `pointermove`,
  never on `scroll`), and stale/missing preview-image paths in
  `data/projects.ts`; (2) the explicit asks — card hover animation
  (`ProjectCard.tsx` had none beyond a background fade), Skills tags
  auto-colorizing once on scroll-into-view instead of hover-only; (3) a
  sweep of other static interactive elements (Navbar button scale-feedback,
  missing `transition-colors` on Contact's form inputs, arrow-shift on
  ↗-suffixed links); (4) a bug found *while* building (2) — `ScrollReveal`/
  `StaggerReveal`/`CountUp`/the new `SkillTag` all created their
  `ScrollTrigger` before Hero's model finished loading, so their entrance
  animations could fire thousands of pixels before the content was ever
  near the viewport. Fixed by gating all four on `onHeroReady` (the same
  mechanism `ContactTimeline` already used for its own pin, for the
  identical reason) — this retroactively fixes every existing
  `ScrollReveal`/`StaggerReveal` use across Work/Projects/Skills/Background
  too, not just the new code.
- **2026-08-10 batch (ten items) is done — see DONE.md for the full
  writeup.** Theme-toggle scroll bug fixed (root cause: a Context value
  in a ScrollTrigger-building effect's deps array); contact form
  restored; a real Tailwind config collision (`fontSize.base` vs.
  `colors.base` both compiling to `.text-base`) fixed at the root, not
  just patched; About deduped to one section with a rewritten combined
  copy; Contact's drag changed from translate back to rotate, now
  limited-range + spring-back; Work's stats count up on scroll-in;
  `ThemeLightbulb` bigger with a depth shadow; richer varied
  scroll-entrance animation across Work/Projects/Skills/Background (new
  `ScrollReveal` variants + `StaggerReveal`); Skills tags colorize
  letter-by-letter to real brand colors on hover; Background restyled
  larger with its own section heading and per-column entrance
  animation.
- **Skill hover colors: three brand hexes were swapped for lighter
  tints, not the literal official value** (`data/skillColors.ts`) —
  Django, Flask, and SQLite's real brand colors are all near-black,
  which would be invisible against both this site's near-black dark
  theme and near-white light theme. Documented in the data file; worth
  a look if Kareem wants the literal hex regardless of legibility.
- **Iteration 2 (2026-08-09 (9)) is done — see DONE.md for the full
  writeup.** Character model swapped to `developer-at-desk .glb` (every
  camera beat screenshot-verified afterward, none needed retuning —
  the runtime-geometry-based framings adapted automatically); real light
  bulb model in `ThemeLightbulb.tsx` with idle spin + drag + click-to-
  toggle; project popups enlarged to 480×330; skill logos added for the
  21 skills that have a real brand mark (`data/skillIcons.ts`).
- **A read-only viewer account for the Rustaq/PythonAnywhere demo?**
  Kareem's own question, from CONTENT.md's open questions: the live
  link is real production, but has no self-serve signup, only an
  admin-created login — right now the site labels it "Live (login
  required)" rather than pretending it's freely explorable. Recommend
  yes, a scoped read-only account is a normal, low-risk thing to hand
  out for a portfolio demo, *provided* the data a viewer would see
  doesn't expose more than appropriate about real businesses in the
  system (Claude can't judge that from outside — it's Kareem's data
  model to check). Not something Claude can create — no access to that
  production system. Once one exists, either swap the Work section's
  link text/copy to mention it, or leave the honest "login required"
  label if a shared account still isn't the answer.
- **Content pass (2026-08-09 (8)) is real content but a first layout
  pass, not hand-reviewed live.** Every section is screenshot-verified
  and functionally tested (Playwright), but nobody has scrolled through
  the new Work/Skills/About/Background sections by hand yet. Likely
  candidates if something feels off: Background's three-column layout
  on narrower viewports (not checked below desktop width), the
  copy-email button's spacing next to the email link (measured at a
  clean 8px gap, reads slightly tight in a screenshot at a glance).
- **Skip-intro button is a real reversal of an earlier decision** — see
  DONE.md 2026-08-09 (8) and the updated comment in `HeroTimeline.tsx`.
  Not a bug, a deliberate choice per CONTENT.md's micro-copy table;
  flagging here so it doesn't look like an oversight if revisited.
- **Contact's whole-object drag (rotate + spring-back, changed from
  translate to rotate 2026-08-10, release eased smoother 2026-08-10 (5))**
  — `DRAG_SENSITIVITY`/`DRAG_YAW_RANGE`/`DRAG_PITCH_RANGE`/
  `SPRING_BACK_DURATION` in `ContactTimeline.tsx` are first-pass numbers,
  confirmed to work exactly as coded (Playwright read `sceneRoot.rotation`
  directly: clamps to precisely `baseYaw ± 0.5`/`± 0.35` rad under an
  oversized drag, springs back to the exact original orientation on
  release, now via a smooth `power3.out` deceleration instead of an
  elastic bounce) but not felt out by hand — "does this drag distance/
  range *feel* right" is a judgment call only Kareem can make. Same for
  the head cursor-follow range (0.58 rad as of 2026-08-10 (5), upward half
  clamped to 0.19 rad, same ratio as before).
- **Pacing numbers** (`HERO_SCROLL_PIN_VH` 620, `CONTACT_SCROLL_PIN_VH`
  210, the rebalanced `HERO_BEATS` fractions, Navbar/SkipIntro's
  `PIXELS_PER_SECOND`/durations) are judgment calls made by
  screenshot/Playwright, not measured against Kareem actually scrolling
  through them. (`throughEyes`/`monitorApproach`'s *path* is no longer a
  guess — see 2026-08-10 (4) — but the exact timing split between the two
  beats still is.)
- **Light theme screenshot-reviewed section by section, 2026-08-09
  (10) — no issues found**, but still not reviewed by Kareem himself
  the way the dark palette was back in Stage 1, so leaving this open as
  "not Kareem-confirmed" rather than fully closing it. `tokens.ts`'s
  `lightColor` export, the toggle mechanism, and every new
  Work/Projects/Skills/About/Background/Contact section all held up
  cleanly forced into light mode. The stale-color caveat that used to be
  here (pinned About Me word-reveal not recoloring on a mid-session
  toggle) is fixed — see 2026-08-11 (18) in DONE.md.
- **Mobile viewport checked twice now** — 2026-08-09 (10) found/fixed
  `SkipIntro`/`ThemeLightbulb` overlapping the Navbar's "Work" button at
  390px; 2026-08-10 (4) found/fixed Contact's text overlapping the Navbar
  on a short viewport, and additionally confirmed touch-specific behavior
  directly (not just resized-desktop testing) — cursor correctly disabled
  on touch, a real `tap()` still works, no horizontal overflow anywhere
  site-wide. Not checked: anything below 375px, landscape orientation, or
  a real device (all of the above is Playwright's iPhone-13 emulation).
- **`CODE_WORDS` fly-through** content is still a first guess, not
  tuned against how it actually feels scrolling through it in real
  time.
- **SPEC.md destaled 2026-08-09 (10)** — now has a banner pointing to
  `CONTENT.md`/`DONE.md`/`TODO.md`/`timeline.ts` as the actually-current
  sources, plus a concise accurate shot-list summary, rather than a full
  rewrite of a 307-line document describing a substantially-redirected
  original plan.

## Waiting on Kareem

- **3D background room** (Kareem: "what do you think, can we do this
  easily?") — asked directly, see chat; short version: doable, but real
  scope (new geometry/lighting, not free), wants his go-ahead before
  starting.
- **Projects timeline layout** (Kareem: "can we bring back the timeline,
  I may add other projects, what do you think?") — asked directly, see
  chat; short version: makes more sense once he knows how many more
  projects are actually coming.
- **Hero/About Me mobile text vs. character — a fuller fix than 2026-08-11
  (14)'s text-shadow.** That was the safe, additive fix; the real one is
  reframing the camera specifically for narrow viewports (or moving/
  shrinking the text block) so it doesn't sit on top of him at all. Bigger
  change to an already-extensively-tuned sequence (`timeline.ts`) — worth
  doing, not attempted without checking first.
- **Navbar's horizontal scroll has no "more items" affordance** on mobile
  — it does scroll (`scrollWidth` 551px vs `clientWidth` 356px, CONTACT/CV
  are reachable), just nothing hints at it. Minor, noticed during the
  2026-08-11 (14) mobile pass, not fixed.
- **Copy sign-off on CONTENT.md's content as actually implemented.**
  Applied verbatim where CONTENT.md was explicit; a few judgment calls
  were made filling gaps it didn't cover directly (Work section's exact
  layout/stat-strip styling, Background's three-column combination of
  its Education/Competitive-programming/Languages sections, the
  copy-to-clipboard mechanic for email). Worth a look before treating
  as final.
- **Viewer account for the Rustaq demo** — see above, Kareem's call,
  not Claude's to create.
- **General camera/timing tuning** — a lot of the numbers in
  `timeline.ts` are first-pass estimates verified by screenshot, not
  hand-tuned by Kareem. Dev console hooks: `window.__heroTimeline` /
  `__heroScrollTrigger` (Hero sequence) and `window.__contactTimeline` /
  `__contactScrollTrigger` (Contact scene). Before scrolling starts,
  press-and-drag directly on the character does free orbit
  (`PreScrollOrbit.tsx`); after scrolling starts, the console hooks are
  the way to scrub and read values.

## Later (not started)

- **Fallback and polish**: mobile still image (under 768px, or
  `hardwareConcurrency <= 4`, or no WebGL2 → don't mount either canvas
  at all, render a static image instead), Lighthouse pass, full a11y
  audit with real contrast numbers, lazy-load the model so DOM text
  stays the LCP element. Bundle size (below) feeds into this.
- `PreScrollOrbit`'s drag interaction is desktop-mouse-oriented — touch
  devices get pointerdown/pointermove events too but this hasn't been
  checked for conflicts with native touch-scroll gestures on mobile.

## Noticed along the way, not yet addressed

- Production bundle is ~1.3MB / ~374KB gzip (three.js, loaded on two
  independent canvases' worth of code, though the library itself is
  only shipped once). Vite warns on chunk size. Code-splitting /
  lazy-mounting is a later-polish concern, not urgent yet.
- `Django_Blog_Project` on Kareem's GitHub has a committed `.env` and
  `db.sqlite3` (possible leaked secrets) plus a stray `v3.zip` backup.
  Unrelated to this portfolio build — his to handle separately,
  mentioned here so it isn't lost. (Still linked from the Projects
  section as of 2026-08-09 (8), now under the "Django Blog Platform"
  name.)
- The character model still has no dedicated lamp light or mesh of its
  own (checked again after the 2026-08-09 (9) model swap — the new GLB's
  only baked `KHR_lights_punctual` light is still `screen_spill`, same as
  before). The `lamp` key light in `SceneLighting.tsx` remains an R3F
  addition, not sourced from the model.
- **Contact's monitor screen still won't look as vividly "lit" as Hero's
  close-up shots, even with the 2026-08-10 (3) emissive fix applied.**
  Investigated while fixing the emissive-ramp gap: Hero's vivid glowing
  "code lines" turn out to come from small bar-mesh geometry on the
  screen, only legible at the extreme close-up FOV `monitorApproach` uses
  (see `THROUGH_EYES_CAMERA`/`MONITOR_ZOOM_CAMERA` in `timeline.ts`) — not
  from `monitor_screen`'s own material, whose baked emissive/base color is
  near-black regardless of scene. Contact's wide, distant end framing was
  never going to resolve that geometry. If a genuinely brighter-looking
  Contact screen matters, the real lever is camera distance/FOV at the end
  framing, not the material — untried, since it'd change the composition
  Kareem just asked to be recentered this same session.
- Never got to the bottom of *why* the static `ScrollTrigger.refresh()`
  didn't recalculate Contact's trigger even though the instance's own
  `.refresh()` did (see DONE.md, 2026-08-08) — worked around it rather
  than explained it. If a similar "refresh doesn't seem to work"
  symptom shows up again, that's worth actually investigating instead
  of routing around again.
