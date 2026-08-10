import { fontVariation } from '../theme/tokens';
import { skillTiers } from '../data/skills';
import { ScrollReveal } from './ScrollReveal';
import { StaggerReveal } from './StaggerReveal';
import { Parallax } from './Parallax';
import { SkillTag } from './SkillTag';

/**
 * "What I work with" — replaces the old stack-derived marquee
 * (TechSkillsSlider) with CONTENT.md's tiered list: "No percentage bars.
 * No proficiency rings. The tiering is the honesty." Three tiers, plain
 * tags, no fake precision about how good he is at any one of them. Logos
 * (see data/skillIcons.ts) only where a skill has a real one — "Django
 * Admin," "REST APIs," and "Unit testing" aren't real branded products,
 * so they render as plain text rather than a made-up mark.
 */
export function Skills() {
  return (
    <section id="skills" className="overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <Parallax speed={-0.06}>
          <ScrollReveal variant="left">
            <h2
              className="font-display text-2xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              What I work with
            </h2>
          </ScrollReveal>
        </Parallax>

        <div className="mt-10 flex flex-col gap-8">
          {skillTiers.map((group, i) => (
            <div key={group.tier}>
              <ScrollReveal variant="left" delay={i * 0.06}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low sm:text-sm">
                  {group.tier}
                </p>
              </ScrollReveal>
              <StaggerReveal as="ul" className="mt-3 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </StaggerReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
