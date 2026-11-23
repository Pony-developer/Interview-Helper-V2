import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 113–135 of the list: frameworks and libraries. */
export const frameworksQuiz: SlideDef = {
  kind: "quiz",
  slug: "frameworks-quiz",
  title: { en: "Frameworks and libraries", uk: "Фреймворки та бібліотеки" },
  questions: [
    question(
      "why-frameworks",
      ["Which of these are real pros and cons of frameworks?", "Які з цих тверджень — справжні переваги та недоліки фреймворків?"],
      [
        ["Pro: structure, reusable components and a ready ecosystem", "Перевага: структура, повторно використовувані компоненти й готова екосистема"],
        ["Con: bundle size, a learning curve and dependence on the framework's release cycle", "Недолік: розмір бандла, час на навчання й залежність від релізів фреймворку"],
        ["Pro: you no longer need to know JavaScript", "Перевага: більше не треба знати JavaScript"],
        ["Pro: a declarative UI that updates itself when the state changes", "Перевага: декларативний UI, що сам оновлюється, коли змінюється стан"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "choose-framework",
      ["What should drive the choice of a framework?", "Чим варто керуватися у виборі фреймворку?"],
      [
        ["How popular it is on social media this month", "Тим, наскільки він популярний у соцмережах цього місяця"],
        ["Always picking whatever was released most recently", "Завжди обирати те, що вийшло найпізніше"],
        [
          "The project's needs, the team's experience, the ecosystem and community, long-term support and performance",
          "Потребами проєкту, досвідом команди, екосистемою та спільнотою, довгостроковою підтримкою й продуктивністю",
        ],
        ["The size of its logo", "Розміром його логотипа"],
      ],
      "c",
    ),
    question(
      "components",
      ["What is the component-based approach?", "Що таке компонентно-орієнтований підхід?"],
      [
        ["Putting the whole app into one large file", "Розмістити весь застосунок в одному великому файлі"],
        [
          "Building the UI from independent, reusable pieces that each own their markup, logic and styles, and composing them into larger ones",
          "Будувати UI з незалежних, повторно використовуваних частин, кожна з яких має власну розмітку, логіку й стилі, і складати з них більші",
        ],
        ["Writing the UI in CSS only", "Писати UI лише на CSS"],
        ["Rendering everything only on the server", "Рендерити все лише на сервері"],
      ],
      "b",
    ),
    question(
      "state-management",
      ["What is the core problem of state management?", "У чому суть проблеми керування станом?"],
      [
        [
          "Keeping data shared by many components consistent: one source of truth, predictable updates and no props passed down through many levels (prop drilling)",
          "Тримати узгодженими дані, спільні для багатьох компонентів: одне джерело правди, передбачувані оновлення й жодного протягування пропсів через багато рівнів (prop drilling)",
        ],
        ["Saving CSS between page loads", "Зберігати CSS між завантаженнями сторінки"],
        ["Choosing variable names", "Вибирати назви змінних"],
        ["Compressing images", "Стискати зображення"],
      ],
      "a",
    ),
    question(
      "virtual-dom",
      ["What is the virtual DOM?", "Що таке віртуальний DOM?"],
      [
        ["A second browser running in the background", "Другий браузер, що працює у фоні"],
        ["A faster replacement for HTML", "Швидша заміна HTML"],
        ["Another name for the Shadow DOM", "Інша назва Shadow DOM"],
        [
          "A lightweight in-memory copy of the UI tree; the framework compares the new copy with the old one and applies only the differences to the real DOM",
          "Легка копія дерева UI в пам'яті; фреймворк порівнює нову копію зі старою й застосовує до справжнього DOM лише відмінності",
        ],
      ],
      "d",
    ),
    question(
      "lifecycle",
      [
        "What replaces `componentDidMount` and `componentWillUnmount` in a React function component?",
        "Що замінює `componentDidMount` і `componentWillUnmount` у функціональному компоненті React?",
      ],
      [
        ["`useMemo`", "`useMemo`"],
        ["`useRef`", "`useRef`"],
        ["`useEffect` with an empty dependency array that returns a cleanup function", "`useEffect` із порожнім масивом залежностей, що повертає функцію очищення"],
        ["`useState`", "`useState`"],
      ],
      "c",
    ),
    question(
      "framework-perf",
      ["Which techniques improve the performance of framework-based apps?", "Які прийоми покращують продуктивність застосунків на фреймворках?"],
      [
        ["Putting all state into one global object that every component subscribes to", "Покласти весь стан в один глобальний об'єкт, на який підписаний кожен компонент"],
        ["Code splitting and lazy loading of routes and heavy components", "Розбиття коду й ліниве завантаження маршрутів і важких компонентів"],
        ["Virtualizing long lists", "Віртуалізація довгих списків"],
        ["Avoiding unnecessary re-renders: memoization, stable props, correct keys", "Уникання зайвих перерендерів: мемоізація, стабільні пропси, правильні ключі"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "ssr",
      ["What is server-side rendering (SSR)?", "Що таке рендеринг на стороні сервера (SSR)?"],
      [
        ["Running CSS on the server", "Виконання CSS на сервері"],
        [
          "Rendering HTML on the server for each request, so users and search engines get content right away, and then the page hydrates in the browser; related options are static generation (SSG) and incremental regeneration (ISR)",
          "Рендеринг HTML на сервері під кожен запит, щоб користувачі й пошукові системи одразу отримали вміст, після чого сторінка гідратується в браузері; споріднені варіанти — статична генерація (SSG) та інкрементальна регенерація (ISR)",
        ],
        ["Rendering only in the browser after an empty HTML shell loads", "Рендеринг лише в браузері після завантаження порожньої HTML-оболонки"],
        ["Saving screenshots of pages on the server", "Збереження скриншотів сторінок на сервері"],
      ],
      "b",
    ),
    question(
      "api-in-frameworks",
      ["What is a common way to load data from an API in a React app?", "Як зазвичай завантажують дані з API в React-застосунку?"],
      [
        [
          "A data library such as TanStack Query or SWR (or `fetch` in a server component) that handles loading, errors, caching and refetching",
          "Бібліотека для даних, як-от TanStack Query чи SWR (або `fetch` у серверному компоненті), що бере на себе завантаження, помилки, кешування й повторні запити",
        ],
        ["A synchronous XMLHttpRequest right inside render", "Синхронний XMLHttpRequest прямо в render"],
        ["Reading the data from the address bar", "Читати дані з адресного рядка"],
        ["Connecting to the database directly from the browser", "Підключатися до бази даних напряму з браузера"],
      ],
      "a",
    ),
    question(
      "routing",
      ["What does a client-side router do?", "Що робить клієнтський роутер?"],
      [
        ["Routes network packets between servers", "Маршрутизує мережеві пакети між серверами"],
        ["Reloads the whole page on every click", "Перезавантажує всю сторінку на кожен клік"],
        [
          "Maps URLs to views and switches pages without a full reload, using the History API, with nested routes, parameters and data loading",
          "Зіставляє URL з поданнями й перемикає сторінки без повного перезавантаження через History API, з вкладеними маршрутами, параметрами та завантаженням даних",
        ],
        ["Works only on the server", "Працює лише на сервері"],
      ],
      "c",
    ),
    question(
      "angular-vs-react",
      ["What is the main difference between Angular and React?", "Яка головна відмінність між Angular і React?"],
      [
        ["React works only on mobile devices", "React працює лише на мобільних пристроях"],
        ["React is a full framework; Angular is a small UI library", "React — повноцінний фреймворк, а Angular — невелика UI-бібліотека"],
        ["There is no difference", "Різниці немає"],
        [
          "Angular is a full framework (TypeScript, DI, router, forms and HTTP out of the box); React is a UI library, and routing, data and forms come from its ecosystem",
          "Angular — повноцінний фреймворк (TypeScript, DI, роутер, форми й HTTP з коробки); React — UI-бібліотека, а маршрутизація, дані й форми беруться з її екосистеми",
        ],
      ],
      "d",
    ),
    question(
      "class-vs-function",
      ["When do you still need a class component in modern React?", "Коли в сучасному React досі потрібен класовий компонент?"],
      [
        ["For every component that has state", "Для кожного компонента зі станом"],
        [
          "For error boundaries (`componentDidCatch` / `getDerivedStateFromError`); otherwise function components with hooks are the norm",
          "Для error boundaries (`componentDidCatch` / `getDerivedStateFromError`); в інших випадках нормою є функціональні компоненти з хуками",
        ],
        ["For every component that receives props", "Для кожного компонента, що отримує пропси"],
        ["For components that render lists", "Для компонентів, що рендерять списки"],
      ],
      "b",
    ),
    question(
      "react-perf",
      ["Which of these help avoid unnecessary re-renders in React?", "Що з цього допомагає уникнути зайвих перерендерів у React?"],
      [
        ["`React.memo` for components that get the same props", "`React.memo` для компонентів, що отримують ті самі пропси"],
        ["`useMemo` and `useCallback` for stable values and callbacks", "`useMemo` і `useCallback` для стабільних значень і колбеків"],
        ["Using the array index as `key` in a list that gets reordered", "Використовувати індекс масиву як `key` у списку, який пересортовують"],
        ["Keeping state as close as possible to where it is used", "Тримати стан якомога ближче до місця, де його використовують"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "react-state",
      [
        "When does a global store (Redux Toolkit, Zustand) make sense instead of local state?",
        "Коли глобальне сховище (Redux Toolkit, Zustand) доречніше за локальний стан?",
      ],
      [
        ["Always, for every value in the app", "Завжди, для кожного значення в застосунку"],
        ["Never", "Ніколи"],
        [
          "When many distant components read and update the same data, and lifting state up or Context becomes unwieldy",
          "Коли багато віддалених компонентів читають і змінюють ті самі дані, а підняття стану чи Context стають громіздкими",
        ],
        ["Only for the values of form inputs", "Лише для значень полів форми"],
      ],
      "c",
    ),
    question(
      "react-forms",
      ["What is the difference between controlled and uncontrolled inputs in React?", "Яка різниця між контрольованими й неконтрольованими полями в React?"],
      [
        ["Uncontrolled inputs cannot be submitted", "Неконтрольовані поля не можна надіслати"],
        ["There is no difference", "Різниці немає"],
        ["It is the other way around: controlled inputs keep the value in the DOM", "Навпаки: контрольовані поля тримають значення в DOM"],
        [
          "A controlled input gets its `value` from state and reports changes through `onChange`; an uncontrolled one keeps its value in the DOM and is read through a ref (React Hook Form builds on this)",
          "Контрольоване поле бере `value` зі стану й повідомляє про зміни через `onChange`; неконтрольоване тримає значення в DOM, і його читають через ref (на цьому побудований React Hook Form)",
        ],
      ],
      "d",
    ),
    question(
      "first-render",
      ["How do you run code only after the first render of a component?", "Як виконати код лише після першого рендеру компонента?"],
      [
        ["`useEffect(() => { … })` with no dependency array", "`useEffect(() => { … })` без масиву залежностей"],
        ["`useEffect(() => { … }, [])`", "`useEffect(() => { … }, [])`"],
        ["Call it directly in the component body", "Викликати його прямо в тілі компонента"],
        ["`useState(doSomething())`", "`useState(doSomething())`"],
      ],
      "b",
    ),
    question(
      "react-events",
      ["What is true about event handling in React?", "Що правильно про обробку подій у React?"],
      [
        [
          "Handlers are passed as functions in camelCase props, like `onClick={handleClick}`, and receive a synthetic event with the same interface as the native one",
          "Обробники передають як функції в camelCase-пропсах, як-от `onClick={handleClick}`, і вони отримують синтетичну подію з тим самим інтерфейсом, що й нативна",
        ],
        ["Handlers are strings, like `onclick=\"handleClick()\"`", "Обробники — це рядки, як-от `onclick=\"handleClick()\"`"],
        ["You must call `addEventListener` on every element yourself", "Треба самому викликати `addEventListener` на кожному елементі"],
        ["React has no event handling", "У React немає обробки подій"],
      ],
      "a",
    ),
    question(
      "hooks",
      ["Which of these are built-in React hooks?", "Які з цих хуків вбудовані в React?"],
      [
        ["`useState`", "`useState`"],
        ["`useFetch`", "`useFetch`"],
        ["`useEffect`", "`useEffect`"],
        ["`useRef`", "`useRef`"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "hook-rules",
      ["What conditions must a function meet to be a hook?", "Яким умовам має відповідати функція, щоб бути хуком?"],
      [
        ["It must return JSX", "Вона має повертати JSX"],
        ["It must be `async`", "Вона має бути `async`"],
        [
          "Its name starts with `use`, and it is called only at the top level of a component or another hook, never inside conditions, loops or callbacks",
          "Її назва починається з `use`, і її викликають лише на верхньому рівні компонента чи іншого хука, ніколи в умовах, циклах чи колбеках",
        ],
        ["It must be a method of a class", "Вона має бути методом класу"],
      ],
      "c",
    ),
    question(
      "nextjs-ssr",
      ["How does a page get rendered on the server in the Next.js App Router?", "Як сторінка рендериться на сервері в Next.js App Router?"],
      [
        ["Only through `getInitialProps` in every component", "Лише через `getInitialProps` у кожному компоненті"],
        ["Next.js cannot render on the server", "Next.js не вміє рендерити на сервері"],
        ["By adding `'use client'` at the top of the file", "Додавши `'use client'` на початку файлу"],
        [
          "Pages and layouts are Server Components by default: they render on the server and can load data directly with `async`/`await`; `'use client'` marks only the parts that need interactivity in the browser",
          "Сторінки й layout-и за замовчуванням є Server Components: вони рендеряться на сервері й можуть завантажувати дані напряму через `async`/`await`; `'use client'` позначає лише ті частини, яким потрібна інтерактивність у браузері",
        ],
      ],
      "d",
    ),
    question(
      "vue-components",
      ["What is a component in Vue.js?", "Що таке компонент у Vue.js?"],
      [
        ["A Vue plugin installed with npm", "Плагін Vue, встановлений через npm"],
        [
          "A reusable unit with its own template, logic and styles, often written as a single-file component (`.vue`) with `<template>`, `<script>` and `<style>`",
          "Повторно використовувана частина з власним шаблоном, логікою й стилями, яку часто пишуть як однофайловий компонент (`.vue`) з `<template>`, `<script>` і `<style>`",
        ],
        ["A separate CSS file", "Окремий CSS-файл"],
        ["A route in the router", "Маршрут у роутері"],
      ],
      "b",
    ),
    question(
      "ngif",
      ["How does `*ngIf` work in Angular?", "Як працює `*ngIf` в Angular?"],
      [
        ["It hides the element with `display: none`", "Ховає елемент через `display: none`"],
        ["It evaluates the condition only once, at startup", "Обчислює умову лише раз, під час запуску"],
        ["It is a CSS selector", "Це CSS-селектор"],
        [
          "It adds the element to the DOM or removes it from the DOM depending on the condition, destroying the components inside; newer Angular's `@if` block does the same",
          "Додає елемент у DOM або прибирає його з DOM залежно від умови, знищуючи компоненти всередині; блок `@if` у новіших версіях Angular робить те саме",
        ],
      ],
      "d",
    ),
    question(
      "constant-coefficient",
      [
        "A component needs a coefficient that depends only on a few constants in the project. Where is the best place to compute it?",
        "Компоненту потрібен коефіцієнт, що залежить лише від кількох констант у проєкті. Де найкраще його порахувати?",
      ],
      [
        ["Inside the component, on every render", "Усередині компонента, на кожному рендері"],
        ["In a `useEffect` that saves it to state", "У `useEffect`, який зберігає його в стан"],
        [
          "Once, at module level, outside the component (next to the constants or in a config file)",
          "Один раз, на рівні модуля, поза компонентом (поряд із константами чи в конфігураційному файлі)",
        ],
        ["On the server, on every request", "На сервері, на кожен запит"],
      ],
      "c",
    ),
  ],
};
