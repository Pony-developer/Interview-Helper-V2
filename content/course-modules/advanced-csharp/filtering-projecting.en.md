## Filtering

| Operator | Returns |
| --- | --- |
| `Where(pred)` | items for which the predicate is true |
| `Where((item, index) => ...)` | the same, with the item's position |
| `Take(n)` / `Skip(n)` | the first n / all but the first n |
| `TakeLast(n)` / `SkipLast(n)` | the last n / all but the last n (.NET Core 2.0+) |
| `Take(2..5)` | a range of items (.NET 6) |
| `TakeWhile(pred)` / `SkipWhile(pred)` | items until / after the predicate first becomes false |
| `Distinct()` / `DistinctBy(key)` | items without duplicates (`DistinctBy`: .NET 6) |

```csharp
var page = products.OrderBy(p => p.Name).Skip(pageIndex * 20).Take(20);   // paging
var sorted = readings.SkipWhile(r => r < 0);          // drop the leading negatives only
var uniqueEmails = users.DistinctBy(u => u.Email.ToLowerInvariant());
```

`TakeWhile`/`SkipWhile` look at items **in order** and stop at the first failure; they're not filters like `Where`.

In EF Core, `Skip`/`Take` become `OFFSET`/`FETCH` (or `LIMIT`): always `OrderBy` first, otherwise the page contents are undefined.

## Projecting with Select

```csharp
var names = customers.Select(c => c.Name);
var indexed = names.Select((name, i) => $"{i + 1}. {name}");
var dtos = orders.Select(o => new OrderDto(o.Id, o.Lines.Sum(l => l.Qty * l.Price)));
```

`Select` maps each input element to **exactly one** output element.

## Flattening with SelectMany

When each element maps to a **sequence**, `SelectMany` flattens the result:

```csharp
string[] sentences = { "the quick fox", "jumps over" };
var words = sentences.SelectMany(s => s.Split(' '));        // the, quick, fox, jumps, over
var allLines = orders.SelectMany(o => o.Lines);              // every line of every order

// with a result selector that keeps the outer element
var lineInfo = orders.SelectMany(o => o.Lines, (o, l) => new { o.Id, l.Product });
```

In query syntax, a second `from` clause is a `SelectMany`:

```csharp
var pairs =
    from o in orders
    from l in o.Lines
    where l.Qty > 5
    select new { o.Id, l.Product };
```

It's also how you write a **cross join** (every combination) and, with `DefaultIfEmpty`, an outer join:

```csharp
var grid = from x in Enumerable.Range(1, 3) from y in "ab" select $"{x}{y}";   // 1a 1b 2a 2b 3a 3b
```

## Select vs SelectMany, visually

```
Select:      [A, B]        → [f(A), f(B)]                       (2 → 2)
SelectMany:  [A, B]        → [a1, a2, b1]   where f(A)=[a1,a2]  (2 → 3)
```

With EF Core, `SelectMany` over a navigation collection becomes a SQL join.

## Interview takeaways

- `Where` filters anywhere; `TakeWhile`/`SkipWhile` stop at the first non-matching item.
- `Select` = one-to-one; `SelectMany` = one-to-many, flattened.
- Paging needs a stable `OrderBy` before `Skip`/`Take`.
