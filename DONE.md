# Done

Newest first. One entry per work session/iteration — appended when a stage
or notable change ships, not for every small edit. See [TODO.md](./TODO.md)
for what's still open.

## 2026-08-11 (14) — Contact form now actually sends (EmailJS, real keys installed and test-verified end to end); first mobile pass — two real "stuck" overlap bugs fixed (Hero/About Me text vs. the character, Contact's WhatsApp link vs. the lightbulb widget), rest of the site checked clean

Kareem picked EmailJS (recommended) for real sending and "you investigate
and fix what you find" (recommended) for the mobile pass, both via a
direct question rather than guessing. Answered both in the same session.

**Contact form: real send, not just `mailto:`.** Installed
`@emailjs/browser`, wired `Contact.tsx`'s submit handler to call it when
`VITE_EMAILJS_SERVICE_ID`/`_TEMPLATE_ID`/`_PUBLIC_KEY` are set (new
`src/vite-env.d.ts` for the env typing, `.env.example` documenting the
three keys, `.env`/`.env.*` gitignored except the example), falling back
to the exact old `mailto:` behavior unchanged when they're not — this is
an additive upgrade, not a required step, so nothing breaks if the keys
are ever missing. Kareem supplied his real EmailJS service/template/public
key directly in chat; written to a local, gitignored `.env`. Verified for
real, not just code-reviewed: submitted the live form via Playwright with
real form data and confirmed the actual EmailJS API call
(`api.emailjs.com`) returned `200 OK`, and the button walked through its
`Sending… → Message sent` states correctly. One real test email should be
in Kareem's inbox from this — expected, not an accident.

**Mobile pass — investigated with a real device-emulated Playwright sweep
(iPhone 13 viewport), not guessed.** Checked every section for horizontal
overflow programmatically (`scrollWidth` vs `clientWidth`) at ~20 scroll
positions through the Hero pin plus every section in normal flow — zero
page-level horizontal overflow anywhere, that part of the site holds up.
Screenshotted throughout and found two *persistent* ("stuck," not
transient-during-scroll) real bugs, both fixed:

