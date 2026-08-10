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
 * that didn't go anywhere.
 */
function Bulb({ lit, dragRef }: { lit: boolean; dragRef: React.RefObject<number> }) {
  const { scene: cachedScene } = useGLTF(MODEL_PATH);
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene]);
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<EmissiveMaterial[]>([]);
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

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += IDLE_SPIN_SPEED * delta + dragRef.current;
      dragRef.current = 0;
    }
    const target = lit ? 2.2 : 0.1;
    for (const mat of materialsRef.current) {
      mat.emissiveIntensity = (mat.emissiveIntensity ?? 0.1) + (target - (mat.emissiveIntensity ?? 0.1)) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export function ThemeLightbulb() {
  const { mode, toggle } = useTheme();
  const lit = mode === 'light';
  // A per-frame "add this much extra rotation" accumulator rather than
  // React state — written by native pointer handlers (every mousemove
  // during a drag, easily 60+/sec), read once per rendered frame inside
  // Bulb's useFrame and reset to 0 immediately after.
  const dragRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    movedRef.current = 0;
    lastXRef.current = e.clientX;
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    movedRef.current += Math.abs(dx);
    dragRef.current += dx * DRAG_SENSITIVITY;
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
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label={lit ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={lit}
      // top-20 on mobile, same reasoning as SkipIntro's own top-20 — the
      // Navbar pill spans nearly the full viewport at narrow widths and
      // was landing right under this button (only ~3px clear at top-4).
      // "Make the bulb bigger... apply a shadow effect so it appears like
      // a 3D object" — sized up from h-12/w-12, and a grounded drop shadow
      // (darker + tighter than the ambient border) reads as the object
      // sitting slightly off the page rather than flat on it. The shadow
      // warms toward the lamp color when lit, like the bulb is casting its
      // own glow rather than just a static prop shadow.
      className={`fixed right-4 top-20 z-50 h-16 w-16 cursor-grab touch-none overflow-hidden rounded-full border border-surf-3 bg-void/70 backdrop-blur transition-[border-color,box-shadow] duration-500 hover:border-signal focus-visible:outline-none active:cursor-grabbing sm:right-6 sm:top-5 sm:h-[4.5rem] sm:w-[4.5rem] ${
        lit
          ? 'shadow-[0_10px_28px_-6px_rgba(0,0,0,0.55),0_0_22px_-4px_rgba(217,154,69,0.55)]'
          : 'shadow-[0_10px_28px_-6px_rgba(0,0,0,0.65)]'
      }`}
    >
      <Canvas camera={{ fov: 38 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[1, 1.2, 2]} intensity={1.4} />
        <pointLight position={[-1.2, -0.6, 1.4]} intensity={0.35} color="#7fb3ff" />
        <Bulb lit={lit} dragRef={dragRef} />
      </Canvas>
    </button>
  );
}
