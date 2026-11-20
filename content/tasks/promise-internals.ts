import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const MYPROMISE_STARTER = String.raw`type Executor = (resolve: (value?: any) => void, reject: (reason?: any) => void) => void;

/** A Promises/A+-style promise. Use queueMicrotask, not the native Promise. */
export class MyPromise {
  // TODO: callbacks run synchronously, resolve/reject can be called many times,
  // returned promises and thenables aren't adopted, executor errors escape, no finally.
  state: "pending" | "fulfilled" | "rejected" = "pending";
  value: any;
  handlers: Array<() => void> = [];

  constructor(executor: Executor) {
    const settle = (state: "fulfilled" | "rejected", value: any) => {
      this.state = state;
      this.value = value;
      this.handlers.forEach((h) => h());
    };
    executor((v) => settle("fulfilled", v), (r) => settle("rejected", r));
  }

  then(onFulfilled?: any, onRejected?: any): MyPromise {
    return new MyPromise((resolve, reject) => {
      const run = () => {
        if (this.state === "fulfilled") resolve(onFulfilled ? onFulfilled(this.value) : this.value);
        else reject(onRejected ? onRejected(this.value) : this.value);
      };
      if (this.state === "pending") this.handlers.push(run);
      else run();
    });
  }

  catch(onRejected?: any): MyPromise {
    return this.then(undefined, onRejected);
  }

  finally(onFinally?: () => unknown): MyPromise {
    return this; // TODO
  }

  static resolve(value?: any): MyPromise {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason?: any): MyPromise {
    return new MyPromise((_, reject) => reject(reason));
  }
}
`;

const MYPROMISE_SOLUTION = String.raw`type Executor = (resolve: (value?: any) => void, reject: (reason?: any) => void) => void;
type Handler = {
  onFulfilled?: (value: any) => any;
  onRejected?: (reason: any) => any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
};

export class MyPromise {
  #state: "pending" | "fulfilled" | "rejected" = "pending";
  #value: any;
  #handlers: Handler[] = [];

  constructor(executor: Executor) {
    // Only the first call to resolve/reject counts, including a resolve that's still adopting a thenable.
    let done = false;
    const resolve = (value: any) => {
      if (done) return;
      done = true;
      this.#resolve(value);
    };
    const reject = (reason: any) => {
      if (done) return;
      done = true;
      this.#settle("rejected", reason);
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  // The promise resolution procedure.
  #resolve(x: any) {
    if (x === this) {
      this.#settle("rejected", new TypeError("A promise can't be resolved with itself"));
      return;
    }
    if (x !== null && (typeof x === "object" || typeof x === "function")) {
      let then: any;
      try {
        then = x.then;
      } catch (error) {
        this.#settle("rejected", error);
        return;
      }
      if (typeof then === "function") {
        let called = false; // a thenable may call both callbacks, or call one twice
        queueMicrotask(() => {
          try {
            then.call(
              x,
              (y: any) => {
                if (called) return;
                called = true;
                this.#resolve(y);
              },
              (r: any) => {
                if (called) return;
                called = true;
                this.#settle("rejected", r);
              },
            );
          } catch (error) {
            if (!called) {
              called = true;
              this.#settle("rejected", error);
            }
          }
        });
        return;
      }
    }
    this.#settle("fulfilled", x);
  }

  #settle(state: "fulfilled" | "rejected", value: any) {
    if (this.#state !== "pending") return;
    this.#state = state;
    this.#value = value;
    const handlers = this.#handlers;
    this.#handlers = [];
    handlers.forEach((h) => this.#run(h));
  }

  #run(h: Handler) {
    // Always asynchronous, even for an already-settled promise: no Zalgo.
    queueMicrotask(() => {
      const fulfilled = this.#state === "fulfilled";
      const callback = fulfilled ? h.onFulfilled : h.onRejected;
      if (typeof callback !== "function") {
        (fulfilled ? h.resolve : h.reject)(this.#value); // pass through
        return;
      }
      try {
        h.resolve(callback(this.#value));
      } catch (error) {
        h.reject(error);
      }
    });
  }

  then(onFulfilled?: any, onRejected?: any): MyPromise {
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === "pending") this.#handlers.push(handler);
      else this.#run(handler);
    });
  }

  catch(onRejected?: any): MyPromise {
    return this.then(undefined, onRejected);
  }

  finally(onFinally?: () => unknown): MyPromise {
    return this.then(
      (value: any) => MyPromise.resolve(onFinally?.()).then(() => value),
      (reason: any) =>
        MyPromise.resolve(onFinally?.()).then(() => {
          throw reason;
        }),
    );
  }

  static resolve(value?: any): MyPromise {
    return value instanceof MyPromise ? value : new MyPromise((resolve) => resolve(value));
  }

  static reject(reason?: any): MyPromise {
    return new MyPromise((_, reject) => reject(reason));
  }
}
`;

