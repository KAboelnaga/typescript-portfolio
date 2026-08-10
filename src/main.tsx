import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// "The sequence of scenes breaks when I go back and forth in the
// website, it gets me the last scene right after the first" — root
// cause: the browser's default scroll restoration remembers scrollY from
// before the visitor left the page and snaps back to it the instant
// they return (back/forward nav, or leaving and reopening the tab) —
// but at that instant the model hasn't loaded yet and HeroTimeline/
// ContactTimeline haven't created their `pin: true` ScrollTriggers, so
// the page is still short. The browser clamps the restored scrollY to
// that short page's max, then GSAP never revisits or corrects it once
// the pins actually get created and the real (much taller) layout
// exists — the visitor ends up dropped deep into the Hero pin's
// progress (near its final beats) with zero scrolling of their own.
// Disabling automatic restoration means every load/back-forward always
// starts at the real top, which is what a scroll-scrubbed intro like
// this one needs regardless of scroll history.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
