import { Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { btn } from "@/components/admin/fields";
import { PageTitle } from "@/components/admin/PageTitle";
import { SkillEditor } from "@/components/admin/SkillEditor";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/roles";
import { getSkillState } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/skills/[slug]">) {
  return { title: (await params).slug };
}

export default async function EditSkill({ params }: PageProps<"/[locale]/admin/skills/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const skill = await getSkillState(slug);
  if (!skill) notFound();

  return (
    <>
      <PageTitle title={skill.state.name} back={{ href: "/admin/skills", label: "All skills" }}>
        <Link href={`/admin/tasks/new?kind=quiz&skill=${slug}`} className={btn.secondary}>
          <Plus aria-hidden className="h-4 w-4" /> Quiz
        </Link>
        <Link href={`/admin/tasks/new?kind=practice&skill=${slug}`} className={btn.secondary}>
          <Plus aria-hidden className="h-4 w-4" /> Practice
        </Link>
        <Link href={`/admin/lectures/new?skill=${slug}`} className={btn.secondary}>
          <Plus aria-hidden className="h-4 w-4" /> Lecture
        </Link>
      </PageTitle>
      <SkillEditor key={JSON.stringify(skill.state)} initial={skill.state} meta={skill.meta} create={false} />
    </>
  );
}
