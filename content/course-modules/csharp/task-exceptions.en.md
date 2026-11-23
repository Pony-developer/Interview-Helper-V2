An exception inside a task does not crash the program at once. The task stores the exception and ends in the **faulted** state. The exception surfaces when someone looks at the result:

```csharp
static async Task<int> DivideAsync(int a, int b)
{
    await Task.Delay(10);
    return a / b;                             // DivideByZeroException when b is 0
}

Task<int> bad = DivideAsync(1, 0);
// the program does not crash here: the exception is stored in the task
```

## How the exception comes out

- `await bad` rethrows the **original** exception, so a normal `try/catch` works:

```csharp
try
{
    int value = await DivideAsync(1, 0);
}
catch (DivideByZeroException)
{
    Console.WriteLine("cannot divide");
}
```

- `bad.Result` and `bad.Wait()` throw an `AggregateException`, which wraps the original. Its `InnerException` is the real error, and `Flatten()` gives all of them when there are several.

## Several tasks: WhenAll

`Task.WhenAll` waits for every task, and if several failed, the exception it throws holds **all** the errors. Awaiting the result throws only the first one, so to see every failure, inspect the tasks one by one or use `Task.WhenAll(...)` with its `Exception` property.

## Catching each failure separately

When one failure should not stop the others, catch inside each task:

```csharp
static async Task<int> SafeDivideAsync(int a, int b)
{
    try
    {
        return await DivideAsync(a, b);
    }
    catch (DivideByZeroException)
    {
        return 0;                             // the failure becomes a normal value
    }
}
```

## The rule

Awaiting a task is the normal way to handle its exception. Never ignore a task's exception: a task that is never awaited and fails hides its error completely.
