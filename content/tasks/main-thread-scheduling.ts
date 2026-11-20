import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const CHUNK_STARTER = String.raw`export type ChunkOptions = {
  /** Milliseconds of work before yielding. */
  budgetMs?: number;
  now?: () => number;
  /** Gives the browser a chance to handle input and render. */
  yieldToMain?: () => Promise<void>;
  signal?: AbortSignal;
  /** Called after each chunk with the number of items processed so far. */
  onProgress?: (done: number) => void;
};

export function defaultYield(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0)); // TODO: prefer scheduler.yield when available
}

/** Maps items with fn without blocking the main thread for longer than budgetMs at a time. */
export async function processInChunks<T, R>(items: Iterable<T>, fn: (item: T, index: number) => R, options: ChunkOptions = {}): Promise<R[]> {
  // TODO: this blocks until everything is done
  const results: R[] = [];
  let i = 0;
  for (const item of items) results.push(fn(item, i++));
  options.onProgress?.(results.length);
  return results;
}
`;

const CHUNK_SOLUTION = String.raw`export type ChunkOptions = {
  budgetMs?: number;
  now?: () => number;
  yieldToMain?: () => Promise<void>;
  signal?: AbortSignal;
  onProgress?: (done: number) => void;
};

export function defaultYield(): Promise<void> {
  const scheduler = (globalThis as any).scheduler;
  if (typeof scheduler?.yield === "function") return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function processInChunks<T, R>(
  items: Iterable<T>,
  fn: (item: T, index: number) => R,
  { budgetMs = 8, now = () => performance.now(), yieldToMain = defaultYield, signal, onProgress }: ChunkOptions = {},
): Promise<R[]> {
  signal?.throwIfAborted();
  const results: R[] = [];
  const iterator = items[Symbol.iterator]();
  let next = iterator.next();
  let deadline = now() + budgetMs;
  while (!next.done) {
    results.push(fn(next.value, results.length));
    next = iterator.next();
    // Check the clock after each item (so every chunk makes progress), and only yield if work remains.
    if (!next.done && now() >= deadline) {
      onProgress?.(results.length);
      await yieldToMain();
      signal?.throwIfAborted();
      deadline = now() + budgetMs;
    }
  }
  onProgress?.(results.length);
  return results;
}
`;

const CHUNK_INDEX = String.raw`import "./styles.css";
import { processInChunks } from "./src/chunks";

document.getElementById("app")!.innerHTML =
  '<h1>Chunked work</h1><button id="go">Process 200,000 items</button> <button id="stop">Stop</button><p id="status">idle</p><p>Type here while it runs: <input /></p>';
const status = document.getElementById("status")!;
let controller: AbortController | null = null;
document.getElementById("go")!.addEventListener("click", async () => {
  controller = new AbortController();
  const items = Array.from({ length: 200_000 }, (_, i) => i);
  try {
    const out = await processInChunks(items, (n) => Math.sqrt(n) * Math.sin(n), {
      signal: controller.signal,
      onProgress: (done) => (status.textContent = done + " / " + items.length),
    });
    status.textContent = "done: " + out.length;
  } catch (e) {
    status.textContent = "stopped: " + (e as Error).name;
  }
});
document.getElementById("stop")!.addEventListener("click", () => controller?.abort());
`;

const CHUNK_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { processInChunks } from "../src/chunks";

function fakeClock(stepPerItem) {
  const clock = { t: 0 };
  const work = fn((x) => {
    clock.t += stepPerItem;
    return x * 2;
  });
  return { clock, work, now: () => clock.t };
}

