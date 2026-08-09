import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FADE_IN_CAMERA } from './timeline';

/**
 * "Make the character clickable, I can press and hold to rotate it, and if
 * I scrolled he turns into the desired starting position at first then
 * start the scene." Press-and-drag orbit around the character, active only
 * before the visitor has scrolled at all. The instant they scroll,
 * dragging is disabled and HeroTimeline's own scroll-driven tweens take
 * over from wherever the timeline says the camera should be — since that's
 * still effectively progress ~0, it reads as snapping back to the starting
 * framing before the sequence begins.
 */
export function PreScrollOrbit() {
  const { camera, gl } = useThree();
  const activeRef = useRef(true);

  useEffect(() => {
    const dom = gl.domElement;
    const target = new THREE.Vector3(...FADE_IN_CAMERA.target);
    const spherical = new THREE.Spherical().setFromVector3(
      new THREE.Vector3(...FADE_IN_CAMERA.position).sub(target),
    );

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    function apply() {
      const offset = new THREE.Vector3().setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
    }

    function onPointerDown(e: PointerEvent) {
      if (!activeRef.current) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = 'grabbing';
    }

    function onPointerMove(e: PointerEvent) {
      if (!activeRef.current || !dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      spherical.theta -= dx * 0.006;
      spherical.phi = Math.min(Math.max(spherical.phi - dy * 0.006, 0.25), Math.PI - 0.25);
      apply();
    }

    function onPointerUp(e: PointerEvent) {
      dragging = false;
      dom.style.cursor = activeRef.current ? 'grab' : 'default';
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        // capture may already be released — harmless
      }
    }

    function onScroll() {
      if (window.scrollY > 0) {
        activeRef.current = false;
        dragging = false;
        dom.style.cursor = 'default';
        window.removeEventListener('scroll', onScroll);
      }
    }

    dom.style.cursor = 'grab';
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      dom.style.cursor = 'default';
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, [camera, gl]);

  return null;
}
