import { notFound } from "next/navigation";
import { SlideEditor } from "@/components/admin/courses/SlideEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth/roles";
import { getAdminCourse, getAdminSlide } from "@/lib/data/admin-courses";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit slide" };

export default async function EditSlide({ params }: PageProps<"/[locale]/admin/courses/[course]/slides/[id]">) {
  await requireAdmin();
  const { course, id } = await params;
  const [data, slide] = await Promise.all([getAdminCourse(course), getAdminSlide(id)]);
  if (!data || !slide || slide.state.course !== course) notFound();
  const modules = data.modules.map((m) => ({ id: m.id, title: m.title.en || m.slug }));

  return (
    <>
      <PageTitle title={slide.state.title.en || slide.state.slug} back={{ href: `/admin/courses/${course}`, label: data.course.title.en || course }} />
      <SlideEditor key={slide.meta.updatedAt} initial={slide.state} meta={slide.meta} modules={modules} />
    </>
  );
}
