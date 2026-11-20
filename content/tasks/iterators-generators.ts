import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const LAZY_STARTER = String.raw`/** start, start + step, … while before end (end is exclusive; negative steps count down). */
export function* range(start = 0, end = Infinity, step = 1): Generator<number> {
  // TODO: negative steps, and a RangeError for step 0
  for (let x = start; x < end; x += step) yield x;
}

export function* map<T, U>(iterable: Iterable<T>, fn: (value: T, index: number) => U): Generator<U> {
  // TODO: pass the index too
  for (const x of iterable) yield (fn as (value: T) => U)(x);
}

export function* filter<T>(iterable: Iterable<T>, pred: (value: T, index: number) => boolean): Generator<T> {
  for (const x of iterable) if ((pred as (value: T) => boolean)(x)) yield x;
}

export function* take<T>(iterable: Iterable<T>, n: number): Generator<T> {
  // TODO: this pulls one value too many from the source
  let count = 0;
  for (const x of iterable) {
    if (count++ >= n) return;
    yield x;
  }
}

export function* chunk<T>(iterable: Iterable<T>, size: number): Generator<T[]> {
  // TODO: the last, shorter chunk is lost; validate size
  let buffer: T[] = [];
  for (const x of iterable) {
    buffer.push(x);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
}

export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
  // TODO: close the other iterator when one runs out
  const ib = b[Symbol.iterator]();
  for (const x of a) {
    const r = ib.next();
    if (r.done) return;
    yield [x, r.value];
  }
}
`;

const LAZY_SOLUTION = String.raw`export function* range(start = 0, end = Infinity, step = 1): Generator<number> {
  if (step === 0 || !Number.isFinite(step)) throw new RangeError("step must be a non-zero finite number");
  for (let x = start; step > 0 ? x < end : x > end; x += step) yield x;
}

export function* map<T, U>(iterable: Iterable<T>, fn: (value: T, index: number) => U): Generator<U> {
  let i = 0;
  for (const x of iterable) yield fn(x, i++);
}

export function* filter<T>(iterable: Iterable<T>, pred: (value: T, index: number) => boolean): Generator<T> {
  let i = 0;
  for (const x of iterable) if (pred(x, i++)) yield x;
}

export function* take<T>(iterable: Iterable<T>, n: number): Generator<T> {
  if (n <= 0) return; // don't even start the source
  let count = 0;
  for (const x of iterable) {
    yield x;
    if (++count >= n) return; // stop right after the n-th value: no extra pull
  }
}

export function* chunk<T>(iterable: Iterable<T>, size: number): Generator<T[]> {
  if (!Number.isInteger(size) || size < 1) throw new RangeError("size must be a positive integer");
  let buffer: T[] = [];
  for (const x of iterable) {
    buffer.push(x);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length) yield buffer;
}

export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
  const ia = a[Symbol.iterator]();
  const ib = b[Symbol.iterator]();
  try {
    while (true) {
      const ra = ia.next();
      if (ra.done) return;
      const rb = ib.next();
      if (rb.done) return;
      yield [ra.value, rb.value];
    }
  } finally {
    // Like for…of on early exit: give both sources a chance to clean up.
    ia.return?.();
    ib.return?.();
  }
}
`;

const LAZY_INDEX = String.raw`import "./styles.css";
import { filter, map, range, take } from "./src/lazy";

// The first five odd squares, from an infinite sequence: only what's needed is computed.
const result = [...take(filter(map(range(1), (x) => x * x), (x) => x % 2 === 1), 5)];
document.getElementById("app")!.innerHTML = '<h1>Lazy pipeline</h1><p><output id="out">' + result.join(", ") + "</output></p>";
`;

const LAZY_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { chunk, filter, map, range, take, zip } from "../src/lazy";

function counted(values) {
  const stats = { pulled: 0, closed: false };
  function* gen() {
    try {
      for (const v of values) { stats.pulled++; yield v; }
    } finally {
      stats.closed = true;
    }
  }
  return { gen: gen(), stats };
}

