import { useEffect, useState } from 'react';
import { onPinsReady } from '../scenes/contactReady';

// Full-page loading screen, not just a bar — "I meant for the loading bar
// to be in the center of the page, take the full width and height of the
// page with a status bar and a percentage" (2026-08-11, revising the
// original minimal top-of-page version). "Ready" reuses `onPinsReady` —
// the same "Hero's and Contact's scroll pins both exist" signal main.tsx
// already waits on before trusting the page's real height (see
// contactReady.ts) — it's the earliest point the layout below the fold
// (now lazy-loaded, see App.tsx) is actually in place, so it doubles as
// "loading is done" here too.
//
// Progress before that point isn't tracking real bytes (nothing here does
// a fetch), just an indeterminate "still working" crawl toward a ceiling
// it never reaches on its own — approaching 90% asymptotically rather than
// jumping straight there reads as active rather than stuck.
const TICK_MS = 200;
const APPROACH_FRACTION = 0.12;
const CEILING = 90;
const FADE_MS = 400;

export function PageLoadingBar() {
  const [progress, setProgress] = useState(4);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => onPinsReady(() => setReady(true)), []);

  useEffect(() => {
    if (ready) return;
    const id = window.setInterval(() => {
      setProgress((p) => p + (CEILING - p) * APPROACH_FRACTION);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    setProgress(100);
    const id = window.setTimeout(() => setVisible(false), FADE_MS);
    return () => window.clearTimeout(id);
  }, [ready]);

  if (!visible) return null;

  const percent = Math.round(progress);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-void"
      style={{ opacity: ready ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-low">Loading</p>
      <div className="h-1 w-56 overflow-hidden rounded-full bg-surf-2 sm:w-72">
        <div
          className="h-full rounded-full bg-signal"
          style={{ width: `${progress}%`, transition: `width ${TICK_MS}ms linear` }}
        />
      </div>
      <p className="font-mono text-sm tabular-nums text-text-mid">{percent}%</p>
    </div>
  );
}