- **Hero's name/title and About Me text overlap the character
  unreadably on narrow viewports, for the entire pinned sequence.** Root
  cause: the text block's `max-w-3xl`/`max-w-4xl` constraints only matter
  once the viewport is *wider* than that — on a 390px phone the text
  spans the full width same as the character, instead of desktop's clear
  left two-thirds. A full fix would reframe the camera per breakpoint,
  which is a much bigger and riskier change to a sequence that's already
  been tuned extensively (see `timeline.ts`'s history) — not attempted
  without checking first. Applied the safe, additive fix instead: a
  strong inherited `text-shadow` on both text blocks so they stay legible
  regardless of what's behind them. Genuinely better, not a complete fix
  — said so plainly rather than overclaiming; a real per-breakpoint
  camera pass is still open if Kareem wants it (see TODO.md).
- **Contact's "WhatsApp" link renders directly under the fixed
  ThemeLightbulb widget on mobile, for the entire pinned Contact
  sequence.** Same class of bug `pt-28` already fixed here for the
  Navbar collision (2026-08-10 batch) — this is the same content block
  reaching under a *different* fixed widget (the lightbulb, `right-4`
  + `h-20 w-20`) this time. Fixed with `pr-24` on mobile (removed at
  `sm:`) so the links row wraps clear of that column instead of
  reaching under it.

Distinguished real bugs from testing artifacts along the way: a few
screenshots showed section headings transiently sliding under the fixed
Navbar mid-scroll (e.g. Background's "B.Sc. Computer Engineering") —
not fixed, and deliberately not chased, since that's an artifact of
`scrollIntoViewIfNeeded()` hard-snapping content to the viewport edge in
the test script, not something a real visitor scrolling by hand would
experience as "stuck." The Hero/Contact cases above are categorically
different: pinned sections hold the visitor at that exact scroll state
for the whole beat, so an overlap there really is stuck, not transient.
Skills, Background's grid, and the Navbar's own horizontal scroll (pill
genuinely scrolls, `scrollWidth` 551px vs `clientWidth` 356px — just has
no visual "more to scroll" affordance, noted but not fixed) all checked
out clean.

Verified: `npx tsc -b` and `npx oxlint src/` both clean. Every fix
screenshotted on the real iPhone-13-emulated viewport after the change,
not just before/after diffed by eye.

## 2026-08-11 (13) — Monitor-screen mockup recentered (real off-center bug, not baked into a texture); project cards fully clickable; WhatsApp link; Background overflow root-caused (a font-size key that doesn't exist in this project's custom scale); About Me's restated heading removed and given its own font (Sora, self-hosted); full live-copy extraction for review

Eight items from one large batch of direct asks, worked in the order that
let later ones build on earlier investigation.

**Monitor screen content recentered — real geometry bug, not a texture.**
"Text on the monitor [is] translated [off-center], center them." First
assumption (a baked texture needing a UV offset) was wrong — inspecting the
live scene graph (`monitor_screen`'s material has no `map` at all) showed
the "code" is ~30 individual mesh siblings (`ui_sidebar`, `code_line_0..14`,
etc.) under `monitor_head`, each independently positioned. Computed both the
screen mesh's own local bounding-box center and the mockup nodes' combined
center and found them several centimeters apart on x (and slightly on y) —
confirmed by zoomed screenshots at two different camera distances, gap
clearly on one side. Fixed generally in `Character.tsx` (so both Hero's and
Contact's independent model instances get it, same file, one fix): shift
every `ui_*`/`code_*` node by the real, computed delta between those two
centers, not a hand-picked constant.

**Project cards fully clickable again, live demo first, else repo.**
Reverses the 2026-08-10 batch's own explicit fix (whole-card link removed
specifically because a real `<a>` can't contain two more `<a>`s) — Kareem
asked for it back regardless. Kept both explicit "live preview"/"view repo"
links (still real `<a>`s, still both always reachable) and added a plain
`onClick` on the `<article>` that opens `previewUrl ?? repoUrl` in a new
tab, guarded to no-op when the click actually landed on one of the inner
links/buttons (`e.target.closest('a, button')`) so clicking "view repo" on
a card that also has a live demo can't double-navigate. `data-cursor-hover`
added so CustomCursor's outline treats the whole card as clickable too.
Verified three ways via Playwright: empty-space click on a repo-only card →
repo; empty-space click on a card with both → live demo; explicit "view
repo" click on that same card → repo, not the demo.

**WhatsApp link added to Contact**, same `PHONE_TEL` number, via a new
`data/socialIcons.ts` entry (vendored simple-icons path, same pattern as
GitHub/LinkedIn) and a third entry in the existing icon+label links row.

**Background overflow root-caused — not a spacing/margin issue, a broken
utility class.** "Competitive programming... overflowing on the other
section." `break-words` alone (first attempt) technically stopped the
horizontal spillover but produced ugly, arbitrary mid-word wrapping
("Contes-tant") and a badly uneven list rhythm — pointed at a deeper cause.
Found it: `sm:text-5xl` doesn't exist in this project's custom `fontSize`
scale (`tailwind.config.ts` only defines up to `4xl`, and does so by
*replacing* Tailwind's default scale, not extending it) — so that class
silently generated no CSS rule at all, and the *base* `text-4xl` (6.5rem /
104px in this custom scale, not Tailwind's normal ~2.25rem) applied at
every breakpoint uncontested. 104px is enormous for a whole word
("Contestant," the one non-numeric placement — the short numeric ones
never exposed this). Resized to `text-2xl sm:text-3xl`, both real keys in
the actual scale; `break-words` kept on as a backstop. The same dead
`text-5xl`/`text-6xl` pattern exists in `ProjectsGlimpseOverlay.tsx` too,
noted but left alone — that one just caps out early rather than actively
overflowing, lower priority.

**About Me: restated heading removed, given its own font.** "Remove the
title under about me (Backend & full-stack...)" — gone, the paragraph is
the whole beat now. "I don't like the about me font, look for another
modern font" — self-hosted Sora (downloaded once from Google Fonts'
variable-font endpoint, same self-hosted pattern as the other three
typefaces, no runtime CDN call) and scoped it to just this paragraph via a
new `font-about` Tailwind utility / `font.aboutMe` token, rather than
changing the sitewide `font-body` everyone else still uses.

**Full live-copy extraction, `CONTENT-LIVE.md`.** "Extract me a copy for
the website content, I need to see and improve the context." Kareem's own
CONTENT.md (referenced constantly throughout this codebase's comments and
DONE.md history) turns out to have never actually been in this repo — it's
an external doc of his. Read every real component for its actual live
copy and organized it by section, in the site's real top-to-bottom order,
so there's something concrete to mark up regardless of what the original
doc still says.

Deferred rather than guessed at: a real working "send message" (Kareem:
"I don't know the steps, I forgot") needs a decision on which
service/approach and, for most of them, an account only he can create —
asked directly rather than picking one silently. Two explicitly-framed
"what do you think" questions (a 3D background room; bringing back a
projects timeline) got a short recommendation each, not an implementation,
per how they were asked. "Mobile needs a lot of modifications" had no
specifics attached — asked what, rather than guessing at scope this large.

Verified: `npx tsc -b` and `npx oxlint src/` both clean (same one
pre-existing unrelated warning). Playwright pass against the real dev
server for every visual/behavioral change — monitor recentering at two
camera distances, Background's fixed column screenshotted, About Me's new
font and removed heading screenshotted, and the project-card click
priority checked three ways against real navigation events, not just
inferred from the code.

## 2026-08-10 (12) — Contact's end-turn nudged 180° → 210°

One-line follow-up on (11): "maybe rotate 30 more degrees." Same
direction again, `CONTACT_END_YAW` now `(7 * Math.PI) / 6`. Confirmed via
console (`sceneYaw: 3.6652`, i.e. 210°) and screenshot at the settle beat
— a touch further past dead-on-camera than 180°, face angled a bit more
toward camera-left.

Verified: `npx tsc -b` and `npx oxlint src/` clean.

## 2026-08-10 (11) — Cursor outline padding back to 4px (2px was too tight); Contact's end-turn taken to 180° (continuing the same direction rather than flipping back)

Two quick follow-ups on (10).

**Outline padding: 2px → 4px.** "Get back to 4px."

**Contact's end-turn: 90° → 180°.** Still the wrong direction at 90° —
Kareem: "90 more degrees in the direction you rotated it will do the
trick," i.e. keep turning the same way (10)'s flip went, rather than
flipping back to (9)'s sign. `CONTACT_END_YAW` is `Math.PI` now, same
`-Math.sign(fullYaw)` direction from (10). Confirmed via console
(`sceneYaw: 3.14159`, i.e. exactly 180°) and screenshot at the settle
beat: he's now turned a full half-turn from his monitor-facing default,
facing the camera directly (full face, glasses, both visible) with the
monitor now behind him showing its back.

Verified: `npx tsc -b` and `npx oxlint src/` clean. Playwright screenshots
for both changes.

## 2026-08-10 (10) — Cursor outline padding narrowed again (4px → 2px); Contact's end-turn back up to 90°, direction flipped

Two quick follow-ups on (9), both direct one-line asks.

**Outline padding: 4px → 2px.** "Try making it 2px." `OUTLINE_PADDING` in
`CustomCursor.tsx`.

**Contact's end-turn: 30° → 90°, other direction.** "I wanted the 90
degrees rotation in the other direction in the end scene." `CONTACT_END_YAW`
back to `Math.PI / 2`, and `sceneYaw`'s formula now negates the
geometry-derived sign (`-Math.sign(fullYaw) * CONTACT_END_YAW`) instead of
using it as-is — the real-geometry direction-picker from (6)/(8) wasn't
wrong, Kareem just wants the opposite of what it picks. Confirmed via the
dev console log: `sceneYaw` now reads `+1.5708` (was `-1.5708` in (8)'s
90° version) — a mirror image of that earlier framing, verified by
screenshot at the settle beat.

Verified: `npx tsc -b` and `npx oxlint src/` clean. Playwright screenshots
for both — Contact's settle beat (mirrored framing vs. (8)'s), and the nav
hover outline at 2px.

## 2026-08-10 (9) — Contact's whole-object rotation now pivots on the character's own center instead of the assembly's shared center, which let the turn come back down to 30° and still read correctly; GitHub/LinkedIn got real icons; email-copy label spacing; cursor outline narrowed to stop covering neighboring labels; a real, reproducible reload bug (native scroll restoration winning over `scrollRestoration = 'manual'`) fixed with two more corrective reassertions

Six items, one of them (the reload bug) a real bug found and root-caused
live, not from the report alone — first attempt at a repro (`window.scrollTo`
+ a settled wait before reloading) didn't show it; only reproducing it the
way Kareem actually hits it (scroll, then reload immediately, no settle
time) did.

**Contact's whole-object rotation re-pivoted onto the character, not the
assembly.** Kareem: "try fixating the rotation point on the center of the
character not the center of the whole object." `Character.tsx`'s
`rootPivot` (desk + chair + monitor + character, rotated together for
Contact's end-turn and drag) was centered on the *whole group's* bounding
box — reused `pivotPoint`, the upper-body-parts bounding-box center already
computed for `upperBodyPivot`, instead. Practical effect: the character
himself stays roughly in place through the turn now, with the desk/monitor
swinging around *him* rather than his position swinging through an arc
around a shared centroid off in the middle of the desk.

**Contact's end-turn angle: 90° back down to 30°.** (8) is corrected twice
over — the "90°, facing the text and me" ask from that entry itself turned
out not to be what Kareem wanted once seen live: "the character should be
facing the text, not the other side, with a 30 degree angle towards me, I
asked this before." `CONTACT_END_YAW` is `Math.PI / 6` now. Screenshot at
the settle beat: with the pivot fix above, 30° now reads as a real partial
turn toward camera (part of his face/glasses visible past his shoulder)
rather than the near-full profile/back view a bare 30° produced against
the *old* pivot in (6)'s sweep — consistent with Kareem's own theory that
the pivot, not just the angle, was behind how the turn read.

**GitHub/LinkedIn as real icons.** New `data/socialIcons.ts` (same
vendored-simple-icons-path approach as `skillIcons.ts`), rendered before
the label text in Contact's link row.

**Email-copy label given breathing room.** "The popup of the email copied
should be margined a little bit to the right" — the copy button (its label
swaps `copy` → `Email copied` in place, not a separate popup) sat right up
against the email address with only the row's own `gap-2`. Added `ml-1`.

**Cursor hover outline narrowed.** "The hover selection is taking place
over the labels of the boxes." `CustomCursor.tsx`'s `OUTLINE_PADDING`
(10px) reached past a hovered element's own edge far enough to cover a
neighbor's label in the site's tightest real gap — Navbar's pills, `gap-1`
(4px). Dropped to 4px. Confirmed by screenshot: hovering PROJECTS in the
nav no longer touches WORK or SKILLS on either side.

**Reload landing mid-Hero-pin: real bug, root-caused.** "The page goes to
the flying text on reload, I want it to stay where it was or at least go
to the very beginning." main.tsx already set `scrollRestoration = 'manual'`
plus one `scrollTo(0, 0)` at module-eval time (from an earlier session's
back/forward-nav fix) — looked like it should already cover this. Reproduced
with Playwright by scrolling with real wheel events and reloading
*immediately* (no settle wait, closer to a real fast Cmd+R): the browser
still restored the old scroll offset sometime after that script ran, and it
was never corrected — confirmed flaky (passed some runs, failed others) with
the original single-call fix, and with just one added `load`-event
reassertion. Fixed by reasserting `scrollTo(0, 0)` at two more points: the
`load` event, and `onPinsReady` (the exact moment the page reaches its real
full height — the other point a delayed/retried native restore could
finally "land" on, once the page is finally tall enough to contain the old
offset). Six consecutive automated repro runs landed at `scrollY: 0` after
the fix, zero flakes, versus roughly half failing before it.

Verified: `npx tsc -b` and `npx oxlint src/` both clean (same one
pre-existing unrelated warning). Playwright pass against the real dev
server throughout — Contact's 30°-with-new-pivot turn screenshotted at the
settle beat, GitHub/LinkedIn icons and the copy-label spacing screenshotted
in Contact's resting layout (with clipboard permissions granted so the real
`copied` state renders, not just a focus ring), the narrowed nav outline
screenshotted mid-hover, and the reload fix specifically re-run six times
in a row to rule out the flakiness the first attempt had.

## 2026-08-10 (8) — (7)'s Hero character turn was the wrong scene, reverted; the *Contact* end-scene's whole-object turn is now a fixed 90° instead of a tuned 75°; Contact's drag/cursor-follow now unlock as soon as the object settles instead of requiring the visitor to scroll all the way to the end of the pin

Corrects course on (7) based on direct feedback, plus one more real bug in
the same scene found while there.

**Hero character rotation reverted — wrong scene.** "I want the character
looking exactly the other way, to the text" turned out to mean the
*Contact* end-scene's whole-object turn, not Hero's intro turn — Kareem:
"I didn't mean the character at first to rotate, get it back to normal."
`CHARACTER_TURN_YAW` back to `0`.

**Contact's whole-object end turn: fixed 75° → fixed 90°.** "I wanted the
full object at the end scene to rotate 90 degrees along the Y axis to be
facing the text on the left and me too." `ContactTimeline.tsx`'s
`CONTACT_END_YAW` (tuned to 75° in (6) after sweeping real angles) is now a
plain `Math.PI / 2`. Kept the geometry-derived *sign* rather than hand-
picking it too — `Math.sign(fullYaw)`, computed from his actual
monitor-facing direction vs. the direction to the end camera position —
since a previous round already found guessing that sign by hand landed
dead-on *away* from the camera. Confirmed by screenshot at the settle beat:
his face and the monitor both rotate a full quarter-turn, face now toward
camera-left, monitor screen now edge-on and unlit (no longer facing him).

**Contact's drag/cursor-follow: real bug, found while addressing the
above.** Kareem: "the cursor follow of the character in the end shouldn't
be after I reach [scroll to the very end] — it should be after it [the
object] reaches the desired place." `settled()` gated both press-and-drag
and the head's cursor-follow on `st.progress >= 1` — the *entire* Contact
pin scrolled through, including the later `textIn` beat and a dead scroll
stretch after it with nothing left to animate. The object itself finishes
turning and the camera finishes settling at the end of the `cameraSettle`
beat (progress 0.4), well before progress 1 — so there was a real,
scrollable dead zone where the scene looked completely done but stayed
non-interactive. `settled()` now checks `st.progress >= CONTACT_BEATS.cameraSettle[1]`
instead. Verified two ways on the live `ScrollTrigger`/scene-graph
instances (both exposed on `window` in dev): at progress 0.2 (mid-turn)
moving the mouse left/right left `headPivot.rotation.y` at `0`, unchanged;
at progress 0.6 (past settle, well short of the old `1.0` gate) the same
move swung it from `0` to `∓0.5` — cursor-follow is live exactly where it
should be now, and not before.

Verified: `npx tsc -b` and `npx oxlint src/` both clean (same one
pre-existing unrelated warning). Playwright pass against the real dev
server for all three — Hero screenshotted back to its unrotated baseline,
Contact's 90° turn screenshotted at the settle beat, and cursor-follow
gating checked directly against scene-graph state at two different scroll
progresses rather than just eyeballing a screenshot.

## 2026-08-10 (7) — Hero character now turns to face the entrance text; CustomCursor rewritten from GSAP tweens to a single rAF+lerp loop (fixes a fourth "stuck" failure mode); footer name and colored skills marquee restored

Three items, verified with Playwright against the real dev server (screenshots
for the 3D rotation, polled DOM state for the cursor, screenshots for the
footer/marquee) rather than by reading the code and assuming.

**Hero intro-turn now actually turns the character.** `CHARACTER_TURN_YAW`
(`timeline.ts`) had sat at `0` since it was introduced — the "introTurn" beat
never turned the upper body at all, so he faced his monitor throughout,
back to the camera, while the entrance text ("Kareem Aboelnaga") sits on the
left of the screen. Kareem: "I want the character looking exactly the other
way — to the text — maybe 90 degrees will do it." Swept both signs on a live
render at the settled framing before picking one — `+90°` turned his face
toward camera-right, away from the text; `-90°` turned him left, toward it,
confirmed by screenshot. `CHARACTER_TURN_YAW = -Math.PI / 2`.

**CustomCursor rewritten: GSAP quickTo/gsap.to hybrid → one `requestAnimationFrame`
loop.** This is the fourth distinct "cursor gets stuck" root cause found in
this project (see 2026-08-10 (5) and (6) for the first three — stale rect
after scroll-without-mousemove, frozen after a `target="_blank"` blur, and
now this one: stuck motionless in empty space right after leaving a hovered
element, reported directly by Kareem). All four traced back to the same
structural cause: hover target and position were driven by two separate GSAP
tween systems (`quickTo` for continuous tracking, one-shot `gsap.to` calls
for transitions) racing to own the same `x`/`y`/`width`/`height` properties,
so a transition tween starting mid-frame could leave the continuous tracker
overwritten or not resumed. Researched how this is conventionally built
(Codrops/14islands-style custom cursors) before rewriting: a single
`requestAnimationFrame` loop that re-derives the hover target fresh every
frame via `elementFromPoint` at the last known pointer position (not cached
`pointerover`/`pointerout` state), and lerps rendered position/size toward it
by a fixed fraction per frame. Only one thing ever writes to the DOM per
frame now, so there's no property left to race over, and since the hover
rect is recomputed from live geometry every frame instead of cached at
hover-start, scrolling while hovering just naturally tracks — no separate
`scroll` listener needed at all, unlike the version this replaces. Verified
by polling the outline element's actual computed position/size/opacity after
hovering a nav link and then moving to empty space with no other element
involved (Kareem's exact repro): it eases smoothly from the link's rect back
down to a 10px dot centered on the pointer, opacity back to 1 — no stuck
state at any sampled point. `npx tsc -b` caught one real issue this
introduced (the null-check on `dotRef.current`/`outlineRef.current` doesn't
narrow inside the nested `render` closure — a TS closure-narrowing gap, not
a runtime bug) — fixed by re-binding to explicitly-typed non-null consts
before the closure.

**Footer name and the colored skills marquee both restored.** The name
(`Kareem Aboelnaga`) had been dropped from the footer when it was rewritten
for the "footer is gone" fix in 2026-08-10 (5) — that fix's diff replaced
the two-line name/meta layout with a single meta-only line, unintentionally.
Restored as a second `<p>` alongside the existing "Built with…" line, same
`justify-between` layout as before. Separately, `TechSkillsSlider` (a
continuous marquee of tech skills between Projects and Skills) had been
deleted outright when the tiered Skills section replaced it — Kareem asked
for it back, "between things I have built and what I work with," now
sourced from `skillTiers` (the current canonical skill list) instead of the
old projects-derived one, and — new — each skill renders in its own brand
color via `skillColors.ts` (the same map `SkillTag` colorizes on hover with)
instead of one flat tone. Skills with no real logo fall back to the plain
low-contrast tone, same exception `SkillTag` already makes.

Verified: `npx tsc -b` and `npx oxlint src/` both clean (same one
pre-existing unrelated warning as prior sessions). Playwright pass against
the real dev server — Hero rotation confirmed at both candidate signs before
picking one, cursor state polled through a hover→empty-space transition,
footer and marquee screenshotted in place.

## 2026-08-10 (6) — Contact's end-turn re-tuned by actually sweeping real angles instead of guessing (his face wasn't clearing into view until ~-75°, a magnitude problem, not the sign problem it looked like); a third custom-cursor stuck-outline failure mode found and fixed (window blur / target="_blank" links)

Two items, both root-caused by rendering the actual thing and comparing,
not by reasoning from the code alone — the second one continues this
project's own recurring pattern of "cursor gets stuck" bugs, each a
genuinely different root cause wearing the same symptom.

**Contact's end-turn angle, actually swept and compared, not guessed a
second time.** 2026-08-10 (5)'s 30°-then-50° cap still read as "looking
the other way" — first instinct was to flip the sign (the literal reading
of "reverse the rotate"), but rendering that showed the *back* of his
head — unambiguously worse, not a matter of interpretation. Instead of
guessing a third value, manually overrode `sceneRoot.rotation.y` on a live
render across six angles (0°, -30°, -50°, -75°, -100°, -129°/full) and
screenshotted every one. The result reframes the whole problem: 0°/-30°/
-50° all read as a side-or-back view regardless of sign — his face simply
doesn't clear into view until somewhere around -75°, in the *original*
(unflipped) direction. It was never a sign bug; 30–50° just wasn't enough
turn to ever show his face at all. Settled on -75° — clearly turned
toward camera, confirmed by the same render pipeline (not the manual
override) — while stopping well short of the full ~129°, so it still
reads as "turned in his chair," not spun all the way around. `camRight`
target-offset also pushed further ("more to the right") from -0.4 to
-0.65.

**Real bug found and fixed: the cursor's hollow outline stays permanently
grown around a link after clicking it, if the click hands focus
elsewhere.** A third distinct failure mode for this exact symptom (see
CustomCursor.tsx's own doc comment for the first two, from earlier
sessions) — this codebase has now hit "the cursor gets stuck" three times,
each a genuinely different mechanism. This one: almost every link on this
site is `target="_blank"` (GitHub, LinkedIn, live project links, "view
repo"). Clicking one hands focus to the new tab *without the pointer ever
leaving the viewport* — no `pointermove`, no `pointerleave` (that only
fires when the cursor physically exits the window's bounds), nothing to
tell the outline to let go. Confirmed by dispatching a bare `blur` event
with the pointer held stationary: the outline stayed fully grown, opacity
1, completely unchanged — and would stay that way even after switching
back to the tab, until the very next real mouse move. Fixed by treating
`blur` the same as the pointer leaving the document — hide, forget the
current target — the same recovery path `onPointerLeave` already used,
just triggered by a cause with no pointer event behind it at all.

Verified throughout: `npx tsc -b`, `npm run build`, and `oxlint src/` all
clean (same one pre-existing unrelated warning). Playwright: the full
six-angle sweep screenshotted for direct comparison before picking a
value, the blur repro before/after (grown+visible → correctly hidden),
recovery confirmed (a real pointer move after a simulated focus return
correctly re-shows the cursor), footer still visible at true max scroll,
zero console/page errors across a full desktop section click-through and
mobile scroll pass.

## 2026-08-10 (5) — Footer disappearing bug root-caused (a second "pin not ready yet" case, one section past the one already fixed); welcome message now reappears every time you return to the top; Contact end framing re-tuned (more right, a 30° turn); cursor-follow and drag-release feel adjustments; bulb sized up, bob removed

Six items. "Do whatever else needs to be done" turned into a real,
unplanned investigation once "the footer is gone" turned out not to be a
simple visibility bug.

**Real bug found and fixed: the Footer permanently disappeared — a second
instance of the exact class of bug 2026-08-10 (3) had already fixed once,
one section later.** `Footer.tsx`'s `ScrollReveal` waits for `onHeroReady`
before measuring its position (the earlier fix), but Contact's own
~210vh pin is created in a *later* React render than the tick where
`markHeroReady()` fires — `ContactTimeline` routes through its own
`heroReady` state first, which means Footer's trigger got created (and
its position permanently cached) *before* Contact's pin spacer existed.
Confirmed by reaching the live `ScrollTrigger` instance directly
(`window.__heroScrollTrigger.constructor.getAll()`, since `gsap` isn't
global) and reading its real `start`/`end`: ~1800px short of the
footer's actual position, `progress: 1` / `isActive: false` — it
believed it had already been entered *and left* long before the real
footer ever came close. Fixed generally, not just for Footer: new
`contactReady.ts` (same pub-sub pattern as `heroReady.ts`) plus a new
`onPinsReady` that waits for *every* pin on the page in order —
`ScrollReveal`/`StaggerReveal`/`CountUp`/`SkillTag` all switched to it.
**Second, smaller bug found while verifying the first fix**: even with
the correct position, "top 88%" could never be satisfied for an element
this close to the true end of the document — at max scroll there simply
isn't enough room left to scroll the footer up to 88% of the viewport
height (57px short, on a 900px viewport). `ScrollReveal` gained an
optional `start` override; `Footer.tsx` uses `top bottom` (fires as soon
as any sliver of it is visible), the standard fix for "the last thing on
the page." Verified both fixes numerically pre/post (comparing the same
DOM element consistently — an earlier read comparing two different
elements briefly looked like a second bug and wasn't) and visually.

**"I want scroll to begin to appear whenever I go to the first of the
page."** Was a one-shot: show once if still at the top when the model
finished loading, hide forever on the first scroll after that (which is
also what the 2026-08-10 (3) stuck-visible fix relied on). Replaced with
a standing sync instead of a one-shot — every scroll event checks "am I
at the top right now" against the *current* position and shows/hides to
match, so it reappears every time the user scrolls or navigates back to
the top, not just once, while keeping the same guarantee that it never
shows up somewhere it doesn't belong. Verified through a full cycle
(show → hide on scroll → stays hidden deep in the page → reappears on
return to top → hides again → reappears again).

**Contact end framing re-tuned**: character shifted further right
(`camRight` target-offset multiplier `-0.05 → -0.4`), and the whole-model
turn capped to a fixed 30° instead of the full computed "face the camera
dead-on" angle — "looking towards me but also looking towards the text."
Verified via the same NDC-projection-through-the-live-camera method as
the previous framing pass (not eyeballed): character now sits at
`x≈0.13` (right of center, was ≈0.02) and the model's actual `rotation.y`
reads exactly `-30.00°`.

**Cursor-follow range raised again** (0.42 → 0.58 rad, third increase
this project — "I want also the cursor follow to be more"), upward pitch
limit scaled with it (0.14 → 0.19, same ratio, so "more" didn't also mean
"more awkward looking up" — see the original reasoning for that
asymmetry). **Drag-release eased smoother**: `elastic.out(1, 0.5)` (a
literal spring, overshoots and oscillates before settling) replaced with
`power3.out` (one smooth deceleration, no bounce), duration nudged up
slightly (0.7s → 0.9s) to give the slower ease room to read clearly.

**ThemeLightbulb: idle Y-bob removed, size increased.** The
2026-08-10 (4) idle float (on top of the hover-tilt added that same
session) turned out not to land — "stop the Y-axis movement of the
bulb." Removed outright, kept the hover-tilt and shadow-shift. Sized up
(`h-16/w-16 → h-20/w-20` mobile, `4.5rem → 5.25rem` at `sm:`).

Verified throughout: `npx tsc -b`, `npm run build`, and `oxlint src/` all
clean (same one pre-existing unrelated warning). Full Playwright pass —
desktop click-through of every section plus a real Contact drag-release,
mobile (iPhone 13 emulation, scrolled all the way to the true bottom this
time, not just partway), and light theme — zero console/page errors
across all three, footer confirmed visible at true max scroll on both
desktop and mobile.

## 2026-08-10 (4) — The Hero "monitor dive" camera path fixed at the root (real direction-reversal bug, found and fixed after several prior attempts); ThemeLightbulb given real 3D depth cues; a real Contact/Navbar overlap bug found and fixed on mobile

Four asks: "make the second scene [the monitor dive] smooth, no camera
direction changes, and make it actually go deeper into the monitor —
I've asked this too many times and it never got fixed"; "make the bulb
feel 3D, not like a regular button"; "the mobile version needs a lot of
work, do what you can." Given how many times the camera-smoothness ask
had apparently come back, treated it as "find the actual root cause this
time," not another round of number-tweaking.

**Real bug found and fixed: the Hero "through the eyes, into the
monitor" camera dive genuinely reverses direction partway through, not
just a feel issue.** Diagnosed by sampling `camera.position` every frame
through a real (non-jumped) scroll via Playwright, not by eye — a
`document.elementFromPoint`-style investigation applied to 3D space.
Found: camera.x travels `1.55 → 0.003 → 0.54` — down, then back up — a
real, measurable reversal exactly where the `throughEyes` beat's tween
into `eyePosition` (computed from the head's live world position) hands
off to `monitorApproach`'s tween into `MONITOR_ZOOM_CAMERA.position`, a
hand-placed constant from `timeline.ts` with no geometric relationship to
the ray the first leg was traveling along. Also found the old endpoint
was barely any *closer* to the screen than the head itself in real
distance (0.845 units away vs. the head's own 0.86) — it only read as
"deep in the monitor" via an extremely tight fov (5°), not real
proximity, which is why "go deeper" never actually landed either.
**Fixed both at once**: `HeroTimeline.tsx` now computes the
`monitorApproach` endpoint further along the *exact same*
head-toward-monitor ray as `eyePosition` (85% of the real head-to-screen
distance, leaving just enough clearance not to clip the mesh) instead of
an unrelated constant — both legs now travel one straight line, just
further along it, so there's nothing left to reverse, and the camera
ends up genuinely 0.13 units from the screen instead of 0.85. Also
swapped `throughEyes`'s ease from `power2.in` to `power2.out` (decelerating
into the eyes rather than still accelerating right as the second leg
needs to take over) — the old double-`power2.in` reset velocity to
near-zero at the start of every leg regardless of how fast the previous
one was still going, a stutter on top of the reversal. Verified twice:
numerically (re-ran the same frame-by-frame sampling — camera.x/y/z are
now all strictly monotonic the entire way from settle to the deep-monitor
end position, confirmed via the browser's own live camera matrices, not
inferred) and visually (screenshotted the full dive at eight points along
the way, plus every earlier Hero beat — intro, entrance text, About Me —
to confirm nothing regressed).

**ThemeLightbulb given real depth cues instead of just spinning in
place.** "It's there but standing like a regular button, I want to feel
that it's 3D." Added: a hover-based two-axis tilt toward the pointer
(the same "3D card tilt" cue used across modern web design specifically
to sell depth — independent of the existing continuous Y-axis spin and
the press-drag offset, all three layer on the same object without
fighting each other), a small idle sinusoidal float so it doesn't sit
dead-still on its own axis, and a drop shadow that shifts opposite the
tilt direction (as if a fixed light source above the page is casting it)
instead of a static shadow that only changes between the lit/dark theme
states. Verified the existing click-to-toggle and press-drag interactions
still work unchanged (a real risk since the tilt logic reuses the same
`onPointerMove` handler) — confirmed via Playwright: a real drag still
doesn't toggle the theme, a real click still does, both post-change.

**Real bug found and fixed: Contact's email/phone text renders partially
behind the fixed Navbar on mobile.** Part of the general mobile pass —
Contact's content (heading, paragraph, contact links, a 3-field form) is
tall enough that centering it vertically in a short mobile viewport
pushed its top edge up underneath the Navbar, the same class of overlap
`pt-28` already exists to fix for Hero's About Me beat, just never
applied here since nobody had caught it on desktop's much taller
viewport. Added the same `pt-28` (mobile) / original `pt-20` (`sm:` and
up) split. Confirmed via Playwright: the email link's real position now
sits below the Navbar's bottom edge, verified numerically before
concluding it was fixed rather than trusting a screenshot alone (this
site's pinned-scroll sections make screenshot timing unreliable — see the
environment note in project memory).

**Mobile audit, the rest of it: no other real bugs found.** Checked
every section (Hero through Footer) at an iPhone-13-sized viewport plus
390px, confirmed zero horizontal overflow anywhere, confirmed touch-
specific behavior directly rather than assuming it from desktop tests —
the custom cursor correctly disables itself on a coarse/touch pointer,
a real `tap()` (not just `click()`) still toggles the ThemeLightbulb,
native scroll isn't intercepted by anything. One thing that looked like a
bug at first and wasn't: on mobile, Work's three stats stack vertically
(they sit side-by-side on desktop) and are spread across enough page
height that scrolling past one resets it (the "redo every time active"
behavior from 2026-08-10 (3), working as designed) before the next one's
own turn — not a defect, just a visible consequence of that feature
applied to a taller, narrower stack. Left as-is rather than special-cased.

Verified throughout: `npx tsc -b`, `npm run build`, and `oxlint src/` all
clean (same one pre-existing unrelated warning). Full Playwright
regression pass across desktop, mobile (iPhone 13 emulation, real touch
events), and light theme — every section, a full scroll-down-then-back-up
by hand, zero console/page errors across all three passes.

## 2026-08-10 (3) — Contact end-framing recentered; Navbar completed + reordered to match the real sequence; real "scroll to begin" stuck-visible bug found and fixed; entrance animations now replay every time; Skills colorize permanently; Contact's monitor screen lit

Six items in one message, plus "continue with anything left in TODO.md."
Worked them in the order given, then picked up TODO.md's monitor-screen
note as the last item.

**Contact end framing moved to centered, a little higher.** Was offset
toward the camera's own up+left (lower-right framing, from the original
"clear of the text" ask). Re-tuned the same real-geometry look-at-target
offset (`ContactTimeline.tsx`) and verified numerically, not by eye:
projected the character's actual world center through the live camera's
own matrices (`window.__contactCamera`) to NDC space before and after —
landed at `x≈0.30, y≈-0.32` (right of center, well below) before, `x≈0.02,
y≈0.13` (essentially dead-center horizontally, modestly above center
vertically) after. Confirmed clear of the message form in both dark and
light theme screenshots.

**Navbar completed and reordered to match the real page sequence.** Two
separate problems: it was missing Skills and Background as nav items
entirely (never had them, despite both being real sections with their own
IDs), and "About" was listed after Work/Projects despite happening
*first* chronologically (it's a beat inside the Hero pin; Work only starts
once that pin releases — the DONE.md 2026-08-09 (10) entry had already
flagged this exact mismatch without fixing the display order). Now reads
`About · Work · Projects · Skills · Background · Contact · CV`, top-to-
bottom matching the actual scroll order. **Caught and fixed a regression
this caused**: two more items no longer fit the pill at 390px width —
"About" and "CV" were being clipped off either edge entirely, unreachable
by any means (confirmed via `getBoundingClientRect`: About at `x: -74`,
off-screen left). Fixed by making the pill itself horizontally scrollable
(`overflow-x-auto`, hidden scrollbar, `shrink-0` on each item so flex
can't squeeze labels illegible instead of scrolling) rather than redesigning
the nav — confirmed the *page* no longer has any horizontal overflow (only
the pill scrolls internally) and that every item, including CV, is
reachable by scrolling it.

**Real bug found and fixed: "scroll to begin" stays visible until
Projects, sometimes, when scrolling back and forth.** Reproduced
deliberately rather than guessed — Playwright with CPU/network throttling
(a plain dev-server repro wasn't slow enough to expose the race; needed a
production preview build under throttled conditions to reliably hit it).
Root cause: the welcome message's fade-in only runs once the character
model finishes loading, and the old code showed it *unconditionally*
regardless of current scroll position, then waited for a *subsequent*
scroll event to hide it again. A visitor who starts scrolling before the
model finishes loading (an eager visitor, or just a slow connection) can
easily have already scrolled well past the top by the time that code
finally runs — if they then stop to read rather than keep scrolling, no
further scroll event ever comes, leaving the message stuck at opacity 1
wherever they'd gotten to. Confirmed via the throttled repro: scrolled to
`scrollY 3000` before the model loaded, message got stuck at `opacity: 1`
indefinitely. Fixed by gating the initial show on `window.scrollY < 40` at
the moment the code actually runs — there's no reason to welcome someone
to "begin scrolling" once they already have. Confirmed fixed under the
same throttled repro (`opacity: 0`, stays `0`), and confirmed the normal
patient-visitor path (message shows, hides on first scroll, stays hidden
through back-and-forth scrolling) still works exactly as before.

**Entrance animations now replay every time the desired content is
active, instead of once ever.** `ScrollReveal`, `StaggerReveal`, and
`CountUp` all used `once: true` — fine for a first-time visitor scrolling
straight down, but scrolling back up past a section and back down left it
either already-revealed (static) or, for CountUp, frozen at its final
number instead of counting again. All three now use
`onEnter`/`onEnterBack` to play in and `onLeave`/`onLeaveBack` to reset
back to hidden, in either scroll direction, so every pass re-triggers the
same animation. Confirmed via Playwright: a Work stat scrolled to 1,068,
reset to the "0,000" placeholder on scrolling away, then genuinely
recounted (caught mid-count at "353") back up to 1,069 on returning.

**Skills now stay colored after the auto-preview, instead of reverting.**
Deliberately the *one* exception to the "redo every time" change above —
`SkillTag.tsx`'s scroll-triggered brand-color sweep (shipped earlier this
same day) used to hold for ~1.1s then revert back to grey. Now it latches:
once a tag has been auto-colorized, `handleLeave` (both the removed
delayed-revert and any subsequent hover-out) becomes a no-op for that tag
specifically — colorizing reads as "unlocked," not a toggle that happens
to also fire once on its own. Confirmed via Playwright: scrolled Python's
tag into view, away, and back — stayed at its real brand blue (`#3776AB`)
through the whole round trip, including while its `StaggerReveal` parent
was independently popping it in/out of visibility.

**Continued down TODO.md: Contact's monitor screen now runs the same
emissive ramp Hero's does.** Real, if narrow, gap — Contact loads its own
separate model instance from Hero's (independent `<Canvas>`s, see
DONE.md), so Hero's tween on *its* `monitor_screen` material never
touched Contact's copy, which sat at the GLB's untouched baked default the
whole time. Added the identical `MONITOR_EMISSIVE_START` →
`MONITOR_EMISSIVE_END` tween, timed to the `blackOut` beat so it ramps up
as the scene fades into view. **Investigated rather than assumed this
would look dramatic, and it doesn't, honestly**: read the material's
actual values directly (`emissive: {r: 0.003, g: 0.007, b: 0.014}` — this
mesh's baked emissive/base color is itself near-black in *both* scenes,
Hero included) — the vivid glowing "code lines" visible in Hero's own
close-up screenshots turn out to come from separate small bar-mesh
geometry only legible at the extreme close-up FOV Hero's monitorApproach
beat uses, not from this material property. Contact's wide, distant
framing was never going to resolve that geometry regardless. The fix here
is real and correct (matches Hero's code 1:1, closes the literal gap
TODO.md flagged) but the visible difference in Contact itself is subtle,
not a dramatic before/after — noted here rather than overclaimed.

Verified throughout: `npx tsc -b`, `npm run build`, and `oxlint src/` all
clean after every change (same one pre-existing unrelated warning). Full
Playwright pass: nav order and mobile-scroll reachability, the throttled
welcome-message repro before/after, Contact's NDC-projected framing
before/after in both themes, CountUp/StaggerReveal replay cycles, Skills
stay-colored across a scroll-away-and-back round trip, and a full
click-through-every-section-then-scroll-all-the-way-down-and-back-up pass
— zero console/page errors across all of it.

## 2026-08-10 (2) — Priority queue set from TODO.md; real preview images wired; cursor scroll-desync bug fixed; card hover animation; Skills auto-colorize-on-scroll; found and fixed a premature-scroll-trigger bug shared by four components

Kareem asked to review TODO.md and set a priority queue, then named four
things directly: count-up/card animations "missing," the cursor stuck
beside the last-hovered object, skills should colorize automatically when
scrolled into view (not just on hover), and to wire up the preview images
he'd dropped in `public/previews/`. Worked the queue in this order: bugs
first (broken/missing things), then the explicit asks, then a sweep for
anything else static; a fifth item (a shared animation-timing bug) turned
up along the way and got fixed too since it affected already-shipped code,
not just what was being added.

**Real preview images wired.** Kareem's screenshots for Pet Society,
PneumoXpert, Movie Discovery App, and Django Blog Platform were already
sitting in `public/previews/` (`pet-society-homepage.png`, `xray.png`,
`movies.png`, `blog.png`) but not referenced anywhere in
`data/projects.ts` — Pet Society still pointed at the old sign-in-screen
placeholder (`pet-society.png`, now deleted, nothing referenced it
anymore), and the other three had no `previewImage` at all. Every project
with a viewable UI now has a real preview; `PROJECT_PREVIEWS.md` updated to
match (its "replace Pet Society's sign-in screenshot" section no longer
applied — Kareem already did that himself).

**Real bug fixed: the custom cursor's outline gets stuck at a stale screen
position after scrolling with the mouse stationary.** `CustomCursor.tsx`
only recomputed what's under the pointer on `pointermove` — a wheel scroll
(or this site's own GSAP-driven Navbar/SkipIntro fast-forward jumps) moves
page content without ever firing that event, so the outline stayed frozen
at the old screen coordinates while the actual hovered element scrolled
out from under it — exactly "the cursor is stuck beside the last hovered
object." Added a `scroll` listener (`capture: true`, so it also catches
Contact's internal `overflow-y-auto` scrolling, which doesn't bubble) that
re-evaluates hover via `document.elementFromPoint` at the last known
pointer position — same detection logic `pointermove` already used, just
re-triggered on a different event. Confirmed via Playwright: hovering a
fixed Navbar button and scrolling keeps the outline correctly traced to it
(sub-pixel drift only, from the button's own width changing as the active
section changes); hovering an in-flow project link then scrolling
correctly re-traces to whatever's now under the still pointer — verified
`document.elementFromPoint` at the same fixed screen coordinate genuinely
resolves to a different project card post-scroll, and the outline updates
to match instead of staying put.

**Card hover animation added — `ProjectCard.tsx` had none beyond a
background-color fade.** "The animation of any card and card components
are missing." Cards now lift (`-translate-y-1.5`), pick up a border, and a
soft shadow on hover. Also added a small arrow-shift micro-interaction (↗
nudges up-right on hover) to every "live preview"/"view repo"/"Live (login
required)" link in `ProjectCard.tsx` and `Work.tsx`, matching the "modern"
direction of the card lift.

**Skills auto-colorize on scroll — "let me see the skills getting colored
on its own when previewed."** The brand-color letter sweep (`SkillTag.tsx`,
shipped 2026-08-10) was hover-only, so nobody saw it without moving a mouse
over every tag individually. Each tag now also runs the identical
letter-by-letter sweep once, automatically, the first time it scrolls into
view (a `once: true` ScrollTrigger on the `<li>`), holds ~1.1s, then
reverts — a preview of the interaction, not a replacement for it; hovering
afterward still colorizes on demand exactly as before.

**Real bug found and fixed, affecting four components at once:
ScrollTrigger positions computed before Hero's model finishes loading fire
thousands of pixels too early.** Building the Skills auto-colorize surfaced
this — a Playwright timing check showed Python's tag colorizing while its
`<li>` was still 6353px below the viewport. Root cause: `ScrollReveal`,
`StaggerReveal`, `CountUp`, and the new `SkillTag` all create their
`ScrollTrigger` immediately on mount, but Hero's pin spacer (~6
viewport-heights) only gets inserted once the character model finishes
loading asynchronously — any trigger created before that measures its
`'top 88%'`/`'top 90%'` position against the still-short page and never
gets recalculated once the real (much taller) layout exists. This is the
*exact* bug `heroReady.ts` already exists to solve for `ContactTimeline`'s
own pin (its doc comment explains the static `ScrollTrigger.refresh()`
mysteriously didn't fix it there either, so `ContactTimeline` waits for
`onHeroReady` instead of refreshing) — the same fix just hadn't been
applied to these four components. Gated all four behind `onHeroReady`.
Confirmed via Playwright, before/after: CountUp's Work-section numbers now
first change value at `top≈694px` (was `top≈6957px` — i.e. counting while
still off-screen); SkillTag's auto-colorize now fires at `top≈778px` (was
`top≈6353px`) — both now land right at their real viewport threshold
instead of thousands of pixels early. This also silently fixes the same
latent bug in every existing `ScrollReveal`/`StaggerReveal` use across
Work/Projects/Skills/Background from earlier sessions, not just the two
cases added this session — nobody had specifically stress-tested "scroll
immediately after the page loads" before, since it doesn't affect a patient
visitor who reads the page top-to-bottom at a normal pace.

