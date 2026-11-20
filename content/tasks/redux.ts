import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const STORE_TS = String.raw`export type Action = { type: string; [key: string]: unknown };
export type Store<S> = {
  getState(): S;
  dispatch(action: any): any;
  subscribe(listener: () => void): () => void;
};

/** A minimal Redux-style store (already implemented). */
export function createStore<S>(reducer: (state: S | undefined, action: Action) => S): Store<S> {
  let state = reducer(undefined, { type: "@@init" });
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    dispatch(action) {
      if (typeof action !== "object" || action === null || typeof action.type !== "string") {
        throw new Error("Actions must be plain objects with a string type. Use middleware for functions.");
      }
      state = reducer(state, action);
      listeners.forEach((l) => l());
      return action;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const counter = (state = 0, action: Action): number =>
  action.type === "inc" ? state + 1 : action.type === "add" ? state + (action.amount as number) : state;
`;

const MIDDLEWARE_STARTER = String.raw`import type { Store } from "./store";

export type MiddlewareAPI<S> = { getState(): S; dispatch(action: any): any };
export type Middleware<S> = (api: MiddlewareAPI<S>) => (next: (action: any) => any) => (action: any) => any;

/** Returns a store whose dispatch runs through the middlewares (first = outermost). */
export function applyMiddleware<S>(store: Store<S>, ...middlewares: Middleware<S>[]): Store<S> {
  // TODO
  return store;
}

/** Lets you dispatch functions: (dispatch, getState) => result. */
export const thunk: Middleware<any> = () => (next) => (action) => next(action);

/** Logs "<type>: <state before as JSON> -> <state after as JSON>" after each action reaches the reducer. */
export function createLogger(log: (line: string) => void): Middleware<any> {
  return () => (next) => (action) => next(action);
}
`;

const MIDDLEWARE_SOLUTION = String.raw`import type { Store } from "./store";

export type MiddlewareAPI<S> = { getState(): S; dispatch(action: any): any };
export type Middleware<S> = (api: MiddlewareAPI<S>) => (next: (action: any) => any) => (action: any) => any;

export function applyMiddleware<S>(store: Store<S>, ...middlewares: Middleware<S>[]): Store<S> {
  let dispatch: (action: any) => any = () => {
    throw new Error("Dispatching while constructing middleware is not allowed");
  };
  // Middlewares get a dispatch that always goes through the whole chain (needed by thunks).
  const api: MiddlewareAPI<S> = { getState: store.getState, dispatch: (action) => dispatch(action) };
  const chain = middlewares.map((m) => m(api));
  dispatch = chain.reduceRight<(action: any) => any>((next, mw) => mw(next), store.dispatch);
  return { ...store, dispatch };
}

export const thunk: Middleware<any> =
  ({ dispatch, getState }) =>
  (next) =>
  (action) =>
    typeof action === "function" ? action(dispatch, getState) : next(action);

export function createLogger(log: (line: string) => void): Middleware<any> {
  return ({ getState }) =>
    (next) =>
    (action) => {
      const before = getState();
      const result = next(action);
      log(action.type + ": " + JSON.stringify(before) + " -> " + JSON.stringify(getState()));
      return result;
    };
}
`;

const MIDDLEWARE_INDEX = String.raw`import "./styles.css";
import { counter, createStore } from "./src/store";
import { applyMiddleware, createLogger, thunk } from "./src/middleware";

const lines: string[] = [];
const store = applyMiddleware(createStore(counter), thunk, createLogger((l) => lines.push(l)));
try {
  store.dispatch((dispatch: (a: unknown) => void) => {
    dispatch({ type: "inc" });
    dispatch({ type: "inc" });
  });
} catch (e) {
  lines.push(String(e));
}
document.getElementById("app")!.innerHTML =
  '<h1>Middleware</h1><p>Count: <output id="count">' + store.getState() + "</output></p><pre>" + lines.join("\n") + "</pre>";
`;

const MIDDLEWARE_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { counter, createStore } from "../src/store";
import { applyMiddleware, createLogger, thunk } from "../src/middleware";

