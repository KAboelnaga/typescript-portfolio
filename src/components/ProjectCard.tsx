import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { Project } from '../data/projects';
import { ProjectPreviewPopup } from './ProjectPreviewPopup';

/**
 * "Convert the top three projects to clickables so it redirects to the
 * project's live preview" + "add both of the other linked repos links" +
 * "a big image [or video] popup showing the preview... on the left of the
 * hovered item." The card itself is a plain `<div>` (not a link) — making
 * the whole card an `<a>` meant a project with both a live URL and a repo
 * could only show one of the two (a link can't nest inside another link),
 * which is exactly what Kareem asked to fix. Instead, "live preview" and
 * "view repo" render as two independent links whenever each is set, so
 * both are always reachable. The hover popup (image or video) is
 * separately gated on whether a preview asset exists at all, whether or
 * not either link is present.
 *
 * `<div>`, not `<article>` — the whole-card click/keyboard handling below
 * needs `role="link"` on it, and ARIA doesn't allow that role on
 * `<article>` (a sectioning element with its own implicit semantics); axe
 * flagged it as an `aria-allowed-role` violation. `<div>` has no implicit
 * role of its own, so any explicit role is valid on it.
 *
 * "Make any card in projects clickable, priority to its live demo, if
 * there isn't [one] go to the github repo" — the whole card is clickable
 * again now too, on top of (not instead of) the two explicit links above,
 * via a plain `onClick` rather than wrapping the card in a real `<a>`
 * (still can't nest the two real links inside one). Guarded to ignore
 * clicks that originate from an actual link/button inside the card, so
 * clicking "view repo" only ever opens the repo, never both.
 *
 * "The popup image for repos on mobile are pretty miserable in
 * navigation" — `onTouchStart` used to fire the same floating popup a
 * real hover would ("hover doesn't exist on touch devices," a real
 * problem this was fixing), but `ProjectPreviewPopup` is 480px wide,
 * built assuming room to sit *beside* the hovered card on a real
 * pointer-driven layout — on a ~390px phone viewport it can only clamp
 * to the left edge and ends up overlapping most of the screen, triggered
 * by a scroll-passing touch, not a deliberate request. Two options: drop
 * the mobile preview entirely, or give it real space instead of forcing
 * a desktop-shaped popup into it. The image is real evidence a live
 * product exists — worth keeping, not worth it being miserable to see —
 * so below `sm:` the popup is gone and the card instead gets a plain
 * cover image/video inline at its own top edge, no interaction needed,
 * nothing to accidentally trigger while scrolling past.
 */
export function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const hasPreview = Boolean(project.previewImage || project.previewVideo);
  const primaryUrl = project.previewUrl || project.repoUrl;

  function onEnter() {
    if (!hasPreview) return;
    // Removing the `onTouchStart` handler wasn't enough on its own — a
    // real tap still reaches this via the browser's own compatibility
    // `mouseenter` it synthesizes after `touchend` (confirmed via
    // Playwright's `.tap()`, which reproduces the same thing). Same
    // `(pointer: fine)` check CustomCursor.tsx already uses to gate
    // itself to real desktop input — belt-and-suspenders with the inline
    // mobile image below actually not existing for `sm:` and up.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    rectRef.current = cardRef.current?.getBoundingClientRect() ?? null;
    setHovered(true);
  }

  function onCardClick(e: MouseEvent<HTMLDivElement>) {
    if (!primaryUrl) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    window.open(primaryUrl, '_blank', 'noopener,noreferrer');
  }

  function onCardKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!primaryUrl) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(primaryUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={onEnter}
        onMouseLeave={() => setHovered(false)}
        onClick={onCardClick}
        onKeyDown={onCardKeyDown}
        tabIndex={primaryUrl ? 0 : undefined}
        role={primaryUrl ? 'link' : undefined}
        data-cursor-hover={primaryUrl ? '' : undefined}
        className={`flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-transparent bg-surf-1 p-6 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:border-surf-3 hover:bg-surf-2 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)] sm:p-8 ${primaryUrl ? 'cursor-pointer' : ''}`}
      >
        {hasPreview && (
          <div className="-mx-6 -mt-6 shrink-0 sm:hidden">
            {project.previewVideo ? (
              <video
                src={project.previewVideo}
                className="aspect-video w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={project.previewImage}
                alt={`${project.name} preview`}
                className="aspect-video w-full object-cover"
              />
            )}
          </div>
        )}

        <p className="font-mono text-xs text-text-low sm:text-sm">
          {project.year} · {project.role}
        </p>

        <h3 className="font-display text-lg text-text-hi sm:text-xl">{project.name}</h3>

        <p className="flex-1 font-body text-base leading-relaxed text-text-mid">
          {project.description}
        </p>

        {project.note && (
          <p className="font-mono text-xs leading-relaxed text-text-low">{project.note}</p>
        )}

        <ul className="flex flex-wrap gap-2 pt-2">
          {project.stack.map((item) => (
            <li
              key={item}
              className="rounded border border-surf-3 px-2 py-1 font-mono text-xs text-text-low"
            >
              {item}
            </li>
          ))}
        </ul>

        {(project.previewUrl || project.repoUrl) && (
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {project.previewUrl && (
              <a
                href={project.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
              >
                live preview
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
              >
                view repo
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        )}
      </div>

      {hasPreview && (
        <ProjectPreviewPopup
          image={project.previewImage}
          video={project.previewVideo}
          anchorRect={hovered ? rectRef.current : null}
          visible={hovered}
        />
      )}
    </>
  );
}
