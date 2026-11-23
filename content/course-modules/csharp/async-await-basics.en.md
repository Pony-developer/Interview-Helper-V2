`async` marks a method that can pause at `await` and continue later. `await` waits for a task **without blocking the thread**: the method returns to its caller, and when the task is done, the rest of the method runs again.

```csharp
static async Task<int> ComputeAsync()
{
    Console.WriteLine("start");
    await Task.Delay(200);                    // pauses here; the thread is free meanwhile
    Console.WriteLine("after the delay");
    return 42;                                // the Task<int> completes with 42
}

Task<int> work = ComputeAsync();
Console.WriteLine("the caller continues");
Console.WriteLine(work.Result);               // waits for the result
// start, the caller continues, after the delay, 42
```

## The types

- `async Task<T>` returns a value; `await` gives the value: `int x = await ComputeAsync();`.
- `async Task` returns nothing; `await` only waits.
- `async void` is for event handlers only (see the lecture about pitfalls).

## Sequential and concurrent

Two awaits in a row run one after another. To run them together, start both tasks first and await them after:

```csharp
int a = await ComputeAsync();                 // takes 200 ms
int b = await ComputeAsync();                 // another 200 ms: total 400 ms

Task<int> t1 = ComputeAsync();                // both start now
Task<int> t2 = ComputeAsync();
int c = await t1;                             // total about 200 ms
int d = await t2;
```

## What the compiler does

The compiler turns an `async` method into a state machine: a class that remembers where the method stopped and what its local variables hold. This is why an `await` does not need a thread to wait. The mechanism is similar to the iterators of the `yield return` module.

## The rules of thumb

- Put `async` on the method that uses `await`.
- Return `Task` or `Task<T>` from `async` methods, so callers can await them.
- Use `Task.Delay`, not `Thread.Sleep`, inside `async` code.
