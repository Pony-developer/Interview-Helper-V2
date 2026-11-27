## The layers .NET exposes

| Layer | Protocols | .NET types |
| --- | --- | --- |
| Application | HTTP(S), WebSockets, gRPC, SMTP, FTP | `HttpClient`, `ClientWebSocket`, Kestrel, gRPC libraries |
| Security | TLS | `SslStream` (used by HTTPS automatically) |
| Transport | TCP, UDP, QUIC (.NET 7) | `TcpClient`, `TcpListener`, `UdpClient`, `Socket` |
| Network | IPv4, IPv6 | `IPAddress`, `IPEndPoint`, `Dns` |

Most application code only touches the top layer. Go lower for custom protocols, games, IoT, or high-performance servers.

## Addresses and ports

```csharp
IPAddress v4 = IPAddress.Parse("192.168.1.10");
IPAddress v6 = IPAddress.Parse("2001:db8::1");
IPAddress any = IPAddress.Any;            // 0.0.0.0: listen on all interfaces
IPAddress loop = IPAddress.Loopback;      // 127.0.0.1
var endpoint = new IPEndPoint(v4, 443);
Console.WriteLine(v6.AddressFamily);      // InterNetworkV6
```

A **port** (0–65535) identifies an application on a host. Well-known ones: 80 HTTP, 443 HTTPS, 25/587 SMTP, 53 DNS, 5432 PostgreSQL, 1433 SQL Server. Ports below 1024 often need admin/root to listen on.

## URIs

```csharp
var uri = new Uri("https://shop.test:8443/api/orders/42?expand=lines#top");
uri.Scheme;          // https
uri.Host;            // shop.test
uri.Port;            // 8443 (443 if not specified for https)
uri.AbsolutePath;    // /api/orders/42
uri.Query;           // ?expand=lines
uri.Fragment;        // #top
uri.Segments;        // "/", "api/", "orders/", "42"
uri.IsAbsoluteUri;

var relative = new Uri(new Uri("https://shop.test/api/"), "orders/42");   // https://shop.test/api/orders/42
var b = new UriBuilder("https", "shop.test") { Path = "search", Query = "q=pens" };
Uri.TryCreate(text, UriKind.Absolute, out Uri? parsed);
```

Notes:

- Base URIs need a **trailing slash** to combine as a folder: `new Uri(new Uri("https://x/api"), "orders")` gives `https://x/orders`.
- `HttpClient.BaseAddress` follows the same rule; use a trailing slash on the base and no leading slash on relative paths.

## Escaping

| Method | Use for |
| --- | --- |
| `Uri.EscapeDataString(value)` | query values and path segments: escapes everything reserved (`&`, `=`, `?`, `/`, `#`, space → `%20`) |
| `Uri.UnescapeDataString(text)` | decoding |
| `WebUtility.UrlEncode` | form encoding (space → `+`) |
| `WebUtility.HtmlEncode` | text inside HTML, not URLs |

Non-ASCII characters are UTF-8 encoded then percent-escaped: `Київ` → `%D0%9A%D0%B8%D1%97%D0%B2`. In ASP.NET Core, `QueryHelpers.AddQueryString` and `QueryString.Create` do the work for you.

## Interview takeaways

- Application protocols sit on TCP/UDP over IP; `HttpClient` covers most needs.
- `Uri` parses and combines URLs; a base address needs a trailing slash.
- Escape query values with `Uri.EscapeDataString`, never by hand.
