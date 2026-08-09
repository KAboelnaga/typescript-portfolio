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
          <h2
            className="font-display text-2xl text-text-hi"
            style={{ fontVariationSettings: fontVariation.heading }}
          >
            Selected work
          </h2>
        </Parallax>

        <Parallax speed={0.14} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project, i) => (
            <ScrollReveal key={project.slug} delay={i * 0.12}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </Parallax>
      </div>
    </section>
  );
}
