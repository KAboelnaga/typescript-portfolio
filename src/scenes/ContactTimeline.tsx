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

gsap.registerPlugin(ScrollTrigger);

const isDev = import.meta.env.DEV;

type EmissiveMaterial = THREE.Material & { emissiveIntensity?: number };

function vec([x, y, z]: [number, number, number]) {
  return { x, y, z };
}

// How far the character's head tracks the cursor once settled, in radians
// either side of dead-center — "I want his face only to be moving," now
// that Character.tsx exposes a real headPivot isolated from the rest of
// the upper body (see Character.tsx's onHeadReady). Raised from 0.22 —
// "make it follow the cursor more."
const CURSOR_FOLLOW_RANGE = 0.42;
// "If I'm above him he is kinda limited" — looking up reads as more
// physically awkward than looking down for this model, so the upward
// half of the pitch range is clamped tighter than the downward half
// instead of using the same range both ways.
const CURSOR_FOLLOW_UP_LIMIT = 0.14;
// "Enhance the movement of the object at the end, make it rotate not
// translate, but make it limited and return to the same spot" — the
// 2026-08-09 (7) translate-with-spring-back version undid the original
// free-rotate drag; this brings rotation back but folds in what
// translate had that the *original* rotate never did: a limited range
// and a spring back to the settled orientation on release, rather than
// persisting and accumulating across drags. Sensitivity converts drag
// pixels to radians; range clamps how far either axis can turn from
// the settled `sceneYaw`/0 pitch ("limited").
const DRAG_SENSITIVITY = 0.006;
const DRAG_YAW_RANGE = 0.5;
const DRAG_PITCH_RANGE = 0.35;
const SPRING_BACK_DURATION = 0.7;

interface Props {
  pinRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<HTMLDivElement | null>;
  upperBody: THREE.Group | null;
  // Whole loaded model (desk + monitor + character) — press-and-drag
  // rotates it a limited amount and springs back to its settled
  // orientation on release (see DRAG_YAW_RANGE/DRAG_PITCH_RANGE).
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
    // wherever his world position actually is. "Move the character to the
    // middle, a little higher" (2026-08-10) — was offset toward camera up
    // +left (lower-right framing); target now sits slightly *below and
    // right* of his center instead, which — since a look-at target below
    // the subject renders the subject higher in frame, and vice versa for
    // horizontal — puts him centered horizontally and a little above
    // center vertically. Tuned by rendering the settled frame and reading
    // his projected screen position back via the camera's own matrices
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
      .add(camRight.clone().multiplyScalar(-0.05));

    // How far to turn the whole model so the character (and desk) end up
    // facing the actual end camera position — "complete the turn until he
    // is facing me, not the text." The hand-tuned CONTACT_SCENE_YAW was
    // reused from when it only rotated the character to face roughly
    // toward the text; computed from real geometry instead, same approach
    // already used for monitor_screen's target and the original Contact
    // framing (see DONE.md): forwardAngle is the character's actual
    // monitor-facing direction before any rotation, desiredAngle is the
    // direction from him to where the camera ends up, and the signed
    // difference between them is exactly the yaw needed to align one to
    // the other. Falls back to CONTACT_SCENE_YAW if monitor_screen can't
    // be found.
    let sceneYaw = CONTACT_SCENE_YAW;
    const monitorScreen = sceneRoot?.getObjectByName('monitor_screen') as THREE.Mesh | undefined;
    if (monitorScreen) {
      const monitorCenter = new THREE.Box3().setFromObject(monitorScreen).getCenter(new THREE.Vector3());
      const angleOf = (x: number, z: number) => Math.atan2(x, z);
      const forwardAngle = angleOf(monitorCenter.x - charCenter.x, monitorCenter.z - charCenter.z);
      const desiredAngle = angleOf(endPosition.x - charCenter.x, endPosition.z - charCenter.z);
      const twoPi = Math.PI * 2;
      sceneYaw = ((desiredAngle - forwardAngle + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
      if (isDev) console.log('[contact] computed sceneYaw:', sceneYaw, 'vs. fallback', CONTACT_SCENE_YAW);
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

    // Interactive once fully settled. Two independent things, on two
    // different nodes so they don't fight each other:
    // - Press-and-drag rotates the *whole object* (sceneRoot — desk,
    //   monitor, and character together) a limited amount around its
    //   settled orientation (yaw from horizontal drag, pitch from
    //   vertical, each independently clamped) and springs back to exactly
    //   that settled orientation the instant the mouse releases.
    // - When not dragging, only the isolated headPivot (see Character.tsx)
    //   subtly turns toward the cursor — "his face only to be moving," not
    //   the whole body.
    const dom = gl.domElement;
    let dragging = false;
    let startClientX = 0;
    let startClientY = 0;
    let baseYaw = sceneYaw;
    const basePitch = 0;

    function settled() {
      return st.progress >= 1;
    }

    function onPointerDown(e: PointerEvent) {
      if (!settled() || !sceneRoot) return;
      dragging = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
      // Read back the *current* resting yaw rather than assuming it's
      // still `sceneYaw` — a still-finishing spring-back tween from a
      // previous drag could otherwise get clobbered mid-flight.
      baseYaw = sceneRoot.rotation.y;
      gsap.killTweensOf(sceneRoot.rotation);
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = 'grabbing';
    }
    function onPointerMoveDrag(e: PointerEvent) {
      if (!dragging || !sceneRoot) return;
      const dYaw = (e.clientX - startClientX) * DRAG_SENSITIVITY;
      const dPitch = (e.clientY - startClientY) * DRAG_SENSITIVITY;
      const yawOffset = Math.min(Math.max(dYaw, -DRAG_YAW_RANGE), DRAG_YAW_RANGE);
      const pitchOffset = Math.min(Math.max(dPitch, -DRAG_PITCH_RANGE), DRAG_PITCH_RANGE);
      sceneRoot.rotation.y = baseYaw + yawOffset;
      sceneRoot.rotation.x = basePitch + pitchOffset;
    }
    function onPointerUp(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      dom.style.cursor = settled() ? 'grab' : 'default';
      if (sceneRoot) {
        gsap.to(sceneRoot.rotation, {
          y: baseYaw,
          x: basePitch,
          duration: SPRING_BACK_DURATION,
          ease: 'elastic.out(1, 0.5)',
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
      st.kill();
      tl.kill();
    };
  }, [heroReady, upperBody, sceneRoot, head, camera, gl, pinRef, overlayRef, textRef]);

  return null;
}
