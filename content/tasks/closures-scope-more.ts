import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "closure-retained-memory",
    ["closures-scope", { slug: "web-performance", weight: 0.5 }],
    3,
    75,
    ["Closures and memory", "Замикання і пам'ять"],
    ["After `setup()` runs, why does `rows` (50 MB) stay in memory?", "Чому після виконання `setup()` масив `rows` (50 МБ) лишається в пам'яті?"],
    [
      ["`const` variables are never garbage-collected", "Змінні `const` ніколи не збираються збирачем сміття"],
      ["The listener closes over `rows`, and the listener stays attached to `window`", "Обробник замикає `rows`, а обробник лишається прикріпленим до `window`"],
      ["`console.log` keeps a copy of every array", "`console.log` зберігає копію кожного масиву"],
      ["Functions declared inside other functions leak", "Функції, оголошені всередині інших функцій, спричиняють витоки"],
    ],
    "b",
    [
      "A closure keeps the variables it uses alive for as long as the function itself is reachable. `window` references the listener, the listener references `rows`, so nothing can be collected. Remove the listener when it's no longer needed (or use an `AbortController` signal), or keep only the data the closure really needs.",
      "Замикання тримає живими змінні, які використовує, доки сама функція досяжна. `window` посилається на обробник, обробник — на `rows`, тож нічого не може бути зібрано. Знімайте обробник, коли він більше не потрібен (або використовуйте сигнал `AbortController`), чи зберігайте лише ті дані, які замиканню справді потрібні.",
    ],
    { code: 'function setup() {\n  const rows = loadHugeReport(); // ~50 MB\n  window.addEventListener("resize", () => {\n    console.log("rows:", rows.length);\n  });\n}', codeLanguage: "js" },
  ),
  quiz(
    "closure-let-loop-copy",
    ["closures-scope"],
    4,
    120,
    ["Per-iteration bindings", "Прив'язки для кожної ітерації"],
    ["What does this return?", "Що це поверне?"],
    [
      ["`[0, 2]`", "`[0, 2]`"],
      ["`[1, 3]`", "`[1, 3]`"],
      ["`[4, 4]`", "`[4, 4]`"],
      ["`[0, 1, 2]`", "`[0, 1, 2]`"],
    ],
    "b",
    [
      "A `let` loop creates a new binding for each iteration, copying the current value into it before the increment runs. The first closure's binding is incremented to 1 by the `i++` inside the body. The next iteration starts from a copy of 1, the loop's `i++` makes it 2, the second closure captures that binding, and the body's `i++` makes it 3. So the closures see 1 and 3.",
      "Цикл із `let` створює нову прив'язку для кожної ітерації, копіюючи в неї поточне значення перед інкрементом. Прив'язку першого замикання `i++` у тілі збільшує до 1. Наступна ітерація починає з копії 1, `i++` циклу робить її 2, друге замикання захоплює цю прив'язку, а `i++` у тілі робить її 3. Тож замикання бачать 1 і 3.",
    ],
    { code: "const fns = [];\nfor (let i = 0; i < 3; i++) {\n  fns.push(() => i);\n  i++;\n}\nfns.map((f) => f());", codeLanguage: "js" },
  ),
  quiz(
    "closure-memoize-async",
    ["closures-scope", { slug: "async-javascript", weight: 0.5 }],
    5,
    120,
    ["Memoizing async calls", "Мемоїзація асинхронних викликів"],
    ["`getUser(1)` is called twice at the same time. Which cache design makes only one request and still lets a failed request be retried?", "`getUser(1)` викликають двічі одночасно. Яка схема кешу робить лише один запит і водночас дозволяє повторити невдалий запит?"],
    [
      ["Store the result in the cache after `await fetchUser(id)`", "Зберігати результат у кеші після `await fetchUser(id)`"],
      ["Store the promise in the cache before awaiting it, and delete it if it rejects", "Зберігати проміс у кеші до очікування й видаляти його, якщо він відхилився"],
      ["Store the promise in the cache and never delete it", "Зберігати проміс у кеші й ніколи не видаляти"],
      ["Use a `WeakMap` keyed by the id", "Використати `WeakMap` з id як ключем"],
    ],
    "b",
    [
      "Caching the result only after `await` leaves a window where both calls miss the cache and fire two requests. Caching the promise immediately makes the second caller share the in-flight request. Without deleting rejected promises, a single network error is cached forever. (A `WeakMap` can't use numbers as keys.)",
      "Якщо кешувати результат лише після `await`, лишається проміжок, коли обидва виклики не знаходять кеш і роблять два запити. Кешування промісу одразу дає другому викликачу спільний запит у процесі. Без видалення відхилених промісів одна мережева помилка кешується назавжди. (`WeakMap` не може мати числа як ключі.)",
    ],
  ),
  practice({
    slug: "closure-curry",
    skills: ["closures-scope", { slug: "javascript", weight: 0.5 }],
    complexity: 3,
    estSeconds: 600,
    framework: "vanilla-js",
    title: ["Implement curry", "Реалізуйте curry"],
    prompt: [
      "Implement `curry(fn)`. The curried function collects arguments across calls and calls `fn` once it has at least `fn.length` of them.\n\n```js\nconst add3 = curry((a, b, c) => a + b + c);\nadd3(1)(2)(3); // 6\nadd3(1, 2)(3); // 6\nadd3(1)(2, 3); // 6\n```\n\n- Partial applications are independent: `const add1 = add3(1)` can be reused.\n- Keep `this`: call `fn` with the `this` of the final call.",
      "Реалізуйте `curry(fn)`. Каррована функція збирає аргументи між викликами й викликає `fn`, щойно їх щонайменше `fn.length`.\n\n```js\nconst add3 = curry((a, b, c) => a + b + c);\nadd3(1)(2)(3); // 6\nadd3(1, 2)(3); // 6\nadd3(1)(2, 3); // 6\n```\n\n- Часткові застосування незалежні: `const add1 = add3(1)` можна використовувати повторно.\n- Зберігайте `this`: викликайте `fn` з `this` останнього виклику.",
    ],
    files: {
      "/src/curry.js": "export function curry(fn) {\n  // TODO: collect arguments until there are fn.length of them\n  return fn;\n}\n",
      "/index.js":
        'import "./styles.css";\nimport { curry } from "./src/curry";\n\nconst volume = curry((l, w, h) => l * w * h);\nlet result;\ntry {\n  result = volume(2)(3)(4);\n} catch (error) {\n  result = "error: " + error.message;\n}\ndocument.getElementById("app").innerHTML = "<h1>curry</h1><p>volume(2)(3)(4) = " + result + "</p>";\n',
    },
    visibleFiles: ["/src/curry.js", "/index.js"],
    activeFile: "/src/curry.js",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { curry } from "../src/curry";\n\nconst add3 = curry((a, b, c) => a + b + c);\n\ndescribe("curry", () => {\n  it("collects one argument at a time", () => expect(add3(1)(2)(3)).toBe(6));\n  it("accepts several arguments per call", () => {\n    expect(add3(1, 2)(3)).toBe(6);\n    expect(add3(1)(2, 3)).toBe(6);\n    expect(add3(1, 2, 3)).toBe(6);\n  });\n  it("keeps partial applications independent", () => {\n    const add1 = add3(1);\n    expect(add1(2)(3)).toBe(6);\n    expect(add1(10)(10)).toBe(21);\n  });\n  it("does not call fn too early", () => {\n    let calls = 0;\n    const mul = curry((a, b) => {\n      calls++;\n      return a * b;\n    });\n    mul(2);\n    expect(calls).toBe(0);\n    expect(mul(2)(5)).toBe(10);\n    expect(calls).toBe(1);\n  });\n  it("preserves this", () => {\n    const obj = { base: 10, add: curry(function (a, b) { return this.base + a + b; }) };\n    expect(obj.add(1, 2)).toBe(13);\n  });\n});\n',
    solution: {
      "/src/curry.js":
        "export function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn.apply(this, args);\n    return function (...more) {\n      return curried.apply(this, [...args, ...more]);\n    };\n  };\n}\n",
    },
    explanation: [
      "Each call returns a new closure over the arguments collected so far. Building a fresh array (`[...args, ...more]`) instead of pushing into a shared one is what keeps partial applications independent. Regular `function` expressions (not arrows) let `this` flow through `apply` to `fn`.",
      "Кожен виклик повертає нове замикання над уже зібраними аргументами. Створення нового масиву (`[...args, ...more]`) замість додавання до спільного — саме те, що робить часткові застосування незалежними. Звичайні вирази `function` (не стрілкові) дозволяють `this` пройти через `apply` до `fn`.",
    ],
  }),
]);
