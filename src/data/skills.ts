export interface SkillTier {
  tier: string;
  skills: string[];
}

// Straight from CONTENT.md's own Skills section — the tiering (not a
// percentage bar or proficiency ring) is deliberately the entire signal.
// "No percentage bars. No proficiency rings. The tiering is the honesty."
export const skillTiers: SkillTier[] = [
  {
    tier: 'Daily',
    skills: [
      'Python',
      'Django',
      'Django Admin',
      'PostgreSQL',
      'REST APIs',
      'React',
      'JavaScript',
      'Git',
      'Linux',
    ],
  },
  {
    tier: 'Comfortable',
    skills: [
      'FastAPI',
      'Flask',
      'Redux',
      'Vite',
      'Tailwind',
      'Bootstrap',
      'MySQL',
      'SQLite',
      'Docker',
      'Apache',
      'Bash',
      'Unit testing',
    ],
  },
  {
    tier: 'Learning',
    skills: ['Java', 'Spring Boot', 'TypeScript'],
  },
];
