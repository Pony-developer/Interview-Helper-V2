## Мінімальний варіант: minimal API в ASP.NET Core

Для будь-якого справжнього HTTP-сервера в .NET використовуйте **ASP.NET Core** з вбудованим веб-сервером **Kestrel**. Повний сервер уміщується в кілька рядків:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Shop API");
app.MapGet("/orders/{id:int}", (int id) => id > 0 ? Results.Ok(new { id, total = 99.5m }) : Results.NotFound());
app.MapPost("/orders", (Order order) => Results.Created($"/orders/{order.Id}", order));

app.Run("http://localhost:5000");
```

Kestrel кросплатформний, дуже швидкий, підтримує HTTP/1.1, HTTP/2, HTTP/3, TLS і WebSockets та інтегрується з dependency injection, конфігурацією, логуванням і middleware.

## Конвеєр middleware

Кожен запит проходить ланцюжком middleware, кожне з яких може діяти до й після наступного:

```csharp
app.Use(async (context, next) =>
{
    var sw = Stopwatch.StartNew();
    await next(context);                                   // викликати решту конвеєра
    app.Logger.LogInformation("{Path} took {Ms} ms", context.Request.Path, sw.ElapsedMilliseconds);
});
app.UseExceptionHandler("/error");
app.UseAuthentication();
app.UseAuthorization();
```

Порядок важливий: спершу обробка винятків, потім автентифікація, потім авторизація, потім кінцеві точки.

## HttpListener: низькорівневий сервер

`System.Net.HttpListener` — простий старіший API HTTP-сервера. Зручний для невеликих інструментів, тестів і локальних слухачів OAuth-перенаправлень:

```csharp
using var listener = new HttpListener();
listener.Prefixes.Add("http://localhost:51234/");
listener.Start();

while (true)
{
    HttpListenerContext ctx = await listener.GetContextAsync();
    _ = Task.Run(async () =>
    {
        string body = $"You asked for {ctx.Request.Url!.AbsolutePath}";
        byte[] bytes = Encoding.UTF8.GetBytes(body);
        ctx.Response.ContentType = "text/plain; charset=utf-8";
        ctx.Response.ContentLength64 = bytes.Length;
        await ctx.Response.OutputStream.WriteAsync(bytes);
        ctx.Response.Close();
    });
}
```

Обмеження: у Windows він використовує HTTP.sys ядра й може потребувати резервування URL (`netsh http add urlacl`) для префіксів, відмінних від localhost; у нього немає middleware, маршрутизації, DI чи підтримки сучасних протоколів. Для нової роботи Microsoft рекомендує Kestrel.

## Про що має подбати сервер

- **Конкурентність**: обробляти запити одночасно (асинхронні обробники), ніколи не блокувати цикл прийому.
- **Тайм-аути й ліміти**: максимальний розмір тіла, заголовків, тайм-аути запитів (Kestrel має розумні значення за замовчуванням у `KestrelServerOptions.Limits`).
- **TLS**: завершувати HTTPS у Kestrel чи на зворотному проксі; за проксі використовуйте middleware forwarded headers, щоб застосунок знав справжню схему й IP клієнта.
- **Плавне завершення**: перестати приймати нові, дати завершитися поточним запитам (`IHostApplicationLifetime`, `CancellationToken`).

## Що сказати на співбесіді

- Справжні сервери: ASP.NET Core + Kestrel з minimal API чи контролерами.
- Middleware утворюють впорядкований конвеєр навколо кожного запиту.
- `HttpListener` існує для невеликих чи застарілих сценаріїв.
