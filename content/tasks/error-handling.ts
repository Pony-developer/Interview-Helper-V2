import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const HTTP_STARTER = String.raw`export type ErrorResponse = {
  status: number;
  body: { error: { code: string; message: string; requestId: string; fields?: Record<string, string> } };
};

// TODO: give each error a name, a status, a machine-readable code, and whether its message is safe to show.
export class AppError extends Error {
  status = 500;
}
export class ValidationError extends AppError {
  constructor(public fields: Record<string, string>) {
    super("Invalid input");
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super(resource + " " + id + " not found");
  }
}

/** Messages from err down its cause chain. */
export function errorChain(err: unknown): string[] {
  return [String((err as Error)?.message ?? err)]; // TODO
}

/** Converts anything thrown in a request handler into a safe HTTP response. */
export function toHttpResponse(err: unknown, requestId: string): ErrorResponse {
  // TODO: this leaks internal messages and ignores status codes
  return { status: 500, body: { error: { code: "INTERNAL", message: String((err as Error)?.message), requestId } } };
}
`;

const HTTP_SOLUTION = String.raw`export type ErrorResponse = {
  status: number;
  body: { error: { code: string; message: string; requestId: string; fields?: Record<string, string> } };
};

export class AppError extends Error {
  status = 500;
  code = "INTERNAL";
  /** Whether the message is safe to show to clients. */
  expose = false;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name; // "NotFoundError" etc. for every subclass
  }
}

export class ValidationError extends AppError {
  status = 400;
  code = "VALIDATION";
  expose = true;
  constructor(public fields: Record<string, string>, options?: { cause?: unknown }) {
    super("Invalid input", options);
  }
}

export class NotFoundError extends AppError {
  status = 404;
  code = "NOT_FOUND";
  expose = true;
  constructor(resource: string, id: string | number, options?: { cause?: unknown }) {
    super(resource + " " + id + " not found", options);
  }
}

function causes(err: unknown): unknown[] {
  const chain: unknown[] = [];
  const seen = new Set<unknown>();
  let current = err;
  while (current !== undefined && current !== null && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    current = current instanceof Error ? current.cause : undefined;
  }
  return chain;
}

export function errorChain(err: unknown): string[] {
  return causes(err).map((e) => (e instanceof Error ? e.message : String(e)));
}

export function toHttpResponse(err: unknown, requestId: string): ErrorResponse {
  // A handler may wrap a domain error for context; the first AppError in the chain decides the response.
  const appError = causes(err).find((e): e is AppError => e instanceof AppError);
  if (!appError) {
    return { status: 500, body: { error: { code: "INTERNAL", message: "Something went wrong", requestId } } };
  }
  const error: ErrorResponse["body"]["error"] = {
    code: appError.code,
    message: appError.expose ? appError.message : "Something went wrong",
    requestId,
  };
  if (appError instanceof ValidationError) error.fields = appError.fields;
  return { status: appError.status, body: { error } };
}
`;

const HTTP_INDEX = String.raw`import "./styles.css";
import { NotFoundError, ValidationError, errorChain, toHttpResponse } from "./src/errors";

const cases: unknown[] = [
  new ValidationError({ email: "must contain @" }),
  new Error("Loading order failed", { cause: new NotFoundError("Order", 42) }),
  new Error("connect ECONNREFUSED db.internal:5432 password=hunter2"),
];
const lines: string[] = [];
for (const err of cases) {
  try {
    const res = toHttpResponse(err, "req-1");
    lines.push(res.status + " " + JSON.stringify(res.body) + "\n   chain: " + errorChain(err).join(" ← "));
  } catch (e) {
    lines.push("error: " + (e as Error).message);
  }
}
document.getElementById("app")!.innerHTML = '<h1>Error responses</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n\n");
`;

const HTTP_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { AppError, NotFoundError, ValidationError, errorChain, toHttpResponse } from "../src/errors";

describe("error classes", () => {
  it("are real errors with names, statuses and codes", () => {
    const err = new NotFoundError("User", 7);
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("NotFoundError");
    expect(err.message).toBe("User 7 not found");
    expect(err.status).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(typeof err.stack).toBe("string");
    const invalid = new ValidationError({ email: "required" });
    expect([invalid.name, invalid.status, invalid.code]).toEqual(["ValidationError", 400, "VALIDATION"]);
  });
  it("keep their cause", () => {
    const inner = new TypeError("bad row");
    expect(new AppError("import failed", { cause: inner }).cause).toBe(inner);
    expect(new NotFoundError("User", 1, { cause: inner }).cause).toBe(inner);
  });
});

