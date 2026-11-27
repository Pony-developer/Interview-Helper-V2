## From key to bucket (Q100)

A hash table stores entries in an array of **buckets**. To find a key:

```text
hash   = key.GetHashCode()          // e.g. 1_337_420_911
index  = (hash & 0x7FFFFFFF) % buckets.Length   // e.g. 7
bucket[7] → (key, value) → (key, value) → null   // compare each key with Equals
```

If the hash function spreads keys evenly and the table is not too full, each bucket has 0–2 entries: lookup, insert and delete are O(1) on average. That's the whole point: instead of comparing with every element (O(n)) or walking a tree (O(log n)), you jump straight to the right place.

## A good hash function (Q101)

1. **Deterministic** within the process: equal keys → equal hashes. This is the `Equals`/`GetHashCode` contract: if `a.Equals(b)`, then `a.GetHashCode() == b.GetHashCode()`. The opposite is not required (collisions are allowed).
2. **Uniform**: spreads typical keys evenly across buckets.
3. **Fast**: it runs on every operation.
4. **Avalanche**: a small change in the input changes many bits of the output.
5. For untrusted input, **resistant to deliberate collisions** — .NET Core randomizes string hashing per process for this reason (never persist `GetHashCode()` values).

Cryptographic hashes (SHA-256) are a different tool: collision-resistant and one-way, but far too slow for a dictionary.

```csharp
public sealed class Point(int x, int y) : IEquatable<Point>
{
    public int X { get; } = x;
    public int Y { get; } = y;
    public bool Equals(Point? o) => o is not null && o.X == X && o.Y == Y;
    public override bool Equals(object? o) => Equals(o as Point);
    public override int GetHashCode() => HashCode.Combine(X, Y);   // never just X ^ Y: (1,2) and (2,1) collide
}
```

Records generate correct `Equals`/`GetHashCode` for you. Fields used in the hash must not change while the object is in a dictionary or set.

## Collisions (Q102)

Two different keys landing in one bucket is unavoidable (the pigeonhole principle). Strategies:

- **Separate chaining**: each bucket holds a linked list of entries. Simple; degrades gracefully. .NET's `Dictionary<TKey,TValue>` uses chaining implemented with arrays: `int[] buckets` holds the index of the first entry, and `Entry[] entries` has a `next` index — no node objects, good cache locality.
- **Open addressing**: on a collision, probe other slots in the same array — linear probing (`i+1, i+2…`), quadratic probing, double hashing. Deletion needs "tombstones". Used by many high-performance tables.
- **Resizing**: when `count / buckets` (the **load factor**) passes a threshold, allocate a bigger array (.NET picks the next prime ≥ 2×) and re-insert every entry. A single `Add` then costs O(n), amortized O(1).
- Worst case: all keys collide → O(n) per operation. Java and .NET mitigate attacks with randomized string hashing (Java also turns long chains into trees).

## Dictionary&lt;K,V&gt; complexity (Q103)

| Operation | Average | Worst |
|---|---|---|
| `Add`, `TryAdd`, indexer set | O(1), O(n) on resize | O(n) |
| `TryGetValue`, `ContainsKey`, indexer get | O(1) | O(n) |
| `Remove` | O(1) | O(n) |
| `ContainsValue` | O(n) | O(n) |
| Enumeration | O(n) | O(n) |

Tips: pass a capacity when you know the size (`new Dictionary<K,V>(10_000)`) to avoid resizes; pass a comparer for case-insensitive keys (`StringComparer.OrdinalIgnoreCase`); use `CollectionsMarshal.GetValueRefOrAddDefault` for hot counters; `FrozenDictionary` (.NET 8) for read-only lookups built once.

## Key-value structures (Q90)

- In memory: `Dictionary`, `SortedDictionary` (tree, ordered), `SortedList` (two sorted arrays, compact), `ConcurrentDictionary` (fine-grained locking), `ImmutableDictionary`, `FrozenDictionary`, `Lookup<K,V>` (one key → many values), `ConditionalWeakTable` (attaches data to objects without keeping them alive).
- Out of process: Redis, Memcached, DynamoDB, Azure Table Storage, etcd — the same idea at network scale, usually with partitioning by key hash (consistent hashing).
