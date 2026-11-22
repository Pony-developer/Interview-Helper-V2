-- =====================================================================
-- Courses: long-form tracks (C#, JavaScript) listed on /courses.
--   * Public read for published rows only; nothing else is writable from the client.
--   * Titles, summaries and topics are {en, uk} JSON, like lectures and skills.
-- =====================================================================

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  title jsonb not null,
  summary jsonb not null,
  topics jsonb not null default '[]'::jsonb check (jsonb_typeof(topics) = 'array'),
  sort_order smallint not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Catalog: published courses are public" on public.courses for select to anon, authenticated
  using (published);

grant select on public.courses to anon, authenticated;

insert into public.courses (slug, title, summary, topics, sort_order) values
(
  'csharp',
  $${"en": "C#", "uk": "C#"}$$::jsonb,
  $${"en": "From your first class to async/await: the C# language and the .NET runtime that backend and desktop interviews test.", "uk": "Від першого класу до async/await: мова C# і платформа .NET, які перевіряють на співбесідах для backend- та desktop-ролей."}$$::jsonb,
  $$[
    {"en": "Types, variables and nullable reference types", "uk": "Типи, змінні та nullable-посилання"},
    {"en": "Classes, records and structs", "uk": "Класи, record і struct"},
    {"en": "Interfaces, generics and LINQ", "uk": "Інтерфейси, узагальнення та LINQ"},
    {"en": "async/await and Task", "uk": "async/await і Task"},
    {"en": "Dependency injection and ASP.NET Core", "uk": "Dependency injection та ASP.NET Core"},
    {"en": "Testing with xUnit", "uk": "Тестування з xUnit"}
  ]$$::jsonb,
  1
),
(
  'javascript',
  $${"en": "JavaScript", "uk": "JavaScript"}$$::jsonb,
  $${"en": "The language behind every frontend interview: how values, scope and the event loop really work, from the first line to modern async code.", "uk": "Мова, на якій тримаються всі frontend-співбесіди: як насправді працюють значення, область видимості та event loop, від першого рядка до сучасного асинхронного коду."}$$::jsonb,
  $$[
    {"en": "Values, types and coercion", "uk": "Значення, типи та приведення типів"},
    {"en": "Scope, closures and this", "uk": "Область видимості, замикання та this"},
    {"en": "Prototypes and classes", "uk": "Прототипи та класи"},
    {"en": "Promises, async/await and the event loop", "uk": "Проміси, async/await і event loop"},
    {"en": "Modules and the DOM", "uk": "Модулі та DOM"},
    {"en": "Testing and tooling", "uk": "Тестування та інструменти"}
  ]$$::jsonb,
  2
);