describe("range", () => {
  it("counts up, down and forever", () => {
    expect([...range(1, 10, 3)]).toEqual([1, 4, 7]);
    expect([...range(5, 0, -2)]).toEqual([5, 3, 1]);
    expect([...take(range(), 3)]).toEqual([0, 1, 2]);
  });
  it("rejects a zero step", () => {
    expect(() => range(0, 1, 0).next()).toThrow(RangeError);
  });
});

describe("map and filter", () => {
  it("pass the index and work on any iterable", () => {
    expect([...map(["a", "b"], (x, i) => x + i)]).toEqual(["a0", "b1"]);
    expect([...filter(new Set([5, 6, 7]), (x, i) => i !== 1)]).toEqual([5, 7]);
    expect([...map("hi", (c) => c.toUpperCase())]).toEqual(["H", "I"]);
  });
});

describe("take", () => {
  it("is lazy: pulls exactly n values and calls the mapper n times", () => {
    const { gen, stats } = counted([1, 2, 3, 4, 5]);
    let calls = 0;
    const out = [...take(map(gen, (x) => { calls++; return x * 10; }), 2)];
    expect(out).toEqual([10, 20]);
    expect(stats.pulled).toBe(2);
    expect(calls).toBe(2);
    expect(stats.closed).toBe(true);
  });
  it("doesn't start the source for n = 0", () => {
    const { gen, stats } = counted([1, 2]);
    expect([...take(gen, 0)]).toEqual([]);
    expect(stats.pulled).toBe(0);
  });
  it("handles infinite pipelines", () => {
    expect([...take(filter(map(range(1), (x) => x * x), (x) => x % 2 === 1), 3)]).toEqual([1, 9, 25]);
  });
});

describe("chunk", () => {
  it("groups values and keeps the last partial chunk", () => {
    expect([...chunk(range(0, 7), 3)]).toEqual([[0, 1, 2], [3, 4, 5], [6]]);
    expect([...chunk([], 2)]).toEqual([]);
  });
  it("rejects invalid sizes", () => {
    expect(() => chunk([1], 0).next()).toThrow(RangeError);
  });
});

describe("zip", () => {
  it("pairs values and stops at the shorter input", () => {
    expect([...zip([1, 2, 3], "ab")]).toEqual([[1, "a"], [2, "b"]]);
  });
  it("closes the other iterator when one runs out", () => {
    const { gen, stats } = counted(["x", "y", "z"]);
    expect([...zip([1, 2], gen)]).toEqual([[1, "x"], [2, "y"]]);
    expect(stats.closed).toBe(true);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("1, 9, 25, 49, 81")).id).toBe("out");
  });
});
`;

const RUN_STARTER = String.raw`/**
 * Runs a generator as a coroutine: yielded promises are awaited and their results sent back
 * with next(); rejections are thrown into the generator. Resolves with its return value.
 */
export function run<T>(genFn: (...args: any[]) => Generator<unknown, T, any>, ...args: unknown[]): Promise<T> {
  // TODO: this doesn't wait for anything
  const it = genFn(...args);
  let result = it.next();
  while (!result.done) result = it.next(result.value);
  return Promise.resolve(result.value);
}
`;

const RUN_SOLUTION = String.raw`export function run<T>(genFn: (...args: any[]) => Generator<unknown, T, any>, ...args: unknown[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let it: Generator<unknown, T, any>;
    try {
      it = genFn(...args);
    } catch (error) {
      return reject(error);
    }

    const step = (method: "next" | "throw", input?: unknown) => {
      let result: IteratorResult<unknown, T>;
      try {
        result = it[method](input); // resume the generator with a value, or throw into it
      } catch (error) {
        return reject(error); // the generator didn't handle it
      }
      if (result.done) return resolve(result.value);
      const value = Array.isArray(result.value) ? Promise.all(result.value) : result.value;
      Promise.resolve(value).then(
        (v) => step("next", v),
        (e) => step("throw", e),
      );
    };

    step("next");
  });
}
`;

const RUN_INDEX = String.raw`import "./styles.css";
import { run } from "./src/run";

