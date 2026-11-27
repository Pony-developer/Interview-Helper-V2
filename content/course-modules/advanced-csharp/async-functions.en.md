## async and await

```csharp
public async Task<decimal> GetOrderTotalAsync(int id, CancellationToken ct)
{
    Order order = await _repo.LoadAsync(id, ct);          // may pause here
    decimal tax = await _taxService.GetRateAsync(order.Country, ct);   // and here
    return order.Subtotal * (1 + tax);                     // becomes the Task's result
}
```

- `async` enables `await` in a method and makes the compiler wrap its result in a task.
- `await` takes an awaitable (usually a `Task`), and if it isn't complete yet, **returns to the caller**, resuming the method when the task completes.
- Exceptions thrown inside go into the returned task and are rethrown at the caller's `await`.

## Return types

| Return type | When |
| --- | --- |
| `Task` | no result |
| `Task<T>` | a result of type T |
| `ValueTask` / `ValueTask<T>` | hot paths that often complete synchronously |
| `IAsyncEnumerable<T>` | an async stream (C# 8): `await foreach` |
| `void` | **only** event handlers |

## What the compiler generates

An async method becomes a **state machine** (a struct with the locals as fields and a `MoveNext` method). At each `await`:

1. it calls `GetAwaiter()` on the awaitable;
2. if `IsCompleted` is already true, it continues synchronously, with no extra cost;
3. otherwise it stores its state, registers `MoveNext` as the continuation and returns;
4. when the awaited operation completes, `MoveNext` resumes at the saved point and calls `GetResult()`, which returns the value or throws.

Anything with a suitable `GetAwaiter()` method can be awaited, including your own types.

## Where the continuation runs

Before pausing, `await` captures the current **`SynchronizationContext`** (or `TaskScheduler`):

- **WPF / WinForms / MAUI**: the UI context, so code after `await` runs on the UI thread;
- **ASP.NET Core, console apps**: there is none, so continuations run on any pool thread.

`await task.ConfigureAwait(false)` opts out of capturing. Use it in **library** code that never touches UI, to avoid needless thread hops and the classic deadlock. In ASP.NET Core app code it makes no difference.

### The classic deadlock

```csharp
void Button_Click(object s, EventArgs e)
{
    var text = LoadAsync().Result;   // UI thread blocks, waiting for the task
}
async Task<string> LoadAsync()
{
    var t = await _client.GetStringAsync(url);   // continuation wants the UI thread → deadlock
    return t;
}
```

Fix: make the handler async and `await`. (`ConfigureAwait(false)` inside `LoadAsync` also avoids it, but async all the way is the real fix.)

## Async lambdas

```csharp
Func<Task<int>> fetch = async () => await GetCountAsync();
button.Click += async (s, e) => await SaveAsync();       // async void: OK for event handlers
var results = await Task.WhenAll(ids.Select(async id => await LoadAsync(id)));
```

Watch out when passing an async lambda to a parameter of type `Action`: it becomes `async void`, and nobody awaits it or sees its exceptions (e.g. `list.ForEach(async x => await ...)`).

## Async void

`async void` methods can't be awaited; exceptions are raised on the captured synchronization context (crashing a console or ASP.NET Core process). They exist only so event handlers can be async. Everywhere else return `Task`.

## Eliding async

```csharp
public Task<string> GetAsync(string url) => _client.GetStringAsync(url);   // no async/await: returns the task directly
```

Slightly cheaper, but exceptions surface differently and `using` blocks would end too early. Elide only in trivial pass-through methods.

## Interview takeaways

- `await` returns to the caller at the first incomplete task; the compiler builds a state machine.
- Continuations resume on the captured context (UI thread) unless `ConfigureAwait(false)`.
- Blocking on async code (`.Result`) on a UI thread deadlocks; `async void` only for event handlers.
