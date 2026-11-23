For years, one simple method could not be written in C#: a generic `Sum` that works for `int`, `double` and `decimal`.

```csharp
static T Sum<T>(T[] items)
{
    T total = 0;              // error: 0 is an int, not a T
    foreach (T x in items)
        total = total + x;    // error: no operator + for T
    return total;
}
```

Constraints could only require **instance** members, but `0` and `+` are **static**: they belong to the type, not to a value. The workarounds were a copy of the method per type, `dynamic` (slow), or `Expression` trees (complex).

## Static abstract members (C# 11, .NET 7)

An interface can now require a **static** member:

```csharp
interface IHasZero<TSelf> where TSelf : IHasZero<TSelf>
{
    static abstract TSelf Zero { get; }
    static abstract TSelf operator +(TSelf a, TSelf b);
}
```

`TSelf` is the implementing type itself (a "self-referencing" generic). Every implementing type must provide its own `Zero` and `+`. Inside a generic method you call them through the type parameter: `T.Zero`.

## `INumber<T>`

.NET 7 already implements such interfaces for all built-in numeric types, in `System.Numerics`: `IAdditionOperators`, `IComparisonOperators`, `INumber<T>`, and more. The method becomes:

```csharp
using System.Numerics;

static T Sum<T>(T[] items) where T : INumber<T>
{
    T total = T.Zero;
    foreach (T x in items)
        total += x;
    return total;
}

Sum(new[] { 1, 2, 3 });          // 6
Sum(new[] { 1.5, 2.5 });         // 4.0
Sum(new[] { 0.1m, 0.2m });       // 0.3
```

The JIT still compiles a separate version for each value type, so the generic `Sum` is as fast as a hand-written one.

## Where you meet it

- Libraries for numbers, vectors, statistics and parsing (`IParsable<T>` gives a static `T.Parse`).
- In application code, rarely: an ordinary interface with instance methods is usually enough.

The practice tasks of this course run on C# 7, where this feature does not exist. Try it in a local project on .NET 8 or later.

## The rule

When a generic algorithm needs a **static** operation (a constant, an operator, a factory method such as `Parse`), use a static abstract interface member. For anything else, ordinary instance members are simpler.