const delay = <T,>(ms: number, value: T) => new Promise<T>((r) => setTimeout(() => r(value), ms));

run(function* () {
  const user: { name: string } = yield delay(20, { name: "Ada" });
  const [posts, followers]: number[] = yield [delay(20, 12), delay(20, 340)];
  return user.name + ": " + posts + " posts, " + followers + " followers";
}).then(
  (text) => (document.getElementById("app")!.innerHTML = '<h1>Coroutine</h1><p><output id="out">' + text + "</output></p>"),
  (e) => (document.getElementById("app")!.textContent = "error: " + e.message),
);
`;

const RUN_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { run } from "../src/run";

const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const fail = (msg) => {
  const p = Promise.reject(new Error(msg));
  p.catch(() => {});
  return p;
};

describe("run", () => {
  it("waits for yielded promises and resolves with the return value", async () => {
    const result = await run(function* () {
      const a = yield Promise.resolve(2);
      const b = yield 3;
      return a * b;
    });
    expect(result).toBe(6);
  });
  it("passes arguments to the generator", async () => {
    expect(await run(function* (x, y) { return (yield sleep(5, x)) + y; }, 40, 2)).toBe(42);
  });
  it("runs steps in order", async () => {
    const log = [];
    await run(function* () {
      log.push(yield sleep(15, "slow"));
      log.push(yield sleep(1, "fast"));
    });
    expect(log).toEqual(["slow", "fast"]);
  });
  it("throws rejections into the generator, where try/catch works", async () => {
    const result = await run(function* () {
      try {
        yield fail("boom");
        return "not reached";
      } catch (e) {
        return "recovered: " + e.message;
      }
    });
    expect(result).toBe("recovered: boom");
  });
  it("rejects when the generator doesn't handle an error", async () => {
    await expect(run(function* () { yield fail("unhandled"); })).rejects.toThrow("unhandled");
  });
  it("turns a synchronous throw into a rejection", async () => {
    let p;
    expect(() => { p = run(function* () { throw new Error("early"); }); }).not.toThrow();
    await expect(p).rejects.toThrow("early");
  });
  it("waits for yielded arrays in parallel", async () => {
    const start = Date.now();
    const result = await run(function* () { return yield [sleep(30, "a"), sleep(30, "b")]; });
    expect(result).toEqual(["a", "b"]);
    expect(Date.now() - start < 55).toBe(true);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("Ada: 12 posts, 340 followers")).id).toBe("out");
  });
});
`;

