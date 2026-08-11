/**
 * Single home for all 3D timing and camera constants (SPEC.md section 9 —
 * "if a number appears in a component file, it's in the wrong place").
 *
 * Camera position/target values below are estimates — verified by rendering
 * each beat and screenshotting it, not just calculated blind, but still a
 * first pass. Treat them as a starting point to nudge using the dev console
 * hooks (see README), not as final numbers.
 */

interface CameraFraming {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// --- Hero sequence: intro turn -> entrance text -> About Me -> monitor ----
// entry -> code words -> a glimpse of the projects "on screen", all
// scroll-driven and pinned in one sequence.
//
// Total pinned scroll distance, in vh. SPEC.md's original ~250vh ceiling
// assumed a 3-beat sequence; this is deliberately much longer for a much
// longer story. Raised 560 -> 620 — "make the animations a bit slower so
// people can see the objects rotating, it's too fast now" — more physical
// scroll distance for the same visual motion, uniformly across every beat.
export const HERO_SCROLL_PIN_VH = 620;

// GSAP ScrollTrigger scrub smoothing, in seconds. Small on purpose — a
// bigger value (previously 1) adds real lag between scroll input and visual
// response, which on a long sequence like this reads as things happening
// "out of order" rather than just smoothed.
export const SCRUB = 0.35;

// Progress fractions (0-1) through the pinned Hero section. Overlapping
// ranges are intentional (e.g. entrance fading out while About Me fades in).
// introTurn -> introSettle is deliberately back-to-back with no gap — no
// static hold in between, continuous motion from the first frame to the
// settled framing.
// introTurn/introSettle and throughEyes/monitorApproach — the beats where
// something is visibly *rotating* — were widened relative to the static
// hold beats (entranceHold, aboutMeHold) rather than scaled uniformly:
// "make the animations a bit slower so people can see the objects
// rotating." Boundaries stay contiguous (each beat's end === the next
// beat's start) wherever they were before.
export const HERO_BEATS = {
  introFadeIn: [0.0, 0.03],
  introTurn: [0.03, 0.16],
  introSettle: [0.16, 0.26],
  nameIn: [0.26, 0.3],
  titleIn: [0.3, 0.34],
  entranceHold: [0.34, 0.36],
  entranceOut: [0.36, 0.39],
  aboutMeIn: [0.39, 0.44],
  aboutMeHold: [0.44, 0.52],
  aboutMeOut: [0.52, 0.55],
  // "First rotate and go through the character with the camera as if I'm
  // the character's own eyes, then zoom into the monitor and go rapidly
  // inside" — see THROUGH_EYES_CAMERA below.
  throughEyes: [0.55, 0.61],
  monitorApproach: [0.61, 0.68],
  monitorBlack: [0.68, 0.72],
  codeWords: [0.72, 0.84],
  // Camera holds perfectly still at the deep monitor framing through this
  // whole final beat — no zoom-out, no model rotation. Kareem: "remove it,
  // I don't want it, just a large 'projects that I have done' text to
  // appear then seeing my project." One big heading fades in, then the pin
  // releases straight into the real Projects section.
  projectsTextIn: [0.84, 1.0],
} as const satisfies Record<string, [number, number]>;

// FADE_IN: tight, behind and slightly above the head; character in the left third.
export const FADE_IN_CAMERA: CameraFraming = {
  position: [-0.25, 1.55, 1.15],
  target: [0.35, 1.3, -0.3],
  fov: 32,
};

// introTurn arrives here — medium-close three-quarter, shoulders + desk
// edge — then immediately continues into introSettle. No hold here anymore.
// Every axis (position and target, x/y/z) sits strictly between FADE_IN_CAMERA
// and SETTLE_CAMERA's values on purpose — Kareem: "the camera starts at an
// angle and goes like it over-steers and then rotates the other side, I
// want it to rotate in one direction." That wobble was position.y dipping
// (1.55 -> 1.4 -> 1.68) and target.z bumping (-0.3 -> -0.1 -> -0.35) instead
// of moving smoothly one way — a real geometric reversal, not just a feel.
// Keep every component monotonic between the two endpoints if this ever
// gets re-tuned.
export const TURN_END_CAMERA: CameraFraming = {
  position: [0.7, 1.6, 1.7],
  target: [0.2, 1.1, -0.32],
  fov: 34,
};

// SETTLE: pulled back. Camera holds here through the entrance-text and
// About Me beats too ("the same background stays"). Originally centered
// the character; Kareem later asked for the object to end on the right
// instead of dead center — `target` here is now just the fallback
// (position/fov are still used as-is). HeroTimeline.tsx computes the real
// target at runtime from the character's actual world position, offset
// toward camera-left so he renders on the right of frame wherever he
// actually sits, same real-geometry approach used for the monitor target
// and Contact's framing.
export const SETTLE_CAMERA: CameraFraming = {
  position: [1.55, 1.68, 2.6],
  target: [0.05, 0.88, -0.35],
  fov: 36,
};

// How far the character's upper body (see Character.tsx's UPPER_BODY_NODE_NAMES)
// turns toward camera during introTurn, in radians.
export const CHARACTER_TURN_YAW = 0;

// throughEyes ends right at the character's own eye position, looking
// toward the monitor — the real position/target are computed at runtime
// from the head node's world-space bounding box (see HeroTimeline.tsx);
// these are just the fallback used if that lookup ever fails. Sits roughly
// between SETTLE_CAMERA and MONITOR_ZOOM_CAMERA on every axis.
export const THROUGH_EYES_CAMERA: CameraFraming = {
  position: [0.5, 1.45, 0.35],
  target: [0.55, 1.0, -0.35],
  fov: 15,
};

// monitorApproach ends here — shifted left and pushed close enough that the
// screen fills the entire frame (no bezel/edges visible) right before
// black, so it reads as entering the screen rather than looking at it from
// outside. The target gets corrected at runtime to the monitor_screen
// mesh's actual world-space bounding-box center (see HeroTimeline.tsx) —
// this target value is just the fallback/estimate. Camera stops moving in
// 3D once monitorBlack starts; "entering the screen" beyond that point is a
// DOM/overlay illusion (black fade + flying code words), not literal camera
// movement through the mesh — avoids clipping artifacts.
export const MONITOR_ZOOM_CAMERA: CameraFraming = {
  position: [0.54, 0.99, -0.22],
  target: [0.56, 0.99, -0.40],
  fov: 5,
};

// KHR_materials_emissive_strength on the monitor_screen mesh — ramps up as
// the camera moves in.
export const MONITOR_EMISSIVE_START = 0.2;
export const MONITOR_EMISSIVE_END = 1.0;

// Snippets for the code-words flythrough (monitorBlack -> codeWords beats).
// CONTENT-LIVE.md (2026-08-11): "replace all 18 stock snippets with real
// lines from my own repos" — the previous list was generic placeholder
// code (a fake `orders` table from an e-commerce project not on this
// site, a `git commit -m "fix"` joke about sloppy practice), not
// something to leave in front of a hiring manager. Real single lines
// pulled from Pet_Society, pneumoxpert-2.0, and this portfolio's own
// source — reviewed for secrets/keys/client data before landing here (an
// earlier candidate list was shown for sign-off first, see DONE.md).
// Deliberately not sourced from Pet_Society's Chat/real-time-messaging
// code (a teammate's work, not Kareem's, per Work.tsx's own note) or from
// municipal-system/Django_Blog_Project (outside the repos CONTENT-LIVE.md
// named as fair game).
export const CODE_WORDS = [
  "category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source=\"category\", write_only=True)",
  "const { user, token } = response.data;",
  "return obj.author == request.user",
  "formData.append(\"image_data\", uploadedImage);",
  "if (!context) throw new Error('useAuth must be used within an AuthProvider');",
  "author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')",
  "tl.to(sceneRoot.rotation, { y: sceneYaw, duration: settle.duration, ease: 'power1.out' }, settle.start);",
  "const [prediction, setPrediction] = useState(null);",
  "unique_together = ('follower', 'followed')",
  "camera.position.set(...FADE_IN_CAMERA.position);",
  "if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';",
  "models.Index(fields=['post', '-created_at'])",
  "raise ValidationError(\"Users cannot follow themselves\")",
  "gsap.to(items, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger, ease: 'back.out(1.7)' });",
  "return bool(request.user and request.user.is_superuser)",
  "mediaQuery.addEventListener('change', handleChange);",
  "const headBox = new THREE.Box3().setFromObject(headNode);",
  "window.history.scrollRestoration = 'manual';",
] as const;

// --- Contact section: exit from behind the monitor -------------------------
// Second, separate pinned sequence, own <Canvas> (see ContactScene.tsx) —
// there's already a natural scene-cut via the Projects section in between,
// so this doesn't need to be the same continuous shot as the Hero sequence.
// Raised 180 -> 210, same "a bit slower" reasoning as HERO_SCROLL_PIN_VH —
// the whole-object turn during cameraSettle is a rotation too.
export const CONTACT_SCROLL_PIN_VH = 210;

export const CONTACT_BEATS = {
  blackOut: [0.0, 0.22],
  cameraSettle: [0.0, 0.4],
  textIn: [0.32, 0.55],
} as const satisfies Record<string, [number, number]>;

// Starting framing, right as we're still "behind" the monitor — close and
// dark, matches where the Hero sequence left off conceptually.
export const CONTACT_START_CAMERA: CameraFraming = {
  position: [0.4, 1.1, -0.6],
  target: [0.3, 0.95, 0.4],
  fov: 30,
};

// End framing: zoomed out, character in the lower right of frame. Only
// `fov` is actually used — two rounds of hand-guessing `position`/`target`
// here never reliably landed "lower right, clear of the text," so
// ContactTimeline.tsx now computes those at runtime from the character's
// actual world bounding box instead (offset camera + look-at target
// derived via the camera's own right/up axes). Worked on the first try.
// These two fields are dead but left in place as a record of what didn't
// work — see DONE.md before reviving them.
export const CONTACT_END_CAMERA: CameraFraming = {
  position: [2.9, 1.6, 2.3],
  target: [-1.1, 0.4, -1.0],
  // Widened from 30 -> 48 -> 60 across two rounds of feedback — "make the
  // fov 60."
  fov: 60,
};

// Rotates the *whole loaded model* (desk + monitor + character together —
// see ContactTimeline.tsx, which applies this to the centered root pivot
// rather than just the character's upperBody) so both end up facing the
// camera/visitor once settled. This is now just the fallback: Kareem's
// "complete the turn until he is facing me, not the text" meant the
// hand-guessed 2.2 wasn't quite right, so ContactTimeline.tsx now computes
// the exact yaw at runtime instead — the angle between the character's
// real monitor-facing direction and the direction from him to the actual
// end camera position, same "compute from real geometry" approach already
// used for the monitor_screen target and the original Contact framing (see
// DONE.md). This constant is only used if that lookup ever fails (e.g.
// monitor_screen isn't found).
export const CONTACT_SCENE_YAW = 2.2;
