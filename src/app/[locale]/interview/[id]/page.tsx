import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Markdown } from "@/components/content/Markdown";
import { InterviewRunner, type StepVM } from "@/components/interview/InterviewRunner";
import { toLocale } from "@/i18n/locale";
import { loadInterview } from "@/lib/data/interview";
import { highlight } from "@/lib/highlight";
import { loc } from "@/lib/i18n/localized";
import { localizedPath, privatePageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

/** Per-user page: always rendered at request time. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/interview/[id]">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "interview" });
  return { title: t("metaTitle"), ...privatePageMetadata };
}

export default async function InterviewPage({ params }: PageProps<"/[locale]/interview/[id]">) {
  const { id, locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const data = await loadInterview(id, locale);
  if (!data || !data.items.length) notFound();
  if (data.interview.status === "completed") redirect(localizedPath(`/results/${id}`, locale));
  // Every item answered (e.g. the tab closed right after the last answer): grade it now. Idempotent.
  if (data.items.every((item) => item.status !== "pending")) {
    const supabase = await createClient();
    await supabase.rpc("finish_interview", { p_interview_id: id });
    redirect(localizedPath(`/results/${id}`, locale));
  }

  const steps: StepVM[] = await Promise.all(
    data.items.map(async (item) => {
      const task = item.task;
      const quiz = task.kind === "quiz" && task.quiz ? task.quiz : null;
      return {
        itemId: item.id,
        status: item.status,
        helpUsed: item.help_used,
        kind: task.kind,
        title: task.title,
        complexity: task.complexity,
        estSeconds: task.estSeconds,
        skills: task.skills.map((s) => s.name),
        previously: item.previously,
        lectureHref: task.lectureSlug ? localizedPath(`/lectures/${task.lectureSlug}`, locale) : null,
        prompt: <Markdown>{task.prompt}</Markdown>,
        code: quiz?.code ? (
          <div className="code-block" dangerouslySetInnerHTML={{ __html: await highlight(quiz.code, quiz.codeLanguage ?? "ts") }} />
        ) : undefined,
        quiz: quiz
          ? {
              mode: quiz.mode,
              options: await Promise.all(
                quiz.options.map(async (o) => ({
                  id: o.id,
                  content: (
                    <>
                      <Markdown className="prose-assay [&>*+*]:mt-2">{loc(o.text, locale)}</Markdown>
                      {o.code ? (
                        <div
                          className="code-block mt-2 text-sm"
                          dangerouslySetInnerHTML={{ __html: await highlight(o.code, quiz.codeLanguage ?? "ts") }}
                        />
                      ) : null}
                    </>
                  ),
                })),
              ),
            }
          : undefined,
        practice: task.kind === "practice" && task.practice ? task.practice : undefined,
      } satisfies StepVM;
    }),
  );

  return (
    <InterviewRunner
      interviewId={data.interview.id}
      startedAt={data.interview.started_at}
      budgetSeconds={data.interview.budget_seconds}
      steps={steps}
    />
  );
}
