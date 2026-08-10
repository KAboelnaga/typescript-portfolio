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
import { ThemeLightbulb } from './components/ThemeLightbulb';
import { ThemeProvider } from './theme/ThemeContext';

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
      <ThemeLightbulb />
    </ThemeProvider>
  );
}

export default App;
