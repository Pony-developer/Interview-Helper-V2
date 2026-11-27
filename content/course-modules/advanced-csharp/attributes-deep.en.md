## Metadata you attach to code

An attribute adds declarative information to an assembly, type, member, parameter or return value. The compiler stores it in the assembly's **metadata**; frameworks read it later through reflection and change their behavior.

```csharp
[Serializable]
public class Order
{
    [Obsolete("Use PlaceAsync instead", error: false)]
    public void Place() { }

    [JsonPropertyName("order_id")]
    public int Id { get; set; }

    [Required, StringLength(50)]
    public string Customer { get; set; } = "";
}
```

You've seen them everywhere: `[HttpGet]` in ASP.NET Core, `[Fact]` in xUnit, `[Key]` in EF Core, `[Flags]` on enums.

## Syntax details

- The `Attribute` suffix is optional: `[Obsolete]` is `ObsoleteAttribute`.
- **Positional** arguments map to constructor parameters; **named** arguments set public fields or properties: `[Audit("orders", Sensitive = true)]`.
- Arguments must be compile-time constants, `typeof(...)`, enums or arrays of those.
- Several attributes: `[A, B]` or `[A][B]`.
- **Targets** make the destination explicit: `[assembly: InternalsVisibleTo("Tests")]`, `[return: NotNull]`, `[field: NonSerialized]` on an auto-property's backing field.

## Writing your own

```csharp
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public sealed class AuditAttribute : Attribute
{
    public string Category { get; }
    public bool Sensitive { get; set; }
    public AuditAttribute(string category) => Category = category;
}
```

Reading it with reflection:

```csharp
foreach (var method in typeof(OrderService).GetMethods())
{
    var audit = method.GetCustomAttribute<AuditAttribute>();
    if (audit != null) Console.WriteLine($"{method.Name}: {audit.Category}");
}
```

An attribute is **inert** on its own: it does nothing until some code looks for it.

## Attributes the compiler itself understands

| Attribute | Effect |
| --- | --- |
| `[Obsolete]` | warning (or error) at every use |
| `[Conditional("DEBUG")]` | calls are removed unless the symbol is defined |
| `[CallerMemberName]` etc. | default argument filled in by the compiler |
| nullable analysis attributes (`[NotNullWhen]` ...) | change flow analysis |
| `[MethodImpl(MethodImplOptions.AggressiveInlining)]` | hint to the JIT |

## Caller info attributes (C# 5, C# 10)

```csharp
public static void Log(string message,
    [CallerMemberName] string member = "",
    [CallerFilePath] string file = "",
    [CallerLineNumber] int line = 0)
    => Console.WriteLine($"{Path.GetFileName(file)}:{line} {member}: {message}");

Log("started");   // the compiler writes Log("started", "Main", "C:\\src\\Program.cs", 12)
```

Everything is resolved at **compile time** and passed as constant arguments, so there's no stack walking and no runtime cost.

The classic use is `INotifyPropertyChanged`:

```csharp
protected void OnPropertyChanged([CallerMemberName] string? name = null)
    => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

public string Title { get => _title; set { _title = value; OnPropertyChanged(); } }   // name = "Title"
```

C# 10 added `[CallerArgumentExpression("param")]`, which captures the **source text** of an argument:

```csharp
static void Check(bool condition, [CallerArgumentExpression("condition")] string? expr = null)
{
    if (!condition) throw new ArgumentException($"Check failed: {expr}");
}

Check(order.Total > 0);   // "Check failed: order.Total > 0"
```

## Interview takeaways

- Attributes are metadata classes; they matter only when something reads them (compiler, framework, your reflection code).
- Positional arguments = constructor; named = properties.
- Caller info attributes are filled in at compile time and cost nothing at run time.
