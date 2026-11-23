Кожна реєстрація має **час життя** (lifetime): як довго контейнер тримає один екземпляр і коли створює новий. Це найпопулярніше питання про DI на співбесідах.

| Час життя | Один екземпляр на | Типові сервіси |
|---|---|---|
| **Transient** | кожне розв'язання | легкі допоміжні класи без стану, валідатори |
| **Scoped** | область (scope); в ASP.NET Core — один HTTP-запит | `DbContext`, unit of work, поточний користувач |
| **Singleton** | увесь застосунок | кеші, конфігурація, клієнти, які дорого створювати |

```csharp
services.AddTransient<IPriceCalculator, PriceCalculator>();
services.AddScoped<AppDbContext>();
services.AddSingleton<IMemoryCache, MemoryCache>();
```

У межах одного запиту кожен клас, що просить `AppDbContext`, отримує **той самий** екземпляр, тож усі вони ділять одну транзакцію. Наступний запит отримує новий.

Синглтон використовують усі запити одночасно, тому він **мусить бути потокобезпечним**.

## Захоплена залежність (captive dependency)

Сервіс не має залежати від сервісу з **коротшим** часом життя:

```csharp
services.AddSingleton<ReportCache>();    // живе вічно
services.AddScoped<AppDbContext>();      // має жити один запит

public class ReportCache
{
    public ReportCache(AppDbContext db) { ... }   // перший DbContext захоплено назавжди
}
```

Синглтон створюється один раз і тримає `DbContext` першого запиту весь час роботи застосунку. Цей контекст не потокобезпечний, постійно нарощує свій трекер змін і тримає з'єднання: класична помилка в продакшені. У середовищі Development ASP.NET Core перевіряє області й кидає «Cannot consume scoped service from singleton».

Емпіричне правило: Singleton → лише Singleton; Scoped → Scoped або Singleton; Transient → будь-що.

## Scoped-сервіси поза запитом

Синглтон чи `BackgroundService`, якому потрібен `DbContext`, створює власну область:

```csharp
public class CleanupService(IServiceScopeFactory scopes) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = scopes.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await db.RemoveExpiredAsync(stoppingToken);
            }   // тут область і її DbContext звільняються
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
```

## Хто звільняє сервіси

Контейнер звільняє `IDisposable`-сервіси, **які сам створив**: scoped і transient — коли закінчується їхня область, синглтони — коли зупиняється застосунок. Отже:

- не викликайте `Dispose` для впровадженого сервісу: ви ним не володієте;
- disposable **transient**, розв'язаний з кореневого провайдера (а не з області), тримається до завершення застосунку — це витік пам'яті. Розв'язуйте такі сервіси всередині області.

## Правило

Обирайте найкоротший правильний час життя, робіть синглтони потокобезпечними, ніколи не давайте довгоживучому сервісу захопити короткоживучий і створюйте область, коли scoped-сервіси потрібні поза запитом.
