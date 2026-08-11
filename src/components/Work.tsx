import { fontVariation } from '../theme/tokens';
import { ScrollReveal } from './ScrollReveal';
import { StaggerReveal } from './StaggerReveal';
import { Parallax } from './Parallax';
import { CountUp } from './CountUp';

const RUSTAQ_STACK = ['Django', 'Django Admin', 'SQLite', 'Apache', 'Arabic RTL', 'Shared hosting'];

const STATS = [
  { value: '1,069', label: 'facilities managed' },
  { value: '7,716', label: 'inspection reports' },
  { value: '13', label: 'active users' },
];

/**
 * "Where I've shipped" — sourced from CONTENT-LIVE.md (2026-08-11), a
 * rewrite of the original CONTENT.md pass. Rustaq gets a full case-study
 * treatment (stat strip, named decisions) rather than a project-grid card,
 * since it's real client work still live in production, not a portfolio
 * piece. Independent Developer stays deliberately small underneath it
 * ("two sentences maximum... it shouldn't compete with it," per CONTENT.md).
 *
 * Rewritten substantially per CONTENT-LIVE.md's own review of the first
 * pass: four body paragraphs now (was two) — the longest block on the
 * site, deliberately, since everything else is compressed precisely so
 * this can breathe. Adds a second engagement ("2026 · solo rebuild" —
 * Kareem went back a year later, alone, and refactored into modules,
 * added an English interface, and built notifications/task-routing), an
 * outcome line under the stats strip, a real inline screenshot from the
 * demo instance (not hover-gated — "the strongest proof on the page
 * shouldn't need a discovery step"), and swaps the vague "Live (login
 * required)" link for actual read-only demo credentials Kareem provided.
 * No repo link — the codebase is the client's, private.
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
            May – Aug 2025 · Freelance · Oman · Remote — 2026 · solo rebuild
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

          <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-text-mid">
            Reports that never reconciled now do — the free-text fields that caused it are
            gone, and three source formats are consolidated into one system.
          </p>

          {/* Real screenshot from the read-only demo instance, not the
              hover-only popup the smaller project cards use below — "the
              strongest proof on the page and shouldn't need a discovery
              step." */}
          <img
            src="/previews/rustaq-dashboard.png"
            alt="Rustaq Municipality system dashboard, showing bilingual Arabic/English stat cards for facilities, forms, users and inspections"
            className="mt-6 w-full rounded-lg border border-surf-3"
            loading="lazy"
          />

          <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-text-mid sm:text-lg">
            A Django system for food-safety inspections and licensing in Oman, live and
            still in daily use. Built with one other engineer over four months, pairing
            on every feature and fix, and delivered remotely — requirements arrived in
            Arabic and reached the client through two formal specification review
            rounds.
          </p>

          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-text-mid sm:text-lg">
            I led the restructure into a two-tier company-and-branches model covering
            1,069 registered facilities, migrating legacy data out of three source
            formats and deduplicating as I went. On top of it: reporting that
            aggregates four inspection outcome types across three periods, two export
            formats, automatic numbering, and date-range filtering across four
            inspection form types.
          </p>

          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-text-mid sm:text-md">
            <span className="font-medium text-text-hi">Two decisions worth naming.</span>{' '}
            Permissions are modelled as a branch-scoped hierarchy — a head office with
            scoped data and three tiers across sub-branches — rather than per-user
            flags, so adding a branch is configuration, not code. And replacing
            free-text entry with three validated input types was the real fix for
            reporting: the totals never reconciled because the data going in was
            unconstrained.
          </p>

          <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-text-mid sm:text-md">
            <span className="font-medium text-text-hi">A year later I went back to it alone.</span>{' '}
            Refactored into modules, added an English interface alongside the Arabic
            one, built a notification system that emails users when a notification
            goes unread, and automated the task routing that sends people straight
            into the step they need to finish.
          </p>

          <div className="mt-5 flex flex-col gap-1">
            <a
              href="https://kaboelnaga.pythonanywhere.com/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex flex-wrap items-baseline gap-x-2 font-mono text-sm text-signal transition-colors duration-300 hover:underline"
            >
              <span className="inline-flex items-center gap-1">
                Try the demo
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
              </span>
              <span className="font-normal text-text-low no-underline">
                — username: visit · password: VisitorPass123
              </span>
            </a>
            <p className="font-mono text-xs text-text-low">
              Separate instance with sample data. Read-only; monthly reports restricted.
            </p>
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
