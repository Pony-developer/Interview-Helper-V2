"use client";

import type { InitProgressReport, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { modelByKey, type LlmModelKey } from "./models";

export type GpuSupport = { supported: true; adapterInfo?: string } | { supported: false; reason: "no-webgpu" | "no-adapter" | "error" };

/** Checks whether this browser/device can run WebGPU models. */
export async function checkWebGPU(): Promise<GpuSupport> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) return { supported: false, reason: "no-webgpu" };
  try {
    const gpu = (navigator as Navigator & { gpu: { requestAdapter: () => Promise<unknown> } }).gpu;
    const adapter = (await gpu.requestAdapter()) as { info?: { vendor?: string; architecture?: string } } | null;
    if (!adapter) return { supported: false, reason: "no-adapter" };
    const info = adapter.info ? [adapter.info.vendor, adapter.info.architecture].filter(Boolean).join(" ") : undefined;
    return { supported: true, adapterInfo: info || undefined };
  } catch {
    return { supported: false, reason: "error" };
  }
}

export async function isModelCached(key: LlmModelKey) {
  try {
    const { hasModelInCache } = await import("@mlc-ai/web-llm");
    return await hasModelInCache(modelByKey(key).id);
  } catch {
    return false;
  }
}

let current: { key: LlmModelKey; engine: Promise<WebWorkerMLCEngine> } | null = null;

/**
 * Creates (or reuses) the worker-backed engine. `onProgress` receives real download/compile progress.
 * The model is cached by the browser (Cache API), so later runs skip the download.
 */
export function loadEngine(key: LlmModelKey, onProgress: (report: InitProgressReport) => void) {
  if (current?.key === key) {
    onProgress({ progress: 1, timeElapsed: 0, text: "ready" });
    return current.engine;
  }
  const engine = (async () => {
    const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    return CreateWebWorkerMLCEngine(worker, modelByKey(key).id, { initProgressCallback: onProgress });
  })();
  current = { key, engine };
  engine.catch(() => {
    if (current?.engine === engine) current = null;
  });
  return engine;
}
