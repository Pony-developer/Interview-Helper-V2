import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const ABORT_STARTER = String.raw`/** Resolves after ms; rejects with signal.reason if the signal aborts first (or already has). */
export function sleep(ms: number, { signal }: { signal?: AbortSignal } = {}): Promise<void> {
  // TODO: ignores the signal
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A signal that aborts (with the same reason) as soon as any of the given signals does. */
export function anySignal(signals: AbortSignal[]): AbortSignal {
  return signals[0]; // TODO
}

/**
 * Runs task with a signal that aborts after ms (reason: a DOMException named "TimeoutError")
 * or when the optional outer signal aborts. Rejects with that reason even if task ignores the signal.
 */
export function withTimeout<T>(task: (signal: AbortSignal) => Promise<T>, ms: number, { signal }: { signal?: AbortSignal } = {}): Promise<T> {
  // TODO: the task is never told to stop, the timer is never cleared, the outer signal is ignored
  return Promise.race([
    task(new AbortController().signal),
    new Promise<T>((_, reject) => setTimeout(() => reject(new DOMException("Timed out", "TimeoutError")), ms)),
  ]);
}
`;

const ABORT_SOLUTION = String.raw`export function sleep(ms: number, { signal }: { signal?: AbortSignal } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(id);
      reject(signal!.reason);
    };
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  const cleanups: Array<() => void> = [];
  const abort = (reason: unknown) => {
    controller.abort(reason);
    for (const cleanup of cleanups) cleanup(); // don't keep listeners on long-lived signals
  };
  for (const signal of signals) {
    if (signal.aborted) {
      abort(signal.reason);
      break;
    }
    const onAbort = () => abort(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    cleanups.push(() => signal.removeEventListener("abort", onAbort));
  }
  return controller.signal;
}

export async function withTimeout<T>(task: (signal: AbortSignal) => Promise<T>, ms: number, { signal }: { signal?: AbortSignal } = {}): Promise<T> {
  const timeout = new AbortController();
  const id = setTimeout(() => timeout.abort(new DOMException("Timed out after " + ms + " ms", "TimeoutError")), ms);
  const combined = signal ? anySignal([signal, timeout.signal]) : timeout.signal;
  try {
    combined.throwIfAborted();
    return await new Promise<T>((resolve, reject) => {
      // Settle on abort even if the task ignores its signal.
      combined.addEventListener("abort", () => reject(combined.reason), { once: true });
      task(combined).then(resolve, reject);
    });
  } finally {
    clearTimeout(id);
  }
}
`;

const ABORT_INDEX = String.raw`import "./styles.css";
import { sleep, withTimeout } from "./src/abortable";

document.getElementById("app")!.innerHTML =
  '<h1>Abortable work</h1><button id="start">Start (2 s, 1 s timeout)</button> <button id="cancel">Cancel</button><pre id="out"></pre>';
const out = document.getElementById("out")!;
let controller: AbortController | null = null;
document.getElementById("start")!.addEventListener("click", async () => {
  controller = new AbortController();
  out.textContent = "working…";
  try {
    await withTimeout((signal) => sleep(2000, { signal }).then(() => "done"), 1000, { signal: controller.signal });
    out.textContent = "finished";
  } catch (e) {
    out.textContent = "stopped: " + (e as Error).name;
  }
});
document.getElementById("cancel")!.addEventListener("click", () => controller?.abort(new DOMException("Cancelled by user", "AbortError")));
`;

const ABORT_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { anySignal, sleep, withTimeout } from "../src/abortable";

const settle = (p) => p.then((value) => ({ value }), (error) => ({ error }));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("sleep", () => {
  it("resolves after the delay", async () => {
    const start = performance.now();
    await sleep(20);
    expect(performance.now() - start).toBeGreaterThanOrEqual(15);
  });
  it("rejects promptly with the abort reason", async () => {
    const c = new AbortController();
    const start = performance.now();
    const p = settle(sleep(500, { signal: c.signal }));
    setTimeout(() => c.abort(new Error("stop")), 10);
    const result = await p;
    expect(result.error.message).toBe("stop");
    expect(performance.now() - start).toBeLessThan(300);
  });
  it("rejects immediately if already aborted", async () => {
    const c = new AbortController();
    c.abort();
    const result = await settle(sleep(500, { signal: c.signal }));
    expect(result.error.name).toBe("AbortError");
  });
});

describe("anySignal", () => {
  it("aborts with the reason of the first signal that aborts", () => {
    const a = new AbortController();
    const b = new AbortController();
    const s = anySignal([a.signal, b.signal]);
    expect(s.aborted).toBe(false);
    b.abort("b first");
    a.abort("a later");
    expect(s.aborted).toBe(true);
    expect(s.reason).toBe("b first");
  });
  it("is aborted right away if an input already is", () => {
    const a = new AbortController();
    a.abort("early");
    const s = anySignal([new AbortController().signal, a.signal]);
    expect(s.aborted).toBe(true);
    expect(s.reason).toBe("early");
  });
});

