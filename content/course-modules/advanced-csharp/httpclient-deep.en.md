## The basics

```csharp
var client = new HttpClient { BaseAddress = new Uri("https://api.shop.test/"), Timeout = TimeSpan.FromSeconds(30) };
client.DefaultRequestHeaders.Add("Accept", "application/json");

string text = await client.GetStringAsync("orders/42", ct);

HttpResponseMessage resp = await client.GetAsync("orders/42", ct);
resp.EnsureSuccessStatusCode();                                    // throws HttpRequestException for 4xx/5xx
Order? order = await resp.Content.ReadFromJsonAsync<Order>(cancellationToken: ct);   // System.Net.Http.Json

HttpResponseMessage created = await client.PostAsJsonAsync("orders", newOrder, ct);
Console.WriteLine(created.StatusCode);              // 201 Created
Console.WriteLine(created.Headers.Location);
```

A non-success status code **doesn't throw** by itself: check `IsSuccessStatusCode` or call `EnsureSuccessStatusCode()`. Network failures (DNS, refused connection, TLS) throw `HttpRequestException`; the `Timeout` throws `TaskCanceledException`.

## Requests in full

```csharp
using var request = new HttpRequestMessage(HttpMethod.Put, "orders/42")
{
    Content = new StringContent(json, Encoding.UTF8, "application/json"),
};
request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
request.Headers.IfMatch.Add(new EntityTagHeaderValue("\"v7\""));

using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
await using var body = await response.Content.ReadAsStreamAsync(ct);   // stream large downloads
```

`HttpCompletionOption.ResponseHeadersRead` returns as soon as headers arrive, so you can stream big bodies instead of buffering them in memory.

Content types: `StringContent`, `ByteArrayContent`, `StreamContent`, `FormUrlEncodedContent`, `MultipartFormDataContent`, `JsonContent`.

## Lifetime: the most common mistake

`HttpClient` is meant to be **reused**. It's thread-safe for concurrent requests, and it pools connections.

- `new HttpClient()` per request, then dispose: each disposed client closes its connections, which linger in `TIME_WAIT`; under load you run out of sockets, and every request pays for a new TCP+TLS handshake.
- One static client forever: good reuse, but pooled connections never close, so DNS changes are never seen.

The fixes:

```csharp
// console apps / libraries: one long-lived client with connection recycling
static readonly HttpClient Client = new(new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(5),
});

// ASP.NET Core: let IHttpClientFactory manage handlers
builder.Services.AddHttpClient<CatalogClient>(c => c.BaseAddress = new Uri("https://catalog/"));

public class CatalogClient
{
    private readonly HttpClient _http;
    public CatalogClient(HttpClient http) => _http = http;    // typed client
    public Task<Product?> GetAsync(int id) => _http.GetFromJsonAsync<Product>($"products/{id}");
}
```

## Handlers: a middleware pipeline for outgoing calls

```csharp
public class LoggingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var response = await base.SendAsync(request, ct);
        Console.WriteLine($"{request.Method} {request.RequestUri} → {(int)response.StatusCode} in {sw.ElapsedMilliseconds} ms");
        return response;
    }
}

builder.Services.AddHttpClient<CatalogClient>().AddHttpMessageHandler<LoggingHandler>();
```

Handlers add logging, auth tokens, correlation ids, and **resilience**: retries with backoff, circuit breakers, timeouts (Polly, or `Microsoft.Extensions.Http.Resilience` in .NET 8). Retry only idempotent requests, or use idempotency keys.

## Other details

- Proxies, cookies, automatic decompression and certificates are configured on `SocketsHttpHandler`/`HttpClientHandler`.
- HTTP/2 and HTTP/3 are supported (`request.Version`, `VersionPolicy`).
- Never disable certificate validation in production (`ServerCertificateCustomValidationCallback = (_, _, _, _) => true` is a security hole).

## Interview takeaways

- Reuse `HttpClient`; in ASP.NET Core use `IHttpClientFactory` and typed clients.
- Non-2xx responses don't throw; call `EnsureSuccessStatusCode`.
- `DelegatingHandler`s form an outgoing pipeline for logging, auth and retries.
