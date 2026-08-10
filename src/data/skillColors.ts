// Official (or closest legible) brand colors, keyed to the same names as
// skillIcons.ts — "colorize it to its known logo color" on hover (see
// SkillTag.tsx). Sourced from each project's own brand guidelines, same
// values simple-icons ships. Three exceptions are intentionally lifted off
// the literal hex: Django (092E20), Flask (000000) and SQLite (003B57) are
// all near-black — invisible against this site's near-black dark theme
// background (`void`, #0A0D12) and just as invisible against the near-white
// light theme's #F5F3EF. Each is swapped for a lighter tint from the same
// brand (Django and SQLite both pair their dark mark with a lighter accent
// in their own docs/media kits already); Flask has no real secondary hue,
// so it gets a neutral mid-grey instead of true black. Anything absent here
// (Django Admin, REST APIs, Unit testing) has no real logo, so SkillTag
// skips the colorize effect entirely for it.
export const skillColors: Record<string, string> = {
  Python: '#3776AB',
  Django: '#44B78B',
  PostgreSQL: '#4169E1',
  React: '#61DAFB',
  JavaScript: '#F7DF1E',
  Git: '#F05032',
  Linux: '#FCC624',
  FastAPI: '#009688',
  Flask: '#8C8C8C',
  Redux: '#764ABC',
  Vite: '#646CFF',
  Tailwind: '#06B6D4',
  Bootstrap: '#7952B3',
  MySQL: '#4479A1',
  SQLite: '#3D8DC9',
  Docker: '#2496ED',
  Apache: '#D22128',
  Bash: '#4EAA25',
  Java: '#EA7D25',
  'Spring Boot': '#6DB33F',
  TypeScript: '#3178C6',
};
