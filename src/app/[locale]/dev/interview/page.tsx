import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/Markdown";
import type { StepVM } from "@/components/interview/InterviewRunner";
import { toLocale } from "@/i18n/locale";
import { highlight } from "@/lib/highlight";
import { loc } from "@/lib/i18n/localized";
import { localizedPath } from "@/lib/seo";
import { localTasks } from "../_lib/local-content";
import { DevRunner } from "./DevRunner";

/** Development-only interview preview built from local content (?tasks=slug,slug). */
export default async function DevInterviewPage({ params, searchParams }: PageProps<"/[locale]/dev/interview">) {
  if (process.env.NODE_ENV === "production") notFound();
  const locale = toLocale((await params).locale);
  const sp = await searchParams;
  const slugs = typeof sp.tasks === "string" ? sp.tasks.split(",") : [];
  const items = await localTasks(slugs, sp.solution === "1");
  if (!items.length) notFound();

  const steps: StepVM[] = await Promise.all(
    items.map(async ({ task, lecture, practice, skillNames }) => ({
      itemId: task.slug,
      status: "pending" as const,
      helpUsed: false,
      kind: task.kind,
      title: loc(task.title, locale),
      complexity: task.complexity,
      estSeconds: task.estSeconds,
      skills: skillNames,
      previously: null,
      lectureHref: lecture ? localizedPath(`/lectures/${lecture}`, locale) : null,
      prompt: <Markdown>{loc(task.prompt, locale)}</Markdown>,
      code:
        task.kind === "quiz" && task.code ? (
          <div className="code-block" dangerouslySetInnerHTML={{ __html: await highlight(task.code, task.codeLanguage) }} />
        ) : undefined,
      quiz:
        task.kind === "quiz"
          ? {
              mode: task.mode,
              options: task.options.map((o) => ({
                id: o.id,
                content: <Markdown className="prose-assay [&>*+*]:mt-2">{loc(o.text, locale)}</Markdown>,
              })),
            }
          : undefined,
      practice: practice ?? undefined,
    })),
  );

  const budget = Math.round(items.reduce((s, i) => s + i.task.estSeconds, 0) * 1.1);
  return <DevRunner steps={steps} budgetSeconds={budget} />;
}
