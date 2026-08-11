import { fontVariation } from '../theme/tokens';
import { projects } from '../data/projects';
import { ProjectCard } from './ProjectCard';
import { ScrollReveal } from './ScrollReveal';
import { Parallax } from './Parallax';

export function Projects() {
  return (
    <section id="projects" className="overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <Parallax speed={0.06}>
          <ScrollReveal variant="scale">
            <h2
              className="font-display text-2xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Things I&rsquo;ve built
            </h2>
          </ScrollReveal>
        </Parallax>

        {/* CONTENT-LIVE.md (2026-08-11): "Three projects, one row... 3
            columns desktop, 2 tablet, 1 mobile." Was capped at 2 columns
            (`sm:grid-cols-2`) with no wider-breakpoint step, which is
            what the previous 4-card grid wanted (2×2) — three cards
            correctly wrapped to a 2/1 split there. `lg:grid-cols-3` adds
            the real third step now that the card count actually calls
            for one row across on desktop. */}
        <Parallax speed={0.14} className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ScrollReveal
              key={project.slug}
              variant={i % 2 === 0 ? 'left' : 'right'}
              delay={Math.floor(i / 2) * 0.12}
            >
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </Parallax>
      </div>
    </section>
  );
}
