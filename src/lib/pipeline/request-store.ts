"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LlmModelKey } from "@/lib/llm/models";

export type Method = "manual" | "url" | "llm_url" | "llm_text";
export type LevelChoice = "junior" | "middle" | "senior" | "auto";
export type TaskTypeChoice = "both" | "quiz" | "practice";
export const LENGTHS ={ short: 6, standard: 10, long: 15 } as const;
export type LengthKey = keyof typeof LENGTHS;

export type AnalysisRequest = {
  id: string;
  method: Method;
  skills: string[];
  url: string;
  text: string;
  level: LevelChoice;
  length: LengthKey;
  /** Which kinds of tasks to include. Optional so requests persisted before this existed still work. */
  taskTypes?: TaskTypeChoice;
  model: LlmModelKey;
  /** Paste mode without WebGPU: use the keyword matcher instead of the LLM. */
  keywordFallback: boolean;
  createdAt: number;
};

type Store = {
  request: AnalysisRequest | null;
  setRequest: (r: Omit<AnalysisRequest, "id" | "createdAt">) => void;
  clear: () => void;
};

/** Hand-off from the picker to the loading page (survives reloads within the tab). */
export const useAnalysisRequest = create<Store>()(
  persist(
    (set) => ({
      request: null,
      setRequest: (r) => set({ request: { ...r, id: crypto.randomUUID(), createdAt: Date.now() } }),
      clear: () => set({ request: null }),
    }),
    { name: "assay:analysis-request", storage: createJSONStorage(() => sessionStorage) },
  ),
);