**Also swept for missing hover feedback while in there:** Navbar buttons
now scale slightly on hover/press (previously color-only); Contact's two
text inputs and the message textarea were missing `transition-colors`
entirely (the focus border snapped instantly instead of easing); SkillTag
chips now lift slightly on hover too, matching the card treatment.

Verified throughout: `npx tsc -b` and `npm run build` clean, `oxlint src/`
clean (same one pre-existing unrelated warning in `ThemeContext.tsx`). Full
Playwright pass: preview-image wiring (correct file actually served in the
hover popup), card hover lift confirmed via computed `transform` (6px
translateY), cursor outline grow/re-trace-on-scroll/shrink-back cycle
against both a fixed Navbar button and an in-flow project link, and the
CountUp/SkillTag firing-position numbers above, both before and after the
`onHeroReady` fix — zero console/page errors across all of it.

## 2026-08-10 — Ten-item batch: theme-toggle bug, Contact fixes, About dedup, drag-rotate, count-up stats, bigger bulb, richer scroll animation, Skills hover colorize, Background restyle

Kareem handed over ten items at once ("add these to the todo list and
continue after from where you left") and went hands-off; worked through
them in the order given, verifying each with Playwright before moving on
rather than batching verification to the end.

**Bug fixed: toggling dark/light mode changed scroll position.** Root
cause: `HeroTimeline.tsx`'s big `useEffect` (the one that builds the
ScrollTrigger + GSAP timeline) had `colors` — from `useTheme()` — in its
dependency array. `colors` is a new object reference every render, so
every theme toggle re-ran the effect's cleanup (killing the live
ScrollTrigger/timeline) and rebuilt it from scratch, which is what
actually moved the page. Removed `colors` from the deps array (still read
via closure, `eslint-disable-next-line react-hooks/exhaustive-deps`
added with the reasoning). Confirmed via `window.__heroScrollTrigger`
holding the *same instance* across a toggle (was a new instance before
the fix), and — the real test — scrollY unchanged across two toggles
back-to-back at a settled mid-scroll position (`11187` before, during,
and after, checked three times).

