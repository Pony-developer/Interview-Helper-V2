import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const LOOP_STARTER = String.raw`export type Callback = () => void;

export interface Loop {
  /** Simulated time in ms. Starts at 0 and jumps to each timer's due time when it runs. */
  readonly now: number;
  setTimeout(cb: Callback, delay?: number): number;
  clearTimeout(id: number): void;
  queueMicrotask(cb: Callback): void;
  /** Runs main as the first task, then everything it scheduled, like a real event loop. */
  run(main: Callback): void;
}

export function createLoop(): Loop {
  const timers: { id: number; cb: Callback; delay: number }[] = [];
  const microtasks: Callback[] = [];
  return {
    now: 0,
    setTimeout(cb, delay = 0) {
      timers.push({ id: timers.length + 1, cb, delay });
      return timers.length;
    },
    clearTimeout() {},
    queueMicrotask(cb) {
      microtasks.push(cb);
    },
    run(main) {
      main();
      // TODO: run microtasks and timers in the right order
    },
  };
}
`;

const LOOP_SOLUTION = String.raw`export type Callback = () => void;

export interface Loop {
  readonly now: number;
  setTimeout(cb: Callback, delay?: number): number;
  clearTimeout(id: number): void;
  queueMicrotask(cb: Callback): void;
  run(main: Callback): void;
}

type Timer = { id: number; due: number; seq: number; cb: Callback };

export function createLoop(): Loop {
  let now = 0;
  let nextId = 1;
  let seq = 0;
  let timers: Timer[] = [];
  const microtasks: Callback[] = [];

  // Drain completely: microtasks queued by microtasks run in the same pass.
  const drainMicrotasks = () => {
    while (microtasks.length) microtasks.shift()!();
  };

  return {
    get now() {
      return now;
    },
    setTimeout(cb, delay = 0) {
      const id = nextId++;
      timers.push({ id, due: now + Math.max(0, delay || 0), seq: seq++, cb });
      return id;
    },
    clearTimeout(id) {
      timers = timers.filter((t) => t.id !== id);
    },
    queueMicrotask(cb) {
      microtasks.push(cb);
    },
    run(main) {
      main(); // the script is the first task
      drainMicrotasks();
      while (timers.length) {
        // Earliest due time first; ties keep scheduling order.
        let next = timers[0];
        for (const t of timers) if (t.due < next.due || (t.due === next.due && t.seq < next.seq)) next = t;
        timers = timers.filter((t) => t !== next);
        now = Math.max(now, next.due);
        next.cb(); // one task…
        drainMicrotasks(); // …then all microtasks
      }
    },
  };
}
`;

const LOOP_INDEX = String.raw`import "./styles.css";
import { createLoop } from "./src/loop";

const loop = createLoop();
const log: string[] = [];
loop.run(() => {
  log.push("sync");
  loop.setTimeout(() => log.push("timeout"), 0);
  loop.queueMicrotask(() => log.push("micro"));
});
document.getElementById("app")!.innerHTML = '<h1>Event loop</h1><p>Order: <output id="order">' + log.join(" ") + "</output></p>";
`;

const LOOP_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { createLoop } from "../src/loop";

