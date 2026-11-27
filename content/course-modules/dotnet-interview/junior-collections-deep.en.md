## How List&lt;T&gt; grows (Q33)

`List<T>` wraps an array. When it is full, `Add` allocates a new array of **double** the capacity and copies everything. Most `Add` calls are O(1); the rare resize is O(n); on average it is **amortized O(1)**.

```csharp
var list = new List<int>();        // capacity 0
list.Add(1);                       // capacity 4
// ... 5th Add → capacity 8, 9th → 16, ...
var sized = new List<int>(10_000); // pre-size when you know the count: no resizes
```

`Insert(0, x)` and `RemoveAt(0)` shift every element: O(n). `Contains`/`IndexOf` scan: O(n). If you look items up by value often, you need a set or a dictionary.

## HashSet and Dictionary (Q33)

```csharp
var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
if (!seen.Add(email)) Console.WriteLine("duplicate");       // Add returns false if present

var stock = new Dictionary<string, int>();
stock["apple"] = 10;                                          // add or overwrite
stock.TryAdd("pear", 5);                                      // add only if absent
if (stock.TryGetValue("plum", out var qty)) { /* found */ }   // no exception when missing
stock["apple"] += 1;
foreach (var (name, count) in stock) Console.WriteLine($"{name}: {count}");
```

Both are hash tables: average O(1) for add, lookup and remove. The key's `GetHashCode` picks a bucket; `Equals` resolves collisions — so keys must not change while stored. Set operations: `UnionWith`, `IntersectWith`, `ExceptWith`, `IsSubsetOf`. Neither keeps a sorted order — use `SortedSet` / `SortedDictionary` for that (O(log n)).

## Choosing a collection (Q34)

| You need… | Use |
|---|---|
| A fixed number of items, max speed | `T[]` |
| An ordered list you append to and index | `List<T>` |
| Fast "is it there?" / uniqueness | `HashSet<T>` |
| Lookup by key | `Dictionary<TKey, TValue>` |
| Sorted by key | `SortedDictionary` / `SortedList` |
| FIFO processing | `Queue<T>` |
| LIFO (undo, DFS, parsing brackets) | `Stack<T>` |
| Always take the smallest/highest priority | `PriorityQueue<T, TPriority>` |
| Many threads at once | `ConcurrentDictionary`, `ConcurrentQueue`, `Channel<T>` |
| Never changes after creation | `ImmutableArray`, `FrozenDictionary` (.NET 8) |
| Expose read-only | return `IReadOnlyList<T>` / `IReadOnlyDictionary` |

## yield return in detail (Q35)

```csharp
static IEnumerable<int> ReadNumbers(string path)
{
    Console.WriteLine("opening");
    foreach (var line in File.ReadLines(path))
    {
        if (line.StartsWith("#")) continue;
        yield return int.Parse(line);          // pause here, hand out one value
    }
    Console.WriteLine("closing");
}

var first3 = ReadNumbers("data.txt").Take(3).ToList();
```

- Nothing runs at the call `ReadNumbers(...)`; the body starts at the first `MoveNext()`.
- Execution pauses at each `yield return` and continues from the same place on the next `MoveNext()`.
- With `Take(3)`, enumeration stops early: "closing" is never printed, but the `foreach` over the file is disposed correctly (`Dispose` runs pending `finally` blocks).
- Enumerating the result twice runs the method twice.
- `yield break` ends the sequence. Iterators can't have `ref`/`out` parameters, and the argument checks run late (lazily) — split the method if you need eager validation.
- `IAsyncEnumerable<T>` + `await foreach` is the async version (stream rows from a database or pages from an API).
