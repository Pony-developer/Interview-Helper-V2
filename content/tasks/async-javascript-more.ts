import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "async-return-value",
    ["async-javascript"],
    1,
    45,
    ["What async functions return", "Що повертають async-функції"],
    ["What is `result`?", "Що таке `result`?"],
    [
      ["The number `42`", "Число `42`"],
      ["A Promise that resolves to `42`", "Promise, що виконується зі значенням `42`"],
      ["`undefined`", "`undefined`"],
      ["A Promise that resolves to `undefined`", "Promise, що виконується зі значенням `undefined`"],
    ],
    "b",
    [
      "An `async` function always returns a Promise. A returned value becomes the fulfilment value, and a thrown error becomes a rejection. Read the value with `await getAnswer()` or `.then()`.",
      "`async`-функція завжди повертає Promise. Повернене значення стає значенням виконання, а кинута помилка — відхиленням. Отримайте значення через `await getAnswer()` або `.then()`.",
    ],
    { code: "async function getAnswer() {\n  return 42;\n}\n\nconst result = getAnswer();", codeLanguage: "js" },
  ),
  quiz(
    "async-all-fail-fast",
    ["async-javascript"],
    4,
    90,
    ["After Promise.all rejects", "Після відхилення Promise.all"],
    ["`b()` rejects after 10 ms; `a()` and `c()` are slow HTTP requests. What happens to them?", "`b()` відхиляється через 10 мс; `a()` і `c()` — повільні HTTP-запити. Що з ними станеться?"],
    [
      ["They are cancelled automatically", "Вони автоматично скасовуються"],
      ["They keep running; their results are ignored", "Вони продовжують виконуватися; їхні результати ігноруються"],
      ["`Promise.all` waits for them before rejecting", "`Promise.all` чекає на них, перш ніж відхилитися"],
      ["Their rejections become unhandled errors", "Їхні відхилення стають необробленими помилками"],
    ],
    "b",
    [
      "`Promise.all` rejects as soon as any input rejects, but promises are not cancellable: the other requests continue and their results are dropped. `Promise.all` subscribes to every input, so their later rejections are not reported as unhandled. To actually stop the work, pass an `AbortSignal` and abort it in a `catch`.",
      "`Promise.all` відхиляється, щойно відхиляється будь-який вхід, але проміси не скасовуються: решта запитів триває, а їхні результати відкидаються. `Promise.all` підписується на кожен вхід, тож пізніші відхилення не стають необробленими. Щоб справді зупинити роботу, передайте `AbortSignal` і скасуйте його в `catch`.",
    ],
    { code: "try {\n  await Promise.all([a(), b(), c()]);\n} catch (error) {\n  showError(error);\n}", codeLanguage: "js" },
  ),
  quiz(
    "async-return-promise-ticks",
    ["async-javascript", w("event-loop")],
    5,
    120,
    ["Returning a promise from async", "Повернення промісу з async"],
    ["What is logged, in order?", "Що буде виведено і в якому порядку?"],
    [
      ["`a`, then `b`", "`a`, потім `b`"],
      ["`b`, then `a`", "`b`, потім `a`"],
      ["The order is not deterministic", "Порядок не детермінований"],
      ["Only `b`", "Лише `b`"],
    ],
    "b",
    [
      "Resolving the async function's promise with another promise isn't immediate: it schedules a job that calls the inner promise's `then`, which takes extra microtask ticks before the outer promise settles. `Promise.resolve(\"b\").then` needs only one tick, so `b` wins. `return await` or returning a plain value avoids the extra ticks, but don't build logic on tick counting.",
      "Виконання промісу async-функції іншим промісом не миттєве: планується завдання, що викликає `then` внутрішнього промісу, і це займає додаткові мікрозавдання, перш ніж зовнішній проміс завершиться. `Promise.resolve(\"b\").then` потребує лише одного такту, тож `b` перший. `return await` або повернення звичайного значення прибирає зайві такти, але не будуйте логіку на підрахунку тактів.",
    ],
    { code: 'async function a() {\n  return Promise.resolve("a");\n}\n\na().then(console.log);\nPromise.resolve("b").then(console.log);', codeLanguage: "js" },
  ),
  practice({
    slug: "async-retry-backoff",
    skills: ["async-javascript", { slug: "http-rest", weight: 0.5 }],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Retry with exponential backoff", "Повтор з експоненційною затримкою"],
    prompt: [
      "Implement `retry(task, options)` for flaky network calls.\n\n- Call `task(attempt)` (attempt starts at 1). If it resolves, return its value.\n- If it rejects, wait and try again, up to `retries` extra attempts. The waits are `baseDelayMs`, then double each time: `base`, `2·base`, `4·base`…\n- If `shouldRetry(error)` is given and returns `false`, stop immediately.\n- When giving up, reject with the **last** error.",
      "Реалізуйте `retry(task, options)` для ненадійних мережевих викликів.\n\n- Викликайте `task(attempt)` (attempt починається з 1). Якщо він виконується успішно, поверніть значення.\n- Якщо відхиляється, зачекайте й спробуйте знову, щонайбільше `retries` додаткових спроб. Затримки: `baseDelayMs`, далі щоразу вдвічі більше: `base`, `2·base`, `4·base`…\n- Якщо задано `shouldRetry(error)` і вона повертає `false`, зупиніться одразу.\n- Здаючись, відхиліть проміс **останньою** помилкою.",
    ],
    files: {
      "/src/retry.ts":
        "export type RetryOptions = {\n  retries: number;\n  baseDelayMs: number;\n  shouldRetry?: (error: unknown) => boolean;\n};\n\nexport async function retry<T>(task: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T> {\n  // TODO: retry with exponential backoff\n  return task(1);\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { retry } from "./src/retry";\n\nconst app = document.getElementById("app")!;\napp.innerHTML = "<h1>Retry</h1><p id=\\"out\\">working…</p>";\nconst out = document.getElementById("out")!;\nretry(async (attempt) => {\n  if (attempt < 3) throw new Error("flaky " + attempt);\n  return "succeeded on attempt " + attempt;\n}, { retries: 3, baseDelayMs: 50 })\n  .then((value) => (out.textContent = value))\n  .catch((error) => (out.textContent = String(error)));\n',
    },
    visibleFiles: ["/src/retry.ts", "/index.ts"],
    activeFile: "/src/retry.ts",
    tests:
      'import { describe, it, expect, fn } from "./test-kit";\nimport { retry } from "../src/retry";\n\nfunction failTimes(n: number) {\n  return fn(async (attempt: number) => {\n    if (attempt <= n) throw new Error("fail " + attempt);\n    return "ok " + attempt;\n  });\n}\n\ndescribe("retry", () => {\n  it("returns the first successful result", async () => {\n    const task = failTimes(0);\n    expect(await retry(task, { retries: 3, baseDelayMs: 1 })).toBe("ok 1");\n    expect(task).toHaveBeenCalledTimes(1);\n  });\n  it("retries until it succeeds, passing the attempt number", async () => {\n    const task = failTimes(2);\n    expect(await retry(task, { retries: 3, baseDelayMs: 1 })).toBe("ok 3");\n    expect(task.mock.calls.map((c: number[]) => c[0])).toEqual([1, 2, 3]);\n  });\n  it("rejects with the last error after all retries", async () => {\n    const task = failTimes(10);\n    await expect(retry(task, { retries: 2, baseDelayMs: 1 })).rejects.toThrow("fail 3");\n    expect(task).toHaveBeenCalledTimes(3);\n  });\n  it("stops when shouldRetry returns false", async () => {\n    const task = failTimes(10);\n    await expect(retry(task, { retries: 5, baseDelayMs: 1, shouldRetry: () => false })).rejects.toThrow("fail 1");\n    expect(task).toHaveBeenCalledTimes(1);\n  });\n  it("doubles the delay between attempts", async () => {\n    const times: number[] = [];\n    const task = fn(async () => {\n      times.push(performance.now());\n      throw new Error("nope");\n    });\n    await retry(task, { retries: 2, baseDelayMs: 40 }).catch(() => {});\n    const first = times[1] - times[0];\n    const second = times[2] - times[1];\n    expect(first).toBeGreaterThanOrEqual(35);\n    expect(second).toBeGreaterThanOrEqual(75);\n  });\n});\n',
    solution: {
      "/src/retry.ts":
        "export type RetryOptions = {\n  retries: number;\n  baseDelayMs: number;\n  shouldRetry?: (error: unknown) => boolean;\n};\n\nconst sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));\n\nexport async function retry<T>(task: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T> {\n  const { retries, baseDelayMs, shouldRetry = () => true } = options;\n  for (let attempt = 1; ; attempt++) {\n    try {\n      return await task(attempt);\n    } catch (error) {\n      if (attempt > retries || !shouldRetry(error)) throw error;\n      await sleep(baseDelayMs * 2 ** (attempt - 1));\n    }\n  }\n}\n",
    },
    explanation: [
      "A loop with `try { return await task(attempt) }` keeps the code flat: `return await` is needed so a rejection lands in this `catch`. After attempt n the wait is `base · 2^(n-1)`. Rethrowing the caught error preserves the last failure. In production, add random jitter so many clients don't retry in lockstep, and only retry errors that can succeed later (timeouts, 429, 5xx).",
      "Цикл із `try { return await task(attempt) }` тримає код пласким: `return await` потрібен, щоб відхилення потрапило в цей `catch`. Після спроби n затримка — `base · 2^(n-1)`. Повторне кидання впійманої помилки зберігає останню невдачу. У продакшні додайте випадковий розкид, щоб багато клієнтів не повторювали синхронно, і повторюйте лише помилки, що можуть минути (тайм-аути, 429, 5xx).",
    ],
  }),
]);
