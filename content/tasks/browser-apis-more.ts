import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "browser-intersection-observer",
    ["browser-apis", { slug: "web-performance", weight: 0.5 }],
    3,
    75,
    ["Infinite scroll trigger", "Тригер нескінченної прокрутки"],
    ["What is the best way to load the next page when the user scrolls near the end of a long list?", "Як найкраще завантажити наступну сторінку, коли користувач прокручує список майже до кінця?"],
    [
      ["A `scroll` listener that calls `getBoundingClientRect()` on the last item", "Обробник `scroll`, що викликає `getBoundingClientRect()` для останнього елемента"],
      ["An `IntersectionObserver` watching a sentinel element after the list, with a `rootMargin`", "`IntersectionObserver`, що стежить за елементом-маркером після списку, з `rootMargin`"],
      ["`setInterval` checking `window.scrollY` every 100 ms", "`setInterval`, що перевіряє `window.scrollY` кожні 100 мс"],
      ["A `resize` listener", "Обробник `resize`"],
    ],
    "b",
    [
      "`IntersectionObserver` lets the browser compute visibility asynchronously and calls you only when the sentinel crosses the threshold. `rootMargin: \"400px\"` starts loading before the user actually reaches the end. Scroll handlers that read layout run on every scroll event and can force synchronous layout.",
      "`IntersectionObserver` дозволяє браузеру асинхронно обчислювати видимість і викликає вас лише тоді, коли маркер перетинає поріг. `rootMargin: \"400px\"` починає завантаження ще до того, як користувач дійде до кінця. Обробники прокрутки, що читають розмітку, виконуються на кожну подію й можуть змушувати синхронний перерахунок макета.",
    ],
  ),
  quiz(
    "browser-storage-event",
    ["browser-apis"],
    4,
    75,
    ["The storage event", "Подія storage"],
    ["Three tabs of the same site are open. Tab A runs `localStorage.setItem(\"theme\", \"dark\")`. Which tabs receive a `storage` event?", "Відкрито три вкладки того самого сайту. Вкладка A виконує `localStorage.setItem(\"theme\", \"dark\")`. Які вкладки отримають подію `storage`?"],
    [
      ["All three tabs", "Усі три вкладки"],
      ["Only tab A", "Лише вкладка A"],
      ["Tabs B and C, but not tab A", "Вкладки B і C, але не A"],
      ["None; you must poll `localStorage`", "Жодна; потрібно опитувати `localStorage`"],
    ],
    "c",
    [
      "The `storage` event fires in other documents of the same origin that share the storage area, never in the one that made the change. That makes it a simple cross-tab sync channel (log out everywhere, theme changes). For richer messaging, use `BroadcastChannel`.",
      "Подія `storage` спрацьовує в інших документах того самого походження, що мають спільне сховище, але ніколи в тому, який зробив зміну. Тож це простий канал синхронізації між вкладками (вихід усюди, зміна теми). Для багатшого обміну повідомленнями використовуйте `BroadcastChannel`.",
    ],
  ),
  quiz(
    "browser-sw-waiting",
    ["browser-apis"],
    5,
    120,
    ["A service worker that won't update", "Service worker, що не оновлюється"],
    ["You deployed a new service worker. Users reload the page but keep getting the old cached app. What is the most likely reason?", "Ви розгорнули новий service worker. Користувачі перезавантажують сторінку, але отримують стару закешовану версію. Яка найімовірніша причина?"],
    [
      ["Service workers only update once every 24 hours", "Service worker-и оновлюються лише раз на 24 години"],
      ["The new worker is installed but waiting until every tab controlled by the old one is closed", "Новий worker встановлено, але він чекає, доки закриються всі вкладки, якими керує старий"],
      ["Reloading always bypasses service workers", "Перезавантаження завжди оминає service worker-и"],
      ["The browser rejected it because the file name didn't change", "Браузер його відхилив, бо назва файлу не змінилася"],
    ],
    "b",
    [
      "A new service worker installs in the background and then waits while any client is still controlled by the old one. A reload doesn't release the client, because the old page stays alive until the new one commits. Show an \"Update available\" prompt that calls `skipWaiting()` (then reload on `controllerchange`), or call `skipWaiting()` if your caches are backwards compatible.",
      "Новий service worker встановлюється у фоні й чекає, доки хоч один клієнт ще керується старим. Перезавантаження не звільняє клієнта, бо стара сторінка живе, доки нова не завантажиться. Покажіть підказку «Доступне оновлення», що викликає `skipWaiting()` (і перезавантажте на `controllerchange`), або викликайте `skipWaiting()`, якщо ваші кеші зворотно сумісні.",
    ],
  ),
  practice({
    slug: "browser-build-url",
    skills: ["browser-apis", { slug: "http-rest", weight: 0.5 }],
    complexity: 2,
    estSeconds: 600,
    framework: "vanilla-ts",
    title: ["Build a request URL", "Побудова URL запиту"],
    prompt: [
      "Implement `buildUrl(base, params)` with the `URL` and `URLSearchParams` APIs.\n\n- Keep any query parameters already in `base`.\n- Skip params whose value is `undefined` or `null`.\n- Arrays become repeated keys: `{ tag: [\"a\", \"b\"] }` → `tag=a&tag=b`.\n- A param that already exists in `base` is **replaced**.\n- Values must be correctly encoded (spaces, `&`, non-ASCII).",
      "Реалізуйте `buildUrl(base, params)` за допомогою API `URL` і `URLSearchParams`.\n\n- Зберігайте параметри запиту, що вже є в `base`.\n- Пропускайте параметри зі значенням `undefined` або `null`.\n- Масиви стають повторюваними ключами: `{ tag: [\"a\", \"b\"] }` → `tag=a&tag=b`.\n- Параметр, що вже є в `base`, **замінюється**.\n- Значення мають бути правильно закодовані (пробіли, `&`, не-ASCII).",
    ],
    files: {
      "/src/build-url.ts":
        "export type QueryValue = string | number | boolean | null | undefined | (string | number)[];\n\nexport function buildUrl(base: string, params: Record<string, QueryValue>): string {\n  // TODO: use URL and URLSearchParams\n  return base + \"?\" + Object.entries(params).map(([k, v]) => k + \"=\" + v).join(\"&\");\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { buildUrl } from "./src/build-url";\n\nconst url = buildUrl("https://api.example.com/jobs?page=1", { q: "react & ts", city: "Kyiv", tag: ["remote", "senior"], salary: undefined });\ndocument.getElementById("app")!.innerHTML = "<h1>Request URL</h1><code>" + url.replace(/&/g, "&amp;") + "</code>";\n',
    },
    visibleFiles: ["/src/build-url.ts", "/index.ts"],
    activeFile: "/src/build-url.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { buildUrl } from "../src/build-url";\n\nconst query = (url: string) => new URL(url).searchParams;\n\ndescribe("buildUrl", () => {\n  it("adds simple params", () => {\n    expect(buildUrl("https://x.dev/search", { q: "js", page: 2 })).toBe("https://x.dev/search?q=js&page=2");\n  });\n  it("keeps existing params and replaces duplicates", () => {\n    const url = buildUrl("https://x.dev/search?lang=en&page=1", { page: 3 });\n    expect(query(url).get("lang")).toBe("en");\n    expect(query(url).getAll("page")).toEqual(["3"]);\n  });\n  it("skips undefined and null", () => {\n    expect(buildUrl("https://x.dev/", { a: undefined, b: null, c: false })).toBe("https://x.dev/?c=false");\n  });\n  it("repeats keys for arrays", () => {\n    expect(query(buildUrl("https://x.dev/", { tag: ["a", "b"] })).getAll("tag")).toEqual(["a", "b"]);\n  });\n  it("encodes special characters", () => {\n    const url = buildUrl("https://x.dev/", { q: "rock & roll", city: "Київ" });\n    expect(url.includes("rock+%26+roll")).toBe(true);\n    expect(query(url).get("city")).toBe("Київ");\n  });\n});\n',
    solution: {
      "/src/build-url.ts":
        "export type QueryValue = string | number | boolean | null | undefined | (string | number)[];\n\nexport function buildUrl(base: string, params: Record<string, QueryValue>): string {\n  const url = new URL(base);\n  for (const [key, value] of Object.entries(params)) {\n    if (value === undefined || value === null) continue;\n    url.searchParams.delete(key);\n    if (Array.isArray(value)) {\n      for (const item of value) url.searchParams.append(key, String(item));\n    } else {\n      url.searchParams.set(key, String(value));\n    }\n  }\n  return url.toString();\n}\n",
    },
    explanation: [
      "`new URL(base)` parses the existing query into `url.searchParams`, which handles all the encoding (`application/x-www-form-urlencoded`, so spaces become `+`). `delete` and then `append` gives replace-then-repeat semantics for arrays, and `set` replaces a single value. String concatenation breaks as soon as a value contains `&`, `#` or `=`.",
      "`new URL(base)` розбирає наявний запит у `url.searchParams`, що бере на себе все кодування (`application/x-www-form-urlencoded`, тож пробіли стають `+`). `delete`, а потім `append` дають для масивів семантику «замінити, потім повторити», а `set` замінює одне значення. Конкатенація рядків ламається, щойно значення містить `&`, `#` або `=`.",
    ],
  }),
]);
