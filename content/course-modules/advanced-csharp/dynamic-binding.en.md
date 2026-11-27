## Static vs dynamic binding

Normally the compiler **binds** every member access at compile time: it decides which method `x.Foo()` refers to and refuses to compile if there's none. With `dynamic`, binding is postponed to run time.

```csharp
dynamic d = "hello";
Console.WriteLine(d.ToUpper());   // binds at run time to string.ToUpper → HELLO
Console.WriteLine(d.Length);      // 5
d.Fly();                          // compiles; throws RuntimeBinderException at run time
```

For the compiler, `dynamic` is "any type, any member". The variable is really an `object` plus a flag in the metadata that says "use dynamic binding here".

## How it works

The **Dynamic Language Runtime** (DLR) sits on top of the CLR. At each dynamic call site the compiler emits a **call-site object**. On the first call, the binder inspects the runtime type, figures out what the member means and caches a compiled rule for it. Next time the same type comes through, the cached rule runs, so repeat calls are fairly fast. The first call per type is expensive.

## Custom binding

An object can take control of its own dynamic binding by implementing `IDynamicMetaObjectProvider`, usually by deriving from `DynamicObject` or using `ExpandoObject`:

```csharp
dynamic bag = new ExpandoObject();
bag.Name = "Ann";                          // members created on the fly
bag.Greet = (Func<string>)(() => "Hi " + bag.Name);
Console.WriteLine(bag.Greet());            // Hi Ann

public class JsonBag : DynamicObject
{
    private readonly Dictionary<string, object?> _values = new();
    public override bool TryGetMember(GetMemberBinder binder, out object? result)
        => _values.TryGetValue(binder.Name, out result);
    public override bool TrySetMember(SetMemberBinder binder, object? value)
    { _values[binder.Name] = value; return true; }
}
```

## Language binding: numeric unification and overloads

When the object is an ordinary .NET object, the runtime binder applies **C# rules** with the actual runtime types:

```csharp
static dynamic Mean(dynamic x, dynamic y) => (x + y) / 2;
Console.WriteLine(Mean(3, 5));        // 4  (int)
Console.WriteLine(Mean(3.0, 4.5));    // 3.75 (double)
```

One generic-looking method works for every numeric type. (Today, generic math in .NET 7 does that statically.)

Overload resolution also happens at run time, based on the **runtime** types of dynamic arguments. That gives you a cheap form of **multiple dispatch**:

```csharp
void Handle(Circle c) => ...;
void Handle(Square s) => ...;
foreach (Shape s in shapes) Handle((dynamic)s);   // picks the overload by the actual type
```

## Limitations and costs

- No compile-time checking, no IntelliSense, no refactoring support: typos become runtime errors.
- Extension methods aren't found (they depend on `using` directives, which don't exist at run time).
- Calls through `dynamic` are slower, and the first call per type is much slower.
- Results of dynamic expressions are themselves `dynamic`, so the "untyped" zone spreads; convert back to a static type early.

## When it's worth it

- COM interop (Office automation) where types are loosely defined.
- Interoperating with dynamic languages (IronPython) or dynamic data (JSON without a schema, though `JsonNode`/`JsonElement` are often better).
- Replacing a large reflection-based block with readable code, when performance isn't critical.

## Interview takeaways

- `dynamic` defers member binding to run time; errors become `RuntimeBinderException`.
- The DLR caches binding rules per call site and type.
- `ExpandoObject` and `DynamicObject` let objects define their own members at run time.
- Use sparingly; prefer static types, generics or interfaces.
