Question 134 ("how does `lock` work?") opens the door to the rest of the synchronization toolbox. A Senior should know what each primitive is for and what it costs.

## The toolbox

| Primitive | Scope | Use it for |
|---|---|---|
| `lock` / `Monitor` (.NET 9: `System.Threading.Lock`) | in-process, thread-affine | short critical sections in sync code |
| `SemaphoreSlim` | in-process, N holders, `WaitAsync` | async mutual exclusion, limiting concurrency |
| `ReaderWriterLockSlim` | in-process | many readers, rare writers, non-trivial read time |
| `Mutex` | OS-wide, can be named | one instance of an app per machine, cross-process |
| `Semaphore` | OS-wide | cross-process limits |
| `Interlocked` | a single variable | counters, flags, lock-free CAS loops |
| `volatile` / `Volatile` | visibility/ordering of one field | flags read by other threads |
| `ManualResetEventSlim`, `CountdownEvent`, `Barrier` | signalling | "wait until ready", "wait for N workers" |
| `Channel<T>`, `BlockingCollection<T>` | producer/consumer | pipelines with backpressure |
| `ConcurrentDictionary` & co. | thread-safe collections | shared caches, counters per key |

Prefer, in order: **no shared mutable state** (immutability, message passing, per-request objects) → thread-safe collections / channels → `lock` / `SemaphoreSlim` → `Interlocked` lock-free code only on measured hot paths.

## Interlocked and compare-and-swap

```csharp
Interlocked.Increment(ref _count);                       // atomic ++
Interlocked.Add(ref _total, amount);
var previous = Interlocked.Exchange(ref _state, 1);      // set and get the old value
// Compare-and-swap: the building block of lock-free algorithms
int seen = Interlocked.CompareExchange(ref _value, newValue, expected);   // returns the value before the call
```

A CAS loop retries until nobody interfered:

```csharp
int current = Volatile.Read(ref _max);
while (candidate > current)
{
    int seen = Interlocked.CompareExchange(ref _max, candidate, current);
    if (seen == current) break;   // we won
    current = seen;               // someone changed it; re-check with the new value
}
```

Lock-free code avoids blocking and deadlocks but is hard to get right (ABA problem, livelock under contention) — the BCL's `ConcurrentQueue` and `ConcurrentStack` are lock-free so you rarely need your own. The practice implements a Treiber stack and an atomic `Max`.

## The memory model in one paragraph

Compilers, the JIT and CPUs may reorder reads and writes and keep values in registers/caches, as long as a *single* thread can't tell. Another thread can see writes in a surprising order. `lock`, `Interlocked`, `Volatile.Read/Write`, `Thread.MemoryBarrier` and `Task`/`await` boundaries introduce **memory barriers** that make writes visible. On x64 the hardware is fairly strong; on ARM (Apple silicon, Graviton, Ampere) more reorderings are possible, so code that "worked on my machine" may break. Rule: any shared field accessed by several threads without a lock must go through `Volatile` or `Interlocked`.

## Classic bugs

```csharp
// 1. Double-checked locking without volatile (pre-.NET 2.0 memory models broke this): use Lazy<T> instead
// 2. Lock on a public object or a string literal → other code can deadlock you
// 3. Lock ordering: Transfer(a, b) locks a then b, Transfer(b, a) locks b then a → deadlock; order by id
// 4. Calling unknown code (events, callbacks) while holding a lock
// 5. Blocking on async inside a lock → thread-pool starvation; use SemaphoreSlim.WaitAsync
// 6. "Check then act" on a ConcurrentDictionary: if (!d.ContainsKey(k)) d[k] = v;  → use TryAdd / GetOrAdd / AddOrUpdate
```

## Context-flowing state

- `ThreadLocal<T>` / `[ThreadStatic]` — a value per OS thread; dangerous with async (the continuation may run on another thread).
- `AsyncLocal<T>` — flows with the `ExecutionContext` across awaits; used for correlation ids, `Activity.Current`, `IHttpContextAccessor`.

## Diagnosing concurrency problems

`dotnet-counters` (lock contention count, thread-pool queue length), `dotnet-dump analyze` → `clrstack -all`, `syncblk` (who holds which monitor), Visual Studio's Parallel Stacks and the Concurrency Visualizer, and stress tests that run the code many times in parallel.
