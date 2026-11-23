"use client";

import "@/lib/react-aria-dev-shim";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Checkbox, CheckboxGroup, Label, Radio, RadioGroup, Text } from "react-aria-components";

export type QuizVM = { mode: "single" | "multi"; options: { id: string; content: ReactNode }[] };
/** After grading: the option ids that were correct. Turns the step into a read-only review. */
export type QuizReview = { correct: string[] };

const LETTERS = "ABCDEF";
const optionClass =
  "group flex cursor-pointer items-start gap-4 rounded-2xl border border-paper-3 bg-white p-4 shadow-card outline-none transition data-[hovered]:border-forest-600 data-[selected]:border-forest-700 data-[selected]:bg-forest-50 data-[selected]:ring-2 data-[selected]:ring-forest-700 data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500";
const reviewBase = "group flex items-start gap-4 rounded-2xl border p-4 shadow-card outline-none transition";

/** Correct options turn green, a wrong pick turns red, the rest fade; a ring keeps the learner's own picks visible. */
function reviewClass(correct: boolean, picked: boolean) {
  if (correct) return `${reviewBase} border-success bg-success-soft${picked ? " ring-2 ring-success" : ""}`;
  if (picked) return `${reviewBase} border-danger bg-danger-soft ring-2 ring-danger`;
  return `${reviewBase} border-paper-3 bg-white opacity-60`;
}

function ReviewMark({ correct, picked }: { correct: boolean; picked: boolean }) {
  const t = useTranslations("interview");
  if (!correct && !picked) return null;
  return (
    <span
      className={`mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold ring-1 ${
        correct ? "text-success ring-success/40" : "text-danger ring-danger/40"
      }`}
    >
      {correct ? <Check aria-hidden className="h-3.5 w-3.5" /> : <X aria-hidden className="h-3.5 w-3.5" />}
      {correct ? (picked ? t("yourCorrectAnswer") : t("correctAnswer")) : t("yourAnswer")}
    </span>
  );
}

function Letter({ i }: { i: number }) {
  return (
    <span
      aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-paper-3 font-display text-sm font-bold text-forest-700 transition group-data-[selected]:border-forest-700 group-data-[selected]:bg-forest-700 group-data-[selected]:text-gold-300"
    >
      {LETTERS[i]}
    </span>
  );
}

export function QuizStep({
  quiz,
  selected,
  onChange,
  disabled,
  error,
  labelId,
  review,
}: {
  quiz: QuizVM;
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  error?: string;
  labelId: string;
  review?: QuizReview;
}) {
  const t = useTranslations("interview");
  const classFor = (id: string) => (review ? reviewClass(review.correct.includes(id), selected.includes(id)) : optionClass);
  const mark = (id: string) =>
    review ? <ReviewMark correct={review.correct.includes(id)} picked={selected.includes(id)} /> : null;

  if (quiz.mode === "single") {
    return (
      <RadioGroup
        aria-labelledby={labelId}
        value={selected[0] ?? null}
        onChange={(v) => onChange(v ? [v] : [])}
        isDisabled={disabled}
        isInvalid={!!error}
        className="space-y-3"
      >
        <Text slot="description" className="block text-sm font-medium text-ink-muted">
          {t("selectOne")}
        </Text>
        {quiz.options.map((o, i) => (
          <Radio key={o.id} value={o.id} className={classFor(o.id)}>
            <Letter i={i} />
            <span className="min-w-0 flex-1 pt-1 [&_.prose-assay]:text-base">{o.content}</span>
            {mark(o.id)}
          </Radio>
        ))}
        {error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
      </RadioGroup>
    );
  }

  return (
    <CheckboxGroup
      aria-labelledby={labelId}
      value={selected}
      onChange={onChange}
      isDisabled={disabled}
      isInvalid={!!error}
      className="space-y-3"
    >
      <Label className="sr-only">{t("selectMany")}</Label>
      <Text slot="description" className="block text-sm font-medium text-ink-muted">
        {t("selectMany")}
      </Text>
      {quiz.options.map((o, i) => (
        <Checkbox key={o.id} value={o.id} className={classFor(o.id)}>
          <Letter i={i} />
          <span className="min-w-0 flex-1 pt-1 [&_.prose-assay]:text-base">{o.content}</span>
          {mark(o.id)}
          <span
            aria-hidden
            className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-forest-600 bg-white group-data-[selected]:bg-forest-700"
          >
            <Check className="h-3.5 w-3.5 text-white opacity-0 group-data-[selected]:opacity-100" />
          </span>
        </Checkbox>
      ))}
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </CheckboxGroup>
  );
}
