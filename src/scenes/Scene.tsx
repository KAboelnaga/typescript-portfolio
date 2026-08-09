import { Suspense, useCallback, useRef, useState, type RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Character } from './Character';
import { SceneLighting } from './SceneLighting';
import { DevCameraOverlay } from './DevCameraOverlay';
import { HeroTimeline } from './HeroTimeline';
import { PreScrollOrbit } from './PreScrollOrbit';
import { useTheme } from '../theme/ThemeContext';
import { FADE_IN_CAMERA } from './timeline';

const isDev = import.meta.env.DEV;

interface SceneProps {
  pinRef: RefObject<HTMLDivElement | null>;
  nameRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLParagraphElement | null>;
  aboutMeRef: RefObject<HTMLDivElement | null>;
  codeWordsRef: RefObject<HTMLDivElement | null>;
  projectsGlimpseRef: RefObject<HTMLDivElement | null>;
  welcomeRef: RefObject<HTMLDivElement | null>;
}

export function Scene({
  pinRef,
  nameRef,
  titleRef,
  aboutMeRef,
  codeWordsRef,
  projectsGlimpseRef,
  welcomeRef,
}: SceneProps) {
  const [upperBody, setUpperBody] = useState<THREE.Group | null>(null);
  const [sceneRoot, setSceneRoot] = useState<THREE.Group | null>(null);
  const [ready, setReady] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLPreElement>(null);
  // Written by HeroTimeline once it owns the camera's look-at target —
  // purely for the dev readout.
  const lookAtRef = useRef<{ x: number; y: number; z: number } | null>(null);
  // Reactive — background/fog re-render on toggle. See ThemeLightbulb.tsx.
  const { colors } = useTheme();

  // Stable identity is load-bearing here, not just tidiness: this is in
  // HeroTimeline's effect dependency array. An inline arrow function would
  // get a new identity every time Scene re-renders — including the render
  // this very callback triggers — which would re-run that effect right
  // after it creates the ScrollTrigger, killing it immediately (the
  // `createdRef` guard then blocks recreation, leaving no pin at all).
  const handleReady = useCallback(() => setReady(true), []);

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: FADE_IN_CAMERA.position, fov: FADE_IN_CAMERA.fov }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[colors.void]} />
        <fog attach="fog" args={[colors.void, 6, 16]} />
        <SceneLighting />
        <Suspense fallback={null}>
          <Character onReady={setUpperBody} onSceneReady={setSceneRoot} />
        </Suspense>
        <PreScrollOrbit />
        <HeroTimeline
          upperBody={upperBody}
          sceneRoot={sceneRoot}
          pinRef={pinRef}
          overlayRef={overlayRef}
          nameRef={nameRef}
          titleRef={titleRef}
          aboutMeRef={aboutMeRef}
          codeWordsRef={codeWordsRef}
          projectsGlimpseRef={projectsGlimpseRef}
          welcomeRef={welcomeRef}
          lookAtRef={lookAtRef}
          onReady={handleReady}
        />
        {isDev && ready && <DevCameraOverlay domRef={readoutRef} getTarget={() => lookAtRef.current} />}
      </Canvas>

      <div ref={overlayRef} className="pointer-events-none absolute inset-0 bg-void opacity-0" />

      {isDev && ready && (
        <pre
          ref={readoutRef}
          className="pointer-events-none absolute bottom-4 left-4 z-10 whitespace-pre rounded border border-surf-3 bg-surf-1/90 px-3 py-2 font-mono text-xs text-text-mid"
        />
      )}
    </div>
  );
}
