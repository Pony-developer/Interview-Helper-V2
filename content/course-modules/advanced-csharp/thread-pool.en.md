## Recycling threads

Creating a thread costs tens to hundreds of microseconds and about 1 MB of reserved stack. The **thread pool** keeps a set of ready threads and hands them short work items, so you pay the startup cost once.

```csharp
ThreadPool.QueueUserWorkItem(_ => Console.WriteLine("on a pool thread"));
Task.Run(() => Compute());                         // the usual way: Task.Run queues to the pool
Console.WriteLine(Thread.CurrentThread.IsThreadPoolThread);
```

Pool threads are **background** threads. Their name, priority and culture shouldn't be changed (or must be restored), since the next work item gets the same thread.

## Who uses the pool

Almost everything asynchronous: `Task.Run`, timer callbacks, `Parallel.For`, PLINQ, continuations after `await` in ASP.NET Core and console apps, I/O completion callbacks.

## How the pool sizes itself

- It starts with a **minimum** number of threads (by default, one per CPU core) available immediately.
- When all are busy and work is queued, the **hill-climbing** algorithm adds threads gradually (roughly one or two per second beyond the minimum), measuring whether throughput improves.
- Idle threads above the minimum retire after a while.

There are two kinds of pool threads: **worker** threads (for your work items) and **I/O completion** threads (for async I/O callbacks on Windows).

## Thread-pool starvation

The slow growth is deliberate: it avoids creating hundreds of threads for CPU-bound bursts. But if work items **block** (synchronous I/O, `.Result` on a task, `Thread.Sleep`), each one ties up a thread, the queue grows, and the pool adds threads too slowly to keep up. The symptoms: requests that take seconds although CPU usage is low, timeouts under load, then sudden recovery.

Typical cause in ASP.NET Core: **sync-over-async**:

```csharp
public IActionResult Get() => Ok(_client.GetStringAsync(url).Result);   // blocks a pool thread per request
public async Task<IActionResult> Get() => Ok(await _client.GetStringAsync(url));   // frees the thread while waiting
```

Fixes, in order of preference:

1. make the code async all the way down;
2. move genuinely blocking long-running work to a dedicated thread (`TaskCreationOptions.LongRunning`);
3. as a stopgap, raise the minimum: `ThreadPool.SetMinThreads(...)`.

Diagnose with `dotnet-counters` (`ThreadPool Queue Length`, `ThreadPool Thread Count`) or `dotnet-stack` (many threads stuck in `.Result`/`Wait`).

## Ensuring work runs on the pool

When you need to guarantee code runs off the current thread (for example to keep a UI responsive during CPU-heavy work), use `await Task.Run(() => HeavyCalculation())`. Don't wrap I/O-bound async methods in `Task.Run`: they don't need a thread while they wait.

## Interview takeaways

- The pool reuses background threads for short work items; `Task.Run` is the usual entry point.
- It grows slowly beyond its minimum, so blocking pool threads causes starvation.
- Avoid sync-over-async (`.Result`, `.Wait()`) on servers; go async all the way.
