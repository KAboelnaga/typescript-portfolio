import { fontVariation } from '../theme/tokens';
import { ScrollReveal } from './ScrollReveal';
import { StaggerReveal } from './StaggerReveal';
import { Parallax } from './Parallax';
import { CountUp } from './CountUp';

const RUSTAQ_STACK = ['Django', 'Django Admin', 'Apache', 'Arabic RTL'];

const STATS = [
  { value: '1,069', label: 'facilities managed' },
  { value: '7,716', label: 'inspection reports' },
  { value: '13', label: 'active users' },
];

/**
 * "Where I've shipped" — sourced from CONTENT.md (2026-08-09), Kareem's
 * own copy doc. Rustaq gets a full case-study treatment (stat strip,
 * named decisions) rather than a project-grid card, since it's real
 * client work still live in production, not a portfolio piece — moved
 * out of data/projects.ts entirely for this reason. Independent Developer
 * stays deliberately small underneath it ("two sentences maximum... it
 * shouldn't compete with it," per CONTENT.md).
 *
 * Team size on Rustaq was an open question in CONTENT.md ("sole developer,
 * or one of two?") — Kareem's answer: one of two. Nothing here claims
 * "sole developer" as a result; the body copy stays in first-person about
 * what *he* did without asserting he was alone on it.
 *
 * The live link's own open question ("is PythonAnywhere production or a
 * demo?") — Kareem's answer: it's production, but there's no self-serve
 * signup, only an admin-created login. Labeling it "demo" would have been
 * inaccurate (CONTENT.md's own advice was to only use that label if it
 * *isn't* production), so instead the link is honest about the login gate
 * up front — "an interviewer who clicks through and finds an empty
 * database is worse than no link" applies just as much to a login wall
 * with no way through it. See TODO.md for the open recommendation (a
 * scoped read-only viewer account) — not something Claude can create,
 * it's Kareem's production system.
 */
export function Work() {
  return (
    <section id="work" className="overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <Parallax speed={0.06}>
          <ScrollReveal variant="scale">
            <h2
              className="font-display text-2xl text-text-hi"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Where I&rsquo;ve shipped
            </h2>
          </ScrollReveal>
        </Parallax>

        <ScrollReveal className="mt-12 border-t border-surf-3 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3
              className="font-display text-xl leading-tight text-text-hi sm:text-2xl"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Rustaq Municipality — Food Control &amp; Licensing
            </h3>
          </div>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-text-low sm:text-sm">
            May – Aug 2025 · Freelance · Oman · Remote
          </p>

          <StaggerReveal as="ul" className="mt-4 flex flex-wrap gap-2">
            {RUSTAQ_STACK.map((item) => (
              <li
                key={item}
                className="rounded border border-surf-3 px-2 py-1 font-mono text-xs text-text-low"
              >
                {item}
              </li>
            ))}
          </StaggerReveal>

          {/* "The loudest element in this section." */}
          <ScrollReveal
            variant="scale"
            delay={0.1}
            className="mt-8 flex flex-wrap gap-x-10 gap-y-4 rounded-lg bg-surf-1 px-6 py-6 sm:px-8"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <CountUp
                  value={stat.value}
                  className="font-display text-3xl text-lamp sm:text-4xl"
                  style={{ fontVariationSettings: fontVariation.heading }}
                />
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-text-low">
                  {stat.label}
                </p>
              </div>
            ))}
          </ScrollReveal>

          <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-text-mid sm:text-lg">
            A Django system for food-safety inspections in Oman, live and still in
            daily use. I restructured the database into a two-tier
            company-and-branches model, migrated legacy data out of three
            formats, and built the reporting layer that aggregates four
            inspection types across three periods.
          </p>

          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-text-mid sm:text-md">
            <span className="font-medium text-text-hi">Two decisions worth naming.</span>{' '}
            Permissions are modelled as a branch-scoped hierarchy with three
            tiers, not per-user flags — adding a branch is config, not code.
            And replacing free-text fields with validated inputs was the
            actual fix for reporting: the numbers never reconciled because
            the data going in was unconstrained.
          </p>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <a
              href="https://kaboelnaga.pythonanywhere.com/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
            >
              Live (login required)
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
            </a>
            <a
              href="https://github.com/KAboelnaga/municipal-system"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
            >
              view repo
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="right" className="mt-14 border-t border-surf-3 pt-8" delay={0.1}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3
              className="font-display text-lg text-text-hi sm:text-xl"
              style={{ fontVariationSettings: fontVariation.heading }}
            >
              Independent Developer
            </h3>
            <p className="font-mono text-xs text-text-low sm:text-sm">Sep 2025 – Present</p>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-text-mid sm:text-md">
            Rebuilt the PneumoXpert frontend as a proper component
            architecture, redeployed its inference container, and worked
            through a Spring Boot REST API while learning Java.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
