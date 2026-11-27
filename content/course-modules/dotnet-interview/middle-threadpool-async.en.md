## The classic sync-over-async deadlock (Q119)

```csharp
// WinForms / WPF / classic ASP.NET (they have a SynchronizationContext)
private void Button_Click(object sender, EventArgs e)
{
    var text = LoadAsync().Result;      // 1. blocks the UI thread, waiting for the task
}

private async Task<string> LoadAsync()
{
    var s = await http.GetStringAsync(url);   // 2. when the download completes, the continuation
    return s.ToUpper();                        //    must run on the UI thread — which is blocked → deadlock
}
```

Two fixes: make it async all the way (`private async void Button_Click(...) { var text = await LoadAsync(); }`), and in library code use `await http.GetStringAsync(url).ConfigureAwait(false)` so the continuation doesn't need the captured context. ASP.NET Core has no `SynchronizationContext`, so this exact deadlock doesn't happen there — but blocking still wastes threads.

`ConfigureAwait(false)` applies to one `await`; code after it may run on a thread-pool thread, so don't touch UI controls there. .NET 8 adds `ConfigureAwaitOptions` (e.g. `SuppressThrowing`, `ForceYielding`).

## Thread-pool starvation (Q120)

```csharp
// Blocking: each request holds a thread for the whole DB call
[HttpGet] public Order Get(int id) => _db.Orders.Find(id);                       // or ...Async().Result

// Async: the thread returns to the pool while the database works
[HttpGet] public async Task<Order?> Get(int id) => await _db.Orders.FindAsync(id);
```

With 16 threads and a 200 ms query, the blocking version serves at most 16 / 0.2 = **80 requests per second**, and extra requests wait in the queue; the pool then adds threads slowly (about one or two per second beyond the minimum), so latency explodes under a burst. The async version holds no thread during the 200 ms; throughput is limited by the database, not by threads.

Symptoms of starvation: rising latency while CPU is low, growing `ThreadPool.PendingWorkItemCount` / "ThreadPool Queue Length" in `dotnet-counters`, many threads blocked in `Task.Wait` / `.Result` in a dump. Fix the blocking calls; raising `SetMinThreads` only buys time.

## Inside the ThreadPool (Q121)

```text
            ┌──────────── global queue (FIFO) ◄── Task.Run / QueueUserWorkItem from non-pool threads
worker 1 ── local queue (LIFO) ◄── tasks created by code running on worker 1
worker 2 ── local queue        ── steals from the tail of others' queues when idle
worker N ── ...
I/O completion: the OS signals a finished async I/O → its continuation is queued to the pool
```

Lifecycle of a work item: queue it → an idle worker dequeues it (own local queue first, then the global queue, then steals) → runs the delegate to completion on that thread → the thread loops back for more work. Threads aren't "returned"; they just finish the delegate and pick up the next item. Idle workers retire after a while.

Thread injection: the pool keeps at least `MinThreads` (= number of cores by default) and uses a **hill-climbing** algorithm to add threads when throughput improves; when work items block, a starvation detector adds roughly one thread per second (faster in recent .NET versions for blocking waits on tasks).

Long-running CPU work should not sit on pool threads for minutes: use `Task.Factory.StartNew(…, TaskCreationOptions.LongRunning)` (a dedicated thread) or a `BackgroundService`.

## Async vs parallel, once more

```csharp
// I/O-bound: concurrency without threads
var pages = await Task.WhenAll(urls.Select(u => http.GetStringAsync(u)));

// CPU-bound: parallelism on several cores
Parallel.ForEach(images, new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount }, Resize);

// Both: limit concurrency of async work
await Parallel.ForEachAsync(urls, new ParallelOptions { MaxDegreeOfParallelism = 8 }, async (u, ct) => await DownloadAsync(u, ct));
```
