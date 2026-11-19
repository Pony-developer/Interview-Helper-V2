"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/format";

/** Ring timer: elapsed vs suggested budget. Never forces anything; announces only thresholds. */
export function InterviewTimer({ startedAt, budgetSeconds }: { startedAt: string; budgetSeconds: number }) {
  const t = useTranslations("interview");
  // null until mounted: server and first client render must match (no Date.now() during render).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = now === null ? 0 : Math.max(0, (now - new Date(startedAt).getTime()) / 1000);
  const ratio = elapsed / Math.max(1, budgetSeconds);
  const over = ratio > 1;

  // The live region only changes at the 50% and 100% thresholds, so screen readers hear exactly two messages.
  const announcement = ratio > 1 ? t("overBudget") : ratio >= 0.5 ? t("halfway") : "";

  const r = 20;
  const c = 2 * Math.PI * r;
  const shown = Math.min(1, ratio);
  const color = over ? "#ffb4a8" : ratio > 0.8 ? "#e6cf86" : "#8fd3b0";

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 48 48" className="h-11 w-11 -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
        />
      </svg>
      <div className="leading-tight">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-forest-200">{t("timer")}</p>
        <p role="timer" aria-live="off" className={`font-mono text-base font-semibold tabular-nums ${over ? "text-[#ffb4a8]" : "text-white"}`}>
          {t("timerValue", { elapsed: formatDuration(elapsed), budget: formatDuration(budgetSeconds) })}
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
