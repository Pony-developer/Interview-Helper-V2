`Task.Run` starts a piece of work on a pool thread and returns a task for it. Use it for **CPU work**: calculations that keep the processor busy.

```csharp
Task<long> factorial = Task.Run(() =>
{
    long result = 1;
    for (int i = 2; i <= 20; i++) result *= i;
    return result;
});

Task<string> text = Task.Run(() => "hello");
Console.WriteLine(factorial.Result);           // 2432902008176640000
Console.WriteLine(text.Result);                // hello
```

## Waiting without blocking: Task.Delay

`Task.Delay(ms)` returns a task that completes after the given time. It is the non-blocking version of `Thread.Sleep`: no thread is occupied while the delay runs.

```csharp
Task pause = Task.Delay(500);
pause.Wait();                                 // blocks here, for demonstration only
```

In real code, `Delay` is used with `await` (next lectures), where it lets other work run during the pause.

## Continuations

A continuation is a piece of code that runs when a task finishes. `ContinueWith` is the older way to write one:

```csharp
Task.Run(() => 21)
    .ContinueWith(t => Console.WriteLine(t.Result * 2));    // 42
```

Chains of `ContinueWith` get hard to read. The `async/await` lectures show how the same flow reads as a normal method.

## When to use Task.Run

- for CPU-heavy work that would otherwise block the UI or the main thread;
- not for I/O (files, networks): those already have asynchronous methods that do not need a thread while they wait.
