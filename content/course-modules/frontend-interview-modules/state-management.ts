import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–9 of the state management list: Redux in large apps. */
export const reduxAtScaleQuiz: SlideDef = {
  kind: "quiz",
  slug: "redux-at-scale-quiz",
  title: { en: "Redux at scale", uk: "Redux у великих застосунках" },
  questions: [
    question(
      "store-structure",
      ["How do you structure a Redux store for an app with several domains (user, product, cart)?", "Як структурувати Redux store для застосунку з кількома доменами (користувач, товари, кошик)?"],
      [
        ["One huge reducer in `store.ts` that handles every action of every domain", "Один величезний редʼюсер у `store.ts`, що обробляє кожен action кожного домену"],
        [
          "Feature folders (`features/cart/cartSlice.ts`, `cartSelectors.ts`, …), one `createSlice` per domain owning its reducer, actions and selectors, combined in `configureStore({ reducer: { user, product, cart } })`; other features use a slice only through its exported actions and selectors",
          "Теки за функціональністю (`features/cart/cartSlice.ts`, `cartSelectors.ts`, …), один `createSlice` на домен, що володіє своїм редʼюсером, actions і селекторами, зібрані в `configureStore({ reducer: { user, product, cart } })`; інші частини застосунку користуються slice лише через його експортовані actions і селектори",
        ],
        ["Global folders `actions/`, `reducers/` and `constants/` with one file per action type", "Глобальні теки `actions/`, `reducers/` і `constants/` з одним файлом на кожен тип action"],
        ["A separate store for every component", "Окремий store для кожного компонента"],
      ],
      "b",
    ),
    question(
      "thunk-vs-saga",
      ["When is Redux-Saga worth it over thunks?", "Коли Redux-Saga варта того порівняно з thunk-ами?"],
      [
        [
          "For complex async workflows: cancellation (`takeLatest`), races and timeouts, debouncing, retries with backoff, long-running listeners; for plain request/response, `createAsyncThunk` (or RTK Query) is simpler, and RTK's listener middleware covers many reactive cases without generators",
          "Для складних асинхронних сценаріїв: скасування (`takeLatest`), перегони й тайм-аути, debounce, повтори з backoff, довготривалі слухачі; для простого «запит — відповідь» простіший `createAsyncThunk` (чи RTK Query), а listener middleware з RTK покриває багато реактивних випадків без генераторів",
        ],
        ["Always: thunks are deprecated", "Завжди: thunk-и застарілі"],
        ["Only for synchronous actions", "Лише для синхронних actions"],
        ["When the app has no API calls", "Коли в застосунку немає викликів API"],
      ],
      "a",
    ),
    question(
      "useselector-rerenders",
      ["Which `useSelector` habits cause unnecessary re-renders?", "Які звички з `useSelector` спричиняють зайві перерендери?"],
      [
        ["Returning a new object, such as `useSelector(s => ({ name: s.user.name, age: s.user.age }))`, without `shallowEqual` or a memoized selector", "Повертати новий об'єкт, як-от `useSelector(s => ({ name: s.user.name, age: s.user.age }))`, без `shallowEqual` чи мемоїзованого селектора"],
        ["Selecting the whole state or a big slice when the component needs one field", "Вибирати весь стан чи великий slice, коли компоненту потрібне одне поле"],
        ["Selecting a single primitive value, such as `s => s.cart.count`", "Вибирати одне примітивне значення, як-от `s => s.cart.count`"],
        ["Running `filter` or `map` inside the selector on every call", "Виконувати `filter` чи `map` усередині селектора під час кожного виклику"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "complex-reducer",
      ["A reducer drives a multi-step wizard with branches and async validation. How do you keep it predictable and testable?", "Редʼюсер керує багатокроковим майстром із розгалуженнями та асинхронною валідацією. Як зберегти його передбачуваним і придатним до тестування?"],
      [
        ["Call the validation API from inside the reducer", "Викликати API валідації просто з редʼюсера"],
        ["Store the current step only in a component's local variable", "Зберігати поточний крок лише в локальній змінній компонента"],
        ["Write it as one long `switch` and test it manually", "Написати його одним довгим `switch` і тестувати вручну"],
        [
          "Model it as a state machine with explicit steps and allowed transitions (ignoring invalid ones), move logic into small pure helpers, keep async validation in thunks that dispatch results, and unit-test each transition",
          "Змоделювати його як скінченний автомат із явними кроками й дозволеними переходами (недозволені ігнорувати), винести логіку в невеликі чисті допоміжні функції, асинхронну валідацію тримати в thunk-ах, що надсилають результати, і покрити модульними тестами кожен перехід",
        ],
      ],
      "d",
    ),
    question(
      "unexpected-state",
      ["State changes unexpectedly in a Redux Toolkit app. Which tools help find the cause?", "Стан у застосунку на Redux Toolkit змінюється несподівано. Які інструменти допомагають знайти причину?"],
      [
        ["Redux DevTools: the action list, the state diff of each action and the action trace showing which code dispatched it", "Redux DevTools: список actions, різниця стану для кожного action і трасування, що показує, який код його надіслав"],
        ["The immutability and serializability checks that `configureStore` turns on in development, which catch accidental mutations outside Immer", "Перевірки незмінності й серіалізованості, які `configureStore` вмикає в режимі розробки й які ловлять випадкові мутації поза Immer"],
        ["A reducer unit test that reproduces the action sequence", "Модульний тест редʼюсера, що відтворює послідовність actions"],
        ["Deleting the DevTools extension so it doesn't interfere", "Видалити розширення DevTools, щоб воно не заважало"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "redux-typescript",
      ["How do you get type safety across Redux Toolkit with TypeScript?", "Як отримати безпеку типів у Redux Toolkit із TypeScript?"],
      [
        ["Annotate every action creator by hand with `any`", "Вручну позначати кожен action creator як `any`"],
        ["Redux can't be typed", "Redux неможливо типізувати"],
        [
          "Infer `type RootState = ReturnType<typeof store.getState>` and `type AppDispatch = typeof store.dispatch`, define typed hooks once (`useAppSelector = useSelector.withTypes<RootState>()`, `useAppDispatch`), and let `createSlice` and `createAsyncThunk` infer action types from the `PayloadAction<T>` and return types",
          "Вивести `type RootState = ReturnType<typeof store.getState>` і `type AppDispatch = typeof store.dispatch`, один раз оголосити типізовані хуки (`useAppSelector = useSelector.withTypes<RootState>()`, `useAppDispatch`) і дати `createSlice` та `createAsyncThunk` вивести типи actions з `PayloadAction<T>` і типів результатів",
        ],
        ["Write a separate interface for every action type string", "Писати окремий інтерфейс для кожного рядка типу action"],
      ],
      "c",
    ),
    question(
      "custom-middleware",
      ["How do you write custom Redux middleware, for example for analytics?", "Як написати власний middleware для Redux, наприклад для аналітики?"],
      [
        [
          "A function `store => next => action => { … return next(action); }` that reacts to the actions it cares about (by type or a `meta.analytics` field), sends or batches events, and always passes the action on with `next`; register it with `configureStore({ middleware: (getDefault) => getDefault().concat(analytics) })`",
          "Функція `store => next => action => { … return next(action); }`, що реагує на потрібні їй actions (за типом чи полем `meta.analytics`), надсилає чи групує події й завжди передає action далі через `next`; реєструється через `configureStore({ middleware: (getDefault) => getDefault().concat(analytics) })`",
        ],
        ["Add the analytics calls inside each reducer", "Додати виклики аналітики всередину кожного редʼюсера"],
        ["Override `store.dispatch` in each component", "Перевизначати `store.dispatch` у кожному компоненті"],
        ["A middleware must not call `next`", "Middleware не має викликати `next`"],
      ],
      "a",
    ),
    question(
      "redux-persist",
      ["Which practices make persisting Redux state across reloads safe?", "Які практики роблять збереження стану Redux між перезавантаженнями безпечним?"],
      [
        ["Persist only the slices that need it (a `whitelist`, such as the cart or preferences), not server data or UI flags", "Зберігати лише ті slices, яким це потрібно (`whitelist`, як-от кошик чи налаштування), а не серверні дані чи прапорці UI"],
        ["Persist access tokens in localStorage for convenience", "Зберігати access-токени в localStorage для зручності"],
        ["Give the persisted state a `version` and `migrate` function, so old saved data is upgraded when the shape changes", "Дати збереженому стану `version` і функцію `migrate`, щоб старі дані оновлювалися, коли змінюється форма"],
        ["Show a loader or `PersistGate` until rehydration finishes, so the UI doesn't flash the empty state", "Показувати індикатор чи `PersistGate`, доки не завершиться відновлення, щоб UI не блимав порожнім станом"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "legacy-migration",
      ["How do you migrate a legacy Redux codebase to modern Redux Toolkit?", "Як перевести старий Redux-код на сучасний Redux Toolkit?"],
      [
        ["Rewrite the whole store in one big pull request", "Переписати весь store в одному великому pull request"],
        [
          "Incrementally: switch `createStore` to `configureStore` (old reducers keep working), then convert one feature at a time to `createSlice`, replace hand-written async action creators with `createAsyncThunk` or RTK Query, and keep tests green after each step",
          "Поступово: замінити `createStore` на `configureStore` (старі редʼюсери продовжують працювати), потім переводити по одній функціональності на `createSlice`, замінювати написані вручну асинхронні action creators на `createAsyncThunk` чи RTK Query й тримати тести зеленими після кожного кроку",
        ],
        ["Delete Redux and store everything in Context", "Видалити Redux і зберігати все в Context"],
        ["Freeze the old code forever and write new features without state", "Назавжди заморозити старий код і писати нові функції без стану"],
      ],
      "b",
    ),
  ],
};

/** Questions 10–15 of the state management list: Zustand. */
export const zustandQuiz: SlideDef = {
  kind: "quiz",
  slug: "zustand-quiz",
  title: { en: "Zustand", uk: "Zustand" },
  questions: [
    question(
      "zustand-structure",
      ["How do you structure Zustand state for an app with several features?", "Як структурувати стан Zustand для застосунку з кількома функціональностями?"],
      [
        ["Put all state in one component with `useState` and pass it down", "Тримати весь стан в одному компоненті через `useState` і передавати вниз"],
        ["Zustand supports only one value per app", "Zustand підтримує лише одне значення на застосунок"],
        ["Read the whole store in every component with `useStore()`", "Читати весь store у кожному компоненті через `useStore()`"],
        [
          "Small stores per feature, colocated with it (or one store built from slice creators), and components that select only what they need, such as `useCartStore(s => s.items)`, or several fields with `useShallow`",
          "Невеликі сховища для кожної функціональності поруч із її кодом (чи одне сховище, зібране з функцій-slices), а компоненти вибирають лише потрібне, як-от `useCartStore(s => s.items)`, або кілька полів через `useShallow`",
        ],
      ],
      "d",
    ),
    question(
      "zustand-async",
      ["How do you handle async work in Zustand?", "Як працювати з асинхронним кодом у Zustand?"],
      [
        ["Zustand needs a thunk or saga middleware for async code", "Zustand потребує middleware на кшталт thunk чи saga для асинхронного коду"],
        [
          "Write an async action in the store, such as `fetchUser: async (id) => { set({ loading: true }); const user = await api.getUser(id); set({ user, loading: false }); }`, with error handling; components just call it, and for server data a query library is often a better fit",
          "Написати асинхронну дію в store, як-от `fetchUser: async (id) => { set({ loading: true }); const user = await api.getUser(id); set({ user, loading: false }); }`, з обробкою помилок; компоненти просто її викликають, а для серверних даних часто краще пасує бібліотека запитів",
        ],
        ["Async code must stay in `useEffect` inside components", "Асинхронний код мусить лишатися в `useEffect` усередині компонентів"],
        ["Zustand stores can't be updated after an `await`", "Сховища Zustand не можна оновлювати після `await`"],
      ],
      "b",
    ),
    question(
      "zustand-typescript",
      ["How do you type a Zustand store in TypeScript?", "Як типізувати сховище Zustand у TypeScript?"],
      [
        [
          "Describe state and actions in one type and use the curried form `create<BearState>()((set) => ({ … }))`, which keeps inference working with middleware such as `persist` or `devtools`",
          "Описати стан і дії одним типом і використати каррійовану форму `create<BearState>()((set) => ({ … }))`, яка зберігає виведення типів із middleware на кшталт `persist` чи `devtools`",
        ],
        ["Zustand stores are always `any`", "Сховища Zustand завжди мають тип `any`"],
        ["Declare a separate type for each `set` call", "Оголошувати окремий тип для кожного виклику `set`"],
        ["Types are only possible with Redux Toolkit", "Типи можливі лише з Redux Toolkit"],
      ],
      "a",
    ),
    question(
      "zustand-persist",
      ["Which statements about persisting Zustand state are true?", "Які твердження про збереження стану Zustand правильні?"],
      [
        ["The `persist` middleware saves the store under a `name` key, by default in localStorage, or elsewhere with `createJSONStorage(() => sessionStorage)`", "Middleware `persist` зберігає store під ключем `name`, типово в localStorage, або деінде через `createJSONStorage(() => sessionStorage)`"],
        ["`partialize` picks which fields to save, and `version` with `migrate` upgrades old saved data", "`partialize` вибирає, які поля зберігати, а `version` із `migrate` оновлює старі збережені дані"],
        ["To sync tabs, listen to the `storage` event and call `useStore.persist.rehydrate()`", "Щоб синхронізувати вкладки, слухати подію `storage` і викликати `useStore.persist.rehydrate()`"],
        ["Persisted state is shared automatically across devices", "Збережений стан автоматично спільний між пристроями"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "zustand-updates",
      ["Redux is described as immutable and Zustand as \"mutable\". What is actually true?", "Redux називають незмінним, а Zustand — «змінним». Що насправді правильно?"],
      [
        ["In Zustand you change state by assigning to it directly: `state.count++`", "У Zustand стан змінюють прямим присвоєнням: `state.count++`"],
        ["Zustand deep-merges every update automatically", "Zustand автоматично глибоко зливає кожне оновлення"],
        [
          "Both rely on immutable updates: Zustand's `set` replaces state by shallow-merging a new object (`set(s => ({ count: s.count + 1 }))`), so nested objects must be copied, unless you add its `immer` middleware; the real difference is ceremony — Redux adds actions, reducers and strict conventions, Zustand is plain functions",
          "Обидва покладаються на незмінні оновлення: `set` у Zustand замінює стан, неглибоко зливаючи новий об'єкт (`set(s => ({ count: s.count + 1 }))`), тож вкладені об'єкти треба копіювати, якщо не додати middleware `immer`; справжня різниця — в обрядовості: Redux додає actions, редʼюсери й суворі правила, а Zustand — це звичайні функції",
        ],
        ["Zustand doesn't trigger re-renders", "Zustand не викликає перерендерів"],
      ],
      "c",
    ),
    question(
      "testing-zustand",
      ["How do you test Zustand stores?", "Як тестувати сховища Zustand?"],
      [
        ["Through `redux-mock-store`", "Через `redux-mock-store`"],
        ["They can only be tested through end-to-end tests", "Їх можна тестувати лише end-to-end тестами"],
        ["Let state leak between tests; it doesn't matter", "Дозволити стану переходити між тестами; це неважливо"],
        [
          "Call actions directly with `useStore.getState().addItem(…)` and assert on `getState()`, reset the store before each test (for example `useStore.setState(initialState, true)`), and test components with Testing Library against the real store, mocking only the API",
          "Викликати дії напряму через `useStore.getState().addItem(…)` і перевіряти `getState()`, скидати store перед кожним тестом (наприклад, `useStore.setState(initialState, true)`), а компоненти тестувати через Testing Library зі справжнім store, мокаючи лише API",
        ],
      ],
      "d",
    ),
  ],
};

/**
 * State management: Redux in large apps and Zustand. Basics of React-Redux, Immer, thunks, Reselect,
 * Redux-Saga, DevTools, normalization and choosing a tool are in the React, System design and Senior modules.
 */
export const stateManagementModule: ModuleDef = {
  slug: "state-management-interview-questions",
  title: { en: "State management: Redux and Zustand", uk: "Керування станом: Redux і Zustand" },
  slides: [
    { kind: "lecture", slug: "state-management-questions", title: { en: "Questions", uk: "Питання" } },
    reduxAtScaleQuiz,
    zustandQuiz,
  ],
};
