A **task** (`System.Threading.Tasks.Task`) represents an operation that will finish in the future. It is a promise: "the work is running, and you can ask for the result when it is ready". A task that gives a value is `Task<T>`; a task that gives nothing is `Task`.

```csharp
using System.Threading.Tasks;

Task<int> sumTask = Task.Run(() =>
{
    int sum = 0;
    for (int i = 1; i <= 100; i++) sum += i;
    return sum;                                // the value of the task
});

Console.WriteLine("the work runs in the background...");
Console.WriteLine(sumTask.Result);             // 5050: waits here if the work is not finished
```

## The state of a task

A task moves through states: created, running, then completed (with a result), faulted (an exception happened), or canceled. `IsCompleted`, `IsFaulted` and `IsCanceled` tell which state it is.

## Waiting for a task

- `Wait()` blocks the current thread until the task ends.
- `Result` does the same and returns the value of a `Task<T>`.

Both block the calling thread. Blocking is acceptable in a console program's `Main`, but **never** wait for a task on the UI thread: the window freezes, which is the problem the previous module solved. The next lectures show how `await` waits without blocking.

## Why tasks instead of threads

A thread is a resource that the programmer creates and manages. A task describes **what** to do and lets the runtime choose the thread, usually from a pool that is reused. Tasks are cheap to create, and they can report results and exceptions, which a plain thread cannot.
