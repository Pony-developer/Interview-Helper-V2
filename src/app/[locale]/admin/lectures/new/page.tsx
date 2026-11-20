import { LectureEditor } from "@/components/admin/LectureEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth/roles";
import { newLectureState, skillOptions } from "@/lib/data/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "New lecture" };

export default async function NewLecture({ searchParams }: PageProps<"/[locale]/admin/lectures/new">) {
  await requireAdmin();
  const sp = await searchParams;
  const skill = typeof sp.skill === "string" ? sp.skill : "";

  return (
    <>
      <PageTitle title="New lecture" back={{ href: "/admin/lectures", label: "All lectures" }} />
      <LectureEditor initial={newLectureState(skill)} create skillOptions={await skillOptions()} />
    </>
  );
}
