Питання 54 («що відбувається, коли вводите google.com») і 55 (HTTPS) часто ведуть до глибших питань про HTTP. Ось що очікують знати від Middle-розробника.

## Версії HTTP

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Транспорт | TCP | TCP | QUIC поверх UDP |
| Формат | текст | бінарні фрейми | бінарні фрейми |
| Паралельні запити | по одному на з'єднання (браузери відкривають ~6) | багато потоків, мультиплексованих в одному з'єднанні | мультиплексовано, без блокування «голови черги» TCP |
| Заголовки | текстом, повторюються | стиснення HPACK | стиснення QPACK |
| Рукостискання | TCP + TLS (2–3 обміни) | так само | 1 обмін, відновлення 0-RTT |

Kestrel підтримує всі три (HTTP/3 потребує TLS і `msquic`). gRPC вимагає HTTP/2.

## Заголовки кешування

```http
Cache-Control: public, max-age=3600          # будь-який кеш може зберігати годину
Cache-Control: private, max-age=60           # лише браузер, не спільні проксі
Cache-Control: no-cache                      # зберігати, але перевіряти перед кожним використанням
Cache-Control: no-store                      # ніколи не зберігати (чутливі дані)
ETag: "v42"                                  # версія представлення
If-None-Match: "v42"            → 304 Not Modified (без тіла)
Last-Modified / If-Modified-Since            # та сама ідея з датами
Vary: Accept-Encoding, Accept-Language       # окремі копії для різних значень заголовків
```

## Cookies

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

- `HttpOnly` — JavaScript не може його прочитати (обмежує шкоду від XSS).
- `Secure` — надсилається лише через HTTPS.
- `SameSite=Lax/Strict` — не надсилається з крос-сайтовими запитами (захист від CSRF); `None` вимагає `Secure`.
- Cookie-автентифікація ASP.NET Core шифрує й підписує cookie ключами Data Protection — діліть набір ключів між екземплярами за балансувальником.

## Автентифікація у вебі

- **Сесії на cookies**: класичні застосунки з рендерингом на сервері; браузер надсилає cookie автоматично; потрібен захист від CSRF (antiforgery-токени).
- **Bearer-токени (JWT)**: API та SPA/мобільні застосунки надсилають `Authorization: Bearer <token>`. API локально перевіряє підпис, видавця, аудиторію й термін дії — без звернення до бази. Тримайте access-токени короткоживучими (хвилини) й використовуйте refresh-токени; ніколи не кладіть секрети в payload (він лише закодований Base64Url).
- **OAuth 2.0** делегує авторизацію: застосунок отримує access-токен від сервера авторизації (Entra ID, Auth0, IdentityServer/Duende, Keycloak). Для вебу, SPA й мобільних — **authorization code flow з PKCE**; між сервісами — **client credentials**.
- **OpenID Connect** додає автентифікацію поверх OAuth 2.0: **ID-токен** описує користувача.

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.Authority = "https://login.microsoftonline.com/<tenant>/v2.0";
        o.Audience = "api://orders";
    });
builder.Services.AddAuthorization(o => o.AddPolicy("CanRefund", p => p.RequireRole("support")));
app.MapPost("/orders/{id}/refund", Refund).RequireAuthorization("CanRefund");
```

401 чи 403: **401 Unauthorized** = не автентифіковано (немає чи недійсні облікові дані); **403 Forbidden** = автентифіковано, але не дозволено.

## Обмеження частоти запитів

Захищає API від зловживань і перевантаження. Алгоритми: **фіксоване вікно** (N запитів на хвилину — сплески на межах вікон), **ковзне вікно**, **відро з токенами** (відро поповнюється з постійною швидкістю; дозволено сплески до його місткості), **обмеження паралелізму**. В ASP.NET Core це вбудовано з .NET 7:

```csharp
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("per-user", ctx => RateLimitPartition.GetTokenBucketLimiter(
        ctx.User.Identity?.Name ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
        _ => new TokenBucketRateLimiterOptions { TokenLimit = 10, TokensPerPeriod = 5, ReplenishmentPeriod = TimeSpan.FromSeconds(1) }));
});
app.UseRateLimiter();
```

У кластері обмеження на екземпляр множаться на кількість екземплярів; для глобальних обмежень потрібне спільне сховище (Redis) або API gateway. Практика реалізує відро з токенами для кожного клієнта.
