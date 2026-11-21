import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const LOGGER_STARTER = code`export type Level = "debug" | "info" | "warn" | "error";
export type Entry = { level: Level; message: string; time: string; fields: Record<string, unknown> };
export type Sink = (entry: Entry) => void;

export type Logger = {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
  /** A logger that adds these fields to every entry it writes. */
  child(fields: Record<string, unknown>): Logger;
};

export type LoggerOptions = {
  level?: Level;
  sink: Sink;
  now?: () => string;
  /** Field names whose values must never be written, at any depth, compared case-insensitively. */
  redactKeys?: string[];
};

export function createLogger(options: LoggerOptions): Logger {
  // TODO: levels, bound fields, redaction, and errors written as { name, message }
  return {
    debug() {},
    info() {},
    warn() {},
    error() {},
    child() {
      return this as Logger;
    },
  };
}
`;

const LOGGER_SOLUTION = code`export type Level = "debug" | "info" | "warn" | "error";
export type Entry = { level: Level; message: string; time: string; fields: Record<string, unknown> };
export type Sink = (entry: Entry) => void;

export type Logger = {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
  child(fields: Record<string, unknown>): Logger;
};

export type LoggerOptions = {
  level?: Level;
  sink: Sink;
  now?: () => string;
  redactKeys?: string[];
};

const ORDER: Level[] = ["debug", "info", "warn", "error"];

export function createLogger(options: LoggerOptions): Logger {
  const threshold = ORDER.indexOf(options.level ?? "info");
  const now = options.now ?? (() => new Date().toISOString());
  const secret = new Set((options.redactKeys ?? []).map((key) => key.toLowerCase()));

  // Copies the value, so the caller's objects are never changed or leaked by reference.
  const clean = (value: unknown): unknown => {
    if (value instanceof Error) return { name: value.name, message: value.message }; // no stack traces in the output
    if (Array.isArray(value)) return value.map(clean);
    if (value !== null && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, inner] of Object.entries(value)) {
        out[key] = secret.has(key.toLowerCase()) ? "[REDACTED]" : clean(inner);
      }
      return out;
    }
    return value;
  };

  const make = (bound: Record<string, unknown>): Logger => {
    const write = (level: Level) => (message: string, fields: Record<string, unknown> = {}) => {
      if (ORDER.indexOf(level) < threshold) return;
      options.sink({
        level,
        message,
        time: now(),
        fields: clean({ ...bound, ...fields }) as Record<string, unknown>,
      });
    };
    return {
      debug: write("debug"),
      info: write("info"),
      warn: write("warn"),
      error: write("error"),
      child: (extra) => make({ ...bound, ...extra }),
    };
  };

  return make({});
}
`;

const LOGGER_INDEX = code`import "./styles.css";
import { createLogger } from "./src/logger";

const lines: string[] = [];
const log = createLogger({ level: "info", redactKeys: ["password"], sink: (e) => lines.push(e.level + " " + e.message + " " + JSON.stringify(e.fields)) });
log.child({ requestId: "r1" }).info("signed in", { user: "ada", password: "hunter2" });
document.getElementById("app")!.innerHTML = '<h1>Logger</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const LOGGER_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createLogger } from "../src/logger";

function setup(extra = {}) {
  const entries = [];
  const log = createLogger({ now: () => "2026-01-01T00:00:00Z", sink: (e) => entries.push(e), ...extra });
  return { log, entries };
}

describe("createLogger", () => {
  it("writes entries with a level, message, time and fields", () => {
    const { log, entries } = setup();
    log.info("started", { port: 3000 });
    expect(entries).toEqual([{ level: "info", message: "started", time: "2026-01-01T00:00:00Z", fields: { port: 3000 } }]);
  });
  it("drops entries below the configured level", () => {
    const { log, entries } = setup({ level: "warn" });
    log.debug("noise");
    log.info("routine");
    log.warn("careful");
    log.error("broken");
    expect(entries.map((e) => e.level)).toEqual(["warn", "error"]);
  });
  it("child loggers add their fields to every entry", () => {
    const { log, entries } = setup();
    const request = log.child({ requestId: "r1" });
    request.info("start");
    request.child({ step: 2 }).warn("slow", { ms: 900 });
    expect(entries[0].fields).toEqual({ requestId: "r1" });
    expect(entries[1].fields).toEqual({ requestId: "r1", step: 2, ms: 900 });
  });
  it("redacts secret keys at any depth, ignoring case", () => {
    const { log, entries } = setup({ redactKeys: ["password", "token"] });
    log.info("login", { PassWord: "x", user: { token: "t", name: "ada" }, list: [{ token: "u" }] });
    expect(entries[0].fields).toEqual({
      PassWord: "[REDACTED]",
      user: { token: "[REDACTED]", name: "ada" },
      list: [{ token: "[REDACTED]" }],
    });
  });
  it("redacts bound fields too", () => {
    const { log, entries } = setup({ redactKeys: ["apiKey"] });
    log.child({ apiKey: "secret" }).info("call");
    expect(entries[0].fields).toEqual({ apiKey: "[REDACTED]" });
  });
  it("writes errors as name and message, without the stack", () => {
    const { log, entries } = setup();
    log.error("failed", { err: new TypeError("bad input") });
    expect(entries[0].fields).toEqual({ err: { name: "TypeError", message: "bad input" } });
  });
  it("doesn't change the objects it was given", () => {
    const { log } = setup({ redactKeys: ["password"] });
    const fields = { password: "x", nested: { ok: 1 } };
    log.info("m", fields);
    expect(fields).toEqual({ password: "x", nested: { ok: 1 } });
  });
});
`;

