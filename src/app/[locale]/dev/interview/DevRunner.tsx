"use client";

import { useMemo, useState } from "react";
import { InterviewRunner, type RunnerActions, type StepVM } from "@/components/interview/InterviewRunner";

export function DevRunner({ steps, budgetSeconds }: { steps: StepVM[]; budgetSeconds: number }) {
  const [startedAt] = useState(() => new Date().toISOString());
  const actions = useMemo<RunnerActions>(
    () => ({
      submitItem: async (input) => {
        console.info("[dev] submit", input);
        await new Promise((r) => setTimeout(r, 300));
        return { ok: true as const };
      },
      markHelpUsed: async (id) => {
        console.info("[dev] help", id);
        return { ok: true };
      },
      finishInterview: async () => ({ ok: true as const, result: { score: 0, grade: "ORE" } }),
    }),
    [],
  );
  return (
    <InterviewRunner
      interviewId="demo"
      startedAt={startedAt}
      budgetSeconds={budgetSeconds}
      steps={steps}
      actions={actions}
      resultsPath={() => "/dev/practice"}
    />
  );
}
