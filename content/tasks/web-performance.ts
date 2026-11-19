import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "perf-core-web-vitals",
    ["web-performance"],
    1,
    60,
    ["Core Web Vitals", "Core Web Vitals"],
    ["Which metric measures how quickly the page responds visually to a click or key press?", "Яка метрика вимірює, наскільки швидко сторінка візуально реагує на клік чи натискання клавіші?"],
    [
      ["LCP", "LCP"],
      ["INP", "INP"],
      ["CLS", "CLS"],
      ["TTFB", "TTFB"],
    ],
    "b",
    [
      "Interaction to Next Paint measures the delay from user input to the next frame being painted. LCP is about loading the main content, CLS about unexpected layout shifts, and TTFB about server response time.",
      "Interaction to Next Paint вимірює затримку від дії користувача до наступного відмальованого кадру. LCP стосується завантаження основного вмісту, CLS неочікуваних зсувів розкладки, а TTFB часу відповіді сервера.",
    ],
  ),
  quiz(
    "perf-transform-animation",
    ["web-performance", w("css")],
    2,
    90,
    ["Cheap animations", "Дешеві анімації"],
    ["Which property change is the cheapest to animate at 60 fps?", "Зміну якої властивості найдешевше анімувати з частотою 60 кадрів/с?"],
    [
      ["`left`", "`left`"],
      ["`width`", "`width`"],
      ["`transform: translateX()`", "`transform: translateX()`"],
      ["`margin-left`", "`margin-left`"],
    ],
    "c",
    [
      "`left`, `width` and `margin` change geometry and trigger layout and paint on every frame. `transform` (and `opacity`) can be handled by the compositor, often on the GPU, without re-running layout.",
      "`left`, `width` і `margin` змінюють геометрію й запускають layout і paint на кожному кадрі. `transform` (і `opacity`) може обробити композитор, часто на GPU, без повторного layout.",
    ],
  ),
  quiz(
    "perf-cls-images",
    ["web-performance", w("html")],
    2,
    90,
    ["Layout shift", "Зсув розкладки"],
    ["Text jumps down when images load. What's the simplest fix?", "Текст зсувається донизу, коли завантажуються зображення. Яке найпростіше виправлення?"],
    [
      ["Set `width` and `height` (or `aspect-ratio`) on the images so space is reserved", "Задати `width` і `height` (або `aspect-ratio`) зображенням, щоб резервувати місце"],
      ["Add `loading=\"lazy\"`", "Додати `loading=\"lazy\"`"],
      ["Convert the images to WebP", "Конвертувати зображення у WebP"],
      ["Load the images with JavaScript", "Завантажувати зображення через JavaScript"],
    ],
    "a",
    [
      "Without dimensions the browser allocates 0 height until the image arrives, then pushes content down, which is CLS. Intrinsic dimensions let it reserve the right box upfront. Lazy loading or smaller formats help loading time but not shifts.",
      "Без розмірів браузер виділяє нульову висоту, доки зображення не завантажиться, а потім зсуває вміст донизу: це і є CLS. Власні розміри дозволяють одразу зарезервувати правильний блок. Ліниве завантаження чи менші формати пришвидшують завантаження, але не прибирають зсувів.",
    ],
  ),
  quiz(
    "perf-debounce-vs-throttle",
    ["web-performance", w("closures-scope")],
    3,
    120,
    ["Debounce or throttle", "Debounce чи throttle"],
    ["You update a \"back to top\" button based on scroll position and want it to react smoothly while the user scrolls, without running on every event. What do you use?", "Ви оновлюєте кнопку «нагору» залежно від позиції прокрутки й хочете, щоб вона плавно реагувала під час прокрутки, але не на кожну подію. Що використати?"],
    [
      ["Debounce: runs once after scrolling stops", "Debounce: виконується один раз після зупинки прокрутки"],
      ["Throttle: runs at most once per interval while scrolling continues", "Throttle: виконується не частіше за раз на інтервал, поки прокрутка триває"],
      ["Neither: `scroll` events are already throttled to once per second", "Жоден: події `scroll` уже обмежені до одного разу на секунду"],
      ["setInterval polling every 1 ms", "Опитування через setInterval кожну 1 мс"],
    ],
    "b",
    [
      "Throttle gives regular updates during a continuous stream of events. Debounce waits for a pause, which suits search-as-you-type or saving drafts. For scroll-linked visuals, `requestAnimationFrame` or IntersectionObserver are even better.",
      "Throttle дає регулярні оновлення під час безперервного потоку подій. Debounce чекає на паузу, що підходить для пошуку під час введення чи збереження чернеток. Для візуальних ефектів, пов'язаних із прокруткою, ще краще підходять `requestAnimationFrame` або IntersectionObserver.",
    ],
  ),
  quiz(
    "perf-long-task",
    ["web-performance", w("async-javascript")],
    4,
    150,
    ["Long tasks and INP", "Довгі задачі та INP"],
    ["Clicking \"Export\" freezes the page for 800 ms while a big array is processed. Which changes improve responsiveness? Select all that apply.", "Клік на «Export» заморожує сторінку на 800 мс, поки обробляється великий масив. Які зміни покращать чутливість? Оберіть усі правильні."],
    [
      ["Move the processing into a Web Worker", "Перенести обробку у Web Worker"],
      ["Split the work into chunks and yield to the main thread between them", "Розбити роботу на частини й поступатися головним потоком між ними"],
      ["Wrap the loop in `async function` without any `await`", "Обгорнути цикл в `async function` без жодного `await`"],
      ["Show feedback (spinner) before starting the heavy work", "Показати відгук (спінер) перед початком важкої роботи"],
    ],
    "abd",
    [
      "A long synchronous task blocks input and paint. A worker moves it off the main thread, and chunking with yields lets the browser handle events between chunks. Painting feedback first makes the interaction feel immediate. An `async` function without `await` still runs synchronously.",
      "Довга синхронна задача блокує введення й відмальовування. Воркер виносить її з головного потоку, а розбиття на частини з поступками дозволяє браузеру обробляти події між ними. Якщо спершу відмалювати відгук, взаємодія здається миттєвою. `async`-функція без `await` все одно виконується синхронно.",
    ],
  ),
  practice({
    slug: "perf-debounce",
    skills: ["web-performance", w("closures-scope")],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Debounce with cancel", "Debounce зі скасуванням"],
    prompt: [
      "Implement `debounce(fn, wait)`:\n\n- Returns a function that delays calling `fn` until `wait` ms have passed **since the last call**.\n- `fn` receives the **latest** arguments and the caller's `this`.\n- The returned function has a `cancel()` method that drops a pending call.\n\nThe demo search box logs a \"search\" only after you stop typing.",
      "Реалізуйте `debounce(fn, wait)`:\n\n- Повертає функцію, яка відкладає виклик `fn`, доки не мине `wait` мс **від останнього виклику**.\n- `fn` отримує **останні** аргументи й `this` того, хто викликав.\n- Повернена функція має метод `cancel()`, що скасовує відкладений виклик.\n\nДемо-поле пошуку записує «search» лише після того, як ви перестанете друкувати.",
    ],
    files: {
      "/src/debounce.ts": "export type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel(): void };\n\nexport function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number): Debounced<A> {\n  // TODO\n  const debounced = ((...args: A) => fn(...args)) as Debounced<A>;\n  debounced.cancel = () => {};\n  return debounced;\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { debounce } from "./src/debounce";\n\nconst app = document.getElementById("app")!;\napp.innerHTML = `<h1>Debounced search</h1>\n<label for="q">Search</label> <input id="q" />\n<ol id="log"></ol>`;\nconst log = document.getElementById("log")!;\nconst search = debounce((q: string) => log.insertAdjacentHTML("beforeend", `<li>search: ${q}</li>`), 300);\ndocument.getElementById("q")!.addEventListener("input", (e) => search((e.target as HTMLInputElement).value));\n',
    },
    visibleFiles: ["/src/debounce.ts", "/index.ts"],
    activeFile: "/src/debounce.ts",
    tests: 'import { describe, it, expect, fn, sleep, screen, user } from "./test-kit";\nimport { debounce } from "../src/debounce";\n\ndescribe("debounce", () => {\n  it("waits before calling", async () => {\n    const spy = fn();\n    const d = debounce(spy, 50);\n    d();\n    expect(spy).toHaveBeenCalledTimes(0);\n    await sleep(80);\n    expect(spy).toHaveBeenCalledTimes(1);\n  });\n  it("collapses a burst into one call with the latest arguments", async () => {\n    const spy = fn();\n    const d = debounce(spy, 50);\n    d("a");\n    d("ab");\n    d("abc");\n    await sleep(90);\n    expect(spy).toHaveBeenCalledTimes(1);\n    expect(spy).toHaveBeenCalledWith("abc");\n  });\n  it("restarts the timer on every call", async () => {\n    const spy = fn();\n    const d = debounce(spy, 60);\n    d();\n    await sleep(40);\n    d();\n    await sleep(40);\n    expect(spy).toHaveBeenCalledTimes(0);\n    await sleep(50);\n    expect(spy).toHaveBeenCalledTimes(1);\n  });\n  it("preserves this", async () => {\n    let seen: unknown;\n    const obj = { name: "box", run: debounce(function (this: { name: string }) { seen = this.name; }, 20) };\n    obj.run();\n    await sleep(40);\n    expect(seen).toBe("box");\n  });\n  it("cancel() drops the pending call", async () => {\n    const spy = fn();\n    const d = debounce(spy, 30);\n    d();\n    d.cancel();\n    await sleep(60);\n    expect(spy).toHaveBeenCalledTimes(0);\n  });\n  it("debounces the demo search box", async () => {\n    await user.type(screen.getByLabelText("Search"), "react");\n    await sleep(400);\n    const items = screen.getAllByRole("listitem");\n    expect(items).toHaveLength(1);\n    expect(items[0]).toHaveTextContent("search: react");\n  });\n});\n',
    solution: {
      "/src/debounce.ts": "export type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel(): void };\n\nexport function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number): Debounced<A> {\n  let timer: ReturnType<typeof setTimeout> | undefined;\n\n  const debounced = function (this: unknown, ...args: A) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      timer = undefined;\n      fn.apply(this, args);\n    }, wait);\n  } as Debounced<A>;\n\n  debounced.cancel = () => {\n    clearTimeout(timer);\n    timer = undefined;\n  };\n\n  return debounced;\n}\n",
    },
    explanation: [
      "Keep the pending timer in a closure. Each call clears it and schedules a new one with the latest arguments, so only the call after a quiet period fires. Use a regular `function` (not an arrow) so `this` comes from the caller, then forward it with `apply`. `cancel` simply clears the timer.",
      "Тримайте відкладений таймер у замиканні. Кожен виклик очищає його й планує новий з останніми аргументами, тож спрацьовує лише виклик після паузи. Використайте звичайну `function` (не стрілкову), щоб `this` брався від викликача, і передайте його через `apply`. `cancel` просто очищає таймер.",
    ],
  }),
]);
