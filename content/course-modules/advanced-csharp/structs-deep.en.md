## What a struct is

A `struct` is a value type: variables hold the data itself, and assignment copies it. Structs can have fields, properties, methods, constructors and can implement interfaces, but:

- they can't inherit from another struct or class (they all derive from `System.ValueType`), and nothing can inherit from them;
- they have no finalizer;
- `default(MyStruct)` always exists: all fields zero/null, no constructor run.

```csharp
public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
    public Point(int x, int y) { X = x; Y = y; }
    public double Length => Math.Sqrt(X * X + Y * Y);
}
```

Since C# 10 a struct may declare its own parameterless constructor and field initializers. Beware: `default(Point)` and `new Point[10]` still skip that constructor.

## readonly struct

```csharp
public readonly struct Money
{
    public decimal Amount { get; }
    public string Currency { get; }
    public Money(decimal amount, string currency) { Amount = amount; Currency = currency; }
    public Money Add(Money other) => new Money(Amount + other.Amount, Currency);
}
```

Every field must be read-only. Benefits:

- immutability is enforced by the compiler;
- the compiler can pass it as `in` or call its members on a `readonly` field **without defensive copies**.

You can also mark individual members `readonly` (C# 8) to promise they don't modify state.

## The mutable-struct trap

```csharp
var list = new List<Point> { new Point(1, 1) };
list[0].X = 5;          // compile error: list[0] returns a copy
var p = list[0]; p.X = 5;   // compiles, but changes the copy only
```

This is why value types should generally be **immutable**.

## ref struct

A `ref struct` can live **only on the stack**. `Span<T>` and `ReadOnlySpan<T>` are ref structs. The compiler forbids anything that could move one onto the heap:

- no boxing, no conversion to `object` or an interface;
- no fields of that type in classes or ordinary structs;
- no use in `async` methods, iterators or lambdas that capture it.

In exchange, a ref struct can safely hold a reference into stack memory or the inside of an array.

## Record structs (C# 10)

```csharp
public readonly record struct Temperature(double Celsius);
```

The compiler generates the constructor, properties, value equality, `ToString` and `with` support.

## When to choose a struct

Choose a struct when **all** of these hold:

1. it represents a single value (a coordinate, money, a color, a time range);
2. it is small (as a rule of thumb, 16 bytes or less);
3. it is immutable;
4. it won't be boxed often.

Otherwise use a class. A large mutable struct is the worst of both worlds: expensive copies and surprising semantics.

## Interview takeaways

- Structs copy on assignment, can't be inherited, always have a zero `default`.
- Make structs `readonly` to avoid defensive copies and mutation bugs.
- `ref struct` (like `Span<T>`) is stack-only, which is what makes it safe and fast.
