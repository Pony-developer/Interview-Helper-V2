import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 72–89 of the Middle list: frameworks and libraries. */
export const middleFrameworksQuiz: SlideDef = {
  kind: "quiz",
  slug: "middle-frameworks-quiz",
  title: { en: "Frameworks and libraries", uk: "Фреймворки та бібліотеки" },
  questions: [
    question(
      "vue-state",
      ["How is state usually managed in Vue 3?", "Як зазвичай керують станом у Vue 3?"],
      [
        ["Only with Redux", "Лише через Redux"],
        ["Vue components have no state", "Компоненти Vue не мають стану"],
        [
          "Local reactive state with `ref` and `reactive` in components, props down and events up, and Pinia (the successor of Vuex) for shared global state",
          "Локальний реактивний стан через `ref` і `reactive` у компонентах, пропси вниз і події вгору, а для спільного глобального стану — Pinia (наступник Vuex)",
        ],
        ["Global variables on `window`", "Глобальні змінні на `window`"],
      ],
      "c",
    ),
    question(
      "react-routing",
      ["How is routing usually done in a React app?", "Як зазвичай реалізують маршрутизацію в React-застосунку?"],
      [
        [
          "With a router library such as React Router (`<Routes>`, `<Route>`, `useParams`, `<Link>`), or with the file-based routing of a framework like Next.js",
          "Через бібліотеку маршрутизації, як-от React Router (`<Routes>`, `<Route>`, `useParams`, `<Link>`), або через файлову маршрутизацію фреймворку на кшталт Next.js",
        ],
        ["With a router built into the `react` package itself", "Через роутер, вбудований у сам пакет `react`"],
        ["With `window.location.reload()` on every click", "Через `window.location.reload()` на кожен клік"],
        ["React apps cannot have more than one page", "React-застосунок не може мати більше однієї сторінки"],
      ],
      "a",
    ),
    question(
      "render-opt",
      [
        "A parent re-renders on every keystroke, and a heavy child re-renders with it, although its props did not change. What helps?",
        "Батьківський компонент перерендерюється на кожне натискання клавіші, а разом із ним і важкий дочірній, хоча його пропси не змінилися. Що допоможе?",
      ],
      [
        ["Add more `useEffect` calls to the child", "Додати в дочірній компонент більше `useEffect`"],
        ["Use the array index as `key`", "Використати індекс масиву як `key`"],
        ["Call `forceUpdate` on the child", "Викликати `forceUpdate` на дочірньому компоненті"],
        [
          "Wrap the child in `React.memo` and keep its props stable (`useCallback` for function props), or move the input state down so the parent doesn't re-render",
          "Обгорнути дочірній компонент у `React.memo` і тримати його пропси стабільними (`useCallback` для функцій) або перенести стан поля нижче, щоб батько не перерендерювався",
        ],
      ],
      "d",
    ),
    question(
      "large-react-perf",
      ["Which of these help performance in large React apps?", "Що з цього покращує продуктивність великих React-застосунків?"],
      [
        ["Route-based code splitting with `React.lazy` and `Suspense`", "Розбиття коду за маршрутами через `React.lazy` і `Suspense`"],
        ["Profiling with the React DevTools Profiler before optimizing", "Профілювання в React DevTools Profiler перед оптимізацією"],
        ["One large Context holding everything, which changes often", "Один великий Context з усім підряд, що часто змінюється"],
        ["Virtualizing long lists", "Віртуалізація довгих списків"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "react-problems",
      ["Which of these are common problems in React components?", "Які з цього — поширені проблеми в React-компонентах?"],
      [
        ["Stale closures: an effect or callback sees an old value because of missing dependencies", "Застарілі замикання: ефект чи колбек бачить старе значення через пропущені залежності"],
        ["Infinite loops when an effect sets state that is in its own dependency list", "Нескінченні цикли, коли ефект змінює стан, що є в його ж залежностях"],
        ["Mutating state directly (`state.items.push(x)`), so React doesn't notice the change", "Пряма мутація стану (`state.items.push(x)`), через яку React не помічає змін"],
        ["JSX cannot render numbers", "JSX не вміє рендерити числа"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "share-state",
      ["Two sibling components need the same state. What is the first, simplest step?", "Двом сусіднім компонентам потрібен той самий стан. Який перший і найпростіший крок?"],
      [
        ["Install Redux", "Встановити Redux"],
        ["Lift the state up to their closest common parent and pass it down as props", "Підняти стан до найближчого спільного батька й передати вниз через пропси"],
        ["Store it in localStorage and read it in both", "Зберегти його в localStorage і читати в обох"],
        ["Keep a copy in each component and sync them with effects", "Тримати копію в кожному компоненті й синхронізувати їх ефектами"],
      ],
      "b",
    ),
    question(
      "data-caching",
      ["What does a library like TanStack Query add over `useEffect` with `fetch`?", "Що дає бібліотека на кшталт TanStack Query порівняно з `useEffect` і `fetch`?"],
      [
        ["Nothing", "Нічого"],
        ["Server-side rendering", "Рендеринг на сервері"],
        [
          "Caching by query key, deduplication of identical requests, background refetching, retries, and loading and error states out of the box",
          "Кешування за ключем запиту, усунення однакових запитів, фонове оновлення, повторні спроби та стани завантаження й помилки з коробки",
        ],
        ["Component styles", "Стилі компонентів"],
      ],
      "c",
    ),
    question(
      "side-effects",
      ["What is a side effect in React?", "Що таке побічний ефект (side effect) у React?"],
      [
        ["A margin on the side of a component", "Бічний відступ компонента"],
        ["A rendering bug", "Помилка рендерингу"],
        ["A child component", "Дочірній компонент"],
        [
          "Anything beyond computing JSX from props and state: fetching data, subscriptions, timers, changing the DOM directly; it belongs in effects or event handlers, not in render",
          "Усе, що виходить за межі обчислення JSX із пропсів і стану: завантаження даних, підписки, таймери, пряма зміна DOM; цьому місце в ефектах чи обробниках подій, а не в рендері",
        ],
      ],
      "d",
    ),
    question(
      "complex-routing",
      ["Which approaches help organize routes in a large React app?", "Які підходи допомагають організувати маршрути у великому React-застосунку?"],
      [
        ["One flat list of 200 routes in a single file, with layouts copied into each page", "Один плаский список із 200 маршрутів в одному файлі, з layout-ами, скопійованими в кожну сторінку"],
        ["Nested routes with shared layouts", "Вкладені маршрути зі спільними layout-ами"],
        ["Lazy-loading the code of each route", "Ліниве завантаження коду кожного маршруту"],
        ["Route guards for authorization and loaders for data", "Захист маршрутів для авторизації та завантажувачі даних"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "react-animations",
      ["Which approach to animation in React usually performs best?", "Який підхід до анімацій у React зазвичай найпродуктивніший?"],
      [
        [
          "CSS transitions and animations on `transform` and `opacity`, toggled with classes, or a library like Motion (Framer Motion) for complex sequences and exit animations",
          "CSS-переходи й анімації `transform` та `opacity`, що вмикаються класами, або бібліотека на кшталт Motion (Framer Motion) для складних послідовностей і анімацій зникнення",
        ],
        ["Setting state 60 times a second to change `left`", "Змінювати стан 60 разів на секунду, щоб рухати `left`"],
        ["jQuery's `animate()`", "`animate()` із jQuery"],
        ["Unmounting and mounting the component for every frame", "Демонтувати й монтувати компонент на кожен кадр"],
      ],
      "a",
    ),
    question(
      "flux-redux",
      ["What is the core idea of Flux and Redux, and what is its main cost?", "У чому головна ідея Flux і Redux і яка її основна ціна?"],
      [
        ["Two-way data binding between the store and the components", "Двостороннє зв'язування даних між сховищем і компонентами"],
        ["There is no store: every component keeps its own data", "Сховища немає: кожен компонент тримає власні дані"],
        [
          "One-way data flow: the UI dispatches actions, pure reducers produce a new state in a single store, and components subscribe to it; predictable and easy to debug, but it adds boilerplate and is overkill for small apps",
          "Односпрямований потік даних: UI надсилає дії (actions), чисті редʼюсери створюють новий стан в одному сховищі, а компоненти на нього підписуються; передбачувано й легко налагоджувати, але додає шаблонного коду і зайве для малих застосунків",
        ],
        ["It works only with Angular", "Він працює лише з Angular"],
      ],
      "c",
    ),
    question(
      "nextjs-scale",
      ["How do you scale a Next.js app for high traffic?", "Як масштабувати Next.js-застосунок під високий трафік?"],
      [
        ["Prerender static pages, and regenerate them incrementally where the data changes rarely", "Попередньо рендерити статичні сторінки й інкрементально оновлювати там, де дані змінюються рідко"],
        ["Render every page dynamically on every request, with no caching", "Рендерити кожну сторінку динамічно на кожен запит, без кешування"],
        ["Serve static assets and cached pages from a CDN", "Віддавати статичні ресурси й закешовані сторінки через CDN"],
        ["Cache data fetches and API responses", "Кешувати завантаження даних і відповіді API"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "re-render",
      ["When does a React component re-render?", "Коли React-компонент перерендерюється?"],
      [
        ["Only when its props change", "Лише коли змінюються його пропси"],
        [
          "When its state changes, when its parent re-renders, or when a context it uses changes; `React.memo`, stable props and moving state down reduce unnecessary re-renders",
          "Коли змінюється його стан, коли перерендерюється батько або змінюється контекст, яким він користується; `React.memo`, стабільні пропси й перенесення стану нижче зменшують зайві перерендери",
        ],
        ["Every second, on a timer", "Щосекунди, за таймером"],
        ["Only when the DOM changes", "Лише коли змінюється DOM"],
      ],
      "b",
    ),
    question(
      "context",
      ["When is React Context a good fit?", "Коли доречно використовувати React Context?"],
      [
        ["For fast-changing values, like the text of an input on every keystroke, shared across the whole app", "Для значень, що швидко змінюються, як-от текст поля на кожне натискання клавіші, спільних для всього застосунку"],
        ["To replace all props everywhere", "Щоб замінити всі пропси всюди"],
        ["As a cache for server data", "Як кеш для даних із сервера"],
        [
          "For values that many components at different depths need and that change rarely: the theme, the locale, the current user",
          "Для значень, які потрібні багатьом компонентам на різній глибині й рідко змінюються: тема, мова, поточний користувач",
        ],
      ],
      "d",
    ),
    question(
      "memoization-react",
      ["When is `useMemo` worth using?", "Коли варто використовувати `useMemo`?"],
      [
        ["Always, for every value in a component", "Завжди, для кожного значення в компоненті"],
        [
          "For an expensive calculation, or to keep an object or array reference stable for a memoized child or an effect dependency",
          "Для дорогого обчислення або щоб зберегти стабільне посилання на об'єкт чи масив для мемоїзованого дочірнього компонента чи залежності ефекту",
        ],
        ["To fetch data", "Щоб завантажувати дані"],
        ["To store state", "Щоб зберігати стан"],
      ],
      "b",
    ),
    question(
      "before-unmount",
      ["How do you run code right before a component is removed from the tree?", "Як виконати код безпосередньо перед видаленням компонента з дерева?"],
      [
        ["In `componentDidMount`", "У `componentDidMount`"],
        ["In `useMemo`", "У `useMemo`"],
        [
          "Return a cleanup function from `useEffect`: `useEffect(() => { … return () => cleanup(); }, [])`",
          "Повернути функцію очищення з `useEffect`: `useEffect(() => { … return () => cleanup(); }, [])`",
        ],
        ["Directly in the component body", "Прямо в тілі компонента"],
      ],
      "c",
    ),
    question(
      "use-reducer",
      ["When is `useReducer` a better choice than `useState`?", "Коли `useReducer` кращий за `useState`?"],
      [
        [
          "When the state has several related fields and many kinds of updates depend on the previous state, so the logic is easier to keep in one reducer",
          "Коли стан має кілька пов'язаних полів і багато різних оновлень залежать від попереднього стану, тож логіку простіше тримати в одному редʼюсері",
        ],
        ["For a single boolean flag", "Для одного булевого прапорця"],
        ["For fetching data", "Для завантаження даних"],
        ["Always, in every component", "Завжди, у кожному компоненті"],
      ],
      "a",
    ),
    question(
      "ui-libraries",
      ["What is a typical trade-off of UI component libraries such as MUI or Ant Design?", "Який типовий компроміс бібліотек UI-компонентів, як-от MUI чи Ant Design?"],
      [
        ["They have no downsides", "Вони не мають недоліків"],
        [
          "Ready, accessible components and faster delivery, at the cost of bundle size, a recognizable look, and effort to customize beyond the library's own design system",
          "Готові доступні компоненти й швидша розробка ціною розміру бандла, впізнаваного вигляду та зусиль на кастомізацію поза власною дизайн-системою бібліотеки",
        ],
        ["They work only with Angular", "Вони працюють лише з Angular"],
        ["They replace CSS completely", "Вони повністю замінюють CSS"],
      ],
      "b",
    ),
  ],
};
