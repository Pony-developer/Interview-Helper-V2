import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const CLASSIC: [string, string] = [
  "This runs as a classic script (not a module, no `\"use strict\"`). What does it print?",
  "Код виконується як класичний скрипт (не модуль, без `\"use strict\"`). Що він виведе?",
];

const RESOLVER_TYPES = String.raw`export type DeclKind = "var" | "let" | "const" | "function" | "param";
export type Declaration = { name: string; kind: DeclKind; at: number };
export type Reference = { id: string; name: string; mode: "read" | "write"; at: number };
export type Scope = {
  kind: "global" | "function" | "block";
  /** "use strict" in this scope; applies to everything nested inside it. */
  strict?: boolean;
  declarations?: Declaration[];
  references?: Reference[];
  children?: Scope[];
};
/** A scope path ("0", "0.1", "0.1.0": child indexes from the root) or an outcome. */
export type Resolution = string;
`;

const RESOLVER_STARTER =
  RESOLVER_TYPES +
  String.raw`
/**
 * For every reference, returns the path of the scope whose declaration it uses, or:
 * "tdz", "not-defined", "implicit-global" or "const-assignment".
 */
export function resolve(program: Scope): Record<string, Resolution> {
  // TODO: only looks in the reference's own scope
  const out: Record<string, Resolution> = {};
  const visit = (scope: Scope, path: string) => {
    for (const ref of scope.references ?? []) {
      const found = (scope.declarations ?? []).some((d) => d.name === ref.name);
      out[ref.id] = found ? path : "not-defined";
    }
    (scope.children ?? []).forEach((child, i) => visit(child, path + "." + i));
  };
  visit(program, "0");
  return out;
}
`;

const RESOLVER_SOLUTION =
  RESOLVER_TYPES +
  String.raw`
type Node = { scope: Scope; path: string; parent: Node | null; strict: boolean; names: Map<string, Declaration> };

export function resolve(program: Scope): Record<string, Resolution> {
  const nodes: Node[] = [];
  const build = (scope: Scope, path: string, parent: Node | null) => {
    const node: Node = { scope, path, parent, strict: Boolean(scope.strict || parent?.strict), names: new Map() };
    nodes.push(node);
    (scope.children ?? []).forEach((child, i) => build(child, path + "." + i, node));
  };
  build(program, "0", null);

  // Phase 1 ("compile"): register every declaration. var skips blocks and lands in the nearest function or global scope.
  for (const node of nodes) {
    for (const decl of node.scope.declarations ?? []) {
      let target = node;
      if (decl.kind === "var") while (target.scope.kind === "block" && target.parent) target = target.parent;
      if (!target.names.has(decl.name)) target.names.set(decl.name, decl);
    }
  }

  // Phase 2 ("execute"): resolve each reference by walking outwards.
  const out: Record<string, Resolution> = {};
  for (const node of nodes) {
    for (const ref of node.scope.references ?? []) {
      let current: Node | null = node;
      let crossedFunction = false;
      let decl: Declaration | undefined;
      while (current) {
        decl = current.names.get(ref.name);
        if (decl) break;
        if (current.scope.kind === "function") crossedFunction = true;
        current = current.parent;
      }
      if (!current || !decl) {
        out[ref.id] = ref.mode === "write" && !node.strict ? "implicit-global" : "not-defined";
      } else if ((decl.kind === "let" || decl.kind === "const") && !crossedFunction && decl.at > ref.at) {
        // Same function, used before the declaration ran. Inside a nested function it may run later, so it's fine.
        out[ref.id] = "tdz";
      } else if (decl.kind === "const" && ref.mode === "write") {
        out[ref.id] = "const-assignment";
      } else {
        out[ref.id] = current.path;
      }
    }
  }
  return out;
}
`;

const RESOLVER_INDEX = String.raw`import "./styles.css";
import { resolve, type Scope } from "./src/resolver";

// let total = 0;                         (global, at 0)
// function add(n) {                      (0.0)
//   if (n > 0) { var seen = true; }      (0.0.0)
//   totl = total + n; // typo!
//   return seen;
// }
const program: Scope = {
  kind: "global",
  declarations: [{ name: "total", kind: "let", at: 0 }, { name: "add", kind: "function", at: 10 }],
  children: [
    {
      kind: "function",
      declarations: [{ name: "n", kind: "param", at: 20 }],
      references: [
        { id: "totl =", name: "totl", mode: "write", at: 60 },
        { id: "total", name: "total", mode: "read", at: 66 },
        { id: "return seen", name: "seen", mode: "read", at: 80 },
      ],
      children: [{ kind: "block", declarations: [{ name: "seen", kind: "var", at: 40 }] }],
    },
  ],
};
let output: string;
try {
  output = Object.entries(resolve(program)).map(([id, r]) => id.padEnd(12) + " → " + r).join("\n");
} catch (e) {
  output = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Scope resolver</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = output;
`;