describe("processInChunks", () => {
  it("returns every result in order", async () => {
    const { work, now } = fakeClock(1);
    const yields = fn(async () => {});
    expect(await processInChunks([1, 2, 3], work, { now, yieldToMain: yields })).toEqual([2, 4, 6]);
  });
  it("yields when the time budget is used up", async () => {
    const { work, now } = fakeClock(3);
    const yields = fn(async () => {});
    const progress = [];
    await processInChunks([1, 2, 3, 4, 5, 6, 7], work, { budgetMs: 8, now, yieldToMain: yields, onProgress: (d) => progress.push(d) });
    expect(yields).toHaveBeenCalledTimes(2);
    expect(progress).toEqual([3, 6, 7]);
  });
  it("doesn't yield after the last item", async () => {
    const { work, now } = fakeClock(10);
    const yields = fn(async () => {});
    await processInChunks([1, 2, 3], work, { budgetMs: 5, now, yieldToMain: yields });
    expect(yields).toHaveBeenCalledTimes(2);
  });
  it("still makes progress with a zero budget", async () => {
    const { work, now } = fakeClock(0);
    const yields = fn(async () => {});
    expect(await processInChunks([1, 2, 3, 4], work, { budgetMs: 0, now, yieldToMain: yields })).toEqual([2, 4, 6, 8]);
    expect(yields).toHaveBeenCalledTimes(3);
  });
  it("works with any iterable and passes the index", async () => {
    const seen = [];
    const result = await processInChunks(new Set(["a", "b"]), (x, i) => { seen.push(i); return x.toUpperCase(); }, { yieldToMain: async () => {} });
    expect(result).toEqual(["A", "B"]);
    expect(seen).toEqual([0, 1]);
  });
  it("stops at the next yield when aborted", async () => {
    const { work, now } = fakeClock(5);
    const controller = new AbortController();
    const yields = fn(async () => controller.abort(new Error("cancelled")));
    let error;
    try {
      await processInChunks([1, 2, 3, 4, 5, 6], work, { budgetMs: 8, now, yieldToMain: yields, signal: controller.signal });
    } catch (e) {
      error = e;
    }
    expect(error.message).toBe("cancelled");
    expect(work).toHaveBeenCalledTimes(2);
  });
  it("doesn't start when already aborted", async () => {
    const work = fn((x) => x);
    const controller = new AbortController();
    controller.abort();
    let error;
    try {
      await processInChunks([1], work, { signal: controller.signal });
    } catch (e) {
      error = e;
    }
    expect(error.name).toBe("AbortError");
    expect(work).toHaveBeenCalledTimes(0);
  });
  it("uses a real yield by default", async () => {
    let i = 0;
    const result = await processInChunks([1, 2, 3], (x) => x + i++, { budgetMs: 0 });
    expect(result).toEqual([1, 3, 5]);
  });
});
`;

const BATCH_STARTER = String.raw`type Job = () => unknown;

/**
 * Batches DOM work per frame: in each frame, run every queued measure (read) first, then every mutate (write).
 * requestFrame defaults to requestAnimationFrame and is injectable for tests.
 */
export function createFrameBatcher(requestFrame: (cb: () => void) => void = (cb) => requestAnimationFrame(() => cb())) {
  // TODO: runs jobs immediately, so reads and writes interleave and force layouts
  return {
    measure<T>(job: () => T): Promise<T> {
      return Promise.resolve().then(job);
    },
    mutate<T>(job: () => T): Promise<T> {
      return Promise.resolve().then(job);
    },
  };
}
`;

const BATCH_SOLUTION = String.raw`type Entry = { job: () => unknown; resolve: (value: any) => void; reject: (reason: unknown) => void };

export function createFrameBatcher(requestFrame: (cb: () => void) => void = (cb) => requestAnimationFrame(() => cb())) {
  let reads: Entry[] = [];
  let writes: Entry[] = [];
  let scheduled = false;

  const run = (entries: Entry[]) => {
    for (const { job, resolve, reject } of entries) {
      try {
        resolve(job());
      } catch (error) {
        reject(error); // one failing job doesn't stop the others
      }
    }
  };

  const flush = () => {
    scheduled = false;
    // Take the current queues; anything queued while flushing waits for the next frame.
    const currentReads = reads;
    const currentWrites = writes;
    reads = [];
    writes = [];
    run(currentReads); // all reads first: layout is computed at most once
    run(currentWrites); // then all writes
  };

  const enqueue = <T>(queue: () => Entry[], job: () => T) =>
    new Promise<T>((resolve, reject) => {
      queue().push({ job, resolve, reject });
      if (!scheduled) {
        scheduled = true;
        requestFrame(flush);
      }
    });

  return {
    measure: <T>(job: () => T) => enqueue(() => reads, job),
    mutate: <T>(job: () => T) => enqueue(() => writes, job),
  };
}
`;

const BATCH_INDEX = String.raw`import "./styles.css";
import { createFrameBatcher } from "./src/batcher";

const batcher = createFrameBatcher();
document.getElementById("app")!.innerHTML =
  '<h1>Read/write batching</h1><button id="go">Square the boxes</button><div id="boxes"></div><pre id="out"></pre>';
