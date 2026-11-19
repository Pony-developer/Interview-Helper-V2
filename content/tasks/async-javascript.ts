import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "async-event-loop-order",
    ["async-javascript", w("javascript")],
    2,
    90,
    ["Event loop order", "Порядок у циклі подій"],
    ["What does this code print?", "Що виведе цей код?"],
    [
      ["`1 2 3 4`", "`1 2 3 4`"],
      ["`1 4 3 2`", "`1 4 3 2`"],
      ["`1 4 2 3`", "`1 4 2 3`"],
      ["`1 3 4 2`", "`1 3 4 2`"],
    ],
    "b",
    [
      "Synchronous code runs first (1, 4). Then all microtasks run (the promise callback: 3), and only then the next macrotask (the timer: 2).",
      "Спершу виконується синхронний код (1, 4). Потім усі мікрозадачі (колбек промісу: 3), і лише тоді наступна макрозадача (таймер: 2).",
    ],
    { code: 'console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);', codeLanguage: "js" },
  ),
  quiz(
    "async-all-settled",
    ["async-javascript"],
    2,
    90,
    ["Choosing a combinator", "Вибір комбінатора"],
    [
      "You load 5 independent widgets and want to render every one that succeeds, showing an error only for the failed ones. Which combinator fits?",
      "Ви завантажуєте 5 незалежних віджетів і хочете показати всі успішні, а помилку лише для невдалих. Який комбінатор підходить?",
    ],
    [
      ["`Promise.all`", "`Promise.all`"],
      ["`Promise.allSettled`", "`Promise.allSettled`"],
      ["`Promise.race`", "`Promise.race`"],
      ["`Promise.any`", "`Promise.any`"],
    ],
    "b",
    [
      "`allSettled` waits for every promise and reports `{status, value|reason}` for each, so one failure doesn't hide the others. `all` rejects on the first error; `race`/`any` give you only one result.",
      "`allSettled` чекає на кожен проміс і повертає `{status, value|reason}` для всіх, тож одна помилка не приховує решту. `all` відхиляється на першій помилці; `race`/`any` дають лише один результат.",
    ],
  ),
  quiz(
    "async-foreach-await",
    ["async-javascript"],
    3,
    120,
    ["await in forEach", "await у forEach"],
    ["What's wrong with this function?", "Що не так із цією функцією?"],
    [
      [
        "`forEach` ignores the returned promises, so `save` returns before the uploads finish and their errors are unhandled",
        "`forEach` ігнорує повернені проміси, тож `save` завершується раніше за завантаження, а їхні помилки не обробляються",
      ],
      ["`await` is a syntax error inside arrow functions", "`await` дає синтаксичну помилку всередині стрілкових функцій"],
      ["The uploads run one after another, which is slow", "Завантаження виконуються одне за одним, що повільно"],
      ["Nothing, it waits for every upload", "Нічого, функція чекає на кожне завантаження"],
    ],
    "a",
    [
      "Each callback is async and returns a promise that `forEach` drops. Use `await Promise.all(files.map(upload))` for parallel uploads, or `for (const f of files) await upload(f)` for sequential ones.",
      "Кожен колбек асинхронний і повертає проміс, який `forEach` відкидає. Використовуйте `await Promise.all(files.map(upload))` для паралельних завантажень або `for (const f of files) await upload(f)` для послідовних.",
    ],
    { code: "async function save(files) {\n  files.forEach(async (file) => {\n    await upload(file);\n  });\n  console.log(\"done\");\n}", codeLanguage: "js" },
  ),
  quiz(
    "async-sequential-vs-parallel",
    ["async-javascript", w("web-performance")],
    3,
    120,
    ["Sequential awaits", "Послідовні await"],
    [
      "`getUser` and `getOrders` each take ~300 ms and don't depend on each other. How long does `load` take, and how do you make it ~300 ms?",
      "`getUser` і `getOrders` займають ~300 мс кожна й не залежать одна від одної. Скільки триває `load` і як зробити ~300 мс?",
    ],
    [
      ["~300 ms already; `await` runs them in parallel", "Уже ~300 мс; `await` запускає їх паралельно"],
      ["~600 ms; start both first, then `await Promise.all([...])`", "~600 мс; спершу запустити обидві, потім `await Promise.all([...])`"],
      ["~600 ms; it can't be faster in a single thread", "~600 мс; в одному потоці швидше неможливо"],
      ["~0 ms; async functions return immediately", "~0 мс; async-функції повертаються одразу"],
    ],
    "b",
    [
      "The second request starts only after the first finishes. Starting both before awaiting overlaps the network waits: `const [user, orders] = await Promise.all([getUser(), getOrders()])`. A single thread doesn't matter, because the waiting happens in the network stack.",
      "Другий запит стартує лише після завершення першого. Якщо запустити обидва до `await`, очікування мережі перекриваються: `const [user, orders] = await Promise.all([getUser(), getOrders()])`. Один потік не заважає, бо очікування відбувається в мережевому стеку.",
    ],
    { code: "async function load() {\n  const user = await getUser();\n  const orders = await getOrders();\n  return { user, orders };\n}", codeLanguage: "js" },
  ),
  quiz(
    "async-promise-any",
    ["async-javascript"],
    4,
    150,
    ["Fastest mirror", "Найшвидше дзеркало"],
    [
      "You query three mirrors and want the first **successful** response, ignoring mirrors that fail fast. What do you use, and what happens if all three fail?",
      "Ви звертаєтеся до трьох дзеркал і хочете першу **успішну** відповідь, ігноруючи дзеркала, що швидко падають. Що використати й що станеться, якщо впадуть усі три?",
    ],
    [
      ["`Promise.race`; it rejects with the last error", "`Promise.race`; відхиляється з останньою помилкою"],
      ["`Promise.any`; it rejects with an `AggregateError` holding all errors", "`Promise.any`; відхиляється з `AggregateError`, що містить усі помилки"],
      ["`Promise.all`; it resolves with the successful ones", "`Promise.all`; вирішується з успішними"],
      ["`Promise.allSettled`; it rejects if all fail", "`Promise.allSettled`; відхиляється, якщо всі впали"],
    ],
    "b",
    [
      "`race` settles with whichever promise settles first, including a fast failure. `any` waits for the first fulfilment and only rejects (with `AggregateError`) when every promise rejected.",
      "`race` завершується тим промісом, що завершився першим, навіть швидкою помилкою. `any` чекає першого успіху й відхиляється (з `AggregateError`) лише коли відхилено всі проміси.",
    ],
  ),
  practice({
    slug: "async-map-with-concurrency",
    skills: ["async-javascript"],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Map with a concurrency limit", "Map з обмеженням паралельності"],
    prompt: [
      "Implement `mapWithConcurrency(items, limit, fn)`:\n\n- Calls `fn(item, index)` for every item, with **at most `limit` calls in flight** at any time.\n- Starts a new call as soon as one finishes; don't wait for whole batches.\n- Resolves with the results **in input order**.\n- Rejects as soon as any call rejects.",
      "Реалізуйте `mapWithConcurrency(items, limit, fn)`:\n\n- Викликає `fn(item, index)` для кожного елемента, причому **одночасно виконується не більше `limit` викликів**.\n- Новий виклик стартує, щойно завершився будь-який попередній; не чекайте цілих пачок.\n- Вирішується результатами **в порядку вхідних даних**.\n- Відхиляється, щойно будь-який виклик відхилено.",
    ],
    files: {
      "/src/mapWithConcurrency.ts": "export async function mapWithConcurrency<T, R>(\n  items: T[],\n  limit: number,\n  fn: (item: T, index: number) => Promise<R>,\n): Promise<R[]> {\n  // TODO: at most `limit` calls at a time, results in input order\n  const results: R[] = [];\n  for (let i = 0; i < items.length; i++) results.push(await fn(items[i], i));\n  return results;\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { mapWithConcurrency } from "./src/mapWithConcurrency";\n\nconst sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));\nconst app = document.getElementById("app")!;\napp.innerHTML = "<h1>Downloads</h1><ol id=\\"log\\"></ol>";\nconst log = document.getElementById("log")!;\n\nmapWithConcurrency([300, 100, 200, 50, 150], 2, async (ms, i) => {\n  log.insertAdjacentHTML("beforeend", `<li>start #${i}</li>`);\n  await sleep(ms);\n  log.insertAdjacentHTML("beforeend", `<li>done #${i}</li>`);\n  return ms;\n});\n',
    },
    visibleFiles: ["/src/mapWithConcurrency.ts", "/index.ts"],
    activeFile: "/src/mapWithConcurrency.ts",
    tests: 'import { describe, it, expect, sleep } from "./test-kit";\nimport { mapWithConcurrency } from "../src/mapWithConcurrency";\n\nfunction tracker() {\n  let active = 0;\n  let peak = 0;\n  return {\n    get peak() { return peak; },\n    async run<T>(ms: number, value: T) {\n      active++;\n      peak = Math.max(peak, active);\n      await sleep(ms);\n      active--;\n      return value;\n    },\n  };\n}\n\ndescribe("mapWithConcurrency", () => {\n  it("keeps results in input order", async () => {\n    const out = await mapWithConcurrency([30, 10, 20], 3, (ms, i) => sleep(ms).then(() => i * 10));\n    expect(out).toEqual([0, 10, 20]);\n  });\n  it("never exceeds the limit", async () => {\n    const t = tracker();\n    await mapWithConcurrency([20, 20, 20, 20, 20, 20], 2, (ms, i) => t.run(ms, i));\n    expect(t.peak).toBe(2);\n  });\n  it("runs in parallel up to the limit (not one by one)", async () => {\n    const t = tracker();\n    const started = Date.now();\n    await mapWithConcurrency([60, 60, 60, 60], 4, (ms, i) => t.run(ms, i));\n    expect(t.peak).toBe(4);\n    expect(Date.now() - started).toBeLessThan(200);\n  });\n  it("starts the next task as soon as a slot frees up", async () => {\n    const order: string[] = [];\n    await mapWithConcurrency([80, 10, 10, 10], 2, async (ms, i) => {\n      order.push("start" + i);\n      await sleep(ms);\n      return i;\n    });\n    expect(order).toEqual(["start0", "start1", "start2", "start3"]);\n  });\n  it("handles an empty list and a limit larger than the list", async () => {\n    expect(await mapWithConcurrency([], 3, async (x) => x)).toEqual([]);\n    expect(await mapWithConcurrency([1, 2], 10, async (x) => x * 2)).toEqual([2, 4]);\n  });\n  it("rejects when a task fails", async () => {\n    await expect(mapWithConcurrency([1, 2, 3], 2, async (x) => { if (x === 2) throw new Error("boom"); return x; })).rejects.toThrow("boom");\n  });\n});\n',
    solution: {
      "/src/mapWithConcurrency.ts": "export async function mapWithConcurrency<T, R>(\n  items: T[],\n  limit: number,\n  fn: (item: T, index: number) => Promise<R>,\n): Promise<R[]> {\n  const results = new Array<R>(items.length);\n  let next = 0;\n\n  async function worker() {\n    while (next < items.length) {\n      const index = next++; // claimed synchronously: no two workers take the same index\n      results[index] = await fn(items[index], index);\n    }\n  }\n\n  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker);\n  await Promise.all(workers);\n  return results;\n}\n",
    },
    explanation: [
      "Start `limit` workers. Each one repeatedly claims the next index and awaits `fn`. Because JavaScript runs on one thread, `next++` can't race. Writing into `results[index]` keeps the input order, and `Promise.all(workers)` rejects as soon as any worker throws.",
      "Запустіть `limit` воркерів. Кожен по черзі забирає наступний індекс і чекає на `fn`. Оскільки JavaScript працює в одному потоці, `next++` не має гонки. Запис у `results[index]` зберігає порядок вхідних даних, а `Promise.all(workers)` відхиляється, щойно будь-який воркер кидає помилку.",
    ],
  }),
]);
