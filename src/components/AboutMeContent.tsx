import { forwardRef } from 'react';
import { fontVariation } from '../theme/tokens';
import { WordReveal } from './WordReveal';

// [VERIFY] Draft copy — Kareem hasn't given the real specifics yet (ITI
// track/dates, how much detail on graduation, what "freelance" should
// actually say beyond Rustaq). Confirm before this ships. See TODO.md.
export const AboutMeContent = forwardRef<HTMLDivElement, { className?: string }>(
  function AboutMeContent({ className }, ref) {
    return (
      <div ref={ref} className={className}>
        <div className="mx-auto w-full max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low sm:text-sm">
            About me
          </p>

          <h2
            className="mt-4 font-display text-2xl leading-tight text-text-hi sm:text-3xl"
            style={{ fontVariationSettings: fontVariation.heading }}
          >
            Backend &amp; full-stack engineer — Python, Django, React
          </h2>

          <p className="mt-6 max-w-xl font-body text-base leading-relaxed">
            <WordReveal standalone={false} text="Computer Engineering graduate from AASTMT." />{' '}
            <span className="text-text-low">[VERIFY: ITI track and dates go here]</span>{' '}
            <WordReveal
              standalone={false}
              text="I build administrative systems that people actually have to use every day — permissions, workflows, exports, Arabic-first interfaces."
            />{' '}
            <span className="text-text-low">
              [VERIFY: freelance summary — Rustaq specifically, or freelancing
              more broadly?]
            </span>{' '}
            <WordReveal standalone={false} text="Currently looking for backend or full-stack work." />
          </p>
        </div>
      </div>
    );
  },
);
