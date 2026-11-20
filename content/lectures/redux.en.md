---
skill: redux
title: "Redux: a predictable store, actions, reducers and middleware"
summary: "The three principles, how dispatch flows through middleware into reducers, Redux Toolkit (createSlice, Immer, createAsyncThunk), selectors and memoisation, and when RTK Query beats a hand-written slice."
readingMinutes: 8
---

Redux keeps the shared client state of an app in **one store** and changes it only through **actions** handled by **pure reducers**. That makes every change explicit, loggable and replayable, which is why Redux DevTools can "time travel".

## The three principles

1. **Single source of truth.** The whole state tree lives in one store object.
2. **State is read-only.** The only way to change it is to `dispatch` an action: a plain object such as `{ type: "todos/added", payload: todo }`.
3. **Changes are made by pure functions.** A reducer `(state, action) => newState` never mutates its input, never performs side effects, and returns the same state for actions it doesn't handle.

## The data flow

```ts
const store = createStore(rootReducer);
store.subscribe(() => render(store.getState()));
store.dispatch({ type: "counter/incremented" });
```

`dispatch` runs the action through the **middleware chain**, then calls the root reducer, replaces the state, and notifies every subscriber. `combineReducers({ todos, filter })` builds the root reducer: each slice reducer only sees and returns its own part of the state, and the combined object is new only if some slice changed.

## Middleware

Middleware wraps `dispatch` with the signature `store => next => action => result`. It is where side effects belong:

```ts
const logger = (store) => (next) => (action) => {
  console.log("before", store.getState());
  const result = next(action);
  console.log("after", store.getState());
  return result;
};
```

**redux-thunk** lets you dispatch a function `(dispatch, getState) => …` instead of an object, which is how async work (fetching, then dispatching `succeeded` or `failed`) is usually written. Sagas and listeners are alternatives for complex workflows.

## Redux Toolkit (RTK)

Modern Redux is written with RTK, which removes most boilerplate:

```ts
const todosSlice = createSlice({
  name: "todos",
  initialState: [] as Todo[],
  reducers: {
    added(state, action: PayloadAction<Todo>) {
      state.push(action.payload); // Immer turns this into an immutable update
    },
  },
});
export const { added } = todosSlice.actions;
```

- `configureStore` adds thunk, DevTools and dev-only checks for mutations and non-serialisable values.
- `createSlice` generates action creators and type strings, and uses **Immer**: you may "mutate" the draft *or* return a new value, but not both.
- `createAsyncThunk` dispatches `pending`, `fulfilled` and `rejected` actions for you.
- **RTK Query** handles server state (caching, deduplication, invalidation). Don't copy API responses into hand-written slices.

## Reading state: selectors

Components read state with `useSelector(selector)`. It re-renders when the selected value changes by `===`, so a selector that builds a new array every time (`state.todos.filter(...)`) re-renders on **every** dispatch. Select primitive or stable values, or memoise derived data with `createSelector` (Reselect), which recomputes only when its inputs change.

## Keep the store small

- Store serialisable data only: no class instances, promises or DOM nodes.
- Normalise collections (`ids` plus `entities`, see `createEntityAdapter`).
- Keep local UI state (an input's text, whether a dropdown is open) in components.
- Derive instead of storing totals, filtered lists or flags you can compute.

## Interview checklist

- Explain why reducers must be pure and what breaks if they mutate (the reference doesn't change, so `useSelector` and React skip the update).
- Walk through `dispatch` → middleware → reducer → subscribers.
- Know what thunk middleware does in one line: if the action is a function, call it with `dispatch` and `getState`.
- Compare Redux to Context: Context is a way to pass a value down; it is not a store, and every consumer re-renders when the value changes.
