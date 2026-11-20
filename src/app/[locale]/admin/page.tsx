import { BookOpen, Code2, ListChecks, Tags } from "lucide-react";
import { btn } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/PageTitle";
import { Link } from "@/i18n/navigation";
import { PRACTICE_TEMPLATES } from "@/lib/admin/templates";
import { requireAdmin } from "@/lib/auth/roles";
import { contentCounts } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const c = await contentCounts();
  const stats = [
    {
      label: "Published quizzes",
      value: c.quizzes,
      href: "/admin/tasks?kind=quiz",
    },
    {
      label: "Published practice tasks",
      value: c.practice,
      href: "/admin/tasks?kind=practice",
    },
    {
      label: "Unpublished tasks",
      value: c.unpublished,
      href: "/admin/tasks?status=unpublished",
    },
    { label: "Lectures", value: c.lectures, href: "/admin/lectures" },
    { label: "Skills", value: c.skills, href: "/admin/skills" },
    {
      label: "Tasks edited here",
      value: c.edited,
      href: "/admin/tasks?source=admin",
    },
  ];

  return (
    <>
      <PageTitle title="Content admin" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="block rounded-2xl border border-paper-3 bg-white p-5 shadow-card transition hover:border-forest-600"
            >
              <p className="font-display text-3xl font-bold text-forest-800">{s.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-lg font-bold text-forest-800">Create</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-paper-3 bg-white p-5 shadow-card">
          <p className="flex items-center gap-2 font-semibold">
            <ListChecks aria-hidden className="h-5 w-5 text-gold-600" /> Quiz
          </p>
          <p className="mt-1 text-sm text-ink-muted">Single or multiple choice, with an optional code snippet.</p>
          <Link href="/admin/tasks/new?kind=quiz" className={`${btn.primary} mt-4`}>
            New quiz
          </Link>
        </div>
        <div className="rounded-2xl border border-paper-3 bg-white p-5 shadow-card">
          <p className="flex items-center gap-2 font-semibold">
            <Code2 aria-hidden className="h-5 w-5 text-gold-600" /> Practice task
          </p>
          <p className="mt-1 text-sm text-ink-muted">Live coding with tests, starting from a template.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRACTICE_TEMPLATES.map((t) => (
              <Link key={t.id} href={`/admin/tasks/new?kind=practice&template=${t.id}`} className={btn.secondary}>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-paper-3 bg-white p-5 shadow-card">
          <p className="flex items-center gap-2 font-semibold">
            <BookOpen aria-hidden className="h-5 w-5 text-gold-600" /> Lecture &amp; skill
          </p>
          <p className="mt-1 text-sm text-ink-muted">Markdown lectures in English and Ukrainian, and new skills for the picker.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/admin/lectures/new" className={btn.primary}>
              New lecture
            </Link>
            <Link href="/admin/skills/new" className={btn.secondary}>
              <Tags aria-hidden className="h-4 w-4" /> New skill
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-12 max-w-3xl text-sm text-ink-muted">
        Changes go live immediately. Content you save here is marked <strong>admin</strong>, and <code>npm run db:push</code> won&apos;t
        overwrite it with the version in <code>content/</code>. Content still marked <strong>repo</strong> keeps following the repository.
      </p>
    </>
  );
}
