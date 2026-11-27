## Program.cs today vs Startup.cs (Q74)

```csharp
var builder = WebApplication.CreateBuilder(args);

// what used to be Startup.ConfigureServices: register services in the DI container
builder.Services.AddControllers();
builder.Services.AddDbContext<ShopDb>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Shop")));
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddSingleton<IClock, SystemClock>();
builder.Services.AddTransient<IPriceFormatter, PriceFormatter>();
builder.Services.AddOutputCache();

var app = builder.Build();

// what used to be Startup.Configure: the middleware pipeline, in order
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

`ConfigureServices` was where the `IServiceCollection` was filled: framework services, options (`services.Configure<SmtpOptions>(config.GetSection("Smtp"))`), your own services with lifetimes, `HttpClient`s, health checks. After `Build()` the container is sealed.

## Lifetimes in practice (Q75)

```csharp
public class Probe { public Guid Id { get; } = Guid.NewGuid(); }
// AddTransient<Probe>: two injections in one request → two different Ids
// AddScoped<Probe>:    same Id inside one request, different across requests
// AddSingleton<Probe>: same Id forever
```

Rules of thumb:
- **Transient**: lightweight, stateless services.
- **Scoped**: anything tied to a request or a unit of work: `DbContext`, the current user, a request-level cache.
- **Singleton**: thread-safe shared state or expensive objects: configuration, caches, `HttpClient` handlers (via `IHttpClientFactory`), `JsonSerializerOptions`.
- A service may depend only on services with the **same or longer** lifetime. Scoped inside singleton = *captive dependency*: in Development, `ValidateScopes` makes the host throw at startup. From a singleton or `BackgroundService`, create a scope: `using var scope = scopeFactory.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<ShopDb>();`.
- Transients that implement `IDisposable` and are resolved from the root provider are kept until the app shuts down — a subtle leak.

## Writing a middleware

```csharp
app.Use(async (context, next) =>
{
    var watch = Stopwatch.StartNew();
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["X-Elapsed-Ms"] = watch.ElapsedMilliseconds.ToString();
        return Task.CompletedTask;
    });
    await next(context);            // call the rest of the pipeline; skip it to short-circuit
});
```

Each middleware wraps the next one like an onion: code before `next` runs on the way in, code after `next` runs on the way out (in reverse order). The order of `Use…` calls is the order of execution — so exception handling goes first, authentication before authorization, routing before endpoint-aware middleware such as CORS and authorization.

## The MVC request pipeline (Q77)

1. Kestrel accepts the connection and parses the request into `HttpContext`.
2. Middleware runs in order.
3. `UseRouting` matches an endpoint (controller action or minimal API); `MapControllers` executes it.
4. MVC creates the controller (from DI) and runs **filters**: authorization → resource (can short-circuit, e.g. caching) → **model binding** and validation (`ModelState`; `[ApiController]` returns 400 automatically) → action filters → **the action** → action filters (after) → result filters → **result execution** (`ObjectResult` is serialized by an output formatter after content negotiation). Exception filters catch exceptions from the action and filters.
5. The response travels back through the middleware.

## Caching responses (Q78)

```csharp
// 1. Client/proxy caching via HTTP headers
[ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "page" })]
public IActionResult Products(int page) => Ok(...);   // Cache-Control: public,max-age=60

// 2. Server-side output cache (.NET 7+), with tags for invalidation
builder.Services.AddOutputCache(o => o.AddPolicy("products", p => p.Expire(TimeSpan.FromMinutes(1)).Tag("products")));
app.MapGet("/products", GetProducts).CacheOutput("products");
await outputCacheStore.EvictByTagAsync("products", ct);     // after a product changes

// 3. Conditional requests: ETag + If-None-Match → 304 Not Modified (saves bandwidth)
// 4. Data caching: IMemoryCache (one server), IDistributedCache / Redis (many servers), HybridCache (.NET 9)
```

Key questions to raise: what varies the response (query, headers, user)? Never cache personalized responses in a shared cache. How do you invalidate (TTL, tags, events)? What about the thundering herd when a hot entry expires?
