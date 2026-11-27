## Метапрограмування під час компіляції

**Генератор коду** (source generator) — плагін для компілятора C# (Roslyn). Під час компіляції він досліджує ваш код (синтаксичні дерева й семантичну модель) і **додає нові файли C#** до компіляції. Змінювати наявний код він не може, лише додавати.

Порівняно з рефлексією чи Reflection.Emit:

| | Рефлексія / emit під час виконання | Генератори коду |
| --- | --- | --- |
| Коли | при кожному старті / першому використанні | під час збирання |
| Ціна під час виконання | пошуки, генерація IL, JIT | жодної: це звичайний скомпільований код |
| Помилки | під час виконання | під час збирання, як діагностика |
| Trimming / Native AOT | проблемно | повністю сумісно |
| Налагодження | складне | так: можна заходити в згенеровані файли |

## Генератори, якими ви вже користуєтеся в .NET 6+

```csharp
// System.Text.Json: код серіалізації, згенерований для Order
[JsonSerializable(typeof(Order))]
internal partial class AppJson : JsonSerializerContext { }

// логування: ефективний метод без алокацій, згенерований із шаблону
public static partial class Log
{
    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Order {OrderId} placed for {Total}")]
    public static partial void OrderPlaced(ILogger logger, int orderId, decimal total);
}

// .NET 7: регулярний вираз, скомпільований у C# під час збирання
[GeneratedRegex(@"^\d{4}-\d{2}-\d{2}$")]
private static partial Regex IsoDate();
```

Патерн: ви оголошуєте `partial`-член і атрибут; генератор пише другу половину `partial`-оголошення.

## Як написати власний (схема)

Генератор — клас в окремому проєкті .NET Standard 2.0, що посилається на `Microsoft.CodeAnalysis.CSharp`:

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

Проєкт, що його використовує, посилається на генератор як на аналізатор:

```xml
<ProjectReference Include="..\Shop.Generators\Shop.Generators.csproj" OutputItemType="Analyzer" ReferenceOutputAssembly="false" />
```

**Інкрементальні** генератори (`IIncrementalGenerator`, SDK .NET 6) кешують проміжні результати, щоб IDE лишалася швидкою; старіший `ISourceGenerator` перезапускається на кожне натискання клавіші, і його не рекомендують.

## Що коли обирати

- Форма відома **під час збирання** (ваші DTO, виклики логування, реєстрації DI, мапери між відомими типами) → **генератор коду**.
- Форма відома лише **під час виконання** (завантаження плагінів, схеми від користувача, скрипти) → рефлексія, дерева виразів чи emit.
- Невеликі рідкісні динамічні потреби → звичайна рефлексія з кешованими пошуками.

## Що сказати на співбесіді

- Генератори коду додають код C# під час компіляції; змінювати наявний код вони не можуть.
- Вони прибирають витрати на рефлексію під час виконання й працюють з trimming і Native AOT.
- .NET використовує їх для JSON, логування, regex, P/Invoke (`LibraryImport`) та іншого.
