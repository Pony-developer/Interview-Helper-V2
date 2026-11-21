import { describe, expect, it } from "vitest";
import {
  applyEditToString as apply,
  continueList,
  indentLines,
  insertCodeBlock,
  insertLink,
  toggleLinePrefix,
  wrapSelection,
} from "@/components/admin/markdown-edits";

describe("markdown editor edits", () => {
  it("wraps and unwraps a selection", () => {
    const v = "make it bold now";
    const e = wrapSelection(v, 8, 12, "**", "bold");
    expect(apply(v, e)).toBe("make it **bold** now");
    expect(v.slice(0, 0) + apply(v, e).slice(e.selStart, e.selEnd)).toBe("bold");
    const v2 = apply(v, e);
    const un = wrapSelection(v2, e.selStart, e.selEnd, "**", "bold");
    expect(apply(v2, un)).toBe(v);
  });

  it("inserts a placeholder for an empty selection", () => {
    const e = wrapSelection("a ", 2, 2, "`", "code");
    expect(apply("a ", e)).toBe("a `code`");
    expect(apply("a ", e).slice(e.selStart, e.selEnd)).toBe("code");
  });

  it("toggles bullet prefixes across lines and numbers ordered lists", () => {
    const v = "one\ntwo\nthree";
    const on = toggleLinePrefix(v, 0, v.length, "bullet");
    expect(apply(v, on)).toBe("- one\n- two\n- three");
    const off = toggleLinePrefix("- one\n- two", 0, 11, "bullet");
    expect(apply("- one\n- two", off)).toBe("one\ntwo");
    const ord = toggleLinePrefix(v, 0, v.length, "ordered");
    expect(apply(v, ord)).toBe("1. one\n2. two\n3. three");
    const swap = toggleLinePrefix("- one\n- two", 0, 11, "ordered");
    expect(apply("- one\n- two", swap)).toBe("1. one\n2. two");
  });

  it("keeps the caret on a single line", () => {
    const e = toggleLinePrefix("hello", 5, 5, "heading");
    expect(apply("hello", e)).toBe("## hello");
    expect(e.selStart).toBe(8);
  });

  it("builds fenced code blocks and links", () => {
    const e = insertCodeBlock("x = 1", 0, 5);
    expect(apply("x = 1", e)).toBe("```\nx = 1\n```");
    expect(apply("x = 1", e).slice(e.selStart, e.selEnd)).toBe("x = 1");
    const l = insertLink("see docs", 4, 8);
    expect(apply("see docs", l)).toBe("see [docs](url)");
    expect(apply("see docs", l).slice(l.selStart, l.selEnd)).toBe("url");
  });

  it("continues lists on Enter and ends them on an empty item", () => {
    const v = "- one";
    expect(apply(v, continueList(v, 5, 5)!)).toBe("- one\n- ");
    const n = "1. one";
    expect(apply(n, continueList(n, 6, 6)!)).toBe("1. one\n2. ");
    const empty = "- one\n- ";
    expect(apply(empty, continueList(empty, 8, 8)!)).toBe("- one\n");
    expect(continueList("plain", 5, 5)).toBeNull();
    expect(continueList("- one two", 3, 3)).toBeNull();
  });

  it("indents and outdents", () => {
    expect(apply("a", indentLines("a", 1, 1, false))).toBe("a  ");
    expect(apply("a\nb", indentLines("a\nb", 0, 3, false))).toBe("  a\n  b");
    expect(apply("  a\n  b", indentLines("  a\n  b", 0, 7, true))).toBe("a\nb");
  });
});
