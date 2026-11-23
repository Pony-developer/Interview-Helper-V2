`lock` answers one question: "only one thread at a time". Other problems need other tools.

## `SemaphoreSlim`: at most N at a time

A semaphore has a counter of free places. `Wait` takes a place (and waits if there is none), `Release` returns it.

```csharp
private static readonly SemaphoreSlim slots = new SemaphoreSlim(3);   // 3 places

static async Task<string> DownloadAsync(string url)
{
    await slots.WaitAsync();          // waits without blocking a thread
    try
    {
        return await http.GetStringAsync(url);
    }
    finally
    {
        slots.Release();              // always give the place back
    }
}
```

Now a thousand calls run with at most three downloads at once: the server is not overloaded, and the thread pool is not blocked.

`new SemaphoreSlim(1, 1)` is a lock that works with `await`. It is **not** reentrant: if the same flow calls `WaitAsync` twice without `Release`, it waits for itself forever.

## `Mutex`: a lock between processes

A named `Mutex` is visible to all processes on the machine. A typical use is "only one copy of the program may run":

```csharp
using var mutex = new Mutex(true, "MyApp.SingleInstance", out bool isFirst);
if (!isFirst) return;   // another copy is already running
```

It is much slower than `lock`, so use it only when processes must cooperate.

## `ReaderWriterLockSlim`: many readers, one writer

When data is read very often and changed rarely, a plain lock makes readers wait for each other for no reason. `ReaderWriterLockSlim` lets any number of readers in together, but a writer gets the data alone:

```csharp
rw.EnterReadLock();  try { return cache[key]; } finally { rw.ExitReadLock(); }
rw.EnterWriteLock(); try { cache[key] = value; } finally { rw.ExitWriteLock(); }
```

Measure before using it: for short critical sections a simple `lock` is often faster.

## Signals: `ManualResetEventSlim` and `CountdownEvent`

These do not protect data; they let one thread **wait for an event** in another.

- `ManualResetEventSlim`: a gate. `Wait()` blocks while it is closed; `Set()` opens it for everyone; `Reset()` closes it again.
- `CountdownEvent`: opens after `Signal()` was called N times, for example "wait until all 5 workers are ready".

In async code, the same role is played by `TaskCompletionSource<T>`: one side awaits `tcs.Task`, the other calls `tcs.SetResult(value)`.

## Which one to choose

| Need | Tool |
|---|---|
| One thread at a time, synchronous code | `lock` |
| One at a time, with `await` inside | `SemaphoreSlim(1, 1)` |
| At most N at a time | `SemaphoreSlim(N)` |
| Between processes | named `Mutex` |
| Many readers, rare writers | `ReaderWriterLockSlim` |
| Wait for a signal | `ManualResetEventSlim`, `TaskCompletionSource` |
| A single counter or flag | `Interlocked` |

## The rule

Pick the tool by the question you are answering: "who may enter", "how many may enter", or "when may I continue". Always release in `finally`.
