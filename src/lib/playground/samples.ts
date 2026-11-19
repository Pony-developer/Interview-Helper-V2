import type { PracticePayload } from "./frameworks";

/** Spike samples for the dev playground page (one per framework). */
export const SAMPLE_PRACTICE: Record<string, PracticePayload> = {
  "vanilla-ts": {
    framework: "vanilla-ts",
    files: {
      "/src/binarySearch.ts": `export function binarySearch(items: number[], target: number): number {\n  // TODO: return the index of target in the sorted array, or -1\n  return items.indexOf(target);\n}\n`,
      "/index.ts": `import "./styles.css";\nimport { binarySearch } from "./src/binarySearch";\n\nconst data = [1, 3, 5, 7, 9, 11];\ndocument.getElementById("app")!.innerHTML = \`<h1>Binary search</h1><p>Index of 7: <output id="out">\${binarySearch(data, 7)}</output></p>\`;\n`,
    },
    visibleFiles: ["/src/binarySearch.ts", "/index.ts"],
    activeFile: "/src/binarySearch.ts",
    tests: `import { describe, it, expect, screen } from "./test-kit";\nimport { binarySearch } from "../src/binarySearch";\n\ndescribe("binarySearch", () => {\n  it("finds an element", () => expect(binarySearch([1, 3, 5, 7], 5)).toBe(2));\n  it("returns -1 when missing", () => expect(binarySearch([1, 3, 5, 7], 4)).toBe(-1));\n  it("renders the demo", async () => expect((await screen.findByText("3")).tagName).toBe("OUTPUT"));\n});\n`,
    testCount: 3,
  },
  "vanilla-js": {
    framework: "vanilla-js",
    files: {
      "/src/sum.js": `export function sum(a, b) {\n  return a + b;\n}\n`,
      "/index.js": `import "./styles.css";\nimport { sum } from "./src/sum";\n\ndocument.getElementById("app").innerHTML = "<h1>2 + 2 = " + sum(2, 2) + "</h1>";\n`,
    },
    visibleFiles: ["/src/sum.js", "/index.js"],
    activeFile: "/src/sum.js",
    tests: `import { it, expect, screen } from "./test-kit";\nimport { sum } from "../src/sum";\n\nit("adds numbers", () => expect(sum(2, 3)).toBe(5));\nit("shows the heading", async () => { await screen.findByRole("heading", { name: "2 + 2 = 4" }); });\n`,
    testCount: 2,
  },
  "react-ts": {
    framework: "react-ts",
    files: {
      "/App.tsx": `import { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <main>\n      <h1>Counter</h1>\n      <p data-testid="value">{count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </main>\n  );\n}\n`,
    },
    activeFile: "/App.tsx",
    tests: `import { it, expect, screen, user } from "./test-kit";\n\nit("starts at zero", async () => {\n  expect((await screen.findByTestId("value")).textContent).toBe("0");\n});\nit("increments", async () => {\n  await user.click(await screen.findByRole("button", { name: /increment/i }));\n  expect(screen.getByTestId("value")).toHaveTextContent("1");\n});\n`,
    testCount: 2,
  },
  angular: {
    framework: "angular",
    files: {
      "/src/app/app.component.ts": `import { Component } from "@angular/core";\n\n@Component({\n  selector: "app-root",\n  template: \`\n    <h1>Fruits</h1>\n    <label for="q">Filter</label>\n    <input id="q" [(ngModel)]="query" />\n    <ul>\n      <li *ngFor="let f of filtered">{{ f }}</li>\n    </ul>\n  \`,\n})\nexport class AppComponent {\n  query = "";\n  fruits = ["Apple", "Banana", "Cherry"];\n  get filtered() {\n    return this.fruits.filter((f) => f.toLowerCase().includes(this.query.toLowerCase()));\n  }\n}\n`,
      "/src/app/app.module.ts": `import { NgModule } from "@angular/core";\nimport { BrowserModule } from "@angular/platform-browser";\nimport { FormsModule } from "@angular/forms";\nimport { AppComponent } from "./app.component";\n\n@NgModule({\n  declarations: [AppComponent],\n  imports: [BrowserModule, FormsModule],\n  bootstrap: [AppComponent],\n})\nexport class AppModule {}\n`,
    },
    visibleFiles: ["/src/app/app.component.ts", "/src/app/app.module.ts"],
    activeFile: "/src/app/app.component.ts",
    dependencies: { "@angular/forms": "^11.2.0" },
    tests: `import { it, expect, screen, user } from "./test-kit";\n\nit("lists all fruits", async () => {\n  expect(await screen.findAllByRole("listitem")).toHaveLength(3);\n});\nit("filters by query", async () => {\n  await user.type(await screen.findByLabelText("Filter"), "an");\n  expect(screen.getAllByRole("listitem")).toHaveLength(1);\n});\n`,
    testCount: 2,
  },
};
