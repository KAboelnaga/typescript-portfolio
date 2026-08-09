import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { fontVariation } from '../theme/tokens';
import { HERO_SCROLL_PIN_VH, HERO_BEATS } from '../scenes/timeline';

gsap.registerPlugin(ScrollToPlugin);

// How fast a nav jump travels, in px/second of real scroll distance — a
// fixed duration would make "Home -> Contact" feel identical in speed to
// "About -> Projects" despite covering far more ground; scaling by distance
// keeps it reading as "fast forward through the animations," per Kareem's
// ask, rather than a jump-cut regardless of gap size. Slowed down (2400 ->
// 1800 px/s, MAX_DURATION 3.4 -> 4.5) along with everything else — "make
// the animations a bit slower so people can see the objects rotating" —
// long jumps were blurring straight through the rotation-heavy beats.
const PIXELS_PER_SECOND = 1800;
const MIN_DURATION = 0.9;
const MAX_DURATION = 4.5;

function elementTop(id: string) {
  const el = document.getElementById(id);
  if (!el) return 0;
  return el.getBoundingClientRect().top + window.scrollY;
}

// "About" has no DOM element of its own to scroll to — it's a beat inside
// the Hero pin's scrubbed timeline (see timeline.ts). Converting its
// progress fraction into a scroll offset works because the pin's spacer
// starts at document top (Hero is the first element on the page): scrollY
// within the pin range is just pinDistance * progress.
function heroBeatScrollTarget(beat: readonly [number, number]) {
  const progress = (beat[0] + beat[1]) / 2;
  const pinDistance = window.innerHeight * (HERO_SCROLL_PIN_VH / 100);
  return pinDistance * progress;
}

interface NavItem {
  id: string;
  label: string;
  target: () => number;
}

/**
 * "Create a navbar that if I click on it fast forward the animations to the
 * desired section and way back in the same way." Rather than a hard jump,
 * each click GSAP-animates `window.scrollTo` toward the destination over a
 * duration proportional to the distance — since every pinned scene is
 * scroll-scrubbed (see HeroTimeline/ContactTimeline), animating the actual
 * scroll position plays the intro turn / monitor zoom / etc. visibly along
 * the way, in whichever direction gets you there, exactly like scrolling by
 * hand would, just faster and hands-off.
 */
export function Navbar() {
  const [active, setActive] = useState('home');
  const scrollTween = useRef<gsap.core.Tween | null>(null);

  const items: NavItem[] = useMemo(
    () => [
      { id: 'home', label: 'Intro', target: () => 0 },
      { id: 'about', label: 'About', target: () => heroBeatScrollTarget(HERO_BEATS.aboutMeHold) },
      { id: 'projects', label: 'Projects', target: () => elementTop('projects') },
      { id: 'other-projects', label: 'Also built', target: () => elementTop('other-projects') },
      { id: 'experience', label: 'Experience', target: () => elementTop('experience') },
      { id: 'contact', label: 'Contact', target: () => elementTop('contact') },
    ],
    [],
  );

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY + window.innerHeight * 0.3;
        let current = items[0].id;
        for (const item of items) {
          if (item.target() <= y) current = item.id;
        }
        setActive(current);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  const goTo = useCallback((getTarget: () => number, id: string) => {
    const targetY = Math.max(0, getTarget());
    const distance = Math.abs(targetY - window.scrollY);
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, distance / PIXELS_PER_SECOND));
    scrollTween.current?.kill();
    scrollTween.current = gsap.to(window, {
      duration,
      scrollTo: { y: targetY, autoKill: true },
      ease: 'power2.inOut',
    });
    setActive(id);
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
    >
      <div className="flex items-center gap-1 rounded-full border border-surf-3 bg-void/70 px-1.5 py-1.5 backdrop-blur">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(item.target, item.id)}
            aria-current={active === item.id ? 'true' : undefined}
            style={active === item.id ? { fontVariationSettings: fontVariation.heading } : undefined}
            className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-300 focus-visible:outline-none sm:text-xs ${
              active === item.id
                ? 'bg-surf-2 text-signal'
                : 'text-text-low hover:text-text-hi focus-visible:text-text-hi'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
