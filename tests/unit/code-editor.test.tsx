// @vitest-environment jsdom
import { EditorView } from "@codemirror/view";
import { cleanup, render, screen } from "@testing-library/react";
import { act, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeEditor, languageFor } from "@/components/admin/CodeEditor";

afterEach(cleanup);

function Harness({ initial, onChange }: { initial: string; onChange?: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <>
      <CodeEditor ariaLabel="Code" language="app.component.ts" value={v} onChange={(x) => (setV(x), onChange?.(x))} />
      <button onClick={() => setV("swapped")}>swap</button>
    </>
  );
}

const view = () => EditorView.findFromDOM(screen.getByLabelText("Code").closest(".cm-editor") as HTMLElement)!;

describe("CodeEditor", () => {
  it("shows the value and reports edits", () => {
    const onChange = vi.fn();
    render(<Harness initial={"const a = 1;"} onChange={onChange} />);
    expect(view().state.doc.toString()).toBe("const a = 1;");
    act(() => view().dispatch({ changes: { from: 12, insert: "\nconst b = 2;" } }));
    expect(onChange).toHaveBeenLastCalledWith("const a = 1;\nconst b = 2;");
  });

  it("applies external value changes without echoing them back", () => {
    const onChange = vi.fn();
    render(<Harness initial="one" onChange={onChange} />);
    act(() => screen.getByText("swap").click());
    expect(view().state.doc.toString()).toBe("swapped");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("picks a language from a file name or hint", () => {
    expect(languageFor("src/app.component.ts")).not.toBeNull();
    expect(languageFor("index.html")).not.toBeNull();
    expect(languageFor("styles.scss")).not.toBeNull();
    expect(languageFor("bash")).toBeNull();
  });
});
