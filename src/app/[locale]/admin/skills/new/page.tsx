import { PageTitle } from "@/components/admin/PageTitle";
import { SkillEditor } from "@/components/admin/SkillEditor";
import { requireAdmin } from "@/lib/auth/roles";
import { newSkillState } from "@/lib/data/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "New skill" };

export default async function NewSkill() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="New skill" back={{ href: "/admin/skills", label: "All skills" }} />
      <SkillEditor initial={newSkillState()} create />
    </>
  );
}
