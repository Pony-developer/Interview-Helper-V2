"use client";

import { Bold, Code, Eye, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Pencil, Quote, SquareCode } from "lucide-react";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  applyEditToString,
  continueList,
  indentLines,
  insertCodeBlock,
  insertLink,
  toggleLinePrefix,
  wrapSelection,
  type Edit,
} from "./markdown-edits";

type Tool = { key: string; label: string; icon: ReactNode; run: (v: string, s: number, e: number) => Edit };

const TOOLS: (Tool | "sep")[] = [
  { key: "h", label: "Heading", icon: <Heading2 aria-hidden className="h-4 w-4" />, run: (v, s, e) => toggleLinePrefix(v, s, e, "heading") },
  { key: "b", label: "Bold (Ctrl+B)", icon: <Bold aria-hidden className="h-4 w-4" />, run: (v, s, e) => wrapSelection(v, s, e, "**", "bold") },
  { key: "i", label: "Italic (Ctrl+I)", icon: <Italic aria-hidden className="h-4 w-4" />, run: (v, s, e) => wrapSelection(v, s, e, "*", "italic") },
  { key: "c", label: "Inline code", icon: <Code aria-hidden className="h-4 w-4" />, run: (v, s, e) => wrapSelection(v, s, e, "`", "code") },
  { key: "cb", label: "Code block", icon: <SquareCode aria-hidden className="h-4 w-4" />, run: (v, s, e) => insertCodeBlock(v, s, e) },
  "sep",
  { key: "l", label: "Link (Ctrl+K)", icon: <LinkIcon aria-hidden className="h-4 w-4" />, run: (v, s, e) => insertLink(v, s, e) },
  { key: "ul", label: "Bulleted list", icon: <List aria-hidden className="h-4 w-4" />, run: (v, s, e) => toggleLinePrefix(v, s, e, "bullet") },
  { key: "ol", label: "Numbered list", icon: <ListOrdered aria-hidden className="h-4 w-4" />, run: (v, s, e) => toggleLinePrefix(v, s, e, "ordered") },
  { key: "q", label: "Quote", icon: <Quote aria-hidden className="h-4 w-4" />, run: (v, s, e) => toggleLinePrefix(v, s, e, "quote") },
];

const toolBtn =
  "inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-white hover:text-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600/40 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Markdown textarea with a formatting toolbar, keyboard shortcuts (Ctrl/Cmd + B, I, K), list
 * continuation on Enter, Tab indentation and a Write / Preview switch. Edits go through
 * `execCommand("insertText")` when available so the browser's undo stack keeps working.
 */
export function MarkdownArea({
  id,
  value,
  onChange,
  rows = 8,
  ariaLabel,
  badge,
  preview = true,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  ariaLabel?: string;
  /** Small label shown in the toolbar (e.g. the language). */
  badge?: string;
  /** Show the Write / Preview switch. Disable when the parent renders its own preview. */
  preview?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const previewing = preview && mode === "preview";

  function apply(edit: Edit) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(edit.from, edit.to);
    // Keeps native undo/redo; React sees the resulting input event and calls onChange.
    let ok = false;
    try {
      ok = document.execCommand("insertText", false, edit.insert);
    } catch {
      ok = false;
    }
    if (!ok || el.value !== applyEditToString(value, edit)) {
      onChange(applyEditToString(value, edit));
    }
    requestAnimationFrame(() => el.setSelectionRange(edit.selStart, edit.selEnd));
  }

  function run(tool: Tool) {
    const el = ref.current;
    if (!el) return;
    apply(tool.run(el.value, el.selectionStart, el.selectionEnd));
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (e.key === "Escape") el.dataset.tabEscape = "1";
    else if (e.key !== "Tab") delete el.dataset.tabEscape;

    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.altKey && !e.shiftKey) {
      const shortcut = { b: "b", i: "i", k: "l" }[e.key.toLowerCase() as "b" | "i" | "k"];
      const tool = shortcut ? TOOLS.find((t): t is Tool => t !== "sep" && t.key === shortcut) : undefined;
      if (tool) {
        e.preventDefault();
        run(tool);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && !mod && !e.altKey && !e.nativeEvent.isComposing) {
      const edit = continueList(el.value, el.selectionStart, el.selectionEnd);
      if (edit) {
        e.preventDefault();
        apply(edit);
      }
      return;
    }
    if (e.key === "Tab" && !mod && !e.altKey && el.dataset.tabEscape !== "1") {
      e.preventDefault();
      apply(indentLines(el.value, el.selectionStart, el.selectionEnd, e.shiftKey));
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-paper-3 bg-white shadow-sm transition focus-within:border-forest-600 focus-within:ring-2 focus-within:ring-forest-600/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-paper-3 bg-paper-2/70 px-1.5 py-1">
        {TOOLS.map((t) =>
          t === "sep" ? (
            <span key="sep" aria-hidden className="mx-1 h-4 w-px bg-paper-3" />
          ) : (
            <button
              key={t.key}
              type="button"
              title={t.label}
              aria-label={t.label}
              disabled={previewing}
              // Keep the caret and selection in the textarea when clicking a tool.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(t)}
              className={toolBtn}
            >
              {t.icon}
            </button>
          ),
        )}
        <span className="ml-auto flex items-center gap-1.5">
          {preview ? (
            <button
              type="button"
              aria-pressed={previewing}
              onClick={() => setMode(previewing ? "write" : "preview")}
              className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors ${
                previewing ? "bg-forest-700 text-white" : "text-ink-muted hover:bg-white hover:text-forest-700"
              }`}
            >
              {previewing ? <Pencil aria-hidden className="h-3.5 w-3.5" /> : <Eye aria-hidden className="h-3.5 w-3.5" />}
              {previewing ? "Edit" : "Preview"}
            </button>
          ) : null}
          {badge ? (
            <span className="rounded bg-paper-3/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">{badge}</span>
          ) : null}
        </span>
      </div>

      {previewing ? (
        <div className="prose-assay max-h-[32rem] min-h-[8rem] overflow-auto bg-paper px-4 py-3" style={{ minHeight: `${rows * 1.5 + 1}rem` }}>
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-sm text-ink-soft">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          value={value}
          rows={rows}
          spellCheck
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={(e) => delete e.currentTarget.dataset.tabEscape}
          className="block max-h-[32rem] min-h-[8rem] w-full resize-y bg-white px-3 py-2.5 font-mono text-[13px] leading-relaxed text-ink outline-none"
          style={{ fieldSizing: "content" } as CSSProperties}
        />
      )}
    </div>
  );
}
