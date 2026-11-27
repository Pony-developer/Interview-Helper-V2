## Func and Action

The BCL defines generic delegates for every common shape, so you rarely declare your own:

| Delegate | Signature | Example |
| --- | --- | --- |
| `Action` | `void ()` | `Action save = () => db.Save();` |
| `Action<T1, ..., T16>` | `void (T1, ...)` | `Action<string> print = Console.WriteLine;` |
| `Func<TResult>` | `TResult ()` | `Func<DateTime> now = () => DateTime.UtcNow;` |
| `Func<T1, ..., T16, TResult>` | `TResult (T1, ...)` | `Func<int, int, int> add = (a, b) => a + b;` |
| `Predicate<T>` | `bool (T)` | used by `List<T>.Find`, `Array.Exists` |
| `Comparison<T>` | `int (T, T)` | used by `List<T>.Sort` |

The last type parameter of `Func` is always the return type.

Exceptions to the rule: `Func` and `Action` can't express `ref`/`out`/`in` parameters or pointers. Declare a custom delegate for those.

## Plug-in methods with Func

```csharp
static IEnumerable<T> Where<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    foreach (var item in source)
        if (predicate(item)) yield return item;
}

var adults = Where(people, p => p.Age >= 18);
```

That's exactly how LINQ is built.

## Delegate compatibility

### Different delegate types don't mix

Two delegate types with the same signature are still **different types**:

```csharp
delegate void D1();
delegate void D2();

D1 d1 = Method;
D2 d2 = d1;              // error
D2 d3 = new D2(d1);      // ok: wrap it
```

### Equality

Delegates are equal if they point to the same methods, on the same targets, in the same order:

```csharp
Action a = Foo, b = Foo;
Console.WriteLine(a == b);   // True
```

### Parameter and return variance

When assigning a **method** to a delegate, the method may be more general than the delegate:

```csharp
static string GetName() => "Ann";
static void Print(object o) => Console.WriteLine(o);

Func<object> f = GetName;      // return type covariance: string is an object
Action<string> a = Print;      // parameter contravariance: Print accepts any object
```

And because `Func<out TResult>` and `Action<in T>` declare variance, delegate **instances** convert too:

```csharp
Func<string> fs = () => "x";
Func<object> fo = fs;          // ok

Action<object> ao = o => { };
Action<string> as2 = ao;       // ok
```

This is why the standard event signature `EventHandler<TEventArgs>` can accept a handler written for a base `EventArgs`.

## Interview takeaways

- `Func<..., TResult>` returns a value, `Action<...>` returns void, `Predicate<T>` returns bool.
- Same signature ≠ same delegate type.
- Methods with more general parameters or more specific return types are compatible with a delegate.
