import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { useTheme } from '../theme/ThemeContext';
import {
  HERO_SCROLL_PIN_VH,
  HERO_BEATS,
  SCRUB,
  FADE_IN_CAMERA,
  TURN_END_CAMERA,
  SETTLE_CAMERA,
  CHARACTER_TURN_YAW,
  THROUGH_EYES_CAMERA,
  MONITOR_ZOOM_CAMERA,
  MONITOR_EMISSIVE_START,
  MONITOR_EMISSIVE_END,
} from './timeline';
import { markHeroReady } from './heroReady';

gsap.registerPlugin(ScrollTrigger);

const isDev = import.meta.env.DEV;

function vec([x, y, z]: [number, number, number]) {
  return { x, y, z };
}


interface Props {
  upperBody: THREE.Group | null;
  sceneRoot: THREE.Group | null;
  pinRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  nameRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLDivElement | null>;
  aboutMeRef: RefObject<HTMLDivElement | null>;
  codeWordsRef: RefObject<HTMLDivElement | null>;
  projectsGlimpseRef: RefObject<HTMLDivElement | null>;
  welcomeRef: RefObject<HTMLDivElement | null>;
  lookAtRef: RefObject<{ x: number; y: number; z: number } | null>;
  onReady: () => void;
}

type EmissiveMaterial = THREE.Material & { emissiveIntensity?: number };

/**
 * The whole Hero sequence, scroll-driven start to finish: intro turn ->
 * entrance text -> About Me -> monitor approach -> black pass-through ->
 * flying code words -> a glimpse of the projects "on screen". One
 * ScrollTrigger-pinned GSAP timeline for all of it — no autoplay, no
 * prefers-reduced-motion branch, since the whole point of going
 * scroll-driven is that the user already controls the pace. (A Skip
 * button *was* deliberately left out for this same reason, until
 * CONTENT.md's micro-copy table asked for one directly — see
 * SkipIntro.tsx, mounted in Hero.tsx.)
 */
