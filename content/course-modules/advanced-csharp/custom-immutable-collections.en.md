## Customizable collections: Collection<T>

`List<T>`'s methods aren't virtual, so you can't intercept `Add`. `System.Collections.ObjectModel.Collection<T>` wraps a list and exposes **protected virtual hooks**:

```csharp
public class TagCollection : Collection<string>
{
    protected override void InsertItem(int index, string item)
    {
        if (string.IsNullOrWhiteSpace(item)) throw new ArgumentException("Empty tag");
        base.InsertItem(index, item.Trim().ToLowerInvariant());
    }
    protected override void SetItem(int index, string item) { /* validate too */ base.SetItem(index, item); }
    protected override void RemoveItem(int index) { /* audit */ base.RemoveItem(index); }
    protected override void ClearItems() { base.ClearItems(); }
}
```

`Add`, `Insert`, the indexer setter, `Remove` and `Clear` all route through these four methods. `ObservableCollection<T>` (used for WPF/MAUI data binding) is built exactly this way, raising `CollectionChanged` from them.

## KeyedCollection<TKey, TItem>

A collection that is a list **and** a dictionary, where the key comes from the item itself:

```csharp
public class Customers : KeyedCollection<string, Customer>
{
    public Customers() : base(StringComparer.OrdinalIgnoreCase) { }
    protected override string GetKeyForItem(Customer c) => c.Email;
}

var all = new Customers { ann, bob };
var a = all["ANN@shop.test"];    // by key
var first = all[0];              // by index, insertion order
```

## Read-only wrappers

```csharp
private readonly List<Order> _orders = new();
public ReadOnlyCollection<Order> Orders => _orders.AsReadOnly();
```

`ReadOnlyCollection<T>` and `ReadOnlyDictionary<K,V>` are **views**: callers can't modify them, but the owner can, and callers see the changes. They protect your invariants without copying.

## Immutable collections

`System.Collections.Immutable` provides collections that **never change** after creation:

```csharp
ImmutableList<int> a = ImmutableList.Create(1, 2, 3);
ImmutableList<int> b = a.Add(4);       // returns a NEW list; a is still {1, 2, 3}

var builder = ImmutableDictionary.CreateBuilder<string, int>();   // efficient bulk construction
builder.Add("x", 1); builder.Add("y", 2);
ImmutableDictionary<string, int> dict = builder.ToImmutable();
```

How they stay efficient: most are **balanced trees with structural sharing**, so `Add` creates O(log n) new nodes and reuses the rest. The trade-off: reads are slower than `List<T>`/`Dictionary` (except `ImmutableArray<T>`, which is a plain array wrapper with fast reads but O(n) "modifications").

| Type | Good for |
| --- | --- |
| `ImmutableArray<T>` | small, rarely changed data; fastest reads |
| `ImmutableList<T>` | frequently "modified" lists shared across threads |
| `ImmutableDictionary<K,V>` / `ImmutableHashSet<T>` | snapshots of lookup data |
| `FrozenDictionary`/`FrozenSet` (.NET 8) | built once at startup, read millions of times |

Benefits: **thread safety without locks** (a reader holds a snapshot that can't change), safe sharing, easy undo/history, and value semantics inside records.

## Plugging in equality and order

Most collections accept an `IEqualityComparer<T>` or `IComparer<T>`:

```csharp
var byEmail = new Dictionary<string, Customer>(StringComparer.OrdinalIgnoreCase);
var unique = new HashSet<Point>(new PointTolerantComparer(0.001));
var ordered = new SortedSet<Order>(Comparer<Order>.Create((a, b) => a.Placed.CompareTo(b.Placed)));

class PointTolerantComparer : IEqualityComparer<Point>
{
    private readonly double _eps;
    public PointTolerantComparer(double eps) => _eps = eps;
    public bool Equals(Point a, Point b) => Math.Abs(a.X - b.X) < _eps && Math.Abs(a.Y - b.Y) < _eps;
    public int GetHashCode(Point p) => 0;   // tolerance-based equality can't hash well: correct but O(n)
}
```

That last comment is a real lesson: "approximately equal" isn't transitive, so it can't have a good hash function.

## Interview takeaways

- Derive from `Collection<T>` (not `List<T>`) to intercept changes; `KeyedCollection` adds key lookup.
- Read-only wrapper = view of mutable data; immutable collection = data that can never change.
- Immutable collections use structural sharing; great for concurrency and snapshots, slower for reads.