export default defineTasks([
  quiz(
    "ig-iterable",
    ["iterators-generators"],
    1,
    45,
    ["What makes an object iterable", "Що робить об'єкт ітерованим"],
    ["What must an object have so that `for…of` and `[...obj]` work with it?", "Що повинен мати об'єкт, щоб із ним працювали `for…of` і `[...obj]`?"],
    [
      ["A `[Symbol.iterator]()` method that returns an iterator (an object with `next()` returning `{ value, done }`)", "Метод `[Symbol.iterator]()`, що повертає ітератор (об'єкт з `next()`, який повертає `{ value, done }`)"],
      ["A `length` property", "Властивість `length`"],
      ["A `forEach` method", "Метод `forEach`"],
      ["Numeric keys starting at 0", "Числові ключі, що починаються з 0"],
    ],
    "a",
    [
      "That's the iteration protocol. Array-likes with `length` and numeric keys work with `Array.from`, but not with `for…of` or spread unless they also implement `Symbol.iterator`. Generators are the simplest way to implement it: `*[Symbol.iterator]() { yield …; }`.",
      "Це протокол ітерації. Масивоподібні об'єкти з `length` і числовими ключами працюють з `Array.from`, але не з `for…of` чи spread, якщо не реалізують `Symbol.iterator`. Найпростіше реалізувати його генератором: `*[Symbol.iterator]() { yield …; }`.",
    ],
  ),
  quiz(
    "ig-lazy-start",
    ["iterators-generators"],
    2,
    90,
    ["When a generator body runs", "Коли виконується тіло генератора"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`created`, `start`, `1`, `after 1`, `2`", "`created`, `start`, `1`, `after 1`, `2`"],
      ["`start`, `created`, `1`, `after 1`, `2`", "`start`, `created`, `1`, `after 1`, `2`"],
      ["`start`, `after 1`, `created`, `1`, `2`", "`start`, `after 1`, `created`, `1`, `2`"],
      ["`created`, `1`, `2`, `start`, `after 1`", "`created`, `1`, `2`, `start`, `after 1`"],
    ],
    "a",
    [
      "Calling a generator function only creates the generator object; no code in the body runs yet. Each `next()` resumes execution until the next `yield`, so the logs interleave with the consumer's: the body runs in slices, on demand.",
      "Виклик функції-генератора лише створює об'єкт-генератор; жоден рядок тіла ще не виконується. Кожен `next()` продовжує виконання до наступного `yield`, тож записи чергуються із записами споживача: тіло виконується частинами, на вимогу.",
    ],
    {
      code: 'function* gen() {\n  console.log("start");\n  yield 1;\n  console.log("after 1");\n  yield 2;\n}\nconst it = gen();\nconsole.log("created");\nconsole.log(it.next().value);\nconsole.log(it.next().value);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "ig-next-value",
    ["iterators-generators"],
    2,
    90,
    ["Sending values into a generator", "Передача значень у генератор"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`first? second? 5`", "`first? second? 5`"],
      ["`first? second? 12`", "`first? second? 12`"],
      ["`first? second? 13`", "`first? second? 13`"],
      ["`10 2 3`", "`10 2 3`"],
    ],
    "a",
    [
      "The first `next()` only starts the generator, running it to the first `yield`; there's no paused `yield` to receive its argument, so `10` is lost. The argument of each later `next(x)` becomes the result of the `yield` the generator was paused at: `a = 2`, `b = 3`, so it returns `5`.",
      "Перший `next()` лише запускає генератор до першого `yield`; немає призупиненого `yield`, що отримав би його аргумент, тож `10` губиться. Аргумент кожного наступного `next(x)` стає результатом того `yield`, на якому генератор стоїть: `a = 2`, `b = 3`, тож повертається `5`.",
    ],
    { code: 'function* adder() {\n  const a = yield "first?";\n  const b = yield "second?";\n  return a + b;\n}\nconst it = adder();\nconsole.log(it.next(10).value, it.next(2).value, it.next(3).value);', codeLanguage: "js" },
  ),
  quiz(
    "ig-return-value",
    ["iterators-generators"],
    3,
    90,
    ["Where the return value goes", "Куди потрапляє повернене значення"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, 2 ] 2`, then `{ value: 3, done: true }`", "`[ 1, 2 ] 2`, потім `{ value: 3, done: true }`"],
      ["`[ 1, 2, 3 ] 3`, then `{ value: undefined, done: true }`", "`[ 1, 2, 3 ] 3`, потім `{ value: undefined, done: true }`"],
      ["`[ 1, 2 ] 2`, then `{ value: undefined, done: true }`", "`[ 1, 2 ] 2`, потім `{ value: undefined, done: true }`"],
      ["`[ 1, 2, 3 ] 3`, then `{ value: 3, done: true }`", "`[ 1, 2, 3 ] 3`, потім `{ value: 3, done: true }`"],
    ],
    "a",
    [
      "A generator's `return` value is delivered in the final result with `done: true`. Spread, `Array.from` and `for…of` stop as soon as they see `done: true` and ignore its value; only manual `next()` calls (or `yield*`, which evaluates to it) see the `3`.",
      "Значення з `return` генератора приходить в останньому результаті з `done: true`. Spread, `Array.from` і `for…of` зупиняються, щойно бачать `done: true`, і ігнорують його значення; `3` бачать лише ручні виклики `next()` (або `yield*`, що обчислюється в нього).",
    ],
    { code: "function* g() {\n  yield 1;\n  yield 2;\n  return 3;\n}\nconsole.log([...g()], Array.from(g()).length);\nconst it = g();\nit.next();\nit.next();\nconsole.log(it.next());", codeLanguage: "js" },
  ),
  quiz(
    "ig-yield-star",
    ["iterators-generators", w("recursion")],
    3,
    90,
    ["Delegating with `yield*`", "Делегування через `yield*`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'a', 'r', 1, 2 ]`", "`[ 'a', 'r', 1, 2 ]`"],
      ["`[ 'a', 1, 2 ]`", "`[ 'a', 1, 2 ]`"],
      ["`[ 'a', 'r', [ 1, 2 ] ]`", "`[ 'a', 'r', [ 1, 2 ] ]`"],
      ["`[ 'a', undefined, 1, 2 ]`", "`[ 'a', undefined, 1, 2 ]`"],
    ],
    "a",
    [
      "`yield* inner()` yields every value of `inner` (`\"a\"`) and then evaluates to inner's **return** value (`\"r\"`), which the outer generator yields explicitly. `yield* [1, 2]` works with any iterable and yields its items one by one, unlike `yield [1, 2]`, which would yield the array itself.",
      "`yield* inner()` видає всі значення `inner` (`\"a\"`), а потім обчислюється в **повернене** значення inner (`\"r\"`), яке зовнішній генератор видає явно. `yield* [1, 2]` працює з будь-яким ітерованим об'єктом і видає його елементи по одному, на відміну від `yield [1, 2]`, що видав би сам масив.",
    ],
    { code: 'function* inner() {\n  yield "a";\n  return "r";\n}\nfunction* outer() {\n  const r = yield* inner();\n  yield r;\n  yield* [1, 2];\n}\nconsole.log([...outer()]);', codeLanguage: "js" },
  ),
  quiz(
    "ig-for-await",
    ["iterators-generators", w("async-javascript")],
    3,
    90,
    ["Async generators", "Асинхронні генератори"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 10, 11, 20, 21, 30, 31 ]`", "`[ 10, 11, 20, 21, 30, 31 ]`"],
      ["`[ [ 10, 11 ], [ 20, 21 ], [ 30, 31 ] ]`", "`[ [ 10, 11 ], [ 20, 21 ], [ 30, 31 ] ]`"],
      ["`[]`, because the loop finishes before the timers", "`[]`, бо цикл завершується раніше за таймери"],
      ["`[ Promise, Promise, Promise ]`", "`[ Promise, Promise, Promise ]`"],
    ],
    "a",
    [
      "An `async function*` can `await` between yields, and `for await…of` waits for each value before running the loop body, so pages arrive one after another. The spread inside `push` flattens each page. This is the natural shape for paginated APIs and streams.",
      "`async function*` може робити `await` між yield, а `for await…of` чекає на кожне значення перед виконанням тіла циклу, тож сторінки надходять одна за одною. Spread усередині `push` розгортає кожну сторінку. Це природна форма для API з пагінацією й потоків.",
    ],
    {
      code: "async function* pages() {\n  for (let p = 1; p <= 3; p++) {\n    await new Promise((r) => setTimeout(r, 5));\n    yield [p * 10, p * 10 + 1];\n  }\n}\nconst all = [];\nfor await (const page of pages()) all.push(...page);\nconsole.log(all);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "ig-break-closes",
    ["iterators-generators", w("arrays-strings")],
    4,
    120,
    ["Breaking out of a loop", "Вихід із циклу через break"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[] [ 2, 3 ]`", "`[] [ 2, 3 ]`"],
      ["`[ 2, 3 ] [ 2, 3 ]`", "`[ 2, 3 ] [ 2, 3 ]`"],
      ["`[] []`", "`[] []`"],
      ["`[ 1, 2, 3 ] [ 1, 2, 3 ]`", "`[ 1, 2, 3 ] [ 1, 2, 3 ]`"],
    ],
    "a",
    [
      "When `for…of` exits early it calls the iterator's `return()` method. Generators have one, so `g` is closed for good and spreads to `[]`. Array iterators have no `return()`, so the loop only consumed `1`, and the same iterator still yields `2` and `3` afterwards.",
      "Коли `for…of` завершується достроково, він викликає метод `return()` ітератора. Генератори його мають, тож `g` закрито назавжди, і spread дає `[]`. Ітератори масивів не мають `return()`, тож цикл забрав лише `1`, і той самий ітератор потім і далі видає `2` і `3`.",
    ],
    { code: "function* nums() {\n  yield 1;\n  yield 2;\n  yield 3;\n}\nconst g = nums();\nfor (const x of g) break;\n\nconst a = [1, 2, 3][Symbol.iterator]();\nfor (const x of a) break;\n\nconsole.log([...g], [...a]);", codeLanguage: "js" },
  ),
  quiz(
    "ig-finally-cleanup",
    ["iterators-generators"],
    4,
    90,
    ["Cleanup on early exit", "Очищення при достроковому виході"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1`, then `cleanup`", "`1`, потім `cleanup`"],
      ["Only `1`", "Лише `1`"],
      ["`1`, `2`, then `cleanup`", "`1`, `2`, потім `cleanup`"],
      ["`cleanup`, then `1`", "`cleanup`, потім `1`"],
    ],
    "a",
    [
      "`break` makes `for…of` call the generator's `return()`, which resumes it at the paused `yield` as if a `return` statement were there, so pending `finally` blocks run. That's the place to release resources (close a connection, remove a listener) that the generator acquired.",
      "`break` змушує `for…of` викликати `return()` генератора, що продовжує його в місці призупиненого `yield` так, ніби там стоїть інструкція `return`, тож блоки `finally`, що очікують, виконуються. Саме там слід звільняти ресурси (закривати з'єднання, знімати слухачів), які генератор отримав.",
    ],
    { code: 'function* resource() {\n  try {\n    yield 1;\n    yield 2;\n  } finally {\n    console.log("cleanup");\n  }\n}\nfor (const x of resource()) {\n  console.log(x);\n  break;\n}', codeLanguage: "js" },
  ),
  quiz(
    "ig-coroutine-runner",
    ["iterators-generators", w("async-javascript")],
    4,
    150,
    ["Generators before async/await", "Генератори до async/await"],
    ["What does this print, and what modern feature does `run` imitate?", "Що виведе цей код і яку сучасну можливість імітує `run`?"],
    [
      ["`6`; `async`/`await`, where `yield` plays the role of `await`", "`6`; `async`/`await`, де `yield` грає роль `await`"],
      ["`NaN`; `Promise.all`", "`NaN`; `Promise.all`"],
      ["`[Promise, 3]`; `Promise.race`", "`[Promise, 3]`; `Promise.race`"],
      ["Nothing; generators can't yield promises", "Нічого; генератори не можуть видавати проміси"],
    ],
    "a",
    [
      "The runner calls `next()`, waits for whatever was yielded (`Promise.resolve` also accepts plain values), and resumes the generator with the result, so `a = 2` and `b = 3`. Generator code then reads like synchronous code that pauses on `yield`, which is exactly what `async` functions do with `await`. Libraries like `co` worked this way before ES2017.",
      "Виконавець викликає `next()`, чекає на видане значення (`Promise.resolve` приймає й звичайні значення) і продовжує генератор із результатом, тож `a = 2`, а `b = 3`. Код генератора тоді читається як синхронний, що зупиняється на `yield`, а це саме те, що роблять `async`-функції з `await`. Бібліотеки на кшталт `co` працювали так до ES2017.",
    ],
    {
      code: "function run(gen) {\n  const it = gen();\n  return new Promise((resolve, reject) => {\n    function step(value) {\n      const r = it.next(value);\n      if (r.done) return resolve(r.value);\n      Promise.resolve(r.value).then(step, reject);\n    }\n    step();\n  });\n}\nrun(function* () {\n  const a = yield Promise.resolve(2);\n  const b = yield 3;\n  return a * b;\n}).then(console.log);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "ig-throw-into",
    ["iterators-generators"],
    5,
    150,
    ["Throwing into a generator", "Кидання помилки в генератор"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1 caught boom 3 true`", "`1 caught boom 3 true`"],
      ["`1 undefined 3 false`", "`1 undefined 3 false`"],
      ["It throws `boom` at the caller", "Кидає `boom` викликачу"],
      ["`1 caught boom undefined true`", "`1 caught boom undefined true`"],
    ],
    "a",
    [
      "`it.throw(\"boom\")` raises the error at the paused `yield 1`, inside the `try`, so the generator catches it and runs on to its next `yield`, whose value `throw()` returns. The next `next()` reaches `yield 3`, and the one after that finishes the generator. If the generator hadn't caught it, `throw()` would have rethrown to the caller and closed the generator.",
      "`it.throw(\"boom\")` кидає помилку в місці призупиненого `yield 1`, всередині `try`, тож генератор її перехоплює й працює до наступного `yield`, чиє значення повертає `throw()`. Наступний `next()` доходить до `yield 3`, а ще один завершує генератор. Якби генератор її не перехопив, `throw()` перекинув би помилку викликачу й закрив генератор.",
    ],
    { code: 'function* g() {\n  try {\n    yield 1;\n  } catch (e) {\n    yield "caught " + e;\n  }\n  yield 3;\n}\nconst it = g();\nconsole.log(it.next().value, it.throw("boom").value, it.next().value, it.next().done);', codeLanguage: "js" },
  ),
  practice({
    slug: "ig-lazy-pipeline",
    skills: ["iterators-generators", w("functional-programming"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Lazy iterator helpers", "Ліниві помічники для ітераторів"],
    prompt: [
      "Write lazy, generator-based helpers in `src/lazy.ts` that work with **any iterable**, including infinite ones:\n\n- `range(start = 0, end = Infinity, step = 1)`: counts up or down (negative step), end exclusive; throws a `RangeError` for a zero step.\n- `map(iterable, fn)` and `filter(iterable, pred)`: the callbacks also receive the index.\n- `take(iterable, n)`: the first `n` values, pulling **exactly** `n` from the source (not one more) and none for `n <= 0`.\n- `chunk(iterable, size)`: arrays of `size`, plus the final shorter one; `RangeError` for sizes below 1.\n- `zip(a, b)`: pairs `[a, b]`, stopping at the shorter input and **closing** the other iterator (call its `return()`) so it can clean up.\n\nNothing may be computed before it's requested.",
      "Напишіть ліниві помічники на генераторах у `src/lazy.ts`, що працюють з **будь-якими ітерованими об'єктами**, зокрема нескінченними:\n\n- `range(start = 0, end = Infinity, step = 1)`: рахує вгору чи вниз (від'ємний крок), кінець не включно; для нульового кроку кидає `RangeError`.\n- `map(iterable, fn)` і `filter(iterable, pred)`: колбеки отримують також індекс.\n- `take(iterable, n)`: перші `n` значень, беручи з джерела **рівно** `n` (не більше) і жодного для `n <= 0`.\n- `chunk(iterable, size)`: масиви розміру `size` плюс останній коротший; `RangeError` для розмірів менше 1.\n- `zip(a, b)`: пари `[a, b]`, зупиняючись на коротшому вході й **закриваючи** інший ітератор (викликом його `return()`), щоб він міг прибрати за собою.\n\nНічого не повинно обчислюватися раніше, ніж його попросять.",
    ],
    files: { "/src/lazy.ts": LAZY_STARTER, "/index.ts": LAZY_INDEX },
    visibleFiles: ["/src/lazy.ts", "/index.ts"],
    activeFile: "/src/lazy.ts",
    tests: LAZY_TESTS,
    solution: { "/src/lazy.ts": LAZY_SOLUTION },
    explanation: [
      "Each helper is a generator that pulls from its source only when its own consumer pulls, so whole pipelines run one item at a time and infinite sources are fine. `take` checks the count **after** yielding, so it never requests an extra value, and returning from a `for…of` closes the source. `zip` manages two iterators by hand, so it calls `return()` itself in `finally`, mirroring what `for…of` does automatically.",
      "Кожен помічник є генератором, що бере з джерела лише тоді, коли бере його власний споживач, тож цілі конвеєри обробляють по одному елементу, і нескінченні джерела не проблема. `take` перевіряє лічильник **після** видачі значення, тож ніколи не просить зайвого, а вихід із `for…of` закриває джерело. `zip` керує двома ітераторами вручну, тож сам викликає `return()` у `finally`, повторюючи те, що `for…of` робить автоматично.",
    ],
  }),
  practice({
    slug: "ig-coroutine",
    skills: ["iterators-generators", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Build async/await from generators", "Створіть async/await з генераторів"],
    prompt: [
      "Before `async`/`await`, libraries like `co` ran generators as coroutines. Implement `run(genFn, ...args)` in `src/run.ts`:\n\n- Call `genFn(...args)` and drive the generator; return a promise of its **return value**.\n- Whenever it yields a promise (or any value), wait for it and resume the generator with the result via `next(result)`.\n- If a yielded promise rejects, **throw the error into the generator** with `throw(error)`, so `try/catch` inside it works; if the generator doesn't catch it, `run` rejects.\n- A yielded **array** waits for all of its items in parallel (like `Promise.all`) and sends back the array of results.\n- Errors thrown synchronously by the generator (even before its first `yield`) must reject the promise, never throw from `run` itself.",
      "До появи `async`/`await` бібліотеки на кшталт `co` виконували генератори як корутини. Реалізуйте `run(genFn, ...args)` у `src/run.ts`:\n\n- Викличте `genFn(...args)` і керуйте генератором; поверніть проміс його **поверненого значення**.\n- Щоразу, коли він видає проміс (або будь-яке значення), дочекайтеся його й продовжте генератор із результатом через `next(result)`.\n- Якщо виданий проміс відхиляється, **киньте помилку в генератор** через `throw(error)`, щоб усередині працював `try/catch`; якщо генератор її не перехопив, `run` відхиляється.\n- Виданий **масив** чекає на всі свої елементи паралельно (як `Promise.all`) і повертає масив результатів.\n- Помилки, які генератор кидає синхронно (навіть до першого `yield`), мають відхиляти проміс, а не кидатися з самого `run`.",
    ],
    files: { "/src/run.ts": RUN_STARTER, "/index.ts": RUN_INDEX },
    visibleFiles: ["/src/run.ts", "/index.ts"],
    activeFile: "/src/run.ts",
    tests: RUN_TESTS,
    solution: { "/src/run.ts": RUN_SOLUTION },
    explanation: [
      "A single `step(method, input)` function resumes the generator with either `next` (a result) or `throw` (an error), wrapped in `try/catch` so synchronous failures become rejections. Each yielded value goes through `Promise.resolve` (arrays through `Promise.all`), and its outcome schedules the next step. This is, almost line for line, how transpilers turned `async`/`await` into generators before engines supported it.",
      "Одна функція `step(method, input)` продовжує генератор або через `next` (результат), або через `throw` (помилка), обгорнута в `try/catch`, щоб синхронні збої ставали відхиленнями. Кожне видане значення проходить через `Promise.resolve` (масиви через `Promise.all`), а його результат планує наступний крок. Майже рядок у рядок так транспілятори перетворювали `async`/`await` на генератори, доки рушії їх не підтримували.",
    ],
  }),
]);
