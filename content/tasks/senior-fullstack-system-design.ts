import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const lines = (...l: string[]) => l.join("\n");

// ── Practice 1: plugin command dispatcher (vanilla-ts) ───────────────────────

const DISPATCHER_STARTER = String.raw`export interface CommandDef {
  id: string;
  name: string;
  run(payload?: unknown): unknown;
}

export interface PluginDef {
  id: string;
  version: string;
  commands: CommandDef[];
}

export interface CallRecord {
  commandId: string;
  pluginId: string;
  status: "success" | "error";
  startedAt: number;
  finishedAt: number;
  error?: string;
}

export interface Dispatcher {
  load(plugin: PluginDef): void;
  unload(pluginId: string): void;
  execute(pluginId: string, commandId: string, payload?: unknown): Promise<unknown>;
  history(): CallRecord[];
}

// TODO: a registry of loaded plugins that runs their commands and logs every call.
export function createDispatcher(now: () => number = Date.now): Dispatcher {
  return {
    load() {},
    unload() {},
    async execute() {
      return undefined;
    },
    history() {
      return [];
    },
  };
}
`;

const DISPATCHER_SOLUTION = String.raw`export interface CommandDef {
  id: string;
  name: string;
  run(payload?: unknown): unknown;
}

export interface PluginDef {
  id: string;
  version: string;
  commands: CommandDef[];
}

export interface CallRecord {
  commandId: string;
  pluginId: string;
  status: "success" | "error";
  startedAt: number;
  finishedAt: number;
  error?: string;
}

export interface Dispatcher {
  load(plugin: PluginDef): void;
  unload(pluginId: string): void;
  execute(pluginId: string, commandId: string, payload?: unknown): Promise<unknown>;
  history(): CallRecord[];
}

export function createDispatcher(now: () => number = Date.now): Dispatcher {
  const plugins = new Map<string, PluginDef>();
  const calls: CallRecord[] = [];

  return {
    load(plugin) {
      if (plugins.has(plugin.id)) throw new Error("plugin already loaded: " + plugin.id);
      const seen = new Set<string>();
      for (const command of plugin.commands) {
        if (seen.has(command.id)) throw new Error("duplicate command id: " + command.id);
        seen.add(command.id);
      }
      plugins.set(plugin.id, plugin);
    },
    unload(pluginId) {
      plugins.delete(pluginId);
    },
    async execute(pluginId, commandId, payload) {
      const plugin = plugins.get(pluginId);
      if (!plugin) throw new Error("unknown plugin: " + pluginId);
      const command = plugin.commands.find((c) => c.id === commandId);
      if (!command) throw new Error("unknown command: " + commandId);

      const startedAt = now();
      try {
        const result = await command.run(payload);
        calls.push({ commandId, pluginId, status: "success", startedAt, finishedAt: now() });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        calls.push({ commandId, pluginId, status: "error", startedAt, finishedAt: now(), error });
        throw err;
      }
    },
    history() {
      return calls.slice();
    },
  };
}
`;

const DISPATCHER_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createDispatcher } from "../src/dispatcher";

const LAMP = {
  id: "lamp",
  version: "1.0.0",
  commands: [
    { id: "on", name: "Turn on", run: (payload?: unknown) => "on:" + String(payload) },
    { id: "boom", name: "Always fails", run: () => { throw new Error("broken"); } },
  ],
};

// Each call to now() advances the clock by 10, so start and finish times are predictable.
function fakeClock() {
  let t = 0;
  return () => {
    t += 10;
    return t;
  };
}

