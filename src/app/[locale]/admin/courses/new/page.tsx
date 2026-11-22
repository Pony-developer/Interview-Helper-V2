import { CourseEditor } from "@/components/admin/courses/CourseEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth/roles";
import { newCourseState } from "@/lib/data/admin-courses";

export const dynamic = "force-dynamic";
export const metadata = { title: "New course" };

export default async function NewCourse() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="New course" back={{ href: "/admin/courses", label: "All courses" }} />
      <CourseEditor initial={newCourseState()} create />
    </>
  );
}
