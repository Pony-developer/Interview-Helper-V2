## Два вбудовані діагностичні канали

`System.Diagnostics.Debug` і `System.Diagnostics.Trace` обидва пишуть діагностичні повідомлення до набору **слухачів**. Різниця — коли вони існують:

| Клас | Його методи позначені | Тож виклики лишаються в |
| --- | --- | --- |
| `Debug` | `[Conditional("DEBUG")]` | лише Debug-збірках |
| `Trace` | `[Conditional("TRACE")]` | Debug і Release (SDK за замовчуванням визначає TRACE в обох) |

```csharp
Debug.WriteLine($"cache miss for {key}");        // зникає в Release разом із побудовою рядка
Trace.TraceWarning("Retrying payment {0}", id);
Debug.Assert(total >= 0, "Total can't be negative");
Debug.Fail("Unreachable state");
```

Оскільки видаляється **виклик** (а не лише тіло), у Release не обчислюються й аргументи, тож дорогі діагностичні вирази нічого не коштують.

## Твердження (assert)

`Debug.Assert(condition, message)` перевіряє припущення, яке має виконуватися завжди. При невдачі в Debug-збірці воно повідомляє (зі стеком викликів) і під налагоджувачем зупиняє виконання. Використовуйте assert для **внутрішніх інваріантів**; для **перевірки вводу** — винятки, бо assert зникають у Release.

## Слухачі

Вивід іде до кожного слухача в `Trace.Listeners` (Debug використовує ту саму колекцію):

```csharp
Trace.Listeners.Add(new TextWriterTraceListener("app.log"));
Trace.Listeners.Add(new ConsoleTraceListener());
Trace.AutoFlush = true;
Trace.IndentSize = 2;
Trace.Indent(); Trace.WriteLine("nested"); Trace.Unindent();
```

`DefaultTraceListener` пише у вікно виводу налагоджувача (`OutputDebugString`). Власного можна написати, наслідуючи `TraceListener` і перевизначивши `Write`/`WriteLine`.

`TraceSource` додає іменовані джерела й фільтрацію за серйозністю (`SourceSwitch`).

## Сучасний погляд

`Debug`/`Trace` досі важливі для assert і швидкого виводу в налагоджувач, але продакшн-логування в сучасному .NET іде через **`Microsoft.Extensions.Logging`** (`ILogger<T>`): структуровані повідомлення, рівні, області, безліч провайдерів (консоль, файли через Serilog/NLog, Application Insights, OpenTelemetry).

```csharp
public class OrderService
{
    private readonly ILogger<OrderService> _log;
    public OrderService(ILogger<OrderService> log) => _log = log;

    public void Place(Order o)
    {
        _log.LogInformation("Placing order {OrderId} for {Customer}", o.Id, o.Customer);   // структуровано, без інтерполяції
    }
}
```

Використовуйте шаблони повідомлень із заповнювачами, а не інтерполяцію рядків: значення зберігаються як властивості для пошуку, а повідомлення взагалі не форматується, коли рівень вимкнено. Генератор коду `[LoggerMessage]` (.NET 6) робить це без алокацій.

## Нагадування про умовну компіляцію

- `#if DEBUG ... #endif` повністю видаляє код (і не перевіряє його типи).
- `[Conditional("DEBUG")]` видаляє виклики, але метод лишається скомпільованим і перевіреним.
- Можна визначати власні символи (`<DefineConstants>VERBOSE_SQL</DefineConstants>`) для діагностики на вимогу.

## Що сказати на співбесіді

- Виклики `Debug.*` зникають у Release; виклики `Trace.*` лишаються.
- Assert перевіряють інваріанти під час розробки; це не перевірка вводу.
- Продакшн-логування: `ILogger` зі структурованими шаблонами повідомлень.
