import { createPortal } from 'react-dom';

// "A larger popup" — raised from 320x220, same aspect ratio.
const POPUP_WIDTH = 480;
const POPUP_HEIGHT = 330;
const GAP = 20;
const EDGE_MARGIN = 16;

/**
 * "Add a big image popup showing the preview image on the left of the
 * hovered item" — later extended to "should contain an image or video
 * preview." Rendered via a portal straight into `document.body` —
 * `ProjectCard`'s ancestor chain includes `Parallax`, which applies a CSS
 * `transform` to animate scroll depth, and a transformed ancestor becomes
 * the containing block for any `position: fixed` descendant (it stops
 * being relative to the real viewport). Portaling out from under that
 * keeps this positioned against the actual viewport regardless of
 * whatever parallax offset the card currently has. Independent of whether
 * the card itself is a clickable link — a project can have a preview
 * without a live URL to send visitors to (e.g. one only worth linking to
 * its repo).
 */
export function ProjectPreviewPopup({
  image,
  video,
  anchorRect,
  visible,
}: {
  image?: string;
  video?: string;
  anchorRect: DOMRect | null;
  visible: boolean;
}) {
  if (!anchorRect || (!image && !video)) return null;

  const left = Math.max(EDGE_MARGIN, anchorRect.left - POPUP_WIDTH - GAP);
  const top = Math.min(
    Math.max(EDGE_MARGIN, anchorRect.top + anchorRect.height / 2 - POPUP_HEIGHT / 2),
    window.innerHeight - POPUP_HEIGHT - EDGE_MARGIN,
  );

  return createPortal(
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed z-[90] overflow-hidden rounded-lg border border-surf-3 bg-surf-1 shadow-2xl transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ left, top, width: POPUP_WIDTH, height: POPUP_HEIGHT }}
    >
      {video ? (
        <video
          src={video}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img src={image} alt="" className="h-full w-full object-cover" />
      )}
    </div>,
    document.body,
  );
}
