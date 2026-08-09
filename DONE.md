# Done

Newest first. One entry per work session/iteration — appended when a stage
or notable change ships, not for every small edit. See [TODO.md](./TODO.md)
for what's still open.

## 2026-08-09 (6) — Dark/light theme + 3D bulb, Experience section, cursor/drag fixes, slower pacing

Large batch, twelve items in one message. Two real bugs (cursor stuck
after rapid hover, cursor grabbing form labels), several deliberate
behavior changes (drag, cursor-follow direction, pacing, framing), and
three new pieces of the site (welcome message, word-reveal text
animation, Experience section + dark/light mode).

**Cursor stuck-outline bug, still happening after the earlier fix.**
Round (2)'s "derive hover state fresh every pointermove" fix solved the
*stale-state* failure mode but not this one: `growToTarget` tweened
`{x, y, width, height, borderRadius}` together in one `gsap.to()`, but
the old `shrinkToDot` only tweened `{width, height, borderRadius}` — if
the pointer left an element while the grow tween was still mid-flight,
the leave-tween's `overwrite` only killed the properties it touched,
leaving x/y still mid-flight toward the *just-left* element's center.
`CustomCursor.tsx` now has one `setOutline(x, y, width, height, radius,
duration)` used for every transition (grow AND shrink), each call an
explicit `overwrite: 'auto'` — no way for a partial tween to survive a
state change anymore. **Also removed `label` from `HOVER_SELECTOR`** —
"the cursor also selects the Name and email labels" — Contact's
`<label>Name<input/></label>` structure meant hovering the label's own
text (not the input) matched `label` and grew the outline around the
whole wrapper; the `input` itself still matches on its own.

**Contact whole-object drag changed from free rotation to a Y-axis nudge
with spring-back.** "Make the drag at the end for the whole object only
move in the y direction a bit, and it returns back to its position on
release." Replaced the two-axis (`yawOffset`/`pitchOffset`, persisted
between drags) rotation entirely: `onPointerDown` snapshots
`sceneRoot.position.y` as the baseline, `onPointerMoveDrag` offsets it by
drag distance (clamped to `DRAG_Y_RANGE`, small — "a bit"), and
`onPointerUp` tweens it back to the baseline with `elastic.out(1, 0.5)`
easing. Confirmed via Playwright: canvas visibly shifts during the drag,
then springs back within ~1s of release.

