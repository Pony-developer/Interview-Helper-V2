## Why locking

When several threads read and write shared data, operations interleave in unpredictable ways. Even `count++` is three steps (read, add, write), so two threads can both read 5 and both write 6. **Exclusive locking** ensures only one thread at a time runs a critical section.

## lock and Monitor

```csharp
private readonly object _gate = new();
private decimal _balance;

public void Deposit(decimal amount)
{
    lock (_gate)
    {
        _balance += amount;
    }
}
```

`lock` is shorthand for `Monitor.Enter`/`Monitor.Exit` in a `try/finally`:

```csharp
bool taken = false;
try { Monitor.Enter(_gate, ref taken); _balance += amount; }
finally { if (taken) Monitor.Exit(_gate); }
```

Rules:

- **Lock on a private, dedicated object.** `lock(this)`, `lock(typeof(X))` or `lock("name")` let outside code take the same lock and cause contention or deadlock.
- **Every** access to the shared state (reads too) must go through the same lock.
- Keep critical sections short; never call unknown code (events, callbacks, virtual methods) while holding a lock.
- Locks are **reentrant**: the same thread can enter a lock it already holds.
- `Monitor.TryEnter(_gate, timeout)` gives up instead of waiting forever.
- .NET 9 adds `System.Threading.Lock`, a dedicated lock type; the `lock` statement uses it when available.

## Deadlocks

Two threads each hold a lock the other needs:

```
Thread 1: lock(A) … lock(B)        Thread 2: lock(B) … lock(A)
```

Both wait forever. Prevention:

1. **Lock ordering**: always acquire multiple locks in the same global order (by id, by name).
2. Hold as few locks as possible; avoid nested locks.
3. Use timeouts (`TryEnter`) to detect and back off.
4. Never block on async code inside a lock, and don't hold locks across `await` (the compiler forbids `await` inside `lock`).

## Mutex

A `Mutex` is like a lock but works **across processes** when named:

```csharp
using var mutex = new Mutex(initiallyOwned: false, name: @"Global\Shop.Importer");
if (!mutex.WaitOne(TimeSpan.Zero))
{
    Console.WriteLine("Another instance is already running");
    return;
}
try { RunImport(); }
finally { mutex.ReleaseMutex(); }
```

It's around 50 times slower than `lock` (a kernel object), and must be released by the thread that acquired it. If a process dies while holding it, the next waiter gets an `AbandonedMutexException`.

## SpinLock

`SpinLock` busy-waits instead of blocking. It only pays off for extremely short critical sections under low contention in very hot code; otherwise `lock` is better.

## Interview takeaways

- `lock` = `Monitor.Enter/Exit` in try/finally, on a private object, for all accesses to shared state.
- Deadlocks come from inconsistent lock order; enforce a global order.
- `Mutex` synchronizes processes; `lock` is for threads within one process.
