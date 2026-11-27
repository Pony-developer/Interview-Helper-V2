import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { SlideDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";

const stub = "        throw new NotImplementedException();";

/* ---------- Section: general (Q54–70) ---------- */

export const middleSolidLecture = lecture("middle-solid-examples", "SOLID, DI and pure functions in code", "SOLID, DI і чисті функції в коді");
export const middlePatternsLecture = lecture("middle-patterns-distributed", "Design patterns and distributed-system patterns", "Патерни проєктування та патерни розподілених систем");

export const middleGeneralQuiz2 = quiz("middle-general-quiz-2", "HTTP, SOLID and distributed systems, part 2", "HTTP, SOLID і розподілені системи, частина 2", [
  question(
    "dns-first",
    ["What happens first when you type a host name into the browser (with nothing cached)?", "Що відбувається першим, коли ви вводите ім'я хоста в браузері (кеш порожній)?"],
    [
      ["A DNS lookup to get the IP address", "DNS-запит, щоб отримати IP-адресу"],
      ["The TLS handshake", "TLS-рукостискання"],
      ["An HTTP GET request", "HTTP GET-запит"],
      ["Rendering the DOM", "Рендеринг DOM"],
    ],
    "a",
  ),
  question(
    "hsts",
    ["What does the `Strict-Transport-Security` (HSTS) header do?", "Що робить заголовок `Strict-Transport-Security` (HSTS)?"],
    [
      ["Tells the browser to use only HTTPS for this host for a period, skipping the insecure first request", "Каже браузеру певний час ходити на цей хост лише через HTTPS, пропускаючи небезпечний перший запит"],
      ["Encrypts cookies", "Шифрує cookies"],
      ["Enables CORS", "Вмикає CORS"],
      ["Compresses the response", "Стискає відповідь"],
    ],
    "a",
  ),
  question(
    "srp",
    ["`InvoiceService` calculates totals, renders PDFs and sends emails. Which principle does it violate?", "`InvoiceService` рахує суми, рендерить PDF і надсилає листи. Який принцип порушено?"],
    [
      ["Single responsibility", "Єдиної відповідальності"],
      ["Liskov substitution", "Підстановки Лісков"],
      ["Interface segregation", "Розділення інтерфейсів"],
      ["None", "Жоден"],
    ],
    "a",
  ),
  question(
    "isp",
    ["A `ReadOnlyRepository` has to implement `Delete()` by throwing `NotSupportedException`. Which principle points to the fix?", "`ReadOnlyRepository` мусить реалізувати `Delete()`, кидаючи `NotSupportedException`. Який принцип підказує виправлення?"],
    [
      ["Interface segregation: split into `IReader` and `IWriter`", "Розділення інтерфейсів: розбити на `IReader` і `IWriter`"],
      ["Open/closed", "Відкритості/закритості"],
      ["DRY", "DRY"],
      ["YAGNI", "YAGNI"],
    ],
    "a",
  ),
  question(
    "protobuf",
    ["Why choose Protocol Buffers (gRPC) over JSON between services?", "Чому між сервісами обирають Protocol Buffers (gRPC), а не JSON?"],
    [
      ["Smaller payloads and faster (de)serialization", "Менший обсяг і швидша (де)серіалізація"],
      ["A strict schema (`.proto`) with generated clients and backward-compatible evolution by field numbers", "Сувора схема (`.proto`) зі згенерованими клієнтами й зворотно сумісною еволюцією за номерами полів"],
      ["Human-readable payloads", "Дані, які легко читає людина"],
      ["Browsers support it natively without any proxy", "Браузери підтримують його нативно без будь-якого проксі"],
    ],
    ["a", "b"],
  ),
  question(
    "di-ways",
    ["Which form of dependency injection is preferred in .NET?", "Яку форму dependency injection у .NET вважають кращою?"],
    [
      ["Constructor injection: required dependencies are visible and the object is always valid", "Впровадження через конструктор: обов'язкові залежності видно, а об'єкт завжди валідний"],
      ["Service locator: `ServiceProvider.GetService<T>()` inside methods", "Service locator: `ServiceProvider.GetService<T>()` усередині методів"],
      ["Static properties set at startup", "Статичні властивості, задані під час старту"],
      ["Creating dependencies with `new` inside the class", "Створення залежностей через `new` усередині класу"],
    ],
    "a",
  ),
  question(
    "saas-example",
    ["Dynamics 365 used by a company as is, in the vendor's cloud, is…", "Dynamics 365, яким компанія користується як є, у хмарі постачальника, — це…"],
    [
      ["IaaS", "IaaS"],
      ["PaaS", "PaaS"],
      ["SaaS", "SaaS"],
      ["FaaS", "FaaS"],
    ],
    "c",
  ),
  question(
    "debug-prod",
    ["A bug happens only in production. Good first steps?", "Баг відтворюється лише в продакшні. Добрі перші кроки?"],
    [
      ["Look at structured logs, traces and metrics around the time, filtered by correlation id", "Подивитися структуровані логи, трейси й метрики навколо цього часу, відфільтровані за correlation id"],
      ["Capture a memory dump if it's a hang or a leak (`dotnet-dump`)", "Зняти дамп пам'яті, якщо це зависання чи витік (`dotnet-dump`)"],
      ["Reproduce it locally with the same data / a failing test", "Відтворити локально з тими самими даними / падаючим тестом"],
      ["Attach a debugger with breakpoints to the production server", "Підключити відладчик із точками зупину до продакшн-сервера"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "pattern-kinds",
    ["Match: Factory Method, Adapter, Observer belong to…", "Factory Method, Adapter, Observer належать відповідно до…"],
    [
      ["Creational, structural, behavioral", "Твірних, структурних, поведінкових"],
      ["Structural, creational, behavioral", "Структурних, твірних, поведінкових"],
      ["Behavioral, structural, creational", "Поведінкових, структурних, твірних"],
      ["All creational", "Усі твірні"],
    ],
    "a",
  ),
  question(
    "strategy-di",
    ["How is Strategy usually wired in ASP.NET Core?", "Як зазвичай підключають Strategy в ASP.NET Core?"],
    [
      ["Register several `IShippingStrategy` implementations and inject `IEnumerable<IShippingStrategy>` (or keyed services) to pick one at run time", "Зареєструвати кілька реалізацій `IShippingStrategy` і впровадити `IEnumerable<IShippingStrategy>` (або keyed services), щоб обрати потрібну під час виконання"],
      ["A big `switch` in the controller", "Великий `switch` у контролері"],
      ["Reflection on every request", "Рефлексія на кожен запит"],
      ["A static class per strategy", "Статичний клас для кожної стратегії"],
    ],
    "a",
  ),
  question(
    "cap",
    ["During a network partition, a distributed data store must choose between…", "Під час розділення мережі розподілене сховище мусить обирати між…"],
    [
      ["Consistency and availability (CAP theorem)", "Узгодженістю й доступністю (теорема CAP)"],
      ["Speed and cost", "Швидкістю й ціною"],
      ["SQL and NoSQL", "SQL і NoSQL"],
      ["Reads and writes", "Читанням і записом"],
    ],
    "a",
  ),
  question(
    "api-gateway",
    ["What does an API Gateway do in a microservice system?", "Що робить API Gateway у мікросервісній системі?"],
    [
      ["A single entry point: routing, authentication, rate limiting, TLS termination, request aggregation", "Єдина точка входу: маршрутизація, автентифікація, обмеження частоти, завершення TLS, агрегація запитів"],
      ["Stores all the data", "Зберігає всі дані"],
      ["Replaces the message broker", "Замінює брокер повідомлень"],
      ["Compiles the services", "Компілює сервіси"],
    ],
    "a",
  ),
  question(
    "competing-consumers",
    ["Three instances of a service read from one queue. Each message is processed by…", "Три екземпляри сервісу читають з однієї черги. Кожне повідомлення обробляє…"],
    [
      ["All three instances", "Усі три екземпляри"],
      ["One of them (competing consumers), which scales processing horizontally", "Один із них (конкурентні споживачі), що масштабує обробку горизонтально"],
      ["None until all three agree", "Жоден, доки всі три не погодяться"],
      ["The first instance only, always", "Завжди лише перший екземпляр"],
    ],
    "b",
  ),
  question(
    "idempotency-key",
    ["A client retries `POST /payments` after a timeout. How does the server avoid charging twice?", "Клієнт повторює `POST /payments` після тайм-ауту. Як сервер уникає подвійного списання?"],
    [
      ["The client sends an `Idempotency-Key`; the server stores it with the result and returns the stored result for a repeat", "Клієнт надсилає `Idempotency-Key`; сервер зберігає його з результатом і на повтор повертає збережений результат"],
      ["It can't; POST is never safe to retry", "Ніяк; POST ніколи не можна безпечно повторювати"],
      ["By using GET instead", "Використовуючи замість нього GET"],
      ["By adding a longer timeout", "Збільшивши тайм-аут"],
    ],
    "a",
  ),
]);

const httpTypes = (parse: string) => `class HttpRequest
{
    public string Method;
    public string Path;
    public Dictionary<string, string> Query = new Dictionary<string, string>();
    public Dictionary<string, string> Headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    public string Body = "";
}

static class HttpParser
{
    // Parses a raw HTTP/1.1 request: "METHOD target HTTP/1.1", header lines "Name: value" up to an empty line, then the body.
    // Lines end with "\\r\\n". The target may have a query string (?a=1&b=2), URL-encoded, where '+' means a space.
    // The body is exactly Content-Length characters (none when the header is missing).
    // Throws FormatException when the request line does not have three parts.
    public static HttpRequest Parse(string raw)
    {
${parse}
    }
}`;

const httpMain = `        var get = HttpParser.Parse("GET /search?q=c%23+tips&page=2 HTTP/1.1\\r\\nHost: google.com\\r\\nAccept: text/html\\r\\naccept-language: uk\\r\\n\\r\\n");
        Console.WriteLine(get.Method + " " + get.Path);
        Console.WriteLine("q = " + get.Query["q"]);
        Console.WriteLine("page = " + get.Query["page"]);
        Console.WriteLine("query keys: " + get.Query.Count);
        Console.WriteLine("host: " + get.Headers["Host"]);
        Console.WriteLine("accept-language: " + get.Headers["Accept-Language"]);
        Console.WriteLine("body: " + (get.Body.Length == 0 ? "(empty)" : get.Body));

        var post = HttpParser.Parse("POST /orders HTTP/1.1\\r\\nHost: api.shop.com\\r\\nContent-Type: application/json\\r\\nContent-Length: 13\\r\\n\\r\\n{\\"id\\":42,\\"x\\"}EXTRA");
        Console.WriteLine(post.Method + " " + post.Path + " (" + post.Query.Count + " query keys)");
        Console.WriteLine("content-type: " + post.Headers["content-type"]);
        Console.WriteLine("body: " + post.Body);

        try
        {
            HttpParser.Parse("BROKEN\\r\\n\\r\\n");
            Console.WriteLine("parsed");
        }
        catch (FormatException)
        {
            Console.WriteLine("FormatException");
        }`;

export const httpParserPractice = practice("http-request-parser", "Parse a raw HTTP request", "Розбір сирого HTTP-запиту", {
  starter: PROGRAM_WITH(httpTypes(stub), httpMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    httpTypes(`        int headerEnd = raw.IndexOf("\\r\\n\\r\\n", StringComparison.Ordinal);
        string head = headerEnd < 0 ? raw : raw.Substring(0, headerEnd);
        string rest = headerEnd < 0 ? "" : raw.Substring(headerEnd + 4);
        string[] lines = head.Split(new[] { "\\r\\n" }, StringSplitOptions.None);

        string[] requestLine = lines[0].Split(' ');
        if (requestLine.Length != 3) throw new FormatException("Bad request line: " + lines[0]);
        var request = new HttpRequest { Method = requestLine[0] };

        string target = requestLine[1];
        int q = target.IndexOf('?');
        request.Path = q < 0 ? target : target.Substring(0, q);
        if (q >= 0)
        {
            foreach (string pair in target.Substring(q + 1).Split('&'))
            {
                if (pair.Length == 0) continue;
                string[] kv = pair.Split(new[] { '=' }, 2);
                request.Query[Decode(kv[0])] = kv.Length > 1 ? Decode(kv[1]) : "";
            }
        }

        for (int i = 1; i < lines.Length; i++)
        {
            int colon = lines[i].IndexOf(':');
            if (colon <= 0) continue;
            request.Headers[lines[i].Substring(0, colon).Trim()] = lines[i].Substring(colon + 1).Trim();
        }

        string length;
        if (request.Headers.TryGetValue("Content-Length", out length))
            request.Body = rest.Substring(0, Math.Min(int.Parse(length), rest.Length));
        return request;
    }

    static string Decode(string s)
    {
        return Uri.UnescapeDataString(s.Replace('+', ' '));`),
    httpMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "GET /search\nq = c# tips\npage = 2\nquery keys: 2\nhost: google.com\naccept-language: uk\nbody: (empty)\nPOST /orders (0 query keys)\ncontent-type: application/json\nbody: {\"id\":42,\"x\"}\nFormatException\n",
});

const consumerTypes = (handle: string, balance: string) => `class Deposit
{
    public string MessageId;
    public string Account;
    public decimal Amount;
    public Deposit(string id, string account, decimal amount) { MessageId = id; Account = account; Amount = amount; }
}

class AccountService
{
    private readonly Dictionary<string, decimal> balances = new Dictionary<string, decimal>();
    private readonly HashSet<string> processed = new HashSet<string>();

    public int ProcessedCount { get { return processed.Count; } }

    // The broker delivers at least once, so the same message can arrive again.
    // Returns "rejected" for a non-positive amount (not recorded as processed),
    // "duplicate" for a message id that was already applied, otherwise applies the deposit and returns "applied".
    public string Handle(Deposit message)
    {
${handle}
    }

    // 0 for an unknown account.
    public decimal Balance(string account)
    {
${balance}
    }
}`;

const consumerMain = `        var service = new AccountService();
        var deliveries = new[]
        {
            new Deposit("m1", "A", 100m), new Deposit("m2", "A", 50m), new Deposit("m1", "A", 100m),
            new Deposit("m3", "B", 70m), new Deposit("m2", "A", 50m), new Deposit("m4", "A", -5m),
        };
        foreach (var d in deliveries) Console.WriteLine(d.MessageId + ": " + service.Handle(d));
        Console.WriteLine("A = " + service.Balance("A"));
        Console.WriteLine("B = " + service.Balance("B"));
        Console.WriteLine("C = " + service.Balance("C"));
        Console.WriteLine("processed: " + service.ProcessedCount);`;

export const idempotentConsumerPractice = practice("idempotent-consumer", "An idempotent message handler", "Ідемпотентний обробник повідомлень", {
  starter: PROGRAM_WITH(consumerTypes(stub, stub), consumerMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    consumerTypes(
      `        if (message.Amount <= 0) return "rejected";
        if (!processed.Add(message.MessageId)) return "duplicate";
        decimal current;
        balances.TryGetValue(message.Account, out current);
        balances[message.Account] = current + message.Amount;
        return "applied";`,
      `        decimal value;
        return balances.TryGetValue(account, out value) ? value : 0m;`,
    ),
    consumerMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput: "m1: applied\nm2: applied\nm1: duplicate\nm3: applied\nm2: duplicate\nm4: rejected\nA = 150\nB = 70\nC = 0\nprocessed: 3\n",
});

/* ---------- Section: the platform and memory (Q71–82) ---------- */

export const middleAspnetPipelineLecture = lecture("middle-aspnet-pipeline", "ASP.NET Core: Program.cs, middleware, lifetimes and caching", "ASP.NET Core: Program.cs, middleware, час життя й кешування");
export const middleGcDisposeLecture = lecture("middle-gc-dispose", "The GC, finalizers and the Dispose pattern", "GC, фіналізатори та патерн Dispose");

export const middlePlatformQuiz2 = quiz("middle-platform-quiz-2", "ASP.NET Core and memory, part 2", "ASP.NET Core і пам'ять, частина 2", [
  question(
    "netstandard-use",
    ["When does it still make sense to target `netstandard2.0` today?", "Коли сьогодні ще має сенс націлюватися на `netstandard2.0`?"],
    [
      ["A NuGet library that must also work on .NET Framework 4.x (and Unity/Xamarin)", "NuGet-бібліотека, яка має працювати й на .NET Framework 4.x (і Unity/Xamarin)"],
      ["A new ASP.NET Core web app", "Новий вебзастосунок ASP.NET Core"],
      ["When you want the newest APIs", "Коли потрібні найновіші API"],
      ["Never", "Ніколи"],
    ],
    "a",
  ),
  question(
    "multiple-enumeration",
    ["`var q = db.Users.Where(u => u.Active); var n = q.Count(); var list = q.ToList();` How many SQL queries run?", "`var q = db.Users.Where(u => u.Active); var n = q.Count(); var list = q.ToList();` Скільки SQL-запитів виконається?"],
    [
      ["One", "Один"],
      ["Two: `Count()` and `ToList()` each execute the query", "Два: і `Count()`, і `ToList()` виконують запит"],
      ["Zero", "Нуль"],
      ["Three", "Три"],
    ],
    "b",
  ),
  question(
    "middleware-order",
    ["Why must `UseAuthentication()` come before `UseAuthorization()`?", "Чому `UseAuthentication()` має стояти перед `UseAuthorization()`?"],
    [
      ["Authorization needs `HttpContext.User`, which authentication sets; middleware runs in registration order", "Авторизації потрібен `HttpContext.User`, який заповнює автентифікація; middleware виконуються в порядку реєстрації"],
      ["It doesn't matter", "Це не має значення"],
      ["Authentication is slower", "Автентифікація повільніша"],
      ["The compiler requires it", "Цього вимагає компілятор"],
    ],
    "a",
  ),
  question(
    "captive",
    ["A singleton service takes a scoped `DbContext` in its constructor. What happens?", "Singleton-сервіс приймає scoped `DbContext` у конструкторі. Що станеться?"],
    [
      ["The DbContext lives forever and is shared by concurrent requests (a captive dependency); in Development scope validation throws at startup", "DbContext житиме вічно й буде спільним для паралельних запитів (captive dependency); у Development перевірка областей кине виняток під час старту"],
      ["A new DbContext per request", "Новий DbContext на кожен запит"],
      ["Compile error", "Помилка компіляції"],
      ["Nothing special", "Нічого особливого"],
    ],
    "a",
  ),
  question(
    "scoped-in-background",
    ["How do you use a scoped service from a `BackgroundService` (a singleton)?", "Як використати scoped-сервіс з `BackgroundService` (singleton)?"],
    [
      ["Inject `IServiceScopeFactory`, create a scope per unit of work, resolve the service from it and dispose the scope", "Впровадити `IServiceScopeFactory`, створювати область на кожну одиницю роботи, отримувати з неї сервіс і звільняти область"],
      ["Inject it directly into the constructor", "Впровадити його напряму в конструктор"],
      ["Make it static", "Зробити його статичним"],
      ["Register it as transient", "Зареєструвати як transient"],
    ],
    "a",
  ),
  question(
    "output-cache",
    ["Which caching sits on the server and can be invalidated by tag?", "Яке кешування живе на сервері й інвалідується за тегом?"],
    [
      ["Output caching (`AddOutputCache`, `[OutputCache(Tags = …)]`, `EvictByTagAsync`)", "Output caching (`AddOutputCache`, `[OutputCache(Tags = …)]`, `EvictByTagAsync`)"],
      ["`Cache-Control: public` header only", "Лише заголовок `Cache-Control: public`"],
      ["Browser localStorage", "localStorage браузера"],
      ["`ETag`", "`ETag`"],
    ],
    "a",
  ),
  question(
    "stack-size",
    ["Which statements about the thread stack are true?", "Які твердження про стек потоку правильні?"],
    [
      ["Each thread has its own stack (about 1 MB by default on Windows)", "Кожен потік має свій стек (за замовчуванням ≈1 МБ у Windows)"],
      ["Stack memory is freed when the method returns, without the GC", "Пам'ять стеку звільняється під час повернення з методу, без GC"],
      ["`stackalloc` allocates a buffer on the stack", "`stackalloc` виділяє буфер у стеку"],
      ["All threads share one stack", "Усі потоки ділять один стек"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "finalizer-cost",
    ["Why are finalizers costly?", "Чому фіналізатори дорогі?"],
    [
      ["Objects with finalizers survive at least one extra GC and are promoted to an older generation", "Об'єкти з фіналізаторами переживають щонайменше одне додаткове збирання й підвищуються до старшого покоління"],
      ["They run on a single finalizer thread in an unpredictable order and time", "Вони виконуються в одному потоці фіналізації в непередбачуваному порядку й час"],
      ["They block the compiler", "Вони блокують компілятор"],
      ["They run on every method call", "Вони виконуються на кожному виклику методу"],
    ],
    ["a", "b"],
  ),
  question(
    "suppress-finalize",
    ["Why call `GC.SuppressFinalize(this)` in `Dispose()`?", "Навіщо викликати `GC.SuppressFinalize(this)` у `Dispose()`?"],
    [
      ["Resources are already released, so the finalizer is not needed and the object can be collected in one GC", "Ресурси вже звільнено, тож фіналізатор не потрібен і об'єкт можна зібрати за одне збирання"],
      ["To stop the GC completely", "Щоб повністю зупинити GC"],
      ["To make Dispose thread-safe", "Щоб зробити Dispose потокобезпечним"],
      ["It is required for `using` to compile", "Без цього `using` не скомпілюється"],
    ],
    "a",
  ),
  question(
    "loh-avoid",
    ["A service allocates a new 1 MB `byte[]` for every request. What helps most?", "Сервіс виділяє новий `byte[]` на 1 МБ для кожного запиту. Що допоможе найбільше?"],
    [
      ["Rent buffers from `ArrayPool<byte>.Shared` and return them", "Брати буфери з `ArrayPool<byte>.Shared` і повертати їх"],
      ["Call `GC.Collect()` after each request", "Викликати `GC.Collect()` після кожного запиту"],
      ["Make the array `static` and share it between threads", "Зробити масив `static` і ділити між потоками"],
      ["Allocate a 2 MB array instead", "Виділяти масив на 2 МБ"],
    ],
    "a",
  ),
]);

const cacheTypes = (get: string) => `class FakeClock
{
    public DateTime Now = new DateTime(2026, 1, 1, 12, 0, 0);
}

class ResponseCache
{
    private class Entry { public string Body; public DateTime StoredAt; }

    private readonly Dictionary<string, Entry> entries = new Dictionary<string, Entry>();
    private readonly FakeClock clock;
    private readonly TimeSpan ttl;
    public int Hits, Misses;

    public ResponseCache(FakeClock clock, TimeSpan ttl) { this.clock = clock; this.ttl = ttl; }

    // Returns the cached body for the url while it is younger than ttl (a hit); otherwise calls produce(),
    // stores the result with the current time and returns it (a miss).
    // The cache key ignores the order of query parameters: "/p?b=2&a=1" and "/p?a=1&b=2" are the same entry.
    public string Get(string url, Func<string> produce)
    {
${get}
    }
}`;

const cacheMain = `        var clock = new FakeClock();
        var cache = new ResponseCache(clock, TimeSpan.FromSeconds(60));
        int version = 0;
        Func<string> render = () => "v" + (++version);

        Console.WriteLine(cache.Get("/products?page=1&size=10", render));
        Console.WriteLine(cache.Get("/products?size=10&page=1", render));
        Console.WriteLine(cache.Get("/products?page=2&size=10", render));
        clock.Now = clock.Now.AddSeconds(30);
        Console.WriteLine(cache.Get("/products?page=1&size=10", render));
        clock.Now = clock.Now.AddSeconds(31);
        Console.WriteLine(cache.Get("/products?page=1&size=10", render));
        Console.WriteLine(cache.Get("/about", render));
        Console.WriteLine(cache.Get("/about", render));
        Console.WriteLine("hits=" + cache.Hits + " misses=" + cache.Misses);`;

export const responseCachePractice = practice("response-cache", "A response cache with expiry and a normalized key", "Кеш відповідей з терміном дії й нормалізованим ключем", {
  starter: PROGRAM_WITH(cacheTypes(stub), cacheMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    cacheTypes(`        string key = Normalize(url);
        Entry entry;
        if (entries.TryGetValue(key, out entry) && clock.Now - entry.StoredAt < ttl)
        {
            Hits++;
            return entry.Body;
        }
        Misses++;
        string body = produce();
        entries[key] = new Entry { Body = body, StoredAt = clock.Now };
        return body;
    }

    static string Normalize(string url)
    {
        int q = url.IndexOf('?');
        if (q < 0) return url;
        var parts = url.Substring(q + 1).Split('&').Where(p => p.Length > 0).OrderBy(p => p, StringComparer.Ordinal);
        return url.Substring(0, q) + "?" + string.Join("&", parts);`),
    cacheMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput: "v1\nv1\nv2\nv1\nv3\nv4\nv4\nhits=3 misses=4\n",
});

const disposeTypes = (dispose: string, disposeBool: string, finalizer: string, derived: string) => `static class NativeApi
{
    public static int OpenHandles;
    public static int Open() { OpenHandles++; return 100 + OpenHandles; }
    public static void Close(int handle) { OpenHandles--; }
}

class FileResource : IDisposable
{
    private readonly int handle;              // unmanaged: must always be closed
    private readonly MemoryStream buffer;     // managed and disposable
    private bool disposed;
    protected readonly List<string> Log;

    public FileResource(List<string> log)
    {
        Log = log;
        handle = NativeApi.Open();
        buffer = new MemoryStream();
    }

    protected bool IsDisposed { get { return disposed; } }

    public void Write(string text)
    {
        if (disposed) throw new ObjectDisposedException(GetType().Name);
        Log.Add("write " + text);
    }

    // Dispose(true), then tell the GC the finalizer is no longer needed.
    public void Dispose()
    {
${dispose}
    }

    // Safe to call twice (the second call does nothing). When disposing is true, dispose the buffer
    // and log "buffer disposed". Always close the handle and log "handle closed". Then mark as disposed.
    protected virtual void Dispose(bool disposing)
    {
${disposeBool}
    }

    // The safety net when nobody called Dispose(): release only the unmanaged handle.
    ~FileResource()
    {
${finalizer}
    }
}

class LoggedResource : FileResource
{
    public LoggedResource(List<string> log) : base(log) { }

    // Do nothing if already disposed; when disposing, log "derived cleanup"; then let the base class finish.
    protected override void Dispose(bool disposing)
    {
${derived}
    }
}

class FinalizerDemo : FileResource
{
    public FinalizerDemo(List<string> log) : base(log) { }
    // Runs exactly what the finalizer would run.
    public void RunFinalizerPath() { Dispose(false); GC.SuppressFinalize(this); }
}`;

const disposeMain = `        var log = new List<string>();
        using (var file = new FileResource(log))
        {
            file.Write("a");
        }
        var logged = new LoggedResource(log);
        logged.Dispose();
        logged.Dispose();
        try { logged.Write("b"); }
        catch (ObjectDisposedException) { log.Add("ObjectDisposedException"); }
        new FinalizerDemo(log).RunFinalizerPath();
        foreach (var line in log) Console.WriteLine(line);
        Console.WriteLine("open handles: " + NativeApi.OpenHandles);`;

export const disposePatternPractice = practice("dispose-pattern", "The full Dispose pattern", "Повний патерн Dispose", {
  starter: PROGRAM_WITH(disposeTypes(stub, stub, "", stub), disposeMain, "using System.Collections.Generic;\nusing System.IO;"),
  solution: PROGRAM_WITH(
    disposeTypes(
      `        Dispose(true);
        GC.SuppressFinalize(this);`,
      `        if (disposed) return;
        if (disposing)
        {
            buffer.Dispose();
            Log.Add("buffer disposed");
        }
        NativeApi.Close(handle);
        Log.Add("handle closed");
        disposed = true;`,
      "        Dispose(false);",
      `        if (IsDisposed) return;
        if (disposing) Log.Add("derived cleanup");
        base.Dispose(disposing);`,
    ),
    disposeMain,
    "using System.Collections.Generic;\nusing System.IO;",
  ),
  expectedOutput:
    "write a\nbuffer disposed\nhandle closed\nderived cleanup\nbuffer disposed\nhandle closed\nObjectDisposedException\nhandle closed\nopen handles: 0\n",
});

/* ---------- Section: data structures (Q83–109) ---------- */

export const middleHashTablesLecture = lecture("middle-hash-tables", "Hash tables from the inside", "Хеш-таблиці зсередини");
export const middleEnumerablesLecture = lecture("middle-enumerables", "IEnumerable, IList, IQueryable, IObservable and friends", "IEnumerable, IList, IQueryable, IObservable та інші");

export const middleCollectionsQuiz2 = quiz("middle-collections-quiz-2", "Collections and hashing, part 2", "Колекції та хешування, частина 2", [
  question(
    "generic-static",
    ["`class Counter<T> { public static int N; }` — `Counter<int>.N = 1; Counter<string>.N = 2;` What is `Counter<int>.N`?", "`class Counter<T> { public static int N; }` — `Counter<int>.N = 1; Counter<string>.N = 2;` Чому дорівнює `Counter<int>.N`?"],
    [
      ["1 — each closed generic type has its own static fields", "1 — кожен закритий generic-тип має власні статичні поля"],
      ["2", "2"],
      ["0", "0"],
      ["Compile error", "Помилка компіляції"],
    ],
    "a",
  ),
  question(
    "reflection-uses",
    ["Which .NET features rely on reflection (or source generators replacing it)?", "Які можливості .NET спираються на рефлексію (або генератори коду, що її замінюють)?"],
    [
      ["JSON serializers", "JSON-серіалізатори"],
      ["DI containers activating constructors", "DI-контейнери, що викликають конструктори"],
      ["Test frameworks discovering `[Fact]` methods", "Тестові фреймворки, що знаходять методи `[Fact]`"],
      ["The `+` operator on ints", "Оператор `+` для int"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "indexer-def",
    ["Which declares an indexer?", "Що з цього оголошує індексатор?"],
    [
      ["`public string this[int i] { get => _items[i]; }`", "`public string this[int i] { get => _items[i]; }`"],
      ["`public string Item(int i)`", "`public string Item(int i)`"],
      ["`public string[] this`", "`public string[] this`"],
      ["`operator [](int i)`", "`operator [](int i)`"],
    ],
    "a",
  ),
  question(
    "readonly-list",
    ["`public IReadOnlyList<int> Items => _items;` where `_items` is a `List<int>`. Is the object truly immutable?", "`public IReadOnlyList<int> Items => _items;`, де `_items` — `List<int>`. Чи об'єкт справді незмінний?"],
    [
      ["Yes", "Так"],
      ["No: a caller can cast back to `List<int>`, and the class itself can still change the list; use `ImmutableList` or a copy for real immutability", "Ні: викликач може привести назад до `List<int>`, а сам клас усе ще може змінювати список; для справжньої незмінності — `ImmutableList` або копія"],
      ["Only in Release builds", "Лише в Release-збірках"],
      ["Only for value types", "Лише для типів значень"],
    ],
    "b",
  ),
  question(
    "bst-degenerate",
    ["You insert 1, 2, 3, …, 1000 in order into a plain (unbalanced) binary search tree. Search becomes…", "Ви вставляєте 1, 2, 3, …, 1000 по порядку у звичайне (незбалансоване) двійкове дерево пошуку. Пошук стає…"],
    [
      ["O(log n)", "O(log n)"],
      ["O(n): the tree degenerates into a linked list", "O(n): дерево вироджується у зв'язний список"],
      ["O(1)", "O(1)"],
      ["O(n²)", "O(n²)"],
    ],
    "b",
  ),
  question(
    "equals-hashcode",
    ["You override `Equals` on a class used as a dictionary key but not `GetHashCode`. What happens?", "Ви перевизначили `Equals` у класі-ключі словника, але не `GetHashCode`. Що станеться?"],
    [
      ["Equal keys may land in different buckets, so lookups fail; the compiler warns", "Рівні ключі можуть потрапити в різні кошики, тож пошук не знаходить; компілятор попереджає"],
      ["Everything works", "Усе працює"],
      ["Compile error", "Помилка компіляції"],
      ["The dictionary throws on Add", "Словник кидає виняток на Add"],
    ],
    "a",
  ),
  question(
    "load-factor",
    ["Why does a hash table resize when it gets full?", "Чому хеш-таблиця збільшується, коли заповнюється?"],
    [
      ["To keep chains short, so operations stay O(1) on average", "Щоб ланцюжки лишалися короткими, а операції — O(1) у середньому"],
      ["To sort the keys", "Щоб відсортувати ключі"],
      ["To free memory", "Щоб звільнити пам'ять"],
      ["Because arrays can't hold more than 16 items", "Бо масиви не вміщують понад 16 елементів"],
    ],
    "a",
  ),
  question(
    "hash-flooding",
    ["Why do .NET Core string hash codes differ between process runs?", "Чому хеш-коди рядків у .NET Core різняться між запусками процесу?"],
    [
      ["Randomized hashing protects against hash-flooding attacks (many colliding keys sent by an attacker)", "Рандомізоване хешування захищає від атак hash flooding (зловмисник надсилає багато ключів із колізіями)"],
      ["It's a bug", "Це баг"],
      ["To make dictionaries sorted", "Щоб словники були відсортованими"],
      ["Because of garbage collection", "Через збирання сміття"],
    ],
    "a",
  ),
  question(
    "array-covariance",
    ["`object[] arr = new string[2]; arr[0] = 42;` What happens?", "`object[] arr = new string[2]; arr[0] = 42;` Що станеться?"],
    [
      ["It works", "Працює"],
      ["`ArrayTypeMismatchException` at run time — array covariance is checked on every write", "`ArrayTypeMismatchException` під час виконання — коваріантність масивів перевіряється на кожному записі"],
      ["Compile error", "Помилка компіляції"],
      ["The array becomes `object[]`", "Масив стає `object[]`"],
    ],
    "b",
  ),
  question(
    "ienumerable-param",
    ["A method only loops over its input once. Which parameter type is best?", "Метод лише раз перебирає вхідні дані. Який тип параметра найкращий?"],
    [
      ["`IEnumerable<T>` — accepts arrays, lists, sets and lazy sequences", "`IEnumerable<T>` — приймає масиви, списки, множини й ліниві послідовності"],
      ["`List<T>`", "`List<T>`"],
      ["`T[]`", "`T[]`"],
      ["`ArrayList`", "`ArrayList`"],
    ],
    "a",
  ),
  question(
    "iqueryable-client",
    ["`db.Orders.AsEnumerable().Where(o => o.Total > 100).Take(10)` — where does filtering happen?", "`db.Orders.AsEnumerable().Where(o => o.Total > 100).Take(10)` — де відбувається фільтрація?"],
    [
      ["In SQL", "У SQL"],
      ["In memory: the whole Orders table is streamed to the app first", "У пам'яті: спершу вся таблиця Orders передається в застосунок"],
      ["Nowhere", "Ніде"],
      ["In Redis", "У Redis"],
    ],
    "b",
  ),
  question(
    "async-enumerable",
    ["When is `IAsyncEnumerable<T>` the right return type?", "Коли `IAsyncEnumerable<T>` — правильний тип повернення?"],
    [
      ["When items arrive over time from I/O (DB rows, paged API) and you want to process them as they come without blocking", "Коли елементи надходять із часом з I/O (рядки БД, сторінки API) і ви хочете обробляти їх одразу без блокування"],
      ["For an in-memory array", "Для масиву в пам'яті"],
      ["Instead of every `Task<List<T>>`", "Замість кожного `Task<List<T>>`"],
      ["Only for UI events", "Лише для подій UI"],
    ],
    "a",
  ),
  question(
    "flags-none",
    ["Why should a `[Flags]` enum define `None = 0`?", "Навіщо `[Flags]`-переліку значення `None = 0`?"],
    [
      ["`default` of any enum is 0; `None` names the \"no flags\" state, and `HasFlag(0)` is always true so it can't be a real flag", "`default` будь-якого переліку — 0; `None` дає назву стану «без прапорців», а `HasFlag(0)` завжди true, тож 0 не може бути справжнім прапорцем"],
      ["The compiler requires it", "Цього вимагає компілятор"],
      ["It makes the enum smaller", "Це робить перелік меншим"],
      ["To allow negative values", "Щоб дозволити від'ємні значення"],
    ],
    "a",
  ),
]);

const mapTypes = (put: string, tryGet: string, remove: string, longest: string) => `class SimpleHashMap<TKey, TValue>
{
    private class Entry
    {
        public TKey Key;
        public TValue Value;
        public Entry Next;
    }

    private Entry[] buckets = new Entry[4];
    public int Count { get; private set; }
    public int Capacity { get { return buckets.Length; } }

    private static int BucketOf(TKey key, int size) { return (key.GetHashCode() & 0x7FFFFFFF) % size; }

    // Adds a new key or replaces the value of an existing one (chaining: a linked list per bucket).
    // After adding a NEW key, if Count > Capacity * 3 / 4, double the number of buckets and rehash every entry.
    public void Put(TKey key, TValue value)
    {
${put}
    }

    public bool TryGet(TKey key, out TValue value)
    {
${tryGet}
    }

    // Removes the key; false if it was not there.
    public bool Remove(TKey key)
    {
${remove}
    }

    // The length of the longest chain: 1 is ideal, Count is the worst case.
    public int LongestChain()
    {
${longest}
    }
}

class BadKey
{
    public readonly string Name;
    public BadKey(string name) { Name = name; }
    public override int GetHashCode() { return 42; }   // every key collides
    public override bool Equals(object obj) { var other = obj as BadKey; return other != null && other.Name == Name; }
}`;

const mapMain = `        var map = new SimpleHashMap<string, int>();
        for (int i = 0; i < 20; i++) map.Put("k" + i, i);
        Console.WriteLine(map.Count + " " + map.Capacity);
        map.Put("k5", 500);
        int value;
        map.TryGet("k5", out value);
        Console.WriteLine(map.Count + " " + value);
        Console.WriteLine(map.TryGet("nope", out value));
        Console.WriteLine(map.Remove("k0") + " " + map.Remove("k0") + " " + map.Count);
        Console.WriteLine(map.TryGet("k19", out value) + " " + value);

        var bad = new SimpleHashMap<BadKey, string>();
        foreach (var name in new[] { "a", "b", "c", "d", "e" }) bad.Put(new BadKey(name), name.ToUpper());
        string found;
        bad.TryGet(new BadKey("c"), out found);
        Console.WriteLine(bad.Count + " " + bad.Capacity + " " + bad.LongestChain() + " " + found);
        bad.Remove(new BadKey("a"));
        Console.WriteLine(bad.LongestChain() + " " + bad.TryGet(new BadKey("a"), out found));`;

export const hashMapPractice = practice("own-hash-map", "Your own hash map with chaining", "Власна хеш-таблиця з ланцюжками", {
  starter: PROGRAM_WITH(mapTypes(stub, stub, stub, stub), mapMain),
  solution: PROGRAM_WITH(
    mapTypes(
      `        int b = BucketOf(key, buckets.Length);
        for (var e = buckets[b]; e != null; e = e.Next)
        {
            if (Equals(e.Key, key)) { e.Value = value; return; }
        }
        buckets[b] = new Entry { Key = key, Value = value, Next = buckets[b] };
        Count++;
        if (Count > buckets.Length * 3 / 4) Resize();
    }

    private void Resize()
    {
        var old = buckets;
        buckets = new Entry[old.Length * 2];
        foreach (var head in old)
        {
            for (var e = head; e != null; )
            {
                var next = e.Next;
                int b = BucketOf(e.Key, buckets.Length);
                e.Next = buckets[b];
                buckets[b] = e;
                e = next;
            }
        }`,
      `        for (var e = buckets[BucketOf(key, buckets.Length)]; e != null; e = e.Next)
        {
            if (Equals(e.Key, key)) { value = e.Value; return true; }
        }
        value = default(TValue);
        return false;`,
      `        int b = BucketOf(key, buckets.Length);
        Entry previous = null;
        for (var e = buckets[b]; e != null; previous = e, e = e.Next)
        {
            if (!Equals(e.Key, key)) continue;
            if (previous == null) buckets[b] = e.Next; else previous.Next = e.Next;
            Count--;
            return true;
        }
        return false;`,
      `        int longest = 0;
        foreach (var head in buckets)
        {
            int length = 0;
            for (var e = head; e != null; e = e.Next) length++;
            longest = Math.Max(longest, length);
        }
        return longest;`,
    ),
    mapMain,
  ),
  expectedOutput: "20 32\n20 500\nFalse\nTrue False 19\nTrue 19\n5 8 5 C\n4 False\n",
});

const bstTypes = (insert: string, height: string, balanced: string, inOrder: string, rebalance: string) => `class Node
{
    public int Value;
    public Node Left, Right;
    public Node(int value) { Value = value; }
}

class Bst
{
    public Node Root;

    // A binary search tree: smaller values go left, larger go right; duplicates are ignored.
    public void Insert(int value)
    {
${insert}
    }

    // The number of levels: 0 for an empty tree, 1 for a single node.
    public int Height()
    {
${height}
    }

    // True when, for EVERY node, the heights of its two subtrees differ by at most 1.
    public bool IsBalanced()
    {
${balanced}
    }

    // The values in ascending order.
    public List<int> InOrder()
    {
${inOrder}
    }

    // Rebuilds a perfectly balanced tree from the sorted values: the middle value becomes the root, recursively.
    public void Rebalance()
    {
${rebalance}
    }
}`;

const bstMain = `        var tree = new Bst();
        for (int i = 1; i <= 7; i++) tree.Insert(i);
        tree.Insert(4);
        Console.WriteLine(string.Join(" ", tree.InOrder()));
        Console.WriteLine("height " + tree.Height() + ", balanced " + tree.IsBalanced());
        tree.Rebalance();
        Console.WriteLine("height " + tree.Height() + ", balanced " + tree.IsBalanced() + ", root " + tree.Root.Value);
        Console.WriteLine(string.Join(" ", tree.InOrder()));

        var other = new Bst();
        foreach (int v in new[] { 5, 3, 8, 1, 4, 9 }) other.Insert(v);
        Console.WriteLine("height " + other.Height() + ", balanced " + other.IsBalanced());
        other.Insert(10);
        other.Insert(11);
        Console.WriteLine("height " + other.Height() + ", balanced " + other.IsBalanced());
        Console.WriteLine("empty: height " + new Bst().Height() + ", balanced " + new Bst().IsBalanced());`;

export const bstPractice = practice("bst-balance", "Tree balancing: height, check and rebuild", "Балансування дерева: висота, перевірка й перебудова", {
  starter: PROGRAM_WITH(bstTypes(stub, stub, stub, stub, stub), bstMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    bstTypes(
      `        if (Root == null) { Root = new Node(value); return; }
        var current = Root;
        while (true)
        {
            if (value == current.Value) return;
            if (value < current.Value)
            {
                if (current.Left == null) { current.Left = new Node(value); return; }
                current = current.Left;
            }
            else
            {
                if (current.Right == null) { current.Right = new Node(value); return; }
                current = current.Right;
            }
        }`,
      `        return HeightOf(Root);
    }

    static int HeightOf(Node node)
    {
        return node == null ? 0 : 1 + Math.Max(HeightOf(node.Left), HeightOf(node.Right));`,
      `        return CheckedHeight(Root) >= 0;
    }

    // The height of a balanced subtree, or -1 as soon as an unbalanced node is found.
    static int CheckedHeight(Node node)
    {
        if (node == null) return 0;
        int left = CheckedHeight(node.Left);
        if (left < 0) return -1;
        int right = CheckedHeight(node.Right);
        if (right < 0) return -1;
        if (Math.Abs(left - right) > 1) return -1;
        return 1 + Math.Max(left, right);`,
      `        var result = new List<int>();
        Walk(Root, result);
        return result;
    }

    static void Walk(Node node, List<int> result)
    {
        if (node == null) return;
        Walk(node.Left, result);
        result.Add(node.Value);
        Walk(node.Right, result);`,
      `        Root = Build(InOrder(), 0, InOrder().Count - 1);
    }

    static Node Build(List<int> values, int from, int to)
    {
        if (from > to) return null;
        int middle = (from + to) / 2;
        var node = new Node(values[middle]);
        node.Left = Build(values, from, middle - 1);
        node.Right = Build(values, middle + 1, to);
        return node;`,
    ),
    bstMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "1 2 3 4 5 6 7\nheight 7, balanced False\nheight 3, balanced True, root 4\n1 2 3 4 5 6 7\nheight 3, balanced True\nheight 5, balanced False\nempty: height 0, balanced True\n",
});

/* ---------- Section: databases and parallelism (Q110–121) ---------- */

export const middleNormalizationLecture = lecture("middle-normalization-example", "Normalizing a table step by step, and reading a plan", "Нормалізуємо таблицю крок за кроком і читаємо план");
export const middleThreadPoolLecture = lecture("middle-threadpool-async", "Async under load: the thread pool, ConfigureAwait and deadlocks", "Async під навантаженням: пул потоків, ConfigureAwait і взаємні блокування");

export const middleDbQuiz2 = quiz("middle-db-parallelism-quiz-2", "Databases and parallelism, part 2", "Бази даних і паралелізм, частина 2", [
  question(
    "1nf",
    ["A column `phones = '067-111, 050-222'` violates…", "Колонка `phones = '067-111, 050-222'` порушує…"],
    [
      ["1NF: values must be atomic; move phones to their own table", "1НФ: значення мають бути атомарними; телефони — в окрему таблицю"],
      ["3NF only", "Лише 3НФ"],
      ["Nothing", "Нічого"],
      ["ACID", "ACID"],
    ],
    "a",
  ),
  question(
    "composite-order",
    ["An index on `(last_name, first_name)`. Which query can seek on it?", "Індекс на `(last_name, first_name)`. Який запит може використати його для пошуку (seek)?"],
    [
      ["`WHERE last_name = 'Koval'`", "`WHERE last_name = 'Koval'`"],
      ["`WHERE first_name = 'Olena'` alone", "Лише `WHERE first_name = 'Olena'`"],
      ["`WHERE last_name = 'Koval' AND first_name = 'Olena'`", "`WHERE last_name = 'Koval' AND first_name = 'Olena'`"],
      ["`WHERE upper(last_name) = 'KOVAL'`", "`WHERE upper(last_name) = 'KOVAL'`"],
    ],
    ["a", "c"],
  ),
  question(
    "covering",
    ["What is a covering index?", "Що таке покривний індекс?"],
    [
      ["An index that contains every column the query needs (key + INCLUDE), so the table itself isn't read", "Індекс, що містить усі потрібні запиту колонки (ключ + INCLUDE), тож саму таблицю не читають"],
      ["An index on every column", "Індекс на кожну колонку"],
      ["A clustered index", "Кластерний індекс"],
      ["An index with a WHERE filter", "Індекс із фільтром WHERE"],
    ],
    "a",
  ),
  question(
    "phantom",
    ["A transaction runs `SELECT count(*) FROM orders WHERE status='new'` twice and gets 5, then 6, because another transaction inserted a row. This is…", "Транзакція двічі виконує `SELECT count(*) FROM orders WHERE status='new'` і отримує 5, потім 6, бо інша транзакція вставила рядок. Це…"],
    [
      ["A dirty read", "Брудне читання"],
      ["A phantom read", "Фантомне читання"],
      ["A lost update", "Втрачене оновлення"],
      ["A deadlock", "Взаємне блокування"],
    ],
    "b",
  ),
  question(
    "key-lookup",
    ["The plan shows an index seek followed by thousands of key lookups. Typical fix?", "План показує index seek, а за ним тисячі key lookup. Типове виправлення?"],
    [
      ["Add the selected columns to the index with INCLUDE (make it covering)", "Додати вибрані колонки в індекс через INCLUDE (зробити його покривним)"],
      ["Drop all indexes", "Видалити всі індекси"],
      ["Use `SELECT *`", "Використати `SELECT *`"],
      ["Switch to READ UNCOMMITTED", "Перейти на READ UNCOMMITTED"],
    ],
    "a",
  ),
  question(
    "n-plus-one",
    ["`foreach (var o in db.Orders.ToList()) Console.WriteLine(o.Customer.Name);` with lazy loading. What's the problem?", "`foreach (var o in db.Orders.ToList()) Console.WriteLine(o.Customer.Name);` з лінивим завантаженням. У чому проблема?"],
    [
      ["N+1 queries: one for orders plus one per order for its customer; use `Include` or a projection", "N+1 запитів: один на замовлення й ще по одному на клієнта для кожного; використайте `Include` або проєкцію"],
      ["It doesn't compile", "Не скомпілюється"],
      ["Customers are never loaded", "Клієнти ніколи не завантажуються"],
      ["Nothing", "Нічого"],
    ],
    "a",
  ),
  question(
    "ef-raw",
    ["Which EF Core calls are safe from SQL injection?", "Які виклики EF Core захищені від SQL-ін'єкцій?"],
    [
      ["LINQ queries (parameters are generated)", "LINQ-запити (параметри генеруються)"],
      ["`FromSql($\"... WHERE id = {id}\")` — interpolation becomes a parameter", "`FromSql($\"... WHERE id = {id}\")` — інтерполяція стає параметром"],
      ["`FromSqlRaw(\"... WHERE name = '\" + name + \"'\")`", "`FromSqlRaw(\"... WHERE name = '\" + name + \"'\")`"],
      ["Both raw concatenation and LINQ", "І конкатенація, і LINQ"],
    ],
    ["a", "b"],
  ),
  question(
    "sync-over-async",
    ["Why is `Task.Run(() => DoAsync()).Result` in an ASP.NET Core controller still bad?", "Чому `Task.Run(() => DoAsync()).Result` у контролері ASP.NET Core все одно погано?"],
    [
      ["It blocks a request thread AND uses another pool thread: under load this causes thread-pool starvation", "Він блокує потік запиту ТА займає ще один потік пулу: під навантаженням це спричиняє голодування пулу"],
      ["It deadlocks every time", "Він щоразу спричиняє взаємне блокування"],
      ["It doesn't compile", "Не скомпілюється"],
      ["Nothing is wrong", "Усе гаразд"],
    ],
    "a",
  ),
  question(
    "valuetask",
    ["When is `ValueTask<T>` useful?", "Коли корисний `ValueTask<T>`?"],
    [
      ["When the method usually completes synchronously (e.g. a cache hit), to avoid allocating a Task", "Коли метод зазвичай завершується синхронно (наприклад, влучання в кеш), щоб не виділяти Task"],
      ["Always instead of Task", "Завжди замість Task"],
      ["When you need to await the result several times", "Коли результат треба чекати кілька разів"],
      ["For CPU-bound work", "Для роботи, обмеженої процесором"],
    ],
    "a",
  ),
  question(
    "min-threads",
    ["A service that blocks threads suffers slow ramp-up under bursts. A stop-gap (not a fix)?", "Сервіс, що блокує потоки, повільно розганяється під сплесками. Тимчасовий захід (не виправлення)?"],
    [
      ["`ThreadPool.SetMinThreads` to a higher value so threads are created without the injection delay", "`ThreadPool.SetMinThreads` із більшим значенням, щоб потоки створювалися без затримки додавання"],
      ["`GC.Collect()`", "`GC.Collect()`"],
      ["`Thread.Sleep` before each request", "`Thread.Sleep` перед кожним запитом"],
      ["Reducing the stack size", "Зменшити розмір стеку"],
    ],
    "a",
  ),
]);

export const normalizeOrdersPractice: SlideDef = {
  kind: "practice",
  slug: "normalize-orders",
  title: { en: "Practice: From a flat table to 3NF", uk: "Практика «Від пласкої таблиці до 3НФ»" },
  language: "sql",
  setup: `-- Everything in one flat table: customers and products repeat on every row.
CREATE TABLE order_rows (
    order_id       integer NOT NULL,
    order_date     date NOT NULL,
    customer_email text NOT NULL,
    customer_name  text NOT NULL,
    customer_city  text NOT NULL,
    product_sku    text NOT NULL,
    product_name   text NOT NULL,
    unit_price     numeric(10, 2) NOT NULL,
    quantity       integer NOT NULL
);

INSERT INTO order_rows VALUES
    (1, '2026-03-01', 'olena@example.com', 'Olena Koval', 'Lviv', 'KB-01', 'Keyboard', 49.90, 1),
    (1, '2026-03-01', 'olena@example.com', 'Olena Koval', 'Lviv', 'MS-02', 'Mouse', 19.90, 2),
    (2, '2026-03-02', 'taras@example.com', 'Taras Melnyk', 'Kyiv', 'MS-02', 'Mouse', 19.90, 1),
    (3, '2026-03-05', 'olena@example.com', 'Olena Koval', 'Lviv', 'MN-27', 'Monitor 27"', 289.00, 1),
    (4, '2026-03-06', 'iryna@example.com', 'Iryna Bondar', 'Odesa', 'KB-01', 'Keyboard', 49.90, 3),
    (4, '2026-03-06', 'iryna@example.com', 'Iryna Bondar', 'Odesa', 'MN-27', 'Monitor 27"', 289.00, 1);
`,
  starter: "-- Create customers, products, orders and order_items, fill them from order_rows,\n-- then run the two check queries from the task.\n",
  solution: `CREATE TABLE customers (
    id    serial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    name  text NOT NULL,
    city  text NOT NULL
);

CREATE TABLE products (
    sku   text PRIMARY KEY,
    name  text NOT NULL,
    price numeric(10, 2) NOT NULL
);

CREATE TABLE orders (
    id          integer PRIMARY KEY,
    order_date  date NOT NULL,
    customer_id integer NOT NULL REFERENCES customers (id)
);

CREATE TABLE order_items (
    order_id    integer NOT NULL REFERENCES orders (id),
    product_sku text NOT NULL REFERENCES products (sku),
    quantity    integer NOT NULL,
    PRIMARY KEY (order_id, product_sku)
);

INSERT INTO customers (email, name, city)
SELECT DISTINCT customer_email, customer_name, customer_city FROM order_rows ORDER BY customer_email;

INSERT INTO products (sku, name, price)
SELECT DISTINCT product_sku, product_name, unit_price FROM order_rows;

INSERT INTO orders (id, order_date, customer_id)
SELECT DISTINCT r.order_id, r.order_date, c.id
FROM order_rows r JOIN customers c ON c.email = r.customer_email;

INSERT INTO order_items (order_id, product_sku, quantity)
SELECT order_id, product_sku, quantity FROM order_rows;

SELECT (SELECT count(*) FROM customers) AS customers,
       (SELECT count(*) FROM products) AS products,
       (SELECT count(*) FROM orders) AS orders,
       (SELECT count(*) FROM order_items) AS items;

SELECT c.name, count(DISTINCT o.id) AS orders, sum(i.quantity * p.price) AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items i ON i.order_id = o.id
JOIN products p ON p.sku = i.product_sku
GROUP BY c.id, c.name
ORDER BY spent DESC;
`,
  expectedOutput: " customers | products | orders | items\n-----------+----------+--------+-------\n         3 |        3 |      4 |     6\n(1 row)\n\n     name     | orders | spent\n--------------+--------+--------\n Iryna Bondar |      1 | 438.70\n Olena Koval  |      2 | 378.70\n Taras Melnyk |      1 |  19.90\n(3 rows)\n",
  maxScore: 5,
};

/* ---------- Practical tasks ---------- */

const outboxTypes = (handle: string, place: string, run: string) => `class OutboxMessage
{
    public string Body;
    public bool Sent;
}

class Db
{
    public readonly List<int> Orders = new List<int>();
    public readonly List<OutboxMessage> Outbox = new List<OutboxMessage>();

    // Runs the action as one transaction: if it throws, everything it added is rolled back.
    public void InTransaction(Action action)
    {
        int orders = Orders.Count, outbox = Outbox.Count;
        try
        {
            action();
        }
        catch
        {
            Orders.RemoveRange(orders, Orders.Count - orders);
            Outbox.RemoveRange(outbox, Outbox.Count - outbox);
            throw;
        }
    }
}

class Consumer
{
    private readonly HashSet<string> seen = new HashSet<string>();
    public readonly List<string> Handled = new List<string>();

    // Delivery is at-least-once: add each DISTINCT message to Handled once, ignore repeats.
    public void Handle(string message)
    {
${handle}
    }
}

class Broker
{
    private readonly Consumer consumer;
    public int FailNext, LoseAckNext, Deliveries;
    public Broker(Consumer consumer) { this.consumer = consumer; }

    public void Publish(string message)
    {
        if (FailNext > 0) { FailNext--; throw new TimeoutException("broker unavailable"); }
        Deliveries++;
        consumer.Handle(message);
        if (LoseAckNext > 0) { LoseAckNext--; throw new TimeoutException("ack lost"); }
    }
}

static class OrderService
{
    // Saves the order id AND the outbox message "OrderPlaced:<id>" in ONE transaction (db.InTransaction).
    // When failAfterSave is true, throw InvalidOperationException after adding both (a crash before commit).
    public static void PlaceOrder(Db db, int id, bool failAfterSave)
    {
${place}
    }
}

static class OutboxRelay
{
    // Publishes the unsent messages in order and marks each one Sent only after Publish returned.
    // If Publish throws, stop: the rest waits for the next run. Returns how many messages were marked sent.
    public static int RunOnce(Db db, Broker broker)
    {
${run}
    }
}`;

const outboxMain = `        var db = new Db();
        var consumer = new Consumer();
        var broker = new Broker(consumer);

        OrderService.PlaceOrder(db, 1, false);
        OrderService.PlaceOrder(db, 2, false);
        try { OrderService.PlaceOrder(db, 3, true); }
        catch (InvalidOperationException) { Console.WriteLine("order 3 failed"); }
        Console.WriteLine("orders: " + string.Join(",", db.Orders) + ", outbox: " + db.Outbox.Count);

        broker.FailNext = 1;
        Console.WriteLine("run 1: " + OutboxRelay.RunOnce(db, broker));
        broker.LoseAckNext = 1;
        Console.WriteLine("run 2: " + OutboxRelay.RunOnce(db, broker));
        Console.WriteLine("run 3: " + OutboxRelay.RunOnce(db, broker));
        Console.WriteLine("run 4: " + OutboxRelay.RunOnce(db, broker));
        Console.WriteLine("deliveries: " + broker.Deliveries);
        Console.WriteLine("handled: " + string.Join(", ", consumer.Handled));`;

export const outboxPractice = practice("outbox-relay", "A transactional outbox with an idempotent consumer", "Transactional outbox з ідемпотентним споживачем", {
  starter: PROGRAM_WITH(outboxTypes(stub, stub, stub), outboxMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    outboxTypes(
      "        if (seen.Add(message)) Handled.Add(message);",
      `        db.InTransaction(() =>
        {
            db.Orders.Add(id);
            db.Outbox.Add(new OutboxMessage { Body = "OrderPlaced:" + id });
            if (failAfterSave) throw new InvalidOperationException("crash before commit");
        });`,
      `        int sent = 0;
        foreach (var message in db.Outbox)
        {
            if (message.Sent) continue;
            try
            {
                broker.Publish(message.Body);
            }
            catch (Exception)
            {
                return sent;
            }
            message.Sent = true;
            sent++;
        }
        return sent;`,
    ),
    outboxMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "order 3 failed\norders: 1,2, outbox: 2\nrun 1: 0\nrun 2: 0\nrun 3: 2\nrun 4: 0\ndeliveries: 3\nhandled: OrderPlaced:1, OrderPlaced:2\n",
});
