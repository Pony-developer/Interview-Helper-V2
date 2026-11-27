## Why learn dead patterns?

Before tasks (.NET 4) and async/await (C# 5), .NET had two other asynchronous patterns. You'll still meet them in old code, older libraries and interviews, and you need to know how to wrap them in tasks.

## APM: the Asynchronous Programming Model (.NET 1.0)

A pair of `BeginXxx`/`EndXxx` methods with an `IAsyncResult`:

```csharp
IAsyncResult ar = stream.BeginRead(buffer, 0, buffer.Length, callback: OnReadDone, state: stream);

void OnReadDone(IAsyncResult ar)
{
    var s = (Stream)ar.AsyncState!;
    int bytes = s.EndRead(ar);              // gets the result or rethrows the exception
}
```

- The callback runs on a pool thread when the operation finishes.
- You must call `EndXxx` exactly once, or resources leak.
- Chaining several operations means nested callbacks: hard to read, hard to handle errors.

Wrapping APM in a task:

```csharp
Task<int> readTask = Task.Factory.FromAsync(stream.BeginRead, stream.EndRead, buffer, 0, buffer.Length, null);
```

## EAP: the Event-based Asynchronous Pattern (.NET 2.0)

A method `XxxAsync` plus an `XxxCompleted` event, and often a `CancelAsync` method and a `ProgressChanged` event. It was designed for UI code: events are raised on the captured `SynchronizationContext`, so handlers can touch controls.

```csharp
var wc = new WebClient();
wc.DownloadStringCompleted += (s, e) =>
{
    if (e.Error != null) Show(e.Error.Message);
    else if (e.Cancelled) Show("cancelled");
    else Show(e.Result);
};
wc.DownloadStringAsync(new Uri(url));
```

Note the naming clash: EAP methods end in `Async` but return `void`. Wrap EAP with `TaskCompletionSource`, subscribing to the completed event and calling `SetResult`/`SetException`/`SetCanceled`.

## BackgroundWorker

A WinForms-era component implementing EAP for running work in the background with progress and cancellation:

```csharp
var worker = new BackgroundWorker { WorkerReportsProgress = true, WorkerSupportsCancellation = true };
worker.DoWork += (s, e) =>
{
    for (int i = 1; i <= 100; i++)
    {
        if (worker.CancellationPending) { e.Cancel = true; return; }
        Thread.Sleep(20);
        worker.ReportProgress(i);
    }
};
worker.ProgressChanged += (s, e) => progressBar.Value = e.ProgressPercentage;   // UI thread
worker.RunWorkerCompleted += (s, e) => status.Text = e.Cancelled ? "Cancelled" : "Done";
worker.RunWorkerAsync();
```

## The modern equivalents

| Old | Modern |
| --- | --- |
| `BeginRead`/`EndRead` | `await stream.ReadAsync(buffer, ct)` |
| `DownloadStringAsync` + `Completed` event | `await httpClient.GetStringAsync(url, ct)` |
| `BackgroundWorker.DoWork` | `await Task.Run(() => Work(progress, ct))` |
| `CancelAsync` / `CancellationPending` | `CancellationToken` |
| `ReportProgress` + `ProgressChanged` | `IProgress<T>` / `Progress<T>` |

## Interview takeaways

- APM: `Begin`/`End` + `IAsyncResult`; wrap with `Task.Factory.FromAsync`.
- EAP: `XxxAsync` (void) + `XxxCompleted` event; wrap with `TaskCompletionSource`.
- `BackgroundWorker` → `Task.Run` + `IProgress<T>` + `CancellationToken`.
