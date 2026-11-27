"How does async/await work in detail?" (Q133) — the strongest answer shows roughly what the compiler generates.

## The source

```csharp
public async Task<int> GetLengthAsync(string url)
{
    Console.WriteLine("start");
    string body = await _http.GetStringAsync(url);
    return body.Length;
}
```

## What the compiler produces (simplified)

```csharp
public Task<int> GetLengthAsync(string url)
{
    var sm = new GetLengthStateMachine();          // a struct in Release builds
    sm.builder = AsyncTaskMethodBuilder<int>.Create();
    sm.self = this;
    sm.url = url;
    sm.state = -1;
    sm.builder.Start(ref sm);                      // runs MoveNext() synchronously, right now
    return sm.builder.Task;
}

struct GetLengthStateMachine : IAsyncStateMachine
{
    public int state;
    public AsyncTaskMethodBuilder<int> builder;
    public MyClient self;
    public string url;
    private TaskAwaiter<string> awaiter;           // locals that live across await become fields

    public void MoveNext()
    {
        int result;
        try
        {
            if (state == -1)
            {
                Console.WriteLine("start");
                awaiter = self._http.GetStringAsync(url).GetAwaiter();
                if (!awaiter.IsCompleted)
                {
                    state = 0;
                    builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);  // boxes the struct the first time
                    return;                                                // the caller gets an incomplete Task
                }
            }
            // state == 0: resumed by the continuation (or completed synchronously)
            string body = awaiter.GetResult();       // throws here if the task faulted
            result = body.Length;
        }
        catch (Exception ex)
        {
            state = -2;
            builder.SetException(ex);                // the exception goes into the Task
            return;
        }
        state = -2;
        builder.SetResult(result);                   // completes the Task, runs continuations
    }

    public void SetStateMachine(IAsyncStateMachine sm) => builder.SetStateMachine(sm);
}
```

Key facts to say out loud:
- The method runs **synchronously until the first `await` of an incomplete task**. An async method that never really awaits completes synchronously (and `ValueTask` then avoids even the `Task` allocation).
- Locals become **fields**; the struct is **boxed onto the heap** only when the method actually suspends.
- `AwaitUnsafeOnCompleted` registers `MoveNext` as the continuation. Where it runs depends on the captured **`SynchronizationContext`** (UI thread, classic ASP.NET) or `TaskScheduler`; with none (ASP.NET Core, console) it runs on a thread-pool thread — or inline on the thread that completed the I/O.
- **No thread is waiting** during the I/O. "There is no thread" is the key idea for I/O-bound async.
- Exceptions are captured into the task and rethrown by `GetResult()` at the `await`, with the original stack trace preserved (`ExceptionDispatchInfo`).

## Awaitables

`await x` works on anything with a `GetAwaiter()` method returning a type with `IsCompleted`, `OnCompleted`/`UnsafeOnCompleted` and `GetResult()` — that's how `Task`, `ValueTask`, `YieldAwaitable` (`Task.Yield()`), `ConfiguredTaskAwaitable` and custom awaitables plug in.

## async void, again

`async void` uses `AsyncVoidMethodBuilder`: there's no task to return, so the caller can't await it, and an exception in it is posted to the `SynchronizationContext` (or thrown on the thread pool), which **terminates the process** in .NET Core. Legitimate only for event handlers. For fire-and-forget work in services:

```csharp
// risky: exceptions are lost or crash the process, no shutdown handling
_ = SendEmailAsync(order);

// better: a background queue processed by a hosted service
await _queue.Writer.WriteAsync(new SendEmail(order.Id), ct);   // Channel<T> + BackgroundService
```

## Common async bugs to mention

- `async` lambdas passed where an `Action` is expected (e.g. `List.ForEach(async x => …)`) become `async void`.
- Forgetting `await` → fire-and-forget with unobserved exceptions (watch for warning CS4014).
- `await` inside a loop for independent operations → sequential; use `Task.WhenAll` (with a concurrency limit if needed).
- Not passing `CancellationToken`; `Task.Result` / `.Wait()` in sync code paths.
- Returning a `Task` from inside `using` without awaiting it → the resource is disposed before the work finishes.
