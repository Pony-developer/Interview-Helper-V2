## Task: a promise of a result

A `Task` represents an operation that may complete later. `Task<TResult>` adds a result. Unlike a thread, a task is a higher-level object: it can be awaited, composed, cancelled and it carries exceptions.

```csharp
Task<int> t = Task.Run(() => CountPrimes(1_000_000));   // runs on the thread pool
// ... do other things ...
int primes = await t;                                    // or t.Result to block (avoid on servers)
```

Not every task runs on a thread. A task returned by `HttpClient.GetStringAsync` or `Task.Delay` represents I/O or a timer: **no thread is busy** while it waits.

## States

`Created` → `WaitingForActivation`/`WaitingToRun` → `Running` → one of:

- `RanToCompletion` (`IsCompletedSuccessfully`);
- `Faulted` (`IsFaulted`, `Exception` holds an `AggregateException`);
- `Canceled` (`IsCanceled`).

`IsCompleted` is true for all three final states.

## Exceptions

A task **captures** exceptions instead of crashing the process:

```csharp
Task t = Task.Run(() => throw new InvalidOperationException("boom"));

try { await t; }                          // rethrows the original InvalidOperationException
catch (InvalidOperationException e) { }

try { t.Wait(); }                         // wraps it: AggregateException → InnerException
catch (AggregateException e) { Console.WriteLine(e.InnerException!.Message); }
```

`AggregateException` exists because a task can hold several exceptions (from `Task.WhenAll` or child tasks). `await` unwraps and throws the **first** one; inspect `task.Exception.InnerExceptions` to see all.

An exception in a task nobody ever observes doesn't crash the process (since .NET 4.5); it's reported through `TaskScheduler.UnobservedTaskException` when the task is garbage-collected. "Fire and forget" tasks can therefore fail silently: log inside them.

## Continuations

A continuation is code that runs when a task completes.

```csharp
Task<string> download = client.GetStringAsync(url);
Task<int> length = download.ContinueWith(prev => prev.Result.Length);

Task cleanup = download.ContinueWith(_ => Log("failed"), TaskContinuationOptions.OnlyOnFaulted);
```

`await` is the modern, readable way to write continuations: the rest of the method **is** the continuation. Reach for `ContinueWith` only in special cases; it has subtle defaults (it runs even after failure, and uses the current `TaskScheduler`, not the pool, unless told otherwise).

Lower-level: `task.GetAwaiter().OnCompleted(...)` is what `await` uses; `GetAwaiter().GetResult()` blocks like `.Result` but throws the original exception instead of an `AggregateException`.

## Combinators

```csharp
Task<string[]> all = Task.WhenAll(GetAsync(a), GetAsync(b), GetAsync(c));   // completes when all complete
Task<Task<string>> first = Task.WhenAny(GetAsync(a), GetAsync(b));           // completes when one completes
Task done = Task.CompletedTask;
Task<int> ready = Task.FromResult(42);                                        // an already-completed task
Task failed = Task.FromException(new TimeoutException());
```

`WhenAll` doesn't fail fast: it waits for every task, then faults with all their exceptions.

## Task.Run vs Task.Factory.StartNew

`Task.Run(action)` is a safe shortcut for `Task.Factory.StartNew(action, CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default)`. `StartNew` with an async lambda returns a `Task<Task>` (a classic bug); `Task.Run` unwraps it for you. Use `StartNew` only for options like `LongRunning`.

## Interview takeaways

- A task is a promise of completion; I/O tasks use no thread while waiting.
- Tasks capture exceptions; `await` rethrows the original, `.Wait()`/`.Result` wrap in `AggregateException`.
- Prefer `await` over `ContinueWith`; prefer `Task.Run` over `StartNew`.
