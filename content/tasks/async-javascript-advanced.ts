import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const COMBINATORS_STARTER = String.raw`/** Like Promise.all: resolves with all values in input order, rejects on the first rejection. */
export function promiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
  // TODO (without using the built-in Promise combinators)
  return Promise.resolve([]);
}

/** Like Promise.allSettled: never rejects; reports each outcome in input order. */
export function promiseAllSettled<T>(values: Iterable<T | PromiseLike<T>>): Promise<PromiseSettledResult<Awaited<T>>[]> {
  // TODO
  return Promise.resolve([]);
}

/** Like Promise.any: resolves with the first fulfilled value; rejects with an AggregateError if all reject. */
export function promiseAny<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>> {
  // TODO
  return Promise.reject(new Error("not implemented"));
}
`;

const COMBINATORS_SOLUTION = String.raw`export function promiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
  return new Promise((resolve, reject) => {
    const items = Array.from(values);
    const results = new Array<Awaited<T>>(items.length);
    let remaining = items.length;
    if (remaining === 0) return resolve(results);
    items.forEach((item, i) => {
      // Promise.resolve also accepts plain values and foreign thenables.
      Promise.resolve(item).then((value) => {
        results[i] = value as Awaited<T>; // store by index: settle order doesn't matter
        if (--remaining === 0) resolve(results);
      }, reject); // the first rejection wins; later calls to reject are ignored
    });
  });
}

export function promiseAllSettled<T>(values: Iterable<T | PromiseLike<T>>): Promise<PromiseSettledResult<Awaited<T>>[]> {
  return promiseAll(
    Array.from(values, (item) =>
      Promise.resolve(item).then(
        (value): PromiseSettledResult<Awaited<T>> => ({ status: "fulfilled", value: value as Awaited<T> }),
        (reason): PromiseSettledResult<Awaited<T>> => ({ status: "rejected", reason }),
      ),
    ),
  );
}

export function promiseAny<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>> {
  return new Promise((resolve, reject) => {
    const items = Array.from(values);
    const errors: unknown[] = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) return reject(new AggregateError([], "All promises were rejected"));
    items.forEach((item, i) => {
      Promise.resolve(item).then(
        (value) => resolve(value as Awaited<T>),
        (error) => {
          errors[i] = error;
          if (--remaining === 0) reject(new AggregateError(errors, "All promises were rejected"));
        },
      );
    });
  });
}
`;

const COMBINATORS_INDEX = String.raw`import "./styles.css";
import { promiseAll } from "./src/combinators";

const delay = <T,>(ms: number, value: T) => new Promise<T>((r) => setTimeout(() => r(value), ms));
promiseAll([delay(30, "slow"), delay(5, "fast"), "plain"]).then((values) => {
  document.getElementById("app")!.innerHTML = '<h1>promiseAll</h1><p>Result: <output id="result">' + values.join(", ") + "</output></p>";
});
`;

const COMBINATORS_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { promiseAll, promiseAllSettled, promiseAny } from "../src/combinators";

const delay = (ms, value, fail = false) => {
  const p = new Promise((res, rej) => setTimeout(() => (fail ? rej(value) : res(value)), ms));
  p.catch(() => {}); // marks the rejection as handled even if an implementation ignores the promise
  return p;
};

// Run fn with the built-in combinators disabled, so they can't be used.
async function withoutBuiltIns(fn) {
  const saved = { all: Promise.all, allSettled: Promise.allSettled, any: Promise.any, race: Promise.race };
  const banned = () => { throw new Error("Built-in combinators are off limits"); };
  Object.assign(Promise, { all: banned, allSettled: banned, any: banned, race: banned });
  try {
    return await fn();
  } finally {
    Object.assign(Promise, saved);
  }
}

