In Java, generics exist only for the compiler: at run time `List<String>` and `List<Integer>` are the same class. In .NET they are **reified**: the runtime knows the real type arguments. This has several visible consequences.

## Each closed type is a separate type

`List<int>` and `List<string>` are two different types. `typeof(T)` inside a generic method gives the real type, and `items is List<int>` is a real check.

```csharp
static string Describe<T>(T value) => typeof(T).Name;

Describe(42);      // "Int32"
Describe("hi");    // "String"
```

## Code is shared for references and copied for values

The JIT compiles one shared version of `List<T>` for **all reference types** (a reference always has the same size, so the code is the same). For **each value type** it compiles a separate, specialized version. That is why `List<int>` stores plain `int`s with no boxing, while the old `ArrayList` boxed every number.

## Static fields belong to each closed type

```csharp
class Counter<T>
{
    public static int Count;
}

Counter<int>.Count++;
Counter<int>.Count++;
Counter<string>.Count++;
Console.WriteLine(Counter<int>.Count);    // 2
Console.WriteLine(Counter<string>.Count); // 1
```

This is used as a fast per-type cache (`EqualityComparer<T>.Default` is built this way), and it is also a classic interview trap.

## `default(T)` and equality

`default(T)` gives `null` for reference types, `0` for numbers, `false` for `bool`, and a zeroed struct for other value types. Since C# 7.1 you can write just `default`.

The operator `==` is not allowed on an unconstrained `T`, because the compiler does not know which `==` to call. Use the comparer instead:

```csharp
static int IndexOf<T>(T[] items, T value)
{
    var comparer = EqualityComparer<T>.Default;   // uses IEquatable<T> when T has it: no boxing
    for (int i = 0; i < items.Length; i++)
        if (comparer.Equals(items[i], value)) return i;
    return -1;
}
```

## Type inference

The compiler infers the type arguments of a **method** from its arguments: `Max(3, 7)` means `Max<int>`. It does not infer them from the return type, and it does not infer them for **constructors**: `new List<int>()` always needs `<int>`. That is why helpers like `Tuple.Create(1, "a")` exist.

## The rule

Think of `Foo<int>` and `Foo<string>` as two separate classes written from one template: they have their own static fields, their own `typeof`, and, for value types, their own compiled code.
