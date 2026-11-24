import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 35–54 of the additional list: advanced level. */
export const extraAdvancedQuiz: SlideDef = {
  kind: "quiz",
  slug: "extra-advanced-quiz",
  title: { en: "Advanced", uk: "Просунутий рівень" },
  questions: [
    question(
      "scrolling-text",
      ["What is the modern way to make text or images scroll across a page?", "Як сучасно зробити текст чи зображення, що прокручуються сторінкою?"],
      [
        ["The `<marquee>` tag", "Тег `<marquee>`"],
        [
          "A CSS animation with `@keyframes` that moves the content with `transform: translateX(...)`, respecting `prefers-reduced-motion`",
          "CSS-анімація з `@keyframes`, що рухає вміст через `transform: translateX(...)`, з урахуванням `prefers-reduced-motion`",
        ],
        ["`setInterval` that changes `left` every millisecond", "`setInterval`, що щомілісекунди змінює `left`"],
        ["A GIF of the text", "GIF із текстом"],
      ],
      "b",
    ),
    question(
      "js-in-html",
      ["Which of these correctly include JavaScript in HTML?", "Які з цих способів правильно підключають JavaScript до HTML?"],
      [
        ["An external file: `<script src=\"app.js\" defer></script>`", "Зовнішній файл: `<script src=\"app.js\" defer></script>`"],
        ["An inline `<script>` block with code", "Inline-блок `<script>` із кодом"],
        ["An ES module: `<script type=\"module\" src=\"main.js\"></script>`", "ES-модуль: `<script type=\"module\" src=\"main.js\"></script>`"],
        ["`<link rel=\"script\" href=\"app.js\">`", "`<link rel=\"script\" href=\"app.js\">`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "colspan-rowspan",
      ["How do you make one table cell span two columns?", "Як зробити, щоб одна клітинка таблиці займала дві колонки?"],
      [
        ["`<td cols=\"2\">`", "`<td cols=\"2\">`"],
        ["`<td width=\"200%\">`", "`<td width=\"200%\">`"],
        ["`<td merge=\"2\">`", "`<td merge=\"2\">`"],
        ["`<td colspan=\"2\">` (and `rowspan` to span rows)", "`<td colspan=\"2\">` (а `rowspan` — щоб займати рядки)"],
      ],
      "d",
    ),
    question(
      "figure",
      ["What are `<figure>` and `<figcaption>` for?", "Для чого потрібні `<figure>` і `<figcaption>`?"],
      [
        [
          "`<figure>` wraps self-contained content such as an image, a chart or a code listing, and `<figcaption>` gives it a caption that is linked to it for assistive technology",
          "`<figure>` обгортає самодостатній вміст, як-от зображення, діаграму чи лістинг коду, а `<figcaption>` дає йому підпис, пов'язаний із ним і для допоміжних технологій",
        ],
        ["They draw geometric shapes", "Вони малюють геометричні фігури"],
        ["They are required around every `<img>`", "Вони обов'язкові навколо кожного `<img>`"],
        ["They are deprecated", "Вони застаріли"],
      ],
      "a",
    ),
    question(
      "prop-drilling",
      ["What is prop drilling?", "Що таке prop drilling?"],
      [
        ["Passing props to a single direct child", "Передача props одному прямому дочірньому компоненту"],
        ["A tool for profiling props", "Інструмент для профілювання props"],
        [
          "Passing props down through several intermediate components that don't use them, just to reach a deeply nested child; Context, composition (passing components as children) or a store avoid it",
          "Передача props через кілька проміжних компонентів, які їх не використовують, лише щоб дістатися глибоко вкладеного; цього уникають через Context, композицію (передачу компонентів як children) чи сховище стану",
        ],
        ["A security vulnerability in React", "Вразливість безпеки в React"],
      ],
      "c",
    ),
    question(
      "debouncing",
      ["What is the difference between debouncing and throttling?", "Яка різниця між debouncing і throttling?"],
      [
        ["They are the same", "Вони однакові"],
        [
          "Debouncing runs the function only after events stop for a set delay (for example a search box); throttling runs it at most once per interval while events keep coming (for example on scroll)",
          "Debouncing викликає функцію лише після того, як події вщухли на заданий час (наприклад, поле пошуку); throttling викликає її не частіше ніж раз за інтервал, поки події тривають (наприклад, під час прокрутки)",
        ],
        ["Debouncing runs the function on every event immediately", "Debouncing викликає функцію на кожну подію одразу"],
        ["Throttling cancels the function entirely", "Throttling повністю скасовує виклик функції"],
      ],
      "b",
    ),
    question(
      "java-vs-js",
      ["How does Java differ from JavaScript?", "Чим Java відрізняється від JavaScript?"],
      [
        ["JavaScript is a lightweight version of Java", "JavaScript — полегшена версія Java"],
        ["They are two names for one language", "Це дві назви однієї мови"],
        ["Java runs in the browser, JavaScript only on servers", "Java працює в браузері, а JavaScript лише на серверах"],
        [
          "They are unrelated languages: Java is statically typed and class-based, compiled to bytecode for the JVM; JavaScript is dynamically typed and prototype-based, run by JS engines in browsers and Node.js",
          "Це не пов'язані мови: Java статично типізована й класова, компілюється в байт-код для JVM; JavaScript динамічно типізований і прототипний, його виконують JS-рушії в браузерах і Node.js",
        ],
      ],
      "d",
    ),
    question(
      "template-literal",
      [
        "What does this code print?\n\n```js\nconst name = 'Ann';\nconsole.log(`Hi, ${name}! 2 + 2 = ${2 + 2}`);\n```",
        "Що виведе цей код?\n\n```js\nconst name = 'Ann';\nconsole.log(`Hi, ${name}! 2 + 2 = ${2 + 2}`);\n```",
      ],
      [
        ["`Hi, ${name}! 2 + 2 = ${2 + 2}`", "`Hi, ${name}! 2 + 2 = ${2 + 2}`"],
        ["`Hi, Ann! 2 + 2 = 2 + 2`", "`Hi, Ann! 2 + 2 = 2 + 2`"],
        ["`Hi, Ann! 2 + 2 = 4`", "`Hi, Ann! 2 + 2 = 4`"],
        ["A syntax error", "Синтаксичну помилку"],
      ],
      "c",
    ),
    question(
      "hoc",
      ["What is a higher-order component (HOC) in React?", "Що таке компонент вищого порядку (HOC) у React?"],
      [
        [
          "A function that takes a component and returns a new component with extra behavior, for example `withAuth(Profile)`; today custom hooks cover most of these cases",
          "Функція, що приймає компонент і повертає новий компонент із додатковою поведінкою, наприклад `withAuth(Profile)`; сьогодні більшість таких випадків покривають власні хуки",
        ],
        ["The top component in the tree", "Найвищий компонент у дереві"],
        ["A component that renders above all others with `z-index`", "Компонент, що рендериться над усіма іншими через `z-index`"],
        ["A class component", "Класовий компонент"],
      ],
      "a",
    ),
    question(
      "angularjs-directive-types",
      ["Where can an AngularJS directive be used, according to its `restrict` option?", "Де можна використовувати директиву AngularJS відповідно до її опції `restrict`?"],
      [
        ["Only as an attribute", "Лише як атрибут"],
        ["Only inside `<script>` tags", "Лише всередині тегів `<script>`"],
        [
          "As an element (E), an attribute (A), a CSS class (C) or a comment (M)",
          "Як елемент (E), атрибут (A), CSS-клас (C) чи коментар (M)",
        ],
        ["Only in the `<head>`", "Лише в `<head>`"],
      ],
      "c",
    ),
    question(
      "angularjs-factory",
      ["How does a factory differ from a service in AngularJS?", "Чим factory відрізняється від service в AngularJS?"],
      [
        ["A factory renders HTML, a service doesn't", "Factory рендерить HTML, а service ні"],
        ["There is no way to inject a factory", "Factory неможливо впровадити"],
        ["A factory creates a new instance for every injection", "Factory створює новий екземпляр для кожного впровадження"],
        [
          "A factory is a function whose return value (an object or function) is injected; a service is a constructor that AngularJS calls with `new`; both are singletons",
          "Factory — це функція, значення якої (об'єкт чи функція) впроваджується; service — конструктор, який AngularJS викликає через `new`; обидва є синглтонами",
        ],
      ],
      "d",
    ),
    question(
      "digest-cycle",
      ["What is the digest cycle in AngularJS?", "Що таке digest cycle в AngularJS?"],
      [
        [
          "Dirty checking: AngularJS runs all `$watch` functions, compares old and new values and updates the view, repeating until nothing changes; it starts after AngularJS events, and code outside AngularJS needs `$scope.$apply()`",
          "Dirty checking: AngularJS запускає всі функції `$watch`, порівнює старі й нові значення та оновлює подання, повторюючи, доки нічого не змінюється; він стартує після подій AngularJS, а коду поза AngularJS потрібен `$scope.$apply()`",
        ],
        ["A cache that stores compiled templates", "Кеш, що зберігає скомпільовані шаблони"],
        ["A build step that minifies code", "Крок збирання, що мініфікує код"],
        ["A timer that refreshes the page every second", "Таймер, що оновлює сторінку щосекунди"],
      ],
      "a",
    ),
    question(
      "angular-router",
      ["Which statement about the Angular Router is true?", "Яке твердження про Angular Router правильне?"],
      [
        ["It reloads the page on every navigation", "Він перезавантажує сторінку під час кожного переходу"],
        [
          "It maps URL paths to components in a routes config, renders them in `<router-outlet>`, navigates with `routerLink`, and supports guards, lazy-loaded routes and parameters",
          "Він зіставляє шляхи URL з компонентами в конфігурації маршрутів, рендерить їх у `<router-outlet>`, переходить через `routerLink` і підтримує guards, ліниві маршрути й параметри",
        ],
        ["It is a third-party library that Angular doesn't support", "Це стороння бібліотека, яку Angular не підтримує"],
        ["It works only on the server", "Він працює лише на сервері"],
      ],
      "b",
    ),
    question(
      "angular-lifecycle",
      ["Which pairing of Angular lifecycle hooks is correct?", "Яке поєднання хуків життєвого циклу Angular правильне?"],
      [
        ["`ngOnDestroy` for loading initial data, `ngOnInit` for cleanup", "`ngOnDestroy` для завантаження початкових даних, `ngOnInit` для очищення"],
        ["`ngAfterViewInit` runs before the constructor", "`ngAfterViewInit` виконується раніше за конструктор"],
        [
          "`ngOnChanges` when inputs change, `ngOnInit` once for initialization after the first inputs, `ngAfterViewInit` once the view is ready, `ngOnDestroy` for cleanup",
          "`ngOnChanges`, коли змінюються вхідні дані, `ngOnInit` один раз для ініціалізації після перших inputs, `ngAfterViewInit`, коли подання готове, `ngOnDestroy` для очищення",
        ],
        ["Angular components have no lifecycle hooks", "Компоненти Angular не мають хуків життєвого циклу"],
      ],
      "c",
    ),
    question(
      "vue-loader",
      ["What is vue-loader?", "Що таке vue-loader?"],
      [
        ["A loading spinner component", "Компонент індикатора завантаження"],
        ["A tool that loads Vue from a CDN", "Інструмент, що завантажує Vue із CDN"],
        ["A Vue router plugin", "Плагін роутера Vue"],
        [
          "A webpack loader that compiles `.vue` single-file components (template, script and scoped styles) into JavaScript modules; in Vite projects `@vitejs/plugin-vue` does this job",
          "Завантажувач для webpack, що компілює однофайлові компоненти `.vue` (шаблон, скрипт і scoped-стилі) у JavaScript-модулі; у проєктах на Vite цю роботу виконує `@vitejs/plugin-vue`",
        ],
      ],
      "d",
    ),
    question(
      "v-cloak",
      ["What is `v-cloak` for, and what else does it need?", "Для чого потрібен `v-cloak` і що ще для нього потрібно?"],
      [
        [
          "It hides uncompiled `{{ }}` expressions until Vue mounts; it needs a CSS rule such as `[v-cloak] { display: none }`, and Vue removes the attribute when it is ready",
          "Він ховає нескомпільовані вирази `{{ }}`, доки Vue не змонтується; йому потрібне CSS-правило на кшталт `[v-cloak] { display: none }`, а Vue прибирає атрибут, коли все готово",
        ],
        ["It encrypts the component's data", "Він шифрує дані компонента"],
        ["It hides an element permanently", "Він назавжди ховає елемент"],
        ["It works on its own, with no CSS", "Він працює сам, без жодного CSS"],
      ],
      "a",
    ),
    question(
      "vue-plugin",
      ["What is a Vue plugin, and how is it installed?", "Що таке плагін Vue і як його встановити?"],
      [
        ["A browser extension for Vue DevTools only", "Розширення браузера лише для Vue DevTools"],
        [
          "An object with an `install(app, options)` method (or a function) that adds app-wide features such as global components, directives or provided values; it is installed with `app.use(plugin)`",
          "Об'єкт із методом `install(app, options)` (або функція), що додає можливості на рівні застосунку, як-от глобальні компоненти, директиви чи provide-значення; встановлюється через `app.use(plugin)`",
        ],
        ["A component imported into a single file", "Компонент, імпортований в один файл"],
        ["A CSS theme", "CSS-тема"],
      ],
      "b",
    ),
    question(
      "vue-adoption",
      ["Which statement about who uses Vue.js is true?", "Яке твердження про те, хто використовує Vue.js, правильне?"],
      [
        ["It is used only for hobby projects", "Його використовують лише в хобі-проєктах"],
        ["It was created by Google for Gmail", "Його створив Google для Gmail"],
        ["It works only together with Laravel", "Він працює лише разом із Laravel"],
        ["Large companies such as GitLab, Alibaba and Xiaomi use it in production", "Великі компанії, як-от GitLab, Alibaba і Xiaomi, використовують його в продакшні"],
      ],
      "d",
    ),
    question(
      "install-vue",
      ["Which of these are valid ways to add Vue.js to a project?", "Які з цих способів правильно додають Vue.js до проєкту?"],
      [
        ["Scaffold a new project with `npm create vue@latest`", "Створити новий проєкт через `npm create vue@latest`"],
        ["Add it to an existing project with `npm install vue`", "Додати до наявного проєкту через `npm install vue`"],
        ["Include it from a CDN with a `<script>` tag on a page", "Підключити з CDN тегом `<script>` на сторінці"],
        ["Copy React and rename it", "Скопіювати React і перейменувати"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "bundlers",
      ["Why does Vite's dev server start faster than webpack's on a large app?", "Чому dev-сервер Vite на великому застосунку запускається швидше, ніж у webpack?"],
      [
        ["Vite skips the production build entirely", "Vite взагалі не робить продакшн-збирання"],
        ["Vite is a plugin that runs inside webpack", "Vite — це плагін, що працює всередині webpack"],
        [
          "Vite serves source files as native ES modules and transforms each one only when the browser requests it, so startup and hot reload don't grow with the app; webpack bundles the whole app before it can serve it. For production both produce an optimized bundle",
          "Vite віддає вихідні файли як нативні ES-модулі й перетворює кожен лише тоді, коли браузер його запитує, тож запуск і hot reload не сповільнюються з ростом застосунку; webpack спершу збирає весь застосунок у бандл і лише тоді може його віддати. Для продакшну обидва створюють оптимізований бандл",
        ],
        ["There is no difference in how they work", "Вони працюють однаково"],
      ],
      "c",
    ),
  ],
};