describe("errorChain", () => {
  it("lists messages down the cause chain, including non-Error causes", () => {
    const err = new Error("checkout failed", { cause: new Error("payment failed", { cause: "card declined" }) });
    expect(errorChain(err)).toEqual(["checkout failed", "payment failed", "card declined"]);
  });
  it("stops at cycles", () => {
    const a = new Error("a");
    const b = new Error("b", { cause: a });
    a.cause = b;
    expect(errorChain(a)).toEqual(["a", "b"]);
  });
});

describe("toHttpResponse", () => {
  it("returns validation details", () => {
    expect(toHttpResponse(new ValidationError({ email: "must contain @" }), "r1")).toEqual({
      status: 400,
      body: { error: { code: "VALIDATION", message: "Invalid input", requestId: "r1", fields: { email: "must contain @" } } },
    });
  });
  it("uses the first app error found in the cause chain", () => {
    const res = toHttpResponse(new Error("handler failed", { cause: new NotFoundError("Order", 9) }), "r2");
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual({ code: "NOT_FOUND", message: "Order 9 not found", requestId: "r2" });
  });
  it("never leaks unexpected error details", () => {
    const res = toHttpResponse(new Error("connect failed: password=hunter2"), "r3");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL");
    expect(res.body.error.message).not.toMatch(/hunter2/);
    expect(res.body.error.requestId).toBe("r3");
  });
  it("hides messages of app errors that aren't safe to expose", () => {
    const res = toHttpResponse(new AppError("invariant broken in ledger"), "r4");
    expect(res.status).toBe(500);
    expect(res.body.error.message).not.toMatch(/ledger/);
  });
  it("handles thrown non-errors", () => {
    expect(toHttpResponse("oops", "r5").status).toBe(500);
    expect(toHttpResponse(undefined, "r6").body.error.code).toBe("INTERNAL");
  });
});
`;

const BREAKER_STARTER = String.raw`export class CircuitOpenError extends Error {
  name = "CircuitOpenError";
}

export type BreakerOptions = {
  failureThreshold?: number;
  resetMs?: number;
  now?: () => number;
  /** Which errors count as failures (e.g. not 4xx responses). */
  isFailure?: (error: unknown) => boolean;
};

/**
 * closed → (failureThreshold consecutive failures) → open → (resetMs later) → half-open
 * half-open → one trial call → success: closed, failure: open again.
 */
export class CircuitBreaker {
  constructor(private options: BreakerOptions = {}) {}

  get state(): "closed" | "open" | "half-open" {
    return "closed"; // TODO
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    return fn(); // TODO
  }
}
`;

const BREAKER_SOLUTION = String.raw`export class CircuitOpenError extends Error {
  name = "CircuitOpenError";
}

export type BreakerOptions = {
  failureThreshold?: number;
  resetMs?: number;
  now?: () => number;
  isFailure?: (error: unknown) => boolean;
};

export class CircuitBreaker {
  #failures = 0;
  #openedAt: number | null = null;
  #trialRunning = false;
  #threshold: number;
  #resetMs: number;
  #now: () => number;
  #isFailure: (error: unknown) => boolean;

  constructor({ failureThreshold = 3, resetMs = 1000, now = () => Date.now(), isFailure = () => true }: BreakerOptions = {}) {
    this.#threshold = failureThreshold;
    this.#resetMs = resetMs;
    this.#now = now;
    this.#isFailure = isFailure;
  }

