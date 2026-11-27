---
skill: dotnet-async
title: ".NET async and threading: Task, async/await, locks and the thread pool"
summary: "Threads vs the thread pool vs tasks, what await really does (the state machine and SynchronizationContext), deadlocks from .Result, ConfigureAwait, cancellation, ValueTask, lock and SemaphoreSlim, Interlocked, concurrent collections, and Parallel vs Task.WhenAll."
readingMinutes: 10
---

Async questions separate Middle from Junior candidates. The key idea to get across: **asynchronous is not the same as parallel**. `async`/`await` frees a thread while waiting for I/O; parallelism uses several threads to compute at the same time.

## Threads, the thread pool and tasks

A `Thread` is an OS thread with its own stack (about 1 MB reserved), and it's expensive to create. The **thread pool** keeps a set of worker threads and reuses them for short work items. A `Task` is a promise of a result. It may run on a pool thread (`Task.Run`) or represent I/O that uses no thread at all while it waits (`File.ReadAllTextAsync`, `HttpClient.GetAsync`).

Use `Task.Run` for CPU-bound work you want off the current thread (a UI thread, for example). In ASP.NET Core it only moves work from one pool thread to another, so don't wrap synchronous code in `Task.Run` there.

## What await does

The compiler turns an `async` method into a **state machine**. At each `await` on an unfinished task it saves the locals, registers a continuation and **returns** to the caller. When the task completes, the continuation resumes the method, on the captured **SynchronizationContext** if there is one (the UI thread in WPF/WinForms), or on a pool thread otherwise. ASP.NET Core has no SynchronizationContext.

```csharp
public async Task<int> CountAsync(string url, CancellationToken ct)
{
    var html = await _http.GetStringAsync(url, ct); // no thread is blocked while waiting
    return html.Length;
}
```

## Classic mistakes

- **Sync over async**: `.Result` or `.Wait()` blocks a thread. With a SynchronizationContext it **deadlocks**: the blocked UI thread is the one the continuation needs. Without one it still wastes pool threads and leads to **thread pool starvation** under load. Be async all the way down.
- `ConfigureAwait(false)` in library code says "I don't need the original context", which avoids the deadlock and an extra hop. Application code in ASP.NET Core doesn't need it.
- **`async void`**: callers can't await it, and its exceptions crash the process. Only event handlers should be `async void`.
- Forgetting to await: the task runs unobserved and its exception is lost.
- Running independent calls one after another: `await a; await b;` takes the sum of the times. Start both and `await Task.WhenAll(a, b)`.

## Cancellation and timeouts

Pass a `CancellationToken` through every async method. The callee checks `ct.ThrowIfCancellationRequested()` or forwards the token to I/O calls; the caller cancels through a `CancellationTokenSource`, for example `new CancellationTokenSource(TimeSpan.FromSeconds(5))`. In ASP.NET Core, `HttpContext.RequestAborted` cancels when the client disconnects.

## ValueTask

`ValueTask<T>` avoids allocating a `Task` when the result is often available synchronously (a cache hit). It can be awaited **only once** and must not be awaited concurrently. Default to `Task`; use `ValueTask` on measured hot paths.

## Synchronisation

- `lock (obj) { ... }` (a `Monitor`) gives mutual exclusion within one process. You **can't `await` inside a `lock`**. Lock on a private object, never on `this` or a type.
- `SemaphoreSlim(1, 1)` with `await sem.WaitAsync()` is the async-friendly lock; `SemaphoreSlim(n)` throttles to n concurrent operations.
- `Interlocked.Increment` / `CompareExchange` give atomic operations without a lock. `count++` on a shared field is a race.
- `ReaderWriterLockSlim` lets many readers in at once; `volatile` only stops reordering and caching, so it is not a lock.
- Deadlocks come from taking two locks in different orders. Always acquire them in the same order, and keep critical sections small.

## Concurrent collections and parallelism

`ConcurrentDictionary` (with `GetOrAdd` and `AddOrUpdate`; the value factory may run more than once), `ConcurrentQueue`, `BlockingCollection` and `System.Threading.Channels` for producer/consumer. Use `Parallel.For`/`ForEach` and PLINQ for **CPU-bound** data parallelism. For I/O, use `Task.WhenAll` or `Parallel.ForEachAsync` with `MaxDegreeOfParallelism` to cap concurrency.

## Interview checklist

- Explain async vs parallel, and Thread vs thread pool vs Task.
- Describe what happens at an `await`, and why `.Result` can deadlock.
- Say when to use `ConfigureAwait(false)`, `ValueTask` and `Task.WhenAll`.
- Explain why `async void` is dangerous and how cancellation flows.
- Choose between `lock`, `SemaphoreSlim`, `Interlocked` and a concurrent collection.
