import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const queryTypes = (body: string) => `static class Query
{
    // Builds "base?key=value&..." escaping keys and values with Uri.EscapeDataString.
    // Pairs with a null value are skipped. No '?' when nothing is left.
    public static string Build(string baseUrl, IEnumerable<KeyValuePair<string, string>> pairs)
    {
${body.split("@@")[0]}
    }

    // Parses the query part of a URL into a dictionary (case-insensitive keys, last value wins).
    // Values are unescaped; '+' is treated as a space; a key without '=' gets an empty value.
    public static Dictionary<string, string> Parse(string url)
    {
${body.split("@@")[1]}
    }
}`;

const querySolution = `        var parts = new List<string>();
        foreach (var p in pairs)
            if (p.Value != null) parts.Add(Uri.EscapeDataString(p.Key) + "=" + Uri.EscapeDataString(p.Value));
        return parts.Count == 0 ? baseUrl : baseUrl + "?" + string.Join("&", parts);@@        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        int q = url.IndexOf('?');
        if (q < 0) return result;
        string query = url.Substring(q + 1);
        int hash = query.IndexOf('#');
        if (hash >= 0) query = query.Substring(0, hash);
        foreach (var part in query.Split(new[] { '&' }, StringSplitOptions.RemoveEmptyEntries))
        {
            int eq = part.IndexOf('=');
            string key = eq < 0 ? part : part.Substring(0, eq);
            string value = eq < 0 ? "" : part.Substring(eq + 1);
            result[Uri.UnescapeDataString(key.Replace('+', ' '))] = Uri.UnescapeDataString(value.Replace('+', ' '));
        }
        return result;`;

const queryMain = `        string url = Query.Build("https://shop.test/search", new[]
        {
            new KeyValuePair<string, string>("q", "C# & .NET"),
            new KeyValuePair<string, string>("city", "Київ"),
            new KeyValuePair<string, string>("page", "2"),
            new KeyValuePair<string, string>("debug", null),
        });
        Console.WriteLine(url);
        Console.WriteLine(Query.Build("https://shop.test/", new KeyValuePair<string, string>[0]));

        var parsed = Query.Parse(url + "#results");
        Console.WriteLine(parsed["q"] + " | " + parsed["CITY"] + " | " + parsed["page"] + " | " + parsed.Count);
        var other = Query.Parse("/list?sort=price+desc&flag&sort=name");
        Console.WriteLine("sort=" + other["sort"] + " flag='" + other["flag"] + "'");

        var uri = new Uri(url);
        Console.WriteLine(uri.Host + " " + uri.AbsolutePath + " " + uri.Scheme + " " + uri.Port);`;

const framingTypes = (body: string) => `// Simulates a network stream: every Read returns at most 'chunk' bytes, like TCP often does.
class TrickleStream : Stream
{
    private readonly MemoryStream _inner;
    private readonly int _chunk;
    public TrickleStream(byte[] data, int chunk) { _inner = new MemoryStream(data); _chunk = chunk; }
    public override int Read(byte[] buffer, int offset, int count) { return _inner.Read(buffer, offset, Math.Min(count, _chunk)); }
    public override bool CanRead { get { return true; } }
    public override bool CanSeek { get { return false; } }
    public override bool CanWrite { get { return false; } }
    public override long Length { get { throw new NotSupportedException(); } }
    public override long Position { get { throw new NotSupportedException(); } set { throw new NotSupportedException(); } }
    public override void Flush() { }
    public override long Seek(long o, SeekOrigin s) { throw new NotSupportedException(); }
    public override void SetLength(long v) { throw new NotSupportedException(); }
    public override void Write(byte[] b, int o, int c) { throw new NotSupportedException(); }
}

// Length-prefixed framing: each message is a 4-byte big-endian length followed by that many UTF-8 bytes.
static class Framing
{
    public static void WriteMessage(Stream s, string message)
    {
        byte[] body = Encoding.UTF8.GetBytes(message);
        byte[] len = { (byte)(body.Length >> 24), (byte)(body.Length >> 16), (byte)(body.Length >> 8), (byte)body.Length };
        s.Write(len, 0, 4);
        s.Write(body, 0, body.Length);
    }

    // Returns the next message, or null at a clean end of stream (no bytes left before a header).
    // Throws EndOfStreamException if the stream ends in the middle of a message.
    public static string ReadMessage(Stream s)
    {
${body}
    }
}`;

