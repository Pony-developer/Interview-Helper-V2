## An iterator writes the enumerator for you

A method, property or local function that contains `yield return` is an **iterator**. It must return `IEnumerable<T>`, `IEnumerator<T>` (or their non-generic forms), or `IAsyncEnumerable<T>` for async iterators.

```csharp
static IEnumerable<int> Countdown(int from)
{
    for (int i = from; i > 0; i--)
        yield return i;          // hand out one value and pause here
    yield return 0;              // more than one yield is fine
}

foreach (int n in Countdown(3)) Console.Write(n + " ");   // 3 2 1 0
```

The compiler rewrites the method into a hidden class: a **state machine** that implements the enumerator. Each `MoveNext()` runs the body until the next `yield return`, stores the value in `Current` and remembers where to resume.

## Deferred execution

Calling an iterator method runs **none** of its body. It just creates the state machine. The body runs piece by piece as someone enumerates.

```csharp
IEnumerable<int> ReadNumbers()
{
    Console.WriteLine("start");
    yield return 1;
    Console.WriteLine("middle");
    yield return 2;
}

var seq = ReadNumbers();        // prints nothing
foreach (var x in seq) { }      // start, middle
foreach (var x in seq) { }      // start, middle again: each enumeration restarts
```

Consequences:

- **Argument checks are deferred too.** Put validation in a non-iterator wrapper and the `yield` logic in a local function, so bad arguments fail immediately.
- **Infinite sequences are fine**: the caller decides how much to take.
- **Enumerating twice repeats the work** (and any side effects). Materialize with `ToList()` if you need the results more than once.

## yield break

```csharp
static IEnumerable<string> ReadLines(TextReader reader)
{
    while (true)
    {
        string line = reader.ReadLine();
        if (line == null) yield break;    // end the sequence
        yield return line;
    }
}
```

## try/finally in iterators

`yield return` is allowed in a `try` that has a `finally`, but not in a `try` with a `catch`, nor inside `catch` or `finally` blocks.

```csharp
static IEnumerable<string> Lines(string path)
{
    var reader = File.OpenText(path);
    try
    {
        string line;
        while ((line = reader.ReadLine()) != null) yield return line;
    }
    finally
    {
        reader.Dispose();   // runs when the loop finishes OR when foreach disposes the enumerator early
    }
}
```

If the consumer `break`s out of a `foreach`, the enumerator's `Dispose()` runs the pending `finally`. If someone calls `MoveNext()` by hand and never disposes, it doesn't: always enumerate with `foreach` (or `using`).

## Composing iterators

Iterators chain naturally, each pulling one item at a time from the previous one:

```csharp
static IEnumerable<int> Evens(IEnumerable<int> source)
{
    foreach (var x in source) if (x % 2 == 0) yield return x;
}

foreach (var n in Evens(Countdown(10))) { }   // nothing is materialized; items flow one by one
```

That is exactly how LINQ to Objects operators like `Where` and `Select` work.

## Restrictions

Iterators can't have `ref`, `out` or `in` parameters, and can't contain `unsafe` code. A `ref struct` like `Span<T>` can't be used across a `yield`.

## Interview takeaways

- `yield return` makes the compiler generate a state-machine enumerator.
- Execution is deferred and repeated per enumeration; validate eagerly in a wrapper.
- `finally` in an iterator runs when the enumerator is disposed, which `foreach` guarantees.
