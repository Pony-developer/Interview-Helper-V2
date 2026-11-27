## Two roles: enumerable and enumerator

- An **enumerable** is something you can iterate: it has `GetEnumerator()`.
- An **enumerator** is a cursor over it: `MoveNext()` advances, `Current` returns the item at the cursor.

```csharp
public interface IEnumerable<out T> : IEnumerable
{
    IEnumerator<T> GetEnumerator();
}

public interface IEnumerator<out T> : IDisposable, IEnumerator
{
    T Current { get; }
    // from IEnumerator: bool MoveNext(); void Reset();
}
```

The split matters: one collection can be iterated by several loops at once, each with its own enumerator.

## What foreach really does

```csharp
foreach (var item in list) Console.WriteLine(item);
```

compiles (roughly) to:

```csharp
using (var e = list.GetEnumerator())
{
    while (e.MoveNext())
    {
        var item = e.Current;
        Console.WriteLine(item);
    }
}
```

Notes:

- `foreach` is **pattern-based**: any type with a suitable `GetEnumerator()` works, even without implementing `IEnumerable`. Since C# 9 that method can even be an extension method.
- `List<T>.GetEnumerator()` returns a **struct** enumerator, so `foreach` over a `List<T>` doesn't allocate. Over an `IEnumerable<T>` variable it does: the struct gets boxed.
- The enumerator is **disposed** at the end, which matters for iterators with `finally` blocks.
- Modifying a `List<T>` while enumerating it throws `InvalidOperationException` ("Collection was modified").

## Collection initializers

```csharp
var primes = new List<int> { 2, 3, 5, 7 };                 // calls Add four times
var ages = new Dictionary<string, int>
{
    ["Ann"] = 31,                                          // index initializer (C# 6)
    ["Bob"] = 27,
};
var map = new Dictionary<string, int> { { "x", 1 }, { "y", 2 } };   // Add(key, value)
```

A collection initializer needs the type to implement `IEnumerable` and have an `Add` method.

## Implementing enumeration yourself

You could write an enumerator class by hand: fields for the position, a `MoveNext` that advances and a `Current`. In practice you almost always let the compiler do it with an **iterator** (`yield return`, next lecture), or return the enumerator of an inner collection:

```csharp
public class Playlist : IEnumerable<Song>
{
    private readonly List<Song> _songs = new();
    public IEnumerator<Song> GetEnumerator() => _songs.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();   // the non-generic one
}
```

## IEnumerable vs ICollection vs IList

`IEnumerable<T>` promises only forward iteration. It doesn't know its count and can't be indexed. Accept `IEnumerable<T>` as a parameter when you just loop over the input; accept `IReadOnlyCollection<T>`/`IReadOnlyList<T>` when you need `Count` or indexing; this is covered in the collections module.

## Interview takeaways

- `foreach` = `GetEnumerator` + `MoveNext`/`Current` loop + `Dispose`.
- It's pattern-based; `List<T>`'s struct enumerator avoids allocations.
- Don't modify a collection while enumerating it.
