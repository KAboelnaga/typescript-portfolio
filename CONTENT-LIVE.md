# Live site content (extracted 2026-08-11)

Every piece of visible copy currently on the site, pulled straight from the
component source — not from CONTENT.md (which isn't in this repo; it's
Kareem's own external doc, referenced throughout the code comments but never
committed here). This is the reverse direction: what's actually live right
now, in the site's real top-to-bottom order, so it's easy to read through
and mark up. File paths are given so any edit maps straight to where it
lives in code.

---

## Navbar (`src/components/Navbar.tsx`)

Items, in order: **About · Work · Projects · Skills · Background · Contact · CV**

- "CV" downloads `/CV.pdf` directly, not a scroll link.
- "Skip" button (`src/components/SkipIntro.tsx`), visible only during the Hero intro: **Skip**

---

## Hero (`src/components/Hero.tsx`)

**Welcome message** (shown only at the very top, before first scroll):
> Scroll to begin

**Name** (entrance beat):
> Kareem Aboelnaga

**Title block** (entrance beat, three lines):
> Full-Stack Developer
>
> I build the systems people use every day — permissions, reporting, admin interfaces, Arabic-first.
>
> Alexandria, Egypt · Available immediately · Remote, hybrid, on-site or relocation

---

## About Me (`src/components/AboutMeContent.tsx`)

Eyebrow label: **About me**

Body (the section's only copy now — the restating heading above it was
just removed per your request):
> I build the systems people use every day — permissions, reporting, admin interfaces, Arabic-first. I came up through competitive programming, which is probably why a municipal database restructure didn't scare me: most problems get easier once you find the right way to represent them.

---

## Code words fly-through (`src/scenes/timeline.ts` — `CODE_WORDS`)

Decorative only (generic snippets flying past on a black screen, not meant
to be read) — listed for completeness, not really "content" to revise:
`def handle_request(self):`, `async function fetchData() {`,
`const [state, setState] = useState()`, `SELECT * FROM permissions`,
`class Serializer(ModelSerializer):`, `git commit -m "fix"`,
`try: ... except Exception as e:`, `return JsonResponse(data)`,
`@login_required`, `useEffect(() => { ... })`, `CREATE TABLE workflows (`,
`docker-compose up -d`, `export default function App()`,
`if (user.isAuthenticated) {`, `migrations.RunPython(forwards)`,
`ALTER TABLE orders ADD COLUMN`, `npm run build`,
`const response = await fetch(url)`

**Projects glimpse title card** (`src/components/ProjectsGlimpseOverlay.tsx`), shown right after, still inside the black screen:
> Projects I've built

---

## Work (`src/components/Work.tsx`)

Heading: **Where I've shipped**

### Rustaq Municipality — Food Control & Licensing
Meta line: May – Aug 2025 · Freelance · Oman · Remote
Stack tags: Django, Django Admin, Apache, Arabic RTL

Stats strip:
- **1,069** — facilities managed
- **7,716** — inspection reports
- **13** — active users

Body:
> A Django system for food-safety inspections in Oman, live and still in daily use. I restructured the database into a two-tier company-and-branches model, migrated legacy data out of three formats, and built the reporting layer that aggregates four inspection types across three periods.

> **Two decisions worth naming.** Permissions are modelled as a branch-scoped hierarchy with three tiers, not per-user flags — adding a branch is config, not code. And replacing free-text fields with validated inputs was the actual fix for reporting: the numbers never reconciled because the data going in was unconstrained.

Links: "Live (login required)" → kaboelnaga.pythonanywhere.com · "view repo" → github.com/KAboelnaga/municipal-system

### Independent Developer
Meta line: Sep 2025 – Present
Body:
> Rebuilt the PneumoXpert frontend as a proper component architecture, redeployed its inference container, and worked through a Spring Boot REST API while learning Java.

---

## Projects (`src/components/Projects.tsx`, `src/data/projects.ts`)

