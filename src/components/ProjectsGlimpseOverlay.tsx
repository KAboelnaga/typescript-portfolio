import { forwardRef } from 'react';
import { fontVariation } from '../theme/tokens';

/**
 * A brief title-card moment while still inside the black/screen
 * environment, right before the pin releases and the real, full Projects
 * section takes over in normal document flow underneath — "just a large
 * 'projects that I have done' text to appear, then seeing my project."
 * Simplified from an earlier version that grid-listed every project name
 * plus a camera zoom-out/model-rotation reveal here — Kareem asked for
 * that removed; the real Projects section right after already shows the
 * actual list, so repeating it here (with a spectacle on top) was
 * redundant. HeroTimeline queries `[data-glimpse-heading]` directly, same
 * convention as CodeWordsOverlay's spans.
 */
export const ProjectsGlimpseOverlay = forwardRef<HTMLDivElement, { className?: string }>(
  function ProjectsGlimpseOverlay({ className }, ref) {
    return (
      <div ref={ref} className={className} aria-hidden="true">
        <div className="flex h-full items-center justify-center px-6">
          <h2
            data-glimpse-heading
            className="text-center font-display text-4xl leading-tight text-text-hi opacity-0 sm:text-5xl lg:text-6xl"
            style={{ fontVariationSettings: fontVariation.name }}
          >
            Projects I&rsquo;ve built
          </h2>
        </div>
      </div>
    );
  },
);
