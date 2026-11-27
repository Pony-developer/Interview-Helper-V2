## Element operators

| Operator | Empty sequence | More than one match |
| --- | --- | --- |
| `First()` / `Last()` | throws | returns the first / last |
| `FirstOrDefault()` / `LastOrDefault()` | `default` (or your value, .NET 6) | returns the first / last |
| `Single()` | throws | **throws** |
| `SingleOrDefault()` | `default` | **throws** |
| `ElementAt(i)` / `ElementAtOrDefault(i)` | throws / `default` | |

```csharp
var admin = users.First(u => u.IsAdmin);
var byEmail = users.SingleOrDefault(u => u.Email == email);   // asserts emails are unique
var fallback = prices.FirstOrDefault(p => p > 100, defaultValue: -1);   // .NET 6
```

Choose deliberately: `Single` documents and enforces "there must be exactly one". `First` on a database query adds `TOP(1)`; `Single` adds `TOP(2)` to detect duplicates.

Watch out: `FirstOrDefault` on a sequence of a value type returns `0`/`false`, which may be a legitimate value. Use the `defaultValue` overload, or check `Any` first.

## Aggregation

```csharp
int count = orders.Count(o => o.Paid);
long big = hugeSequence.LongCount();
decimal total = lines.Sum(l => l.Qty * l.Price);
double avg = ratings.Average();
var cheapest = prices.Min();
var latest = orders.Max(o => o.Placed);
```

- `Min`, `Max`, `Average` throw on an **empty** sequence of a non-nullable type; `Sum` returns 0. Project to a nullable (`Max(o => (decimal?)o.Total)`) to get `null` instead.
- `Count()` uses `ICollection<T>.Count` when available (O(1)); otherwise it enumerates everything.
- `TryGetNonEnumeratedCount` (.NET 6) tells you if the count is cheap.

### Aggregate: a general fold

```csharp
int product = numbers.Aggregate(1, (acc, n) => acc * n);              // seed + accumulator
string csv = words.Aggregate((a, b) => a + "," + b);                 // no seed: starts with the first item
var stats = numbers.Aggregate(
    seed: (Min: int.MaxValue, Max: int.MinValue),
    func: (acc, n) => (Math.Min(acc.Min, n), Math.Max(acc.Max, n)),
    resultSelector: acc => $"{acc.Min}..{acc.Max}");
```

`Aggregate` can express any reduction. It can't be translated to SQL, so with EF Core use it after materializing.

## Quantifiers

```csharp
bool anyOverdue = invoices.Any(i => i.DueDate < today);
bool allPaid = invoices.All(i => i.Paid);              // true for an empty sequence!
bool hasPen = products.Select(p => p.Name).Contains("Pen");
```

Use `Any()` rather than `Count() > 0`: it stops at the first element (and becomes `EXISTS` in SQL).

## Generation

```csharp
Enumerable.Range(1, 5);              // 1 2 3 4 5
Enumerable.Repeat("-", 3);           // - - -
Enumerable.Empty<Order>();           // a cached empty sequence
items.DefaultIfEmpty(fallback);      // the sequence, or a single fallback if empty
```

## Conversion

| Operator | Result |
| --- | --- |
| `ToList`, `ToArray` | materialized copies (immediate) |
| `ToDictionary(key, value?)` | throws on duplicate keys |
| `ToHashSet()` | distinct set (.NET Core 2.0+) |
| `ToLookup(key)` | one-to-many dictionary |
| `AsEnumerable()` | changes the static type to `IEnumerable<T>` (switches from SQL to in-memory) |
| `AsQueryable()` | wraps a local sequence as `IQueryable<T>` |
| `Cast<T>()` | casts each element; throws on mismatch |
| `OfType<T>()` | keeps only elements of type T |

`Cast` and `OfType` are mainly for non-generic collections (`ArrayList`, `DataRowCollection`) and for picking a subtype out of a mixed list: `shapes.OfType<Circle>()`.

## Interview takeaways

- `First` vs `Single`: the latter enforces uniqueness. `OrDefault` variants don't throw on empty.
- `Min`/`Max`/`Average` throw on empty; `Sum` and `Count` don't.
- `Any()` beats `Count() > 0`; `All` is true for an empty sequence.
