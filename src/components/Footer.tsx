import { ScrollReveal } from './ScrollReveal';

export function Footer() {
  return (
    <footer className="px-6 py-10 sm:px-10 lg:px-16">
      <ScrollReveal className="mx-auto flex w-full max-w-5xl items-center justify-between border-t border-surf-3 pt-6">
        <p className="font-mono text-xs text-text-low">
          Built with React, Three.js and TypeScript · Alexandria, {new Date().getFullYear()}
        </p>
      </ScrollReveal>
    </footer>
  );
}
