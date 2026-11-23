Коли класів п'ятдесят, з'єднувати їх вручну в `Program.cs` — це довгий список `new`. **DI-контейнер** робить це за вас: ви **реєструєте**, яку реалізацію використовувати для кожного типу, а контейнер **розв'язує** (resolve) цілі графи об'єктів. У .NET стандартний контейнер — `Microsoft.Extensions.DependencyInjection`, і його використовує ASP.NET Core.

## Реєстрація, побудова, розв'язання

```csharp
var services = new ServiceCollection();

services.AddSingleton<IClock, SystemClock>();                // інтерфейс -> реалізація
services.AddScoped<IOrderRepository, SqlOrderRepository>();
services.AddTransient<IEmailSender, SmtpEmailSender>();
services.AddTransient<OrderService>();                       // конкретний клас, зареєстрований сам як себе

using ServiceProvider provider = services.BuildServiceProvider();

OrderService orders = provider.GetRequiredService<OrderService>();
```

Щоб створити `OrderService`, контейнер дивиться на його конструктор, бачить `IOrderRepository` та `IEmailSender`, спершу створює їх (і, рекурсивно, їхні залежності) і передає їх. Якщо клас має кілька конструкторів, контейнер обирає той, що має найбільше параметрів, які він може задовольнити.

## Способи реєстрації

```csharp
services.AddSingleton<IClock, SystemClock>();                         // за типом
services.AddSingleton<IClock>(sp => new FixedClock(new DateTime(2025, 1, 1)));   // фабрикою
services.AddSingleton(new SmtpSettings { Host = "smtp.local" });     // готовим екземпляром
```

Фабрика отримує провайдер (`sp`), тож може розв'язувати інші сервіси: `sp => new Cache(sp.GetRequiredService<IClock>())`.

## `GetService` і `GetRequiredService`

- `GetService<T>()` повертає `null`, якщо `T` не зареєстровано;
- `GetRequiredService<T>()` кидає `InvalidOperationException` зі зрозумілим повідомленням. Віддавайте перевагу йому.

## Кілька реалізацій

```csharp
services.AddTransient<INotifier, EmailNotifier>();
services.AddTransient<INotifier, SmsNotifier>();
```

- Конструктор, що просить `INotifier`, отримує **останню** реєстрацію (`SmsNotifier`).
- Конструктор, що просить `IEnumerable<INotifier>`, отримує **всі**, по порядку. Так будують «стратегії», схожі на плагіни.
- `TryAddTransient<INotifier, EmailNotifier>()` реєструє, лише якщо ще нічого не зареєстровано; бібліотеки так задають значення за замовчуванням.

Починаючи з .NET 8 є також **ключовані сервіси** (keyed services): `services.AddKeyedSingleton<ICache, RedisCache>("redis")`, які запитують через `[FromKeyedServices("redis")] ICache cache`.

## Помилки, які ви зустрінете

- «Unable to resolve service for type X while attempting to activate Y»: залежність Y не зареєстровано.
- «A circular dependency was detected»: A потребує B, а B потребує A. Переробіть дизайн, а не намагайтеся це обійти.

## В ASP.NET Core

`builder.Services` — це `ServiceCollection`. Контролери, обробники minimal API, middleware і фонові сервіси отримують зареєстровані сервіси через конструктори чи параметри. Фреймворк будує провайдер і створює область (scope) для кожного запиту.

## Правило

Реєструйте кожну абстракцію один раз разом із реалізацією і часом життя, дайте контейнеру будувати граф через конструктори, а безпосередньо з провайдера розв'язуйте лише в корені композиції.
