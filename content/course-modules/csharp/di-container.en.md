With fifty classes, wiring them by hand in `Program.cs` becomes a long list of `new`. A **DI container** does it for you: you **register** which implementation to use for each type, and the container **resolves** whole object graphs. In .NET the standard container is `Microsoft.Extensions.DependencyInjection`, which ASP.NET Core uses.

## Register, build, resolve

```csharp
var services = new ServiceCollection();

services.AddSingleton<IClock, SystemClock>();                // interface -> implementation
services.AddScoped<IOrderRepository, SqlOrderRepository>();
services.AddTransient<IEmailSender, SmtpEmailSender>();
services.AddTransient<OrderService>();                       // a concrete class, registered as itself

using ServiceProvider provider = services.BuildServiceProvider();

OrderService orders = provider.GetRequiredService<OrderService>();
```

To create `OrderService`, the container looks at its constructor, sees `IOrderRepository` and `IEmailSender`, creates them first (and their own dependencies, recursively), and passes them in. If a class has several constructors, it picks the one with the most parameters it can satisfy.

## Ways to register

```csharp
services.AddSingleton<IClock, SystemClock>();                         // by type
services.AddSingleton<IClock>(sp => new FixedClock(new DateTime(2025, 1, 1)));   // by factory
services.AddSingleton(new SmtpSettings { Host = "smtp.local" });     // a ready instance
```

The factory receives the provider (`sp`), so it can resolve other services: `sp => new Cache(sp.GetRequiredService<IClock>())`.

## `GetService` and `GetRequiredService`

- `GetService<T>()` returns `null` if `T` is not registered;
- `GetRequiredService<T>()` throws an `InvalidOperationException` with a clear message. Prefer it.

## Several implementations

```csharp
services.AddTransient<INotifier, EmailNotifier>();
services.AddTransient<INotifier, SmsNotifier>();
```

- A constructor that asks for `INotifier` gets the **last** registration (`SmsNotifier`).
- A constructor that asks for `IEnumerable<INotifier>` gets **all** of them, in order. This is how plugin-like "strategies" are built.
- `TryAddTransient<INotifier, EmailNotifier>()` registers only if nothing is registered yet, which libraries use to provide defaults.

Since .NET 8 there are also **keyed services**: `services.AddKeyedSingleton<ICache, RedisCache>("redis")`, requested with `[FromKeyedServices("redis")] ICache cache`.

## Errors you will meet

- "Unable to resolve service for type X while attempting to activate Y": a dependency of Y is not registered.
- "A circular dependency was detected": A needs B and B needs A. Redesign; do not try to work around it.

## In ASP.NET Core

`builder.Services` is the `ServiceCollection`. Controllers, minimal API handlers, middleware and hosted services receive registered services through their constructors or parameters. The framework builds the provider and creates a scope for each request.

## The rule

Register each abstraction once with its implementation and lifetime, let the container build the graph through constructors, and resolve directly from the provider only in the composition root.
