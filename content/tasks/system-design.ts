import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const AC_TYPES = String.raw`export type SearchFn = (query: string, signal: AbortSignal) => Promise<string[]>;
export type AutocompleteState = { query: string; results: string[]; status: "idle" | "loading" | "done" | "error" };
export type AutocompleteOptions = { debounceMs?: number; minChars?: number };
`;

const AC_STARTER =
  AC_TYPES +
  String.raw`
export function createAutocomplete(search: SearchFn, options: AutocompleteOptions = {}) {
  // TODO: debounce, minimum length, cancellation, stale responses and a cache
  let state: AutocompleteState = { query: "", results: [], status: "idle" };
  const listeners = new Set<(s: AutocompleteState) => void>();
  const set = (patch: Partial<AutocompleteState>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l(state));
  };
  return {
    get state() {
      return state;
    },
    subscribe(listener: (s: AutocompleteState) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    input(query: string) {
      set({ query, status: "loading" });
      search(query, new AbortController().signal).then(
        (results) => set({ results, status: "done" }),
        () => set({ results: [], status: "error" }),
      );
    },
  };
}
`;

const AC_SOLUTION =
  AC_TYPES +
  String.raw`
export function createAutocomplete(search: SearchFn, options: AutocompleteOptions = {}) {
  const { debounceMs = 200, minChars = 2 } = options;
  let state: AutocompleteState = { query: "", results: [], status: "idle" };
  const listeners = new Set<(s: AutocompleteState) => void>();
  const cache = new Map<string, string[]>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | null = null;
  let requestId = 0;

  const set = (patch: Partial<AutocompleteState>) => {
    state = { ...state, ...patch };
    for (const listener of [...listeners]) listener(state);
  };

  /** Drops the pending debounce and the in-flight request; bumping the id makes any late result stale. */
  const cancel = () => {
    clearTimeout(timer);
    controller?.abort();
    controller = null;
    requestId++;
  };

  function run(query: string) {
    const id = ++requestId;
    controller = new AbortController();
    const { signal } = controller;
    set({ status: "loading" });
    search(query, signal).then(
      (results) => {
        if (id !== requestId) return; // a newer input superseded this request
        controller = null;
        cache.set(query, results);
        set({ results, status: "done" });
      },
      () => {
        if (id !== requestId || signal.aborted) return;
        controller = null;
        set({ results: [], status: "error" });
      },
    );
  }

  return {
    get state() {
      return state;
    },
    subscribe(listener: (s: AutocompleteState) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    input(query: string) {
      cancel();
      const q = query.trim();
      if (q.length < minChars) {
        set({ query, results: [], status: "idle" });
        return;
      }
      const cached = cache.get(q);
      if (cached) {
        set({ query, results: cached, status: "done" });
        return;
      }
      set({ query });
      timer = setTimeout(() => run(q), debounceMs);
    },
  };
}
`;

const AC_INDEX = String.raw`import "./styles.css";
import { createAutocomplete } from "./src/autocomplete";

const words = ["react", "redux", "remix", "rxjs", "rust", "ruby", "rollup", "routing"];
const search = (q: string, signal: AbortSignal) =>
  new Promise<string[]>((resolve, reject) => {
    const t = setTimeout(() => resolve(words.filter((w) => w.startsWith(q.toLowerCase()))), 150);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

const app = document.getElementById("app")!;
app.innerHTML =
  '<h1>Autocomplete</h1><label for="q">Search</label> <input id="q" autocomplete="off" />' +
  '<p role="status" id="status"></p><ul id="results"></ul>';
const ac = createAutocomplete(search, { debounceMs: 200, minChars: 2 });
ac.subscribe((s) => {
  document.getElementById("status")!.textContent = s.status;
  document.getElementById("results")!.innerHTML = s.results.map((r) => "<li>" + r + "</li>").join("");
});
app.querySelector("input")!.addEventListener("input", (e) => ac.input((e.target as HTMLInputElement).value));
`;

