import { notFound } from "next/navigation";
import { SlideEditor } from "@/components/admin/courses/SlideEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { newSlideState, type SlideKind } from "@/lib/admin/course-forms";
import { requireAdmin } from "@/lib/auth/roles";
import { getAdminCourse } from "@/lib/data/admin-courses";

export const dynamic = "force-dynamic";
export const metadata = { title: "New slide" };

const KINDS: SlideKind[] = ["lecture", "quiz", "practice"];

export default async function NewSlide({ params, searchParams }: PageProps<"/[locale]/admin/courses/[course]/slides/new">) {
  await requireAdmin();
  const { course } = await params;
  const sp = await searchParams;
  const data = await getAdminCourse(course);
  if (!data || data.modules.length === 0) notFound();

  const kind = KINDS.find((k) => k === sp.kind) ?? "lecture";
  const moduleId = data.modules.find((m) => m.id === sp.module)?.id ?? data.modules[0].id;
  const modules = data.modules.map((m) => ({ id: m.id, title: m.title.en || m.slug }));

  return (
    <>
      <PageTitle title={`New ${kind}`} back={{ href: `/admin/courses/${course}`, label: data.course.title.en || course }} />
      <SlideEditor initial={newSlideState(kind, course, moduleId)} modules={modules} />
    </>
  );
}
