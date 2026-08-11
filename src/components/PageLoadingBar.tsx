import { useEffect, useState } from 'react';
import { onPinsReady } from '../scenes/contactReady';

// Minimal top progress bar for the page's initial load. "Ready" reuses
// `onPinsReady` — the same "Hero's and Contact's scroll pins both exist"
// signal main.tsx already waits on before trusting the page's real height
// (see contactReady.ts) — it's the earliest point the layout below the
// fold (now lazy-loaded, see App.tsx) is actually in place, so it doubles
// as "loading is done" here too.
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

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      style={{ opacity: ready ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}
    >
      <div
        className="h-full bg-signal"
        style={{ width: `${progress}%`, transition: `width ${TICK_MS}ms linear` }}
      />
    </div>
  );
}
