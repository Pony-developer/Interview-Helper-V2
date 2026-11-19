"use client";

import "@/lib/react-aria-dev-shim";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Checkbox, CheckboxGroup, Label, Radio, RadioGroup, Text } from "react-aria-components";

export type QuizVM = { mode: "single" | "multi"; options: { id: string; content: ReactNode }[] };

const LETTERS = "ABCDEF";
const optionClass =
  "group flex cursor-pointer items-start gap-4 rounded-2xl border border-paper-3 bg-white p-4 shadow-card outline-none transition data-[hovered]:border-forest-600 data-[selected]:border-forest-700 data-[selected]:bg-forest-50 data-[selected]:ring-2 data-[selected]:ring-forest-700 data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500";

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
}: {
  quiz: QuizVM;
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  error?: string;
  labelId: string;
}) {
  const t = useTranslations("interview");

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
          <Radio key={o.id} value={o.id} className={optionClass}>
            <Letter i={i} />
            <span className="min-w-0 flex-1 pt-1 [&_.prose-assay]:text-base">{o.content}</span>
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
        <Checkbox key={o.id} value={o.id} className={optionClass}>
          <Letter i={i} />
          <span className="min-w-0 flex-1 pt-1 [&_.prose-assay]:text-base">{o.content}</span>
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
