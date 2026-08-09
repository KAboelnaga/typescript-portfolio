import { color } from '../theme/tokens';

/**
 * The desk lamp is the key light — same `lamp` constant the DOM accent uses,
 * so the scene and the page can never drift apart (SPEC.md section 3).
 * Intensities are placeholders; tune once the model is actually on screen.
 */
export function SceneLighting() {
  return (
    <>
      <ambientLight color={color.base} intensity={0.5} />
      <pointLight
        position={[-1.1, 1.7, 0.9]}
        color={color.lamp}
        intensity={9}
        distance={6}
        decay={2}
      />
      <pointLight
        position={[0.2, 1.2, -1.6]}
        color={color.lampGlow}
        intensity={3}
        distance={5}
        decay={2}
      />
    </>
  );
}
