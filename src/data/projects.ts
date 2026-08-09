export interface Project {
  slug: string;
  name: string;
  year: string;
  role: string;
  description: string;
  note?: string;
  stack: string[];
  repoUrl?: string;
  // Live deployed URL — when set, the whole card becomes a link there (see
  // ProjectCard.tsx) instead of just the "view repo" line.
  previewUrl?: string;
  // Screenshot shown in a popup beside the card on hover (see
  // ProjectPreviewPopup.tsx). Path under /public, e.g. "/previews/foo.png".
  previewImage?: string;
  // Same popup, video instead of a still image (autoplay/muted/loop). Takes
  // priority over previewImage if both are set.
  previewVideo?: string;
}

export const projects: Project[] = [
  {
    slug: 'zalando-scraper',
    name: 'Zalando.it Product Scraper',
    year: '2026',
    role: 'sole developer',
    description:
      'Async Python scraper for an e-commerce catalog — discovers categories, paginates listings, and extracts structured product data (JSON-LD and framework hydration payloads first, Playwright only for JS-heavy fallback pages), validated with Pydantic and persisted to PostgreSQL via SQLAlchemy.',
    note: 'Built to prefer structured data sources over raw DOM scraping for resilience against page-layout changes.',
    stack: ['Python', 'PostgreSQL', 'Playwright', 'SQLAlchemy'],
    // Public repo (made public 2026-08-09, replacing SIC/XE — see TODO.md).
    // No live URL — it's a CLI/backend tool, nothing to deploy.
    repoUrl: 'https://github.com/KAboelnaga/Scraper',
  },
  {
    slug: 'rustaq-municipality-system',
    name: 'Rustaq Municipality System',
    year: '2025',
    role: 'sole developer · freelance',
    description:
      'Django administration system for a municipality in Oman. Multi-branch hierarchy, tiered permissions, inspection form exports, heavily customized Django Admin in Arabic RTL. Deployed on shared cPanel hosting.',
    stack: ['Django', 'PostgreSQL', 'Arabic RTL'],
    // Public repo, confirmed 2026-08-09 (github.com/KAboelnaga/municipal-system).
    // No live URL — the repo's own README notes client-identifying details
    // were removed for the portfolio version, and GitHub's "About" section
    // lists no homepage, so there's nothing public to link/screenshot.
    repoUrl: 'https://github.com/KAboelnaga/municipal-system',
  },
  {
    slug: 'pet-society',
    name: 'Pet Society',
    year: '2024',
    role: 'full-stack, team project',
    description: 'React and Django app with real-time features via Django Channels.',
    note: 'The WebSocket chat layer was a teammate’s work.',
    stack: ['React', 'Django', 'Channels', 'WebSockets'],
    // Confirmed live 2026-08-09 via the repo's GitHub "About" section and
    // README (github.com/KAboelnaga/Pet_Society).
    repoUrl: 'https://github.com/KAboelnaga/Pet_Society',
    previewUrl: 'https://pet-society-silk.vercel.app',
    // Captured directly from the live URL above via Playwright — it's the
    // sign-in screen (the app's behind auth, no demo account to log in
    // with), not an in-app shot. Real and accurate, just not the most
    // flattering preview — swap for a logged-in screenshot if you have one.
    previewImage: '/previews/pet-society.png',
  },
];
