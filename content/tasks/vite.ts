import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "vite-fast-dev",
    ["vite", w("es-modules")],
    1,
    60,
    ["Why the dev server starts fast", "Чому dev-сервер стартує швидко"],
    ["Why does Vite's dev server start almost instantly, even on large apps?", "Чому dev-сервер Vite стартує майже миттєво навіть на великих застосунках?"],
    [
      ["It serves source files as native ES modules and transforms each one only when the browser requests it", "Він віддає вихідні файли як нативні ES-модулі й перетворює кожен лише тоді, коли браузер його запитує"],
      ["It skips TypeScript and JSX entirely", "Він повністю пропускає TypeScript і JSX"],
      ["It caches the whole production bundle", "Він кешує весь продакшен-бандл"],
      ["It runs in a Web Worker", "Він працює у Web Worker"],
    ],
    "a",
    [
      "Instead of bundling the whole app before serving, Vite lets the browser request modules through `import` statements and transforms just those files (esbuild for TS/JSX). Only dependencies are pre-bundled once and cached. So start-up cost doesn't grow with the number of source files.",
      "Замість збирання всього застосунку перед віддачею Vite дає браузеру запитувати модулі через `import` і перетворює лише ці файли (esbuild для TS/JSX). Лише залежності один раз попередньо збираються й кешуються. Тож вартість запуску не зростає з кількістю вихідних файлів.",
    ],
  ),
  quiz(
    "vite-env-vars",
    ["vite", w("web-security")],
    2,
    90,
    ["Environment variables", "Змінні оточення"],
    ["`.env` contains `API_URL=…` and `VITE_MAPS_KEY=…`. In client code, `import.meta.env.API_URL` is `undefined`. What's going on?", "`.env` містить `API_URL=…` і `VITE_MAPS_KEY=…`. У клієнтському коді `import.meta.env.API_URL` дорівнює `undefined`. Що відбувається?"],
    [
      ["Only `VITE_`-prefixed variables are exposed to client code, inlined at build time, and therefore public", "Клієнтському коду доступні лише змінні з префіксом `VITE_`, вони вбудовуються під час збирання, а отже публічні"],
      ["`.env` files are only read in production", "Файли `.env` читаються лише в продакшені"],
      ["It must be read with `process.env.API_URL`", "Її треба читати через `process.env.API_URL`"],
      ["Variables must be lowercase", "Змінні мають бути в нижньому регістрі"],
    ],
    "a",
    [
      "Vite deliberately exposes only `VITE_*` variables so server secrets in the same `.env` don't leak into the bundle. Exposed values are replaced in the code at build time, so anyone can read them in the downloaded JavaScript: a maps key restricted by domain is fine, a database password is not.",
      "Vite навмисно відкриває лише змінні `VITE_*`, щоб серверні секрети з того самого `.env` не потрапили в бандл. Відкриті значення підставляються в код під час збирання, тож будь-хто може прочитати їх у завантаженому JavaScript: ключ карт з обмеженням за доменом підходить, пароль до бази даних ні.",
    ],
  ),
  quiz(
    "vite-dynamic-import",
    ["vite", w("web-performance")],
    2,
    60,
    ["Code splitting", "Розбиття коду"],
    ["What does `const Editor = lazy(() => import(\"./Editor\"))` change in the production build?", "Що змінює `const Editor = lazy(() => import(\"./Editor\"))` у продакшен-збірці?"],
    [
      ["`Editor` and its dependencies go into a separate chunk loaded only when it's first rendered", "`Editor` і його залежності потрапляють в окремий фрагмент, що завантажується лише під час першого рендеру"],
      ["Nothing; dynamic imports are inlined", "Нічого; динамічні імпорти вбудовуються"],
      ["`Editor` is loaded in a Web Worker", "`Editor` завантажується у Web Worker"],
      ["The whole app becomes server-rendered", "Увесь застосунок стає серверно рендереним"],
    ],
    "a",
    [
      "Each dynamic `import()` is a split point: the bundler creates a separate chunk, and the initial bundle gets smaller. It's ideal for routes and heavy, rarely used features. Prefetch the chunk on hover or idle if the delay on first use is noticeable.",
      "Кожен динамічний `import()` є точкою розбиття: бандлер створює окремий фрагмент, і початковий бандл меншає. Це ідеально для маршрутів і важких, рідко використовуваних можливостей. Попередньо завантажуйте фрагмент при наведенні чи в простої, якщо затримка під час першого використання помітна.",
    ],
  ),
  quiz(
    "vite-hashed-caching",
    ["vite", w("http-rest")],
    3,
    120,
    ["Caching hashed builds", "Кешування хешованих збірок"],
    ["After `vite build` the output is `index.html` and `assets/index-3f9a1c.js`. What's the right HTTP caching setup?", "Після `vite build` маємо `index.html` і `assets/index-3f9a1c.js`. Яке налаштування HTTP-кешування правильне?"],
    [
      ["Cache `assets/*` for a year as `immutable`; serve `index.html` with `no-cache` so it's revalidated on every visit", "Кешувати `assets/*` на рік як `immutable`; віддавати `index.html` з `no-cache`, щоб він перевірявся при кожному відвідуванні"],
      ["Cache everything for a year", "Кешувати все на рік"],
      ["Disable caching for everything", "Вимкнути кешування для всього"],
      ["Cache `index.html` for a year and assets for 5 minutes", "Кешувати `index.html` на рік, а ресурси на 5 хвилин"],
    ],
    "a",
    [
      "The hash changes whenever a file's content changes, so a hashed file can never become stale and can be cached forever. `index.html` has a fixed name and points to the current hashes, so it must be revalidated; if it were cached for long, users would keep loading old asset references after a deploy.",
      "Хеш змінюється щоразу, коли змінюється вміст файлу, тож хешований файл ніколи не застаріє й може кешуватися назавжди. `index.html` має незмінну назву й посилається на поточні хеші, тож його треба перевіряти; якби його кешували надовго, користувачі після розгортання й далі завантажували б старі посилання на ресурси.",
    ],
  ),
  quiz(
    "vite-tree-shaking",
    ["vite", w("es-modules")],
    3,
    120,
    ["Why wasn't it tree-shaken?", "Чому код не прибрався?"],
    ["The app imports one helper from a utility library, but the whole library ends up in the bundle. Which cause is most likely?", "Застосунок імпортує одну функцію з бібліотеки утиліт, але в бандл потрапляє вся бібліотека. Яка причина найімовірніша?"],
    [
      ["The library is published as CommonJS (or marks itself as having side effects), so the bundler can't safely drop unused exports", "Бібліотека опублікована як CommonJS (або позначена як така, що має побічні ефекти), тож бандлер не може безпечно прибрати невикористані експорти"],
      ["Named imports always include the whole module", "Іменовані імпорти завжди включають увесь модуль"],
      ["Tree shaking only runs in development", "Tree shaking працює лише в розробці"],
      ["The helper is written in TypeScript", "Функцію написано на TypeScript"],
    ],
    "a",
    [
      "Tree shaking relies on static `import`/`export` analysis. `require()` and `module.exports` are dynamic, and modules with possible side effects can't be dropped unless the package declares `\"sideEffects\": false`. Prefer ESM builds (`lodash-es` over `lodash`) or per-function imports, and check the result with a bundle visualiser.",
      "Tree shaking спирається на статичний аналіз `import`/`export`. `require()` і `module.exports` динамічні, а модулі з можливими побічними ефектами не можна викинути, якщо пакет не оголосив `\"sideEffects\": false`. Віддавайте перевагу ESM-збіркам (`lodash-es` замість `lodash`) чи імпортам окремих функцій і перевіряйте результат візуалізатором бандла.",
    ],
  ),
  quiz(
    "vite-base-path",
    ["vite"],
    4,
    120,
    ["Deploying under a sub-path", "Розгортання в підкаталозі"],
    ["The app works with `vite dev`, but when deployed to `https://example.com/my-app/` the page is blank and the console shows 404s for `/assets/index-….js`. What's the fix?", "Застосунок працює з `vite dev`, але після розгортання на `https://example.com/my-app/` сторінка порожня, а в консолі 404 для `/assets/index-….js`. Як виправити?"],
    [
      ["Set `base: \"/my-app/\"` in `vite.config` so asset URLs are prefixed with the sub-path", "Задати `base: \"/my-app/\"` у `vite.config`, щоб URL ресурсів мали префікс підкаталогу"],
      ["Rename `assets/` to `public/`", "Перейменувати `assets/` на `public/`"],
      ["Disable minification", "Вимкнути мініфікацію"],
      ["Use `require` instead of `import`", "Використати `require` замість `import`"],
    ],
    "a",
    [
      "By default the build assumes the app is served from `/`, so `index.html` references `/assets/...`. Setting `base` rewrites those URLs (and `import.meta.env.BASE_URL`). If you use client-side routing, configure the router's base path too, and the server must fall back to `index.html` for deep links.",
      "За замовчуванням збірка вважає, що застосунок віддається з `/`, тож `index.html` посилається на `/assets/...`. Параметр `base` переписує ці URL (і `import.meta.env.BASE_URL`). Якщо використовуєте клієнтську маршрутизацію, налаштуйте базовий шлях і в роутері, а сервер має віддавати `index.html` для глибоких посилань.",
    ],
  ),
]);
