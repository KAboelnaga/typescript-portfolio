import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { OtherProjects } from './components/OtherProjects';
import { Experience } from './components/Experience';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ScrollControls } from './components/ScrollControls';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { TechSkillsSlider } from './components/TechSkillsSlider';
import { ThemeLightbulb } from './components/ThemeLightbulb';
import { ThemeProvider } from './theme/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <Hero />
      <main>
        <Projects />
        <TechSkillsSlider />
        <OtherProjects />
        <Experience />
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
