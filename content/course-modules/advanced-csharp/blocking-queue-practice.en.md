## Task

Build a bounded producer/consumer queue, the core of `BlockingCollection<T>`, with `lock`, `Monitor.Wait` and `Monitor.PulseAll`. All three methods work inside `lock (_sync)`.

1. **`Add(item)`**: while the queue is full (`Count >= capacity`), `Monitor.Wait(_sync)`. If adding has been completed, throw `InvalidOperationException("Adding is completed")`. Otherwise enqueue and `PulseAll` (a consumer may be waiting for an item).
2. **`TryTake(out item)`**: while the queue is empty **and** not completed, wait. If it's still empty (so it's completed and drained), return `false`. Otherwise dequeue, `PulseAll` (a producer may be waiting for space) and return `true`.
3. **`CompleteAdding()`**: set the completed flag and `PulseAll`, so consumers blocked on an empty queue wake up and finish.

Always wait in a **`while` loop**, never an `if`: after waking up, another thread may already have taken the item or filled the slot.

Two producers add 1..2000 through a queue of capacity 5 while three consumers take items.

Expected output:

```
consumed: 2000
total: 2001000
Adding is completed
```
