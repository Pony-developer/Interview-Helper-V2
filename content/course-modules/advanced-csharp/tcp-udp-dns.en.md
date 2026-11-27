## TCP: a reliable byte stream

TCP gives you an ordered, reliable, bidirectional **stream of bytes** between two endpoints. It retransmits lost packets and controls congestion. What it does **not** give you is message boundaries.

```csharp
// server
var listener = new TcpListener(IPAddress.Any, 5050);
listener.Start();
while (true)
{
    TcpClient client = await listener.AcceptTcpClientAsync();
    _ = HandleAsync(client);                      // one task per connection
}

async Task HandleAsync(TcpClient client)
{
    using (client)
    using (NetworkStream stream = client.GetStream())
    using (var reader = new StreamReader(stream, Encoding.UTF8))
    using (var writer = new StreamWriter(stream, Encoding.UTF8) { AutoFlush = true })
    {
        string? line;
        while ((line = await reader.ReadLineAsync()) != null)   // a line-based protocol
            await writer.WriteLineAsync("echo: " + line);
    }
}

// client
using var tcp = new TcpClient();
await tcp.ConnectAsync("localhost", 5050);
NetworkStream ns = tcp.GetStream();
```

### Framing

One `Write` of 100 bytes may arrive as `Read`s of 60 and 40 bytes; two small writes may arrive in one read. A protocol on TCP must define where a message ends:

- **delimiters**: a newline (`ReadLine`), or a special byte. Simple for text, but the delimiter can't appear in the payload without escaping;
- **length prefix**: write the length (e.g. 4 bytes) and then the payload. The reader reads exactly 4 bytes, then exactly N bytes, looping over `Read` until it has them.

That's exactly what HTTP (`Content-Length`, chunked encoding), Redis and most binary protocols do.

## Sockets directly

`System.Net.Sockets.Socket` is the low-level API under `TcpClient`/`UdpClient`, with `ReceiveAsync(Memory<byte>)` and `SendAsync` overloads that avoid allocations. High-performance servers (Kestrel) use sockets plus `System.IO.Pipelines`.

## UDP: datagrams

UDP sends individual **datagrams**: no connection, no retransmission, no ordering, but message boundaries are kept and latency is low.

```csharp
using var udp = new UdpClient(9999);
UdpReceiveResult result = await udp.ReceiveAsync();
Console.WriteLine($"{result.RemoteEndPoint}: {Encoding.UTF8.GetString(result.Buffer)}");

using var sender = new UdpClient();
byte[] data = Encoding.UTF8.GetBytes("ping");
await sender.SendAsync(data, data.Length, "localhost", 9999);
```

Used for DNS, real-time games, VoIP, video, discovery and metrics (StatsD). The application handles loss and ordering if it cares.

## DNS

```csharp
IPAddress[] addresses = await Dns.GetHostAddressesAsync("example.com");
IPHostEntry entry = await Dns.GetHostEntryAsync("8.8.8.8");    // reverse lookup
```

Results are cached by the OS. Long-lived connection pools won't notice DNS changes unless connections are recycled (see `PooledConnectionLifetime`).

## Mail

`System.Net.Mail.SmtpClient` still exists but is marked as not recommended: it lacks modern protocol support. Use **MailKit** for SMTP/IMAP/POP3, or an email provider's HTTP API (SendGrid, Amazon SES, Microsoft Graph).

Reading mail over POP3 or IMAP by hand over `TcpClient` + `SslStream` is a good exercise in line-based protocols, but use a library in production.

## Interview takeaways

- TCP = reliable ordered **byte stream**; you must frame messages (delimiters or length prefixes) and loop on `Read`.
- UDP = unreliable datagrams with boundaries and low latency.
- Use `TcpListener`/`TcpClient` for simple servers, `Socket` + Pipelines for high performance, MailKit for email.
