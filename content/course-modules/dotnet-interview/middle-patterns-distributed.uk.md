## Каталог GoF із прикладами в .NET (П63)

| Вид | Патерн | Де ви бачили його в .NET |
|---|---|---|
| Твірні | **Factory Method** | `IHttpClientFactory.CreateClient()`, `DbProviderFactory` |
| | **Abstract Factory** | `DbProviderFactory`, що створює з'єднання, команди й параметри однієї родини |
| | **Builder** | `WebApplication.CreateBuilder()`, `StringBuilder`, `UriBuilder`, `HostBuilder` |
| | **Singleton** | `AddSingleton`, `Lazy<T>`, `ArrayPool<T>.Shared` |
| | **Prototype** | `ICloneable`, вирази `with` для record |
| Структурні | **Adapter** | `StreamReader` поверх `Stream`; обгортка старого SOAP-клієнта за вашим інтерфейсом |
| | **Decorator** | `BufferedStream`, `GZipStream`, `DelegatingHandler`, `Decorate` у Scrutor |
| | **Facade** | `HttpClient` над сокетами/TLS/HTTP; `File.ReadAllText` |
| | **Proxy** | проксі лінивого завантаження EF Core, Castle DynamicProxy, клієнтські проксі gRPC/WCF |
| | **Composite** | дерева UI-контролів, дерева виразів, секції `IConfiguration` |
| Поведінкові | **Strategy** | `IComparer<T>`, `IEqualityComparer<T>`, політики повторів |
| | **Observer** | події C#, `IObservable<T>`, `IOptionsMonitor.OnChange` |
| | **Chain of Responsibility** | middleware ASP.NET Core, ланцюжки `DelegatingHandler` |
| | **Command** | запити MediatR, `ICommand` у WPF |
| | **Iterator** | `IEnumerable<T>` / `yield return` |
| | **Template Method** | `BackgroundService.ExecuteAsync`, `Stream` з абстрактним `Read` |
| | **Mediator** | MediatR, агрегатор подій |
| | **State** | процес замовлення з класами станів |

Порада: назвіть патерн, реальний випадок, де ви його застосували, і проблему, яку він розв'язав. Не перелічуйте всі 23.

## Singleton правильно (П64)

```csharp
// Потокобезпечний і лінивий
public sealed class Settings
{
    private static readonly Lazy<Settings> _instance = new(() => new Settings());
    public static Settings Instance => _instance.Value;
    private Settings() { }
}

// Зазвичай краще: нехай часом життя володіє контейнер
builder.Services.AddSingleton<ISettings, Settings>();
```

Чому його називають антипатерном: прихований глобальний стан, приховані залежності (з конструктора не видно, що клас використовує `Settings.Instance`), тести не можуть його підмінити чи скинути між запусками, а час життя й потокобезпечність стають вашим клопотом. Версія з DI зберігає «один екземпляр», але прибирає глобальну точку доступу.

## Strategy (П65)

```csharp
public interface IShippingCost { string Name { get; } decimal For(Parcel p); }
public class Courier : IShippingCost { public string Name => "courier"; public decimal For(Parcel p) => 80 + p.Kg * 5; }
public class Pickup  : IShippingCost { public string Name => "pickup";  public decimal For(Parcel p) => 0; }

public class Checkout(IEnumerable<IShippingCost> options)
{
    public decimal Shipping(Parcel p, string method) => options.Single(o => o.Name == method).For(p);
}
```

Алгоритм обирається під час виконання; нові не зачіпають `Checkout` (відкритість/закритість); кожен тестується окремо.

## Моноліт і розподілена система (П66)

Питання перед розділенням: чи треба різним частинам масштабуватися чи розгортатися незалежно? Чи заважають кілька команд одна одній? Чи добре зрозумілий домен (стабільні межі)? **Модульний моноліт** — одна одиниця розгортання, суворі межі модулів, жодних спільних таблиць між модулями — дає більшість переваг із набагато меншими операційними витратами, і його можна розділити пізніше.

Варто процитувати «хибні уявлення про розподілені обчислення»: мережа *не* надійна, затримка *не* нульова, пропускна здатність *не* безмежна, мережа *не* безпечна, топологія *таки* змінюється.

## Патерни розподілених систем (П67)

- **Комунікація**: API Gateway / Backend for Frontend, виявлення сервісів, запит-відповідь через чергу, publish/subscribe.
- **Стійкість**: тайм-аут, повтори з експоненційною затримкою та jitter, circuit breaker, bulkhead (ізоляція пулів ресурсів), запасний варіант (fallback), обмеження частоти, скидання навантаження.
- **Дані**: база на кожен сервіс, сага (оркестрація / хореографія), transactional outbox та inbox, CQRS, event sourcing, матеріалізовані подання, change data capture.
- **Координація**: вибір лідера, розподілені блокування з fencing-токенами, ключі ідемпотентності, шардинг / партиціювання, консистентне хешування.
- **Експлуатація**: health checks, sidecar / service mesh, розподілене трасування з correlation id, blue-green і canary-розгортання, strangler fig для міграції з моноліту.

## Шини повідомлень і дублікати (П68–69)

Повідомлення йде так: продюсер → брокер (збережено, можливо репліковано) → споживач, який підтверджує після обробки. Дублікати виникають, коли: продюсер повторює надсилання після втраченого підтвердження від брокера; споживач падає чи перевищує тайм-аут після виконаної роботи, але до підтвердження; під час повільної обробки спливає час блокування/невидимості, і повідомлення отримує інший споживач; партиції перерозподіляються (Kafka) раніше, ніж закомічено offset-и.

Тож проєктуйте під **at-least-once**: давайте кожному повідомленню унікальний id, записуйте оброблені id у тій самій транзакції, що й бізнес-зміну (таблиця **inbox** з унікальним ключем), робіть операції природно ідемпотентними (встановлювати стан, а не інкрементувати; upsert за бізнес-ключем), використовуйте оптимістичну конкурентність. Такий обробник ви реалізуєте в практиці цього модуля.
