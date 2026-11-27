## Cooperative cancellation

.NET never kills a running operation from outside. Cancellation is **cooperative**: the caller signals a request, and the operation checks for it at convenient points and stops cleanly.

```csharp
using var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;          // hand the token to the operation

Task work = ProcessAsync(token);
cts.Cancel();                                 // request cancellation (from a Cancel button, shutdown...)
cts.CancelAfter(TimeSpan.FromSeconds(30));    // or automatically after a timeout

async Task ProcessAsync(CancellationToken ct)
{
    foreach (var file in files)
    {
        ct.ThrowIfCancellationRequested();     // check at loop boundaries
        await _store.UploadAsync(file, ct);    // and pass the token down to every async API
    }
}
```

- `ThrowIfCancellationRequested` throws `OperationCanceledException`; the task ends in the **Canceled** state, and `await` rethrows the exception (`TaskCanceledException` derives from it, so catch `OperationCanceledException`).
- Pass the token to **every** async call that accepts one: `HttpClient`, EF Core, streams, `Task.Delay`.
- Accept a token as the **last parameter**, usually with a default: `CancellationToken ct = default`.
- ASP.NET Core gives you `HttpContext.RequestAborted` (or a `CancellationToken` action parameter) that fires when the client disconnects.

## Linking and registering

```csharp
// cancel when EITHER the caller cancels OR our own timeout fires
using var linked = CancellationTokenSource.CreateLinkedTokenSource(callerToken);
linked.CancelAfter(TimeSpan.FromSeconds(10));

// run a callback on cancellation (e.g. to cancel a non-token-aware API)
using CancellationTokenRegistration reg = token.Register(() => legacyClient.Abort());
```

Dispose `CancellationTokenSource`s you create (especially those with timers) and registrations.

## Timeouts

```csharp
var data = await GetAsync(url).WaitAsync(TimeSpan.FromSeconds(5));          // .NET 6
var winner = await Task.WhenAny(GetAsync(url), Task.Delay(5000));          // the classic way
if (winner is not Task<string> t) throw new TimeoutException();
```

`WaitAsync` and the `WhenAny` trick stop **waiting**, but the operation keeps running in the background. To actually stop it, use a token with `CancelAfter`.

## Reporting progress

```csharp
public async Task ImportAsync(IReadOnlyList<string> files, IProgress<int>? progress, CancellationToken ct)
{
    for (int i = 0; i < files.Count; i++)
    {
        ct.ThrowIfCancellationRequested();
        await ImportFileAsync(files[i], ct);
        progress?.Report((i + 1) * 100 / files.Count);
    }
}

// caller (UI): Progress<T> captures the SynchronizationContext, so the callback runs on the UI thread
var progress = new Progress<int>(p => ProgressBar.Value = p);
await ImportAsync(files, progress, cts.Token);
```

`Progress<T>` posts each report to the context captured when it was **created**. In a console app (no context) reports run on pool threads, possibly out of order; for ordered console output, implement `IProgress<T>` synchronously, as the practice does.

## The Task-based Asynchronous Pattern (TAP)

The conventions .NET's async APIs follow:

- method name ends in `Async`, returns `Task`/`Task<T>`/`ValueTask`;
- returns a "hot" (already started) task;
- accepts an optional `CancellationToken` and/or `IProgress<T>`;
- throws argument exceptions synchronously when possible (validate before the first `await`);
- doesn't block the caller, and returns quickly.

## Interview takeaways

- Cancellation is cooperative: pass a `CancellationToken` everywhere and check it at safe points.
- `OperationCanceledException` marks a task Canceled; linked sources combine tokens; `CancelAfter` adds timeouts.
- `IProgress<T>`/`Progress<T>` report progress, marshaling to the UI thread automatically.
