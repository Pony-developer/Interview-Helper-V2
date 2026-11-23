## Where settings come from

`WebApplication.CreateBuilder` reads configuration from several **sources**, in this order. A later source **overrides** an earlier one:

1. `appsettings.json`;
2. `appsettings.{Environment}.json`, for example `appsettings.Development.json`;
3. user secrets (only in the Development environment);
4. environment variables;
5. command-line arguments.

So the same build can run everywhere: the file holds the defaults, and each server overrides what differs through environment variables.

Keys are hierarchical, with `:` between the levels:

```json
{
  "Smtp": { "Host": "localhost", "Port": 25 },
  "ConnectionStrings": { "Default": "Host=localhost;Database=shop" }
}
```

```csharp
string host = builder.Configuration["Smtp:Host"];
int port = builder.Configuration.GetValue<int>("Smtp:Port");
string db = builder.Configuration.GetConnectionString("Default");
```

In environment variables `:` is written as a double underscore: `Smtp__Host=mail.example.com`.

## The environment

The variable `ASPNETCORE_ENVIRONMENT` (`Development`, `Staging`, `Production`) selects the environment file and lets code behave differently:

```csharp
if (app.Environment.IsDevelopment())
    app.UseDeveloperExceptionPage();
```

## The options pattern

Reading strings by key all over the code is fragile. Bind a section to a class instead:

```csharp
public class SmtpOptions
{
    [Required] public string Host { get; set; } = "";
    [Range(1, 65535)] public int Port { get; set; }
}

builder.Services.AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection("Smtp"))
    .ValidateDataAnnotations()
    .ValidateOnStart();          // a wrong setting stops the app at startup, not at the first e-mail

public class EmailSender(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions smtp = options.Value;
}
```

Three interfaces give access to the options:

| Interface | Lifetime | Sees changes in the files |
|---|---|---|
| `IOptions<T>` | singleton | no: read once |
| `IOptionsSnapshot<T>` | scoped | yes, from the next request |
| `IOptionsMonitor<T>` | singleton | yes, at once, with an `OnChange` callback |

## Secrets

Passwords, API keys and connection strings with passwords must **never** be committed in `appsettings.json`:

- during development, use **user secrets** (`dotnet user-secrets set "Smtp:Password" "..."`), stored outside the project folder;
- in production, use environment variables or a secret store such as Azure Key Vault or AWS Secrets Manager.

## The rule

Keep defaults in `appsettings.json`, override per environment, bind sections to validated options classes, and keep secrets out of the repository.
