## The member hierarchy

```
MemberInfo
 ├ Type
 ├ FieldInfo
 ├ PropertyInfo
 ├ EventInfo
 └ MethodBase
    ├ MethodInfo
    └ ConstructorInfo
```

```csharp
Type t = typeof(Order);
PropertyInfo[] props = t.GetProperties();                 // public instance + static properties
MethodInfo? m = t.GetMethod("AddLine", new[] { typeof(Product), typeof(int) });   // pick an overload
FieldInfo? f = t.GetField("_lines", BindingFlags.NonPublic | BindingFlags.Instance);
MemberInfo[] all = t.GetMembers();
```

## BindingFlags

Without flags you get **public** members (instance and static). With flags you must say what you want on **both** axes:

- visibility: `Public`, `NonPublic`;
- kind: `Instance`, `Static`;
- plus `DeclaredOnly` (skip inherited members), `IgnoreCase`, `FlattenHierarchy` (inherited statics).

`GetMethods(BindingFlags.NonPublic)` alone returns nothing, because no member is neither instance nor static.

## Reading and writing values

```csharp
var order = new Order();
PropertyInfo total = typeof(Order).GetProperty("Total")!;
object? value = total.GetValue(order);
typeof(Order).GetProperty("Note")!.SetValue(order, "gift");

foreach (var p in typeof(Order).GetProperties().Where(p => p.CanRead))
    Console.WriteLine($"{p.Name} = {p.GetValue(order)}");   // a poor man's ToString/dump
```

## Invoking methods

```csharp
MethodInfo add = typeof(Order).GetMethod("AddLine")!;
add.Invoke(order, new object[] { pen, 3 });          // exceptions come wrapped in TargetInvocationException

MethodInfo generic = typeof(Enumerable).GetMethod("Empty")!.MakeGenericMethod(typeof(int));
var empty = (IEnumerable<int>)generic.Invoke(null, null)!;   // static: target is null
```

Parameters: `MethodInfo.GetParameters()` returns `ParameterInfo` objects (name, type, default value, `IsOut`, attributes). `ref`/`out` arguments are written back into the `object[]` you passed.

## Performance

Reflection calls are **slow**: argument arrays, boxing, security and type checks on every call (`Invoke` is tens to hundreds of times slower than a direct call). Strategies:

1. **Cache** `Type`, `PropertyInfo` and `MethodInfo` lookups; never look them up inside a loop.
2. Turn a `MethodInfo` into a **typed delegate** once, then call it at full speed:

```csharp
var getter = (Func<Order, decimal>)Delegate.CreateDelegate(typeof(Func<Order, decimal>), total.GetGetMethod()!);
decimal sum = orders.Sum(getter);

var setter = typeof(Order).GetProperty("Note")!.GetSetMethod()!.CreateDelegate<Action<Order, string>>();   // .NET 5
```

3. Compile an **expression tree** when the types are only known at run time (see the LINQ module).
4. Prefer **source generators** for code that's known at build time.

## Attributes via reflection

```csharp
var rule = type.GetCustomAttribute<RuleAttribute>();                       // null if absent
bool hasIt = type.IsDefined(typeof(ObsoleteAttribute), inherit: false);    // cheap existence check
foreach (var p in type.GetProperties())
    if (p.GetCustomAttribute<RequiredAttribute>() is not null && p.GetValue(obj) is null) Fail(p.Name);
```

`GetCustomAttribute` creates a new attribute instance each call; cache the results.

## Interview takeaways

- `GetProperties/GetMethods/GetFields` with `BindingFlags` (visibility AND instance/static).
- `Invoke` wraps exceptions in `TargetInvocationException` and is slow.
- Cache reflection results and convert hot calls to delegates or compiled expressions.
