import { useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Dev-only. Prints live camera position/rotation/fov so exact framings can
 * be read off and pasted into src/scenes/timeline.ts. Camera is fully
 * driven by IntroTimeline/ScrollTimeline now (no more OrbitControls fighting
 * for it), so this just reads the camera directly — `getTarget` is an
 * optional accessor into whichever timeline currently owns the look-at
 * point, purely for display. Never mounted outside import.meta.env.DEV —
 * see Scene.tsx.
 */
export function DevCameraOverlay({
  domRef,
  getTarget,
}: {
  domRef: RefObject<HTMLPreElement | null>;
  getTarget?: () => THREE.Vector3 | { x: number; y: number; z: number } | null;
}) {
  const { camera } = useThree();
  const frame = useRef(0);

  useFrame(() => {
    frame.current += 1;
    if (frame.current % 6 !== 0) return;
    if (!domRef.current) return;

    const p = camera.position;
    const r = camera.rotation;
    const target = getTarget?.();

    domRef.current.textContent = [
      `position: [${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}]`,
      `rotation: [${r.x.toFixed(2)}, ${r.y.toFixed(2)}, ${r.z.toFixed(2)}]`,
      `fov:      ${'fov' in camera ? camera.fov.toFixed(1) : '—'}`,
      target
        ? `target:   [${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)}]`
        : '',
    ].join('\n');
  });

  return null;
}
