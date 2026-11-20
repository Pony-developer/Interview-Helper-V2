import { Plus } from "lucide-react";
import { btn, SourceBadge } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/PageTitle";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/roles";
import { listLectures } from "@/lib/data/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lectures" };

export default async function AdminLectures() {
  await requireAdmin();
  const lectures = await listLectures();

  return (
    <>
      <PageTitle title="Lectures">
        <Link href="/admin/lectures/new" className={btn.primary}>
          <Plus aria-hidden className="h-4 w-4" /> Lecture
        </Link>
      </PageTitle>
      <div className="overflow-x-auto rounded-2xl border border-paper-3 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-paper-3 bg-paper-2/60 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Lecture
              </th>
              <th scope="col" className="px-4 py-3">
                Skill
              </th>
              <th scope="col" className="px-4 py-3">
                Reading
              </th>
              <th scope="col" className="px-4 py-3">
                Updated
              </th>
              <th scope="col" className="px-4 py-3">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {lectures.map((l) => (
              <tr key={l.slug} className="border-b border-paper-3 last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/lectures/${l.slug}`} className="font-semibold text-forest-800 hover:underline">
                    {l.title || l.slug}
                  </Link>
                  <p className="font-mono text-xs text-ink-soft">{l.slug}</p>
                </td>
                <td className="px-4 py-3 text-ink-muted">{l.skill?.name ?? "—"}</td>
                <td className="px-4 py-3">{l.readingMinutes} min</td>
                <td className="px-4 py-3 text-ink-muted">{new Date(l.updatedAt).toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <SourceBadge source={l.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
