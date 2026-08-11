import { lazy, Suspense } from 'react';
import { Hero } from './components/Hero';
import { ScrollControls } from './components/ScrollControls';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { SkipIntro } from './components/SkipIntro';
import { PageLoadingBar } from './components/PageLoadingBar';
import { ThemeProvider } from './theme/ThemeContext';

// Lazy — this widget has its own separate <Canvas> (a mini 3D lightbulb
// model, see ThemeLightbulb.tsx's own three/@react-three imports), and
// was the one thing still pulling three.js into the main bundle even
// after Hero/Contact's scenes went lazy (see those files) — it's
// rendered eagerly here at the App level, outside any Suspense boundary
// of its own. Splitting it out too actually got three.js out of the
// initial chunk (measured: eager, the split barely moved the main
// chunk's size at all — this was why).
const ThemeLightbulb = lazy(() => import('./components/ThemeLightbulb').then((m) => ({ default: m.ThemeLightbulb })));

// Everything below the Hero fold, split into its own chunk per section —
// none of it is needed for first paint (Hero already renders synchronously,
// see Hero.tsx's own comment on why), so there's no reason for any of it to
// share the critical-path bundle with the name/title text that has to be
// interactive immediately. `fallback={null}` on each, same call as Scene/
// ContactScene/ThemeLightbulb above: sections simply pop in as their chunk
// arrives (typically well under a second on a real connection) rather than
// reserving fallback UI space per section — PageLoadingBar is the one
// visible "still loading" signal for all of it.
const Work = lazy(() => import('./components/Work').then((m) => ({ default: m.Work })));
const Projects = lazy(() => import('./components/Projects').then((m) => ({ default: m.Projects })));
const TechSkillsSlider = lazy(() =>
  import('./components/TechSkillsSlider').then((m) => ({ default: m.TechSkillsSlider })),
);
const Skills = lazy(() => import('./components/Skills').then((m) => ({ default: m.Skills })));
const Background = lazy(() => import('./components/Background').then((m) => ({ default: m.Background })));
const Contact = lazy(() => import('./components/Contact').then((m) => ({ default: m.Contact })));
const Footer = lazy(() => import('./components/Footer').then((m) => ({ default: m.Footer })));

// Page order follows CONTENT.md's own top-to-bottom section order, minus
// the standalone About section — "there are 2 about me, I only want the
// first one" (the Hero-pinned beat; see AboutMeContent.tsx). What's left:
// Hero, Work, Projects, Skills, Education/Competitive-programming/
// Languages (combined into Background — see that file for why), Contact.
function App() {
  return (
    <ThemeProvider>
      <PageLoadingBar />
      <Navbar />
      <SkipIntro />
      <Hero />
      <main>
        <Suspense fallback={null}>
          <Work />
        </Suspense>
        <Suspense fallback={null}>
          <Projects />
        </Suspense>
        <Suspense fallback={null}>
          <TechSkillsSlider />
        </Suspense>
        <Suspense fallback={null}>
          <Skills />
        </Suspense>
        <Suspense fallback={null}>
          <Background />
        </Suspense>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <ScrollControls />
      <CustomCursor />
      <Suspense fallback={null}>
        <ThemeLightbulb />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
