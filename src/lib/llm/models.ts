/** On-device models offered for job-post analysis (WebLLM prebuilt, q4f16). */
export const LLM_MODELS = [
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    key: "balanced",
    label: "Qwen2.5 1.5B",
    downloadMb: 1000,
    vramMb: 1630,
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    key: "light",
    label: "Qwen2.5 0.5B",
    downloadMb: 400,
    vramMb: 945,
  },
] as const;

export type LlmModelKey = (typeof LLM_MODELS)[number]["key"];
export const DEFAULT_MODEL: LlmModelKey = "balanced";

export function modelByKey(key: LlmModelKey) {
  return LLM_MODELS.find((m) => m.key === key) ?? LLM_MODELS[0];
}