const RESOLVER_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { resolve } from "../src/resolver";

const decl = (name, kind, at) => ({ name, kind, at });
const read = (id, name, at) => ({ id, name, mode: "read", at });
const write = (id, name, at) => ({ id, name, mode: "write", at });

describe("resolve", () => {
  it("walks outwards and respects shadowing", () => {
    const program = {
      kind: "global",
      declarations: [decl("x", "let", 0), decl("y", "let", 1)],
      children: [{
        kind: "function",
        declarations: [decl("x", "param", 10)],
        references: [read("inner x", "x", 20), read("outer y", "y", 21)],
      }],
      references: [read("global x", "x", 30)],
    };
    expect(resolve(program)).toEqual({ "global x": "0", "inner x": "0.0", "outer y": "0" });
  });
  it("hoists var out of blocks to the function, but keeps let in the block", () => {
    const program = {
      kind: "global",
      children: [{
        kind: "function",
        references: [read("v after block", "v", 50), read("l after block", "l", 51)],
        children: [{ kind: "block", declarations: [decl("v", "var", 10), decl("l", "let", 11)], references: [read("l in block", "l", 12)] }],
      }],
    };
    expect(resolve(program)).toEqual({ "v after block": "0.0", "l after block": "not-defined", "l in block": "0.0.0" });
  });
  it("reports the TDZ for let/const used earlier in the same function", () => {
    const program = {
      kind: "global",
      declarations: [decl("config", "const", 50), decl("count", "let", 60)],
      references: [read("early read", "config", 10), write("early write", "count", 20), read("late read", "count", 70)],
    };
    expect(resolve(program)).toEqual({ "early read": "tdz", "early write": "tdz", "late read": "0" });
  });
  it("doesn't report the TDZ from inside a nested function, which may run later", () => {
    const program = {
      kind: "global",
      declarations: [decl("config", "const", 50)],
      children: [{ kind: "function", references: [read("in callback", "config", 10)] }],
    };
    expect(resolve(program)).toEqual({ "in callback": "0" });
  });
  it("treats undeclared writes as implicit globals only in sloppy mode", () => {
    const program = {
      kind: "global",
      references: [write("sloppy write", "typo", 1), read("sloppy read", "typo2", 2)],
      children: [{
        kind: "function",
        strict: true,
        children: [{ kind: "block", references: [write("strict write", "oops", 5)] }],
      }],
    };
    expect(resolve(program)).toEqual({ "sloppy write": "implicit-global", "sloppy read": "not-defined", "strict write": "not-defined" });
  });
  it("rejects writes to const but allows reads", () => {
    const program = {
      kind: "global",
      declarations: [decl("max", "const", 0)],
      children: [{ kind: "block", references: [read("read max", "max", 5), write("write max", "max", 6)] }],
    };
    expect(resolve(program)).toEqual({ "read max": "0", "write max": "const-assignment" });
  });
  it("lets function declarations and parameters be found anywhere in their scope", () => {
    const program = {
      kind: "global",
      declarations: [decl("helper", "function", 100)],
      references: [read("call before declaration", "helper", 1)],
      children: [{ kind: "function", declarations: [decl("a", "param", 5)], references: [write("reassign param", "a", 9)] }],
    };
    expect(resolve(program)).toEqual({ "call before declaration": "0", "reassign param": "0.0" });
  });
});
`;

const LEAKS_STARTER = String.raw`export type GlobalTracker = {
  /** Names added since tracking started (sorted). */
  added(): string[];
  /** Names whose value or accessor changed (sorted). */
  changed(): string[];
  /** Names that were deleted (sorted). */
  removed(): string[];
  /** Undo all of it. */
  restore(): void;
};

/** Snapshots the own string-keyed properties of target (globalThis by default). */
export function trackGlobals(target: object = globalThis, { ignore = [] as string[] } = {}): GlobalTracker {
  // TODO: only detects additions, and restore does nothing
  const before = new Set(Object.keys(target));
  return {
    added: () => Object.keys(target).filter((k) => !before.has(k)),
    changed: () => [],
    removed: () => [],
    restore: () => {},
  };
}
`;

const LEAKS_SOLUTION = String.raw`export type GlobalTracker = {
  added(): string[];
  changed(): string[];
  removed(): string[];
  restore(): void;
};

