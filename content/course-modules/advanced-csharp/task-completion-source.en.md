## A task you complete yourself

Most tasks are produced by `Task.Run` or async methods. `TaskCompletionSource<T>` creates a task that **you** complete, whenever and however you like:

```csharp
var tcs = new TaskCompletionSource<int>();
Task<int> task = tcs.Task;          // hand this out

// later, from anywhere:
tcs.SetResult(42);                  // or SetException(ex) / SetCanceled()
// Try* versions return false instead of throwing if the task is already completed
```

No thread is involved: the task just waits until someone calls one of the `Set` methods. That makes `TaskCompletionSource` the universal adapter for turning **any** completion signal into a task.

## Wrapping a callback API

```csharp
public static Task<Location> LocateAsync(this LegacyGps gps)
{
    var tcs = new TaskCompletionSource<Location>(TaskCreationOptions.RunContinuationsAsynchronously);
    gps.Locate(
        onFix: loc => tcs.TrySetResult(loc),
        onError: err => tcs.TrySetException(new GpsException(err)));
    return tcs.Task;
}

var where = await gps.LocateAsync();
```

## Wrapping an event

```csharp
public static Task<string> NextMessageAsync(this ChatClient client)
{
    var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
    EventHandler<string>? handler = null;
    handler = (_, msg) =>
    {
        client.MessageReceived -= handler;    // unsubscribe: avoid leaks and double completion
        tcs.TrySetResult(msg);
    };
    client.MessageReceived += handler;
    return tcs.Task;
}
```

## Why RunContinuationsAsynchronously

By default, `SetResult` runs the awaiting continuations **synchronously, on the thread that called SetResult**. If that thread holds a lock or is a callback thread of some library, the continuation runs inside it, which can cause deadlocks or reentrancy bugs. `TaskCreationOptions.RunContinuationsAsynchronously` queues the continuations instead. Use it as the default.

## Task.Delay is built this way

Conceptually, `Task.Delay` is a `TaskCompletionSource` plus a timer:

```csharp
static Task Delay(int ms)
{
    var tcs = new TaskCompletionSource<object?>();
    var timer = new System.Timers.Timer(ms) { AutoReset = false };
    timer.Elapsed += (_, _) => { timer.Dispose(); tcs.SetResult(null); };
    timer.Start();
    return tcs.Task;
}
```

So a thousand concurrent `await Task.Delay(1000)` calls use a thousand timers and **zero** blocked threads, unlike a thousand `Thread.Sleep(1000)` calls. That's the essence of why async I/O scales: waiting doesn't need a thread.

## Timeouts and cancellation with TCS

```csharp
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
using (cts.Token.Register(() => tcs.TrySetCanceled()))
{
    var result = await tcs.Task;   // throws TaskCanceledException after 5 s
}

// .NET 6: any task can be awaited with a timeout
var data = await SlowAsync().WaitAsync(TimeSpan.FromSeconds(5));
```

## Interview takeaways

- `TaskCompletionSource<T>` makes a task you complete manually; no thread is used.
- It adapts callbacks, events and other signals to `await`.
- Create it with `RunContinuationsAsynchronously`; use `TrySet*` when several paths may complete it.