const MYPROMISE_INDEX = String.raw`import "./styles.css";
import { MyPromise } from "./src/my-promise";

const log: string[] = [];
const show = () => {
  document.getElementById("out")!.textContent = log.join("\n");
};
document.getElementById("app")!.innerHTML = '<h1>MyPromise</h1><pre id="out"></pre>';
try {
  new MyPromise((resolve) => setTimeout(() => resolve(1), 10))
    .then((v: number) => v + 1)
    .then((v: number) => {
      log.push("value: " + v);
      show();
    });
  MyPromise.resolve("already resolved").then((v: string) => {
    log.push("then: " + v);
    show();
  });
  log.push("sync code finished");
  show();
} catch (e) {
  log.push("error: " + (e as Error).message);
  show();
}
`;

const MYPROMISE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { MyPromise } from "../src/my-promise";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Reads a MyPromise's outcome without relying on native await semantics, and never hangs.
function outcome(p, ms = 300) {
  return Promise.race([
    new Promise((res) => p.then((value) => res({ value }), (error) => res({ error }))),
    sleep(ms).then(() => ({ timeout: true })),
  ]);
}

describe("MyPromise", () => {
  it("runs the executor synchronously", () => {
    const log = [];
    new MyPromise(() => log.push("executor"));
    log.push("after");
    expect(log).toEqual(["executor", "after"]);
  });
  it("calls then callbacks asynchronously, even when already settled", async () => {
    const log = [];
    MyPromise.resolve(1).then(() => log.push("then"));
    log.push("sync");
    await sleep(0);
    expect(log).toEqual(["sync", "then"]);
  });
  it("settles only once", async () => {
    const p = new MyPromise((resolve, reject) => {
      resolve(1);
      reject(new Error("ignored"));
      resolve(2);
      throw new Error("also ignored");
    });
    expect(await outcome(p)).toEqual({ value: 1 });
  });
  it("turns executor errors into rejections", async () => {
    const result = await outcome(new MyPromise(() => { throw new Error("boom"); }));
    expect(result.error.message).toBe("boom");
  });
  it("chains values and adopts returned promises and thenables", async () => {
    const p = MyPromise.resolve(1)
      .then((x) => x + 1)
      .then((x) => new MyPromise((resolve) => setTimeout(() => resolve(x * 10), 5)))
      .then((x) => ({ then: (resolve) => resolve(x + 1) }));
    expect(await outcome(p)).toEqual({ value: 21 });
  });
  it("propagates errors to the next handler and recovers after catch", async () => {
    const p = MyPromise.reject(new Error("a"))
      .then(() => "skipped")
      .catch((e) => e.message + "!")
      .then((v) => v + "?");
    expect(await outcome(p)).toEqual({ value: "a!?" });
  });
  it("passes values and errors through missing handlers", async () => {
    expect(await outcome(MyPromise.resolve(5).then(null).then(undefined, undefined))).toEqual({ value: 5 });
    const err = new Error("x");
    expect(await outcome(MyPromise.reject(err).then((v) => v))).toEqual({ error: err });
  });
  it("rejects with a TypeError when resolved with itself", async () => {
    const p = MyPromise.resolve(1).then(() => p);
    const result = await outcome(p);
    expect(result.error).toBeInstanceOf(TypeError);
  });
  it("adopts a resolved thenable or promise, and resolve can still reject", async () => {
    expect(await outcome(new MyPromise((resolve) => resolve(MyPromise.reject("nope"))))).toEqual({ error: "nope" });
    expect(await outcome(new MyPromise((resolve) => resolve(Promise.resolve(4))))).toEqual({ value: 4 });
  });
  it("uses only the first call from a misbehaving thenable", async () => {
    const weird = { then(res, rej) { res("first"); rej(new Error("second")); res("third"); } };
    expect(await outcome(MyPromise.resolve(weird))).toEqual({ value: "first" });
  });
  it("finally runs on both outcomes and keeps the result", async () => {
    let calls = 0;
    expect(await outcome(MyPromise.resolve(1).finally(() => { calls++; return 2; }))).toEqual({ value: 1 });
    const err = new Error("e");
    expect(await outcome(MyPromise.reject(err).finally(() => { calls++; }))).toEqual({ error: err });
    expect(calls).toBe(2);
    const result = await outcome(MyPromise.resolve(1).finally(() => { throw new Error("f"); }));
    expect(result.error.message).toBe("f");
  });
  it("works with await", async () => {
    expect(await new MyPromise((resolve) => setTimeout(() => resolve("awaited"), 5))).toBe("awaited");
  });
});
`;

const PROMISIFY_STARTER = String.raw`type Callback = (err: unknown, value?: any) => void;

