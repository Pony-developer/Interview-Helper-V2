import "server-only";

import { codeToHtml } from "shiki";

const ALIASES: Record<string, string> = { ts: "typescript", js: "javascript", sh: "bash", html: "html", tsx: "tsx" };

/** Server-side syntax highlighting (Shiki). Returns trusted HTML. */
export async function highlight(code: string, lang = "ts") {
  const language = ALIASES[lang] ?? lang;
  try {
    return await codeToHtml(code.replace(/\n$/, ""), { lang: language, theme: "github-dark-default" });
  } catch {
    return await codeToHtml(code.replace(/\n$/, ""), { lang: "text", theme: "github-dark-default" });
  }
}
