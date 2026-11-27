## The Dynamic Language Runtime

The **DLR** is a layer on top of the CLR that powers `dynamic` in C# and languages like IronPython. It provides:

- **call sites** (`CallSite<T>`) emitted by the compiler at every dynamic operation;
- **binders** that decide what an operation means for a given runtime type;
- a **cache** of compiled rules per call site, so after the first call for a type, later calls run a fast type check plus the cached code.

## Three ways an object can be bound

When you call `d.Foo()` on a `dynamic d`, the binder checks:

1. Does the object implement **`IDynamicMetaObjectProvider`**? Then the object decides (custom binding): `ExpandoObject`, `DynamicObject` subclasses, IronPython objects, JSON DOMs.
2. Is it a **COM** object? Then COM binding via `IDispatch` (Office automation).
3. Otherwise **language binding**: C# rules applied to the runtime type (overload resolution, operators, conversions).

## ExpandoObject

```csharp
dynamic customer = new ExpandoObject();
customer.Name = "Ann";
customer.Tags = new List<string> { "vip" };
customer.Describe = (Func<string>)(() => $"{customer.Name} ({customer.Tags.Count} tags)");
Console.WriteLine(customer.Describe());

var asDict = (IDictionary<string, object?>)customer;    // members are just dictionary entries
foreach (var (key, value) in asDict) Console.WriteLine(key);
((INotifyPropertyChanged)customer).PropertyChanged += (_, e) => Console.WriteLine(e.PropertyName);
```

## DynamicObject: your own dynamic behavior

Override only the operations you care about; the others fail with `RuntimeBinderException`.

```csharp
public class ConfigBag : DynamicObject
{
    private readonly Dictionary<string, string> _values = new(StringComparer.OrdinalIgnoreCase);

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = _values.TryGetValue(binder.Name, out var v) ? v : null;
        return true;                                   // missing keys give null instead of an exception
    }

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        _values[binder.Name] = value?.ToString() ?? "";
        return true;
    }

    public override bool TryInvokeMember(InvokeMemberBinder binder, object?[]? args, out object? result)
    {
        if (binder.Name == "Has") { result = _values.ContainsKey((string)args![0]!); return true; }
        return base.TryInvokeMember(binder, args, out result);
    }

    public override IEnumerable<string> GetDynamicMemberNames() => _values.Keys;   // for debuggers
}

dynamic cfg = new ConfigBag();
cfg.Timeout = 30;
Console.WriteLine(cfg.TIMEOUT);         // "30": case-insensitive
Console.WriteLine(cfg.Has("timeout"));  // True
```

Other overridable hooks: `TryInvoke` (call the object like a function), `TryGetIndex`/`TrySetIndex` (`d[...]`), `TryBinaryOperation` (`d + x`), `TryConvert` (`(int)d`).

## Numeric unification and dynamic overloads

Language binding applies C# rules to the **actual** types:

```csharp
static dynamic Sum(IEnumerable<dynamic> values)
{
    dynamic total = 0;
    foreach (var v in values) total += v;     // int + int, then int + double → double, decimal + decimal...
    return total;
}
```

And overloads are chosen from runtime types, giving a simple **visitor/multiple dispatch**:

```csharp
string Describe(Circle c) => $"circle r={c.R}";
string Describe(Square s) => $"square a={s.A}";
foreach (Shape s in shapes) Console.WriteLine(Describe((dynamic)s));
```

## Interop with dynamic languages

Hosting IronPython lets users script your app: you pass .NET objects into Python and get back `dynamic` Python objects whose members you call naturally. Today this niche is more often filled by embedding JavaScript engines or using Roslyn scripting (`CSharpScript.EvaluateAsync`).

## Interview takeaways

- The DLR adds call sites, binders and per-site caching on top of the CLR.
- `ExpandoObject` = members added at run time; `DynamicObject` = you define what member access means.
- Language binding gives numeric unification and runtime overload selection; everything fails only at run time.
