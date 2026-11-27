## Завдання

Реалізуйте вручну те, що за вас роблять `WebApplication.CreateBuilder` і `services.Configure<T>()` (П74): шарувату конфігурацію й прив'язку опцій.

1. **`Config.Build(json, env, args)`** — злийте три шари в один словник; **пізніший шар перевизначає** ранній; ключі **нечутливі до регістру** (`StringComparer.OrdinalIgnoreCase`; перевизначений ключ зберігає написання першої появи):
   - `json`: рядки `"Section:Key=Value"`; пропускайте порожні рядки й рядки, що починаються з `#`;
   - `env`: лише змінні, що починаються з `APP_`; відкиньте префікс; `__` означає `:` (`APP_Smtp__Host` → `Smtp:Host`);
   - `args`: `"--Section:Key=Value"`.
   Розділяйте кожну пару за **першим** `=`.
2. **`Config.BindSmtp(config)`** — створіть `SmtpOptions` із секції `Smtp`: `Host` обов'язковий (інакше киньте `InvalidOperationException("Smtp:Host is required")`), `Port` за замовчуванням 25, `UseSsl` за замовчуванням `false` (`bool.Parse` приймає `"TRUE"`).

Очікуваний вивід:

```
Features:Beta=true
Logging:Level=Warning
Smtp:Host=smtp.prod.local
Smtp:Port=587
smtp.prod.local:587 ssl=False
Smtp:Host is required
mail:25 ssl=True
```
