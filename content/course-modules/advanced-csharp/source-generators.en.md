## Metaprogramming at compile time

A **source generator** is a plug-in for the C# compiler (Roslyn). During compilation it inspects your code (syntax trees and semantic model) and **adds new C# source files** to the compilation. It can't change existing code, only add to it.

Compared with reflection or Reflection.Emit:

| | Runtime reflection / emit | Source generators |
| --- | --- | --- |
| When | every app start / first use | at build time |
| Cost at run time | lookups, IL generation, JIT | none: it's ordinary compiled code |
| Errors | at run time | at build time, as diagnostics |
| Trimming / Native AOT | problematic | fully compatible |
| Debuggable | hard | yes: you can step into generated files |

## Generators you already use in .NET 6+

```csharp
// System.Text.Json: serialization code generated for Order
[JsonSerializable(typeof(Order))]
internal partial class AppJson : JsonSerializerContext { }

// logging: an efficient, allocation-free method generated from the template
public static partial class Log
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Order {OrderId} placed for {Total}")]
    public static partial void OrderPlaced(ILogger logger, int orderId, decimal total);
}

// .NET 7: regex compiled to C# at build time
[GeneratedRegex(@"^\d{4}-\d{2}-\d{2}$")]
private static partial Regex IsoDate();
```

The pattern: you declare a `partial` member and an attribute; the generator writes the other half of the `partial` declaration.

## Writing one (outline)

A generator is a class in a separate .NET Standard 2.0 project referencing `Microsoft.CodeAnalysis.CSharp`:

```csharp
[Generator]
public class ToStringGenerator : IIncrementalGenerator
{
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        var classes = context.SyntaxProvider.ForAttributeWithMetadataName(
            "Shop.AutoToStringAttribute",
            predicate: (node, _) => node is ClassDeclarationSyntax,
            transform: (ctx, _) => (INamedTypeSymbol)ctx.TargetSymbol);

        context.RegisterSourceOutput(classes, (spc, type) =>
        {
            var props = type.GetMembers().OfType<IPropertySymbol>().Select(p => $"{p.Name} = {{{p.Name}}}");
            spc.AddSource($"{type.Name}.ToString.g.cs", $$"""
                namespace {{type.ContainingNamespace}};
                partial class {{type.Name}}
                {
                    public override string ToString() => $"{{type.Name}} { {{string.Join(", ", props)}} }";
                }
                """);
        });
    }
}
```

The project that uses it references the generator as an analyzer:

```xml
<ProjectReference Include="..\Shop.Generators\Shop.Generators.csproj" OutputItemType="Analyzer" ReferenceOutputAssembly="false" />
```

**Incremental** generators (`IIncrementalGenerator`, .NET 6 SDK) cache intermediate results so the IDE stays fast; the older `ISourceGenerator` reruns on every keystroke and is discouraged.

## When to choose what

- Shape known at **build time** (your own DTOs, logging calls, DI registrations, mappers between known types) → **source generator**.
- Shape known only at **run time** (loading plug-ins, user-defined schemas, scripting) → reflection, expression trees or emit.
- Small, rare dynamic needs → plain reflection with cached lookups.

## Interview takeaways

- Source generators add C# code during compilation; they can't modify existing code.
- They remove reflection costs at run time and work with trimming and Native AOT.
- .NET uses them for JSON, logging, regex, P/Invoke (`LibraryImport`) and more.
