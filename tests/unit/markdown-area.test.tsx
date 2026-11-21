// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { MarkdownArea } from "@/components/admin/MarkdownArea";

function Harness({ initial = "" }: { initial?: string }) {
  const [v, setV] = useState(initial);
  return <MarkdownArea ariaLabel="Prompt" value={v} onChange={setV} />;
}

const area = () => screen.getByLabelText("Prompt") as HTMLTextAreaElement;

afterEach(cleanup);

describe("MarkdownArea", () => {
  it("bolds the selection from the toolbar", () => {
    render(<Harness initial="make bold" />);
    area().setSelectionRange(5, 9);
    fireEvent.click(screen.getByLabelText("Bold (Ctrl+B)"));
    expect(area().value).toBe("make **bold**");
  });

  it("supports Ctrl+K and list continuation", () => {
    render(<Harness initial="- one" />);
    area().setSelectionRange(5, 5);
    fireEvent.keyDown(area(), { key: "Enter" });
    expect(area().value).toBe("- one\n- ");
    fireEvent.keyDown(area(), { key: "k", ctrlKey: true });
    expect(area().value).toBe("- one\n- [text](url)");
  });

  it("toggles a live preview", () => {
    render(<Harness initial="**hi** `x`" />);
    fireEvent.click(screen.getByRole("button", { name: /preview/i }));
    expect(document.querySelector("strong")?.textContent).toBe("hi");
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(area().value).toBe("**hi** `x`");
  });
});
