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
      // Kareem, 2026-08-11: "add DRF to Daily" — spelled out per Kareem's
      // follow-up ("DRF stands for Django REST Framework, change it").
      'Django REST Framework',
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
      // CONTENT-LIVE.md (2026-08-11): "TypeScript moved up from Learning
      // — this site is a TypeScript React Three Fiber build, leaving it
      // in Learning while shipping it undersells you."
      'TypeScript',
      // Kareem, 2026-08-11: "add Gunicorn/WSGI, Context API, React Hook
      // Form, SCSS, HTML5/CSS3, Three.js and GSAP to Comfortable." Split
      // "HTML5/CSS3" into two real tags — HTML5 and CSS3 each have their
      // own separate brand mark, and cramming two logos into one pill
      // isn't something SkillIcon supports (one path per tag). Named
      // "CSS" not "CSS3" to match the actual logo used (see
      // skillIcons.ts) — simple-icons doesn't carry the old W3C "CSS3"
      // shield under that name, and mislabeling a different mark as
      // "CSS3" would be its own small dishonesty.
      'Gunicorn/WSGI',
      'Context API',
      'React Hook Form',
      'SCSS',
      'HTML5',
      'CSS',
      'Three.js',
      'GSAP',
    ],
  },
  {
    tier: 'Learning',
    skills: ['Java', 'Spring Boot'],
  },
  // Kareem, 2026-08-11: "restore the Concepts row with role-based access
  // control leading it." Broader patterns/competencies rather than
  // specific tools — a separate axis from the Daily/Comfortable/Learning
  // proficiency ladder above, not another rung on it.
  {
    tier: 'Concepts',
    skills: ['Role-based access control'],
  },
];
