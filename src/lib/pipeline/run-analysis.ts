"use client";

import { createInterviewAction, fetchJobPageAction, getSelectionContext } from "@/app/actions/interview";
import { loadEngine } from "@/lib/llm/engine";
import { extractSkillsWithLlm } from "@/lib/llm/extract-skills";
import { selectInterview, type Level } from "@/lib/selection/select";
import { detectSeniority, matchSkillsProgressive, type CatalogSkill } from "@/lib/skills/matcher";
import { normalizeSkillNames } from "@/lib/skills/normalize";
import { LENGTHS, type AnalysisRequest } from "./request-store";

export type StageId = "fetch" | "extract" | "match" | "model" | "analyze" | "normalize" | "history" | "select" | "assemble";
export type StageStatus = "pending" | "active" | "done" | "error";
export type Stage = { id: StageId; weight: number; status: StageStatus; progress: number; detail?: string; values?: Record<string, string | number> };
export type FoundSkill = { slug: string; name: string; required: boolean };

export type PipelineErrorCode =
  | "unauthenticated"
  | "fetch_failed"
  | "model_failed"
  | "no_skills"
  /** Only non-technical skills (English, Jira, mentoring…) were found in a job post. */
  | "no_tech_skills"
  | "no_content"
  | "server";
export type PipelineError = { code: PipelineErrorCode; detail?: string; stage: StageId };

export type PipelineState = { stages: Stage[]; found: FoundSkill[]; level?: Level; title?: string | null };
export type PipelineResult = { ok: true; interviewId: string } | { ok: false; error: PipelineError };

/** Catalogue category for process and soft skills (English, Jira, mentoring, Agile…). */
const NON_TECHNICAL_CATEGORY = "practices";

const SERVER_STAGES: [StageId, number][] = [
  ["history", 0.08],
  ["select", 0.05],
  ["assemble", 0.07],
];

export function stagesFor(req: Pick<AnalysisRequest, "method" | "keywordFallback">): Stage[] {
  const parse: [StageId, number][] =
    req.method === "manual"
      ? []
      : req.method === "url"
        ? [["fetch", 0.35], ["extract", 0.1], ["match", 0.35]]
        : req.method === "llm_url"
          ? [["fetch", 0.12], ["model", 0.4], ["analyze", 0.25], ["normalize", 0.03]]
          : req.keywordFallback
            ? [["extract", 0.2], ["match", 0.6]]
            : [["model", 0.5], ["analyze", 0.27], ["normalize", 0.03]];
  const all = [...parse, ...SERVER_STAGES];
  const total = all.reduce((s, [, w]) => s + w, 0);
  return all.map(([id, w]) => ({ id, weight: w / total, status: "pending", progress: 0 }));
}

export function overallProgress(stages: Stage[]) {
  return stages.reduce((sum, s) => sum + s.weight * (s.status === "done" ? 1 : s.progress), 0);
}

class StageError extends Error {
  constructor(public readonly info: PipelineError) {
    super(info.code);
  }
}

export type PipelineDeps = {
  fetchJobPage: typeof fetchJobPageAction;
  getSelectionContext: typeof getSelectionContext;
  createInterview: typeof createInterviewAction;
};

const defaultDeps: PipelineDeps = {
  fetchJobPage: fetchJobPageAction,
  getSelectionContext,
  createInterview: createInterviewAction,
};

type Options = {
  catalog: readonly CatalogSkill[];
  locale: "en" | "uk";
  onUpdate: (state: PipelineState) => void;
  seed?: number;
  /** Injected for tests and the offline dev preview. */
  deps?: Partial<PipelineDeps>;
};