**"Send a message" email form restored.** CONTENT.md's content pass
(2026-08-09 (8)) had removed it per that doc's explicit "No contact
form." Kareem's live message overrides the static doc — restored the
full mailto-based form (name/email/message → `mailto:` with a prefilled
subject/body) in `Contact.tsx`, kept alongside the direct-channel
additions from that same pass (copy-to-clipboard email, `tel:` link, CV
download) rather than reverting the file wholesale.

**Bug fixed, root-caused: "Get in touch" paragraph text was nearly
invisible.** Not just a wrong Tailwind class — `tailwind.config.ts` had
a `fontSize.base` key *and* a `colors.base` key, both of which Tailwind
compiles to a class literally named `.text-base`. The two declarations
merged into one CSS rule, and the color declaration
(`color: var(--color-base)`, the dark page-background color) silently
overrode the font-size intent everywhere `text-base`/`sm:text-base` was
used for sizing — including this paragraph, rendering it essentially
background-colored. Found by grepping the *compiled* CSS
(`.text-base{color:var(--color-base)}`), not by guessing. Fixed by
renaming the fontSize scale key to `md` and updating the three call
sites (`Work.tsx`, `Contact.tsx`); also swapped Contact's paragraph from
`text-text-mid` to `text-text-hi` to match the rest of the block.
Verified via compiled CSS and a live `getComputedStyle` read
(`rgb(228, 231, 235)`, correct `text-hi`).

