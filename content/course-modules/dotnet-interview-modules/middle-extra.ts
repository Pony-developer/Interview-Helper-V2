import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { SlideDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";

const stub = "        throw new NotImplementedException();";

/* ---------- middle-general ---------- */

const bucketTypes = (fields: string, tryTake: string, handle: string) => `class FakeClock { public DateTime Now = new DateTime(2026, 1, 1); }

class TokenBucket
{
    private readonly FakeClock clock;
    private readonly int capacity;
    private readonly double refillPerSecond;
${fields}
    // The bucket starts full.
    public TokenBucket(FakeClock clock, int capacity, double refillPerSecond)
    {
        this.clock = clock;
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
        tokens = capacity;
        lastRefill = clock.Now;
    }

    // First add the tokens earned since the last refill (elapsed seconds * refillPerSecond, never above capacity),
    // then take one token if at least one is available. Returns whether the request is allowed.
    public bool TryTake()
    {
${tryTake}
    }
}

class RateLimiter
{
    private readonly Dictionary<string, TokenBucket> buckets = new Dictionary<string, TokenBucket>();
    private readonly FakeClock clock;
    private readonly int capacity;
    private readonly double refill;
    public RateLimiter(FakeClock clock, int capacity, double refill) { this.clock = clock; this.capacity = capacity; this.refill = refill; }

    // One bucket per client: "200" when allowed, "429" (Too Many Requests) otherwise.
    public string Handle(string client)
    {
${handle}
    }
}`;

const bucketMain = `        var clock = new FakeClock();
        var limiter = new RateLimiter(clock, 3, 1.0);
        Action<string, string, int> burst = (label, client, n) =>
        {
            var codes = new List<string>();
            for (int i = 0; i < n; i++) codes.Add(limiter.Handle(client));
            Console.WriteLine(label + " " + client + ": " + string.Join(" ", codes));
        };
        burst("t=0", "A", 4);
        burst("t=0", "B", 1);
        clock.Now = clock.Now.AddSeconds(1.5);
        burst("t=1.5", "A", 2);
        clock.Now = clock.Now.AddSeconds(0.5);
        burst("t=2", "A", 2);
        clock.Now = clock.Now.AddSeconds(10);
        burst("t=12", "A", 4);`;

export const tokenBucketPractice = practice("token-bucket", "A token-bucket rate limiter", "Обмежувач частоти «відро з токенами»", {
  starter: PROGRAM_WITH(bucketTypes("    private double tokens;\n    private DateTime lastRefill;\n", stub, stub), bucketMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    bucketTypes(
      "    private double tokens;\n    private DateTime lastRefill;\n",
      `        double elapsed = (clock.Now - lastRefill).TotalSeconds;
        tokens = Math.Min(capacity, tokens + elapsed * refillPerSecond);
        lastRefill = clock.Now;
        if (tokens < 1) return false;
        tokens -= 1;
        return true;`,
      `        TokenBucket bucket;
        if (!buckets.TryGetValue(client, out bucket))
        {
            bucket = new TokenBucket(clock, capacity, refill);
            buckets[client] = bucket;
        }
        return bucket.TryTake() ? "200" : "429";`,
    ),
    bucketMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput: "t=0 A: 200 200 200 429\nt=0 B: 200\nt=1.5 A: 200 429\nt=2 A: 200 429\nt=12 A: 200 200 200 429\n",
});

export const middleGeneralExtras: SlideDef[] = [
  lecture("middle-http-deep", "HTTP in depth: versions, caching, cookies and auth", "HTTP глибше: версії, кешування, cookies та автентифікація"),
  quiz("middle-general-quiz-3", "HTTP, SOLID and distributed systems, part 3", "HTTP, SOLID і розподілені системи, частина 3", [
    question(
      "http2",
      ["What does HTTP/2 add over HTTP/1.1?", "Що HTTP/2 додає порівняно з HTTP/1.1?"],
      [
        ["Multiplexing many requests over one connection", "Мультиплексування багатьох запитів в одному з'єднанні"],
        ["Binary framing and header compression (HPACK)", "Бінарні фрейми й стиснення заголовків (HPACK)"],
        ["Server push / stream prioritization", "Server push / пріоритезацію потоків"],
        ["It removes the need for TLS certificates", "Він прибирає потребу в TLS-сертифікатах"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "http3",
      ["HTTP/3 runs over…", "HTTP/3 працює поверх…"],
      [
        ["QUIC on UDP, avoiding TCP head-of-line blocking", "QUIC на UDP, уникаючи блокування «голови черги» в TCP"],
        ["TCP with a new port", "TCP з новим портом"],
        ["WebSockets", "WebSocket"],
        ["SMTP", "SMTP"],
      ],
      "a",
    ),
    question(
      "cache-control",
      ["`Cache-Control: no-cache` means…", "`Cache-Control: no-cache` означає…"],
      [
        ["The response may be stored but must be revalidated with the server before each use", "Відповідь можна зберегти, але перед кожним використанням її треба перевірити на сервері"],
        ["Never store it anywhere", "Ніде не зберігати"],
        ["Cache forever", "Кешувати назавжди"],
        ["Only proxies may cache it", "Кешувати можуть лише проксі"],
      ],
      "a",
    ),
    question(
      "jwt",
      ["Which statements about JWTs are true?", "Які твердження про JWT правильні?"],
      [
        ["The payload is Base64Url-encoded, not encrypted — anyone can read it", "Payload закодовано Base64Url, а не зашифровано — його може прочитати будь-хто"],
        ["The signature lets the server verify the token wasn't changed", "Підпис дає серверу перевірити, що токен не змінювали"],
        ["A JWT can't be revoked before it expires without extra machinery (short lifetimes + refresh tokens, deny lists)", "JWT не відкликати до спливання без додаткових механізмів (короткий час життя + refresh-токени, списки заборон)"],
        ["JWTs must be stored in the database on every request", "JWT треба зберігати в базі на кожному запиті"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "oauth-oidc",
      ["OAuth 2.0 vs OpenID Connect?", "OAuth 2.0 чи OpenID Connect?"],
      [
        ["OAuth 2.0 is for authorization (access tokens to call APIs); OIDC adds authentication on top (an ID token about who the user is)", "OAuth 2.0 — для авторизації (access-токени для виклику API); OIDC додає зверху автентифікацію (ID-токен про те, хто користувач)"],
        ["They are the same", "Це одне й те саме"],
        ["OIDC replaces HTTPS", "OIDC замінює HTTPS"],
        ["OAuth is only for mobile apps", "OAuth лише для мобільних застосунків"],
      ],
      "a",
    ),
    question(
      "rate-limit-status",
      ["Which status code and header tell a client it's sending too many requests?", "Який код статусу й заголовок кажуть клієнту, що він надсилає забагато запитів?"],
      [
        ["429 Too Many Requests with `Retry-After`", "429 Too Many Requests з `Retry-After`"],
        ["503 with `Location`", "503 з `Location`"],
        ["400 with `ETag`", "400 з `ETag`"],
        ["302 with `Set-Cookie`", "302 з `Set-Cookie`"],
      ],
      "a",
    ),
    question(
      "ocp-plugins",
      ["A payment module must support new providers without editing existing code. Which design helps?", "Платіжний модуль має підтримувати нових провайдерів без змін наявного коду. Який дизайн допоможе?"],
      [
        ["An `IPaymentProvider` interface, one class per provider, registered in DI and chosen by key", "Інтерфейс `IPaymentProvider`, по класу на провайдера, зареєстровані в DI й обрані за ключем"],
        ["A `switch` on the provider name", "`switch` за назвою провайдера"],
        ["One static class with all providers", "Один статичний клас з усіма провайдерами"],
        ["Copy the module per provider", "Копія модуля на кожного провайдера"],
      ],
      "a",
    ),
    question(
      "eventual",
      ["What does \"eventual consistency\" mean?", "Що означає «кінцева узгодженість» (eventual consistency)?"],
      [
        ["If no new updates happen, all replicas/services converge to the same state after some time; reads may be stale meanwhile", "Якщо нових оновлень немає, усі репліки/сервіси з часом зійдуться до одного стану; тим часом читання можуть бути застарілими"],
        ["Data is never consistent", "Дані ніколи не узгоджені"],
        ["Every read sees the latest write", "Кожне читання бачить останній запис"],
        ["Transactions are always serializable", "Транзакції завжди серіалізовні"],
      ],
      "a",
    ),
  ]),
  tokenBucketPractice,
];

/* ---------- middle-platform ---------- */

const configTypes = (build: string, bind: string) => `class SmtpOptions
{
    public string Host;
    public int Port;
    public bool UseSsl;
}

static class Config
{
    // Merges three layers; a later layer overrides an earlier one. Keys are case-insensitive
    // (keep the spelling of the first occurrence).
    //   json: "Section:Key=Value" lines; empty lines and lines starting with '#' are skipped
    //   env:  only variables starting with "APP_"; strip the prefix; "__" stands for ":"
    //   args: "--Section:Key=Value"
    public static Dictionary<string, string> Build(string[] json, string[] env, string[] args)
    {
${build}
    }

    // Binds the "Smtp" section: Host is required (InvalidOperationException("Smtp:Host is required")),
    // Port defaults to 25, UseSsl defaults to false.
    public static SmtpOptions BindSmtp(Dictionary<string, string> config)
    {
${bind}
    }
}`;

const configMain = `        var json = new[] { "# defaults", "Smtp:Host=localhost", "Smtp:Port=25", "Logging:Level=Information", "", "Features:Beta=false" };
        var env = new[] { "APP_Smtp__Host=smtp.prod.local", "PATH=/usr/bin", "APP_Logging__Level=Warning" };
        var args = new[] { "--smtp:port=587", "--Features:Beta=true" };
        var config = Config.Build(json, env, args);
        foreach (var key in config.Keys.OrderBy(k => k, StringComparer.OrdinalIgnoreCase)) Console.WriteLine(key + "=" + config[key]);
        var smtp = Config.BindSmtp(config);
        Console.WriteLine(smtp.Host + ":" + smtp.Port + " ssl=" + smtp.UseSsl);
        try { Config.BindSmtp(Config.Build(new[] { "Smtp:UseSsl=TRUE" }, new string[0], new string[0])); }
        catch (InvalidOperationException e) { Console.WriteLine(e.Message); }
        var minimal = Config.BindSmtp(Config.Build(new[] { "Smtp:Host=mail" }, new string[0], new[] { "--SMTP:USESSL=true" }));
        Console.WriteLine(minimal.Host + ":" + minimal.Port + " ssl=" + minimal.UseSsl);`;

export const configLayeringPractice = practice("config-layering", "Configuration layers and options binding", "Шари конфігурації та прив'язка опцій", {
  starter: PROGRAM_WITH(configTypes(stub, stub), configMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    configTypes(
      `        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var line in json)
        {
            if (line.Length == 0 || line.StartsWith("#")) continue;
            Set(result, line);
        }
        foreach (var line in env)
        {
            if (!line.StartsWith("APP_")) continue;
            Set(result, line.Substring(4).Replace("__", ":"));
        }
        foreach (var line in args)
        {
            if (line.StartsWith("--")) Set(result, line.Substring(2));
        }
        return result;
    }

    static void Set(Dictionary<string, string> result, string pair)
    {
        int eq = pair.IndexOf('=');
        result[pair.Substring(0, eq)] = pair.Substring(eq + 1);`,
      `        string host, port, ssl;
        if (!config.TryGetValue("Smtp:Host", out host)) throw new InvalidOperationException("Smtp:Host is required");
        return new SmtpOptions
        {
            Host = host,
            Port = config.TryGetValue("Smtp:Port", out port) ? int.Parse(port) : 25,
            UseSsl = config.TryGetValue("Smtp:UseSsl", out ssl) && bool.Parse(ssl),
        };`,
    ),
    configMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput:
    "Features:Beta=true\nLogging:Level=Warning\nSmtp:Host=smtp.prod.local\nSmtp:Port=587\nsmtp.prod.local:587 ssl=False\nSmtp:Host is required\nmail:25 ssl=True\n",
});

export const middlePlatformExtras: SlideDef[] = [
  lecture("middle-configuration-logging", "Configuration, options and logging in ASP.NET Core", "Конфігурація, опції та логування в ASP.NET Core"),
  quiz("middle-platform-quiz-3", "ASP.NET Core and memory, part 3", "ASP.NET Core і пам'ять, частина 3", [
    question(
      "config-order",
      ["In the default ASP.NET Core host, which configuration source wins?", "Яке джерело конфігурації перемагає в стандартному хості ASP.NET Core?"],
      [
        ["Command-line arguments (after environment variables, user secrets, appsettings.{Env}.json, appsettings.json)", "Аргументи командного рядка (після змінних середовища, user secrets, appsettings.{Env}.json, appsettings.json)"],
        ["appsettings.json", "appsettings.json"],
        ["The first source added", "Перше додане джерело"],
        ["They are merged randomly", "Вони зливаються випадково"],
      ],
      "a",
    ),
    question(
      "env-separator",
      ["How do you set `Smtp:Host` through an environment variable on Linux?", "Як задати `Smtp:Host` через змінну середовища в Linux?"],
      [
        ["`Smtp__Host=…` — double underscore stands for the colon", "`Smtp__Host=…` — подвійне підкреслення означає двокрапку"],
        ["`Smtp:Host=…`", "`Smtp:Host=…`"],
        ["`Smtp.Host=…`", "`Smtp.Host=…`"],
        ["It's impossible", "Це неможливо"],
      ],
      "a",
    ),
    question(
      "ioptions-kinds",
      ["`IOptions<T>` vs `IOptionsSnapshot<T>` vs `IOptionsMonitor<T>`?", "`IOptions<T>`, `IOptionsSnapshot<T>` чи `IOptionsMonitor<T>`?"],
      [
        ["IOptions: read once (singleton); Snapshot: recomputed per request (scoped); Monitor: singleton with live reload and change notifications", "IOptions: читається раз (singleton); Snapshot: перераховується на запит (scoped); Monitor: singleton із живим перезавантаженням і сповіщеннями про зміни"],
        ["They are identical", "Вони однакові"],
        ["Only IOptions supports validation", "Валідацію підтримує лише IOptions"],
        ["Monitor is scoped", "Monitor — scoped"],
      ],
      "a",
    ),
    question(
      "options-validation",
      ["How do you fail fast at startup when required settings are missing?", "Як швидко впасти під час старту, коли бракує обов'язкових налаштувань?"],
      [
        ["`AddOptions<T>().Bind(...).ValidateDataAnnotations().ValidateOnStart()`", "`AddOptions<T>().Bind(...).ValidateDataAnnotations().ValidateOnStart()`"],
        ["Check them in every controller", "Перевіряти в кожному контролері"],
        ["Catch NullReferenceException later", "Перехоплювати NullReferenceException пізніше"],
        ["It's not possible", "Це неможливо"],
      ],
      "a",
    ),
    question(
      "structured-logging",
      ["Why `_log.LogInformation(\"Order {OrderId} paid\", id)` instead of `$\"Order {id} paid\"`?", "Чому `_log.LogInformation(\"Order {OrderId} paid\", id)`, а не `$\"Order {id} paid\"`?"],
      [
        ["The template keeps `OrderId` as a separate, queryable property (structured logging) and avoids formatting when the level is disabled", "Шаблон зберігає `OrderId` як окрему властивість, за якою можна шукати (структуроване логування), і не форматує рядок, коли рівень вимкнено"],
        ["Interpolation doesn't compile in logging", "Інтерполяція в логуванні не компілюється"],
        ["It's shorter", "Так коротше"],
        ["No difference", "Різниці немає"],
      ],
      "a",
    ),
    question(
      "log-levels",
      ["Order the log levels from most to least verbose.", "Упорядкуйте рівні логування від найдокладнішого до найменш докладного."],
      [
        ["Trace, Debug, Information, Warning, Error, Critical", "Trace, Debug, Information, Warning, Error, Critical"],
        ["Debug, Trace, Warning, Information, Critical, Error", "Debug, Trace, Warning, Information, Critical, Error"],
        ["Information, Debug, Trace, Error, Warning, Critical", "Information, Debug, Trace, Error, Warning, Critical"],
        ["Critical, Error, Warning, Information, Debug, Trace", "Critical, Error, Warning, Information, Debug, Trace"],
      ],
      "a",
    ),
    question(
      "httpclient-factory",
      ["Why use `IHttpClientFactory` instead of `new HttpClient()` per request?", "Чому `IHttpClientFactory`, а не `new HttpClient()` на кожен запит?"],
      [
        ["It pools and recycles handlers: avoids socket exhaustion and respects DNS changes; also central config and resilience handlers", "Він тримає пул і перевикористовує обробники: уникає вичерпання сокетів і враховує зміни DNS; плюс централізовані налаштування й обробники стійкості"],
        ["`HttpClient` can't be created manually", "`HttpClient` не можна створити вручну"],
        ["The factory makes requests synchronous", "Фабрика робить запити синхронними"],
        ["It's required for HTTPS", "Він потрібен для HTTPS"],
      ],
      "a",
    ),
    question(
      "health-checks",
      ["What are ASP.NET Core health checks for?", "Для чого health checks в ASP.NET Core?"],
      [
        ["Endpoints (`/health/live`, `/health/ready`) that orchestrators and load balancers probe to restart or route traffic", "Кінцеві точки (`/health/live`, `/health/ready`), які опитують оркестратори й балансувальники, щоб перезапускати чи маршрутизувати трафік"],
        ["Unit testing", "Модульного тестування"],
        ["Memory profiling", "Профілювання пам'яті"],
        ["Logging", "Логування"],
      ],
      "a",
    ),
  ]),
  configLayeringPractice,
];

/* ---------- middle-collections ---------- */

const mapperTypes = (map: string, describe: string) => `[AttributeUsage(AttributeTargets.Property)]
class SensitiveAttribute : Attribute { }

class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    [Sensitive] public string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
}

class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public bool IsAdmin { get; set; }
    public string CreatedAt { get; set; }   // a different type: must not be copied
}

static class Mapper
{
    // Creates a TTarget and copies every public readable property of the source to the public writable
    // property of the target with the same name, if the source value's type is assignable to it.
    public static TTarget Map<TSource, TTarget>(TSource source) where TTarget : new()
    {
${map}
    }

    // "Name: TypeName = value" for every public instance property, ordered by property name.
    // Values: "null" for null, "***" for properties marked [Sensitive], otherwise Convert.ToString(value, CultureInfo.InvariantCulture).
    public static List<string> Describe(object obj)
    {
${describe}
    }
}`;

const mapperMain = `        var user = new User { Id = 7, Name = "Ann", Email = "ann@shop.ua", PasswordHash = "x9$k", CreatedAt = new DateTime(2026, 5, 4, 10, 30, 0) };
        foreach (var line in Mapper.Describe(user)) Console.WriteLine(line);
        var dto = Mapper.Map<User, UserDto>(user);
        Console.WriteLine("---");
        foreach (var line in Mapper.Describe(dto)) Console.WriteLine(line);`;

export const reflectionMapperPractice = practice("reflection-mapper", "Reflection: an object mapper and a describer", "Рефлексія: мапер об'єктів і опис властивостей", {
  starter: PROGRAM_WITH(mapperTypes(stub, stub), mapperMain, "using System.Collections.Generic;\nusing System.Globalization;\nusing System.Linq;\nusing System.Reflection;"),
  solution: PROGRAM_WITH(
    mapperTypes(
      `        var target = new TTarget();
        foreach (var from in typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!from.CanRead) continue;
            var to = typeof(TTarget).GetProperty(from.Name, BindingFlags.Public | BindingFlags.Instance);
            if (to == null || !to.CanWrite || !to.PropertyType.IsAssignableFrom(from.PropertyType)) continue;
            to.SetValue(target, from.GetValue(source));
        }
        return target;`,
      `        return obj.GetType()
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .OrderBy(p => p.Name, StringComparer.Ordinal)
            .Select(p =>
            {
                object value = p.GetValue(obj);
                string text = value == null ? "null"
                    : p.GetCustomAttribute<SensitiveAttribute>() != null ? "***"
                    : Convert.ToString(value, CultureInfo.InvariantCulture);
                return p.Name + ": " + p.PropertyType.Name + " = " + text;
            })
            .ToList();`,
    ),
    mapperMain,
    "using System.Collections.Generic;\nusing System.Globalization;\nusing System.Linq;\nusing System.Reflection;",
  ),
  expectedOutput:
    "CreatedAt: DateTime = 05/04/2026 10:30:00\nEmail: String = ann@shop.ua\nId: Int32 = 7\nName: String = Ann\nPasswordHash: String = ***\n---\nCreatedAt: String = null\nEmail: String = ann@shop.ua\nId: Int32 = 7\nIsAdmin: Boolean = False\nName: String = Ann\n",
});

export const middleCollectionsExtras: SlideDef[] = [
  lecture("middle-reflection-attributes", "Reflection, attributes and source generators", "Рефлексія, атрибути та генератори коду"),
  quiz("middle-collections-quiz-3", "Collections, reflection and data structures, part 3", "Колекції, рефлексія та структури даних, частина 3", [
    question(
      "gettype-typeof",
      ["`typeof(T)` vs `obj.GetType()`?", "`typeof(T)` чи `obj.GetType()`?"],
      [
        ["`typeof` is resolved at compile time from a type name; `GetType()` returns the runtime type of an object (e.g. the derived class)", "`typeof` визначається під час компіляції за назвою типу; `GetType()` повертає тип об'єкта під час виконання (наприклад, похідний клас)"],
        ["They are always equal", "Вони завжди рівні"],
        ["`GetType()` works only for structs", "`GetType()` працює лише для структур"],
        ["`typeof` is slower", "`typeof` повільніший"],
      ],
      "a",
    ),
    question(
      "reflection-private",
      ["Can reflection read a private field?", "Чи може рефлексія прочитати приватне поле?"],
      [
        ["Yes, with `BindingFlags.NonPublic | BindingFlags.Instance` — which is why private isn't a security boundary", "Так, з `BindingFlags.NonPublic | BindingFlags.Instance` — тому private не є межею безпеки"],
        ["No, never", "Ні, ніколи"],
        ["Only in Debug builds", "Лише в Debug-збірках"],
        ["Only for static fields", "Лише для статичних полів"],
      ],
      "a",
    ),
    question(
      "attribute-runtime",
      ["When does an attribute's constructor run?", "Коли виконується конструктор атрибута?"],
      [
        ["Only when someone reads the attribute via reflection (`GetCustomAttribute`); the arguments are stored as metadata", "Лише коли хтось читає атрибут через рефлексію (`GetCustomAttribute`); аргументи зберігаються як метадані"],
        ["When the class is loaded", "Коли завантажується клас"],
        ["Every time the method is called", "Щоразу під час виклику методу"],
        ["At compile time", "Під час компіляції"],
      ],
      "a",
    ),
    question(
      "source-generators",
      ["Why do modern libraries (System.Text.Json, logging, regex) use source generators instead of runtime reflection?", "Чому сучасні бібліотеки (System.Text.Json, логування, regex) використовують генератори коду замість рефлексії під час виконання?"],
      [
        ["The code is generated at compile time: faster startup, no reflection cost, and it works with trimming and Native AOT", "Код генерується під час компіляції: швидший старт, немає витрат на рефлексію, і він працює з trimming та Native AOT"],
        ["Reflection is removed from .NET", "Рефлексію прибрали з .NET"],
        ["They make binaries larger on purpose", "Вони навмисно збільшують файли"],
        ["To support .NET Framework only", "Лише для підтримки .NET Framework"],
      ],
      "a",
    ),
    question(
      "sorted-list-vs-dict",
      ["`SortedList<K,V>` vs `SortedDictionary<K,V>`?", "`SortedList<K,V>` чи `SortedDictionary<K,V>`?"],
      [
        ["SortedList: two sorted arrays, less memory, O(n) inserts; SortedDictionary: a red-black tree, O(log n) inserts", "SortedList: два відсортовані масиви, менше пам'яті, вставлення O(n); SortedDictionary: червоно-чорне дерево, вставлення O(log n)"],
        ["They are identical", "Вони однакові"],
        ["SortedList is a hash table", "SortedList — хеш-таблиця"],
        ["SortedDictionary keeps insertion order", "SortedDictionary зберігає порядок вставлення"],
      ],
      "a",
    ),
    question(
      "priority-queue",
      ["Which collection gives you the item with the smallest priority in O(log n)?", "Яка колекція дає елемент із найменшим пріоритетом за O(log n)?"],
      [
        ["`PriorityQueue<TElement, TPriority>` (a min-heap)", "`PriorityQueue<TElement, TPriority>` (мін-купа)"],
        ["`Queue<T>`", "`Queue<T>`"],
        ["`Stack<T>`", "`Stack<T>`"],
        ["`List<T>.Sort()` each time", "`List<T>.Sort()` щоразу"],
      ],
      "a",
    ),
    question(
      "with-shallow",
      ["`record Order(List<string> Lines); var b = a with { };` then `b.Lines.Add(\"x\")`. Does `a.Lines` change?", "`record Order(List<string> Lines); var b = a with { };` а потім `b.Lines.Add(\"x\")`. Чи зміниться `a.Lines`?"],
      [
        ["Yes — `with` makes a shallow copy; both records share the list", "Так — `with` робить поверхневу копію; обидва record-и ділять список"],
        ["No — the list is cloned", "Ні — список клонується"],
        ["Compile error", "Помилка компіляції"],
        ["It throws", "Кидає виняток"],
      ],
      "a",
    ),
    question(
      "concurrent-dict-getoradd",
      ["`ConcurrentDictionary.GetOrAdd(key, k => Expensive(k))` under contention…", "`ConcurrentDictionary.GetOrAdd(key, k => Expensive(k))` при конкуренції…"],
      [
        ["may call the factory more than once for the same key (only one value wins); wrap it in `Lazy<T>` if that matters", "може викликати фабрику кілька разів для того самого ключа (переможе лише одне значення); обгорніть у `Lazy<T>`, якщо це важливо"],
        ["always calls it exactly once", "завжди викликає її рівно раз"],
        ["deadlocks", "спричиняє взаємне блокування"],
        ["throws if the key exists", "кидає виняток, якщо ключ є"],
      ],
      "a",
    ),
  ]),
  reflectionMapperPractice,
];

/* ---------- middle-db-parallelism ---------- */

export const middleDbExtras: SlideDef[] = [
  lecture("middle-ef-core-practice", "EF Core in practice: tracking, loading, transactions, migrations", "EF Core на практиці: відстеження, завантаження, транзакції, міграції"),
  quiz("middle-db-parallelism-quiz-3", "EF Core and parallelism, part 3", "EF Core і паралелізм, частина 3", [
    question(
      "asnotracking",
      ["When should you use `AsNoTracking()`?", "Коли варто використовувати `AsNoTracking()`?"],
      [
        ["For read-only queries: no change-tracking snapshots, less memory and CPU", "Для запитів лише на читання: без знімків відстеження змін, менше пам'яті й CPU"],
        ["Always, including before updates", "Завжди, зокрема перед оновленнями"],
        ["Only with raw SQL", "Лише із сирим SQL"],
        ["Never", "Ніколи"],
      ],
      "a",
    ),
    question(
      "savechanges-transaction",
      ["Is one `SaveChanges()` call atomic?", "Чи атомарний один виклик `SaveChanges()`?"],
      [
        ["Yes — EF Core wraps all the changes of one `SaveChanges` in a transaction by default", "Так — EF Core за замовчуванням загортає всі зміни одного `SaveChanges` у транзакцію"],
        ["No, each row is separate", "Ні, кожен рядок окремо"],
        ["Only with `AsNoTracking`", "Лише з `AsNoTracking`"],
        ["Only on SQL Server", "Лише на SQL Server"],
      ],
      "a",
    ),
    question(
      "include-cartesian",
      ["A query `Include`s two collections (Orders and Addresses) of customers. What problem can appear, and the fix?", "Запит `Include`-ить дві колекції (Orders і Addresses) клієнтів. Яка проблема може виникнути і як її виправити?"],
      [
        ["Cartesian explosion (rows multiply); use `AsSplitQuery()` or project only what you need", "Декартів вибух (рядки множаться); використайте `AsSplitQuery()` або проєкцію лише потрібного"],
        ["N+1 queries; add more `Include`s", "N+1 запитів; додати більше `Include`"],
        ["Deadlocks; use NOLOCK", "Взаємні блокування; використати NOLOCK"],
        ["No problem", "Жодної проблеми"],
      ],
      "a",
    ),
    question(
      "dbcontext-thread",
      ["Can two threads use the same `DbContext` at once?", "Чи можуть два потоки одночасно використовувати той самий `DbContext`?"],
      [
        ["No — DbContext isn't thread-safe; one context per unit of work/request, or a context factory for parallel work", "Ні — DbContext не потокобезпечний; один контекст на одиницю роботи/запит або фабрика контекстів для паралельної роботи"],
        ["Yes, it's thread-safe", "Так, він потокобезпечний"],
        ["Only for reads", "Лише для читання"],
        ["Only with `await`", "Лише з `await`"],
      ],
      "a",
    ),
    question(
      "migrations-prod",
      ["A good way to apply EF Core migrations in production?", "Добрий спосіб застосовувати міграції EF Core у продакшні?"],
      [
        ["Generate an idempotent SQL script or a migration bundle and run it as a separate deployment step", "Згенерувати ідемпотентний SQL-скрипт або migration bundle і запускати окремим кроком розгортання"],
        ["Call `Database.Migrate()` from every app instance at startup", "Викликати `Database.Migrate()` з кожного екземпляра застосунку під час старту"],
        ["Edit the production schema by hand", "Змінювати схему продакшну вручну"],
        ["Delete and recreate the database", "Видалити й створити базу заново"],
      ],
      "a",
    ),
    question(
      "bulk-update",
      ["How do you update 100,000 rows efficiently in EF Core 7+?", "Як ефективно оновити 100 000 рядків в EF Core 7+?"],
      [
        ["`ExecuteUpdateAsync(s => s.SetProperty(…))` — one SQL UPDATE, no entities loaded", "`ExecuteUpdateAsync(s => s.SetProperty(…))` — один SQL UPDATE, без завантаження сутностей"],
        ["Load all entities, change them, `SaveChanges()`", "Завантажити всі сутності, змінити, `SaveChanges()`"],
        ["One `SaveChanges()` per row", "Один `SaveChanges()` на рядок"],
        ["It's impossible", "Це неможливо"],
      ],
      "a",
    ),
    question(
      "parallel-foreach-async",
      ["Which API runs async work for many items with a concurrency limit?", "Який API виконує асинхронну роботу для багатьох елементів з обмеженням паралелізму?"],
      [
        ["`Parallel.ForEachAsync` with `MaxDegreeOfParallelism`", "`Parallel.ForEachAsync` з `MaxDegreeOfParallelism`"],
        ["`Parallel.ForEach` with an async lambda", "`Parallel.ForEach` з async-лямбдою"],
        ["`Task.WaitAll` in a loop", "`Task.WaitAll` у циклі"],
        ["`Thread.Sleep`", "`Thread.Sleep`"],
      ],
      "a",
    ),
    question(
      "parallel-foreach-async-lambda",
      ["What's wrong with `Parallel.ForEach(urls, async url => await DownloadAsync(url));`?", "Що не так із `Parallel.ForEach(urls, async url => await DownloadAsync(url));`?"],
      [
        ["The lambda becomes `async void`: ForEach returns before downloads finish and exceptions are lost", "Лямбда стає `async void`: ForEach повертається раніше, ніж завантаження завершаться, а винятки губляться"],
        ["Nothing", "Нічого"],
        ["It runs sequentially", "Виконується послідовно"],
        ["It doesn't compile", "Не компілюється"],
      ],
      "a",
    ),
  ]),
];

/* ---------- middle-practical ---------- */

const shortTypes = (encode: string, decode: string, shorten: string, resolve: string) => `static class Base62
{
    public const string Alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // 0 -> "0", 61 -> "Z", 62 -> "10".
    public static string Encode(long n)
    {
${encode}
    }

    // The reverse. A character outside the alphabet -> FormatException.
    public static long Decode(string s)
    {
${decode}
    }
}

class Shortener
{
    private readonly Dictionary<string, long> idByUrl = new Dictionary<string, long>();
    private readonly Dictionary<long, string> urlById = new Dictionary<long, string>();
    private long nextId = 100000;   // start high so codes aren't one character long

    // Normalizes the URL (trim spaces, drop one trailing "/"), returns the existing code for a URL seen before
    // (idempotent), otherwise assigns nextId++ and returns its Base62 code.
    public string Shorten(string url)
    {
${shorten}
    }

    // The original URL for a code, or null for an unknown or invalid code.
    public string Resolve(string code)
    {
${resolve}
    }
}`;

const shortMain = `        Console.WriteLine(Base62.Encode(0) + " " + Base62.Encode(61) + " " + Base62.Encode(62) + " " + Base62.Encode(3843) + " " + Base62.Encode(3844));
        Console.WriteLine(Base62.Decode("Z") + " " + Base62.Decode("10") + " " + Base62.Decode(Base62.Encode(123456789)));
        var s = new Shortener();
        string a = s.Shorten("https://dou.ua/lenta/articles/interview-questions-net-developer/");
        string b = s.Shorten("https://learn.microsoft.com/dotnet");
        string a2 = s.Shorten("  https://dou.ua/lenta/articles/interview-questions-net-developer  ");
        Console.WriteLine(a + " " + b + " " + (a == a2));
        Console.WriteLine(s.Resolve(a));
        Console.WriteLine(s.Resolve(b));
        Console.WriteLine(s.Resolve("zzzz") ?? "unknown");
        Console.WriteLine(s.Resolve("bad!") ?? "invalid");`;

export const urlShortenerPractice = practice("url-shortener", "A URL shortener: Base62 and idempotency", "Скорочувач посилань: Base62 та ідемпотентність", {
  starter: PROGRAM_WITH(shortTypes(stub, stub, stub, stub), shortMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    shortTypes(
      `        if (n == 0) return "0";
        var chars = new List<char>();
        while (n > 0)
        {
            chars.Add(Alphabet[(int)(n % 62)]);
            n /= 62;
        }
        chars.Reverse();
        return new string(chars.ToArray());`,
      `        long n = 0;
        foreach (char c in s)
        {
            int digit = Alphabet.IndexOf(c);
            if (digit < 0) throw new FormatException("Not a Base62 character: " + c);
            n = n * 62 + digit;
        }
        return n;`,
      `        string normalized = url.Trim();
        if (normalized.EndsWith("/")) normalized = normalized.Substring(0, normalized.Length - 1);
        long id;
        if (!idByUrl.TryGetValue(normalized, out id))
        {
            id = nextId++;
            idByUrl[normalized] = id;
            urlById[id] = normalized;
        }
        return Base62.Encode(id);`,
      `        try
        {
            string url;
            return urlById.TryGetValue(Base62.Decode(code), out url) ? url : null;
        }
        catch (FormatException)
        {
            return null;
        }`,
    ),
    shortMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "0 Z 10 ZZ 100\n61 62 123456789\nq0U q0V True\nhttps://dou.ua/lenta/articles/interview-questions-net-developer\nhttps://learn.microsoft.com/dotnet\nunknown\ninvalid\n",
});

export const middlePracticalExtras: SlideDef[] = [
  lecture("middle-design-url-shortener", "System design at Middle level: a URL shortener", "Проєктування систем на рівні Middle: скорочувач посилань"),
  urlShortenerPractice,
];
