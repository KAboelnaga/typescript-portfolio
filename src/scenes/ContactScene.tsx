import { Suspense, useState, type RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Character } from './Character';
import { SceneLighting } from './SceneLighting';
import { ContactTimeline } from './ContactTimeline';
import { useTheme } from '../theme/ThemeContext';
import { CONTACT_START_CAMERA } from './timeline';

interface ContactSceneProps {
  pinRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<HTMLDivElement | null>;
}

/**
 * Own independent <Canvas> from Hero's — re-mounting Character here reuses
 * the cached model (no second network fetch) but gets its own cloned scene
 * graph, so the two canvases don't fight over the same Object3D instances.
 * There's already a natural scene-cut via the Projects section in between,
 * so losing pose continuity from where Hero's sequence left off is fine —
 * this isn't meant to read as the same continuous shot.
 */
export function ContactScene({ pinRef, overlayRef, textRef }: ContactSceneProps) {
  const [upperBody, setUpperBody] = useState<THREE.Group | null>(null);
  const [sceneRoot, setSceneRoot] = useState<THREE.Group | null>(null);
  const [head, setHead] = useState<THREE.Group | null>(null);
  const { colors } = useTheme();

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: CONTACT_START_CAMERA.position, fov: CONTACT_START_CAMERA.fov }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[colors.void]} />
        <fog attach="fog" args={[colors.void, 6, 18]} />
        <SceneLighting />
        <Suspense fallback={null}>
          <Character onReady={setUpperBody} onSceneReady={setSceneRoot} onHeadReady={setHead} />
        </Suspense>
        <ContactTimeline
          pinRef={pinRef}
          overlayRef={overlayRef}
          textRef={textRef}
          upperBody={upperBody}
          sceneRoot={sceneRoot}
          head={head}
        />
      </Canvas>

      <div ref={overlayRef} className="pointer-events-none absolute inset-0 bg-void opacity-0" />
    </div>
  );
}