describe("promiseAll", () => {
  it("keeps input order even when promises settle out of order", async () => {
    const out = await withoutBuiltIns(() => promiseAll([delay(20, "a"), delay(5, "b"), "c"]));
    expect(out).toEqual(["a", "b", "c"]);
  });
  it("resolves an empty input with an empty array", async () => {
    expect(await withoutBuiltIns(() => promiseAll([]))).toEqual([]);
  });
  it("rejects as soon as one input rejects", async () => {
    let slowDone = false;
    const slow = delay(60, "slow").then((v) => { slowDone = true; return v; });
    let error = null;
    try {
      await withoutBuiltIns(() => promiseAll([slow, delay(5, new Error("boom"), true)]));
    } catch (e) {
      error = e;
    }
    expect(error && error.message).toBe("boom");
    expect(slowDone).toBe(false);
  });
  it("accepts any iterable", async () => {
    function* gen() { yield 1; yield Promise.resolve(2); }
    expect(await withoutBuiltIns(() => promiseAll(gen()))).toEqual([1, 2]);
    expect(await withoutBuiltIns(() => promiseAll(new Set([3])))).toEqual([3]);
  });
});

describe("promiseAllSettled", () => {
  it("reports every outcome in order and never rejects", async () => {
    const out = await withoutBuiltIns(() => promiseAllSettled([delay(10, 1), delay(1, "bad", true), 3]));
    expect(out).toEqual([
      { status: "fulfilled", value: 1 },
      { status: "rejected", reason: "bad" },
      { status: "fulfilled", value: 3 },
    ]);
  });
});

describe("promiseAny", () => {
  it("resolves with the first fulfilled value, ignoring rejections", async () => {
    const out = await withoutBuiltIns(() => promiseAny([delay(1, "x", true), delay(20, "slow"), delay(5, "fast")]));
    expect(out).toBe("fast");
  });
  it("rejects with an AggregateError listing errors in input order", async () => {
    let error = null;
    try {
      await withoutBuiltIns(() => promiseAny([delay(10, "e1", true), delay(1, "e2", true)]));
    } catch (e) {
      error = e;
    }
    expect(error instanceof AggregateError).toBe(true);
    expect(error.errors).toEqual(["e1", "e2"]);
  });
  it("rejects an empty input", async () => {
    await expect(withoutBuiltIns(() => promiseAny([]))).rejects.toThrow(AggregateError);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("slow, fast, plain")).id).toBe("result");
  });
});
`;

const MUTEX_STARTER = String.raw`export interface Mutex {
  /** Runs fn when no other task holds the lock; resolves or rejects with fn's result. */
  runExclusive<T>(fn: () => T | Promise<T>): Promise<T>;
  /** True while a task is running. */
  readonly locked: boolean;
  /** Tasks waiting for their turn (not counting the running one). */
  readonly pending: number;
}

export function createMutex(): Mutex {
  return {
    // TODO: tasks currently run concurrently
    runExclusive: async (fn) => fn(),
    locked: false,
    pending: 0,
  };
}
`;

const MUTEX_SOLUTION = String.raw`export interface Mutex {
  runExclusive<T>(fn: () => T | Promise<T>): Promise<T>;
  readonly locked: boolean;
  readonly pending: number;
}

export function createMutex(): Mutex {
  // Each task chains onto the previous one, so they run strictly one after another.
  let tail: Promise<unknown> = Promise.resolve();
  let running = false;
  let waiting = 0;

  return {
    get locked() {
      return running;
    },
    get pending() {
      return waiting;
    },
    runExclusive<T>(fn: () => T | Promise<T>): Promise<T> {
      waiting++;
      const result = tail.then(async () => {
        waiting--;
        running = true;
        try {
          return await fn();
        } finally {
          running = false;
        }
      });
      // A failure must not block the queue: later tasks wait for completion, not success.
      tail = result.catch(() => undefined);
      return result;
    },
  };
}
`;

const MUTEX_INDEX = String.raw`import "./styles.css";
import { createMutex } from "./src/mutex";

