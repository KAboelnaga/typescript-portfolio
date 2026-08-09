import { fontVariation } from '../theme/tokens';
import { otherProjects } from '../data/otherProjects';
import { ScrollReveal } from './ScrollReveal';
import { Parallax } from './Parallax';

export function OtherProjects() {
  return (
    <section id="other-projects" className="overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <Parallax speed={-0.06}>
          <h2
            className="font-display text-2xl text-text-hi"
            style={{ fontVariationSettings: fontVariation.heading }}
          >
            Also built
          </h2>
        </Parallax>

        <Parallax speed={-0.12} as="ol" className="mt-10 border-l border-dashed border-surf-3 pl-8">
          {otherProjects.map((project, i) => (
            <ScrollReveal
              as="li"
              key={project.slug}
              delay={i * 0.08}
              // "Make all the projects have a hover effect" — no screenshot
              // assets exist for these lighter mentions (unlike the three
              // flagship ProjectCards, which get a real image/video popup),
              // so the hover feedback here is a background/marker glow
              // instead of a fabricated preview. `group` scopes it to just
              // this entry.
              className="group relative -ml-4 rounded-lg py-2 pb-10 pl-4 pr-4 transition-colors duration-300 hover:bg-surf-1 last:pb-2"
            >
              <span
                aria-hidden="true"
                className="absolute -left-[calc(2rem-1px)] top-3.5 h-2 w-2 rounded-full bg-lamp-glow transition-transform duration-300 group-hover:scale-150"
              />

              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-xs text-text-low">{project.year}</span>
                <span className="font-body text-base font-medium text-text-hi">{project.name}</span>
              </div>

              <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-text-mid">
                {project.description}
              </p>

              {(project.previewUrl || project.repoUrl) && (
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                  {project.previewUrl && (
                    <a
                      href={project.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm text-signal transition-colors duration-300 hover:underline"
                    >
                      live preview ↗
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm text-signal transition-colors duration-300 hover:underline"
                    >
                      view repo ↗
                    </a>
                  )}
                </div>
              )}
            </ScrollReveal>
          ))}
        </Parallax>
      </div>
    </section>
  );
}
