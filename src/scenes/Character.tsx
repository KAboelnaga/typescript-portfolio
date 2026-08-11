import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

const MODEL_PATH = '/models/character.glb';
// Self-hosted, not drei's default gstatic.com CDN — same reasoning as the
// fonts (SPEC.md section 3: "no Google Fonts CDN call"). The CDN round-trip
// added several extra seconds to the intro in production testing.
const DRACO_DECODER_PATH = '/draco/';
useGLTF.setDecoderPath(DRACO_DECODER_PATH);

// Everything above the hips that should visually turn together during the
// intro TURN beat. Legs/hips/chair stay put — the spec scopes the turn to
// "head and torso." Names come from inspecting public/models/character.glb
// (see project memory) — a flat sibling hierarchy, not a proper rig, so we
// reparent these into a pivot group at runtime rather than rotating a
// single bone.
const UPPER_BODY_NODE_NAMES = [
  'head',
  'neck',
  'neck_base',
  'torso',
  'pants_seat',
  'shoulder_l',
  'shoulder_r',
  'sleeve_l',
  'sleeve_r',
  'upperarm_l',
  'upperarm_r',
  'elbow_l',
  'elbow_r',
  'forearm_l',
  'forearm_r',
  'wrist_l',
  'wrist_r',
  'palm_l',
  'palm_r',
  'knuckles_l',
  'knuckles_r',
  'finger_l0',
  'finger_l1',
  'finger_l2',
  'finger_l3',
  'fingertip_l0',
  'fingertip_l1',
  'fingertip_l2',
  'fingertip_l3',
  'finger_r0',
  'finger_r1',
  'finger_r2',
  'finger_r3',
  'fingertip_r0',
  'fingertip_r1',
  'fingertip_r2',
  'fingertip_r3',
  'thumb_l',
  'thumb_r',
];

interface CharacterProps {
  onReady?: (upperBody: THREE.Group) => void;
  // Not the raw loaded scene, but a pivot wrapping everything in it
  // (desk, chair, monitor, upperBodyPivot — literally all of it),
  // centered on the whole object's own bounding box rather than wherever
  // the GLTF's root origin happens to sit (off in a corner, roughly
  // floor-level) — see the "rootPivot" comment below. Callers still use
  // it to look up other named nodes at runtime (e.g. HeroTimeline finding
  // "monitor_screen") — getObjectByName searches recursively regardless
  // of reparenting depth, so that keeps working unchanged — and now also
  // as the thing to rotate for a whole-object turn (e.g. Contact's
  // drag-to-rotate), which rootPivot makes correct in a way the raw scene
  // wasn't.
  onSceneReady?: (sceneRootPivot: THREE.Group) => void;
  // Nested inside upperBody, pivoted at the head's own bounding-box center
  // (not upperBody's) — so rotating it turns only the face, not the whole
  // torso. Kareem: "I asked if the character's head can follow the cursor,
  // you made his whole body move — I want his face only to be moving."
  onHeadReady?: (head: THREE.Group) => void;
}