const AC_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createAutocomplete } from "../src/autocomplete";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Fake search: resolves after delays[q] ms (default 5); "boom" rejects; honours the abort signal. */
function fakeSearch(delays = {}, { ignoreAbort = false } = {}) {
  const calls = [];
  const aborted = [];
  const search = (q, signal) => {
    calls.push(q);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => (q === "boom" ? reject(new Error("fail")) : resolve([q + " 1", q + " 2"])), delays[q] ?? 5);
      if (!ignoreAbort) {
        signal.addEventListener("abort", () => {
          clearTimeout(t);
          aborted.push(q);
          reject(new DOMException("Aborted", "AbortError"));
        });
      }
    });
  };
  return { search, calls, aborted };
}

describe("createAutocomplete", () => {
  it("debounces keystrokes into one request", async () => {
    const { search, calls } = fakeSearch();
    const ac = createAutocomplete(search, { debounceMs: 20 });
    for (const q of ["re", "rea", "reac", "react"]) ac.input(q);
    await sleep(60);
    expect(calls).toEqual(["react"]);
    expect(ac.state).toEqual({ query: "react", results: ["react 1", "react 2"], status: "done" });
  });
  it("doesn't search below the minimum length", async () => {
    const { search, calls } = fakeSearch();
    const ac = createAutocomplete(search, { debounceMs: 10, minChars: 2 });
    ac.input("r");
    await sleep(30);
    expect(calls).toEqual([]);
    expect(ac.state).toEqual({ query: "r", results: [], status: "idle" });
  });
  it("aborts a request that a newer query replaced", async () => {
    const { search, calls, aborted } = fakeSearch({ re: 50 });
    const ac = createAutocomplete(search, { debounceMs: 10 });
    ac.input("re");
    await sleep(25);
    ac.input("rea");
    await sleep(60);
    expect(calls).toEqual(["re", "rea"]);
    expect(aborted).toEqual(["re"]);
    expect(ac.state.results).toEqual(["rea 1", "rea 2"]);
  });
  it("ignores late responses even if the search ignores the abort signal", async () => {
    const { search } = fakeSearch({ re: 60, rea: 5 }, { ignoreAbort: true });
    const ac = createAutocomplete(search, { debounceMs: 10 });
    ac.input("re");
    await sleep(25);
    ac.input("rea");
    await sleep(90);
    expect(ac.state.results).toEqual(["rea 1", "rea 2"]);
  });
  it("serves repeated queries from the cache without a request", async () => {
    const { search, calls } = fakeSearch();
    const ac = createAutocomplete(search, { debounceMs: 10 });
    ac.input("react");
    await sleep(40);
    ac.input("rea");
    await sleep(40);
    ac.input("react");
    expect(ac.state).toEqual({ query: "react", results: ["react 1", "react 2"], status: "done" });
    expect(calls).toEqual(["react", "rea"]);
  });
  it("reports errors", async () => {
    const { search } = fakeSearch();
    const ac = createAutocomplete(search, { debounceMs: 10 });
    ac.input("boom");
    await sleep(40);
    expect(ac.state).toEqual({ query: "boom", results: [], status: "error" });
  });
  it("cancels an in-flight request when the input is cleared", async () => {
    const { search } = fakeSearch({ rea: 40 });
    const ac = createAutocomplete(search, { debounceMs: 10 });
    ac.input("rea");
    await sleep(25);
    ac.input("");
    await sleep(60);
    expect(ac.state).toEqual({ query: "", results: [], status: "idle" });
  });
  it("notifies subscribers until they unsubscribe", async () => {
    const { search } = fakeSearch();
    const ac = createAutocomplete(search, { debounceMs: 10 });
    const statuses = [];
    const off = ac.subscribe((s) => statuses.push(s.status));
    ac.input("vue");
    await sleep(40);
    off();
    ac.input("x");
    expect(statuses.slice(-2)).toEqual(["loading", "done"]);
    expect(statuses.includes("idle") && statuses.indexOf("idle") < statuses.indexOf("loading")).toBe(true);
  });
});
`;

export default defineTasks([
  quiz(
    "sd-first-step",
    ["system-design"],
    1,
    45,
    ["Starting a design interview", "Початок співбесіди з проєктування"],
    ["You're asked to \"design a news feed\". What should you do first?", "Вас просять «спроєктувати стрічку новин». Що зробити спочатку?"],
    [
      ["Clarify functional and non-functional requirements and agree on what's out of scope", "Уточнити функціональні й нефункціональні вимоги та домовитися, що поза межами"],
      ["Start drawing the component tree", "Почати малювати дерево компонентів"],
      ["Pick a state management library", "Обрати бібліотеку керування станом"],
      ["Write the CSS for the post card", "Написати CSS для картки допису"],
    ],
    "a",
    [
      "Requirements drive every later decision: whether SEO matters (rendering strategy), how many items there are (virtualisation), whether real-time or offline support is needed. Spending the first few minutes clarifying and writing them down also gives you a checklist and shows structured thinking.",
      "Вимоги визначають кожне подальше рішення: чи важливе SEO (стратегія рендерингу), скільки елементів (віртуалізація), чи потрібні реальний час чи офлайн-підтримка. Кілька перших хвилин на уточнення й запис вимог також дають вам чекліст і показують структуроване мислення.",
    ],
  ),
  quiz(
    "sd-cursor-pagination",
    ["system-design", w("http-rest")],
    2,
    90,
    ["Paginating a live feed", "Пагінація живої стрічки"],
    ["New posts arrive at the top of the feed all the time. Why is `GET /feed?cursor=<last id>` better than `GET /feed?offset=40` for loading more?", "Нові дописи постійно з'являються вгорі стрічки. Чому `GET /feed?cursor=<last id>` кращий за `GET /feed?offset=40` для довантаження?"],
    [
      ["Offsets shift when items are inserted, so pages repeat or skip posts; a cursor continues from a fixed item", "Зсуви змінюються, коли додаються елементи, тож сторінки повторюють чи пропускають дописи; курсор продовжує від фіксованого елемента"],
      ["Cursors are always smaller in bytes", "Курсори завжди менші в байтах"],
      ["Offsets don't work with JSON", "Зсуви не працюють з JSON"],
      ["Cursors make the server cache everything", "Курсори змушують сервер кешувати все"],
    ],
    "a",
    [
      "With an offset, five new posts at the top push everything down, so \"items 40–59\" now contains five items the user already saw. A cursor (the last seen ID or timestamp) asks for \"items after this one\", which stays stable. It's also faster for databases with large offsets. The trade-off: you can't jump to page 37.",
      "Зі зсувом п'ять нових дописів угорі зсувають усе вниз, тож «елементи 40–59» тепер містять п'ять уже побачених. Курсор (останній побачений ID чи час) просить «елементи після цього», що лишається стабільним. Для баз даних він також швидший на великих зсувах. Компроміс: перейти одразу на сторінку 37 не вийде.",
    ],
  ),
  quiz(
    "sd-optimistic-update",
    ["system-design", w("state-management")],
    3,
    90,
    ["Optimistic likes", "Оптимістичні вподобання"],
    ["The \"like\" button should feel instant. Which approach is right?", "Кнопка «вподобати» має реагувати миттєво. Який підхід правильний?"],
    [
      ["Update the count and state immediately, send the request, and roll back (with a message) if it fails", "Одразу оновити лічильник і стан, надіслати запит і відкотити (з повідомленням), якщо він не вдасться"],
      ["Disable the button until the server responds", "Вимкнути кнопку до відповіді сервера"],
      ["Reload the whole feed after every like", "Перезавантажувати всю стрічку після кожного вподобання"],
      ["Only update the UI after a WebSocket confirmation", "Оновлювати інтерфейс лише після підтвердження через WebSocket"],
    ],
    "a",
    [
      "Optimistic updates assume success for low-risk, reversible actions, so the UI responds in the same frame. Keep the previous value to roll back on error, de-duplicate rapid toggles, and reconcile with the server's response (the real count may differ). Don't do this for actions where failure is common or costly, like payments.",
      "Оптимістичні оновлення припускають успіх для малоризикових, оборотних дій, тож інтерфейс реагує в тому ж кадрі. Зберігайте попереднє значення для відкату при помилці, усувайте дублювання швидких перемикань і звіряйтеся з відповіддю сервера (справжній лічильник може відрізнятися). Не робіть так для дій, де невдача часта чи дорога, як-от платежі.",
    ],
  ),
  quiz(
    "sd-virtualization",
    ["system-design", w("web-performance")],
    3,
    120,
    ["Rendering 10,000 rows", "Рендеринг 10 000 рядків"],
    ["A table with 10,000 rows makes scrolling janky. Which technique addresses the root cause, and what's its trade-off?", "Таблиця з 10 000 рядків робить прокрутку ривками. Яка техніка усуває першопричину і який її компроміс?"],
    [
      ["Virtualisation (render only the rows in view plus a buffer); it complicates find-in-page, accessibility and variable row heights", "Віртуалізація (рендерити лише видимі рядки плюс запас); вона ускладнює пошук на сторінці, доступність і змінну висоту рядків"],
      ["`React.memo` on every row; it has no downsides", "`React.memo` на кожному рядку; недоліків немає"],
      ["Debouncing the scroll event", "Debounce події прокрутки"],
      ["Moving the table into an iframe", "Перенесення таблиці в iframe"],
    ],
    "a",
    [
      "The cost is in the number of DOM nodes and layout, not in re-renders, so memoisation doesn't help much. Windowing keeps the DOM small regardless of data size. It breaks Ctrl+F for off-screen rows and needs care for screen readers (`aria-rowcount`, `aria-rowindex`) and dynamic heights. Pagination or `content-visibility: auto` are lighter alternatives.",
      "Вартість у кількості DOM-вузлів і розкладці, а не в повторних рендерах, тож мемоізація мало допомагає. Віконний рендеринг тримає DOM малим незалежно від обсягу даних. Він ламає Ctrl+F для рядків поза екраном і потребує уваги до зчитувачів екрана (`aria-rowcount`, `aria-rowindex`) і змінної висоти. Легші альтернативи: пагінація чи `content-visibility: auto`.",
    ],
  ),
  quiz(
    "sd-autocomplete-race",
    ["system-design", w("async-javascript")],
    4,
    120,
    ["Results for the wrong query", "Результати не для того запиту"],
    ["The user types \"rea\" then \"react\" quickly. The response for \"rea\" arrives **after** the one for \"react\", and the list shows results for \"rea\". Which design fixes it?", "Користувач швидко вводить «rea», потім «react». Відповідь для «rea» приходить **після** відповіді для «react», і список показує результати для «rea». Який дизайн це виправляє?"],
    [
      ["Abort the previous request with `AbortController` and only apply a response if it belongs to the latest query", "Скасовувати попередній запит через `AbortController` і застосовувати відповідь, лише якщо вона належить останньому запиту"],
      ["Increase the debounce to 2 seconds", "Збільшити debounce до 2 секунд"],
      ["Sort the results alphabetically", "Сортувати результати за алфавітом"],
      ["Send both queries in one request", "Надсилати обидва запити одним"],
    ],
    "a",
    [
      "Network responses can arrive in any order. Aborting saves bandwidth, and tracking a request ID (or comparing against the current query) guarantees that a late response can't overwrite newer results, even if the server ignores cancellation. Debounce reduces the number of requests but can't prevent the race on its own.",
      "Мережеві відповіді можуть приходити в будь-якому порядку. Скасування заощаджує трафік, а відстеження ID запиту (чи порівняння з поточним запитом) гарантує, що пізня відповідь не перезапише новіші результати, навіть якщо сервер ігнорує скасування. Debounce зменшує кількість запитів, але сам по собі гонитві не запобігає.",
    ],
  ),
  quiz(
    "sd-new-items-banner",
    ["system-design", w("web-accessibility")],
    4,
    120,
    ["Showing new posts", "Показ нових дописів"],
    ["New posts arrive via SSE while the user is reading the feed. Why do many products show a \"5 new posts\" button instead of inserting them at the top immediately?", "Нові дописи надходять через SSE, поки користувач читає стрічку. Чому багато продуктів показують кнопку «5 нових дописів», а не вставляють їх угорі одразу?"],
    [
      ["Inserting shifts the content under the user (layout shift, misclicks, lost reading position); a banner lets them choose when to load new items", "Вставка зсуває вміст під користувачем (зсув макета, хибні кліки, втрата місця читання); банер дає обрати, коли завантажити нові елементи"],
      ["SSE can't deliver more than one item at a time", "SSE не може доставити більше одного елемента за раз"],
      ["Browsers block DOM insertions at the top of lists", "Браузери блокують вставку DOM угорі списків"],
      ["It reduces the server's CPU usage", "Це зменшує навантаження на процесор сервера"],
    ],
    "a",
    [
      "Content moving on its own is disorienting and hurts CLS and accessibility. Buffer the new items, show a banner announced politely to screen readers (`aria-live`), and on click insert them and move focus/scroll to the top. Items arriving when the user is already at the top can be inserted directly.",
      "Вміст, що рухається сам по собі, дезорієнтує й погіршує CLS і доступність. Буферизуйте нові елементи, показуйте банер, ввічливо оголошений для зчитувачів екрана (`aria-live`), а по кліку вставляйте їх і переносіть фокус чи прокрутку вгору. Елементи, що приходять, коли користувач і так угорі, можна вставляти одразу.",
    ],
  ),
  practice({
    slug: "sd-autocomplete",
    skills: ["system-design", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["A production-grade autocomplete", "Автодоповнення рівня продакшену"],
    prompt: [
      "The classic frontend system design question, in code. Implement `createAutocomplete(search, options)` in `src/autocomplete.ts`. It exposes `state` (`{ query, results, status }`), `subscribe(listener)` and `input(query)`:\n\n- **Debounce**: start a search only after `debounceMs` (default 200) without new input, so typing `r-e-a-c-t` sends one request.\n- **Minimum length**: below `minChars` (default 2, after trimming) don't search; set `results: []` and `status: \"idle\"`.\n- **Cancellation**: a new input aborts the pending debounce and the in-flight request (pass an `AbortSignal` to `search`).\n- **No stale results**: a response that arrives after a newer input must never be applied, even if `search` ignores the signal.\n- **Cache**: a query that already succeeded is answered immediately from memory, with no request.\n- Status goes `loading` → `done`, or `error` (with empty results) when `search` fails; notify subscribers on every change.",
      "Класичне питання з проєктування фронтенду, але в коді. Реалізуйте `createAutocomplete(search, options)` у `src/autocomplete.ts`. Воно надає `state` (`{ query, results, status }`), `subscribe(listener)` і `input(query)`:\n\n- **Debounce**: запускайте пошук лише після `debounceMs` (типово 200) без нового введення, тож набір `r-e-a-c-t` надсилає один запит.\n- **Мінімальна довжина**: нижче `minChars` (типово 2, після обрізання пробілів) не шукайте; встановіть `results: []` і `status: \"idle\"`.\n- **Скасування**: нове введення скасовує відкладений debounce і запит у дорозі (передавайте `AbortSignal` у `search`).\n- **Жодних застарілих результатів**: відповідь, що прийшла після новішого введення, ніколи не застосовується, навіть якщо `search` ігнорує сигнал.\n- **Кеш**: запит, що вже вдався, отримує відповідь одразу з пам'яті, без запиту.\n- Статус іде `loading` → `done` або `error` (з порожніми результатами), коли `search` не вдається; сповіщайте підписників про кожну зміну.",
    ],
    files: { "/src/autocomplete.ts": AC_STARTER, "/index.ts": AC_INDEX },
    visibleFiles: ["/src/autocomplete.ts", "/index.ts"],
    activeFile: "/src/autocomplete.ts",
    tests: AC_TESTS,
    solution: { "/src/autocomplete.ts": AC_SOLUTION },
    explanation: [
      "Every input first cancels everything in progress: the debounce timer, the in-flight request (via `AbortController`), and, by bumping a request counter, any response that's still on its way. A response is applied only if its ID is still the latest, which handles servers that ignore cancellation. Short queries and cache hits short-circuit before the timer, so they're instant. The result is a small state machine that a UI can subscribe to.",
      "Кожне введення спершу скасовує все, що триває: таймер debounce, запит у дорозі (через `AbortController`) і, завдяки збільшенню лічильника запитів, будь-яку відповідь, що ще в дорозі. Відповідь застосовується, лише якщо її ID досі останній, що працює й із серверами, які ігнорують скасування. Короткі запити й влучання в кеш обробляються до таймера, тож миттєві. У результаті виходить невеликий скінченний автомат, на який може підписатися інтерфейс.",
    ],
  }),
]);
