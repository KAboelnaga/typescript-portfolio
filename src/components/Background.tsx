import { fontVariation } from '../theme/tokens';
import { ScrollReveal } from './ScrollReveal';
import { StaggerReveal } from './StaggerReveal';
import { Parallax } from './Parallax';

const EDUCATION = [
  { name: 'B.Sc. Computer Engineering', meta: 'AASTMT, 2024 · GPA 3.0' },
  { name: 'ITI — Full Stack Python Track', meta: 'Mar – Aug 2025' },
  { name: 'ALX Software Engineering', meta: 'Jan – Aug 2025' },
  { name: 'Meta Front-End Certificate', meta: '2025' },
];

const PLACEMENTS = [
  { place: '64th', label: 'nationally — ECPC 2020' },
  { place: 'Contestant', label: 'ACPC 2020' },
  { place: '4th', label: 'AASTMT University Contest 2019' },
];

const LANGUAGES = [
  { name: 'Arabic', level: 'native' },
  { name: 'English', level: 'professional working proficiency' },
];

/**
 * Education, Competitive programming, and Languages — three separate
 * headings in CONTENT.md, combined into one section here rather than
 * three consecutive near-empty full-bleed sections, which would read as
 * choppy at this content density. Each sub-block keeps CONTENT.md's own
 * heading and formatting intent (compact list, no descriptions for
 * Education — "the projects already demonstrate the content"; placements
 * large in the display face for competitive programming, "the number is
 * the content").
 *
 * "The education, competitive programming, and language part... too small
 * text, please restyle and animate." Sized up a full step across the
 * board (matches the body-text scale used elsewhere, not a shrunk-down
 * afterthought) and given its own section heading + entrance treatment
 * like Work/Projects/Skills, rather than jumping straight to three
 * same-weight sub-headings with no section framing. Each column enters
 * from a different direction (left / scale / right) and its list staggers
 * item-by-item, instead of one flat block-fade for the whole section.
 */
export function Background() {
  return (
    <section id="background" className="overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <Parallax speed={0.06}>
          <ScrollReveal variant="scale">
            <h2
              className="font-display text-2xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Background
            </h2>
          </ScrollReveal>
        </Parallax>

        <div className="mt-12 grid w-full gap-14 border-t border-surf-3 pt-10 sm:grid-cols-3">
          <ScrollReveal variant="left">
            <h3
              className="font-display text-xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Education
            </h3>
            <StaggerReveal as="ul" className="mt-6 flex flex-col gap-5">
              {EDUCATION.map((item) => (
                <li key={item.name}>
                  <p className="font-body text-base leading-snug text-text-hi sm:text-lg">{item.name}</p>
                  <p className="mt-1 font-mono text-sm text-text-low">{item.meta}</p>
                </li>
              ))}
            </StaggerReveal>
          </ScrollReveal>

          <ScrollReveal variant="scale" delay={0.1}>
            <h3
              className="font-display text-xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Competitive programming
            </h3>
            <StaggerReveal as="ul" className="mt-6 flex flex-col gap-6">
              {PLACEMENTS.map((item) => (
                <li key={item.label}>
                  {/* "Competitive programming is overflowing on the other
                      section" — real bug, and a deeper one than it looked:
                      `sm:text-5xl` doesn't actually exist in this project's
                      custom `fontSize` scale (tailwind.config.ts only
                      defines up to `4xl`), so it silently generated no
                      rule at all, leaving the *base* `text-4xl` — 6.5rem
                      (104px) in this custom scale, not Tailwind's default
                      ~2.25rem — applied at every breakpoint. That's
                      enormous for a whole word ("Contestant," the one
                      non-numeric placement; "64th"/"4th" are short enough
                      to have hidden the problem), and it overflowed the
                      column outward into Languages next to it rather than
                      wrapping. Sized down to sizes that actually exist in
                      the scale and fit the real column width; `break-words`
                      stays on as a backstop for any still-narrower case. */}
                  <p
                    className="break-words font-display text-2xl text-lamp sm:text-3xl"
                    style={{ fontVariationSettings: fontVariation.heading }}
                  >
                    {item.place}
                  </p>
                  <p className="mt-1 font-mono text-sm text-text-low">{item.label}</p>
                </li>
              ))}
            </StaggerReveal>
          </ScrollReveal>

          <ScrollReveal variant="right" delay={0.2}>
            <h3
              className="font-display text-xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Languages
            </h3>
            <StaggerReveal as="ul" className="mt-6 flex flex-col gap-4">
              {LANGUAGES.map((item) => (
                <li key={item.name} className="font-body text-base leading-snug text-text-mid sm:text-lg">
                  <span className="font-medium text-text-hi">{item.name}</span> — {item.level}
                </li>
              ))}
            </StaggerReveal>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
