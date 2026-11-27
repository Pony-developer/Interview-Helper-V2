## The minimal option: ASP.NET Core minimal APIs

For any real HTTP server in .NET, use **ASP.NET Core** with its built-in **Kestrel** web server. A complete server fits in a few lines:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Shop API");
app.MapGet("/orders/{id:int}", (int id) => id > 0 ? Results.Ok(new { id, total = 99.5m }) : Results.NotFound());
app.MapPost("/orders", (Order order) => Results.Created($"/orders/{order.Id}", order));

app.Run("http://localhost:5000");
```

Kestrel is cross-platform, very fast, supports HTTP/1.1, HTTP/2, HTTP/3, TLS and WebSockets, and integrates with dependency injection, configuration, logging and middleware.

## The middleware pipeline

Each request flows through a chain of middleware, each of which can act before and after the next one:

```csharp
app.Use(async (context, next) =>
{
    var sw = Stopwatch.StartNew();
    await next(context);                                   // call the rest of the pipeline
    app.Logger.LogInformation("{Path} took {Ms} ms", context.Request.Path, sw.ElapsedMilliseconds);
});
app.UseExceptionHandler("/error");
app.UseAuthentication();
app.UseAuthorization();
```

Order matters: exception handling first, then authentication, then authorization, then endpoints.

## HttpListener: a low-level server

`System.Net.HttpListener` is a simple, older HTTP server API. It's handy for small tools, tests and local OAuth redirect listeners:

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

Limitations: on Windows it uses the kernel's HTTP.sys and may require URL reservations (`netsh http add urlacl`) for non-localhost prefixes; it has no middleware, routing, DI or modern protocol support. Microsoft recommends Kestrel for new work.

## What a server must take care of

- **Concurrency**: handle requests concurrently (async handlers), never block the accept loop.
- **Timeouts and limits**: maximum body size, header size, request timeouts (Kestrel has sensible defaults in `KestrelServerOptions.Limits`).
- **TLS**: terminate HTTPS in Kestrel or at a reverse proxy; behind a proxy, use forwarded-headers middleware so the app knows the real scheme and client IP.
- **Graceful shutdown**: stop accepting, let in-flight requests finish (`IHostApplicationLifetime`, `CancellationToken`s).

## Interview takeaways

- Real servers: ASP.NET Core + Kestrel, with minimal APIs or controllers.
- Middleware forms an ordered pipeline around each request.
- `HttpListener` exists for small or legacy scenarios.
