/**
 * Validates a post-login redirect target. Only same-origin relative paths are allowed;
 * protocol-relative (`//evil.com`) and backslash tricks (`/\evil.com`) are rejected.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/practice"): string {
  if (!next || typeof next !== "string") return fallback;
  if (next.length > 512) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\\]/.test(next)) return fallback;
  try {
    const url = new URL(next, "http://assay.local");
    if (url.origin !== "http://assay.local") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
