import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "node-type-module",
    ["nodejs", { slug: "es-modules", weight: 0.5 }],
    2,
    60,
    ["ESM or CommonJS?", "ESM чи CommonJS?"],
    ["`package.json` contains `\"type\": \"module\"`. How does Node.js treat `server.js` in that package?", "`package.json` містить `\"type\": \"module\"`. Як Node.js трактує `server.js` у цьому пакеті?"],
    [
      ["As CommonJS; `.js` is always CommonJS", "Як CommonJS; `.js` завжди CommonJS"],
      ["As an ES module, so `require` and `__dirname` are not defined", "Як ES-модуль, тож `require` і `__dirname` не визначені"],
      ["As both, depending on the first import", "Як обидва, залежно від першого імпорту"],
      ["It refuses to run `.js` files", "Відмовляється запускати файли `.js`"],
    ],
    "b",
    [
      "`\"type\": \"module\"` makes `.js` files in the package ES modules; `.cjs` stays CommonJS and `.mjs` is always ESM. In ESM, use `import`, `import.meta.dirname` (or `fileURLToPath(import.meta.url)`) and `createRequire` when you really need `require`.",
      "`\"type\": \"module\"` робить файли `.js` у пакеті ES-модулями; `.cjs` лишається CommonJS, а `.mjs` — завжди ESM. В ESM використовуйте `import`, `import.meta.dirname` (або `fileURLToPath(import.meta.url)`) і `createRequire`, коли `require` справді потрібен.",
    ],
  ),
  quiz(
    "node-backpressure",
    ["nodejs"],
    4,
    90,
    ["Stream backpressure", "Протитиск у потоках"],
    ["A script copies a fast source into a slow writable with a `data` handler that calls `writable.write(chunk)`. Memory keeps growing. What is the correct fix?", "Скрипт копіює швидке джерело в повільний записуваний потік через обробник `data`, що викликає `writable.write(chunk)`. Пам'ять постійно зростає. Яке правильне виправлення?"],
    [
      ["Increase `highWaterMark` on the writable", "Збільшити `highWaterMark` записуваного потоку"],
      ["Use `await pipeline(source, writable)` from `node:stream/promises`, which respects `write()` returning `false`", "Використати `await pipeline(source, writable)` з `node:stream/promises`, що враховує повернення `false` з `write()`"],
      ["Call `global.gc()` after every chunk", "Викликати `global.gc()` після кожного фрагмента"],
      ["Wrap `write` in `setImmediate`", "Обгорнути `write` у `setImmediate`"],
    ],
    "b",
    [
      "`write()` returns `false` when the writable's buffer is full. A correct producer pauses until `drain`. Ignoring it buffers everything in memory. `pipeline` handles the pause/resume for you, propagates errors and destroys every stream on failure, which a manual `.pipe()` chain doesn't.",
      "`write()` повертає `false`, коли буфер записуваного потоку заповнений. Коректний виробник призупиняється до події `drain`. Якщо це ігнорувати, усе буферизується в пам'яті. `pipeline` сам призупиняє й відновлює, передає помилки й знищує всі потоки в разі збою — чого ручний ланцюжок `.pipe()` не робить.",
    ],
    { code: 'source.on("data", (chunk) => {\n  writable.write(chunk);\n});', codeLanguage: "js" },
  ),
  quiz(
    "node-immediate-vs-timeout",
    ["nodejs", { slug: "async-javascript", weight: 0.5 }],
    5,
    120,
    ["setImmediate inside an I/O callback", "setImmediate усередині I/O-колбека"],
    ["What does this log, and is the order guaranteed?", "Що це виведе і чи гарантовано порядок?"],
    [
      ["`timeout`, then `immediate`; guaranteed", "`timeout`, потім `immediate`; гарантовано"],
      ["`immediate`, then `timeout`; guaranteed", "`immediate`, потім `timeout`; гарантовано"],
      ["Either order; it depends on system load", "Будь-який порядок; залежить від навантаження системи"],
      ["Only `immediate`", "Лише `immediate`"],
    ],
    "b",
    [
      "The callback runs in the poll phase. The event loop moves on to the check phase (where `setImmediate` callbacks run) before it wraps around to the timers phase, so `immediate` always comes first. At the top level of the main module, the order of these two is not deterministic, because it depends on whether 1 ms has passed when the loop starts.",
      "Колбек виконується у фазі poll. Цикл подій переходить до фази check (де виконуються колбеки `setImmediate`) раніше, ніж повертається до фази timers, тож `immediate` завжди перший. На верхньому рівні головного модуля порядок цих двох не детермінований, бо залежить від того, чи минула 1 мс на старті циклу.",
    ],
    { code: 'import { readFile } from "node:fs";\n\nreadFile(import.meta.filename, () => {\n  setTimeout(() => console.log("timeout"), 0);\n  setImmediate(() => console.log("immediate"));\n});', codeLanguage: "js" },
  ),
  practice({
    slug: "node-promisify",
    skills: ["nodejs", { slug: "async-javascript", weight: 0.5 }],
    complexity: 2,
    estSeconds: 600,
    framework: "vanilla-js",
    title: ["Implement promisify", "Реалізуйте promisify"],
    prompt: [
      "Older Node.js APIs use error-first callbacks: `fn(...args, (err, value) => {})`. Implement `promisify(fn)` like `util.promisify`:\n\n- The returned function passes its arguments plus a callback to `fn` and returns a Promise.\n- Reject with `err` when it is truthy; otherwise resolve with `value`.\n- If `fn` throws synchronously, reject instead of throwing.\n- Keep `this`, so methods still work: `obj.read = promisify(obj.read)`.",
      "Старі API Node.js використовують колбеки з помилкою першим аргументом: `fn(...args, (err, value) => {})`. Реалізуйте `promisify(fn)`, як `util.promisify`:\n\n- Повернена функція передає в `fn` свої аргументи плюс колбек і повертає Promise.\n- Відхиляйте з `err`, якщо він істинний; інакше виконуйте зі значенням `value`.\n- Якщо `fn` синхронно кидає помилку, відхиляйте проміс замість кидання.\n- Зберігайте `this`, щоб методи працювали: `obj.read = promisify(obj.read)`.",
    ],
    files: {
      "/src/promisify.js":
        "export function promisify(fn) {\n  // TODO: call fn with an error-first callback and settle the promise from it\n  return (...args) => Promise.resolve(undefined);\n}\n",
      "/index.js":
        'import "./styles.css";\nimport { promisify } from "./src/promisify";\n\nfunction readConfig(name, callback) {\n  setTimeout(() => (name ? callback(null, { name, debug: true }) : callback(new Error("missing name"))), 100);\n}\n\nconst app = document.getElementById("app");\napp.innerHTML = "<h1>promisify</h1><p id=\\"out\\">loading…</p>";\nconst out = document.getElementById("out");\nPromise.resolve()\n  .then(() => promisify(readConfig)("app"))\n  .then((config) => (out.textContent = JSON.stringify(config)))\n  .catch((error) => (out.textContent = "error: " + error.message));\n',
    },
    visibleFiles: ["/src/promisify.js", "/index.js"],
    activeFile: "/src/promisify.js",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { promisify } from "../src/promisify";\n\nconst add = (a, b, cb) => setTimeout(() => cb(null, a + b), 5);\nconst fail = (cb) => setTimeout(() => cb(new Error("boom")), 5);\n\ndescribe("promisify", () => {\n  it("returns a promise that resolves with the value", async () => {\n    const result = promisify(add)(2, 3);\n    expect(result instanceof Promise).toBe(true);\n    expect(await result).toBe(5);\n  });\n  it("rejects with the callback error", async () => {\n    await expect(promisify(fail)()).rejects.toThrow("boom");\n  });\n  it("resolves falsy values", async () => {\n    expect(await promisify((cb) => cb(null, 0))()).toBe(0);\n  });\n  it("turns synchronous throws into rejections", async () => {\n    const thrower = () => {\n      throw new Error("sync");\n    };\n    let threw = false;\n    let promise;\n    try {\n      promise = promisify(thrower)();\n    } catch (error) {\n      threw = true;\n    }\n    expect(threw).toBe(false);\n    await expect(promise).rejects.toThrow("sync");\n  });\n  it("keeps this", async () => {\n    const db = {\n      rows: ["a", "b"],\n      count(cb) {\n        cb(null, this.rows.length);\n      },\n    };\n    db.countAsync = promisify(db.count);\n    expect(await db.countAsync()).toBe(2);\n  });\n});\n',
    solution: {
      "/src/promisify.js":
        "export function promisify(fn) {\n  return function (...args) {\n    return new Promise((resolve, reject) => {\n      const callback = (err, value) => (err ? reject(err) : resolve(value));\n      fn.call(this, ...args, callback);\n    });\n  };\n}\n",
    },
    explanation: [
      "Wrap the call in `new Promise`: its executor already turns synchronous throws into rejections, and the error-first callback maps to `reject`/`resolve`. A regular `function` (not an arrow) receives the caller's `this`, which `fn.call(this, ...)` forwards. Today you'd usually import `promisify` from `node:util` or use the `node:fs/promises` APIs directly.",
      "Обгорніть виклик у `new Promise`: його виконавець уже перетворює синхронні винятки на відхилення, а колбек з помилкою першим аргументом зіставляється з `reject`/`resolve`. Звичайна `function` (не стрілкова) отримує `this` викликача, який `fn.call(this, ...)` передає далі. Сьогодні зазвичай імпортують `promisify` з `node:util` або одразу використовують API `node:fs/promises`.",
    ],
  }),
]);
