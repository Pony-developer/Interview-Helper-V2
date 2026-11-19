---
skill: react
title: "React fundamentals: rendering, state, effects and keys"
summary: "What actually happens when state changes, why keys matter, when effects run, and how to avoid the most common hooks mistakes."
readingMinutes: 9
---

React turns state into UI. Most interview questions test whether you understand **when** components render and **what** survives between renders.

## Rendering is calling your function

A component is a function from props and state to elements. React calls it again when:

- its state changes (`setState` with a different value according to `Object.is`),
- its parent re-renders (unless it is wrapped in `memo` and its props are shallow-equal),
- a context it reads changes.

Rendering must be **pure**: no subscriptions, timers or mutations of outside variables during render. Side effects go into event handlers or effects.

## State is a snapshot

```tsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  setCount(count + 1); // still uses the same snapshot → count + 1, not + 2
  setCount((c) => c + 1); // updater function → sees the latest queued value
}
```

Updates are **batched** and applied on the next render. Never mutate state objects: `items.push(x); setItems(items)` keeps the same reference and React may skip the render. Create a new array instead: `setItems([...items, x])`.

## Effects synchronise with the outside world

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup before re-run and on unmount
}, [tick]);
```

- With no dependency array, the effect runs after every render. With `[]`, it runs after mount. With `[a, b]`, it runs when `a` or `b` changes.
- List every reactive value you read. Missing dependencies cause stale closures.
- You often **don't need an effect**. Derive values during render (`const total = items.reduce(...)`) instead of copying them into state.

## Lists and keys

Keys tell React which item is which between renders:

```tsx
{todos.map((t) => <TodoRow key={t.id} todo={t} />)}
```

Using the array index as a key breaks when items are inserted or reordered: state and DOM input values stick to the wrong rows. Use a stable ID.

## Controlled inputs

A controlled input takes its value from state and reports changes:

```tsx
<input value={query} onChange={(e) => setQuery(e.target.value)} />
```

Derive the filtered list from `query` during render. Don't store it in a second piece of state.

## Performance tools

- `memo(Component)`: skip a re-render when props are shallow-equal.
- `useMemo(fn, deps)`: cache an expensive calculation.
- `useCallback(fn, deps)`: keep a stable function identity, for example for a memoised child.

Measure first. Unnecessary memoisation adds complexity and buys nothing.

## Interview checklist

- Explain the render → commit → effect order.
- Use updater functions when the next state depends on the previous one.
- Pick stable keys and explain what goes wrong with indexes.
- Remove effects that only transform data; keep the ones that talk to the outside world.
