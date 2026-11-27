## Why generics

Generics let you write a type or method once and use it with any type, **without losing type safety and without boxing**.

```csharp
public class Box<T>
{
    public T Value { get; }
    public Box(T value) => Value = value;
}

var b = new Box<int>(5);     // Box<int> stores an int directly
int n = b.Value;             // no cast, no boxing
```

Compare with an `object`-based version: every `int` would be boxed and every read would need a cast that might fail at run time.

## Generic methods and type inference

```csharp
static void Swap<T>(ref T a, ref T b) { T t = a; a = b; b = t; }

int x = 1, y = 2;
Swap(ref x, ref y);          // T inferred as int
Swap<int>(ref x, ref y);     // or stated explicitly
```

## default

`default(T)` (or just `default` when the type is clear) is `null` for reference types and zero for value types. Useful for "not found" results.

## Constraints

| Constraint | Means |
| --- | --- |
| `where T : SomeBase` | T is or derives from `SomeBase` |
| `where T : IComparable<T>` | T implements the interface |
| `where T : class` / `class?` | T is a reference type (non-nullable / nullable) |
| `where T : struct` | T is a non-nullable value type |
| `where T : notnull` | T is not nullable (C# 8) |
| `where T : unmanaged` | T is a struct with no references inside (usable with pointers and `stackalloc`) |
| `where T : new()` | T has a public parameterless constructor (must come last) |
| `where U : T` | naked type constraint: U derives from another type parameter |

```csharp
static T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;

class Repository<TEntity, TKey>
    where TEntity : class, IEntity<TKey>, new()
    where TKey : IEquatable<TKey> { }
```

Constraints give the compiler permission to let you call members of T, and they protect callers from using a type that won't work.

## Generic types at run time

- **Each closed type is a separate type.** `List<int>` and `List<string>` have their own static fields and their own `typeof`.
- **Value-type instantiations get their own machine code** (no boxing, fully specialized). Reference-type instantiations share one copy of the code.
- Unlike Java, .NET generics are **not erased**: `typeof(List<int>)` and reflection see the real type argument.

```csharp
class Counter<T> { public static int Instances; public Counter() => Instances++; }
new Counter<int>(); new Counter<int>(); new Counter<string>();
Console.WriteLine(Counter<int>.Instances);     // 2
Console.WriteLine(Counter<string>.Instances);  // 1
```

## Subclassing generic types

```csharp
class Stack<T> { }
class SpecialStack<T> : Stack<T> { }       // stays open
class IntStack : Stack<int> { }            // closes the type parameter
class KeyedList<TKey, TValue> : List<TValue> { }   // adds a new one
```

## Self-referencing generics

```csharp
interface IEquatable<T> { bool Equals(T other); }
class Money : IEquatable<Money> { public bool Equals(Money other) => /* ... */ true; }
```

## Interview takeaways

- Generics give type safety and avoid boxing for value types.
- Constraints let you call members of T; `new()` lets you create T.
- Each closed generic type has its own statics; .NET generics are reified, not erased.
