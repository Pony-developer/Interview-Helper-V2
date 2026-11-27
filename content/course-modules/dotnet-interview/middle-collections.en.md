## Generics at run time, reflection (Q83–84)

Generic types are compiled to IL **once**, as open generics (``List`1``). Concrete types are created **at run time** by the CLR/JIT: every **value-type** argument gets its own specialized native code (`List<int>`, `List<double>`: no boxing), while all **reference-type** arguments share one implementation (`List<string>` and `List<object>` use the same code). Unlike Java, type information is not erased: `typeof(List<int>)` exists at run time.

**Reflection** inspects and uses type metadata at run time: `GetType()`, `typeof`, `Type.GetProperties()`, `MethodInfo.Invoke`, `Activator.CreateInstance`, reading attributes. Used by serializers, ORMs, DI containers, test frameworks and plug-in loaders. It is slow and bypasses compile-time checks; cache `PropertyInfo`s, use compiled expression trees or source generators on hot paths.

## LinkedList, indexers, immutability, StringBuilder (Q85–88)

- **`LinkedList<T>`** is a doubly linked list of `LinkedListNode<T>` objects. O(1) insertion/removal at a node you already hold (`AddAfter`, `Remove(node)`), O(n) access by position, no indexer, poor cache locality and an extra object per element. `List<T>` wins in almost every real scenario; a linked list shines for LRU caches (combined with a dictionary of nodes).
- An **indexer** lets an object be used with `[]`: `public T this[int index] { get { … } set { … } }`. Examples: `List<T>`, `Dictionary<K,V>`, `string`.
- An **immutable** object cannot change after construction. Advantages: thread-safe without locks, safe as dictionary keys, no defensive copies, easier reasoning. Implementation: `readonly` fields, get-only or `init` properties, set everything in the constructor, don't leak mutable inner state (use `ImmutableList`/`IReadOnlyList` or copy), "modifying" methods return a new instance. C# `record` types and `with` expressions do most of this for you: `var older = person with { Age = 31 };`.
- **`StringBuilder`** keeps a list of character chunks; `Append` writes into the current chunk and adds a new chunk when full, so there is no copy of the whole string on every append. Use it when building a string in a loop or from many pieces; use `string` (`+`, interpolation, `string.Join`, `string.Concat`) for a few concatenations.

## Trees, key-value and hashing (Q89–90, 100–103)

**Tree balancing** keeps the height of a binary search tree at O(log n) by rotating nodes after inserts and deletes (AVL trees, red-black trees). Without it, inserting sorted data degrades the tree into a linked list with O(n) operations. `SortedDictionary` and `SortedSet` are red-black trees.

**Key-value structures** map keys to values: `Dictionary`, `SortedDictionary`, `SortedList`, `ConcurrentDictionary`, plus external stores such as Redis.

A **hash function** maps a key to a fixed-size number. A **hash table** uses it to choose a bucket, giving O(1) average lookup, insert and delete. An ideal hash function is **deterministic** (equal keys → equal hashes, so `Equals` and `GetHashCode` must be overridden together), **uniform** (spreads keys evenly), **fast**, and changes a lot when the input changes slightly (avalanche effect). Use `HashCode.Combine(a, b)`. Never let a key's hash change while it is in a dictionary.

A **collision** is two keys landing in the same bucket. Resolution: **chaining** (each bucket holds a chain of entries — what .NET's `Dictionary` does, using an `entries` array and `next` indexes) or **open addressing** (probe the next slots: linear or quadratic probing, double hashing). When the load factor grows, the table **resizes** (to the next prime size) and rehashes everything.

`Dictionary<K, V>` CRUD: add, lookup, update, remove are **O(1) on average**, O(n) in the worst case (all keys collide); `Add` occasionally costs O(n) for a resize, amortized O(1).

## Arrays and lists (Q104–106)

Arrays are reference types: **every array lives on the heap**, including `int[]`. An array of a value type stores the values inline in one contiguous block (great for cache); an array of a reference type stores references. Arrays of 85,000+ bytes go to the LOH.

`T[]` has a fixed length and is slightly faster; `List<T>` wraps an array and grows it (doubling the capacity and copying) when full. Pre-size with `new List<T>(capacity)` when you know the size.

`IEnumerable<T>` only allows a forward-only `foreach` (it may be lazy, infinite or a database query). `IList<T>` adds `Count`, index access, `Add`, `Insert`, `Remove`. Accept the least specific interface you need (`IEnumerable<T>`, `IReadOnlyCollection<T>`) and return the most useful one.

## Pull vs push; IEnumerable vs IQueryable; flags (Q107–109)

| Interface | Model | Consumer |
|---|---|---|
| `IEnumerable<T>` | **pull**, synchronous | `foreach` asks for the next item |
| `IAsyncEnumerable<T>` | **pull**, asynchronous | `await foreach` asks and awaits the next item (streaming from DB/HTTP) |
| `IObservable<T>` | **push** | the source calls `OnNext/OnError/OnCompleted` on subscribers (Rx, events) |

**`IEnumerable<T>`** executes in memory with delegates (`Func<T, bool>`). **`IQueryable<T>`** holds an **expression tree** (`Expression<Func<T, bool>>`) that a provider (EF Core) translates into SQL, so filtering, sorting and paging happen in the database. Calling `AsEnumerable()` or `ToList()` too early pulls the whole table into memory.

**Enum flags** combine values with bitwise operations:

```csharp
[Flags]
enum Permissions { None = 0, Read = 1, Write = 2, Execute = 4, All = Read | Write | Execute }

var p = Permissions.Read | Permissions.Write;
bool canWrite = p.HasFlag(Permissions.Write);   // or (p & Permissions.Write) != 0
p &= ~Permissions.Write;                         // remove a flag
Console.WriteLine(p);                             // "Read"
```

Use powers of two for the values; `[Flags]` also makes `ToString()` print `"Read, Write"`.
