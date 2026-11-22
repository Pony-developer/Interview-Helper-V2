"use client";

import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
  LanguageSupport,
  StreamLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { Annotation, Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as placeholderExt,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useEffect, useRef } from "react";

/** Marks transactions that come from props so the update listener doesn't call onChange for them. */
const externalSync = Annotation.define<boolean>();

/** Maps a file extension or language name (ts, tsx, html, scss, …) to a CodeMirror language. */
export function languageFor(hint: string | undefined): LanguageSupport | null {
  const key = (hint ?? "").trim().toLowerCase().replace(/^.*\./, "");
  switch (key) {
    case "ts":
    case "typescript":
      return javascript({ typescript: true });
    case "tsx":
      return javascript({ typescript: true, jsx: true });
    case "jsx":
      return javascript({ jsx: true });
    case "js":
    case "mjs":
    case "cjs":
    case "javascript":
    case "json":
      return javascript();
    case "html":
    case "htm":
    case "vue":
    case "svelte":
      return html();
    case "css":
    case "scss":
    case "less":
      return css();
    case "cs":
    case "csharp":
      return new LanguageSupport(StreamLanguage.define(csharp));
    default:
      return null;
  }
}

const highlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.controlKeyword, t.moduleKeyword, t.definitionKeyword], color: "#7a3e9d" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "#0b6b4a" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#b45309" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "#7a8782", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: "#1d4ed8" },
  { tag: [t.typeName, t.className, t.namespace], color: "#0f766e" },
  { tag: [t.tagName, t.angleBracket], color: "#b4235a" },
  { tag: [t.attributeName, t.propertyName], color: "#1f4a8a" },
  { tag: [t.operator, t.punctuation, t.separator, t.bracket], color: "#46564f" },
  { tag: t.invalid, color: "#b42318" },
]);

function baseTheme(rows: number): Extension {
  return EditorView.theme({
    "&": {
      fontSize: "13px",
      backgroundColor: "#ffffff",
      color: "var(--color-ink, #10201b)",
      borderRadius: "0.75rem",
      border: "1px solid var(--color-paper-3, #e7e2d6)",
      boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
      maxHeight: "40rem",
      transition: "border-color 120ms, box-shadow 120ms",
    },
    "&.cm-focused": {
      outline: "none",
      borderColor: "var(--color-forest-600, #11785a)",
      boxShadow: "0 0 0 2px rgb(17 120 90 / 0.2)",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)",
      lineHeight: "1.65",
      overflow: "auto",
      borderRadius: "0.75rem",
    },
    ".cm-content": { padding: "0.6rem 0", minHeight: `${rows * 1.65 * 13 + 19}px`, caretColor: "var(--color-forest-700, #0b5a43)" },
    ".cm-line": { padding: "0 0.75rem 0 0.5rem" },
    ".cm-gutters": {
      backgroundColor: "var(--color-paper-2, #f4f1e8)",
      color: "var(--color-ink-soft, #65736d)",
      border: "none",
      borderRight: "1px solid var(--color-paper-3, #e7e2d6)",
      borderRadius: "0.75rem 0 0 0.75rem",
    },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 0.6rem 0 0.75rem", minWidth: "2.2rem" },
    ".cm-activeLine": { backgroundColor: "rgb(17 120 90 / 0.05)" },
    ".cm-activeLineGutter": { backgroundColor: "rgb(17 120 90 / 0.1)", color: "var(--color-forest-700, #0b5a43)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "rgb(17 120 90 / 0.22) !important" },
    "&.cm-focused .cm-matchingBracket": { backgroundColor: "rgb(17 120 90 / 0.18)", outline: "1px solid rgb(17 120 90 / 0.4)" },
    ".cm-foldPlaceholder": { backgroundColor: "var(--color-paper-2, #f4f1e8)", border: "1px solid var(--color-paper-3, #e7e2d6)", color: "var(--color-ink-muted, #46564f)" },
    ".cm-placeholder": { color: "var(--color-ink-soft, #65736d)" },
  });
}

/**
 * Code editor for the admin forms (CodeMirror 6): syntax highlighting, line numbers, auto-indent,
 * bracket closing / matching, folding, undo history. Tab indents; press Esc, then Tab, to leave the field.
 */
export function CodeEditor({
  id,
  value,
  onChange,
  rows = 10,
  language,
  placeholder,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  /** Language name or file name/extension: ts, tsx, js, html, css, "app.component.ts"… */
  language?: string;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const langCompartment = useRef(new Compartment());
  const initial = useRef({ value, rows, language, placeholder, ariaLabel, id });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Create the editor once; later prop changes are synced by the effects below.
  useEffect(() => {
    const init = initial.current;
    let escaped = false;
    const guardedTab = (run: (v: EditorView) => boolean) => (v: EditorView) => (escaped ? false : run(v));

    const state = EditorState.create({
      doc: init.value,
      extensions: [
        lineNumbers(),
        foldGutter(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        syntaxHighlighting(highlightStyle),
        langCompartment.current.of(languageFor(init.language) ?? []),
        keymap.of([
          { key: "Escape", run: () => ((escaped = true), true) },
          { key: "Tab", run: guardedTab(indentMore), shift: guardedTab(indentLess) },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
        ]),
        EditorView.domEventHandlers({
          keydown: (e) => {
            if (e.key !== "Escape" && e.key !== "Tab") escaped = false;
            return false;
          },
          blur: () => {
            escaped = false;
            return false;
          },
        }),
        EditorView.contentAttributes.of({
          ...(init.ariaLabel ? { "aria-label": init.ariaLabel } : {}),
          ...(init.id ? { id: init.id } : {}),
          spellcheck: "false",
          autocapitalize: "off",
          autocorrect: "off",
        }),
        init.placeholder ? placeholderExt(init.placeholder) : [],
        baseTheme(init.rows),
        EditorView.updateListener.of((u) => {
          if (u.docChanged && !u.transactions.some((tr) => tr.annotation(externalSync))) {
            onChangeRef.current(u.state.doc.toString());
          }
        }),
      ],
    });
    const v = new EditorView({ state, parent: host.current! });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
  }, []);

  // Controlled value: apply outside changes (e.g. switching to another file) without echoing them back.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const current = v.state.doc.toString();
    if (current !== value) {
      v.dispatch({ changes: { from: 0, to: current.length, insert: value }, annotations: externalSync.of(true) });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: langCompartment.current.reconfigure(languageFor(language) ?? []) });
  }, [language]);

  return <div ref={host} className="code-editor" />;
}
