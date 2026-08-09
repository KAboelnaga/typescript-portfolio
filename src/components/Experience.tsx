import { fontVariation } from '../theme/tokens';
import { experience } from '../data/experience';
import { WordReveal } from './WordReveal';
import { ScrollReveal } from './ScrollReveal';
import { Parallax } from './Parallax';

/**
 * "A section of my timeline giving my CV data in a chronological way" —
 * styled after tajmirul.site's experience list: each entry's role heading
 * dims by default and brightens word by word as it scrolls into view (see
 * WordReveal.tsx), rather than the whole entry just fading in at once.
 * Also where the CV download link lives — "I was thinking about adding my
 * CV" — since a resume and a chronological history are the same idea.
 * `public/CV.pdf` is a placeholder (see TODO.md) until Kareem supplies the
 * real file; the link/filename won't need to change when he does.
 */
export function Experience() {
  return (
    <section id="experience" className="overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <Parallax speed={-0.06}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2
              className="font-display text-2xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Experience
            </h2>
            <a
              href="/CV.pdf"
              download
              className="font-mono text-sm text-signal transition-colors duration-300 hover:underline"
            >
              Download CV ↓
            </a>
          </div>
        </Parallax>

        <div className="mt-12 flex flex-col gap-14">
          {experience.map((entry) => (
            <ScrollReveal key={entry.slug} className="border-t border-surf-3 pt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low sm:text-sm">
                  {entry.org}
                </p>
                <p className="font-mono text-xs text-text-low sm:text-sm">{entry.period}</p>
              </div>

              <h3
                className="mt-3 font-display text-xl leading-tight sm:text-2xl"
                style={{ fontVariationSettings: fontVariation.heading }}
              >
                <WordReveal text={entry.role} />
              </h3>

              <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-text-mid sm:text-base">
                {entry.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