export function trackGlobals(target: object = globalThis, { ignore = [] as string[] } = {}): GlobalTracker {
  const ignored = new Set(ignore);
  // Descriptors, not just values: catches non-enumerable globals and replaced getters/setters too.
  const snapshot = new Map<string, PropertyDescriptor>();
  for (const name of Object.getOwnPropertyNames(target)) {
    if (!ignored.has(name)) snapshot.set(name, Object.getOwnPropertyDescriptor(target, name)!);
  }
  const current = () => Object.getOwnPropertyNames(target).filter((name) => !ignored.has(name));
  const same = (a: PropertyDescriptor, b: PropertyDescriptor) =>
    "value" in a ? "value" in b && Object.is(a.value, b.value) : a.get === b.get && a.set === b.set;

  const added = () => current().filter((name) => !snapshot.has(name)).sort();
  const removed = () => [...snapshot.keys()].filter((name) => !Object.prototype.hasOwnProperty.call(target, name)).sort();
  const changed = () =>
    current()
      .filter((name) => snapshot.has(name) && !same(snapshot.get(name)!, Object.getOwnPropertyDescriptor(target, name)!))
      .sort();

  return {
    added,
    changed,
    removed,
    restore() {
      for (const name of added()) Reflect.deleteProperty(target, name);
      for (const name of [...changed(), ...removed()]) Reflect.defineProperty(target, name, snapshot.get(name)!);
    },
  };
}
`;

const LEAKS_INDEX = String.raw`import "./styles.css";
import { trackGlobals } from "./src/globals";

