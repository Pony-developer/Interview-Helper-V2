## Reflection in five calls (Q84)

```csharp
Type t = typeof(Order);                                        // or order.GetType() for the runtime type
PropertyInfo[] props = t.GetProperties(BindingFlags.Public | BindingFlags.Instance);
object? value = props[0].GetValue(order);                      // read a property
MethodInfo m = t.GetMethod("Pay")!;
m.Invoke(order, new object[] { 100m });                        // call a method
object instance = Activator.CreateInstance(typeof(Order))!;    // create an object
```

Also: `Assembly.GetTypes()` to scan for plug-ins, `t.GetInterfaces()`, `t.IsAssignableTo(typeof(IHandler))`, `t.GetGenericArguments()`, `typeof(Repository<>).MakeGenericType(typeof(Order))`.

Where it's used: serializers (JSON, XML), ORMs (mapping columns to properties), DI containers (finding constructors), test frameworks (finding `[Fact]` methods), ASP.NET Core model binding and controller discovery, mappers (AutoMapper, Mapster), validation (FluentValidation, DataAnnotations).

## Attributes

```csharp
[AttributeUsage(AttributeTargets.Property)]
public sealed class SensitiveAttribute : Attribute { }

public class User
{
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [Sensitive] public string PasswordHash { get; set; } = "";
}

bool hide = prop.GetCustomAttribute<SensitiveAttribute>() is not null;
```

An attribute is metadata stored in the assembly. It does nothing by itself; some code (the compiler, the runtime, a framework or your own reflection) must read it. Built-in examples: `[Obsolete]` (compiler warning), `[Serializable]`, `[DllImport]`/`[LibraryImport]` (interop), `[Flags]`, `[CallerMemberName]` (compiler fills the argument), `[Authorize]`, `[HttpGet]`, `[JsonPropertyName]`.

## Performance and the alternatives

Reflection is slow compared to direct calls: lookups by name, security checks, boxing of arguments and return values, no inlining. Options from slowest to fastest:

1. `MethodInfo.Invoke` / `PropertyInfo.GetValue` on every call.
2. Cache the `PropertyInfo` / `MethodInfo` objects (lookups once).
3. Build a typed delegate once: `(Func<Order, decimal>)Delegate.CreateDelegate(...)` or a compiled expression tree.
4. **Source generators**: generate the code at compile time (System.Text.Json `JsonSerializerContext`, `[LoggerMessage]`, `[GeneratedRegex]`, Mapperly) — no reflection at run time, and compatible with trimming and **Native AOT**, where reflection over unknown types may simply not work.

## Dangers

- Reflection ignores `private`: it's not a security boundary, and it breaks encapsulation — code that reads private fields breaks when the class changes.
- Renaming a property breaks string-based lookups silently: use `nameof(Order.Total)`.
- The trimmer removes members it thinks are unused; reflection-heavy code needs annotations (`[DynamicallyAccessedMembers]`).

## Typical interview tasks

- "Copy matching properties from an entity to a DTO" (the practice).
- "Find all classes implementing `IHandler<T>` and register them in DI."
- "Print all properties of an object, masking those marked with an attribute" (the practice).
- "Call a private method in a unit test" — possible, but a sign the design needs a seam instead.