export function HeroTimeline({
  upperBody,
  sceneRoot,
  pinRef,
  overlayRef,
  nameRef,
  titleRef,
  aboutMeRef,
  codeWordsRef,
  projectsGlimpseRef,
  welcomeRef,
  lookAtRef,
  onReady,
}: Props) {
  const { camera } = useThree();
  const preparedRef = useRef(false);
  const createdRef = useRef(false);
  const { colors } = useTheme();
  // Live-read by the About Me word-reveal tweens below via function-based
  // GSAP values (`() => colorsRef.current.textLow`) instead of being baked
  // into the tween as a plain value — see the `colors` effect further down
  // for why.
  const colorsRef = useRef(colors);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Initial framing + hide/reposition DOM overlays, before paint. Not gated
  // on the model loading — only the character-turn tween needs upperBody,
  // everything else can be ready immediately.
  useLayoutEffect(() => {
    if (preparedRef.current) return;
    preparedRef.current = true;

    camera.position.set(...FADE_IN_CAMERA.position);
    camera.lookAt(...FADE_IN_CAMERA.target);
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = FADE_IN_CAMERA.fov;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }

    if (overlayRef.current) gsap.set(overlayRef.current, { opacity: 1 });
    if (welcomeRef.current) gsap.set(welcomeRef.current, { opacity: 0 });
    if (nameRef.current) gsap.set(nameRef.current, { opacity: 0, y: 24 });
    if (titleRef.current) gsap.set(titleRef.current, { opacity: 0, y: 24 });
    if (aboutMeRef.current) {
      gsap.set(aboutMeRef.current, { position: 'fixed', inset: 0, visibility: 'hidden' });
    }
    if (codeWordsRef.current) {
      gsap.set(codeWordsRef.current, { position: 'fixed', inset: 0, visibility: 'hidden' });
    }
    if (projectsGlimpseRef.current) {
      gsap.set(projectsGlimpseRef.current, { position: 'fixed', inset: 0, visibility: 'hidden' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!upperBody || createdRef.current) return;
    if (
      !pinRef.current ||
      !overlayRef.current ||
      !nameRef.current ||
      !titleRef.current ||
      !aboutMeRef.current ||
      !codeWordsRef.current ||
      !projectsGlimpseRef.current
    ) {
      return;
    }
    createdRef.current = true;

    const monitorScreen = sceneRoot?.getObjectByName('monitor_screen') as THREE.Mesh | undefined;
    const rawMaterial = monitorScreen?.material;
    const monitorMaterial = (Array.isArray(rawMaterial) ? rawMaterial[0] : rawMaterial) as
      | EmissiveMaterial
      | undefined;
    if (monitorMaterial) monitorMaterial.emissiveIntensity = MONITOR_EMISSIVE_START;

    // Target the screen's actual world-space center rather than a hand-eyeballed
    // guess — small correction on top of MONITOR_ZOOM_CAMERA's position, which
    // still comes from timeline.ts (shifted left, closer, per Kareem's request).
    let monitorTarget = vec(MONITOR_ZOOM_CAMERA.target);
    if (monitorScreen) {
      const box = new THREE.Box3().setFromObject(monitorScreen);
      const center = box.getCenter(new THREE.Vector3());
      monitorTarget = { x: center.x, y: center.y, z: center.z };
      if (isDev) console.log('[monitor_screen] world center:', center, 'size:', box.getSize(new THREE.Vector3()));
    }

    // SETTLE reframing — "in the first scene it's perfect, I just want the
    // object to end on the right, not in the center." Same real-geometry
    // approach as monitorTarget above and Contact's framing: offset the
    // look-at target toward camera-left (not the character) so he renders
    // toward the right of frame, wherever his exact world position is,
    // rather than a hand-guessed target.x.
    const charBox = new THREE.Box3().setFromObject(upperBody);
    const charCenter = charBox.getCenter(new THREE.Vector3());
    const settlePos = new THREE.Vector3(...SETTLE_CAMERA.position);
    const settleViewDir = charCenter.clone().sub(settlePos).normalize();
    const settleCamRight = new THREE.Vector3()
      .crossVectors(settleViewDir, new THREE.Vector3(0, 1, 0))
      .normalize();
    const settleTargetVec = charCenter.clone().add(settleCamRight.multiplyScalar(-0.4));
    const settleTarget = { x: settleTargetVec.x, y: settleTargetVec.y, z: settleTargetVec.z };

    const lookAt = vec(FADE_IN_CAMERA.target);
    lookAtRef.current = lookAt;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: () => {
        camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
        if ('fov' in camera) (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      },
    });
    tlRef.current = tl;

    const beat = (name: keyof typeof HERO_BEATS) => {
      const [start, end] = HERO_BEATS[name];
      return { start, duration: end - start };
    };

    // Pin camera.position/fov to FADE_IN_CAMERA at time 0. Without this,
    // the very first scroll tick wouldn't touch camera.position at all
    // (introTurn's position tween doesn't start until 0.03) — it would
    // just stay wherever PreScrollOrbit's pre-scroll drag last left it,
    // since GSAP only ever assigns a property while some tween/set touching
    // it is active. This `.set()` is what makes "turns into the desired
    // starting position at first" actually happen the instant scrolling
    // begins, instead of camera.lookAt() merely re-aiming rotation from
    // wherever the drag left the position.
    tl.set(camera.position, { ...vec(FADE_IN_CAMERA.position) }, 0);
    tl.set(camera, { fov: FADE_IN_CAMERA.fov }, 0);

    // introFadeIn: overlay fades out, camera holds at FADE_IN_CAMERA.
    const fadeIn = beat('introFadeIn');
    tl.to(overlayRef.current, { opacity: 0, duration: fadeIn.duration, ease: 'power1.out' }, fadeIn.start);

    // introTurn -> introSettle: one continuous motion, no pause in between —
    // camera arcs to TURN_END_CAMERA (character turning) then immediately
    // keeps moving to SETTLE_CAMERA (pulled back, character centered).
    const turn = beat('introTurn');
    tl.to(
      camera.position,
      { ...vec(TURN_END_CAMERA.position), duration: turn.duration, ease: 'power1.inOut' },
      turn.start,
    );
    tl.to(lookAt, { ...vec(TURN_END_CAMERA.target), duration: turn.duration, ease: 'power1.inOut' }, turn.start);
    tl.to(camera, { fov: TURN_END_CAMERA.fov, duration: turn.duration, ease: 'power1.inOut' }, turn.start);
    tl.to(
      upperBody.rotation,
      { y: CHARACTER_TURN_YAW, duration: turn.duration, ease: 'power1.inOut' },
      turn.start,
    );

    const settle = beat('introSettle');
    tl.to(
      camera.position,
      { ...vec(SETTLE_CAMERA.position), duration: settle.duration, ease: 'power1.inOut' },
      settle.start,
    );
    tl.to(lookAt, { ...settleTarget, duration: settle.duration, ease: 'power1.inOut' }, settle.start);
    tl.to(camera, { fov: SETTLE_CAMERA.fov, duration: settle.duration, ease: 'power1.inOut' }, settle.start);

    // Entrance text — camera holds at SETTLE_CAMERA through this and About Me.
    const nameIn = beat('nameIn');
    tl.to(nameRef.current, { opacity: 1, y: 0, duration: nameIn.duration }, nameIn.start);
    const titleIn = beat('titleIn');
    tl.to(titleRef.current, { opacity: 1, y: 0, duration: titleIn.duration }, titleIn.start);
    const entranceOut = beat('entranceOut');
    tl.to(
      [nameRef.current, titleRef.current],
      { opacity: 0, y: -24, duration: entranceOut.duration },
      entranceOut.start,
    );

    // About Me.
    const aboutMeIn = beat('aboutMeIn');
    tl.set(aboutMeRef.current, { visibility: 'visible' }, aboutMeIn.start);
    tl.to(aboutMeRef.current, { opacity: 1, y: 0, duration: aboutMeIn.duration }, aboutMeIn.start);

    // Word-by-word brighten (dim -> full contrast), majd-portfolio-inspired
    // — see WordReveal.tsx. Spread across aboutMeIn *and* aboutMeHold so
    // by the time the hold ends (camera's about to move on) every word has
    // fully brightened, roughly pacing with how long there's been to read it.
    // Kareem: "I want every single word to start the animation alone, not
    // line by line — every time I scroll, the word is being lightened."
    // The previous version gave each word a duration *longer* than the gap
    // between words (padded by +0.03 on top of an already-tight per-word
    // share), so with ~30+ words in this paragraph a dozen of them were
    // always mid-fade at once — reading as whole clumps/lines brightening
    // together, not one word at a time. Duration now barely exceeds the
    // step between words (10% overlap, just enough to not look like a
    // hard cut) instead of being computed independently of it.
    const aboutMeHoldBeat = beat('aboutMeHold');
    const aboutWords = aboutMeRef.current.querySelectorAll<HTMLElement>('[data-word-reveal]');
    const wN = aboutWords.length;
    if (wN > 0) {
      const wordSpan = aboutMeIn.duration + aboutMeHoldBeat.duration;
      const wStep = wordSpan / wN;
      const wDuration = wStep * 1.1;
      aboutWords.forEach((el, i) => {
        // Function-based values (re-evaluated on `tl.invalidate()`, see the
        // `colors` effect below) instead of plain `colors.textLow`/`textHi`
        // — so a theme toggle mid-scroll can repaint these words with the
        // live theme's colors without rebuilding this whole effect (which
        // previously caused a real bug: rebuilding on every toggle reset
        // ScrollTrigger/the pinned camera, visibly moving the user on the
        // page — see git history / DONE.md).
        tl.fromTo(
          el,
          { color: () => colorsRef.current.textLow },
          { color: () => colorsRef.current.textHi, duration: wDuration, ease: 'none' },
          aboutMeIn.start + i * wStep,
        );
      });
    }

    const aboutMeOut = beat('aboutMeOut');
    tl.to(
      aboutMeRef.current,
      { opacity: 0, y: -24, duration: aboutMeOut.duration },
      aboutMeOut.start,
    );
    tl.set(aboutMeRef.current, { visibility: 'hidden' }, aboutMeOut.start + aboutMeOut.duration);

    // Through the character's own eyes, then deeper into the monitor —
    // Kareem: "first rotate and go through the character with the camera
    // as if I'm the character's own eyes, then zoom into the monitor and
    // go rapidly inside." Asked again later for this to be smoother, with
    // no camera-direction change partway through, and to actually feel
    // like it goes deeper into the monitor.
    //
    // Real bug found and fixed, verified by sampling `camera.position` on
    // every frame through a real (non-jumped) scroll, not by eye: the old
    // code sent the camera from the settled framing to `eyePosition` (the
    // head's real world position, nudged 0.06 units toward the monitor —
    // computed from live geometry), then in a *separate* tween from
    // `eyePosition` to `MONITOR_ZOOM_CAMERA.position`, a hand-placed
    // constant from timeline.ts with no geometric relationship to that
    // ray. The sampled path showed camera.x traveling 1.55 -> 0.003 ->
    // 0.54 — down, then back up — a real, measurable direction reversal
    // exactly where the two tweens met, not a feel issue. Fixed by
    // computing the *second* leg's endpoint further along the exact same
    // head-toward-monitor ray as the first leg (a fraction of the real
    // head-to-screen distance) instead of an unrelated hand-placed point
    // — both legs now travel the same straight line, just further along
    // it, so there's nothing left to reverse. This also directly serves
    // "go deeper into the monitor": the old endpoint happened to sit at
    // roughly the *same* distance from the screen as the head itself (it
    // only looked closer via a very tight fov), where the new one is
    // genuinely most of the way there in real position, not just optically.
    const EYE_NUDGE = 0.06;
    const DEEP_FRACTION = 0.85; // how far along the head->screen distance to end up; short of 1.0 so nothing clips through the mesh
    const headNode = sceneRoot?.getObjectByName('head');
    let eyePosition = vec(THROUGH_EYES_CAMERA.position);
    let deepMonitorPosition = vec(MONITOR_ZOOM_CAMERA.position);
    if (headNode) {
      const headBox = new THREE.Box3().setFromObject(headNode);
      const headCenter = headBox.getCenter(new THREE.Vector3());
      const monitorVec = new THREE.Vector3(monitorTarget.x, monitorTarget.y, monitorTarget.z);
      const forward = monitorVec.clone().sub(headCenter).normalize();
      const totalDistance = headCenter.distanceTo(monitorVec);
      const eyePos = headCenter.clone().add(forward.clone().multiplyScalar(EYE_NUDGE));
      eyePosition = { x: eyePos.x, y: eyePos.y, z: eyePos.z };
      const deepPos = headCenter.clone().add(forward.clone().multiplyScalar(totalDistance * DEEP_FRACTION));
      deepMonitorPosition = { x: deepPos.x, y: deepPos.y, z: deepPos.z };
      if (isDev) console.log('[head] eye position:', eyePosition, 'deep position:', deepMonitorPosition);
    }

    // "power2.out" (decelerating) rather than "power2.in" for this first
    // leg — arrives at the eyes smoothly instead of still accelerating at
    // full speed right as the second leg needs to take over. The old
    // double-"power2.in" meant velocity reset to near-zero at the start of
    // every leg regardless of how fast the previous one was still going —
    // a stutter on top of the direction reversal above. Decelerating into
    // the eyes, then accelerating away from them into the monitor, reads
    // as one continuous motion with a natural beat in the middle instead
    // of two disconnected hops.
    const throughEyes = beat('throughEyes');
    tl.to(
      camera.position,
      { ...eyePosition, duration: throughEyes.duration, ease: 'power2.out' },
      throughEyes.start,
    );
    tl.to(lookAt, { ...monitorTarget, duration: throughEyes.duration, ease: 'power2.out' }, throughEyes.start);
    tl.to(
      camera,
      { fov: THROUGH_EYES_CAMERA.fov, duration: throughEyes.duration, ease: 'power2.out' },
      throughEyes.start,
    );

    // Monitor approach — continues from the eye position straight along
    // the same ray (see deepMonitorPosition above), accelerating hard
    // ("go rapidly inside the monitor").
    const approach = beat('monitorApproach');
    tl.to(
      camera.position,
      { ...deepMonitorPosition, duration: approach.duration, ease: 'power2.in' },
      approach.start,
    );
    tl.to(lookAt, { ...monitorTarget, duration: approach.duration, ease: 'power2.in' }, approach.start);
    tl.to(
      camera,
      { fov: MONITOR_ZOOM_CAMERA.fov, duration: approach.duration, ease: 'power2.in' },
      approach.start,
    );
    if (monitorMaterial) {
      tl.to(
        monitorMaterial,
        { emissiveIntensity: MONITOR_EMISSIVE_END, duration: approach.duration },
        approach.start,
      );
    }

    // Monitor black — "the lens touches the monitor." Purely a DOM overlay
    // effect from here on, not further camera movement.
    const black = beat('monitorBlack');
    tl.to(overlayRef.current, { opacity: 1, duration: black.duration, ease: 'power1.in' }, black.start);
    tl.set(codeWordsRef.current, { visibility: 'visible' }, black.start);

    // Code words — staggered, overlapping fly-through while the screen is
    // black, growing from dead center (tried entering from screen edges per
    // an earlier request; Kareem preferred the original center version once
    // he saw both, so back to this).
    const codeWords = beat('codeWords');
    const wordEls = codeWordsRef.current.querySelectorAll('span');
    const n = wordEls.length;
    if (n > 0) {
      const wordDuration = Math.min(0.05, codeWords.duration / n + 0.02);
      const step = n > 1 ? (codeWords.duration - wordDuration) / (n - 1) : 0;
      wordEls.forEach((el, i) => {
        const wordStart = codeWords.start + i * step;
        // Scale keeps its own full-duration growth curve, unaffected —
        // only `opacity` needed splitting. It used to be a `fromTo` (0->1)
        // spanning the *entire* wordDuration bundled together with scale,
        // plus a separate fade-out `to` (->0) starting at 60% through that
        // same span — two tweens both driving `opacity` on the same
        // element during their 60%-100% overlap, and GSAP has no built-in
        // resolution for that inside one timeline (each frame just takes
        // whichever tween rendered last), so the fade-out always won and
        // opacity never got past ease power1.in's value at the 60% mark
        // (~0.36) before being pulled back to 0. Now the fade-in tween's
        // own duration ends exactly when the fade-out tween starts, so
        // only one tween is ever driving `opacity` at any instant — fade-in
        // actually reaches 1 before fade-out begins.
        tl.fromTo(el, { scale: 0.2 }, { scale: 3.2, duration: wordDuration, ease: 'power1.in' }, wordStart);
        const fadeInDuration = wordDuration * 0.6;
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: fadeInDuration, ease: 'power1.in' }, wordStart);
        tl.to(el, { opacity: 0, duration: wordDuration * 0.4, ease: 'power1.out' }, wordStart + fadeInDuration);
      });
    }

    // Title card ("My Work") in the final black beat before the pin
    // releases into the real Projects section. Was cut 2026-08-11 for
    // reading too close to the real Projects section's own heading
    // ("Things I've built") seconds later — restored after Kareem saw the
    // cut live and didn't want a bare black beat there: "I want anything
    // ['My Work'] to be put instead." Copy deliberately different from
    // the section heading this time so it doesn't reintroduce the same
    // repetition. Camera holds dead still at MONITOR_ZOOM_CAMERA for the
    // rest of the pin — no further movement, no model rotation. Overlay
    // goes fully opaque (was 0.85, translucent, before the title card was
    // first cut — see git history) so this still reads as "on black
    // background, still inside the monitor" rather than the close-up
    // monitor texture bleeding through behind the heading. Ends exactly
    // at progress 1 (pin release); the natural unpin + continued scroll
    // cuts straight to the real Projects section underneath.
    const textIn = beat('projectsTextIn');
    tl.set(projectsGlimpseRef.current, { visibility: 'visible' }, textIn.start);
    tl.to(overlayRef.current, { opacity: 1, duration: textIn.duration * 0.3 }, textIn.start);
    const glimpseHeading = projectsGlimpseRef.current.querySelector('[data-glimpse-heading]');
    if (glimpseHeading) {
      tl.fromTo(
        glimpseHeading,
        { opacity: 0, y: 24, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: textIn.duration * 0.5, ease: 'power2.out' },
        textIn.start,
      );
    }

    const st = ScrollTrigger.create({
      trigger: pinRef.current,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (HERO_SCROLL_PIN_VH / 100),
      pin: true,
      scrub: SCRUB,
      animation: tl,
      invalidateOnRefresh: true,
    });

    // Tells ContactTimeline it's now safe to measure its own trigger
    // position — see heroReady.ts for why this exists (this pin's spacer
    // needs to exist first, or Contact's pin lands on the wrong scroll
    // position and visibly overlaps the Hero scene).
    markHeroReady();

    onReady();

    // "In the first black screen, make a welcoming message appear when the
    // scroll is ready to be made" — the ScrollTrigger above only exists
    // once we reach this line, so that's "ready." A real-time tween, not
    // part of `tl` — it has nothing to do with scroll progress, which is
    // still 0 here regardless.
    //
    // "I want scroll to begin to appear whenever I go to the first of the
    // page" — this used to be a one-shot: show once if still at the top
    // when this code runs, hide forever on the first scroll event after
    // that (which also fixed a real bug — see DONE.md 2026-08-10 (3) —
    // where showing it unconditionally regardless of current scroll
    // position could leave it stuck visible deep in the page). Now it's a
    // standing sync instead of a one-shot: every scroll event re-checks
    // "am I at the top right now" and shows/hides to match, so it
    // reappears every time the user scrolls (or navigates) back to the
    // very top, not just once on first load — while keeping the same
    // "never show it somewhere it doesn't belong" guarantee, since the
    // check is against the *current* position on every single event, not
    // a remembered one-time snapshot.
    const WELCOME_TOP_THRESHOLD = 40;
    let welcomeAtTop = window.scrollY < WELCOME_TOP_THRESHOLD;
    let welcomeEverShown = false;
    if (welcomeRef.current && welcomeAtTop) {
      gsap.to(welcomeRef.current, { opacity: 1, duration: 0.8, delay: 0.4, ease: 'power2.out' });
      welcomeEverShown = true;
    }
    function onWelcomeScroll() {
      const atTop = window.scrollY < WELCOME_TOP_THRESHOLD;
      if (atTop === welcomeAtTop) return;
      welcomeAtTop = atTop;
      if (!welcomeRef.current) return;
      gsap.to(welcomeRef.current, {
        opacity: atTop ? 1 : 0,
        duration: atTop ? 0.6 : 0.4,
        // Only the very first appearance gets the settling delay (right
        // after the model finishes loading); every later return to the
        // top fades in right away.
        delay: atTop && !welcomeEverShown ? 0.4 : 0,
        ease: atTop ? 'power2.out' : 'power1.out',
        overwrite: 'auto',
      });
      if (atTop) welcomeEverShown = true;
    }
    window.addEventListener('scroll', onWelcomeScroll, { passive: true });

    if (isDev) {
      Object.assign(window, {
        __heroTimeline: tl,
        __heroScrollTrigger: st,
        __camera: camera,
        __upperBody: upperBody,
      });
    }

    return () => {
      createdRef.current = false;
      tlRef.current = null;
      window.removeEventListener('scroll', onWelcomeScroll);
      st.kill();
      tl.kill();
    };
    // `colors` deliberately excluded — "toggling dark/light mode changes
    // where I'm standing on the site" was a real bug: `colors` used to be a
    // dependency so the About Me word-reveal would use whichever theme was
    // active, but since it's a new object reference every toggle, including
    // it here meant every theme toggle re-ran this *entire* effect — killing
    // and rebuilding the whole ScrollTrigger/GSAP timeline from scratch
    // while scrolled deep into the pin, which is what actually moved the
    // visible position. The word-reveal tweens above read `colorsRef`
    // instead (function-based values), and the effect right below this one
    // repaints them in place on toggle — so this effect can stay excluded
    // from `colors` without the color going stale, which is what happened
    // before ("in dark mode [the About Me text is] in gold then with
    // scroll turns into nearly black" — stale light-mode colors surviving
    // a mid-session toggle to dark).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    upperBody,
    sceneRoot,
    camera,
    pinRef,
    overlayRef,
    nameRef,
    titleRef,
    aboutMeRef,
    codeWordsRef,
    welcomeRef,
    lookAtRef,
    onReady,
  ]);

  // Repaints the About Me word-reveal in place when the theme toggles —
  // without touching the effect above (and therefore without rebuilding
  // the pinned ScrollTrigger/camera timeline; see the comment on that
  // effect's dependency array). `invalidate()` clears the cached start/end
  // values GSAP recorded for the function-based `color` tweens, so they're
  // recomputed from the now-current `colorsRef` on next render. Re-render
  // at the timeline's *own current time* (not a new one) to repaint in
  // place — the third `force` argument is required: GSAP's `.render()`
  // skips work when the target time matches its cached time, which it
  // always will here since nothing scrolled, only the color inputs did.
  useEffect(() => {
    colorsRef.current = colors;
    const tl = tlRef.current;
    if (!tl) return;
    tl.invalidate();
    tl.render(tl.time(), true, true);
  }, [colors]);

  return null;
}
