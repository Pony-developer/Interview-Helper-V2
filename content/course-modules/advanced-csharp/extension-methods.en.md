## Adding methods to types you don't own

An extension method is a **static method in a static class** whose first parameter has the `this` modifier. It can then be called as if it were an instance method of that parameter's type.

```csharp
public static class StringExtensions
{
    public static bool IsBlank(this string? s) => string.IsNullOrWhiteSpace(s);

    public static string Capitalize(this string s) =>
        s.Length == 0 ? s : char.ToUpper(s[0]) + s.Substring(1);
}

"hello".Capitalize();     // "Hello"
"   ".IsBlank();          // true
```

The compiler simply rewrites `"hello".Capitalize()` into `StringExtensions.Capitalize("hello")`. There's no magic at run time and no access to private members.

## Rules

- The class must be static and **non-nested**, non-generic.
- The extension is visible only where its **namespace is imported** (`using`). That's how `using System.Linq;` "adds" `Where` and `Select` to every `IEnumerable<T>`.
- **Instance methods always win.** If the type already has a method with a compatible signature, the extension is never called.
- Between two extension methods, the more specific parameter type wins (`string` beats `object`); a true tie is a compile error that you resolve by calling the static method explicitly.

## Calling on null

Because it's a static call, invoking an extension on a null reference **doesn't** throw by itself:

```csharp
string? s = null;
bool blank = s.IsBlank();   // true, no exception
```

This is handy for null-tolerant helpers, but surprising to readers; make it obvious from the method name.

## Extending interfaces and generics

The real power appears when you extend an interface: every implementation gets the method.

```csharp
public static class EnumerableExtensions
{
    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source) where T : class
    {
        foreach (var item in source)
            if (item != null) yield return item;
    }
}

IEnumerable<string> names = rawNames.WhereNotNull();
```

LINQ is exactly this: a big set of extension methods on `IEnumerable<T>` and `IQueryable<T>`.

## Chaining

Extensions that return their input type compose into readable pipelines:

```csharp
var report = orders
    .WhereNotNull()
    .Where(o => o.Total > 100)
    .OrderBy(o => o.Placed)
    .Take(10);
```

## Extension methods on enums, value types and ref

```csharp
public static string Label(this OrderStatus s) => s switch { OrderStatus.Placed => "New", _ => s.ToString() };
public static void Increment(this ref int value) => value++;   // C# 7.2: ref extension on a struct
```

## When to use (and not)

Good for: helpers on types you can't change (BCL, third-party), fluent APIs, adding behavior to interfaces, keeping DTOs free of logic.

Avoid when: the type is yours (add a real method), the method needs private state, or a generic extension on `object` would pollute IntelliSense everywhere.

## Interview takeaways

- `static` method in a `static` class with `this` on the first parameter; resolved at compile time.
- Instance methods take precedence; the namespace must be imported.
- Works on null receivers, interfaces and generics: that's how LINQ is built.
