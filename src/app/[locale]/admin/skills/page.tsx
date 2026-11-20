import { Plus } from "lucide-react";
import { btn, inputCls, SourceBadge } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/PageTitle";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/roles";
import { SKILL_CATEGORIES } from "@/lib/content/schema";
import { listSkills } from "@/lib/data/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skills" };

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminSkills({ searchParams }: PageProps<"/[locale]/admin/skills">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q).trim().toLowerCase();
  const category = one(sp.category);
  const all = (await listSkills()) ?? [];
  const skills = all.filter(
    (s) => (!q || s.slug.includes(q) || s.name.toLowerCase().includes(q)) && (!category || s.category === category),
  );

  return (
    <>
      <PageTitle title="Skills">
        <Link href="/admin/skills/new" className={btn.primary}>
          <Plus aria-hidden className="h-4 w-4" /> Skill
        </Link>
      </PageTitle>

      <form method="get" className="mb-6 grid gap-3 rounded-2xl border border-paper-3 bg-white p-4 sm:grid-cols-4">
        <input
          name="q"
          defaultValue={one(sp.q)}
          placeholder="Search slug or name"
          aria-label="Search"
          className={`${inputCls} sm:col-span-2`}
        />
        <select name="category" defaultValue={category} aria-label="Category" className={inputCls}>
          <option value="">All categories</option>
          {SKILL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={`${btn.secondary} flex-1`}>
            Filter
          </button>
          <Link href="/admin/skills" className={btn.ghost}>
            Reset
          </Link>
        </div>
      </form>

      <p className="mb-3 text-sm text-ink-muted">
        {skills.length} of {all.length} skills
      </p>
      <div className="overflow-x-auto rounded-2xl border border-paper-3 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-paper-3 bg-paper-2/60 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Skill
              </th>
              <th scope="col" className="px-4 py-3">
                Category
              </th>
              <th scope="col" className="px-4 py-3">
                Tasks
              </th>
              <th scope="col" className="px-4 py-3">
                Popularity
              </th>
              <th scope="col" className="px-4 py-3">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.slug} className="border-b border-paper-3 last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/skills/${s.slug}`} className="font-semibold text-forest-800 hover:underline">
                    {s.name}
                  </Link>
                  <p className="font-mono text-xs text-ink-soft">{s.slug}</p>
                </td>
                <td className="px-4 py-3 text-ink-muted">{s.category}</td>
                <td className="px-4 py-3">
                  {s.has_content ? (
                    <Link href={`/admin/tasks?skill=${s.slug}`} className="text-forest-700 hover:underline">
                      view
                    </Link>
                  ) : (
                    <span className="text-ink-soft">none</span>
                  )}
                </td>
                <td className="px-4 py-3">{s.popularity}</td>
                <td className="px-4 py-3">
                  <SourceBadge source={s.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
