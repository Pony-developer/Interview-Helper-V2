import { Code2, ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";

export type RailStep = { id: string; kind: "quiz" | "practice"; state: "done" | "skipped" | "current" | "pending" };

/** Segmented progress rail: one segment per step, an icon per type, answered steps filled gold. */
export function ProgressRail({ steps }: { steps: RailStep[] }) {
  const t = useTranslations("interview");
  const done = steps.filter((s) => s.state === "done" || s.state === "skipped").length;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-forest-200">
        <span>{t("progress")}</span>
        <span className="tabular-nums">
          {done}/{steps.length}
        </span>
      </div>
      <ol aria-label={t("progress")} className="flex gap-1.5">
        {steps.map((s, i) => {
          const Icon = s.kind === "practice" ? Code2 : ListChecks;
          return (
            <li key={s.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5" aria-current={s.state === "current" ? "step" : undefined}>
              <span
                className={`relative block h-2.5 w-full overflow-hidden rounded-full transition-colors duration-500 ${
                  s.state === "done"
                    ? "bg-gradient-to-r from-gold-500 to-gold-300"
                    : s.state === "skipped"
                      ? "bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.35)_0_4px,transparent_4px_8px)]"
                      : s.state === "current"
                        ? "bg-white/25 ring-2 ring-gold-300"
                        : "bg-white/10"
                }`}
              >
                {s.state === "current" ? <span className="absolute inset-0 animate-pulse bg-gold-300/30" /> : null}
              </span>
              <Icon
                aria-hidden
                className={`hidden h-3.5 w-3.5 sm:block ${s.state === "pending" ? "text-forest-200/50" : s.state === "current" ? "text-gold-300" : "text-forest-100"}`}
              />
              <span className="sr-only">
                {t("step", { current: i + 1, total: steps.length })}: {t(s.kind)}, {t(`stepState.${s.state}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
