import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const EMITTER_STARTER = String.raw`type Listener = (...args: any[]) => void;

/** A Node.js-style EventEmitter. */
export class Emitter {
  // TODO: once, off, prependListener, error handling, max-listener warnings, removal during emit…
  private events: Record<string, Listener[]> = {};

  constructor(_options: { onWarning?: (message: string) => void } = {}) {}

  on(event: string, listener: Listener): this {
    (this.events[event] ??= []).push(listener);
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    for (const listener of this.events[event] ?? []) listener(...args);
    return true;
  }
}
`;

const EMITTER_SOLUTION = String.raw`type Listener = (...args: any[]) => void;
type Entry = { listener: Listener; once: boolean };
type EventName = string | symbol;

export class Emitter {
  // Lists are replaced, never mutated (copy-on-write), so an emit in progress keeps iterating its own snapshot.
  #events = new Map<EventName, Entry[]>();
  #maxListeners = 10;
  #warned = new Set<EventName>();
  #onWarning: (message: string) => void;

  constructor({ onWarning = (message: string) => console.warn(message) }: { onWarning?: (message: string) => void } = {}) {
    this.#onWarning = onWarning;
  }

  #add(event: EventName, listener: Listener, once: boolean, prepend: boolean): this {
    if (typeof listener !== "function") throw new TypeError("The listener must be a function");
    const list = this.#events.get(event) ?? [];
    const entry = { listener, once };
    const next = prepend ? [entry, ...list] : [...list, entry];
    this.#events.set(event, next);
    if (this.#maxListeners > 0 && next.length > this.#maxListeners && !this.#warned.has(event)) {
      this.#warned.add(event);
      this.#onWarning("Possible memory leak: " + next.length + " " + String(event) + " listeners added. Use setMaxListeners() to raise the limit.");
    }
    return this;
  }

  #remove(event: EventName, match: (entry: Entry) => boolean): boolean {
    const list = this.#events.get(event);
    if (!list) return false;
    // Node removes the most recently added matching listener.
    for (let i = list.length - 1; i >= 0; i--) {
      if (match(list[i])) {
        const next = [...list.slice(0, i), ...list.slice(i + 1)];
        if (next.length > 0) this.#events.set(event, next);
        else this.#events.delete(event);
        return true;
      }
    }
    return false;
  }

  on(event: EventName, listener: Listener): this {
    return this.#add(event, listener, false, false);
  }
  addListener(event: EventName, listener: Listener): this {
    return this.on(event, listener);
  }
  prependListener(event: EventName, listener: Listener): this {
    return this.#add(event, listener, false, true);
  }
  once(event: EventName, listener: Listener): this {
    return this.#add(event, listener, true, false);
  }
  off(event: EventName, listener: Listener): this {
    this.#remove(event, (entry) => entry.listener === listener);
    return this;
  }
  removeListener(event: EventName, listener: Listener): this {
    return this.off(event, listener);
  }
  removeAllListeners(event?: EventName): this {
    if (event === undefined) this.#events.clear();
    else this.#events.delete(event);
    return this;
  }

  emit(event: EventName, ...args: unknown[]): boolean {
    const list = this.#events.get(event);
    if (!list) {
      if (event === "error") {
        const error = args[0];
        throw error instanceof Error ? error : new Error("Unhandled error: " + String(error));
      }
      return false;
    }
    for (const entry of list) {
      // once listeners are removed before they run, so a nested emit can't call them again.
      if (entry.once) this.#remove(event, (e) => e === entry);
      entry.listener.apply(this, args);
    }
    return true;
  }

  listenerCount(event: EventName): number {
    return this.#events.get(event)?.length ?? 0;
  }
  listeners(event: EventName): Listener[] {
    return (this.#events.get(event) ?? []).map((entry) => entry.listener);
  }
  eventNames(): EventName[] {
    return [...this.#events.keys()];
  }
  setMaxListeners(n: number): this {
    this.#maxListeners = n;
    return this;
  }
}
`;

const EMITTER_INDEX = String.raw`import "./styles.css";
import { Emitter } from "./src/emitter";

const log: string[] = [];
try {
  const chat = new Emitter({ onWarning: (m) => log.push("warning: " + m) });
  chat.on("message", (from: string, text: string) => log.push(from + ": " + text));
  (chat as any).once?.("message", () => log.push("(first message!)"));
  chat.emit("message", "ada", "hello");
  chat.emit("message", "bob", "hi");
  try {
    chat.emit("error", new Error("connection lost"));
  } catch (e) {
    log.push("unhandled error thrown: " + (e as Error).message);
  }
} catch (e) {
  log.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Emitter</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = log.join("\n");
`;

const EMITTER_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { Emitter } from "../src/emitter";

const quiet = () => new Emitter({ onWarning: () => {} });