export async function runAnalysis(req: AnalysisRequest, { catalog, locale, onUpdate, seed, deps: overrides }: Options): Promise<PipelineResult> {
  const deps = { ...defaultDeps, ...overrides };
  const state: PipelineState = { stages: stagesFor(req), found: [] };
  const emit = () => onUpdate({ ...state, stages: state.stages.map((s) => ({ ...s })), found: [...state.found] });
  const stage = (id: StageId) => state.stages.find((s) => s.id === id)!;
  const start = (id: StageId, detail?: string, values?: Stage["values"]) => {
    Object.assign(stage(id), { status: "active", progress: 0, detail, values });
    emit();
  };
  const progress = (id: StageId, p: number, detail?: string, values?: Stage["values"]) => {
    const s = stage(id);
    s.progress = Math.max(s.progress, Math.min(1, p));
    if (detail) s.detail = detail;
    if (values) s.values = values;
    emit();
  };
  const done = (id: StageId, detail?: string, values?: Stage["values"]) => {
    Object.assign(stage(id), { status: "done", progress: 1, ...(detail ? { detail } : {}), ...(values ? { values } : {}) });
    emit();
  };
  const fail = (id: StageId, code: PipelineErrorCode, detail?: string): never => {
    Object.assign(stage(id), { status: "error" });
    emit();
    throw new StageError({ code, detail, stage: id });
  };

  const bySlug = new Map(catalog.map((s) => [s.slug, s]));
  const priorities = new Map<string, number>();
  let detectedLevel: Level | null = null;

  const addFound = (slug: string, required: boolean, weight: number) => {
    const skill = bySlug.get(slug);
    if (!skill) return;
    priorities.set(slug, Math.max(priorities.get(slug) ?? 0, weight));
    const existing = state.found.find((f) => f.slug === slug);
    if (existing) existing.required ||= required;
    else state.found.push({ slug, name: skill.name, required });
  };

  try {
    let text = req.text;

    // ── 1. Get the job text ─────────────────────────────────────────────
    if (req.method === "url" || req.method === "llm_url") {
      const host = (() => {
        try {
          return new URL(req.url).hostname;
        } catch {
          return req.url;
        }
      })();
      start("fetch", "fetching", { host });
      const page = await deps.fetchJobPage(req.url);
      if (!page.ok) {
        if (page.error === "unauthenticated") fail("fetch", "unauthenticated");
        fail("fetch", "fetch_failed", page.error);
      } else {
        text = page.text;
        state.title = page.title;
        done("fetch", "fetched", { host, kb: Math.max(1, Math.round(page.text.length / 1024)) });
      }
    }

    // ── 2a. Keyword matching ────────────────────────────────────────────
    if (req.method === "url" || (req.method === "llm_text" && req.keywordFallback)) {
      start("extract", "extracting");
      const lines = text.split(/\n/).filter((l) => l.trim()).length;
      done("extract", "extracted", { lines, chars: text.length });

      start("match", "matching", { count: 0, total: catalog.length });
      const matches = await matchSkillsProgressive(text, catalog, (p, found) => {
        for (const m of found) addFound(m.slug, m.required, m.weight);
        progress("match", p, "matching", { count: found.length, total: catalog.length });
      });
      const maxWeight = Math.max(1, ...matches.map((m) => m.weight));
      for (const m of matches) priorities.set(m.slug, m.weight / maxWeight);
      if (!matches.length) fail("match", "no_skills");
      done("match", "matched", { count: matches.length });
      detectedLevel = detectSeniority(text);
    }

    // ── 2b. On-device LLM ───────────────────────────────────────────────
    if (req.method === "llm_url" || (req.method === "llm_text" && !req.keywordFallback)) {
      start("model", "loading", { percent: 0 });
      let engine;
      try {
        engine = await loadEngine(req.model, (report) => {
          const mb = /(\d+(?:\.\d+)?)\s*MB/.exec(report.text)?.[1];
          progress("model", report.progress, "loading", { percent: Math.round(report.progress * 100), mb: mb ?? "" });
        });
      } catch (e) {
        fail("model", "model_failed", (e as Error).message);
      }
      done("model", "loaded");

      start("analyze", "analyzing", { tokens: 0 });
      let tokens = 0;
      const extraction = await extractSkillsWithLlm(engine!, text, (p) => {
        tokens += 1;
        progress("analyze", p, "analyzing", { tokens });
      }).catch((e: Error) => fail("analyze", "model_failed", e.message));
      done("analyze", "analyzed", { count: extraction.skills.length });

      start("normalize", "normalizing");
      const normalized = normalizeSkillNames(
        extraction.skills.map((s) => s.name),
        catalog,
      );
      normalized.forEach((n, i) => {
        if (!n.slug) return;
        const required = extraction.skills[i].importance === "required";
        addFound(n.slug, required, required ? 1 : 0.5);
      });
      // The keyword matcher backs up the model on obvious mentions it may have skipped.
      const keyword = await matchSkillsProgressive(text, catalog, () => undefined, 1000);
      for (const m of keyword.filter((k) => k.required && k.mentions >= 2)) addFound(m.slug, true, 0.8);
      if (!state.found.length) fail("normalize", "no_skills");
      done("normalize", "normalized", { count: state.found.length });
      detectedLevel = extraction.level !== "unknown" ? extraction.level : detectSeniority(text);
    }

    // ── Manual pick ─────────────────────────────────────────────────────
    if (req.method === "manual") {
      for (const slug of req.skills) addFound(slug, true, 1);
      emit();
    }

    const level: Level = req.level === "auto" ? (detectedLevel ?? "middle") : req.level;
    state.level = level;

    // Keep the most prominent detected skills (required first).
    const ranked = [...state.found]
      .sort((a, b) => Number(b.required) - Number(a.required) || (priorities.get(b.slug) ?? 0) - (priorities.get(a.slug) ?? 0))
      .slice(0, 16);

    // ── 3. History ──────────────────────────────────────────────────────
    start("history", "history");
    const ctx = await deps.getSelectionContext(ranked.map((f) => f.slug));
    if (!ctx.ok) fail("history", ctx.error === "unauthenticated" ? "unauthenticated" : "server");
    const context = ctx as Extract<typeof ctx, { ok: true }>;
    const attempts = context.progress.reduce((s, p) => s + p.attempts, 0);
    done("history", "historyDone", { tasks: context.tasks.length, attempts });

    // ── 4. Select ───────────────────────────────────────────────────────
    start("select", "selecting");
    const idBySlug = new Map(context.skills.map((s) => [s.slug, s]));
    const selection = selectInterview({
      skills: ranked
        .map((f) => idBySlug.get(f.slug))
        .filter((s): s is NonNullable<typeof s> => !!s)
        .map((s) => ({ id: s.id, slug: s.slug, name: s.name, codeable: s.codeable, priority: priorities.get(s.slug) ?? 0.5 })),
      tasks: context.tasks,
      progress: context.progress,
      level,
      length: LENGTHS[req.length],
      kinds: req.taskTypes === "quiz" ? ["quiz"] : req.taskTypes === "practice" ? ["practice"] : undefined,
      seed,
    });
    if (!selection.items.length) {
      const names = ranked.map((f) => f.name).slice(0, 6).join(", ");
      // A post that yields only soft/process skills usually means we didn't get the real description
      // (a listing, login or cookie page), so say that instead of "no exercises for English".
      const onlyNonTechnical = ranked.every((f) => bySlug.get(f.slug)?.category === NON_TECHNICAL_CATEGORY);
      fail("select", req.method !== "manual" && onlyNonTechnical ? "no_tech_skills" : "no_content", names);
    }
    const focusNames = selection.focusSkillIds.map((id) => context.skills.find((s) => s.id === id)?.name).filter(Boolean);
    done("select", "selected", { count: selection.items.length, skills: focusNames.join(", ") });

    // ── 5. Assemble ─────────────────────────────────────────────────────
    start("assemble", "assembling");
    const created = await deps.createInterview({
      method: req.method,
      level,
      locale,
      sourceUrl: req.method === "url" || req.method === "llm_url" ? req.url : null,
      detectedSkillIds: ranked.map((f) => idBySlug.get(f.slug)?.id).filter((x): x is string => !!x),
      focusSkillIds: selection.focusSkillIds,
      taskIds: selection.items.map((i) => i.taskId),
    });
    if (!created.ok) fail("assemble", created.error === "unauthenticated" ? "unauthenticated" : "server");
    done("assemble", "assembled");
    return { ok: true, interviewId: (created as { ok: true; id: string }).id };
  } catch (e) {
    if (e instanceof StageError) return { ok: false, error: e.info };
    const active = state.stages.find((s) => s.status === "active")?.id ?? "history";
    stage(active).status = "error";
    emit();
    return { ok: false, error: { code: "server", detail: (e as Error).message, stage: active } };
  }
}
