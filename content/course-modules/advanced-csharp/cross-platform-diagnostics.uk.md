## Діагностичні інструменти dotnet

Вони встановлюються як глобальні інструменти .NET (`dotnet tool install -g dotnet-counters` тощо), працюють у Windows, Linux і macOS та під'єднуються до запущеного процесу за ідентифікатором, без перезапуску.

| Інструмент | Що робить | На яке питання відповідає |
| --- | --- | --- |
| `dotnet-counters` | живі метрики: CPU, розмір купи GC, кількість збирань gen 0/1/2, швидкість алокацій, довжина черги пулу потоків, винятки/с, частота запитів | «Чи росте пам'ять? Чи голодує пул потоків?» |
| `dotnet-trace` | записує трасу EventPipe (вибірка CPU, події GC, власні події) у файл `.nettrace` для PerfView, Visual Studio чи Speedscope | «Куди йде час CPU?» |
| `dotnet-dump` | знімає й аналізує повний дамп процесу (`dumpheap -stat`, `gcroot`, `clrstack`) | «Що в купі і чому воно живе? Де застряг кожен потік?» |
| `dotnet-gcdump` | легший знімок лише купи | «Які типи займають пам'ять?» |
| `dotnet-stack` | друкує керовані стеки всіх потоків (.NET 5+) | «Чи це взаємоблокування?» |

```
dotnet-counters ps
dotnet-counters monitor -p 4242 --counters System.Runtime,Microsoft.AspNetCore.Hosting
dotnet-trace collect -p 4242 --duration 00:00:30
dotnet-dump collect -p 4242
dotnet-dump analyze core_20240305.dmp
```

Усі вони спілкуються з рантаймом через **EventPipe** — кросплатформний транспорт подій усередині CLR.

## Власні події: EventSource

```csharp
[EventSource(Name = "Shop-Orders")]
public sealed class OrderEventSource : EventSource
{
    public static readonly OrderEventSource Log = new();

    [Event(1, Level = EventLevel.Informational)]
    public void OrderPlaced(int orderId, double total) => WriteEvent(1, orderId, total);

    private readonly IncrementingEventCounter _placed;
    private OrderEventSource() => _placed = new IncrementingEventCounter("orders-placed", this) { DisplayName = "Orders placed" };
    public void CountOrder() => _placed.Increment();
}
```

Події `EventSource` майже нічого не коштують, коли їх ніхто не слухає, а інструменти на кшталт `dotnet-trace` чи `EventListener` у процесі можуть їх увімкнути. `EventCounter` з'являються в `dotnet-counters`.

## API метрик (.NET 6)

`System.Diagnostics.Metrics` — сумісний з OpenTelemetry наступник лічильників:

```csharp
static readonly Meter Meter = new("Shop.Orders", "1.0");
static readonly Counter<long> Placed = Meter.CreateCounter<long>("orders.placed");
static readonly Histogram<double> Duration = Meter.CreateHistogram<double>("orders.duration", "ms");

Placed.Add(1, new KeyValuePair<string, object?>("country", "UA"));
Duration.Record(elapsedMs);
```

## Розподілене трасування: Activity

`System.Diagnostics.Activity` подає одну одиницю роботи (span) з trace id, parent id, тегами й часом. ASP.NET Core і `HttpClient` створюють activity автоматично й передають заголовок W3C `traceparent` між сервісами, тож один запит можна простежити через кожен сервіс, якого він торкається.

```csharp
static readonly ActivitySource Source = new("Shop.Orders");

using Activity? activity = Source.StartActivity("PlaceOrder");
activity?.SetTag("order.id", order.Id);
// ... робота; вкладені activity стають дочірніми span
```

.NET SDK OpenTelemetry слухає `ActivitySource` і `Meter` та експортує в Jaeger, Zipkin, Prometheus, Azure Monitor та інші. Логи, метрики й траси пов'язуються через trace id.

## Що сказати на співбесіді

- `dotnet-counters` (живі метрики), `dotnet-trace` (CPU/події), `dotnet-dump`/`gcdump` (пам'ять) працюють кросплатформно на живих процесах.
- `EventSource`/`EventCounter` і `Meter` дешево видають власну діагностику.
- `Activity` + `ActivitySource` = розподілене трасування; експортує його OpenTelemetry.
