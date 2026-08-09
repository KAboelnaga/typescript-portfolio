export interface ExperienceEntry {
  slug: string;
  org: string;
  role: string;
  period: string;
  description: string;
}

// Newest first, same convention as data/projects.ts and data/otherProjects.ts.
// Built only from facts already established elsewhere on the site
// (AboutMeContent.tsx, data/projects.ts) — not fabricated. Dates/track
// names marked [VERIFY] are genuinely unknown, same convention as
// AboutMeContent.tsx's placeholders. See TODO.md.
export const experience: ExperienceEntry[] = [
  {
    slug: 'open-to-work',
    org: 'Open to opportunities',
    role: 'Backend / Full-stack Engineer',
    period: 'Present',
    description: 'Looking for backend or full-stack work — Python, Django, React.',
  },
  {
    slug: 'rustaq',
    org: 'Freelance',
    role: 'Sole Developer — Rustaq Municipality System',
    period: '2025',
    description:
      'Django administration system for a municipality in Oman: multi-branch hierarchy, tiered permissions, Arabic RTL.',
  },
  {
    slug: 'iti',
    org: 'ITI',
    role: '[VERIFY: track name]',
    period: '[VERIFY: dates]',
    description: '[VERIFY: what this track covered]',
  },
  {
    slug: 'aastmt',
    org: 'AASTMT',
    role: 'B.Sc. Computer Engineering',
    period: '[VERIFY: graduation year]',
    description: 'Computer Engineering graduate.',
  },
];