const tracker = trackGlobals(globalThis, { ignore: ["__vite_plugin_react_preamble_installed__"] });
const g = globalThis as any;
g.leakedCounter = 1; // what a sloppy-mode typo would do
let output: string;
try {
  output = "added: " + JSON.stringify(tracker.added());
  tracker.restore();
  output += "\nafter restore: " + JSON.stringify(tracker.added()) + ", leakedCounter = " + String(g.leakedCounter);
} catch (e) {
  output = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Global leaks</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = output;
`;

const LEAKS_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { trackGlobals } from "../src/globals";

function fakeGlobal() {
  const g = { console: "c", version: 1 };
  Object.defineProperty(g, "hidden", { value: "h", enumerable: false, configurable: true, writable: true });
  return g;
}

describe("trackGlobals", () => {
  it("reports added names, including non-enumerable ones, sorted", () => {
    const g = fakeGlobal();
    const t = trackGlobals(g);
    g.zeta = 1;
    g.alpha = 2;
    Object.defineProperty(g, "secret", { value: 3, enumerable: false, configurable: true });
    expect(t.added()).toEqual(["alpha", "secret", "zeta"]);
  });
  it("reports changed values and replaced accessors", () => {
    const g = fakeGlobal();
    const t = trackGlobals(g);
    g.version = 2;
    g.console = "c";
    Object.defineProperty(g, "hidden", { get: () => "spy", configurable: true });
    expect(t.changed()).toEqual(["hidden", "version"]);
  });
  it("treats NaN written over NaN as unchanged", () => {
    const g = { n: NaN };
    const t = trackGlobals(g);
    g.n = NaN;
    expect(t.changed()).toEqual([]);
  });
  it("reports removed names", () => {
    const g = fakeGlobal();
    const t = trackGlobals(g);
    delete g.version;
    expect(t.removed()).toEqual(["version"]);
  });
  it("restores everything", () => {
    const g = fakeGlobal();
    const t = trackGlobals(g);
    g.leak = true;
    g.version = 99;
    delete g.console;
    Object.defineProperty(g, "hidden", { get: () => "spy", configurable: true });
    t.restore();
    expect(t.added()).toEqual([]);
    expect(t.changed()).toEqual([]);
    expect(t.removed()).toEqual([]);
    expect(g.version).toBe(1);
    expect(g.console).toBe("c");
    expect(g.hidden).toBe("h");
    expect(Object.keys(g).sort()).toEqual(["console", "version"]);
  });
  it("ignores listed names", () => {
    const g = fakeGlobal();
    const t = trackGlobals(g, { ignore: ["devtoolsHook"] });
    g.devtoolsHook = {};
    g.realLeak = 1;
    expect(t.added()).toEqual(["realLeak"]);
  });
  it("works on the real global object", () => {
    const t = trackGlobals();
    globalThis.__scopeTestLeak = 42;
    expect(t.added()).toContain("__scopeTestLeak");
    t.restore();
    expect("__scopeTestLeak" in globalThis).toBe(false);
  });
});
`;

export default defineTasks([
  quiz(
    "scope-implicit-global",
    ["scope-strict-mode"],
    1,
    60,
    ["A typo in an assignment", "Одрук у присвоєнні"],
    CLASSIC,
    [
      ["`number 1`", "`number 1`"],
      ["A `ReferenceError`: countr is not defined", "`ReferenceError`: countr is not defined"],
      ["`undefined undefined`", "`undefined undefined`"],
      ["`number undefined`", "`number undefined`"],
    ],
    "a",
    [
      "In sloppy mode, assigning to a name that isn't declared anywhere creates a property on the global object instead of failing, so the typo silently leaks a global (and `counter` never changes). In strict mode, which includes every ES module and class, the same line throws a `ReferenceError`.",
      "У нестрогому режимі присвоєння імені, що ніде не оголошене, створює властивість глобального об'єкта замість помилки, тож одрук мовчки створює глобальну змінну (а `counter` ніколи не змінюється). У строгому режимі, зокрема в кожному ES-модулі й класі, той самий рядок кидає `ReferenceError`.",
    ],
    { code: 'function setup() {\n  countr = 1; // meant "counter"\n}\nsetup();\nconsole.log(typeof countr, globalThis.countr);', codeLanguage: "js" },
  ),
  quiz(
    "scope-var-let-global",
    ["scope-strict-mode", w("closures-scope")],
    2,
    75,
    ["The global scope vs the global object", "Глобальна область проти глобального об'єкта"],
    CLASSIC,
    [
      ["`1 undefined function number`", "`1 undefined function number`"],
      ["`1 2 function number`", "`1 2 function number`"],
      ["`undefined undefined undefined number`", "`undefined undefined undefined number`"],
      ["`1 undefined undefined number`", "`1 undefined undefined number`"],
    ],
    "a",
    [
      "In a classic script, top-level `var` and function declarations become properties of the global object. Top-level `let`, `const` and `class` are global **variables** too (`typeof b` sees it), but they live in a separate declarative record and don't create properties. In a module, none of them would touch `globalThis`.",
      "У класичному скрипті `var` і оголошення функцій верхнього рівня стають властивостями глобального об'єкта. `let`, `const` і `class` верхнього рівня теж є глобальними **змінними** (`typeof b` її бачить), але живуть в окремому декларативному записі й властивостей не створюють. У модулі жодна з них не торкнулася б `globalThis`.",
    ],
    { code: "var a = 1;\nlet b = 2;\nfunction c() {}\nconsole.log(globalThis.a, globalThis.b, typeof globalThis.c, typeof b);", codeLanguage: "js" },
  ),
  quiz(
    "scope-typeof-undeclared",
    ["scope-strict-mode"],
    2,
    75,
    ["Testing whether a name exists", "Перевірка, чи існує ім'я"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'undefined', 'ReferenceError', 'ReferenceError' ]`", "`[ 'undefined', 'ReferenceError', 'ReferenceError' ]`"],
      ["`[ 'undefined', 'ReferenceError', 'undefined' ]`", "`[ 'undefined', 'ReferenceError', 'undefined' ]`"],
      ["`[ 'ReferenceError', 'ReferenceError', 'ReferenceError' ]`", "`[ 'ReferenceError', 'ReferenceError', 'ReferenceError' ]`"],
      ["`[ 'undefined', 'undefined', 'undefined' ]`", "`[ 'undefined', 'undefined', 'undefined' ]`"],
    ],
    "a",
    [
      "`typeof` is the one operator that tolerates an **undeclared** name and returns `\"undefined\"`, which is why feature checks like `typeof window !== \"undefined\"` work. Reading an undeclared name throws. A `let` declared later in the same scope is declared but uninitialised (TDZ), and even `typeof` throws for it.",
      "`typeof` є єдиним оператором, що терпить **неоголошене** ім'я й повертає `\"undefined\"`, тому працюють перевірки на кшталт `typeof window !== \"undefined\"`. Читання неоголошеного імені кидає помилку. `let`, оголошена пізніше в тій самій області, оголошена, але не ініціалізована (TDZ), і для неї кидає навіть `typeof`.",
    ],
    { code: "const out = [typeof notDeclared];\ntry {\n  notDeclared;\n} catch (e) {\n  out.push(e.name);\n}\ntry {\n  out.push(typeof later);\n  let later = 1;\n} catch (e) {\n  out.push(e.name);\n}\nconsole.log(out);", codeLanguage: "js" },
  ),
  quiz(
    "scope-early-error",
    ["scope-strict-mode"],
    2,
    60,
    ["Errors before anything runs", "Помилки до виконання будь-чого"],
    ["What does this file print when it runs?", "Що виведе цей файл під час виконання?"],
    [
      ["Nothing: a `SyntaxError` is reported before any line runs", "Нічого: `SyntaxError` повідомляється до виконання будь-якого рядка"],
      ["`start`, then a `SyntaxError`", "`start`, а потім `SyntaxError`"],
      ["`start`, and `x` ends up as 2", "`start`, і `x` зрештою дорівнює 2"],
      ["`start`, then a `TypeError`", "`start`, а потім `TypeError`"],
    ],
    "a",
    [
      "The engine parses and analyses scopes for the whole file before executing it. Redeclaring a `let` in the same scope is an **early error**, so the file is rejected as a whole and even the first `console.log` never runs. This is direct evidence that scopes are decided before execution.",
      "Рушій розбирає й аналізує області видимості всього файлу до його виконання. Повторне оголошення `let` в тій самій області є **ранньою помилкою**, тож файл відхиляється повністю, і навіть перший `console.log` не виконується. Це пряме свідчення того, що області видимості визначаються до виконання.",
    ],
    { code: 'console.log("start");\nlet x = 1;\nlet x = 2;', codeLanguage: "js" },
  ),
  quiz(
    "scope-hoisting-precedence",
    ["scope-strict-mode", w("closures-scope")],
    3,
    90,
    ["A function and a `var` with the same name", "Функція й `var` з однаковим ім'ям"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'function', 'string' ]`", "`[ 'function', 'string' ]`"],
      ["`[ 'undefined', 'string' ]`", "`[ 'undefined', 'string' ]`"],
      ["`[ 'function', 'function' ]`", "`[ 'function', 'function' ]`"],
      ["`[ 'string', 'string' ]`", "`[ 'string', 'string' ]`"],
    ],
    "a",
    [
      "Both declarations are hoisted to the top of `demo`, and the function declaration wins: a `var` declaration never resets an existing binding to `undefined`. So `foo` starts as the function. When execution reaches `var foo = \"bar\"`, only the **assignment** part runs, replacing it with a string. The function declaration line itself does nothing at runtime.",
      "Обидва оголошення піднімаються на початок `demo`, і перемагає оголошення функції: оголошення `var` ніколи не скидає наявне зв'язування в `undefined`. Тож спершу `foo` є функцією. Коли виконання доходить до `var foo = \"bar\"`, виконується лише частина **присвоєння**, що замінює її рядком. Сам рядок з оголошенням функції під час виконання нічого не робить.",
    ],
    { code: 'function demo() {\n  const log = [];\n  log.push(typeof foo);\n  var foo = "bar";\n  function foo() {}\n  log.push(typeof foo);\n  return log;\n}\nconsole.log(demo());', codeLanguage: "js" },
  ),
  quiz(
    "scope-duplicate-functions",
    ["scope-strict-mode"],
    2,
    60,
    ["Two function declarations with one name", "Два оголошення функції з одним ім'ям"],
    CLASSIC,
    [
      ["`second`", "`second`"],
      ["`first`", "`first`"],
      ["A `SyntaxError`", "`SyntaxError`"],
      ["A `TypeError`: greet is not a function", "`TypeError`: greet is not a function"],
    ],
    "a",
    [
      "Both declarations are hoisted before any code runs, and the later one overwrites the earlier one, so even the call above them gets `second`. In an ES module (or with `let`/`const`), the duplicate would be a `SyntaxError` instead, one more reason to prefer modules.",
      "Обидва оголошення піднімаються до виконання будь-якого коду, і пізніше перезаписує раннє, тож навіть виклик над ними отримує `second`. В ES-модулі (чи з `let`/`const`) дублікат натомість був би `SyntaxError`, і це ще одна причина віддавати перевагу модулям.",
    ],
    { code: 'console.log(greet());\nfunction greet() {\n  return "first";\n}\nfunction greet() {\n  return "second";\n}', codeLanguage: "js" },
  ),
  quiz(
    "scope-strict-this",
    ["scope-strict-mode", w("this-prototypes")],
    2,
    75,
    ["`this` in sloppy and strict functions", "`this` у нестрогих і строгих функціях"],
    CLASSIC,
    [
      ["`object undefined number object`", "`object undefined number object`"],
      ["`object object number number`", "`object object number number`"],
      ["`undefined undefined number number`", "`undefined undefined number number`"],
      ["`object undefined object object`", "`object undefined object object`"],
    ],
    "a",
    [
      "In sloppy mode, a plain call gets the global object as `this`, and a primitive passed with `call` is **boxed** into an object (`Number {5}`). In strict mode, `this` is exactly what the call provides: `undefined` for a plain call and the raw number `5` with `call`. That's why forgetting `new` or losing a method's receiver throws in strict code instead of silently touching the global object.",
      "У нестрогому режимі звичайний виклик отримує глобальний об'єкт як `this`, а примітив, переданий через `call`, **загортається** в об'єкт (`Number {5}`). У строгому режимі `this` є саме тим, що дає виклик: `undefined` для звичайного виклику й саме число `5` з `call`. Тому забутий `new` чи втрачений отримувач методу у строгому коді кидає помилку, а не мовчки змінює глобальний об'єкт.",
    ],
    { code: 'function sloppy() {\n  return typeof this;\n}\nfunction strict() {\n  "use strict";\n  return typeof this;\n}\nconsole.log(sloppy(), strict(), strict.call(5), sloppy.call(5));', codeLanguage: "js" },
  ),
  quiz(
    "scope-strict-silent-failures",
    ["scope-strict-mode", w("js-metaprogramming")],
    3,
    90,
    ["Silent failures in strict code", "Тихі збої у строгому коді"],
    ["This runs as an ES module. What does it print?", "Код виконується як ES-модуль. Що він виведе?"],
    [
      ["`[ 'TypeError', 'TypeError', 'TypeError' ]`", "`[ 'TypeError', 'TypeError', 'TypeError' ]`"],
      ["`[ 'ok', 'ok', 'ok' ]`", "`[ 'ok', 'ok', 'ok' ]`"],
      ["`[ 'TypeError', 'ok', 'ok' ]`", "`[ 'TypeError', 'ok', 'ok' ]`"],
      ["`[ 'TypeError', 'SyntaxError', 'TypeError' ]`", "`[ 'TypeError', 'SyntaxError', 'TypeError' ]`"],
    ],
    "a",
    [
      "All three writes target read-only properties: a frozen object's property, the non-writable global `undefined`, and a string's `length`. In sloppy mode each would be **silently ignored**; in strict mode (every module) each throws a `TypeError`. Turning silent no-ops into errors is the main practical benefit of strict mode.",
      "Усі три записи спрямовані у властивості, доступні лише для читання: властивість замороженого об'єкта, недоступна для запису глобальна `undefined` і `length` рядка. У нестрогому режимі кожен запис **мовчки ігнорувався б**; у строгому режимі (кожен модуль) кожен кидає `TypeError`. Перетворення тихих холостих операцій на помилки є головною практичною перевагою строгого режиму.",
    ],
    {
      code: 'const out = [];\nconst frozen = Object.freeze({ a: 1 });\nfor (const attempt of [() => (frozen.a = 2), () => (undefined = 1), () => ("abc".length = 1)]) {\n  try {\n    attempt();\n    out.push("ok");\n  } catch (e) {\n    out.push(e.name);\n  }\n}\nconsole.log(out);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "scope-named-function-expression",
    ["scope-strict-mode", w("recursion")],
    3,
    90,
    ["The name of a function expression", "Ім'я функціонального виразу"],
    CLASSIC,
    [
      ["`24 undefined`", "`24 undefined`"],
      ["A `TypeError`: fact is not a function", "`TypeError`: fact is not a function"],
      ["`24 function`", "`24 function`"],
      ["`1 undefined`", "`1 undefined`"],
    ],
    "a",
    [
      "A named function expression's name is bound in a tiny scope **only visible inside the function**, so `typeof fact` outside is `\"undefined\"`. That binding is also read-only: `fact = null` is silently ignored in sloppy mode (and throws a `TypeError` in strict mode), so the recursion still works. That makes named function expressions a safe way to recurse even if the outer variable is reassigned.",
      "Ім'я іменованого функціонального виразу зв'язується в маленькій області видимості, **видимій лише всередині функції**, тож `typeof fact` ззовні дає `\"undefined\"`. Це зв'язування ще й доступне лише для читання: `fact = null` мовчки ігнорується в нестрогому режимі (і кидає `TypeError` у строгому), тож рекурсія все одно працює. Через це іменовані функціональні вирази є безпечним способом рекурсії, навіть якщо зовнішній змінній присвоять інше значення.",
    ],
    { code: "const f = function fact(n) {\n  fact = null;\n  return n <= 1 ? 1 : n * fact(n - 1);\n};\nconsole.log(f(4), typeof fact);", codeLanguage: "js" },
  ),
  quiz(
    "scope-arguments-mapping",
    ["scope-strict-mode"],
    4,
    120,
    ["`arguments` and parameters", "`arguments` і параметри"],
    CLASSIC,
    [
      ["`99 1 1`", "`99 1 1`"],
      ["`1 1 1`", "`1 1 1`"],
      ["`99 99 99`", "`99 99 99`"],
      ["`99 1 99`", "`99 1 99`"],
    ],
    "a",
    [
      "In a sloppy function with simple parameters, `arguments` is **mapped**: its slots alias the parameters, so writing `arguments[0]` changes `a`. Strict functions get an unmapped copy, and so does any function with default, rest or destructured parameters, even in sloppy mode. Use rest parameters instead of `arguments` and the question never comes up.",
      "У нестрогій функції з простими параметрами `arguments` **пов'язаний**: його комірки є псевдонімами параметрів, тож запис `arguments[0]` змінює `a`. Строгі функції отримують непов'язану копію, як і будь-яка функція з параметрами за замовчуванням, rest чи деструктуризацією, навіть у нестрогому режимі. Використовуйте rest-параметри замість `arguments`, і це питання ніколи не виникне.",
    ],
    { code: 'function f(a) {\n  arguments[0] = 99;\n  return a;\n}\nfunction g(a) {\n  "use strict";\n  arguments[0] = 99;\n  return a;\n}\nfunction h(a = 0) {\n  arguments[0] = 99;\n  return a;\n}\nconsole.log(f(1), g(1), h(1));', codeLanguage: "js" },
  ),
  quiz(
    "scope-block-function",
    ["scope-strict-mode"],
    4,
    120,
    ["A function declared inside a block", "Функція, оголошена всередині блоку"],
    CLASSIC,
    [
      ["`[ 'undefined', 'function' ]`", "`[ 'undefined', 'function' ]`"],
      ["`[ 'function', 'function' ]`", "`[ 'function', 'function' ]`"],
      ["`[ 'undefined', 'undefined' ]`", "`[ 'undefined', 'undefined' ]`"],
      ["A `ReferenceError`", "`ReferenceError`"],
    ],
    "a",
    [
      "Legacy web compatibility rules (Annex B) give a block-level function declaration in sloppy code **two** bindings: a block-scoped one inside the block, and a `var`-like one in the enclosing scope, which starts as `undefined` and is only assigned when the block is evaluated. In strict code there's only the block binding, so both checks would print `undefined`. Use `const inner = () => {}` instead.",
      "Застарілі правила сумісності вебу (Annex B) дають оголошенню функції на рівні блоку в нестрогому коді **два** зв'язування: блокове всередині блоку й схоже на `var` у зовнішній області, яке спершу дорівнює `undefined` і присвоюється лише під час виконання блоку. У строгому коді є лише блокове зв'язування, тож обидві перевірки вивели б `undefined`. Натомість використовуйте `const inner = () => {}`.",
    ],
    { code: "const log = [typeof inner];\nif (true) {\n  function inner() {}\n}\nlog.push(typeof inner);\nconsole.log(log);", codeLanguage: "js" },
  ),
  quiz(
    "scope-eval-var",
    ["scope-strict-mode", w("web-security")],
    4,
    120,
    ["`eval` and the surrounding scope", "`eval` і зовнішня область видимості"],
    CLASSIC,
    [
      ["`number undefined`", "`number undefined`"],
      ["`undefined undefined`", "`undefined undefined`"],
      ["`number number`", "`number number`"],
      ["A `SyntaxError`: eval is not allowed in strict mode", "`SyntaxError`: eval заборонений у строгому режимі"],
    ],
    "a",
    [
      "Direct `eval` in sloppy code runs in the caller's scope and can **add** `var` declarations to it at runtime, so `leaked` appears in `f`. Strict-mode `eval` gets its own variable scope, so declarations stay inside the evaluated code. Because sloppy `eval` (and `with`) can change scopes at runtime, engines can't optimise functions that use them; and evaluating strings is an injection risk anyway.",
      "Прямий `eval` у нестрогому коді виконується в області видимості того, хто його викликав, і може **додати** до неї оголошення `var` під час виконання, тож `leaked` з'являється у `f`. Строгий `eval` отримує власну область змінних, тож оголошення лишаються всередині обчисленого коду. Оскільки нестрогий `eval` (і `with`) може змінювати області видимості під час виконання, рушії не можуть оптимізувати функції, що їх використовують; до того ж обчислення рядків є ризиком ін'єкцій.",
    ],
    { code: 'function f() {\n  eval("var leaked = 1");\n  return typeof leaked;\n}\nfunction g() {\n  "use strict";\n  eval("var leaked = 1");\n  return typeof leaked;\n}\nconsole.log(f(), g());', codeLanguage: "js" },
  ),
  practice({
    slug: "scope-resolver",
    skills: ["scope-strict-mode", w("closures-scope"), w("typescript")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["Resolve variables like the engine does", "Знаходьте змінні, як це робить рушій"],
    prompt: [
      "`src/resolver.ts` receives a simplified scope tree: each scope has a `kind` (`global`, `function`, `block`), optional `strict`, `declarations` (`{ name, kind, at }`, where `at` is a source position) and `references` (`{ id, name, mode: \"read\" | \"write\", at }`). Implement `resolve(program)`, which maps each reference `id` to the **path** of the scope whose declaration it uses (`\"0\"` is the root, `\"0.1\"` its second child), or to one of these outcomes:\n\n- `\"tdz\"`: the name resolves to a `let`/`const` declared **later in the same function** (a use inside a nested function is fine, since it may run later).\n- `\"const-assignment\"`: a write to a `const`.\n- `\"implicit-global\"`: a write to an undeclared name in sloppy code; `\"not-defined\"`: any other undeclared use. `strict` applies to the scope it's set on and everything nested inside.\n\n`var` declarations belong to the nearest function or global scope, even when written inside a block. `let`, `const`, `function` and `param` belong to the scope they're written in.",
      "`src/resolver.ts` отримує спрощене дерево областей видимості: кожна область має `kind` (`global`, `function`, `block`), необов'язковий `strict`, `declarations` (`{ name, kind, at }`, де `at` є позицією в коді) і `references` (`{ id, name, mode: \"read\" | \"write\", at }`). Реалізуйте `resolve(program)`, що зіставляє кожен `id` посилання зі **шляхом** області, чиє оголошення воно використовує (`\"0\"` є коренем, `\"0.1\"` його другою дочірньою областю), або з одним із таких результатів:\n\n- `\"tdz\"`: ім'я розв'язується в `let`/`const`, оголошену **пізніше в тій самій функції** (використання у вкладеній функції допустиме, бо вона може виконатися пізніше).\n- `\"const-assignment\"`: запис у `const`.\n- `\"implicit-global\"`: запис у неоголошене ім'я в нестрогому коді; `\"not-defined\"`: будь-яке інше використання неоголошеного імені. `strict` діє на область, де його задано, і все вкладене в неї.\n\nОголошення `var` належать найближчій функції чи глобальній області, навіть коли написані всередині блоку. `let`, `const`, `function` і `param` належать області, де їх написано.",
    ],
    files: { "/src/resolver.ts": RESOLVER_STARTER, "/index.ts": RESOLVER_INDEX },
    visibleFiles: ["/src/resolver.ts", "/index.ts"],
    activeFile: "/src/resolver.ts",
    tests: RESOLVER_TESTS,
    solution: { "/src/resolver.ts": RESOLVER_SOLUTION },
    explanation: [
      "The solution mirrors the engine's two phases. First it registers every declaration in its scope (hoisting `var` past blocks), which is why lookups don't depend on the order of code. Then each reference walks outwards through parent scopes until it finds a declaration. The checks after that encode the language rules: TDZ only applies when the reference runs in the same function before the declaration, `const` rejects writes, and a failed write only becomes an implicit global when no enclosing scope is strict.",
      "Розв'язок повторює дві фази рушія. Спершу він реєструє кожне оголошення в його області (піднімаючи `var` за межі блоків), тому пошук не залежить від порядку коду. Потім кожне посилання йде назовні через батьківські області, доки не знайде оголошення. Перевірки після цього кодують правила мови: TDZ діє лише тоді, коли посилання виконується в тій самій функції до оголошення, `const` відхиляє записи, а невдалий запис стає неявною глобальною змінною, лише коли жодна зовнішня область не строга.",
    ],
  }),
  practice({
    slug: "scope-global-leaks",
    skills: ["scope-strict-mode", w("unit-testing"), w("js-metaprogramming")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["A global leak detector for tests", "Детектор витоків глобальних змінних для тестів"],
    prompt: [
      "Test runners like Mocha (`--check-leaks`) flag tests that create globals, which is a classic symptom of sloppy-mode typos and leaky libraries. Implement `trackGlobals(target = globalThis, { ignore })` in `src/globals.ts`. It snapshots the target's own properties (including **non-enumerable** ones) and returns:\n\n- `added()`: names created since the snapshot.\n- `changed()`: names whose value changed (compare with `Object.is`) or whose getter/setter was replaced.\n- `removed()`: names that were deleted.\n- `restore()`: deletes added names and puts back changed and removed ones with their original descriptors.\n\nAll lists are sorted, and names in `ignore` are never reported.",
      "Засоби запуску тестів на кшталт Mocha (`--check-leaks`) позначають тести, що створюють глобальні змінні, а це класичний симптом одруків у нестрогому режимі й бібліотек із витоками. Реалізуйте `trackGlobals(target = globalThis, { ignore })` у `src/globals.ts`. Функція знімає знімок власних властивостей цілі (зокрема **неперелічуваних**) і повертає:\n\n- `added()`: імена, створені після знімка.\n- `changed()`: імена, чиє значення змінилося (порівнюйте через `Object.is`) чи чий гетер/сетер замінено.\n- `removed()`: імена, які видалено.\n- `restore()`: видаляє додані імена й повертає змінені та видалені з їхніми початковими дескрипторами.\n\nУсі списки впорядковані, а імена з `ignore` ніколи не повідомляються.",
    ],
    files: { "/src/globals.ts": LEAKS_STARTER, "/index.ts": LEAKS_INDEX },
    visibleFiles: ["/src/globals.ts", "/index.ts"],
    activeFile: "/src/globals.ts",
    tests: LEAKS_TESTS,
    solution: { "/src/globals.ts": LEAKS_SOLUTION },
    explanation: [
      "`Object.getOwnPropertyNames` sees non-enumerable properties that `Object.keys` misses, and storing full **descriptors** instead of values lets the tracker notice replaced accessors and restore properties exactly, including their enumerability and writability. Comparing with `Object.is` avoids false positives for `NaN`. `Reflect.deleteProperty` and `Reflect.defineProperty` return `false` instead of throwing for non-configurable properties, which keeps `restore()` from crashing a test run.",
      "`Object.getOwnPropertyNames` бачить неперелічувані властивості, які пропускає `Object.keys`, а збереження повних **дескрипторів** замість значень дає змогу помітити замінені аксесори й точно відновити властивості, зокрема їхню перелічуваність і доступність для запису. Порівняння через `Object.is` уникає хибних спрацювань для `NaN`. `Reflect.deleteProperty` і `Reflect.defineProperty` повертають `false` замість кидання помилки для неналаштовуваних властивостей, і через це `restore()` не обвалює запуск тестів.",
    ],
  }),
]);
