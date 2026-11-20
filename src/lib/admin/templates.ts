import type { Framework } from "@/lib/playground/frameworks";
import { SAMPLE_PRACTICE } from "@/lib/playground/samples";

/** Starter presets for new practice tasks in the admin panel. */
export type PracticeTemplate = {
  id: string;
  label: string;
  framework: Framework;
  files: Record<string, string>;
  visibleFiles?: string[];
  activeFile?: string;
  tests: string;
};

const HTML_CSS: PracticeTemplate = {
  id: "html-css",
  label: "HTML / CSS",
  framework: "vanilla-js",
  files: {
    "/styles.css": ".card {\n  /* TODO */\n}\n",
    "/index.html":
      '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Task</title>\n  </head>\n  <body>\n    <div class="card">Hello</div>\n    <script src="index.js"></script>\n  </body>\n</html>\n',
    "/index.js": 'import "./styles.css";\n',
  },
  visibleFiles: ["/styles.css", "/index.html"],
  activeFile: "/styles.css",
  tests:
    'import { it, expect } from "./test-kit";\n\nconst css = (sel, prop) => getComputedStyle(document.querySelector(sel)).getPropertyValue(prop);\n\nit("makes the card a flex container", () => {\n  expect(css(".card", "display")).toBe("flex");\n});\n',
};

const fromSample = (id: string, label: string, key: Framework): PracticeTemplate => {
  const s = SAMPLE_PRACTICE[key];
  return {
    id,
    label,
    framework: s.framework,
    files: s.files,
    visibleFiles: s.visibleFiles,
    activeFile: s.activeFile,
    tests: s.tests,
  };
};

export const PRACTICE_TEMPLATES: PracticeTemplate[] = [
  fromSample("javascript", "JavaScript", "vanilla-js"),
  fromSample("typescript", "TypeScript", "vanilla-ts"),
  fromSample("react", "React + TypeScript", "react-ts"),
  fromSample("angular", "Angular", "angular"),
  HTML_CSS,
];

export function practiceTemplate(id: string | undefined) {
  return PRACTICE_TEMPLATES.find((t) => t.id === id) ?? PRACTICE_TEMPLATES[0];
}
