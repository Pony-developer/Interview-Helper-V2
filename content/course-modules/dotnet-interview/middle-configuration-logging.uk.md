`ConfigureServices` (П74) — місце, де підключають конфігурацію, опції та логування. Інтерв'юери часто продовжують: «як налаштування потрапляють у ваш сервіс?».

## Джерела конфігурації та пріоритет

`WebApplication.CreateBuilder` додає, від найнижчого пріоритету до найвищого:

1. `appsettings.json`
2. `appsettings.{Environment}.json` (`ASPNETCORE_ENVIRONMENT` = Development / Staging / Production)
3. User secrets (лише в Development)
4. Змінні середовища
5. Аргументи командного рядка

Пізніші джерела перевизначають ранні ключ за ключем. Усе стає пласким набором ключів без урахування регістру на кшталт `Smtp:Host`; змінні середовища використовують `__` замість `:` (`Smtp__Host`), бо `:` дозволено не всюди. Додавайте провайдери за потреби: Azure Key Vault, Azure App Configuration, `AddInMemoryCollection` для тестів.

## Патерн опцій

```csharp
public sealed class SmtpOptions
{
    [Required] public string Host { get; init; } = "";
    [Range(1, 65535)] public int Port { get; init; } = 25;
    public bool UseSsl { get; init; }
}

builder.Services.AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection("Smtp"))
    .ValidateDataAnnotations()
    .ValidateOnStart();                       // впасти під час старту, а не на першому листі

public sealed class EmailSender(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions _smtp = options.Value;
}
```

- `IOptions<T>` — singleton, читається раз.
- `IOptionsSnapshot<T>` — scoped, перечитується на кожен запит (бачить перезавантажені файли).
- `IOptionsMonitor<T>` — singleton із `CurrentValue` і `OnChange` — для singleton-ів, яким потрібні живі оновлення.
- Іменовані опції (`Configure<T>("primary", …)`) — для кількох екземплярів тих самих налаштувань.

Не впроваджуйте `IConfiguration` всюди, читаючи рядки за ключем: типізовані опції дають валідацію, значення за замовчуванням, IntelliSense і тестованість.

## Логування

```csharp
public sealed class OrderService(ILogger<OrderService> log)
{
    public void Pay(Order order)
    {
        using var scope = log.BeginScope(new Dictionary<string, object> { ["OrderId"] = order.Id });
        log.LogInformation("Paying {Amount} {Currency}", order.Total, order.Currency);
        try { … }
        catch (PaymentException ex)
        {
            log.LogError(ex, "Payment failed for customer {CustomerId}", order.CustomerId);
            throw;
        }
    }
}
```

- **Рівні**: Trace < Debug < Information < Warning < Error < Critical. Налаштовуються для кожної категорії в `Logging:LogLevel` (наприклад, `"Microsoft.EntityFrameworkCore": "Warning"`).
- **Структуроване логування**: шаблон повідомлення зберігає заповнювачі (`{Amount}`) як іменовані властивості, які приймачі (Seq, Elastic, Application Insights, Loki) індексують і за якими шукають. Не використовуйте інтерполяцію рядків у викликах логування.
- **Високопродуктивне логування**: згенеровані методи `[LoggerMessage]` уникають упакування й розбору шаблону на кожному виклику.
- **Scope-и** додають властивості (correlation id, id замовлення) до кожного рядка логу всередині; ASP.NET Core автоматично додає trace id.
- **Провайдери**: консоль, debug, EventSource, OpenTelemetry, Serilog/NLog через адаптери.
- Ніколи не логуйте секрети, токени, паролі чи повні номери карток; обережно з персональними даними (GDPR).

## Типові уточнення

- **«Де ви тримаєте рядок підключення?»** У конфігурації: `appsettings.json` для локальних значень без секретів, user secrets локально, Key Vault / змінні середовища в продакшні.
- **«Як змінити налаштування без перерозгортання?»** Azure App Configuration з оновленням або файл із перезавантаженням + `IOptionsMonitor`; feature flags через `Microsoft.FeatureManagement`.
- **«Як тестувати код, що використовує опції?»** `Options.Create(new SmtpOptions { Host = "test" })`.

Практика будує логіку шарів і прив'язки вручну, щоб ви точно знали, що фреймворк робить за вас.
