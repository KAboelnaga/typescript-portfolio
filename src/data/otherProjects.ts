export interface OtherProject {
  slug: string;
  name: string;
  year: string;
  description: string;
  repoUrl?: string;
  previewUrl?: string;
}

// Newest first — lighter-weight mentions, not full case studies.
// Keep this list short; it's a timeline, not a second project grid.
// repoUrl/previewUrl (not a single href) so an entry with both shows both,
// same as data/projects.ts — "the ability of being selected to go to repo
// or live demo if there is one."
export const otherProjects: OtherProject[] = [
  {
    slug: 'pneumoxpert-2',
    name: 'Pneumoxpert 2.0',
    year: '2026',
    description:
      'Solo rewrite of a pneumonia-screening interface — a React client for a Dockerized chest X-ray inference API.',
    previewUrl: 'https://pneumoxpert-2-0.vercel.app',
  },
  {
    slug: 'django-blog-project',
    name: 'Django Blog Project',
    year: '2025',
    description:
      'Django blog platform — category subscriptions with email alerts, comment threads, and a moderation panel.',
    repoUrl: 'https://github.com/KAboelnaga/Django_Blog_Project',
  },
  {
    slug: 'movie-app',
    name: 'Movie App',
    year: '2025',
    description: 'A movie browser built with React and Vite.',
    previewUrl: 'https://movie-app-mauve-xi.vercel.app',
  },
];
