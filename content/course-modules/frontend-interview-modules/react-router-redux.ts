import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";
import { reactCoreQuiz } from "./react-core";

/** Questions 19–26 of the React list: React Router. */
export const reactRouterQuiz: SlideDef = {
  kind: "quiz",
  slug: "react-router-quiz",
  title: { en: "React Router", uk: "React Router" },
  questions: [
    question(
      "router-types",
      ["Which pairing of router and use case is correct?", "Яке поєднання роутера та сценарію правильне?"],
      [
        [
          "`BrowserRouter` gives clean URLs but the server must send `index.html` for every path; `HashRouter` (`/#/about`) works on static hosting without server config; `MemoryRouter` keeps history in memory, for tests",
          "`BrowserRouter` дає чисті URL, але сервер мусить віддавати `index.html` на будь-який шлях; `HashRouter` (`/#/about`) працює на статичному хостингу без налаштування сервера; `MemoryRouter` тримає історію в пам'яті, для тестів",
        ],
        ["`HashRouter` is the best choice for SEO", "`HashRouter` — найкращий вибір для SEO"],
        ["`MemoryRouter` changes the address bar", "`MemoryRouter` змінює адресний рядок"],
        ["`BrowserRouter` needs no server configuration at all", "`BrowserRouter` взагалі не потребує налаштування сервера"],
      ],
      "a",
    ),
    question(
      "link-navlink",
      ["Which statements about `<a>`, `<Link>` and `<NavLink>` are true?", "Які твердження про `<a>`, `<Link>` і `<NavLink>` правильні?"],
      [
        ["A plain `<a href>` to an app route reloads the whole page", "Звичайний `<a href>` на маршрут застосунку перезавантажує всю сторінку"],
        ["`<Link>` changes the URL and the view without a reload", "`<Link>` змінює URL і подання без перезавантаження"],
        [
          "`<NavLink>` knows whether its route is active; in v6 you style it with `className={({ isActive }) => ...}` (the old `activeClassName` prop was removed)",
          "`<NavLink>` знає, чи активний його маршрут; у v6 його стилізують через `className={({ isActive }) => ...}` (старий проп `activeClassName` прибрали)",
        ],
        ["`<Link>` sends a request to the server for the new page", "`<Link>` надсилає запит на сервер за новою сторінкою"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "route-params",
      ["With `<Route path=\"/users/:id\" element={<User />} />` and the URL `/users/101`, what does `useParams()` return in `User`?", "Маємо `<Route path=\"/users/:id\" element={<User />} />` і URL `/users/101`. Що повертає `useParams()` у `User`?"],
      [
        ["`101` as a number", "`101` як число"],
        ["`'/users/101'`", "`'/users/101'`"],
        ["`{ id: '101' }`: parameters always come as strings", "`{ id: '101' }`: параметри завжди приходять як рядки"],
        ["`undefined`, because params are only available in class components", "`undefined`, бо параметри доступні лише в класових компонентах"],
      ],
      "c",
    ),
    question(
      "query-params",
      ["How do you read and update `?page=2` in React Router v6?", "Як прочитати й оновити `?page=2` у React Router v6?"],
      [
        ["Query parameters are not supported", "Параметри запиту не підтримуються"],
        ["With `useParams()`", "Через `useParams()`"],
        ["Only by parsing `window.location.href` by hand", "Лише вручну розбираючи `window.location.href`"],
        [
          "`const [searchParams, setSearchParams] = useSearchParams()`, then `searchParams.get('page')` and `setSearchParams({ page: '3' })`",
          "`const [searchParams, setSearchParams] = useSearchParams()`, потім `searchParams.get('page')` і `setSearchParams({ page: '3' })`",
        ],
      ],
      "d",
    ),
    question(
      "router-hooks",
      ["Which statement about navigation in React Router v6 is true?", "Яке твердження про навігацію в React Router v6 правильне?"],
      [
        [
          "`useNavigate()` returns a function for navigating from code, such as after a form submit (`navigate('/dashboard')`); it replaced v5's `useHistory`, while `useLocation`, `useMatch` and hooks in general replace `withRouter` and `useRouteMatch`",
          "`useNavigate()` повертає функцію для навігації з коду, наприклад після надсилання форми (`navigate('/dashboard')`); він замінив `useHistory` з v5, а `useLocation`, `useMatch` і хуки загалом замінюють `withRouter` та `useRouteMatch`",
        ],
        ["`useHistory` is still the main hook", "`useHistory` досі основний хук"],
        ["You can only navigate with `<Link>`", "Переходити можна лише через `<Link>`"],
        ["`withRouter` is required to read the URL", "`withRouter` обов'язковий, щоб прочитати URL"],
      ],
      "a",
    ),
    question(
      "switch-routes",
      ["How does v6 `<Routes>` differ from v5 `<Switch>`?", "Чим `<Routes>` з v6 відрізняється від `<Switch>` з v5?"],
      [
        ["They work the same way", "Вони працюють однаково"],
        [
          "`<Switch>` rendered the first match in source order and needed `exact`; `<Routes>` picks the best match regardless of order, so `exact` is gone, and routes take an `element` prop",
          "`<Switch>` рендерив перший збіг за порядком у коді й потребував `exact`; `<Routes>` обирає найкращий збіг незалежно від порядку, тож `exact` зник, а маршрути приймають проп `element`",
        ],
        ["`<Routes>` renders every matching route at once", "`<Routes>` рендерить усі відповідні маршрути одразу"],
        ["`<Routes>` still requires `exact` on every route", "`<Routes>` досі вимагає `exact` на кожному маршруті"],
      ],
      "b",
    ),
    question(
      "protected-route",
      ["How do you build a protected route in React Router v6?", "Як зробити захищений маршрут у React Router v6?"],
      [
        ["With the `<Redirect>` component inside `<Switch>`", "Компонентом `<Redirect>` усередині `<Switch>`"],
        ["Hide the link to it, and that is enough", "Сховати посилання на нього, і цього достатньо"],
        [
          "A wrapper that renders `<Outlet />` for signed-in users and `<Navigate to=\"/login\" replace />` otherwise; the server must still check access, because client-side guards only hide UI",
          "Обгортка, що рендерить `<Outlet />` для тих, хто увійшов, а інакше `<Navigate to=\"/login\" replace />`; сервер однаково мусить перевіряти доступ, бо захист на клієнті лише ховає UI",
        ],
        ["Set `exact` on the route", "Поставити `exact` на маршрут"],
      ],
      "c",
    ),
    question(
      "not-found",
      ["How do you show a 404 page for unknown URLs in React Router v6?", "Як показати сторінку 404 для невідомих URL у React Router v6?"],
      [
        ["`<Route path=\"/404\" />` only", "Лише `<Route path=\"/404\" />`"],
        ["Router shows a 404 automatically", "Роутер показує 404 автоматично"],
        ["Put the 404 route first inside `<Switch>`", "Поставити маршрут 404 першим у `<Switch>`"],
        ["A catch-all route: `<Route path=\"*\" element={<NotFound />} />`", "Маршрут для всього іншого: `<Route path=\"*\" element={<NotFound />} />`"],
      ],
      "d",
    ),
  ],
};

/** Questions 27–37 of the React list: Redux. */
export const reduxQuiz: SlideDef = {
  kind: "quiz",
  slug: "redux-quiz",
  title: { en: "Redux", uk: "Redux" },
  questions: [
    question(
      "react-redux",
      ["Which statements about connecting React to Redux are true?", "Які твердження про підключення React до Redux правильні?"],
      [
        ["`<Provider store={store}>` at the top makes the store available to the tree", "`<Provider store={store}>` нагорі робить сховище доступним для дерева"],
        ["`useSelector` reads a slice of state and re-renders the component when the selected value changes by reference", "`useSelector` читає частину стану й перерендерює компонент, коли обране значення змінюється за посиланням"],
        ["`useDispatch` returns `dispatch`; `connect` with `mapStateToProps` and `mapDispatchToProps` is the older way to do the same", "`useDispatch` повертає `dispatch`; `connect` із `mapStateToProps` і `mapDispatchToProps` — старіший спосіб зробити те саме"],
        ["Each component must create its own store", "Кожен компонент мусить створювати власне сховище"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "immutability-rtk",
      ["Why can a Redux Toolkit reducer write `state.count += 1`?", "Чому редʼюсер у Redux Toolkit може писати `state.count += 1`?"],
      [
        ["Because Redux no longer cares about immutability", "Бо Redux більше не зважає на незмінність"],
        [
          "`createSlice` uses Immer: the code looks like a mutation, but Immer produces a new immutable state, so `===` checks still detect what changed",
          "`createSlice` використовує Immer: код виглядає як мутація, але Immer створює новий незмінний стан, тож перевірки через `===` досі виявляють зміни",
        ],
        ["Because the state is a class instance", "Бо стан — екземпляр класу"],
        ["It can't: that line throws an error", "Не може: цей рядок кидає помилку"],
      ],
      "b",
    ),
    question(
      "middleware-thunk",
      ["Which statement about Redux middleware and thunks is true?", "Яке твердження про middleware і thunk у Redux правильне?"],
      [
        ["Middleware runs inside reducers", "Middleware виконується всередині редʼюсерів"],
        ["Thunks make reducers asynchronous", "Thunk-и роблять редʼюсери асинхронними"],
        [
          "Middleware sits between `dispatch` and the reducers; with `redux-thunk` you can dispatch a function that gets `dispatch` and `getState` and runs async code, and `createAsyncThunk` generates its `pending`, `fulfilled` and `rejected` actions",
          "Middleware стоїть між `dispatch` і редʼюсерами; з `redux-thunk` можна надіслати функцію, що отримує `dispatch` і `getState` та виконує асинхронний код, а `createAsyncThunk` генерує для неї actions `pending`, `fulfilled` і `rejected`",
        ],
        ["Middleware is only for logging", "Middleware потрібен лише для логування"],
      ],
      "c",
    ),
    question(
      "selectors",
      ["Why use memoized selectors from Reselect (`createSelector`)?", "Навіщо мемоїзовані селектори з Reselect (`createSelector`)?"],
      [
        [
          "A selector that builds a new array (for example with `filter`) returns a new reference on every call, so `useSelector` re-renders each time; a memoized selector returns the same result while its inputs are unchanged",
          "Селектор, що будує новий масив (наприклад, через `filter`), щоразу повертає нове посилання, тож `useSelector` щоразу перерендерює; мемоїзований селектор повертає той самий результат, доки вхідні дані не змінилися",
        ],
        ["Selectors are required to change state", "Селектори потрібні, щоб змінювати стан"],
        ["They make actions asynchronous", "Вони роблять actions асинхронними"],
        ["They replace reducers", "Вони замінюють редʼюсери"],
      ],
      "a",
    ),
    question(
      "combine-reducers",
      [
        "`combineReducers({ books: booksReducer, activeBook: activeBookReducer })` produces what kind of state?",
        "Який стан дає `combineReducers({ books: booksReducer, activeBook: activeBookReducer })`?",
      ],
      [
        ["One merged array of books", "Один об'єднаний масив книжок"],
        ["Two separate stores", "Два окремі сховища"],
        ["Only the state of the last reducer", "Лише стан останнього редʼюсера"],
        [
          "An object `{ books, activeBook }`, where each key is managed by its own reducer, which receives every action",
          "Об'єкт `{ books, activeBook }`, де кожним ключем керує власний редʼюсер, що отримує кожен action",
        ],
      ],
      "d",
    ),
    question(
      "saga",
      ["In Redux-Saga, how does `call()` differ from `put()`?", "Чим у Redux-Saga `call()` відрізняється від `put()`?"],
      [
        ["They are the same", "Вони однакові"],
        [
          "`yield call(api.fetchUser, id)` calls a function and waits for its result; `yield put({ type: 'USER_LOADED' })` dispatches an action to the store",
          "`yield call(api.fetchUser, id)` викликає функцію й чекає на її результат; `yield put({ type: 'USER_LOADED' })` надсилає action у сховище",
        ],
        ["`put()` makes an HTTP PUT request", "`put()` робить HTTP-запит PUT"],
        ["`call()` dispatches an action", "`call()` надсилає action"],
      ],
      "b",
    ),
    question(
      "devtools",
      ["What makes time-travel debugging in Redux DevTools possible?", "Що робить можливим time-travel debugging у Redux DevTools?"],
      [
        ["The browser records every DOM change", "Браузер записує кожну зміну DOM"],
        ["A special build of React", "Спеціальна збірка React"],
        [
          "State changes only through dispatched, serializable actions handled by pure reducers, so DevTools can replay actions to rebuild the state at any point",
          "Стан змінюється лише через надіслані серіалізовані actions, які обробляють чисті редʼюсери, тож DevTools може повторити actions і відновити стан на будь-який момент",
        ],
        ["Redux saves screenshots of the page", "Redux зберігає скриншоти сторінки"],
      ],
      "c",
    ),
    question(
      "dispatch-in-reducer",
      ["Can a reducer dispatch an action?", "Чи може редʼюсер надіслати action?"],
      [
        ["Yes, it is the usual way to chain updates", "Так, це звичайний спосіб поєднувати оновлення"],
        ["Yes, but only asynchronously", "Так, але лише асинхронно"],
        ["Only in Redux Toolkit", "Лише в Redux Toolkit"],
        [
          "No: reducers must be pure, and Redux throws \"Reducers may not dispatch actions\"; follow-up actions belong in middleware, thunks or listeners",
          "Ні: редʼюсери мають бути чистими, і Redux кидає помилку «Reducers may not dispatch actions»; наступні actions належать до middleware, thunk-ів чи listeners",
        ],
      ],
      "d",
    ),
    question(
      "store-outside",
      ["How do you use the Redux store outside a React component, for example in an API helper?", "Як використати Redux store поза React-компонентом, наприклад у хелпері для API?"],
      [
        [
          "Import the store and call `store.getState()`, `store.dispatch(action)` or `store.subscribe(listener)`; with server rendering, create a store per request instead of a shared singleton",
          "Імпортувати store і викликати `store.getState()`, `store.dispatch(action)` чи `store.subscribe(listener)`; за рендерингу на сервері створювати store на кожен запит замість спільного синглтона",
        ],
        ["Only with `useSelector`", "Лише через `useSelector`"],
        ["It is impossible", "Це неможливо"],
        ["Through `window.redux`", "Через `window.redux`"],
      ],
      "a",
    ),
    question(
      "redux-ssr",
      ["How does Redux work with server-side rendering?", "Як Redux працює з рендерингом на сервері?"],
      [
        ["The server and all users share one store", "Сервер і всі користувачі ділять одне сховище"],
        [
          "The server creates a store for each request, loads the data and renders the HTML, embeds the serialized state (escaped against XSS), and the client creates its store with that `preloadedState` before hydrating",
          "Сервер створює store на кожен запит, завантажує дані й рендерить HTML, вбудовує серіалізований стан (екранований від XSS), а клієнт створює свій store з цим `preloadedState` перед гідратацією",
        ],
        ["Redux cannot be used with SSR", "Redux неможливо використовувати з SSR"],
        ["The client fetches all data again and ignores the server's state", "Клієнт знову завантажує всі дані й ігнорує стан із сервера"],
      ],
      "b",
    ),
    question(
      "testing-redux",
      ["Which statements about testing Redux and hooks are true?", "Які твердження про тестування Redux і хуків правильні?"],
      [
        ["A reducer is a pure function, so a test calls it directly: `expect(reducer(state, action)).toEqual(next)`", "Редʼюсер — чиста функція, тож тест викликає його напряму: `expect(reducer(state, action)).toEqual(next)`"],
        ["Components that use the store are rendered with Testing Library inside a `Provider` with a real or test store", "Компоненти, що використовують store, рендерять через Testing Library всередині `Provider` зі справжнім чи тестовим сховищем"],
        ["Custom hooks can be tested with `renderHook`", "Власні хуки можна тестувати через `renderHook`"],
        ["Reducers can only be tested in a real browser", "Редʼюсери можна тестувати лише в справжньому браузері"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** React questions: the unique part of a React, React Router and Redux list. */
export const reactTopicsModule: ModuleDef = {
  slug: "react-interview-questions",
  title: { en: "React questions", uk: "Питання з React" },
  slides: [
    { kind: "lecture", slug: "react-questions", title: { en: "Questions", uk: "Питання" } },
    reactCoreQuiz,
    reactRouterQuiz,
    reduxQuiz,
  ],
};
