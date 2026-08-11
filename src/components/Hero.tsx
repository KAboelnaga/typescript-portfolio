import { lazy, Suspense, useRef } from 'react';
import { fontVariation } from '../theme/tokens';
import { AboutMeContent } from './AboutMeContent';
import { CodeWordsOverlay } from './CodeWordsOverlay';
import { useTheme } from '../theme/ThemeContext';

// Lazy, not a static import — three/@react-three/fiber/@react-three/drei
// (the whole scenes/ tree pulls them in) were the bulk of the single
// ~1.3MB JS bundle a build warning kept flagging. Real-world network
// transfer was never the actual problem (measured against the live
// deploy: 411KB gzipped, 656ms load) — mobile *execution* was: Lighthouse
// mobile score 50, Time to Interactive 15.5s, `bootup-time`/
// `mainthread-work-breakdown` both scoring 0, because all of that JS had
// to parse and run on a throttled mobile CPU before anything (including
// this file's own plain DOM text below) could respond to input. Splitting
// it into its own chunk lets the name/title/nav become interactive
// immediately; the 3D canvas mounts a moment later once its chunk
// fetches, same as it already waits for the character model itself to
// load (`fallback={null}` — safe since Scene is a pure background layer
// behind this component's own DOM text, not something with layout the
// rest of the page depends on).
const Scene = lazy(() => import('../scenes/Scene').then((m) => ({ default: m.Scene })));

export function Hero() {
  // Read for the name/title text-shadow below — see that comment for why
  // this can't be a fixed dark color.
  const { colors } = useTheme();
  // Pinned for the whole scroll sequence — intro turn, entrance text, About
  // Me, monitor approach, black pass-through, code words — see
  // HeroTimeline.tsx. Full viewport height per Kareem's request, not the
  // old 90svh.
  const pinRef = useRef<HTMLDivElement>(null);

  // Entrance text (name). Starts visible in the static markup — safe
  // fallback if JS never runs — then HeroTimeline hides and re-reveals it
  // on scroll once it initializes.
  const nameRef = useRef<HTMLDivElement>(null);
  // Title + tagline + availability line — its own scroll beat, separate
  // from the name. A div (not a single paragraph) since CONTENT.md's copy
  // needs three distinct lines fading in/out together as one unit.
  const titleRef = useRef<HTMLDivElement>(null);
  // About Me and the code-words overlay both default hidden (opacity-0)
  // rather than the visible-then-hide pattern above: they physically
  // overlap the entrance text's screen position, so both being visible by
  // default would garble together. Secondary/decorative content —
  // acceptable to require JS, unlike the name.
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const codeWordsRef = useRef<HTMLDivElement>(null);
  // "In the first black screen, make a welcoming message appear when the
  // scroll is ready to be made" — fades in once HeroTimeline's ScrollTrigger
  // actually exists (not just on mount; the model still has to load first),
  // fades back out the instant real scrolling starts. Starts hidden in
  // static markup — no flash before JS decides it's actually ready.
  const welcomeRef = useRef<HTMLDivElement>(null);

  return (
    <header ref={pinRef} className="relative h-[100svh] overflow-hidden">
      <Suspense fallback={null}>
        <Scene
          pinRef={pinRef}
          nameRef={nameRef}
          titleRef={titleRef}
          aboutMeRef={aboutMeRef}
          codeWordsRef={codeWordsRef}
          welcomeRef={welcomeRef}
        />
      </Suspense>

      <div
        ref={welcomeRef}
        className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex flex-col items-center gap-2 opacity-0 sm:bottom-24"
      >
        <p className="font-mono text-base font-bold uppercase tracking-[0.3em] text-text-hi sm:text-lg">
          Scroll to begin
        </p>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-text-hi" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* "Mobile needs a lot of modifications" — real bug found in the
          investigation: on narrow viewports this text block spans nearly
          the full width (max-w-3xl only matters once the viewport is
          wider than it), so it sits directly on top of the character
          instead of clear of him the way it is on desktop's much wider
          frame. A per-breakpoint camera reframe would be the "real" fix
          but is a much bigger, riskier change to a sequence that's
          already been tuned a lot (see timeline.ts's history) — this is
          the safe, purely-additive version: a text-shadow strong enough
          to stay legible regardless of what's behind it, inherited down
          to every line in this block rather than repeated per element.
          "The text in the hero and about in light mode are bad colored"
          — real regression from that first fix: it hardcoded a *dark*
          shadow color, which fogged this theme's own *dark* text
          (`text-hi`/`text-mid` in light mode) into an illegible grey
          smudge instead of protecting it. Uses `colors.void` — the
          theme's own page-background color — instead of a fixed value,
          so the halo is dark in dark mode (where the text is light and
          needs protection from lit monitor/desk areas) and light in
          light mode (where the text is dark and needs protection from
          the character, who stays a dark silhouette in both themes). */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16"
        style={{ textShadow: `0 2px 20px ${colors.void}, 0 1px 4px ${colors.void}` }}
      >
        <div className="w-full max-w-3xl">
          <div ref={nameRef}>
            <h1
              className="font-display text-3xl leading-[0.95] text-text-hi md:text-4xl"
              style={{ fontVariationSettings: fontVariation.name }}
            >
              Kareem Aboelnaga
            </h1>
          </div>

          <div ref={titleRef} className="mt-4">
            <p className="font-body text-lg text-text-mid sm:text-xl">Full-Stack Developer</p>
            <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-text-mid sm:text-lg">
              I build the systems people use every day — permissions, reporting, admin
              interfaces, Arabic-first.
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-text-low sm:text-sm">
              Alexandria, Egypt · Available immediately · Remote, hybrid, on-site or relocation
            </p>
          </div>
        </div>
      </div>

      <AboutMeContent
        ref={aboutMeRef}
        // pt-28 clears the fixed Navbar — the much-larger heading/paragraph
        // (Kareem: "change the size of the about me to a much larger
        // size") made this block tall enough that plain justify-center
        // pushed its top edge up under the nav pill.
        className="pointer-events-none absolute inset-0 flex flex-col justify-center px-6 pt-28 opacity-0 sm:px-10 lg:px-16"
      />

      <CodeWordsOverlay ref={codeWordsRef} className="pointer-events-none absolute inset-0 z-20" />
    </header>
  );
}
