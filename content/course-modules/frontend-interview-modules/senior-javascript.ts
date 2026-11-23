import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 41–55 of the Senior list: JavaScript. */
export const seniorJavascriptQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-javascript-quiz",
  title: { en: "JavaScript", uk: "JavaScript" },
  questions: [
    question(
      "promises-parallel-seq",
      ["How do you process an array of async tasks in parallel, and how sequentially?", "Як обробити масив асинхронних задач паралельно, а як послідовно?"],
      [
        ["Parallel: `items.forEach(async (item) => await load(item))`, then await the `forEach`", "Паралельно: `items.forEach(async (item) => await load(item))`, а потім чекати на `forEach`"],
        ["Both with `Promise.race`", "Обидва варіанти через `Promise.race`"],
        [
          "Parallel: `await Promise.all(items.map(load))`; sequential: `for (const item of items) await load(item)`",
          "Паралельно: `await Promise.all(items.map(load))`; послідовно: `for (const item of items) await load(item)`",
        ],
        ["Sequential with `Promise.all`", "Послідовно через `Promise.all`"],
      ],
      "c",
    ),
    question(
      "symbol",
      ["What is a practical use of `Symbol`?", "Яке практичне застосування `Symbol`?"],
      [
        ["Encrypting data", "Шифрування даних"],
        [
          "Unique property keys that never clash with other keys, and well-known symbols such as `Symbol.iterator` to make an object iterable",
          "Унікальні ключі властивостей, що ніколи не конфліктують з іншими, і вбудовані символи, як-от `Symbol.iterator`, щоб зробити об'єкт ітерованим",
        ],
        ["Formatting strings", "Форматування рядків"],
        ["Faster arithmetic with numbers", "Швидша арифметика з числами"],
      ],
      "b",
    ),
    question(
      "observer-browser",
      ["Which browser APIs follow the Observer pattern?", "Які API браузера реалізують патерн Observer?"],
      [
        ["`addEventListener` on any `EventTarget`", "`addEventListener` на будь-якому `EventTarget`"],
        ["`MutationObserver`, `IntersectionObserver` and `ResizeObserver`", "`MutationObserver`, `IntersectionObserver` і `ResizeObserver`"],
        ["`Array.prototype.map`", "`Array.prototype.map`"],
        ["Messages on a `BroadcastChannel`", "Повідомлення в `BroadcastChannel`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "memory-leaks",
      ["Which scenarios can cause memory leaks in client-side code?", "Які сценарії можуть спричинити витік пам'яті в клієнтському коді?"],
      [
        ["Using `const` instead of `let`", "Використання `const` замість `let`"],
        ["Event listeners and timers that are never removed when a component unmounts", "Обробники подій і таймери, які не прибирають, коли компонент демонтується"],
        ["Detached DOM nodes that are still referenced from JavaScript", "Від'єднані DOM-вузли, на які досі посилається JavaScript"],
        ["Caches or global arrays that grow without any limit", "Кеші чи глобальні масиви, що ростуть без жодних обмежень"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "ws-vs-sse",
      ["How do WebSockets differ from Server-Sent Events?", "Чим WebSockets відрізняються від Server-Sent Events?"],
      [
        ["It is the other way around: SSE is two-way", "Навпаки: SSE двосторонні"],
        ["They are the same", "Вони однакові"],
        ["SSE works only on top of a WebSocket", "SSE працюють лише поверх WebSocket"],
        [
          "SSE is one-way, from server to client, over plain HTTP with automatic reconnection and text only; WebSockets are two-way, support binary data and use their own protocol",
          "SSE односпрямовані, від сервера до клієнта, працюють через звичайний HTTP з автоматичним перепідключенням і лише з текстом; WebSockets двосторонні, підтримують двійкові дані й мають власний протокол",
        ],
      ],
      "d",
    ),
    question(
      "service-worker-update",
      ["What happens when you deploy a new version of a Service Worker?", "Що відбувається, коли ви викочуєте нову версію Service Worker?"],
      [
        [
          "The browser installs it, but it waits until every tab using the old worker is closed before activating, unless you call `skipWaiting()` and `clients.claim()`",
          "Браузер його встановлює, але він чекає, доки закриються всі вкладки зі старим воркером, і лише тоді активується, якщо не викликати `skipWaiting()` і `clients.claim()`",
        ],
        ["It always activates immediately in every tab", "Він завжди одразу активується в кожній вкладці"],
        ["A Service Worker can never be updated", "Service Worker неможливо оновити"],
        ["It deletes all caches automatically", "Він автоматично видаляє всі кеші"],
      ],
      "a",
    ),
    question(
      "websocket-practice",
      ["What should a production WebSocket client handle?", "Що має вміти WebSocket-клієнт у продакшні?"],
      [
        ["Reconnecting with exponential backoff after the connection drops", "Перепідключення з експоненційною затримкою після розриву з'єднання"],
        ["Heartbeats (ping/pong) to detect dead connections", "Heartbeat-повідомлення (ping/pong), щоб виявляти «мертві» з'єднання"],
        ["Authentication when the connection opens, and a typed message format", "Автентифікацію під час відкриття з'єднання та формат повідомлень із типами"],
        ["Nothing special: a connection never drops", "Нічого особливого: з'єднання ніколи не розривається"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "low-fps",
      ["An animation runs at a low FPS. How do you find the cause?", "Анімація працює з низьким FPS. Як знайти причину?"],
      [
        ["Reinstall the browser", "Перевстановити браузер"],
        [
          "Record it in the DevTools Performance panel and look for long tasks, layout and paint in each frame; typical causes are animating layout properties, layout thrashing, heavy JS on the main thread and too many large layers",
          "Записати її в панелі Performance у DevTools і шукати довгі задачі, layout і paint у кожному кадрі; типові причини — анімація властивостей layout, layout thrashing, важкий JS у головному потоці та забагато великих шарів",
        ],
        ["Add more animations to warm up the GPU", "Додати більше анімацій, щоб «розігріти» GPU"],
        ["Switch to `setInterval`", "Перейти на `setInterval`"],
      ],
      "b",
    ),
    question(
      "code-organization",
      ["Which approach to organizing code scales best in a large frontend?", "Який підхід до організації коду найкраще масштабується у великому фронтенді?"],
      [
        ["Applying every Gang of Four pattern everywhere", "Застосовувати всі патерни «Банди чотирьох» усюди"],
        ["No structure: everyone puts files where they like", "Жодної структури: кожен кладе файли куди хоче"],
        [
          "Feature modules with clear boundaries, dependencies pointing from features to shared code (never the other way), and patterns chosen for a concrete need, such as an adapter around an API or a facade over a complex library",
          "Модулі за функціональністю з чіткими межами, залежності, спрямовані від функціональностей до спільного коду (ніколи навпаки), і патерни, обрані під конкретну потребу, як-от адаптер навколо API чи фасад над складною бібліотекою",
        ],
        ["One global folder per file type for the whole app", "Одна глобальна тека на кожен тип файлів для всього застосунку"],
      ],
      "c",
    ),
    question(
      "client-storage",
      ["Which client-side storage fits large structured data and binary files for offline use?", "Яке клієнтське сховище підходить для великих структурованих даних і файлів для роботи офлайн?"],
      [
        ["localStorage", "localStorage"],
        ["Cookies", "Cookies"],
        [
          "IndexedDB (or OPFS for files): asynchronous, with large quotas, and it stores objects and blobs",
          "IndexedDB (або OPFS для файлів): асинхронне, з великими квотами, зберігає об'єкти та blob-и",
        ],
        ["sessionStorage", "sessionStorage"],
      ],
      "c",
    ),
    question(
      "client-caching",
      ["When is client-side caching appropriate, and what is its main risk?", "Коли доречне кешування на клієнті і який його головний ризик?"],
      [
        ["Always; there are no risks", "Завжди; ризиків немає"],
        ["Never", "Ніколи"],
        ["Only for passwords", "Лише для паролів"],
        [
          "For data that is read often and changes rarely (reference lists, the user profile); the risk is stale data, so you need invalidation: TTLs, stale-while-revalidate or invalidation after mutations",
          "Для даних, які часто читають і рідко змінюють (довідники, профіль користувача); ризик — застарілі дані, тож потрібна інвалідація: TTL, stale-while-revalidate чи скидання кешу після змін",
        ],
      ],
      "d",
    ),
    question(
      "auth-security",
      ["Which practices make authentication and authorization safer?", "Які практики роблять автентифікацію та авторизацію безпечнішими?"],
      [
        ["Keep tokens in `HttpOnly`, `Secure`, `SameSite` cookies rather than in localStorage", "Зберігати токени в cookies з `HttpOnly`, `Secure`, `SameSite`, а не в localStorage"],
        ["Trust the user's role that the client sends", "Довіряти ролі користувача, яку надсилає клієнт"],
        ["Enforce permissions on the server; the client only hides UI", "Перевіряти права на сервері; клієнт лише ховає елементи UI"],
        ["Short-lived access tokens with rotated refresh tokens", "Короткоживучі access-токени та refresh-токени з ротацією"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "code-splitting",
      ["What is the main effect of code splitting on performance?", "Який головний вплив розбиття коду на продуктивність?"],
      [
        [
          "Less JavaScript to download, parse and run up front, so the first load and first interaction are faster; the cost is extra requests when other chunks load later, which prefetching can hide",
          "Менше JavaScript потрібно одразу завантажити, розібрати й виконати, тож перше завантаження та перша взаємодія швидші; ціна — додаткові запити, коли пізніше вантажаться інші чанки, що можна сховати через prefetch",
        ],
        ["The total amount of code always shrinks", "Загальний обсяг коду завжди зменшується"],
        ["The first load becomes slower", "Перше завантаження стає повільнішим"],
        ["It has no effect", "Він ні на що не впливає"],
      ],
      "a",
    ),
    question(
      "test-automation-tools",
      ["Which combination covers unit, integration and interaction testing in a modern frontend?", "Яка комбінація покриває юніт-, інтеграційне й взаємодійне тестування в сучасному фронтенді?"],
      [
        ["Only `console.log`", "Лише `console.log`"],
        ["Selenium for unit tests", "Selenium для юніт-тестів"],
        [
          "Vitest or Jest for unit tests, Testing Library for components, MSW to mock the network, and Playwright or Cypress end to end",
          "Vitest чи Jest для юніт-тестів, Testing Library для компонентів, MSW для імітації мережі та Playwright чи Cypress для end-to-end",
        ],
        ["ESLint for every kind of testing", "ESLint для всіх видів тестування"],
      ],
      "c",
    ),
    question(
      "cross-site-data",
      [
        "Site A shows site B in an `<iframe>`, and you control the code of both. How do they exchange data on the client?",
        "Сайт A показує сайт B в `<iframe>`, і ви маєте доступ до коду обох. Як їм обмінюватися даними на клієнті?",
      ],
      [
        ["Read the other origin's localStorage directly", "Читати localStorage іншого origin напряму"],
        [
          "`window.postMessage`, checking `event.origin` on the receiving side",
          "`window.postMessage` з перевіркою `event.origin` на боці отримувача",
        ],
        ["Access `iframe.contentWindow.document` across origins", "Звертатися до `iframe.contentWindow.document` між різними origin"],
        ["Cookies are shared between all sites automatically", "Cookies автоматично спільні для всіх сайтів"],
      ],
      "b",
    ),
  ],
};
