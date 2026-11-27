## Program.cs сьогодні й Startup.cs (П74)

```csharp
var builder = WebApplication.CreateBuilder(args);

// колишній Startup.ConfigureServices: реєстрація сервісів у DI-контейнері
builder.Services.AddControllers();
builder.Services.AddDbContext<ShopDb>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Shop")));
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddSingleton<IClock, SystemClock>();
builder.Services.AddTransient<IPriceFormatter, PriceFormatter>();
builder.Services.AddOutputCache();

var app = builder.Build();

// колишній Startup.Configure: конвеєр middleware, по порядку
app.UseExceptionHandler("/error");
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseOutputCache();
app.MapControllers();

app.Run();
```

`ConfigureServices` — місце, де заповнювали `IServiceCollection`: сервіси фреймворку, опції (`services.Configure<SmtpOptions>(config.GetSection("Smtp"))`), власні сервіси з часом життя, `HttpClient`-и, health checks. Після `Build()` контейнер «запечатано».

## Час життя на практиці (П75)

```csharp
public class Probe { public Guid Id { get; } = Guid.NewGuid(); }
// AddTransient<Probe>: два впровадження в одному запиті → два різні Id
// AddScoped<Probe>:    той самий Id у межах запиту, різні між запитами
// AddSingleton<Probe>: той самий Id завжди
```

Практичні правила:
- **Transient**: легкі сервіси без стану.
- **Scoped**: усе, що прив'язане до запиту чи одиниці роботи: `DbContext`, поточний користувач, кеш на рівні запиту.
- **Singleton**: потокобезпечний спільний стан або дорогі об'єкти: конфігурація, кеші, обробники `HttpClient` (через `IHttpClientFactory`), `JsonSerializerOptions`.
- Сервіс може залежати лише від сервісів із **таким самим або довшим** часом життя. Scoped усередині singleton = *captive dependency*: у Development `ValidateScopes` змушує хост кинути виняток під час старту. Із singleton чи `BackgroundService` створюйте область: `using var scope = scopeFactory.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<ShopDb>();`.
- Transient-сервіси з `IDisposable`, отримані з кореневого провайдера, тримаються до завершення застосунку — підступний витік.

## Пишемо middleware

```csharp
app.Use(async (context, next) =>
{
    var watch = Stopwatch.StartNew();
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["X-Elapsed-Ms"] = watch.ElapsedMilliseconds.ToString();
        return Task.CompletedTask;
    });
    await next(context);            // викликати решту конвеєра; не викликати — завершити достроково
});
```

Кожен middleware обгортає наступний, як цибулина: код до `next` виконується на шляху всередину, код після `next` — на шляху назовні (у зворотному порядку). Порядок викликів `Use…` — це порядок виконання: обробка винятків першою, автентифікація перед авторизацією, маршрутизація перед middleware, що залежать від кінцевої точки (CORS, авторизація).

## Конвеєр запиту MVC (П77)

1. Kestrel приймає з'єднання й розбирає запит у `HttpContext`.
2. Middleware виконуються по порядку.
3. `UseRouting` знаходить кінцеву точку (дію контролера чи minimal API); `MapControllers` її виконує.
4. MVC створює контролер (із DI) і запускає **фільтри**: авторизації → ресурсу (може завершити достроково, наприклад кешування) → **прив'язка моделі** й валідація (`ModelState`; `[ApiController]` автоматично повертає 400) → фільтри дій → **дія** → фільтри дій (після) → фільтри результату → **виконання результату** (`ObjectResult` серіалізується форматером виводу після узгодження вмісту). Фільтри винятків перехоплюють винятки з дії та фільтрів.
5. Відповідь проходить назад через middleware.

## Кешування відповідей (П78)

```csharp
// 1. Кешування в клієнта/проксі через HTTP-заголовки
[ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "page" })]
public IActionResult Products(int page) => Ok(...);   // Cache-Control: public,max-age=60

// 2. Серверний output cache (.NET 7+) з тегами для інвалідації
builder.Services.AddOutputCache(o => o.AddPolicy("products", p => p.Expire(TimeSpan.FromMinutes(1)).Tag("products")));
app.MapGet("/products", GetProducts).CacheOutput("products");
await outputCacheStore.EvictByTagAsync("products", ct);     // після зміни товару

// 3. Умовні запити: ETag + If-None-Match → 304 Not Modified (економить трафік)
// 4. Кешування даних: IMemoryCache (один сервер), IDistributedCache / Redis (багато серверів), HybridCache (.NET 9)
```

Ключові питання, які варто підняти: від чого залежить відповідь (query, заголовки, користувач)? Ніколи не кешуйте персоналізовані відповіді в спільному кеші. Як інвалідувати (TTL, теги, події)? Що з «грімким стадом», коли спливає популярний запис?
