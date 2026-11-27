## Tasks as units of parallel work

`Task.Run` and `Task.Factory.StartNew` schedule CPU work on the thread pool; combining tasks lets you express parallel workflows:

```csharp
Task<Stats> statsTask = Task.Run(() => ComputeStats(data));
Task<Image> chartTask = Task.Run(() => RenderChart(data));
await Task.WhenAll(statsTask, chartTask);
Publish(statsTask.Result, chartTask.Result);
```

## Creation options and child tasks

```csharp
var parent = Task.Factory.StartNew(() =>
{
    Task.Factory.StartNew(() => Step1(), TaskCreationOptions.AttachedToParent);
    Task.Factory.StartNew(() => Step2(), TaskCreationOptions.AttachedToParent);
});
parent.Wait();   // waits for the attached children too, and collects their exceptions
```

- `LongRunning`: a dedicated thread instead of a pool thread (for long blocking work).
- `PreferFairness`: schedule in FIFO order instead of the pool's local LIFO queues.
- `AttachedToParent`: the parent completes only when its children do. `Task.Run` uses `DenyChildAttach`, which is the sane default.

## Continuations for pipelines

```csharp
Task<string> download = Task.Run(() => Download(url));
Task<int> words = download.ContinueWith(t => CountWords(t.Result), TaskContinuationOptions.OnlyOnRanToCompletion);
Task report = download.ContinueWith(t => Log(t.Exception!), TaskContinuationOptions.OnlyOnFaulted);
```

`Task.WhenAll(...).ContinueWith(...)` and `Task.Factory.ContinueWhenAll` start work after a group completes. With `async`/`await` such pipelines are usually written more clearly.

## Task schedulers

A `TaskScheduler` decides where tasks run. The default uses the thread pool; `TaskScheduler.FromCurrentSynchronizationContext()` runs continuations on the UI thread; custom schedulers can limit concurrency or prioritize. `ConcurrentExclusiveSchedulerPair` gives a reader/writer-style pair of schedulers.

## AggregateException

Parallel operations can fail in several places at once, so PFX wraps exceptions in an `AggregateException`:

```csharp
try
{
    Parallel.ForEach(files, Process);
}
catch (AggregateException ae)
{
    ae.Flatten().Handle(ex =>
    {
        if (ex is IOException io) { Log(io); return true; }   // handled
        return false;                                         // unhandled ones are rethrown in a new AggregateException
    });
}
```

- `InnerExceptions` holds all of them; `InnerException` the first.
- `Flatten()` merges nested `AggregateException`s (from child tasks) into one level.
- `Handle(predicate)` marks some as handled and rethrows the rest.
- `await` throws only the **first** inner exception; to see all, inspect the task's `Exception` property.

## Interview takeaways

- Express parallel workflows with tasks + `WhenAll`/continuations; prefer `Task.Run` over `StartNew`.
- `LongRunning` for blocking work; child tasks are rarely needed.
- `AggregateException` collects multiple failures: `Flatten()` + `Handle()` to process them.
