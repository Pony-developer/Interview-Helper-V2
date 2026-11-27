## Ordering

```csharp
var sorted = people
    .OrderBy(p => p.LastName)                     // primary key
    .ThenBy(p => p.FirstName)                     // tie-breaker
    .ThenByDescending(p => p.BirthDate);          // second tie-breaker

var caseless = names.OrderBy(n => n, StringComparer.OrdinalIgnoreCase);
var reversed = items.Reverse();
var natural = numbers.Order();                    // .NET 7: order by the element itself
```

- `OrderBy` returns `IOrderedEnumerable<T>`, which is what makes `ThenBy` available.
- Calling `OrderBy` twice **discards** the first ordering; use `ThenBy` for secondary keys.
- LINQ ordering is **stable**: equal keys keep their original relative order (unlike `List.Sort`).
- It's deferred but buffers everything and sorts in O(n log n) when enumerated.

Query syntax: `orderby p.LastName, p.FirstName, p.BirthDate descending`.

## Set operators

| Operator | Result (for `{1,2,3}` and `{3,4}`) |
| --- | --- |
| `Concat` | `1,2,3,3,4`: everything, duplicates kept |
| `Union` | `1,2,3,4`: everything, duplicates removed |
| `Intersect` | `3`: in both |
| `Except` | `1,2`: in the first but not the second |

```csharp
var allTags = postA.Tags.Union(postB.Tags, StringComparer.OrdinalIgnoreCase);
var newUsers = imported.ExceptBy(existing.Select(u => u.Email), u => u.Email);   // .NET 6 "By" variants
var common = a.IntersectBy(b.Select(x => x.Id), x => x.Id);
```

- They use the default equality comparer (or the one you pass) and a hash set internally: O(n + m).
- `Union`, `Intersect` and `Except` return **distinct** results.
- They work on sequences of the same type; the `By` variants (.NET 6) compare by a key.

## SequenceEqual

```csharp
bool same = first.SequenceEqual(second);   // same elements in the same order
```

## Chunk (.NET 6)

```csharp
foreach (int[] batch in ids.Chunk(100))
    await SendBatchAsync(batch);           // process in groups of 100; the last may be smaller
```

## MinBy / MaxBy (.NET 6)

```csharp
var cheapest = products.MinBy(p => p.Price);     // the element, not just the price
var newest = orders.MaxBy(o => o.Placed);
```

Before .NET 6 people wrote `OrderBy(...).First()`, which sorts everything (O(n log n)) just to find one element; `MinBy` is a single O(n) pass.

## Interview takeaways

- `OrderBy` + `ThenBy` for multi-key sorting; LINQ sorting is stable.
- `Concat` keeps duplicates; `Union`/`Intersect`/`Except` return distinct results.
- .NET 6 added `DistinctBy`, `UnionBy`, `ExceptBy`, `IntersectBy`, `MinBy`, `MaxBy` and `Chunk`.
