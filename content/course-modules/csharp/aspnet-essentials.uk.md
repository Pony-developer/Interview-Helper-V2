Короткий огляд сервісів, якими користується майже кожен застосунок на ASP.NET Core.

## Логування

Попросіть `ILogger<T>` у конструкторі, де `T` — ваш клас (він стає категорією логу):

```csharp
public class OrderService(ILogger<OrderService> logger)
{
    public void Place(Order order)
    {
        logger.LogInformation("Order {OrderId} placed for {Total}", order.Id, order.Total);
    }
}
```

Використовуйте **шаблон повідомлення** з іменованими заповнювачами, а не інтерполяцію рядків. Тоді логер зберігає `OrderId` і `Total` як окремі поля, і система логів (Seq, Elasticsearch, Application Insights) може шукати «усі логи замовлення 42». З `$"..."` ви отримуєте лише плаский рядок, і він будується навіть тоді, коли рівень вимкнено.

Рівні від найдокладнішого до найменш докладного: `Trace`, `Debug`, `Information`, `Warning`, `Error`, `Critical`. Мінімальний рівень для кожної категорії задають у конфігурації (`Logging:LogLevel`).

## Обробка помилок

У продакшені необроблений виняток має ставати охайною відповіддю **500**, без стеку викликів для клієнта:

```csharp
builder.Services.AddProblemDetails();     // помилки у стандартному JSON-форматі ProblemDetails
app.UseExceptionHandler();                // перехоплює винятки з решти конвеєра
```

Починаючи з .NET 8 можна реалізувати `IExceptionHandler`, щоб в одному місці перетворювати власні винятки на правильні коди статусу (наприклад, `NotFoundException` на 404), замість `try`/`catch` у кожній кінцевій точці.

## Автентифікація та авторизація

- **Автентифікація**: хто цей користувач? JWT bearer-токен в API, cookie на вебсайті. Невдача: **401**.
- **Авторизація**: чи можна цьому користувачу це робити? `[Authorize]`, ролі (`[Authorize(Roles = "Admin")]`) або політики (`[Authorize(Policy = "CanRefund")]`). Невдача: **403**.

## Виклики інших сервісів: `IHttpClientFactory`

```csharp
builder.Services.AddHttpClient<WeatherClient>(client =>
    client.BaseAddress = new Uri("https://api.weather.example/"));
```

Фабрика правильно повторно використовує з'єднання (без вичерпання сокетів) і дає змогу в одному місці додати повтори й таймаути (пакет `Microsoft.Extensions.Http.Resilience`).

## Фонова робота

Клас, похідний від `BackgroundService`, працює поряд із вебсервером увесь час роботи застосунку:

```csharp
public class OutboxSender(IServiceScopeFactory scopes, ILogger<OutboxSender> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // створюємо область для scoped-сервісів, виконуємо роботу, потім чекаємо
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}

builder.Services.AddHostedService<OutboxSender>();
```

## Перевірки стану і тести

- `builder.Services.AddHealthChecks()` і `app.MapHealthChecks("/health")` дають балансувальникам навантаження і Kubernetes кінцеву точку, щоб спитати «ти живий?».
- `WebApplicationFactory<Program>` (пакет `Microsoft.AspNetCore.Mvc.Testing`) запускає весь застосунок у пам'яті для **інтеграційних тестів**, де справжні сервіси можна замінити фальшивими.

## Правило

Логуйте через шаблони, перетворюйте винятки на ProblemDetails в одному місці, розділяйте автентифікацію й авторизацію, викликайте інші сервіси через `IHttpClientFactory`, а фонову роботу виконуйте в `BackgroundService` з власними областями.
