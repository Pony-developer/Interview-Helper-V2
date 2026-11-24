import "server-only";

import type { TaskPractice } from "@/lib/playground/frameworks";
import { loc } from "@/lib/i18n/localized";
import type { Json, Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type QuizPayload = {
  mode: "single" | "multi";
  code?: string;
  codeLanguage?: string;
  options: { id: string; text: { en: string; uk: string }; code?: string }[];
};

export type InterviewTask = {
  id: string;
  slug: string;
  kind: "quiz" | "practice";
  complexity: number;
  estSeconds: number;
  title: string;
  prompt: string;
  lectureSlug: string | null;
  quiz: QuizPayload | null;
  practice: TaskPractice | null;
  skills: { id: string; slug: string; name: string }[];
};

export type InterviewItem = Tables<"interview_items"> & { task: InterviewTask; previously: "passed" | "failed" | null };

export type LoadedInterview = {
  interview: Tables<"interviews">;
  items: InterviewItem[];
};

type TaskRow = {
  id: string;
  slug: string;
  kind: "quiz" | "practice";
  complexity: number;
  est_seconds: number;
  title: Json;
  prompt: Json;
  quiz: Json | null;
  practice: Json | null;
  lectures: { slug: string } | null;
  task_skills: { skills: { id: string; slug: string; name: string } | null }[];
};

/** Loads an interview owned by the current user (RLS enforces ownership). */
export async function loadInterview(id: string, locale: string): Promise<LoadedInterview | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();

  const { data: interview } = await supabase.from("interviews").select("*").eq("id", id).maybeSingle();
  if (!interview) return null;

  const { data: items } = await supabase
    .from("interview_items")
    .select("*")
    .eq("interview_id", id)
    .order("position", { ascending: true });
  if (!items?.length) return { interview, items: [] };

  const taskIds = items.map((i) => i.task_id);
  const [{ data: tasks }, { data: progress }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, slug, kind, complexity, est_seconds, title, prompt, quiz, practice, lectures(slug), task_skills(skills(id, slug, name))")
      .in("id", taskIds),
    supabase.from("user_task_progress").select("task_id, status, last_attempt_at").in("task_id", taskIds),
  ]);

  const taskById = new Map(
    ((tasks ?? []) as unknown as TaskRow[]).map((t) => [
      t.id,
      {
        id: t.id,
        slug: t.slug,
        kind: t.kind,
        complexity: t.complexity,
        estSeconds: t.est_seconds,
        title: loc(t.title, locale),
        prompt: loc(t.prompt, locale),
        lectureSlug: t.lectures?.slug ?? null,
        quiz: t.quiz as unknown as QuizPayload | null,
        practice: t.practice as unknown as TaskPractice | null,
        skills: t.task_skills.map((ts) => ts.skills).filter((s): s is NonNullable<typeof s> => !!s),
      } satisfies InterviewTask,
    ]),
  );

  // "Previously passed/failed" refers to attempts made before this interview started.
  const before = new Map(
    (progress ?? [])
      .filter((p) => new Date(p.last_attempt_at) < new Date(interview.started_at))
      .map((p) => [p.task_id, p.status]),
  );

  return {
    interview,
    items: items
      .filter((i) => taskById.has(i.task_id))
      .map((i) => ({ ...i, task: taskById.get(i.task_id)!, previously: before.get(i.task_id) ?? null })),
  };
}
