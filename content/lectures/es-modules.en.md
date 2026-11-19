---
skill: es-modules
title: "ES modules: import/export, live bindings and code splitting"
summary: "How ESM differs from CommonJS, named vs default exports, live bindings, evaluation order, circular imports and dynamic import()."
readingMinutes: 8
---

ES modules (ESM) are JavaScript's standard module system, used natively by browsers, Node.js and every modern bundler.

## Syntax

```js
// math.js
export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export default class Circle { /* ... */ }

// app.js
import Circle, { area, PI as pi } from "./math.js";
import * as math from "./math.js";       // namespace object
export { area } from "./math.js";          // re-export (barrel files)
```

- **Named exports** are explicit, so tooling can tree-shake them and rename-refactor them safely.
- A **default export** is a single "main" value. Importers choose its name, which makes searching the codebase harder.

## ESM vs CommonJS

| | ESM | CommonJS |
| --- | --- | --- |
| Syntax | `import` / `export` | `require` / `module.exports` |
| Analysis | static, at parse time | dynamic, at run time |
| Loading | asynchronous, can use top-level `await` | synchronous |
| Bindings | **live** (read-only views of the export) | value copies |
| Tree-shaking | yes | limited |

Because imports are static, they must sit at the top level with string literals. Bundlers can then remove unused exports.

## Live bindings

```js
// counter.js
export let count = 0;
export function inc() { count++; }

// main.js
import { count, inc } from "./counter.js";
inc();
console.log(count); // 1: the import reflects the module's current value
count = 5;          // TypeError: imports are read-only
```

## Evaluation order

A module is evaluated **once**, the first time it's imported, and every importer shares the same instance. That makes modules natural singletons. Dependencies are evaluated depth-first, before the importing module's body.

**Circular imports** work only if neither module uses the other's exports during its top-level evaluation. Otherwise you hit the TDZ (`ReferenceError`) or see `undefined`. Break cycles by moving shared code into a third module.

## Dynamic `import()`

```js
const { Chart } = await import("./chart.js"); // returns a promise of the namespace
```

Use it for code splitting (load heavy features on demand) and for conditional loading. Bundlers create a separate chunk for each dynamic import.

## Going deeper

**Evaluation is a depth-first walk.** The loader evaluates dependencies before their importers, in import order, and each module only once. A module that is still loading when it's imported again (a cycle) is skipped, which is why circular imports can see uninitialised bindings.

**Top-level await.** A module that awaits at the top level makes everything that depends on it wait until it finishes evaluating. The thread isn't blocked, and unrelated branches of the graph still run.

**Importing CommonJS from ESM (Node.js).** The default import is always `module.exports`. Named imports work only for names Node can detect statically (`exports.parse = ...`). For dynamically built exports, import the default and destructure it.

**Which format a file is.** `.mjs` is always ESM and `.cjs` always CommonJS. A `.js` file follows the nearest `package.json` `"type"` field.

## Interview checklist

- Contrast ESM and CommonJS, and explain why static imports enable tree-shaking.
- Explain live bindings, and that imports are read-only.
- Describe what happens with circular dependencies and how to fix them.
- Use `import()` for lazy loading heavy code.
