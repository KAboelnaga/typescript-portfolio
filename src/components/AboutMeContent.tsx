import { forwardRef } from 'react';
import { fontVariation } from '../theme/tokens';
import { WordReveal } from './WordReveal';

// "There are 2 about me, I only want the first one, and the text is
// repetitive — see what's best to be written and write it." There used
// to be two: this beat (short, during the Hero intro) and a standalone
// three-paragraph About section further down the page (About.tsx,
// removed — see App.tsx and DONE.md). Both opened with essentially the
// same idea ("software nobody sees"/"systems people use every day"),
// so keeping both read as saying the same thing twice. This is now the
// only "about" copy on the site — combines the tagline's concrete list
// (what he actually builds) with the standalone version's one genuinely
// distinctive detail (the competitive-programming background) instead
// of just picking one of the two originals verbatim.
export const AboutMeContent = forwardRef<HTMLDivElement, { className?: string }>(
  function AboutMeContent({ className }, ref) {
    return (
      <div ref={ref} className={className}>
        <div className="w-full max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low sm:text-sm">
            About me
          </p>

          <h2
            className="mt-4 font-display text-3xl leading-tight text-text-hi sm:text-4xl lg:text-[3.25rem]"
            style={{ fontVariationSettings: fontVariation.heading }}
          >
            Backend &amp; full-stack engineer — Python, Django, React
          </h2>

          {/* Sized down one notch from the original (text-xl/2xl) once the
              combined, de-duplicated copy below got a second sentence
              longer — the taller block was pushing "About me" above the
              viewport top at standard heights (found via a Playwright
              getBoundingClientRect check, not just eyeballing it). */}
          <p className="mt-6 max-w-3xl font-body text-lg leading-snug sm:text-xl">
            <WordReveal
              standalone={false}
              text="I build the systems people use every day — permissions, reporting, admin interfaces, Arabic-first. I came up through competitive programming, which is probably why a municipal database restructure didn't scare me: most problems get easier once you find the right way to represent them."
            />
          </p>
        </div>
      </div>
    );
  },
);
