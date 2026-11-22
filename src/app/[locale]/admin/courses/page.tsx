import { Plus } from "lucide-react";
import { btn, SourceBadge } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/PageTitle";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/roles";
import { listAdminCourses } from "@/lib/data/admin-courses";

export const dynamic = "force-dynamic";
export const metadata = { title: "Courses" };

export default async function AdminCourses() {
  await requireAdmin();
  const courses = await listAdminCourses();

  return (
    <>
      <PageTitle title="Courses">
        <Link href="/admin/courses/new" className={btn.primary}>
          <Plus aria-hidden className="h-4 w-4" /> Course
        </Link>
      </PageTitle>
      <div className="overflow-x-auto rounded-2xl border border-paper-3 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-paper-3 bg-paper-2/60 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Course
              </th>
              <th scope="col" className="px-4 py-3">
                Modules
              </th>
              <th scope="col" className="px-4 py-3">
                Slides
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
            {courses.map((c) => (
              <tr key={c.slug} className="border-b border-paper-3 last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/courses/${c.slug}`} className="font-semibold text-forest-800 hover:underline">
                    {c.title}
                  </Link>
                  <p className="font-mono text-xs text-ink-soft">{c.slug}</p>
                </td>
                <td className="px-4 py-3">{c.modules}</td>
                <td className="px-4 py-3">{c.slides}</td>
                <td className="px-4 py-3">
                  {c.published ? (
                    <span className="font-semibold text-success">Published</span>
                  ) : (
                    <span className="font-semibold text-warning">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SourceBadge source={c.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
