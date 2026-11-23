`OrderBy` sorts a sequence by a key, and `Distinct` removes repeated items.

```csharp
var words = new[] { "pear", "fig", "apple", "kiwi", "fig" };

var byLength = words.OrderBy(w => w.Length);             // fig, fig, pear, kiwi, apple
var byLengthDesc = words.OrderByDescending(w => w.Length);
var unique = words.Distinct();                           // pear, fig, apple, kiwi
```

## Several keys

When two items have the same first key, `ThenBy` decides the order:

```csharp
var sorted = words.OrderBy(w => w.Length).ThenBy(w => w);
// fig, fig, kiwi, pear, apple  (equal lengths: alphabetically)
```

`ThenBy` and `ThenByDescending` can be repeated as many times as needed. The first `OrderBy` is the main key.

## Stability

`OrderBy` is **stable**: items with equal keys keep their original order. That is why `fig` comes out in the same place as before. You can rely on this when you sort in several steps.

## Distinct with a key

`Distinct()` compares whole items. To remove duplicates by a part of the item, group by that part and take the first of each group, or use `DistinctBy` in newer .NET versions. In older code, the usual way is `GroupBy(...).Select(g => g.First())`.

## Cost

Sorting takes about `n log n` comparisons. `Distinct` remembers the items it has seen, so it works with hashes, the way `HashSet` does: it needs `GetHashCode` and `Equals` for your own classes.

## Order is not guaranteed after Distinct

`Distinct` keeps the first occurrence of each item, so the order of the first appearances is kept. But do not depend on the order of a dictionary or a set: LINQ methods that build them do not promise an order.