describe("withTimeout", () => {
  it("returns the task's result when it's fast enough", async () => {
    expect(await withTimeout(async () => "fast", 50)).toBe("fast");
  });
  it("aborts the task and rejects with a TimeoutError", async () => {
    let seen;
    const result = await settle(withTimeout((signal) => { seen = signal; return sleep(500, { signal }); }, 20));
    expect(result.error.name).toBe("TimeoutError");
    expect(seen.aborted).toBe(true);
  });
  it("rejects on time even if the task ignores its signal", async () => {
    const start = performance.now();
    const result = await settle(withTimeout(() => wait(400), 20));
    expect(result.error.name).toBe("TimeoutError");
    expect(performance.now() - start).toBeLessThan(300);
  });
  it("forwards an outer cancellation", async () => {
    const outer = new AbortController();
    let seen;
    const p = settle(withTimeout((signal) => { seen = signal; return sleep(500, { signal }); }, 1000, { signal: outer.signal }));
    setTimeout(() => outer.abort(new DOMException("user left", "AbortError")), 10);
    const result = await p;
    expect(result.error.name).toBe("AbortError");
    expect(result.error.message).toBe("user left");
    expect(seen.aborted).toBe(true);
  });
});
`;

const STRATEGY_STARTER = String.raw`/** Each call aborts the previous one; superseded calls reject with an AbortError. */
export function latest<A extends unknown[], R>(task: (signal: AbortSignal, ...args: A) => Promise<R>) {
  // TODO
  return (...args: A): Promise<R> => task(new AbortController().signal, ...args);
}

/** While a call is running, further calls return the same in-flight promise. */
export function exhaust<A extends unknown[], R>(task: (...args: A) => Promise<R>) {
  // TODO
  return (...args: A): Promise<R> => task(...args);
}

/** Calls run one at a time, in call order; a failure doesn't stop the queue. */
export function queue<A extends unknown[], R>(task: (...args: A) => Promise<R>) {
  // TODO
  return (...args: A): Promise<R> => task(...args);
}
`;

const STRATEGY_SOLUTION = String.raw`export function latest<A extends unknown[], R>(task: (signal: AbortSignal, ...args: A) => Promise<R>) {
  let current: AbortController | null = null;
  return (...args: A): Promise<R> => {
    current?.abort(new DOMException("Superseded by a newer call", "AbortError"));
    const controller = new AbortController();
    current = controller;
    return new Promise<R>((resolve, reject) => {
      // Reject as soon as we're superseded, even if the task ignores its signal and finishes later.
      controller.signal.addEventListener("abort", () => reject(controller.signal.reason), { once: true });
      task(controller.signal, ...args).then(resolve, reject);
    }).finally(() => {
      if (current === controller) current = null;
    });
  };
}