async function failureOf(promise: Promise<unknown>): Promise<string | null> {
  try {
    await promise;
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

describe("createDispatcher", () => {
  it("runs a command and returns its result", async () => {
    const d = createDispatcher(fakeClock());
    d.load(LAMP);
    expect(await d.execute("lamp", "on", 1)).toBe("on:1");
  });
  it("records a successful call with start and finish times", async () => {
    const d = createDispatcher(fakeClock());
    d.load(LAMP);
    await d.execute("lamp", "on", 1);
    expect(d.history()).toEqual([
      { commandId: "on", pluginId: "lamp", status: "success", startedAt: 10, finishedAt: 20 },
    ]);
  });
  it("records a failed call and rethrows the error", async () => {
    const d = createDispatcher(fakeClock());
    d.load(LAMP);
    expect(await failureOf(d.execute("lamp", "boom"))).toBe("broken");
    expect(d.history()[0].status).toBe("error");
    expect(d.history()[0].error).toBe("broken");
  });
  it("rejects unknown plugins and commands without recording a call", async () => {
    const d = createDispatcher(fakeClock());
    d.load(LAMP);
    expect(await failureOf(d.execute("nope", "on"))).not.toBe(null);
    expect(await failureOf(d.execute("lamp", "missing"))).not.toBe(null);
    expect(d.history()).toHaveLength(0);
  });
  it("refuses to load the same plugin id twice", () => {
    const d = createDispatcher(fakeClock());
    d.load(LAMP);
    let threw = false;
    try {
      d.load(LAMP);
    } catch (e) {
      threw = true;
    }
    expect(threw).toBe(true);
  });
  it("refuses duplicate command ids inside one plugin", () => {
    const d = createDispatcher(fakeClock());
    let threw = false;
    try {
      d.load({ id: "x", version: "1.0.0", commands: [{ id: "a", name: "A", run: () => 1 }, { id: "a", name: "A2", run: () => 2 }] });
    } catch (e) {
      threw = true;
    }
    expect(threw).toBe(true);
  });
  it("unload removes the plugin", async () => {
    const d = createDispatcher(fakeClock());
    d.load(LAMP);
    d.unload("lamp");
    expect(await failureOf(d.execute("lamp", "on"))).not.toBe(null);
  });
  it("history returns a copy", async () => {
    const d = createDispatcher(fakeClock());
    d.load(LAMP);
    await d.execute("lamp", "on");
    d.history().length = 0;
    expect(d.history()).toHaveLength(1);
  });
});
`;

// ── Practice 2: plugin manifest validation (vanilla-ts) ─────────────────────

const MANIFEST_STARTER = String.raw`export interface Manifest {
  id: string;
  version: string;
  commands: { id: string; name: string }[];
}

export type ValidationResult = { ok: true; manifest: Manifest } | { ok: false; errors: string[] };

// TODO: check an uploaded plugin manifest before it is stored. Return a normalized copy when valid,
// or every error found (see the rules in the task).
export function validateManifest(input: unknown): ValidationResult {
  return { ok: false, errors: [] };
}
`;

const MANIFEST_SOLUTION = String.raw`export interface Manifest {
  id: string;
  version: string;
  commands: { id: string; name: string }[];
}

export type ValidationResult = { ok: true; manifest: Manifest } | { ok: false; errors: string[] };

const SLUG = /^[a-z][a-z0-9-]*$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const TOP_FIELDS = ["id", "version", "commands"];
const COMMAND_FIELDS = ["id", "name"];

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function validateManifest(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, errors: ["manifest must be an object"] };

  const errors: string[] = [];

  for (const key of Object.keys(input)) {
    if (!TOP_FIELDS.includes(key)) errors.push("unknown field: " + key);
  }
  if (typeof input.id !== "string" || !SLUG.test(input.id)) errors.push("id must be a lowercase slug");
  if (typeof input.version !== "string" || !SEMVER.test(input.version)) errors.push("version must be x.y.z");

  if (!Array.isArray(input.commands) || input.commands.length === 0) {
    errors.push("commands must be a non-empty array");
  } else {
    const seen = new Set<string>();
    input.commands.forEach((raw: unknown, i: number) => {
      if (!isRecord(raw)) {
        errors.push("command " + i + " must be an object");
        return;
      }
      for (const key of Object.keys(raw)) {
        if (!COMMAND_FIELDS.includes(key)) errors.push("command " + i + " has unknown field: " + key);
      }
      if (typeof raw.id !== "string" || !SLUG.test(raw.id)) {
        errors.push("command " + i + " id must be a lowercase slug");
      } else if (seen.has(raw.id)) {
        errors.push("duplicate command id: " + raw.id);
      } else {
        seen.add(raw.id);
      }
      if (typeof raw.name !== "string" || raw.name.trim() === "") {
        errors.push("command " + i + " name must be a non-empty string");
      }
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  const commands = (input.commands as Record<string, unknown>[]).map((c) => ({
    id: c.id as string,
    name: (c.name as string).trim(),
  }));
  return { ok: true, manifest: { id: input.id as string, version: input.version as string, commands } };
}
`;

const MANIFEST_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { validateManifest } from "../src/manifest";

const GOOD = { id: "lamp", version: "1.0.0", commands: [{ id: "on", name: "Turn on" }] };

describe("validateManifest", () => {
  it("accepts a good manifest and trims command names", () => {
    const r = validateManifest({ id: "lamp", version: "1.2.0", commands: [{ id: "on", name: "  Turn on " }] });
    expect(r).toEqual({ ok: true, manifest: { id: "lamp", version: "1.2.0", commands: [{ id: "on", name: "Turn on" }] } });
  });
  it("rejects non-objects and arrays", () => {
    expect(validateManifest(null)).toEqual({ ok: false, errors: ["manifest must be an object"] });
    expect(validateManifest([])).toEqual({ ok: false, errors: ["manifest must be an object"] });
  });
  it("reports unknown top-level fields", () => {
    expect(validateManifest({ ...GOOD, script: "evil()" })).toEqual({ ok: false, errors: ["unknown field: script"] });
  });
  it("reports a bad id and a bad version together", () => {
    expect(validateManifest({ id: "Lamp!", version: "v1", commands: GOOD.commands })).toEqual({
      ok: false,
      errors: ["id must be a lowercase slug", "version must be x.y.z"],
    });
  });
  it("requires at least one command", () => {
    expect(validateManifest({ ...GOOD, commands: [] })).toEqual({ ok: false, errors: ["commands must be a non-empty array"] });
  });
  it("rejects duplicate command ids", () => {
    expect(validateManifest({ ...GOOD, commands: [{ id: "on", name: "On" }, { id: "on", name: "Again" }] })).toEqual({
      ok: false,
      errors: ["duplicate command id: on"],
    });
  });
  it("reports per-command problems in order", () => {
    expect(validateManifest({ ...GOOD, commands: [{ id: "Bad Id", name: "  " }, { id: "ok", name: "Ok", extra: 1 }] })).toEqual({
      ok: false,
      errors: [
        "command 0 id must be a lowercase slug",
        "command 0 name must be a non-empty string",
        "command 1 has unknown field: extra",
      ],
    });
  });
});
`;

export default defineTasks([
  practice({
    slug: "plugin-command-dispatcher",
    skills: ["system-design", w("javascript", 0.4), w("async-javascript", 0.3)],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Plugin registry with a call log", "Реєстр плагінів із журналом викликів"],
    prompt: [
      lines(
        "The core system loads plugins, each with commands. Implement `createDispatcher` in `src/dispatcher.ts`:",
        "",
        "- `load(plugin)` throws if a plugin with the same `id` is already loaded, or if two commands in the plugin share an `id`.",
        "- `unload(pluginId)` removes the plugin. Unknown ids are ignored.",
        "- `execute(pluginId, commandId, payload)` is async. It rejects for an unknown plugin or command, and in that case records nothing.",
        "- Otherwise it runs the command, reads its start time before running and its finish time after, and records one call. A successful call has `status: \"success\"`. A failed call has `status: \"error\"` and the error message in `error`, and the original error is rethrown.",
        "- `history()` returns a copy of the call records in order.",
        "- `now` is injected so that tests can control the clock.",
      ),
      lines(
        "Основна система завантажує плагіни, у кожного є команди. Реалізуйте `createDispatcher` у `src/dispatcher.ts`:",
        "",
        "- `load(plugin)` викидає помилку, якщо плагін з таким `id` уже завантажено, або якщо дві команди в плагіні мають однаковий `id`.",
        "- `unload(pluginId)` видаляє плагін. Невідомі id ігноруються.",
        "- `execute(pluginId, commandId, payload)` асинхронна. Для невідомого плагіна чи команди вона відхиляється, і в цьому випадку нічого не записується.",
        "- Інакше вона виконує команду, бере час початку до виконання і час завершення після, та записує один виклик. Успішний виклик має `status: \"success\"`. Невдалий має `status: \"error\"` і текст помилки в `error`, а сама помилка перекидається далі.",
        "- `history()` повертає копію записів викликів у порядку виконання.",
        "- `now` передається ззовні, щоб тести могли керувати часом.",
      ),
    ],
    files: { "/src/dispatcher.ts": DISPATCHER_STARTER },
    activeFile: "/src/dispatcher.ts",
    tests: DISPATCHER_TESTS,
    solution: { "/src/dispatcher.ts": DISPATCHER_SOLUTION },
    explanation: [
      "The core keeps plugins behind a narrow interface: load, unload, execute and history. Validation happens at load time so that execute can assume a well-formed registry. Timing wraps the awaited call, and the log is written in both the success and failure paths, which is why the error is recorded and then rethrown. Returning a copy from history keeps callers from mutating the log.",
      "Ядро тримає плагіни за вузьким інтерфейсом: load, unload, execute і history. Перевірка відбувається під час load, тож execute може вважати реєстр коректним. Вимір часу обгортає очікуваний виклик, а запис робиться і в разі успіху, і в разі помилки, тому помилка спершу журналюється, а потім перекидається далі. Повернення копії з history не дає викликачам змінювати журнал.",
    ],
  }),

  practice({
    slug: "plugin-manifest-validation",
    skills: ["system-design", w("web-security", 0.5), w("typescript", 0.3)],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["Validate an uploaded plugin manifest", "Перевірка завантаженого маніфесту плагіна"],
    prompt: [
      lines(
        "Users upload plugins with a manifest (`id`, `version`, `commands`). Before anything is stored, check it in `src/manifest.ts` and return either a normalized copy or every error found. Rules, in this order:",
        "",
        "1. Input must be a plain object (not `null`, not an array). Otherwise return only `manifest must be an object`.",
        "2. Each top-level key other than `id`, `version`, `commands` gives `unknown field: <key>`.",
        "3. `id` must match `^[a-z][a-z0-9-]*$`, otherwise `id must be a lowercase slug`.",
        "4. `version` must match `^\\d+\\.\\d+\\.\\d+$`, otherwise `version must be x.y.z`.",
        "5. `commands` must be a non-empty array, otherwise `commands must be a non-empty array`. Otherwise, for each command at index `i`: a non-object gives `command i must be an object`; unknown keys (other than `id`, `name`) give `command i has unknown field: <key>`; a bad `id` gives `command i id must be a lowercase slug`; a repeated valid `id` gives `duplicate command id: <id>`; a `name` that is not a string or is blank after trimming gives `command i name must be a non-empty string`.",
        "",
        "If there are no errors, return `{ ok: true, manifest }` with command names trimmed. Otherwise return `{ ok: false, errors }`.",
      ),
      lines(
        "Користувачі завантажують плагіни з маніфестом (`id`, `version`, `commands`). Перед збереженням перевірте його в `src/manifest.ts` і поверніть або нормалізовану копію, або всі знайдені помилки. Правила, у такому порядку:",
        "",
        "1. Вхід має бути звичайним об'єктом (не `null`, не масивом). Інакше поверніть лише `manifest must be an object`.",
        "2. Кожен ключ верхнього рівня, окрім `id`, `version`, `commands`, дає `unknown field: <key>`.",
        "3. `id` має відповідати `^[a-z][a-z0-9-]*$`, інакше `id must be a lowercase slug`.",
        "4. `version` має відповідати `^\\d+\\.\\d+\\.\\d+$`, інакше `version must be x.y.z`.",
        "5. `commands` має бути непорожнім масивом, інакше `commands must be a non-empty array`. Інакше для кожної команди з індексом `i`: не-об'єкт дає `command i must be an object`; зайві ключі (окрім `id`, `name`) дають `command i has unknown field: <key>`; поганий `id` дає `command i id must be a lowercase slug`; повторний коректний `id` дає `duplicate command id: <id>`; `name`, що не є рядком або порожній після обрізання пробілів, дає `command i name must be a non-empty string`.",
        "",
        "Якщо помилок немає, поверніть `{ ok: true, manifest }` з обрізаними назвами команд. Інакше поверніть `{ ok: false, errors }`.",
      ),
    ],
    files: { "/src/manifest.ts": MANIFEST_STARTER },
    activeFile: "/src/manifest.ts",
    tests: MANIFEST_TESTS,
    solution: { "/src/manifest.ts": MANIFEST_SOLUTION },
    explanation: [
      "Treat uploaded data as hostile: check its shape before trusting any field, and keep only the fields you know about so that extra keys cannot slip into storage. Collecting all errors (instead of stopping at the first) gives the uploader a complete list in one attempt. Normalizing at the end means the rest of the system only ever sees the trimmed, validated shape.",
      "Вважайте завантажені дані ворожими: перевіряйте форму, перш ніж довіряти якомусь полю, і залишайте лише відомі поля, щоб зайві ключі не потрапили в сховище. Збір усіх помилок (замість зупинки на першій) дає авторові повний список за одну спробу. Нормалізація в кінці означає, що решта системи бачить лише обрізану, перевірену форму.",
    ],
  }),

  quiz(
    "symbol-iterator-protocol",
    ["iterators-generators", w("javascript", 0.4)],
    2,
    90,
    ["What Symbol.iterator is for", "Для чого потрібен Symbol.iterator"],
    ["What is `Symbol.iterator` used for?", "Для чого використовується `Symbol.iterator`?"],
    [
      ["A key that hides the property from console.log only", "Ключ, що приховує властивість лише від console.log"],
      ["The well-known symbol that defines how for...of and spread iterate an object", "Вбудований символ, що визначає, як for...of і spread перебирають об'єкт"],
      ["A way to create truly private class fields", "Спосіб створити справді приватні поля класу"],
      ["The name of the method that returns the next value", "Назва методу, що повертає наступне значення"],
    ],
    "b",
    [
      "A symbol is a unique primitive, and `Symbol.iterator` is a built-in one that the language looks up when it needs to iterate. Objects that define a method under this key work with for...of, spread and destructuring. Symbols do not make a property private: `Object.getOwnPropertySymbols` still reveals them.",
      "Символ це унікальний примітив, а `Symbol.iterator` вбудований; мова шукає його, коли потрібно перебрати значення. Об'єкти, що визначають метод під цим ключем, працюють з for...of, spread і деструктуризацією. Символи не роблять властивість приватною: `Object.getOwnPropertySymbols` їх усе одно показує.",
    ],
  ),

  quiz(
    "bind-call-apply-this",
    ["this-prototypes"],
    1,
    60,
    ["bind, call and apply", "bind, call і apply"],
    ["Which statement about `bind`, `call` and `apply` is correct?", "Яке твердження про `bind`, `call` і `apply` правильне?"],
    [
      ["`call` and `apply` return a new function, while `bind` invokes it immediately", "`call` і `apply` повертають нову функцію, а `bind` викликає її одразу"],
      ["`bind` returns a new function with `this` fixed, without calling it", "`bind` повертає нову функцію з фіксованим `this` і не викликає її"],
      ["All three take arguments in the same format", "Усі три приймають аргументи в однаковому форматі"],
      ["Calling `bind` again on a bound function changes its `this`", "Повторний `bind` для вже прив'язаної функції змінює її `this`"],
    ],
    "b",
    [
      "`call` and `apply` invoke the function right away with the given `this` (arguments as a list, or as an array for `apply`). `bind` returns a new function whose `this` is fixed. A bound function keeps its original `this` even if you bind it again.",
      "`call` і `apply` одразу викликають функцію з заданим `this` (аргументи списком, а для `apply` масивом). `bind` повертає нову функцію з фіксованим `this`. Прив'язана функція зберігає початковий `this`, навіть якщо її прив'язати повторно.",
    ],
  ),

  quiz(
    "typescript-numeric-enum-output",
    ["typescript"],
    2,
    90,
    ["What a numeric enum becomes after compilation", "У що перетворюється числовий enum після компіляції"],
    ["How does a regular numeric TypeScript `enum` look in the emitted JavaScript?", "Як виглядає звичайний числовий `enum` у TypeScript після компіляції в JavaScript?"],
    [
      ["A plain array of the member names", "Звичайний масив назв членів"],
      ["Only the numbers, with the names removed completely", "Лише числа, назви повністю видалені"],
      ["An object with both name-to-value and value-to-name entries", "Об'єкт з обома записами: назва до значення і значення до назви"],
      ["A class with a static method for each member", "Клас зі статичним методом для кожного члена"],
    ],
    "c",
    [
      "A numeric enum compiles to an object that maps names to values and values back to names, which is why `Color[0]` gives `\"Red\"`. String enums do not get the reverse mapping. Interfaces and type aliases are erased entirely, and classes stay classes.",
      "Числовий enum компілюється в об'єкт, який зіставляє назви зі значеннями і значення назад із назвами, тому `Color[0]` дає `\"Red\"`. У строкових enum зворотного зіставлення немає. Інтерфейси і псевдоніми типів повністю стираються, а класи лишаються класами.",
    ],
  ),

  quiz(
    "interface-declaration-merging",
    ["typescript"],
    2,
    90,
    ["Two interfaces with the same name", "Два інтерфейси з однаковою назвою"],
    ["Two `interface User` declarations appear in the same scope. What happens?", "В одній області видимості є два оголошення `interface User`. Що станеться?"],
    [
      ["They merge into one interface with the members of both", "Вони зливаються в один інтерфейс з членами обох"],
      ["It is always a compile error", "Це завжди помилка компіляції"],
      ["The second declaration replaces the first", "Друге оголошення замінює перше"],
      ["Only the first declaration is kept", "Лишається лише перше оголошення"],
    ],
    "a",
    [
      "Interfaces support declaration merging, so repeated declarations add members together. Type aliases do not merge; declaring the same `type` name twice is an error. This is one of the practical differences between `interface` and `type` that the interview touched on.",
      "Інтерфейси підтримують злиття оголошень, тож повторні оголошення додають члени разом. Псевдоніми типів не зливаються: двічі оголосити одне й те саме ім'я `type` це помилка. Це одна з практичних відмінностей між `interface` і `type`.",
    ],
  ),

  quiz(
    "filter-callback-arguments",
    ["arrays-strings"],
    1,
    60,
    ["Arguments of the filter callback", "Аргументи колбека filter"],
    ["In `items.filter((item, index, array) => …)`, what is the third argument?", "У `items.filter((item, index, array) => …)` що є третім аргументом?"],
    [
      ["The result array built so far", "Результуючий масив, зібраний на цей момент"],
      ["The callback function itself", "Сам функція-колбек"],
      ["The length of the array", "Довжина масиву"],
      ["The original array being traversed", "Початковий масив, по якому йде обхід"],
    ],
    "d",
    [
      "`filter`, like `map`, `forEach` and `reduce`, passes the current element, its index and the array being traversed. The third argument is the source array, not the result, which is only built from the callback's return values.",
      "`filter`, як і `map`, `forEach` та `reduce`, передає поточний елемент, його індекс і масив, по якому йде обхід. Третій аргумент це вихідний масив, а не результат; результат формується лише з того, що повертає колбек.",
    ],
  ),

  quiz(
    "event-loop-order-node",
    ["event-loop", w("async-javascript", 0.4)],
    3,
    120,
    ["Output order in Node.js", "Порядок виводу в Node.js"],
    ["What does this Node.js script print, in order?", "Що виведе цей скрипт Node.js, у такому порядку?"],
    [
      ["A, B, C, D, E", "A, B, C, D, E"],
      ["A, E, D, C, B", "A, E, D, C, B"],
      ["A, E, B, C, D", "A, E, B, C, D"],
      ["A, E, C, D, B", "A, E, C, D, B"],
    ],
    "b",
    [
      "Synchronous code runs first (A, E). Then Node drains the `process.nextTick` queue (D), before promise callbacks (C). The `setTimeout` callback is a macrotask that runs last (B). In the browser `process.nextTick` does not exist, which is why the interview asked where it is available.",
      "Спершу виконується синхронний код (A, E). Далі Node виконує чергу `process.nextTick` (D), перед колбеками промісів (C). Колбек `setTimeout` це макрозадача, яка йде останньою (B). У браузері `process.nextTick` немає, тому це питання про те, де він доступний.",
    ],
    {
      code: lines(
        "console.log(\"A\");",
        "setTimeout(() => console.log(\"B\"), 0);",
        "Promise.resolve().then(() => console.log(\"C\"));",
        "process.nextTick(() => console.log(\"D\"));",
        "console.log(\"E\");",
      ),
      codeLanguage: "js",
    },
  ),

  quiz(
    "nestjs-request-pipeline-order",
    ["nestjs"],
    2,
    90,
    ["Order of NestJS layers before the handler", "Порядок шарів NestJS до обробника"],
    ["In NestJS, which order do the layers run for an incoming request before the route handler?", "У NestJS у якому порядку виконуються шари для вхідного запиту перед обробником маршруту?"],
    [
      ["Controller, then guards, then pipes, then middleware", "Контролер, потім guards, потім pipes, потім middleware"],
      ["Pipes, then middleware, then guards, then the handler", "Pipes, потім middleware, потім guards, потім обробник"],
      ["Interceptors, then middleware, then guards, then pipes", "Interceptors, потім middleware, потім guards, потім pipes"],
      ["Middleware, then guards, then interceptors (before), then pipes, then the handler", "Middleware, потім guards, потім interceptors (до), потім pipes, потім обробник"],
    ],
    "d",
    [
      "Request flow in NestJS is: middleware, guards, interceptors (before part), pipes, then the handler. After the handler, interceptors run again on the response, and exception filters handle errors. Knowing the order tells you where authentication, validation and logging belong.",
      "Потік запиту в NestJS такий: middleware, guards, interceptors (частина до), pipes, потім обробник. Після обробника interceptors знову працюють з відповіддю, а exception filters обробляють помилки. Знання порядку підказує, де мають бути автентифікація, валідація та логування.",
    ],
  ),

  quiz(
    "nestjs-pipes-purpose",
    ["nestjs", w("typescript", 0.3)],
    1,
    60,
    ["What a NestJS pipe is for", "Для чого потрібен pipe у NestJS"],
    ["What is the main job of a NestJS pipe?", "Яке головне призначення pipe у NestJS?"],
    [
      ["Catching exceptions and formatting error responses", "Перехоплення винятків і форматування відповідей з помилками"],
      ["Caching the response of a route", "Кешування відповіді маршруту"],
      ["Checking whether the user has permission to call the route", "Перевірка прав користувача на виклик маршруту"],
      ["Transforming or validating incoming arguments before the handler runs", "Перетворення або валідація вхідних аргументів перед запуском обробника"],
    ],
    "d",
    [
      "Pipes receive the route arguments and either transform them (for example parse a string into a number) or validate them and throw. Exception filters handle errors, and guards decide access. Validation and transformation are the two usual answers for pipes.",
      "Pipes отримують аргументи маршруту і або перетворюють їх (наприклад, рядок у число), або валідують і викидають помилку. Exception filters обробляють помилки, а guards вирішують доступ. Для pipes типові дві відповіді: валідація і трансформація.",
    ],
  ),

  quiz(
    "solid-liskov-substitution",
    ["solid"],
    2,
    90,
    ["The Liskov Substitution Principle", "Принцип підстановки Лісков"],
    ["Which statement best describes the Liskov Substitution Principle?", "Яке твердження найкраще описує принцип підстановки Лісков?"],
    [
      ["A class should have only one reason to change", "Клас має мати лише одну причину для зміни"],
      ["Clients should not depend on methods they do not use", "Клієнти не мають залежати від методів, яких вони не використовують"],
      ["A subclass must be usable wherever its base class is used, without breaking the base's behaviour", "Підклас має працювати скрізь, де використовується базовий клас, не порушуючи поведінки базового"],
      ["Depend on abstractions rather than concrete classes", "Залежати від абстракцій, а не від конкретних класів"],
    ],
    "c",
    [
      "A subtype should keep the contract of its parent: it may add behaviour, but it must not strengthen preconditions, weaken postconditions or throw where the parent does not. A classic violation is a `Square` that extends `Rectangle` and breaks the width/height contract. The other four principles are the single responsibility, interface segregation and dependency inversion ones.",
      "Підтип має зберігати контракт батька: він може додати поведінку, але не може посилити передумови, послабити постумови або викидати винятки там, де батько цього не робить. Класичне порушення це `Square`, що наслідує `Rectangle` і ламає контракт ширини й висоти. Решта принципів SOLID це єдина відповідальність, розділення інтерфейсів та інверсія залежностей.",
    ],
  ),

  quiz(
    "shared-database-microservices",
    ["microservices", w("system-design", 0.5)],
    2,
    90,
    ["Microservices that share one database", "Мікросервіси зі спільною базою"],
    ["Several services publish events to Kafka, but all of them read and write one shared database. What is the main concern?", "Кілька сервісів публікують події в Kafka, але всі читають і пишуть в одну спільну базу. Яка головна проблема?"],
    [
      ["The services are coupled through the shared tables, so schema changes can break them and they cannot be deployed independently", "Сервіси пов'язані через спільні таблиці, тож зміни схеми можуть їх зламати, і їх не можна розгортати незалежно"],
      ["Kafka cannot handle more than one database", "Kafka не може працювати з більш ніж однією базою"],
      ["Shared databases are always slower than separate ones", "Спільні бази завжди повільніші за окремі"],
      ["Every service must use the same ORM", "Кожен сервіс мусить використовувати однаковий ORM"],
    ],
    "a",
    [
      "Services that share tables share their data model, so the database becomes the hidden integration point. Each service should own its data, and other services should get it through APIs or published events. Events on Kafka help only if the data is not also shared through the database.",
      "Сервіси, що ділять таблиці, ділять і модель даних, тож база стає прихованою точкою інтеграції. Кожен сервіс має володіти своїми даними, а інші мають отримувати їх через API або опубліковані події. Події в Kafka допомагають лише тоді, коли дані не діляться через базу.",
    ],
  ),

  quiz(
    "plugin-isolation-untrusted-code",
    ["system-design", w("web-security", 0.5)],
    3,
    120,
    ["Running untrusted plugin code", "Запуск ненадійного коду плагінів"],
    ["Plugins are uploaded JavaScript files that talk to the core system. Which setup best limits the damage a malicious plugin can do?", "Плагіни це завантажені JavaScript-файли, що спілкуються з ядром системи. Яке налаштування найкраще обмежує шкоду від зловмисного плагіна?"],
    [
      ["Load each plugin with require() into the core process, with full access", "Завантажувати кожен плагін через require() в процес ядра з повним доступом"],
      ["Run each plugin in an isolated environment, such as a container or a worker with restricted permissions, and let it talk to the core only through a narrow, validated command interface", "Запускати кожен плагін в ізольованому середовищі (контейнер або worker з обмеженими правами) і дозволити спілкування з ядром лише через вузький, перевірений інтерфейс команд"],
      ["Review each plugin once by hand and then trust it", "Один раз переглянути кожен плагін вручну і потім довіряти йому"],
      ["Skip input sanitization to keep loading fast", "Пропускати санітизацію вхідних даних, щоб завантаження було швидшим"],
    ],
    "b",
    [
      "Uploaded code should never share the core's memory or privileges. Isolation (containers, separate workers or processes) limits what a plugin can reach, and a narrow command interface limits what it can ask the core to do. Sanitizing the upload and checking its manifest are still needed, but they are not a sandbox on their own.",
      "Завантажений код ніколи не повинен мати спільну пам'ять або привілеї з ядром. Ізоляція (контейнери, окремі worker або процеси) обмежує, до чого плагін може дістатися, а вузький інтерфейс команд обмежує, що він може попросити ядро зробити. Санітизація і перевірка маніфесту все ще потрібні, але самі по собі вони не є пісочницею.",
    ],
  ),

  quiz(
    "command-call-log-schema",
    ["system-design", w("sql", 0.4)],
    2,
    90,
    ["Modelling a log of command calls", "Модель журналу викликів команд"],
    ["You need a log of every command invocation sent to an external system. Which set of fields is the most appropriate?", "Потрібен журнал кожного виклику команди, надісланої зовнішній системі. Який набір полів найдоцільніший?"],
    [
      ["Only the command name and the payload, with no time", "Лише назва команди і payload, без часу"],
      ["A full copy of the plugin's source code on each call", "Повна копія вихідного коду плагіна при кожному виклику"],
      ["The whole external system configuration on each call", "Вся конфігурація зовнішньої системи при кожному виклику"],
      ["command_id, external_system_id, status, started_at and finished_at, plus the error text when it fails", "command_id, external_system_id, status, started_at і finished_at, а також текст помилки при збої"],
    ],
    "d",
    [
      "A call row references the command and the external system it was sent to, records its outcome and timing, and stores the error when it fails. Foreign keys are enough to get the plugin and system back, so there is no need to duplicate configuration or code on every row. This is the one-to-many relationship the interview sketched out.",
      "Рядок виклику посилається на команду і зовнішню систему, куди її надіслано, фіксує результат і час, а при збої зберігає помилку. Зовнішні ключі дозволяють відновити плагін і систему, тож немає потреби дублювати конфігурацію чи код у кожному рядку. Це зв'язок «один до багатьох», який накидали на співбесіді.",
    ],
  ),
]);
