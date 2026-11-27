## Types (Q25–29)

C# types are **value types** (`struct`, `enum`, all numeric types, `bool`, `char`, `DateTime`, `Guid`, value tuples) and **reference types** (`class`, `interface`, `delegate`, `record`, arrays, `string`, `object`).

Primitive types: `bool`, `byte/sbyte`, `short/ushort`, `int/uint`, `long/ulong`, `char`, `float`, `double`, plus `decimal` (128-bit, base 10, for money) and `nint/nuint`.

| | Value type | Reference type |
|---|---|---|
| The variable holds | the data itself | a reference to an object on the heap |
| Assignment | copies the value | copies the reference (both point to one object) |
| Can be null | only as `Nullable<T>` (`int?`) | yes |
| Inheritance | no (sealed, derives from `ValueType`) | yes |

"Value types live on the stack" is a simplification: a **local** value type lives on the stack (or in a register), but a value-type **field of a class** or an **array element** lives on the heap inside that object.

**`string` is a reference type**, but it is immutable and overloads `==` to compare characters, so it *feels* like a value.

A **nullable value type** `int?` is `Nullable<int>`: a struct with `HasValue` and `Value`. Useful operators: `x ?? 0`, `x?.ToString()`, `x.GetValueOrDefault()`.

## string vs StringBuilder, generics, boxing (Q30–32)

`string` is immutable: `s += "a"` creates a new string and copies the old one, so building a string in a loop is O(n²). `StringBuilder` appends into a growable buffer, then you call `ToString()` once. For two or three concatenations, plain `+` or interpolation is fine.

**Generics** (`List<T>`, `Dictionary<TKey, TValue>`, `T Max<T>(T a, T b) where T : IComparable<T>`) give type safety and reuse without casts and without **boxing** value types.

**Boxing** copies a value type into a new object on the heap when it is converted to `object` or an interface: `object o = 42;`. **Unboxing** copies it back with an explicit cast to the exact type: `int i = (int)o;` (`(long)o` throws `InvalidCastException`). Boxing costs allocations and GC work; the old non-generic `ArrayList` boxed every `int`.

## Collections (Q33–35)

| Collection | What it is | Search | Insert | Delete |
|---|---|---|---|---|
| `T[]` | fixed-size block | O(n) by value, O(1) by index | — | — |
| `List<T>` | growable array | O(n) by value, O(1) by index | O(1) amortized at the end, O(n) in the middle | O(n) |
| `HashSet<T>` | unique items, hash table | O(1) | O(1) | O(1) |
| `Dictionary<K, V>` | key → value hash table | O(1) by key | O(1) | O(1) |
| `SortedDictionary<K, V>` | red-black tree | O(log n) | O(log n) | O(log n) |
| `LinkedList<T>` | doubly linked list | O(n) | O(1) at a known node | O(1) at a known node |

Others: `Queue<T>` (FIFO), `Stack<T>` (LIFO), `SortedSet<T>`, `PriorityQueue<T, P>`, the concurrent family (`ConcurrentDictionary`, `ConcurrentQueue`, `BlockingCollection`) and the immutable family (`ImmutableList`).

`yield return` turns a method into an **iterator**: the compiler generates a state machine implementing `IEnumerable<T>`, and the body runs **lazily**, one element per `MoveNext()`. `yield break` ends the sequence.

```csharp
static IEnumerable<int> Evens(int max)
{
    for (int i = 0; i <= max; i += 2) yield return i;
}
```

## Classes, structs, interfaces (Q36–44)

- A **class** is a reference type: a blueprint with fields, properties, methods, events and constructors.
- An **abstract class** cannot be instantiated; it may contain abstract members (no body) that derived classes must override, plus ordinary members, fields and constructors.
- An **interface** is a pure contract. A class has one base class but many interfaces. Since C# 8 interfaces may have default method implementations, but still no instance fields. Use an interface for a capability (`IComparable`, `IDisposable`, a repository you will mock) and an abstract class to share code between closely related types.
- **Access modifiers**: `public`, `private` (the default for members), `protected`, `internal` (the default for top-level types; visible inside the assembly), `protected internal` (same assembly OR derived), `private protected` (derived AND same assembly), `file` (C# 11).
- A **static class** cannot be instantiated or inherited and has only static members (`Math`, holders of extension methods).
- **`override`** replaces a `virtual` or `abstract` member: the call is dispatched by the runtime type. **`new`** *hides* the base member: which one runs depends on the compile-time type of the variable. `Base b = new Derived(); b.M();` runs `Derived.M` with `override` and `Base.M` with `new`.
- **`const`** is a compile-time constant (only primitives and strings), implicitly static, and is copied into every assembly that uses it, so changing it requires recompiling the callers. **`readonly`** fields are assigned in the declaration or a constructor at run time and can hold any type.
- A **struct** is a value type: copied on assignment, no inheritance, best for small immutable data (`DateTime`, `TimeSpan`, `Guid`, `KeyValuePair`, `Point`). A **class** is a reference type with identity and inheritance.
- A struct **does** end up on the heap when it is a field of a class, an array element, boxed, or captured by a lambda or kept across `await` / `yield`.