**Contact head cursor-follow Y axis was inverted.** One-line fix in
`ContactTimeline.tsx`'s `onMouseMove` — `head.rotation.x` now gets `-ny *
...` instead of `ny * ...`.

**Pacing slowed down across the board** — "make the animations a bit
slower so people can see the objects rotating, it's too fast now."
`HERO_SCROLL_PIN_VH` 560 → 620 and `CONTACT_SCROLL_PIN_VH` 180 → 210
(more physical scroll for the same motion, uniformly). On top of that,
`HERO_BEATS`' rotation-heavy beats (`introTurn`/`introSettle`,
`throughEyes`/`monitorApproach`) were widened specifically, at the
expense of the static hold beats (`entranceHold`, `aboutMeHold`) — same
total, more of it spent where something's actually turning. Navbar's
fast-forward jump speed also slowed (`PIXELS_PER_SECOND` 2400 → 1800,
`MAX_DURATION` 3.4 → 4.5) — long jumps were blurring straight through
these same beats.

**Intro settle framing — character now ends on the right, not centered.**
"In the first scene it's perfect, I just want the object to end on the
right, not in the center." Same real-geometry approach used everywhere
else in this codebase: `HeroTimeline.tsx` computes `SETTLE_CAMERA`'s
actual look-at target at runtime from the character's real world
position, offset toward camera-left (not the character) via the
camera-relative right/up axes (same cross-product technique as Contact's
framing), so he renders on the right of frame regardless of exactly
where he sits. `SETTLE_CAMERA.target` in `timeline.ts` is now just the
documented fallback. Confirmed by screenshot at the settle beat's end.

**Welcome message on the first black screen.** "Make a welcoming message
appear when the scroll is ready to be made." New `welcomeRef` in
`Hero.tsx` ("Scroll to begin" + chevron, bottom-center, matching
`ScrollControls`' minimal style) — `HeroTimeline.tsx` fades it in with a
real-time (not scroll-scrubbed) tween once the ScrollTrigger actually
exists (model loaded, pin created — genuinely "ready"), and fades it
back out on the first real `scroll` event, a one-shot native listener so
it doesn't fight `introFadeIn`'s own scrubbed tween on the separate
black overlay. Confirmed: opacity ~1 after the ready-delay, ~0
immediately after the first scroll tick.

**Word-by-word scroll-reveal text, majd-portfolio.framer.website-style —
new `WordReveal.tsx`, applied to About Me.** Screenshotted both reference
sites directly (WebFetch can't see rendered animation, only markup) to
confirm the actual behavior: each word dims (`text-low`) by default and
brightens to full contrast (`text-hi`) as the page scrolls past, word by
word, not the whole block fading in at once. Splits text into
`[data-word-reveal]` spans; `standalone` (default true) sets up its own
scroll-scrubbed `ScrollTrigger` for normal in-flow content, but About Me
is pinned/fixed (its position never changes while visible) so
`HeroTimeline.tsx` drives that instance's spans directly off
`aboutMeIn`/`aboutMeHold` progress instead (`standalone={false}`),
same stagger-computation pattern as the existing code-words fly-through.

**Experience section — new, chronological, tajmirul.site-styled.**
"A section of my timeline giving my CV data in a chronological way."
Screenshotted tajmirul.site's own "MY EXPERIENCE" list for the specific
behavior being copied: entries dim/brighten as they scroll into focus,
which is exactly what `WordReveal` (standalone, this time — a normal
in-flow section, not pinned) already does, just reused at the
role-heading level instead of a paragraph. New `data/experience.ts` —
built ONLY from facts already stated elsewhere on the site (AASTMT
graduation, Rustaq freelance work, currently open to work) — nothing
fabricated; the ITI entry and AASTMT's graduation year are honestly
`[VERIFY]`-flagged, same convention as `AboutMeContent.tsx`. New section
mounted between Also-built and Contact, added to the navbar.

**CV download link.** "I was thinking about adding my CV." Lives in the
new Experience section's header ("Download CV ↓" → `/CV.pdf`). No real
resume file exists yet — generated a genuinely valid placeholder PDF via
`cupsfilter` (not a broken/fake file) whose visible text says exactly
that, so the link works today and just needs the real file dropped in
the same path later. See TODO.md.

**Also-built (OtherProjects) now has the same repo/live-link split as
the main ProjectCards.** "Make all the projects have a hover effect...
and the ability of being selected to go to repo or live demo if there
is one." `OtherProject`'s single `href` field split into
`repoUrl`/`previewUrl` so entries with both show both (same convention as
`data/projects.ts`). No screenshot assets exist for these lighter
mentions, unlike the three flagship cards, which already have a real
image/video popup — rather than fabricate preview images, the "hover
effect" here is a background tint + glow-dot scale on the timeline
marker.

**Dark/light theme toggle + a real 3D light bulb.** "I was thinking of
adding a 3D light bulb that switches the mode of the website from dark
to light mode." `tokens.ts` gains a `lightColor` export (same
shape/roles as `color`, inverted) — still the single source of hex
values for both themes. Applied via CSS custom properties
(`theme/ThemeContext.tsx` sets `--color-*` directly on `<html>` via
`useLayoutEffect`, before paint) rather than Tailwind's `dark:` variant,
which would have meant touching every color utility in every component;
`tailwind.config.ts`'s colors now all resolve to `var(--color-*)`, so
existing `bg-void`/`text-text-hi`/etc. classes just pick up the new
values automatically. `index.css`'s `:root` block is only the pre-JS
bootstrap default (kept matching `tokens.ts` by hand, commented as such).
Defaults to dark **regardless of `prefers-color-scheme`** — this site's
whole identity is dark-first and light mode is a brand-new, unverified
first pass, not an equally-designed alternative to hand a
majority-light-OS visitor by default (caught this via Playwright: the
test browser's default light preference silently put the whole site in
light mode before this fix). Persisted via `localStorage`. New
`ThemeLightbulb.tsx` — a real procedural bulb (sphere + cylinder base, no
GLTF asset) in its own small `<Canvas>`, fixed top-right; glows when
switching TO light mode ("the light is on"), dims for dark. Scene.tsx and
ContactScene.tsx's background/fog now read the live theme reactively;
`WordReveal`'s standalone instances rebuild their color tween on toggle
too. **Known gap, flagged rather than silently accepted:** the pinned
About Me word-reveal's colors are baked into `HeroTimeline`'s GSAP
timeline once, at construction — toggling theme mid-session while
already scrolled into that pin won't retroactively recolor it.
Rebuilding that whole timeline on every theme change was a bigger,
riskier change than this pass covers.

Verified throughout: `npx tsc -b` and `npm run build` clean, full
Playwright pass in both dev and the production preview build — cursor
grow/shrink/reposition across a deliberately-interrupted hover, label
text no longer growing the outline, Contact drag-then-release position
readout, SETTLE reframing camera readout + screenshot, About Me word
colors sampled mid-transition, Experience section rendering with the CV
link, Also-built's new links, theme toggle flipping `--color-void` and
`data-theme` plus surviving a reload via `localStorage`, dark-by-default
confirmed even under a simulated light-OS browser context — zero
console/page errors across all of it.

## 2026-08-09 (5) — Scraper project swapped in for SIC/XE; PROJECT_PREVIEWS.md added

Round (4)'s "Scraper" repo search came up empty because it was private —
Kareem made it public and confirmed. Re-searched
(`github.com/KAboelnaga?tab=repositories&sort=pushed`), found **Scraper**
(Python, pushed 2026-07-25) immediately. Read its README: an async Python
scraper for zalando.it's product catalog — category discovery, pagination,
structured-data extraction (JSON-LD/hydration payloads first, Playwright
only as a JS-heavy fallback), Pydantic validation, PostgreSQL via
SQLAlchemy. Real, substantial, verifiable — added as `data/projects.ts`'s
new first entry ("Zalando.it Product Scraper", year 2026, making it the
newest and correctly sorted first ahead of Rustaq's 2025), repo-only (no
live URL — it's a CLI/backend tool, nothing to deploy), replacing SIC/XE
entirely.

**Caught and fixed my own mistake**: the first pass at this only *added*
Scraper without *removing* SIC/XE, leaving 4 cards in a "Selected work"
section designed around three — Kareem said "instead of," not "as well
as." Caught it myself via the Playwright verification pass (card-count
check), not because it was pointed out — removed SIC/XE's entry entirely
(it's not linked from anywhere else — `ProjectsGlimpseOverlay.tsx` no
longer lists individual project names since the 2026-08-09 (2)
simplification, so no dangling references anywhere). Also cleaned up a
now-inaccurate comment in `TechSkillsSlider.tsx` that specifically
justified prepending "Python" by referencing SIC/XE (Scraper's own stack
already lists Python directly, so the special-case prepend was both wrong
*and* redundant — removed rather than just relabeled).

**`PROJECT_PREVIEWS.md`** (new, linked from README.md): a short guide for
Kareem to swap preview images/videos himself — where the data field lives
(`previewImage`/`previewVideo` on `Project`), where files go
(`public/previews/`), the popup's fixed render size (320×220,
`object-cover`) so he knows roughly what aspect ratio works, and the
specific steps to replace Pet Society's current sign-in-screen placeholder
once he has a better screenshot.

Verified: `npx tsc -b` and `npm run build` clean, Playwright confirms
exactly 3 cards in the correct order (Scraper, Rustaq, Pet Society) with
correct real hrefs, zero console errors.

## 2026-08-09 (4) — ProjectCard shows both links; scraper-project swap researched but blocked

Kareem: "add both of the other linked repos links" — round three's
whole-card-as-`<a>` design meant a project with *both* a live URL and a
repo link could only show one (an `<a>` can't nest inside another `<a>`,
so the repo line was dropped whenever `previewUrl` was set). Restructured
`ProjectCard.tsx`: the card is a plain `<article>` again, not a link, and
"live preview ↗" / "view repo ↗" now render as two independent `<a>`s
whenever each field is set — no nesting problem since neither wraps the
other. The hover-triggered preview popup (image/video) still triggers off
the whole card, unrelated to which links are present. Confirmed via
Playwright: Pet Society now shows both `live preview ↗` (real live URL)
and `view repo ↗` (real GitHub URL) as separate clickable links.

**Swapping SIC/XE for "the scraper project" — researched, blocked on
Kareem.** Searched Kareem's public GitHub (all 51 repos, two pages,
searched "scrap"/"scrape"/"crawl") for anything scraper-related to
identify and wire up automatically, same approach that worked for Pet
Society/Rustaq. Found nothing — no repo named or described as a scraper,
crawler, or similar. Did not swap anything or guess; asked Kareem for the
actual repo (see TODO.md) rather than fabricate project details for a
portfolio card.

Verified: `npx tsc -b` and `npm run build` clean, Playwright confirms both
links render with correct real hrefs, zero console errors.

## 2026-08-09 (3) — Monitor ribbons hidden; Contact fully computed geometrically; real project data wired

Third round the same day, immediate follow-up feedback after trying round
two. Two real bugs found by inspection (one visual, one a rotation-pivot
issue), two numeric tweaks, and the clickable-project mechanism from round
two now has real data behind it.

**Skewed monitor "ribbons" during the projects title card — real visual
bug, caused by round two's own fix.** "The text on monitor are skewed to
the left (the rectangular ribbons), get rid of that." Removing the
zoom-out beat earlier the same day (see previous entry) meant the camera
now holds at `MONITOR_ZOOM_CAMERA` — extremely close, `fov: 5` — for the
*entire* final beat instead of just passing through it. The monitor's
baked-in code-line texture, previously only glimpsed mid-motion, was now
sitting still and filling the background the whole time, at a close
enough angle to read as skewed diagonal bars. Fixed by taking the overlay
to fully opaque (`opacity: 1`, was `0.85`) during this beat instead of
reintroducing camera movement — simplest fix that doesn't undo what
round two just removed.

**Contact head cursor-follow range raised** 0.22 -> 0.42 rad — "make it
follow the cursor more."

**Contact end-scene turn now computed from real geometry, not guessed —
same lesson this codebase has hit before.** "Complete the turn until he
is facing me, not the text." Round two's fix reused the old
`CONTACT_CHARACTER_YAW = 2.2` (renamed `CONTACT_SCENE_YAW`) because it was
already confirmed to turn the character toward the *text* — a different
target than "facing the camera," and evidently not the same angle.
`ContactTimeline.tsx` now computes the exact yaw at runtime: the signed
angle between the character's real monitor-facing direction (from his
world center toward `monitor_screen`'s world center, both boxed) and the
direction from him to the actual computed end camera position —
`Math.atan2`-based, wrapped to `(-π, π]`. `CONTACT_SCENE_YAW` is now only
the fallback if `monitor_screen` isn't found. Confirmed by screenshot: he
now turns to face the camera directly, a visibly different (more
frontal) pose than round two's guess. Also `CONTACT_END_CAMERA.fov`
30 -> 48 -> 60 across the two rounds — "make the fov 60."

**Whole-object drag rotation now pivots on the object's own center, not
its floor-level corner.** "I want the object rotation when clicked upon
at the end to have a fixed point in the center of the object and not on
the bottom." Root cause: `Character.tsx`'s loaded GLTF has a flat sibling
hierarchy with the scene's own origin sitting wherever the model was
authored (off in a corner, roughly floor-level) — rotating that raw
`scene` object directly (what `sceneRoot` was) meant the whole desk+
character assembly swung through a wide arc around that corner instead of
spinning in place. Added a third pivot in `Character.tsx` (same pattern
as `upperBodyPivot`/`headPivot`): `rootPivot`, positioned at the *entire
scene's* bounding-box center, with every one of `scene`'s original
top-level children (desk, chair, monitor, and the `upperBodyPivot` itself)
reattached into it. `onSceneReady` now hands out `rootPivot` instead of
the raw `scene` — a drop-in swap for every existing consumer, not just
Contact's drag: `getObjectByName` lookups (Hero's `monitor_screen`/`head`
targeting) work identically since they search recursively regardless of
reparenting depth, and rotation-based consumers (only Contact's drag, now)
automatically get the correct pivot. Confirmed by screenshot: a drag that
previously would have swung the object through a huge arc now visibly
rotates it in place, staying roughly centered in frame.

**Real project data wired in** — round two shipped the clickable-card +
hover-preview *mechanism* with no data behind it ("the project doesn't
have the popup hover, still — that should contain an image or video
preview" was Kareem noticing exactly that gap). Looked up real, public
info via GitHub instead of asking first, since it was independently
verifiable: `data/projects.ts` — Pet Society now has a confirmed live
`previewUrl` (`pet-society-silk.vercel.app`, confirmed via both the
repo's GitHub "About" section and its README) and a `repoUrl`
(`github.com/KAboelnaga/Pet_Society`); Rustaq gets a `repoUrl`
(`github.com/KAboelnaga/municipal-system`, confirmed public) but no
`previewUrl` — its own README explains client-identifying details were
stripped for the portfolio version, and GitHub lists no homepage, so
there's genuinely no public live version to link. Captured
`previewImage` for Pet Society directly via Playwright against the live
URL — it's the sign-in screen (app's behind auth, no demo credentials
available), an honest but not especially flattering shot; flagged in a
code comment for Kareem to swap if he has a logged-in screenshot.
`ProjectPreviewPopup.tsx` gained `previewVideo` support (autoplay/muted/
loop, takes priority over `previewImage`) per "an image or video
preview" — no video content exists yet, mechanism only. Also decoupled
the popup from the card's clickable state (previously only showed for
cards with a `previewUrl`) — a project can have a preview image without
a live URL to send visitors to. SIC/XE still has neither: it turned out
to be split across four separate small GitHub repos, not one project, so
which (if any) should represent it isn't obvious — flagged in TODO.md
rather than guessing.

Verified throughout: `npx tsc -b` and `npm run build` clean after every
change, full Playwright pass — confirmed the overlay is fully opaque
with no visible ribbons at the end of the Hero pin, `window.__contactCamera.fov
=== 60`, the geometrically-computed turn visibly reads as "facing the
camera" (screenshot comparison against round two's version), a drag
staying centered in frame instead of swinging wide, and the Pet Society
card rendering as a real `<a href="https://pet-society-silk.vercel.app">`
with its popup showing the captured screenshot on hover. Zero console/page
errors.

## 2026-08-09 (2) — Contact facing-mismatch fixed; zoom-out removed; cursor stuck-bug fixed; clickable-project mechanism

Follow-up round the same day, immediately after trying the previous
round's build. Six items, all real bugs or clear simplifications, not
redesigns-for-their-own-sake.

**Contact end-scene facing mismatch — real bug, not a feel issue.** "The
end scene is totally bad, the character is facing a side, the desk on the
other side." Root cause: the earlier same-day change moved the settle
rotation from `upperBody` to `sceneRoot` for the *drag* interaction, but
the *scripted settle tween* was still only rotating `upperBody` — so the
character alone turned ~126° (`CONTACT_CHARACTER_YAW = 2.2`) while the
desk, sharing no rotation, stayed at its original orientation. Fixed by
rotating `sceneRoot` (desk + character together) during settle instead,
and setting the character's own local yaw to 0 (his natural, already
desk-facing resting pose) — "make the character looking at the desk and
rotate both... that both of them are looking at me." Renamed
`CONTACT_CHARACTER_YAW` -> `CONTACT_SCENE_YAW` in `timeline.ts` to match
what it actually rotates now; kept the same numeric value (2.2) since that
was already screenshot-confirmed to turn the character toward the
camera/text, and since his local rotation is now 0 it's his entire
effective world rotation, unchanged in practice. Confirmed by screenshot:
desk and character now clearly face the same direction as one cohesive
turned-in-his-chair pose.

**Found and fixed while there — drag baseline bug.** Now that both the
settle tween *and* the drag interaction target `sceneRoot.rotation`, the
drag handler's `yawOffset`/`pitchOffset` locals still initialized to 0 and
called `.rotation.set()` (absolute, not relative) on every move — the
first pixel of any drag would have snapped the whole object from
`CONTACT_SCENE_YAW` back toward unrotated before applying the tiny drag
delta. Seeded `yawOffset = CONTACT_SCENE_YAW` instead of 0. Confirmed via
Playwright: a small, gradual drag now continues smoothly from the settled
orientation with no jump.

**Contact camera fov widened** 30 -> 48 (`CONTACT_END_CAMERA.fov` in
`timeline.ts`) — "increase the fov of the camera too."

**Custom cursor stuck-outline bug fixed.** "Sometimes the cursor becomes
buggy after leaving a hovered space." The previous implementation tracked
hover state via separate `pointerover`/`pointerout` listeners with a
boolean flag — any missed or out-of-order enter/leave pair (fast
mouse movement across adjacent elements, the pointer leaving the window
mid-hover) could leave the outline stuck large with nothing left to
un-stick it. Rewrote `CustomCursor.tsx` to derive hover state fresh from
`e.target.closest(...)` on every single `pointermove` instead — no
persistent state that can drift from reality for more than one frame,
since it's recomputed continuously rather than toggled by discrete
events. Confirmed
via Playwright: rapid-hover across all five navbar buttons then a fast
move to empty space leaves the cursor correctly back at dot size, not
stuck as an outline.

**Scroll-down button now always visible/clickable** — "I want the scroll
part to be always there so that I can always click it to scroll down."
Previously hid itself past `scrollY 120`. Removed that condition entirely;
back-to-top keeps its own threshold (still makes sense to hide it right at
the top). The two never overlap on screen (center vs. right), confirmed by
screenshot at the very bottom of the page — both visible together, no
collision.

**Hero's projects zoom-out removed entirely.** "The zoom out after text
popping fast, remove it, I don't want it, just a large 'projects that I
have done' text to appear then seeing my project." Deleted the
`projectsZoomOut` beat, `PROJECTS_REVEAL_YAW`, and `MONITOR_GLIMPSE_CAMERA`
from `timeline.ts` entirely (dead code, nothing else referenced them).
`projectsTextIn` now runs all the way to progress 1.0 with the camera
completely still at `MONITOR_ZOOM_CAMERA` — confirmed by reading
`window.__camera` at the very end of the pin: identical position/fov to
`MONITOR_ZOOM_CAMERA`, no drift. `ProjectsGlimpseOverlay.tsx` simplified
from a grid of all six project names down to one large heading ("Projects
I've built") — the real Projects section right after already shows the
actual list, so repeating it here was redundant once the zoom-out
spectacle around it was gone anyway.

**Clickable project cards + hover preview popup — mechanism only, data
still needed.** Two new opt-in fields on `Project`
(`data/projects.ts`): `previewUrl` (when set, the whole `ProjectCard`
becomes a link there instead of just a "view repo" line — can't nest an
`<a>` inside another `<a>`, so the repo line is dropped for cards that have
a `previewUrl`) and `previewImage` (shown in a new `ProjectPreviewPopup.tsx`
beside the card on hover). The popup is rendered via a React portal into
`document.body`, not inline — `ProjectCard`'s ancestor chain includes
`Parallax`, which applies a CSS `transform`, and a transformed ancestor
becomes the containing block for `position: fixed` descendants (they stop
tracking the real viewport); portaling out from under it avoids that.
Neither field has real values yet in `data/projects.ts` — no live URLs or
screenshots exist for the three flagship projects — so cards render exactly
as before until Kareem supplies them. See TODO.md.

Verified throughout: `npx tsc -b` and `npm run build` clean after every
change, full Playwright pass confirming each fix specifically (camera
position/fov readout matching `MONITOR_ZOOM_CAMERA` exactly at the Hero
pin's end, Contact's facing screenshot, the drag continuing smoothly
without a snap, scroll button visible at page bottom, cursor un-stuck
after rapid multi-element hovering), zero console/page errors.

## 2026-08-09 — Broken build fixed; parallax, navbar, custom cursor, skills marquee, whole-object rotation

Kareem reported the site wouldn't build ("I think I did sth in timeline file
that broke the project") and gave a nine-item wishlist in the same message,
asking for a todo list since it was too much for one line item. Worked
through both, in order.

**The break, root-caused:** `HeroTimeline.tsx` referenced `THROUGH_EYES_CAMERA`
and a `throughEyes` beat in `HERO_BEATS` that no longer existed in
`timeline.ts` — `npx tsc -b` failed with two `TS2305`/`TS2345` errors.
Something had deleted the `throughEyes` beat and its camera constant (added
in the 2026-08-08 "through the character's own eyes" session) while leaving
the component code that depends on them untouched. Restored both:
`throughEyes: [0.54, 0.59]` re-inserted between `aboutMeOut` and
`monitorApproach` (shifting the beats after it later by the same amount, so
the sequence still lands exactly at progress 1.0), and `THROUGH_EYES_CAMERA`
re-added as the fallback framing (real position is still computed at
runtime from the head node, per the existing comment). `npx tsc -b` and
`npm run build` both clean after.

**Which variables control the monitor zoom** (Kareem asked directly, wanted
to try values himself) — all in `timeline.ts`: `MONITOR_ZOOM_CAMERA` (the
deep "inside the monitor" framing — `fov: 5` is what makes it read as
zoomed in), `THROUGH_EYES_CAMERA` (the eye-level pass-through point just
before it, `fov: 15`), `MONITOR_GLIMPSE_CAMERA` (the partial pull-back
after the code words), and `HERO_BEATS.throughEyes` / `.monitorApproach`
(how much of the scroll range each stage eats — shrinking these makes the
zoom feel faster for the same scroll distance without changing *how deep*
it goes).

**Parallax between sections** (`Parallax.tsx`, new): a scrub-linked
(not one-shot like `ScrollReveal`) vertical drift as each wrapped block
crosses the viewport, so sections separate from each other instead of
moving in lockstep with the page. Applied to Projects' heading/grid
(positive speed) and Also-built's heading/timeline (negative speed) —
deliberately *not* applied inside the Hero/Contact pinned scenes, since a
child ScrollTrigger's own enter/exit progress goes inert once its ancestor
is pinned (bounding rect stops changing), so it would've been dead weight
there, not just redundant.

**Zoom-out camera rotation + whole-object turn** — "I want the camera to
rotate while zooming out to make the character and its desk both facing to
the left." The existing `projectsZoomOut` beat only rotated `upperBody`
(character only; desk/monitor stayed put). Switched it to rotate
`sceneRoot` — the entire loaded model, character included via the nested
`upperBodyPivot` — and moved `MONITOR_GLIMPSE_CAMERA.position` well off to
the side (`x: 0.55 -> 1.4`) instead of a near-straight pull-back, so the
camera visibly arcs/orbits during the move rather than just dollying
backward. Confirmed via screenshot: the monitor and desk are now shown from
a clearly rotated angle at the end of the beat, not just smaller.

**Head-only cursor tracking in Contact** — "I asked if the character's head
can follow the cursor, you made his whole body move, I want his face only
to be moving." `Character.tsx` now builds a second, nested pivot
(`headPivot`) scoped to just the head mesh's own bounding-box center (same
technique as `upperBodyPivot`, just computed from the head alone), exposed
via a new `onHeadReady` prop. `ContactTimeline` now rotates `head.rotation`
for cursor-follow instead of `upperBody.rotation` — confirmed by screenshot
comparison with the cursor at the far left vs. far right of the window.

**Free-axis drag on the whole object in Contact** — "I want to be able to
hold and rotate the whole object at the end, not just the character, and
not only in the y axis, in all directions." Press-and-drag now rotates
`sceneRoot` (desk + monitor + character together) on two axes — yaw from
horizontal drag, pitch from vertical drag (clamped to +-~82 deg so it can't
flip upside down) — instead of just `upperBody.rotation.y`. Cursor-follow
and drag are on two different nodes now (`head` vs. `sceneRoot`), so they
no longer fight each other. Stress-tested with a large synthetic drag via
Playwright; the whole desk+character assembly visibly tumbled to a new
orientation, confirming it's the full object and not just the character.

**Scroll button redesign** — "more minimal... written scroll beside it,
with an animation of the circular select on that button when approached."
Dropped the filled circular button chrome entirely; now just a "SCROLL"
mono label next to a small chevron, with a hairline SVG ring around the
icon whose `stroke-dashoffset` sweeps from hidden to fully drawn on
hover/focus (`ScrollControls.tsx`). Applied the same ring treatment to
back-to-top for consistency.

**Custom cursor** (`CustomCursor.tsx`, new) — "turn my cursor into a white
circular void that, when it hovers on any clickable item, makes an outline
outside the hovered item." Two layered fixed divs: a small dot
(`mix-blend-difference` white, so it reads correctly over both dark and
light content) that trails the real pointer via `gsap.quickTo`, and a
second ring that morphs — width/height/position/border-radius all tweened
— to trace the bounding box (plus padding) of whatever `a, button, input,
textarea, select, label, [role="button"], [data-cursor-hover]` element is
under the pointer, confirmed by screenshot hovering the navbar's "About"
button. Native cursor hidden via a `.custom-cursor-active` class on
`<html>`, gated to `@media (pointer: fine)` in `index.css` so touch devices
never lose tap affordance, and skipped entirely under
`prefers-reduced-motion`.

**Navbar** (`Navbar.tsx`, new) — "create a navbar that if I click on it
fast forward the animations to the desired section and way back in the
same way." Five stops (Intro/About/Projects/Also built/Contact); clicking
one animates `window.scrollTo` via GSAP's `ScrollToPlugin` (already bundled
free in the installed `gsap` package, no new dependency) over a duration
scaled to the actual scroll distance, rather than jumping instantly —
since every pinned scene is scroll-scrubbed already, animating real scroll
position plays the intro turn / monitor zoom / etc. visibly along the way
in whichever direction gets you there, which is what makes it read as
"fast forward" rather than a jump-cut, and "way back" falls out for free
from the same scrub mechanism. "About" has no DOM element of its own (it's
a beat inside Hero's pinned timeline) — its target is computed from
`HERO_BEATS.aboutMeHold`'s progress fraction times the pin's scroll
distance, confirmed by screenshot: clicking it lands the dev camera readout
almost exactly on `SETTLE_CAMERA`'s values. Active-section highlighting
tracks real scroll position.

**Tech skills marquee** (`TechSkillsSlider.tsx`, new), mounted between
Projects and Also-built in `App.tsx`. Continuous CSS-keyframe marquee
(`@keyframes marquee` in `index.css`, a doubled list translated by exactly
-50% for a seamless loop), pauses on hover. Skill list is derived from
`Project.stack` across `data/projects.ts` (deduped) rather than
hand-typed, plus "Python" prepended since it's named explicitly in
`AboutMeContent.tsx` but never appears as its own stack entry anywhere.

**Smoothness polish**: `transition-colors duration-300` added to the
plain `hover:underline` links that previously changed color instantly
(Also-built project links, Contact links, project-card repo links);
Footer wrapped in `ScrollReveal`; a brief `page-fade-in` keyframe on `body`
so the initial page load doesn't pop in.

Verified: `npx tsc -b` and `npm run build` clean throughout. Full
Playwright walkthrough of both dev and the interaction paths — every Hero
beat (including the restored `throughEyes`), the rotated `projectsZoomOut`
framing, real Projects/Also-built/Contact sections, the marquee, navbar
jumps to both a DOM section and the mid-timeline "About" beat, Contact's
head-only cursor tracking and whole-object drag, and the cursor's
hover-outline morph over a real button — zero console/page errors across
all of it. Not re-verified: mobile viewport and a full keyboard-only pass
(the new navbar/cursor/scroll-button markup is standard interactive
elements with existing focus-visible styles, but wasn't separately
tab-order-tested this session).

**Not felt out by hand yet, same caveat as everything else in
`timeline.ts`**: `MONITOR_GLIMPSE_CAMERA`'s new sideways-swung position,
the reworked `PROJECTS_REVEAL_YAW` rotation now applied to the whole model
instead of just the character, and the Contact drag/cursor-follow
sensitivity constants (`DRAG_SENSITIVITY`, `PITCH_LIMIT`,
`CURSOR_FOLLOW_RANGE`) are first-pass numbers confirmed correct by
screenshot, not hand-tuned by Kareem scrolling/dragging through them
himself.

## 2026-08-08 — Scroll-down/back-to-top buttons; "through the character's eyes" beat; color palette confirmed

**Scroll controls.** New `ScrollControls.tsx`, mounted once in `App.tsx`
(page-level, not scoped to Hero/Contact). Two fixed circular buttons
matching the existing bordered/mono/`signal`-on-hover style from
`Contact.tsx`: a scroll-down hint at bottom-center (only visible near the
very top, `scrollY < 120`, clicks `window.scrollBy({top: innerHeight})`),
and a back-to-top at bottom-right (visible everywhere past that point,
`window.scrollTo({top: 0})`). Both `smooth`-scroll, both proper `<button>`s
with `aria-label`/`aria-hidden`/`tabIndex` toggling so the hidden one isn't
keyboard-focusable. Verified with Playwright in both dev and the production
preview build: correct opacity/visibility at top vs. scrolled, both clicks
actually move `window.scrollY`, no console errors.

**New camera beat — "through the character's own eyes."** Kareem, after
confirming the intro turn itself is fine: "after viewing my about info I
want when I go to the zooming in part to first rotate and go through the
character with the camera as if I'm the character's own eyes then zoom into
the monitor and go rapidly inside." Added a new `throughEyes` beat in
`HERO_BEATS` (`timeline.ts`) between `aboutMeOut` and `monitorApproach`.
`HeroTimeline.tsx` looks up the real `head` node (same one `Character.tsx`
reparents into `upperBodyPivot`, still findable by name post-reparent),
computes its world-space bounding-box center, and nudges it slightly
forward along the head-to-monitor line of sight — the real "his eyes,
looking at his screen" position, not a guessed number (same pattern as
`monitor_screen`'s target and Contact's box-based framing).  Camera travels
from wherever About Me left it (`SETTLE_CAMERA`) to that point; the sweep
passes through his silhouette on the way, and since the head mesh is
backface-culled, ending up that close reveals what's ahead of him rather
than the inside of his skull — confirmed by screenshot at
`progress≈0.61`, code lines on the monitor already fill nearly the whole
frame. `monitorApproach` then continues from that closer starting point
into `MONITOR_ZOOM_CAMERA`, shortened and switched to `power2.in` easing —
"go rapidly inside the monitor" — confirmed by sampling `__camera` at
progress 0.66: already deep inside, code-line geometry filling the frame,
matching the old end-of-approach framing but reached faster and from a
closer start.

**Projects reveal stays "on black background."** Kareem: projects/other
work should read as "on black background as if I'm still inside the
monitor," not a reveal of the physical monitor bezel — the old
`projectsTextIn` overlay tween only lifted to `opacity: 0.6`, see-through
enough that `projectsZoomOut`'s pull-back visibly showed the monitor's
edge. Raised it to `0.85` (still enough see-through to read as "inside a
glowing screen," not flat black) — confirmed by screenshot at
progress 0.95: text reads clearly against a near-black frame, no bezel.

**Color palette — checked, no change needed.** Kareem pasted a full
token spec (`text-hi #E4E7EB`, `text-mid #A3ACBA`, `text-low #6B7685`,
`lamp #D99A45`, `lamp-glow #8A5F2A`, `signal #52A398`) asking to "try this
palette instead." Read `theme/tokens.ts` and compared hex-for-hex — every
value already matches exactly (these are the original Stage 1 tokens,
never modified since). No edit made; confirming this rather than silently
no-op'ing so it's not mistaken for an unaddressed request.