const LOGGER_QUIZ_PROMPT: [string, string] = ["Why do production services write logs as structured JSON instead of plain sentences?", "Чому сервіси у продакшені пишуть журнали як структурований JSON, а не звичайними реченнями?"];

export default defineTasks([
  quiz(
    "log-structured-fields",
    ["logging", w("monitoring", 0.3)],
    2,
    75,
    ["Why structured logs", "Навіщо структуровані журнали"],
    LOGGER_QUIZ_PROMPT,
    [
      ["Machines can filter and aggregate by named fields, such as every error for one request id, without fragile text matching", "Машини можуть фільтрувати й агрегувати за іменованими полями, наприклад, усі помилки одного запиту, без крихкого пошуку по тексту"],
      ["JSON is smaller than text, so logs take less disk space", "JSON менший за текст, тож журнали займають менше місця на диску"],
      ["Plain sentences can't contain numbers", "Звичайні речення не можуть містити числа"],
      ["Only JSON logs can be sent over the network", "Лише JSON-журнали можна надсилати мережею"],
    ],
    "a",
    [
      "A sentence like \"user ada failed to pay\" has to be parsed with regexes that break when someone rewords it. A structured entry keeps the event name and the values as separate fields, so a query like `user_id = 42 AND level = error` works on every service, and redaction can act on known field names.",
      "Речення на кшталт \"user ada failed to pay\" доводиться розбирати регулярними виразами, які ламаються, коли його переформулюють. Структурований запис тримає назву події та значення окремими полями, тож запит на кшталт `user_id = 42 AND level = error` працює в кожному сервісі, а маскування може діяти за відомими назвами полів.",
    ],
  ),
  practice({
    slug: "logging-redacting-logger",
    skills: ["logging", w("typescript"), w("web-security", 0.3)],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["A structured logger that redacts secrets", "Структурований логер, що приховує секрети"],
    prompt: [
      "Logs are read by people and machines long after they're written, so they must be structured and must never leak secrets. Implement `createLogger(options)` in `src/logger.ts`:\n\n- Levels are `debug`, `info`, `warn` and `error`. Entries below the configured `level` (default `info`) are dropped.\n- Each entry is `{ level, message, time, fields }`, where `time` comes from `now()`, and `fields` is a copy, so the caller's objects are never changed.\n- `child(fields)` returns a logger that adds those fields to every entry it writes; child loggers can have children of their own.\n- Any field whose name is in `redactKeys` is written as `\"[REDACTED]\"`, at any depth and in any array, compared case-insensitively, and this includes fields bound by `child`.\n- An `Error` is written as `{ name, message }` (no stack).",
      "Журнали читають люди й машини довго після запису, тож вони мають бути структурованими і ніколи не витікати секретів. Реалізуйте `createLogger(options)` у `src/logger.ts`:\n\n- Рівні: `debug`, `info`, `warn` і `error`. Записи нижчі за налаштований `level` (за замовчуванням `info`) відкидаються.\n- Кожен запис — це `{ level, message, time, fields }`, де `time` береться з `now()`, а `fields` — копія, тож об'єкти викликача ніколи не змінюються.\n- `child(fields)` повертає логер, що додає ці поля до кожного свого запису; дочірні логери можуть мати власні дочірні.\n- Будь-яке поле, чия назва є в `redactKeys`, записується як `\"[REDACTED]\"` на будь-якій глибині й у будь-якому масиві, без урахування регістру, і це стосується полів, прив'язаних через `child`.\n- `Error` записується як `{ name, message }` (без стеку).",
    ],
    files: {
      "/src/logger.ts": LOGGER_STARTER,
      "/index.ts": LOGGER_INDEX,
    },
    visibleFiles: ["/src/logger.ts"],
    activeFile: "/src/logger.ts",
    tests: LOGGER_TESTS,
    solution: { "/src/logger.ts": LOGGER_SOLUTION },
    explanation: [
      "Two things make this logger safe to use everywhere: every entry goes through one `clean` function, and that function builds a new object instead of editing the input. That's where redaction and error serialisation live, so nothing bypasses them, including fields bound by `child`, which are merged before cleaning. Stack traces are left out on purpose: they're useful for developers but can reveal file paths and internals, so they belong in error tracking, not in every log line. Levels are compared as positions in a list, which keeps the threshold check to one comparison. Production loggers add more (sampling, async writes), but the shape of the entry and the redaction rule stay the same.",
      "Два речі роблять цей логер безпечним скрізь: кожен запис проходить через одну функцію `clean`, і вона будує новий об'єкт замість зміни вхідного. Саме тут живуть маскування і серіалізація помилок, тож нічого їх не обходить, зокрема поля, прив'язані через `child`, які зливаються до очищення. Стек викликів навмисно не записується: він корисний розробникам, але може розкрити шляхи до файлів і внутрішні деталі, тож місце йому в системі відстеження помилок, а не в кожному рядку журналу. Рівні порівнюються як позиції в списку, тож перевірка порога — одне порівняння. Логери у продакшені мають більше можливостей (вибірка, асинхронний запис), але форма запису і правило маскування лишаються тими самими.",
    ],
  }),
]);
