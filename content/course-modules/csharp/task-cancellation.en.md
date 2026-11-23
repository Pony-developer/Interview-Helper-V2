Cancellation in .NET is **cooperative**: the program asks the work to stop, and the work checks the request and stops itself. Nothing kills a task from outside, because that would leave shared data in a broken state.

The parts are:

- `CancellationTokenSource` (the source) owns the request. Calling `Cancel()` sends it;
- `CancellationToken` (the token) is given to the work, which checks it.

```csharp
static async Task<int> CountAsync(CancellationToken token)
{
    int count = 0;
    for (int i = 0; i < 1000; i++)
    {
        token.ThrowIfCancellationRequested();   // stop here if somebody asked
        await Task.Delay(10, token);            // the delay itself also stops on cancellation
        count++;
    }
    return count;
}

var source = new CancellationTokenSource();
Task<int> work = CountAsync(source.Token);
await Task.Delay(100);
source.Cancel();                                // ask the work to stop

try
{
    await work;
}
catch (OperationCanceledException)
{
    Console.WriteLine("cancelled");             // the normal way a cancelled task reports itself
}
```

## The pieces

- `ThrowIfCancellationRequested()` throws `OperationCanceledException` when the token is cancelled. Call it regularly inside long loops.
- Pass the token to methods that accept one (`Task.Delay(ms, token)`, file and network calls). They stop early when it is cancelled.
- A cancelled task reports `IsCanceled`, and awaiting it throws `OperationCanceledException`.

## Timeouts

A timeout is a cancellation that starts itself: `source.CancelAfter(5000)` cancels after five seconds. Use it instead of a manual timer.

## The rule

Every long operation should accept a `CancellationToken`, and every loop that can take a long time should check it. A program that cannot be cancelled makes the user wait for work they no longer want.
