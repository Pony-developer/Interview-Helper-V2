"use client";

import { useMemo } from "react";
import type { SelectionContext } from "@/app/actions/interview";
import { AnalyzingView } from "@/components/analyzing/AnalyzingView";
import type { Skill } from "@/lib/content/schema";
import type { PipelineDeps } from "@/lib/pipeline/run-analysis";
import { devFetchJobPageAction } from "../_lib/dev-actions";

export function DevAnalyzing({ catalog, context }: { catalog: Skill[]; context: SelectionContext }) {
  const deps = useMemo<Partial<PipelineDeps>>(
    () => ({
      fetchJobPage: devFetchJobPageAction as PipelineDeps["fetchJobPage"],
      getSelectionContext: async (slugs) => {
        await new Promise((r) => setTimeout(r, 250));
        const set = new Set(slugs);
        const skills = context.skills.filter((s) => set.has(s.slug));
        const ids = new Set(skills.map((s) => s.id));
        const tasks = context.tasks.filter((t) => t.skills.some((l) => ids.has(l.skillId)));
        return { ...context, skills, tasks };
      },
      createInterview: async (input) => {
        await new Promise((r) => setTimeout(r, 250));
        return { ok: true, id: input.taskIds.join(",") };
      },
    }),
    [context],
  );

  return (
    <AnalyzingView
      catalog={catalog}
      deps={deps}
      pickerPath="/dev/practice"
      interviewPath={(id) => `/dev/interview?tasks=${encodeURIComponent(id)}`}
    />
  );
}