/** (…args, cb) style → returns a promise. */
export function promisify(fn: (...args: any[]) => void) {
  // TODO: errors are ignored and this is lost
  return (...args: any[]) => new Promise((resolve) => fn(...args, (_err: unknown, value: unknown) => resolve(value)));
}

/** Promise-returning → (…args, cb) style. The callback is always called asynchronously. */
export function callbackify(fn: (...args: any[]) => unknown) {
  // TODO: errors are swallowed, sync throws escape, this is lost
  return (...args: any[]) => {
    const cb = args.pop() as Callback;
    Promise.resolve(fn(...args)).then((value) => cb(null, value), () => {});
  };
}

/** Wraps a callback so it never runs synchronously during the call that receives it. */
export function dezalgo<A extends unknown[]>(cb: (...args: A) => void): (...args: A) => void {
  return cb; // TODO
}
`;

const PROMISIFY_SOLUTION = String.raw`type Callback = (err: unknown, value?: any) => void;

export function promisify(fn: (...args: any[]) => void) {
  return function (this: unknown, ...args: any[]) {
    // The executor catches sync throws, and a promise ignores every settle after the first.
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err: unknown, value: unknown) => (err ? reject(err) : resolve(value)));
    });
  };
}

export function callbackify(fn: (...args: any[]) => unknown) {
  return function (this: unknown, ...args: any[]) {
    const cb = args.pop() as Callback;
    // Starting from a resolved promise makes sync throws into rejections, and keeps the callback async.
    Promise.resolve()
      .then(() => fn.apply(this, args))
      .then(
        (value) => queueMicrotask(() => cb(null, value)),
        (reason) => {
          const err = reason || Object.assign(new Error("Promise was rejected with a falsy value"), { reason });
          // Calling cb outside the chain means an exception in cb isn't swallowed as a rejection.
          queueMicrotask(() => cb(err));
        },
      );
  };
}

export function dezalgo<A extends unknown[]>(cb: (...args: A) => void): (...args: A) => void {
  let sync = true;
  queueMicrotask(() => {
    sync = false;
  });
  return (...args: A) => {
    if (sync) queueMicrotask(() => cb(...args));
    else cb(...args);
  };
}
`;

const PROMISIFY_INDEX = String.raw`import "./styles.css";
import { callbackify, promisify } from "./src/promisify";

const log: string[] = [];
document.getElementById("app")!.innerHTML = '<h1>promisify</h1><pre id="out"></pre>';
const show = () => {
  document.getElementById("out")!.textContent = log.join("\n");
};

function readConfig(name: string, cb: (err: Error | null, value?: string) => void) {
  setTimeout(() => (name ? cb(null, "config for " + name) : cb(new Error("name required"))), 10);
}
const readConfigAsync = promisify(readConfig);
readConfigAsync("app").then((v) => { log.push("resolved: " + v); show(); });
readConfigAsync("").then(
  (v) => { log.push("resolved?! " + v); show(); },
  (e) => { log.push("rejected: " + (e as Error).message); show(); },
);
const legacy = callbackify(async (n: number) => n * 2);
legacy(21, (err: unknown, v: unknown) => { log.push("callback: " + String(err) + ", " + v); show(); });
`;

const PROMISIFY_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { callbackify, dezalgo, promisify } from "../src/promisify";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const settle = (p) => p.then((value) => ({ value }), (error) => ({ error }));

describe("promisify", () => {
  const div = (a, b, cb) => setTimeout(() => (b === 0 ? cb(new Error("division by zero")) : cb(null, a / b)), 1);
  it("resolves with the callback's value and rejects with its error", async () => {
    const divAsync = promisify(div);
    expect(await divAsync(6, 3)).toBe(2);
    const result = await settle(divAsync(1, 0));
    expect(result.error.message).toBe("division by zero");
  });
  it("keeps this for methods", async () => {
    const api = { prefix: "id-", get(n, cb) { cb(null, this.prefix + n); } };
    api.getAsync = promisify(api.get);
    expect(await api.getAsync(7)).toBe("id-7");
  });
  it("turns synchronous throws into rejections and ignores extra callback calls", async () => {
    const broken = promisify(() => { throw new Error("sync"); });
    expect((await settle(broken())).error.message).toBe("sync");
    const twice = promisify((cb) => { cb(null, "first"); cb(new Error("second")); });
    expect(await twice()).toBe("first");
  });
});

describe("callbackify", () => {
  it("calls back with (null, value), asynchronously", async () => {
    const log = [];
    const double = callbackify((n) => n * 2);
    double(21, (err, value) => log.push([err, value]));
    log.push("after call");
    await sleep(5);
    expect(log).toEqual(["after call", [null, 42]]);
  });
  it("passes rejections and synchronous throws as the error", async () => {
    const cb = fn();
    callbackify(async () => { throw new Error("async fail"); })(cb);
    callbackify(() => { throw new Error("sync fail"); })(cb);
    await sleep(5);
    expect(cb.mock.calls.map((c) => c[0].message).sort()).toEqual(["async fail", "sync fail"]);
  });
  it("wraps falsy rejection reasons so err is always truthy", async () => {
    const cb = fn();
    callbackify(() => Promise.reject(0))(cb);
    await sleep(5);
    const err = cb.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.reason).toBe(0);
  });
  it("keeps this", async () => {
    const obj = { n: 3, triple: callbackify(async function () { return this.n * 3; }) };
    const cb = fn();
    obj.triple(cb);
    await sleep(5);
    expect(cb).toHaveBeenCalledWith(null, 9);
  });
});

describe("dezalgo", () => {
  it("makes a sometimes-sync API consistently async", async () => {
    const cache = new Map([["a", 1]]);
    function get(key, cb) {
      const done = dezalgo(cb);
      if (cache.has(key)) return done(cache.get(key));
      setTimeout(() => done(2), 1);
    }
    const log = [];
    get("a", (v) => log.push("cached " + v));
    log.push("after cached call");
    get("b", (v) => log.push("fetched " + v));
    log.push("after fetch call");
    await sleep(10);
    expect(log).toEqual(["after cached call", "after fetch call", "cached 1", "fetched 2"]);
  });
});
`;

