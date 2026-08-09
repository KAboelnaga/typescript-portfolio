import { forwardRef } from 'react';
import { CODE_WORDS } from '../scenes/timeline';

/**
 * Flying code-snippet words for the monitorBlack -> codeWords beats — the
 * "camera enters the screen" illusion. Purely decorative text (not meant to
 * be read), so aria-hidden. HeroTimeline queries this container's children
 * directly (in order) to animate each one — see its setup effect — rather
 * than threading an array of refs through props.
 */
export const CodeWordsOverlay = forwardRef<HTMLDivElement, { className?: string }>(
  function CodeWordsOverlay({ className }, ref) {
    return (
      <div ref={ref} className={className} aria-hidden="true">
        {CODE_WORDS.map((word, i) => (
          // Outer div centers via flexbox (not transform) so GSAP can freely
          // own the inner span's transform (x/y/scale) without the two
          // fighting over the same CSS property.
          <div key={i} className="absolute inset-0 flex items-center justify-center">
            <span className="whitespace-nowrap font-mono text-2xl text-signal opacity-0 sm:text-3xl">
              {word}
            </span>
          </div>
        ))}
      </div>
    );
  },
);
