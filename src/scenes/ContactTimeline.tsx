import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import {
  CONTACT_SCROLL_PIN_VH,
  CONTACT_BEATS,
  CONTACT_START_CAMERA,
  CONTACT_END_CAMERA,
  CONTACT_SCENE_YAW,
  MONITOR_EMISSIVE_START,
  MONITOR_EMISSIVE_END,
  SCRUB,
} from './timeline';
import { onHeroReady } from './heroReady';
import { markContactReady } from './contactReady';

gsap.registerPlugin(ScrollTrigger);

const isDev = import.meta.env.DEV;

type EmissiveMaterial = THREE.Material & { emissiveIntensity?: number };

function vec([x, y, z]: [number, number, number]) {
  return { x, y, z };
}

// How far the character's head tracks the cursor once settled, in radians
// either side of dead-center — "I want his face only to be moving," now
// that Character.tsx exposes a real headPivot isolated from the rest of
// the upper body (see Character.tsx's onHeadReady). Raised twice now:
// 0.22 -> 0.42 ("make it follow the cursor more") -> 0.58 (2026-08-10,
// "I want also the cursor follow to be more for the character").
const CURSOR_FOLLOW_RANGE = 0.58;
// "If I'm above him he is kinda limited" — looking up reads as more
// physically awkward than looking down for this model, so the upward
// half of the pitch range is clamped tighter than the downward half
// instead of using the same range both ways. Scaled up with
// CURSOR_FOLLOW_RANGE, same ratio as before, so "more" doesn't also mean
// "more awkward looking up."
const CURSOR_FOLLOW_UP_LIMIT = 0.19;
// "Enhance the movement of the object at the end, make it rotate not
// translate, but make it limited and return to the same spot" — the
// 2026-08-09 (7) translate-with-spring-back version undid the original
// free-rotate drag; this brings rotation back but folds in what
// translate had that the *original* rotate never did: a limited range
// and a spring back to the settled orientation on release, rather than
// persisting and accumulating across drags. Sensitivity converts drag
// pixels to radians; range clamps how far yaw can turn from the settled
// `sceneYaw` ("limited"). Duration raised (0.7 -> 0.9) alongside the
// 2026-08-10 ease change below — "a smoother animation of the release."
// Range roughly tripled (0.5 -> 1.5 rad, ~29° -> ~86°) — "increase the
// range of him rotating a lot." Pitch was dropped once (used to be
// derived from the *same* diagonal drag vector as yaw, which spun the
// object around a tilted, off-vertical composite axis instead of a clean
// turn) then brought back 2026-08-11 ("I want all direction rotation").
// Bringing it back the *first* time by setting `.rotation.x`/`.rotation.y`
// directly (Euler) turned out to have the same root problem in a subtler
// form: `sceneYaw` alone is already up to ~210°, and Euler axes aren't
// independent once one of them is that large — composing a further
// `.rotation.x` on top skews which way "pitch" actually points, which is
// exactly the "it moves in a weird way with an angle... shifted" bug
// reported right after. Fixed for real in `onPointerMoveDrag` below by
// composing yaw and pitch as quaternions built from fixed *world* axes
// instead — pitch is always a true world-space nod applied after yaw, so
// it reads the same regardless of how far the object has already turned.
// Pitch range kept tighter than yaw's — tipping the whole desk+character
// group too far reads as broken in a way turning it doesn't.
const DRAG_SENSITIVITY = 0.006;
const DRAG_YAW_RANGE = 1.5;
const DRAG_PITCH_RANGE = 0.5;
const SPRING_BACK_DURATION = 0.9;
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const WORLD_RIGHT = new THREE.Vector3(1, 0, 0);

interface Props {
  pinRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<HTMLDivElement | null>;
  upperBody: THREE.Group | null;
  // Whole loaded model (desk + monitor + character) — press-and-drag
  // rotates it (yaw only) a limited amount and springs back to its
  // settled orientation on release (see DRAG_YAW_RANGE).
  sceneRoot: THREE.Group | null;
  // Isolated head-only pivot for cursor-follow — see CURSOR_FOLLOW_RANGE.
  head: THREE.Group | null;
}

/**
 * "Zooming out of the screen" into the Contact section, per Kareem: we
 * entered the monitor in the Hero sequence, saw the projects, and now we're
 * backing back out of it into the contact page. Own short pinned sequence,
 * own <Canvas> (see ContactScene.tsx). Starts black (as if still behind the
 * screen), fades out, camera pulls back to a wide shot with the character
 * ending in the lower right — the whole loaded model (desk + character
 * together, see CONTACT_SCENE_YAW) turns to face the camera/visitor with a
 * slight angle, not dead-on. Once fully settled, the scene is interactive:
 * press-and-drag rotates the whole object freely, and — when not being
 * dragged — just the character's head subtly follows the cursor. Pin
 * creation waits on `onHeroReady` (see heroReady.ts) so its first-ever
 * trigger measurement lands on the correct, final page layout instead of a
 * too-short one.
 */
