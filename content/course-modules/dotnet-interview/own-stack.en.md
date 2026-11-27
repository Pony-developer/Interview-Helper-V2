## Task

Questions 143–144: "How does `IEnumerable<T>` work in detail?" and "Which algorithm does `Stack` use?" Re-create the essentials of `Stack<T>`: an array that grows, and an enumerator that detects changes.

Complete `ArrayStack<T>`:

1. **`Push(item)`** — when the array is full, double it (`Array.Resize`); store the item at `items[size++]`; increment `version`.
2. **`Pop()`** — throw `InvalidOperationException("Stack empty")` when empty; take `items[--size]`, **clear the slot** (`default(T)`) so the GC can collect a reference-type item; increment `version`.
3. **`Peek()`** — the top item without removing it; the same exception when empty.
4. **`GetEnumerator()`** — yield the items from the top to the bottom. Remember `version` when the enumeration starts and throw `InvalidOperationException` as soon as it differs (check before yielding each item) — that's exactly why changing a `List<T>` inside its `foreach` throws.

Note that a stack doesn't shrink after pops: the capacity stays 8.

Expected output:

```
5 8
5 4 3 2 1
5 4 4
empty: Stack empty
modified during enumeration
count 3, top 21, capacity 8
```
