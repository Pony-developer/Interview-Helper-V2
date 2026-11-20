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
| `/admin` | Admins only: create and edit quizzes, practice tasks (JavaScript, TypeScript, React, Angular, HTML/CSS), lectures and skills |
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
npm run db:push
```

```bash
npm run db:seed
```

- `db:push` applies `supabase/migrations/*` (and the seed, but only the very first time: the Supabase CLI records seed files it has run and never runs them again).
- `db:seed` runs `seed:build`, which validates everything in `content/` and writes `supabase/seed.sql`, then applies the seed to the linked project. The seed is too large for one request, so `scripts/seed-remote.mjs` splits it into parts and runs them in order. It asks for confirmation first (`npm run db:seed -- --yes` skips the prompt, `-- --dry-run` only writes the parts). The seed is idempotent: rows are upserted by slug, so it's safe to re-run, including after a failed part.

**Publishing content changes later:** edit `content/`, then run `npm run db:seed`. Run `npm run db:push` as well when you've added a migration.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000. The public pages work even without Supabase: lectures fall back to the Markdown in `content/`.

> **Offline UI preview (development only).** `/dev/practice` → `/dev/analyzing` → `/dev/interview` runs the picker, loading screen and interview against local content, with mocked server calls and no sign-in. `/dev/playground` shows one coding ground per framework. These routes return 404 in production.

## User roles

Every user is either `user` (the default) or `admin`. The role lives in `public.profiles.role` and is added by `supabase/migrations/20261119190000_user_roles.sql`.

**Make the first user an admin.** Sign in with Google once, so your account exists, then run:

```bash
npx supabase db query --remote -f supabase/snippets/make-first-user-admin.sql
```

Or paste `supabase/snippets/make-first-user-admin.sql` into Supabase Dashboard → SQL Editor. It promotes the earliest sign-up, is safe to run again, and prints the current admins.

**Change roles later.** A signed-in admin calls the `set_user_role` RPC:

```ts
await supabase.rpc("set_user_role", { p_user_id: userId, p_role: "admin" });
```

It refuses to demote the last remaining admin.

**Guard admin-only server code** with the helpers in `src/lib/auth/roles.ts`:

```ts
import { requireAdmin } from "@/lib/auth/roles";

export default async function AdminPage() {
  await requireAdmin(); // signed out → /login, non-admin → 404
  // ...
}
```

`isAdmin()` returns a boolean, and `getCurrentUser()` returns `{ id, role }` or `null`. Both are cached per request.

**How it is enforced.**
- Users cannot write the `role` column themselves: `authenticated` may update only `display_name` and `avatar_url`.
- `public.is_admin()` is available to RLS policies. Admins can read every profile; everyone else sees only their own.
- The header shows an "Admin" badge, but it is display only. Access is decided by the database and the server helpers.

## Admin panel

Admins open **Admin panel** from the account menu, or go to `/admin`. Signed-out users are sent to the login page, and signed-in non-admins get a 404.

| Page | What it does |
| --- | --- |
| `/admin` | Content counts and shortcuts to create a quiz, practice task, lecture or skill |
| `/admin/tasks` | All quizzes and practice tasks, filterable by kind, framework, skill and status |
| `/admin/tasks/new?kind=quiz` | Quiz editor: bilingual title, prompt and options, an optional code snippet, correct answers and explanation |
| `/admin/tasks/new?kind=practice&template=react` | Practice editor: starter and solution files, tests, framework, dependencies. Templates: `javascript`, `typescript`, `react`, `angular`, `html-css`. **Run with solution** runs the tests in the real coding ground |
| `/admin/lectures` | Markdown lectures in English and Ukrainian, with a live preview |
| `/admin/skills` | Skills for the picker and job-post parser. New skills appear on `/practice` |

**How it works.**
- Every write goes through an admin-only `SECURITY DEFINER` RPC (`admin_save_task`, `admin_save_lecture`, `admin_save_skill`, …) in `supabase/migrations/20261120120000_admin_content.sql`. Clients still have no write access to the catalogue, and quiz answers stay in the `private` schema.
- A task that has been used in an interview can be unpublished but not deleted, so interview history stays intact.
- Saved content goes live right away; the affected pages are revalidated.

**Admin edits and the repository seed.** Catalogue rows have a `source` column: `seed` (from `content/`) or `admin` (saved in the admin panel). `npm run seed:build` generates SQL that only overwrites `seed` rows, so `npm run db:seed` never undoes an admin edit. To hand a row back to the repository, set its `source` to `seed` in SQL; the next seed then overwrites it.

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

Run `npm run seed:build` after editing content, and `npm run db:seed` to publish it. The build fails on duplicate slugs or aliases, unknown skills, missing translations, wrong correct-option IDs, or tasks without tests.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Vitest: matcher, selection algorithm, SSRF guard, test kit, and DB schema/RLS/RPCs in PGlite (Postgres in WASM) |
| `npm run test:e2e` | Playwright + axe: public pages in both locales, SEO tags, redirects |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:build` | Validate content → `supabase/seed.sql` |
| `npm run db:push` | Apply migrations to the linked Supabase project (seeds only on the first push) |
| `npm run db:seed` | Validate content and apply `supabase/seed.sql` to the linked project, in parts |
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
- **Roles.** Users cannot change their own role. Promotions go through the admin-only `set_user_role` RPC, which keeps at least one admin (see [User roles](#user-roles)).
- **Trust model for coding tasks.** Test results are reported by the browser, which is fine for a self-preparation tool.

## Design

"Assay" tests the purity of gold, and this app tests your skills before the interview. The look follows a corporate mining aesthetic:

- Deep forest green (`#0B5A43`) with assay gold (`#C9A227`) on warm paper.
- **Unbounded** for display type (wide, with Cyrillic), **IBM Plex Sans/Mono** for body text and code.
- An animated ore-vein hero, a crucible loading screen that fills with molten gold, and karat grade medallions.

All motion respects `prefers-reduced-motion`.