let balance = 100;
const read = async () => { await new Promise((r) => setTimeout(r, 5)); return balance; };
const write = async (value: number) => { await new Promise((r) => setTimeout(r, 5)); balance = value; };

const lock = createMutex();
const deposit = (amount: number) => lock.runExclusive(async () => write((await read()) + amount));

Promise.all([deposit(10), deposit(20)]).then(() => {
  document.getElementById("app")!.innerHTML = '<h1>Deposits</h1><p>Balance: <output id="balance">' + balance + "</output></p>";
});
`;

const MUTEX_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { createMutex } from "../src/mutex";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe("createMutex", () => {
  it("runs one task at a time, in call order", async () => {
    const lock = createMutex();
    let active = 0;
    let maxActive = 0;
    const started = [];
    const task = (name, ms) => lock.runExclusive(async () => {
      started.push(name);
      active++;
      maxActive = Math.max(maxActive, active);
      await sleep(ms);
      active--;
      return name;
    });
    const results = await Promise.all([task("a", 15), task("b", 1), task("c", 5)]);
    expect(maxActive).toBe(1);
    expect(started).toEqual(["a", "b", "c"]);
    expect(results).toEqual(["a", "b", "c"]);
  });
  it("supports synchronous functions", async () => {
    const lock = createMutex();
    expect(await lock.runExclusive(() => 42)).toBe(42);
  });
  it("rejects a failing task's own call but keeps running later tasks", async () => {
    const lock = createMutex();
    const failing = lock.runExclusive(async () => { throw new Error("nope"); });
    const next = lock.runExclusive(async () => "still runs");
    await expect(failing).rejects.toThrow("nope");
    expect(await next).toBe("still runs");
  });
  it("reports locked and pending", async () => {
    const lock = createMutex();
    const seen = [];
    const t1 = lock.runExclusive(async () => { seen.push([lock.locked, lock.pending]); await sleep(5); });
    const t2 = lock.runExclusive(async () => {});
    const t3 = lock.runExclusive(async () => {});
    expect(lock.pending).toBe(3);
    await Promise.all([t1, t2, t3]);
    expect(seen).toEqual([[true, 2]]);
    expect(lock.locked).toBe(false);
    expect(lock.pending).toBe(0);
  });
  it("prevents lost updates in read-modify-write code", async () => {
    let balance = 100;
    const lock = createMutex();
    const deposit = (amount) => lock.runExclusive(async () => {
      const current = balance;
      await sleep(2);
      balance = current + amount;
    });
    await Promise.all([deposit(10), deposit(20), deposit(30)]);
    expect(balance).toBe(160);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("130")).id).toBe("balance");
  });
});
`;

