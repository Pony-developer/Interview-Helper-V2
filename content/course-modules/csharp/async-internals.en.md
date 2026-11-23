## What the compiler does with `async`

An `async` method is rewritten into a **state machine**: a hidden struct with the method's local variables as fields and a `MoveNext` method that contains the body, cut into pieces at every `await`.

At each `await task`, the generated code:

1. asks the task for its **awaiter** (`task.GetAwaiter()`);
2. if the task is **already completed** (`IsCompleted`), continues at once, synchronously, with no extra cost;
3. otherwise, saves the current state, registers "call `MoveNext` again when the task completes" (`OnCompleted`), and **returns** to the caller;
4. when the task completes, `MoveNext` runs again, jumps to the saved state, and takes the result with `GetResult()` (which rethrows the task's exception, if any).

That is why an `async` method returns to its caller at the first `await` of an unfinished task, and why `await` can be applied to anything that has a suitable `GetAwaiter()` method.

## `SynchronizationContext`: where the continuation runs

Before step 3, `await` captures the current **synchronization context**:

- in WPF and WinForms, it is the UI thread; the continuation is posted back to it, so after `await` you can update controls safely;
- in the old ASP.NET (.NET Framework), it was the request context;
- in **ASP.NET Core and console apps there is none**: the continuation runs on any thread-pool thread.

## `ConfigureAwait(false)`

```csharp
string text = await File.ReadAllTextAsync(path).ConfigureAwait(false);
```

This says: "do not return to the captured context, continue on any thread". It is slightly faster and avoids the deadlock below. Use it in **library** code, which does not know who calls it. Do not use it in UI code that touches controls after the `await`. In ASP.NET Core application code it makes no difference.

## The classic deadlock

```csharp
// a WPF button handler
void Button_Click(object sender, EventArgs e)
{
    string data = LoadAsync().Result;   // blocks the UI thread and waits for the task
}

async Task<string> LoadAsync()
{
    await Task.Delay(100);              // the continuation wants to return to the UI thread...
    return "done";                      // ...which is blocked by .Result: nobody ever continues
}
```

The UI thread waits for the task, and the task waits for the UI thread. Fixes: make the handler `async` and use `await` (best), or use `ConfigureAwait(false)` inside `LoadAsync`.

## Two anti-patterns

- **Sync over async**: `.Result`, `.Wait()`, `.GetAwaiter().GetResult()` on an unfinished task. Besides deadlocks, it blocks a pool thread; under load the pool runs out of threads (**thread-pool starvation**) and the whole server slows down. Use `async` all the way up.
- **Async over sync**: wrapping a CPU-bound or blocking method into `Task.Run` inside a library and calling it `XxxAsync`. It only moves the blocking to another thread. Let the caller decide whether to use `Task.Run`.

## The rule

`await` checks whether the task is done, and if not, returns and continues later, by default in the captured context. Never block on async code; use `ConfigureAwait(false)` in libraries.