const framingSolution = `        byte[] header = new byte[4];
        int got = ReadFully(s, header, 4);
        if (got == 0) return null;
        if (got < 4) throw new EndOfStreamException("Truncated header");
        int length = (header[0] << 24) | (header[1] << 16) | (header[2] << 8) | header[3];
        byte[] body = new byte[length];
        if (ReadFully(s, body, length) < length) throw new EndOfStreamException("Truncated message");
        return Encoding.UTF8.GetString(body);
    }

    private static int ReadFully(Stream s, byte[] buffer, int count)
    {
        int total = 0;
        while (total < count)
        {
            int n = s.Read(buffer, total, count - total);
            if (n == 0) break;
            total += n;
        }
        return total;`;

const framingMain = `        var wire = new MemoryStream();
        Framing.WriteMessage(wire, "HELLO");
        Framing.WriteMessage(wire, "ORDER 42: 3 × pens");
        Framing.WriteMessage(wire, "");
        Framing.WriteMessage(wire, "BYE");
        byte[] bytes = wire.ToArray();
        Console.WriteLine("bytes on the wire: " + bytes.Length);

        var net = new TrickleStream(bytes, 3);          // at most 3 bytes per Read
        string msg;
        while ((msg = Framing.ReadMessage(net)) != null) Console.WriteLine("[" + msg + "]");

        var broken = new byte[bytes.Length - 2];
        Array.Copy(bytes, broken, broken.Length);
        var net2 = new TrickleStream(broken, 5);
        try { while (Framing.ReadMessage(net2) != null) { } }
        catch (EndOfStreamException e) { Console.WriteLine("error: " + e.Message); }`;

