## Основи

```csharp
var client = new HttpClient { BaseAddress = new Uri("https://api.shop.test/"), Timeout = TimeSpan.FromSeconds(30) };
client.DefaultRequestHeaders.Add("Accept", "application/json");

string text = await client.GetStringAsync("orders/42", ct);

HttpResponseMessage resp = await client.GetAsync("orders/42", ct);
resp.EnsureSuccessStatusCode();                                    // кидає HttpRequestException для 4xx/5xx
Order? order = await resp.Content.ReadFromJsonAsync<Order>(cancellationToken: ct);   // System.Net.Http.Json

HttpResponseMessage created = await client.PostAsJsonAsync("orders", newOrder, ct);
Console.WriteLine(created.StatusCode);              // 201 Created
Console.WriteLine(created.Headers.Location);
```

Неуспішний код статусу сам по собі **не кидає** винятку: перевірте `IsSuccessStatusCode` або викличте `EnsureSuccessStatusCode()`. Мережеві збої (DNS, відмова у з'єднанні, TLS) кидають `HttpRequestException`; `Timeout` кидає `TaskCanceledException`.

## Повноцінні запити

```csharp
using var request = new HttpRequestMessage(HttpMethod.Put, "orders/42")
{
    Content = new StringContent(json, Encoding.UTF8, "application/json"),
};
request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
request.Headers.IfMatch.Add(new EntityTagHeaderValue("\"v7\""));

using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
await using var body = await response.Content.ReadAsStreamAsync(ct);   // потокове читання великих завантажень
```

`HttpCompletionOption.ResponseHeadersRead` повертає керування, щойно прийшли заголовки, тож великі тіла можна читати потоком, а не буферизувати в пам'яті.

Типи вмісту: `StringContent`, `ByteArrayContent`, `StreamContent`, `FormUrlEncodedContent`, `MultipartFormDataContent`, `JsonContent`.

## Час життя: найпоширеніша помилка

`HttpClient` призначений для **повторного використання**. Він потокобезпечний для одночасних запитів і тримає пул з'єднань.

- `new HttpClient()` на кожен запит із подальшим звільненням: кожен звільнений клієнт закриває свої з'єднання, що висять у `TIME_WAIT`; під навантаженням сокети закінчуються, і кожен запит платить за нове рукостискання TCP+TLS.
- Один статичний клієнт назавжди: добре повторне використання, але з'єднання в пулі ніколи не закриваються, тож зміни DNS ніколи не помічаються.

Виправлення:

```csharp
// консольні застосунки / бібліотеки: один довгоживучий клієнт із перестворенням з'єднань
static readonly HttpClient Client = new(new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(5),
});

// ASP.NET Core: нехай обробниками керує IHttpClientFactory
builder.Services.AddHttpClient<CatalogClient>(c => c.BaseAddress = new Uri("https://catalog/"));

public class CatalogClient
{
    private readonly HttpClient _http;
    public CatalogClient(HttpClient http) => _http = http;    // типізований клієнт
    public Task<Product?> GetAsync(int id) => _http.GetFromJsonAsync<Product>($"products/{id}");
}
```

## Обробники: конвеєр middleware для вихідних викликів

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

Обробники додають логування, токени автентифікації, ідентифікатори кореляції та **стійкість**: повтори з відступом, запобіжники (circuit breaker), тайм-аути (Polly або `Microsoft.Extensions.Http.Resilience` у .NET 8). Повторюйте лише ідемпотентні запити або використовуйте ключі ідемпотентності.

## Інші деталі

- Проксі, cookies, автоматичне розпакування й сертифікати налаштовуються на `SocketsHttpHandler`/`HttpClientHandler`.
- Підтримуються HTTP/2 і HTTP/3 (`request.Version`, `VersionPolicy`).
- Ніколи не вимикайте перевірку сертифікатів у продакшні (`ServerCertificateCustomValidationCallback = (_, _, _, _) => true` — діра в безпеці).

## Що сказати на співбесіді

- Повторно використовуйте `HttpClient`; в ASP.NET Core — `IHttpClientFactory` і типізовані клієнти.
- Відповіді не-2xx не кидають винятків; викликайте `EnsureSuccessStatusCode`.
- `DelegatingHandler` утворюють вихідний конвеєр для логування, автентифікації й повторів.