describe("Emitter basics", () => {
  it("calls listeners synchronously, in order, with arguments and this", () => {
    const e = quiet();
    const log = [];
    let self;
    e.on("x", function (a, b) { self = this; log.push("first " + a + b); });
    e.on("x", (a) => log.push("second " + a));
    log.push("before");
    expect(e.emit("x", 1, 2)).toBe(true);
    log.push("after");
    expect(log).toEqual(["before", "first 12", "second 1", "after"]);
    expect(self).toBe(e);
    expect(e.emit("nothing")).toBe(false);
  });
  it("supports prependListener and chaining", () => {
    const e = quiet();
    const log = [];
    expect(e.on("x", () => log.push("b")).prependListener("x", () => log.push("a"))).toBe(e);
    e.emit("x");
    expect(log).toEqual(["a", "b"]);
  });
  it("allows duplicates, and off removes the most recently added one", () => {
    const e = quiet();
    const f = fn();
    e.on("x", f).on("x", f);
    e.emit("x");
    expect(f).toHaveBeenCalledTimes(2);
    e.off("x", f);
    e.emit("x");
    expect(f).toHaveBeenCalledTimes(3);
    expect(e.listenerCount("x")).toBe(1);
  });
});

describe("once", () => {
  it("fires once, can be removed with the original function, and reports the original", () => {
    const e = quiet();
    const f = fn();
    e.once("x", f);
    expect(e.listeners("x")).toEqual([f]);
    e.emit("x");
    e.emit("x");
    expect(f).toHaveBeenCalledTimes(1);
    const g = fn();
    e.once("y", g);
    e.off("y", g);
    e.emit("y");
    expect(g).toHaveBeenCalledTimes(0);
  });
  it("isn't called again by a nested emit", () => {
    const e = quiet();
    let calls = 0;
    e.once("x", () => {
      calls++;
      e.emit("x");
    });
    e.emit("x");
    expect(calls).toBe(1);
  });
});

describe("changes during emit", () => {
  it("uses a snapshot: removal and addition apply from the next emit", () => {
    const e = quiet();
    const log = [];
    const b = () => log.push("b");
    e.on("x", () => {
      log.push("a");
      e.off("x", b);
      e.on("x", () => log.push("new"));
    });
    e.on("x", b);
    e.emit("x");
    expect(log).toEqual(["a", "b"]);
  });
});

describe("errors", () => {
  it("throws an unhandled error event", () => {
    const e = quiet();
    const boom = new Error("boom");
    expect(() => e.emit("error", boom)).toThrow("boom");
    expect(() => e.emit("error", "just a string")).toThrow("Unhandled error");
    e.on("error", () => {});
    expect(e.emit("error", boom)).toBe(true);
  });
  it("lets a throwing listener stop the rest and reach the caller", () => {
    const e = quiet();
    const later = fn();
    e.on("x", () => { throw new Error("listener failed"); });
    e.on("x", later);
    expect(() => e.emit("x")).toThrow("listener failed");
    expect(later).toHaveBeenCalledTimes(0);
  });
});

describe("bookkeeping", () => {
  it("warns once when an event has too many listeners", () => {
    const warnings = [];
    const e = new Emitter({ onWarning: (m) => warnings.push(m) });
    for (let i = 0; i < 12; i++) e.on("data", () => {});
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toMatch(/11/);
    const unlimited = new Emitter({ onWarning: (m) => warnings.push(m) }).setMaxListeners(0);
    for (let i = 0; i < 20; i++) unlimited.on("data", () => {});
    expect(warnings.length).toBe(1);
  });
  it("removes all listeners and lists event names", () => {
    const e = quiet();
    e.on("a", () => {}).on("b", () => {}).on("b", () => {});
    expect(e.eventNames()).toEqual(["a", "b"]);
    e.removeAllListeners("b");
    expect(e.listenerCount("b")).toBe(0);
    e.removeAllListeners();
    expect(e.eventNames()).toEqual([]);
  });
});
`;

const WAIT_STARTER = String.raw`export type WaitOptions<A extends unknown[]> = {
  signal?: AbortSignal;
  /** Milliseconds before rejecting with a DOMException named "TimeoutError". */
  timeout?: number;
  /** Only resolve for events whose arguments pass this check. */
  filter?: (...args: A) => boolean;
};

type EmitterLike = { on(event: string, fn: (...args: any[]) => void): unknown; off(event: string, fn: (...args: any[]) => void): unknown };

/**
 * Resolves the next time target emits event: with the argument array for an emitter,
 * or with the Event object for an EventTarget.
 */
export function waitFor(target: EmitterLike | EventTarget, event: string, options: WaitOptions<any[]> = {}): Promise<any> {
  // TODO: listeners are never removed, and errors, timeouts, filters and signals are ignored
  return new Promise((resolve) => {
    if ("on" in target) target.on(event, (...args: unknown[]) => resolve(args));
    else target.addEventListener(event, resolve);
  });
}
`;

const WAIT_SOLUTION = String.raw`export type WaitOptions<A extends unknown[]> = {
  signal?: AbortSignal;
  timeout?: number;
  filter?: (...args: A) => boolean;
};