## 2026-08-08 — Intro camera reversal fixed; Contact framing solved with real geometry

Kareem repeated the Contact-scene ask nearly verbatim and added new,
specific feedback about the intro — both turned out to be genuine, and the
Contact one needed a real fix, not another guess.

**Intro camera direction reversal (real bug):** "the camera starts at an
angle and goes like it over-steers and then rotates the other side, I want
it to rotate in one direction." Checked the actual numbers rather than
guessing: `TURN_END_CAMERA.position.y` dipped (1.55 → 1.4 → 1.68) and
`TURN_END_CAMERA.target.z` bumped (-0.3 → -0.1 → -0.35) — both genuinely
non-monotonic between `FADE_IN_CAMERA` and `SETTLE_CAMERA`, a real
geometric reversal, not just a feel. Rewrote `TURN_END_CAMERA` so every
component (position and target, all three axes) sits strictly between the
two endpoints. Verified by sampling `window.__camera.position` at 20 points
across the whole intro range via real scroll — confirmed monotonic on every
axis, not just eyeballed.

**Contact scene framing — third attempt, different approach:** two previous
rounds of hand-guessed `CONTACT_END_CAMERA` coordinates hadn't reliably
landed "lower right, clear of the text." Stopped guessing numbers and
computed it from the character's actual world position instead — same
technique already used for the monitor screen. `ContactTimeline.tsx` now
does `new THREE.Box3().setFromObject(upperBody)` to get his real center,
places the camera at a fixed offset from *that*, then derives the camera's
own right/up axes (`cross(viewDir, worldUp)` etc.) and offsets the look-at
target toward camera-up + camera-left from his center — so wherever he
actually sits, he renders in the lower right, by construction, not by luck.
Worked on the first try once framed this way. `CONTACT_CHARACTER_YAW`
retuned to `2.2` (found by live-testing values against the new framing,
screenshot-verified) so he visibly turns to face left, toward the text.
Confirmed identical in dev and production builds.

