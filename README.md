# Assay — mock technical interviews built around your weak spots

Assay is an IT interview preparation tool. Pick the skills you want to train, or paste a job post. Assay then builds a mock interview of quizzes and live coding tasks aimed at the skills you haven't proven yet. The results page shows every answer next to the correct one, plus a grade in **karats** (24K → Raw ore).

- **Next.js 16** (App Router, `proxy.ts`), React 19, TypeScript, Tailwind CSS v4
- **Supabase**: Postgres, Row Level Security, Google sign-in
- **next-intl**: English and Ukrainian (`/` and `/uk`)
- **Sandpack** coding grounds for JavaScript, TypeScript, React and Angular, with a live preview and tests that run inside the preview
- **WebLLM**: on-device skill extraction (WebGPU); the job text never leaves the browser
- Deploys to **Vercel**

## Features

| Page | What it does |
| --- | --- |
| `/` | SEO and accessibility-ready landing page: hero carousel, highlights, how it works, skills map, latest lectures, FAQ |
| `/practice` | Skills picker with four methods: multiselect, job link (keyword parser), job link + on-device AI, pasted text + on-device AI |
| `/practice/analyzing` | Loading screen with real per-stage progress (fetch → parse/AI → history → task selection → assembly), at least 2 s |
| `/interview/[id]` | Stepper with quizzes and coding tasks, a progress rail, a timer, "Ask for help" (opens the lecture in a new tab), skip, and resume |
| `/results/[id]` | Karat grade, per-skill scores, and your answer vs. the correct answer for every task, with explanations |
| `/progress` | Mastery per skill, passed/failed/untried status per task, interview history |
| `/lectures`, `/lectures/[slug]` | Public lecture library (statically generated, in the sitemap) |

### How tasks are chosen

`src/lib/selection/select.ts` (unit-tested):

1. **Mastery per skill.** A Beta-style estimate from your last result on each task. Results are weighted by complexity and by recency (30-day half-life).
2. **Focus skills.** The weakest and least-proven skills, scaled by how prominent they are in the job post. You get 3, 4 or 5 skills depending on interview length.
3. **Slots.** Each focus skill gets slots in proportion to its weakness, at least one each.
4. **Tasks.** Previously failed tasks come first (remediation), then unseen ones. Tasks passed in the last 14 days are skipped. Complexity is matched to your level, shifted by your mastery. About 30% of tasks are coding tasks.
5. **Order.** Easy → hard, and coding tasks are never back to back.

### Grading

- Grading is server-side, in `SECURITY DEFINER` Postgres functions. Quiz answers live in a `private` schema that the API never exposes.
- Each task is weighted by complexity.
- If you opened the lecture for help, the task keeps 85% of its credit.
- Coding tasks earn credit per test passed. Tests always run right before submitting.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. **Google OAuth client.** In Google Cloud Console → APIs & Services → Credentials, create an *OAuth client ID* of type **Web application**:
   - Authorized JavaScript origins: `http://localhost:3000` and your production URL.
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. **Enable Google sign-in.** Supabase → Authentication → Sign In / Providers → **Google**: enable it and paste the client ID and secret. You can disable Email, since Assay only uses Google.
4. **Redirect allow-list.** Supabase → Authentication → URL Configuration:
   - Site URL: your production URL.
   - Redirect URLs: `http://localhost:3000/**` and `https://<your-domain>/**`.

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API) and `NEXT_PUBLIC_SITE_URL`. The app never needs the secret/service-role key.

### 4. Database schema and content

```bash
npx supabase login
```

```bash
npx supabase link --project-ref <project-ref>
```

```bash
npm run seed:build
```

```bash
npm run db:push
```

- `seed:build` validates everything in `content/` and writes `supabase/seed.sql`. The seed is idempotent: rows are upserted by slug.
- `db:push` applies `supabase/migrations/*` and the seed.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000. The public pages work even without Supabase: lectures fall back to the Markdown in `content/`.

> **Offline UI preview (development only).** `/dev/practice` → `/dev/analyzing` → `/dev/interview` runs the picker, loading screen and interview against local content, with mocked server calls and no sign-in. `/dev/playground` shows one coding ground per framework. These routes return 404 in production.

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel. The framework preset is Next.js; keep the defaults.
2. Add the environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL=https://<your-domain>`.
3. Add `https://<your-domain>/**` to the Supabase redirect URLs, and the domain to the Google OAuth origins.

## Content

Content lives in the repository and is seeded into the database:

```
content/
  skills.ts                  # ~220 skills: aliases for the job-post parser, categories, bilingual descriptions
  lectures/<slug>.en.md      # one lecture per core skill, plus
  lectures/<slug>.uk.md      #   its Ukrainian translation (frontmatter: skill, title, summary, readingMinutes)
  tasks/<skill>.ts           # quizzes and coding tasks (typed, validated with zod)
  tasks/index.ts             # registry: add every new task file here
```

**Quiz:**
- `mode` (`single` | `multi`), `options`, `correct`.
- Optional `code` snippet.
- Bilingual `title`, `prompt` and `explanation`.

**Coding task:**
- `framework` (`vanilla-js` | `vanilla-ts` | `react-ts` | `angular`), starter `files`, `tests` and a reference `solution`.
- Tests use the built-in kit: `describe`, `it`, `expect`, `screen`, `user`, `waitFor`. They import user code relative to `/assay/`, e.g. `import { sum } from "../src/sum"`.
- The Angular template is Angular 11 with NgModule (Sandpack's runtime).

Run `npm run seed:build` after editing content. It fails on duplicate slugs or aliases, unknown skills, missing translations, wrong correct-option IDs, or tasks without tests.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Vitest: matcher, selection algorithm, SSRF guard, test kit, and DB schema/RLS/RPCs in PGlite (Postgres in WASM) |
| `npm run test:e2e` | Playwright + axe: public pages in both locales, SEO tags, redirects |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:build` | Validate content → `supabase/seed.sql` |
| `npm run db:push` | Apply migrations + seed to the linked Supabase project |
| `npm run db:types` | Regenerate `src/lib/supabase/database.types.ts` |
| `npm run icons` | Regenerate favicon / apple / PWA icons from `src/app/icon.svg` |

## Security notes

- **RLS everywhere.** The catalogue is public read-only. Interviews, answers and progress are owner-only. All writes beyond creating an interview go through `SECURITY DEFINER` RPCs with ownership checks.
- **Job-page fetching.**
  - Requires sign-in and is rate-limited.
  - http(s) only, standard ports only.
  - DNS is checked at connect time (private, loopback, link-local and metadata ranges are rejected), which also defeats DNS rebinding.
  - Redirects are re-checked on every hop. Responses are capped at 8 s and 1.5 MB.
- **Login redirects.** The `next` parameter must be a same-origin relative path.
- **Trust model for coding tasks.** Test results are reported by the browser, which is fine for a self-preparation tool.

## Design

"Assay" tests the purity of gold, and this app tests your skills before the interview. The look follows a corporate mining aesthetic:

- Deep forest green (`#0B5A43`) with assay gold (`#C9A227`) on warm paper.
- **Unbounded** for display type (wide, with Cyrillic), **IBM Plex Sans/Mono** for body text and code.
- An animated ore-vein hero, a crucible loading screen that fills with molten gold, and karat grade medallions.

All motion respects `prefers-reduced-motion`.
