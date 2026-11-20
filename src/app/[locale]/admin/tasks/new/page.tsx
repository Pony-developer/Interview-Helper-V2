import { PageTitle } from "@/components/admin/PageTitle";
import { TaskEditor } from "@/components/admin/TaskEditor";
import { requireAdmin } from "@/lib/auth/roles";
import { lectureOptions, newTaskState, skillOptions } from "@/lib/data/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "New task" };

export default async function NewTask({ searchParams }: PageProps<"/[locale]/admin/tasks/new">) {
  await requireAdmin();
  const sp = await searchParams;
  const kind = sp.kind === "practice" ? "practice" : "quiz";
  const template = typeof sp.template === "string" ? sp.template : undefined;
  const skill = typeof sp.skill === "string" ? sp.skill : undefined;
  const [skills, lectures] = await Promise.all([skillOptions(), lectureOptions()]);

  return (
    <>
      <PageTitle title={kind === "quiz" ? "New quiz" : "New practice task"} back={{ href: "/admin/tasks", label: "All tasks" }} />
      <TaskEditor initial={newTaskState(kind, template, skill)} create skillOptions={skills} lectureOptions={lectures} />
    </>
  );
}
