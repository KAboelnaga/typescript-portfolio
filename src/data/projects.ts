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

// Sourced from CONTENT-LIVE.md (2026-08-11), a rewrite of the original
// CONTENT.md pass. Three projects now, not four — "Django Blog is cut:
// Rustaq already demonstrates auth, roles and customised Django Admin at
// real scale, and the blog invited a comparison it lost." Three across
// also lays out cleanly at every breakpoint (3 columns desktop, 2 tablet,
// 1 mobile). Card copy compressed to ~22 words each to suit the smaller
// three-card format — do not re-expand it, the long versions were written
// for full-width cards. `team lead` dropped from Pet Society too: "with
// the blog cut, that label appeared on one card with nothing to contrast
// against, and 'team project' plus a specific list of what you did says
// more." Put it back only if it was a formally assigned role.
export const projects: Project[] = [
  {
    slug: 'pet-society',
    name: 'Pet Society',
    year: '2025',
    role: 'team project',
    description:
      'Social platform for pet owners. I built auth and the login flows, profile pages, dark mode, and most of the integration and bug-fix work.',
    note: "Real-time messaging was a teammate's work.",
    stack: ['Django', 'React', 'PostgreSQL', 'Tailwind'],
    repoUrl: 'https://github.com/KAboelnaga/Pet_Society',
    previewUrl: 'https://pet-society-silk.vercel.app',
    previewImage: '/previews/pet-society-homepage.png',
  },
  {
    slug: 'pneumoxpert',
    name: 'PneumoXpert — AI Chest X-Ray Analysis',
    year: '2026',
    role: 'frontend & integration',
    description:
      'React client for a pneumonia classifier returning heatmap overlays. Rewrote the 2024 original as reusable components and redeployed its 1.3 GB inference container.',
    note: "Team graduation project — the model is my team's work.",
    stack: ['React', 'Vite', 'REST API', 'Docker'],
    repoUrl: 'https://github.com/KAboelnaga/pneumoxpert-2.0',
    previewUrl: 'https://pneumoxpert-2-0.vercel.app',
    previewImage: '/previews/xray.png',
  },
  {
    slug: 'movie-discovery-app',
    name: 'Movie Discovery App',
    year: '2025',
    role: 'frontend',
    description:
      'A supplied Figma design built as a near pixel-perfect responsive UI on the TMDB API, with dark mode and client-side search and filtering.',
    note: 'Design supplied as an ITI brief — implementation is mine.',
    stack: ['React', 'Bootstrap', 'TMDB API'],
    repoUrl: 'https://github.com/KAboelnaga/Movie-App',
    previewUrl: 'https://movie-app-mauve-xi.vercel.app',
    previewImage: '/previews/movies.png',
  },
];