Heading: **Things I've built**

### Pet Society — 2025 · team lead
> A social platform for pet owners — posts, following, comments, likes and messaging. Built authentication and the sign-up/login flows, profile pages, and dark mode across the app, plus most of the integration work: merge conflicts, auth bugs, and cross-cutting fixes.

Note: *Real-time messaging was a teammate's work.*
Stack: Django, React, PostgreSQL, Tailwind
Links: live preview → pet-society-silk.vercel.app · repo → github.com/KAboelnaga/Pet_Society

### PneumoXpert — AI Chest X-Ray Analysis — 2026 · frontend & integration
> A React client for a pneumonia classifier that returns heatmap overlays. Rewrote the 2024 original with a reusable component architecture and redeployed the 1.3GB inference container against the new frontend.

Note: *Team graduation project. The model is my team's work — mine is the frontend, integration and deployment.*
Stack: React, Vite, REST API, Docker
Links: live preview → pneumoxpert-2-0.vercel.app · repo → github.com/KAboelnaga/pneumoxpert-2.0

### Movie Discovery App — 2025 · frontend
> A supplied Figma design built as a near pixel-perfect responsive UI on the TMDB API, with dark mode and client-side search and filtering.

Note: *Design supplied as an ITI coursework brief — implementation is mine.*
Stack: React, Bootstrap, TMDB API
Links: live preview → movie-app-mauve-xi.vercel.app · repo → github.com/KAboelnaga/Movie-App

### Django Blog Platform — 2025 · team lead
> Multi-author blog with authentication and role-based permissions on a customized Django admin.

Stack: Django, PostgreSQL, Bootstrap
Links: repo only → github.com/KAboelnaga/Django_Blog_Project (no live demo)

---

## Skills marquee (`src/components/TechSkillsSlider.tsx`)

Decorative, continuously-scrolling list of every skill from the tiers below
— no independent copy of its own.

## Skills (`src/components/Skills.tsx`, `src/data/skills.ts`)

Heading: **What I work with**

- **Daily** — Python, Django, Django Admin, PostgreSQL, REST APIs, React, JavaScript, Git, Linux
- **Comfortable** — FastAPI, Flask, Redux, Vite, Tailwind, Bootstrap, MySQL, SQLite, Docker, Apache, Bash, Unit testing
- **Learning** — Java, Spring Boot, TypeScript

---

## Background (`src/components/Background.tsx`)

Heading: **Background**

### Education
- **B.Sc. Computer Engineering** — AASTMT, 2024 · GPA 3.0
- **ITI — Full Stack Python Track** — Mar – Aug 2025
- **ALX Software Engineering** — Jan – Aug 2025
- **Meta Front-End Certificate** — 2025

### Competitive programming
- **64th** — nationally — ECPC 2020
- **Contestant** — ACPC 2020
- **4th** — AASTMT University Contest 2019

### Languages
- **Arabic** — native
- **English** — professional working proficiency

---

## Contact (`src/components/Contact.tsx`)

Heading: **Get in touch**

Body:
> Available immediately for full-stack work — remote, hybrid, on-site or relocation.

- Email: kaaboelnaga@gmail.com ("copy" button next to it)
- Phone: +20 101 993 2727
- Links: GitHub, LinkedIn, WhatsApp (same number as above), Download CV

Form ("Send me a message"): Name, Email, Message fields; submit button
reads **Send — opens your email client** (no backend — it builds a
`mailto:` link with the message pre-filled, see the open item on making
this a real send in TODO.md).

---

## Footer (`src/components/Footer.tsx`)

> Kareem Aboelnaga

> Built with React, Three.js and TypeScript · Alexandria, {current year}

---

## Not really "content" (behavioral/decorative, listed only for completeness)

- Scroll hint pill: **SCROLL** (`src/components/ScrollControls.tsx`)
- Cursor/theme toggle have no text, just icons.
