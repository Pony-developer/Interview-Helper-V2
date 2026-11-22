import { notFound } from "next/navigation";
import { CourseEditor } from "@/components/admin/courses/CourseEditor";
import { CourseStructure } from "@/components/admin/courses/CourseStructure";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth/roles";
import { getAdminCourse } from "@/lib/data/admin-courses";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/courses/[course]">) {
  return { title: (await params).course };
}

export default async function EditCourse({ params }: PageProps<"/[locale]/admin/courses/[course]">) {
  await requireAdmin();
  const { course } = await params;
  const data = await getAdminCourse(course);
  if (!data) notFound();
  const { source, updatedAt, ...state } = data.course;

  return (
    <>
      <PageTitle title={state.title.en || course} back={{ href: "/admin/courses", label: "All courses" }} />
      <div className="space-y-6">
        <CourseStructure data={data} />
        <CourseEditor key={updatedAt} initial={state} meta={{ source, updatedAt }} create={false} />
      </div>
    </>
  );
}
