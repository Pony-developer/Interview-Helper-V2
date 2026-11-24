import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–12 of the Vue list: basics. */
export const vueBasicsQuiz: SlideDef = {
  kind: "quiz",
  slug: "vue-basics-quiz",
  title: { en: "Basics", uk: "Основи" },
  questions: [
    question(
      "v-model",
      ["Which statements about binding in Vue 3 are true?", "Які твердження про зв'язування у Vue 3 правильні?"],
      [
        ["`:value=\"name\"` (`v-bind`) is one-way: data flows from the state to the element", "`:value=\"name\"` (`v-bind`) — одностороннє: дані йдуть від стану до елемента"],
        ["On an `<input>`, `v-model=\"name\"` is shorthand for `:value` plus an `@input` handler that updates `name`", "На `<input>` `v-model=\"name\"` — це скорочення для `:value` разом з обробником `@input`, що оновлює `name`"],
        ["On a component, `v-model` passes a `modelValue` prop and listens for `update:modelValue` (`defineModel()` simplifies this)", "На компоненті `v-model` передає prop `modelValue` і слухає подію `update:modelValue` (`defineModel()` це спрощує)"],
        ["`v-model` lets a child change its props directly", "`v-model` дає дочірньому компоненту напряму змінювати свої props"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "filters",
      ["What replaces Vue 2 filters such as `{{ price | currency }}` in Vue 3?", "Що замінює фільтри Vue 2 на кшталт `{{ price | currency }}` у Vue 3?"],
      [
        ["Filters still work the same way", "Фільтри працюють так само"],
        ["Directives such as `v-filter`", "Директиви на кшталт `v-filter`"],
        [
          "Filters were removed; you call a method or function, `{{ formatCurrency(price) }}`, or use a computed property",
          "Фільтри прибрали; натомість викликають метод чи функцію, `{{ formatCurrency(price) }}`, або використовують обчислювану властивість",
        ],
        ["Pipes, as in Angular", "Pipes, як в Angular"],
      ],
      "c",
    ),
    question(
      "next-tick",
      ["Why use `await nextTick()` after changing reactive state?", "Навіщо `await nextTick()` після зміни реактивного стану?"],
      [
        [
          "Vue batches state changes and updates the DOM asynchronously, so code that needs the updated DOM (measuring, focusing a newly shown input) has to wait for the next update",
          "Vue групує зміни стану й оновлює DOM асинхронно, тож код, якому потрібен оновлений DOM (вимірювання, фокус на щойно показаному полі), має дочекатися наступного оновлення",
        ],
        ["It delays the next API request", "Він відкладає наступний запит до API"],
        ["It re-renders the whole app", "Він перерендерює весь застосунок"],
        ["It moves to the next route", "Він переходить на наступний маршрут"],
      ],
      "a",
    ),
    question(
      "error-handling",
      ["Which tools does Vue 3 give you for handling errors?", "Які інструменти Vue 3 дає для обробки помилок?"],
      [
        ["`app.config.errorHandler` for errors anywhere in the app, for example to report them to monitoring", "`app.config.errorHandler` для помилок будь-де в застосунку, наприклад щоб надсилати їх у моніторинг"],
        ["`onErrorCaptured` in a component, which catches errors from its descendants and can stop them from going further", "`onErrorCaptured` у компоненті, що ловить помилки нащадків і може зупинити їхнє подальше поширення"],
        ["`try/catch` around awaited calls such as API requests", "`try/catch` навколо викликів з `await`, як-от запитів до API"],
        ["Vue ignores all errors automatically", "Vue автоматично ігнорує всі помилки"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "emits",
      ["How does a child component notify its parent in Vue 3?", "Як дочірній компонент повідомляє батьківський у Vue 3?"],
      [
        ["By changing the parent's data through a prop", "Змінюючи дані батька через prop"],
        [
          "It declares and emits an event, `const emit = defineEmits(['save'])` and `emit('save', payload)`, and the parent listens with `@save`; `$on`, `$off` and `$once` were removed, so a global event bus needs a library like mitt",
          "Він оголошує й надсилає подію, `const emit = defineEmits(['save'])` і `emit('save', payload)`, а батько слухає через `@save`; `$on`, `$off` і `$once` прибрали, тож глобальна шина подій потребує бібліотеки на кшталт mitt",
        ],
        ["With `this.$on('save')` in the child", "Через `this.$on('save')` у дочірньому компоненті"],
        ["Children can't communicate with parents", "Дочірні компоненти не можуть спілкуватися з батьківськими"],
      ],
      "b",
    ),
    question(
      "v-show-v-if",
      ["How does `v-show` differ from `v-if`?", "Чим `v-show` відрізняється від `v-if`?"],
      [
        ["They are identical", "Вони однакові"],
        ["`v-show` removes the element from the DOM", "`v-show` прибирає елемент із DOM"],
        ["`v-if` only toggles the CSS `display`", "`v-if` лише перемикає CSS `display`"],
        [
          "`v-show` always renders the element and toggles `display: none`, which is cheap for frequent toggling; `v-if` creates or destroys the element and its components, which is cheaper when the condition rarely changes",
          "`v-show` завжди рендерить елемент і перемикає `display: none`, що дешево для частих перемикань; `v-if` створює чи знищує елемент і його компоненти, що дешевше, коли умова змінюється рідко",
        ],
      ],
      "d",
    ),
    question(
      "registration",
      ["How does local component registration differ from global?", "Чим локальна реєстрація компонента відрізняється від глобальної?"],
      [
        [
          "A global component, registered with `app.component()`, is available in every template but can't be tree-shaken; a local one is imported where it's used (in `<script setup>`, importing is enough), which keeps dependencies explicit",
          "Глобальний компонент, зареєстрований через `app.component()`, доступний у кожному шаблоні, але не видаляється tree shaking; локальний імпортують там, де він потрібен (у `<script setup>` достатньо імпорту), і залежності лишаються явними",
        ],
        ["Local components can be used everywhere", "Локальні компоненти можна використовувати всюди"],
        ["Global components are faster", "Глобальні компоненти швидші"],
        ["There is no difference", "Різниці немає"],
      ],
      "a",
    ),
    question(
      "data-function",
      ["Why is `data` a function that returns an object in an Options API component?", "Чому в компоненті з Options API `data` — це функція, що повертає об'єкт?"],
      [
        ["Because objects aren't reactive", "Бо об'єкти не реактивні"],
        ["For better performance", "Заради кращої продуктивності"],
        [
          "So that each instance of the component gets its own fresh copy of the state; a plain object would be shared by every instance",
          "Щоб кожен екземпляр компонента отримував власну нову копію стану; звичайний об'єкт був би спільним для всіх екземплярів",
        ],
        ["Because Vue can't read object literals", "Бо Vue не вміє читати об'єктні літерали"],
      ],
      "c",
    ),
    question(
      "provide-inject",
      ["When are `provide` and `inject` the right tool?", "Коли доречні `provide` та `inject`?"],
      [
        ["To pass data from a child to its parent", "Щоб передати дані від дочірнього компонента до батьківського"],
        ["To replace all props", "Щоб замінити всі props"],
        ["To share state between unrelated tabs", "Щоб ділитися станом між не пов'язаними вкладками"],
        [
          "When an ancestor needs to give a value (a theme, a form context) to deep descendants without passing props through every level; providing a `ref` keeps it reactive, and app-wide state still fits better in Pinia",
          "Коли предок має передати значення (тему, контекст форми) глибоким нащадкам, не протягуючи props через кожен рівень; якщо передати `ref`, значення лишається реактивним, а стан усього застосунку все одно краще тримати в Pinia",
        ],
      ],
      "d",
    ),
    question(
      "slots",
      ["Which statements about slots are true?", "Які твердження про слоти правильні?"],
      [
        ["A default `<slot />` shows whatever content the parent puts between the component's tags", "Стандартний `<slot />` показує вміст, який батько поклав між тегами компонента"],
        ["Named slots (`<slot name=\"header\" />`, filled with `<template #header>`) place content in specific spots", "Іменовані слоти (`<slot name=\"header\" />`, які заповнюють через `<template #header>`) розміщують вміст у конкретних місцях"],
        ["A scoped slot passes data from the child to the parent's slot content, as in `<template #item=\"{ item }\">`", "Scoped-слот передає дані від дочірнього компонента у вміст слота батька, як-от `<template #item=\"{ item }\">`"],
        ["Slots can only contain plain text", "Слоти можуть містити лише простий текст"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "directives",
      ["Which statement about Vue's built-in directives is true?", "Яке твердження про вбудовані директиви Vue правильне?"],
      [
        [
          "`v-html` inserts raw HTML, so putting user content into it opens the door to XSS; `v-once` renders once and skips updates, `v-pre` skips compiling, and `v-memo` re-renders only when listed values change",
          "`v-html` вставляє сирий HTML, тож користувацький вміст у ньому відкриває шлях до XSS; `v-once` рендерить один раз і пропускає оновлення, `v-pre` пропускає компіляцію, а `v-memo` перерендерює лише тоді, коли змінюються перелічені значення",
        ],
        ["`v-html` escapes HTML automatically", "`v-html` автоматично екранує HTML"],
        ["`v-text` renders HTML tags", "`v-text` рендерить HTML-теги"],
        ["Directives must be imported before use", "Директиви треба імпортувати перед використанням"],
      ],
      "a",
    ),
    question(
      "ssr-nuxt",
      ["What is Nuxt?", "Що таке Nuxt?"],
      [
        ["A state management library for Vue", "Бібліотека керування станом для Vue"],
        [
          "A meta-framework on top of Vue with file-based routing, server-side rendering and static generation; the server sends rendered HTML, and Vue then hydrates it in the browser to make it interactive",
          "Мета-фреймворк поверх Vue з файловою маршрутизацією, рендерингом на сервері та статичною генерацією; сервер надсилає відрендерений HTML, а Vue потім гідратує його в браузері, щоб зробити інтерактивним",
        ],
        ["A Vue testing tool", "Інструмент тестування Vue"],
        ["The old name of Vue 2", "Стара назва Vue 2"],
      ],
      "b",
    ),
  ],
};

/** Questions 13–24 of the Vue list: in depth. */
export const vueAdvancedQuiz: SlideDef = {
  kind: "quiz",
  slug: "vue-advanced-quiz",
  title: { en: "In depth", uk: "Глибше" },
  questions: [
    question(
      "class-style",
      ["What does `<div class=\"card\" :class=\"{ active: isActive, 'has-error': hasError }\">` render when only `isActive` is true?", "Що рендерить `<div class=\"card\" :class=\"{ active: isActive, 'has-error': hasError }\">`, коли істинне лише `isActive`?"],
      [
        ["`class=\"active\"`: the bound class replaces the static one", "`class=\"active\"`: прив'язаний клас замінює статичний"],
        ["`class=\"card active has-error\"`", "`class=\"card active has-error\"`"],
        ["`class=\"card active\"`: the static and bound classes are merged; `:style` takes an object too, such as `{ color: textColor, fontSize: size + 'px' }`", "`class=\"card active\"`: статичний і прив'язаний класи об'єднуються; `:style` теж приймає об'єкт, як-от `{ color: textColor, fontSize: size + 'px' }`"],
        ["A syntax error", "Синтаксична помилка"],
      ],
      "c",
    ),
    question(
      "performance",
      ["Which techniques improve the performance of a Vue app?", "Які прийоми покращують продуктивність Vue-застосунку?"],
      [
        ["Computed properties, which cache their result until dependencies change, instead of methods in templates", "Обчислювані властивості, що кешують результат до зміни залежностей, замість методів у шаблонах"],
        ["Lazy-loaded routes and `defineAsyncComponent`", "Ліниві маршрути та `defineAsyncComponent`"],
        ["`<KeepAlive>` for cached tabs, and `shallowRef` for large data that doesn't need deep reactivity", "`<KeepAlive>` для кешованих вкладок і `shallowRef` для великих даних, яким не потрібна глибока реактивність"],
        ["Making every value deeply reactive, just in case", "Робити кожне значення глибоко реактивним про всяк випадок"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "options-composition",
      ["How does the Options API differ from the Composition API?", "Чим Options API відрізняється від Composition API?"],
      [
        ["The Composition API was removed in Vue 3.4", "Composition API прибрали у Vue 3.4"],
        ["The Options API works only in Vue 2", "Options API працює лише у Vue 2"],
        ["They can't be used in the same project", "Їх не можна використовувати в одному проєкті"],
        [
          "The Options API groups code by option type (`data`, `methods`, `computed`); the Composition API (`setup()` or `<script setup>`) groups it by feature with `ref`, `computed` and composables, with better TypeScript support; both are supported, while class-based components are no longer recommended",
          "Options API групує код за типом опції (`data`, `methods`, `computed`); Composition API (`setup()` чи `<script setup>`) групує його за функціональністю через `ref`, `computed` і composables, з кращою підтримкою TypeScript; підтримуються обидва, а класові компоненти більше не рекомендують",
        ],
      ],
      "d",
    ),
    question(
      "composables",
      ["What is the recommended way to reuse stateful logic in Vue 3?", "Який рекомендований спосіб повторно використовувати логіку зі станом у Vue 3?"],
      [
        [
          "Composables: functions like `useMouse()` that use `ref`, `computed` and lifecycle hooks and return reactive state; mixins are discouraged because their properties come from unclear sources and can clash",
          "Composables: функції на кшталт `useMouse()`, що використовують `ref`, `computed` і хуки життєвого циклу та повертають реактивний стан; міксини не радять, бо їхні властивості беруться з неочевидних джерел і можуть конфліктувати",
        ],
        ["Mixins, because they never conflict", "Міксини, бо вони ніколи не конфліктують"],
        ["Higher-order components, as the main Vue pattern", "Компоненти вищого порядку як основний патерн Vue"],
        ["Copying the logic into each component", "Копіювати логіку в кожен компонент"],
      ],
      "a",
    ),
    question(
      "naming",
      ["Which statements match Vue's style guide for component names?", "Які твердження відповідають стилю Vue для назв компонентів?"],
      [
        ["Use multi-word names such as `TodoItem`, so they never clash with HTML elements", "Використовувати назви з кількох слів, як-от `TodoItem`, щоб вони не конфліктували з HTML-елементами"],
        ["Use PascalCase for single-file component names, such as `UserProfile.vue`", "Писати назви однофайлових компонентів у PascalCase, як-от `UserProfile.vue`"],
        ["Prefix base components with something like `Base`, such as `BaseButton`", "Додавати префікс базовим компонентам, наприклад `Base`, як-от `BaseButton`"],
        ["Name components with single letters to keep templates short", "Називати компоненти однією літерою, щоб шаблони були коротшими"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "render-functions",
      ["What is a render function in Vue?", "Що таке render-функція у Vue?"],
      [
        ["A function that renders the app on the server only", "Функція, що рендерить застосунок лише на сервері"],
        [
          "A function that returns virtual DOM nodes created with `h()`, such as `h('div', { class: 'box' }, children)`; templates are compiled into render functions, and writing them by hand (or with JSX) helps with highly dynamic output",
          "Функція, що повертає віртуальні DOM-вузли, створені через `h()`, як-от `h('div', { class: 'box' }, children)`; шаблони компілюються в render-функції, а писати їх вручну (чи з JSX) зручно для дуже динамічного виводу",
        ],
        ["A lifecycle hook", "Хук життєвого циклу"],
        ["A CSS feature", "Можливість CSS"],
      ],
      "b",
    ),
    question(
      "array-reactivity",
      ["In Vue 3, does `items.value[0] = 'x'` on a `ref` array update the view?", "Чи оновить подання `items.value[0] = 'x'` для масиву в `ref` у Vue 3?"],
      [
        ["No, you must use `Vue.set`", "Ні, треба використовувати `Vue.set`"],
        ["No, only `push` and `splice` are tracked", "Ні, відстежуються лише `push` і `splice`"],
        [
          "Yes: Vue 3 reactivity uses Proxies, which track index assignment and `length` changes as well as mutation methods like `push`, `splice` and `sort`; Vue 2 couldn't detect index assignment and needed `Vue.set` or `splice`",
          "Так: реактивність Vue 3 побудована на Proxy, які відстежують присвоєння за індексом і зміну `length`, а також методи на кшталт `push`, `splice` і `sort`; Vue 2 не помічав присвоєння за індексом і потребував `Vue.set` чи `splice`",
        ],
        ["Only if the array is frozen", "Лише якщо масив заморожено"],
      ],
      "c",
    ),
    question(
      "navigation-guards",
      ["Which statements about Vue Router navigation guards are true?", "Які твердження про navigation guards у Vue Router правильні?"],
      [
        ["`router.beforeEach((to, from) => ...)` runs before every navigation and can return `false` to cancel or a route to redirect, for example to `/login`", "`router.beforeEach((to, from) => ...)` виконується перед кожним переходом і може повернути `false`, щоб скасувати, чи маршрут, щоб перенаправити, наприклад на `/login`"],
        ["A route can have its own `beforeEnter` guard", "Маршрут може мати власний guard `beforeEnter`"],
        ["`onBeforeRouteLeave` in a component can ask the user to confirm leaving with unsaved changes", "`onBeforeRouteLeave` у компоненті може попросити підтвердити вихід, якщо є незбережені зміни"],
        ["Guards replace authorization checks on the server", "Guards замінюють перевірки доступу на сервері"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "v-if-v-for",
      ["What happens with `<li v-for=\"user in users\" v-if=\"user.active\" :key=\"user.id\">` in Vue 3?", "Що відбувається з `<li v-for=\"user in users\" v-if=\"user.active\" :key=\"user.id\">` у Vue 3?"],
      [
        ["It renders only active users, as intended", "Він рендерить лише активних користувачів, як задумано"],
        ["It renders all users and ignores `v-if`", "Він рендерить усіх користувачів та ігнорує `v-if`"],
        ["`key` is evaluated before `v-for`", "`key` обчислюється раніше за `v-for`"],
        [
          "It fails: in Vue 3 `v-if` runs before `v-for`, so `user` isn't defined yet (Vue 2 had the opposite order); filter in a computed property, or put `v-for` on a `<template>`, and keep a stable unique `key`",
          "Він не працює: у Vue 3 `v-if` виконується раніше за `v-for`, тож `user` ще не визначено (у Vue 2 порядок був протилежний); фільтруйте в обчислюваній властивості або винесіть `v-for` на `<template>`, зберігаючи стабільний унікальний `key`",
        ],
      ],
      "d",
    ),
    question(
      "parent",
      ["Why should you avoid `this.$parent` in child components?", "Чому варто уникати `this.$parent` у дочірніх компонентах?"],
      [
        [
          "It ties the child to one particular parent and lets it change the parent's state behind its back, which makes data flow hard to follow; use props, emitted events or `provide`/`inject` instead",
          "Він прив'язує дочірній компонент до конкретного батька й дає змінювати стан батька непомітно, через що потік даних важко відстежити; натомість використовуйте props, події чи `provide`/`inject`",
        ],
        ["It was removed in Vue 3", "Його прибрали у Vue 3"],
        ["It makes the app slower", "Він сповільнює застосунок"],
        ["It only works in production", "Він працює лише в продакшні"],
      ],
      "a",
    ),
    question(
      "event-modifiers",
      ["Which pairings of event modifier and effect are correct?", "Які поєднання модифікатора події та ефекту правильні?"],
      [
        ["`@submit.prevent` calls `preventDefault()`, so the form doesn't reload the page", "`@submit.prevent` викликає `preventDefault()`, тож форма не перезавантажує сторінку"],
        ["`@click.stop` stops the event from bubbling", "`@click.stop` зупиняє спливання події"],
        ["`@click.once` runs the handler only the first time; `@keyup.enter` runs only for the Enter key", "`@click.once` запускає обробник лише першого разу; `@keyup.enter` спрацьовує лише на клавішу Enter"],
        ["`@click.async` runs the handler in a Web Worker", "`@click.async` запускає обробник у Web Worker"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "testing",
      ["Which tools are the usual choice for testing a Vue 3 app?", "Які інструменти зазвичай обирають для тестування застосунку на Vue 3?"],
      [
        ["Only manual testing in the browser", "Лише ручне тестування в браузері"],
        ["Karma and Protractor", "Karma і Protractor"],
        [
          "Vitest with Vue Test Utils (`mount`, `trigger`, `emitted`) or Vue Testing Library for components, and Playwright or Cypress for end-to-end tests",
          "Vitest разом із Vue Test Utils (`mount`, `trigger`, `emitted`) чи Vue Testing Library для компонентів, а також Playwright чи Cypress для end-to-end тестів",
        ],
        ["Vue apps can't be tested automatically", "Vue-застосунки неможливо тестувати автоматично"],
      ],
      "c",
    ),
  ],
};

/** Vue.js questions, with answers for Vue 3 and notes on Vue 2. */
export const vueModule: ModuleDef = {
  slug: "vue-interview-questions",
  title: { en: "Vue.js questions", uk: "Питання з Vue.js" },
  slides: [
    { kind: "lecture", slug: "vue-questions", title: { en: "Questions", uk: "Питання" } },
    vueBasicsQuiz,
    vueAdvancedQuiz,
  ],
};
