"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { CourseOutline, SlideProgress } from "@/lib/data/course-player";
import { CertificateMeter, type CertificateState } from "./CertificateMeter";
import { KindIcon } from "./kind-icon";

type Props = {
  outline: CourseOutline;
  progress: Record<string, SlideProgress>;
  /** Null when the site has no accounts (nothing can be earned). */
  certificate: CertificateState | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Thin gold assay bar: how much of the vein has been worked. */
function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mt-5">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={label}
        className="h-1.5 overflow-hidden rounded-full bg-paper-3"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-300 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-xs tabular-nums text-ink-soft">{label}</p>
    </div>
  );
}

/** Small ring showing a module's completion. */
function Ring({ done, total }: { done: number; total: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  const filled = total ? (done / total) * c : 0;
  const complete = total > 0 && done === total;
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 -rotate-90" aria-hidden>
      <circle cx="12" cy="12" r={r} fill="none" stroke="var(--color-paper-3)" strokeWidth="3" />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill={complete ? "var(--color-gold-500)" : "none"}
        stroke="var(--color-gold-500)"
        strokeWidth="3"
        strokeDasharray={`${filled} ${c}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CourseSidebar({ outline, progress, certificate }: Props) {
  const t = useTranslations("course");
  // The sidebar lives in the player layout, which stays mounted between slides: read the slide from the URL.
  const params = useParams<{ slide?: string }>();
  const currentSlug = params.slide ? decodeURIComponent(params.slide) : "";
  const currentModule = outline.modules.find((m) => m.slides.some((s) => s.slug === currentSlug)) ?? outline.modules[0];
  const currentModuleSlug = currentModule?.slug ?? null;
  const [openModule, setOpenModule] = useState<string | null>(currentModuleSlug);
  // Follow the reader into another module (e.g. via Next/Back) without overriding a manual choice on every render.
  const [followed, setFollowed] = useState(currentModuleSlug);
  if (followed !== currentModuleSlug) {
    setFollowed(currentModuleSlug);
    setOpenModule(currentModuleSlug);
  }

  const isDone = (id: string) => progress[id]?.completed ?? false;
  const all = outline.modules.flatMap((m) => m.slides);
  const doneCount = all.filter((s) => isDone(s.id)).length;

  const mod = outline.modules.find((m) => m.slug === openModule);

  if (!mod) {
    return (
      <nav aria-label={t("contents")} className="px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{t("contents")}</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-forest-700">{outline.title}</h2>
        <ProgressBar done={doneCount} total={all.length} label={t("progress", { done: doneCount, total: all.length })} />
        {certificate ? <CertificateMeter state={certificate} /> : null}
        <ol className="mt-8 space-y-1">
          {outline.modules.map((m, i) => {
            const moduleDone = m.slides.filter((s) => isDone(s.id)).length;
            const active = m.slug === currentModule?.slug;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setOpenModule(m.slug)}
                  aria-current={active ? "true" : undefined}
                  className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors ${
                    active ? "bg-white shadow-card ring-1 ring-paper-3" : "hover:bg-white/70"
                  }`}
                >
                  <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-gold-700">{pad(i + 1)}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold leading-snug text-ink" title={m.title}>
                    {m.title}
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-ink-soft">
                    {moduleDone}/{m.slides.length}
                  </span>
                  <Ring done={moduleDone} total={m.slides.length} />
                  <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  const moduleDone = mod.slides.filter((s) => isDone(s.id)).length;
  return (
    <nav aria-label={mod.title} className="px-6 py-8">
      <button
        type="button"
        onClick={() => setOpenModule(null)}
        className="-ml-1 inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-sm font-semibold text-forest-700 hover:text-forest-600 hover:underline hover:decoration-gold-500 hover:underline-offset-4"
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
        {outline.title}
        <span className="sr-only">: {t("allModules")}</span>
      </button>
      <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight text-forest-700">{mod.title}</h2>
      <ProgressBar done={moduleDone} total={mod.slides.length} label={t("progress", { done: moduleDone, total: mod.slides.length })} />
      {certificate?.certificateId ? <CertificateMeter state={certificate} /> : null}

      <ol className="relative mt-8">
        {mod.slides.map((s, i) => {
          const p = progress[s.id];
          const done = p?.completed ?? false;
          const current = s.slug === currentSlug;
          const last = i === mod.slides.length - 1;
          return (
            <li key={s.id} className="relative">
              {/* The vein: gold where the slide has been worked, pale where it hasn't. */}
              {!last ? (
                <span
                  aria-hidden
                  className={`absolute left-[1.0625rem] top-8 -bottom-2 w-0.5 rounded-full ${done ? "bg-gold-500" : "bg-paper-3"}`}
                />
              ) : null}
              <Link
                href={`/courses/${outline.slug}/${s.slug}`}
                aria-current={current ? "page" : undefined}
                className={`relative flex items-start gap-3 rounded-2xl py-2.5 pl-2 pr-3 transition-colors ${
                  current ? "bg-white shadow-card ring-1 ring-paper-3" : "hover:bg-white/70"
                }`}
              >
                <span
                  aria-hidden
                  className={`relative z-[1] mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-gold-500 bg-gold-500 text-forest-950"
                      : current
                        ? "border-forest-700 bg-white"
                        : "border-paper-3 bg-paper-2"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={3.5} /> : current ? <span className="h-1.5 w-1.5 rounded-full bg-forest-700" /> : null}
                </span>
                <span className={`mt-0.5 shrink-0 ${current ? "text-forest-700" : "text-ink-soft"}`}>
                  <KindIcon kind={s.kind} />
                  <span className="sr-only">{t(`kinds.${s.kind}`)}: </span>
                </span>
                <span className={`min-w-0 flex-1 leading-snug ${current ? "font-semibold text-forest-700" : "text-ink"}`}>{s.title}</span>
                {s.maxScore > 0 ? (
                  <span
                    className={`shrink-0 pt-0.5 font-mono text-xs tabular-nums ${
                      p && p.score === s.maxScore ? "font-semibold text-gold-700" : "text-ink-soft"
                    }`}
                  >
                    {p?.score ?? 0}/{s.maxScore}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