describe("applyMiddleware", () => {
  it("runs middlewares in order, first one outermost", () => {
    const calls = [];
    const mw = (name) => () => (next) => (action) => {
      calls.push(name + ">");
      const r = next(action);
      calls.push("<" + name);
      return r;
    };
    const store = applyMiddleware(createStore(counter), mw("a"), mw("b"));
    store.dispatch({ type: "inc" });
    expect(calls).toEqual(["a>", "b>", "<b", "<a"]);
    expect(store.getState()).toBe(1);
  });
  it("keeps getState and subscribe working", () => {
    const store = applyMiddleware(createStore(counter));
    let notified = 0;
    store.subscribe(() => notified++);
    store.dispatch({ type: "add", amount: 3 });
    expect(store.getState()).toBe(3);
    expect(notified).toBe(1);
  });
});

describe("thunk", () => {
  it("calls function actions with dispatch and getState and returns their result", () => {
    const store = applyMiddleware(createStore(counter), thunk);
    const result = store.dispatch((dispatch, getState) => {
      dispatch({ type: "inc" });
      dispatch({ type: "inc" });
      return getState();
    });
    expect(result).toBe(2);
  });
  it("supports async thunks", async () => {
    const store = applyMiddleware(createStore(counter), thunk);
    const done = await store.dispatch(async (dispatch) => {
      await Promise.resolve();
      dispatch({ type: "add", amount: 5 });
      return "done";
    });
    expect(done).toBe("done");
    expect(store.getState()).toBe(5);
  });
  it("passes plain actions through", () => {
    const store = applyMiddleware(createStore(counter), thunk);
    expect(store.dispatch({ type: "inc" })).toEqual({ type: "inc" });
    expect(store.getState()).toBe(1);
  });
});

describe("logger", () => {
  it("logs the action type and states before and after", () => {
    const lines = [];
    const store = applyMiddleware(createStore(counter), createLogger((l) => lines.push(l)));
    store.dispatch({ type: "add", amount: 2 });
    expect(lines).toEqual(["add: 0 -> 2"]);
  });
  it("sees actions dispatched from inside a thunk", () => {
    const lines = [];
    const store = applyMiddleware(createStore(counter), thunk, createLogger((l) => lines.push(l)));
    store.dispatch((dispatch) => dispatch({ type: "inc" }));
    expect(lines).toEqual(["inc: 0 -> 1"]);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("2")).id).toBe("count");
  });
});
`;

const STORE_STARTER = String.raw`export type Action = { type: string; [key: string]: unknown };
export type Reducer<S> = (state: S | undefined, action: Action) => S;
export type Store<S> = {
  getState(): S;
  dispatch(action: Action): Action;
  subscribe(listener: () => void): () => void;
};

export function createStore<S>(reducer: Reducer<S>, preloadedState?: S): Store<S> {
  // TODO: initialise state, dispatch, notify subscribers, return unsubscribe
  let state = preloadedState as S;
  return {
    getState: () => state,
    dispatch: (action) => action,
    subscribe: () => () => {},
  };
}

export function combineReducers<S extends Record<string, unknown>>(reducers: { [K in keyof S]: Reducer<S[K]> }): Reducer<S> {
  // TODO
  return (state) => state as S;
}
`;

const STORE_SOLUTION = String.raw`export type Action = { type: string; [key: string]: unknown };
export type Reducer<S> = (state: S | undefined, action: Action) => S;
export type Store<S> = {
  getState(): S;
  dispatch(action: Action): Action;
  subscribe(listener: () => void): () => void;
};

