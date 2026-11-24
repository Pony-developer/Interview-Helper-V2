import { CourseImporter } from "@/components/admin/CourseImporter";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth/roles";
import { lectureOptions, skillOptions } from "@/lib/data/admin";
import { loadImportCatalog } from "@/lib/data/admin-import";

export const dynamic = "force-dynamic";
export const metadata = { title: "Import from a course" };

export default async function ImportFromCourse() {
  await requireAdmin();
  const [courses, skills, lectures] = await Promise.all([loadImportCatalog(), skillOptions(), lectureOptions()]);

  return (
    <>
      <PageTitle title="Import from a course" back={{ href: "/admin/tasks", label: "All tasks" }} />
      <CourseImporter courses={courses} skillOptions={skills} lectureOptions={lectures} />
    </>
  );
}
