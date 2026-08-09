import { useRef, useState } from 'react';
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
 */
export function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  const hasPreview = Boolean(project.previewImage || project.previewVideo);

  function onEnter() {
    if (!hasPreview) return;
    rectRef.current = cardRef.current?.getBoundingClientRect() ?? null;
    setHovered(true);
  }

  return (
    <>
      <article
        ref={cardRef}
        onMouseEnter={onEnter}
        onMouseLeave={() => setHovered(false)}
        className="flex h-full flex-col gap-4 rounded-lg bg-surf-1 p-6 transition-colors hover:bg-surf-2 sm:p-8"
      >
        <p className="font-mono text-xs text-text-low sm:text-sm">
          {project.year} · {project.role}
        </p>

        <h3 className="font-display text-lg text-text-hi sm:text-xl">{project.name}</h3>

        <p className="flex-1 font-body text-base leading-relaxed text-text-mid">
          {project.description}
        </p>

        {project.note && (
          <p className="font-body text-sm italic leading-relaxed text-text-low">
            {project.note}
          </p>
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
                className="font-mono text-sm text-signal transition-colors duration-300 hover:underline"
              >
                live preview ↗
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm text-signal transition-colors duration-300 hover:underline"
              >
                view repo ↗
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
