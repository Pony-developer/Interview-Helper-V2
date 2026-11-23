Without constraints, the compiler knows nothing about `T`. Inside a generic method you can only do what works for **any** type: assign it, compare it with `null`, call the methods of `object`. A **constraint** (`where`) promises more about `T`, and in return lets you use more.

```csharp
static T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) >= 0 ? a : b;   // CompareTo is allowed only because of the constraint
}

Max(3, 7);          // 7
Max("pear", "fig"); // "pear"
Max(new object(), new object()); // compile error: object is not IComparable<object>
```

## The kinds of constraints

| Constraint | Means |
|---|---|
| `where T : class` | `T` is a reference type |
| `where T : struct` | `T` is a non-nullable value type |
| `where T : new()` | `T` has a public parameterless constructor, so `new T()` works |
| `where T : Animal` | `T` is `Animal` or derives from it |
| `where T : IComparable<T>` | `T` implements the interface |
| `where T : U` | `T` is `U` or derives from it, where `U` is another type parameter |
| `where T : unmanaged` | `T` is a struct with no references inside (C# 7.3) |
| `where T : notnull` | `T` is not a nullable type (C# 8) |

Several constraints on one parameter are joined with commas. `class` or `struct` goes first, `new()` goes last:

```csharp
interface IEntity { int Id { get; set; } }

class Repository<T> where T : class, IEntity, new()
{
    private readonly Dictionary<int, T> items = new Dictionary<int, T>();

    public T GetOrCreate(int id)
    {
        T item;
        if (!items.TryGetValue(id, out item))
        {
            item = new T { Id = id };   // legal because of new() and IEntity
            items[id] = item;
        }
        return item;
    }
}
```

Each type parameter gets its own `where`:

```csharp
static TValue GetOrAdd<TKey, TValue>(Dictionary<TKey, TValue> map, TKey key)
    where TKey : notnull
    where TValue : new()
```

## Why not just `object` or an interface?

You could write `Max(IComparable a, IComparable b)`. But then:

- a value type such as `int` is **boxed** on every call;
- the result is `IComparable`, and the caller must cast it back;
- nothing checks that `a` and `b` are of the same type, so `Max(3, "pear")` compiles and fails at run time.

The generic version keeps the exact type, checks it at compile time, and does not box.

## The rule

Add the **smallest** constraint that makes your code compile. Every constraint narrows who can use the method, so do not add `class` or `new()` just in case.
