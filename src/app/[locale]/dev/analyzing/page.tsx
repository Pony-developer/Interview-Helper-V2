import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { skillDef } from "@/lib/content/schema";
import { skills } from "@content/skills";
import { localSelectionContext } from "../_lib/local-content";
import { DevAnalyzing } from "./DevAnalyzing";

/** Development-only preview of the loading page with local content instead of the database. */
export default async function DevAnalyzingPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const context = await localSelectionContext();
  return (
    <div className="grain relative flex min-h-screen flex-col overflow-hidden bg-forest-950">
      <header className="relative z-[2] mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
        <Logo />
      </header>
      <main id="main" className="relative z-[2] flex-1">
        <DevAnalyzing catalog={skills.map((s) => skillDef.parse(s))} context={context} />
      </main>
    </div>
  );
}
