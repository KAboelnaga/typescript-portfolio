import { forwardRef } from 'react';
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
//
// "Remove the title under about me (Backend & full-stack...)" — that
// heading (restating the Hero title line one beat later) is gone; the
// paragraph is the whole beat now. Also given its own font (Sora, not
// the sitewide `font-body`) per "I don't like the about me font, look
// for another modern font" — scoped to just this paragraph rather than
// changing `font-body` everywhere else on the site.
export const AboutMeContent = forwardRef<HTMLDivElement, { className?: string }>(
  function AboutMeContent({ className }, ref) {
    return (
      <div ref={ref} className={className}>
        {/* Same mobile text-legibility fix as Hero.tsx's name/title block
            — this text spans full-width on narrow viewports and sits
            directly over the character there, unlike on desktop's wider
            frame. */}
        <div className="w-full max-w-4xl [text-shadow:0_2px_20px_rgba(10,13,18,0.9),0_1px_4px_rgba(10,13,18,0.95)]">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low sm:text-sm">
            About me
          </p>

          <p className="mt-6 max-w-3xl font-about text-lg leading-snug sm:text-xl">
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
