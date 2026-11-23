Every registration has a **lifetime**: how long the container keeps one instance and when it creates a new one. This is the most popular DI question in interviews.

| Lifetime | One instance per | Typical services |
|---|---|---|
| **Transient** | every resolution | light, stateless helpers, validators |
| **Scoped** | scope; in ASP.NET Core, one HTTP request | `DbContext`, unit of work, the current user |
| **Singleton** | the whole application | caches, configuration, clients that are expensive to create |

```csharp
services.AddTransient<IPriceCalculator, PriceCalculator>();
services.AddScoped<AppDbContext>();
services.AddSingleton<IMemoryCache, MemoryCache>();
```

Within one request, every class that asks for `AppDbContext` gets the **same** instance, so they share one transaction. The next request gets a new one.

A singleton is used by all requests at the same time, so it **must be thread-safe**.

## Captive dependency

A service must not depend on a service with a **shorter** lifetime:

```csharp
services.AddSingleton<ReportCache>();    // lives forever
services.AddScoped<AppDbContext>();      // should live for one request

public class ReportCache
{
    public ReportCache(AppDbContext db) { ... }   // the first DbContext is captured forever
}
```

The singleton is created once and keeps the `DbContext` of the first request for the whole life of the application. That context is not thread-safe, keeps growing its change tracker, and holds a connection: a classic production bug. In the Development environment ASP.NET Core checks scopes and throws "Cannot consume scoped service from singleton".

The rule of thumb: Singleton → only Singleton; Scoped → Scoped or Singleton; Transient → anything.

## Scoped services outside a request

A singleton or a `BackgroundService` that needs a `DbContext` creates its own scope:

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
            }   // the scope and its DbContext are disposed here
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
```

## Who disposes services

The container disposes the `IDisposable` services **it created**: scoped and transient ones when their scope ends, singletons when the application stops. So:

- do not call `Dispose` on an injected service: you do not own it;
- a disposable **transient** resolved from the root provider (not from a scope) is kept until the application ends, which is a memory leak. Resolve such services inside a scope.

## The rule

Choose the shortest lifetime that is correct, make singletons thread-safe, never let a longer-lived service capture a shorter-lived one, and create a scope when you need scoped services outside a request.
