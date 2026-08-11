import { forwardRef } from 'react';
import { WordReveal } from './WordReveal';
import { useTheme } from '../theme/ThemeContext';

// "There are 2 about me, I only want the first one, and the text is
// repetitive — see what's best to be written and write it." There used
// to be two: this beat (short, during the Hero intro) and a standalone
// three-paragraph About section further down the page (About.tsx,
// removed — see App.tsx and DONE.md). Both opened with essentially the
// same idea ("software nobody sees"/"systems people use every day"),
// so keeping both read as saying the same thing twice.
//
// CONTENT-LIVE.md (2026-08-11): still duplicating, one level up — this
// paragraph's own opening sentence ("I build the systems people use
// every day — permissions, reporting, admin interfaces, Arabic-first")
// turned out to be verbatim the Hero title's third line, so a visitor
// hit the identical sentence twice within one scroll. That line belongs
// to the Hero; this keeps only the half that isn't already said there.
//
// "Remove the title under about me (Backend & full-stack...)" — that
// heading (restating the Hero title line one beat later) is gone; the
// paragraph is the whole beat now. Also given its own font (Sora, not
// the sitewide `font-body`) per "I don't like the about me font, look
// for another modern font" — scoped to just this paragraph rather than
// changing `font-body` everywhere else on the site.
export const AboutMeContent = forwardRef<HTMLDivElement, { className?: string }>(
  function AboutMeContent({ className }, ref) {
    // "The text in the hero and about in light mode are bad colored" —
    // see the matching comment in Hero.tsx for the root cause (a
    // hardcoded dark shadow fogging this theme's own dark text). Same
    // fix: read the theme's own background color instead.
    const { colors } = useTheme();
    return (
      <div ref={ref} className={className}>
        {/* Same mobile text-legibility fix as Hero.tsx's name/title block
            — this text spans full-width on narrow viewports and sits
            directly over the character there, unlike on desktop's wider
            frame. */}
        <div
          className="w-full max-w-4xl"
          style={{ textShadow: `0 2px 20px ${colors.void}, 0 1px 4px ${colors.void}` }}
        >
          {/* `h2`, not `p` — every other section on the page (Work, Projects,
              Skills, Background, Contact) opens with a real heading; this
              one was the one exception, so a screen reader's "jump by
              heading" navigation skipped straight from the name (h1) to
              Work (h2), silently missing this whole section. Same visual
              styling either way — only the semantics changed. */}
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-text-low sm:text-sm">
            About me
          </h2>

          <p className="mt-6 max-w-3xl font-about text-lg leading-snug sm:text-xl">
            <WordReveal
              standalone={false}
              text="I came up through competitive programming, which is probably why a municipal database restructure didn't scare me: most problems get easier once you find the right way to represent them."
            />
          </p>
        </div>
      </div>
    );
  },
);