const boxes = document.getElementById("boxes")!;
for (let i = 0; i < 20; i++) {
  const div = document.createElement("div");
  div.style.cssText = "display:inline-block;margin:2px;background:#8ab4f8;height:20px;width:" + (20 + i * 4) + "px";
  boxes.appendChild(div);
}
document.getElementById("go")!.addEventListener("click", async () => {
  const start = performance.now();
  await Promise.all(
    [...boxes.children].map(async (el) => {
      const width = await batcher.measure(() => (el as HTMLElement).offsetWidth);
      await batcher.mutate(() => ((el as HTMLElement).style.height = width + "px"));
    }),
  );
  document.getElementById("out")!.textContent = "done in " + (performance.now() - start).toFixed(1) + " ms";
});
`;

const BATCH_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createFrameBatcher } from "../src/batcher";

function setup() {
  const frames = [];
  const batcher = createFrameBatcher((cb) => frames.push(cb));
  const nextFrame = async () => {
    frames.shift()();
    await Promise.resolve();
    await Promise.resolve();
  };
  return { batcher, frames, nextFrame };
}

describe("createFrameBatcher", () => {
  it("waits for a frame and requests only one per batch", async () => {
    const { batcher, frames, nextFrame } = setup();
    const log = [];
    batcher.measure(() => log.push("read"));
    batcher.mutate(() => log.push("write"));
    batcher.measure(() => log.push("read 2"));
    await Promise.resolve();
    expect(log).toEqual([]);
    expect(frames.length).toBe(1);
    await nextFrame();
    expect(log.length).toBe(3);
  });
  it("runs all reads before all writes, each in order", async () => {
    const { batcher, nextFrame } = setup();
    const log = [];
    batcher.mutate(() => log.push("write A"));
    batcher.measure(() => log.push("read B"));
    batcher.mutate(() => log.push("write C"));
    batcher.measure(() => log.push("read D"));
    await nextFrame();
    expect(log).toEqual(["read B", "read D", "write A", "write C"]);
  });
  it("resolves each job with its result", async () => {
    const { batcher, nextFrame } = setup();
    const width = batcher.measure(() => 120);
    const done = batcher.mutate(() => "styled");
    await nextFrame();
    expect(await width).toBe(120);
    expect(await done).toBe("styled");
  });
  it("defers jobs queued during a flush to the next frame", async () => {
    const { batcher, frames, nextFrame } = setup();
    const log = [];
    batcher.measure(() => {
      log.push("read");
      batcher.mutate(() => log.push("write queued by read"));
    });
    await nextFrame();
    expect(log).toEqual(["read"]);
    expect(frames.length).toBe(1);
    await nextFrame();
    expect(log).toEqual(["read", "write queued by read"]);
  });
  it("isolates errors", async () => {
    const { batcher, nextFrame } = setup();
    const bad = batcher.measure(() => { throw new Error("layout failed"); });
    const good = batcher.mutate(() => "ok");
    const outcome = bad.then(() => "resolved", (e) => e.message);
    await nextFrame();
    expect(await outcome).toBe("layout failed");
    expect(await good).toBe("ok");
  });
  it("doesn't request frames when idle", async () => {
    const { batcher, frames, nextFrame } = setup();
    batcher.measure(() => 1);
    await nextFrame();
    expect(frames.length).toBe(0);
  });
});
`;

