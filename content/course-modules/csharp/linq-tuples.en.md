LINQ often produces **pairs** of values: a name and a score, a word and its length, a key and a count. A tuple is the simplest container for such a pair. The framework provides the generic class `Tuple<T1, T2>` (and `Tuple<T1, T2, T3>` for three values):

```csharp
var pair = Tuple.Create("Ann", 90);
Console.WriteLine(pair.Item1);            // Ann
Console.WriteLine(pair.Item2);            // 90
```

The items are named `Item1`, `Item2`, and so on, which says little about their meaning. This is the weakness of `Tuple`.

## Tuples in LINQ

A projection can produce tuples directly, and the following method reads them:

```csharp
var words = new[] { "pear", "fig", "apple" };
var pairs = words.Select(w => Tuple.Create(w, w.Length));

foreach (var p in pairs)
{
    Console.WriteLine(p.Item1 + " " + p.Item2);     // pear 4, fig 3, apple 5
}
```

## C# 7 tuple syntax

Since C# 7 there is a short syntax with names, `(string Name, int Score)`, that works with the same idea:

```csharp
// C# 7 and later:
var pair2 = (Name: "Ann", Score: 90);
Console.WriteLine(pair2.Name);            // Ann: the names are part of the tuple
Console.WriteLine(pair2.Item2);           // 90: the Item names still work
```

This syntax is handy for a method that returns two values. It is built on `ValueTuple`, a struct, so it does not cause heap allocations. The course tasks use `Tuple.Create`, which is available in every version.

## Equality

`Tuple` compares its items by value: two tuples with equal items are equal, so they work well as keys in a dictionary or in `Distinct`.

```csharp
Console.WriteLine(Tuple.Create(1, "a").Equals(Tuple.Create(1, "a")));   // True
```

## When to use a tuple and when a class

A tuple is good for a short, local result. When the pair is used in many places, or has a meaning worth naming, a small class or struct with named fields (`Score`, `Name`) is clearer.
