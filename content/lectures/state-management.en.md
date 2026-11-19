---
skill: state-management
title: "State management: where state lives and how it changes"
summary: "Local vs shared vs server state, single source of truth, reducers and immutability, selectors and derived data, and when a store library is worth it."
readingMinutes: 8
---

Most UI bugs are state bugs: two copies that disagree, a mutation nobody noticed, or a value that should have been derived. Good state management is mostly about **where** state lives and **how** it changes.

## Kinds of state

| Kind | Examples | Usually lives in |
| --- | --- | --- |
| Local UI state | input text, open/closed | component state |
| Shared client state | cart, theme, current user | context, store (Redux, NgRx, Zustand, signals) |
| Server state | lists from the API | a cache (TanStack Query, RTK Query, SWR), not a hand-written store |
| URL state | filters, page, selected tab | the URL (shareable, survives reloads) |
| Form state | values, validation, touched | a form library or local state |

Keep state as **local as possible** and lift it only when siblings need it. Treat server data as a cache with loading/error/stale states instead of copying it into a global store.

## Single source of truth and derived data

Store the minimum, and derive the rest during render or in selectors:

```ts
// ✗ items, total and count stored separately (they drift apart)
// ✓ store items, derive the rest
const total = items.reduce((s, i) => s + i.price * i.qty, 0);
```

Normalise relational data (`byId` maps plus id arrays) so each entity exists once.

## Reducers and immutability

A reducer is a pure function `(state, action) => newState`:

```ts
function cartReducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.id === action.item.id);
      return {
        ...state,
        items: existing
          ? state.items.map((i) => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i))
          : [...state.items, { ...action.item, qty: 1 }],
      };
    }
    default:
      return state;
  }
}
```

- **Never mutate**: return new objects or arrays for anything that changed, and reuse references for what didn't. That's how React, Redux selectors and Angular OnPush detect changes cheaply (`prev !== next`).
- Unknown actions return the same state object.
- Libraries like Immer (built into Redux Toolkit) let you write "mutating" code that produces immutable updates.

## Selectors

Selectors read and derive state (`selectCartTotal`). Memoised selectors (`createSelector`) recompute only when inputs change and keep returned references stable, which avoids needless re-renders.

## Side effects

Keep reducers pure. Put requests, timers and storage in thunks, sagas, NgRx effects or query libraries, and dispatch actions with the results (`loading` → `success`/`failure`).

## Choosing tools

- React: `useState`/`useReducer` + context for small shared state; Zustand/Redux Toolkit for larger client state; TanStack Query for server state.
- Angular: services with signals or BehaviorSubject; NgRx for large apps that need strict patterns and devtools.

Don't add a global store "just in case". Add structure when state is shared widely, changes in complex ways, or needs time-travel debugging.

## Interview checklist

- Classify state and decide where it should live.
- Write a pure, immutable reducer and explain why immutability matters.
- Derive data instead of duplicating it.
- Separate server state (cache) from client state.