export default defineTasks([
  quiz(
    "sched-long-task",
    ["main-thread-scheduling", w("web-performance")],
    1,
    45,
    ["What counts as a long task?", "Що вважається довгою задачею?"],
    ["Browsers report main-thread tasks as \"long tasks\" above which duration?", "Понад яку тривалість браузери позначають задачі головного потоку як «довгі»?"],
    [
      ["50 ms", "50 мс"],
      ["16.7 ms", "16,7 мс"],
      ["200 ms", "200 мс"],
      ["1 second", "1 секунда"],
    ],
    "a",
    [
      "A task over 50 ms is a long task. The threshold comes from the RAIL model: to respond to input within about 100 ms, work has to be split into chunks of about 50 ms, so input waiting behind a chunk is still handled quickly. 16.7 ms is one frame at 60 Hz, and 200 ms is the \"good\" threshold for INP, which measures whole interactions.",
      "Задача понад 50 мс є довгою. Поріг походить із моделі RAIL: щоб відповідати на введення приблизно за 100 мс, роботу треба ділити на частини близько 50 мс, тоді введення, що чекає за такою частиною, все одно обробляється швидко. 16,7 мс є одним кадром при 60 Гц, а 200 мс є порогом «доброго» INP, що вимірює взаємодії цілком.",
    ],
  ),
  quiz(
    "sched-inp",
    ["main-thread-scheduling", w("web-performance")],
    2,
    75,
    ["What INP measures", "Що вимірює INP"],
    ["Interaction to Next Paint (INP) is high on a product page. What does it measure?", "Interaction to Next Paint (INP) на сторінці товару високий. Що він вимірює?"],
    [
      ["The time from a user interaction (click, tap, key press) until the next frame is painted, including waiting for busy main-thread tasks, the handlers and rendering", "Час від взаємодії користувача (натискання, дотик, клавіша) до малювання наступного кадру, зокрема очікування зайнятих задач головного потоку, обробники й рендер"],
      ["How long the largest image takes to load", "Скільки триває завантаження найбільшого зображення"],
      ["How much the layout shifts after loading", "Наскільки зсувається розмітка після завантаження"],
      ["The time until the first byte arrives from the server", "Час до отримання першого байта від сервера"],
    ],
    "a",
    [
      "INP observes interactions throughout the visit and reports roughly the worst one. Each interaction's latency has three parts: **input delay** (waiting for whatever task is running), **processing** (your event handlers) and **presentation** (style, layout, paint). Long tasks inflate the first, heavy handlers the second, and large DOM updates the third. The other options describe LCP, CLS and TTFB.",
      "INP спостерігає за взаємодіями протягом усього візиту й повідомляє приблизно найгіршу. Затримка кожної взаємодії має три частини: **затримка введення** (очікування задачі, що виконується), **обробка** (ваші обробники подій) і **показ** (стилі, розмітка, малювання). Довгі задачі збільшують першу, важкі обробники другу, а великі оновлення DOM третю. Інші варіанти описують LCP, CLS і TTFB.",
    ],
  ),
  quiz(
    "sched-microtasks-dont-yield",
    ["main-thread-scheduling", w("event-loop")],
    3,
    90,
    ["\"Yielding\" with a resolved promise", "«Поступка потоку» через розв'язаний проміс"],
    ["A timer is queued, then a loop awaits a resolved promise between chunks. What does this print?", "У чергу ставиться таймер, а потім цикл між частинами чекає на розв'язаний проміс. Що виведе цей код?"],
    [
      ["`chunk 0, chunk 1, chunk 2, timer`", "`chunk 0, chunk 1, chunk 2, timer`"],
      ["`chunk 0, timer, chunk 1, chunk 2`", "`chunk 0, timer, chunk 1, chunk 2`"],
      ["`timer, chunk 0, chunk 1, chunk 2`", "`timer, chunk 0, chunk 1, chunk 2`"],
      ["`chunk 0, timer, chunk 1, timer, chunk 2`", "`chunk 0, timer, chunk 1, timer, chunk 2`"],
    ],
    "a",
    [
      "`await Promise.resolve()` continues in a **microtask**, and microtasks run before the event loop picks the next task, so the timer (and, in a browser, input handling and rendering) can't run until the whole loop finishes. Making a function `async` doesn't make it cooperative. To really yield, wait for a new task: `scheduler.yield()`, `setTimeout`, or a `MessageChannel` message.",
      "`await Promise.resolve()` продовжується в **мікрозадачі**, а мікрозадачі виконуються до того, як цикл подій візьме наступну задачу, тож таймер (а в браузері й обробка введення та рендер) не може виконатися, доки не завершиться весь цикл. Позначення функції як `async` не робить її кооперативною. Щоб справді поступитися потоком, чекайте на нову задачу: `scheduler.yield()`, `setTimeout` чи повідомлення `MessageChannel`.",
    ],
    {
      code: 'const log = [];\nsetTimeout(() => log.push("timer"), 0);\nfor (let i = 0; i < 3; i++) {\n  log.push("chunk " + i);\n  await Promise.resolve();\n}\nawait new Promise((r) => setTimeout(r, 5));\nconsole.log(log.join(", "));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "sched-timeout-yields",
    ["main-thread-scheduling", w("event-loop")],
    3,
    90,
    ["Yielding with a timer", "Поступка потоку через таймер"],
    ["Now the loop waits for a `setTimeout` between chunks. What does this print?", "Тепер цикл між частинами чекає на `setTimeout`. Що виведе цей код?"],
    [
      ["`chunk 0, timer, chunk 1, chunk 2`", "`chunk 0, timer, chunk 1, chunk 2`"],
      ["`chunk 0, chunk 1, chunk 2, timer`", "`chunk 0, chunk 1, chunk 2, timer`"],
      ["`timer, chunk 0, chunk 1, chunk 2`", "`timer, chunk 0, chunk 1, chunk 2`"],
      ["`chunk 0, timer, chunk 1, timer, chunk 2`", "`chunk 0, timer, chunk 1, timer, chunk 2`"],
    ],
    "a",
    [
      "Awaiting a `setTimeout` ends the current task, and the continuation is queued **behind** tasks that were already waiting, so the earlier timer runs after the first chunk. In a browser, pending input events and rendering get their turn at the same point. The downside is that the continuation waits behind everything else; `scheduler.yield()` lets the browser handle input but resumes your work ahead of other queued tasks.",
      "Очікування `setTimeout` завершує поточну задачу, а продовження стає в чергу **за** задачами, що вже чекали, тож попередній таймер виконується після першої частини. У браузері в цей самий момент свою чергу отримують події введення, що очікують, і рендер. Недолік у тому, що продовження чекає за всім іншим; `scheduler.yield()` дає браузеру обробити введення, але продовжує вашу роботу перед іншими задачами в черзі.",
    ],
    {
      code: 'const log = [];\nsetTimeout(() => log.push("timer"), 0);\nfor (let i = 0; i < 3; i++) {\n  log.push("chunk " + i);\n  await new Promise((r) => setTimeout(r, 0));\n}\nconsole.log(log.join(", "));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "sched-raf",
    ["main-thread-scheduling", w("animations")],
    2,
    60,
    ["Animating a progress bar", "Анімація смуги прогресу"],
    ["You animate a progress bar's width with JavaScript. Which scheduling primitive should drive the updates?", "Ви анімуєте ширину смуги прогресу через JavaScript. Який засіб планування має керувати оновленнями?"],
    [
      ["`requestAnimationFrame`, computing progress from its timestamp", "`requestAnimationFrame`, обчислюючи прогрес за його часовою позначкою"],
      ["`setInterval(update, 16)`", "`setInterval(update, 16)`"],
      ["`requestIdleCallback`", "`requestIdleCallback`"],
      ["`queueMicrotask` in a loop", "`queueMicrotask` у циклі"],
    ],
    "a",
    [
      "`requestAnimationFrame` runs right before each paint, at the display's refresh rate, and pauses in background tabs. A 16 ms interval drifts out of sync with frames (causing skipped or doubled frames) and keeps running in the background. Idle callbacks may not run at all on a busy page, and a microtask loop blocks rendering entirely. Better still, animate `transform` with CSS when you can.",
      "`requestAnimationFrame` виконується безпосередньо перед кожним малюванням із частотою оновлення екрана й призупиняється у фонових вкладках. Інтервал 16 мс розсинхронізується з кадрами (кадри пропускаються чи дублюються) і продовжує працювати у фоні. Idle-колбеки на зайнятій сторінці можуть не виконатися взагалі, а цикл мікрозадач повністю блокує рендер. Ще краще анімувати `transform` через CSS, коли це можливо.",
    ],
  ),
  quiz(
    "sched-idle-callback",
    ["main-thread-scheduling"],
    2,
    75,
    ["Low-priority work", "Низькопріоритетна робота"],
    ["You want to send batched analytics events without competing with user interactions, but they must be sent within a few seconds. What fits best?", "Ви хочете надсилати згруповані події аналітики, не конкуруючи з взаємодіями користувача, але їх треба надіслати протягом кількох секунд. Що підходить найкраще?"],
    [
      ["`requestIdleCallback(send, { timeout: 2000 })`, with a fallback where it isn't supported", "`requestIdleCallback(send, { timeout: 2000 })` із запасним варіантом там, де його немає"],
      ["`requestAnimationFrame(send)`", "`requestAnimationFrame(send)`"],
      ["Send synchronously inside every click handler", "Надсилати синхронно в кожному обробнику натискання"],
      ["`requestIdleCallback(send)` with no timeout", "`requestIdleCallback(send)` без тайм-ауту"],
    ],
    "a",
    [
      "Idle callbacks run when the browser has nothing more important to do, so they don't delay interactions or frames. The `timeout` guarantees the callback runs eventually even on a page that's never idle; without it, events could be delayed indefinitely. `requestAnimationFrame` is for visual work. Also flush pending events on `visibilitychange` (with `navigator.sendBeacon`), because idle callbacks may never fire before the user leaves.",
      "Idle-колбеки виконуються, коли браузерові немає чого важливішого робити, тож не затримують взаємодії чи кадри. `timeout` гарантує, що колбек колись виконається навіть на сторінці, яка ніколи не простоює; без нього події могли б затримуватися безкінечно. `requestAnimationFrame` призначений для візуальної роботи. Також надсилайте події, що очікують, на `visibilitychange` (через `navigator.sendBeacon`), бо idle-колбеки можуть так і не спрацювати до того, як користувач піде.",
    ],
  ),
  quiz(
    "sched-layout-thrashing",
    ["main-thread-scheduling", w("dom-events")],
    3,
    90,
    ["Forced synchronous layout", "Примусовий синхронний перерахунок розмітки"],
    ["Which loop forces the browser to recalculate layout on every iteration?", "Який цикл змушує браузер перераховувати розмітку на кожній ітерації?"],
    [
      ["`for (const el of items) el.style.height = el.offsetWidth / 2 + \"px\";`", "`for (const el of items) el.style.height = el.offsetWidth / 2 + \"px\";`"],
      ["`const w = items.map((el) => el.offsetWidth); items.forEach((el, i) => (el.style.height = w[i] / 2 + \"px\"));`", "`const w = items.map((el) => el.offsetWidth); items.forEach((el, i) => (el.style.height = w[i] / 2 + \"px\"));`"],
      ["`items.forEach((el) => el.classList.add(\"square\"));`", "`items.forEach((el) => el.classList.add(\"square\"));`"],
      ["`items.forEach((el) => (el.style.transform = \"scale(1.1)\"));`", "`items.forEach((el) => (el.style.transform = \"scale(1.1)\"));`"],
    ],
    "a",
    [
      "In the first loop, each write (`style.height`) invalidates layout, and the next read (`offsetWidth`) forces the browser to compute it again synchronously: N layouts instead of one. Reading everything first and then writing everything (the second option) needs at most one layout. Pure writes, like adding classes or setting transforms, are batched by the browser until the next frame.",
      "У першому циклі кожен запис (`style.height`) робить розмітку недійсною, а наступне читання (`offsetWidth`) змушує браузер знову синхронно її обчислити: N перерахунків замість одного. Спершу прочитати все, а потім усе записати (другий варіант) потребує щонайбільше одного перерахунку. Самі лише записи, як-от додавання класів чи встановлення трансформацій, браузер групує до наступного кадру.",
    ],
  ),
  quiz(
    "sched-time-budget",
    ["main-thread-scheduling"],
    3,
    75,
    ["When to yield", "Коли поступатися потоком"],
    ["A loop processes 100,000 items of varying cost. Why yield on a time budget (for example every 5–10 ms) instead of every 1,000 items?", "Цикл обробляє 100 000 елементів різної вартості. Чому варто поступатися потоком за бюджетом часу (наприклад, кожні 5–10 мс), а не кожні 1000 елементів?"],
    [
      ["Item costs vary and devices differ, so a fixed count can produce long tasks on slow devices and needless yields on fast ones; a time budget adapts", "Вартість елементів різна, і пристрої відрізняються, тож фіксована кількість може створювати довгі задачі на повільних пристроях і зайві поступки на швидких; бюджет часу підлаштовується"],
      ["Reading `performance.now()` makes the loop faster", "Читання `performance.now()` пришвидшує цикл"],
      ["Browsers reject tasks that process more than 1,000 items", "Браузери відхиляють задачі, що обробляють понад 1000 елементів"],
      ["Time budgets avoid the need for `await`", "Бюджет часу прибирає потребу в `await`"],
    ],
    "a",
    [
      "Responsiveness is about time, not item count: 1,000 cheap items might take 1 ms on a laptop, and 1,000 expensive ones 300 ms on a low-end phone. Checking the clock after each item (it's cheap) and yielding once the budget is spent keeps every task short everywhere, while avoiding the overhead of yielding too often. Always process at least one item per chunk so the loop makes progress.",
      "Чутливість залежить від часу, а не від кількості елементів: 1000 дешевих елементів можуть зайняти 1 мс на ноутбуці, а 1000 дорогих 300 мс на слабкому телефоні. Перевірка годинника після кожного елемента (вона дешева) і поступка потоком після вичерпання бюджету тримають кожну задачу короткою всюди, уникаючи накладних витрат від надто частих поступок. Завжди обробляйте щонайменше один елемент за частину, щоб цикл просувався.",
    ],
  ),
  quiz(
    "sched-background-tabs",
    ["main-thread-scheduling"],
    2,
    60,
    ["Background tabs", "Фонові вкладки"],
    ["A dashboard polls with `setInterval(refresh, 1000)` and animates with `requestAnimationFrame`. What typically happens when the tab is in the background?", "Дашборд опитує сервер через `setInterval(refresh, 1000)` і анімує через `requestAnimationFrame`. Що зазвичай стається, коли вкладка у фоні?"],
    [
      ["`requestAnimationFrame` callbacks pause, and timers are throttled (to about once per second, or less often after a while)", "Колбеки `requestAnimationFrame` призупиняються, а таймери пригальмовуються (приблизно до одного разу на секунду, а з часом ще рідше)"],
      ["Both keep running at full speed", "Обидва продовжують працювати на повній швидкості"],
      ["Both stop permanently until the page reloads", "Обидва зупиняються назавжди до перезавантаження сторінки"],
      ["`requestAnimationFrame` keeps running, and timers stop", "`requestAnimationFrame` продовжує працювати, а таймери зупиняються"],
    ],
    "a",
    [
      "Browsers save battery by not rendering hidden tabs (so no animation frames) and by throttling timers, with intensive throttling after several minutes in some browsers. Don't rely on timers for exact timing in the background; compute elapsed time from timestamps, and pause polling on `visibilitychange` or switch to push (WebSockets, SSE).",
      "Браузери економлять батарею, не рендерячи приховані вкладки (тож кадрів анімації немає) і пригальмовуючи таймери, а в деяких браузерах через кілька хвилин вмикається інтенсивне пригальмовування. Не покладайтеся на таймери для точного відліку у фоні; обчислюйте минулий час за часовими позначками, а на `visibilitychange` призупиняйте опитування чи переходьте на push (WebSockets, SSE).",
    ],
  ),
  quiz(
    "sched-worker-or-chunk",
    ["main-thread-scheduling", w("web-workers")],
    3,
    90,
    ["Chunking vs a worker", "Розбиття на частини проти воркера"],
    ["An app must `JSON.parse` a 40 MB response, which takes about 600 ms. How do you keep the page responsive?", "Застосунок має виконати `JSON.parse` для відповіді розміром 40 МБ, що займає близько 600 мс. Як зберегти сторінку чутливою?"],
    [
      ["Parse it in a Web Worker (or stream and process it incrementally), since one `JSON.parse` call can't be split into chunks", "Розібрати її у Web Worker (чи обробляти потоком поступово), бо один виклик `JSON.parse` не можна розбити на частини"],
      ["Wrap `JSON.parse` in `setTimeout`", "Загорнути `JSON.parse` у `setTimeout`"],
      ["Call `JSON.parse` inside `requestIdleCallback`", "Викликати `JSON.parse` усередині `requestIdleCallback`"],
      ["Make the function that calls `JSON.parse` `async`", "Зробити функцію, що викликає `JSON.parse`, `async`"],
    ],
    "a",
    [
      "Yielding only helps between steps you control; a single native call like `JSON.parse` is one indivisible 600 ms task wherever you schedule it. Move it off the main thread (a worker parses and posts back the result; transferring structured data has a cost, so post back only what the UI needs), use a streaming parser, or reduce the payload with pagination.",
      "Поступка потоком допомагає лише між кроками, якими ви керуєте; один нативний виклик на кшталт `JSON.parse` є неподільною задачею на 600 мс, хоч би де ви її запланували. Перенесіть його з головного потоку (воркер розбирає й надсилає назад результат; передача структурованих даних має ціну, тож надсилайте лише те, що потрібно інтерфейсу), використайте потоковий розбір або зменште обсяг даних пагінацією.",
    ],
  ),
  practice({
    slug: "sched-chunked-processing",
    skills: ["main-thread-scheduling", w("async-cancellation"), w("web-performance")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Process big lists without freezing the page", "Обробка великих списків без заморожування сторінки"],
    prompt: [
      "Implement `processInChunks(items, fn, options)` in `src/chunks.ts`. It maps any iterable with `fn(item, index)` and returns the results in order, but never runs for longer than `budgetMs` (default 8) without yielding:\n\n- Check `now()` after each item; once the budget is used up **and items remain**, call `onProgress(done)`, `await yieldToMain()`, then start a new budget. Every chunk processes at least one item, even with a zero budget.\n- Call `onProgress(done)` once more at the end.\n- `signal`: reject with its reason if it's already aborted (without calling `fn`), or at the next yield after it aborts.\n- `defaultYield()` uses `scheduler.yield()` when available, and falls back to `setTimeout(…, 0)`.\n\n`now` and `yieldToMain` are injectable for tests.",
      "Реалізуйте `processInChunks(items, fn, options)` у `src/chunks.ts`. Функція перетворює будь-який ітерований об'єкт через `fn(item, index)` і повертає результати по порядку, але ніколи не працює довше за `budgetMs` (за замовчуванням 8) без поступки потоком:\n\n- Перевіряйте `now()` після кожного елемента; щойно бюджет вичерпано **й елементи лишаються**, викличте `onProgress(done)`, `await yieldToMain()` і почніть новий бюджет. Кожна частина обробляє щонайменше один елемент, навіть з нульовим бюджетом.\n- Викличте `onProgress(done)` ще раз у кінці.\n- `signal`: відхиляйтеся з його причиною, якщо він уже скасований (не викликаючи `fn`), або на наступній поступці після його скасування.\n- `defaultYield()` використовує `scheduler.yield()`, якщо він доступний, а інакше `setTimeout(…, 0)`.\n\n`now` і `yieldToMain` можна підмінити в тестах.",
    ],
    files: { "/src/chunks.ts": CHUNK_STARTER, "/index.ts": CHUNK_INDEX },
    visibleFiles: ["/src/chunks.ts", "/index.ts"],
    activeFile: "/src/chunks.ts",
    tests: CHUNK_TESTS,
    solution: { "/src/chunks.ts": CHUNK_SOLUTION },
    explanation: [
      "Driving the iterator manually lets the loop know whether more items remain, so it never yields after the last item. Checking the clock after each item gives time-based chunks that adapt to item cost and device speed, and guarantees progress even with a zero budget. Checking the signal right after each yield is the natural cancellation point: the user's click to cancel is exactly the kind of input that the yield lets the browser process. Injecting `now` and `yieldToMain` makes the timing logic deterministic in tests.",
      "Ручне керування ітератором дає циклу знати, чи лишилися елементи, тож він ніколи не поступається потоком після останнього елемента. Перевірка годинника після кожного елемента дає частини за часом, що підлаштовуються під вартість елементів і швидкість пристрою, і гарантує просування навіть з нульовим бюджетом. Перевірка сигналу одразу після кожної поступки є природною точкою скасування: натискання користувачем кнопки скасування є саме тим введенням, яке поступка дає браузеру обробити. Підміна `now` і `yieldToMain` робить логіку відліку часу детермінованою в тестах.",
    ],
  }),
  practice({
    slug: "sched-frame-batcher",
    skills: ["main-thread-scheduling", w("dom-events"), w("web-performance")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["A read/write batcher to avoid layout thrashing", "Групування читань і записів проти layout thrashing"],
    prompt: [
      "Implement `createFrameBatcher(requestFrame)` in `src/batcher.ts`, a small version of fastdom. It returns `measure(job)` (for DOM reads) and `mutate(job)` (for DOM writes), and both return a promise of the job's result:\n\n- Jobs don't run immediately: the first queued job requests **one** frame, and later jobs join that batch.\n- In the frame, run **all measures first**, then **all mutates**, each group in queue order, so layout is computed at most once.\n- Jobs queued while a frame is running (for example a `mutate` inside a `measure`) go to the **next** frame.\n- A job that throws rejects only its own promise; the rest still run.\n- No frame is requested when nothing is queued.\n\n`requestFrame` defaults to `requestAnimationFrame` and is injectable for tests.",
      "Реалізуйте `createFrameBatcher(requestFrame)` у `src/batcher.ts`, маленьку версію fastdom. Функція повертає `measure(job)` (для читань DOM) і `mutate(job)` (для записів DOM), і обидва повертають проміс результату задачі:\n\n- Задачі не виконуються одразу: перша задача в черзі запитує **один** кадр, а пізніші приєднуються до цієї групи.\n- У кадрі спершу виконайте **всі measure**, потім **всі mutate**, кожну групу в порядку черги, тож розмітка обчислюється щонайбільше один раз.\n- Задачі, додані під час виконання кадру (наприклад, `mutate` усередині `measure`), переходять у **наступний** кадр.\n- Задача, що кидає помилку, відхиляє лише свій проміс; решта все одно виконується.\n- Коли черга порожня, кадр не запитується.\n\n`requestFrame` за замовчуванням дорівнює `requestAnimationFrame`, і його можна підмінити в тестах.",
    ],
    files: { "/src/batcher.ts": BATCH_STARTER, "/index.ts": BATCH_INDEX },
    visibleFiles: ["/src/batcher.ts", "/index.ts"],
    activeFile: "/src/batcher.ts",
    tests: BATCH_TESTS,
    solution: { "/src/batcher.ts": BATCH_SOLUTION },
    explanation: [
      "Two queues and a `scheduled` flag are enough. Swapping in fresh queues at the start of a flush means jobs added during the flush land in the next frame, which prevents a read/write ping-pong inside one frame and guarantees the flush terminates. Running every read before any write lets the browser compute layout once per frame instead of once per element. Wrapping each job in `try/catch` and settling its own promise isolates failures, so one broken component can't stop the others from updating.",
      "Двох черг і прапорця `scheduled` достатньо. Заміна черг на нові на початку обробки кадру означає, що задачі, додані під час обробки, потрапляють у наступний кадр; це запобігає «пінг-понгу» читань і записів в одному кадрі й гарантує, що обробка завершиться. Виконання всіх читань перед будь-яким записом дає браузеру обчислювати розмітку раз на кадр, а не раз на елемент. Загортання кожної задачі в `try/catch` і завершення її власного промісу ізолює збої, тож один зламаний компонент не може завадити оновленню інших.",
    ],
  }),
]);
