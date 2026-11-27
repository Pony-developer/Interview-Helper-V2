Question 54 ("what happens when you type google.com") and 55 (HTTPS) often lead to deeper HTTP questions. Here's what a Middle developer is expected to know.

## HTTP versions

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transport | TCP | TCP | QUIC over UDP |
| Format | text | binary frames | binary frames |
| Parallel requests | one at a time per connection (browsers open ~6) | many streams multiplexed on one connection | multiplexed, no TCP head-of-line blocking |
| Headers | plain text, repeated | HPACK compression | QPACK compression |
| Handshake | TCP + TLS (2–3 round trips) | same | 1 round trip, 0-RTT resumption |

Kestrel supports all three (HTTP/3 needs TLS and `msquic`). gRPC requires HTTP/2.

## Caching headers

```http
Cache-Control: public, max-age=3600          # any cache may store it for an hour
Cache-Control: private, max-age=60           # only the browser, not shared proxies
Cache-Control: no-cache                      # store, but revalidate before every use
Cache-Control: no-store                      # never store (sensitive data)
ETag: "v42"                                  # version of the representation
If-None-Match: "v42"            → 304 Not Modified (no body)
Last-Modified / If-Modified-Since            # the same idea with dates
Vary: Accept-Encoding, Accept-Language       # cache separate copies per header value
```

## Cookies

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

- `HttpOnly` — JavaScript can't read it (limits XSS damage).
- `Secure` — sent only over HTTPS.
- `SameSite=Lax/Strict` — not sent on cross-site requests (CSRF protection); `None` requires `Secure`.
- ASP.NET Core cookie authentication encrypts and signs the cookie with Data Protection keys — share the key ring between instances behind a load balancer.

## Authentication on the web

- **Cookie-based sessions**: classic server-rendered apps; the browser sends the cookie automatically; needs CSRF protection (antiforgery tokens).
- **Bearer tokens (JWT)**: APIs and SPAs/mobile apps send `Authorization: Bearer <token>`. The API validates the signature, issuer, audience and expiry locally — no database lookup. Keep access tokens short-lived (minutes) and use refresh tokens; never put secrets in the payload (it's only Base64Url-encoded).
- **OAuth 2.0** delegates authorization: the app gets an access token from an authorization server (Entra ID, Auth0, IdentityServer/Duende, Keycloak). Use the **authorization code flow with PKCE** for web, SPA and mobile apps; **client credentials** for service-to-service.
- **OpenID Connect** adds authentication on top of OAuth 2.0: an **ID token** describes the user.

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

401 vs 403: **401 Unauthorized** = not authenticated (no or invalid credentials); **403 Forbidden** = authenticated but not allowed.

## Rate limiting

Protects an API from abuse and overload. Algorithms: **fixed window** (N requests per minute — bursty at window edges), **sliding window**, **token bucket** (a bucket refills at a steady rate; bursts up to its capacity are allowed), **concurrency limit**. ASP.NET Core has it built in since .NET 7:

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

In a cluster, per-instance limits multiply by the number of instances; use a shared store (Redis) or an API gateway for global limits. The practice implements a token bucket per client.
