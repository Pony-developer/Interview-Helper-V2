## Unfolding a record

For `public record Point(int X, int Y);` the compiler emits roughly this:

```csharp
public class Point : IEquatable<Point>
{
    public Point(int X, int Y) { this.X = X; this.Y = Y; }

    public int X { get; init; }
    public int Y { get; init; }

    // Used by Equals to make sure both objects have the same runtime type
    protected virtual Type EqualityContract => typeof(Point);

    public virtual bool Equals(Point? other) =>
        (object)this == other ||
        (other is not null &&
         EqualityContract == other.EqualityContract &&
         EqualityComparer<int>.Default.Equals(X, other.X) &&
         EqualityComparer<int>.Default.Equals(Y, other.Y));

    public override bool Equals(object? obj) => Equals(obj as Point);
    public override int GetHashCode() => HashCode.Combine(EqualityContract, X, Y);
    public static bool operator ==(Point? a, Point? b) => (object?)a == b || (a?.Equals(b) ?? false);
    public static bool operator !=(Point? a, Point? b) => !(a == b);

    // with support
    protected Point(Point original) { X = original.X; Y = original.Y; }
    public virtual Point <Clone>$() => new Point(this);

    public void Deconstruct(out int X, out int Y) { X = this.X; Y = this.Y; }

    public override string ToString() { /* "Point { X = 1, Y = 2 }" via PrintMembers */ }
    protected virtual bool PrintMembers(StringBuilder builder) { /* "X = 1, Y = 2" */ }
}
```

`p with { Y = 5 }` becomes `var tmp = p.<Clone>$(); tmp.Y = 5;` (allowed because `init` accessors can run during that initialization).

## The rules of value equality

Whether you get it from a record or write it yourself, a correct equality implementation must be:

- **reflexive**: `a.Equals(a)` is true;
- **symmetric**: `a.Equals(b) == b.Equals(a)`;
- **transitive**;
- **consistent with GetHashCode**: equal objects **must** have equal hash codes (unequal ones should usually differ);
- **null-safe**: `a.Equals(null)` is false, never an exception.

`EqualityContract` keeps it symmetric with inheritance: a `Person` and an `Employee` with the same `Name` are not equal, because their runtime types differ.

## Customizing a record

You can replace any generated member by writing it yourself:

```csharp
public record Email(string Address)
{
    public virtual bool Equals(Email? other) =>
        other is not null && string.Equals(Address, other.Address, StringComparison.OrdinalIgnoreCase);
    public override int GetHashCode() => StringComparer.OrdinalIgnoreCase.GetHashCode(Address);
}
```

You can also add validation in the property:

```csharp
public record Percentage(decimal Value)
{
    public decimal Value { get; init; } =
        Value is >= 0 and <= 100 ? Value : throw new ArgumentOutOfRangeException(nameof(Value));
}
```

And `sealed override ToString()` stops derived records from replacing it.

## Mutable members break the contract

If a record contains a mutable collection, two records can be "equal" now and "different" later, and the hash code changes while the object sits in a `HashSet`. Use immutable collections (`ImmutableList<T>`, `IReadOnlyList<T>` that you never mutate) inside records, or exclude them from equality.

Note also that collections compare by **reference**: two records each holding an identical but separate `List<string>` are **not** equal.

## Interview takeaways

- A record is ordinary C#: the compiler writes Equals, GetHashCode, ==, ToString, Deconstruct and a clone method.
- `EqualityContract` makes equality type-aware for inheritance.
- Equal objects must have equal hash codes; mutable fields inside records break that.
