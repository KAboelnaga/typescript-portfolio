import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { Project } from '../data/projects';
import { ProjectPreviewPopup } from './ProjectPreviewPopup';

/**
 * "Convert the top three projects to clickables so it redirects to the
 * project's live preview" + "add both of the other linked repos links" +
 * "a big image [or video] popup showing the preview... on the left of the
 * hovered item." The card itself is a plain `<article>` (not a link) —
 * making the whole card an `<a>` meant a project with both a live URL and
 * a repo could only show one of the two (a link can't nest inside another
 * link), which is exactly what Kareem asked to fix. Instead, "live
 * preview" and "view repo" render as two independent links whenever each
 * is set, so both are always reachable. The hover popup (image or video)
 * is separately gated on whether a preview asset exists at all, whether
 * or not either link is present.
 *
 * "Make any card in projects clickable, priority to its live demo, if
 * there isn't [one] go to the github repo" — the whole card is clickable
 * again now too, on top of (not instead of) the two explicit links above,
 * via a plain `onClick` rather than wrapping the card in a real `<a>`
 * (still can't nest the two real links inside one). Guarded to ignore
 * clicks that originate from an actual link/button inside the card, so
 * clicking "view repo" only ever opens the repo, never both.
 */
export function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  const hasPreview = Boolean(project.previewImage || project.previewVideo);
  const primaryUrl = project.previewUrl || project.repoUrl;

  function onEnter() {
    if (!hasPreview) return;
    rectRef.current = cardRef.current?.getBoundingClientRect() ?? null;
    setHovered(true);
  }

  function onCardClick(e: MouseEvent<HTMLElement>) {
    if (!primaryUrl) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    window.open(primaryUrl, '_blank', 'noopener,noreferrer');
  }

  function onCardKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (!primaryUrl) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(primaryUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <>
      <article
        ref={cardRef}
        onMouseEnter={onEnter}
        onMouseLeave={() => setHovered(false)}
        onClick={onCardClick}
        onKeyDown={onCardKeyDown}
        tabIndex={primaryUrl ? 0 : undefined}
        role={primaryUrl ? 'link' : undefined}
        data-cursor-hover={primaryUrl ? '' : undefined}
        className={`flex h-full flex-col gap-4 rounded-lg border border-transparent bg-surf-1 p-6 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:border-surf-3 hover:bg-surf-2 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)] sm:p-8 ${primaryUrl ? 'cursor-pointer' : ''}`}
      >
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
      </article>

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
