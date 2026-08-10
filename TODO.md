# Todo

If what you want isn't listed here or already shipped in [DONE.md](./DONE.md),
it hasn't been decided or started yet — tell Claude to do it.

## Right now: unfinished from the last session

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
  translate to rotate 2026-08-10)** — `DRAG_SENSITIVITY`/
  `DRAG_YAW_RANGE`/`DRAG_PITCH_RANGE`/`SPRING_BACK_DURATION` in
  `ContactTimeline.tsx` are first-pass numbers, confirmed to work exactly
  as coded (Playwright read `sceneRoot.rotation` directly: clamps to
  precisely `baseYaw ± 0.5`/`± 0.35` rad under an oversized drag, springs
  back to the exact original orientation on release) but not felt out by
  hand — "does this drag distance/range *feel* right" is a judgment call
  only Kareem can make. Same for the head cursor-follow range (0.42 rad,
  upward half now separately clamped to 0.14 rad).
- **Pacing numbers** (`HERO_SCROLL_PIN_VH` 620, `CONTACT_SCROLL_PIN_VH`
  210, the rebalanced `HERO_BEATS` fractions, Navbar/SkipIntro's
  `PIXELS_PER_SECOND`/durations, `throughEyes`/`monitorApproach`
  timing) are all judgment calls made by screenshot/Playwright, not
  measured against Kareem actually scrolling through them.
- **Light theme screenshot-reviewed section by section, 2026-08-09
  (10) — no issues found**, but still not reviewed by Kareem himself
  the way the dark palette was back in Stage 1, so leaving this open as
  "not Kareem-confirmed" rather than fully closing it. `tokens.ts`'s
  `lightColor` export, the toggle mechanism, and every new
  Work/Projects/Skills/About/Background/Contact section all held up
  cleanly forced into light mode. Unchanged caveat: the pinned About Me
  word-reveal (`HeroTimeline.tsx`) bakes its colors in once at
  construction, so toggling theme mid-session while already scrolled
  into that beat won't retroactively recolor it.
- **Mobile viewport now checked, 2026-08-09 (10) — one real bug found
  and fixed** (`SkipIntro`/`ThemeLightbulb` overlapping the Navbar's
  "Work" button at 390px, see DONE.md), rest confirmed clean
  (Work/Projects/Skills/About/Background stack sensibly, no horizontal
  overflow anywhere). Not checked: anything below 390px, or landscape
  orientation.
- **`CODE_WORDS` fly-through** content is still a first guess, not
  tuned against how it actually feels scrolling through it in real
  time.
- **SPEC.md destaled 2026-08-09 (10)** — now has a banner pointing to
  `CONTENT.md`/`DONE.md`/`TODO.md`/`timeline.ts` as the actually-current
  sources, plus a concise accurate shot-list summary, rather than a full
  rewrite of a 307-line document describing a substantially-redirected
  original plan.

## Waiting on Kareem

- **Copy sign-off on CONTENT.md's content as actually implemented.**
  Applied verbatim where CONTENT.md was explicit; a few judgment calls
  were made filling gaps it didn't cover directly (Work section's exact
  layout/stat-strip styling, Background's three-column combination of
  its Education/Competitive-programming/Languages sections, the
  copy-to-clipboard mechanic for email). Worth a look before treating
  as final.
- **Viewer account for the Rustaq demo** — see above, Kareem's call,
  not Claude's to create.
- **Real contrast-ratio numbers** for the text tokens (SPEC.md section 3
  flags its own figures as estimates).
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
