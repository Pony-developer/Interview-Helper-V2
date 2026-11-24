import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–18 and 38–49 of the React list: React itself. */
export const reactCoreQuiz: SlideDef = {
  kind: "quiz",
  slug: "react-core-quiz",
  title: { en: "React", uk: "React" },
  questions: [
    question(
      "default-props",
      ["How do you give a function component a default prop value in modern React?", "Як задати значення prop за замовчуванням у функціональному компоненті в сучасному React?"],
      [
        ["`this.props.defaultValue = 'Guest'`", "`this.props.defaultValue = 'Guest'`"],
        [
          "With a default parameter: `function Greeting({ name = 'Guest' })`; `Component.defaultProps` is legacy and no longer supported for function components in React 19",
          "Параметром за замовчуванням: `function Greeting({ name = 'Guest' })`; `Component.defaultProps` — застарілий підхід, і в React 19 його більше не підтримують для функціональних компонентів",
        ],
        ["Props can't have defaults", "Props не можуть мати значень за замовчуванням"],
        ["`useState(props.name || 'Guest')` in every component", "`useState(props.name || 'Guest')` у кожному компоненті"],
      ],
      "b",
    ),
    question(
      "functional-update",
      [
        "`count` is `0`. A click handler runs `setCount(count + 1); setCount(count + 1);`. What is `count` after the re-render?",
        "`count` дорівнює `0`. Обробник кліку виконує `setCount(count + 1); setCount(count + 1);`. Чому дорівнює `count` після перерендеру?",
      ],
      [
        ["`2`", "`2`"],
        ["`0`", "`0`"],
        [
          "`1`: both calls use the same `count` from this render; `setCount(prev => prev + 1)` twice would give `2`",
          "`1`: обидва виклики беруть той самий `count` з цього рендеру; двічі `setCount(prev => prev + 1)` дало б `2`",
        ],
        ["An error", "Помилка"],
      ],
      "c",
    ),
    question(
      "fragments",
      ["Which statement about fragments is true?", "Яке твердження про фрагменти правильне?"],
      [
        [
          "They group several elements without adding a DOM node; the short `<>...</>` form can't take attributes, so in a list you write `<Fragment key={id}>`",
          "Вони групують кілька елементів, не додаючи DOM-вузла; коротка форма `<>...</>` не приймає атрибутів, тож у списку пишуть `<Fragment key={id}>`",
        ],
        ["They render as a `<div>`", "Вони рендеряться як `<div>`"],
        ["They can only hold text", "Вони можуть містити лише текст"],
        ["The short form `<>` accepts a `key`", "Коротка форма `<>` приймає `key`"],
      ],
      "a",
    ),
    question(
      "react-vs-reactdom",
      ["How do you render a React 18+ app into the page?", "Як відрендерити застосунок на React 18+ у сторінку?"],
      [
        ["`React.render(<App />)`", "`React.render(<App />)`"],
        ["`ReactDOM.render(<App />, el)`, which is still the recommended API", "`ReactDOM.render(<App />, el)`, що досі рекомендований API"],
        ["`document.body.appendChild(<App />)`", "`document.body.appendChild(<App />)`"],
        [
          "`createRoot(el).render(<App />)` from `react-dom/client` (`hydrateRoot` for server-rendered HTML): `react` defines components, `react-dom` renders them into the browser DOM",
          "`createRoot(el).render(<App />)` із `react-dom/client` (`hydrateRoot` для HTML, відрендереного на сервері): `react` описує компоненти, а `react-dom` рендерить їх у DOM браузера",
        ],
      ],
      "d",
    ),
    question(
      "and-pitfall",
      ["`const count = 0;` What does `{count && <p>New messages</p>}` render?", "`const count = 0;` Що рендерить `{count && <p>New messages</p>}`?"],
      [
        ["Nothing", "Нічого"],
        [
          "The text `0`: `&&` returns its left side when it is falsy, and React renders the number; use `count > 0 && ...` or a ternary",
          "Текст `0`: `&&` повертає ліву частину, якщо вона falsy, і React рендерить число; пишіть `count > 0 && ...` або тернарний оператор",
        ],
        ["`<p>New messages</p>`", "`<p>New messages</p>`"],
        ["`false`", "`false`"],
      ],
      "b",
    ),
    question(
      "keys",
      ["Which statements about rendering lists are true?", "Які твердження про рендеринг списків правильні?"],
      [
        ["A stable, unique `key` (like an id) lets React match items between renders", "Стабільний унікальний `key` (як-от id) дає React зіставляти елементи між рендерами"],
        ["Using the index as `key` in a list that is reordered or filtered can attach state (like input text) to the wrong item", "Індекс як `key` у списку, який пересортовують чи фільтрують, може прив'язати стан (як-от текст у полі) до не того елемента"],
        ["`map()` returns an array of elements to render, while `forEach()` returns `undefined`", "`map()` повертає масив елементів для рендерингу, а `forEach()` повертає `undefined`"],
        ["Keys must be unique across the whole app", "Ключі мають бути унікальними в усьому застосунку"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "composition",
      ["What is component composition?", "Що таке композиція компонентів?"],
      [
        ["Inheriting one component class from another", "Успадкування одного класу компонента від іншого"],
        ["Putting all components in one file", "Розміщення всіх компонентів в одному файлі"],
        [
          "Building components from other components and passing content in, through `children` or other props (for example `<Card header={...}>body</Card>`); React prefers it to inheritance",
          "Побудова компонентів з інших компонентів і передача вмісту всередину через `children` чи інші пропси (наприклад, `<Card header={...}>body</Card>`); React надає їй перевагу над успадкуванням",
        ],
        ["Merging two components at runtime", "Злиття двох компонентів під час виконання"],
      ],
      "c",
    ),
    question(
      "usestate-args",
      ["What is the second argument of `useState`?", "Що таке другий аргумент `useState`?"],
      [
        ["The initial value", "Початкове значення"],
        ["A callback that runs after the state updates", "Колбек, що виконується після оновлення стану"],
        ["A dependency array", "Масив залежностей"],
        [
          "There isn't one: `useState(initial)` takes a single argument and returns a pair, `[value, setValue]`; the setter is the second element of that array",
          "Його немає: `useState(initial)` приймає один аргумент і повертає пару `[value, setValue]`; сеттер — це другий елемент цього масиву",
        ],
      ],
      "d",
    ),
    question(
      "lazy-init",
      ["Why write `useState(() => parseBigData())` instead of `useState(parseBigData())`?", "Навіщо писати `useState(() => parseBigData())` замість `useState(parseBigData())`?"],
      [
        [
          "With a function, React calls it only on the first render; `useState(parseBigData())` calls the expensive function on every render and throws the result away",
          "Функцію React викликає лише на першому рендері; `useState(parseBigData())` викликає дорогу функцію на кожному рендері й відкидає результат",
        ],
        ["The function version stores a function in state", "Версія з функцією зберігає в стані саму функцію"],
        ["There is no difference", "Різниці немає"],
        ["It makes the state asynchronous", "Це робить стан асинхронним"],
      ],
      "a",
    ),
    question(
      "class-binding",
      ["Why does `onClick={this.handleClick}` lose `this` in a class component, and how do you fix it?", "Чому `onClick={this.handleClick}` губить `this` у класовому компоненті і як це виправити?"],
      [
        ["React removes `this` from all methods", "React прибирає `this` з усіх методів"],
        [
          "The method is passed as a plain function, so `this` is unset when it's called; define it as a class field arrow function `handleClick = () => {}` or bind it once in the constructor",
          "Метод передається як звичайна функція, тож під час виклику `this` не задано; оголосіть його як стрілкову функцію-поле класу `handleClick = () => {}` або один раз прив'яжіть у конструкторі",
        ],
        ["Class components cannot handle events", "Класові компоненти не можуть обробляти події"],
        ["Call `this.forceUpdate()` first", "Спершу викликати `this.forceUpdate()`"],
      ],
      "b",
    ),
    question(
      "useref-createref",
      ["How does `useRef` differ from `createRef`?", "Чим `useRef` відрізняється від `createRef`?"],
      [
        ["They are identical", "Вони однакові"],
        ["`createRef` keeps the same object across renders, `useRef` creates a new one", "`createRef` зберігає той самий об'єкт між рендерами, а `useRef` створює новий"],
        [
          "`useRef` returns the same object on every render, so it can also hold mutable values that don't trigger re-renders; `createRef` makes a new ref each time it's called and belongs in class components",
          "`useRef` повертає той самий об'єкт на кожному рендері, тож у ньому можна тримати й змінні значення, що не викликають перерендеру; `createRef` створює новий ref щоразу, коли його викликають, і призначений для класових компонентів",
        ],
        ["Changing `ref.current` re-renders the component", "Зміна `ref.current` перерендерює компонент"],
      ],
      "c",
    ),
    question(
      "derived-state",
      ["A component receives `items` and needs the number of selected ones. What is the right approach?", "Компонент отримує `items`, і йому потрібна кількість обраних. Як правильно?"],
      [
        [
          "Compute it during render, `const selected = items.filter(i => i.selected).length`, wrapping it in `useMemo` only if it's expensive; copying it into state risks it going out of sync",
          "Обчислювати під час рендеру: `const selected = items.filter(i => i.selected).length`, обгортаючи в `useMemo` лише тоді, коли це дорого; копія в стані ризикує розійтися з даними",
        ],
        ["Store it in state and sync it with a `useEffect`", "Зберігати в стані й синхронізувати через `useEffect`"],
        ["Keep it in a global store", "Тримати в глобальному сховищі"],
        ["Save it in localStorage", "Зберігати в localStorage"],
      ],
      "a",
    ),
    question(
      "persistent-state",
      ["Which statements about keeping state across reloads are true?", "Які твердження про збереження стану між перезавантаженнями правильні?"],
      [
        ["You can read localStorage in a lazy `useState` initializer and write it back in a `useEffect`", "Можна читати localStorage у лінивому ініціалізаторі `useState` і записувати назад в `useEffect`"],
        ["Libraries offer persistence for stores, such as Zustand's `persist` middleware", "Бібліотеки пропонують збереження для сховищ, як-от middleware `persist` у Zustand"],
        ["With server rendering, localStorage isn't available on the server, which can cause hydration mismatches", "Під час рендерингу на сервері localStorage недоступний, що може спричинити розбіжності під час гідратації"],
        ["localStorage is the safest place for auth tokens", "localStorage — найбезпечніше місце для токенів автентифікації"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "strict-mode",
      ["What does `<StrictMode>` do?", "Що робить `<StrictMode>`?"],
      [
        ["It makes the app faster in production", "Пришвидшує застосунок у продакшні"],
        ["It enables JavaScript strict mode", "Вмикає строгий режим JavaScript"],
        ["It blocks third-party scripts", "Блокує сторонні скрипти"],
        [
          "In development only, it renders components twice and runs effects as mount, unmount, mount, to expose impure rendering and missing cleanup, and warns about deprecated APIs",
          "Лише в розробці рендерить компоненти двічі й запускає ефекти як монтування, демонтування, монтування, щоб виявити нечистий рендеринг і відсутнє очищення, а також попереджає про застарілі API",
        ],
      ],
      "d",
    ),
    question(
      "pure-component",
      ["How does `React.PureComponent` differ from `React.Component`?", "Чим `React.PureComponent` відрізняється від `React.Component`?"],
      [
        [
          "It skips re-rendering when a shallow comparison of props and state finds no change, so mutating an array in place won't trigger an update",
          "Він пропускає перерендер, коли поверхневе порівняння props і state не знаходить змін, тож мутація масиву на місці не запустить оновлення",
        ],
        ["It compares props deeply", "Він порівнює props глибоко"],
        ["It cannot have state", "Він не може мати стану"],
        ["It renders on the server only", "Він рендериться лише на сервері"],
      ],
      "a",
    ),
    question(
      "multiple-inputs",
      ["How can one `onChange` handler update several inputs in a form state object?", "Як один обробник `onChange` може оновлювати кілька полів в об'єкті стану форми?"],
      [
        ["You need a separate state and handler for every field", "Для кожного поля потрібен окремий стан і обробник"],
        [
          "Give each input a `name` and use a computed key: `setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))`",
          "Дати кожному полю `name` і використати обчислюваний ключ: `setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))`",
        ],
        ["`form[e.target.name] = e.target.value` without calling the setter", "`form[e.target.name] = e.target.value` без виклику сеттера"],
        ["Read every field with `document.querySelector` on submit", "Читати кожне поле через `document.querySelector` під час надсилання"],
      ],
      "b",
    ),
    question(
      "imperative-handle",
      ["What is `useImperativeHandle` for?", "Для чого `useImperativeHandle`?"],
      [
        ["Handling form submissions", "Обробка надсилання форм"],
        ["Running effects before paint", "Запуск ефектів до відмальовування"],
        [
          "Choosing what a parent gets through a `ref`: instead of the raw DOM node, the child exposes a small API such as `{ focus, clear }` (with `forwardRef`, or `ref` as a prop in React 19)",
          "Вибір того, що батько отримує через `ref`: замість сирого DOM-вузла дочірній компонент надає невеликий API на кшталт `{ focus, clear }` (через `forwardRef` або `ref` як prop у React 19)",
        ],
        ["Making state immutable", "Робити стан незмінним"],
      ],
      "c",
    ),
    question(
      "axios-vs-fetch",
      ["Which statement about Axios and `fetch` is true?", "Яке твердження про Axios і `fetch` правильне?"],
      [
        ["Both reject the promise on a 404 response", "Обидва відхиляють проміс у разі відповіді 404"],
        ["`fetch` needs a library to be installed", "`fetch` треба встановлювати як бібліотеку"],
        ["Axios can't send JSON", "Axios не вміє надсилати JSON"],
        [
          "Axios rejects on 4xx/5xx statuses, parses JSON automatically and has interceptors and timeouts; `fetch` is built in, resolves on any HTTP status (so you check `res.ok`) and needs `res.json()`",
          "Axios відхиляє проміс за статусів 4xx/5xx, автоматично розбирає JSON і має перехоплювачі та таймаути; `fetch` вбудований, виконується за будь-якого HTTP-статусу (тож перевіряють `res.ok`) і потребує `res.json()`",
        ],
      ],
      "d",
    ),
    question(
      "react-vs-vue",
      ["How does reactivity in React differ from Vue?", "Чим реактивність у React відрізняється від Vue?"],
      [
        ["They work the same way", "Вони працюють однаково"],
        [
          "In React you replace state through a setter, and the component function runs again and its output is diffed; Vue tracks which components read which reactive values (Proxies behind `ref`/`reactive`), so you can mutate state and only the dependent components update; React uses JSX and one-way data flow, Vue compiles HTML templates and adds `v-model` as two-way sugar",
          "У React стан замінюють через сеттер, і функція компонента виконується знову, а її результат порівнюється; Vue відстежує, які компоненти читають які реактивні значення (Proxy за `ref`/`reactive`), тож стан можна мутувати, і оновлюються лише залежні компоненти; React використовує JSX і односпрямований потік даних, а Vue компілює HTML-шаблони й додає `v-model` як двосторонній синтаксичний цукор",
        ],
        ["Vue has no virtual DOM and no components", "У Vue немає віртуального DOM і компонентів"],
        ["React tracks dependencies with Proxies, Vue re-runs every component on each change", "React відстежує залежності через Proxy, а Vue перезапускає кожен компонент на кожну зміну"],
      ],
      "b",
    ),
    question(
      "class-to-hooks",
      ["Which practices make a class-to-hooks migration safe?", "Які практики роблять перехід із класів на хуки безпечним?"],
      [
        ["Migrate incrementally, one low-risk component at a time with tests around it, since classes and hooks work side by side", "Переходити поступово, по одному компоненту з низьким ризиком і з тестами навколо, адже класи й хуки працюють поруч"],
        [
          "Map `this.state` to `useState`/`useReducer`, instance fields to `useRef`, lifecycle logic to `useEffect` with cleanup and correct dependencies, and HOCs to custom hooks",
          "Перенести `this.state` у `useState`/`useReducer`, поля екземпляра — у `useRef`, логіку життєвого циклу — в `useEffect` з очищенням і правильними залежностями, а HOC — у власні хуки",
        ],
        ["Keep error boundaries as classes (or use a library such as `react-error-boundary`), because there is no hook for them", "Залишити error boundaries класами (або використати бібліотеку на кшталт `react-error-boundary`), бо хука для них немає"],
        ["Rewrite the whole app in one big pull request", "Переписати весь застосунок в одному великому pull request"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "reconciliation",
      [
        "A parent switches from rendering `<div><Counter /></div>` to `<section><Counter /></section>`. What happens to the `Counter`'s state?",
        "Батьківський компонент переходить від рендерингу `<div><Counter /></div>` до `<section><Counter /></section>`. Що станеться зі станом `Counter`?",
      ],
      [
        ["It is kept, because `Counter` is still the same component", "Він зберігається, бо `Counter` — той самий компонент"],
        ["React throws an error", "React кидає помилку"],
        [
          "It is reset: when an element's type changes at the same position, reconciliation tears down the whole subtree and mounts a new one (changing a `key` does the same on purpose); Fiber splits this work into units that can be paused and prioritized, then commits the DOM changes in one go",
          "Він скидається: коли тип елемента на тій самій позиції змінюється, reconciliation знищує все піддерево й монтує нове (зміна `key` робить те саме навмисно); Fiber ділить цю роботу на частини, які можна призупиняти й пріоритизувати, а потім застосовує зміни до DOM за один раз",
        ],
        ["Only the text inside `Counter` is reset", "Скидається лише текст усередині `Counter`"],
      ],
      "c",
    ),
    question(
      "synthetic-events",
      ["How does React attach an `onClick` handler under the hood?", "Як React під капотом прикріплює обробник `onClick`?"],
      [
        ["It calls `addEventListener` on every element that has `onClick`", "Він викликає `addEventListener` на кожному елементі з `onClick`"],
        ["It polls the mouse position", "Він опитує позицію миші"],
        ["It listens on `window` and ignores bubbling", "Він слухає на `window` та ігнорує спливання"],
        [
          "It uses event delegation: one listener per event type on the root container (on `document` before React 17), and it passes a `SyntheticEvent` up the React component tree, which is why a click inside a portal reaches the portal's React parent even though the DOM node lives elsewhere",
          "Він використовує делегування подій: один обробник на кожен тип події на кореневому контейнері (до React 17 — на `document`), і передає `SyntheticEvent` вгору деревом React-компонентів, тому клік усередині порталу доходить до React-батька порталу, хоча DOM-вузол розташований деінде",
        ],
      ],
      "d",
    ),
    question(
      "debug-rerenders",
      [
        "Every consumer of a context re-renders on each keystroke in an unrelated input. The provider is `<UserContext.Provider value={{ user, setUser }}>` in the same component as the input. What is the cause, and how do you confirm it?",
        "Кожен споживач контексту перерендерюється на кожне натискання клавіші в не пов'язаному полі. Провайдер — `<UserContext.Provider value={{ user, setUser }}>` у тому самому компоненті, що й поле. У чому причина і як це підтвердити?",
      ],
      [
        ["Context always re-renders everything; nothing can be done", "Контекст завжди перерендерює все; нічого не вдієш"],
        ["`setUser` is called on every keystroke", "`setUser` викликається на кожне натискання клавіші"],
        [
          "The `value` object is created anew on every render of the provider's component, so every consumer sees a changed value; confirm it with the React DevTools Profiler (\"why did this render?\"), then wrap the value in `useMemo` or move the input's state into its own component",
          "Об'єкт `value` створюється заново на кожному рендері компонента-провайдера, тож кожен споживач бачить змінене значення; підтвердити це можна в React DevTools Profiler («why did this render?»), а потім обгорнути значення в `useMemo` або винести стан поля в окремий компонент",
        ],
        ["The consumers are missing `key` props", "Споживачам бракує пропа `key`"],
      ],
      "c",
    ),
    question(
      "memory-leak",
      ["Which steps help find and fix a memory leak in a React app?", "Які кроки допомагають знайти й виправити витік пам'яті в React-застосунку?"],
      [
        [
          "Take a heap snapshot in the DevTools Memory panel, repeat the suspicious action (open and close a page), take another and compare: growing counts and \"Detached\" DOM nodes point to what is still referenced",
          "Зробити heap snapshot у панелі Memory в DevTools, повторити підозрілу дію (відкрити й закрити сторінку), зробити ще один і порівняти: кількість, що зростає, і «Detached» DOM-вузли вказують, на що досі є посилання",
        ],
        ["Return cleanup functions from effects that add listeners, timers, subscriptions or WebSockets", "Повертати функції очищення з ефектів, що додають обробники, таймери, підписки чи WebSocket-и"],
        ["Abort pending requests with an `AbortController` when the component unmounts, and don't keep components or DOM nodes in module-level caches", "Скасовувати незавершені запити через `AbortController` під час демонтування компонента й не тримати компоненти чи DOM-вузли в кешах на рівні модуля"],
        ["Call `window.gc()` in production after every render", "Викликати `window.gc()` у продакшні після кожного рендеру"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "perf-story",
      [
        "How do you give a strong answer to \"Tell us about a time you fixed a performance bottleneck\"?",
        "Як дати сильну відповідь на «Розкажіть про випадок, коли ви усунули вузьке місце продуктивності»?",
      ],
      [
        ["List every optimization technique you know", "Перелічити всі прийоми оптимізації, які знаєте"],
        [
          "Tell one real case with a structure like STAR: the situation and symptom, how you measured it (Profiler, Lighthouse, field data), the cause you found, what you changed and why, and the result in numbers (for example, render time from 800 ms to 100 ms), plus the trade-offs",
          "Розповісти один реальний випадок за структурою на кшталт STAR: ситуація й симптом, як ви це виміряли (Profiler, Lighthouse, польові дані), яку причину знайшли, що змінили й чому, і результат у цифрах (наприклад, час рендеру з 800 мс до 100 мс), а також компроміси",
        ],
        ["Say that you've never had performance problems", "Сказати, що проблем із продуктивністю у вас ніколи не було"],
        ["Describe a fix without saying how you measured anything", "Описати виправлення, не кажучи, як ви щось вимірювали"],
      ],
      "b",
    ),
    question(
      "rtl-queries",
      ["Which statements about writing tests with React Testing Library are true?", "Які твердження про написання тестів із React Testing Library правильні?"],
      [
        [
          "Prefer queries users would rely on: `getByRole('button', { name: /increment/i })`, then `getByLabelText` or `getByText`, and `getByTestId` only as a last resort",
          "Надавати перевагу запитам, на які спирався б користувач: `getByRole('button', { name: /increment/i })`, далі `getByLabelText` чи `getByText`, а `getByTestId` — лише в крайньому разі",
        ],
        ["`userEvent` (`await user.click(button)`) simulates a full interaction with focus and key events, closer to a real user than a single `fireEvent`", "`userEvent` (`await user.click(button)`) імітує повну взаємодію з фокусом і подіями клавіатури, ближче до справжнього користувача, ніж один `fireEvent`"],
        ["`getBy*` throws when nothing matches, `queryBy*` returns `null` for asserting absence, and `findBy*` waits for async content", "`getBy*` кидає помилку, коли нічого не знайдено, `queryBy*` повертає `null` для перевірки відсутності, а `findBy*` чекає на асинхронний вміст"],
        ["Tests should assert on the component's internal state variables", "Тести мають перевіряти внутрішні змінні стану компонента"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "async-api-tests",
      ["How do you test a component that loads data from an API?", "Як тестувати компонент, що завантажує дані з API?"],
      [
        ["Call the real production API from the test", "Викликати справжній продакшн-API з тесту"],
        ["Wait with `setTimeout(3000)` before every assertion", "Чекати `setTimeout(3000)` перед кожною перевіркою"],
        [
          "Mock the network with MSW so the component's real fetching code runs, check the loading state, `await findByText(...)` for the data, and override the handler in one test (`server.use(...)` returning a 500) to check the error message",
          "Імітувати мережу через MSW, щоб виконувався справжній код завантаження компонента, перевірити стан завантаження, `await findByText(...)` для даних, а в окремому тесті перевизначити обробник (`server.use(...)`, що повертає 500), щоб перевірити повідомлення про помилку",
        ],
        ["Test only the success state", "Тестувати лише стан успіху"],
      ],
      "c",
    ),
    question(
      "e2e-roles",
      ["Which practices suit end-to-end tests for an app with admin and regular user roles?", "Які практики підходять для end-to-end тестів застосунку з ролями адміністратора й звичайного користувача?"],
      [
        ["Seed a test account for each role in the test environment", "Створити тестовий обліковий запис для кожної ролі в тестовому середовищі"],
        [
          "Log in programmatically once per role and reuse the session (Playwright `storageState`, Cypress `cy.session`) instead of going through the login form in every test",
          "Входити програмно один раз для кожної ролі й повторно використовувати сесію (`storageState` у Playwright, `cy.session` у Cypress), а не проходити форму входу в кожному тесті",
        ],
        ["Check both sides: what each role can do, and that a regular user is redirected or gets a 403 on admin pages and APIs", "Перевіряти обидва боки: що може кожна роль і що звичайного користувача перенаправляє чи він отримує 403 на адмінських сторінках та API"],
        ["Only check that admin buttons are hidden for regular users", "Перевіряти лише те, що адмінські кнопки приховані від звичайних користувачів"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "accessible-dropdown",
      ["Which practices make a custom dropdown (listbox) accessible?", "Які практики роблять власний випадний список (listbox) доступним?"],
      [
        ["Use a native `<select>` when its styling and behavior are enough", "Використовувати нативний `<select>`, коли його стилізації й поведінки достатньо"],
        [
          "Follow the WAI-ARIA pattern: a trigger `<button aria-haspopup=\"listbox\" aria-expanded>`, a `role=\"listbox\"` list of `role=\"option\"` items with `aria-selected`, Arrow keys and Home/End to move, Enter to select, and Escape to close and return focus to the trigger",
          "Дотримуватися патерну WAI-ARIA: кнопка-тригер `<button aria-haspopup=\"listbox\" aria-expanded>`, список `role=\"listbox\"` з пунктами `role=\"option\"` і `aria-selected`, стрілки та Home/End для переміщення, Enter для вибору, а Escape закриває список і повертає фокус на тригер",
        ],
        [
          "Track the active option either with a roving `tabindex` (real focus moves between options) or with `aria-activedescendant` (focus stays on the list or input, and the attribute points to the active option's id, as in a combobox)",
          "Відстежувати активний пункт або через «блукаючий» `tabindex` (справжній фокус переходить між пунктами), або через `aria-activedescendant` (фокус лишається на списку чи полі, а атрибут вказує на id активного пункту, як у combobox)",
        ],
        ["Open the list on hover and make the options `<div>`s with only `onClick`", "Відкривати список при наведенні, а пункти робити `<div>` лише з `onClick`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "automated-a11y",
      ["Which statement about automated accessibility testing is true?", "Яке твердження про автоматичне тестування доступності правильне?"],
      [
        ["If axe reports no violations, the app is fully WCAG-compliant", "Якщо axe не знаходить порушень, застосунок повністю відповідає WCAG"],
        ["`jest-axe` in jsdom checks color contrast reliably", "`jest-axe` у jsdom надійно перевіряє контраст кольорів"],
        ["Automated tools replace manual testing with a screen reader", "Автоматичні інструменти замінюють ручне тестування зі скринрідером"],
        [
          "Tools like axe, `jest-axe` (`expect(await axe(container)).toHaveNoViolations()`) and Lighthouse catch rule-based issues such as missing labels, missing `alt` or invalid ARIA, but only part of WCAG: they can't judge whether `alt` text is meaningful, whether focus order makes sense or how a screen reader sounds (and jsdom can't render colors to check contrast), so keyboard and screen reader testing is still needed",
          "Інструменти на кшталт axe, `jest-axe` (`expect(await axe(container)).toHaveNoViolations()`) і Lighthouse ловлять проблеми, що перевіряються правилами, як-от відсутні підписи, відсутній `alt` чи неправильна ARIA, але лише частину WCAG: вони не оцінять, чи змістовний текст `alt`, чи логічний порядок фокуса й як звучить скринрідер (а jsdom не рендерить кольори, тож контраст не перевірить), тож тестування з клавіатури та зі скринрідером досі потрібне",
        ],
      ],
      "d",
    ),
  ],
};
