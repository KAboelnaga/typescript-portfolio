import { lazy, Suspense } from 'react';
import { Hero } from './components/Hero';
import { Work } from './components/Work';
import { Projects } from './components/Projects';
import { TechSkillsSlider } from './components/TechSkillsSlider';
import { Skills } from './components/Skills';
import { Background } from './components/Background';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ScrollControls } from './components/ScrollControls';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { SkipIntro } from './components/SkipIntro';
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

// Page order follows CONTENT.md's own top-to-bottom section order, minus
// the standalone About section — "there are 2 about me, I only want the
// first one" (the Hero-pinned beat; see AboutMeContent.tsx). What's left:
// Hero, Work, Projects, Skills, Education/Competitive-programming/
// Languages (combined into Background — see that file for why), Contact.
function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <SkipIntro />
      <Hero />
      <main>
        <Work />
        <Projects />
        <TechSkillsSlider />
        <Skills />
        <Background />
        <Contact />
      </main>
      <Footer />
      <ScrollControls />
      <CustomCursor />
      <Suspense fallback={null}>
        <ThemeLightbulb />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
