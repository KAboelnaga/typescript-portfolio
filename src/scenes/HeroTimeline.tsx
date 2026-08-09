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
  titleRef: RefObject<HTMLParagraphElement | null>;
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
 * ScrollTrigger-pinned GSAP timeline for all of it — no autoplay, no Skip
 * button, no prefers-reduced-motion branch, since the whole point of going
 * scroll-driven is that the user already controls the pace.
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
  // Read once, at whatever theme is active when this effect (re)builds the
  // GSAP timeline below — the About Me word-reveal's colors are baked into
  // the tween at that point. Toggling the theme mid-session while already
  // scrolled into this pin won't retroactively recolor it; rebuilding the
  // whole timeline on every theme change wasn't worth the added risk here.
  // See TODO.md.
  const { colors } = useTheme();

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
    const aboutMeHoldBeat = beat('aboutMeHold');
    const aboutWords = aboutMeRef.current.querySelectorAll<HTMLElement>('[data-word-reveal]');
    const wN = aboutWords.length;
    if (wN > 0) {
      const wordSpan = aboutMeIn.duration + aboutMeHoldBeat.duration;
      const wDuration = wordSpan / wN + 0.03;
      const wStep = wN > 1 ? (wordSpan - wDuration) / (wN - 1) : 0;
      aboutWords.forEach((el, i) => {
        tl.fromTo(
          el,
          { color: colors.textLow },
          { color: colors.textHi, duration: wDuration, ease: 'none' },
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

    // Through the character's own eyes — Kareem: "first rotate and go
    // through the character with the camera as if I'm the character's own
    // eyes, then zoom into the monitor and go rapidly inside." Camera
    // travels from wherever it's settled to right in front of his actual
    // eyes — the real "head" node's world-space bounding-box center,
    // nudged forward along his own line of sight toward the monitor (same
    // real-geometry approach as monitor_screen's target and Contact's
    // box-based framing, not a hand-guessed number). The sweep from the
    // settled framing to that close-up position naturally passes through
    // his silhouette on the way; the head mesh is backface-culled, so
    // ending up this close reveals what's ahead of him rather than the
    // inside of his skull.
    const headNode = sceneRoot?.getObjectByName('head');
    let eyePosition = vec(THROUGH_EYES_CAMERA.position);
    if (headNode) {
      const headBox = new THREE.Box3().setFromObject(headNode);
      const headCenter = headBox.getCenter(new THREE.Vector3());
      const forward = new THREE.Vector3(monitorTarget.x, monitorTarget.y, monitorTarget.z)
        .sub(headCenter)
        .normalize();
      const eyePos = headCenter.add(forward.multiplyScalar(0.06));
      eyePosition = { x: eyePos.x, y: eyePos.y, z: eyePos.z };
      if (isDev) console.log('[head] eye position:', eyePosition);
    }

    const throughEyes = beat('throughEyes');
    tl.to(
      camera.position,
      { ...eyePosition, duration: throughEyes.duration, ease: 'power2.in' },
      throughEyes.start,
    );
    tl.to(lookAt, { ...monitorTarget, duration: throughEyes.duration, ease: 'power2.in' }, throughEyes.start);
    tl.to(
      camera,
      { fov: THROUGH_EYES_CAMERA.fov, duration: throughEyes.duration, ease: 'power2.in' },
      throughEyes.start,
    );

    // Monitor approach — now starting from the eye position above rather
    // than the settled framing, so there's less ground to cover; eased in
    // (accelerating) rather than linear for "go rapidly inside the
    // monitor." Pushed close enough to fill the frame entirely; camera
    // stops moving in 3D once this ends, no literal clipping through the
    // mesh from here on.
    const approach = beat('monitorApproach');
    tl.to(
      camera.position,
      { ...vec(MONITOR_ZOOM_CAMERA.position), duration: approach.duration, ease: 'power2.in' },
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
        tl.fromTo(
          el,
          { opacity: 0, scale: 0.2 },
          { opacity: 1, scale: 3.2, duration: wordDuration, ease: 'power1.in' },
          wordStart,
        );
        tl.to(el, { opacity: 0, duration: wordDuration * 0.4 }, wordStart + wordDuration * 0.6);
      });
    }

    // Projects title card — "the zoom out after text popping fast, remove
    // it, I don't want it, just a large 'projects that I have done' text to
    // appear then seeing my project." Camera holds dead still at
    // MONITOR_ZOOM_CAMERA for the rest of the pin — no further movement, no
    // model rotation. Overlay now goes fully opaque (was 0.85, translucent)
    // — with the camera no longer moving away from this beat, holding at
    // 0.85 left the monitor's baked-in code-line texture visible right
    // behind the heading the whole time, at a close, skewed angle ("the
    // text on monitor are skewed to the left, the rectangular ribbons, get
    // rid of that"). Fully opaque removes it outright; still reads as "on
    // black background, still inside the monitor," just without the
    // distracting close-up texture bleeding through. Ends exactly at
    // progress 1 (pin release); the natural unpin + continued scroll cuts
    // straight to the real Projects section underneath.
    const textIn = beat('projectsTextIn');
    tl.set(projectsGlimpseRef.current, { visibility: 'visible' }, textIn.start);
    tl.to(overlayRef.current, { opacity: 1, duration: textIn.duration * 0.3 }, textIn.start);
    const heading = projectsGlimpseRef.current.querySelector('[data-glimpse-heading]');
    if (heading) {
      tl.fromTo(
        heading,
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
    // still 0 here regardless. Fades back out the instant real scrolling
    // starts (a one-shot native `scroll` listener, not scroll-scrubbed —
    // simplest way to avoid fighting introFadeIn's own scrubbed opacity
    // tween on the separate black overlay).
    let welcomeShown = false;
    if (welcomeRef.current) {
      gsap.to(welcomeRef.current, { opacity: 1, duration: 0.8, delay: 0.4, ease: 'power2.out' });
      welcomeShown = true;
    }
    function onFirstScroll() {
      if (welcomeRef.current) {
        gsap.to(welcomeRef.current, { opacity: 0, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
      }
      window.removeEventListener('scroll', onFirstScroll);
    }
    if (welcomeShown) window.addEventListener('scroll', onFirstScroll, { passive: true });

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
      window.removeEventListener('scroll', onFirstScroll);
      st.kill();
      tl.kill();
    };
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
    projectsGlimpseRef,
    welcomeRef,
    lookAtRef,
    onReady,
    colors,
  ]);

  return null;
}
