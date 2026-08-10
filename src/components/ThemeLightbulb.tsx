import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../theme/ThemeContext';

const MODEL_PATH = '/models/light-bulb.glb';
useGLTF.preload(MODEL_PATH);

const IDLE_SPIN_SPEED = 0.25; // rad/s
const DRAG_SENSITIVITY = 0.012;
const CLICK_MOVE_THRESHOLD = 5; // px — below this, a pointerup counts as a click, not a drag

// "Make it feel like it's 3D, it's there but standing like a regular
// button." A spinning glTF in a flat circular chip still reads as an icon
// rather than an object, since nothing about it responds to the viewer —
// a real object in space looks different depending on where you're looking
// at it from. Hovering now tilts it on two axes toward the pointer (the
// same "3D card tilt" cue used all over modern web design specifically to
// sell depth) independent of the constant Y-axis spin. Tuned by feel, not
// measured — this one's a "does it feel right," not a geometry problem.
// (Originally also had a small idle vertical bob alongside the tilt —
// "stop the Y-axis movement of the bulb," removed 2026-08-10.)
const TILT_MAX = 0.48; // rad, either axis
const TILT_EASE = 0.14; // per-frame damping toward the target tilt

// "glass" and "tungsten" (see models-source/light-bulb.glb's own material
// names) are the only two materials with an emissiveFactor baked in —
// everything else (brass, insulator, wire) is structural and untouched.
const EMISSIVE_MATERIAL_NAMES = new Set(['glass', 'tungsten']);

type EmissiveMaterial = THREE.Material & { emissiveIntensity?: number };

/**
 * "I have attached a 3d light bulb in models-source, use it in navbar and
 * make it rotating and clickable and draggable maybe." Real geometry (no
 * procedural placeholder) — walks the loaded scene for the `glass`/
 * `tungsten` materials and drives their `emissiveIntensity` toward on/off
 * depending on theme, same `KHR_materials_emissive_strength` technique
 * `HeroTimeline.tsx` uses for the monitor screen. Spins continuously on
 * its own; press-and-drag adds a manual offset on top (same "offset
 * layered on top of a base" pattern as `ContactTimeline.tsx`'s drag), and
 * a plain click (drag distance under `CLICK_MOVE_THRESHOLD`) still
 * toggles the theme — the two don't fight because a click is just a drag
 * that didn't go anywhere. `tiltRef` (pointer-relative hover position, set
 * by the parent) adds the "this is a physical object" depth cue — see the
 * module doc comment above.
 */
function Bulb({
  lit,
  dragRef,
  tiltRef,
}: {
  lit: boolean;
  dragRef: React.RefObject<number>;
  tiltRef: React.RefObject<{ x: number; y: number }>;
}) {
  const { scene: cachedScene } = useGLTF(MODEL_PATH);
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene]);
  const groupRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<EmissiveMaterial[]>([]);
  const currentTiltRef = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    camera.position.set(0, 0, maxDim * 2.4);
    camera.lookAt(0, 0, 0);
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }

    const mats: EmissiveMaterial[] = [];
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as EmissiveMaterial | EmissiveMaterial[];
      const list = Array.isArray(mat) ? mat : [mat];
      for (const m of list) {
        if (EMISSIVE_MATERIAL_NAMES.has(m.name)) {
          m.emissiveIntensity = 0.1;
          mats.push(m);
        }
      }
    });
    materialsRef.current = mats;
  }, [scene, camera]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += IDLE_SPIN_SPEED * delta + dragRef.current;
      dragRef.current = 0;
    }
    if (tiltGroupRef.current) {
      const target = tiltRef.current;
      const cur = currentTiltRef.current;
      cur.x += (target.y * TILT_MAX - cur.x) * TILT_EASE;
      cur.y += (-target.x * TILT_MAX - cur.y) * TILT_EASE;
      tiltGroupRef.current.rotation.x = cur.x;
      tiltGroupRef.current.rotation.z = cur.y;
    }
    const target = lit ? 2.2 : 0.1;
    for (const mat of materialsRef.current) {
      mat.emissiveIntensity = (mat.emissiveIntensity ?? 0.1) + (target - (mat.emissiveIntensity ?? 0.1)) * 0.12;
    }
  });

  return (
    <group ref={tiltGroupRef}>
      <group ref={groupRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export function ThemeLightbulb() {
  const { mode, toggle } = useTheme();
  const lit = mode === 'light';
  const dragRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(0);
  const tiltRef = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    movedRef.current = 0;
    lastXRef.current = e.clientX;
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  // Shifts the button's own drop shadow opposite the tilt, as if a fixed
  // light source above the page is casting it — the same depth cue real
  // physical objects give for free just by existing in space. Applied
  // directly to the DOM (bypassing React state) since it only needs to
  // track pointer events, not drive a render; the existing `duration-300`
  // CSS transition on `box-shadow` still eases it smoothly.
  function applyShadow(tiltX: number, tiltY: number) {
    const el = buttonRef.current;
    if (!el) return;
    const offsetX = -tiltX * 16;
    const offsetY = 10 + tiltY * 8;
    const base = `${offsetX}px ${offsetY}px 28px -6px rgba(0,0,0,${lit ? 0.55 : 0.65})`;
    const glow = lit ? `, ${offsetX * 0.7}px ${4 + tiltY * 6}px 22px -4px rgba(217,154,69,0.55)` : '';
    el.style.boxShadow = base + glow;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (draggingRef.current) {
      const dx = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      movedRef.current += Math.abs(dx);
      dragRef.current += dx * DRAG_SENSITIVITY;
      return;
    }
    // Hover tilt target, normalized to -1..1 across the button's own
    // bounds — independent of the drag offset above, and reset on
    // pointer-leave so it eases back to resting flat instead of getting
    // stuck mid-tilt.
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    tiltRef.current = { x, y };
    applyShadow(x, y);
  }
  function onPointerLeave() {
    tiltRef.current = { x: 0, y: 0 };
    applyShadow(0, 0);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // capture may already be released — harmless
    }
    if (movedRef.current < CLICK_MOVE_THRESHOLD) toggle();
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerUp}
      aria-label={lit ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={lit}
      // "Increase its size a bit" (2026-08-10) — h-16/w-16 -> h-20/w-20
      // (mobile), sm:4.5rem -> sm:5.25rem.
      className={`fixed right-4 top-20 z-50 h-20 w-20 cursor-grab touch-none overflow-hidden rounded-full border border-surf-3 bg-void/70 backdrop-blur [transition:border-color_0.5s,box-shadow_0.25s] hover:border-signal focus-visible:outline-none active:cursor-grabbing sm:right-6 sm:top-5 sm:h-[5.25rem] sm:w-[5.25rem] ${
        lit
          ? 'shadow-[0_10px_28px_-6px_rgba(0,0,0,0.55),0_0_22px_-4px_rgba(217,154,69,0.55)]'
          : 'shadow-[0_10px_28px_-6px_rgba(0,0,0,0.65)]'
      }`}
    >
      <Canvas camera={{ fov: 38 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[1, 1.2, 2]} intensity={1.4} />
        <pointLight position={[-1.2, -0.6, 1.4]} intensity={0.35} color="#7fb3ff" />
        <Bulb lit={lit} dragRef={dragRef} tiltRef={tiltRef} />
      </Canvas>
    </button>
  );
}
