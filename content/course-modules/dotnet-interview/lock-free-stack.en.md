## Task

Question 134 asks how `lock` works; the natural follow-up is "can you do it without a lock?". Implement two lock-free operations with `Interlocked.CompareExchange` (compare-and-swap):

1. **`LockFreeStack<T>.Push(value)`** — a Treiber stack: create the node; in a loop read the current `head` (`Volatile.Read`), point `node.Next` at it, and try `Interlocked.CompareExchange(ref head, node, observed)`. If it returned `observed`, you won; otherwise another thread changed `head` — retry.
2. **`TryPop(out value)`** — in a loop read `head`; if it's `null`, return `false`; otherwise try to swing `head` from `observed` to `observed.Next` with CompareExchange; on success return the observed node's value.
3. **`Atomic.Max(ref target, value)`** — set `target` to `value` only if `value` is larger, atomically and without a lock: read the current value, and while `value` is larger try CompareExchange; if it fails, continue with the value it returned.

The test pushes 10,000 numbers from many threads, pops them with four threads at once, and checks that nothing was lost or duplicated (the sum of 0..9999 is 49,995,000).

Expected output:

```
pushed: 10000
popped: 10000, sum: 49995000, empty: True
max: 100002
```
