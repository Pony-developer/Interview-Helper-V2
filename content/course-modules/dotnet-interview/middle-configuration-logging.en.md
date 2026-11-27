`ConfigureServices` (Q74) is where configuration, options and logging are wired. Interviewers often continue with "how do settings get into your service?".

## Configuration sources and precedence

`WebApplication.CreateBuilder` adds, from lowest to highest priority:

1. `appsettings.json`
2. `appsettings.{Environment}.json` (`ASPNETCORE_ENVIRONMENT` = Development / Staging / Production)
3. User secrets (Development only)
4. Environment variables
5. Command-line arguments

Later sources override earlier ones key by key. Everything becomes a flat set of case-insensitive keys like `Smtp:Host`; environment variables use `__` instead of `:` (`Smtp__Host`) because `:` isn't allowed everywhere. Add more providers as needed: Azure Key Vault, Azure App Configuration, `AddInMemoryCollection` for tests.

## The options pattern

```csharp
public sealed class SmtpOptions
{
    [Required] public string Host { get; init; } = "";
    [Range(1, 65535)] public int Port { get; init; } = 25;
    public bool UseSsl { get; init; }
}

builder.Services.AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection("Smtp"))
    .ValidateDataAnnotations()
    .ValidateOnStart();                       // fail at startup, not at the first email

public sealed class EmailSender(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions _smtp = options.Value;
}
```

- `IOptions<T>` — a singleton, read once.
- `IOptionsSnapshot<T>` — scoped, re-read per request (picks up reloaded files).
- `IOptionsMonitor<T>` — a singleton with `CurrentValue` and `OnChange` — for singletons that need live updates.
- Named options (`Configure<T>("primary", …)`) for several instances of the same settings.

Don't inject `IConfiguration` everywhere and read strings by key: typed options give validation, defaults, IntelliSense and testability.

## Logging

```csharp
public sealed class OrderService(ILogger<OrderService> log)
{
    public void Pay(Order order)
    {
        using var scope = log.BeginScope(new Dictionary<string, object> { ["OrderId"] = order.Id });
        log.LogInformation("Paying {Amount} {Currency}", order.Total, order.Currency);
        try { … }
        catch (PaymentException ex)
        {
            log.LogError(ex, "Payment failed for customer {CustomerId}", order.CustomerId);
            throw;
        }
    }
}
```

- **Levels**: Trace < Debug < Information < Warning < Error < Critical. Configure per category in `Logging:LogLevel` (e.g. `"Microsoft.EntityFrameworkCore": "Warning"`).
- **Structured logging**: the message template keeps placeholders (`{Amount}`) as named properties that sinks (Seq, Elastic, Application Insights, Loki) can index and query. Don't use string interpolation in log calls.
- **High-performance logging**: `[LoggerMessage]` source-generated methods avoid boxing and parsing the template on every call.
- **Scopes** add properties (correlation id, order id) to every log line inside them; ASP.NET Core adds the trace id automatically.
- **Providers**: console, debug, EventSource, OpenTelemetry, Serilog/NLog via adapters.
- Never log secrets, tokens, passwords or full card numbers; be careful with personal data (GDPR).

## Typical follow-ups

- **"Where do you keep the connection string?"** In configuration: `appsettings.json` for local defaults without secrets, user secrets locally, Key Vault / environment variables in production.
- **"How do you change a setting without redeploying?"** Azure App Configuration with refresh, or a reloadable file + `IOptionsMonitor`; feature flags via `Microsoft.FeatureManagement`.
- **"How do you test code that uses options?"** `Options.Create(new SmtpOptions { Host = "test" })`.

The practice builds the layering and binding logic by hand, so you know exactly what the framework does for you.
