import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const lines = (...l: string[]) => l.join("\n");

// ── Practice 1: load JSON with explicit error results (vanilla-ts) ───────────

const LOAD_STARTER = String.raw`export interface FetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type Fetcher = (url: string) => Promise<FetchResponse>;

export type LoadResult = { ok: true; data: unknown } | { ok: false; error: string };

// TODO: call the fetcher and return a LoadResult. Never throw.
export async function loadJson(fetcher: Fetcher, url: string): Promise<LoadResult> {
  return { ok: false, error: "" };
}
`;

const LOAD_SOLUTION = String.raw`export interface FetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type Fetcher = (url: string) => Promise<FetchResponse>;

export type LoadResult = { ok: true; data: unknown } | { ok: false; error: string };

export async function loadJson(fetcher: Fetcher, url: string): Promise<LoadResult> {
  let res: FetchResponse;
  try {
    res = await fetcher(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: "network: " + message };
  }

  if (!res.ok) return { ok: false, error: "HTTP " + res.status };

  try {
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, error: "invalid json" };
  }
}
`;

const LOAD_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { loadJson } from "../src/load";

const okResponse = (data) => ({ ok: true, status: 200, json: async () => data });

describe("loadJson", () => {
  it("returns the parsed data on success", async () => {
    const result = await loadJson(async () => okResponse({ a: 1 }), "/api/x");
    expect(result).toEqual({ ok: true, data: { a: 1 } });
  });
  it("passes the url to the fetcher", async () => {
    let seen = "";
    await loadJson(async (url) => {
      seen = url;
      return okResponse({});
    }, "/api/districts");
    expect(seen).toBe("/api/districts");
  });
  it("reports a non-ok status as an HTTP error", async () => {
    const result = await loadJson(async () => ({ ok: false, status: 500, json: async () => ({}) }), "/x");
    expect(result).toEqual({ ok: false, error: "HTTP 500" });
  });
  it("reports a network failure without throwing", async () => {
    const result = await loadJson(async () => {
      throw new Error("offline");
    }, "/x");
    expect(result).toEqual({ ok: false, error: "network: offline" });
  });
  it("reports a body that is not valid JSON", async () => {
    const broken = { ok: true, status: 200, json: async () => { throw new SyntaxError("bad"); } };
    const result = await loadJson(async () => broken, "/x");
    expect(result).toEqual({ ok: false, error: "invalid json" });
  });
});
`;

// ── Practice 2: debounce with an injected scheduler (vanilla-ts) ────────────

const DEBOUNCE_STARTER = String.raw`export interface Scheduler {
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
}

// TODO: return a function that calls fn only after ms of silence, using the latest arguments.
// Every call restarts the wait. Use the injected scheduler so tests can control time.
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number, scheduler: Scheduler): (...args: A) => void {
  return () => {};
}
`;

const DEBOUNCE_SOLUTION = String.raw`export interface Scheduler {
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number, scheduler: Scheduler): (...args: A) => void {
  let handle: unknown = undefined;

  return (...args: A) => {
    if (handle !== undefined) scheduler.clear(handle);
    handle = scheduler.set(() => {
      handle = undefined;
      fn(...args);
    }, ms);
  };
}
`;

const DEBOUNCE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { debounce } from "../src/debounce";

// A fake scheduler: nothing runs until flush() is called, and cleared timers never run.
function fakeScheduler() {
  let timers = [];
  let nextId = 1;
  return {
    get pending() {
      return timers.length;
    },
    delays() {
      return timers.map((t) => t.ms);
    },
    set(fn, ms) {
      const id = nextId++;
      timers.push({ id, fn, ms, cancelled: false });
      return id;
    },
    clear(handle) {
      const t = timers.find((x) => x.id === handle);
      if (t) t.cancelled = true;
    },
    flush() {
      const due = timers.filter((t) => !t.cancelled);
      timers = [];
      due.forEach((t) => t.fn());
    },
  };
}

describe("debounce", () => {
  it("does not call fn until the scheduler fires", () => {
    const s = fakeScheduler();
    const calls = [];
    const d = debounce((x) => calls.push(x), 300, s);
    d(1);
    expect(calls).toHaveLength(0);
  });
  it("uses the given delay", () => {
    const s = fakeScheduler();
    const d = debounce(() => {}, 300, s);
    d();
    expect(s.delays()).toEqual([300]);
  });
  it("runs once with the latest arguments", () => {
    const s = fakeScheduler();
    const calls = [];
    const d = debounce((x) => calls.push(x), 300, s);
    d(1);
    d(2);
    d(3);
    s.flush();
    expect(calls).toEqual([3]);
  });
  it("starts a fresh wait for a call after the last one fired", () => {
    const s = fakeScheduler();
    const calls = [];
    const d = debounce((x) => calls.push(x), 300, s);
    d(1);
    s.flush();
    d(2);
    s.flush();
    expect(calls).toEqual([1, 2]);
  });
});
`;

