import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { onPinsReady } from './scenes/contactReady.ts'

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
// The single call above turned out not to be enough on its own — "the page
// goes to the flying text on reload" was a real, reproducible case
// (confirmed via a fast reload right after real scroll input, not a slow
// one — a slow reload with time to settle before checking didn't show it,
// which is why this was easy to miss): the browser still restores the old
// scroll position *after* this script runs, `scrollRestoration` setting
// notwithstanding, and nothing ever corrected it back. Reasserted twice
// more: once on `load` (fires after every resource, later than whatever's
// doing the late restore), and once via `onPinsReady` — the exact moment
// Hero's and Contact's pin spacers both exist and the page actually
// reaches its real full height, which is the other point a delayed/retried
// browser restore could finally "land" successfully once the page is
// finally tall enough to contain the old offset.
window.addEventListener('load', () => window.scrollTo(0, 0));
onPinsReady(() => window.scrollTo(0, 0));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