describe("createLoop", () => {
  it("runs the script, then microtasks, then timers", () => {
    const loop = createLoop();
    const log = [];
    loop.run(() => {
      loop.setTimeout(() => log.push("timer"), 0);
      loop.queueMicrotask(() => log.push("micro"));
      log.push("sync");
    });
    expect(log).toEqual(["sync", "micro", "timer"]);
  });
  it("drains microtasks queued by microtasks before the next timer", () => {
    const loop = createLoop();
    const log = [];
    loop.run(() => {
      loop.setTimeout(() => log.push("timer"), 0);
      loop.queueMicrotask(() => {
        log.push("m1");
        loop.queueMicrotask(() => log.push("m2"));
      });
    });
    expect(log).toEqual(["m1", "m2", "timer"]);
  });
  it("runs microtasks after each timer, before the next timer", () => {
    const loop = createLoop();
    const log = [];
    loop.run(() => {
      loop.setTimeout(() => log.push("t1"), 0);
      loop.setTimeout(() => {
        log.push("t2");
        loop.queueMicrotask(() => log.push("m"));
      }, 0);
      loop.setTimeout(() => log.push("t3"), 0);
    });
    expect(log).toEqual(["t1", "t2", "m", "t3"]);
  });
  it("orders timers by due time, then by scheduling order", () => {
    const loop = createLoop();
    const log = [];
    loop.run(() => {
      loop.setTimeout(() => log.push("a"), 10);
      loop.setTimeout(() => log.push("b"), 0);
      loop.setTimeout(() => log.push("c"), 10);
      loop.setTimeout(() => log.push("d"), 5);
    });
    expect(log).toEqual(["b", "d", "a", "c"]);
  });
  it("advances now and schedules nested timers from the current time", () => {
    const loop = createLoop();
    const seen = [];
    loop.run(() => {
      loop.setTimeout(() => {
        seen.push(loop.now);
        loop.setTimeout(() => seen.push(loop.now), 50);
      }, 100);
      loop.setTimeout(() => seen.push(loop.now), 120);
    });
    expect(seen).toEqual([100, 120, 150]);
  });
  it("cancels timers with clearTimeout, even from another timer", () => {
    const loop = createLoop();
    const log = [];
    loop.run(() => {
      const a = loop.setTimeout(() => log.push("a"), 5);
      loop.clearTimeout(a);
      let c = 0;
      loop.setTimeout(() => {
        log.push("b");
        loop.clearTimeout(c);
      }, 1);
      c = loop.setTimeout(() => log.push("c"), 2);
    });
    expect(log).toEqual(["b"]);
  });
  it("treats negative or missing delays as 0", () => {
    const loop = createLoop();
    const log = [];
    loop.run(() => {
      loop.setTimeout(() => log.push("later"), 1);
      loop.setTimeout(() => log.push("negative"), -20);
      loop.setTimeout(() => log.push("missing"));
    });
    expect(log).toEqual(["negative", "missing", "later"]);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("sync micro timeout")).id).toBe("order");
  });
});
`;

const CHUNKS_STARTER = String.raw`export type ChunkOptions = {
  /** Items per chunk (default 100). Must be a positive integer. */
  chunkSize?: number;
  /** Stops before the next chunk when aborted. */
  signal?: AbortSignal;
  /** How to give control back to the event loop between chunks (default: a 0 ms timeout). */
  yieldToLoop?: () => Promise<void>;
};

export async function processInChunks<T, R>(items: T[], fn: (item: T, index: number) => R, options: ChunkOptions = {}): Promise<R[]> {
  // TODO: this blocks the main thread until every item is processed
  return items.map((item, i) => fn(item, i));
}
`;

const CHUNKS_SOLUTION = String.raw`export type ChunkOptions = {
  chunkSize?: number;
  signal?: AbortSignal;
  yieldToLoop?: () => Promise<void>;
};

const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function processInChunks<T, R>(items: T[], fn: (item: T, index: number) => R, options: ChunkOptions = {}): Promise<R[]> {
  const { chunkSize = 100, signal, yieldToLoop = nextTask } = options;
  if (!Number.isInteger(chunkSize) || chunkSize < 1) throw new RangeError("chunkSize must be a positive integer");

  const results: R[] = [];
  for (let start = 0; start < items.length; start += chunkSize) {
    // A new task (not a microtask) lets input, timers and rendering run between chunks.
    if (start > 0) await yieldToLoop();
    if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
    const end = Math.min(start + chunkSize, items.length);
    for (let i = start; i < end; i++) results.push(fn(items[i], i));
  }
  return results;
}
`;

const CHUNKS_INDEX = String.raw`import "./styles.css";
import { processInChunks } from "./src/chunks";

