## Шари, які відкриває .NET

| Шар | Протоколи | Типи .NET |
| --- | --- | --- |
| Прикладний | HTTP(S), WebSockets, gRPC, SMTP, FTP | `HttpClient`, `ClientWebSocket`, Kestrel, бібліотеки gRPC |
| Безпеки | TLS | `SslStream` (HTTPS використовує його автоматично) |
| Транспортний | TCP, UDP, QUIC (.NET 7) | `TcpClient`, `TcpListener`, `UdpClient`, `Socket` |
| Мережевий | IPv4, IPv6 | `IPAddress`, `IPEndPoint`, `Dns` |

Більшість прикладного коду торкається лише верхнього шару. Нижче спускаються заради власних протоколів, ігор, IoT чи високопродуктивних серверів.

## Адреси та порти

```csharp
IPAddress v4 = IPAddress.Parse("192.168.1.10");
IPAddress v6 = IPAddress.Parse("2001:db8::1");
IPAddress any = IPAddress.Any;            // 0.0.0.0: слухати на всіх інтерфейсах
IPAddress loop = IPAddress.Loopback;      // 127.0.0.1
var endpoint = new IPEndPoint(v4, 443);
Console.WriteLine(v6.AddressFamily);      // InterNetworkV6
```

**Порт** (0–65535) ідентифікує застосунок на хості. Добре відомі: 80 HTTP, 443 HTTPS, 25/587 SMTP, 53 DNS, 5432 PostgreSQL, 1433 SQL Server. Щоб слухати порти нижче 1024, часто потрібні права адміністратора/root.

## URI

```csharp
var uri = new Uri("https://shop.test:8443/api/orders/42?expand=lines#top");
uri.Scheme;          // https
uri.Host;            // shop.test
uri.Port;            // 8443 (443, якщо для https не вказано)
uri.AbsolutePath;    // /api/orders/42
uri.Query;           // ?expand=lines
uri.Fragment;        // #top
uri.Segments;        // "/", "api/", "orders/", "42"
uri.IsAbsoluteUri;

var relative = new Uri(new Uri("https://shop.test/api/"), "orders/42");   // https://shop.test/api/orders/42
var b = new UriBuilder("https", "shop.test") { Path = "search", Query = "q=pens" };
Uri.TryCreate(text, UriKind.Absolute, out Uri? parsed);
```

Примітки:

- Базовим URI потрібен **завершальний скісний**, щоб поєднуватися як тека: `new Uri(new Uri("https://x/api"), "orders")` дає `https://x/orders`.
- `HttpClient.BaseAddress` підкоряється тому самому правилу; ставте завершальний скісний у базі й не ставте початкового у відносних шляхах.

## Екранування

| Метод | Для чого |
| --- | --- |
| `Uri.EscapeDataString(value)` | значення запиту й сегменти шляху: екранує все зарезервоване (`&`, `=`, `?`, `/`, `#`, пробіл → `%20`) |
| `Uri.UnescapeDataString(text)` | декодування |
| `WebUtility.UrlEncode` | кодування форм (пробіл → `+`) |
| `WebUtility.HtmlEncode` | текст усередині HTML, не URL |

Не-ASCII символи кодуються в UTF-8, а потім percent-екрануються: `Київ` → `%D0%9A%D0%B8%D1%97%D0%B2`. В ASP.NET Core роботу роблять `QueryHelpers.AddQueryString` і `QueryString.Create`.

## Що сказати на співбесіді

- Прикладні протоколи працюють над TCP/UDP поверх IP; `HttpClient` покриває більшість потреб.
- `Uri` розбирає й поєднує URL; базовій адресі потрібен завершальний скісний.
- Екрануйте значення запиту через `Uri.EscapeDataString`, ніколи вручну.
