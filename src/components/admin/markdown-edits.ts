/**
 * Pure text transformations behind the admin Markdown editor. Each one takes the textarea value and
 * selection and returns an Edit: replace [from, to) with `insert`, then select [selStart, selEnd]
 * (positions in the resulting text). Keeping them pure makes them unit-testable.
 */
export type Edit = { from: number; to: number; insert: string; selStart: number; selEnd: number };

export type LineKind = "bullet" | "ordered" | "quote" | "heading";

export function applyEditToString(value: string, edit: Edit): string {
  return value.slice(0, edit.from) + edit.insert + value.slice(edit.to);
}

/** Wraps the selection in `marker` (e.g. ** or `), or removes the marker if it is already wrapped. */
export function wrapSelection(value: string, s: number, e: number, marker: string, placeholder: string): Edit {
  const m = marker.length;
  const sel = value.slice(s, e);
  if (sel && sel.startsWith(marker) && sel.endsWith(marker) && sel.length >= 2 * m) {
    const inner = sel.slice(m, sel.length - m);
    return { from: s, to: e, insert: inner, selStart: s, selEnd: s + inner.length };
  }
  if (value.slice(Math.max(0, s - m), s) === marker && value.slice(e, e + m) === marker) {
    return { from: s - m, to: e + m, insert: sel, selStart: s - m, selEnd: s - m + sel.length };
  }
  const text = sel || placeholder;
  return { from: s, to: e, insert: marker + text + marker, selStart: s + m, selEnd: s + m + text.length };
}

const LINE_MARKERS: Record<LineKind, RegExp> = {
  bullet: /^(\s*)[-*+] /,
  ordered: /^(\s*)\d+\. /,
  quote: /^(\s*)> ?/,
  heading: /^(\s*)#{1,6} /,
};

/** Toggles a list / quote / heading prefix on every line the selection touches. */
export function toggleLinePrefix(value: string, s: number, e: number, kind: LineKind): Edit {
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const endProbe = e > s && value[e - 1] === "\n" ? e - 1 : e;
  const nl = value.indexOf("\n", endProbe);
  const lineEnd = nl === -1 ? value.length : nl;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const re = LINE_MARKERS[kind];
  const content = lines.filter((l) => l.trim() !== "");
  const allMarked = content.length > 0 && content.every((l) => re.test(l));

  let n = 0;
  const out = lines.map((line) => {
    if (allMarked) return line.replace(re, "$1");
    if (line.trim() === "" && lines.length > 1) return line;
    // Replace any other list/heading marker rather than stacking them.
    const stripped = line.replace(/^(\s*)(?:[-*+] |\d+\. |#{1,6} )/, "$1");
    const indent = /^\s*/.exec(stripped)![0];
    const body = stripped.slice(indent.length);
    n += 1;
    const prefix = kind === "bullet" ? "- " : kind === "ordered" ? `${n}. ` : kind === "quote" ? "> " : "## ";
    return indent + prefix + body;
  });

  const insert = out.join("\n");
  const oldBlock = value.slice(lineStart, lineEnd);
  if (lines.length === 1) {
    const delta = insert.length - oldBlock.length;
    const caretMin = lineStart;
    return {
      from: lineStart,
      to: lineEnd,
      insert,
      selStart: Math.max(caretMin, s + delta),
      selEnd: Math.max(caretMin, e + delta),
    };
  }
  return { from: lineStart, to: lineEnd, insert, selStart: lineStart, selEnd: lineStart + insert.length };
}

/** Wraps the selection (or an empty line) in a fenced code block. */
export function insertCodeBlock(value: string, s: number, e: number): Edit {
  const sel = value.slice(s, e);
  const lead = s > 0 && value[s - 1] !== "\n" ? "\n" : "";
  const trail = e < value.length && value[e] !== "\n" ? "\n" : "";
  const open = `${lead}\`\`\`\n`;
  const insert = `${open}${sel}\n\`\`\`${trail}`;
  const start = s + open.length;
  return { from: s, to: e, insert, selStart: start, selEnd: start + sel.length };
}

/** `[text](url)` — selects the url when the selection was the link text, else the placeholder text. */
export function insertLink(value: string, s: number, e: number): Edit {
  const sel = value.slice(s, e);
  if (/^https?:\/\/\S+$/.test(sel)) {
    const insert = `[link](${sel})`;
    return { from: s, to: e, insert, selStart: s + 1, selEnd: s + 5 };
  }
  if (sel) {
    const insert = `[${sel}](url)`;
    const start = s + sel.length + 3;
    return { from: s, to: e, insert, selStart: start, selEnd: start + 3 };
  }
  return { from: s, to: e, insert: "[text](url)", selStart: s + 1, selEnd: s + 5 };
}

/**
 * Enter at the end of a list item continues the list (`- `, `* `, `1. `); Enter on an empty item ends it.
 * Returns null when the default newline should happen.
 */
export function continueList(value: string, s: number, e: number): Edit | null {
  if (s !== e) return null;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const nl = value.indexOf("\n", s);
  const lineEnd = nl === -1 ? value.length : nl;
  if (s !== lineEnd) return null;
  const line = value.slice(lineStart, lineEnd);
  const m = /^(\s*)([-*+]|(\d+)\.) (.*)$/.exec(line);
  if (!m) return null;
  const [, indent, marker, num, rest] = m;
  if (rest.trim() === "") {
    return { from: lineStart, to: lineEnd, insert: "", selStart: lineStart, selEnd: lineStart };
  }
  const next = num ? `${Number(num) + 1}.` : marker;
  const insert = `\n${indent}${next} `;
  const pos = s + insert.length;
  return { from: s, to: s, insert, selStart: pos, selEnd: pos };
}

/** Tab / Shift+Tab: indent or outdent the touched lines by two spaces (or insert spaces for a caret). */
export function indentLines(value: string, s: number, e: number, outdent: boolean): Edit {
  if (!outdent && s === e) {
    return { from: s, to: e, insert: "  ", selStart: s + 2, selEnd: s + 2 };
  }
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const endProbe = e > s && value[e - 1] === "\n" ? e - 1 : e;
  const nl = value.indexOf("\n", endProbe);
  const lineEnd = nl === -1 ? value.length : nl;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  let firstDelta = 0;
  const out = lines.map((line, i) => {
    let next: string;
    if (outdent) {
      const ws = /^ {1,2}/.exec(line)?.[0].length ?? 0;
      next = line.slice(ws);
      if (i === 0) firstDelta = -ws;
    } else {
      next = "  " + line;
      if (i === 0) firstDelta = 2;
    }
    return next;
  });
  const insert = out.join("\n");
  const oldLen = lineEnd - lineStart;
  if (lines.length === 1) {
    return {
      from: lineStart,
      to: lineEnd,
      insert,
      selStart: Math.max(lineStart, s + firstDelta),
      selEnd: Math.max(lineStart, e + insert.length - oldLen),
    };
  }
  return { from: lineStart, to: lineEnd, insert, selStart: lineStart, selEnd: lineStart + insert.length };
}
