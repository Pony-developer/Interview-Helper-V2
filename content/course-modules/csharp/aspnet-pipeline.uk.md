ASP.NET Core — фреймворк .NET для вебзастосунків і API. Увесь застосунок стартує в `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);   // конфігурація, логування, DI-контейнер

builder.Services.AddControllers();                  // реєструємо сервіси
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();

var app = builder.Build();                          // відтепер сервіси зафіксовано

app.UseExceptionHandler("/error");                  // будуємо конвеєр middleware
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();                               // кінцеві точки (endpoints)

app.Run();                                          // запускаємо вебсервер Kestrel
```

Дві фази: **до `Build()`** ви реєструєте сервіси; **після** — описуєте, як обробляється запит.

## Конвеєр middleware

Запит проходить ланцюжком компонентів **middleware**. Кожен отримує `HttpContext` (запит і відповідь) і **наступний** компонент. Він може:

- щось зробити **перед** викликом наступного (запустити таймер, перевірити токен);
- викликати `next` і щось зробити **після** його повернення (записати код статусу);
- **взагалі не викликати** `next` і відповісти сам (коротке замикання): статичний файл, 401, закешована відповідь.

```csharp
app.Use(async (context, next) =>
{
    var watch = Stopwatch.StartNew();
    await next(context);                                       // решта конвеєра
    Console.WriteLine($"{context.Request.Path} took {watch.ElapsedMilliseconds} ms");
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ping")
    {
        await context.Response.WriteAsync("pong");   // коротке замикання: next не викликається
        return;
    }
    await next(context);
});
```

Компоненти вкладені, як матрьошки: доданий першим — зовнішній, тож він першим бачить запит і останнім — відповідь.

## Клас middleware

```csharp
public class RequestIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ILogger<RequestIdMiddleware> logger)
    {
        string id = Guid.NewGuid().ToString("N");
        context.Response.Headers["X-Request-Id"] = id;
        logger.LogInformation("Request {Id} started", id);
        await next(context);
    }
}

app.UseMiddleware<RequestIdMiddleware>();
```

Об'єкт middleware створюється **один раз** на весь застосунок. Тож **scoped**-сервіс (як-от `DbContext`) має бути параметром `InvokeAsync`, а не конструктора: інакше один екземпляр було б захоплено для всіх запитів.

## Порядок важливий

- Обробник винятків іде **першим**, щоб перехоплювати помилки всього, що після нього.
- Статичні файли — рано: їм не потрібна автентифікація, і вони не мають коштувати більше, ніж треба.
- `UseAuthentication` (хто ти?) іде **перед** `UseAuthorization` (чи тобі можна?).
- Щойно відповідь почала надсилатися, заголовки змінювати вже не можна.

## Правило

Реєструйте сервіси до `Build()`, складайте конвеєр після нього і впорядковуйте middleware свідомо: кожен обгортає все, що додано після нього.
