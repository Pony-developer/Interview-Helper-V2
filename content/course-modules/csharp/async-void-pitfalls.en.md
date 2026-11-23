The method return type decides what the caller can do with an `async` method:

| Return type | The caller can | Exceptions |
|---|---|---|
| `async Task` | `await` it, wait for it, combine it with `WhenAll` | reach the caller |
| `async Task<T>` | `await` it and get the value | reach the caller |
| `async void` | only start it and forget it | **crash the program** if not caught inside |

## Why async void is dangerous

```csharp
static async void Risky()
{
    await Task.Delay(10);
    throw new InvalidOperationException("boom");   // no one can catch this
}

Risky();                                  // the caller gets no task to observe
```

The exception is raised on the thread pool with no caller waiting, so it cannot be caught, and the process terminates. `async void` also gives no way to know when the work ends.

## The one allowed place

Event handlers have the signature `void Handler(object sender, EventArgs e)`, and that is why WinForms and WPF button handlers are `async void`. Inside them, catch every exception that can happen, because nothing above the handler can catch it.

```csharp
private async void saveButton_Click(object sender, EventArgs e)
{
    try
    {
        await SaveAsync();
    }
    catch (Exception ex)
    {
        MessageBox.Show(ex.Message);       // handled here, or the application crashes
    }
}
```

## Waiting on the UI thread: a deadlock

`task.Result` or `task.Wait()` on the UI thread blocks it. If the awaited code wants to return to the UI thread to continue, both wait for each other forever. Inside an `async` method, always `await` instead of blocking.

## ConfigureAwait

`await task.ConfigureAwait(false)` tells the code that it does not need to return to the original context (for example, the UI thread). Library code uses it to avoid deadlocks and extra work. Application code in a window usually needs the UI context, so leave the default.