**About deduped to one section.** There were two: the Hero-pinned "About
Me" beat and a standalone `About.tsx` section further down the page,
both opening with a version of the same idea. Deleted `About.tsx`,
rewrote `AboutMeContent.tsx`'s copy to combine the tagline's concrete
list (what he actually builds) with the standalone version's one
genuinely distinctive detail (the competitive-programming background)
instead of just keeping one of the two originals verbatim. The longer
combined text pushed the pinned block's top edge above the safe zone,
overlapping the Skip button — caught via `getBoundingClientRect` (real
overlap, not a hunch), fixed by sizing the heading/paragraph down one
notch and tightening the top margin. Removing `About.tsx` also broke the
Navbar's active-section highlight logic (`Navbar.tsx`'s scroll handler
assumed "last matching item in array order wins," which silently
depended on About's target being numerically ahead of Work's — no
longer true once About pointed back at a Hero-pin beat instead of a
later DOM section) — fixed by tracking "the item with the largest
target still ≤ current scroll position" instead of array order.

**Contact's whole-object drag: rotate again, but limited and springs
back.** Reverses 2026-08-09 (7)'s translate-with-spring-back, brings
rotation back, but keeps what translate had that the *original*
free-rotate drag (2026-08-09) never did — `ContactTimeline.tsx` now
clamps yaw/pitch to `DRAG_YAW_RANGE`/`DRAG_PITCH_RANGE` (0.5/0.35 rad)
around the settled orientation and springs back via
`elastic.out(1, 0.5)` on release, reading the *current* resting yaw on
each `pointerdown` rather than assuming it still equals the original
`sceneYaw` (so an interrupted spring-back from a fast second drag can't
get clobbered mid-flight). Verified numerically, not just visually: a
deliberately oversized 800px drag clamped `sceneRoot.rotation` to
exactly `baseYaw + 0.5` / `basePitch - 0.35` (not beyond), and settled
back to the exact original `{x: 0, y: -2.25021}` after release —
confirmed via a dev-only `window.__contactSceneRoot` hook added for this
check.

