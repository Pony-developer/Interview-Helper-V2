import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "perf-font-display",
    ["web-performance", { slug: "css", weight: 0.5 }],
    3,
    60,
    ["Invisible text while fonts load", "Невидимий текст під час завантаження шрифтів"],
    ["On slow connections, headings stay invisible for a few seconds until the web font arrives. Which `@font-face` setting shows fallback text immediately?", "На повільному з'єднанні заголовки кілька секунд невидимі, доки не завантажиться вебшрифт. Яке налаштування `@font-face` одразу показує резервний текст?"],
    [
      ["`font-display: block`", "`font-display: block`"],
      ["`font-display: swap`", "`font-display: swap`"],
      ["`font-weight: normal`", "`font-weight: normal`"],
      ["`unicode-range: U+0000-00FF`", "`unicode-range: U+0000-00FF`"],
    ],
    "b",
    [
      "`swap` renders text in the fallback font right away and swaps in the web font when it loads, so text is never invisible (FOIT). Reduce the resulting layout shift by preloading the main font and tuning the fallback with `size-adjust`. `block` is the behaviour that hides text.",
      "`swap` одразу рендерить текст резервним шрифтом і підміняє вебшрифт після завантаження, тож текст ніколи не буває невидимим (FOIT). Зменште зсув макета, що виникає, попереднім завантаженням основного шрифту й налаштуванням резервного через `size-adjust`. `block` — саме та поведінка, що ховає текст.",
    ],
  ),
  quiz(
    "perf-content-visibility",
    ["web-performance", { slug: "css", weight: 0.5 }],
    4,
    90,
    ["Rendering long pages", "Рендеринг довгих сторінок"],
    ["A documentation page has 300 long sections, and the initial render is slow. Which CSS lets the browser skip layout and paint for sections that are off-screen?", "Сторінка документації має 300 довгих розділів, і початковий рендер повільний. Який CSS дозволяє браузеру пропускати макет і малювання для розділів поза екраном?"],
    [
      ["`section { content-visibility: auto; contain-intrinsic-size: auto 800px; }`", "`section { content-visibility: auto; contain-intrinsic-size: auto 800px; }`"],
      ["`section { display: none; }` until it is scrolled into view", "`section { display: none; }`, доки розділ не прокрутять у видиму область"],
      ["`section { will-change: transform; }`", "`section { will-change: transform; }`"],
      ["`section { visibility: hidden; }`", "`section { visibility: hidden; }`"],
    ],
    "a",
    [
      "`content-visibility: auto` skips rendering work for off-screen elements while keeping them in the DOM and accessibility tree, so find-in-page and anchor links still work. `contain-intrinsic-size` gives a placeholder size, so the scrollbar doesn't jump. `display: none` removes content from the accessibility tree, and `will-change` adds layers instead of saving work.",
      "`content-visibility: auto` пропускає роботу з рендерингу для елементів поза екраном, залишаючи їх у DOM і дереві доступності, тож пошук на сторінці та якорі працюють. `contain-intrinsic-size` задає розмір-заглушку, щоб смуга прокрутки не стрибала. `display: none` прибирає вміст із дерева доступності, а `will-change` додає шари замість економії роботи.",
    ],
  ),
  quiz(
    "perf-detached-dom",
    ["web-performance", { slug: "closures-scope", weight: 0.5 }],
    5,
    120,
    ["Finding a memory leak", "Пошук витоку пам'яті"],
    ["In a single-page app, memory grows every time the user opens and closes a modal. What is the most effective way to find the cause?", "В односторінковому застосунку пам'ять зростає щоразу, коли користувач відкриває й закриває модальне вікно. Як найефективніше знайти причину?"],
    [
      ["Count `console.log` calls", "Порахувати виклики `console.log`"],
      ["Take heap snapshots before and after a few open/close cycles, compare them, and look for detached DOM nodes and their retainers", "Зробити знімки купи до й після кількох циклів відкриття/закриття, порівняти їх і шукати від'єднані DOM-вузли та їхніх утримувачів"],
      ["Run Lighthouse on the home page", "Запустити Lighthouse на головній сторінці"],
      ["Increase the browser's memory limit", "Збільшити ліміт пам'яті браузера"],
    ],
    "b",
    [
      "Repeat the action several times so the leak stands out from one-time caches, then use the Memory panel's comparison view or filter for \"Detached\". The retainers path shows what still references the removed nodes: typically a global listener, a timer, a cache map or a closure. Lighthouse measures page loads, not leaks during interaction.",
      "Повторіть дію кілька разів, щоб витік вирізнявся на тлі одноразових кешів, потім скористайтеся порівнянням у панелі Memory або фільтром «Detached». Шлях утримувачів показує, що досі посилається на видалені вузли: зазвичай глобальний обробник, таймер, кеш-мапа чи замикання. Lighthouse вимірює завантаження сторінки, а не витоки під час взаємодії.",
    ],
  ),
  practice({
    slug: "perf-throttle",
    skills: ["web-performance", { slug: "closures-scope", weight: 0.5 }],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Throttle with a trailing call", "Throttle з завершальним викликом"],
    prompt: [
      "Implement `throttle(fn, wait)` for scroll and resize handlers.\n\n- The first call runs `fn` immediately (leading edge).\n- Calls during the next `wait` ms don't run `fn`; instead, **one** trailing call runs at the end of the window with the **latest** arguments.\n- If nothing was called during the window, there's no trailing call.\n- `throttled.cancel()` drops any pending trailing call.",
      "Реалізуйте `throttle(fn, wait)` для обробників прокрутки й зміни розміру.\n\n- Перший виклик одразу запускає `fn` (передній фронт).\n- Виклики протягом наступних `wait` мс не запускають `fn`; натомість у кінці вікна виконується **один** завершальний виклик з **останніми** аргументами.\n- Якщо протягом вікна викликів не було, завершального виклику немає.\n- `throttled.cancel()` скасовує запланований завершальний виклик.",
    ],
    files: {
      "/src/throttle.ts":
        "export type Throttled<A extends unknown[]> = ((...args: A) => void) & { cancel(): void };\n\nexport function throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number): Throttled<A> {\n  // TODO: leading call, then one trailing call per window\n  const throttled = (...args: A) => fn(...args);\n  return Object.assign(throttled, { cancel() {} });\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { throttle } from "./src/throttle";\n\nconst app = document.getElementById("app")!;\napp.innerHTML = "<h1>Pointer moves</h1><p>raw: <b id=\\"raw\\">0</b>, throttled: <b id=\\"slow\\">0</b></p>";\nlet raw = 0;\nlet slow = 0;\nconst update = throttle(() => (document.getElementById("slow")!.textContent = String(++slow)), 200);\ndocument.addEventListener("pointermove", () => {\n  document.getElementById("raw")!.textContent = String(++raw);\n  update();\n});\n',
    },
    visibleFiles: ["/src/throttle.ts", "/index.ts"],
    activeFile: "/src/throttle.ts",
    tests:
      'import { describe, it, expect, fn, sleep } from "./test-kit";\nimport { throttle } from "../src/throttle";\n\ndescribe("throttle", () => {\n  it("runs the first call immediately", () => {\n    const spy = fn();\n    const t = throttle(spy, 50);\n    t("a");\n    expect(spy).toHaveBeenCalledTimes(1);\n    expect(spy).toHaveBeenCalledWith("a");\n    t.cancel();\n  });\n  it("coalesces calls in the window into one trailing call with the latest args", async () => {\n    const spy = fn();\n    const t = throttle(spy, 50);\n    t(1);\n    t(2);\n    t(3);\n    expect(spy).toHaveBeenCalledTimes(1);\n    await sleep(90);\n    expect(spy).toHaveBeenCalledTimes(2);\n    expect(spy.mock.calls[1]).toEqual([3]);\n  });\n  it("does not add a trailing call when there were no extra calls", async () => {\n    const spy = fn();\n    const t = throttle(spy, 30);\n    t();\n    await sleep(70);\n    expect(spy).toHaveBeenCalledTimes(1);\n  });\n  it("allows a new leading call after the window", async () => {\n    const spy = fn();\n    const t = throttle(spy, 30);\n    t("x");\n    await sleep(70);\n    t("y");\n    expect(spy).toHaveBeenCalledTimes(2);\n    expect(spy.mock.calls[1]).toEqual(["y"]);\n    t.cancel();\n  });\n  it("cancel drops the pending trailing call", async () => {\n    const spy = fn();\n    const t = throttle(spy, 30);\n    t(1);\n    t(2);\n    t.cancel();\n    await sleep(70);\n    expect(spy).toHaveBeenCalledTimes(1);\n  });\n});\n',
    solution: {
      "/src/throttle.ts":
        "export type Throttled<A extends unknown[]> = ((...args: A) => void) & { cancel(): void };\n\nexport function throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number): Throttled<A> {\n  let timer: ReturnType<typeof setTimeout> | undefined;\n  let pendingArgs: A | undefined;\n\n  const endWindow = () => {\n    if (pendingArgs) {\n      const args = pendingArgs;\n      pendingArgs = undefined;\n      fn(...args);\n      timer = setTimeout(endWindow, wait); // the trailing call opens a new window\n    } else {\n      timer = undefined;\n    }\n  };\n\n  const throttled = (...args: A) => {\n    if (timer === undefined) {\n      fn(...args);\n      timer = setTimeout(endWindow, wait);\n    } else {\n      pendingArgs = args;\n    }\n  };\n\n  return Object.assign(throttled, {\n    cancel() {\n      clearTimeout(timer);\n      timer = undefined;\n      pendingArgs = undefined;\n    },\n  });\n}\n",
    },
    explanation: [
      "The closure tracks two things: whether a window is open (`timer`) and the latest arguments received during it. A call with no open window runs immediately and opens one. Calls during the window only overwrite `pendingArgs`. When the window ends, a pending call runs and opens a new window, so `fn` never runs more often than once per `wait`. Debounce waits for silence; throttle guarantees a steady rate.",
      "Замикання відстежує дві речі: чи відкрите вікно (`timer`) і останні аргументи, отримані в ньому. Виклик без відкритого вікна виконується одразу й відкриває вікно. Виклики під час вікна лише перезаписують `pendingArgs`. Коли вікно закінчується, відкладений виклик виконується й відкриває нове вікно, тож `fn` ніколи не запускається частіше ніж раз на `wait`. Debounce чекає на тишу; throttle гарантує рівномірну частоту.",
    ],
  }),
]);