**Lesson for next time a spatial framing request doesn't land after 1-2
guesses:** switch to computing from real object geometry immediately
instead of continuing to guess coordinates — it worked far better and
faster than the trial-and-error approach once actually tried.

## 2026-08-08 — Deeper/faster monitor zoom; projects reveal restructured; Contact drag-to-rotate

Follow-up round, same day, rapid-fire feedback while the previous round was
still being verified. All landed:

- **`monitorApproach` beat shrunk** (0.15 → 0.08 of the pinned sequence) —
  "make it faster." Freed-up space went to `projectsGlimpse`, which also
  got restructured (see below).
- **`MONITOR_ZOOM_CAMERA` pushed dramatically closer** — "zoom into the
  monitor more" — close enough that individual code-line bars fill the
  entire frame; verified by screenshot, not just by the numbers looking
  smaller.
- **`projectsGlimpse` split into two beats**, `projectsTextIn` and
  `projectsZoomOut` — "make the projects and selected works right after the
  text without zooming out, then zoom out." Camera now holds perfectly
  still at the deep monitor framing while all six project names (three main
  + Also-built) fade in in sequence; only *after* they're shown does the
  camera ease back to `MONITOR_GLIMPSE_CAMERA`, with the character's upper
  body turning to a new `PROJECTS_REVEAL_YAW` (opposite side from the intro
  turn) at the same time — "make the character rotation to the other side."