**Contact head cursor-follow: upward angle clamped tighter.** "If I'm
above him he is kinda limited" — `CURSOR_FOLLOW_UP_LIMIT` (0.14 rad)
caps only the positive/upward pitch direction in `onMouseMove`; looking
down still uses the full `CURSOR_FOLLOW_RANGE`.

**Count-up animation on Work's stat numbers.** New `CountUp.tsx` —
parses the comma-formatted target once, counts from 0 on first
scroll-into-view (`ScrollTrigger`, `once: true`), re-formats with
`toLocaleString` every frame so `1,069` counts through real
thousands-separated values rather than animating the raw string.
Respects `prefers-reduced-motion` by rendering the final value directly.
Verified the full 0 → 1,069/7,716/13 arc via Playwright timing
snapshots.

**`ThemeLightbulb` bigger, with a shadow/depth cue.** Size up from
`h-12 w-12` to `h-16 w-16` (`sm:h-[4.5rem]`), plus a grounded CSS
drop-shadow that reads as the object floating slightly off the page; the
shadow warms toward the lamp color when lit (`rgba(217,154,69,0.55)`
glow) rather than a flat static shadow either way. It was already
spinning continuously on its own axis (`IDLE_SPIN_SPEED` in the existing
`useFrame` loop, from the original bulb-integration work) — that part
just needed to read more clearly at the larger size, which the new
shadow helps sell. Added a second, dimmer cool-toned point light for
extra shading definition. Verified box size (72px) and the
lit/dark-conditional `box-shadow` via `getComputedStyle`.

**Richer scroll-entrance animation across Work/Projects/Skills/
Background.** The whole site shared one `ScrollReveal` fade+rise —
"too static." Extended `ScrollReveal.tsx` with a `variant` prop (`up`/
`left`/`right`/`scale`) and added `StaggerReveal.tsx`, a new component
that pops each direct child in individually with a stagger instead of
the whole group revealing at once (for tag/pill lists sitting at a
single scroll position, where a single `ScrollReveal` around the
wrapper would otherwise reveal every child at the exact same instant).
Applied: Work's Rustaq stack tags and stat strip now use
`StaggerReveal`/scale-pop instead of a flat block fade; Projects' cards
alternate slide-in-from-left/right by grid column instead of one
uniform rise; Skills' tier headings slide from the left and each tier's
tag list staggers in; every section heading gets a `scale` pop instead
of a static Parallax-only reveal. Verified every one of these ends at
`opacity: 1` (nothing stuck mid-transition) via computed-style checks
across all four sections, then visually via the Navbar's own
proven scroll-to-section jumps (large-jump `scrollIntoView`/manual
`scrollTo` math turned out unreliable for landing past the ~6200px Hero
pin in a fresh Playwright page — the Navbar's `elementTop()`-based jump
was the reliable way to actually get there for a screenshot).

**Skills hover: colorize to brand color, letter by letter.** New
`SkillTag.tsx` splits each skill label into one `<span>` per character;
on hover, GSAP staggers each letter's `color` from the default
`text-mid` to the skill's real brand hex (`data/skillColors.ts`, new —
official colors for all 21 skills with a real logo), sweeping
left-to-right on enter and right-to-left on leave. Tags with no real
brand mark (Django Admin, REST APIs, Unit testing) are absent from
`skillColors.ts` and keep the plain border-only hover instead of a
fabricated color. Three brand colors (Django, Flask, SQLite) are
genuinely near-black and would be invisible against both this site's
near-black dark theme and near-white light theme — swapped for lighter
tints from the same brand family rather than the literal hex (documented
in the data file). Verified the full colorize-then-revert cycle
numerically: Python's first/last letters both land on `rgb(55, 118,
171)` (`#3776AB`, its real brand blue) mid-hover, and both revert to the
exact original `rgb(163, 172, 186)` after unhover.

