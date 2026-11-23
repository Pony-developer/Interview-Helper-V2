import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 47–71 of the Middle list: JavaScript. */
export const middleJavascriptQuiz: SlideDef = {
  kind: "quiz",
  slug: "middle-javascript-quiz",
  title: { en: "JavaScript", uk: "JavaScript" },
  questions: [
    question(
      "storage-cookies",
      ["What sets cookies apart from localStorage and sessionStorage?", "Чим cookies відрізняються від localStorage і sessionStorage?"],
      [
        ["Cookies are never sent to the server", "Cookies ніколи не надсилаються на сервер"],
        ["localStorage is sent to the server with every request", "localStorage надсилається на сервер із кожним запитом"],
        [
          "Cookies are sent to the server with every matching request, are small (about 4 KB), have an expiry and can be `HttpOnly` so scripts can't read them; Web Storage stays in the browser, holds about 5 MB and is always readable from JS",
          "Cookies надсилаються на сервер із кожним відповідним запитом, малі (близько 4 КБ), мають термін дії й можуть бути `HttpOnly`, тож скрипти їх не прочитають; Web Storage лишається в браузері, вміщує близько 5 МБ і завжди доступний із JS",
        ],
        ["Cookies have no size limit", "Cookies не мають обмеження розміру"],
      ],
      "c",
    ),
    question(
      "map-set",
      ["When are `Map` and `Set` a better fit than plain objects and arrays?", "Коли `Map` і `Set` кращі за звичайні об'єкти й масиви?"],
      [
        ["`Set` to keep unique values, for example removing duplicates with `[...new Set(arr)]`", "`Set` для унікальних значень, наприклад щоб прибрати дублікати через `[...new Set(arr)]`"],
        ["`Map` when the keys are not strings (objects, DOM nodes) or keys are added and removed often", "`Map`, коли ключі не рядки (об'єкти, DOM-вузли) або ключі часто додають і видаляють"],
        ["`Map` because `JSON.stringify` serializes it directly", "`Map`, бо `JSON.stringify` серіалізує його напряму"],
        ["`Set` for fast `has()` checks instead of `array.includes()` on large lists", "`Set` для швидких перевірок `has()` замість `array.includes()` на великих списках"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "in-viewport",
      ["What is the most efficient way to know when an element enters the viewport?", "Який найефективніший спосіб дізнатися, що елемент потрапив у viewport?"],
      [
        ["A `scroll` listener that calls `getBoundingClientRect()` on every element at every event", "Обробник `scroll`, що на кожну подію викликає `getBoundingClientRect()` для кожного елемента"],
        ["`IntersectionObserver`: the browser calls back asynchronously when the visibility changes", "`IntersectionObserver`: браузер асинхронно викликає колбек, коли змінюється видимість"],
        ["A `setInterval` that checks the scroll position", "`setInterval`, що перевіряє позицію прокрутки"],
        ["The CSS `:visible` pseudo-class", "CSS-псевдоклас `:visible`"],
      ],
      "b",
    ),
    question(
      "service-workers",
      ["What is a Service Worker?", "Що таке Service Worker?"],
      [
        ["A worker process on the server", "Робочий процес на сервері"],
        ["A Web Worker that has access to the DOM", "Web Worker, що має доступ до DOM"],
        ["A scheduler that runs tasks on a timer", "Планувальник, що запускає задачі за таймером"],
        [
          "A script that runs in the background, separately from the page, and acts as a network proxy: offline caching, push notifications, background sync; it requires HTTPS",
          "Скрипт, що працює у фоні, окремо від сторінки, і діє як мережевий проксі: офлайн-кешування, push-сповіщення, фонова синхронізація; потребує HTTPS",
        ],
      ],
      "d",
    ),
    question(
      "websockets",
      ["Which use case fits WebSockets better than polling the server with `fetch`?", "Для якого сценарію WebSockets кращі за опитування сервера через `fetch`?"],
      [
        ["A multiplayer game or live trading prices, with frequent messages in both directions", "Мультиплеєрна гра чи ціни на біржі в реальному часі з частими повідомленнями в обидва боки"],
        ["Loading a page once", "Одноразове завантаження сторінки"],
        ["Downloading a PDF", "Завантаження PDF"],
        ["Submitting a contact form", "Відправка контактної форми"],
      ],
      "a",
    ),
    question(
      "error-handling",
      ["Which of these are good error-handling practices in a frontend app?", "Які з цього — добрі практики обробки помилок у фронтенд-застосунку?"],
      [
        ["`try/catch` around awaited calls and `.catch()` on promises", "`try/catch` навколо викликів з `await` і `.catch()` на промісах"],
        [
          "Error boundaries or global handlers (`window.onerror`, `unhandledrejection`) that report to monitoring such as Sentry",
          "Error boundaries чи глобальні обробники (`window.onerror`, `unhandledrejection`), що надсилають звіти в моніторинг, як-от Sentry",
        ],
        ["Swallowing every error with an empty `catch {}`", "Глушити кожну помилку порожнім `catch {}`"],
        ["Showing the user a clear message and a way to retry", "Показувати користувачу зрозуміле повідомлення й можливість повторити"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "event-loop",
      ["What does the event loop do?", "Що робить event loop?"],
      [
        ["Runs JavaScript on several threads at once", "Виконує JavaScript у кількох потоках одночасно"],
        ["Runs timers before the synchronous code", "Виконує таймери раніше за синхронний код"],
        [
          "When the call stack is empty, it runs all queued microtasks (promise callbacks), then takes the next macrotask (a timer, I/O, an event), renders if needed, and repeats",
          "Коли стек викликів порожній, він виконує всі мікрозадачі в черзі (колбеки промісів), потім бере наступну макрозадачу (таймер, I/O, подію), за потреби рендерить і повторює",
        ],
        ["Checks the code for errors before it runs", "Перевіряє код на помилки перед запуском"],
      ],
      "c",
    ),
    question(
      "type-vs-interface",
      ["What is a real difference between `type` and `interface` in TypeScript?", "Яка справжня відмінність між `type` та `interface` у TypeScript?"],
      [
        ["Interfaces cannot describe objects", "Інтерфейси не можуть описувати об'єкти"],
        [
          "Only `type` can describe unions, tuples and mapped types; interfaces with the same name merge (declaration merging) and are extended with `extends`",
          "Лише `type` може описувати union-и, кортежі та mapped types; однойменні інтерфейси зливаються (declaration merging) і розширюються через `extends`",
        ],
        ["A `type` exists at runtime, an interface doesn't", "`type` існує під час виконання, а інтерфейс ні"],
        ["There is no difference", "Різниці немає"],
      ],
      "b",
    ),
    question(
      "access-modifiers",
      ["How does `private` in a TypeScript class differ from a `#field`?", "Чим `private` у класі TypeScript відрізняється від `#field`?"],
      [
        ["`#field` is checked only by the compiler, `private` is private at runtime", "`#field` перевіряє лише компілятор, а `private` приватний під час виконання"],
        ["They are the same", "Вони однакові"],
        ["`private` makes the field readonly", "`private` робить поле readonly"],
        [
          "`private` is checked only by the compiler and disappears in the JS output; `#field` is truly private at runtime",
          "`private` перевіряє лише компілятор, і в JS він зникає; `#field` справді приватне під час виконання",
        ],
      ],
      "d",
    ),
    question(
      "type-guard",
      [
        "What does `a is Cat` do here?\n\n```ts\nfunction isCat(a: Cat | Dog): a is Cat {\n  return 'meow' in a;\n}\n```",
        "Що робить `a is Cat` тут?\n\n```ts\nfunction isCat(a: Cat | Dog): a is Cat {\n  return 'meow' in a;\n}\n```",
      ],
      [
        ["Inside `if (isCat(pet)) { … }`, TypeScript narrows `pet` to `Cat`", "Усередині `if (isCat(pet)) { … }` TypeScript звужує тип `pet` до `Cat`"],
        ["It converts a `Dog` into a `Cat`", "Перетворює `Dog` на `Cat`"],
        ["It casts the value at runtime", "Приводить значення до типу під час виконання"],
        ["It is a syntax error", "Це синтаксична помилка"],
      ],
      "a",
    ),
    question(
      "abstract-purpose",
      ["Why create an abstract class?", "Навіщо створювати абстрактний клас?"],
      [
        ["To make all its fields private", "Щоб зробити всі його поля приватними"],
        ["To make the code run faster", "Щоб код швидше працював"],
        [
          "To share common code and a contract with subclasses while forbidding direct instantiation; every subclass must implement the abstract methods",
          "Щоб дати нащадкам спільний код і контракт, заборонивши створювати екземпляр напряму; кожен нащадок має реалізувати абстрактні методи",
        ],
        ["To prevent inheritance", "Щоб заборонити успадкування"],
      ],
      "c",
    ),
    question(
      "object-models",
      ["Which set describes the browser's object models?", "Який набір описує об'єктні моделі браузера?"],
      [
        ["MVC, MVP and MVVM", "MVC, MVP і MVVM"],
        [
          "DOM (the document), BOM (`window`, `location`, `history`, `navigator`) and CSSOM (the styles)",
          "DOM (документ), BOM (`window`, `location`, `history`, `navigator`) і CSSOM (стилі)",
        ],
        ["JSON, XML and YAML", "JSON, XML і YAML"],
        ["Only the DOM", "Лише DOM"],
      ],
      "b",
    ),
    question(
      "polyfills",
      ["What is a polyfill?", "Що таке поліфіл?"],
      [
        ["A CSS reset", "CSS-скидання стилів"],
        ["A font that fills in missing characters", "Шрифт, що доповнює відсутні символи"],
        ["A tool that turns new syntax, like arrow functions, into old syntax", "Інструмент, що перетворює новий синтаксис, як-от стрілкові функції, на старий"],
        [
          "Code that implements a newer API missing in older browsers, such as `Array.prototype.at` or `fetch`, usually loaded only where needed",
          "Код, що реалізує новіший API, якого немає в старих браузерах, як-от `Array.prototype.at` чи `fetch`, і зазвичай завантажується лише там, де потрібно",
        ],
      ],
      "d",
    ),
    question(
      "anonymous-usage",
      ["Where are anonymous functions typically used?", "Де зазвичай використовують анонімні функції?"],
      [
        ["Callbacks: `arr.map(x => x * 2)`, `addEventListener('click', () => { … })`", "Колбеки: `arr.map(x => x * 2)`, `addEventListener('click', () => { … })`"],
        ["An IIFE that creates a private scope", "IIFE, що створює приватну область видимості"],
        ["As a listener you'll later need to remove with `removeEventListener`", "Як обробник, який згодом треба буде прибрати через `removeEventListener`"],
        ["Promise handlers in `.then()`", "Обробники промісів у `.then()`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "es-modules",
      ["What is true about ES modules?", "Що правильно про ES-модулі?"],
      [
        [
          "Each file has its own scope; `import` and `export` are static, so bundlers can remove unused code (tree shaking); in the browser, `<script type=\"module\">` is deferred by default",
          "Кожен файл має власну область видимості; `import` і `export` статичні, тож бандлери можуть прибирати невикористаний код (tree shaking); у браузері `<script type=\"module\">` за замовчуванням відкладений",
        ],
        ["They work like ordinary global scripts", "Вони працюють як звичайні глобальні скрипти"],
        ["They work only in Node.js", "Вони працюють лише в Node.js"],
        ["Imports can only be dynamic", "Імпорти можуть бути лише динамічними"],
      ],
      "a",
    ),
    question(
      "modularity",
      ["Which way of splitting code into modules is easiest to maintain?", "Який поділ коду на модулі найпростіший у підтримці?"],
      [
        ["One huge `utils.js` for everything", "Один величезний `utils.js` на все"],
        ["Global variables on `window`", "Глобальні змінні на `window`"],
        [
          "Small modules with one responsibility and a clear public API (named exports, an `index.ts` per feature), without circular dependencies",
          "Невеликі модулі з однією відповідальністю та чітким публічним API (іменовані експорти, `index.ts` на кожну функціональність), без циклічних залежностей",
        ],
        ["Copying the needed code into each file", "Копіювати потрібний код у кожен файл"],
      ],
      "c",
    ),
    question(
      "scalable-code",
      ["Which approaches keep a codebase readable and scalable as it grows?", "Які підходи зберігають код читабельним і масштабованим у міру зростання?"],
      [
        ["Global variables shared across files", "Глобальні змінні, спільні для багатьох файлів"],
        ["Naming and folder conventions agreed by the team", "Узгоджені в команді правила іменування та структури тек"],
        ["TypeScript and linters enforced in CI", "TypeScript і лінтери, обов'язкові в CI"],
        ["Code review and small pull requests", "Code review і невеликі pull requests"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "js-animation-perf",
      ["Which is the right way to drive an animation from JavaScript?", "Як правильно керувати анімацією з JavaScript?"],
      [
        ["`setInterval(fn, 1)` that changes `left`", "`setInterval(fn, 1)`, що змінює `left`"],
        [
          "`requestAnimationFrame`, changing `transform` or `opacity`, so the updates are in sync with the screen refresh",
          "`requestAnimationFrame` зі зміною `transform` чи `opacity`, щоб оновлення синхронізувалися з частотою оновлення екрана",
        ],
        ["A `while` loop that updates the position", "Цикл `while`, що оновлює позицію"],
        ["A recursive `setTimeout(fn, 0)` that changes `width`", "Рекурсивний `setTimeout(fn, 0)`, що змінює `width`"],
      ],
      "b",
    ),
    question(
      "lazy-scripts",
      ["How do you load a heavy script, such as a chart library, only when it is needed?", "Як завантажити важкий скрипт, як-от бібліотеку графіків, лише тоді, коли він потрібен?"],
      [
        ["Add a `<script>` for it in `<head>`", "Додати для нього `<script>` у `<head>`"],
        ["Import it statically at the top of the main file", "Статично імпортувати на початку головного файлу"],
        ["Inline the whole library into the HTML", "Вбудувати всю бібліотеку в HTML"],
        [
          "`const { Chart } = await import('./chart.js')` when the user opens the chart; the bundler puts it into a separate chunk",
          "`const { Chart } = await import('./chart.js')`, коли користувач відкриває графік; бандлер винесе його в окремий чанк",
        ],
      ],
      "d",
    ),
    question(
      "eslint",
      ["How are linting and code style usually enforced in a project?", "Як зазвичай забезпечують лінтинг і єдиний стиль коду в проєкті?"],
      [
        ["Each developer follows a personal style", "Кожен розробник дотримується власного стилю"],
        ["A shared ESLint config and Prettier for formatting, committed to the repository", "Спільна конфігурація ESLint і Prettier для форматування, збережені в репозиторії"],
        ["Pre-commit hooks (husky, lint-staged) and checks in CI", "Pre-commit хуки (husky, lint-staged) і перевірки в CI"],
        ["Editor integration that shows problems while you type", "Інтеграція з редактором, що показує проблеми під час набору"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "design-patterns",
      ["Which design pattern is behind `addEventListener` and most event emitters?", "Який патерн проєктування лежить в основі `addEventListener` і більшості event emitter-ів?"],
      [
        ["Singleton", "Singleton (одинак)"],
        ["Factory", "Factory (фабрика)"],
        ["Observer (publish/subscribe)", "Observer (спостерігач, publish/subscribe)"],
        ["Decorator", "Decorator (декоратор)"],
      ],
      "c",
    ),
    question(
      "percent-preloader",
      [
        "How do you build a percentage preloader for images, 3D models and JSON files?",
        "Як зробити відсотковий прелоадер для зображень, 3D-моделей і JSON-файлів?",
      ],
      [
        ["Animate a bar from 0 to 100% over a fixed three seconds", "Анімувати смугу від 0 до 100% за фіксовані три секунди"],
        [
          "Load each resource with `fetch`, track the received bytes through `response.body` and `Content-Length` (or count finished files), combine them into one percentage, and use `Promise.all` to know when everything is ready",
          "Завантажувати кожен ресурс через `fetch`, рахувати отримані байти через `response.body` і `Content-Length` (або кількість завершених файлів), зводити все в один відсоток і через `Promise.all` дізнатися, коли все готово",
        ],
        ["Listen to `window.onload`, which reports progress from 0 to 100", "Слухати `window.onload`, який повідомляє прогрес від 0 до 100"],
        ["It is impossible in the browser", "У браузері це неможливо"],
      ],
      "b",
    ),
    question(
      "pwa",
      ["What makes a web app a PWA?", "Що робить вебзастосунок PWA?"],
      [
        ["A web app manifest (name, icons, `display`)", "Маніфест вебзастосунку (назва, іконки, `display`)"],
        ["A Service Worker for offline work and caching", "Service Worker для роботи офлайн і кешування"],
        ["Being served over HTTPS", "Доставка через HTTPS"],
        ["Being published in the App Store", "Публікація в App Store"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "generators",
      [
        "What does this code print?\n\n```js\nfunction* ids() {\n  let id = 1;\n  while (true) yield id++;\n}\nconst gen = ids();\ngen.next();\nconsole.log(gen.next().value);\n```",
        "Що виведе цей код?\n\n```js\nfunction* ids() {\n  let id = 1;\n  while (true) yield id++;\n}\nconst gen = ids();\ngen.next();\nconsole.log(gen.next().value);\n```",
      ],
      [
        ["1", "1"],
        ["Nothing: the infinite loop freezes the page", "Нічого: нескінченний цикл заморожує сторінку"],
        ["2", "2"],
        ["undefined", "undefined"],
      ],
      "c",
    ),
    question(
      "spread-rest",
      ["Which of these are valid uses of `...`?", "Які з цих використань `...` правильні?"],
      [
        ["Spreading an array into arguments: `Math.max(...nums)`", "Розгортання масиву в аргументи: `Math.max(...nums)`"],
        ["Making a deep clone of nested objects", "Глибоке клонування вкладених об'єктів"],
        ["Copying and merging objects: `{ ...defaults, ...options }`", "Копіювання й злиття об'єктів: `{ ...defaults, ...options }`"],
        ["Rest parameters: `function log(...args) {}`", "Rest-параметри: `function log(...args) {}`"],
      ],
      ["a", "c", "d"],
    ),
  ],
};
