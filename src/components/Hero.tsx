import { useRef } from 'react';
import { fontVariation } from '../theme/tokens';
import { Scene } from '../scenes/Scene';
import { AboutMeContent } from './AboutMeContent';
import { CodeWordsOverlay } from './CodeWordsOverlay';
import { ProjectsGlimpseOverlay } from './ProjectsGlimpseOverlay';

export function Hero() {
  // Pinned for the whole scroll sequence — intro turn, entrance text, About
  // Me, monitor approach, black pass-through, code words — see
  // HeroTimeline.tsx. Full viewport height per Kareem's request, not the
  // old 90svh.
  const pinRef = useRef<HTMLDivElement>(null);

  // Entrance text (name + location tag). Starts visible in the static
  // markup — safe fallback if JS never runs — then HeroTimeline hides and
  // re-reveals it on scroll once it initializes.
  const nameRef = useRef<HTMLDivElement>(null);
  // "Software Engineer" — its own scroll beat, separate from the name.
  const titleRef = useRef<HTMLParagraphElement>(null);
  // About Me and the code-words overlay both default hidden (opacity-0)
  // rather than the visible-then-hide pattern above: they physically
  // overlap the entrance text's screen position, so both being visible by
  // default would garble together. Secondary/decorative content —
  // acceptable to require JS, unlike the name.
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const codeWordsRef = useRef<HTMLDivElement>(null);
  const projectsGlimpseRef = useRef<HTMLDivElement>(null);
  // "In the first black screen, make a welcoming message appear when the
  // scroll is ready to be made" — fades in once HeroTimeline's ScrollTrigger
  // actually exists (not just on mount; the model still has to load first),
  // fades back out the instant real scrolling starts. Starts hidden in
  // static markup — no flash before JS decides it's actually ready.
  const welcomeRef = useRef<HTMLDivElement>(null);

  return (
    <header ref={pinRef} className="relative h-[100svh] overflow-hidden">
      <Scene
        pinRef={pinRef}
        nameRef={nameRef}
        titleRef={titleRef}
        aboutMeRef={aboutMeRef}
        codeWordsRef={codeWordsRef}
        projectsGlimpseRef={projectsGlimpseRef}
        welcomeRef={welcomeRef}
      />

      <div
        ref={welcomeRef}
        className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex flex-col items-center gap-2 opacity-0 sm:bottom-24"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-low sm:text-sm">
          Scroll to begin
        </p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-text-low" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-3xl">
          <div ref={nameRef}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-low sm:text-sm">
              Alexandria, Egypt
            </p>

            <h1
              className="mt-4 font-display text-3xl leading-[0.95] text-text-hi md:text-4xl"
              style={{ fontVariationSettings: fontVariation.name }}
            >
              Kareem Aboelnaga
            </h1>
          </div>

          <p ref={titleRef} className="mt-4 font-body text-lg text-text-mid sm:text-xl">
            Software Engineer
          </p>
        </div>
      </div>

      <AboutMeContent
        ref={aboutMeRef}
        className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 opacity-0 sm:px-10 lg:px-16"
      />

      <CodeWordsOverlay ref={codeWordsRef} className="pointer-events-none absolute inset-0 z-20" />

      <ProjectsGlimpseOverlay
        ref={projectsGlimpseRef}
        className="pointer-events-none absolute inset-0 z-20"
      />
    </header>
  );
}
