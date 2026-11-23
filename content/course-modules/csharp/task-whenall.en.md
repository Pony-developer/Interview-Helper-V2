Often several tasks are started together, and the program needs all of them, or the first one that finishes. Two methods do this:

- `Task.WhenAll(tasks)` completes when **every** task has finished. Its result for `Task<T>` items is an array with the results **in the order of the tasks**, whatever order they finished in.
- `Task.WhenAny(tasks)` completes when **the first** task finishes, and gives that task.

```csharp
static async Task<int> SquareAsync(int x)
{
    await Task.Delay(100 * x);                // the bigger x, the longer the task
    return x * x;
}

var tasks = new[] { SquareAsync(3), SquareAsync(1), SquareAsync(2) };
int[] results = await Task.WhenAll(tasks);    // 9, 1, 4: the order of the input, not of the finish
```

## First to finish: WhenAny

```csharp
Task<int> slow = SquareAsync(5);
Task<int> quick = SquareAsync(1);
Task<int> first = await Task.WhenAny(slow, quick);
Console.WriteLine(await first);               // 1: the quick one finished first
```

`WhenAny` is useful for a timeout: race the real work against `Task.Delay(limit)`, and see which one finishes first.

## Errors in WhenAll

If some tasks fail, `WhenAll` waits for all of them, and then reports every exception. The next lecture explains how to read them.

## Starting before awaiting

As in the previous lecture, starting all the tasks first and awaiting them afterwards is what makes them run together. Writing `await` inside a loop, one task at a time, runs them one after another and is slower.
