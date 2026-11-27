## Passing values and references

```csharp
void Change(int n, int[] arr, List<int> list, ref int r)
{
    n = 100;            // the caller's variable is unchanged (a copy)
    arr[0] = 100;       // the caller sees it: same array object
    list = new();       // the caller doesn't see it: only the local reference changed
    r = 100;            // the caller sees it: ref passes the variable itself
}
```

Rule of thumb: you can change *the object* a reference points to, but not *which object* the caller's variable points to — unless you use `ref`/`out`.

## Equality: four different questions

| Expression | Class | Struct | Record | String |
|---|---|---|---|---|
| `a == b` | same reference (unless overloaded) | doesn't compile unless overloaded | same values | same characters |
| `a.Equals(b)` | same reference (unless overridden) | field by field (via reflection, slow) | same values | same characters |
| `ReferenceEquals(a, b)` | same reference | always false (boxes) | same reference | same reference |

Override `Equals` + `GetHashCode` (and `==`) together, or use a `record` / `record struct`. Implement `IEquatable<T>` on structs to avoid boxing.

## Nulls

```csharp
string? name = GetName();                  // nullable reference type: the compiler warns on unsafe use
int length = name?.Length ?? 0;            // null-conditional + null-coalescing
name ??= "guest";                          // assign if null
ArgumentNullException.ThrowIfNull(order);  // guard clause
if (order is null) …                       // safer than == null (can't be overloaded)
if (shape is Circle { Radius: > 0 } c) …   // pattern matching never matches null
```

`int?` (a `Nullable<int>` struct) and `string?` (an annotation on a reference type) look alike but are completely different features.

## Numbers

```csharp
Console.Write(0.1 + 0.2 == 0.3);       // False: double is binary floating point
Console.Write(0.1m + 0.2m == 0.3m);    // True: decimal is base 10
Console.Write(7 / 2);                  // 3: integer division
Console.Write(7 / 2.0);                // 3.5
int big = int.MaxValue; big++;         // wraps to int.MinValue silently; use checked { } to throw
Console.Write((int)3.99);              // 3: truncation, not rounding
Console.Write(Math.Round(2.5));        // 2: banker's rounding by default (MidpointRounding.ToEven)
```

## Generics pitfalls

- `List<object>` is **not** a `List<string>` and vice versa (classes are invariant); `IEnumerable<object> e = new List<string>();` works (covariance).
- `default(T)` is `null` for reference types and zero for value types — `if (value == null)` on an unconstrained `T` is fine, but `== default` needs `EqualityComparer<T>.Default.Equals(value, default)`.
- `typeof(List<>)` is the open type; `typeof(List<int>)` the closed one.
- Static fields are per closed type: `Cache<int>.Count` and `Cache<string>.Count` are different.

## Collection pitfalls

- Modifying a `List<T>` while iterating it with `foreach` throws — iterate a copy (`ToList()`), use `RemoveAll`, or loop backwards with `for`.
- `Dictionary` indexer throws `KeyNotFoundException` for a missing key — use `TryGetValue`.
- A `HashSet`/`Dictionary` key whose hash changes after insertion is "lost".
- `Array.Sort` and `List.Sort` are unstable; `OrderBy` is stable.

In the practice you'll write a small generic repository with constraints (`where T : class, IEntity`) and a generic `MaxBy` with `where TKey : IComparable<TKey>`.
