ASP.NET Core is the .NET framework for web applications and APIs. A whole application starts in `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);   // configuration, logging, the DI container

builder.Services.AddControllers();                  // register services
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();

var app = builder.Build();                          // the services are fixed from here on

app.UseExceptionHandler("/error");                  // build the middleware pipeline
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();                               // the endpoints

app.Run();                                          // start the Kestrel web server
```

Two phases: **before `Build()`** you register services; **after** it you describe how a request is processed.

## The middleware pipeline

A request passes through a chain of **middleware** components. Each one receives the `HttpContext` (the request and the response) and the **next** component. It can:

- do something **before** calling the next one (start a timer, check a token);
- call `next` and do something **after** it returns (log the status code);
- **not call** `next` at all and answer by itself (short-circuit): a static file, a 401, a cached response.

```csharp
app.Use(async (context, next) =>
{
    var watch = Stopwatch.StartNew();
    await next(context);                                       // the rest of the pipeline
    Console.WriteLine($"{context.Request.Path} took {watch.ElapsedMilliseconds} ms");
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ping")
    {
        await context.Response.WriteAsync("pong");   // short-circuit: next is not called
        return;
    }
    await next(context);
});
```

The components are nested like Russian dolls: the first one added is the outermost, so it sees the request first and the response last.

## A middleware class

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

A middleware object is created **once** for the whole application. So a **scoped** service (such as a `DbContext`) must be a parameter of `InvokeAsync`, not of the constructor: otherwise one instance would be captured for all requests.

## The order matters

- The exception handler goes **first**, so it can catch errors from everything after it.
- Static files go early: they need no authentication and should not cost more than necessary.
- `UseAuthentication` (who are you?) goes **before** `UseAuthorization` (are you allowed?).
- Once the response has started, headers cannot be changed any more.

## The rule

Register services before `Build()`, compose the pipeline after it, and order middleware deliberately: each one wraps everything added after it.
