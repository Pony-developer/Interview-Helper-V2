Plug-ins need settings: a threshold, an API URL, a key, the id of a queue. Hard-coding them means a new build for every change and different values in every environment. Dataverse offers several places to keep configuration.

## Step configuration: unsecure and secure

Every step has two configuration strings, passed to the plug-in's **constructor**:

```csharp
public class CreditLimitAuditPlugin : IPlugin
{
    private readonly decimal threshold;
    private readonly string apiKey;

    public CreditLimitAuditPlugin(string unsecureConfig, string secureConfig)
    {
        threshold = string.IsNullOrWhiteSpace(unsecureConfig)
            ? 100000m
            : decimal.Parse(unsecureConfig, CultureInfo.InvariantCulture);
        apiKey = secureConfig;
    }
}
```

- **Unsecure configuration** is stored on the step, visible to anyone who can read steps, and **exported with the solution**.
- **Secure configuration** is stored separately, readable only by administrators, and **not exported** with the solution: it must be set in each environment after import.

The constructor runs when the platform creates (and caches) the instance, so parse the strings there once, and keep them in `readonly` fields. That is the one kind of field state that is fine in a plug-in. Many teams put JSON or XML in the string for several values.

## Environment variables

**Environment variables** are solution components with a definition (name, type, default value) and a **value per environment**. They suit settings that admins change and pipelines set per environment through a deployment settings file. Plug-ins read them by querying the `environmentvariabledefinition` and `environmentvariablevalue` tables (the value overrides the default), or through the `RetrieveEnvironmentVariableValue` message. **Secret** environment variables point at Azure Key Vault and are read with `RetrieveEnvironmentVariableSecretValue`.

## A configuration table

A custom table (`contoso_configuration` with `contoso_key` and `contoso_value`) is the classic do-it-yourself option. Admins edit it in an app, security roles control who can see it, and plug-ins and workflows query it by key. The custom workflow module builds one.

## Choosing

| Setting | Where |
| --- | --- |
| One step's threshold or behaviour flag | Unsecure configuration |
| API key used by one step | Secure configuration (or a secret environment variable) |
| Value shared by plug-ins, flows and apps, different per environment | Environment variable |
| Many business-maintained values, lists, rules | Configuration table |

## Caching

Reading configuration costs a query. For values from tables or environment variables, cache them in a **static, thread-safe** dictionary with a short expiry (a few minutes), keyed by organization id, so a change is picked up without a deployment:

```csharp
private static readonly ConcurrentDictionary<string, (string Value, DateTime Expires)> Cache = new();
```

Never cache user-specific data, and remember that each sandbox worker has its own copy of the cache.

## In an interview

- Explain unsecure vs secure configuration and which one travels with solutions.
- Explain why configuration is parsed in the constructor.
- Compare step configuration, environment variables and a configuration table.
- Explain how and why to cache configuration in a plug-in.