**Background (Education/Competitive-programming/Languages) restyled and
animated.** Sized every tier up a full step (body text `text-sm`/`xs` →
`text-base`/`lg`, competitive-programming placements `text-2xl` →
`text-4xl`/`5xl` matching Work's stat-number treatment) and added a
section heading ("Background") matching the Work/Projects/Skills
pattern that this section never had — it previously jumped straight
into three same-weight sub-headings with no framing. Each column now
enters from a different direction (`left`/`scale`/`right`) and its list
staggers item-by-item via `StaggerReveal`, instead of one flat
three-column fade.

Verified across the whole batch: `npx tsc -b` clean, `npm run build`
clean (`vite build`, only the pre-existing bundle-size warning, nothing
new), `oxlint src/` clean (one pre-existing unrelated warning in
`ThemeContext.tsx`). Full walkthrough Playwright pass — every Navbar
destination, contact form presence, contact text contrast, and a
double theme-toggle at a settled mid-scroll position — zero console
errors or failed requests.

## 2026-08-09 (10) — Mobile pass (real bug found), light theme review, SPEC.md destaled

Kareem was asleep ("continue"); picked the highest-value items still
flagged open in TODO.md rather than waiting — the ones that were
concrete and checkable without him, not the ones genuinely blocked on
his input (viewer account, project screenshots).

**Real bug found and fixed: Navbar's "Work" button was unreachable on
mobile.** `SkipIntro` and `ThemeLightbulb` are both `fixed ... top-4`
(desktop-tuned), which is safely clear of the Navbar pill on wide
viewports where the pill stays narrow and centered. At 390px, the pill
has to span nearly the full width to fit five nav items + CV, and its
left/right edges land almost exactly under `SkipIntro`/`ThemeLightbulb`.
Since both sit at the same `z-50` and render later in the DOM, they
painted directly on top of the "Work" button — it was present in the DOM
(confirmed via `getBoundingClientRect`) but functionally unclickable,
covered by `SkipIntro`. Caught this by actually running a Playwright
pass at a 390×844 viewport across every new section rather than assuming
"typechecks and looks fine on desktop" was sufficient — first mobile
check this whole multi-day build has had. Fixed with a responsive
position: `top-20` (below the pill) by default, `sm:top-4`/`sm:top-5`
(original, beside the pill) once there's room. Confirmed with an actual
Playwright click on "Work" post-fix — landed at the right scroll
position with no interception.

**Light theme reviewed section-by-section — no issues found.** Forced
`localStorage.setItem('theme-mode', 'light')` + reload (the real path a
returning visitor's preference would take) and screenshotted Work,
Projects, Skills, About, Background, and Contact. Contrast, the stat
strip's `lamp`-colored numbers, skill icons, and card styling all held
up cleanly. This was flagged as "unverified" in TODO.md since the
palette was picked by eye — still true that Kareem hasn't reviewed it
himself, but it's now at least confirmed not *broken*.

**SPEC.md destaled** — added a prominent banner at the top pointing to
the documents that are actually current (`CONTENT.md` for copy,
`DONE.md` for build history, `TODO.md` for open items,
`src/scenes/timeline.ts` for real camera constants) plus a concise
accurate summary of the real current shot list, rather than a full
line-by-line rewrite of a 307-line document describing a design that
was substantially redirected over many rounds of direct feedback. Also
annotated the "No light mode" rule specifically (the one place this
doc's original instruction is now directly contradicted) rather than
leaving it to look like an oversight.

Verified: `npx tsc -b` and `npm run build` clean after the position fix.
Full Playwright pass at both 390px and standard desktop width, plus a
forced-light-theme pass — zero console/page errors throughout.

## 2026-08-09 (9) — Iteration 2: new character model, real light bulb, larger popups, skill logos

The queued Iteration 2 from 2026-08-09 (7), done in full. Kareem had gone
to bed ("continue the iterations on your own") — everything below was
built and verified without further check-ins; flagging the handful of
judgment calls made along the way rather than treating them as settled.

**Character model swapped** (`models-source/developer-at-desk .glb` →
`public/models/character.glb`, 569KB → 1.69MB) — the biggest risk in this
whole batch, since every hand-tuned camera position in `timeline.ts` was
tuned against the old model's proportions. Checked the new GLB's raw JSON
before swapping (no Draco compression — loads fine as-is; exactly one
`KHR_lights_punctual` light, named `screen_spill`, matching the old
model's own baked light — no double-lighting risk). Backed up the old
file to the scratchpad first. Then screenshotted *every* beat in both the
Hero and Contact sequences — `introFadeIn`, `introTurn`, `introSettle`,
entrance text, About Me, `throughEyes`, `monitorApproach`,
`monitorBlack`, `codeWords`, `projectsTextIn`, and all four Contact
beats — against the new model. **Every single one held up with no
retuning needed.** This worked because the beats that matter most
(`throughEyes`' eye position, the monitor target, Contact's end framing)
were already computed from real runtime geometry (`Box3` on `head`/
`monitor_screen`/`upperBody`) rather than hand-picked coordinates — they
automatically adapted to the new model's actual proportions. The new
model's face (real eyes, brows, glasses, beard, hair) reads clearly even
at the small sizes these beats render it at.

**Real light bulb model** (`models-source/light-bulb.glb`, new
`public/models/light-bulb.glb`) replaces `ThemeLightbulb.tsx`'s
procedural sphere+cylinder. Checked the GLB's materials first: `glass`
and `tungsten` are the only two with a baked `emissiveFactor` — those are
the ones `emissiveIntensity` gets driven on toward lit/dark, same
`KHR_materials_emissive_strength` technique already used for the monitor
screen. Spins continuously on its own (`useFrame`, rotation.y += rad/s ×
delta); press-and-drag adds a manual offset on top via a per-frame ref
accumulator (avoids a state update every pointermove); a plain click
(under 5px of drag movement) still toggles the theme — distinguished by
total drag distance, not a separate gesture. Confirmed via Playwright:
click flips `data-theme`, a 70px drag afterward does *not* flip it back.

**Larger project preview popups** — `POPUP_WIDTH`/`POPUP_HEIGHT` raised
320×220 → 480×330 (same aspect ratio), `PROJECT_PREVIEWS.md` updated to
match. Mechanism only — still just Pet Society has a real image; see
TODO.md, unchanged from before.

**Skill logos** (`data/skillIcons.ts`, new) — real brand SVG path data
for the 21 skills that have an actual logo (Python, Django, PostgreSQL,
React, JavaScript, Git, Linux, FastAPI, Flask, Redux, Vite, Tailwind,
Bootstrap, MySQL, SQLite, Docker, Apache, Bash, Java, Spring Boot,
TypeScript), sourced from the `simple-icons` package (MIT licensed) —
installed temporarily, path data extracted with a one-off Python script,
then **uninstalled again** so it's not a runtime dependency for ~20
fixed strings. "Django Admin," "REST APIs," and "Unit testing" are
deliberately left as plain text in `Skills.tsx` — they're not real
branded products, so making up a mark for them would be fabricating
exactly the kind of filler CONTENT.md says not to invent. Confirmed via
Playwright in both dev and the production build: 21 icons render,
matching the 21-entry map exactly.

Verified throughout: `npx tsc -b` and `npm run build` clean (bundle grew
~40KB gzip for the icon path data — the two GLB models are separate
static assets, not part of the JS bundle). Full Playwright pass across
every Hero/Contact beat with the new model, the bulb's click-vs-drag
distinction, the popup's new size, and skill icon count in both dev and
`npm run preview` — zero console/page errors across all of it.

## 2026-08-09 (8) — Real copy from CONTENT.md across the whole site

Kareem sent a complete copy doc (CONTENT.md — his own file, companion to
CLAUDE.md, "Claude reads copy from here, do not invent filler") plus
answers to its three open questions, and asked for it applied everywhere
before moving on to Iteration 2. This replaces essentially every piece of
placeholder/first-guess copy on the site with real content, and changes
the page's information architecture to match CONTENT.md's own section
order: Hero → Work → Projects → Skills → About → Background (Education /
Competitive programming / Languages) → Contact.

**Open questions, answered and applied:**
- *Rustaq: sole developer, or one of two?* — one of two. Nothing on the
  site claims "sole developer" for it as a result (the old
  `data/projects.ts` entry had said exactly that — gone now, see below).
- *Is the PythonAnywhere link production or a demo?* — production, but
  gated behind an admin-created login with no self-serve signup. Labeling
  it "demo" would have been inaccurate (CONTENT.md's own guidance: only
  use that label if it *isn't* production), so the new Work section's
  link is honest about the gate instead — "Live (login required)."
  Kareem asked whether to create a viewer account; recommended in
  TODO.md, not something Claude can do (not access to his production
  system).
- *Add "Team lead" to Pet Society's meta line?* — yes, and Kareem
  extended the answer to also cover Django Blog Platform (CONTENT.md's
  own draft had it as "Solo"). Both now show "team lead" in
  `data/projects.ts`.

**Hero copy changed**, title "Software Engineer" → "Full-Stack
Developer," plus two new lines (the tagline sentence and an availability
line) added to the same fading unit as the title — `titleRef` changed
from a `<p>` to a `<div>` wrapping three lines (type updated across
Hero.tsx/Scene.tsx/HeroTimeline.tsx, mechanical, no beat-timing changes).
The standalone "Alexandria, Egypt" eyebrow tag above the name was
removed — CONTENT.md moves that same information into the availability
line at the bottom instead of duplicating it in two places.

**About Me (the Hero-pinned beat) replaced with one sentence** — "change
the about section to: I build the systems people use every day —
permissions, reporting, admin interfaces, Arabic-first." Same sentence
CONTENT.md uses as the Hero tagline, reused rather than writing a second
line that says almost the same thing. All three `[VERIFY]`-flagged spans
are gone — real content now exists, so there's nothing left to flag.

**New standalone About section** (`About.tsx`, new, "below Projects" per
CONTENT.md) — separate from the Hero beat above, three paragraphs of
deeper context (education path, competitive programming, the Arabic RTL
angle), verbatim from CONTENT.md.

**New Work section** (`Work.tsx`, new) — Rustaq gets a full case-study
treatment instead of a project-grid card: a stat strip (1,069 facilities,
7,716 inspection reports, 13 active users — deliberately the largest,
loudest thing in the section, per CONTENT.md's own instruction), the
"two decisions worth naming" callout, and real live/repo links.
Independent Developer sits underneath, kept to two sentences on purpose
so it doesn't compete with Rustaq. Rustaq is **removed from
`data/projects.ts` entirely** — it now only exists here.

**Projects rebuilt to CONTENT.md's four**, replacing the old
three-project grid (Zalando.it Product Scraper, Rustaq, Pet Society) plus
the separate three-item "Also built" list. New `data/projects.ts`: Pet
Society, PneumoXpert — AI Chest X-Ray Analysis, Movie Discovery App,
Django Blog Platform — each with the real stack/links/scope-note
CONTENT.md gives it. **Zalando.it Product Scraper is gone** — not
mentioned anywhere in CONTENT.md, so treated as "do not invent filler"
rather than kept on a guess. `ProjectCard.tsx`'s scope-note styling
switched from italic body text to small mono, matching CONTENT.md's own
spec ("Scope note (small, mono)"). Grid changed from a 3-column layout to
`sm:grid-cols-2` for a clean 2×2 with four cards.

**New Skills section** (`Skills.tsx` + `data/skills.ts`, new), replacing
`TechSkillsSlider.tsx`'s marquee (deleted, along with its now-orphaned
`marquee` keyframes in index.css). Three tiers — Daily / Comfortable /
Learning — straight from CONTENT.md, plain tags, "no percentage bars, no
proficiency rings — the tiering is the honesty."

**New Background section** (`Background.tsx`, new) combining
CONTENT.md's three smallest sections — Education, Competitive
programming, Languages — into one three-column section rather than three
consecutive near-empty full-bleed sections, which would have read as
choppy at this content density. Each sub-block keeps CONTENT.md's own
heading and formatting (competitive programming placements large in the
display face, "the number is the content").

**Contact section rewritten** — heading "Let's get connected" → "Get in
touch," paragraph updated to CONTENT.md's availability line. **The "send
me a message" form is gone** — CONTENT.md says "No contact form"
explicitly. In its place: email as a real `mailto:` link plus a
copy-to-clipboard button showing "Email copied" (confirmed via Playwright
— clicked it, read the actual clipboard content back, got the right
email), phone as a real `tel:` link, GitHub/LinkedIn (unchanged), and a
"Download CV" link (CONTENT.md lists this as part of Contact's own
content, not just the nav).

**Navbar restructured** to CONTENT.md's own nav spec — `Work · Projects
· About · Contact · CV` — replacing the six-item
Intro/About/Projects/Also built/Experience/Contact version. "About" now
points at the real `#about` DOM section instead of the old
progress-fraction-into-the-Hero-pin hack, since About has its own
standalone place on the page now. "CV" renders as a plain `<a download>`
styled to match the button items, not a scroll target.

**Skip-intro button added** (`SkipIntro.tsx`, new) — CONTENT.md's
micro-copy table lists `Skip`. This directly reverses an explicit earlier
decision recorded in `HeroTimeline.tsx`'s own doc comment ("no autoplay,
no Skip button... the whole point of going scroll-driven is that the
user already controls the pace") — noted there rather than silently
overwritten, since CONTENT.md is a deliberate spec, not an oversight.
Visible only while still inside the Hero pin (fixed top-left, opposite
`ThemeLightbulb`), animates scroll to the pin's end via the same GSAP
`ScrollToPlugin` approach as Navbar. Confirmed via Playwright: clicking
it lands `heroProgress` at exactly `1`.

**Footer and meta updated** — footer text now "Built with React,
Three.js and TypeScript · Alexandria, {year}" (was name + year in two
separate lines); `index.html`'s title/description now match CONTENT.md's
Meta section.

**Files deleted** (replaced, not just unused): `Experience.tsx`,
`data/experience.ts`, `OtherProjects.tsx`, `data/otherProjects.ts`,
`TechSkillsSlider.tsx`.

Verified throughout: `npx tsc -b` and `npm run build` clean. Full
Playwright pass — nav item labels, Skip button visibility + click
behavior (lands at `heroProgress: 1`), Work section's stat numbers,
Projects' four card titles, Skills' three tier labels, About's paragraph
count, Contact's form genuinely absent + `tel:` link correct + copy
button verified against real clipboard content — zero console/page
errors across all of it. Screenshotted every new/changed section.

## 2026-08-09 (7) — Iteration 1: real scroll-restoration bug fixed, CV installed, About Me overhauled

Kareem sent twelve more items plus his real CV and two new GLB models
(`models-source/`). Too much for one pass — split into iterations (see
TODO.md); this entry covers Iteration 1, the self-contained/low-risk half.
Iteration 2 (character model swap, light-bulb model, project popup
images, new Skills section) is queued but not started.

**Real CV installed.** "I have attached my desired cv, rename it and put
it in the file where it should be." The attachment's filename
(`Kareem_Aboelnaga_Full_Stack_Developer_CV.pdf`) matched *four* different
files already sitting in `~/Downloads` under that same name — content-
diffed all four via `pdftotext` against the attachment's actual text
(the "Learning: Java, Spring Boot, Spring Data JPA.." line and exact
bullet wording were the distinguishing details) rather than guessing
from filename or date, since two of the four were subtly different CV
versions. `~/Downloads/files-3/Kareem_Aboelnaga_Full_Stack_Developer_CV.pdf`
was the exact match, copied to `public/CV.pdf` (replacing the earlier
`cupsfilter` placeholder). No code change needed — the download link
already pointed here.

**Real bug found and fixed: scroll sequence breaking on return visits.**
"The sequence of scenes breaks when I go back and forth in the website,
it gets me the last scene right after the first." Reproduced deliberately
via Playwright rather than guessing: scrolled deep into the page,
navigated away and used browser back — and confirmed the browser's
default scroll restoration (`history.scrollRestoration`) snaps back to
the *previous* scrollY the instant the page returns, which happens
**before** the character model has loaded and before `HeroTimeline`/
`ContactTimeline` have created their `pin: true` ScrollTriggers. At that
moment the document is still short (no pin spacers yet), so the browser
clamps the restored scrollY to whatever the short page's max is; once the
pins actually get created moments later and the real (much taller)
layout exists, nothing ever revisits that clamped scrollY — the visitor
ends up dropped deep into the Hero pin's progress (its final beats) with
zero scrolling of their own, which is exactly what "gets me the last
scene right after the first" describes. Fixed in `main.tsx`:
`history.scrollRestoration = 'manual'` plus an explicit `scrollTo(0, 0)`
before React even mounts, so every load/back-forward always starts at
the real top regardless of scroll history. Confirmed via the same repro
(navigate deep → leave → `page.goBack()`) landing at `heroProgress: 0`
instead of `0.692` after the fix, both with instrumented polling and a
production build.

**Contact whole-object drag: X-axis added, matching Y.** "Add the same
margin for the x axis too, that you made for y-axis." Constants renamed
`DRAG_Y_SENSITIVITY`/`DRAG_Y_RANGE` → `DRAG_SENSITIVITY`/`DRAG_RANGE`
now that they apply to both; `onPointerMoveDrag` computes and clamps an
X offset the same way as Y, `onPointerUp`'s spring-back tweens both
`x` and `y` back to baseline together.

**Hero + About Me text moved left; About Me sized way up.** Both
containers had a stray `mx-auto` centering them within their already-
padded flex wrapper — removed, so both now sit at the left edge (this
compositionally makes more sense now that the character settles on the
right, per the previous session's reframe). About Me's heading went
`text-2xl sm:text-3xl` → `text-3xl sm:text-4xl lg:text-5xl`, its
paragraph `text-base` → `text-xl sm:text-2xl`, container `max-w-3xl` →
`max-w-4xl`. The bigger block pushed its top edge up under the fixed
Navbar — added `pt-28` to the wrapper to clear it, caught by screenshot
before shipping, not by luck.

**About Me word-reveal made genuinely discrete, word by word,** not
clusters/lines. Kareem: "I want every single word to start the animation
alone... every time I scroll, the word is being lightened." Root cause,
found by reading the actual numbers rather than re-guessing: each word's
fade `duration` was computed *independently* of the `stagger` gap
between words (`wordSpan/wN + 0.03`, uncapped relative to the step) — with
~46 words in this paragraph, roughly a dozen were always mid-fade
simultaneously, reading as whole lines brightening together. Now
`duration` is derived *from* the step (`wStep * 1.1`, ~10% overlap) so
only one word (occasionally two, mid-crossfade) is ever transitioning at
once. Confirmed by sampling word colors mid-scroll: a small, changing
subset bright at any given progress, not most/all of them.

**"Scroll to begin" made bold and larger,** `text-xs`/`text-low` →
`text-base font-bold`/`text-hi` (`sm:text-lg`), chevron icon enlarged to
match. Disappear-on-first-scroll (shipped 2026-08-09 (6)) re-verified
still works after the size/weight change.

**Scroll-down button now also hides at the very bottom of the page.**
"Make the scroll button disappear if I reached the end of the website."
Additive on top of the existing 2026-08-09 (2) "always visible" behavior
— new `atBottom` state (`scrollY >= scrollHeight - innerHeight - 24px`),
recomputed on both `scroll` and `resize`. Back-to-top's own
appear-after-threshold behavior is unchanged.

**New GLB assets inspected, not yet integrated** —
`models-source/developer-at-desk .glb` (the replacement character,
1.69MB) and `models-source/light-bulb.glb` (2.28MB), both dumped via a
raw GLB-JSON-chunk node inspector (no GLTFLoader needed, just read the
header). The character model's node names match `Character.tsx`'s
`UPPER_BODY_NODE_NAMES` and every `getObjectByName` lookup used
elsewhere (`head`, `monitor_screen`, `screen_spill`) exactly — same rig
convention, just far more detailed (real face geometry instead of a
blob head). This is genuinely good news for Iteration 2 but the swap
itself is deliberately not done yet — every hand-tuned camera position
in `timeline.ts` was tuned against the old model's proportions and needs
re-verification once the new one is in, not just a file copy.

**Playwright methodology note, for next time:** `ScrollTrigger.scroll()`
(the instance's own programmatic jump, used successfully all session for
reading back camera position/fov) does *not* reliably reflect a scrub-
smoothed timeline's discrete `.set()`-driven state (e.g. a `visibility`
toggle) within a normal wait window — a real, gradual `mouse.wheel()`
scroll to the same target progress shows the correct state where
`st.scroll()` briefly doesn't. Chased this as a suspected bug for a
while before confirming it's a test-harness quirk, not a product issue —
worth reaching for real wheel-scroll simulation first when verifying
anything gated behind a discrete (not tweened) property change, to avoid
re-diagnosing this same false alarm.

Verified throughout: `npx tsc -b` and `npm run build` clean after every
change. Full Playwright pass: the scroll-restoration repro (before/after,
including a production-build check), Contact drag readouts on both axes,
About Me screenshots via real scroll confirming left alignment/size/
discrete word colors, scroll-down button opacity at the true page
bottom, welcome message timing — zero console/page errors across all of
it.

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