  get state(): "closed" | "open" | "half-open" {
    if (this.#openedAt === null) return "closed";
    return this.#now() - this.#openedAt >= this.#resetMs ? "half-open" : "open";
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.state;
    if (state === "open") throw new CircuitOpenError("Circuit is open");
    if (state === "half-open") {
      if (this.#trialRunning) throw new CircuitOpenError("Circuit is half-open: a trial call is in progress");
      this.#trialRunning = true;
    }
    try {
      const result = await fn();
      this.#failures = 0;
      this.#openedAt = null;
      return result;
    } catch (error) {
      if (this.#isFailure(error)) {
        this.#failures++;
        if (state === "half-open" || this.#failures >= this.#threshold) this.#openedAt = this.#now();
      } else if (state === "half-open") {
        // The dependency answered (e.g. a 404): it's healthy again.
        this.#failures = 0;
        this.#openedAt = null;
      }
      throw error;
    } finally {
      if (state === "half-open") this.#trialRunning = false;
    }
  }
}
`;

const BREAKER_INDEX = String.raw`import "./styles.css";
import { CircuitBreaker } from "./src/breaker";

document.getElementById("app")!.innerHTML =
  '<h1>Circuit breaker</h1><button id="call">Call flaky service</button><pre id="out"></pre>';
const breaker = new CircuitBreaker({ failureThreshold: 2, resetMs: 3000 });
const log: string[] = [];
let attempt = 0;
const flaky = async () => {
  attempt++;
  if (attempt % 4 !== 0) throw new Error("service unavailable");
  return "ok";
};
document.getElementById("call")!.addEventListener("click", async () => {
  try {
    log.unshift("success: " + (await breaker.call(flaky)) + " (state " + breaker.state + ")");
  } catch (e) {
    log.unshift((e as Error).name + ": " + (e as Error).message + " (state " + breaker.state + ")");
  }
  document.getElementById("out")!.textContent = log.join("\n");
});
`;

const BREAKER_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { CircuitBreaker, CircuitOpenError } from "../src/breaker";

const fail = () => Promise.reject(new Error("down"));
const ok = () => Promise.resolve("up");
const settle = (p) => p.then((value) => ({ value }), (error) => ({ error }));

function setup(options = {}) {
  const clock = { t: 0 };
  const breaker = new CircuitBreaker({ failureThreshold: 3, resetMs: 1000, now: () => clock.t, ...options });
  return { breaker, clock };
}

describe("CircuitBreaker", () => {
  it("passes results and errors through while closed", async () => {
    const { breaker } = setup();
    expect(await breaker.call(ok)).toBe("up");
    expect((await settle(breaker.call(fail))).error.message).toBe("down");
    expect(breaker.state).toBe("closed");
  });
  it("opens after consecutive failures and then fails fast without calling", async () => {
    const { breaker } = setup();
    for (let i = 0; i < 3; i++) await settle(breaker.call(fail));
    expect(breaker.state).toBe("open");
    const spy = fn(ok);
    const result = await settle(breaker.call(spy));
    expect(result.error).toBeInstanceOf(CircuitOpenError);
    expect(spy).toHaveBeenCalledTimes(0);
  });
  it("resets the failure count after a success", async () => {
    const { breaker } = setup();
    await settle(breaker.call(fail));
    await settle(breaker.call(fail));
    await breaker.call(ok);
    await settle(breaker.call(fail));
    await settle(breaker.call(fail));
    expect(breaker.state).toBe("closed");
  });
  it("goes half-open after resetMs and closes on a successful trial", async () => {
    const { breaker, clock } = setup();
    for (let i = 0; i < 3; i++) await settle(breaker.call(fail));
    clock.t = 999;
    expect(breaker.state).toBe("open");
    clock.t = 1000;
    expect(breaker.state).toBe("half-open");
    expect(await breaker.call(ok)).toBe("up");
    expect(breaker.state).toBe("closed");
  });
  it("reopens when the trial fails", async () => {
    const { breaker, clock } = setup();
    for (let i = 0; i < 3; i++) await settle(breaker.call(fail));
    clock.t = 1500;
    await settle(breaker.call(fail));
    expect(breaker.state).toBe("open");
    clock.t = 2400;
    expect(breaker.state).toBe("open");
    clock.t = 2500;
    expect(breaker.state).toBe("half-open");
  });
  it("allows only one trial call at a time", async () => {
    const { breaker, clock } = setup();
    for (let i = 0; i < 3; i++) await settle(breaker.call(fail));
    clock.t = 1000;
    let finish;
    const slow = () => new Promise((resolve) => { finish = resolve; });
    const trial = breaker.call(slow);
    const second = await settle(breaker.call(ok));
    expect(second.error).toBeInstanceOf(CircuitOpenError);
    finish("recovered");
    expect(await trial).toBe("recovered");
    expect(breaker.state).toBe("closed");
  });
  it("ignores errors that aren't failures", async () => {
    const { breaker } = setup({ isFailure: (e) => !(e instanceof RangeError) });
    for (let i = 0; i < 5; i++) await settle(breaker.call(() => Promise.reject(new RangeError("bad input"))));
    expect(breaker.state).toBe("closed");
  });
});
`;

export default defineTasks([
  quiz(
    "err-json-parse",
    ["error-handling"],
    1,
    45,
    ["Parsing invalid JSON", "Розбір некоректного JSON"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`SyntaxError`", "`SyntaxError`"],
      ["`TypeError`", "`TypeError`"],
      ["`{ a: 1 }`", "`{ a: 1 }`"],
      ["`undefined`", "`undefined`"],
    ],
    "a",
    [
      "JSON requires double quotes, so single-quoted keys are invalid and `JSON.parse` throws a `SyntaxError`. Wrap parsing of untrusted input (API responses, `localStorage`, files) in `try/catch` and treat failures as expected input errors.",
      "JSON вимагає подвійних лапок, тож ключі в одинарних лапках некоректні, і `JSON.parse` кидає `SyntaxError`. Загортайте розбір ненадійних даних (відповідей API, `localStorage`, файлів) у `try/catch` і обробляйте збої як очікувані помилки вхідних даних.",
    ],
    { code: "try {\n  console.log(JSON.parse(\"{'a': 1}\"));\n} catch (e) {\n  console.log(e.name);\n}", codeLanguage: "js" },
  ),
  quiz(
    "err-throw-string",
    ["error-handling"],
    2,
    60,
    ["Throwing a string", "Кидання рядка"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`string undefined undefined`", "`string undefined undefined`"],
      ["`object oops Error: oops…`", "`object oops Error: oops…`"],
      ["`string oops undefined`", "`string oops undefined`"],
      ["A `TypeError`: only errors can be thrown", "`TypeError`: кидати можна лише помилки"],
    ],
    "a",
    [
      "JavaScript lets you throw any value, but a string has no `message` and, worse, no `stack`, so you lose where the problem happened. Handlers that read `err.message` break too. Always throw `Error` objects (or subclasses).",
      "JavaScript дозволяє кинути будь-яке значення, але рядок не має `message` і, гірше, не має `stack`, тож ви втрачаєте місце виникнення проблеми. Обробники, що читають `err.message`, теж ламаються. Завжди кидайте об'єкти `Error` (чи підкласи).",
    ],
    { code: 'try {\n  throw "oops";\n} catch (e) {\n  console.log(typeof e, e.message, e.stack);\n}', codeLanguage: "js" },
  ),
  quiz(
    "err-cause",
    ["error-handling"],
    2,
    60,
    ["Error causes", "Причини помилок"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`save failed true bad id`", "`save failed true bad id`"],
      ["`save failed: bad id false undefined`", "`save failed: bad id false undefined`"],
      ["`bad id true save failed`", "`bad id true save failed`"],
      ["`save failed false bad id`", "`save failed false bad id`"],
    ],
    "a",
    [
      "The `cause` option (ES2022) attaches the original error to a new one without changing either message. You get a high-level message with context plus the low-level error, with its own type and stack, which DevTools and Node print as a chain. It's better than concatenating messages or losing the original.",
      "Параметр `cause` (ES2022) прикріплює початкову помилку до нової, не змінюючи жодного повідомлення. Ви отримуєте високорівневе повідомлення з контекстом і низькорівневу помилку з власним типом і стеком, які DevTools і Node виводять як ланцюжок. Це краще, ніж склеювати повідомлення чи втрачати оригінал.",
    ],
    { code: 'const e = new Error("save failed", { cause: new TypeError("bad id") });\nconsole.log(e.message, e.cause instanceof TypeError, e.cause.message);', codeLanguage: "js" },
  ),
  quiz(
    "err-finally-return",
    ["error-handling"],
    3,
    75,
    ["`return` inside `finally`", "`return` усередині `finally`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`finally`", "`finally`"],
      ["`try`", "`try`"],
      ["`try` and then `finally`", "`try`, а потім `finally`"],
      ["A `SyntaxError`", "`SyntaxError`"],
    ],
    "a",
    [
      "`finally` runs after the `try` block's `return` value has been computed, and a `return` in `finally` replaces it. Linters flag this (`no-unsafe-finally`) because it silently changes results; keep `finally` for cleanup only.",
      "`finally` виконується після того, як обчислено значення `return` з блоку `try`, а `return` у `finally` його замінює. Лінтери позначають це (`no-unsafe-finally`), бо воно непомітно змінює результати; використовуйте `finally` лише для очищення.",
    ],
    { code: 'function f() {\n  try {\n    return "try";\n  } finally {\n    return "finally";\n  }\n}\nconsole.log(f());', codeLanguage: "js" },
  ),
  quiz(
    "err-finally-swallows",
    ["error-handling"],
    4,
    90,
    ["An exception and a `return` in `finally`", "Виняток і `return` у `finally`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`ok`", "`ok`"],
      ["`Error: lost`", "`Error: lost`"],
      ["`ok` and then an uncaught `Error: lost`", "`ok`, а потім неперехоплений `Error: lost`"],
      ["`undefined`", "`undefined`"],
    ],
    "a",
    [
      "A `return` in `finally` doesn't just replace a return value: it also **discards an in-flight exception**. The error disappears without a trace, which makes bugs very hard to find. Never return (or `break`/`continue`) out of a `finally` block.",
      "`return` у `finally` не лише замінює значення, що повертається: він ще й **відкидає виняток, що саме летить**. Помилка зникає без сліду, і через це помилки дуже важко знайти. Ніколи не виходьте з блоку `finally` через `return` (чи `break`/`continue`).",
    ],
    { code: 'function f() {\n  try {\n    throw new Error("lost");\n  } finally {\n    return "ok";\n  }\n}\nconsole.log(f());', codeLanguage: "js" },
  ),
  quiz(
    "err-return-before-finally",
    ["error-handling"],
    3,
    90,
    ["Changing the returned value in `finally`", "Зміна повернутого значення у `finally`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1 2`", "`1 2`"],
      ["`2 2`", "`2 2`"],
      ["`1 1`", "`1 1`"],
      ["`2 1`", "`2 1`"],
    ],
    "a",
    [
      "`return x` evaluates `x` (to `1`) before `finally` runs, so reassigning the variable afterwards doesn't change the result. But `return o` returns a **reference**, and mutating the object in `finally` is visible to the caller.",
      "`return x` обчислює `x` (у `1`) до виконання `finally`, тож повторне присвоєння змінній після того результат не змінює. Але `return o` повертає **посилання**, і зміна об'єкта у `finally` видима для того, хто викликав.",
    ],
    { code: "function f() {\n  let x = 1;\n  try {\n    return x;\n  } finally {\n    x = 2;\n  }\n}\nfunction g() {\n  const o = { v: 1 };\n  try {\n    return o;\n  } finally {\n    o.v = 2;\n  }\n}\nconsole.log(f(), g().v);", codeLanguage: "js" },
  ),
  quiz(
    "err-async-callback-escapes",
    ["error-handling", w("event-loop")],
    2,
    75,
    ["`try/catch` around a timer", "`try/catch` навколо таймера"],
    ["This runs in Node.js. What happens?", "Код виконується в Node.js. Що станеться?"],
    [
      ["It prints `after try`, then the process crashes with the uncaught `Error: later`", "Виводиться `after try`, а потім процес аварійно завершується з неперехопленим `Error: later`"],
      ["It prints `caught later` and `after try`", "Виводиться `caught later` і `after try`"],
      ["It prints `after try` and the error is silently ignored", "Виводиться `after try`, а помилка мовчки ігнорується"],
      ["It prints `caught later` only", "Виводиться лише `caught later`"],
    ],
    "a",
    [
      "`try/catch` only covers code that runs **while the `try` block is on the stack**. The callback runs later, from the event loop, when that `try` is long gone, so its exception is uncaught. Handle errors inside the callback, or wrap the async operation in a promise and `await` it inside `try`.",
      "`try/catch` охоплює лише код, що виконується, **поки блок `try` є в стеку**. Колбек виконується пізніше з циклу подій, коли того `try` давно немає, тож його виняток неперехоплений. Обробляйте помилки всередині колбека або загорніть асинхронну операцію в проміс і чекайте на неї через `await` усередині `try`.",
    ],
    { code: 'try {\n  setTimeout(() => {\n    throw new Error("later");\n  }, 0);\n} catch (e) {\n  console.log("caught", e.message);\n}\nconsole.log("after try");', codeLanguage: "js" },
  ),
  quiz(
    "err-instanceof-order",
    ["error-handling", w("js-classes")],
    3,
    90,
    ["Checking error types in order", "Порядок перевірки типів помилок"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`generic: Invalid email`", "`generic: Invalid email`"],
      ["`validation: Invalid email`", "`validation: Invalid email`"],
      ["`unknown`", "`unknown`"],
      ["`generic: Invalid email` and `validation: Invalid email`", "`generic: Invalid email` і `validation: Invalid email`"],
    ],
    "a",
    [
      "A `ValidationError` **is also** an `Error`, so the first branch matches and the specific branch is never reached. Check the most specific types first (like `catch` clauses in Java or C#), or branch on a `code` field instead.",
      "`ValidationError` **також є** `Error`, тож збігається перша гілка, а до конкретної справа не доходить. Перевіряйте спершу найконкретніші типи (як блоки `catch` у Java чи C#) або розгалужуйтеся за полем `code`.",
    ],
    { code: 'class ValidationError extends Error {}\ntry {\n  throw new ValidationError("Invalid email");\n} catch (e) {\n  if (e instanceof Error) console.log("generic:", e.message);\n  else if (e instanceof ValidationError) console.log("validation:", e.message);\n  else console.log("unknown");\n}', codeLanguage: "js" },
  ),
  quiz(
    "err-all-keeps-running",
    ["error-handling", w("async-javascript")],
    3,
    120,
    ["What `Promise.all` doesn't stop", "Чого не зупиняє `Promise.all`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 10, 'fail 10', 20, 30 ]`", "`[ 10, 'fail 10', 20, 30 ]`"],
      ["`[ 10, 'fail 10' ]`", "`[ 10, 'fail 10' ]`"],
      ["`[ 10, 20, 30, 'fail 10' ]`", "`[ 10, 20, 30, 'fail 10' ]`"],
      ["`[ 'fail 10' ]`", "`[ 'fail 10' ]`"],
    ],
    "a",
    [
      "`Promise.all` rejects as soon as one input rejects, but it can't stop the other operations: they keep running, and their results (or failures) are ignored. If the remaining work has side effects or costs money, cancel it with an `AbortSignal`, or use `Promise.allSettled` when you need every outcome.",
      "`Promise.all` відхиляється, щойно відхиляється один із вхідних промісів, але не може зупинити інші операції: вони продовжують виконуватися, а їхні результати (чи збої) ігноруються. Якщо решта роботи має побічні ефекти чи коштує грошей, скасуйте її через `AbortSignal` або використайте `Promise.allSettled`, коли потрібен кожен результат.",
    ],
    {
      code: 'const log = [];\nconst task = (ms, fail) =>\n  new Promise((resolve, reject) =>\n    setTimeout(() => {\n      log.push(ms);\n      fail ? reject(new Error("fail " + ms)) : resolve(ms);\n    }, ms),\n  );\ntry {\n  await Promise.all([task(30), task(10, true), task(20)]);\n} catch (e) {\n  log.push(e.message);\n}\nawait new Promise((r) => setTimeout(r, 50));\nconsole.log(log);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "err-aggregate",
    ["error-handling", w("promise-internals")],
    2,
    75,
    ["When every promise fails", "Коли відхиляються всі проміси"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`AggregateError [ 'a', 'b' ]`", "`AggregateError [ 'a', 'b' ]`"],
      ["`Error [ 'a' ]`", "`Error [ 'a' ]`"],
      ["`Error [ 'b' ]`", "`Error [ 'b' ]`"],
      ["`AggregateError []`", "`AggregateError []`"],
    ],
    "a",
    [
      "`Promise.any` fulfils with the first success; if every input rejects, it rejects with an `AggregateError` whose `errors` array holds all the reasons, in input order. `AggregateError` is also useful in your own code when a batch operation has several independent failures.",
      "`Promise.any` виконується з першим успіхом; якщо відхиляються всі вхідні проміси, він відхиляється з `AggregateError`, масив `errors` якої містить усі причини в порядку вхідних даних. `AggregateError` корисна і у власному коді, коли пакетна операція має кілька незалежних збоїв.",
    ],
    { code: 'Promise.any([Promise.reject(new Error("a")), Promise.reject(new Error("b"))]).catch((e) =>\n  console.log(e.constructor.name, e.errors.map((x) => x.message)),\n);', codeLanguage: "js" },
  ),
  quiz(
    "err-what-to-retry",
    ["error-handling", w("http-rest")],
    3,
    90,
    ["Which failures to retry", "Які збої повторювати"],
    ["Which of these failures should an HTTP client retry automatically (with backoff)?", "Які з цих збоїв HTTP-клієнт має повторювати автоматично (із затримкою)?"],
    [
      ["A `GET` that timed out", "`GET`, що завершився тайм-аутом"],
      ["A `503 Service Unavailable` with a `Retry-After` header", "`503 Service Unavailable` із заголовком `Retry-After`"],
      ["A `400 Bad Request` from a validation failure", "`400 Bad Request` через помилку валідації"],
      ["A `POST /payments` that timed out, sent without an idempotency key", "`POST /payments`, що завершився тайм-аутом і був надісланий без ключа ідемпотентності"],
    ],
    "ab",
    [
      "Retry **transient** failures of **idempotent** operations: timeouts and `502`/`503`/`504` (respecting `Retry-After`), and `429` after the indicated delay. A `400` will fail the same way every time. A timed-out non-idempotent `POST` may have succeeded on the server, so retrying could charge the customer twice; retry it only with an idempotency key the server deduplicates on.",
      "Повторюйте **тимчасові** збої **ідемпотентних** операцій: тайм-аути та `502`/`503`/`504` (з урахуванням `Retry-After`), а `429` після вказаної затримки. `400` щоразу падатиме однаково. Неідемпотентний `POST`, що завершився тайм-аутом, міг виконатися на сервері, тож повтор може списати гроші з клієнта двічі; повторюйте його лише з ключем ідемпотентності, за яким сервер прибирає дублікати.",
    ],
  ),
  quiz(
    "err-swallowed",
    ["error-handling"],
    2,
    75,
    ["The silent catch", "Мовчазний catch"],
    [
      "A data loader looks like this: `async function loadUser(id) { try { return await api.get(\"/users/\" + id); } catch (e) { console.log(e); } }`. Callers do `const user = await loadUser(id); render(user.name);`. What's the main problem?",
      "Завантажувач даних виглядає так: `async function loadUser(id) { try { return await api.get(\"/users/\" + id); } catch (e) { console.log(e); } }`. Код, що його викликає, робить `const user = await loadUser(id); render(user.name);`. У чому головна проблема?",
    ],
    [
      ["Errors are swallowed and the function returns `undefined`, so the failure resurfaces later as a confusing `TypeError` far from its cause; rethrow (with context) or return an explicit result the caller must handle", "Помилки ковтаються, а функція повертає `undefined`, тож збій з'являється пізніше як незрозумілий `TypeError` далеко від своєї причини; киньте помилку знову (з контекстом) або поверніть явний результат, який той, хто викликає, мусить обробити"],
      ["`console.log` can't print errors; use `console.error`", "`console.log` не вміє виводити помилки; використайте `console.error`"],
      ["`return await` inside `try` is redundant and causes the bug", "`return await` усередині `try` зайвий і спричиняє помилку"],
      ["Nothing: logging every error is enough", "Нічого: журналювання кожної помилки достатньо"],
    ],
    "a",
    [
      "Catching just to log turns a clear failure (\"request for user 7 failed: 503\") into `Cannot read properties of undefined (reading 'name')` somewhere else. Handle an error where you can actually do something about it; otherwise add context and rethrow, or return a result type (`{ ok: false, error }`) that forces callers to deal with the failure. Here `return await` is correct: it makes rejections land in this `catch`.",
      "Перехоплення лише для журналювання перетворює зрозумілий збій («запит користувача 7 не вдався: 503») на `Cannot read properties of undefined (reading 'name')` деінде. Обробляйте помилку там, де справді можете щось із нею зробити; інакше додайте контекст і киньте знову або поверніть тип результату (`{ ok: false, error }`), що змушує того, хто викликає, обробити збій. Тут `return await` правильний: через нього відхилення потрапляють у цей `catch`.",
    ],
  ),
  practice({
    slug: "err-http-errors",
    skills: ["error-handling", w("js-classes"), w("web-security")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Error classes and safe HTTP error responses", "Класи помилок і безпечні HTTP-відповіді з помилками"],
    prompt: [
      "Build the error layer of an API in `src/errors.ts`:\n\n- `AppError extends Error` has `status` (default `500`), `code` (default `\"INTERNAL\"`), `expose` (default `false`: whether the message is safe for clients), supports `{ cause }`, and sets `name` to the actual class name for every subclass.\n- `ValidationError(fields)`: `400`, `\"VALIDATION\"`, message `\"Invalid input\"`, exposed, keeps `fields`.\n- `NotFoundError(resource, id)`: `404`, `\"NOT_FOUND\"`, message like `\"User 7 not found\"`, exposed.\n- `errorChain(err)` returns the messages from `err` down its `cause` chain (non-`Error` causes via `String`), stopping at cycles.\n- `toHttpResponse(err, requestId)` returns `{ status, body: { error: { code, message, requestId, fields? } } }`, based on the **first `AppError` in the cause chain**. Unknown errors and non-exposed app errors become a generic `\"Something went wrong\"`, so internal details never leak. Thrown non-errors must work too.",
      "Побудуйте рівень помилок API у `src/errors.ts`:\n\n- `AppError extends Error` має `status` (за замовчуванням `500`), `code` (за замовчуванням `\"INTERNAL\"`), `expose` (за замовчуванням `false`: чи безпечно показувати повідомлення клієнтам), підтримує `{ cause }` і встановлює `name` у фактичну назву класу для кожного підкласу.\n- `ValidationError(fields)`: `400`, `\"VALIDATION\"`, повідомлення `\"Invalid input\"`, показується, зберігає `fields`.\n- `NotFoundError(resource, id)`: `404`, `\"NOT_FOUND\"`, повідомлення на кшталт `\"User 7 not found\"`, показується.\n- `errorChain(err)` повертає повідомлення від `err` вниз ланцюжком `cause` (причини, що не є `Error`, через `String`), зупиняючись на циклах.\n- `toHttpResponse(err, requestId)` повертає `{ status, body: { error: { code, message, requestId, fields? } } }` на основі **першої `AppError` у ланцюжку причин**. Невідомі помилки й помилки застосунку, які не можна показувати, стають загальним `\"Something went wrong\"`, тож внутрішні подробиці ніколи не витікають. Кинуті значення, що не є помилками, теж мають оброблятися.",
    ],
    files: { "/src/errors.ts": HTTP_STARTER, "/index.ts": HTTP_INDEX },
    visibleFiles: ["/src/errors.ts", "/index.ts"],
    activeFile: "/src/errors.ts",
    tests: HTTP_TESTS,
    solution: { "/src/errors.ts": HTTP_SOLUTION },
    explanation: [
      "Subclasses only override field defaults, and `this.name = new.target.name` in the base constructor names every subclass correctly without repeating code. Passing `options` to `super` lets the built-in `Error` store `cause`. Walking the cause chain with a `Set` of visited errors handles cycles, and finding the first `AppError` lets handlers wrap domain errors with extra context without changing the HTTP status. The `expose` flag makes \"safe to show\" an explicit decision, so database messages, stack traces and secrets stay in the logs (with the `requestId` to find them).",
      "Підкласи лише перевизначають значення полів за замовчуванням, а `this.name = new.target.name` у базовому конструкторі правильно називає кожен підклас без повторення коду. Передавання `options` у `super` дає вбудованому `Error` зберегти `cause`. Обхід ланцюжка причин із `Set` відвіданих помилок обробляє цикли, а пошук першої `AppError` дає обробникам загортати помилки предметної області з додатковим контекстом, не змінюючи HTTP-статус. Прапорець `expose` робить «безпечно показати» явним рішенням, тож повідомлення бази даних, стеки викликів і секрети лишаються в журналах (з `requestId`, щоб їх знайти).",
    ],
  }),
  practice({
    slug: "err-circuit-breaker",
    skills: ["error-handling", w("system-design"), w("async-javascript")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["A circuit breaker", "Запобіжник (circuit breaker)"],
    prompt: [
      "When a dependency is down, hammering it with requests makes things worse. Implement `CircuitBreaker` in `src/breaker.ts`:\n\n- **closed**: `call(fn)` runs `fn` and passes through its result or error. A success resets the failure count; `failureThreshold` **consecutive** failures open the circuit.\n- **open**: `call` rejects immediately with `CircuitOpenError`, without calling `fn`.\n- After `resetMs`, the state becomes **half-open**: exactly one trial call is allowed (other calls get `CircuitOpenError` while it runs). Success closes the circuit; failure opens it again for another `resetMs`.\n- `isFailure(error)` decides which errors count (for example, a `404` means the service is up). Errors that don't count still reach the caller.\n- `now()` is injectable for tests, and `state` reports `\"closed\"`, `\"open\"` or `\"half-open\"`.",
      "Коли залежність не працює, засипання її запитами лише погіршує ситуацію. Реалізуйте `CircuitBreaker` у `src/breaker.ts`:\n\n- **closed**: `call(fn)` виконує `fn` і передає далі її результат чи помилку. Успіх скидає лічильник збоїв; `failureThreshold` збоїв **поспіль** розмикають ланцюг.\n- **open**: `call` одразу відхиляється з `CircuitOpenError`, не викликаючи `fn`.\n- Через `resetMs` стан стає **half-open**: дозволено рівно один пробний виклик (інші виклики отримують `CircuitOpenError`, поки він триває). Успіх замикає ланцюг; збій знову розмикає його ще на `resetMs`.\n- `isFailure(error)` вирішує, які помилки рахуються (наприклад, `404` означає, що сервіс працює). Помилки, що не рахуються, все одно доходять до того, хто викликає.\n- `now()` можна підмінити в тестах, а `state` повідомляє `\"closed\"`, `\"open\"` чи `\"half-open\"`.",
    ],
    files: { "/src/breaker.ts": BREAKER_STARTER, "/index.ts": BREAKER_INDEX },
    visibleFiles: ["/src/breaker.ts", "/index.ts"],
    activeFile: "/src/breaker.ts",
    tests: BREAKER_TESTS,
    solution: { "/src/breaker.ts": BREAKER_SOLUTION },
    explanation: [
      "Storing only `openedAt` and deriving `open` vs `half-open` from the clock keeps the state machine small and testable with an injected `now`. `call` captures the state once at the start, so the outcome of a trial call is attributed correctly even if time passes while it runs, and a `#trialRunning` flag released in `finally` guarantees a single probe. Errors are always rethrown: the breaker changes **when** you call the dependency, not what callers see. Failing fast gives the dependency time to recover and keeps your own threads, sockets and users from waiting on timeouts.",
      "Зберігання лише `openedAt` і обчислення `open` чи `half-open` за годинником тримає скінченний автомат малим і придатним до тестування з підміненим `now`. `call` фіксує стан один раз на початку, тож результат пробного виклику правильно враховується, навіть якщо за час його виконання минає час, а прапорець `#trialRunning`, що знімається у `finally`, гарантує одну спробу. Помилки завжди кидаються далі: запобіжник змінює те, **коли** ви звертаєтеся до залежності, а не те, що бачить той, хто викликає. Швидка відмова дає залежності час відновитися й не змушує ваші потоки, сокети й користувачів чекати на тайм-аути.",
    ],
  }),
]);
