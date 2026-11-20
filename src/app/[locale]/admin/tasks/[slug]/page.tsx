import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/PageTitle";
import { TaskEditor } from "@/components/admin/TaskEditor";
import { requireAdmin } from "@/lib/auth/roles";
import { getTaskState, lectureOptions, skillOptions } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/tasks/[slug]">) {
  return { title: (await params).slug };
}

export default async function EditTask({ params }: PageProps<"/[locale]/admin/tasks/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const [task, skills, lectures] = await Promise.all([getTaskState(slug), skillOptions(), lectureOptions()]);
  if (!task) notFound();

  return (
    <>
      <PageTitle title={task.state.title.en || slug} back={{ href: "/admin/tasks", label: "All tasks" }} />
      <TaskEditor
        key={task.meta.updatedAt}
        initial={task.state}
        meta={task.meta}
        create={false}
        skillOptions={skills}
        lectureOptions={lectures}
      />
    </>
  );
}
