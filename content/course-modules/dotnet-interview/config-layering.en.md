## Task

Implement by hand what `WebApplication.CreateBuilder` and `services.Configure<T>()` do for you (Q74): layered configuration and options binding.

1. **`Config.Build(json, env, args)`** — merge three layers into one dictionary; a **later layer overrides** an earlier one; keys are **case-insensitive** (use `StringComparer.OrdinalIgnoreCase`; when a key is overridden it keeps the spelling of its first occurrence):
   - `json`: `"Section:Key=Value"` lines; skip empty lines and lines starting with `#`;
   - `env`: only variables that start with `APP_`; strip the prefix; `__` stands for `:` (`APP_Smtp__Host` → `Smtp:Host`);
   - `args`: `"--Section:Key=Value"`.
   Split each pair at the **first** `=`.
2. **`Config.BindSmtp(config)`** — create `SmtpOptions` from the `Smtp` section: `Host` is required (otherwise throw `InvalidOperationException("Smtp:Host is required")`), `Port` defaults to 25, `UseSsl` defaults to `false` (`bool.Parse` accepts `"TRUE"`).

Expected output:

```
Features:Beta=true
Logging:Level=Warning
Smtp:Host=smtp.prod.local
Smtp:Port=587
smtp.prod.local:587 ssl=False
Smtp:Host is required
mail:25 ssl=True
```
