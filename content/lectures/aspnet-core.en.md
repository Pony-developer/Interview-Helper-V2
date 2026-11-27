---
skill: aspnet-core
title: "ASP.NET Core: hosting, middleware, DI and the request pipeline"
summary: "The generic host and Kestrel, the middleware pipeline and why order matters, dependency injection lifetimes and captive dependencies, configuration and options, controllers vs minimal APIs, filters, and caching."
readingMinutes: 8
---

ASP.NET Core interviews check whether you understand what happens to a request between the socket and your handler, and how services get created. Get those two pictures right and most follow-up questions answer themselves.

## Hosting and Kestrel

`WebApplication.CreateBuilder(args)` builds a **host**: configuration, logging and the DI container. `builder.Build()` freezes the services; `app.Run()` starts **Kestrel**, the cross-platform web server. In production Kestrel often sits behind a reverse proxy (Nginx, IIS, a cloud load balancer) that terminates TLS and forwards headers.

## The middleware pipeline

Every request travels through a chain of **middleware** components, each of which can act before and after the next one:

```csharp
app.UseExceptionHandler("/error");
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

Order is behaviour. Authentication must run before authorization, or every user looks anonymous. The exception handler goes first so it wraps everything after it. A middleware that doesn't call `next()` **short-circuits** the pipeline (static files, health checks, a rejected request).

Custom middleware is a class with `InvokeAsync(HttpContext context, RequestDelegate next)` or an inline `app.Use(async (ctx, next) => { ...; await next(ctx); })`.

## Dependency injection lifetimes

| Lifetime | One instance per | Typical use |
|---|---|---|
| `AddSingleton` | application | caches, configuration, `HttpClient` factories |
| `AddScoped` | request (scope) | `DbContext`, unit of work, per-request state |
| `AddTransient` | resolution | lightweight stateless helpers |

The classic bug is a **captive dependency**: a singleton that takes a scoped service in its constructor keeps one `DbContext` for the whole life of the app, shared across threads. In development the container validates scopes and throws. If a singleton (a background service, for example) needs scoped services, it creates a scope with `IServiceScopeFactory`.

Prefer constructor injection. The service locator (`provider.GetService` everywhere) hides dependencies and makes tests harder.

## Configuration and options

Configuration merges providers in order, and later ones win: `appsettings.json`, `appsettings.{Environment}.json`, user secrets in development, environment variables, command-line arguments. Bind sections to typed classes:

```csharp
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
// inject IOptions<T> (fixed), IOptionsSnapshot<T> (per request) or IOptionsMonitor<T> (live changes)
```

Never commit secrets to `appsettings.json`; use user secrets locally and a vault or environment variables in production.

## Controllers, minimal APIs and filters

**Controllers** (`[ApiController]`) give attribute routing, automatic model validation (a `400` with problem details) and filters. **Minimal APIs** (`app.MapGet("/orders/{id}", ...)`) are lighter and faster to write, with endpoint filters and route groups for shared concerns. Both use model binding from route, query, body and headers.

**Filters** run inside the MVC part of the pipeline, around actions: authorization, resource, action, exception and result filters. Use middleware for concerns that apply to every request, and filters for those that need action metadata.

## Caching and resilience

- **In-memory cache** (`IMemoryCache`) is per instance; with several instances use a **distributed cache** (Redis) or the newer `HybridCache`.
- **Output caching** stores whole responses; **response caching** only sets HTTP cache headers.
- Use `IHttpClientFactory` for outgoing calls: it pools handlers (no socket exhaustion from `new HttpClient()` per call) and plugs in retries, timeouts and circuit breakers.

## Interview checklist

- Draw the middleware pipeline and explain why auth order matters.
- Name the three lifetimes and describe a captive dependency.
- Explain how configuration sources override each other and where secrets go.
- Compare controllers with minimal APIs, and filters with middleware.
- Explain why `new HttpClient()` per request is a bug.
