Creating threads by hand is tedious. For loops whose iterations are independent, the class `Parallel` (in `System.Threading.Tasks`) spreads the work over the available cores for you:

```csharp
using System.Threading.Tasks;

int[] data = new int[8];
Parallel.For(0, data.Length, i =>
{
    data[i] = i * i;                        // each iteration writes its own element
});

Parallel.ForEach(new[] { "a", "b", "c" }, s =>
{
    Console.WriteLine(s);                   // the order of these lines is not defined
});

Parallel.Invoke(
    () => Console.WriteLine("first"),       // these two actions may run at the same time
    () => Console.WriteLine("second"));
```

`Parallel.For` runs the body for each index, `ForEach` for each item, and `Invoke` runs several different actions. When all of them finish, the call returns.

## The rule for safe parallel loops

Each iteration should work on **its own data**: write to `data[i]`, not to a shared total. If the iterations must change one shared variable, protect it with a lock (the next lecture) or use `Interlocked`. Otherwise the result depends on timing.

## When Parallel helps

- the work per iteration is large enough (a few microseconds at least);
- the iterations are independent of each other;
- the machine has several cores.

For tiny iterations, the cost of distributing the work is larger than the work itself, and a plain loop is faster.

## Exceptions

If one iteration throws, the `Parallel` call collects the exceptions and throws an `AggregateException` with all of them.
