import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../theme/ThemeContext';

/**
 * "I want to add a 3D light bulb that switches the mode of the website
 * from dark to light mode." A real (procedural, no GLTF asset needed)
 * bulb in its own tiny Canvas — lit/glowing in light mode ("the light is
 * on"), dim in dark mode. Deliberately small and cheap: two primitives, no
 * shadows, no extra lights beyond what's needed to read the shape.
 */
function Bulb({ lit }: { lit: boolean }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const mat = materialRef.current;
    if (!mat) return;
    const target = lit ? 1.6 : 0.06;
    mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.12;
  });

  return (
    <group>
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#D99A45"
          emissive="#D99A45"
          emissiveIntensity={0.06}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.24, 16]} />
        <meshStandardMaterial color="#4A4740" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
}

export function ThemeLightbulb() {
  const { mode, toggle } = useTheme();
  const lit = mode === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lit ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={lit}
      className="fixed right-4 top-4 z-50 h-12 w-12 overflow-hidden rounded-full border border-surf-3 bg-void/70 backdrop-blur transition-colors duration-300 hover:border-signal focus-visible:outline-none sm:right-6 sm:top-5"
    >
      <Canvas camera={{ position: [0, 0, 1.7], fov: 38 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[1, 1.2, 2]} intensity={1.4} />
        <Bulb lit={lit} />
      </Canvas>
    </button>
  );
}
