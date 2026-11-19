import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "closure-var-loop",
    ["closures-scope", w("javascript")],
    1,
    60,
    ["var in a loop", "var у циклі"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`0 1 2`", "`0 1 2`"],
      ["`3 3 3`", "`3 3 3`"],
      ["`undefined undefined undefined`", "`undefined undefined undefined`"],
      ["`2 2 2`", "`2 2 2`"],
    ],
    "b",
    [
      "`var` creates one function-scoped `i` shared by all callbacks. The timers run after the loop ends, when `i` is 3. With `let`, each iteration gets its own binding and you'd see `0 1 2`.",
      "`var` створює один `i` в області функції, спільний для всіх колбеків. Таймери спрацьовують після завершення циклу, коли `i` дорівнює 3. З `let` кожна ітерація має власну прив'язку, і виведеться `0 1 2`.",
    ],
    { code: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i));\n}", codeLanguage: "js" },
  ),
  quiz(
    "closure-tdz",
    ["closures-scope"],
    2,
    90,
    ["Temporal dead zone", "Temporal dead zone"],
    ["What happens when `show()` runs?", "Що станеться під час виконання `show()`?"],
    [
      ["Logs `undefined`", "Виведе `undefined`"],
      ["Logs `\"outer\"`", "Виведе `\"outer\"`"],
      ["Throws a `ReferenceError`", "Кине `ReferenceError`"],
      ["Logs `\"inner\"`", "Виведе `\"inner\"`"],
    ],
    "c",
    [
      "The inner `let name` is hoisted to the top of the function, so it shadows the outer variable for the whole block. Reading it before the declaration line is inside the temporal dead zone, which throws a `ReferenceError`.",
      "Внутрішній `let name` піднімається на початок функції, тож затіняє зовнішню змінну в усьому блоці. Читання до рядка оголошення потрапляє в temporal dead zone, що кидає `ReferenceError`.",
    ],
    { code: 'const name = "outer";\nfunction show() {\n  console.log(name);\n  let name = "inner";\n}\nshow();', codeLanguage: "js" },
  ),
  quiz(
    "closure-independent-counters",
    ["closures-scope"],
    2,
    90,
    ["Independent closures", "Незалежні замикання"],
    ["What does the last line print?", "Що виведе останній рядок?"],
    [
      ["`1 1`", "`1 1`"],
      ["`2 1`", "`2 1`"],
      ["`2 3`", "`2 3`"],
      ["`3 3`", "`3 3`"],
    ],
    "b",
    [
      "Each call to `makeCounter` creates a new `count` variable, captured only by that counter's function. `a` was called twice (2), `b` once (1).",
      "Кожен виклик `makeCounter` створює нову змінну `count`, яку захоплює лише функція цього лічильника. `a` викликали двічі (2), `b` один раз (1).",
    ],
    { code: "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst a = makeCounter();\nconst b = makeCounter();\na(); b();\nconsole.log(a(), b() - 1);", codeLanguage: "js" },
  ),
  quiz(
    "closure-stale-interval",
    ["closures-scope", w("react")],
    4,
    150,
    ["Stale closure in React", "Застаріле замикання в React"],
    ["This counter shows 1 and never goes higher. Why?", "Цей лічильник показує 1 і далі не зростає. Чому?"],
    [
      [
        "The interval callback closed over `count` from the first render (always 0); use `setCount(c => c + 1)`",
        "Колбек інтервалу замкнув `count` з першого рендеру (завжди 0); використайте `setCount(c => c + 1)`",
      ],
      ["`setInterval` only fires once inside React effects", "`setInterval` усередині ефектів React спрацьовує лише раз"],
      ["React batches the updates and drops all but the first", "React групує оновлення й відкидає всі, крім першого"],
      ["The cleanup function clears the interval after the first tick", "Функція очищення прибирає інтервал після першого спрацювання"],
    ],
    "a",
    [
      "With `[]` dependencies the effect runs once, and its callback keeps reading `count` from that render, so it sets 0 + 1 every second. The updater form reads the latest state without re-creating the interval.",
      "З залежностями `[]` ефект виконується один раз, і його колбек постійно читає `count` з того рендеру, тож щосекунди встановлює 0 + 1. Форма з функцією-оновлювачем читає актуальний стан без перестворення інтервалу.",
    ],
    { code: "const [count, setCount] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000);\n  return () => clearInterval(id);\n}, []);", codeLanguage: "tsx" },
  ),
  quiz(
    "closure-memoize-falsy",
    ["closures-scope"],
    3,
    120,
    ["Memoize bug", "Помилка в memoize"],
    ["`slowSquare(0)` is recomputed on every call, even after the first. Why?", "`slowSquare(0)` перераховується щоразу, навіть після першого виклику. Чому?"],
    [
      ["Map keys can't be numbers", "Ключі Map не можуть бути числами"],
      ["`cache.get(0)` is `0`, which is falsy, so the cache looks empty; check `cache.has(arg)`", "`cache.get(0)` дорівнює `0`, а це хибне значення, тож кеш здається порожнім; перевіряйте `cache.has(arg)`"],
      ["The closure creates a new Map on every call", "Замикання створює новий Map при кожному виклику"],
      ["Arrow functions can't capture variables", "Стрілкові функції не можуть захоплювати змінні"],
    ],
    "b",
    [
      "The cached value is 0 (0² = 0), so `if (cache.get(arg))` is false and the function runs again. Testing membership with `has` works for every value, including 0, \"\", false and undefined.",
      "Закешоване значення дорівнює 0 (0² = 0), тож `if (cache.get(arg))` хибне, і функція виконується знову. Перевірка через `has` працює для будь-якого значення, включно з 0, \"\", false і undefined.",
    ],
    { code: "function memoize(fn) {\n  const cache = new Map();\n  return (arg) => {\n    if (cache.get(arg)) return cache.get(arg);\n    const value = fn(arg);\n    cache.set(arg, value);\n    return value;\n  };\n}", codeLanguage: "js" },
  ),
  practice({
    slug: "closure-once-and-memoize",
    skills: ["closures-scope", w("javascript")],
    complexity: 2,
    estSeconds: 720,
    framework: "vanilla-js",
    title: ["once() and memoize()", "once() та memoize()"],
    prompt: [
      "Implement two closure helpers in `src/fn.js`:\n\n- `once(fn)`: the returned function calls `fn` the first time only (with its arguments and `this`) and always returns that first result.\n- `memoize(fn)`: caches results by the **first argument**. Cached falsy values (`0`, `\"\"`, `undefined`) must count as cache hits.",
      "Реалізуйте два допоміжні замикання в `src/fn.js`:\n\n- `once(fn)`: повернена функція викликає `fn` лише першого разу (з аргументами й `this`) і завжди повертає той перший результат.\n- `memoize(fn)`: кешує результати за **першим аргументом**. Закешовані хибні значення (`0`, `\"\"`, `undefined`) мають вважатися влученнями в кеш.",
    ],
    files: {
      "/src/fn.js": "export function once(fn) {\n  // TODO\n  return fn;\n}\n\nexport function memoize(fn) {\n  // TODO\n  return fn;\n}\n",
      "/index.js": 'import "./styles.css";\nimport { once, memoize } from "./src/fn";\n\nlet calls = 0;\nconst slowSquare = memoize((n) => {\n  calls++;\n  return n * n;\n});\n[4, 4, 0, 0, 4].forEach(slowSquare);\nconst init = once(() => "initialised");\n\ndocument.getElementById("app").innerHTML =\n  "<h1>Closures</h1>" +\n  "<p>slowSquare ran <output id=\\"calls\\">" + calls + "</output> times for 5 calls.</p>" +\n  "<p>" + init() + " / " + init() + "</p>";\n',
    },
    visibleFiles: ["/src/fn.js", "/index.js"],
    activeFile: "/src/fn.js",
    tests: 'import { describe, it, expect, fn, screen } from "./test-kit";\nimport { once, memoize } from "../src/fn";\n\ndescribe("once", () => {\n  it("calls the function only once and returns the first result", () => {\n    const spy = fn((x) => x * 2);\n    const f = once(spy);\n    expect(f(2)).toBe(4);\n    expect(f(10)).toBe(4);\n    expect(spy).toHaveBeenCalledTimes(1);\n  });\n  it("preserves this", () => {\n    const obj = { n: 7, get: once(function () { return this.n; }) };\n    expect(obj.get()).toBe(7);\n  });\n});\n\ndescribe("memoize", () => {\n  it("caches by the first argument", () => {\n    const spy = fn((n) => n * n);\n    const sq = memoize(spy);\n    expect(sq(3)).toBe(9);\n    expect(sq(3)).toBe(9);\n    expect(spy).toHaveBeenCalledTimes(1);\n  });\n  it("treats falsy results as cache hits", () => {\n    const spy = fn(() => 0);\n    const zero = memoize(spy);\n    zero("a");\n    zero("a");\n    expect(spy).toHaveBeenCalledTimes(1);\n  });\n  it("keeps separate entries per argument", () => {\n    const spy = fn((s) => s.toUpperCase());\n    const up = memoize(spy);\n    expect(up("a")).toBe("A");\n    expect(up("b")).toBe("B");\n    expect(spy).toHaveBeenCalledTimes(2);\n  });\n  it("renders the demo", async () => {\n    expect(await screen.findByText("2")).toBeInTheDocument();\n  });\n});\n',
    solution: {
      "/src/fn.js": "export function once(fn) {\n  let called = false;\n  let result;\n  return function (...args) {\n    if (!called) {\n      called = true;\n      result = fn.apply(this, args);\n    }\n    return result;\n  };\n}\n\nexport function memoize(fn) {\n  const cache = new Map();\n  return function (arg, ...rest) {\n    if (!cache.has(arg)) cache.set(arg, fn.call(this, arg, ...rest));\n    return cache.get(arg);\n  };\n}\n",
    },
    explanation: [
      "Both helpers keep private state in a closure. `once` stores a flag and the first result, and uses `fn.apply(this, args)` to forward `this`. `memoize` keeps a Map and checks membership with `has`, so falsy results are cached too.",
      "Обидві функції зберігають приватний стан у замиканні. `once` зберігає прапорець і перший результат та передає `this` через `fn.apply(this, args)`. `memoize` тримає Map і перевіряє наявність через `has`, тож хибні результати теж кешуються.",
    ],
  }),
]);
