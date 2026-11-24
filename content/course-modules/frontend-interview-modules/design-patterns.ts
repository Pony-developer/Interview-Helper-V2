import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–8 of the design patterns list: creational and structural patterns. */
export const patternsStructuralQuiz: SlideDef = {
  kind: "quiz",
  slug: "patterns-structural-quiz",
  title: { en: "Creational and structural", uk: "Породжувальні та структурні" },
  questions: [
    question(
      "singleton",
      ["What is the usual way to get a Singleton in a modern JavaScript or React app, and what is its main risk?", "Як зазвичай отримують Singleton у сучасному JavaScript- чи React-застосунку і який його головний ризик?"],
      [
        ["Put it in React state so every component gets its own copy", "Покласти його в стан React, щоб кожен компонент мав власну копію"],
        ["Singletons are impossible in JavaScript", "Singleton у JavaScript неможливий"],
        ["Create a new instance inside each component render", "Створювати новий екземпляр під час кожного рендеру компонента"],
        [
          "Export one instance from an ES module (`export const logger = new Logger()`): modules are evaluated once, so every import gets the same object; good for config, logging or an API client outside the component tree. The risk is hidden global state: it leaks between tests and, on the server, between users' requests",
          "Експортувати один екземпляр з ES-модуля (`export const logger = new Logger()`): модуль виконується один раз, тож кожен імпорт отримує той самий об'єкт; годиться для конфігурації, логування чи API-клієнта поза деревом компонентів. Ризик — прихований глобальний стан: він «протікає» між тестами, а на сервері — між запитами різних користувачів",
        ],
      ],
      "d",
    ),
    question(
      "factory",
      ["A form is built from JSON config like `{ type: 'select', … }`. How does the Factory pattern help?", "Форма будується з JSON-конфігурації на кшталт `{ type: 'select', … }`. Як тут допомагає патерн Factory?"],
      [
        [
          "A function or a map such as `{ text: TextInput, select: SelectInput }` picks which component to create from the type, with a fallback for unknown types, so the caller doesn't need to know the concrete classes and new types are added in one place",
          "Функція чи мапа на кшталт `{ text: TextInput, select: SelectInput }` вибирає, який компонент створити за типом, із запасним варіантом для невідомих типів, тож код, що її викликає, не знає конкретних класів, а нові типи додаються в одному місці",
        ],
        ["It guarantees there is only one input on the page", "Він гарантує, що на сторінці буде лише одне поле"],
        ["It caches the form between renders", "Він кешує форму між рендерами"],
        ["It notifies all fields when one changes", "Він сповіщає всі поля, коли змінюється одне"],
      ],
      "a",
    ),
    question(
      "builder",
      ["When does the Builder pattern fit?", "Коли доречний патерн Builder?"],
      [
        ["When an object must have exactly one instance", "Коли об'єкт мусить мати рівно один екземпляр"],
        [
          "When an object has many optional parts: it is assembled step by step with chained calls such as `new QueryBuilder().where(…).orderBy(…).limit(10).build()`; in React, plain props objects or composition usually make it unnecessary for components, but it is handy for queries, requests and test data",
          "Коли об'єкт має багато необов'язкових частин: його складають крок за кроком ланцюжком викликів, як-от `new QueryBuilder().where(…).orderBy(…).limit(10).build()`; у React для компонентів зазвичай вистачає звичайних пропсів чи композиції, але для запитів і тестових даних він зручний",
        ],
        ["When two incompatible interfaces must work together", "Коли треба поєднати два несумісні інтерфейси"],
        ["When a request should pass through a chain of handlers", "Коли запит має пройти ланцюжком обробників"],
      ],
      "b",
    ),
    question(
      "decorator",
      ["`const withLogger = (Component) => (props) => { log(props); return <Component {...props} />; }` is an example of which pattern?", "`const withLogger = (Component) => (props) => { log(props); return <Component {...props} />; }` — приклад якого патерну?"],
      [
        ["Factory: it chooses between components", "Factory: вибирає між компонентами"],
        ["Singleton: it keeps one component", "Singleton: тримає один компонент"],
        [
          "Decorator: it wraps an object to add behavior without changing the original, which suits cross-cutting concerns like logging, auth checks or metrics",
          "Decorator: обгортає об'єкт, щоб додати поведінку, не змінюючи оригіналу, що пасує для наскрізних задач на кшталт логування, перевірки доступу чи метрик",
        ],
        ["Mediator: it coordinates several components", "Mediator: координує кілька компонентів"],
      ],
      "c",
    ),
    question(
      "composite",
      ["How does the Composite pattern show up in a React tree view?", "Як патерн Composite проявляється в React-компоненті дерева?"],
      [
        ["Each level of the tree is a separate, unrelated component", "Кожен рівень дерева — окремий, не пов'язаний компонент"],
        ["The tree is stored in a singleton", "Дерево зберігається в singleton"],
        ["The tree view fetches each node from the server", "Дерево завантажує кожен вузол із сервера"],
        [
          "A single `TreeNode` renders its label and then, recursively, a `TreeNode` for each child (with a `key`), so leaves and branches are handled the same way at any depth",
          "Один `TreeNode` рендерить свою мітку, а потім рекурсивно `TreeNode` для кожної дитини (з `key`), тож листки й гілки обробляються однаково на будь-якій глибині",
        ],
      ],
      "d",
    ),
    question(
      "facade",
      ["What does a Facade give a React app?", "Що дає React-застосунку патерн Facade?"],
      [
        [
          "One simple interface over a complex subsystem, such as `api.getUser()` hiding fetch, auth headers, retries and error mapping, so components stay simple and the details can change in one place",
          "Один простий інтерфейс над складною підсистемою, як-от `api.getUser()`, що ховає fetch, заголовки автентифікації, повтори й обробку помилок, тож компоненти лишаються простими, а деталі змінюються в одному місці",
        ],
        ["A way to make a value immutable", "Спосіб зробити значення незмінним"],
        ["A visual skin for components", "Візуальну «обгортку» для компонентів"],
        ["A copy of an object with a new prototype", "Копію об'єкта з новим прототипом"],
      ],
      "a",
    ),
    question(
      "proxy",
      ["Which statements about the Proxy pattern in JavaScript are true?", "Які твердження про патерн Proxy в JavaScript правильні?"],
      [
        ["It stands in for an object and controls access to it: caching, validation, logging or lazy loading", "Він замінює об'єкт і контролює доступ до нього: кешування, валідація, логування чи ліниве завантаження"],
        ["The built-in `Proxy` with traps like `get`, `set` and `apply` implements it, and Vue 3 builds its reactivity on it", "Вбудований `Proxy` з пастками на кшталт `get`, `set` і `apply` реалізує його, а Vue 3 будує на ньому свою реактивність"],
        ["A proxy must change the interface of the object it wraps", "Proxy мусить змінювати інтерфейс об'єкта, який обгортає"],
        ["A caching wrapper around `fetch` with the same signature is a proxy", "Обгортка з кешуванням навколо `fetch` з тією самою сигнатурою — це proxy"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "module-pattern",
      ["What is the Module pattern, and how is it done today?", "Що таке патерн Module і як його реалізують сьогодні?"],
      [
        ["Putting all code into one file", "Розміщення всього коду в одному файлі"],
        ["A pattern for creating many instances of a class", "Патерн для створення багатьох екземплярів класу"],
        [
          "Keeping private state and exposing only a public API; it used to be done with an IIFE and a closure, and now an ES module does it: unexported variables like `let count = 0` stay private, and only exported functions can change them",
          "Приховування приватного стану з відкриттям лише публічного API; раніше це робили через IIFE і замикання, а тепер це робить ES-модуль: неекспортовані змінні, як-от `let count = 0`, лишаються приватними, і змінити їх можуть лише експортовані функції",
        ],
        ["Splitting CSS into separate files", "Поділ CSS на окремі файли"],
      ],
      "c",
    ),
  ],
};

/** Questions 9–16 of the design patterns list: behavioral patterns and React patterns. */
export const patternsBehavioralQuiz: SlideDef = {
  kind: "quiz",
  slug: "patterns-behavioral-quiz",
  title: { en: "Behavioral and React patterns", uk: "Поведінкові та React-патерни" },
  questions: [
    question(
      "strategy",
      ["A table can be sorted by name, date or price, chosen by the user. Which pattern fits?", "Таблицю можна сортувати за назвою, датою чи ціною на вибір користувача. Який патерн підходить?"],
      [
        ["Singleton", "Singleton (одинак)"],
        [
          "Strategy: interchangeable algorithms behind one interface, such as `const sorters = { name: byName, date: byDate, price: byPrice }`, picked at runtime instead of a growing `if`/`switch`",
          "Strategy (стратегія): взаємозамінні алгоритми за одним інтерфейсом, як-от `const sorters = { name: byName, date: byDate, price: byPrice }`, вибрані під час виконання замість розростання `if`/`switch`",
        ],
        ["Composite", "Composite (компонувальник)"],
        ["Builder", "Builder (будівельник)"],
      ],
      "b",
    ),
    question(
      "command",
      ["How does the Command pattern make undo/redo possible?", "Як патерн Command уможливлює undo/redo?"],
      [
        ["By saving a screenshot of the page after each action", "Зберігаючи знімок сторінки після кожної дії"],
        ["By reloading the page from the server", "Перезавантажуючи сторінку із сервера"],
        ["By notifying all subscribers about each change", "Сповіщаючи всіх підписників про кожну зміну"],
        [
          "Each action is an object with `execute()` and `undo()`; executed commands go on an undo stack, undone ones on a redo stack, which suits editors, canvas tools and form builders",
          "Кожна дія — об'єкт з `execute()` і `undo()`; виконані команди йдуть у стек undo, скасовані — у стек redo, що пасує для редакторів, графічних інструментів і конструкторів форм",
        ],
      ],
      "d",
    ),
    question(
      "mediator",
      ["What does the Mediator pattern do?", "Що робить патерн Mediator?"],
      [
        [
          "Components don't talk to each other directly; they send events to one central object that decides who reacts, which cuts many-to-many links in dashboards or dialog flows (a parent component or a store often plays this role in React)",
          "Компоненти не спілкуються напряму; вони надсилають події одному центральному об'єкту, який вирішує, хто реагує, і так прибирає зв'язки «багато до багатьох» у дашбордах чи діалогах (у React цю роль часто грає батьківський компонент або стор)",
        ],
        ["Converts one interface into another", "Перетворює один інтерфейс на інший"],
        ["Creates objects without naming their classes", "Створює об'єкти, не називаючи їхніх класів"],
        ["Ensures there is only one instance", "Гарантує, що екземпляр лише один"],
      ],
      "a",
    ),
    question(
      "chain-of-responsibility",
      ["Where do you meet Chain of Responsibility in frontend code?", "Де у фронтенд-коді трапляється Chain of Responsibility?"],
      [
        ["In CSS Grid layouts", "У макетах CSS Grid"],
        ["In `Array.prototype.sort`", "В `Array.prototype.sort`"],
        [
          "In middleware: Redux middleware, HTTP interceptors or a list of validators, where each handler either handles the request or passes it to `next()`",
          "У middleware: middleware Redux, HTTP-інтерсептори чи список валідаторів, де кожен обробник або обробляє запит, або передає його далі через `next()`",
        ],
        ["In `useState`", "В `useState`"],
      ],
      "c",
    ),
    question(
      "hoc-tradeoffs",
      ["Which are real drawbacks of higher-order components?", "Які з цього — справжні недоліки компонентів вищого порядку?"],
      [
        ["Prop name collisions when several HOCs inject the same prop", "Колізії назв пропсів, коли кілька HOC додають той самий проп"],
        ["\"Wrapper hell\": deep nesting in DevTools that is hard to debug", "«Пекло обгорток»: глибока вкладеність у DevTools, яку важко налагоджувати"],
        ["They can't be reused across components", "Їх не можна повторно використати в інших компонентах"],
        ["It isn't obvious where a prop came from, and refs need `forwardRef` to pass through (before React 19)", "Неочевидно, звідки взявся проп, а ref-и потребують `forwardRef`, щоб пройти крізь обгортку (до React 19)"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "render-props",
      ["What is the render props pattern?", "Що таке патерн render props?"],
      [
        ["Passing HTML strings as props", "Передавання HTML-рядків як пропсів"],
        [
          "A component takes a function prop (or a function as `children`) and calls it with its state, as in `<MouseTracker render={({ x, y }) => <Cursor x={x} y={y} />} />`, so the logic is shared and the caller decides what to render; custom hooks now cover most of these cases",
          "Компонент приймає проп-функцію (чи функцію як `children`) і викликає її зі своїм станом, як у `<MouseTracker render={({ x, y }) => <Cursor x={x} y={y} />} />`, тож логіка спільна, а що рендерити, вирішує той, хто викликає; сьогодні більшість таких випадків покривають власні хуки",
        ],
        ["Rendering every prop as a separate element", "Рендеринг кожного пропса як окремого елемента"],
        ["Server-side rendering of props", "Серверний рендеринг пропсів"],
      ],
      "b",
    ),
    question(
      "provider-pattern",
      ["Which is a good way to build a Provider with the Context API?", "Який гарний спосіб побудувати Provider на Context API?"],
      [
        ["One context for the whole app state, with a new object as `value` on every render", "Один контекст для всього стану застосунку з новим об'єктом у `value` на кожен рендер"],
        ["Export the raw context and let components read it however they like, even outside the provider", "Експортувати «сирий» контекст і дозволити компонентам читати його як завгодно, навіть поза провайдером"],
        ["Put the provider inside each component that needs the value", "Розміщувати провайдер усередині кожного компонента, якому потрібне значення"],
        [
          "A `ThemeProvider` that holds the state, memoizes `value` with `useMemo`, and a `useTheme()` hook that throws a clear error outside the provider; split contexts by concern (auth, theme, locale) so a change doesn't re-render unrelated consumers",
          "`ThemeProvider`, що тримає стан і мемоізує `value` через `useMemo`, і хук `useTheme()`, що кидає зрозумілу помилку поза провайдером; контексти розділяють за призначенням (автентифікація, тема, мова), щоб зміна не перерендерювала сторонніх споживачів",
        ],
      ],
      "d",
    ),
    question(
      "container-presentational",
      ["What is the Container/Presentational pattern, and is it still needed?", "Що таке патерн Container/Presentational і чи він досі потрібен?"],
      [
        [
          "A container handles data and logic (fetching, state) and passes it as props to a presentational component that only renders, which makes the view easy to reuse, test and show in Storybook; today custom hooks often take the container's role, but the split of logic and view still holds",
          "Контейнер відповідає за дані й логіку (завантаження, стан) і передає їх пропсами презентаційному компоненту, який лише рендерить, тож подання легко перевикористовувати, тестувати й показувати в Storybook; сьогодні роль контейнера часто беруть власні хуки, але поділ логіки й подання лишається",
        ],
        ["It means wrapping every component in a `<div class=\"container\">`", "Це означає обгортати кожен компонент у `<div class=\"container\">`"],
        ["Presentational components fetch the data, containers only render", "Презентаційні компоненти завантажують дані, а контейнери лише рендерять"],
        ["It is a Docker pattern unrelated to React", "Це патерн Docker, не пов'язаний із React"],
      ],
      "a",
    ),
  ],
};

/**
 * Design patterns: classic GoF patterns and React patterns as they show up in frontend code,
 * keeping only what the other modules don't cover (Observer, Adapter, HOC basics and Context are there).
 */
export const designPatternsModule: ModuleDef = {
  slug: "design-patterns-interview-questions",
  title: { en: "Design patterns", uk: "Патерни проєктування" },
  slides: [
    { kind: "lecture", slug: "design-patterns-questions", title: { en: "Questions", uk: "Питання" } },
    patternsStructuralQuiz,
    patternsBehavioralQuiz,
  ],
};