export default defineTasks([
  quiz(
    "async-fn-returns-promise",
    ["async-javascript"],
    1,
    45,
    ["What an async function returns", "Що повертає async-функція"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true object`", "`true object`"],
      ["`false number`", "`false number`"],
      ["`true number`", "`true number`"],
      ["`false object`", "`false object`"],
    ],
    "a",
    [
      "An `async` function always returns a promise. A returned value (`42`) becomes the fulfilment value, and a thrown error becomes a rejection. To get `42`, the caller must `await getAnswer()` or use `.then`.",
      "`async`-функція завжди повертає проміс. Повернене значення (`42`) стає значенням виконання, а кинута помилка стає відхиленням. Щоб отримати `42`, викликач має написати `await getAnswer()` або використати `.then`.",
    ],
    { code: "async function getAnswer() {\n  return 42;\n}\nconst result = getAnswer();\nconsole.log(result instanceof Promise, typeof result);", codeLanguage: "js" },
  ),
  quiz(
    "async-missing-return",
    ["async-javascript"],
    2,
    90,
    ["A broken chain", "Розірваний ланцюжок"],
    ["What does this print, and why?", "Що виведе цей код і чому?"],
    [
      ["`undefined`: the first callback doesn't return the promise, so the chain doesn't wait for it", "`undefined`: перший колбек не повертає проміс, тож ланцюжок на нього не чекає"],
      ["`[\"post\"]` after 10 ms", "`[\"post\"]` через 10 мс"],
      ["A `TypeError`, because `fetchPosts` returns a promise", "`TypeError`, бо `fetchPosts` повертає проміс"],
      ["Nothing: the second `then` never runs", "Нічого: другий `then` ніколи не виконається"],
    ],
    "a",
    [
      "A `then` callback's **return value** becomes the next step's input. With braces and no `return`, the callback returns `undefined`, so the next `then` runs immediately with `undefined` while `fetchPosts` continues unobserved (and its errors go unhandled). Write `.then((user) => fetchPosts(user.id))` or use `async`/`await`.",
      "**Повернене значення** колбека `then` стає вхідним для наступного кроку. З фігурними дужками й без `return` колбек повертає `undefined`, тож наступний `then` виконується одразу з `undefined`, а `fetchPosts` працює далі без нагляду (і його помилки лишаються необробленими). Пишіть `.then((user) => fetchPosts(user.id))` або використовуйте `async`/`await`.",
    ],
    {
      code: 'const fetchUser = () => Promise.resolve({ id: 1 });\nconst fetchPosts = (id) => new Promise((r) => setTimeout(() => r(["post"]), 10));\n\nfetchUser()\n  .then((user) => {\n    fetchPosts(user.id);\n  })\n  .then((posts) => console.log(posts));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "async-race-loser",
    ["async-javascript"],
    2,
    90,
    ["What happens to the loser of a race", "Що стається з тим, хто програв перегони"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`timeout`, then `slow finished` 40 ms later", "`timeout`, а через 40 мс `slow finished`"],
      ["Only `timeout`: `Promise.race` cancels the slow promise", "Лише `timeout`: `Promise.race` скасовує повільний проміс"],
      ["`slow finished`, then `timeout`", "`slow finished`, потім `timeout`"],
      ["Only `slow finished`", "Лише `slow finished`"],
    ],
    "a",
    [
      "Promises are results, not handles to the work, so `Promise.race` can't cancel anything: it only settles with whichever finishes first. The slow operation keeps running and finishes later. To really stop it (and save bandwidth), pass an `AbortSignal` to the operation, e.g. `fetch(url, { signal: AbortSignal.timeout(10) })`.",
      "Проміси є результатами, а не керуванням роботою, тож `Promise.race` нічого не скасовує: він лише завершується з тим, що закінчилося першим. Повільна операція працює далі й завершується пізніше. Щоб справді її зупинити (і заощадити трафік), передайте операції `AbortSignal`, наприклад `fetch(url, { signal: AbortSignal.timeout(10) })`.",
    ],
    {
      code: 'const slow = new Promise((resolve) =>\n  setTimeout(() => {\n    console.log("slow finished");\n    resolve("slow");\n  }, 50),\n);\nconst timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 10));\nPromise.race([slow, timeout]).catch((e) => console.log(e.message));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "async-catch-then",
    ["async-javascript"],
    3,
    90,
    ["After a `catch`", "Після `catch`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`b x` then `c`", "`b x`, потім `c`"],
      ["`a`, `b x`, `c`", "`a`, `b x`, `c`"],
      ["`b x` only", "Лише `b x`"],
      ["`a` then `c`", "`a`, потім `c`"],
    ],
    "a",
    [
      "A rejection skips `then` callbacks without a rejection handler until it reaches a `catch`. Once `catch` handles it (and doesn't rethrow), the chain is fulfilled again with the handler's return value, so the following `then` runs. Put `catch` at the end if later steps shouldn't run after an error.",
      "Відхилення пропускає колбеки `then` без обробника відхилення, доки не дійде до `catch`. Щойно `catch` його обробив (і не кинув помилку знову), ланцюжок знову виконаний зі значенням, яке повернув обробник, тож наступний `then` виконується. Ставте `catch` у кінці, якщо наступні кроки не мають виконуватися після помилки.",
    ],
    {
      code: 'Promise.reject(new Error("x"))\n  .then(() => console.log("a"))\n  .catch((e) => console.log("b", e.message))\n  .then(() => console.log("c"));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "async-finally-value",
    ["async-javascript"],
    3,
    90,
    ["What `finally` passes on", "Що передає далі `finally`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1` then `b`", "`1`, потім `b`"],
      ["`2` then `b`", "`2`, потім `b`"],
      ["`1` then `a`", "`1`, потім `a`"],
      ["`2` then `a`", "`2`, потім `a`"],
    ],
    "a",
    [
      "`finally` is for cleanup: its callback gets no arguments and its return value is ignored, so the original value (`1`) or rejection passes through. The one exception is an error thrown (or a rejected promise returned) inside `finally`, which replaces the original outcome, so the caller sees `b`, not `a`.",
      "`finally` призначений для прибирання: його колбек не отримує аргументів, а повернене значення ігнорується, тож початкове значення (`1`) чи відхилення проходить далі. Єдиний виняток: помилка, кинута всередині `finally` (або повернений відхилений проміс), замінює початковий результат, тож викликач бачить `b`, а не `a`.",
    ],
    {
      code: '(async () => {\n  const v = await Promise.resolve(1).finally(() => 2);\n  console.log(v);\n  try {\n    await Promise.reject(new Error("a")).finally(() => {\n      throw new Error("b");\n    });\n  } catch (e) {\n    console.log(e.message);\n  }\n})();',
      codeLanguage: "js",
    },
  ),
  quiz(
    "async-empty-combinators",
    ["async-javascript"],
    4,
    90,
    ["Combinators with an empty array", "Комбінатори з порожнім масивом"],
    ["Which of these **never settles**?", "Що з цього **ніколи не завершиться**?"],
    [
      ["`Promise.race([])`", "`Promise.race([])`"],
      ["`Promise.all([])`", "`Promise.all([])`"],
      ["`Promise.allSettled([])`", "`Promise.allSettled([])`"],
      ["`Promise.any([])`", "`Promise.any([])`"],
    ],
    "a",
    [
      "`all([])` and `allSettled([])` fulfil immediately with `[]` (every one of zero inputs is done). `any([])` rejects with an `AggregateError` (no input can fulfil). `race([])` waits for the first input to settle, and there is none, so it stays pending forever. Guard against empty lists before racing.",
      "`all([])` і `allSettled([])` одразу виконуються з `[]` (кожен із нуля входів завершений). `any([])` відхиляється з `AggregateError` (жоден вхід не може виконатися). `race([])` чекає, поки завершиться перший вхід, а його немає, тож лишається в очікуванні назавжди. Перевіряйте список на порожність перед перегонами.",
    ],
  ),
  quiz(
    "async-return-without-await",
    ["async-javascript", w("javascript")],
    4,
    120,
    ["`return` vs `return await` in `try`", "`return` проти `return await` у `try`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`error: offline`: the rejection happens after `try` has exited, so `catch` never sees it", "`error: offline`: відхилення стається після виходу з `try`, тож `catch` його не бачить"],
      ["`value: fallback`", "`value: fallback`"],
      ["`value: undefined`", "`value: undefined`"],
      ["Nothing; the promise stays pending", "Нічого; проміс лишається в очікуванні"],
    ],
    "a",
    [
      "`return fetchData()` hands the pending promise to the caller and leaves the `try` block immediately. When it later rejects, there's no `catch` around it any more. `return await fetchData()` waits **inside** the `try`, so the rejection is thrown there and the fallback is returned. Outside `try/catch`, plain `return` is fine.",
      "`return fetchData()` передає проміс, що очікує, викликачу й одразу виходить із блоку `try`. Коли він пізніше відхиляється, навколо вже немає `catch`. `return await fetchData()` чекає **всередині** `try`, тож відхилення кидається там і повертається запасне значення. Поза `try/catch` звичайний `return` цілком підходить.",
    ],
    {
      code: 'const fetchData = () => Promise.reject(new Error("offline"));\n\nasync function load() {\n  try {\n    return fetchData();\n  } catch {\n    return "fallback";\n  }\n}\n\nload().then(\n  (v) => console.log("value:", v),\n  (e) => console.log("error:", e.message),\n);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "async-lost-update",
    ["async-javascript", w("state-management")],
    5,
    150,
    ["A lost update", "Втрачене оновлення"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`120`", "`120`"],
      ["`130`", "`130`"],
      ["`110`", "`110`"],
      ["It varies between runs", "Щоразу по-різному"],
    ],
    "a",
    [
      "Both deposits read `100` before either writes, then each writes its own result: `110`, then `120`. One deposit is lost. Single-threaded JavaScript still has race conditions whenever an `await` sits between reading and writing shared state. Fix it by serialising the critical section (a mutex or queue), making the update atomic on the server (`UPDATE … SET balance = balance + 10`), or using optimistic concurrency with a version check.",
      "Обидва поповнення читають `100`, перш ніж хтось запише, а потім кожне записує свій результат: `110`, потім `120`. Одне поповнення втрачено. Однопотоковий JavaScript усе одно має стан гонитви, щойно між читанням і записом спільного стану стоїть `await`. Виправлення: серіалізувати критичну секцію (м'ютекс чи черга), зробити оновлення атомарним на сервері (`UPDATE … SET balance = balance + 10`) або використати оптимістичну конкурентність із перевіркою версії.",
    ],
    {
      code: "let balance = 100;\nconst read = async () => {\n  await null;\n  return balance;\n};\nconst write = async (value) => {\n  await null;\n  balance = value;\n};\nasync function deposit(amount) {\n  const current = await read();\n  await write(current + amount);\n}\n\nawait Promise.all([deposit(10), deposit(20)]);\nconsole.log(balance);",
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "async-combinators",
    skills: ["async-javascript", w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Implement Promise.all, allSettled and any", "Реалізуйте Promise.all, allSettled і any"],
    prompt: [
      "Implement three promise combinators in `src/combinators.ts` **without** using `Promise.all`, `allSettled`, `any` or `race` (the tests switch them off):\n\n- **`promiseAll(iterable)`**: resolves with every value **in input order**, whatever order they settle in; rejects as soon as any input rejects; resolves `[]` for an empty input.\n- **`promiseAllSettled(iterable)`**: never rejects; resolves with `{ status: \"fulfilled\", value }` or `{ status: \"rejected\", reason }` for each input, in order.\n- **`promiseAny(iterable)`**: resolves with the first **fulfilled** value; if every input rejects (or there are none), rejects with an `AggregateError` whose `errors` are in input order.\n\nInputs may be promises, thenables or plain values, and any iterable (arrays, `Set`s, generators).",
      "Реалізуйте три комбінатори промісів у `src/combinators.ts` **без** `Promise.all`, `allSettled`, `any` чи `race` (тести їх вимикають):\n\n- **`promiseAll(iterable)`**: виконується з усіма значеннями **в порядку входу**, незалежно від порядку завершення; відхиляється, щойно відхилився будь-який вхід; для порожнього входу дає `[]`.\n- **`promiseAllSettled(iterable)`**: ніколи не відхиляється; дає `{ status: \"fulfilled\", value }` або `{ status: \"rejected\", reason }` для кожного входу в порядку входу.\n- **`promiseAny(iterable)`**: виконується з першим **виконаним** значенням; якщо всі входи відхилені (або їх немає), відхиляється з `AggregateError`, чиї `errors` упорядковані за входом.\n\nВходами можуть бути проміси, thenable чи звичайні значення, а також будь-які ітеровані об'єкти (масиви, `Set`, генератори).",
    ],
    files: { "/src/combinators.ts": COMBINATORS_STARTER, "/index.ts": COMBINATORS_INDEX },
    visibleFiles: ["/src/combinators.ts", "/index.ts"],
    activeFile: "/src/combinators.ts",
    tests: COMBINATORS_TESTS,
    solution: { "/src/combinators.ts": COMBINATORS_SOLUTION },
    explanation: [
      "Each combinator wraps a new promise around a counter. Storing results by index (not by push) keeps input order, `Promise.resolve(item)` normalises values and thenables, and passing `reject` directly gives fail-fast behaviour because a promise settles only once. `allSettled` maps each input to a promise that always fulfils and reuses `all`; `any` mirrors `all` with the roles of success and failure swapped.",
      "Кожен комбінатор обгортає новий проміс навколо лічильника. Збереження результатів за індексом (а не через push) зберігає порядок входу, `Promise.resolve(item)` уніфікує значення й thenable, а передача `reject` напряму дає швидку відмову, бо проміс завершується лише раз. `allSettled` перетворює кожен вхід на проміс, що завжди виконується, і використовує `all`; `any` дзеркалить `all`, міняючи ролі успіху й невдачі.",
    ],
  }),
  practice({
    slug: "async-mutex",
    skills: ["async-javascript", w("design-patterns"), w("typescript")],
    complexity: 4,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["An async mutex", "Асинхронний м'ютекс"],
    prompt: [
      "Two deposits that each `await` between reading and writing a balance lose an update. Implement `createMutex()` in `src/mutex.ts` so critical sections run one at a time:\n\n- `runExclusive(fn)` runs `fn` (sync or async) when no other task holds the lock, and resolves or rejects with its result.\n- Tasks run strictly **one at a time, in call order**.\n- A task that throws rejects **its own** call, but later tasks still run.\n- `locked` is `true` while a task runs; `pending` counts tasks still waiting for their turn.\n\nThe demo makes two concurrent deposits and should end with a balance of `130`.",
      "Два поповнення, кожне з яких робить `await` між читанням і записом балансу, втрачають оновлення. Реалізуйте `createMutex()` у `src/mutex.ts`, щоб критичні секції виконувалися по одній:\n\n- `runExclusive(fn)` запускає `fn` (синхронну чи асинхронну), коли блокування ніхто не тримає, і виконується чи відхиляється з її результатом.\n- Задачі виконуються строго **по одній, у порядку викликів**.\n- Задача, що кинула помилку, відхиляє **власний** виклик, але наступні задачі все одно виконуються.\n- `locked` дорівнює `true`, поки виконується задача; `pending` рахує задачі, що ще чекають на свою чергу.\n\nДемо робить два одночасні поповнення й має закінчитися балансом `130`.",
    ],
    files: { "/src/mutex.ts": MUTEX_STARTER, "/index.ts": MUTEX_INDEX },
    visibleFiles: ["/src/mutex.ts", "/index.ts"],
    activeFile: "/src/mutex.ts",
    tests: MUTEX_TESTS,
    solution: { "/src/mutex.ts": MUTEX_SOLUTION },
    explanation: [
      "The mutex is just a promise chain: each call attaches its task to the tail of the previous one, so tasks start in call order and only after the previous task settles. The tail is a version of the result with errors swallowed, so one failure doesn't poison the queue, while the caller still receives the real rejection. `try/finally` keeps `locked` accurate even when `fn` throws.",
      "М'ютекс є просто ланцюжком промісів: кожен виклик чіпляє свою задачу до хвоста попередньої, тож задачі стартують у порядку викликів і лише після завершення попередньої. Хвіст є версією результату з проковтнутими помилками, тож одна невдача не отруює чергу, а викликач усе одно отримує справжнє відхилення. `try/finally` тримає `locked` точним, навіть коли `fn` кидає помилку.",
    ],
  }),
]);
