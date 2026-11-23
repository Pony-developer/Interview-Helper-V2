import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 56–73 of the Senior list: frameworks and libraries. */
export const seniorFrameworksQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-frameworks-quiz",
  title: { en: "Frameworks and libraries", uk: "Фреймворки та бібліотеки" },
  questions: [
    question(
      "react-18",
      ["What did React 18 introduce?", "Що з'явилося в React 18?"],
      [
        ["Concurrent rendering, enabled with `createRoot`", "Конкурентний рендеринг, що вмикається через `createRoot`"],
        ["Automatic batching of state updates, including inside promises and timeouts", "Автоматичне групування оновлень стану, зокрема в промісах і таймаутах"],
        ["Class components were removed", "Класові компоненти прибрали"],
        ["`useTransition`, `useDeferredValue` and `useId`", "`useTransition`, `useDeferredValue` і `useId`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "stable-callback",
      [
        "How do you keep a function that always sees the current props without re-running an effect that depends on it?",
        "Як мати функцію, що завжди бачить актуальні пропси, і не перезапускати ефект, який від неї залежить?",
      ],
      [
        ["Add the function to the effect's dependencies", "Додати функцію до залежностей ефекту"],
        ["Remove the dependencies and silence the linter", "Прибрати залежності й вимкнути попередження лінтера"],
        ["Keep the function in `useState`", "Тримати функцію в `useState`"],
        [
          "Store the latest function in a ref (`ref.current = fn` on each render) and call `ref.current()` inside the effect, or use `useEffectEvent` where it is available",
          "Зберігати останню версію функції в ref (`ref.current = fn` на кожному рендері) і викликати `ref.current()` в ефекті, або використати `useEffectEvent`, де він доступний",
        ],
      ],
      "d",
    ),
    question(
      "layout-effect",
      ["When should you use `useLayoutEffect` instead of `useEffect`?", "Коли варто використати `useLayoutEffect` замість `useEffect`?"],
      [
        [
          "When you need to measure the DOM and change it before the browser paints, for example to position a tooltip without flicker; it blocks painting, so use it sparingly",
          "Коли треба виміряти DOM і змінити його до того, як браузер відмалює кадр, наприклад розмістити підказку без мерехтіння; він блокує відмальовування, тож використовуйте його ощадливо",
        ],
        ["For loading data from an API", "Для завантаження даних з API"],
        ["Always, because it is faster", "Завжди, бо він швидший"],
        ["Only for code that runs on the server", "Лише для коду, що виконується на сервері"],
      ],
      "a",
    ),
    question(
      "use-transition",
      ["What does `useTransition` do?", "Що робить `useTransition`?"],
      [
        ["Runs CSS transitions", "Запускає CSS-переходи"],
        ["Animates route changes", "Анімує зміну маршрутів"],
        [
          "Marks a state update as non-urgent, so urgent updates like typing stay responsive while React renders the heavy update in the background; `isPending` tells you it is in progress",
          "Позначає оновлення стану як нетермінове, тож термінові оновлення, як-от введення тексту, лишаються чуйними, поки React у фоні рендерить важке оновлення; `isPending` показує, що воно триває",
        ],
        ["Debounces network requests", "Робить debounce мережевих запитів"],
      ],
      "c",
    ),
    question(
      "react-patterns",
      ["Which of these are React patterns?", "Що з цього — патерни React?"],
      [
        ["Two-way data binding with `ng-model`", "Двостороннє зв'язування даних через `ng-model`"],
        ["Custom hooks", "Власні хуки (custom hooks)"],
        ["Compound components", "Compound components (складені компоненти)"],
        ["Render props and higher-order components", "Render props і компоненти вищого порядку (HOC)"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "compound-components",
      ["Which of these is an example of the compound components pattern?", "Що з цього — приклад патерну compound components?"],
      [
        ["A component with 30 props that configure everything", "Компонент із 30 пропсами, що налаштовують усе"],
        [
          "`<Tabs><Tabs.List><Tabs.Tab>…</Tabs.Tab></Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>`, where the parts share state through context",
          "`<Tabs><Tabs.List><Tabs.Tab>…</Tabs.Tab></Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>`, де частини мають спільний стан через контекст",
        ],
        ["A higher-order component that adds logging", "Компонент вищого порядку, що додає логування"],
        ["Several unrelated components in one file", "Кілька не пов'язаних компонентів в одному файлі"],
      ],
      "b",
    ),
    question(
      "state-libs-needed",
      [
        "If you have React Query (or SWR) and Context, do you still need a state management library?",
        "Якщо є React Query (чи SWR) і Context, чи потрібна ще бібліотека для керування станом?",
      ],
      [
        [
          "Often not: server state lives in the query cache and rare global values in Context; a store like Zustand or Redux helps when complex client state is updated from many places",
          "Часто ні: серверний стан живе в кеші запитів, а рідкісні глобальні значення — в Context; сховище на кшталт Zustand чи Redux допомагає, коли складний клієнтський стан змінюють із багатьох місць",
        ],
        ["Yes, Redux is always required", "Так, Redux потрібен завжди"],
        ["Never, under any circumstances", "Ніколи й за жодних обставин"],
        ["Context replaces React Query", "Context замінює React Query"],
      ],
      "a",
    ),
    question(
      "react-errors",
      ["How do you handle render errors in React components?", "Як обробляти помилки рендерингу в React-компонентах?"],
      [
        ["`try/catch` around the JSX catches render errors in child components", "`try/catch` навколо JSX ловить помилки рендерингу дочірніх компонентів"],
        ["React simply ignores errors", "React просто ігнорує помилки"],
        ["`useEffect` catches all errors in the tree", "`useEffect` ловить усі помилки в дереві"],
        [
          "Error boundaries (a class with `getDerivedStateFromError` / `componentDidCatch`, or `react-error-boundary`) show a fallback; errors in event handlers and async code need `try/catch`",
          "Error boundaries (клас із `getDerivedStateFromError` / `componentDidCatch` або `react-error-boundary`) показують запасний UI; помилки в обробниках подій і асинхронному коді потребують `try/catch`",
        ],
      ],
      "d",
    ),
    question(
      "use-handler",
      [
        "What does this hook do?\n\n```js\nconst useHandler = (f) => {\n  const ref = React.useRef(f);\n  ref.current = f;\n  return React.useCallback((...args) => ref.current(...args), []);\n};\n```",
        "Що робить цей хук?\n\n```js\nconst useHandler = (f) => {\n  const ref = React.useRef(f);\n  ref.current = f;\n  return React.useCallback((...args) => ref.current(...args), []);\n};\n```",
      ],
      [
        ["It memoizes the result of `f`", "Мемоїзує результат `f`"],
        [
          "It returns a function with a stable identity that always calls the latest `f`, so it can go to memoized children or effects without causing re-renders or re-runs",
          "Повертає функцію зі стабільним посиланням, яка завжди викликає останню версію `f`, тож її можна передавати мемоїзованим дочірнім компонентам чи в ефекти, не спричиняючи перерендерів і перезапусків",
        ],
        ["It calls `f` only once", "Викликає `f` лише один раз"],
        ["It creates a new function on every render", "Створює нову функцію на кожному рендері"],
      ],
      "b",
    ),
    question(
      "ngrx",
      ["How does NgRx manage global state in Angular?", "Як NgRx керує глобальним станом в Angular?"],
      [
        ["Through two-way binding to services only", "Лише через двостороннє зв'язування із сервісами"],
        ["By saving everything to localStorage", "Зберігаючи все в localStorage"],
        [
          "A Redux-style store: components dispatch actions, reducers produce the new state, selectors read it as observables, and effects handle side effects such as HTTP calls",
          "Сховище в стилі Redux: компоненти надсилають actions, редʼюсери створюють новий стан, селектори читають його як observables, а effects обробляють побічні ефекти, як-от HTTP-запити",
        ],
        ["Angular apps have no global state", "В Angular-застосунках немає глобального стану"],
      ],
      "c",
    ),
    question(
      "design-consistency",
      ["Which practices keep UI design consistent across a large React codebase?", "Які практики зберігають однорідність UI у великій кодовій базі на React?"],
      [
        ["A shared component library documented in Storybook", "Спільна бібліотека компонентів, задокументована в Storybook"],
        ["Design tokens shared with designers (colors, spacing, typography)", "Дизайн-токени, спільні з дизайнерами (кольори, відступи, типографіка)"],
        ["Visual regression tests and lint rules against hard-coded values", "Тести візуальної регресії та правила лінтера проти жорстко прописаних значень"],
        ["Every team styles its own buttons", "Кожна команда стилізує власні кнопки"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "component-structure",
      ["Which way of structuring components scales in a large React app?", "Який спосіб структурування компонентів масштабується у великому React-застосунку?"],
      [
        ["One `components` folder with a thousand files", "Одна тека `components` із тисячею файлів"],
        ["All logic in `App.tsx`", "Уся логіка в `App.tsx`"],
        ["Copying components between features", "Копіювати компоненти між функціональностями"],
        [
          "Feature folders with their own components, hooks and API calls; a shared UI kit of presentational components; logic in hooks or containers so views stay simple",
          "Теки функціональностей із власними компонентами, хуками й API-викликами; спільний UI-кіт презентаційних компонентів; логіка в хуках чи контейнерах, щоб подання лишалися простими",
        ],
      ],
      "d",
    ),
    question(
      "react-forms-libs",
      ["Why is React Hook Form often faster than a fully controlled form in large forms?", "Чому React Hook Form у великих формах часто швидший за повністю контрольовану форму?"],
      [
        [
          "It keeps values in uncontrolled inputs read through refs, so typing doesn't re-render the whole form; schema validation (Zod, Yup) plugs in through resolvers",
          "Він тримає значення в неконтрольованих полях і читає їх через ref, тож введення не перерендерює всю форму; валідація за схемою (Zod, Yup) підключається через resolvers",
        ],
        ["It is built on jQuery", "Він побудований на jQuery"],
        ["It skips validation", "Він пропускає валідацію"],
        ["It renders the form on the server", "Він рендерить форму на сервері"],
      ],
      "a",
    ),
    question(
      "large-list",
      ["How do you render a list of 100,000+ items?", "Як відрендерити список із 100 000+ елементів?"],
      [
        ["Render all of them at once", "Відрендерити всі одразу"],
        ["Render them in batches with `setTimeout` until all are in the DOM", "Рендерити їх порціями через `setTimeout`, доки всі не опиняться в DOM"],
        [
          "Virtualization (TanStack Virtual, react-window): render only the visible rows plus a small buffer, with stable keys, and load the data in pages where possible",
          "Віртуалізація (TanStack Virtual, react-window): рендерити лише видимі рядки й невеликий запас, зі стабільними ключами, а дані за можливості завантажувати сторінками",
        ],
        ["Use a plain HTML `<table>` and nothing else", "Використати звичайну HTML-таблицю `<table>` і більше нічого"],
      ],
      "c",
    ),
    question(
      "memo-when",
      ["When should you use `useMemo` and `useCallback`?", "Коли варто використовувати `useMemo` і `useCallback`?"],
      [
        ["Always, around every value and function", "Завжди, навколо кожного значення й функції"],
        [
          "When profiling shows a real cost, or to keep references stable for `React.memo` children or effect dependencies; wrapping everything adds complexity and memory for no gain",
          "Коли профілювання показує реальну ціну або щоб зберегти стабільні посилання для дочірніх компонентів у `React.memo` чи для залежностей ефектів; обгортання всього підряд додає складності й пам'яті без користі",
        ],
        ["Never", "Ніколи"],
        ["Only in class components", "Лише в класових компонентах"],
      ],
      "b",
    ),
    question(
      "react-build",
      ["What does a modern React build typically use?", "Що зазвичай використовують для збирання сучасного React-застосунку?"],
      [
        ["Create React App, the recommended default", "Create React App як рекомендований варіант за замовчуванням"],
        ["No build at all: JSX runs in the browser as it is", "Жодного збирання: JSX працює в браузері як є"],
        ["Only running Babel by hand", "Лише ручний запуск Babel"],
        [
          "A bundler such as Vite or a framework like Next.js, with TypeScript, environment variables, code splitting, minification and hashed asset names for caching",
          "Бандлер, як-от Vite, чи фреймворк, як-от Next.js, із TypeScript, змінними оточення, розбиттям коду, мініфікацією та хешованими назвами файлів для кешування",
        ],
      ],
      "d",
    ),
    question(
      "state-tools",
      ["Which of these are sound reasons for choosing a state management tool?", "Які з цих причин вибору інструмента керування станом обґрунтовані?"],
      [
        ["Zustand: a minimal API and little boilerplate for simple global state", "Zustand: мінімальний API й мало шаблонного коду для простого глобального стану"],
        ["Redux Toolkit: a predictable flow, DevTools and conventions for large teams", "Redux Toolkit: передбачуваний потік даних, DevTools і правила для великих команд"],
        ["TanStack Query: server state with caching and refetching", "TanStack Query: серверний стан із кешуванням і повторними запитами"],
        ["MobX: because it requires no understanding of reactivity", "MobX: бо він не потребує розуміння реактивності"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "isr",
      ["How does incremental static regeneration (ISR) in Next.js work?", "Як працює incremental static regeneration (ISR) у Next.js?"],
      [
        [
          "A page is served from the static cache and regenerated in the background after a revalidation time or an on-demand revalidation, so visitors get fast cached pages while the content stays fresh",
          "Сторінка віддається зі статичного кешу й перегенеровується у фоні після заданого часу або на запит ревалідації, тож відвідувачі отримують швидкі закешовані сторінки, а вміст лишається свіжим",
        ],
        ["It rebuilds the whole site on every request", "Перезбирає весь сайт на кожен запит"],
        ["It works only on the client", "Працює лише на клієнті"],
        ["It turns caching off", "Вимикає кешування"],
      ],
      "a",
    ),
  ],
};
