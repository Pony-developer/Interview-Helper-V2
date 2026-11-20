import { notFound } from "next/navigation";
import { LectureEditor } from "@/components/admin/LectureEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth/roles";
import { getLectureState, skillOptions } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/lectures/[slug]">) {
  return { title: (await params).slug };
}

export default async function EditLecture({ params }: PageProps<"/[locale]/admin/lectures/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const [lecture, skills] = await Promise.all([getLectureState(slug), skillOptions()]);
  if (!lecture) notFound();

  return (
    <>
      <PageTitle title={lecture.state.title.en || slug} back={{ href: "/admin/lectures", label: "All lectures" }} />
      <LectureEditor key={lecture.meta.updatedAt} initial={lecture.state} meta={lecture.meta} create={false} skillOptions={skills} />
    </>
  );
}
