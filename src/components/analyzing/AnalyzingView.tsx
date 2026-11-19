"use client";

import { Check, CircleDashed, Loader2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PillArrow, pillClasses } from "@/components/ui/PillLink";
import { Link, useRouter } from "@/i18n/navigation";
import type { Skill } from "@/lib/content/schema";
import { useAnalysisRequest, type AnalysisRequest } from "@/lib/pipeline/request-store";
import {
  overallProgress,
  runAnalysis,
  stagesFor,
  type PipelineDeps,
  type PipelineError,
  type PipelineState,
} from "@/lib/pipeline/run-analysis";
import { Crucible } from "./Crucible";

const MIN_DURATION_MS = 2000;
const TIP_KEYS = ["one", "two", "three", "four", "five"] as const;

type Props = {
  catalog: Skill[];
  /** Offline dev preview only. */
  deps?: Partial<PipelineDeps>;
  interviewPath?: (id: string) => string;
  pickerPath?: string;
};

export function AnalyzingView({ catalog, deps, interviewPath = (id) => `/interview/${id}`, pickerPath = "/practice" }: Props) {
  const t = useTranslations("analyzing");
  const locale = useLocale() as "en" | "uk";
  const router = useRouter();
  const request = useAnalysisRequest((s) => s.request);
  const setRequest = useAnalysisRequest((s) => s.setRequest);
  const clear = useAnalysisRequest((s) => s.clear);
  // zustand/persist rehydrates the request from sessionStorage on the client only.
  const hydrated = useSyncExternalStore(
    (onChange) => useAnalysisRequest.persist.onFinishHydration(onChange),
    () => useAnalysisRequest.persist.hasHydrated(),
    () => false,
  );
  const [state, setState] = useState<PipelineState | null>(null);
  const [error, setError] = useState<PipelineError | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [tip, setTip] = useState(0);
  const started = useRef<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setTip((i) => (i + 1) % TIP_KEYS.length), 4500);
    return () => window.clearInterval(id);
  }, []);

  const run = useCallback(
    async (req: AnalysisRequest) => {
      setError(null);
      setFinishing(false);
      setState({ stages: stagesFor(req), found: [] });
      const startedAt = performance.now();
      const result = await runAnalysis(req, { catalog, locale, onUpdate: setState, deps });
      const remaining = MIN_DURATION_MS - (performance.now() - startedAt);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (remaining > 0) {
        setFinishing(true);
        await new Promise((r) => setTimeout(r, remaining));
      }
      clear();
      router.replace(interviewPath(result.interviewId));
    },
    [catalog, clear, deps, interviewPath, locale, router],
  );

  useEffect(() => {
    if (!hydrated || !request || started.current === request.id) return;
    started.current = request.id;
    void run(request);
  }, [hydrated, request, run]);

  if (hydrated && !request && !state) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center text-white">
        <p className="text-lg text-forest-100">{t("missing")}</p>
        <Link href={pickerPath} className={pillClasses("gold", "mt-8")}>
          <PillArrow />
          <span>{t("backToPicker")}</span>
        </Link>
      </div>
    );
  }

  const stages = state?.stages ?? (request ? stagesFor(request) : []);
  const progress = finishing ? 1 : overallProgress(stages);
  const percent = Math.round(progress * 100);
  const active = stages.find((s) => s.status === "active" || s.status === "error");

  const retryWith = (patch: Partial<AnalysisRequest>) => {
    if (!request) return;
    const { id: _id, createdAt: _c, ...rest } = request;
    setRequest({ ...rest, ...patch });
  };

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:py-20">
      {/* Crucible + percentage */}
      <div className="flex flex-col items-center text-center">
        <div className="relative h-72 w-80 sm:h-80 sm:w-[22rem]">
          <Crucible progress={progress} nuggets={state?.found.length ?? 0} />
        </div>
        <div
          role="progressbar"
          aria-label={t("progress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${t("percent", { value: percent })}${active ? `. ${t(`stages.${active.id}`)}` : ""}`}
          className="mt-4 w-full max-w-sm"
        >
          <p className="font-display text-6xl font-extrabold tabular-nums text-white">
            {percent}
            <span className="text-3xl text-gold-300">%</span>
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        {state?.level ? <p className="mt-4 text-sm text-forest-200">{t("level", { level: state.level })}</p> : null}
      </div>

      {/* Stages + skills */}
      <div className="text-white">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        {state?.title ? <p className="mt-2 text-forest-200">{state.title}</p> : null}

        <ol className="mt-8 space-y-3" aria-live="polite">
          {stages.map((s) => (
            <li
              key={s.id}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                s.status === "active"
                  ? "border-gold-500/60 bg-white/[0.06]"
                  : s.status === "error"
                    ? "border-[#ffb4a8]/60 bg-[#3b1410]/40"
                    : "border-white/10"
              }`}
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center">
                {s.status === "done" ? (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#8fd3b0] text-forest-950">
                    <Check aria-hidden className="h-4 w-4" />
                  </span>
                ) : s.status === "active" ? (
                  <Loader2 aria-hidden className="h-5 w-5 animate-spin text-gold-300" />
                ) : s.status === "error" ? (
                  <X aria-hidden className="h-5 w-5 text-[#ffb4a8]" />
                ) : (
                  <CircleDashed aria-hidden className="h-5 w-5 text-forest-200/60" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block font-medium ${s.status === "pending" ? "text-forest-200/80" : "text-white"}`}>
                  {t(`stages.${s.id}`)}
                </span>
                {s.detail && s.status !== "pending" ? (
                  <span className="mt-0.5 block truncate text-sm text-forest-200">
                    {t.has(`details.${s.detail}` as never)
                      ? t(`details.${s.detail}` as never, { mb: "none", ...(s.values ?? {}) } as never)
                      : s.detail}
                  </span>
                ) : null}
                {s.status === "active" && s.progress > 0 && s.progress < 1 ? (
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full bg-gold-400 transition-[width] duration-300" style={{ width: `${s.progress * 100}%` }} />
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>

        <section aria-labelledby="found-title" className="mt-8">
          <h2 id="found-title" className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-300">
            {t("found")}
          </h2>
          {state?.found.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {state.found.map((f) => (
                <li
                  key={f.slug}
                  className={`nugget-in rounded-full border px-3 py-1.5 text-sm font-medium ${
                    f.required ? "border-gold-400/70 bg-gold-500/15 text-gold-100" : "border-white/20 text-forest-100"
                  }`}
                >
                  {f.name}
                  <span className="sr-only"> ({f.required ? t("required") : t("nice")})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-forest-200">{t("foundNone")}</p>
          )}
        </section>

        {error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-[#ffb4a8]/50 bg-[#3b1410]/60 p-5">
            <p className="font-semibold text-white">{t("errors.title")}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#ffd9d2]">
              {error.code === "fetch_failed"
                ? t.has(`errors.fetch_failed.${error.detail}` as never)
                  ? t(`errors.fetch_failed.${error.detail}` as never)
                  : t("errors.fetch_failed.network")
                : error.code === "no_content" || error.code === "no_tech_skills"
                  ? t(`errors.${error.code}`, { detail: error.detail ?? "" })
                  : t(`errors.${error.code}` as never)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {error.code === "unauthenticated" ? (
                <Link href={`/login?next=${encodeURIComponent("/practice")}`} className={pillClasses("gold")}>
                  <PillArrow />
                  <span>{t("actions.login")}</span>
                </Link>
              ) : null}
              {error.code === "fetch_failed" || (error.code === "no_tech_skills" && request?.method !== "llm_text") ? (
                <Link href="/practice?method=llm_text" className={pillClasses("gold")}>
                  <PillArrow />
                  <span>{t("actions.paste")}</span>
                </Link>
              ) : null}
              {error.code === "model_failed" && request?.model !== "light" ? (
                <button type="button" onClick={() => retryWith({ model: "light" })} className={pillClasses("gold")}>
                  <PillArrow />
                  <span>{t("actions.lightModel")}</span>
                </button>
              ) : null}
              {error.code === "server" || error.code === "fetch_failed" || error.code === "model_failed" ? (
                <button type="button" onClick={() => retryWith({})} className={pillClasses("outline-light")}>
                  <span>{t("actions.retry")}</span>
                </button>
              ) : null}
              <Link href={pickerPath} className={pillClasses("outline-light")}>
                <span>{t("actions.edit")}</span>
              </Link>
            </div>
          </div>
        ) : (
          <aside className="mt-8 border-l-2 border-gold-500 pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-300">{t("tipsTitle")}</p>
            <p key={tip} className="mt-1 animate-fade text-forest-100">
              {t(`tips.${TIP_KEYS[tip]}`)}
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
