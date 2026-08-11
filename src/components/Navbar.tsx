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

// "About" has no DOM element of its own again — the standalone About
// section was removed ("2 about me... I only want the first one," see
// AboutMeContent.tsx and DONE.md), so this is back to the original
// mid-timeline-progress trick: converting a beat's progress fraction into
// a scroll offset works because the Hero pin's spacer starts at document
// top (Hero is the first element on the page).
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
 *
 * Items follow the site's actual scroll sequence top-to-bottom — "About"
 * (the Hero-pinned About Me beat) happens chronologically *before* Work
 * (it's a beat inside the Hero pin; Work only starts once that pin
 * releases), and Skills/Background never had nav entries at all despite
 * being real sections with their own IDs. Previously ordered `Work ·
 * Projects · About · Contact · CV` (CONTENT.md's original spec, written
 * before Skills/Background existed as separate sections) — "About" points
 * at the Hero-pinned About Me beat's mid-progress scroll offset (the
 * standalone About section it briefly pointed at was removed, see
 * App.tsx). "CV" is a real download link, not a scroll target — rendered
 * as a plain `<a download>` rather than going through `goTo`.
 */
export function Navbar() {
  const [active, setActive] = useState('home');
  const scrollTween = useRef<gsap.core.Tween | null>(null);
  // "Create a navbar for mobile that expands with the hamburger button,
  // with animation" — the pill below scrolls horizontally on narrow
  // viewports (functional, but no affordance hints at it — see TODO.md).
  // Mobile gets its own hamburger button + dropdown panel instead;
  // desktop is unchanged.
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const items: NavItem[] = useMemo(
    () => [
      { id: 'about', label: 'About', target: () => heroBeatScrollTarget(HERO_BEATS.aboutMeHold) },
      { id: 'work', label: 'Work', target: () => elementTop('work') },
      { id: 'projects', label: 'Projects', target: () => elementTop('projects') },
      { id: 'skills', label: 'Skills', target: () => elementTop('skills') },
      { id: 'background', label: 'Background', target: () => elementTop('background') },
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
        // Picking "whichever item's target is the largest value still <= y"
        // rather than "the last matching item in array order" keeps the
        // highlight correct by actual scroll position regardless of array
        // order — still worth doing this way even now that the array order
        // matches the real sequence, since it's the position math that's
        // actually authoritative, not the list order.
        const y = window.scrollY + window.innerHeight * 0.3;
        let current = 'home';
        let bestTarget = -Infinity;
        for (const item of items) {
          const t = item.target();
          if (t <= y && t > bestTarget) {
            bestTarget = t;
            current = item.id;
          }
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

  // Expand/collapse the mobile dropdown — fades/scales the panel in from
  // the hamburger button, then staggers each item in right after (same
  // "reveal the list one piece at a time" idea as StaggerReveal.tsx
  // elsewhere on the site). `display: none` only applied once the close
  // tween finishes, not up front, so the close animation is visible
  // rather than the panel just vanishing.
  useEffect(() => {
    const panel = mobilePanelRef.current;
    if (!panel) return;
    const menuItems = panel.querySelectorAll('[data-mobile-nav-item]');
    gsap.killTweensOf(panel);
    if (mobileOpen) {
      gsap.set(panel, { display: 'flex' });
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: -12, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' },
      );
      gsap.fromTo(
        menuItems,
        { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.04, delay: 0.08, ease: 'power1.out' },
      );
    } else {
      gsap.to(panel, {
        autoAlpha: 0,
        y: -12,
        scale: 0.96,
        duration: 0.2,
        ease: 'power1.in',
        onComplete: () => gsap.set(panel, { display: 'none' }),
      });
    }
  }, [mobileOpen]);

  // Close on outside click/tap and on Escape — standard dropdown
  // expectations, and without this the only way to dismiss it once open
  // is picking a section (or the panel just sits open over the page).
  useEffect(() => {
    if (!mobileOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!mobileNavRef.current?.contains(e.target as Node)) setMobileOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  const goToMobile = useCallback(
    (getTarget: () => number, id: string) => {
      goTo(getTarget, id);
      setMobileOpen(false);
    },
    [goTo],
  );

  // No `focus-visible:outline-none` — it was here, relying on the
  // `focus-visible:text-text-hi` color shift alone as the focus
  // indicator. Found via a real keyboard-Tab pass (not just axe, which
  // doesn't check this): that shift is too subtle to register as "this
  // is now focused," and active items don't even get that since they're
  // already `text-signal`. Site-wide `:focus-visible` (index.css) already
  // gives every other interactive element a real 2px outline — this just
  // stops opting out of it.
  const itemClass = (isActive: boolean) =>
    `shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-[color,background-color,transform] duration-300 hover:scale-105 active:scale-95 sm:text-xs ${
      isActive ? 'bg-surf-2 text-signal' : 'text-text-low hover:text-text-hi focus-visible:text-text-hi'
    }`;

  return (
    <nav
      aria-label="Section navigation"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
    >
      {/* Desktop/tablet: unchanged pill, horizontally scrollable. Two more
          items (Skills, Background) than this pill was originally sized
          for — "rearrange the navbar in the website's sequence" meant
          adding the sections that were missing entirely, not just
          reordering the existing four. That no longer fits one screen's
          width at narrow viewports (About/CV were getting clipped off
          either edge entirely, unreachable) — scrolls horizontally there
          instead of overflowing invisibly; `shrink-0` on each item stops
          flex from squeezing labels illegibly narrow as an alternative to
          scrolling. */}
      <div className="hidden max-w-full items-center gap-1 overflow-x-auto rounded-full border border-surf-3 bg-void/70 px-1.5 py-1.5 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] sm:flex [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(item.target, item.id)}
            aria-current={active === item.id ? 'true' : undefined}
            style={active === item.id ? { fontVariationSettings: fontVariation.heading } : undefined}
            className={itemClass(active === item.id)}
          >
            {item.label}
          </button>
        ))}
        <a href="/CV.pdf" download className={itemClass(false)}>
          CV
        </a>
      </div>

      {/* Mobile: hamburger button + dropdown, replaces the horizontally-
          scrolling pill above (same items, same `goTo`) — "the pill
          scrolls but nothing hints at it" was a real, if minor, gap;
          Kareem asked for a real expand-with-a-hamburger menu instead of
          patching that affordance on. */}
      <div ref={mobileNavRef} className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-surf-3 bg-void/70 backdrop-blur transition-colors duration-300 hover:border-signal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-text-hi">
            {/* Two lines instead of three, morphing into an X — a plain
                swap felt like a flash rather than a real transition. */}
            <path
              d="M4 7h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="origin-center transition-transform duration-300"
              style={mobileOpen ? { transform: 'translateY(5px) rotate(45deg)' } : undefined}
            />
            <path
              d="M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="origin-center transition-transform duration-300"
              style={mobileOpen ? { transform: 'translateY(-5px) rotate(-45deg)' } : undefined}
            />
          </svg>
        </button>

        <div
          ref={mobilePanelRef}
          id="mobile-nav-panel"
          role="menu"
          style={{ display: 'none' }}
          className="invisible absolute left-1/2 top-full mt-2 flex w-48 -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-surf-3 bg-void/90 py-1.5 opacity-0 backdrop-blur"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              data-mobile-nav-item
              onClick={() => goToMobile(item.target, item.id)}
              aria-current={active === item.id ? 'true' : undefined}
              className={`px-4 py-2.5 text-left font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-200 ${
                active === item.id ? 'text-signal' : 'text-text-low hover:text-text-hi'
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/CV.pdf"
            download
            data-mobile-nav-item
            role="menuitem"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-2.5 text-left font-mono text-xs uppercase tracking-[0.15em] text-text-low transition-colors duration-200 hover:text-text-hi"
          >
            CV
          </a>
        </div>
      </div>
    </nav>
  );
}
