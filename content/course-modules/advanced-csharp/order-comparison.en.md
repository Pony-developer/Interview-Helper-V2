## Natural order: IComparable<T>

A type that has an obvious ordering implements `IComparable<T>`:

```csharp
public interface IComparable<in T> { int CompareTo(T? other); }
```

`a.CompareTo(b)` returns a **negative** number if `a` comes first, **zero** if they're equal in order, **positive** if `a` comes after. Callers must test the sign, not `== -1`.

```csharp
public sealed class Version3 : IComparable<Version3>
{
    public int Major { get; } public int Minor { get; }
    public Version3(int major, int minor) { Major = major; Minor = minor; }

    public int CompareTo(Version3? other)
    {
        if (other is null) return 1;                       // by convention null sorts first
        int c = Major.CompareTo(other.Major);
        return c != 0 ? c : Minor.CompareTo(other.Minor);
    }

    public static bool operator <(Version3 a, Version3 b) => a.CompareTo(b) < 0;
    public static bool operator >(Version3 a, Version3 b) => a.CompareTo(b) > 0;
}
```

Then `list.Sort()`, `Array.Sort`, `SortedSet<T>`, `Max()` and LINQ's `OrderBy(x => x)` all work.

Also implement the non-generic `IComparable` if older APIs (like `ArrayList.Sort`) must sort your type.

### Keep order and equality consistent

If `a.CompareTo(b) == 0`, ideally `a.Equals(b)` is true too. When they disagree (e.g. a `decimal` 1.0 vs 1.00 compares equal, and `string` compared case-insensitively but equated ordinally), sorted collections and hash collections behave differently: `SortedSet` keeps one item, `HashSet` two.

## Alternative orders: IComparer<T>

```csharp
public interface IComparer<in T> { int Compare(T? x, T? y); }
```

Use it to sort a type you don't own, or by something other than its natural order.

```csharp
var byLength = Comparer<string>.Create((a, b) => a.Length.CompareTo(b.Length));
words.Sort(byLength);

var desc = Comparer<int>.Create((a, b) => b.CompareTo(a));   // reverse order
var dict = new SortedDictionary<string, int>(StringComparer.OrdinalIgnoreCase);
```

Pre-built comparers: `Comparer<T>.Default` (natural order), `StringComparer.Ordinal`, `StringComparer.CurrentCultureIgnoreCase`, etc.

## Multi-key ordering

With LINQ:

```csharp
var sorted = people.OrderBy(p => p.LastName).ThenBy(p => p.FirstName).ThenByDescending(p => p.Age);
```

In a comparer, compare key by key and return the first non-zero result, as in `Version3.CompareTo`.

## Comparison pitfalls

- **Subtraction overflow**: `return a.Value - b.Value;` fails for values far apart (`int.MinValue - 1` wraps around). Use `a.Value.CompareTo(b.Value)`.
- **Inconsistent comparers** (not transitive, or `Compare(a, a) != 0`) can make `List.Sort` throw `InvalidOperationException` or loop badly.
- `List<T>.Sort` / `Array.Sort` are **unstable** (introsort): equal items may change order. LINQ `OrderBy` is **stable**.
- Culture-sensitive string order differs between machines; use ordinal comparison for anything persisted or used as a key.

## The <, > operators

Only numeric types, enums, `DateTime`, and types that overload them support `<` and `>`. `string` doesn't (use `string.Compare` or `CompareTo`), because "which order?" depends on the culture.

## Interview takeaways

- `IComparable<T>` = natural order; `IComparer<T>` = an external or alternative order.
- Return negative/zero/positive; never compute it by subtraction.
- `List.Sort` is unstable; `OrderBy` is stable.
