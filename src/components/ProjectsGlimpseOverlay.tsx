import { forwardRef } from 'react';
import { fontVariation } from '../theme/tokens';

/**
 * A brief title-card moment while still inside the black/screen
 * environment, right before the pin releases and the real, full Projects
 * section takes over in normal document flow underneath. Previously read
 * "Projects I've built" and was cut — "the real Projects section's own
 * heading ('Things I've built') reads seconds later, and the two
 * near-identical phrases back to back said the same thing twice." Kareem,
 * after seeing the cut live: "I want anything ['My Work'] to be put
 * instead" — restored with different copy specifically so it doesn't
 * repeat the section heading right after it. HeroTimeline queries
 * `[data-glimpse-heading]` directly, same convention as CodeWordsOverlay's
 * spans.
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
            My Work
          </h2>
        </div>
      </div>
    );
  },
);