const items = Array.from({ length: 50000 }, (_, i) => i);
let ticks = 0;
const timer = setInterval(() => ticks++, 0);
processInChunks(items, (n) => Math.sqrt(n), { chunkSize: 5000 }).then((out) => {
  clearInterval(timer);
  document.getElementById("app")!.innerHTML =
    '<h1>Chunked work</h1><p>Processed: <output id="count">' + out.length + "</output></p><p>Timer ticks while working: " + ticks + "</p>";
});
`;

const CHUNKS_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { processInChunks } from "../src/chunks";

describe("processInChunks", () => {
  it("returns results in order and passes the index", async () => {
    expect(await processInChunks([1, 2, 3, 4, 5], (x, i) => x * 10 + i, { chunkSize: 2 })).toEqual([10, 21, 32, 43, 54]);
  });
  it("yields between chunks, but not after the last one", async () => {
    let yields = 0;
    const yieldToLoop = async () => { yields++; };
    await processInChunks([1, 2, 3, 4, 5], (x) => x, { chunkSize: 2, yieldToLoop });
    expect(yields).toBe(2);
    yields = 0;
    expect(await processInChunks([], (x) => x, { chunkSize: 2, yieldToLoop })).toEqual([]);
    expect(yields).toBe(0);
  });
  it("returns before later chunks are processed", async () => {
    const done = [];
    const p = processInChunks([1, 2, 3], (x) => done.push(x), { chunkSize: 1 });
    expect(done).toEqual([1]);
    await p;
    expect(done).toEqual([1, 2, 3]);
  });
  it("lets other tasks run between chunks by default", async () => {
    let timerRan = false;
    setTimeout(() => { timerRan = true; }, 0);
    const seen = [];
    await processInChunks([1, 2, 3, 4], () => seen.push(timerRan), { chunkSize: 2 });
    expect(seen).toEqual([false, false, true, true]);
  });
  it("stops before the next chunk when aborted", async () => {
    const controller = new AbortController();
    const processed = [];
    const p = processInChunks([1, 2, 3, 4, 5, 6], (x) => {
      processed.push(x);
      if (x === 2) controller.abort();
    }, { chunkSize: 2, signal: controller.signal });
    let error = null;
    try { await p; } catch (e) { error = e; }
    expect(error && error.name).toBe("AbortError");
    expect(processed).toEqual([1, 2]);
  });
  it("rejects an invalid chunk size", async () => {
    await expect(processInChunks([1], (x) => x, { chunkSize: 0 })).rejects.toThrow();
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("50000", undefined, { timeout: 4000 })).id).toBe("count");
  });
});
`;

