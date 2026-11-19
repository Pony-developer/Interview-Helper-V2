import { notFound } from "next/navigation";
import { PracticeForm } from "@/components/practice/PracticeForm";
import { PageHero } from "@/components/site/PageHero";
import { SiteHeader } from "@/components/site/SiteHeader";
import { skillDef } from "@/lib/content/schema";
import { getSkillsWithContent } from "@/lib/data/catalog";
import { skills } from "@content/skills";

/** Development-only preview of the picker (no sign-in, local content). */
export default async function DevPracticePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="on-light">
        <PageHero eyebrow="Dev preview" title="Skills picker" intro="Offline preview using local content." />
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <PracticeForm
            catalog={skills.map((s) => skillDef.parse(s))}
            withContent={await getSkillsWithContent()}
            initialSkills={[]}
            initialMethod="manual"
            analyzingPath="/dev/analyzing"
          />
        </div>
      </main>
    </>
  );
}