// ── Practice 3: one delegated click listener (vanilla-ts, DOM) ──────────────

const DELEGATE_STARTER = String.raw`// TODO: attach ONE click listener to root. For a click, find the nearest element at or above
// event.target that has a data-action attribute, and call onAction(action, element) when it is inside root.
// Return a cleanup function that removes the listener.
export function delegateActions(root: HTMLElement, onAction: (action: string, el: HTMLElement) => void): () => void {
  return () => {};
}
`;

const DELEGATE_SOLUTION = String.raw`export function delegateActions(root: HTMLElement, onAction: (action: string, el: HTMLElement) => void): () => void {
  const handler = (event: Event) => {
    const target = event.target as Element | null;
    const el = target ? target.closest<HTMLElement>("[data-action]") : null;
    if (!el || !root.contains(el)) return;
    onAction(el.dataset.action as string, el);
  };

  root.addEventListener("click", handler);
  return () => root.removeEventListener("click", handler);
}
`;

const DELEGATE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { delegateActions } from "../src/delegate";

function setup() {
  const root = document.createElement("div");
  root.innerHTML = '<ul><li><button data-action="open"><span id="label">Open</span></button></li><li><button data-action="delete">Delete</button></li></ul><p id="plain">plain text</p>';
  document.body.appendChild(root);
  return root;
}

