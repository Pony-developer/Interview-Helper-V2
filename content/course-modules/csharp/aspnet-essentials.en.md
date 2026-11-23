A short tour of the services that almost every ASP.NET Core application uses.

## Logging

Ask for `ILogger<T>` in a constructor, where `T` is your class (it becomes the log category):

```csharp
public class OrderService(ILogger<OrderService> logger)
{
    public void Place(Order order)
    {
        logger.LogInformation("Order {OrderId} placed for {Total}", order.Id, order.Total);
    }
}
```

Use a **message template** with named placeholders, not string interpolation. The logger then stores `OrderId` and `Total` as separate fields, so a log system (Seq, Elasticsearch, Application Insights) can search "all logs of order 42". With `$"..."` you get only a flat string, and it is built even when the level is turned off.

Levels from the most to the least detailed: `Trace`, `Debug`, `Information`, `Warning`, `Error`, `Critical`. The minimum level per category is set in configuration (`Logging:LogLevel`).

## Error handling

In production, an unhandled exception must become a clean **500** response, without a stack trace for the client:

```csharp
builder.Services.AddProblemDetails();     // errors in the standard ProblemDetails JSON format
app.UseExceptionHandler();                // catches exceptions from the rest of the pipeline
```

Since .NET 8, you can implement `IExceptionHandler` to turn your own exceptions into proper status codes (for example, `NotFoundException` into 404) in one place, instead of `try`/`catch` in every endpoint.

## Authentication and authorization

- **Authentication**: who is the user? A JWT bearer token in an API, a cookie in a website. Failure: **401**.
- **Authorization**: may this user do this? `[Authorize]`, roles (`[Authorize(Roles = "Admin")]`), or policies (`[Authorize(Policy = "CanRefund")]`). Failure: **403**.

## Calling other services: `IHttpClientFactory`

```csharp
builder.Services.AddHttpClient<WeatherClient>(client =>
    client.BaseAddress = new Uri("https://api.weather.example/"));
```

The factory reuses connections correctly (no socket exhaustion) and lets you add retries and timeouts in one place (the `Microsoft.Extensions.Http.Resilience` package).

## Background work

A class derived from `BackgroundService` runs alongside the web server for the whole life of the application:

```csharp
public class OutboxSender(IServiceScopeFactory scopes, ILogger<OutboxSender> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // create a scope for scoped services, do the work, then wait
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}

builder.Services.AddHostedService<OutboxSender>();
```

## Health checks and tests

- `builder.Services.AddHealthChecks()` and `app.MapHealthChecks("/health")` give load balancers and Kubernetes an endpoint to ask "are you alive?".
- `WebApplicationFactory<Program>` (package `Microsoft.AspNetCore.Mvc.Testing`) starts the whole application in memory for **integration tests**, where you can replace real services with fakes.

## The rule

Log with templates, turn exceptions into ProblemDetails in one place, separate authentication from authorization, call other services through `IHttpClientFactory`, and run background work in a `BackgroundService` with its own scopes.