export default defineTasks([
  quiz(
    "el-settimeout-zero",
    ["event-loop"],
    1,
    60,
    ["What `setTimeout(fn, 0)` means", "Що означає `setTimeout(fn, 0)`"],
    ["When does `fn` run after `setTimeout(fn, 0)`?", "Коли виконається `fn` після `setTimeout(fn, 0)`?"],
    [
      ["Not before the current synchronous code and all pending microtasks finish; it's a new task", "Не раніше, ніж завершиться поточний синхронний код і всі мікрозадачі, що очікують; це нова задача"],
      ["Immediately, before the next line of code", "Негайно, ще до наступного рядка коду"],
      ["Exactly 0 ms later, interrupting whatever is running", "Рівно через 0 мс, перериваючи все, що виконується"],
      ["Right after the current function returns, before promise callbacks", "Одразу після повернення з поточної функції, до колбеків промісів"],
    ],
    "a",
    [
      "JavaScript runs to completion on one thread, so a timer can't interrupt running code. A 0 ms timer queues a task that runs after the current task and its microtasks, behind any tasks already queued. Browsers also clamp deeply nested timers to about 4 ms.",
      "JavaScript виконує код до кінця в одному потоці, тож таймер не може перервати код, що виконується. Таймер на 0 мс ставить у чергу задачу, що виконається після поточної задачі та її мікрозадач, позаду вже доданих задач. Браузери також обмежують глибоко вкладені таймери приблизно до 4 мс.",
    ],
  ),
  quiz(
    "el-executor-sync",
    ["event-loop", w("async-javascript")],
    2,
    60,
    ["The promise executor", "Виконавець промісу"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1 2 4 3`", "`1 2 4 3`"],
      ["`1 2 3 4`", "`1 2 3 4`"],
      ["`4 1 2 3`", "`4 1 2 3`"],
      ["`1 4 2 3`", "`1 4 2 3`"],
    ],
    "a",
    [
      "The function passed to `new Promise` runs synchronously, and calling `resolve` doesn't stop it, so `1` and `2` print first. `then` callbacks always run as microtasks, after the current synchronous code (`4`), even when the promise is already resolved.",
      "Функція, передана в `new Promise`, виконується синхронно, і виклик `resolve` її не зупиняє, тож спершу виводяться `1` і `2`. Колбеки `then` завжди виконуються як мікрозадачі, після поточного синхронного коду (`4`), навіть якщо проміс уже виконаний.",
    ],
    { code: "new Promise((resolve) => {\n  console.log(1);\n  resolve();\n  console.log(2);\n}).then(() => console.log(3));\nconsole.log(4);", codeLanguage: "js" },
  ),
  quiz(
    "el-await-splits",
    ["event-loop", w("async-javascript")],
    2,
    60,
    ["Where `await` pauses", "Де зупиняється `await`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`a b c d`", "`a b c d`"],
      ["`a c b d`", "`a c b d`"],
      ["`a b d c`", "`a b d c`"],
      ["`b a c d`", "`b a c d`"],
    ],
    "a",
    [
      "Calling an async function runs its body synchronously up to the first `await` (`b`). `await` then returns control to the caller (`c`), and the rest of the function (`d`) continues in a microtask, even when awaiting a non-promise value like `null`.",
      "Виклик async-функції виконує її тіло синхронно до першого `await` (`b`). Потім `await` повертає керування викликачу (`c`), а решта функції (`d`) продовжується в мікрозадачі, навіть якщо очікується не проміс, а значення на кшталт `null`.",
    ],
    { code: 'async function f() {\n  console.log("b");\n  await null;\n  console.log("d");\n}\nconsole.log("a");\nf();\nconsole.log("c");', codeLanguage: "js" },
  ),
  quiz(
    "el-try-catch-timer",
    ["event-loop", w("javascript")],
    2,
    90,
    ["try/catch and timers", "try/catch і таймери"],
    ["What happens?", "Що станеться?"],
    [
      ["`after` is logged, then the error is reported as uncaught; `caught` is never logged", "Виводиться `after`, потім помилку повідомляють як неперехоплену; `caught` не виводиться ніколи"],
      ["`caught` then `after`", "`caught`, потім `after`"],
      ["`after` then `caught`", "`after`, потім `caught`"],
      ["Nothing is logged; the error stops the script immediately", "Нічого не виводиться; помилка одразу зупиняє скрипт"],
    ],
    "a",
    [
      "`try/catch` only covers code that runs synchronously inside the `try` block. The timer callback runs later, in its own task, when the `try` has long finished, so the error escapes to the global handler. Catch inside the callback, or wrap the timer in a promise and `await` it inside `try`.",
      "`try/catch` охоплює лише код, що виконується синхронно всередині блоку `try`. Колбек таймера виконується пізніше, в окремій задачі, коли `try` давно завершився, тож помилка потрапляє до глобального обробника. Перехоплюйте всередині колбека або загорніть таймер у проміс і чекайте на нього через `await` усередині `try`.",
    ],
    { code: 'try {\n  setTimeout(() => {\n    throw new Error("boom");\n  }, 0);\n} catch (e) {\n  console.log("caught");\n}\nconsole.log("after");', codeLanguage: "js" },
  ),
  quiz(
    "el-nested-microtasks",
    ["event-loop"],
    3,
    90,
    ["Microtasks that queue microtasks", "Мікрозадачі, що додають мікрозадачі"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`p1 q p2 timeout`", "`p1 q p2 timeout`"],
      ["`p1 p2 q timeout`", "`p1 p2 q timeout`"],
      ["`q p1 p2 timeout`", "`q p1 p2 timeout`"],
      ["`p1 q timeout p2`", "`p1 q timeout p2`"],
    ],
    "a",
    [
      "Initially the microtask queue holds the `then` callback and the `queueMicrotask` callback, in that order. Running `p1` queues `p2` at the **back** of the queue, behind `q`. The loop drains the whole microtask queue, including newly added jobs, before it runs the timer task.",
      "Спочатку в черзі мікрозадач колбек `then` і колбек `queueMicrotask`, саме в такому порядку. Виконання `p1` додає `p2` у **кінець** черги, позаду `q`. Цикл вичерпує всю чергу мікрозадач, зокрема щойно додані, перш ніж виконати задачу таймера.",
    ],
    {
      code: 'setTimeout(() => console.log("timeout"));\nPromise.resolve().then(() => {\n  console.log("p1");\n  Promise.resolve().then(() => console.log("p2"));\n});\nqueueMicrotask(() => console.log("q"));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "el-interleaved-chains",
    ["event-loop", w("async-javascript")],
    3,
    90,
    ["Two promise chains", "Два ланцюжки промісів"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1 3 2 4`", "`1 3 2 4`"],
      ["`1 2 3 4`", "`1 2 3 4`"],
      ["`3 4 1 2`", "`3 4 1 2`"],
      ["`1 3 4 2`", "`1 3 4 2`"],
    ],
    "a",
    [
      "Each `then` callback is queued only when the previous promise in its chain settles. The first round of microtasks runs `1` and `3`; each of them resolves the next promise in its chain and queues `2` and `4` for the next round. Chains interleave step by step instead of running one after the other.",
      "Кожен колбек `then` стає в чергу лише тоді, коли завершується попередній проміс у його ланцюжку. Перший раунд мікрозадач виконує `1` і `3`; кожна з них виконує наступний проміс свого ланцюжка й додає `2` і `4` до наступного раунду. Ланцюжки чергуються крок за кроком, а не виконуються один за одним.",
    ],
    { code: "Promise.resolve()\n  .then(() => console.log(1))\n  .then(() => console.log(2));\nPromise.resolve()\n  .then(() => console.log(3))\n  .then(() => console.log(4));", codeLanguage: "js" },
  ),
  quiz(
    "el-microtask-between-timers",
    ["event-loop"],
    3,
    90,
    ["Microtasks between timers", "Мікрозадачі між таймерами"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`t1 t2 m t3`", "`t1 t2 m t3`"],
      ["`t1 t2 t3 m`", "`t1 t2 t3 m`"],
      ["`m t1 t2 t3`", "`m t1 t2 t3`"],
      ["`t1 m t2 t3`", "`t1 m t2 t3`"],
    ],
    "a",
    [
      "Each timer callback is a separate task, and the microtask queue is drained after every task. The promise queued inside `t2` therefore runs right after `t2` and before the `t3` task, not after all timers.",
      "Кожен колбек таймера є окремою задачею, а чергу мікрозадач вичерпують після кожної задачі. Тому проміс, доданий усередині `t2`, виконується одразу після `t2` і до задачі `t3`, а не після всіх таймерів.",
    ],
    {
      code: 'setTimeout(() => console.log("t1"), 0);\nsetTimeout(() => {\n  console.log("t2");\n  Promise.resolve().then(() => console.log("m"));\n}, 0);\nsetTimeout(() => console.log("t3"), 0);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "el-starvation",
    ["event-loop", w("web-performance")],
    4,
    120,
    ["Which loop freezes the page?", "Який цикл заморожує сторінку?"],
    ["Each function reschedules itself forever. Which one freezes the tab so clicks and painting stop?", "Кожна функція нескінченно перепланує себе. Яка з них заморозить вкладку, так що кліки й відмальовування припиняться?"],
    [
      ["`viaPromise`: the microtask queue never empties, so the loop never reaches rendering or input", "`viaPromise`: черга мікрозадач ніколи не порожніє, тож цикл ніколи не доходить до рендерингу чи введення"],
      ["`viaTimeout`: timers block rendering", "`viaTimeout`: таймери блокують рендеринг"],
      ["Both freeze the page equally", "Обидві однаково заморожують сторінку"],
      ["Neither, because both are asynchronous", "Жодна, бо обидві асинхронні"],
    ],
    "a",
    [
      "After a task, the event loop runs microtasks until the queue is empty. `viaPromise` adds a new microtask each time, so that never happens and the page hangs like a `while (true)` loop. `viaTimeout` queues a new *task* each time, and the loop can handle input and render between tasks (wasteful, but responsive).",
      "Після задачі цикл подій виконує мікрозадачі, доки черга не спорожніє. `viaPromise` щоразу додає нову мікрозадачу, тож цього не стається, і сторінка зависає, як від `while (true)`. `viaTimeout` щоразу додає нову *задачу*, і між задачами цикл може обробляти введення й рендерити (марнотратно, але чуйно).",
    ],
    { code: "function viaPromise() {\n  Promise.resolve().then(viaPromise);\n}\n\nfunction viaTimeout() {\n  setTimeout(viaTimeout, 0);\n}", codeLanguage: "js" },
  ),
  quiz(
    "el-async-classic",
    ["event-loop", w("async-javascript")],
    4,
    150,
    ["The classic ordering question", "Класичне питання про порядок"],
    ["What is the order of the logs?", "У якому порядку з'являться записи?"],
    [
      ["`script start`, `a1 start`, `a2`, `p1`, `script end`, `a1 end`, `p2`, `setTimeout`", "`script start`, `a1 start`, `a2`, `p1`, `script end`, `a1 end`, `p2`, `setTimeout`"],
      ["`script start`, `a1 start`, `a2`, `a1 end`, `p1`, `script end`, `p2`, `setTimeout`", "`script start`, `a1 start`, `a2`, `a1 end`, `p1`, `script end`, `p2`, `setTimeout`"],
      ["`script start`, `p1`, `script end`, `a1 start`, `a2`, `a1 end`, `p2`, `setTimeout`", "`script start`, `p1`, `script end`, `a1 start`, `a2`, `a1 end`, `p2`, `setTimeout`"],
      ["`script start`, `a1 start`, `a2`, `p1`, `script end`, `p2`, `a1 end`, `setTimeout`", "`script start`, `a1 start`, `a2`, `p1`, `script end`, `p2`, `a1 end`, `setTimeout`"],
    ],
    "a",
    [
      "Synchronous part: `script start`, then `a1` runs until its `await` (`a1 start`, and `a2` runs synchronously), then the promise executor (`p1`) and `script end`. The `await` continuation was queued before `.then(p2)`, so microtasks print `a1 end` then `p2`. The timer task comes last.",
      "Синхронна частина: `script start`, потім `a1` виконується до свого `await` (`a1 start`, а `a2` виконується синхронно), потім виконавець промісу (`p1`) і `script end`. Продовження після `await` потрапило в чергу раніше за `.then(p2)`, тож мікрозадачі виводять `a1 end`, потім `p2`. Задача таймера йде останньою.",
    ],
    {
      code: 'async function a1() {\n  console.log("a1 start");\n  await a2();\n  console.log("a1 end");\n}\nasync function a2() {\n  console.log("a2");\n}\nconsole.log("script start");\nsetTimeout(() => console.log("setTimeout"), 0);\na1();\nnew Promise((resolve) => {\n  console.log("p1");\n  resolve();\n}).then(() => console.log("p2"));\nconsole.log("script end");',
      codeLanguage: "js",
    },
  ),
  quiz(
    "el-await-thenable",
    ["event-loop", w("async-javascript")],
    5,
    180,
    ["Awaiting a thenable", "Очікування thenable"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`start sync then-called p x`", "`start sync then-called p x`"],
      ["`start then-called x sync p`", "`start then-called x sync p`"],
      ["`start sync p then-called x`", "`start sync p then-called x`"],
      ["`start sync then-called x p`", "`start sync then-called x p`"],
    ],
    "a",
    [
      "`await` wraps a non-promise thenable in a new promise, which calls the thenable's `then` in a separate microtask (a resolve-thenable job), not synchronously. So `then-called` runs in the first microtask round together with `p`; calling `resolve(\"x\")` then queues the async function's continuation, which runs one round later. Awaiting a native promise skips that extra job.",
      "`await` загортає не нативний thenable у новий проміс, який викликає `then` цього thenable в окремій мікрозадачі (завдання resolve-thenable), а не синхронно. Тож `then-called` виконується в першому раунді мікрозадач разом із `p`; виклик `resolve(\"x\")` потім ставить у чергу продовження async-функції, яке виконується раундом пізніше. Очікування нативного промісу обходиться без цього додаткового завдання.",
    ],
    {
      code: 'const thenable = {\n  then(resolve) {\n    console.log("then-called");\n    resolve("x");\n  },\n};\n(async () => {\n  console.log("start");\n  console.log(await thenable);\n})();\nPromise.resolve().then(() => console.log("p"));\nconsole.log("sync");',
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "el-loop-simulator",
    skills: ["event-loop", w("async-javascript"), w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Simulate the event loop", "Симуляція циклу подій"],
    prompt: [
      "Build a tiny, synchronous **event-loop simulator** in `src/loop.ts`. `createLoop()` returns:\n\n- `setTimeout(cb, delay = 0)` → an id; negative or missing delays count as `0`. `clearTimeout(id)` cancels a pending timer.\n- `queueMicrotask(cb)`.\n- `now`: simulated time in ms, starting at `0`.\n- `run(main)`: runs `main` as the first task, then:\n  1. after **every** task, drain **all** microtasks (including ones queued by microtasks);\n  2. pick the timer with the earliest due time (`now + delay` when it was scheduled); ties go to the one scheduled first;\n  3. set `now` to its due time, run it, drain microtasks, repeat until no timers are left.\n\nNo real timers: everything happens inside `run`.",
      "Створіть невеликий синхронний **симулятор циклу подій** у `src/loop.ts`. `createLoop()` повертає:\n\n- `setTimeout(cb, delay = 0)` → id; від'ємна чи відсутня затримка вважається `0`. `clearTimeout(id)` скасовує таймер, що очікує.\n- `queueMicrotask(cb)`.\n- `now`: змодельований час у мс, починаючи з `0`.\n- `run(main)`: виконує `main` як першу задачу, а потім:\n  1. після **кожної** задачі вичерпує **всі** мікрозадачі (зокрема додані іншими мікрозадачами);\n  2. обирає таймер із найранішим часом спрацювання (`now + delay` на момент планування); за рівності перемагає той, що запланований раніше;\n  3. встановлює `now` на цей час, виконує таймер, вичерпує мікрозадачі й повторює, доки таймери не скінчаться.\n\nСправжніх таймерів немає: усе відбувається всередині `run`.",
    ],
    files: { "/src/loop.ts": LOOP_STARTER, "/index.ts": LOOP_INDEX },
    visibleFiles: ["/src/loop.ts", "/index.ts"],
    activeFile: "/src/loop.ts",
    tests: LOOP_TESTS,
    solution: { "/src/loop.ts": LOOP_SOLUTION },
    explanation: [
      "The simulator mirrors the real model: the script is a task; after each task the microtask queue is drained with a `while` loop, so microtasks added during draining still run before the next task; timers are picked by due time with a sequence number as a tie-breaker. Computing `due` when a timer is scheduled (from the current `now`) is what makes nested timers fire at the right simulated time.",
      "Симулятор відтворює справжню модель: скрипт є задачею; після кожної задачі черга мікрозадач вичерпується циклом `while`, тож мікрозадачі, додані під час вичерпування, теж виконуються до наступної задачі; таймери обираються за часом спрацювання з порядковим номером для рівних випадків. Обчислення `due` в момент планування (від поточного `now`) змушує вкладені таймери спрацьовувати у правильний змодельований час.",
    ],
  }),
  practice({
    slug: "el-chunked-work",
    skills: ["event-loop", w("web-performance"), w("async-javascript")],
    complexity: 4,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Break up a long task", "Розбийте довгу задачу"],
    prompt: [
      "`processInChunks(items, fn, options)` in `src/chunks.ts` currently processes everything in one go and freezes the page for large inputs. Rewrite it so it doesn't block the main thread:\n\n- Process `chunkSize` items at a time (default `100`) and resolve with all results, in order. `fn` receives `(item, index)`.\n- Between chunks, `await options.yieldToLoop()`, which defaults to a **new task** (`setTimeout(…, 0)`), so input, timers and rendering can run. Don't yield after the last chunk or for an empty list.\n- The first chunk runs synchronously when the function is called.\n- If `options.signal` is aborted, stop before the next chunk and reject with `signal.reason` (an `AbortError`).\n- Reject with a `RangeError` if `chunkSize` isn't a positive integer.",
      "`processInChunks(items, fn, options)` у `src/chunks.ts` зараз обробляє все за один раз і заморожує сторінку на великих даних. Перепишіть функцію, щоб вона не блокувала головний потік:\n\n- Обробляйте по `chunkSize` елементів (за замовчуванням `100`) і повертайте всі результати в тому ж порядку. `fn` отримує `(item, index)`.\n- Між частинами виконуйте `await options.yieldToLoop()`, що за замовчуванням створює **нову задачу** (`setTimeout(…, 0)`), щоб могли виконатися введення, таймери й рендеринг. Не поступайтеся після останньої частини чи для порожнього списку.\n- Перша частина виконується синхронно під час виклику функції.\n- Якщо `options.signal` скасовано, зупиніться перед наступною частиною й відхиліть проміс із `signal.reason` (`AbortError`).\n- Відхиліть із `RangeError`, якщо `chunkSize` не є додатним цілим числом.",
    ],
    files: { "/src/chunks.ts": CHUNKS_STARTER, "/index.ts": CHUNKS_INDEX },
    visibleFiles: ["/src/chunks.ts", "/index.ts"],
    activeFile: "/src/chunks.ts",
    tests: CHUNKS_TESTS,
    solution: { "/src/chunks.ts": CHUNKS_SOLUTION },
    explanation: [
      "Awaiting a 0 ms timeout ends the current task, so the browser can handle input and paint before the next chunk; awaiting a resolved promise would only yield to microtasks and still block rendering. Checking the signal before each chunk makes cancellation cheap. `scheduler.yield()` is a newer alternative that keeps the continuation at a higher priority.",
      "Очікування таймера на 0 мс завершує поточну задачу, тож браузер може обробити введення й відмалювати кадр до наступної частини; очікування виконаного промісу поступилося б лише мікрозадачам і все одно блокувало б рендеринг. Перевірка сигналу перед кожною частиною робить скасування дешевим. `scheduler.yield()` є новішою альтернативою, що зберігає продовженню вищий пріоритет.",
    ],
  }),
]);
