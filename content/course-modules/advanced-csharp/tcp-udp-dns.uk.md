## TCP: надійний потік байтів

TCP дає впорядкований, надійний, двонаправлений **потік байтів** між двома кінцевими точками. Він повторно надсилає втрачені пакети й керує перевантаженням. Чого він **не** дає, так це меж повідомлень.

```csharp
// сервер
var listener = new TcpListener(IPAddress.Any, 5050);
listener.Start();
while (true)
{
    TcpClient client = await listener.AcceptTcpClientAsync();
    _ = HandleAsync(client);                      // одна задача на з'єднання
}

async Task HandleAsync(TcpClient client)
{
    using (client)
    using (NetworkStream stream = client.GetStream())
    using (var reader = new StreamReader(stream, Encoding.UTF8))
    using (var writer = new StreamWriter(stream, Encoding.UTF8) { AutoFlush = true })
    {
        string? line;
        while ((line = await reader.ReadLineAsync()) != null)   // протокол на рядках
            await writer.WriteLineAsync("echo: " + line);
    }
}

// клієнт
using var tcp = new TcpClient();
await tcp.ConnectAsync("localhost", 5050);
NetworkStream ns = tcp.GetStream();
```

### Кадрування

Один `Write` на 100 байтів може прийти як `Read` на 60 і 40 байтів; два невеликі записи можуть прийти одним читанням. Протокол поверх TCP мусить визначити, де закінчується повідомлення:

- **роздільники**: новий рядок (`ReadLine`) або спеціальний байт. Просто для тексту, але роздільник не може трапитися в даних без екранування;
- **префікс довжини**: записати довжину (наприклад, 4 байти), а потім дані. Читач читає рівно 4 байти, потім рівно N байтів, повторюючи `Read`, доки не отримає їх.

Саме так роблять HTTP (`Content-Length`, chunked encoding), Redis і більшість двійкових протоколів.

## Безпосередньо сокети

`System.Net.Sockets.Socket` — низькорівневий API під `TcpClient`/`UdpClient` з перевантаженнями `ReceiveAsync(Memory<byte>)` і `SendAsync` без алокацій. Високопродуктивні сервери (Kestrel) використовують сокети плюс `System.IO.Pipelines`.

## UDP: датаграми

UDP надсилає окремі **датаграми**: без з'єднання, без повторного надсилання, без упорядкування, але межі повідомлень зберігаються, а затримка низька.

```csharp
using var udp = new UdpClient(9999);
UdpReceiveResult result = await udp.ReceiveAsync();
Console.WriteLine($"{result.RemoteEndPoint}: {Encoding.UTF8.GetString(result.Buffer)}");

using var sender = new UdpClient();
byte[] data = Encoding.UTF8.GetBytes("ping");
await sender.SendAsync(data, data.Length, "localhost", 9999);
```

Використовується для DNS, ігор у реальному часі, VoIP, відео, виявлення сервісів і метрик (StatsD). Якщо застосунку важливі втрати й порядок, він обробляє їх сам.

## DNS

```csharp
IPAddress[] addresses = await Dns.GetHostAddressesAsync("example.com");
IPHostEntry entry = await Dns.GetHostEntryAsync("8.8.8.8");    // зворотний пошук
```

ОС кешує результати. Довгоживучі пули з'єднань не помітять змін DNS, якщо з'єднання не перестворюються (див. `PooledConnectionLifetime`).

## Пошта

`System.Net.Mail.SmtpClient` досі існує, але позначений як нерекомендований: йому бракує підтримки сучасних протоколів. Використовуйте **MailKit** для SMTP/IMAP/POP3 або HTTP API поштового провайдера (SendGrid, Amazon SES, Microsoft Graph).

Читання пошти через POP3 чи IMAP вручну поверх `TcpClient` + `SslStream` — добра вправа з протоколів на рядках, але в продакшні беріть бібліотеку.

## Що сказати на співбесіді

- TCP = надійний упорядкований **потік байтів**; повідомлення треба кадрувати (роздільники чи префікси довжини) і читати `Read` у циклі.
- UDP = ненадійні датаграми з межами й низькою затримкою.
- `TcpListener`/`TcpClient` — для простих серверів, `Socket` + Pipelines — для високої продуктивності, MailKit — для пошти.
