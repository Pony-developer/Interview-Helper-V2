import { buildRunSource, TEST_KIT_SOURCE } from "./test-kit-source";

export const FRAMEWORKS = ["vanilla-js", "vanilla-ts", "react-ts", "angular"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

type SandpackTemplate = "vanilla" | "vanilla-ts" | "react-ts" | "angular";

export const FRAMEWORK_CONFIG: Record<
  Framework,
  { template: SandpackTemplate; entry: string; testsExt: "js" | "ts"; label: string; language: string }
> = {
  "vanilla-js": { template: "vanilla", entry: "/index.js", testsExt: "js", label: "JavaScript", language: "javascript" },
  "vanilla-ts": { template: "vanilla-ts", entry: "/index.ts", testsExt: "ts", label: "TypeScript", language: "typescript" },
  "react-ts": { template: "react-ts", entry: "/index.tsx", testsExt: "ts", label: "React + TypeScript", language: "tsx" },
  angular: { template: "angular", entry: "/src/main.ts", testsExt: "ts", label: "Angular", language: "typescript" },
};

/**
 * The Sandpack templates ship old toolchain defaults: the vanilla-ts tsconfig has no `target`
 * (TypeScript falls back to ES5, so `[...map.keys()]` silently becomes `[]`), and the plain-JS
 * Parcel/Babel setup can't parse ES2020+ syntax. These hidden files modernise both.
 */
const MODERN_TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: "es2020",
      module: "commonjs",
      lib: ["es2021", "dom", "dom.iterable"],
      strict: true,
      esModuleInterop: true,
      allowJs: true,
      jsx: "preserve",
      moduleResolution: "node",
      skipLibCheck: true,
    },
  },
  null,
  2,
);

const MODERN_BABELRC = JSON.stringify(
  {
    plugins: [
      "@babel/plugin-proposal-nullish-coalescing-operator",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-logical-assignment-operators",
      "@babel/plugin-proposal-class-properties",
    ],
  },
  null,
  2,
);

const TOOLCHAIN_FILES: Record<Framework, Record<string, string>> = {
  "vanilla-js": { "/.babelrc": MODERN_BABELRC },
  "vanilla-ts": { "tsconfig.json": MODERN_TSCONFIG },
  "react-ts": {},
  angular: {},
};

/** devDependencies the toolchain files above need inside the sandbox. */
export const TOOLCHAIN_DEV_DEPENDENCIES: Record<Framework, Record<string, string>> = {
  "vanilla-js": {
    "@babel/core": "7.22.20",
    "@babel/plugin-proposal-nullish-coalescing-operator": "7.18.6",
    "@babel/plugin-proposal-optional-chaining": "7.21.0",
    "@babel/plugin-proposal-logical-assignment-operators": "7.20.7",
    "@babel/plugin-proposal-class-properties": "7.18.6",
  },
  "vanilla-ts": {},
  "react-ts": {},
  angular: {},
};

/** Default entry files of the Sandpack templates (used when a task doesn't override the entry). */
const DEFAULT_ENTRIES: Record<Framework, string> = {
  "vanilla-js": 'import "./styles.css";\n',
  "vanilla-ts": 'import "./styles.css";\n',
  "react-ts": [
    'import React, { StrictMode } from "react";',
    'import { createRoot } from "react-dom/client";',
    'import "./styles.css";',
    'import App from "./App";',
    "",
    'const root = createRoot(document.getElementById("root")!);',
    "root.render(",
    "  <StrictMode>",
    "    <App />",
    "  </StrictMode>",
    ");",
    "",
  ].join("\n"),
  angular: [
    'import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";',
    'import { AppModule } from "./app/app.module";',
    "",
    "platformBrowserDynamic()",
    "  .bootstrapModule(AppModule)",
    "  .catch((err) => console.error(err));",
    "",
  ].join("\n"),
};

export type PracticePayload = {
  framework: Framework;
  /** Editable starter files keyed by absolute sandbox path, e.g. "/src/debounce.ts". */
  files: Record<string, string>;
  /** Files shown as editor tabs (defaults to all keys of `files`). */
  visibleFiles?: string[];
  activeFile?: string;
  /** Test source using the Assay test kit. Imports user code relative to /assay/. */
  tests: string;
  /** Number of `it(...)` cases (computed at seed time; used when the sandbox crashes). */
  testCount: number;
  /** Optional extra dependencies, e.g. { "rxjs": "6.6.3" } */
  dependencies?: Record<string, string>;
};

/**
 * A practice graded by its output instead of tests (copied from a course practice slide):
 * C# runs on Wandbox through our server, SQL runs in the browser on PGlite after `setup`.
 */
export type OutputPractice = {
  runner: "output";
  language: "csharp" | "sql";
  starter: string;
  /** SQL only: the script that creates the practice database. */
  setup?: string;
};

/** Any practice payload stored in tasks.practice. */
export type TaskPractice = PracticePayload | OutputPractice;

export const isOutputPractice = (p: TaskPractice | null | undefined): p is OutputPractice =>
  !!p && (p as OutputPractice).runner === "output";

/** File name an output practice's code is saved under (answers and solutions). */
export const outputPracticeFile = (language: OutputPractice["language"]) => (language === "sql" ? "query.sql" : "Program.cs");

function relativeFromEntry(entry: string, target: string) {
  const depth = entry.split("/").length - 2; // "/src/main.ts" → 1, "/index.ts" → 0
  return (depth === 0 ? "./" : "../".repeat(depth)) + target.replace(/^\//, "");
}

export type SandpackFile = { code: string; hidden?: boolean; readOnly?: boolean; active?: boolean };

/**
 * Builds the Sandpack file map for a practice task:
 * user files + hidden test kit, tests and runner, with the runner imported from the entry.
 */
export function buildSandpackFiles(practice: PracticePayload, userFiles: Record<string, string> = practice.files) {
  const cfg = FRAMEWORK_CONFIG[practice.framework];
  const files: Record<string, SandpackFile> = {};

  for (const [path, code] of Object.entries(userFiles)) {
    files[path] = { code };
  }

  const testsPath = `/assay/tests.${cfg.testsExt}`;
  files["/assay/test-kit.js"] = { code: TEST_KIT_SOURCE, hidden: true, readOnly: true };
  files[testsPath] = { code: practice.tests, hidden: true, readOnly: true };
  files["/assay/run.js"] = { code: buildRunSource(`./tests`), hidden: true, readOnly: true };

  // Toolchain config so modern syntax (`??`, `?.`, iterable spread) behaves as in real projects.
  for (const [path, code] of Object.entries(TOOLCHAIN_FILES[practice.framework])) {
    files[path] = { code, hidden: true, readOnly: true };
  }

  const entryCode = userFiles[cfg.entry] ?? DEFAULT_ENTRIES[practice.framework];
  const runImport = `import "${relativeFromEntry(cfg.entry, "/assay/run")}";\n`;
  files[cfg.entry] = {
    // Appended so the app's own imports (e.g. zone.js polyfills) evaluate first.
    code: entryCode.replace(/\s*$/, "\n") + runImport,
    hidden: !(cfg.entry in userFiles),
  };

  return files;
}

export function visibleFilesOf(practice: PracticePayload) {
  return practice.visibleFiles?.length ? practice.visibleFiles : Object.keys(practice.files);
}

export function countTests(source: string) {
  return (source.match(/(^|[^\w.])(it|test)\s*\(/g) ?? []).length;
}