export function ContactTimeline({ pinRef, overlayRef, textRef, upperBody, sceneRoot, head }: Props) {
  const { camera, gl } = useThree();
  const preparedRef = useRef(false);
  const createdRef = useRef(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => onHeroReady(() => setHeroReady(true)), []);

  useLayoutEffect(() => {
    if (preparedRef.current) return;
    preparedRef.current = true;

    camera.position.set(...CONTACT_START_CAMERA.position);
    camera.lookAt(...CONTACT_START_CAMERA.target);
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = CONTACT_START_CAMERA.fov;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }

    if (overlayRef.current) gsap.set(overlayRef.current, { opacity: 1 });
    if (textRef.current) gsap.set(textRef.current, { opacity: 0, y: 24 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!heroReady || !upperBody || createdRef.current) return;
    if (!pinRef.current || !overlayRef.current || !textRef.current) return;
    createdRef.current = true;

    // Compute the end framing from the character's actual world position
    // rather than a hand-guessed target. Camera sits at a wide offset from
    // his real center; the look-at target is offset from his center in the
    // camera's own local right/up axes so the framing holds regardless of
    // wherever his world position actually is. "The character to go the
    // right more" — pushed twice now (2026-08-10): centered
    // (`camRight * -0.05`) → `-0.4` → `-0.65`. A larger magnitude here
    // shifts the look-at target further left of his center, which puts
    // *him* further right in frame (target left ⇒ subject right).
    // `camUp * -0.25` (unchanged) keeps him a little above center
    // vertically. Tuned by rendering the settled frame and reading his
    // projected screen position back via the camera's own matrices
    // (`window.__contactCamera`), not eyeballed from a screenshot alone.
    const box = new THREE.Box3().setFromObject(upperBody);
    const charCenter = box.getCenter(new THREE.Vector3());
    const endPosition = charCenter.clone().add(new THREE.Vector3(2.6, 0.85, 2.1));
    const viewDir = charCenter.clone().sub(endPosition).normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const camRight = new THREE.Vector3().crossVectors(viewDir, worldUp).normalize();
    const camUp = new THREE.Vector3().crossVectors(camRight, viewDir).normalize();
    const endTarget = charCenter
      .clone()
      .add(camUp.clone().multiplyScalar(-0.25))
      .add(camRight.clone().multiplyScalar(-0.65));

    // How far to turn the whole model. Was 180° ("90 more degrees in the
    // direction you rotated it"), Kareem: "maybe rotate 30 more degrees" —
    // same direction again, landing at 210° total. forwardAngle is his
    // actual monitor-facing direction before any rotation, desiredAngle is
    // the direction from him to where the camera ends up; `fullYaw`'s sign
    // picks the turn direction (derived from real geometry rather than
    // guessed — guessing by hand once turned out wrong, dead-on *away*
    // from camera), negated per an earlier round since Kareem wanted the
    // opposite of what that geometry picks. Falls back to CONTACT_SCENE_YAW
    // if monitor_screen can't be found.
    const CONTACT_END_YAW = (7 * Math.PI) / 6;
    let sceneYaw = CONTACT_SCENE_YAW;
    const monitorScreen = sceneRoot?.getObjectByName('monitor_screen') as THREE.Mesh | undefined;
    if (monitorScreen) {
      const monitorCenter = new THREE.Box3().setFromObject(monitorScreen).getCenter(new THREE.Vector3());
      const angleOf = (x: number, z: number) => Math.atan2(x, z);
      const forwardAngle = angleOf(monitorCenter.x - charCenter.x, monitorCenter.z - charCenter.z);
      const desiredAngle = angleOf(endPosition.x - charCenter.x, endPosition.z - charCenter.z);
      const twoPi = Math.PI * 2;
      const fullYaw = ((desiredAngle - forwardAngle + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
      sceneYaw = -Math.sign(fullYaw) * CONTACT_END_YAW;
      if (isDev) console.log('[contact] computed sceneYaw:', sceneYaw, 'full turn-to-camera would have been', fullYaw);
    }

    // "Contact scene's monitor screen isn't lit up" — this canvas loads its
    // own separate model instance from Hero's (see DONE.md, two independent
    // <Canvas>es), so HeroTimeline's tween on *its* monitor_screen material
    // never touches this one — it was just sitting at the GLB's baked
    // default the whole time. Same `KHR_materials_emissive_strength`
    // technique as Hero, ramped up alongside the blackOut fade so the
    // screen visibly lights up as the scene becomes visible rather than
    // just appearing pre-lit.
    const rawMonitorMaterial = monitorScreen?.material;
    const monitorMaterial = (Array.isArray(rawMonitorMaterial) ? rawMonitorMaterial[0] : rawMonitorMaterial) as
      | EmissiveMaterial
      | undefined;
    if (monitorMaterial) monitorMaterial.emissiveIntensity = MONITOR_EMISSIVE_START;

    const lookAt = vec(CONTACT_START_CAMERA.target);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: () => {
        camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
        if ('fov' in camera) (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      },
    });

    const beat = (name: keyof typeof CONTACT_BEATS) => {
      const [start, end] = CONTACT_BEATS[name];
      return { start, duration: end - start };
    };

    const blackOut = beat('blackOut');
    tl.to(overlayRef.current, { opacity: 0, duration: blackOut.duration, ease: 'power1.out' }, blackOut.start);
    if (monitorMaterial) {
      tl.to(monitorMaterial, { emissiveIntensity: MONITOR_EMISSIVE_END, duration: blackOut.duration }, blackOut.start);
    }

    const settle = beat('cameraSettle');
    tl.to(camera.position, { x: endPosition.x, y: endPosition.y, z: endPosition.z, duration: settle.duration }, settle.start);
    tl.to(lookAt, { x: endTarget.x, y: endTarget.y, z: endTarget.z, duration: settle.duration }, settle.start);
    tl.to(camera, { fov: CONTACT_END_CAMERA.fov, duration: settle.duration }, settle.start);
    // Rotates the whole object (sceneRoot — desk + character together), not
    // just upperBody — "make the character looking at the desk [i.e. his
    // own local rotation stays 0] and rotate both... that both of them are
    // looking at me." Previously this tweened upperBody alone, which turned
    // the character to face the camera while the desk stayed put, facing
    // its original direction — the "character facing a side, desk on the
    // other side" bug.
    if (sceneRoot) {
      tl.to(
        sceneRoot.rotation,
        { y: sceneYaw, duration: settle.duration, ease: 'power1.out' },
        settle.start,
      );
    }

    const textIn = beat('textIn');
    tl.to(textRef.current, { opacity: 1, y: 0, duration: textIn.duration, ease: 'power1.out' }, textIn.start);

    const st = ScrollTrigger.create({
      trigger: pinRef.current,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (CONTACT_SCROLL_PIN_VH / 100),
      pin: true,
      scrub: SCRUB,
      animation: tl,
      invalidateOnRefresh: true,
    });

    // Tells anything after Contact in the document (right now, only
    // Footer.tsx) that it's now safe to measure its own scroll-trigger
    // position — see contactReady.ts for the bug this fixes.
    markContactReady();

    // Interactive once fully settled. Two independent things, on two
    // different nodes so they don't fight each other:
    // - Press-and-drag rotates the *whole object* (sceneRoot — desk,
    //   monitor, and character together) around its settled orientation,
    //   yaw *and* pitch (see `onPointerMoveDrag` below), and springs back
    //   to exactly that settled orientation the instant the mouse
    //   releases.
    // - When not dragging, only the isolated headPivot (see Character.tsx)
    //   subtly turns toward the cursor — "his face only to be moving," not
    //   the whole body.
    const dom = gl.domElement;
    let dragging = false;
    let startClientX = 0;
    let startClientY = 0;
    // The one resting orientation everything springs back to — fixed, not
    // reassigned per-drag. Yaw/pitch during a drag are tracked as *offsets*
    // from this (see `applyOffsets` below) rather than by reading the
    // object's live `.rotation`/`.quaternion` back — the composed
    // orientation doesn't decompose cleanly into "current yaw"/"current
    // pitch" once both are non-zero, so offsets are the only reliable
    // source of truth for where a new drag or spring-back should resume.
    const baseYaw = sceneYaw;
    let liveYawOffset = 0;
    let livePitchOffset = 0;
    let springTween: gsap.core.Tween | null = null;

    // Composes yaw and pitch as quaternions built from fixed *world* axes
    // — yaw applied first, pitch on top of it — rather than setting raw
    // `.rotation.x`/`.rotation.y` Euler values directly. `sceneYaw` alone
    // is already up to ~210°, and Euler axes aren't independent once one
    // of them is that large: setting `.rotation.x` on top of a big
    // `.rotation.y` skewed which way "pitch" actually pointed, which read
    // as the object moving "with an angle" and shifting sideways instead
    // of tilting in place. World-axis quaternions keep pitch a true
    // camera-facing nod no matter how far yaw has already turned.
    function applyOffsets(yawOffset: number, pitchOffset: number) {
      if (!sceneRoot) return;
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(WORLD_UP, baseYaw + yawOffset);
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(WORLD_RIGHT, pitchOffset);
      sceneRoot.quaternion.copy(pitchQuat.multiply(yawQuat));
    }

    // "The cursor follow shouldn't be after I reach [the end of the
    // scroll] — it should be after it [the object] reaches the desired
    // place." Was gated on `st.progress >= 1` — the *entire* pin scrolled
    // through, including the further textIn beat and the dead scroll left
    // after it — even though the object itself visually finishes turning
    // and settling much earlier, at the end of the cameraSettle beat.
    // Gate on that instead: interactive (drag, cursor-follow) as soon as
    // the settle animation itself completes, not once the visitor has
    // scrolled all the way to the end of the pin.
    const SETTLED_PROGRESS = CONTACT_BEATS.cameraSettle[1];
    function settled() {
      return st.progress >= SETTLED_PROGRESS;
    }

    function onPointerDown(e: PointerEvent) {
      if (!settled() || !sceneRoot) return;
      dragging = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
      // Cut off a still-finishing spring-back from a previous drag and
      // snap straight to the resting pose before this one starts, rather
      // than trying to resume from wherever the tween had gotten to — see
      // the `liveYawOffset`/`livePitchOffset` comment above for why that
      // can't be read back reliably once pitch is involved. The window
      // where this is even visible is tiny (re-grabbing mid-spring-back,
      // sub-second), and clean beats subtly wrong.
      springTween?.kill();
      springTween = null;
      liveYawOffset = 0;
      livePitchOffset = 0;
      applyOffsets(0, 0);
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = 'grabbing';
    }
    function onPointerMoveDrag(e: PointerEvent) {
      if (!dragging || !sceneRoot) return;
      // Yaw and pitch each read from their own drag axis (horizontal ->
      // yaw, vertical -> pitch) independently, rather than from one
      // combined drag vector — that's what keeps a diagonal drag turning
      // *and* tilting cleanly instead of spinning around a single tilted,
      // off-vertical composite axis.
      //
      // "I would like for him to rotate in the same direction I pull him
      // to" — verified empirically (Playwright + real drag gestures, not
      // guessed): dragging right turns his front toward the viewer's
      // right, dragging down tilts the top of the object toward the
      // viewer (same "pull it toward you" feel as the head's own
      // cursor-follow pitch below).
      const dYaw = (e.clientX - startClientX) * DRAG_SENSITIVITY;
      liveYawOffset = Math.min(Math.max(dYaw, -DRAG_YAW_RANGE), DRAG_YAW_RANGE);

      const dPitch = (e.clientY - startClientY) * DRAG_SENSITIVITY;
      livePitchOffset = Math.min(Math.max(dPitch, -DRAG_PITCH_RANGE), DRAG_PITCH_RANGE);

      applyOffsets(liveYawOffset, livePitchOffset);
    }
    function onPointerUp(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      dom.style.cursor = settled() ? 'grab' : 'default';
      if (sceneRoot) {
        // "Make him return back to his position on release" — unchanged
        // from before, still a single smooth deceleration straight back
        // to the settled orientation (now on both axes at once), no
        // bounce/overshoot. Tweens the offset scalars (through the same
        // `applyOffsets` the live drag uses), not `.rotation`/`.quaternion`
        // directly, so the two stay in perfect sync.
        const proxy = { yaw: liveYawOffset, pitch: livePitchOffset };
        springTween = gsap.to(proxy, {
          yaw: 0,
          pitch: 0,
          duration: SPRING_BACK_DURATION,
          ease: 'power3.out',
          onUpdate: () => applyOffsets(proxy.yaw, proxy.pitch),
        });
      }
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        // capture may already be released — harmless
      }
    }
    function onMouseMove(e: MouseEvent) {
      if (!settled() || dragging || !head) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      head.rotation.y = nx * CURSOR_FOLLOW_RANGE;
      // Negated — "the cursor follow in the y-axis for the head is
      // inverted." Moving the cursor toward the top of the screen (ny
      // negative) should pitch the head up, not down. Positive
      // rotation.x is "looking up" in this convention — clamped tighter
      // than looking down: "if I'm above him he is kinda limited."
      const pitch = -ny * CURSOR_FOLLOW_RANGE * 0.5;
      head.rotation.x = pitch > 0 ? Math.min(pitch, CURSOR_FOLLOW_UP_LIMIT) : pitch;
    }

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMoveDrag);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mousemove', onMouseMove);

    if (isDev) {
      Object.assign(window, {
        __contactTimeline: tl,
        __contactScrollTrigger: st,
        __contactCamera: camera,
        __contactSceneRoot: sceneRoot,
      });
    }

    return () => {
      createdRef.current = false;
      dom.style.cursor = 'default';
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMoveDrag);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mousemove', onMouseMove);
      springTween?.kill();
      st.kill();
      tl.kill();
    };
  }, [heroReady, upperBody, sceneRoot, head, camera, gl, pinRef, overlayRef, textRef]);

  return null;
}
