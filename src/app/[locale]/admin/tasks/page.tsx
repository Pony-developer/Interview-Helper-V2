import { GraduationCap, Plus } from "lucide-react";
import { btn, inputCls, SourceBadge } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/PageTitle";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/roles";
import { listTasks } from "@/lib/data/admin";
import { FRAMEWORK_CONFIG, FRAMEWORKS, type Framework } from "@/lib/playground/frameworks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tasks" };

const OUTPUT_LABELS: Record<string, string> = { csharp: "C#", sql: "PostgreSQL" };

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminTasks({ searchParams }: PageProps<"/[locale]/admin/tasks">) {
  await requireAdmin();
  const sp = await searchParams;
  const f = {
    q: one(sp.q).trim().toLowerCase(),
    kind: one(sp.kind),
    framework: one(sp.framework),
    skill: one(sp.skill),
    status: one(sp.status),
    source: one(sp.source),
  };
  const all = await listTasks();
  const allSkills = [...new Set(all.flatMap((t) => t.skills))].sort();

  const tasks = all.filter(
    (t) =>
      (!f.q || t.slug.includes(f.q) || t.title.toLowerCase().includes(f.q)) &&
      (!f.kind || t.kind === f.kind) &&
      (!f.framework || t.framework === f.framework) &&
      (!f.skill || t.skills.includes(f.skill)) &&
      (!f.status || (f.status === "published") === t.published) &&
      (!f.source || t.source === f.source),
  );

  return (
    <>
      <PageTitle title="Quizzes & practice">
        <Link href="/admin/tasks/import" className={btn.secondary}>
          <GraduationCap aria-hidden className="h-4 w-4" /> Import from course
        </Link>
        <Link href="/admin/tasks/new?kind=quiz" className={btn.primary}>
          <Plus aria-hidden className="h-4 w-4" /> Quiz
        </Link>
        <Link href="/admin/tasks/new?kind=practice" className={btn.primary}>
          <Plus aria-hidden className="h-4 w-4" /> Practice
        </Link>
      </PageTitle>

      <form method="get" className="mb-6 grid gap-3 rounded-2xl border border-paper-3 bg-white p-4 sm:grid-cols-3 lg:grid-cols-7">
        <input
          name="q"
          defaultValue={one(sp.q)}
          placeholder="Search slug or title"
          aria-label="Search"
          className={`${inputCls} lg:col-span-2`}
        />
        <select name="kind" defaultValue={f.kind} aria-label="Kind" className={inputCls}>
          <option value="">All kinds</option>
          <option value="quiz">Quiz</option>
          <option value="practice">Practice</option>
        </select>
        <select name="framework" defaultValue={f.framework} aria-label="Framework" className={inputCls}>
          <option value="">Any framework</option>
          {FRAMEWORKS.map((fw) => (
            <option key={fw} value={fw}>
              {FRAMEWORK_CONFIG[fw].label}
            </option>
          ))}
          <option value="csharp">C# (from courses)</option>
          <option value="sql">PostgreSQL (from courses)</option>
        </select>
        <select name="skill" defaultValue={f.skill} aria-label="Skill" className={inputCls}>
          <option value="">Any skill</option>
          {allSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={f.status} aria-label="Status" className={inputCls}>
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
        <div className="flex gap-2">
          {f.source ? <input type="hidden" name="source" value={f.source} /> : null}
          <button type="submit" className={`${btn.secondary} flex-1`}>
            Filter
          </button>
          <Link href="/admin/tasks" className={btn.ghost}>
            Reset
          </Link>
        </div>
      </form>

      <p className="mb-3 text-sm text-ink-muted">
        {tasks.length} of {all.length} tasks
      </p>
      <div className="overflow-x-auto rounded-2xl border border-paper-3 bg-white shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-paper-3 bg-paper-2/60 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Task
              </th>
              <th scope="col" className="px-4 py-3">
                Kind
              </th>
              <th scope="col" className="px-4 py-3">
                Skills
              </th>
              <th scope="col" className="px-4 py-3">
                Level
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.slug} className="border-b border-paper-3 last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/tasks/${t.slug}`} className="font-semibold text-forest-800 hover:underline">
                    {t.title || t.slug}
                  </Link>
                  <p className="font-mono text-xs text-ink-soft">{t.slug}</p>
                </td>
                <td className="px-4 py-3">
                  {t.kind === "quiz" ? "Quiz" : `Practice · ${FRAMEWORK_CONFIG[t.framework as Framework]?.label ?? OUTPUT_LABELS[t.framework ?? ""] ?? t.framework}`}
                </td>
                <td className="px-4 py-3 text-ink-muted">{t.skills.join(", ")}</td>
                <td className="px-4 py-3">{t.complexity}/5</td>
                <td className="px-4 py-3">
                  {t.published ? (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">published</span>
                  ) : (
                    <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">hidden</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SourceBadge source={t.source} />
                </td>
              </tr>
            ))}
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                  No tasks match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