- **Contact scene reframed around "zooming out of the screen"** as an
  explicit continuation of the Hero sequence's monitor-entry metaphor, per
  Kareem's own description of the intended narrative arc (entered the
  screen → saw the projects → now backing back out into the contact page).
  The mechanism was already roughly this shape; this made the framing/
  comments explicit rather than changing the underlying approach.
- **Contact character is now interactive once settled**: press-and-drag
  rotates him in place (`DRAG_SENSITIVITY`, accumulates rather than
  resetting on release), and — only when *not* being dragged — his face
  subtly tracks the cursor on top of wherever the drag last left him. Both
  gated behind `st.progress >= 1` so neither fights the GSAP settle tween
  while the pin is still animating in. This coexists with the existing
  `PreScrollOrbit` drag interaction in the Hero scene (different component,
  different canvas, no overlap in when each is active).

Verified: typecheck clean after each change, scroll-position-simulated
screenshots confirming the static-hold-then-zoom-out behavior and that both
project lists appear, production build succeeds, no console errors.

**Not yet verified by eye** (mechanically wired and doesn't throw, but
"does it actually feel right" wasn't checked given the pace of incoming
feedback): the Contact drag-to-rotate and cursor-follow interaction, and
whether `PROJECTS_REVEAL_YAW`'s direction reads correctly as "facing the
text on the left." Worth Kareem actually trying the drag interaction
himself rather than trusting a screenshot for this one.