export default defineTasks([
  quiz(
    "pi-settle-once",
    ["promise-internals"],
    1,
    60,
    ["Settling a promise twice", "Подвійне завершення промісу"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`ok 1`", "`ok 1`"],
      ["`ok 2`", "`ok 2`"],
      ["`err x`", "`err x`"],
      ["`err y`", "`err y`"],
    ],
    "a",
    [
      "A promise settles once: the first `resolve(1)` wins, and the later `reject`, `resolve` and even the `throw` are ignored (the throw is caught by the executor wrapper and turned into a `reject` call, which does nothing now). This is one of the trust guarantees callbacks can't give you.",
      "Проміс завершується один раз: перемагає перший `resolve(1)`, а пізніші `reject`, `resolve` і навіть `throw` ігноруються (`throw` перехоплює обгортка виконавця й перетворює на виклик `reject`, що тепер нічого не робить). Це одна з гарантій довіри, яких колбеки дати не можуть.",
    ],
    { code: 'const p = new Promise((resolve, reject) => {\n  resolve(1);\n  reject(new Error("x"));\n  resolve(2);\n  throw new Error("y");\n});\np.then((v) => console.log("ok", v), (e) => console.log("err", e.message));', codeLanguage: "js" },
  ),
  quiz(
    "pi-then-passthrough",
    ["promise-internals"],
    2,
    60,
    ["Handlers that aren't functions", "Обробники, що не є функціями"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1`", "`1`"],
      ["`2`", "`2`"],
      ["`null`", "`null`"],
      ["A `TypeError`: 2 is not a function", "`TypeError`: 2 is not a function"],
    ],
    "a",
    [
      "`then` ignores arguments that aren't functions and passes the value (or rejection) through unchanged to the next promise. That's also how `catch(fn)` works: it's `then(undefined, fn)`, so fulfilled values pass through it.",
      "`then` ігнорує аргументи, що не є функціями, і передає значення (чи відхилення) далі без змін наступному промісу. Так само працює й `catch(fn)`: це `then(undefined, fn)`, тож виконані значення проходять крізь нього.",
    ],
    { code: "Promise.resolve(1)\n  .then(2)\n  .then(null)\n  .then((v) => console.log(v));", codeLanguage: "js" },
  ),
  quiz(
    "pi-then-two-args",
    ["promise-internals", w("error-handling")],
    3,
    90,
    ["`then(a, b)` vs `then(a).catch(b)`", "`then(a, b)` проти `then(a).catch(b)`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`handler B boom`", "`handler B boom`"],
      ["`handler A`", "`handler A`"],
      ["`handler A` and then `handler B boom`", "`handler A`, а потім `handler B boom`"],
      ["Nothing, and the error is unhandled", "Нічого, а помилка лишається необробленою"],
    ],
    "a",
    [
      "The second argument of `then` only handles a rejection of the promise **before** it, which was fulfilled. The error thrown inside the success handler rejects the promise **returned** by that `then`, so only the following `catch` sees it. Use `then(onOk).catch(onErr)` when errors from `onOk` should be handled too.",
      "Другий аргумент `then` обробляє лише відхилення промісу **перед** ним, а той був виконаний. Помилка, кинута в обробнику успіху, відхиляє проміс, **повернений** цим `then`, тож бачить її лише наступний `catch`. Використовуйте `then(onOk).catch(onErr)`, коли помилки з `onOk` теж треба обробити.",
    ],
    { code: 'Promise.resolve(1)\n  .then(\n    () => {\n      throw new Error("boom");\n    },\n    () => console.log("handler A"),\n  )\n  .catch((e) => console.log("handler B", e.message));', codeLanguage: "js" },
  ),
  quiz(
    "pi-resolve-rejected",
    ["promise-internals"],
    2,
    75,
    ["Resolving with a rejected promise", "Розв'язання відхиленим промісом"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`rejected: nope`", "`rejected: nope`"],
      ["`fulfilled`", "`fulfilled`"],
      ["`fulfilled` and then an unhandled rejection", "`fulfilled`, а потім необроблене відхилення"],
      ["A `TypeError`", "`TypeError`"],
    ],
    "a",
    [
      "Calling `resolve` doesn't necessarily fulfil a promise: resolving with another promise (or any thenable) makes it **adopt** that promise's outcome. Here the inner promise is rejected, so the outer one is too. \"Resolved\" means \"locked in\", not \"succeeded\".",
      "Виклик `resolve` не обов'язково виконує проміс: розв'язання іншим промісом (чи будь-яким thenable) змушує його **перейняти** результат того промісу. Тут внутрішній проміс відхилений, тож зовнішній теж. «Розв'язаний» означає «зафіксований», а не «успішний».",
    ],
    { code: 'new Promise((resolve) => resolve(Promise.reject(new Error("nope")))).then(\n  () => console.log("fulfilled"),\n  (e) => console.log("rejected:", e.message),\n);', codeLanguage: "js" },
  ),
  quiz(
    "pi-promise-resolve-identity",
    ["promise-internals"],
    2,
    75,
    ["`Promise.resolve` with a promise", "`Promise.resolve` з промісом"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true false`", "`true false`"],
      ["`false false`", "`false false`"],
      ["`true true`", "`true true`"],
      ["`false true`", "`false true`"],
    ],
    "a",
    [
      "`Promise.resolve(p)` returns `p` itself when `p` is a native promise from the same constructor, so it's cheap to normalise values. `new Promise((r) => r(p))` always creates a **new** promise that adopts `p`'s outcome, which also costs extra microtask ticks.",
      "`Promise.resolve(p)` повертає сам `p`, коли `p` є нативним промісом від того самого конструктора, тож нормалізувати значення дешево. `new Promise((r) => r(p))` завжди створює **новий** проміс, що переймає результат `p`, і це ще й коштує додаткових тактів мікрозадач.",
    ],
    { code: "const p = Promise.resolve(1);\nconst q = new Promise((r) => r(p));\nconsole.log(Promise.resolve(p) === p, q === p);", codeLanguage: "js" },
  ),
  quiz(
    "pi-thenable",
    ["promise-internals", w("event-loop")],
    3,
    90,
    ["Adopting a thenable", "Переймання thenable"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`sync end`, `then called`, `value 42`", "`sync end`, `then called`, `value 42`"],
      ["`then called`, `sync end`, `value 42`", "`then called`, `sync end`, `value 42`"],
      ["`sync end`, `value [object Object]`", "`sync end`, `value [object Object]`"],
      ["`then called`, `value 42`, `sync end`", "`then called`, `value 42`, `sync end`"],
    ],
    "a",
    [
      "Any object with a `then` method is a **thenable**, and promises adopt thenables instead of fulfilling with them. The thenable's `then` is called in a microtask (a \"resolve thenable job\"), never synchronously, so `sync end` comes first. This duck typing is what lets promises interoperate across libraries, and it's also why an object with an unrelated `then` method behaves strangely when returned from `async` functions.",
      "Будь-який об'єкт із методом `then` є **thenable**, і проміси переймають thenable замість того, щоб виконуватися з ним як значенням. `then` такого об'єкта викликається в мікрозадачі («resolve thenable job»), ніколи синхронно, тож `sync end` іде першим. Саме ця «качина типізація» дає промісам взаємодіяти між бібліотеками, і через неї ж об'єкт зі стороннім методом `then` дивно поводиться, коли його повертають з `async`-функцій.",
    ],
    { code: 'const thenable = {\n  then(resolve) {\n    console.log("then called");\n    resolve(42);\n  },\n};\nPromise.resolve(thenable).then((v) => console.log("value", v));\nconsole.log("sync end");', codeLanguage: "js" },
  ),
  quiz(
    "pi-misbehaving-thenable",
    ["promise-internals"],
    4,
    120,
    ["A thenable that calls back twice", "Thenable, що викликає колбек двічі"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`ok first`", "`ok first`"],
      ["`ok third`", "`ok third`"],
      ["`err second`", "`err second`"],
      ["`ok first` and then `err second`", "`ok first`, а потім `err second`"],
    ],
    "a",
    [
      "The resolution procedure passes a thenable a fresh pair of callbacks guarded by a shared \"called\" flag, so only the first call counts and the rest are ignored. That protects promise chains from buggy or malicious thenables, which is exactly the trust problem raw callbacks have.",
      "Процедура розв'язання передає thenable нову пару колбеків, захищених спільним прапорцем «викликано», тож рахується лише перший виклик, а решта ігнорується. Це захищає ланцюжки промісів від хибних чи зловмисних thenable, а це якраз та проблема довіри, яку мають сирі колбеки.",
    ],
    { code: 'const weird = {\n  then(resolve, reject) {\n    resolve("first");\n    reject(new Error("second"));\n    resolve("third");\n  },\n};\nPromise.resolve(weird).then((v) => console.log("ok", v), (e) => console.log("err", e.message));', codeLanguage: "js" },
  ),
  quiz(
    "pi-resolve-self",
    ["promise-internals"],
    4,
    120,
    ["A promise resolved with itself", "Проміс, розв'язаний самим собою"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`TypeError`", "`TypeError`"],
      ["Nothing: the promise stays pending forever", "Нічого: проміс назавжди лишається в очікуванні"],
      ["`RangeError`, from infinite recursion", "`RangeError` через нескінченну рекурсію"],
      ["`[object Promise]`", "`[object Promise]`"],
    ],
    "a",
    [
      "Adopting itself would mean waiting for itself forever, so the resolution procedure checks for this case first and rejects with a `TypeError` (\"Chaining cycle detected\"). The same happens when a `then` callback returns the very promise that `then` returned.",
      "Перейняти самого себе означало б чекати на себе вічно, тож процедура розв'язання спершу перевіряє цей випадок і відхиляє з `TypeError` («Chaining cycle detected»). Те саме стається, коли колбек `then` повертає той самий проміс, що повернув цей `then`.",
    ],
    { code: "let resolveIt;\nconst p = new Promise((r) => {\n  resolveIt = r;\n});\nresolveIt(p);\np.catch((e) => console.log(e.constructor.name));", codeLanguage: "js" },
  ),
  quiz(
    "pi-zalgo",
    ["promise-internals", w("async-javascript")],
    3,
    120,
    ["Releasing Zalgo", "Випускаємо Zalgo"],
    ["`getConfig` calls back synchronously on a cache hit and asynchronously on a miss. What does this print?", "`getConfig` викликає колбек синхронно, коли значення в кеші, і асинхронно, коли ні. Що виведе цей код?"],
    [
      ["`after first call, first callback, second callback, after second call`", "`after first call, first callback, second callback, after second call`"],
      ["`after first call, first callback, after second call, second callback`", "`after first call, first callback, after second call, second callback`"],
      ["`first callback, after first call, second callback, after second call`", "`first callback, after first call, second callback, after second call`"],
      ["`after first call, after second call, first callback, second callback`", "`after first call, after second call, first callback, second callback`"],
    ],
    "a",
    [
      "The same call site sees two different orders: on the first (cache miss) call the callback runs after the following line, and on the second (cache hit) call it runs before it. Code that depends on that order (for example, \"show a spinner after the call\") breaks only some of the time. Always calling back asynchronously, as promises do, removes the inconsistency.",
      "Те саме місце виклику бачить два різні порядки: під час першого виклику (промах кешу) колбек виконується після наступного рядка, а під час другого (влучання в кеш) перед ним. Код, що залежить від цього порядку (наприклад, «показати спінер після виклику»), ламається лише іноді. Завжди асинхронний виклик колбека, як у промісах, прибирає цю непослідовність.",
    ],
    {
      code: 'const cache = new Map();\nfunction getConfig(key, cb) {\n  if (cache.has(key)) return cb(cache.get(key));\n  setTimeout(() => {\n    cache.set(key, "v");\n    cb("v");\n  }, 0);\n}\nconst log = [];\ngetConfig("a", () => log.push("first callback"));\nlog.push("after first call");\nsetTimeout(() => {\n  getConfig("a", () => log.push("second callback"));\n  log.push("after second call");\n  console.log(log.join(", "));\n}, 10);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "pi-unhandled-late-catch",
    ["promise-internals", w("error-handling")],
    4,
    120,
    ["Attaching `catch` too late", "Запізніле приєднання `catch`"],
    ["This runs in Node.js with default settings. What happens?", "Код виконується в Node.js з типовими налаштуваннями. Що станеться?"],
    [
      ["The process exits with an unhandled rejection error before the timer runs, so `caught` is never printed", "Процес завершується з помилкою необробленого відхилення до спрацювання таймера, тож `caught` так і не виводиться"],
      ["`caught`", "`caught`"],
      ["A warning is printed, then `caught`", "Виводиться попередження, а потім `caught`"],
      ["Nothing: the rejection is ignored", "Нічого: відхилення ігнорується"],
    ],
    "a",
    [
      "A rejection counts as unhandled if no handler is attached once the current macrotask's microtasks have run. The `catch` is attached in a later timer, which is too late: since Node 15 the default is to treat unhandled rejections like uncaught exceptions and exit. Browsers instead fire `unhandledrejection` (and later `rejectionhandled`). Attach handlers in the same tick you create the promise.",
      "Відхилення вважається необробленим, якщо після виконання мікрозадач поточної макрозадачі обробника не приєднано. `catch` приєднується в пізнішому таймері, а це запізно: від Node 15 за замовчуванням необроблені відхилення обробляються як неперехоплені винятки, і процес завершується. Браузери натомість запускають `unhandledrejection` (а згодом `rejectionhandled`). Приєднуйте обробники в тому самому такті, в якому створюєте проміс.",
    ],
    { code: 'const p = Promise.reject(new Error("late"));\nsetTimeout(() => {\n  p.catch(() => console.log("caught"));\n}, 0);', codeLanguage: "js" },
  ),
  practice({
    slug: "pi-my-promise",
    skills: ["promise-internals", w("event-loop"), w("js-classes")],
    complexity: 5,
    estSeconds: 2400,
    framework: "vanilla-ts",
    title: ["Write a promise from scratch", "Проміс з нуля"],
    prompt: [
      "Implement `MyPromise` in `src/my-promise.ts` without using the native `Promise` (use `queueMicrotask` for async scheduling):\n\n- The executor runs synchronously, and an error it throws rejects the promise.\n- A promise settles **once**; later `resolve`/`reject` calls are ignored.\n- `then(onFulfilled, onRejected)` returns a new promise. Callbacks always run **asynchronously**, even if the promise is already settled. A handler's return value resolves the next promise; a throw rejects it. Non-function handlers pass the value or reason through.\n- **Resolution procedure**: resolving with the promise itself rejects with a `TypeError`. Resolving with a thenable (anything with a `then` method, including native promises) adopts its outcome, using only the first callback it calls.\n- `catch`, `finally` (runs on both outcomes, keeps the original result unless it throws) and static `resolve`/`reject`.\n\nYour promise must work with `await`.",
      "Реалізуйте `MyPromise` у `src/my-promise.ts` без нативного `Promise` (для асинхронного планування використовуйте `queueMicrotask`):\n\n- Виконавець запускається синхронно, а помилка, яку він кидає, відхиляє проміс.\n- Проміс завершується **один раз**; пізніші виклики `resolve`/`reject` ігноруються.\n- `then(onFulfilled, onRejected)` повертає новий проміс. Колбеки завжди виконуються **асинхронно**, навіть якщо проміс уже завершено. Значення, яке повертає обробник, розв'язує наступний проміс; виняток відхиляє його. Обробники, що не є функціями, передають значення чи причину далі.\n- **Процедура розв'язання**: розв'язання самим промісом відхиляє з `TypeError`. Розв'язання thenable (будь-чим із методом `then`, зокрема нативними промісами) переймає його результат, використовуючи лише перший колбек, який він викличе.\n- `catch`, `finally` (виконується за обох результатів і зберігає початковий результат, якщо сам не кидає помилку) і статичні `resolve`/`reject`.\n\nВаш проміс має працювати з `await`.",
    ],
    files: { "/src/my-promise.ts": MYPROMISE_STARTER, "/index.ts": MYPROMISE_INDEX },
    visibleFiles: ["/src/my-promise.ts", "/index.ts"],
    activeFile: "/src/my-promise.ts",
    tests: MYPROMISE_TESTS,
    solution: { "/src/my-promise.ts": MYPROMISE_SOLUTION },
    explanation: [
      "The core is three pieces of state (`state`, `value`, pending `handlers`) and two operations. `#settle` changes state exactly once and schedules handlers; `#resolve` implements the resolution procedure: a self-check, then reading `then` once (the getter could throw) and calling it in a microtask with callbacks guarded by a `called` flag. Each `then` creates the next promise and, when the current one settles, runs the matching handler in a microtask and feeds its result back through the same procedure, which is what makes returned promises and thenables chain. `finally` is just a `then` that runs the callback and passes the original outcome through.",
      "Основа складається з трьох частин стану (`state`, `value`, очікувані `handlers`) і двох операцій. `#settle` змінює стан рівно один раз і планує обробники; `#resolve` реалізує процедуру розв'язання: перевірка на себе, потім однократне читання `then` (гетер може кинути помилку) і його виклик у мікрозадачі з колбеками, захищеними прапорцем `called`. Кожен `then` створює наступний проміс і, коли поточний завершується, виконує відповідний обробник у мікрозадачі й передає його результат через ту саму процедуру, і саме це дає змогу зв'язувати в ланцюжки повернені проміси й thenable. `finally` є просто `then`, що виконує колбек і передає початковий результат далі.",
    ],
  }),
  practice({
    slug: "pi-promisify",
    skills: ["promise-internals", w("nodejs"), w("async-javascript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["promisify, callbackify and dezalgo", "promisify, callbackify і dezalgo"],
    prompt: [
      "Bridge callback and promise APIs in `src/promisify.ts`:\n\n- `promisify(fn)` takes a function whose last argument is an `(err, value)` callback and returns a promise-returning function. It rejects with `err`, resolves with `value`, keeps `this`, turns synchronous throws into rejections, and ignores extra callback calls.\n- `callbackify(fn)` does the opposite. It calls `cb(null, value)` or `cb(err)`, **always asynchronously**, including when `fn` throws synchronously, and keeps `this`. A falsy rejection reason (like `0`) must become an `Error` with a `reason` property, so `err` is always truthy.\n- `dezalgo(cb)` wraps a callback so that if it's invoked during the same synchronous call that created the wrapper, it's deferred to a microtask. That makes \"sometimes sync, sometimes async\" APIs consistent.",
      "Поєднайте API на колбеках і промісах у `src/promisify.ts`:\n\n- `promisify(fn)` приймає функцію, чий останній аргумент є колбеком `(err, value)`, і повертає функцію, що повертає проміс. Вона відхиляє з `err`, розв'язує з `value`, зберігає `this`, перетворює синхронні винятки на відхилення й ігнорує зайві виклики колбека.\n- `callbackify(fn)` робить протилежне. Вона викликає `cb(null, value)` чи `cb(err)` **завжди асинхронно**, зокрема коли `fn` кидає виняток синхронно, і зберігає `this`. Хибна причина відхилення (як-от `0`) має стати `Error` із властивістю `reason`, щоб `err` завжди був істинним.\n- `dezalgo(cb)` загортає колбек так, що коли його викликають під час того самого синхронного виклику, що створив обгортку, виклик відкладається в мікрозадачу. Це робить послідовними API, що «іноді синхронні, іноді асинхронні».",
    ],
    files: { "/src/promisify.ts": PROMISIFY_STARTER, "/index.ts": PROMISIFY_INDEX },
    visibleFiles: ["/src/promisify.ts", "/index.ts"],
    activeFile: "/src/promisify.ts",
    tests: PROMISIFY_TESTS,
    solution: { "/src/promisify.ts": PROMISIFY_SOLUTION },
    explanation: [
      "`promisify` gets most guarantees for free from the `Promise` constructor: the executor catches synchronous throws, and only the first settle counts. Using a regular `function` and `fn.call(this, …)` preserves method receivers. `callbackify` starts from `Promise.resolve().then(…)` so that both sync throws and rejections flow into one handler and the callback is never called synchronously; invoking `cb` via `queueMicrotask` keeps errors thrown by the callback from being swallowed as rejections. `dezalgo` flips a flag after the current synchronous run and defers any call that happens before then.",
      "`promisify` отримує більшість гарантій безкоштовно від конструктора `Promise`: виконавець перехоплює синхронні винятки, а рахується лише перше завершення. Звичайна `function` і `fn.call(this, …)` зберігають отримувача методу. `callbackify` починає з `Promise.resolve().then(…)`, тож і синхронні винятки, і відхилення потрапляють в один обробник, а колбек ніколи не викликається синхронно; виклик `cb` через `queueMicrotask` не дає помилкам, кинутим колбеком, бути проковтнутими як відхилення. `dezalgo` перемикає прапорець після поточного синхронного виконання й відкладає будь-який виклик, що стається до того.",
    ],
  }),
]);