export function createStore<S>(reducer: Reducer<S>, preloadedState?: S): Store<S> {
  let state = preloadedState as S;
  let listeners: (() => void)[] = [];

  function dispatch(action: Action) {
    if (typeof action !== "object" || action === null || typeof action.type !== "string") {
      throw new Error("Actions must be plain objects with a string type");
    }
    state = reducer(state, action);
    // Snapshot, so (un)subscribing inside a listener doesn't affect this notification round.
    for (const listener of [...listeners]) listener();
    return action;
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  // Let every reducer fill in its initial state.
  dispatch({ type: "@@redux/INIT" });
  return { getState: () => state, dispatch, subscribe };
}

export function combineReducers<S extends Record<string, unknown>>(reducers: { [K in keyof S]: Reducer<S[K]> }): Reducer<S> {
  const keys = Object.keys(reducers) as (keyof S)[];
  return (state, action) => {
    const prev = (state ?? {}) as S;
    let changed = state === undefined;
    const next = {} as S;
    for (const key of keys) {
      next[key] = reducers[key](prev[key], action);
      if (next[key] !== prev[key]) changed = true;
    }
    return changed ? next : prev;
  };
}
`;

const STORE_INDEX = String.raw`import "./styles.css";
import { combineReducers, createStore, type Action } from "./src/store";

const count = (state = 0, action: Action) => (action.type === "inc" ? state + 1 : state);
const todos = (state: string[] = [], action: Action) => (action.type === "todo" ? [...state, action.text as string] : state);

const store = createStore(combineReducers({ count, todos }));
const render = () => {
  const s = store.getState();
  document.getElementById("app")!.innerHTML =
    '<h1>Mini store</h1><p>Count: <output id="count">' + (s && s.count) + "</output></p><p>Todos: " + ((s && s.todos) || []).join(", ") + "</p>";
};
store.subscribe(render);
render();
store.dispatch({ type: "inc" });
store.dispatch({ type: "inc" });
store.dispatch({ type: "inc" });
store.dispatch({ type: "todo", text: "write tests" });
`;

const STORE_TESTS = String.raw`import { describe, it, expect, screen, fn } from "./test-kit";
import { combineReducers, createStore } from "../src/store";

const counter = (state = 0, action) => (action.type === "inc" ? state + 1 : state);

describe("createStore", () => {
  it("initialises state by calling the reducer", () => {
    expect(createStore(counter).getState()).toBe(0);
  });
  it("uses the preloaded state when given", () => {
    expect(createStore(counter, 10).getState()).toBe(10);
  });
  it("updates state and notifies subscribers on dispatch", () => {
    const store = createStore(counter);
    const listener = fn();
    store.subscribe(listener);
    store.dispatch({ type: "inc" });
    expect(store.getState()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("stops notifying after unsubscribe", () => {
    const store = createStore(counter);
    const listener = fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    unsubscribe();
    store.dispatch({ type: "inc" });
    expect(listener).toHaveBeenCalledTimes(0);
  });
  it("still notifies every listener when one unsubscribes during dispatch", () => {
    const store = createStore(counter);
    const second = fn();
    const unsubscribeFirst = store.subscribe(() => unsubscribeFirst());
    store.subscribe(second);
    store.dispatch({ type: "inc" });
    expect(second).toHaveBeenCalledTimes(1);
  });
  it("rejects actions without a string type", () => {
    const store = createStore(counter);
    expect(() => store.dispatch({})).toThrow();
    expect(() => store.dispatch(() => {})).toThrow();
  });
});

describe("combineReducers", () => {
  const todos = (state = [], action) => (action.type === "todo" ? [...state, action.text] : state);
  const root = combineReducers({ count: counter, todos });

  it("builds the initial state from every slice", () => {
    expect(createStore(root).getState()).toEqual({ count: 0, todos: [] });
  });
  it("passes each slice only its own state", () => {
    const next = root({ count: 2, todos: ["a"] }, { type: "todo", text: "b" });
    expect(next).toEqual({ count: 2, todos: ["a", "b"] });
  });
  it("returns the same object when no slice changed", () => {
    const state = { count: 1, todos: [] };
    expect(root(state, { type: "unknown" }) === state).toBe(true);
    expect(root(state, { type: "inc" }) === state).toBe(false);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("3")).id).toBe("count");
  });
});
`;

export default defineTasks([
  quiz(
    "redux-three-principles",
    ["redux"],
    1,
    45,
    ["Redux principles", "Принципи Redux"],
    ["Which of these is **not** one of Redux's core principles?", "Що з цього **не** є одним з основних принципів Redux?"],
    [
      ["The whole app state lives in a single store", "Увесь стан застосунку живе в одному сторі"],
      ["State is read-only and changes only by dispatching actions", "Стан доступний лише для читання й змінюється тільки через надсилання дій"],
      ["Changes are made with pure reducer functions", "Зміни роблять чисті функції-редʼюсери"],
      ["Each component keeps a private copy of the state it uses", "Кожен компонент тримає власну копію стану, який використовує"],
    ],
    "d",
    [
      "Redux is built on a single source of truth, read-only state changed through actions, and pure reducers. Private copies of shared state are exactly the drift Redux is meant to prevent; components read the store through selectors instead.",
      "Redux спирається на єдине джерело правди, стан лише для читання, що змінюється через дії, і чисті редʼюсери. Приватні копії спільного стану призводять саме до розбіжностей, яким Redux має запобігати; компоненти читають стор через селектори.",
    ],
  ),
  quiz(
    "redux-immer-return",
    ["redux"],
    2,
    90,
    ["Immer in createSlice", "Immer у createSlice"],
    ["What happens when this `createSlice` reducer runs?", "Що станеться, коли виконається цей редʼюсер `createSlice`?"],
    [
      ["Immer throws: a reducer may modify the draft or return a new value, not both", "Immer кидає помилку: редʼюсер може змінити чернетку або повернути нове значення, але не обидва"],
      ["State becomes `{ items: [] }` and the mutation is ignored", "Стан стає `{ items: [] }`, а мутацію проігноровано"],
      ["The original state object is mutated in place", "Початковий об'єкт стану змінюється на місці"],
      ["Nothing: returning from a slice reducer is not allowed", "Нічого: повертати значення з редʼюсера слайсу не можна"],
    ],
    "a",
    [
      "With Immer you either mutate the `state` draft (and return nothing) or return a brand-new state. Doing both is ambiguous, so Immer throws. Write `reset: () => ({ items: [], loading: false })` or only mutate the draft.",
      "З Immer ви або змінюєте чернетку `state` (і нічого не повертаєте), або повертаєте зовсім новий стан. Обидва варіанти разом неоднозначні, тож Immer кидає помилку. Пишіть `reset: () => ({ items: [], loading: false })` або лише змінюйте чернетку.",
    ],
    { code: 'reset(state) {\n  state.loading = false;\n  return { items: [], loading: false };\n}', codeLanguage: "ts" },
  ),
  quiz(
    "redux-vs-context",
    ["redux", w("react")],
    2,
    90,
    ["Redux vs Context", "Redux чи Context"],
    [
      "A large app keeps frequently changing state (cart, filters, notifications) in one React Context value. Why do many components re-render, and how does Redux's `useSelector` avoid it?",
      "Великий застосунок тримає стан, що часто змінюється (кошик, фільтри, сповіщення), в одному значенні React Context. Чому перерендерюється багато компонентів і як `useSelector` у Redux цього уникає?",
    ],
    [
      ["Every consumer re-renders when the context value changes; `useSelector` re-renders only when its selected value changes", "Кожен споживач перерендерюється, коли змінюється значення контексту; `useSelector` перерендерює лише коли змінилося вибране значення"],
      ["Context is asynchronous and Redux is synchronous", "Context асинхронний, а Redux синхронний"],
      ["Context copies the value deeply on each render", "Context глибоко копіює значення на кожному рендері"],
      ["Redux components never re-render", "Компоненти з Redux ніколи не перерендерюються"],
    ],
    "a",
    [
      "Context is a transport: any change to the provided value re-renders every `useContext` consumer, even those that only use one field. `useSelector` subscribes to the store and compares only the selected slice with `===`, so unrelated updates are skipped.",
      "Context є лише способом передачі: будь-яка зміна значення перерендерює всіх споживачів `useContext`, навіть тих, що використовують одне поле. `useSelector` підписується на стор і порівнює через `===` лише вибрану частину, тож непов'язані оновлення пропускаються.",
    ],
  ),
  quiz(
    "redux-selector-new-object",
    ["redux", w("react")],
    3,
    120,
    ["A selector that always re-renders", "Селектор, що завжди перерендерює"],
    ["This component re-renders after **every** dispatched action, even unrelated ones. Why, and what fixes it?", "Цей компонент перерендерюється після **кожної** дії, навіть непов'язаної. Чому і як це виправити?"],
    [
      ["The selector returns a new object each time; select fields separately or pass `shallowEqual`", "Селектор щоразу повертає новий об'єкт; вибирайте поля окремо або передайте `shallowEqual`"],
      ["`useSelector` always re-renders; wrap the component in `React.memo`", "`useSelector` завжди перерендерює; обгорніть компонент у `React.memo`"],
      ["Destructuring breaks the subscription; use `store.getState()` directly", "Деструктуризація ламає підписку; використовуйте `store.getState()` напряму"],
      ["`state.user` must be normalised first", "`state.user` спершу треба нормалізувати"],
    ],
    "a",
    [
      "`useSelector` compares the result with `===`. An object literal is a new reference on every call, so every store update looks like a change. Use two selectors (`useSelector(s => s.user.name)`), `useSelector(fn, shallowEqual)`, or a memoised `createSelector`. `React.memo` doesn't help: the re-render comes from the hook, not from props.",
      "`useSelector` порівнює результат через `===`. Літерал об'єкта є новим посиланням при кожному виклику, тож кожне оновлення стору виглядає як зміна. Використайте два селектори (`useSelector(s => s.user.name)`), `useSelector(fn, shallowEqual)` або мемоізований `createSelector`. `React.memo` не допоможе: рендер спричиняє хук, а не пропси.",
    ],
    { code: "const { name, age } = useSelector((state) => ({\n  name: state.user.name,\n  age: state.user.age,\n}));", codeLanguage: "tsx" },
  ),
  quiz(
    "redux-middleware-order",
    ["redux"],
    3,
    120,
    ["Middleware order", "Порядок middleware"],
    ["With `applyMiddleware(a, b)`, what is logged when one action is dispatched?", "Що буде залоговано при надсиланні однієї дії з `applyMiddleware(a, b)`?"],
    [
      ["`a in`, `b in`, `reducer`, `b out`, `a out`", "`a in`, `b in`, `reducer`, `b out`, `a out`"],
      ["`b in`, `a in`, `reducer`, `a out`, `b out`", "`b in`, `a in`, `reducer`, `a out`, `b out`"],
      ["`a in`, `a out`, `b in`, `b out`, `reducer`", "`a in`, `a out`, `b in`, `b out`, `reducer`"],
      ["`reducer`, `a in`, `a out`, `b in`, `b out`", "`reducer`, `a in`, `a out`, `b in`, `b out`"],
    ],
    "a",
    [
      "Middlewares compose like an onion: the first one wraps the second, which wraps the real dispatch. Each runs its code before `next(action)` on the way in, and its code after `next` on the way out, in reverse order.",
      "Middleware складаються як цибулина: перший обгортає другий, а той обгортає справжній dispatch. Кожен виконує код перед `next(action)` на шляху всередину і код після `next` на шляху назовні, у зворотному порядку.",
    ],
    {
      code: 'const log = (name) => () => (next) => (action) => {\n  console.log(name + " in");\n  const result = next(action); // the reducer logs "reducer"\n  console.log(name + " out");\n  return result;\n};\nconst store = createStore(reducer, applyMiddleware(log("a"), log("b")));\nstore.dispatch({ type: "ping" });',
      codeLanguage: "js",
    },
  ),
  quiz(
    "redux-thunk-mechanics",
    ["redux", w("async-javascript")],
    3,
    90,
    ["What redux-thunk does", "Що робить redux-thunk"],
    ["What does the redux-thunk middleware actually do?", "Що насправді робить middleware redux-thunk?"],
    [
      ["If the action is a function, it calls it with `dispatch` and `getState`; otherwise it passes the action to `next`", "Якщо дія є функцією, викликає її з `dispatch` і `getState`; інакше передає дію в `next`"],
      ["It makes reducers asynchronous so they can `await` API calls", "Робить редʼюсери асинхронними, щоб вони могли чекати (`await`) на API"],
      ["It queues actions and dispatches them on the next animation frame", "Ставить дії в чергу й надсилає їх на наступному кадрі анімації"],
      ["It caches API responses by action type", "Кешує відповіді API за типом дії"],
    ],
    "a",
    [
      "The whole middleware is a few lines: `({ dispatch, getState }) => next => action => typeof action === 'function' ? action(dispatch, getState) : next(action)`. Reducers stay pure and synchronous; the async work happens in the thunk, which dispatches plain actions when it's done.",
      "Увесь middleware займає кілька рядків: `({ dispatch, getState }) => next => action => typeof action === 'function' ? action(dispatch, getState) : next(action)`. Редʼюсери лишаються чистими й синхронними; асинхронна робота відбувається в thunk, який після завершення надсилає звичайні дії.",
    ],
  ),
  quiz(
    "redux-combine-identity",
    ["redux"],
    4,
    120,
    ["combineReducers and references", "combineReducers і посилання"],
    [
      "`rootReducer = combineReducers({ todos, filter })`. Both slice reducers return their current state for unknown actions. What is `rootReducer(state, { type: 'noop' }) === state`?",
      "`rootReducer = combineReducers({ todos, filter })`. Обидва редʼюсери слайсів повертають поточний стан для невідомих дій. Чому дорівнює `rootReducer(state, { type: 'noop' }) === state`?",
    ],
    [
      ["`true`: the combined reducer reuses the old object when no slice changed", "`true`: об'єднаний редʼюсер повертає старий об'єкт, якщо жоден слайс не змінився"],
      ["`false`: it always builds a new object", "`false`: він завжди будує новий об'єкт"],
      ["It throws because `noop` is not handled", "Кидає помилку, бо `noop` не оброблено"],
      ["`undefined`", "`undefined`"],
    ],
    "a",
    [
      "`combineReducers` tracks whether any slice returned a different reference. If none did, it returns the previous state object, so subscribers and `useSelector` can skip work. That only holds if every slice reducer returns its own state unchanged for actions it ignores.",
      "`combineReducers` відстежує, чи повернув якийсь слайс інше посилання. Якщо ні, він повертає попередній об'єкт стану, і підписники та `useSelector` можуть пропустити роботу. Це працює, лише якщо кожен редʼюсер слайсу повертає власний стан без змін для дій, які ігнорує.",
    ],
  ),
  quiz(
    "redux-async-race",
    ["redux", w("async-javascript")],
    5,
    180,
    ["Out-of-order search results", "Результати пошуку не по черзі"],
    [
      "A search box dispatches `fetchResults(query)` (a `createAsyncThunk`) on every keystroke. Slow responses sometimes overwrite newer ones. Which fixes are correct? (Select all that apply.)",
      "Поле пошуку на кожне натискання надсилає `fetchResults(query)` (`createAsyncThunk`). Повільні відповіді іноді перезаписують новіші. Які виправлення правильні? (Оберіть усі.)",
    ],
    [
      ["In `pending`, store `action.meta.requestId`; in `fulfilled`, ignore results whose `requestId` isn't the latest", "У `pending` зберегти `action.meta.requestId`; у `fulfilled` ігнорувати результати, чий `requestId` не останній"],
      ["Make the reducer `async` and `await` the response", "Зробити редʼюсер `async` і чекати на відповідь через `await`"],
      ["Keep the promise returned by `dispatch` and call `.abort()` on it before starting the next search", "Зберегти проміс, який повертає `dispatch`, і викликати на ньому `.abort()` перед наступним пошуком"],
      ["Sort the results alphabetically so the order doesn't matter", "Сортувати результати за алфавітом, щоб порядок не мав значення"],
    ],
    "ac",
    [
      "Responses can arrive in any order, so the reducer must know which request is current. `createAsyncThunk` gives every call a `meta.requestId` you can compare, and the dispatched promise has `.abort()`, which sends an `AbortSignal` to your payload creator (pass it to `fetch`). RTK Query and `switchMap` in RxJS solve the same race. Reducers can never be async.",
      "Відповіді можуть приходити в будь-якому порядку, тож редʼюсер має знати, який запит актуальний. `createAsyncThunk` дає кожному виклику `meta.requestId` для порівняння, а надісланий проміс має `.abort()`, що передає `AbortSignal` у ваш payload creator (передайте його у `fetch`). RTK Query і `switchMap` у RxJS розв'язують ту саму гонку. Редʼюсери ніколи не бувають асинхронними.",
    ],
  ),
  practice({
    slug: "redux-mini-store",
    skills: ["redux", w("state-management"), w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Build a mini Redux store", "Мінімальний Redux-стор"],
    prompt: [
      "Implement the core of Redux in `src/store.ts`:\n\n**`createStore(reducer, preloadedState?)`**\n- Initialise state by dispatching an internal action (e.g. `@@redux/INIT`), so reducers can fill in their defaults. A preloaded state wins.\n- `dispatch(action)` throws unless `action` is an object with a string `type`. Otherwise it runs the reducer, stores the result, notifies every subscriber, and returns the action.\n- `subscribe(listener)` returns an `unsubscribe` function (safe to call twice). A listener that unsubscribes during a dispatch must not stop the others from being notified.\n\n**`combineReducers(reducers)`**\n- Calls each slice reducer with only its own part of the state.\n- Returns the **same** state object when no slice changed, and a new one otherwise.",
      "Реалізуйте ядро Redux у `src/store.ts`:\n\n**`createStore(reducer, preloadedState?)`**\n- Ініціалізуйте стан, надіславши внутрішню дію (наприклад, `@@redux/INIT`), щоб редʼюсери заповнили значення за замовчуванням. Попередньо завантажений стан має пріоритет.\n- `dispatch(action)` кидає помилку, якщо `action` не є об'єктом з рядковим `type`. Інакше запускає редʼюсер, зберігає результат, сповіщає всіх підписників і повертає дію.\n- `subscribe(listener)` повертає функцію `unsubscribe` (її безпечно викликати двічі). Підписник, що відписується під час dispatch, не повинен завадити сповістити інших.\n\n**`combineReducers(reducers)`**\n- Викликає кожен редʼюсер слайсу лише з його частиною стану.\n- Повертає **той самий** об'єкт стану, якщо жоден слайс не змінився, і новий в іншому разі.",
    ],
    files: { "/src/store.ts": STORE_STARTER, "/index.ts": STORE_INDEX },
    visibleFiles: ["/src/store.ts", "/index.ts"],
    activeFile: "/src/store.ts",
    tests: STORE_TESTS,
    solution: { "/src/store.ts": STORE_SOLUTION },
    explanation: [
      "The store is a closure over `state` and a listener list. Initial state comes from running the reducer once with an internal action. Notifying a copy of the listener array means (un)subscribing mid-dispatch can't skip anyone. `combineReducers` runs every slice and keeps the previous object unless at least one slice returned a new reference, which is what makes `===` checks downstream cheap.",
      "Стор є замиканням над `state` і списком підписників. Початковий стан отримуємо, один раз запустивши редʼюсер із внутрішньою дією. Сповіщення копії масиву підписників означає, що відписка під час dispatch нікого не пропустить. `combineReducers` запускає кожен слайс і зберігає попередній об'єкт, якщо жоден слайс не повернув нове посилання; саме це робить перевірки `===` далі дешевими.",
    ],
  }),
  practice({
    slug: "redux-thunk-middleware",
    skills: ["redux", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Middleware: applyMiddleware, thunk and logger", "Middleware: applyMiddleware, thunk і logger"],
    prompt: [
      "`src/store.ts` has a working minimal store. Implement in `src/middleware.ts`:\n\n1. **`applyMiddleware(store, ...middlewares)`** returns a store whose `dispatch` runs through the middlewares (`api => next => action => result`), the **first one outermost**. The `api.dispatch` given to middlewares must go through the **whole chain** again (so a thunk can dispatch another thunk).\n2. **`thunk`**: if the action is a function, call it with `(dispatch, getState)` and return its result; otherwise pass it on.\n3. **`createLogger(log)`**: after the action reaches the reducer, call `log(\"<type>: <before as JSON> -> <after as JSON>\")`, e.g. `\"add: 0 -> 2\"`. Return the result of `next`.",
      "У `src/store.ts` є робочий мінімальний стор. Реалізуйте в `src/middleware.ts`:\n\n1. **`applyMiddleware(store, ...middlewares)`** повертає стор, чий `dispatch` проходить крізь middleware (`api => next => action => result`), **перший зовнішній**. `api.dispatch`, переданий у middleware, має знову проходити **весь ланцюжок** (щоб thunk міг надіслати інший thunk).\n2. **`thunk`**: якщо дія є функцією, викликати її з `(dispatch, getState)` і повернути результат; інакше передати далі.\n3. **`createLogger(log)`**: після того як дія дійшла до редʼюсера, викликати `log(\"<type>: <до у JSON> -> <після у JSON>\")`, наприклад `\"add: 0 -> 2\"`. Повернути результат `next`.",
    ],
    files: { "/src/middleware.ts": MIDDLEWARE_STARTER, "/src/store.ts": STORE_TS, "/index.ts": MIDDLEWARE_INDEX },
    visibleFiles: ["/src/middleware.ts", "/src/store.ts", "/index.ts"],
    activeFile: "/src/middleware.ts",
    tests: MIDDLEWARE_TESTS,
    solution: { "/src/middleware.ts": MIDDLEWARE_SOLUTION },
    explanation: [
      "`reduceRight` composes the chain so the first middleware wraps all the others and the innermost `next` is the store's real `dispatch`. Middlewares receive a `dispatch` that forwards to the final composed function, so actions dispatched from a thunk pass through the logger too. Thunk is a type check; the logger reads state before and after calling `next`.",
      "`reduceRight` компонує ланцюжок так, що перший middleware обгортає всі інші, а найглибший `next` є справжнім `dispatch` стору. Middleware отримують `dispatch`, який перенаправляє до остаточної скомпонованої функції, тож дії, надіслані з thunk, теж проходять крізь logger. Thunk є лише перевіркою типу; logger читає стан до і після виклику `next`.",
    ],
  }),
]);