## 2026-08-08 — Real pin-ordering bug fixed; intro made interactive; monitor/Contact refinements

Kareem reported "the sequence of the scenes became totally wrong," then gave
a long list of refinements while this was being investigated. Both turned
out to matter — there was a genuine bug, and the refinements were separate,
valid asks.

**The real bug:** `ContactTimeline` created its `ScrollTrigger` pin
immediately on mount (nothing gated it), which usually happened *before*
`HeroTimeline`'s — Hero's pin waits on the character model loading. That
meant Contact's pin measured its trigger position against a page that was
still short (before Hero's much-taller spacer existed), landing on a wildly
wrong, far-too-early scroll position — the Contact scene visibly overlapped
the Hero scene partway through. `ScrollTrigger.refresh()` (the static,
refresh-everything method) seemed like the obvious fix but empirically
**never actually corrected it**, even called repeatedly, even after a
multi-second delay — only calling `.refresh()` on the specific instance
directly did anything, which isn't something production code can rely on
(that path was only reachable through a dev-only `window` hook). Root-caused
and fixed properly instead: added `src/scenes/heroReady.ts`, a tiny pub-sub —
`ContactTimeline` now waits for Hero's pin to genuinely exist before
creating its own, so its first-ever measurement is correct from the start.
Never got to the bottom of *why* the static refresh call didn't work; the
comments in `heroReady.ts` and `ContactTimeline.tsx` record what was tried.

**Made the whole thing interactive and scroll-driven, no dead time:**
- `HERO_BEATS`'s `introTurn` and `introSettle` are now back-to-back with no
  gap — continuous camera/character motion from the first frame to the
  settled framing, no static hold ("no pauses in between from the start
  till he reaches the desired place").
- `SCRUB` dropped from 1s to 0.35s on both pins — a full second of lag
  between scroll input and visual response, on a sequence this long, reads
  as things happening out of order even when they aren't. (This was a
  secondary contributor to the "totally wrong" report, separate from the
  pin-ordering bug.)
- **`PreScrollOrbit.tsx`** (new): press-and-drag orbit around the character,
  active only before the visitor has scrolled at all — "make the character
  clickable, I can press and hold to rotate it." The moment scrolling
  starts, dragging disables itself. Getting the camera to actually snap back
  to the starting framing on that first scroll tick needed an explicit
  `tl.set(camera.position, ..., 0)` at the very start of the timeline —
  learned that GSAP only ever assigns a property while some tween/set
  touching it is active at the current time; without that, the camera would
  have just stayed wherever the drag left it, since nothing in the timeline
  touches `camera.position` before `introTurn` starts.

**Monitor sequence:**
- Camera now targets the `monitor_screen` mesh's actual world-space
  bounding-box center (`THREE.Box3.setFromObject`) rather than a
  hand-eyeballed guess.
- Pushed dramatically closer for `monitorApproach` — "go deeper into the
  monitor... so the camera is totally inside" — close enough that individual
  code-line bars fill the entire frame before black.
- New `projectsGlimpse` behavior: camera eases back out to
  `MONITOR_GLIMPSE_CAMERA` (still facing the monitor) while the overlay goes
  semi-transparent instead of solid black, and **both** the three main
  projects and the Also-built list fade in in sequence — "I want to see the
  projects I made... and also the other projects."
- Code-word fly-through: tried entering from random screen edges per an
  earlier request, Kareem preferred the original center-grown version once
  he'd seen both — reverted. `ProjectsGlimpseOverlay` intentionally stays a
  plain full-black overlay, not shaped to the monitor bounds — "forget about
  making the text inside the monitor shape for now."

**Contact scene:**
- `CONTACT_CHARACTER_YAW` flipped to negative (opposite sign from the Hero
  intro's `CHARACTER_TURN_YAW`) — "make the last scene rotate in the
  opposite direction."
- Character now actually rotates during the pin (previously `ContactScene`
  never captured `upperBody` at all) and gets a subtle mousemove-driven
  look-toward-cursor once the reveal fully settles (`st.progress === 1`) —
  "maybe make his head follow the cursor." It's the whole upper-body pivot
  moving, not an isolated head bone (none exists), so keep expectations
  modest — it's a subtle attentive tilt, not real gaze tracking.
- Camera framing nudged twice toward "character in the lower right, clear of
  the text" — **still not fully there**, see TODO.md. Verified via
  screenshot that he no longer looks centered/overlapping as badly as the
  first pass, but he still overlaps the intro paragraph somewhat.

Verified throughout: typecheck clean at every step, full scroll-simulation
screenshots (not just time-based waits) after each major change, production
build succeeds, no console errors at any point.

## 2026-08-08 — Everything scroll-driven; monitor pass-through; Contact rebuilt

Kareem asked for a further, bigger revision on top of the same day's earlier
scroll redesign: the intro turn itself should be scroll-driven too (not
autoplay), the monitor zoom should become a full pass-through (black screen
+ flying code words) landing on the real Projects page, Projects should get
scroll effects, and a new pinned Contact scene should reveal the character
again ("from the back of the monitor") into a "Let's get connected" section
with a message form.

- **`HeroTimeline.tsx`** (new) replaces `IntroTimeline.tsx` + `ScrollTimeline.tsx`
  entirely — one `ScrollTrigger`-pinned GSAP timeline covers the whole
  journey: intro turn (camera/character values byte-for-byte unchanged from
  the old autoplay version, per "don't change anything in the first scene,
  just make it happen by scrolling") → entrance text → About Me → monitor
  approach → black pass-through → flying code words. No more autoplay, no
  more Skip button, no more prefers-reduced-motion branch for the intro — the
  reasoning: once everything is scroll-driven, the user already controls the
  pace, so there's nothing left to skip and scroll-linked motion is generally
  understood as exempt from reduced-motion concerns (unlike the autoplay this
  replaced).
- **`HERO_SCROLL_PIN_VH` is now 520** (was 280) — the sequence roughly
  doubled in content. Deliberate, documented deviation from SPEC.md's
  original ~250vh guidance.
- **The "camera enters the screen" effect is a DOM illusion, not literal 3D
  movement** — camera stops moving at a close-up framing
  (`MONITOR_ZOOM_CAMERA`), then a black overlay (reusing the same `void`-
  colored div from the intro's fade-in) covers it and `CodeWordsOverlay.tsx`
  flies ~18 staggered, overlapping code snippets past the camera. Avoids
  clipping-through-geometry artifacts a literal camera-through-mesh approach
  would risk. Ends exactly at scroll progress 1.0; the natural unpin +
  continued scroll reveals the real Projects section underneath — no
  fade-back-in needed.
- **`ScrollReveal.tsx`** (new): reusable fade+rise-on-scroll wrapper, `once`
  (doesn't re-trigger scrolling back up), skips itself under
  prefers-reduced-motion. Applied to the three project cards with a stagger.
- **Contact section rebuilt**: `ContactScene.tsx` + `ContactTimeline.tsx` give
  it its own independent `<Canvas>` and short pinned sequence (black → camera
  pulls back to a wide, angled shot with the character on the right →
  "Let's get connected" text reveals). Deliberately a **second, separate**
  canvas rather than one page-spanning persistent one — simpler, and there's
  already a natural scene-cut via Projects in between, so pose continuity
  from the Hero sequence doesn't matter narratively.
- **`Character.tsx` now clones the loaded scene** (`cachedScene.clone(true)`)
  instead of using drei's cached result directly — necessary once two
  independent `<Canvas>`es both mount `<Character>`: an `Object3D` can only
  have one parent, so sharing the cached graph would make the two scenes
  fight over it (whichever mounted second would silently steal it from the
  first). No skinning in this model, so a plain deep clone is enough;
  `SkeletonUtils` isn't needed.
- **"Send me a message"** opens the visitor's own email client via a
  `mailto:` link built from the form fields (`Contact.tsx`'s
  `buildMailtoUrl`), rather than a real backend-connected form — a working
  form service (Formspree, Web3Forms, etc.) means a new third-party
  dependency, which per the spec's working agreement needs asking first, not
  deciding silently. Labeled honestly ("Send — opens your email client") so
  it isn't mistaken for a real submission.
- **Real bug fixed, cost real debugging time**: `Scene.tsx` passed
  `onReady={() => setReady(true)}` — a new function identity every render —
  into `HeroTimeline`'s effect dependency array. Calling it triggered a
  Scene re-render, producing a new `onReady` reference, which re-ran the
  effect immediately: React cleaned up (killing the just-created
  `ScrollTrigger`) and re-ran, but the `createdRef` guard blocked
  recreation, leaving **no active pin at all** — `window.__heroScrollTrigger`
  was defined but already dead, `.pin-spacer` never existed, and the
  document was too short to scroll through the sequence. Fixed by wrapping
  the callback in `useCallback(() => setReady(true), [])` in `Scene.tsx`,
  plus defensively resetting `createdRef.current = false` in the effect's
  cleanup so any future legitimate re-run recreates rather than silently
  no-ops. Worth remembering for `ContactTimeline` and anything similar later
  — any function passed as a prop into an effect's dependency array needs a
  stable identity, or the effect needs to not depend on it.
- Verified: full scroll-through in both dev and production builds (console
  errors, landmarks, `h1` count, mobile viewport), each beat individually via
  scroll-position simulation (not `.seek()` — see the intro-timeline entry
  below for why that lies to you) plus real-time-elapsed playback.

**Known rough edges, first pass, not final:**
- The Contact scene's character placement reads as "right side, roughly
  centered" rather than clearly "bottom right" as described — needs another
  framing iteration.
- The monitor screen in `ContactScene`'s independent canvas renders at
  whatever emissive baseline the material has in the file, since nothing
  ramps it there (unlike Hero's canvas) — looks a little dark/off in that
  shot. Minor, not a functional bug.
- `CODE_WORDS` content and stagger timing are a first guess, not tuned
  against real playback feel yet.
- SPEC.md is now further out of date than before — see TODO.md.

## 2026-08-08 — Scroll-driven redesign (entrance reveal / About Me / monitor zoom)

Kareem redirected Phase 2 away from SPEC.md's original A_HERO/B_APPROACH/
C_PORTAL design, in conversation. New flow, confirmed with him before
building: autoplay intro (unchanged) → scroll reveals "Kareem Aboelnaga"
then "Software Engineer" (each its own scroll beat) → About Me (background
holds perfectly still — "the same background stays") → camera zooms into
the monitor → existing Projects/Also-built/Contact sections continue
normally once the pin ends. Background is now full `100svh` (was `90svh`).

- `src/scenes/timeline.ts`: added `SCROLL_PIN_VH` (280), `SCROLL_BEATS`
  (progress-fraction ranges per beat), `MONITOR_ZOOM_CAMERA`,
  `MONITOR_EMISSIVE_START/END`.
- `src/scenes/ScrollTimeline.tsx` (new): GSAP `ScrollTrigger` pin + scrub
  over one timeline covering all beats — text opacity/translate reveals,
  camera dolly into the monitor, and the `monitor_screen` mesh's
  `emissiveIntensity` ramping via `KHR_materials_emissive_strength`.
- `Character.tsx` now also exposes the raw loaded scene (`onSceneReady`) so
  `ScrollTimeline` can look up `monitor_screen`'s material at runtime.
- `Hero.tsx` restructured: dropped the intro paragraph and "view work" link
  (didn't fit the new guided-scroll narrative); name+title text defaults
  visible in static markup (safe fallback if JS fails) and JS hides then
  reveals it on scroll; About Me defaults `opacity-0` instead (accepted
  JS-dependency for this secondary content — see the comment in Hero.tsx for
  the reasoning) and gets lifted from normal flow into a fixed overlay via
  `gsap.set` in a `useLayoutEffect`, so it doesn't double-count scroll height
  against ScrollTrigger's own pin spacer.
- `IntroTimeline.tsx` no longer touches any text opacity — that's entirely
  ScrollTimeline's job now. Its `textRef` prop is gone.
- Retired `OrbitControls` interactivity entirely (it would fight
  `ScrollTimeline` for camera control once scroll starts — both call
  `camera.lookAt` independently). `DevCameraOverlay` no longer depends on it;
  reads `camera` directly plus an optional `getTarget()` accessor.
- New dev hooks: `window.__scrollTrigger`, `window.__scrollTimeline`.
- Verified via scroll-position simulation (not just time-based waits) across
  every beat, dev and production build, mobile viewport, console-error and
  landmark/focus checks. `MONITOR_ZOOM_CAMERA` needed one real iteration —
  first guess overshot past the monitor into empty space; corrected by
  checking the mid-zoom frame (which looked right) and dialing back from
  there rather than the original blind guess.
- **`AboutMeContent.tsx` ships with `[VERIFY]` placeholder text** — ITI
  track/dates and the freelance summary are not real copy yet. Flagged
  prominently in TODO.md. Do not treat as final.
- Did not get to: updating SPEC.md's Phase 2 section to reflect this new
  direction (it still describes the old A_HERO/B_APPROACH/C_PORTAL design).
  Session ended before that cleanup pass — do it next.

## 2026-08-08 — Stage 3: Intro timeline

- One GSAP timeline drives all four beats — `FADE_IN` → `TURN` → `HOLD` →
  `SETTLE`, 3.6s total — animating camera position/look-at/fov, the
  character's upper-body turn, the black overlay fade, and the hero text
  fade-in (last 0.5s of `SETTLE`).
- `prefers-reduced-motion` renders the `SETTLE` end state instantly, no
  animation.
- Skip (any scroll/click/keydown/touch, or the visible "Skip intro" button)
  jumps straight to the end via GSAP `.progress(1)`.
- Fixed: the Draco decoder was loading from drei's default `gstatic.com` CDN
  at runtime, adding multiple seconds of latency in production — self-hosted
  it in `public/draco/` (same reasoning as the fonts: no external CDN calls).
- Fixed: the Skip button's 400ms appearance timer was scheduled from
  component mount rather than from when the intro actually starts (which
  waits on model load, and never happens under reduced-motion) — could flash
  the button on with nothing to skip.
- Dev tools added: `window.__introTimeline` / `__camera` / `__upperBody` for
  scrubbing and inspecting state — confirmed stripped from the production
  build.
- Known weak spot: `CHARACTER_TURN_YAW` is subtle — turn reads more like a
  partial profile than a clear "facing camera" reveal. Mechanically sound
  (no geometry breakage), just needs tuning — see TODO.md.
- Learned: GSAP's `.seek()` suppresses `onUpdate` callbacks by default
  (`.progress()` does not) — cost debugging time scrubbing frames for
  screenshots, never affected real playback/skip.

## 2026-08-08 — "Also built" timeline + GitHub research

- Added a secondary "Also built" section below the three flagship projects:
  a dashed-line timeline listing Pneumoxpert 2.0, Django Blog Project, and
  Movie App — lighter-weight treatment than the case-study cards, per
  Kareem's request.
- Added GitHub and LinkedIn links to the Contact section.
- Researched Kareem's public GitHub to evaluate SIC/XE vs. alternatives
  (his graduation project, Movie App) as the third flagship project.
  Recommendation: keep SIC/XE — it's the one project demonstrating CS/systems
  depth independent of a web framework, which the "backend & full-stack"
  positioning benefits from. Flagged along the way: `Django_Blog_Project`
  has a committed `.env` + `db.sqlite3` (possible leaked secrets, his to fix
  separately, not part of this build).

## 2026-08-08 — Stage 2: Model in frame

- Installed `three`, `@react-three/fiber`, `@react-three/drei`.
- Compressed `character.glb` 1.69MB → 569KB (Draco + WebP) while preserving
  node names/hierarchy — the default `gltf-transform optimize` preset
  silently destroyed all named nodes on the first attempt (`--join`
  /`--flatten` merge meshes), had to rerun with those disabled.
- `Scene.tsx`: canvas mounts, model loads, lighting wired to
  `src/theme/tokens.ts` (`lamp` = key light, `lamp-glow` = secondary), plus a
  temporary `OrbitControls` and a dev-only live camera-readout overlay.
- Fixed: negative `z-index` on the canvas wrapper desynced paint order from
  hit-test order — the scene rendered correctly but `OrbitControls` never
  received pointer events.
- Fixed: the DOM hero-text wrapper was capturing pointer events across its
  entire bounding box (even empty space between lines), blocking clicks from
  reaching the canvas underneath.
- Fixed: `OrbitControls` with `enabled={false}` never calls its internal
  `update()`, so the camera was never aimed at all in production (position
  set, but no look-at ever applied) — added a one-time `AimCamera` component.

## 2026-08-08 — Stage 1: Skeleton

- Vite + React + TypeScript (strict mode) + Tailwind v3 — chosen over v4
  specifically so `tailwind.config.ts` can `import` `tokens.ts` directly,
  satisfying the spec's "single source of truth, imported from both sides."
- Fonts self-hosted as WOFF2 (Bricolage Grotesque, Instrument Sans,
  JetBrains Mono — converted from Google Fonts OFL source TTFs).
- Design tokens centralized in `src/theme/tokens.ts`.
- Full plain-HTML page shipped: hero (name/title/intro), three project cards
  (Rustaq, Pet Society, SIC/XE — no numbering, per spec), contact, footer.
  No 3D at all — a complete, deployable page on its own.
- Verified via Playwright screenshots (no `chromium-cli` available in this
  environment, installed Playwright ad hoc) — a11y landmarks, visible focus
  states in `signal`, responsive on mobile/desktop.
