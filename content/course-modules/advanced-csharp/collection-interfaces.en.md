## The hierarchy

```
IEnumerable<T>                  forward-only iteration
 └ IReadOnlyCollection<T>       + Count
    └ IReadOnlyList<T>          + read-only indexer
 └ ICollection<T>               + Count, Add, Remove, Contains, Clear, CopyTo, IsReadOnly
    ├ IList<T>                  + indexer, IndexOf, Insert, RemoveAt
    ├ ISet<T>                   + UnionWith, IntersectWith, IsSubsetOf, ...
    └ IDictionary<TKey,TValue>  + key indexer, ContainsKey, TryGetValue, Keys, Values
IReadOnlyDictionary<TKey,TValue>
```

Each level adds capabilities. There are also non-generic versions (`IEnumerable`, `ICollection`, `IList`, `IDictionary`) from .NET 1.0, which work with `object` and box value types; you meet them only in old APIs.

## Which interface should a method accept or return?

Accept the **weakest** interface that gives you what you need; return the **most useful** one you're willing to commit to.

```csharp
// Only iterates: accept IEnumerable<T>
public decimal Total(IEnumerable<OrderLine> lines) => lines.Sum(l => l.Price);

// Needs Count or indexing: accept IReadOnlyList<T>
public OrderLine Median(IReadOnlyList<OrderLine> lines) => lines[lines.Count / 2];

// Returns a snapshot callers shouldn't modify
public IReadOnlyList<Order> RecentOrders() => _orders.TakeLast(10).ToList();
```

Why not just accept `IEnumerable<T>` everywhere? Because if the method enumerates the input **twice** (once for `Count()`, once to loop), a lazy query is executed twice. Asking for `IReadOnlyCollection<T>` makes it clear the caller must pass something materialized.

## ICollection<T> vs IReadOnlyCollection<T>

Oddly, `ICollection<T>` doesn't derive from `IReadOnlyCollection<T>` (the read-only interfaces came later, in .NET 4.5). Most BCL classes implement both, so a `List<T>` can be passed as either.

`ICollection<T>.IsReadOnly` exists because some implementations (arrays, `ReadOnlyCollection<T>`) implement the interface but throw `NotSupportedException` from `Add`. The read-only interfaces avoid that awkwardness by not having `Add` at all.

## Arrays implement IList<T>

An `int[]` implements `IList<int>` and `IReadOnlyList<int>`. Its `Add` and `Insert` throw, because arrays have a fixed size; the indexer setter works.

## Enumeration contracts

- Changing a collection while enumerating it (adding or removing items) invalidates the enumerator; the next `MoveNext` throws `InvalidOperationException`. Collect changes and apply them afterwards, or iterate backwards over a list with `for`.
- Enumerators of BCL collections are **structs** (`List<T>.Enumerator`), which is why `foreach` over a `List<T>` allocates nothing, while `foreach` over the same list typed as `IEnumerable<T>` boxes the enumerator.

## Choosing a collection: quick table

| Need | Type | Key operations |
| --- | --- | --- |
| Ordered items, indexed access | `List<T>` | index O(1), add at end amortized O(1), insert/remove in the middle O(n) |
| Fast lookup by key | `Dictionary<K,V>` | O(1) average |
| Unique items, membership test | `HashSet<T>` | O(1) average |
| Sorted by key | `SortedDictionary<K,V>` / `SortedSet<T>` | O(log n) |
| FIFO / LIFO | `Queue<T>` / `Stack<T>` | O(1) |
| Process by priority | `PriorityQueue<T,P>` (.NET 6) | O(log n) |
| Frequent inserts in the middle with a node in hand | `LinkedList<T>` | O(1) at a node, O(n) to find it |
| Shared across threads | `ConcurrentDictionary`, `ConcurrentQueue`, ... | lock-free/fine-grained |

## Interview takeaways

- Accept the weakest interface you need; prefer the `IReadOnly*` interfaces in public APIs.
- Don't enumerate an `IEnumerable<T>` parameter twice.
- Know the Big-O of the main operations of `List`, `Dictionary`, `HashSet`, sorted collections.
