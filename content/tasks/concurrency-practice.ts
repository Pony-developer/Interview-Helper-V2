import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const POOL_STARTER = code`/** Runs async tasks with at most limit of them in flight at any moment. */
export function createPool(limit: number) {
  return {
    /** Runs task when a slot is free. Resolves or rejects with the task's own outcome. */
    run<T>(task: () => Promise<T>): Promise<T> {
      // TODO
      return task();
    },
    /** Resolves when nothing is running or queued. */
    drain(): Promise<void> {
      return Promise.resolve(); // TODO
    },
    get active(): number {
      return 0; // TODO
    },
    get pending(): number {
      return 0; // TODO: tasks waiting for a free slot
    },
  };
}
`;

const POOL_SOLUTION = code`export function createPool(limit: number) {
  if (!(limit >= 1)) throw new RangeError("limit must be at least 1");
  let active = 0;
  const queue: Array<() => void> = [];
  const idleWaiters: Array<() => void> = [];

  // Starts queued tasks while there are free slots, and wakes drain() callers when everything is finished.
  const pump = (): void => {
    if (active === 0 && queue.length === 0) {
      for (const wake of idleWaiters.splice(0)) wake();
      return;
    }
    while (active < limit && queue.length > 0) {
      const start = queue.shift()!;
      start();
    }
  };

  return {
    run<T>(task: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        queue.push(() => {
          active++;
          // Promise.resolve().then(task) also turns a synchronous throw into a rejection.
          Promise.resolve()
            .then(task)
            .then(resolve, reject)
            .finally(() => {
              active--;
              pump();
            });
        });
        pump();
      });
    },
    drain(): Promise<void> {
      return new Promise<void>((resolve) => {
        if (active === 0 && queue.length === 0) resolve();
        else idleWaiters.push(resolve);
      });
    },
    get active(): number {
      return active;
    },
    get pending(): number {
      return queue.length;
    },
  };
}
`;

const POOL_INDEX = code`import "./styles.css";
import { createPool } from "./src/pool";

const pool = createPool(2);
const results = [1, 2, 3].map((n) => pool.run(() => Promise.resolve(n * 10)));
document.getElementById("app")!.innerHTML = '<h1>Pool</h1><pre id="out"></pre>';
Promise.all(results).then((values) => (document.getElementById("out")!.textContent = values.join(", ")));
`;

const POOL_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createPool } from "../src/pool";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe("createPool", () => {
  it("never runs more than limit tasks at once", async () => {
    const pool = createPool(2);
    let running = 0;
    let peak = 0;
    const task = async () => {
      running++;
      peak = Math.max(peak, running);
      await sleep(5);
      running--;
    };
    await Promise.all([1, 2, 3, 4, 5].map(() => pool.run(task)));
    expect(peak).toBe(2);
  });
  it("starts queued tasks in the order they were submitted", async () => {
    const pool = createPool(1);
    const order = [];
    await Promise.all([1, 2, 3].map((n) => pool.run(async () => {
      await sleep(3);
      order.push(n);
    })));
    expect(order).toEqual([1, 2, 3]);
  });
  it("resolves each call with its own result", async () => {
    const pool = createPool(2);
    const values = await Promise.all([1, 2, 3].map((n) => pool.run(async () => n * 10)));
    expect(values).toEqual([10, 20, 30]);
  });
  it("rejects only the failing call and keeps going", async () => {
    const pool = createPool(1);
    const failing = pool.run(() => Promise.reject(new Error("bad")));
    const fine = pool.run(async () => 2);
    await expect(failing).rejects.toThrow("bad");
    expect(await fine).toBe(2);
  });
  it("turns a synchronous throw into a rejection", async () => {
    const pool = createPool(1);
    await expect(pool.run(() => { throw new Error("sync"); })).rejects.toThrow("sync");
  });
  it("drain resolves only after everything has finished", async () => {
    const pool = createPool(1);
    const done = [];
    pool.run(async () => {
      await sleep(10);
      done.push("a");
    });
    pool.run(async () => {
      await sleep(5);
      done.push("b");
    });
    await pool.drain();
    expect(done).toEqual(["a", "b"]);
    expect(pool.active).toBe(0);
    expect(pool.pending).toBe(0);
  });
  it("rejects an invalid limit", () => {
    expect(() => createPool(0)).toThrow(RangeError);
  });
});
`;

export default defineTasks([
  practice({
    slug: "conc-worker-pool",
    skills: ["concurrency", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["A bounded worker pool", "Пул воркерів з обмеженням"],
    prompt: [
      "Fetching 500 URLs at once exhausts sockets and gets you rate-limited, but running them one by one is slow. A worker pool sits in between. Implement `createPool(limit)` in `src/pool.ts`:\n\n- `run(task)` queues the async task and starts it once a slot is free, so **at most `limit` tasks are in flight** at any moment. The tasks start in the order they were submitted.\n- `run` returns a promise for that task's own result. A failing task rejects only its own call, and a task that throws synchronously also rejects instead of breaking the pool.\n- `drain()` resolves once nothing is running and nothing is queued.\n- `active` and `pending` report the running and waiting counts. A `limit` below 1 is a `RangeError`.",
      "Запит 500 URL одразу вичерпує сокети і призводить до обмеження частоти, а запускати їх по одному — повільно. Пул воркерів стоїть між цими крайнощами. Реалізуйте `createPool(limit)` у `src/pool.ts`:\n\n- `run(task)` ставить асинхронну задачу в чергу і запускає її, коли звільняється слот, тож **одночасно виконується не більше `limit` задач**. Задачі починаються в порядку подання.\n- `run` повертає проміс власного результату цієї задачі. Задача, що відхиляється, відхиляє лише свій виклик, а задача, що кидає помилку синхронно, теж відхиляється, не ламаючи пул.\n- `drain()` розв'язується, коли нічого не виконується і нічого не чекає в черзі.\n- `active` і `pending` показують кількість виконуваних і очікуючих задач. `limit` менше за 1 — це `RangeError`.",
    ],
    files: {
      "/src/pool.ts": POOL_STARTER,
      "/index.ts": POOL_INDEX,
    },
    visibleFiles: ["/src/pool.ts"],
    activeFile: "/src/pool.ts",
    tests: POOL_TESTS,
    solution: { "/src/pool.ts": POOL_SOLUTION },
    explanation: [
      "The pool is a queue plus a counter: `active` counts running tasks, and `pump()` starts queued work whenever a slot frees up, both when a task is added and when one finishes. Wrapping each task in its own promise means every caller gets its own outcome, and `finally` releases the slot whether the task succeeded or failed, which is what stops one bad task from wedging the pool. `drain` waits on a list of resolvers that is woken when the pool goes idle. Promise libraries ship this pattern (`p-limit`, `p-queue`), and the same idea bounds connection pools and thread pools in other runtimes.",
      "Пул — це черга плюс лічильник: `active` рахує задачі, що виконуються, а `pump()` запускає чергові задачі щойно звільняється слот, і коли додано задачу, і коли задача завершилась. Загортання кожної задачі у власний проміс дає кожному викликачу його результат, а `finally` звільняє слот незалежно від успіху чи збою задачі, і це не дає одній поганій задачі заблокувати пул. `drain` чекає на список резольверів, які будяться, коли пул стає вільним. Бібліотеки промісів постачають цей шаблон (`p-limit`, `p-queue`), а та сама ідея обмежує пули з'єднань і пули потоків в інших середовищах.",
    ],
  }),
]);