export const networkingModule: ModuleDef = {
  slug: "networking",
  title: { en: "Networking", uk: "Мережа" },
  slides: [
    lecture("network-architecture", "Network architecture, addresses, ports and URIs", "Архітектура мережі, адреси, порти та URI"),
    lecture("httpclient-deep", "HttpClient done right", "HttpClient правильно"),
    lecture("http-server", "Writing an HTTP server", "Пишемо HTTP-сервер"),
    lecture("tcp-udp-dns", "TCP, UDP, DNS and mail", "TCP, UDP, DNS і пошта"),
    quiz("networking-quiz", "Networking", "Мережа", [
      question(
        "httpclient-per-request",
        ["What goes wrong when a busy server creates and disposes a new `HttpClient` for every request?", "Що йде не так, коли навантажений сервер створює й звільняє новий `HttpClient` на кожен запит?"],
        [
          ["Nothing, that's the recommended pattern", "Нічого, це рекомендований патерн"],
          ["Closed connections linger in TIME_WAIT, so sockets can be exhausted; and no connection reuse", "Закриті з'єднання висять у TIME_WAIT, тож сокети можуть вичерпатися; і немає повторного використання з'єднань"],
          ["Requests are sent twice", "Запити надсилаються двічі"],
          ["HTTPS stops working", "HTTPS перестає працювати"],
        ],
        "b",
      ),
      question(
        "dns-singleton",
        ["What is the problem with a single static `HttpClient` that lives forever (before SocketsHttpHandler's PooledConnectionLifetime)?", "Яка проблема з одним статичним `HttpClient`, що живе вічно (без PooledConnectionLifetime у SocketsHttpHandler)?"],
        [
          ["It isn't thread-safe", "Він не потокобезпечний"],
          ["It leaks memory", "Він спричиняє витік пам'яті"],
          ["Pooled connections are never recreated, so DNS changes (e.g. a failover) aren't picked up", "З'єднання в пулі ніколи не перестворюються, тож зміни DNS (наприклад, перемикання на резерв) не підхоплюються"],
          ["It can send only GET requests", "Він може надсилати лише GET-запити"],
        ],
        "c",
      ),
      question(
        "status",
        ["`await client.GetAsync(url)` returns a 404 response. What happens?", "`await client.GetAsync(url)` повертає відповідь 404. Що станеться?"],
        [
          ["Nothing throws: you get an HttpResponseMessage; call EnsureSuccessStatusCode() or check IsSuccessStatusCode", "Нічого не кидається: ви отримуєте HttpResponseMessage; викличте EnsureSuccessStatusCode() або перевірте IsSuccessStatusCode"],
          ["It throws HttpRequestException immediately", "Одразу кидається HttpRequestException"],
          ["It returns null", "Повертається null"],
          ["It retries automatically", "Автоматично повторює спробу"],
        ],
        "a",
      ),
      question(
        "tcp-messages",
        ["Why do TCP protocols need message framing (length prefixes or delimiters)?", "Навіщо TCP-протоколам кадрування повідомлень (префікси довжини чи роздільники)?"],
        [
          ["TCP encrypts data", "TCP шифрує дані"],
          ["TCP drops messages", "TCP губить повідомлення"],
          ["TCP is message-based", "TCP базується на повідомленнях"],
          ["TCP is a byte stream: one Write may arrive as several Reads, and several Writes may arrive in one Read", "TCP — потік байтів: один Write може прийти кількома Read, а кілька Write — одним Read"],
        ],
        "d",
      ),
      question(
        "udp",
        ["Which are true about UDP compared with TCP?", "Що правда про UDP порівняно з TCP?"],
        [
          ["No connection setup and lower latency", "Немає встановлення з'єднання, менша затримка"],
          ["Datagrams may be lost, duplicated or arrive out of order", "Датаграми можуть губитися, дублюватися чи приходити не по порядку"],
          ["Message boundaries are preserved", "Межі повідомлень зберігаються"],
          ["Delivery is guaranteed", "Доставка гарантована"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "escape",
        ["Which method should you use to put an arbitrary value into a URL query string?", "Який метод використати, щоб вставити довільне значення в рядок запиту URL?"],
        [
          ["`Uri.EscapeDataString(value)`", "`Uri.EscapeDataString(value)`"],
          ["`value.Replace(\" \", \"%20\")`", "`value.Replace(\" \", \"%20\")`"],
          ["`HttpUtility.HtmlEncode(value)`", "`HttpUtility.HtmlEncode(value)`"],
          ["No escaping is needed", "Екранування не потрібне"],
        ],
        "a",
      ),
      question(
        "factory",
        ["What does `IHttpClientFactory` give you in ASP.NET Core?", "Що дає `IHttpClientFactory` в ASP.NET Core?"],
        [
          ["A new TCP connection per request", "Нове TCP-з'єднання на кожен запит"],
          ["Pooled, periodically recycled handlers, plus named/typed clients and a place to plug in resilience handlers (retries, timeouts)", "Пул обробників, що періодично перестворюються, плюс іменовані/типізовані клієнти й місце для обробників стійкості (повтори, тайм-аути)"],
          ["Automatic caching of every response", "Автоматичне кешування кожної відповіді"],
          ["A built-in HTTP server", "Вбудований HTTP-сервер"],
        ],
        "b",
      ),
      question(
        "smtp",
        ["What does Microsoft recommend instead of `System.Net.Mail.SmtpClient` for new code?", "Що Microsoft рекомендує замість `System.Net.Mail.SmtpClient` для нового коду?"],
        [
          ["`WebClient`", "`WebClient`"],
          ["`TcpClient` with hand-written SMTP", "`TcpClient` з вручну написаним SMTP"],
          ["A library such as MailKit, or an email provider's HTTP API", "Бібліотеку на кшталт MailKit або HTTP API поштового провайдера"],
          ["`HttpListener`", "`HttpListener`"],
        ],
        "c",
      ),
    ]),
    practice("query-string-practice", "Building and parsing query strings", "Побудова й розбір рядків запиту", {
      starter: PROGRAM_WITH(queryTypes(`${TODO}@@${TODO}`), queryMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(queryTypes(querySolution), queryMain, "using System.Collections.Generic;"),
      expectedOutput:
        "https://shop.test/search?q=C%23%20%26%20.NET&city=%D0%9A%D0%B8%D1%97%D0%B2&page=2\nhttps://shop.test/\nC# & .NET | Київ | 2 | 3\nsort=name flag=''\nshop.test /search https 443\n",
    }),
    practice("framing-practice", "Length-prefixed message framing", "Кадрування повідомлень із префіксом довжини", {
      starter: PROGRAM_WITH(framingTypes(TODO), framingMain, "using System.IO;\nusing System.Text;"),
      solution: PROGRAM_WITH(framingTypes(framingSolution), framingMain, "using System.IO;\nusing System.Text;"),
      expectedOutput: "bytes on the wire: 43\n[HELLO]\n[ORDER 42: 3 × pens]\n[]\n[BYE]\nerror: Truncated message\n",
    }),
  ],
};