type EmitterLike = { on(event: string, fn: (...args: any[]) => void): unknown; off(event: string, fn: (...args: any[]) => void): unknown };

export function waitFor(target: EmitterLike | EventTarget, event: string, { signal, timeout, filter }: WaitOptions<any[]> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const isEmitter = typeof (target as EmitterLike).on === "function";
    let timer: ReturnType<typeof setTimeout> | undefined;

    // One cleanup for every way this can end, so no listener or timer outlives the promise.
    const cleanup = () => {
      if (isEmitter) {
        (target as EmitterLike).off(event, onEvent);
        if (event !== "error") (target as EmitterLike).off("error", onError);
      } else {
        (target as EventTarget).removeEventListener(event, onEvent);
      }
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };
    const finish = (settle: () => void) => {
      cleanup();
      settle();
    };

    function onEvent(...args: any[]) {
      try {
        if (filter && !filter(...args)) return;
      } catch (error) {
        finish(() => reject(error));
        return;
      }
      finish(() => resolve(isEmitter ? args : args[0]));
    }
    function onError(error: unknown) {
      finish(() => reject(error));
    }
    function onAbort() {
      finish(() => reject(signal!.reason));
    }

    if (isEmitter) {
      (target as EmitterLike).on(event, onEvent);
      // Like events.once in Node: an "error" event rejects (unless we're waiting for "error" itself).
      if (event !== "error") (target as EmitterLike).on("error", onError);
    } else {
      (target as EventTarget).addEventListener(event, onEvent);
    }
    if (timeout !== undefined) {
      timer = setTimeout(() => finish(() => reject(new DOMException("Timed out waiting for " + event, "TimeoutError"))), timeout);
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
`;

const WAIT_INDEX = String.raw`import "./styles.css";
import { waitFor } from "./src/wait-for";

document.getElementById("app")!.innerHTML =
  '<h1>waitFor</h1><button id="ok">Click within 3 seconds</button><pre id="out"></pre>';
const out = document.getElementById("out")!;
const button = document.getElementById("ok")!;
out.textContent = "waiting…";
waitFor(button, "click", { timeout: 3000 }).then(
  (event: Event) => (out.textContent = "clicked: " + event.type),
  (error: Error) => (out.textContent = "gave up: " + error.name),
);
`;

const WAIT_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { waitFor } from "../src/wait-for";

class MiniEmitter {
  listeners = new Map();
  on(event, fn) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), fn]);
  }
  off(event, fn) {
    this.listeners.set(event, (this.listeners.get(event) ?? []).filter((f) => f !== fn));
  }
  emit(event, ...args) {
    for (const fn of this.listeners.get(event) ?? []) fn(...args);
  }
  count(event) {
    return (this.listeners.get(event) ?? []).length;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function outcome(p, ms = 400) {
  return Promise.race([p.then((value) => ({ value }), (error) => ({ error })), sleep(ms).then(() => ({ hung: true }))]);
}

describe("waitFor with an emitter", () => {
  it("resolves with the event's arguments and removes its listeners", async () => {
    const e = new MiniEmitter();
    const p = outcome(waitFor(e, "ready"));
    e.emit("ready", 42, "ok");
    expect(await p).toEqual({ value: [42, "ok"] });
    expect(e.count("ready")).toBe(0);
    expect(e.count("error")).toBe(0);
  });
  it("skips events that don't pass the filter", async () => {
    const e = new MiniEmitter();
    const p = outcome(waitFor(e, "job", { filter: (job) => job.id === 2 }));
    e.emit("job", { id: 1 });
    e.emit("job", { id: 2 });
    expect(await p).toEqual({ value: [{ id: 2 }] });
  });
  it("rejects on an error event, but can wait for the error event itself", async () => {
    const e = new MiniEmitter();
    const p = outcome(waitFor(e, "ready"));
    e.emit("error", new Error("crashed"));
    const result = await p;
    expect(result.error.message).toBe("crashed");
    expect(e.count("ready")).toBe(0);
    const q = outcome(waitFor(e, "error"));
    e.emit("error", new Error("expected"));
    expect((await q).value[0].message).toBe("expected");
  });
  it("times out with a TimeoutError and cleans up", async () => {
    const e = new MiniEmitter();
    const result = await outcome(waitFor(e, "never", { timeout: 20 }));
    expect(result.error.name).toBe("TimeoutError");
    expect(e.count("never")).toBe(0);
    expect(e.count("error")).toBe(0);
  });
  it("can be aborted, before or while waiting", async () => {
    const e = new MiniEmitter();
    const done = new AbortController();
    done.abort(new Error("already done"));
    expect((await outcome(waitFor(e, "x", { signal: done.signal }))).error.message).toBe("already done");
    const c = new AbortController();
    const p = outcome(waitFor(e, "x", { signal: c.signal }));
    c.abort(new Error("cancelled"));
    expect((await p).error.message).toBe("cancelled");
    expect(e.count("x")).toBe(0);
  });
});

describe("waitFor with an EventTarget", () => {
  it("resolves with the Event object", async () => {
    const target = new EventTarget();
    const p = outcome(waitFor(target, "login"));
    target.dispatchEvent(new CustomEvent("login", { detail: { user: "ada" } }));
    const result = await p;
    expect(result.value.detail.user).toBe("ada");
  });
  it("removes its listener after resolving", async () => {
    const target = new EventTarget();
    let calls = 0;
    const p = outcome(waitFor(target, "ping", { filter: () => (calls++, true) }));
    target.dispatchEvent(new Event("ping"));
    await p;
    target.dispatchEvent(new Event("ping"));
    expect(calls).toBe(1);
  });
});
`;

const NODE_EVENTS = 'import { EventEmitter } from "node:events";\n';

export default defineTasks([
  quiz(
    "evt-sync-dispatch",
    ["event-emitters", w("event-loop")],
    1,
    60,
    ["When do listeners run?", "Коли виконуються слухачі?"],
    ["This runs in Node.js. What does it print?", "Код виконується в Node.js. Що він виведе?"],
    [
      ["`before, listener, after`", "`before, listener, after`"],
      ["`before, after, listener`", "`before, after, listener`"],
      ["`listener, before, after`", "`listener, before, after`"],
      ["`before, after`", "`before, after`"],
    ],
    "a",
    [
      "`emit` calls every listener **synchronously**, in the order they were added, before it returns. Events are a way to decouple code, not to make it asynchronous. If listeners do slow work, the emitter waits for them; schedule work explicitly (`queueMicrotask`, `setImmediate`) when you need it deferred.",
      "`emit` викликає кожного слухача **синхронно** в порядку додавання, до свого повернення. Події є способом роз'єднати код, а не зробити його асинхронним. Якщо слухачі виконують повільну роботу, емітер чекає на них; плануйте роботу явно (`queueMicrotask`, `setImmediate`), коли її треба відкласти.",
    ],
    { code: NODE_EVENTS + 'const e = new EventEmitter();\nconst log = [];\ne.on("ping", () => log.push("listener"));\nlog.push("before");\ne.emit("ping");\nlog.push("after");\nconsole.log(log.join(", "));', codeLanguage: "js" },
  ),
  quiz(
    "evt-remove-during-emit",
    ["event-emitters"],
    3,
    90,
    ["Removing a listener during emit", "Видалення слухача під час emit"],
    ["This runs in Node.js. What does it print?", "Код виконується в Node.js. Що він виведе?"],
    [
      ["`[ 'a', 'b', 'a' ]`", "`[ 'a', 'b', 'a' ]`"],
      ["`[ 'a', 'a' ]`", "`[ 'a', 'a' ]`"],
      ["`[ 'a', 'b', 'a', 'b' ]`", "`[ 'a', 'b', 'a', 'b' ]`"],
      ["`[ 'a' ]`", "`[ 'a' ]`"],
    ],
    "a",
    [
      "`emit` iterates over a **copy** of the listener list taken when it starts, so removing `b` inside `a` doesn't affect the emit already in progress: `b` still runs once. The removal takes effect from the next emit. Adding a listener during an emit works the same way: it isn't called until the next one.",
      "`emit` перебирає **копію** списку слухачів, зроблену на початку, тож видалення `b` усередині `a` не впливає на emit, що вже триває: `b` усе одно виконується один раз. Видалення діє з наступного emit. Додавання слухача під час emit працює так само: його не викличуть до наступного разу.",
    ],
    { code: NODE_EVENTS + 'const e = new EventEmitter();\nconst log = [];\nfunction a() {\n  log.push("a");\n  e.off("x", b);\n}\nfunction b() {\n  log.push("b");\n}\ne.on("x", a);\ne.on("x", b);\ne.emit("x");\ne.emit("x");\nconsole.log(log);', codeLanguage: "js" },
  ),
  quiz(
    "evt-once-off",
    ["event-emitters"],
    3,
    75,
    ["Removing a `once` listener", "Видалення слухача `once`"],
    ["This runs in Node.js. What does it print?", "Код виконується в Node.js. Що він виведе?"],
    [
      ["`0 0`", "`0 0`"],
      ["`1 0`", "`1 0`"],
      ["`0 1`", "`0 1`"],
      ["`1 1`", "`1 1`"],
    ],
    "a",
    [
      "`once` registers a wrapper that removes itself before calling your function, but the emitter remembers the original, so `off(event, fn)` with the function you passed still finds and removes it. Custom emitters often get this wrong by storing only the wrapper, which leaves no way to cancel a pending `once`.",
      "`once` реєструє обгортку, що видаляє себе перед викликом вашої функції, але емітер пам'ятає оригінал, тож `off(event, fn)` з переданою функцією все одно знаходить і видаляє її. Власні емітери часто роблять це неправильно, зберігаючи лише обгортку, і тоді скасувати `once`, що очікує, неможливо.",
    ],
    { code: NODE_EVENTS + 'const e = new EventEmitter();\nconst log = [];\nconst fn = () => log.push("fired");\ne.once("x", fn);\ne.off("x", fn);\ne.emit("x");\nconsole.log(log.length, e.listenerCount("x"));', codeLanguage: "js" },
  ),
  quiz(
    "evt-error-event",
    ["event-emitters", w("error-handling")],
    2,
    75,
    ["The special `error` event", "Особлива подія `error`"],
    ["This runs in Node.js. What does it print?", "Код виконується в Node.js. Що він виведе?"],
    [
      ["`false thrown: boom`", "`false thrown: boom`"],
      ["`false false`", "`false false`"],
      ["`true thrown: boom`", "`true thrown: boom`"],
      ["`thrown: other thrown: boom`", "`thrown: other thrown: boom`"],
    ],
    "a",
    [
      "Emitting an event nobody listens to just returns `false`, except for `\"error\"`: with no `\"error\"` listener, `emit` **throws** the error. In a stream or socket that throw happens asynchronously, outside any `try/catch`, and crashes the process. Always attach an `\"error\"` handler to streams, sockets, child processes and other emitters.",
      "Випромінення події, яку ніхто не слухає, просто повертає `false`, крім `\"error\"`: без слухача `\"error\"` `emit` **кидає** помилку. У потоці чи сокеті це стається асинхронно, поза будь-яким `try/catch`, і аварійно завершує процес. Завжди додавайте обробник `\"error\"` потокам, сокетам, дочірнім процесам та іншим емітерам.",
    ],
    { code: NODE_EVENTS + 'const e = new EventEmitter();\nconst out = [e.emit("other", new Error("other"))];\ntry {\n  e.emit("error", new Error("boom"));\n} catch (err) {\n  out.push("thrown: " + err.message);\n}\nconsole.log(out.join(" "));', codeLanguage: "js" },
  ),
  quiz(
    "evt-listener-throws",
    ["event-emitters", w("error-handling")],
    3,
    90,
    ["A listener that throws", "Слухач, що кидає помилку"],
    ["This runs in Node.js. What does it print?", "Код виконується в Node.js. Що він виведе?"],
    [
      ["`[ 'caught first failed' ]`", "`[ 'caught first failed' ]`"],
      ["`[ 'second', 'caught first failed' ]`", "`[ 'second', 'caught first failed' ]`"],
      ["`[ 'second' ]`", "`[ 'second' ]`"],
      ["The process crashes", "Процес аварійно завершується"],
    ],
    "a",
    [
      "Because dispatch is synchronous, an exception in one listener propagates straight out of `emit` to its caller, and the listeners after it **never run**. One subscriber can break all the others. If listeners are independent, wrap each one in `try/catch` (or have the emitter do it). The DOM's `EventTarget` behaves differently: it reports the error and keeps calling the other listeners.",
      "Оскільки доставка синхронна, виняток в одному слухачі виходить прямо з `emit` до того, хто його викликав, а слухачі після нього **ніколи не виконуються**. Один підписник може зламати всіх інших. Якщо слухачі незалежні, загорніть кожного в `try/catch` (або доручіть це емітеру). `EventTarget` у DOM поводиться інакше: він повідомляє про помилку й продовжує викликати інших слухачів.",
    ],
    { code: NODE_EVENTS + 'const e = new EventEmitter();\nconst log = [];\ne.on("x", () => {\n  throw new Error("first failed");\n});\ne.on("x", () => log.push("second"));\ntry {\n  e.emit("x");\n} catch (err) {\n  log.push("caught " + err.message);\n}\nconsole.log(log);', codeLanguage: "js" },
  ),
  quiz(
    "evt-duplicates",
    ["event-emitters", w("dom-events")],
    2,
    75,
    ["Adding the same listener twice", "Подвійне додавання того самого слухача"],
    ["This runs in Node.js. What does it print?", "Код виконується в Node.js. Що він виведе?"],
    [
      ["`2 1`", "`2 1`"],
      ["`1 1`", "`1 1`"],
      ["`2 2`", "`2 2`"],
      ["`1 2`", "`1 2`"],
    ],
    "a",
    [
      "`EventEmitter` keeps a plain list, so the same function added twice is called twice. `EventTarget` ignores a second `addEventListener` with the same type, function and capture flag. Knowing which semantics you have matters when components subscribe in a render or effect that runs more than once.",
      "`EventEmitter` тримає звичайний список, тож та сама функція, додана двічі, викликається двічі. `EventTarget` ігнорує повторний `addEventListener` з тим самим типом, функцією й прапорцем capture. Знати, яка семантика у вас, важливо, коли компоненти підписуються в рендері чи ефекті, що виконується не раз.",
    ],
    { code: NODE_EVENTS + 'const e = new EventEmitter();\nconst t = new EventTarget();\nlet n1 = 0;\nlet n2 = 0;\nconst f1 = () => n1++;\nconst f2 = () => n2++;\ne.on("x", f1);\ne.on("x", f1);\nt.addEventListener("x", f2);\nt.addEventListener("x", f2);\ne.emit("x");\nt.dispatchEvent(new Event("x"));\nconsole.log(n1, n2);', codeLanguage: "js" },
  ),
  quiz(
    "evt-custom-event",
    ["event-emitters", w("dom-events")],
    2,
    60,
    ["Sending data with `CustomEvent`", "Передавання даних через `CustomEvent`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`ada true`", "`ada true`"],
      ["`undefined true`", "`undefined true`"],
      ["`ada false`", "`ada false`"],
      ["Nothing: custom event names aren't allowed", "Нічого: власні назви подій заборонені"],
    ],
    "a",
    [
      "`EventTarget` delivers `Event` objects, and `CustomEvent` is the standard way to attach data, in its `detail` property. Any class can extend `EventTarget` to become an event source, in browsers and in Node, without a library. Custom events on DOM elements can also bubble if you pass `bubbles: true`.",
      "`EventTarget` доставляє об'єкти `Event`, а `CustomEvent` є стандартним способом додати дані у властивості `detail`. Будь-який клас може розширити `EventTarget` і стати джерелом подій, у браузерах і в Node, без бібліотек. Власні події на елементах DOM також можуть спливати, якщо передати `bubbles: true`.",
    ],
    { code: 'const target = new EventTarget();\ntarget.addEventListener("login", (event) => console.log(event.detail.user, event instanceof Event));\ntarget.dispatchEvent(new CustomEvent("login", { detail: { user: "ada" } }));', codeLanguage: "js" },
  ),
  quiz(
    "evt-events-once",
    ["event-emitters", w("promise-internals")],
    3,
    75,
    ["Awaiting an event", "Очікування події"],
    ["This runs in Node.js. What does it print?", "Код виконується в Node.js. Що він виведе?"],
    [
      ["`[ 42, 'ok' ]`", "`[ 42, 'ok' ]`"],
      ["`42`", "`42`"],
      ["`[ 42 ]`", "`[ 42 ]`"],
      ["Nothing: it waits forever", "Нічого: очікування триває вічно"],
    ],
    "a",
    [
      "`events.once(emitter, name)` returns a promise that resolves with an **array** of the event's arguments (since events can carry several), and removes its listener afterwards. It also rejects if the emitter emits `\"error\"` first, and accepts `{ signal }` for cancellation. It's the idiomatic way to wait for `\"ready\"`, `\"listening\"` or `\"close\"` with `await`.",
      "`events.once(emitter, name)` повертає проміс, що розв'язується **масивом** аргументів події (бо подія може нести кілька) і потім видаляє свого слухача. Він також відхиляється, якщо емітер спершу випромінює `\"error\"`, і приймає `{ signal }` для скасування. Це ідіоматичний спосіб чекати на `\"ready\"`, `\"listening\"` чи `\"close\"` через `await`.",
    ],
    { code: 'import { EventEmitter, once } from "node:events";\nconst e = new EventEmitter();\nsetTimeout(() => e.emit("ready", 42, "ok"), 5);\nconsole.log(await once(e, "ready"));', codeLanguage: "js" },
  ),
  quiz(
    "evt-max-listeners",
    ["event-emitters", w("js-engine-performance")],
    3,
    90,
    ["MaxListenersExceededWarning", "MaxListenersExceededWarning"],
    [
      "A Node service logs `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added to [Socket]`. What does it most likely mean?",
      "Сервіс на Node записує в журнал `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added to [Socket]`. Що це найімовірніше означає?",
    ],
    [
      ["Code adds a `close` listener repeatedly (for example per request or per retry) without removing it, so listeners and their closures pile up", "Код раз у раз додає слухача `close` (наприклад, на кожен запит чи повтор), не видаляючи його, тож слухачі та їхні замикання накопичуються"],
      ["The socket has closed 11 times", "Сокет закривався 11 разів"],
      ["Node refuses to add more than 10 listeners, so the 11th was dropped", "Node відмовляється додавати понад 10 слухачів, тож 11-й відкинуто"],
      ["The garbage collector is running too often", "Збирач сміття запускається надто часто"],
    ],
    "a",
    [
      "The default limit of 10 listeners per event is a heuristic leak detector: the 11th listener is still added, but Node warns, because the usual cause is subscribing in a loop or per operation and never unsubscribing. Each forgotten listener keeps its closure (and whatever it captured) alive. Fix the subscription lifecycle; only raise the limit with `setMaxListeners` when many listeners are genuinely intended.",
      "Типове обмеження в 10 слухачів на подію є евристичним детектором витоків: 11-й слухач усе одно додається, але Node попереджає, бо зазвичай причина в підписці в циклі чи на кожну операцію без відписки. Кожен забутий слухач тримає живим своє замикання (і все, що воно захопило). Виправте життєвий цикл підписки; підвищуйте обмеження через `setMaxListeners`, лише коли багато слухачів справді задумано.",
    ],
  ),
  quiz(
    "evt-global-bus",
    ["event-emitters", w("state-management")],
    2,
    75,
    ["The global event bus", "Глобальна шина подій"],
    ["A team routes most interactions through a global event bus: components emit strings like `\"cart:updated\"` and others listen. What's the main long-term risk?", "Команда пропускає більшість взаємодій через глобальну шину подій: компоненти випромінюють рядки на кшталт `\"cart:updated\"`, а інші слухають. Який головний довгостроковий ризик?"],
    [
      ["Hidden coupling: it's hard to see who reacts to what or in which order, typos fail silently, and forgotten listeners leak", "Прихований зв'язок: важко побачити, хто на що реагує і в якому порядку, одруки мовчки не спрацьовують, а забуті слухачі спричиняють витоки"],
      ["Events are slower than function calls by orders of magnitude", "Події на порядки повільніші за виклики функцій"],
      ["Browsers limit the number of custom events", "Браузери обмежують кількість власних подій"],
      ["Event buses can't be used with TypeScript", "Шини подій не можна використовувати з TypeScript"],
    ],
    "a",
    [
      "Pub/sub decouples senders from receivers, which is great at true boundaries (plugins, cross-cutting concerns like analytics). Used for core data flow, it makes behaviour hard to trace: there's no call graph, listeners depend on emit order, a misspelled event name never fires, and nobody unsubscribes. Typed event maps help; for shared state, a store with explicit actions or direct calls is usually clearer.",
      "Pub/sub роз'єднує відправників і отримувачів, і це чудово на справжніх межах (плагіни, наскрізні задачі на кшталт аналітики). Для основного потоку даних воно ускладнює відстеження поведінки: графа викликів немає, слухачі залежать від порядку emit, подія з одруком у назві ніколи не спрацьовує, а відписуватися ніхто не відписується. Типізовані мапи подій допомагають; для спільного стану сховище з явними діями чи прямі виклики зазвичай зрозуміліші.",
    ],
  ),
  practice({
    slug: "evt-node-emitter",
    skills: ["event-emitters", w("js-classes"), w("nodejs")],
    complexity: 4,
    estSeconds: 1800,
    framework: "vanilla-ts",
    title: ["Rebuild Node's EventEmitter", "Відтворіть EventEmitter з Node"],
    prompt: [
      "Implement `Emitter` in `src/emitter.ts` with Node's semantics:\n\n- `on`/`addListener`, `prependListener`, `once`, and `off`/`removeListener` return `this` for chaining. The same function can be added twice; `off` removes the **most recently added** match.\n- `emit(event, ...args)` calls listeners synchronously in order, with `this` = the emitter, and returns whether there were listeners. It iterates a **snapshot**: listeners removed or added during an emit only take effect from the next emit.\n- `once` listeners are removed **before** they run (so a nested emit can't call them again), `off(event, original)` can remove them, and `listeners(event)` returns the original functions.\n- Emitting `\"error\"` with no listener throws the error (non-`Error` values are wrapped in an `Error` whose message starts with `\"Unhandled error\"`). A throwing listener stops the remaining ones and propagates.\n- When an event gets more than `maxListeners` (default 10) listeners, call `onWarning(message)` **once** for that event, with the count in the message; `setMaxListeners(0)` disables it.\n- `listenerCount`, `listeners`, `eventNames` and `removeAllListeners(event?)`.",
      "Реалізуйте `Emitter` у `src/emitter.ts` із семантикою Node:\n\n- `on`/`addListener`, `prependListener`, `once` і `off`/`removeListener` повертають `this` для ланцюжків викликів. Ту саму функцію можна додати двічі; `off` видаляє **останню додану** відповідність.\n- `emit(event, ...args)` викликає слухачів синхронно по порядку з `this` = емітер і повертає, чи були слухачі. Він перебирає **знімок**: слухачі, видалені чи додані під час emit, діють лише з наступного emit.\n- Слухачі `once` видаляються **до** свого виконання (тож вкладений emit не може викликати їх знову), `off(event, original)` може їх видалити, а `listeners(event)` повертає початкові функції.\n- Випромінення `\"error\"` без слухача кидає помилку (значення, що не є `Error`, загортаються в `Error`, чиє повідомлення починається з `\"Unhandled error\"`). Слухач, що кидає помилку, зупиняє решту, і помилка йде далі.\n- Коли подія отримує понад `maxListeners` (за замовчуванням 10) слухачів, викличте `onWarning(message)` **один раз** для цієї події з кількістю в повідомленні; `setMaxListeners(0)` вимикає це.\n- `listenerCount`, `listeners`, `eventNames` і `removeAllListeners(event?)`.",
    ],
    files: { "/src/emitter.ts": EMITTER_STARTER, "/index.ts": EMITTER_INDEX },
    visibleFiles: ["/src/emitter.ts", "/index.ts"],
    activeFile: "/src/emitter.ts",
    tests: EMITTER_TESTS,
    solution: { "/src/emitter.ts": EMITTER_SOLUTION },
    explanation: [
      "Storing each event's listeners in an array that's **replaced, never mutated** (copy-on-write) gives snapshot semantics for free: `emit` iterates the array it read at the start, while `on`/`off` install new arrays. Each entry keeps the original function plus a `once` flag instead of a wrapper function, so `off(original)` and `listeners()` behave like Node, and removing the specific entry before calling it makes `once` safe against re-entrant emits. The `\"error\"` rule and the one-time leak warning are small checks with large practical value in Node services.",
      "Зберігання слухачів кожної події в масиві, що **замінюється, а не змінюється** (copy-on-write), безкоштовно дає семантику знімка: `emit` перебирає масив, прочитаний на початку, а `on`/`off` встановлюють нові масиви. Кожен запис зберігає початкову функцію й прапорець `once` замість функції-обгортки, тож `off(original)` і `listeners()` поводяться як у Node, а видалення конкретного запису перед викликом робить `once` безпечним щодо повторних вкладених emit. Правило `\"error\"` і одноразове попередження про витік є невеликими перевірками з великою практичною цінністю в сервісах на Node.",
    ],
  }),
  practice({
    slug: "evt-wait-for",
    skills: ["event-emitters", w("async-cancellation"), w("promise-internals")],
    complexity: 3,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Turn an event into a promise", "Перетворіть подію на проміс"],
    prompt: [
      "Implement `waitFor(target, event, { signal, timeout, filter })` in `src/wait-for.ts`, like Node's `events.once` but for both kinds of event sources:\n\n- With an emitter (an object with `on`/`off`), resolve with the **array of arguments**. With an `EventTarget`, resolve with the `Event` object.\n- `filter(...args)` lets matching events through and ignores the rest; if `filter` throws, reject with that error.\n- For emitters, an `\"error\"` event rejects the promise (unless you're waiting for `\"error\"` itself).\n- `timeout` rejects with a `DOMException` named `\"TimeoutError\"`. `signal` rejects with its reason, immediately if it's already aborted.\n- However it ends, remove **every** listener you added and clear the timer.",
      "Реалізуйте `waitFor(target, event, { signal, timeout, filter })` у `src/wait-for.ts`, як `events.once` у Node, але для обох видів джерел подій:\n\n- З емітером (об'єктом з `on`/`off`) розв'язуйте **масивом аргументів**. З `EventTarget` розв'язуйте об'єктом `Event`.\n- `filter(...args)` пропускає події, що підходять, і ігнорує решту; якщо `filter` кидає помилку, відхиляйте з нею.\n- Для емітерів подія `\"error\"` відхиляє проміс (якщо ви не чекаєте саме на `\"error\"`).\n- `timeout` відхиляє з `DOMException` на ім'я `\"TimeoutError\"`. `signal` відхиляє з його причиною, одразу, якщо він уже скасований.\n- Хоч би як усе закінчилося, видаліть **кожного** доданого слухача й очистіть таймер.",
    ],
    files: { "/src/wait-for.ts": WAIT_STARTER, "/index.ts": WAIT_INDEX },
    visibleFiles: ["/src/wait-for.ts", "/index.ts"],
    activeFile: "/src/wait-for.ts",
    tests: WAIT_TESTS,
    solution: { "/src/wait-for.ts": WAIT_SOLUTION },
    explanation: [
      "A promise can only settle once, but the listeners, the error listener, the timer and the abort listener all keep running unless you remove them, so the heart of the solution is a single `cleanup` that every exit path calls before settling. Without it, each call leaks listeners (exactly what the max-listeners warning catches) and stray timers. Detecting the source type by its API (`on` vs `addEventListener`) lets one helper serve Node emitters, DOM elements, `WebSocket`s and `AbortSignal`s alike.",
      "Проміс може завершитися лише один раз, але слухачі, слухач помилок, таймер і слухач скасування продовжують працювати, якщо їх не видалити, тож серцем розв'язку є одна функція `cleanup`, яку кожен шлях виходу викликає перед завершенням. Без неї кожен виклик спричиняє витік слухачів (саме це ловить попередження про кількість слухачів) і залишає зайві таймери. Визначення типу джерела за його API (`on` проти `addEventListener`) дає одному помічнику обслуговувати емітери Node, елементи DOM, `WebSocket` і `AbortSignal`.",
    ],
  }),
]);
