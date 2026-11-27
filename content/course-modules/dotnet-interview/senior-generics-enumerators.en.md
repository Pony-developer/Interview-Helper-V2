## Generics at run time (Q141)

```csharp
class Cache<T> { public static int Hits; }
Cache<int>.Hits = 1;
Cache<string>.Hits = 2;
Cache<object>.Hits = 3;
// Three separate closed types → three separate static fields
```

- **Metadata** keeps one open definition (``Cache`1``). The runtime creates a type (method table) for each closed type you use.
- **Code sharing**: for value-type arguments the JIT generates **specialized native code** per type (`List<int>`, `List<Guid>`) — no boxing, and calls through constraints like `IComparable<T>` can be devirtualized and inlined. For reference-type arguments, one shared implementation (`List<__Canon>`) serves all of them; when the code needs the exact type (`typeof(T)`, `new T()`, casting) it looks it up through a hidden **generic dictionary**.
- **Constraints** (`where T : class`, `struct`, `new()`, `notnull`, `unmanaged`, base class, interfaces, `allows ref struct` in C# 13) are verified at compile time and at type-load time.
- **Variance** applies to interfaces and delegates only: `IEnumerable<out T>` (covariant — an `IEnumerable<string>` is an `IEnumerable<object>`), `IComparer<in T>` (contravariant), `Func<in T, out TResult>`. Classes like `List<T>` are invariant.
- Unlike Java, there's no type erasure: `List<int>` really stores `int`s.

## Writing an immutable type (Q142)

```csharp
public sealed class Order                                     // sealed: no mutable subclasses
{
    public Guid Id { get; }
    public IReadOnlyList<OrderLine> Lines { get; }           // OrderLine is immutable too
    public OrderStatus Status { get; }

    public Order(Guid id, IEnumerable<OrderLine> lines, OrderStatus status)
    {
        if (id == Guid.Empty) throw new ArgumentException("Empty id", nameof(id));
        Id = id;
        Lines = lines.ToImmutableArray();                    // defensive copy: callers can't change it
        Status = status;
    }

    public Order WithLine(OrderLine line) => new(Id, Lines.Append(line), Status);   // "mutations" return new objects
    public Order Ship() => Status == OrderStatus.Paid ? new(Id, Lines, OrderStatus.Shipped)
                                                      : throw new InvalidOperationException();
}

// Or, for data-centric types:
public sealed record OrderLine(string Sku, int Quantity, decimal Price);
var bigger = line with { Quantity = 5 };
```

Pitfalls: a record's `with` creates a **shallow** copy — a `List<T>` property is shared between the copies; `init` setters can still be set by object initializers (that's by design); reflection and serializers can bypass `readonly`. Use `System.Collections.Immutable` (structural sharing — `ImmutableList.Add` reuses most of the old tree) or `ImmutableArray` (an array wrapper, cheap reads, copy on change).

## IEnumerable&lt;T&gt; in detail (Q143)

```csharp
foreach (var x in source) Console.WriteLine(x);
// compiles to:
using (IEnumerator<T> e = source.GetEnumerator())    // pattern-based: a struct enumerator is used if available
{
    while (e.MoveNext())
    {
        var x = e.Current;
        Console.WriteLine(x);
    }
}   // Dispose runs even after break/exception → finally blocks inside iterators execute
```

A hand-written enumerator for a custom collection:

```csharp
public struct Enumerator : IEnumerator<T>
{
    private readonly ArrayStack<T> _stack;
    private readonly int _version;
    private int _index;
    internal Enumerator(ArrayStack<T> s) { _stack = s; _version = s._version; _index = s._size; }

    public bool MoveNext()
    {
        if (_version != _stack._version) throw new InvalidOperationException("Collection was modified");
        return --_index >= 0;
    }
    public T Current => _stack._items[_index];
    object? IEnumerator.Current => Current;
    public void Reset() => throw new NotSupportedException();
    public void Dispose() { }
}
```

- Each `GetEnumerator()` call starts an independent cursor; an `IEnumerable` can be enumerated many times (a lazy one recomputes every time).
- `List<T>.Enumerator` is a **struct** returned from a public `GetEnumerator()`, so `foreach` over a `List<T>` variable doesn't allocate; through an `IEnumerable<T>` variable it is boxed.
- The `_version` check is why modifying a list inside its `foreach` throws.
- Iterator methods (`yield`) generate a class implementing both `IEnumerable<T>` and `IEnumerator<T>`; the first `GetEnumerator()` on the creating thread returns the same object to save an allocation.

## Stack and friends (Q144)

`Stack<T>`: an array + `_size` + `_version`. `Push` writes `_array[_size++]` and doubles the array when full (amortized O(1)); `Pop` returns `_array[--_size]` and clears the slot (for reference types) so the GC can reclaim the object; enumeration goes from the top. `Queue<T>`: a circular buffer with `_head` and `_tail` indices wrapping around. `PriorityQueue<TElement, TPriority>`: an array-based quaternary (4-ary) min-heap. `SortedSet`/`SortedDictionary`: red-black trees. `LinkedList`: a circular doubly linked list. `Dictionary`/`HashSet`: arrays of buckets and entries with chaining by index.

## Interface + abstract class, and struct constructors (Q146–147)

The pattern "interface for consumers, abstract base for implementers" appears all over the BCL and in good libraries: `IHostedService` + `BackgroundService`, `IComparer<T>` + `Comparer<T>`, `IList<T>` + `Collection<T>`, `IValidator<T>` + `AbstractValidator<T>` (FluentValidation). Consumers depend on the small contract (easy to fake); implementers get the plumbing for free but can still implement the interface from scratch.

Struct constructors: `new S[1000]` and `default(S)` produce zeroed memory without running any code, so the CLR historically didn't let C# declare a parameterless struct constructor that would run only in some cases. C# 10 allows it (and field initializers), but remember: array elements, `default`, uninitialized fields and `Activator.CreateInstance` on some runtimes still give the all-zero value. Design structs so that zero is a valid state (`default(TimeSpan)` is `00:00:00`, `default(Guid)` is `Guid.Empty`).