export function Character({ onReady, onSceneReady, onHeadReady }: CharacterProps) {
  const { scene: cachedScene } = useGLTF(MODEL_PATH);
  // Cloned per mount: useGLTF's result is cached by URL, and Character now
  // mounts in two independent <Canvas> instances (Hero's and ContactScene's)
  // — an Object3D can only have one parent, so sharing the cached graph
  // directly would fight between the two scenes. No skinning/bones here, so
  // a plain Object3D.clone() (deep by default) is enough; SkeletonUtils
  // isn't needed.
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene]);
  const builtRef = useRef(false);

  useEffect(() => {
    if (builtRef.current) return; // guard against StrictMode double-invoke

    const parts = UPPER_BODY_NODE_NAMES.map((name) => scene.getObjectByName(name)).filter(
      (o): o is THREE.Object3D => Boolean(o),
    );
    if (parts.length === 0) return;

    // Pivot at the bounding-box center of the upper-body parts — geometry
    // based, not node-transform based, since this export bakes position
    // into mesh vertices rather than using a real skeleton (node.position
    // is identity on most of these).
    const box = new THREE.Box3();
    parts.forEach((part) => box.expandByObject(part));
    const pivotPoint = box.getCenter(new THREE.Vector3());

    const pivot = new THREE.Group();
    pivot.name = 'upperBodyPivot';
    pivot.position.copy(pivotPoint);
    scene.add(pivot);

    // attach() (not add()) preserves each part's world transform while
    // reparenting, so nothing visually jumps when the pivot takes over.
    parts.forEach((part) => pivot.attach(part));

    // A second, nested pivot scoped to just the head mesh, same technique
    // as above (bounding-box center, not node-transform, since this export
    // bakes position into vertices) but computed from the head alone so
    // rotating it swings only the face, not the shoulders/arms/torso that
    // upperBodyPivot also owns. Built after the reparent above, since
    // "head" is looked up from its new location (child of pivot) — attach()
    // already moved it there.
    const headNode = pivot.getObjectByName('head');
    if (headNode) {
      const headBox = new THREE.Box3().setFromObject(headNode);
      const headWorldCenter = headBox.getCenter(new THREE.Vector3());
      const headPivot = new THREE.Group();
      headPivot.name = 'headPivot';
      // pivot has no rotation/scale applied yet at this point (that only
      // happens later, via GSAP tweening pivot.rotation) — its transform is
      // a pure translation, so subtracting its position converts the
      // world-space head center into pivot-local space directly, same as
      // `pivot.worldToLocal()` would give without depending on matrixWorld
      // already being current this same tick.
      headPivot.position.copy(headWorldCenter).sub(pivot.position);
      pivot.add(headPivot);
      headPivot.attach(headNode);
      onHeadReady?.(headPivot);
    }

    // A third pivot wrapping literally everything in the scene (desk,
    // chair, monitor, and the upperBodyPivot/character built above).
    // Originally centered on the *whole object's* own bounding box —
    // Kareem: "I want the object rotation when clicked upon at the end to
    // have a fixed point in the center of the object and not on the
    // bottom" (this export's root origin sits off in a corner, roughly
    // floor-level, so rotating the raw scene directly swung the whole
    // desk+character assembly through a wide arc around that corner
    // instead of spinning in place). Re-centered on just the *character*
    // (reusing `pivotPoint`, the same upper-body-parts bounding-box center
    // computed above for `upperBodyPivot`) rather than the whole assembly
    // — "fixate the rotation point on the center of the character, not
    // the whole object." The desk/monitor still rotate together with him
    // (nothing here changes which nodes get attached below), only the
    // point everything turns around moves from the group's shared center
    // to his.
    const rootPivot = new THREE.Group();
    rootPivot.name = 'rootPivot';
    // scene is the true root — identity transform, nothing above it with
    // its own offset — so `pivotPoint`, already in scene-local space,
    // already equals what rootPivot's local position should be.
    rootPivot.position.copy(pivotPoint);
    scene.add(rootPivot);
    // Snapshot scene.children first: attach() below mutates that array
    // (each reparented child) as it goes.
    [...scene.children].forEach((child) => {
      if (child !== rootPivot) rootPivot.attach(child);
    });

    // "Text on the monitor [is] translated [off-center], center them" — the
    // code-editor mockup on the screen (`ui_sidebar`/`ui_file_*`/
    // `code_line_*`/`code_tok_*`/`code_cursor`, all siblings of
    // `monitor_screen` under `monitor_head`) sits noticeably off the
    // screen's own center — confirmed by comparing real geometry, not
    // eyeballed: the screen mesh's own local bounding-box center against
    // the mockup nodes' combined center, several centimeters apart on the
    // x-axis. Recentered by shifting every mockup node by the same real
    // delta, computed here at runtime rather than a hand-picked constant,
    // so it stays correct if the model is ever re-exported.
    const monitorHead = scene.getObjectByName('monitor_head');
    const monitorScreen = monitorHead?.getObjectByName('monitor_screen') as THREE.Mesh | undefined;
    if (monitorHead && monitorScreen) {
      monitorScreen.geometry.computeBoundingBox();
      const screenBox = monitorScreen.geometry.boundingBox;
      const contentNodes = monitorHead.children.filter(
        (n) => n.name.startsWith('ui_') || n.name.startsWith('code_'),
      );
      if (screenBox && contentNodes.length > 0) {
        const contentBox = new THREE.Box3();
        contentNodes.forEach((n) => contentBox.expandByPoint(n.position));
        const screenCenter = screenBox.getCenter(new THREE.Vector3());
        const contentCenter = contentBox.getCenter(new THREE.Vector3());
        const deltaX = screenCenter.x - contentCenter.x;
        const deltaY = screenCenter.y - contentCenter.y;
        contentNodes.forEach((n) => {
          n.position.x += deltaX;
          n.position.y += deltaY;
        });
      }
    }

    builtRef.current = true;
    onReady?.(pivot);
    onSceneReady?.(rootPivot);
  }, [scene, onReady, onSceneReady, onHeadReady]);

  return <primitive object={scene} />;
}

useGLTF.preload(MODEL_PATH);
