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

// Sourced from CONTENT.md (Kareem's own copy doc, 2026-08-09) — replaces
// the earlier three-project grid entirely. Two real changes from before:
// Zalando.it Product Scraper is gone (not in CONTENT.md at all — treated
// as "do not invent filler" rather than kept as a guess), and Rustaq
// Municipality System moved out of this grid into its own Work section
// (see Work.tsx) since CONTENT.md gives it a full case-study treatment,
// not a card. "Team lead" on Pet Society and Django Blog Platform is
// Kareem's direct answer to CONTENT.md's own open question ("yes, team
// lead for both") — Django Blog Platform's drafted "Solo" label was
// provisional and got overridden by that answer.
export const projects: Project[] = [
  {
    slug: 'pet-society',
    name: 'Pet Society',
    year: '2025',
    role: 'team lead',
    description:
      'A social platform for pet owners — posts, following, comments, likes and messaging. Built authentication and the sign-up/login flows, profile pages, and dark mode across the app, plus most of the integration work: merge conflicts, auth bugs, and cross-cutting fixes.',
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
      'A React client for a pneumonia classifier that returns heatmap overlays. Rewrote the 2024 original with a reusable component architecture and redeployed the 1.3GB inference container against the new frontend.',
    note: "Team graduation project. The model is my team's work — mine is the frontend, integration and deployment.",
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
    note: 'Design supplied as an ITI coursework brief — implementation is mine.',
    stack: ['React', 'Bootstrap', 'TMDB API'],
    repoUrl: 'https://github.com/KAboelnaga/Movie-App',
    previewUrl: 'https://movie-app-mauve-xi.vercel.app',
    previewImage: '/previews/movies.png',
  },
  {
    slug: 'django-blog-platform',
    name: 'Django Blog Platform',
    year: '2025',
    role: 'team lead',
    description:
      'Multi-author blog with authentication and role-based permissions on a customized Django admin.',
    stack: ['Django', 'PostgreSQL', 'Bootstrap'],
    repoUrl: 'https://github.com/KAboelnaga/Django_Blog_Project',
    previewImage: '/previews/blog.png',
  },
];
