## Two kinds of equality

- **Value equality**: two things are equal if they contain the same data (`3 == 3`, two `DateTime`s for the same tick, two records with the same fields).
- **Referential equality**: two references are equal if they point to the **same object**.

By default value types use value equality and reference types use referential equality. Some reference types override that: `string`, `Uri`, records, anonymous types, tuples.

## The equality protocols

| Mechanism | Static or virtual | Notes |
| --- | --- | --- |
| `==` / `!=` | **static**: chosen at compile time from the declared types | can be overloaded |
| `object.Equals(object)` | **virtual**: uses the runtime type | works through `object` and interfaces |
| `object.Equals(a, b)` (static) | handles nulls, then calls the virtual `Equals` | safe for unknown types |
| `ReferenceEquals(a, b)` | always referential | can't be overridden |
| `IEquatable<T>.Equals(T)` | strongly typed, no boxing | used by generic collections |

The static vs virtual difference causes classic surprises:

```csharp
object a = 5, b = 5;
Console.WriteLine(a == b);        // False: object's == compares references (two boxes)
Console.WriteLine(a.Equals(b));   // True: Int32.Equals compares values

string s1 = "hi", s2 = new string(new[] { 'h', 'i' });
object o1 = s1, o2 = s2;
Console.WriteLine(s1 == s2);      // True: string's overloaded ==
Console.WriteLine(o1 == o2);      // False: compile-time type is object, so referential
```

In generic code, `==` isn't even allowed on an unconstrained `T`; use `EqualityComparer<T>.Default.Equals(a, b)`, which picks `IEquatable<T>` when available and avoids boxing.

## Odd cases worth knowing

```csharp
double nan = double.NaN;
Console.WriteLine(nan == nan);        // False (IEEE 754)
Console.WriteLine(nan.Equals(nan));   // True: Equals must be reflexive so collections work

int[] x = { 1, 2 }, y = { 1, 2 };
Console.WriteLine(x.Equals(y));       // False: arrays use referential equality
Console.WriteLine(x.SequenceEqual(y));// True (LINQ)
```

Use `IStructuralEquatable` (`StructuralComparisons.StructuralEqualityComparer`) to compare arrays and tuples element by element.

## Implementing value equality

```csharp
public sealed class Area : IEquatable<Area>
{
    public double Width { get; }
    public double Height { get; }
    public Area(double w, double h) { Width = w; Height = h; }

    public bool Equals(Area? other) =>
        other is not null && Width == other.Width && Height == other.Height;

    public override bool Equals(object? obj) => Equals(obj as Area);
    public override int GetHashCode() => HashCode.Combine(Width, Height);

    public static bool operator ==(Area? a, Area? b) => a is null ? b is null : a.Equals(b);
    public static bool operator !=(Area? a, Area? b) => !(a == b);
}
```

Checklist:

1. Override `Equals(object)` **and** `GetHashCode` together.
2. Implement `IEquatable<T>` (essential for structs to avoid boxing).
3. Overload `==`/`!=` consistently, null-safe.
4. Hash only immutable fields; equal objects must produce equal hashes.
5. For structs, always override: the default `ValueType.Equals` uses reflection and is slow.

Or let the compiler do it: `record` and `record struct`.

## Pluggable equality

`IEqualityComparer<T>` lets a *collection* decide what "equal" means without changing the type:

```csharp
var tags = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "CSharp", "csharp" };   // Count = 1
```

## Interview takeaways

- `==` is resolved statically, `Equals` virtually: through `object` they can disagree.
- Override `Equals` and `GetHashCode` together; implement `IEquatable<T>`.
- In generics use `EqualityComparer<T>.Default`.
