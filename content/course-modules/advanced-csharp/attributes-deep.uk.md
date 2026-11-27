## Метадані, що прикріплюються до коду

Атрибут додає декларативну інформацію до збірки, типу, члена, параметра чи значення, що повертається. Компілятор зберігає його в **метаданих** збірки; фреймворки згодом читають його через рефлексію і змінюють свою поведінку.

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

Ви бачили їх скрізь: `[HttpGet]` в ASP.NET Core, `[Fact]` в xUnit, `[Key]` в EF Core, `[Flags]` на enum.

## Деталі синтаксису

- Суфікс `Attribute` необов'язковий: `[Obsolete]` — це `ObsoleteAttribute`.
- **Позиційні** аргументи відповідають параметрам конструктора; **іменовані** задають публічні поля чи властивості: `[Audit("orders", Sensitive = true)]`.
- Аргументи мають бути константами часу компіляції, `typeof(...)`, enum або масивами з них.
- Кілька атрибутів: `[A, B]` або `[A][B]`.
- **Цілі** явно вказують адресата: `[assembly: InternalsVisibleTo("Tests")]`, `[return: NotNull]`, `[field: NonSerialized]` на прихованому полі автовластивості.

## Власний атрибут

```csharp
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public sealed class AuditAttribute : Attribute
{
    public string Category { get; }
    public bool Sensitive { get; set; }
    public AuditAttribute(string category) => Category = category;
}
```

Читання через рефлексію:

```csharp
foreach (var method in typeof(OrderService).GetMethods())
{
    var audit = method.GetCustomAttribute<AuditAttribute>();
    if (audit != null) Console.WriteLine($"{method.Name}: {audit.Category}");
}
```

Атрибут сам по собі **інертний**: він нічого не робить, доки його не шукає якийсь код.

## Атрибути, які розуміє сам компілятор

| Атрибут | Ефект |
| --- | --- |
| `[Obsolete]` | попередження (чи помилка) в кожному місці використання |
| `[Conditional("DEBUG")]` | виклики видаляються, якщо символ не визначено |
| `[CallerMemberName]` тощо | аргумент за замовчуванням заповнює компілятор |
| атрибути nullable-аналізу (`[NotNullWhen]` ...) | змінюють аналіз потоку |
| `[MethodImpl(MethodImplOptions.AggressiveInlining)]` | підказка для JIT |

## Атрибути інформації про викликача (C# 5, C# 10)

```csharp
public static void Log(string message,
    [CallerMemberName] string member = "",
    [CallerFilePath] string file = "",
    [CallerLineNumber] int line = 0)
    => Console.WriteLine($"{Path.GetFileName(file)}:{line} {member}: {message}");

Log("started");   // компілятор пише Log("started", "Main", "C:\\src\\Program.cs", 12)
```

Усе визначається **під час компіляції** і передається як константні аргументи, тож немає ні проходу по стеку, ні витрат під час виконання.

Класичне застосування — `INotifyPropertyChanged`:

```csharp
protected void OnPropertyChanged([CallerMemberName] string? name = null)
    => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

public string Title { get => _title; set { _title = value; OnPropertyChanged(); } }   // name = "Title"
```

C# 10 додав `[CallerArgumentExpression("param")]`, що захоплює **текст коду** аргументу:

```csharp
static void Check(bool condition, [CallerArgumentExpression("condition")] string? expr = null)
{
    if (!condition) throw new ArgumentException($"Check failed: {expr}");
}

Check(order.Total > 0);   // "Check failed: order.Total > 0"
```

## Що сказати на співбесіді

- Атрибути — класи метаданих; вони мають значення лише тоді, коли їх щось читає (компілятор, фреймворк, ваш код рефлексії).
- Позиційні аргументи = конструктор; іменовані = властивості.
- Атрибути інформації про викликача заповнюються під час компіляції й нічого не коштують під час виконання.
