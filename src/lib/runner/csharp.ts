/**
 * Compiles and runs C# on Wandbox (https://wandbox.org), a free public compiler service.
 * Mono's compiler (C# 7) answers in a few seconds; Wandbox's .NET 6/8 images restore a project on
 * every run (~20 s) and were unreliable when this was written, so Mono is the default.
 * The code is sent verbatim, so compiler line numbers match the editor.
 */
export const CSHARP_COMPILER = process.env.WANDBOX_CSHARP_COMPILER || "mono-6.12.0.199";
const ENDPOINT = "https://wandbox.org/api/compile.json";
const MAX_CODE = 50_000;
const MAX_OUTPUT = 20_000;

export type RunResult =
  | { status: "ok"; output: string; exitCode: number; runtimeError: string | null }
  | { status: "compile-error"; messages: string }
  | { status: "unavailable"; reason: "timeout" | "network" | "busy" | "too-large" };

type WandboxResponse = {
  status?: string;
  signal?: string;
  compiler_output?: string;
  compiler_error?: string;
  program_output?: string;
  program_error?: string;
};

const clip = (s: string | undefined) => (s ?? "").slice(0, MAX_OUTPUT);

export async function runCSharp(code: string, { stdin = "", timeoutMs = 45_000 } = {}): Promise<RunResult> {
  if (code.length > MAX_CODE) return { status: "unavailable", reason: "too-large" };
  let data: WandboxResponse;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler: CSHARP_COMPILER, code, stdin, save: false }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    // Wandbox rate-limits per IP and answers 429 for a while after a burst of runs.
    if (res.status === 429) return { status: "unavailable", reason: "busy" };
    if (!res.ok) return { status: "unavailable", reason: "network" };
    data = (await res.json()) as WandboxResponse;
  } catch (e) {
    const timeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return { status: "unavailable", reason: timeout ? "timeout" : "network" };
  }

  const compilerText = `${data.compiler_output ?? ""}${data.compiler_error ?? ""}`;
  if (/Compilation failed|error CS\d+/.test(compilerText)) {
    // Keep the errors, drop the "Compilation failed: n error(s)" summary noise around them.
    const messages = compilerText
      .split("\n")
      .filter((line) => /error CS\d+/.test(line))
      .join("\n");
    return { status: "compile-error", messages: clip(messages || compilerText) };
  }

  const exitCode = Number.parseInt(data.status ?? "0", 10) || 0;
  const programError = clip(data.program_error).trim();
  return {
    status: "ok",
    output: clip(data.program_output),
    exitCode,
    runtimeError: programError || (data.signal ? `Terminated: ${data.signal}` : null),
  };
}
