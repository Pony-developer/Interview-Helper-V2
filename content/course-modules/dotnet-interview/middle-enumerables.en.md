## The collection interfaces as a ladder (Q105–106)

```text
IEnumerable<T>            foreach only (may be lazy, infinite, or a query)
└── IReadOnlyCollection<T>   + Count
    └── IReadOnlyList<T>     + this[int] (read)
ICollection<T>            + Count, Add, Remove, Contains, Clear
└── IList<T>              + this[int] (read/write), Insert, RemoveAt, IndexOf
```

- `T[]` implements `IList<T>`, but `Add` throws `NotSupportedException` — the size is fixed. Arrays are slightly faster than `List<T>` (no extra indirection, bounds checks can be eliminated) and support multi-dimensional and jagged forms.
- `List<T>` = array + `Count` + growth. Use it when the size changes.
- In method signatures, **accept** the most general type you need (`IEnumerable<T>` if you just loop, `IReadOnlyList<T>` if you need an index) and **return** a specific, honest type (`IReadOnlyList<T>`, `List<T>`). Returning `IEnumerable<T>` from a method that runs a query invites multiple enumeration.

## Arrays in memory (Q104)

```csharp
int[] numbers = new int[1000];    // one heap object: header + length + 4000 bytes of ints, contiguous
string[] names = new string[3];   // one heap object with 3 references; each string is its own object
int[,] grid = new int[3, 3];      // one rectangular block
int[][] jagged = new int[3][];    // an array of 3 references to separate arrays
```

All arrays are heap objects, including arrays of primitive types; there is no "array on the stack" except `stackalloc` into a `Span<T>`. Value-type elements are stored inline, which is why `int[]` is cache-friendly and why an `int[]` of ≥ 21,250 elements (85,000 bytes) lands on the LOH.

## LinkedList&lt;T&gt; (Q85)

```csharp
var list = new LinkedList<string>();
var node = list.AddLast("b");
list.AddFirst("a");
list.AddAfter(node, "c");    // O(1) because we hold the node
list.Remove(node);           // O(1)
// no list[2]: access by position walks the nodes, O(n)
```

Every element is a separate `LinkedListNode<T>` object with `Next`, `Previous`, `List` and `Value` — about 48 bytes of overhead per element on 64-bit, scattered in memory. Good for: LRU caches (dictionary of nodes + move-to-front), queues where you remove from the middle, splicing. Bad for: almost everything else.

## Indexers (Q86)

```csharp
public class Matrix
{
    private readonly double[] _data;
    public int Rows { get; }
    public int Cols { get; }
    public double this[int row, int col]
    {
        get => _data[row * Cols + col];
        set => _data[row * Cols + col] = value;
    }
}
public string this[string key] => _settings[key];   // indexers can take any type, and be overloaded
```

## Pull vs push, sync vs async (Q107)

```csharp
// Pull, synchronous: the consumer asks for the next item
foreach (var line in File.ReadLines("log.txt")) { … }

// Pull, asynchronous: ask, then await the next item (DB rows, paged APIs, gRPC streams)
await foreach (var order in db.Orders.AsAsyncEnumerable()) { … }
async IAsyncEnumerable<Page> ReadAllAsync([EnumeratorCancellation] CancellationToken ct = default)
{
    string? next = "/api/items";
    while (next != null) { var page = await GetPageAsync(next, ct); yield return page; next = page.Next; }
}

// Push: the source decides when items arrive (stock ticks, sensor data, UI events)
IObservable<Tick> ticks = feed.Ticks;
using var sub = ticks.Where(t => t.Price > 100).Throttle(TimeSpan.FromSeconds(1)).Subscribe(t => Show(t));
```

`IObservable<T>`/`IObserver<T>` are in the BCL; the operators come from **Rx.NET** (System.Reactive). `Channel<T>` is the modern producer/consumer pipe between the two worlds.

## IEnumerable vs IQueryable (Q108)

```csharp
IQueryable<Order> q = db.Orders.Where(o => o.Total > 100);   // Expression<Func<Order,bool>>
// SQL: SELECT ... FROM Orders WHERE Total > 100

IEnumerable<Order> e = db.Orders.AsEnumerable().Where(o => o.Total > 100);   // Func<Order,bool>
// SQL: SELECT ... FROM Orders   — then filtered in memory
```

| | `IEnumerable<T>` | `IQueryable<T>` |
|---|---|---|
| Lambdas are | delegates (compiled code) | expression trees (data) |
| Executes | in memory, LINQ to Objects | by a provider (SQL, OData, Mongo…) |
| Can call any C# method | yes | only translatable ones |
| Good for | collections already in memory | building queries for a remote source |

A repository that returns `IQueryable<T>` leaks persistence concerns to callers (they can compose any query, possibly untranslatable or slow); returning materialized results or specific query methods keeps control.