export function exhaust<A extends unknown[], R>(task: (...args: A) => Promise<R>) {
  let inFlight: Promise<R> | null = null;
  return (...args: A): Promise<R> => {
    if (!inFlight) {
      inFlight = Promise.resolve()
        .then(() => task(...args))
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
}

export function queue<A extends unknown[], R>(task: (...args: A) => Promise<R>) {
  let tail: Promise<unknown> = Promise.resolve();
  return (...args: A): Promise<R> => {
    const result = tail.then(() => task(...args));
    // The next call waits for this one to settle either way, so one failure doesn't block the rest.
    tail = result.catch(() => {});
    return result;
  };
}
`;

const STRATEGY_INDEX = String.raw`import "./styles.css";
import { exhaust, latest } from "./src/strategies";

document.getElementById("app")!.innerHTML =
  '<h1>Search</h1><input id="q" placeholder="Type quickly…" /> <button id="refresh">Refresh</button><pre id="out"></pre>';
const out = document.getElementById("out")!;
const fakeSearch = (signal: AbortSignal, q: string) =>
  new Promise<string>((resolve) => setTimeout(() => resolve("results for " + q), 50 + Math.random() * 400));
const search = latest(fakeSearch);
document.getElementById("q")!.addEventListener("input", async (e) => {
  try {
    out.textContent = await search((e.target as HTMLInputElement).value);
  } catch {
    /* superseded */
  }
});
let refreshes = 0;
const refresh = exhaust(() => new Promise<number>((resolve) => setTimeout(() => resolve(++refreshes), 500)));
document.getElementById("refresh")!.addEventListener("click", async () => {
  out.textContent = "refresh #" + (await refresh());
});
`;

const STRATEGY_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { exhaust, latest, queue } from "../src/strategies";

const settle = (p) => p.then((value) => ({ value }), (error) => ({ error }));
const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

describe("latest", () => {
  it("aborts the previous call so a stale response can't win", async () => {
    const signals = [];
    const search = latest((signal, q) => {
      signals.push(signal);
      return delay(q === "re" ? 40 : 10, "results for " + q);
    });
    const first = settle(search("re"));
    const second = search("react");
    expect(await second).toBe("results for react");
    const stale = await first;
    expect(stale.error.name).toBe("AbortError");
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });
  it("lets calls that don't overlap complete normally", async () => {
    const run = latest((signal, n) => delay(5, n * 2));
    expect(await run(1)).toBe(2);
    expect(await run(2)).toBe(4);
  });
});

describe("exhaust", () => {
  it("ignores calls while one is running and shares its result", async () => {
    let finish;
    const task = fn(() => new Promise((resolve) => { finish = resolve; }));
    const submit = exhaust(task);
    const a = submit();
    const b = submit();
    await delay(0);
    expect(task).toHaveBeenCalledTimes(1);
    finish("paid");
    expect(await a).toBe("paid");
    expect(await b).toBe("paid");
  });
  it("starts again after the running call settles, even after a failure", async () => {
    let attempt = 0;
    const task = fn(async () => {
      attempt++;
      if (attempt === 1) throw new Error("declined");
      return "ok";
    });
    const submit = exhaust(task);
    expect((await settle(submit())).error.message).toBe("declined");
    expect(await submit()).toBe("ok");
    expect(task).toHaveBeenCalledTimes(2);
  });
});

describe("queue", () => {
  it("runs calls one at a time in call order", async () => {
    let active = 0;
    let maxActive = 0;
    const order = [];
    const save = queue(async (id, ms) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await delay(ms);
      order.push(id);
      active--;
      return id;
    });
    const results = await Promise.all([save("a", 30), save("b", 5), save("c", 15)]);
    expect(results).toEqual(["a", "b", "c"]);
    expect(order).toEqual(["a", "b", "c"]);
    expect(maxActive).toBe(1);
  });
  it("keeps going after a failure", async () => {
    const run = queue(async (x) => {
      if (x === 2) throw new Error("bad " + x);
      return x;
    });
    const results = await Promise.all([settle(run(1)), settle(run(2)), settle(run(3))]);
    expect(results[0]).toEqual({ value: 1 });
    expect(results[1].error.message).toBe("bad 2");
    expect(results[2]).toEqual({ value: 3 });
  });
});
`;

export default defineTasks([
  quiz(
    "cxl-race-doesnt-cancel",
    ["async-cancellation", w("promise-internals")],
    2,
    90,
    ["Does `Promise.race` cancel the loser?", "Чи скасовує `Promise.race` того, хто програв?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`timeout` and then `true`", "`timeout`, а потім `true`"],
      ["`timeout` and then `false`", "`timeout`, а потім `false`"],
      ["`slow` and then `true`", "`slow`, а потім `true`"],
      ["Only `timeout`", "Лише `timeout`"],
    ],
    "a",
    [
      "`Promise.race` settles with the first input to settle, but it has no way to stop the others: promises represent results, not operations. The slow work keeps running and finishes anyway (a real request would still use bandwidth and might still change data). To actually stop it, pass an `AbortSignal` to the operation and abort it on timeout.",
      "`Promise.race` завершується з першим вхідним промісом, що завершився, але не може зупинити інші: проміси представляють результати, а не операції. Повільна робота продовжується й усе одно завершується (справжній запит і далі використовував би трафік і міг би змінити дані). Щоб справді її зупинити, передайте операції `AbortSignal` і скасуйте його за тайм-аутом.",
    ],
    {
      code: 'let finished = false;\nconst slow = new Promise((r) =>\n  setTimeout(() => {\n    finished = true;\n    r("slow");\n  }, 30),\n);\nconst timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 10));\ntry {\n  console.log(await Promise.race([slow, timeout]));\n} catch (e) {\n  console.log(e.message);\n}\nawait new Promise((r) => setTimeout(r, 50));\nconsole.log(finished);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "cxl-abort-once",
    ["async-cancellation"],
    2,
    60,
    ["Aborting twice", "Подвійне скасування"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true AbortError AbortError 1`", "`true AbortError AbortError 1`"],
      ["`true AbortError again 2`", "`true AbortError again 2`"],
      ["`true undefined again 2`", "`true undefined again 2`"],
      ["`false AbortError AbortError 1`", "`false AbortError AbortError 1`"],
    ],
    "a",
    [
      "`abort()` without an argument stores a `DOMException` named `AbortError` as `signal.reason`. A signal aborts only once: later `abort` calls don't change the reason and don't fire `abort` again. So it's safe to call `abort()` in several cleanup paths.",
      "`abort()` без аргументу зберігає як `signal.reason` `DOMException` на ім'я `AbortError`. Сигнал скасовується лише один раз: пізніші виклики `abort` не змінюють причину й не запускають `abort` повторно. Тож `abort()` безпечно викликати в кількох шляхах очищення.",
    ],
    { code: 'const c = new AbortController();\nlet events = 0;\nc.signal.addEventListener("abort", () => events++);\nc.abort();\nconst first = c.signal.reason.name;\nc.abort("again");\nconsole.log(c.signal.aborted, first, c.signal.reason.name, events);', codeLanguage: "js" },
  ),
  quiz(
    "cxl-throw-if-aborted",
    ["async-cancellation"],
    2,
    60,
    ["`throwIfAborted`", "`throwIfAborted`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`stop true`", "`stop true`"],
      ["`AbortError false`", "`AbortError false`"],
      ["`stop false`", "`stop false`"],
      ["Nothing: `throwIfAborted` only works inside `fetch`", "Нічого: `throwIfAborted` працює лише всередині `fetch`"],
    ],
    "a",
    [
      "`signal.throwIfAborted()` throws `signal.reason` itself if the signal is aborted, so a custom reason (here an `Error` with message `stop`) comes through unchanged. Call it at the start of an abortable function and between steps of long work, to bail out early without extra checks.",
      "`signal.throwIfAborted()` кидає саму `signal.reason`, якщо сигнал скасовано, тож власна причина (тут `Error` з повідомленням `stop`) проходить без змін. Викликайте його на початку скасовуваної функції й між кроками тривалої роботи, щоб вийти раніше без додаткових перевірок.",
    ],
    { code: 'const c = new AbortController();\nc.abort(new Error("stop"));\ntry {\n  c.signal.throwIfAborted();\n} catch (e) {\n  console.log(e.message, e === c.signal.reason);\n}', codeLanguage: "js" },
  ),
  quiz(
    "cxl-listener-signal",
    ["async-cancellation", w("dom-events")],
    2,
    60,
    ["Removing listeners with a signal", "Видалення слухачів через сигнал"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1`", "`1`"],
      ["`2`", "`2`"],
      ["`0`", "`0`"],
      ["A `TypeError`: addEventListener doesn't accept a signal", "`TypeError`: addEventListener не приймає сигнал"],
    ],
    "a",
    [
      "`addEventListener` accepts `{ signal }`: when the signal aborts, the listener is removed. One controller can remove many listeners at once (for example all of a component's handlers on unmount) without keeping references to each handler for `removeEventListener`.",
      "`addEventListener` приймає `{ signal }`: коли сигнал скасовується, слухача видаляють. Один контролер може видалити багато слухачів одразу (наприклад, усі обробники компонента під час демонтування), не зберігаючи посилань на кожен обробник для `removeEventListener`.",
    ],
    { code: 'const target = new EventTarget();\nconst c = new AbortController();\nlet n = 0;\ntarget.addEventListener("ping", () => n++, { signal: c.signal });\ntarget.dispatchEvent(new Event("ping"));\nc.abort();\ntarget.dispatchEvent(new Event("ping"));\nconsole.log(n);', codeLanguage: "js" },
  ),
  quiz(
    "cxl-timeout-signal",
    ["async-cancellation"],
    3,
    75,
    ["`AbortSignal.timeout`", "`AbortSignal.timeout`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`TimeoutError`", "`TimeoutError`"],
      ["`AbortError`", "`AbortError`"],
      ["Nothing: the signal never aborts by itself", "Нічого: сигнал ніколи не скасовується сам"],
      ["`Error`", "`Error`"],
    ],
    "a",
    [
      "`AbortSignal.timeout(ms)` aborts by itself after `ms` with a `DOMException` named `TimeoutError` (not `AbortError`), so handlers can tell \"too slow\" from \"cancelled by the user\". `fetch(url, { signal: AbortSignal.timeout(5000) })` is the shortest way to put a deadline on a request.",
      "`AbortSignal.timeout(ms)` скасовується сам через `ms` з `DOMException` на ім'я `TimeoutError` (а не `AbortError`), тож обробники можуть відрізнити «занадто повільно» від «скасовано користувачем». `fetch(url, { signal: AbortSignal.timeout(5000) })` є найкоротшим способом задати запиту крайній термін.",
    ],
    { code: 'const s = AbortSignal.timeout(10);\ns.addEventListener("abort", () => console.log(s.reason.name));\nawait new Promise((r) => setTimeout(r, 30));', codeLanguage: "js" },
  ),
  quiz(
    "cxl-any-signal",
    ["async-cancellation"],
    3,
    75,
    ["Combining signals", "Поєднання сигналів"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true closed`", "`true closed`"],
      ["`false undefined`", "`false undefined`"],
      ["`true This operation was aborted`", "`true This operation was aborted`"],
      ["`true signal timed out`", "`true signal timed out`"],
    ],
    "a",
    [
      "`AbortSignal.any([...])` returns a signal that aborts as soon as **any** input does, with that input's reason. That's how you combine \"the user closed the dialog\" with \"give up after 1 second\" for one operation, and the reason tells you which one happened.",
      "`AbortSignal.any([...])` повертає сигнал, що скасовується, щойно скасовується **будь-який** вхідний сигнал, з причиною цього сигналу. Так поєднують «користувач закрив діалог» і «здатися через 1 секунду» для однієї операції, а причина каже, що саме сталося.",
    ],
    { code: 'const user = new AbortController();\nconst s = AbortSignal.any([user.signal, AbortSignal.timeout(1000)]);\nuser.abort(new Error("closed"));\nconsole.log(s.aborted, s.reason.message);', codeLanguage: "js" },
  ),
  quiz(
    "cxl-stale-response",
    ["async-cancellation", w("react", 0.3)],
    3,
    90,
    ["A search box race condition", "Стан гонитви в полі пошуку"],
    ["The user types \"re\" and then \"react\". The first request happens to be slower. What does this print?", "Користувач вводить «re», а потім «react». Перший запит випадково повільніший. Що виведе цей код?"],
    [
      ["`results for re`", "`results for re`"],
      ["`results for react`", "`results for react`"],
      ["`results for re` and `results for react`, alternating", "`results for re` і `results for react` по черзі"],
      ["An empty string", "Порожній рядок"],
    ],
    "a",
    [
      "Both requests run concurrently, and whichever finishes **last** writes `shown`. The request for \"re\" is slower, so the stale result overwrites the correct one. Fix it by aborting the previous request when a new one starts (latest wins), or by ignoring results that aren't from the most recent request.",
      "Обидва запити виконуються одночасно, і `shown` записує той, що завершився **останнім**. Запит для «re» повільніший, тож застарілий результат перезаписує правильний. Виправлення: скасовуйте попередній запит, коли починається новий (перемагає останній), або ігноруйте результати, що не належать найновішому запиту.",
    ],
    {
      code: 'let shown = "";\nconst search = (q, ms) => new Promise((r) => setTimeout(() => r("results for " + q), ms));\nasync function onInput(q, ms) {\n  shown = await search(q, ms);\n}\nonInput("re", 30);\nonInput("react", 10);\nawait new Promise((r) => setTimeout(r, 50));\nconsole.log(shown);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "cxl-cancel-vs-failure",
    ["async-cancellation", w("error-handling")],
    2,
    60,
    ["Telling cancellation from failure", "Як відрізнити скасування від збою"],
    ["A `fetch` is aborted because the user navigated away. In its `catch`, how should you recognise that case?", "`fetch` скасовано, бо користувач перейшов на іншу сторінку. Як розпізнати цей випадок у його `catch`?"],
    [
      ["Check `err.name === \"AbortError\"` (or `signal.aborted`) and skip error reporting", "Перевірити `err.name === \"AbortError\"` (чи `signal.aborted`) і не звітувати про помилку"],
      ["Check `err.status === 499`", "Перевірити `err.status === 499`"],
      ["Check `err instanceof TypeError`", "Перевірити `err instanceof TypeError`"],
      ["There's no way: aborted fetches never reject", "Ніяк: скасовані fetch ніколи не відхиляються"],
    ],
    "a",
    [
      "An aborted `fetch` rejects with the signal's reason, which by default is a `DOMException` named `AbortError` (or `TimeoutError` for `AbortSignal.timeout`). Cancellation is intentional, so don't show an error message or send it to error monitoring; treat it as a quiet exit. Network failures are `TypeError`s, and HTTP error statuses don't reject at all.",
      "Скасований `fetch` відхиляється з причиною сигналу, якою за замовчуванням є `DOMException` на ім'я `AbortError` (чи `TimeoutError` для `AbortSignal.timeout`). Скасування навмисне, тож не показуйте повідомлення про помилку й не надсилайте його в моніторинг помилок; вважайте це тихим виходом. Збої мережі є `TypeError`, а HTTP-статуси помилок узагалі не відхиляють проміс.",
    ],
  ),
  quiz(
    "cxl-strategy-payment",
    ["async-cancellation", w("rxjs", 0.3)],
    2,
    75,
    ["Double-clicking \"Pay\"", "Подвійне натискання «Оплатити»"],
    ["Users double-click the \"Pay\" button, and each click starts a payment request. Which strategy should the click handler use?", "Користувачі двічі натискають кнопку «Оплатити», і кожне натискання запускає запит на оплату. Яку стратегію має використовувати обробник натискання?"],
    [
      ["Exhaust: ignore clicks while a payment is in progress", "Exhaust: ігнорувати натискання, поки оплата триває"],
      ["Latest wins: cancel the first payment and start a new one", "Перемагає останній: скасувати першу оплату й почати нову"],
      ["Queue: run both payments one after another", "Черга: виконати обидві оплати одну за одною"],
      ["Parallel: run both payments at once", "Паралельно: виконати обидві оплати одночасно"],
    ],
    "a",
    [
      "The second click is a duplicate, not a new intent, so it should be ignored while the first request is in flight (`exhaustMap` in RxJS); disable the button too. Latest-wins is dangerous here: aborting the client request doesn't guarantee the server didn't charge. Queue and parallel would charge twice. Also send an idempotency key so the server can deduplicate retries.",
      "Друге натискання є дублікатом, а не новим наміром, тож його треба ігнорувати, поки перший запит триває (`exhaustMap` у RxJS); також вимкніть кнопку. «Перемагає останній» тут небезпечний: скасування запиту на клієнті не гарантує, що сервер не списав кошти. Черга й паралельне виконання спишуть гроші двічі. Також надсилайте ключ ідемпотентності, щоб сервер міг прибрати дублікати повторів.",
    ],
  ),
  quiz(
    "cxl-strategy-autosave",
    ["async-cancellation", w("rxjs", 0.3)],
    3,
    90,
    ["Autosaving edits", "Автозбереження змін"],
    ["A note editor sends a `PATCH` with the full text after each pause in typing. Saves must never apply out of order. Which strategy fits best?", "Редактор нотаток надсилає `PATCH` з повним текстом після кожної паузи в наборі. Збереження ніколи не повинні застосовуватися не по порядку. Яка стратегія підходить найкраще?"],
    [
      ["Queue: send saves one at a time, in order", "Черга: надсилати збереження по одному, по порядку"],
      ["Parallel: send every save immediately", "Паралельно: надсилати кожне збереження одразу"],
      ["Exhaust: ignore saves while one is in flight", "Exhaust: ігнорувати збереження, поки одне триває"],
      ["Latest wins: abort the in-flight save on the client and send the new one", "Перемагає останній: скасувати поточне збереження на клієнті й надіслати нове"],
    ],
    "a",
    [
      "Parallel requests can reach the server out of order, so an older text could overwrite a newer one. Exhaust would silently drop the latest edits. Aborting on the client doesn't stop a request the server is already processing, so ordering still isn't guaranteed. A queue (`concatMap`) applies saves in order; a refinement is to coalesce queued saves so only the newest pending text is sent.",
      "Паралельні запити можуть дійти до сервера не по порядку, тож старіший текст може перезаписати новіший. Exhaust мовчки відкине останні зміни. Скасування на клієнті не зупиняє запит, який сервер уже обробляє, тож порядок усе одно не гарантовано. Черга (`concatMap`) застосовує збереження по порядку; удосконалення: об'єднувати збереження в черзі, щоб надсилався лише найновіший текст, що очікує.",
    ],
  ),
  quiz(
    "cxl-react-effect",
    ["async-cancellation", w("react")],
    3,
    90,
    ["Fetching in a React effect", "Отримання даних в ефекті React"],
    [
      "A component runs `useEffect(() => { fetch(\"/api/users?q=\" + query).then((r) => r.json()).then(setUsers); }, [query]);`. Fast typing sometimes shows results for an old query. Which change fixes it best?",
      "Компонент виконує `useEffect(() => { fetch(\"/api/users?q=\" + query).then((r) => r.json()).then(setUsers); }, [query]);`. Під час швидкого набору іноді показуються результати для старого запиту. Яка зміна виправляє це найкраще?",
    ],
    [
      ["Create an `AbortController` in the effect, pass its signal to `fetch`, abort it in the cleanup function, and ignore `AbortError`", "Створити `AbortController` в ефекті, передати його сигнал у `fetch`, скасувати його у функції очищення й ігнорувати `AbortError`"],
      ["Add `users` to the dependency array", "Додати `users` у масив залежностей"],
      ["Wrap `setUsers` in `setTimeout`", "Загорнути `setUsers` у `setTimeout`"],
      ["Make the effect function `async`", "Зробити функцію ефекту `async`"],
    ],
    "a",
    [
      "React runs the cleanup before the next effect (when `query` changes) and on unmount. Aborting there cancels the outdated request, so its response can't call `setUsers` after a newer one; a boolean `ignore` flag set in the cleanup works too, but doesn't save bandwidth. Data-fetching libraries like TanStack Query do this for you via the `signal` they pass to query functions.",
      "React виконує функцію очищення перед наступним ефектом (коли змінюється `query`) і під час демонтування. Скасування там зупиняє застарілий запит, тож його відповідь не може викликати `setUsers` після новішої; булевий прапорець `ignore`, що встановлюється в очищенні, теж працює, але не економить трафік. Бібліотеки отримання даних на кшталт TanStack Query роблять це за вас через `signal`, який вони передають функціям запитів.",
    ],
  ),
  quiz(
    "cxl-channel-backpressure",
    ["async-cancellation", w("iterators-generators")],
    3,
    90,
    ["Channels and backpressure", "Канали й зворотний тиск"],
    [
      "A producer `await`s `channel.send(item)` for 5 items into a channel with buffer size 2. The consumer takes one item per second. What happens to the producer?",
      "Виробник чекає (`await`) на `channel.send(item)` для 5 елементів у канал із буфером розміром 2. Споживач забирає по одному елементу щосекунди. Що відбувається з виробником?",
    ],
    [
      ["Its first sends complete right away; once the buffer is full, each `send` waits until the consumer takes an item, so it slows to the consumer's pace", "Перші надсилання завершуються одразу; щойно буфер заповнено, кожен `send` чекає, доки споживач не забере елемент, тож виробник сповільнюється до темпу споживача"],
      ["All 5 sends complete immediately, and items beyond the buffer are dropped", "Усі 5 надсилань завершуються одразу, а елементи понад буфер відкидаються"],
      ["All 5 sends complete immediately, and the buffer grows to 5", "Усі 5 надсилань завершуються одразу, а буфер зростає до 5"],
      ["The third `send` throws a `RangeError`", "Третій `send` кидає `RangeError`"],
    ],
    "a",
    [
      "A bounded channel applies **backpressure**: when it's full, `send` returns a promise that settles only after the consumer makes room, so a fast producer can't fill memory. (How many sends finish immediately depends on whether a consumer is already waiting.) Unbounded queues hide this problem until memory runs out. Streams (`ReadableStream`, Node streams) use the same idea with a high-water mark.",
      "Обмежений канал застосовує **зворотний тиск** (backpressure): коли він заповнений, `send` повертає проміс, що завершується лише після того, як споживач звільнить місце, тож швидкий виробник не може заповнити пам'ять. (Скільки надсилань завершиться одразу, залежить від того, чи вже чекає споживач.) Необмежені черги приховують цю проблему, доки не скінчиться пам'ять. Потоки (`ReadableStream`, потоки Node) використовують ту саму ідею з high-water mark.",
    ],
  ),
  practice({
    slug: "cxl-abortable",
    skills: ["async-cancellation", w("async-javascript"), w("browser-apis")],
    complexity: 3,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Abortable sleep, combined signals and timeouts", "Скасовуваний sleep, поєднані сигнали й тайм-аути"],
    prompt: [
      "Implement three cancellation building blocks in `src/abortable.ts`:\n\n- `sleep(ms, { signal })` resolves after `ms`. If the signal aborts first, it rejects **promptly** with `signal.reason` and clears its timer; if the signal is already aborted, it rejects immediately.\n- `anySignal(signals)` returns a signal that aborts with the reason of the first input to abort (or right away if one already has), and removes its listeners afterwards. Write it yourself rather than calling `AbortSignal.any`.\n- `withTimeout(task, ms, { signal })` calls `task(signal)` with a signal that aborts after `ms` (reason: a `DOMException` named `\"TimeoutError\"`) or when the optional outer signal aborts. It resolves with the task's result, rejects with the abort reason **even if the task ignores its signal**, and always clears its timer.",
      "Реалізуйте три будівельні блоки скасування в `src/abortable.ts`:\n\n- `sleep(ms, { signal })` розв'язується через `ms`. Якщо сигнал скасовується раніше, вона **швидко** відхиляється з `signal.reason` і прибирає свій таймер; якщо сигнал уже скасовано, вона відхиляється одразу.\n- `anySignal(signals)` повертає сигнал, що скасовується з причиною першого скасованого вхідного сигналу (чи одразу, якщо якийсь уже скасовано), і потім видаляє своїх слухачів. Напишіть її самі, не викликаючи `AbortSignal.any`.\n- `withTimeout(task, ms, { signal })` викликає `task(signal)` із сигналом, що скасовується через `ms` (причина: `DOMException` на ім'я `\"TimeoutError\"`) або коли скасовується необов'язковий зовнішній сигнал. Вона розв'язується з результатом задачі, відхиляється з причиною скасування **навіть якщо задача ігнорує свій сигнал** і завжди прибирає свій таймер.",
    ],
    files: { "/src/abortable.ts": ABORT_STARTER, "/index.ts": ABORT_INDEX },
    visibleFiles: ["/src/abortable.ts", "/index.ts"],
    activeFile: "/src/abortable.ts",
    tests: ABORT_TESTS,
    solution: { "/src/abortable.ts": ABORT_SOLUTION },
    explanation: [
      "Each function follows the same pattern: check `aborted` up front, listen for `abort` with `{ once: true }`, and clean up on both paths (clear the timer when aborting, remove the listener when finishing), so nothing keeps running or leaks. `anySignal` forwards the first reason and detaches from the other signals, which matters when one of them is long-lived (like a page-level controller). `withTimeout` passes a combined signal into the task so it can stop its own work (fetches, nested sleeps), and also rejects on abort itself, so a task that ignores the signal can't hold the caller past the deadline.",
      "Кожна функція дотримується того самого шаблону: перевірити `aborted` на початку, слухати `abort` з `{ once: true }` і прибирати на обох шляхах (очистити таймер при скасуванні, видалити слухача при завершенні), тож ніщо не продовжує працювати й не витікає. `anySignal` передає першу причину й від'єднується від інших сигналів, і це важливо, коли один із них довгоживучий (як контролер рівня сторінки). `withTimeout` передає поєднаний сигнал у задачу, щоб вона могла зупинити власну роботу (fetch, вкладені sleep), а також сама відхиляється при скасуванні, тож задача, що ігнорує сигнал, не може затримати того, хто викликає, після крайнього терміну.",
    ],
  }),
  practice({
    slug: "cxl-concurrency-strategies",
    skills: ["async-cancellation", w("rxjs"), w("closures-scope")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["latest, exhaust and queue", "latest, exhaust і queue"],
    prompt: [
      "Implement three wrappers for async functions in `src/strategies.ts`, matching RxJS's `switchMap`, `exhaustMap` and `concatMap`:\n\n- `latest(task)`: `task` receives an `AbortSignal` first. Each call aborts the previous call's signal, and a superseded call's promise rejects with a `DOMException` named `\"AbortError\"`, even if its task ignores the signal and finishes later.\n- `exhaust(task)`: while a call is in flight, further calls don't start the task and return **the same** in-flight promise. After it settles (success or failure), the next call starts fresh.\n- `queue(task)`: calls run one at a time in call order, each getting its own result. A failed call doesn't stop the ones after it.",
      "Реалізуйте в `src/strategies.ts` три обгортки для асинхронних функцій, що відповідають `switchMap`, `exhaustMap` і `concatMap` з RxJS:\n\n- `latest(task)`: `task` першим аргументом отримує `AbortSignal`. Кожен виклик скасовує сигнал попереднього, а проміс витісненого виклику відхиляється з `DOMException` на ім'я `\"AbortError\"`, навіть якщо його задача ігнорує сигнал і завершується пізніше.\n- `exhaust(task)`: поки виклик триває, наступні виклики не запускають задачу й повертають **той самий** поточний проміс. Після його завершення (успіху чи збою) наступний виклик починає заново.\n- `queue(task)`: виклики виконуються по одному в порядку викликів, кожен отримує власний результат. Невдалий виклик не зупиняє наступні.",
    ],
    files: { "/src/strategies.ts": STRATEGY_STARTER, "/index.ts": STRATEGY_INDEX },
    visibleFiles: ["/src/strategies.ts", "/index.ts"],
    activeFile: "/src/strategies.ts",
    tests: STRATEGY_TESTS,
    solution: { "/src/strategies.ts": STRATEGY_SOLUTION },
    explanation: [
      "Each strategy is a closure holding one piece of state. `latest` keeps the current `AbortController`: a new call aborts it, and wrapping the task in a promise that also rejects on `abort` guarantees a stale result can never be delivered. `exhaust` keeps the in-flight promise and clears it in `finally`, so failures don't lock it forever. `queue` keeps a promise chain tail: each call runs after the previous one settles, and the tail swallows errors (`catch(() => {})`) so one failure doesn't reject everything after it, while each caller still gets its own rejection.",
      "Кожна стратегія є замиканням з одним елементом стану. `latest` тримає поточний `AbortController`: новий виклик скасовує його, а загортання задачі в проміс, що також відхиляється на `abort`, гарантує, що застарілий результат ніколи не буде доставлено. `exhaust` тримає поточний проміс і очищає його у `finally`, тож збої не блокують його назавжди. `queue` тримає хвіст ланцюжка промісів: кожен виклик виконується після завершення попереднього, а хвіст ковтає помилки (`catch(() => {})`), тож один збій не відхиляє все, що після нього, хоча кожен, хто викликав, усе одно отримує власне відхилення.",
    ],
  }),
]);
