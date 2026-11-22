"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition, type ReactNode } from "react";
import { submitQuizAction, type QuizOutcome } from "@/app/actions/course";
import { QuizStep } from "@/components/interview/QuizStep";
import { useRouter } from "@/i18n/navigation";

export type QuizQuestionVM = { id: string; mode: "single" | "multi"; prompt: ReactNode; options: { id: string; content: ReactNode }[] };

export function QuizSlide({
  slideId,
  questions,
  signedIn,
  signInNote,
}: {
  slideId: string;
  questions: QuizQuestionVM[];
  signedIn: boolean;
  /** Rendered sign-in prompt for anonymous visitors on a site with accounts; null otherwise. */
  signInNote: ReactNode;
}) {
  const t = useTranslations("course.quiz");
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const complete = questions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  function submit() {
    if (!complete) {
      setError(t("answerAll"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await submitQuizAction(slideId, answers);
      if (!res.ok) {
        setError(t("error"));
        return;
      }
      setOutcome(res.outcome);
      if (res.outcome.saved) router.refresh();
    });
  }

  function retry() {
    setOutcome(null);
    setAnswers({});
  }

  return (
    <div className="space-y-6">
      {questions.map((q, i) => {
        const verdict = outcome ? outcome.results[q.id] : undefined;
        return (
          <section
            key={q.id}
            aria-labelledby={`q-${q.id}`}
            className={`animate-rise rounded-3xl bg-white p-6 shadow-card ring-1 transition-colors sm:p-8 ${
              verdict === true ? "ring-success/40" : verdict === false ? "ring-danger/30" : "ring-paper-3"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold-700">{t("question", { n: i + 1 })}</p>
              {verdict !== undefined ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    verdict ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                  }`}
                >
                  {verdict ? <Check aria-hidden className="h-3.5 w-3.5" /> : <X aria-hidden className="h-3.5 w-3.5" />}
                  {verdict ? t("correct") : t("incorrect")}
                </span>
              ) : null}
            </div>
            <div id={`q-${q.id}`} className="mt-3 font-display text-lg font-bold leading-snug text-forest-700 [&_.prose-assay]:text-lg [&_p]:m-0">
              {q.prompt}
            </div>
            <div className="mt-5">
              <QuizStep
                quiz={{ mode: q.mode, options: q.options }}
                selected={answers[q.id] ?? []}
                onChange={(ids) => {
                  setAnswers((a) => ({ ...a, [q.id]: ids }));
                  setError(null);
                }}
                disabled={pending || outcome !== null}
                labelId={`q-${q.id}`}
              />
            </div>
          </section>
        );
      })}

      <div className="flex flex-col gap-4 rounded-3xl bg-forest-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div aria-live="polite" className="min-h-[1.5rem]">
          {outcome ? (
            <>
              <p className="font-display text-2xl font-extrabold text-gold-300">{t("result", { score: outcome.score, max: outcome.max })}</p>
              <p className="mt-1 text-sm text-forest-100">{outcome.saved ? t("saved") : !signedIn && signInNote ? t("notSaved") : null}</p>
            </>
          ) : error ? (
            <p role="alert" className="font-semibold text-gold-300">
              {error}
            </p>
          ) : (
            signInNote
          )}
        </div>
        {outcome ? (
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            {t("retry")}
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full bg-gold-500 px-7 py-3 font-bold text-forest-950 shadow-lift transition hover:bg-gold-400 disabled:opacity-60"
          >
            {t("check")}
          </button>
        )}
      </div>
    </div>
  );
}
