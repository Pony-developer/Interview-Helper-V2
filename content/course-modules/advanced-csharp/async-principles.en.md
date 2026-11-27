## Synchronous vs asynchronous

- A **synchronous** operation does its work before returning to the caller.
- An **asynchronous** operation can return **before** its work is done, handing back something (a task) that completes later.

Asynchrony is about not **waiting idly**. It's different from parallelism: async code may use just one thread.

## Two kinds of work

| | I/O-bound | CPU-bound |
| --- | --- | --- |
| Time spent | waiting for a disk, network or database | computing |
| Async solution | true async APIs (`ReadAsync`, `GetAsync`, `ToListAsync`): **no thread** waits | `Task.Run` to move work off the current thread (UI) or `Parallel`/PLINQ to use more cores |
| Scales by | releasing threads during waits | adding cores |

The key insight: during true async I/O, **no thread is blocked**. The OS completes the operation (via I/O completion ports on Windows, epoll on Linux) and the runtime schedules the continuation on a pool thread. A server handling 10,000 concurrent requests that each wait 200 ms on a database doesn't need 10,000 threads.

## Coarse-grained vs fine-grained concurrency

Before async/await, the way to avoid blocking was to run a whole synchronous operation on a background thread (**coarse-grained**): simple, but each waiting operation held a thread, and updating a UI from it required marshaling.

Async functions give **fine-grained** concurrency: the method itself is written sequentially, and each `await` is a point where it may pause without holding a thread. The UI thread stays responsive and continuations come back to it automatically.

## Why the UI thread matters

Desktop and mobile UI frameworks have one UI thread that processes the message loop. A long synchronous operation on it freezes the window. With async:

```csharp
private async void LoadButton_Click(object sender, RoutedEventArgs e)
{
    StatusText.Text = "Loading...";
    string data = await _client.GetStringAsync(url);   // the UI thread is free during the download
    StatusText.Text = $"{data.Length} chars";          // back on the UI thread: safe to touch controls
}
```

## Async all the way

Async is contagious, and that's intended: once the bottom of a call chain is async (network, database), every caller up the chain should be async too, ending at the framework (an ASP.NET Core action, a UI event handler, `async Task Main`). Blocking somewhere in the middle (`.Result`, `.Wait()`) throws away the benefits and invites deadlocks and thread-pool starvation.

## When async isn't worth it

- Pure CPU work on a server: `async` adds overhead without freeing anything; just compute (or parallelize).
- Very hot, mostly-synchronous paths: consider `ValueTask` or a synchronous fast path.
- Code that's naturally synchronous with no I/O: don't make it "async" by wrapping it in `Task.Run` in a library ("fake async"); let the caller decide.

## Interview takeaways

- Async = don't block while waiting; it's not the same as parallel.
- I/O-bound work uses true async APIs and no thread while waiting; CPU-bound work needs threads (`Task.Run`, `Parallel`).
- Go async all the way up; avoid sync-over-async.