function click(el) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("delegateActions", () => {
  it("runs the action of the nearest data-action ancestor", () => {
    const root = setup();
    const hits = [];
    const stop = delegateActions(root, (action) => hits.push(action));
    click(root.querySelector("#label"));
    expect(hits).toEqual(["open"]);
    stop();
    root.remove();
  });
  it("ignores clicks outside any action element", () => {
    const root = setup();
    const hits = [];
    const stop = delegateActions(root, (action) => hits.push(action));
    click(root.querySelector("#plain"));
    expect(hits).toEqual([]);
    stop();
    root.remove();
  });
  it("passes the action element itself", () => {
    const root = setup();
    let found = null;
    const stop = delegateActions(root, (_action, el) => {
      found = el;
    });
    click(root.querySelector("#label"));
    expect(found.tagName).toBe("BUTTON");
    stop();
    root.remove();
  });
  it("stops listening after the cleanup function runs", () => {
    const root = setup();
    const hits = [];
    const stop = delegateActions(root, (action) => hits.push(action));
    stop();
    click(root.querySelector("#label"));
    expect(hits).toEqual([]);
    root.remove();
  });
});
`;

export default defineTasks([
  practice({
    slug: "load-json-result-type",
    skills: ["http-rest", w("javascript", 0.4), w("error-handling", 0.4)],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["Return errors as values, not exceptions", "Повертати помилки як значення, а не винятки"],
    prompt: [
      lines(
        "Write `loadJson(fetcher, url)` in `src/load.ts`. It must never throw, and it returns a `LoadResult`:",
        "",
        "- If the fetcher rejects, return `{ ok: false, error: \"network: <message>\" }`.",
        "- If the response is not `ok`, return `{ ok: false, error: \"HTTP <status>\" }`.",
        "- If `json()` rejects, return `{ ok: false, error: \"invalid json\" }`.",
        "- Otherwise return `{ ok: true, data }` with the parsed body.",
      ),
      lines(
        "Напишіть `loadJson(fetcher, url)` у `src/load.ts`. Вона ніколи не має викидати помилку й повертає `LoadResult`:",
        "",
        "- Якщо fetcher відхиляється, поверніть `{ ok: false, error: \"network: <повідомлення>\" }`.",
        "- Якщо відповідь не `ok`, поверніть `{ ok: false, error: \"HTTP <статус>\" }`.",
        "- Якщо `json()` відхиляється, поверніть `{ ok: false, error: \"invalid json\" }`.",
        "- Інакше поверніть `{ ok: true, data }` з розібраним тілом.",
      ),
    ],
    files: { "/src/load.ts": LOAD_STARTER },
    activeFile: "/src/load.ts",
    tests: LOAD_TESTS,
    solution: { "/src/load.ts": LOAD_SOLUTION },
    explanation: [
      "Separating the three failure points (the request, the status, and the parse) gives the caller a precise, typed reason instead of an unhandled exception. Keep the `try` blocks narrow so that only the awaited call is guarded, and check `ok` yourself: `fetch` resolves even for 404 and 500 responses, so a missing check silently treats an error page as data.",
      "Розділення трьох місць відмови (запит, статус і розбір) дає викликачу точну типізовану причину замість необробленого винятку. Тримайте блоки `try` вузькими, щоб охоплювався лише очікуваний виклик, і перевіряйте `ok` самі: `fetch` успішно завершується навіть для відповідей 404 і 500, тож без перевірки сторінка помилки сприймалася б як дані.",
    ],
  }),

  practice({
    slug: "debounce-injected-scheduler",
    skills: ["javascript", w("async-javascript", 0.4), w("unit-testing", 0.3)],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Debounce a search input", "Debounce для пошукового поля"],
    prompt: [
      lines(
        "Implement `debounce(fn, ms, scheduler)` in `src/debounce.ts`. The returned function must:",
        "",
        "- schedule `fn` through `scheduler.set(callback, ms)`, and cancel the previous timer through `scheduler.clear(handle)` on each call;",
        "- call `fn` only once, after the last call, with the arguments of that last call;",
        "- start a new wait for any call that comes after `fn` has already run.",
      ),
      lines(
        "Реалізуйте `debounce(fn, ms, scheduler)` у `src/debounce.ts`. Повернена функція має:",
        "",
        "- планувати `fn` через `scheduler.set(callback, ms)` і скасовувати попередній таймер через `scheduler.clear(handle)` при кожному виклику;",
        "- викликати `fn` лише один раз, після останнього виклику, з аргументами саме цього виклику;",
        "- починати новий очікуваний час для кожного виклику, що йде після того, як `fn` уже виконалася.",
      ),
    ],
    files: { "/src/debounce.ts": DEBOUNCE_STARTER },
    activeFile: "/src/debounce.ts",
    tests: DEBOUNCE_TESTS,
    solution: { "/src/debounce.ts": DEBOUNCE_SOLUTION },
    explanation: [
      "Debounce keeps one pending timer and resets it on every call, so a burst of keystrokes results in one request. Injecting the scheduler (instead of calling `setTimeout` directly) makes the behaviour testable without real waiting. Clearing the previous handle is what stops old arguments from firing; resetting the stored handle after the call lets the next burst start cleanly.",
      "Debounce тримає один відкладений таймер і скидає його при кожному виклику, тож серія натискань клавіш дає один запит. Передача планувальника ззовні (замість прямого `setTimeout`) робить поведінку тестованою без реального очікування. Скасування попереднього таймера не дає старим аргументам спрацювати, а скидання збереженого handle після виклику дозволяє наступній серії початися коректно.",
    ],
  }),

  practice({
    slug: "delegate-click-actions",
    skills: ["dom-events", w("web-accessibility", 0.3)],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["One listener for many buttons", "Один слухач для багатьох кнопок"],
    prompt: [
      lines(
        "A list of items has action buttons, and items are added at runtime. Implement `delegateActions(root, onAction)` in `src/delegate.ts`:",
        "",
        "- Attach exactly one `click` listener to `root`, not one per button.",
        "- For a click, find the nearest element at or above `event.target` that has a `data-action` attribute. Call `onAction(action, element)` only if that element is inside `root`.",
        "- Return a cleanup function that removes the listener.",
      ),
      lines(
        "Список елементів має кнопки дій, і елементи додаються під час роботи. Реалізуйте `delegateActions(root, onAction)` у `src/delegate.ts`:",
        "",
        "- Додайте рівно один слухач `click` на `root`, а не по одному на кнопку.",
        "- Для кліку знайдіть найближчий елемент, що є `event.target` або його предком і має атрибут `data-action`. Викликайте `onAction(action, element)` лише якщо цей елемент всередині `root`.",
        "- Поверніть функцію очищення, що знімає слухача.",
      ),
    ],
    files: { "/src/delegate.ts": DELEGATE_STARTER },
    activeFile: "/src/delegate.ts",
    tests: DELEGATE_TESTS,
    solution: { "/src/delegate.ts": DELEGATE_SOLUTION },
    explanation: [
      "Clicks bubble, so one listener on a stable parent handles buttons that do not exist yet. `closest` walks up from the clicked node, which is why a click on a span inside a button still finds the button. The containment check keeps the handler from acting on a matching element outside the root, and the cleanup function prevents leaked listeners when the list is torn down.",
      "Кліки спливають, тож один слухач на стабільному батькові обробляє кнопки, яких ще немає. `closest` піднімається від клікнутого вузла, тому клік по span всередині кнопки все одно знаходить кнопку. Перевірка належності не дає обробити відповідний елемент поза коренем, а функція очищення запобігає витокам слухачів, коли список знищують.",
    ],
  }),

  quiz(
    "react-key-index-reorder",
    ["react"],
    2,
    90,
    ["Index keys after reordering", "Ключі за індексом після переупорядкування"],
    ["Why are array indexes a poor `key` when items can be reordered or removed?", "Чому індекси масиву погано підходять як `key`, коли елементи можна переставляти або видаляти?"],
    [
      ["Indexes are slow to compare", "Індекси повільно порівнювати"],
      ["React matches elements by key, so after a reorder an index key can attach one item's state to a different item", "React зіставляє елементи за ключем, тож після переупорядкування ключ-індекс може прив'язати стан одного елемента до іншого"],
      ["Keys must be strings, and numbers are rejected", "Ключі мають бути рядками, числа відхиляються"],
      ["Indexes cause TypeScript compile errors", "Індекси спричиняють помилки компіляції TypeScript"],
    ],
    "b",
    [
      "A key tells React which element is which across renders. With an index, the key for the first row is always 0, even after the first item moves away, so React reuses the old row's input value or checkbox state for the new item. Use a stable id from the data.",
      "Ключ повідомляє React, який елемент який між рендерами. Із індексом ключ першого рядка завжди 0, навіть коли перший елемент переміщено, тож React повторно використовує стан старого рядка (значення поля або checkbox) для нового елемента. Використовуйте стабільний id з даних.",
    ],
  ),

  quiz(
    "react-effect-cleanup-return",
    ["react"],
    2,
    90,
    ["What an effect should return", "Що має повертати effect"],
    ["A component opens a WebSocket inside `useEffect`. What should the effect return so the socket does not leak?", "Компонент відкриває WebSocket усередині `useEffect`. Що має повертати effect, щоб сокет не витікав?"],
    [
      ["Nothing: subscriptions close themselves when the component unmounts", "Нічого: підписки самі закриваються при розмонтуванні"],
      ["A Promise that resolves when the socket closes", "Проміс, що виконується, коли сокет закриється"],
      ["A cleanup function that closes the socket", "Функцію очищення, що закриває сокет"],
      ["The socket object itself", "Сам об'єкт сокета"],
    ],
    "c",
    [
      "An effect may return a cleanup function, and React calls it before the effect runs again and on unmount. Returning anything other than a function (or nothing) is a mistake, and nothing closes a socket automatically.",
      "Effect може повернути функцію очищення, і React викликає її перед повторним запуском effect і при розмонтуванні. Повертати щось інше, крім функції або нічого, помилка, а сокет сам автоматично не закривається.",
    ],
  ),

  quiz(
    "react-stale-state-updates",
    ["react", w("state-management", 0.3)],
    2,
    90,
    ["Three increments in one handler", "Три збільшення в одному обробнику"],
    ["Inside one click handler, you call `setCount(count + 1)` three times. If `count` is 0 before the click, what does it become?", "В одному обробнику кліку ви тричі викликаєте `setCount(count + 1)`. Якщо до кліку `count` дорівнював 0, яким він стане?"],
    [
      ["1", "1"],
      ["3", "3"],
      ["0", "0"],
      ["An error, because state cannot be set twice", "Помилка, бо стан не можна встановити двічі"],
    ],
    "a",
    [
      "Each call reads `count` from the render in which the handler was created, so all three compute 0 + 1. The fix is an updater function, `setCount(c => c + 1)`, which receives the latest queued value and gives 3 after three calls.",
      "Кожен виклик читає `count` з рендеру, у якому створено обробник, тож усі три обчислюють 0 + 1. Виправлення це функція-оновлювач `setCount(c => c + 1)`, яка отримує останнє значення в черзі й після трьох викликів дає 3.",
    ],
  ),

  quiz(
    "react-strict-mode-effects",
    ["react"],
    2,
    90,
    ["Effects that run twice in development", "Effects, що запускаються двічі в режимі розробки"],
    ["Why do effects run twice in development when the app uses `StrictMode`?", "Чому effect-и в режимі розробки запускаються двічі, коли застосунок використовує `StrictMode`?"],
    [
      ["It is a bug in React", "Це помилка в React"],
      ["To double the rendering speed", "Щоб подвоїти швидкість рендерингу"],
      ["It only applies to class components", "Це стосується лише класових компонентів"],
      ["React mounts, unmounts and mounts again to expose missing cleanup functions", "React монтує, розмонтовує й знову монтує компонент, щоб виявити відсутні функції очищення"],
    ],
    "d",
    [
      "The double run is intentional and happens only in development. If an effect subscribes without a matching cleanup, the second mount reveals the leak. Production builds run each effect once.",
      "Подвійний запуск навмисний і відбувається лише в режимі розробки. Якщо effect підписується без відповідного очищення, другий монтаж показує витік. Продакшн-збірки запускають кожен effect один раз.",
    ],
  ),

  quiz(
    "ts-unknown-json-parse",
    ["typescript", w("http-rest", 0.3)],
    2,
    90,
    ["Typing a value from JSON.parse", "Типізація значення з JSON.parse"],
    ["A value comes from `JSON.parse`. Which type keeps it safe to use?", "Значення надходить з `JSON.parse`. Який тип робить його безпечним для використання?"],
    [
      ["`any`, because it is the JSON type", "`any`, бо це тип JSON"],
      ["`unknown`, narrowed with checks before use", "`unknown`, звужений перевірками перед використанням"],
      ["`never`", "`never`"],
      ["`object`, so property access is always safe", "`object`, тож доступ до властивостей завжди безпечний"],
    ],
    "b",
    [
      "`any` turns off checking, so mistakes pass silently. `unknown` forces you to narrow the value (with `typeof`, `in`, or a validator) before using it. `object` still does not guarantee the properties exist.",
      "`any` вимикає перевірку, тож помилки проходять непоміченими. `unknown` змушує звузити значення (через `typeof`, `in` або валідатор) перед використанням. `object` все одно не гарантує наявність властивостей.",
    ],
  ),

  quiz(
    "ts-discriminated-union-narrowing",
    ["typescript"],
    2,
    90,
    ["Narrowing a result union", "Звуження union-типу результату"],
    ["A result type is `{ kind: \"ok\"; data: T } | { kind: \"error\"; message: string }`. What lets TypeScript narrow it?", "Що дозволяє TypeScript звузити цей тип результату?"],
    [
      ["`typeof result.kind`", "`typeof result.kind`"],
      ["`instanceof` against the object", "`instanceof` для об'єкта"],
      ["Checking the literal `kind` field, such as `if (r.kind === \"ok\")`", "Перевірка літерального поля `kind`, наприклад `if (r.kind === \"ok\")`"],
      ["A type assertion like `r as any`", "Приведення типу на кшталт `r as any`"],
    ],
    "c",
    [
      "A literal-typed field that differs between members is a discriminant. Comparing it narrows the union, so `data` is only accessible in the `ok` branch. `typeof` on a string gives `string`, `instanceof` does not apply to plain objects, and assertions bypass the check.",
      "Поле з літеральним типом, що відрізняється між членами union, є дискримінантом. Його порівняння звужує union, тож `data` доступне лише в гілці `ok`. `typeof` для рядка дає `string`, `instanceof` не працює з простими об'єктами, а приведення типів обходять перевірку.",
    ],
  ),

  quiz(
    "http-status-permission-403",
    ["http-rest", w("web-security", 0.3)],
    1,
    60,
    ["Which status means no permission", "Який статус означає відсутність дозволу"],
    ["A logged-in user, with a valid session, tries to delete a project they do not own. Which status should the server return?", "Який статус має повернути сервер?"],
    [
      ["401 Unauthorized", "401 Unauthorized"],
      ["403 Forbidden", "403 Forbidden"],
      ["500 Internal Server Error", "500 Internal Server Error"],
      ["200 with an error field in the body", "200 з полем помилки в тілі"],
    ],
    "b",
    [
      "401 means the request lacks valid credentials (authentication). Here the user is identified, but not allowed to act on this resource (authorization), so 403 is correct. Some APIs return 404 to hide a resource's existence, but that is a deliberate choice, not the default.",
      "401 означає, що запиту бракує дійсних облікових даних (автентифікація). Тут користувача ідентифіковано, але йому не дозволено діяти з цим ресурсом (авторизація), тож правильний 403. Деякі API повертають 404, щоб приховати існування ресурсу, але це свідомий вибір, а не типовий.",
    ],
  ),

  quiz(
    "http-put-idempotent",
    ["http-rest", w("rest-api-design", 0.4)],
    1,
    60,
    ["Idempotent replacement of a resource", "Ідемпотентна заміна ресурсу"],
    ["Which HTTP method is defined as idempotent and is the usual choice for replacing a whole resource at a known URL?", "Який HTTP-метод визначено як ідемпотентний і який зазвичай обирають для заміни всього ресурсу за відомою URL?"],
    [
      ["POST", "POST"],
      ["GET", "GET"],
      ["PUT", "PUT"],
      ["CONNECT", "CONNECT"],
    ],
    "c",
    [
      "Sending the same full representation with PUT twice leaves the server in the same state, so retries are safe. POST usually creates a new resource each time. GET reads and does not replace. CONNECT opens a tunnel and is unrelated to resource updates.",
      "Надсилання тієї самої повної репрезентації через PUT двічі залишає сервер у тому самому стані, тож повтори безпечні. POST зазвичай щоразу створює новий ресурс. GET читає й нічого не замінює. CONNECT відкриває тунель і не стосується оновлення ресурсів.",
    ],
  ),

  quiz(
    "dom-delegation-quiz-list",
    ["dom-events"],
    2,
    90,
    ["Handling clicks for a long, dynamic list", "Обробка кліків у довгому динамічному списку"],
    ["A list has 1,000 items, and items are added at runtime. What is the best way to handle clicks on their buttons?", "Список має 1000 елементів, і їх додають під час роботи. Який найкращий спосіб обробляти кліки на їхніх кнопках?"],
    [
      ["One listener on the parent, using `closest()` to find the button", "Один слухач на батькові, з `closest()` для пошуку кнопки"],
      ["A listener attached to each item when it renders", "Слухач, прикріплений до кожного елемента при рендері"],
      ["Inline `onclick` attributes generated by the server", "Атрибути `onclick`, згенеровані сервером"],
      ["Polling the DOM for clicks every 100 ms", "Опитування DOM на кліки кожні 100 мс"],
    ],
    "a",
    [
      "Clicks bubble up, so one listener on a stable parent covers current and future children. Per-item listeners need to be bound and removed as items change, and polling wastes time and still misses fast interactions.",
      "Кліки спливають вгору, тож один слухач на стабільному батькові охоплює поточні й майбутні дочірні елементи. Слухачі для кожного елемента треба прив'язувати й знімати при змінах списку, а опитування марнує час і все одно пропускає швидкі взаємодії.",
    ],
  ),

  quiz(
    "a11y-button-element",
    ["web-accessibility"],
    1,
    60,
    ["Why an action should be a button", "Чому дія має бути кнопкою"],
    ["Why use a `<button>` rather than a `<div>` with a click handler for an action?", "Чому для дії варто використовувати `<button>`, а не `<div>` з обробником кліку?"],
    [
      ["Divs are much slower to render", "Div значно повільніше рендериться"],
      ["Divs cannot receive mouse clicks", "Div не можуть отримувати кліки мишею"],
      ["Buttons cannot be styled with CSS", "Кнопки не можна стилізувати CSS"],
      ["A button is focusable, activates on Enter and Space, and exposes the right role to assistive technology", "Кнопка отримує фокус, активується через Enter і Space і має правильну роль для допоміжних технологій"],
    ],
    "d",
    [
      "A native button gives keyboard focus, activation with Enter and Space, and a 'button' role for screen readers for free. A div with a click handler needs tabindex, key handlers, and a role added by hand, and it is easy to forget one.",
      "Нативна кнопка дає фокус із клавіатури, активацію через Enter і Space та роль 'button' для екранних читачів без додаткової роботи. Div з обробником кліків потребує вручну доданих tabindex, обробників клавіш і ролі, і щось легко пропустити.",
    ],
  ),

  quiz(
    "test-debounce-time",
    ["unit-testing"],
    2,
    90,
    ["Testing time-based code", "Тестування коду, що залежить від часу"],
    ["You need to test that a debounced function runs after 300 ms. What makes the test fast and reliable?", "Що робить тест швидким і надійним?"],
    [
      ["Sleep for 300 ms in the test", "Чекати 300 мс у тесті"],
      ["Delete the test, since timing cannot be tested", "Видалити тест, бо час неможливо протестувати"],
      ["Inject a scheduler or use fake timers, then advance time manually", "Передати планувальник або використати фейкові таймери, а потім вручну просунути час"],
      ["Raise the test timeout only", "Лише збільшити таймаут тесту"],
    ],
    "c",
    [
      "Real waiting makes the suite slow and flaky under load. A fake clock lets the test decide exactly when time passes, so the check is deterministic. Injecting the scheduler, as in the debounce practice, achieves the same effect without global mocks.",
      "Реальне очікування робить набір тестів повільним і нестабільним під навантаженням. Фейковий годинник дає тесту змогу визначити, коли минає час, тож перевірка детермінована. Передача планувальника, як у практиці з debounce, дає той самий ефект без глобальних моків.",
    ],
  ),

  quiz(
    "git-rebase-shared-branch",
    ["git"],
    2,
    90,
    ["Linear history on an unshared branch", "Лінійна історія на непублічній гілці"],
    ["You want a linear history on a feature branch that nobody else has pulled. What is the best choice?", "Який варіант найкращий?"],
    [
      ["Merge `main` into the branch, creating a merge commit", "Злити `main` у гілку, створивши merge-коміт"],
      ["Rebase the branch onto `main`", "Перебазувати гілку на `main`"],
      ["Squash everything directly into `main` without updating the branch", "Звести все в один коміт прямо в `main`, не оновлюючи гілку"],
      ["Cherry-pick each commit by hand into a new branch", "Вручну перенести (cherry-pick) кожен коміт у нову гілку"],
    ],
    "b",
    [
      "Rebasing replays your commits on top of the latest `main`, which gives a straight line of history. It rewrites commit ids, so avoid it on branches that other people have based work on.",
      "Rebase відтворює ваші коміти поверх останнього `main`, що дає пряму лінію історії. Він переписує id комітів, тож не робіть цього з гілками, на яких уже працюють інші.",
    ],
  ),
]);
