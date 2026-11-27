import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { SlideDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";

const stub = "        throw new NotImplementedException();";

/* ---------- Section: engineering practice (Q122–133) ---------- */

export const seniorAsyncInternalsLecture = lecture("senior-async-internals", "async/await compiled by hand", "async/await, скомпільований уручну");
export const seniorPerformanceLecture = lecture("senior-performance-memory", "Finding and fixing CPU and memory bottlenecks", "Пошук і усунення вузьких місць CPU та пам'яті");

export const seniorEngineeringQuiz2 = quiz("senior-engineering-quiz-2", "Engineering practice, part 2", "Інженерна практика, частина 2", [
  question(
    "aop",
    ["Which are ways to apply aspect-oriented programming in .NET?", "Які способи застосувати аспектно-орієнтоване програмування в .NET?"],
    [
      ["Dynamic proxies / interceptors (Castle DynamicProxy)", "Динамічні проксі / перехоплювачі (Castle DynamicProxy)"],
      ["Compile-time weaving or source generators (Fody, Metalama, PostSharp)", "Вплітання під час компіляції або генератори коду (Fody, Metalama, PostSharp)"],
      ["Framework hooks: ASP.NET Core filters and middleware", "Гачки фреймворку: фільтри й middleware ASP.NET Core"],
      ["Copying the same logging code into every method", "Копіювання того самого коду логування в кожен метод"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "star",
    ["\"Tell me about the hardest problem you solved.\" What makes a strong answer?", "«Розкажіть про найскладнішу задачу, яку ви розв'язали». Що робить відповідь сильною?"],
    [
      ["Context, the options considered and why one was chosen, your own role, and a measurable result", "Контекст, розглянуті варіанти й чому обрано один, ваша власна роль і вимірюваний результат"],
      ["A list of technologies used", "Перелік використаних технологій"],
      ["Blaming the previous team", "Звинувачення попередньої команди"],
      ["Saying every problem was easy", "Сказати, що всі задачі були легкими"],
    ],
    "a",
  ),
  question(
    "time-provider",
    ["A service calls `DateTime.UtcNow` directly, which makes tests flaky. The idiomatic .NET 8 fix?", "Сервіс напряму викликає `DateTime.UtcNow`, через що тести нестабільні. Ідіоматичне виправлення в .NET 8?"],
    [
      ["Inject `TimeProvider` and use `FakeTimeProvider` in tests", "Впровадити `TimeProvider` і використовувати `FakeTimeProvider` у тестах"],
      ["Run tests only at night", "Запускати тести лише вночі"],
      ["Use `Thread.Sleep` in tests", "Використовувати `Thread.Sleep` у тестах"],
      ["Make the method static", "Зробити метод статичним"],
    ],
    "a",
  ),
  question(
    "allocation-diag",
    ["Which tools show where a .NET app allocates memory?", "Які інструменти показують, де .NET-застосунок виділяє пам'ять?"],
    [
      ["BenchmarkDotNet with `[MemoryDiagnoser]`", "BenchmarkDotNet з `[MemoryDiagnoser]`"],
      ["dotMemory / Visual Studio allocation profiler / PerfView", "dotMemory / профайлер виділень Visual Studio / PerfView"],
      ["`dotnet-counters` (allocation rate, GC counts)", "`dotnet-counters` (швидкість виділень, кількість GC)"],
      ["`git blame`", "`git blame`"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "closure-alloc",
    ["Why can a lambda in a hot loop cause allocations?", "Чому лямбда в гарячому циклі може спричиняти виділення пам'яті?"],
    [
      ["A lambda that captures variables allocates a closure object and a delegate; static lambdas without captures are cached", "Лямбда, що захоплює змінні, виділяє об'єкт замикання й делегат; статичні лямбди без захоплень кешуються"],
      ["Lambdas always run on a new thread", "Лямбди завжди виконуються в новому потоці"],
      ["Lambdas are compiled at run time each call", "Лямбди компілюються під час кожного виклику"],
      ["They never allocate", "Вони ніколи не виділяють пам'ять"],
    ],
    "a",
  ),
  question(
    "docker-cache",
    ["Why copy `*.csproj` and run `dotnet restore` before `COPY . .` in a Dockerfile?", "Навіщо копіювати `*.csproj` і запускати `dotnet restore` перед `COPY . .` у Dockerfile?"],
    [
      ["The restore layer is cached and re-runs only when project files change, not on every code edit", "Шар restore кешується й повторюється лише при зміні файлів проєкту, а не на кожну правку коду"],
      ["`dotnet restore` doesn't work after copying the code", "`dotnet restore` не працює після копіювання коду"],
      ["It makes the image smaller", "Це робить образ меншим"],
      ["It's required by the SDK image", "Цього вимагає образ SDK"],
    ],
    "a",
  ),
  question(
    "hateoas",
    ["An order response includes `\"links\": [{\"rel\": \"pay\", \"href\": \"/orders/7/payment\", \"method\": \"POST\"}]`. What does this give the client?", "Відповідь із замовленням містить `\"links\": [{\"rel\": \"pay\", \"href\": \"/orders/7/payment\", \"method\": \"POST\"}]`. Що це дає клієнту?"],
    [
      ["It discovers which actions are allowed now from the server, instead of hard-coding URLs and state rules (HATEOAS, level 3)", "Він дізнається від сервера, які дії дозволені зараз, замість жорстко закодованих URL і правил станів (HATEOAS, рівень 3)"],
      ["Faster JSON parsing", "Швидший розбір JSON"],
      ["Encryption of the order", "Шифрування замовлення"],
      ["Nothing", "Нічого"],
    ],
    "a",
  ),
  question(
    "cpu-bound-aspnet",
    ["An ASP.NET Core endpoint does 2 seconds of CPU work. Does `await Task.Run(...)` help?", "Кінцева точка ASP.NET Core виконує 2 секунди CPU-роботи. Чи допоможе `await Task.Run(...)`?"],
    [
      ["No: it just moves the work to another pool thread; offload heavy work to a queue/worker or make it cheaper", "Ні: він лише переносить роботу на інший потік пулу; винесіть важку роботу в чергу/воркер або зробіть її дешевшою"],
      ["Yes, it makes it free", "Так, це робить її безкоштовною"],
      ["Yes, it uses the GPU", "Так, використовує GPU"],
      ["It is required for CPU work", "Це обов'язково для CPU-роботи"],
    ],
    "a",
  ),
  question(
    "pinvoke",
    ["What does `[DllImport(\"user32.dll\")] static extern int MessageBox(IntPtr h, string text, string caption, uint type);` rely on?", "На що спирається `[DllImport(\"user32.dll\")] static extern int MessageBox(IntPtr h, string text, string caption, uint type);`?"],
    [
      ["P/Invoke marshalling: the runtime converts the .NET strings to native strings and calls the native function", "Маршалінг P/Invoke: рантайм перетворює рядки .NET на нативні й викликає нативну функцію"],
      ["COM registration", "Реєстрацію COM"],
      ["Reflection.Emit", "Reflection.Emit"],
      ["A web service", "Веб-сервіс"],
    ],
    "a",
  ),
  question(
    "state-machine-alloc",
    ["When does an `async` method allocate its state machine on the heap?", "Коли `async`-метод виділяє свій скінченний автомат у купі?"],
    [
      ["Only when it hits an `await` on an incomplete task; if everything completes synchronously the struct state machine stays on the stack", "Лише коли натрапляє на `await` незавершеної задачі; якщо все завершується синхронно, структура-автомат лишається в стеку"],
      ["Always, at the first line", "Завжди, на першому рядку"],
      ["Never", "Ніколи"],
      ["Only in Debug builds", "Лише в Debug-збірках"],
    ],
    "a",
  ),
]);

const hateoasTypes = (build: string, follow: string) => `class Link
{
    public string Rel, Href, Method;
    public Link(string rel, string href, string method) { Rel = rel; Href = href; Method = method; }
}

class OrderDto
{
    public int Id;
    public string Status;
    public List<Link> Links = new List<Link>();
}

static class OrderLinks
{
    // Always "self" GET /orders/{id}. Then by status:
    //   new:      "pay" POST /orders/{id}/payment, "cancel" DELETE /orders/{id}
    //   paid:     "ship" POST /orders/{id}/shipment, "refund" POST /orders/{id}/refund
    //   shipped:  "track" GET /orders/{id}/tracking
    //   cancelled, refunded: nothing else
    // Any other status: throw ArgumentException.
    public static OrderDto Build(int id, string status)
    {
${build}
    }

    // The status after following a state-changing link: pay -> paid, cancel -> cancelled, ship -> shipped, refund -> refunded.
    // Throws InvalidOperationException when that link is not offered for the current status (an API would answer 409 Conflict).
    public static string Follow(string status, string rel)
    {
${follow}
    }
}`;

const hateoasMain = `        string status = "new";
        foreach (var rel in new[] { "pay", "ship" })
        {
            Print(OrderLinks.Build(1, status));
            status = OrderLinks.Follow(status, rel);
        }
        Print(OrderLinks.Build(1, status));
        try { OrderLinks.Follow(status, "cancel"); }
        catch (InvalidOperationException) { Console.WriteLine("cancel on shipped: 409 Conflict"); }
        Print(OrderLinks.Build(2, OrderLinks.Follow("new", "cancel")));
        Print(OrderLinks.Build(3, OrderLinks.Follow("paid", "refund")));
        try { OrderLinks.Build(4, "lost"); }
        catch (ArgumentException) { Console.WriteLine("unknown status: 400 Bad Request"); }`;

const hateoasMembers = `    static void Print(OrderDto order)
    {
        Console.WriteLine(order.Id + " " + order.Status + ": " + string.Join(" | ", order.Links.Select(l => l.Rel + " " + l.Method + " " + l.Href)));
    }`;

export const hateoasPractice = practice("hateoas-links", "REST level 3: hypermedia links", "REST рівня 3: гіпермедіа-посилання", {
  starter: PROGRAM_WITH(hateoasTypes(stub, stub), hateoasMain, "using System.Collections.Generic;\nusing System.Linq;", hateoasMembers),
  solution: PROGRAM_WITH(
    hateoasTypes(
      `        var order = new OrderDto { Id = id, Status = status };
        string self = "/orders/" + id;
        order.Links.Add(new Link("self", self, "GET"));
        switch (status)
        {
            case "new":
                order.Links.Add(new Link("pay", self + "/payment", "POST"));
                order.Links.Add(new Link("cancel", self, "DELETE"));
                break;
            case "paid":
                order.Links.Add(new Link("ship", self + "/shipment", "POST"));
                order.Links.Add(new Link("refund", self + "/refund", "POST"));
                break;
            case "shipped":
                order.Links.Add(new Link("track", self + "/tracking", "GET"));
                break;
            case "cancelled":
            case "refunded":
                break;
            default:
                throw new ArgumentException("Unknown status " + status, "status");
        }
        return order;`,
      `        var transitions = new Dictionary<string, string> { { "pay", "paid" }, { "cancel", "cancelled" }, { "ship", "shipped" }, { "refund", "refunded" } };
        bool offered = Build(0, status).Links.Any(l => l.Rel == rel);
        string next;
        if (!offered || !transitions.TryGetValue(rel, out next))
            throw new InvalidOperationException(rel + " is not allowed for a " + status + " order");
        return next;`,
    ),
    hateoasMain,
    "using System.Collections.Generic;\nusing System.Linq;",
    hateoasMembers,
  ),
  expectedOutput:
    "1 new: self GET /orders/1 | pay POST /orders/1/payment | cancel DELETE /orders/1\n1 paid: self GET /orders/1 | ship POST /orders/1/shipment | refund POST /orders/1/refund\n1 shipped: self GET /orders/1 | track GET /orders/1/tracking\ncancel on shipped: 409 Conflict\n2 cancelled: self GET /orders/2\n3 refunded: self GET /orders/3\nunknown status: 400 Bad Request\n",
});

const renewalTypes = (fields: string, ctor: string, send: string) => `interface IClock { DateTime UtcNow { get; } }
interface INotifier { void Send(string to, string text); }

class Subscription
{
    public string Email;
    public DateTime ExpiresAt;
    public Subscription(string email, DateTime expiresAt) { Email = email; ExpiresAt = expiresAt; }
}

class RenewalService
{
${fields}
    // Store the dependencies: no DateTime.Now, no Console, no static helpers inside this class.
    public RenewalService(IClock clock, INotifier notifier)
    {
${ctor}
    }

    // For every subscription that has NOT expired yet (ExpiresAt > now) and expires within 3 days
    // (ExpiresAt - now <= 3 days), send "Your subscription ends on yyyy-MM-dd" to its email.
    // Returns how many reminders were sent.
    public int SendReminders(IEnumerable<Subscription> subscriptions)
    {
${send}
    }
}

class FakeClock : IClock
{
    public DateTime UtcNow { get; set; }
}

class RecordingNotifier : INotifier
{
    public readonly List<string> Sent = new List<string>();
    public void Send(string to, string text) { Sent.Add(to + ": " + text); }
}`;

const renewalMain = `        var clock = new FakeClock { UtcNow = new DateTime(2026, 11, 27, 10, 0, 0) };
        var notifier = new RecordingNotifier();
        var service = new RenewalService(clock, notifier);
        var subscriptions = new List<Subscription>
        {
            new Subscription("a@shop.ua", new DateTime(2026, 11, 28, 0, 0, 0)),
            new Subscription("b@shop.ua", new DateTime(2026, 12, 30, 0, 0, 0)),
            new Subscription("c@shop.ua", new DateTime(2026, 11, 27, 9, 0, 0)),
            new Subscription("d@shop.ua", new DateTime(2026, 11, 30, 10, 0, 0)),
        };
        Console.WriteLine("reminders: " + service.SendReminders(subscriptions));
        clock.UtcNow = clock.UtcNow.AddDays(2);
        Console.WriteLine("reminders: " + service.SendReminders(subscriptions));
        foreach (var line in notifier.Sent) Console.WriteLine(line);`;

export const testableRenewalsPractice = practice("testable-renewals", "Loose coupling: inject the clock and the notifier", "Слабке зчеплення: впроваджуємо годинник і нотифікатор", {
  starter: PROGRAM_WITH(renewalTypes("", stub.replace("throw new NotImplementedException();", "// TODO"), stub), renewalMain, "using System.Collections.Generic;\nusing System.Globalization;"),
  solution: PROGRAM_WITH(
    renewalTypes(
      "    private readonly IClock clock;\n    private readonly INotifier notifier;\n",
      "        this.clock = clock;\n        this.notifier = notifier;",
      `        DateTime now = clock.UtcNow;
        int sent = 0;
        foreach (var s in subscriptions)
        {
            if (s.ExpiresAt <= now || s.ExpiresAt - now > TimeSpan.FromDays(3)) continue;
            notifier.Send(s.Email, "Your subscription ends on " + s.ExpiresAt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
            sent++;
        }
        return sent;`,
    ),
    renewalMain,
    "using System.Collections.Generic;\nusing System.Globalization;",
  ),
  expectedOutput:
    "reminders: 2\nreminders: 1\na@shop.ua: Your subscription ends on 2026-11-28\nd@shop.ua: Your subscription ends on 2026-11-30\nd@shop.ua: Your subscription ends on 2026-11-30\n",
});

/* ---------- Section: the runtime (Q134–147) ---------- */

export const seniorGenericsLecture = lecture("senior-generics-enumerators", "Generics, enumerators, immutability and structs under the hood", "Generics, енумератори, незмінність і структури під капотом");

export const seniorRuntimeQuiz2 = quiz("senior-runtime-quiz-2", "The runtime in depth, part 2", "Рантайм у деталях, частина 2", [
  question(
    "lock-this",
    ["Why is `lock (this)` discouraged?", "Чому `lock (this)` не рекомендують?"],
    [
      ["Outside code can lock the same object, causing unexpected contention or deadlocks; lock a private readonly object instead", "Зовнішній код може заблокувати той самий об'єкт, спричинивши неочікувану конкуренцію чи взаємні блокування; блокуйте приватний readonly-об'єкт"],
      ["It doesn't compile", "Не компілюється"],
      ["It is slower than a private object", "Це повільніше за приватний об'єкт"],
      ["`this` can be null", "`this` може бути null"],
    ],
    "a",
  ),
  question(
    "await-in-lock",
    ["You need mutual exclusion around code that contains `await`. What do you use?", "Потрібне взаємне виключення навколо коду з `await`. Що використати?"],
    [
      ["`SemaphoreSlim(1, 1)` with `await WaitAsync()` and `Release()` in finally", "`SemaphoreSlim(1, 1)` з `await WaitAsync()` і `Release()` у finally"],
      ["`lock` — it works with await", "`lock` — він працює з await"],
      ["`Monitor.Enter` before await, `Monitor.Exit` after", "`Monitor.Enter` до await, `Monitor.Exit` після"],
      ["`Thread.Sleep`", "`Thread.Sleep`"],
    ],
    "a",
  ),
  question(
    "expression-compile",
    ["Why compile an expression tree once and cache the delegate?", "Навіщо компілювати дерево виразів один раз і кешувати делегат?"],
    [
      ["`Compile()` is expensive (it generates IL); the resulting delegate is fast, much faster than reflection's `Invoke`", "`Compile()` дорогий (генерує IL); отриманий делегат швидкий, набагато швидший за `Invoke` з рефлексії"],
      ["Expression trees can only be compiled once", "Дерева виразів можна скомпілювати лише раз"],
      ["Caching makes the tree immutable", "Кешування робить дерево незмінним"],
      ["It's required by EF Core", "Цього вимагає EF Core"],
    ],
    "a",
  ),
  question(
    "card-table",
    ["How does a Gen 0 collection find references from old (Gen 2) objects to young ones without scanning Gen 2?", "Як збирання Gen 0 знаходить посилання зі старих (Gen 2) об'єктів на молоді, не скануючи Gen 2?"],
    [
      ["A write barrier marks the card table when a reference is stored into an old object; only marked cards are scanned", "Бар'єр запису позначає card table, коли посилання записується в старий об'єкт; скануються лише позначені картки"],
      ["It scans Gen 2 anyway", "Він усе одно сканує Gen 2"],
      ["Old objects cannot reference young ones", "Старі об'єкти не можуть посилатися на молоді"],
      ["Through finalizers", "Через фіналізатори"],
    ],
    "a",
  ),
  question(
    "user-secrets",
    ["Where are .NET User Secrets stored?", "Де зберігаються .NET User Secrets?"],
    [
      ["In a JSON file in the user profile, outside the project folder, identified by `UserSecretsId` — not encrypted, for development only", "У JSON-файлі в профілі користувача, поза папкою проєкту, за `UserSecretsId` — не зашифровано, лише для розробки"],
      ["In Azure Key Vault", "В Azure Key Vault"],
      ["In the project's appsettings.json", "В appsettings.json проєкту"],
      ["In the Windows registry, encrypted", "У реєстрі Windows, зашифровано"],
    ],
    "a",
  ),
  question(
    "cors-preflight",
    ["What is a CORS preflight request?", "Що таке preflight-запит CORS?"],
    [
      ["An `OPTIONS` request the browser sends before a non-simple cross-origin request, asking which methods and headers are allowed", "Запит `OPTIONS`, який браузер надсилає перед «непростим» крос-доменним запитом, щоб дізнатися дозволені методи й заголовки"],
      ["A request sent by the server to the browser", "Запит від сервера до браузера"],
      ["A DNS lookup", "DNS-запит"],
      ["The TLS handshake", "TLS-рукостискання"],
    ],
    "a",
  ),
  question(
    "deploy-artifact",
    ["Why build the Docker image once and promote the same image through dev, staging and production?", "Навіщо збирати Docker-образ один раз і просувати той самий образ через dev, staging і production?"],
    [
      ["What you tested is exactly what you ship; configuration differs per environment, the artifact doesn't", "Ви випускаєте саме те, що тестували; конфігурація різниться між середовищами, а артефакт — ні"],
      ["Building is too slow to repeat", "Збірка надто повільна, щоб повторювати"],
      ["Registries allow only one image", "Реєстри дозволяють лише один образ"],
      ["It is required by Kubernetes", "Цього вимагає Kubernetes"],
    ],
    "a",
  ),
  question(
    "generic-canon",
    ["`List<string>` and `List<Customer>` at run time…", "`List<string>` і `List<Customer>` під час виконання…"],
    [
      ["share one JIT-compiled implementation (reference types use the shared `__Canon` code)", "ділять одну JIT-скомпільовану реалізацію (типи посилань використовують спільний код `__Canon`)"],
      ["each get completely separate native code", "отримують повністю окремий нативний код"],
      ["are the same type", "є тим самим типом"],
      ["are erased to `List<object>`", "стираються до `List<object>`"],
    ],
    "a",
  ),
  question(
    "enumerator-version",
    ["`foreach (var x in list) if (x == 0) list.Remove(x);` What happens?", "`foreach (var x in list) if (x == 0) list.Remove(x);` Що станеться?"],
    [
      ["`InvalidOperationException`: the enumerator sees the list's version changed", "`InvalidOperationException`: енумератор бачить, що змінилася версія списку"],
      ["All zeros are removed", "Усі нулі видаляються"],
      ["An infinite loop", "Нескінченний цикл"],
      ["Compile error", "Помилка компіляції"],
    ],
    "a",
  ),
  question(
    "abstract-plus-interface",
    ["Why does the BCL expose both `IList<T>` and `Collection<T>`?", "Навіщо BCL має і `IList<T>`, і `Collection<T>`?"],
    [
      ["The interface is the contract anyone can implement; the base class gives a reusable implementation with virtual hooks (`InsertItem`, `RemoveItem`)", "Інтерфейс — контракт, який будь-хто може реалізувати; базовий клас дає готову реалізацію з віртуальними гачками (`InsertItem`, `RemoveItem`)"],
      ["Historical accident only", "Лише історична випадковість"],
      ["`Collection<T>` is faster than `List<T>`", "`Collection<T>` швидший за `List<T>`"],
      ["Interfaces can't be used in method parameters", "Інтерфейси не можна використовувати в параметрах методів"],
    ],
    "a",
  ),
  question(
    "readonly-struct",
    ["Why mark a struct `readonly`?", "Навіщо позначати структуру `readonly`?"],
    [
      ["The compiler enforces immutability and can avoid defensive copies when the struct is used via `in` or readonly fields", "Компілятор гарантує незмінність і може уникати захисних копій, коли структуру передають через `in` чи readonly-поля"],
      ["It moves the struct to the heap", "Він переносить структуру в купу"],
      ["It makes it a reference type", "Він робить її типом посилання"],
      ["It allows inheritance", "Він дозволяє успадкування"],
    ],
    "a",
  ),
]);

const filterTypes = (build: string) => `class Product
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Category { get; set; }
}

class Condition
{
    public string Property, Op;
    public object Value;
    public Condition(string property, string op, object value) { Property = property; Op = op; Value = value; }
}

static class FilterBuilder
{
    // Builds x => c1 && c2 && ... from the conditions. Ops: "==", ">", "<", "contains" (string only).
    // Convert each value to the property's type (Convert.ChangeType), so 5 works for a decimal property.
    // No conditions -> x => true. An unknown op -> NotSupportedException.
    public static Expression<Func<T, bool>> Build<T>(IEnumerable<Condition> conditions)
    {
${build}
    }
}`;

const filterMain = `        var products = new List<Product>
        {
            new Product { Name = "C# in Depth", Price = 45m, Stock = 3, Category = "Books" },
            new Product { Name = "Clean Code", Price = 28m, Stock = 0, Category = "Books" },
            new Product { Name = "Refactoring", Price = 25m, Stock = 5, Category = "Books" },
            new Product { Name = "Mouse Pro", Price = 30m, Stock = 10, Category = "Electronics" },
            new Product { Name = "Keyboard Pro", Price = 80m, Stock = 0, Category = "Electronics" },
            new Product { Name = "USB cable", Price = 5m, Stock = 100, Category = "Electronics" },
        };
        Show(products, new Condition[0]);
        Show(products, new[] { new Condition("Category", "==", "Books"), new Condition("Price", "<", 30) });
        Show(products, new[] { new Condition("Name", "contains", "Pro"), new Condition("Stock", ">", 0) });
        Show(products, new[] { new Condition("Price", "==", 5) });
        try
        {
            FilterBuilder.Build<Product>(new[] { new Condition("Price", "~", 1) });
            Console.WriteLine("built");
        }
        catch (NotSupportedException)
        {
            Console.WriteLine("NotSupportedException");
        }`;

const filterMembers = `    static void Show(List<Product> products, IEnumerable<Condition> conditions)
    {
        Func<Product, bool> predicate = FilterBuilder.Build<Product>(conditions).Compile();
        Console.WriteLine("[" + string.Join(", ", products.Where(predicate).Select(p => p.Name)) + "]");
    }`;

const filterUsings = "using System.Collections.Generic;\nusing System.Linq;\nusing System.Linq.Expressions;";

export const expressionFilterPractice = practice("expression-filter-builder", "A dynamic filter with expression trees", "Динамічний фільтр на деревах виразів", {
  starter: PROGRAM_WITH(filterTypes(stub), filterMain, filterUsings, filterMembers),
  solution: PROGRAM_WITH(
    filterTypes(`        var x = Expression.Parameter(typeof(T), "x");
        Expression body = Expression.Constant(true);
        foreach (var c in conditions)
        {
            var member = Expression.Property(x, c.Property);
            var value = Expression.Constant(Convert.ChangeType(c.Value, member.Type), member.Type);
            Expression test;
            switch (c.Op)
            {
                case "==": test = Expression.Equal(member, value); break;
                case ">": test = Expression.GreaterThan(member, value); break;
                case "<": test = Expression.LessThan(member, value); break;
                case "contains": test = Expression.Call(member, typeof(string).GetMethod("Contains", new[] { typeof(string) }), value); break;
                default: throw new NotSupportedException("Unknown operator " + c.Op);
            }
            body = Expression.AndAlso(body, test);
        }
        return Expression.Lambda<Func<T, bool>>(body, x);`),
    filterMain,
    filterUsings,
    filterMembers,
  ),
  expectedOutput:
    "[C# in Depth, Clean Code, Refactoring, Mouse Pro, Keyboard Pro, USB cable]\n[Clean Code, Refactoring]\n[Mouse Pro]\n[USB cable]\nNotSupportedException\n",
});

const stackTypes = (push: string, pop: string, peek: string, enumerate: string) => `class ArrayStack<T> : IEnumerable<T>
{
    private T[] items = new T[4];
    private int size;
    private int version;

    public int Count { get { return size; } }
    public int Capacity { get { return items.Length; } }

    // Doubles the array when it is full. Every change increments version.
    public void Push(T item)
    {
${push}
    }

    // Throws InvalidOperationException("Stack empty") when empty. Clears the freed slot so the GC can collect the item.
    public T Pop()
    {
${pop}
    }

    // Throws InvalidOperationException("Stack empty") when empty.
    public T Peek()
    {
${peek}
    }

    // From the top to the bottom, like Stack<T>. Throws InvalidOperationException
    // if the stack is changed while it is being enumerated.
    public IEnumerator<T> GetEnumerator()
    {
${enumerate}
    }

    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() { return GetEnumerator(); }
}`;

const stackMain = `        var stack = new ArrayStack<int>();
        for (int i = 1; i <= 5; i++) stack.Push(i);
        Console.WriteLine(stack.Count + " " + stack.Capacity);
        Console.WriteLine(string.Join(" ", stack));
        Console.WriteLine(stack.Pop() + " " + stack.Peek() + " " + stack.Count);
        while (stack.Count > 0) stack.Pop();
        try { stack.Pop(); }
        catch (InvalidOperationException e) { Console.WriteLine("empty: " + e.Message); }
        stack.Push(10);
        stack.Push(20);
        try
        {
            foreach (var x in stack) stack.Push(x + 1);
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("modified during enumeration");
        }
        Console.WriteLine("count " + stack.Count + ", top " + stack.Peek() + ", capacity " + stack.Capacity);`;

export const ownStackPractice = practice("own-stack", "Stack<T> from the inside: growth and enumeration", "Stack<T> зсередини: зростання й перебір", {
  starter: PROGRAM_WITH(stackTypes(stub, stub, stub, stub), stackMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    stackTypes(
      `        if (size == items.Length) Array.Resize(ref items, items.Length * 2);
        items[size++] = item;
        version++;`,
      `        if (size == 0) throw new InvalidOperationException("Stack empty");
        T item = items[--size];
        items[size] = default(T);
        version++;
        return item;`,
      `        if (size == 0) throw new InvalidOperationException("Stack empty");
        return items[size - 1];`,
      `        int expected = version;
        for (int i = size - 1; i >= 0; i--)
        {
            if (version != expected) throw new InvalidOperationException("Collection was modified");
            yield return items[i];
        }
        if (version != expected) throw new InvalidOperationException("Collection was modified");`,
    ),
    stackMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput: "5 8\n5 4 3 2 1\n5 4 4\nempty: Stack empty\nmodified during enumeration\ncount 3, top 21, capacity 8\n",
});

/* ---------- Section: databases (Q148–156) ---------- */

export const seniorDbConcurrencyLecture = lecture("senior-db-concurrency", "Concurrency in the database: lost updates, queues and locks", "Конкурентність у базі: втрачені оновлення, черги й блокування");

export const seniorDbQuiz2 = quiz("senior-databases-quiz-2", "Databases at Senior level, part 2", "Бази даних на рівні Senior, частина 2", [
  question(
    "mvcc",
    ["What does MVCC give readers in PostgreSQL?", "Що дає MVCC читачам у PostgreSQL?"],
    [
      ["A consistent snapshot of committed row versions without blocking writers (and writers don't block readers)", "Узгоджений знімок закомічених версій рядків без блокування записувачів (а записувачі не блокують читачів)"],
      ["Exclusive locks on every row read", "Ексклюзивні блокування кожного прочитаного рядка"],
      ["Dirty reads", "Брудне читання"],
      ["Faster writes with no extra storage", "Швидші записи без додаткового місця"],
    ],
    "a",
  ),
  question(
    "skip-locked",
    ["Several workers take jobs from a `jobs` table. Which query lets each grab a different job without waiting on each other?", "Кілька воркерів беруть задачі з таблиці `jobs`. Який запит дає кожному взяти різну задачу без очікування один на одного?"],
    [
      ["`SELECT … FOR UPDATE SKIP LOCKED` inside the claiming UPDATE (PostgreSQL) / `WITH (READPAST, UPDLOCK, ROWLOCK)` (SQL Server)", "`SELECT … FOR UPDATE SKIP LOCKED` усередині UPDATE, що забирає задачу (PostgreSQL) / `WITH (READPAST, UPDLOCK, ROWLOCK)` (SQL Server)"],
      ["`SELECT TOP 1 … ` without locks, then UPDATE", "`SELECT TOP 1 … ` без блокувань, потім UPDATE"],
      ["`READ UNCOMMITTED`", "`READ UNCOMMITTED`"],
      ["A full table lock", "Блокування всієї таблиці"],
    ],
    "a",
  ),
  question(
    "deadlock-fix",
    ["Two transactions deadlock: one updates A then B, the other B then A. Best fix?", "Дві транзакції потрапляють у взаємне блокування: одна оновлює A, потім B, інша — B, потім A. Найкраще виправлення?"],
    [
      ["Access resources in the same order in all transactions, keep transactions short, and retry the deadlock victim", "Звертатися до ресурсів в однаковому порядку в усіх транзакціях, тримати транзакції короткими й повторювати «жертву» взаємного блокування"],
      ["Use NOLOCK everywhere", "Використати NOLOCK всюди"],
      ["Increase the timeout", "Збільшити тайм-аут"],
      ["Remove all indexes", "Видалити всі індекси"],
    ],
    "a",
  ),
  question(
    "fencing",
    ["Why is a lock TTL alone not enough for a correct distributed lock?", "Чому самого TTL блокування недостатньо для коректного розподіленого блокування?"],
    [
      ["A paused owner (GC, network) can wake after the lock expired and write anyway; a fencing token checked by the storage rejects such stale writes", "Призупинений власник (GC, мережа) може прокинутися після спливання блокування й усе одно записати; fencing-токен, який перевіряє сховище, відхиляє такі застарілі записи"],
      ["TTLs are not supported by Redis", "Redis не підтримує TTL"],
      ["The lock never expires", "Блокування ніколи не спливає"],
      ["It is enough", "Цього достатньо"],
    ],
    "a",
  ),
  question(
    "release-check",
    ["Why must a Redis lock be released with a compare-and-delete (Lua script) instead of a plain `DEL`?", "Чому Redis-блокування треба звільняти через «порівняти й видалити» (Lua-скрипт), а не просто `DEL`?"],
    [
      ["If your lock expired and someone else acquired it, a plain DEL would delete THEIR lock", "Якщо ваше блокування спливло й хтось інший його взяв, простий DEL видалив би ЙОГО блокування"],
      ["`DEL` is slower", "`DEL` повільніший"],
      ["`DEL` is not atomic", "`DEL` не атомарний"],
      ["Lua is required for all keys", "Lua обов'язковий для всіх ключів"],
    ],
    "a",
  ),
  question(
    "read-replica",
    ["A heavy reporting query slows down the OLTP database. Good options?", "Важкий звітний запит сповільнює OLTP-базу. Добрі варіанти?"],
    [
      ["Run reports on a read replica", "Виконувати звіти на репліці для читання"],
      ["Precompute aggregates into a reporting table / materialized view", "Попередньо обчислювати агрегати у звітну таблицю / матеріалізоване подання"],
      ["Move analytics to a columnar store / data warehouse", "Перенести аналітику в колонкове сховище / сховище даних"],
      ["Add `NOLOCK` and hope", "Додати `NOLOCK` і сподіватися"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "document-vs-relational",
    ["When is a document database (MongoDB, Cosmos DB) a better fit than a relational one?", "Коли документна база (MongoDB, Cosmos DB) підходить краще за реляційну?"],
    [
      ["The data is read and written as self-contained aggregates with a flexible schema and you need easy horizontal scaling", "Дані читаються й пишуться самодостатніми агрегатами з гнучкою схемою, і потрібне легке горизонтальне масштабування"],
      ["You need complex ad-hoc joins across many entities", "Потрібні складні довільні з'єднання багатьох сутностей"],
      ["You need multi-row financial transactions everywhere", "Потрібні багаторядкові фінансові транзакції всюди"],
      ["Never", "Ніколи"],
    ],
    "a",
  ),
  question(
    "wal-commit",
    ["At what point is a transaction durable?", "У який момент транзакція стає довговічною?"],
    [
      ["When its commit record is flushed to the transaction log on disk", "Коли запис про її коміт скинуто в журнал транзакцій на диск"],
      ["When the data pages are written to the data file", "Коли сторінки даних записано у файл даних"],
      ["When the client receives the first row", "Коли клієнт отримує перший рядок"],
      ["At the next backup", "Під час наступного бекапу"],
    ],
    "a",
  ),
]);

export const claimJobsPractice: SlideDef = {
  kind: "practice",
  slug: "claim-jobs",
  title: { en: "Practice: A job queue in the database", uk: "Практика «Черга задач у базі даних»" },
  language: "sql",
  setup: `CREATE TABLE jobs (
    id       integer PRIMARY KEY,
    name     text NOT NULL,
    priority integer NOT NULL,
    status   text NOT NULL DEFAULT 'queued',
    worker   text
);

INSERT INTO jobs (id, name, priority, status, worker) VALUES
    (1, 'send-newsletter', 1, 'queued', NULL),
    (2, 'resize-images', 5, 'queued', NULL),
    (3, 'rebuild-search', 5, 'running', 'w9'),
    (4, 'charge-cards', 9, 'queued', NULL),
    (5, 'cleanup-temp', 1, 'done', 'w1');
`,
  starter: "-- 1. worker w1 claims a job\n-- 2. worker w2 claims a job\n-- 3. w1 finishes its job\n-- 4. the final state\n",
  solution: `UPDATE jobs
SET status = 'running', worker = 'w1'
WHERE id = (
    SELECT id FROM jobs
    WHERE status = 'queued'
    ORDER BY priority DESC, id
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING id, name, worker;

UPDATE jobs
SET status = 'running', worker = 'w2'
WHERE id = (
    SELECT id FROM jobs
    WHERE status = 'queued'
    ORDER BY priority DESC, id
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING id, name, worker;

UPDATE jobs
SET status = 'done'
WHERE worker = 'w1' AND status = 'running'
RETURNING id, status;

SELECT id, name, status, worker
FROM jobs
ORDER BY id;
`,
  expectedOutput: " id |     name     | worker\n----+--------------+--------\n  4 | charge-cards | w1\n(1 row)\n\n id |     name      | worker\n----+---------------+--------\n  2 | resize-images | w2\n(1 row)\n\n id | status\n----+--------\n  4 | done\n(1 row)\n\n id |      name       | status  | worker\n----+-----------------+---------+--------\n  1 | send-newsletter | queued  | NULL\n  2 | resize-images   | running | w2\n  3 | rebuild-search  | running | w9\n  4 | charge-cards    | done    | w1\n  5 | cleanup-temp    | done    | w1\n(5 rows)\n",
  maxScore: 5,
};

const lockTypes = (acquire: string, release: string, write: string) => `class FakeClock { public DateTime Now = new DateTime(2026, 1, 1); }

// A tiny in-memory stand-in for Redis.
class FakeRedis
{
    private readonly FakeClock clock;
    private readonly Dictionary<string, KeyValuePair<string, DateTime>> values = new Dictionary<string, KeyValuePair<string, DateTime>>();
    private readonly Dictionary<string, long> counters = new Dictionary<string, long>();
    public FakeRedis(FakeClock clock) { this.clock = clock; }

    // SET key value NX PX ttl: sets only if the key is absent or expired.
    public bool SetIfAbsent(string key, string value, TimeSpan ttl)
    {
        if (Get(key) != null) return false;
        values[key] = new KeyValuePair<string, DateTime>(value, clock.Now + ttl);
        return true;
    }

    public string Get(string key)
    {
        KeyValuePair<string, DateTime> v;
        return values.TryGetValue(key, out v) && v.Value > clock.Now ? v.Key : null;
    }

    // The Lua "compare and delete": deletes only if the current value equals expected.
    public bool DeleteIfEquals(string key, string expected)
    {
        if (Get(key) != expected) return false;
        values.Remove(key);
        return true;
    }

    // INCR: an atomic counter.
    public long Increment(string key)
    {
        long n;
        counters.TryGetValue(key, out n);
        counters[key] = ++n;
        return n;
    }
}

class LockHandle
{
    public string Resource, Token;
    public long Fence;
}

class DistributedLock
{
    private readonly FakeRedis redis;
    public DistributedLock(FakeRedis redis) { this.redis = redis; }

    // Tries SetIfAbsent("lock:" + resource, <unique token>, ttl). On success, takes a fencing number from
    // Increment("fence:" + resource) and returns a handle; otherwise returns null.
    public LockHandle TryAcquire(string resource, TimeSpan ttl)
    {
${acquire}
    }

    // Releases the lock only if this handle still owns it.
    public bool Release(LockHandle handle)
    {
${release}
    }
}

class Storage
{
    private long highestFence;
    public string Data = "";

    // Accepts a write only if its fence is not older than the newest fence already seen.
    // Returns "ok" or "rejected (stale fence N)".
    public string Write(long fence, string data)
    {
${write}
    }
}`;

const lockMain = `        var clock = new FakeClock();
        var locks = new DistributedLock(new FakeRedis(clock));
        var storage = new Storage();
        var ttl = TimeSpan.FromSeconds(30);

        var a = locks.TryAcquire("invoice-42", ttl);
        Console.WriteLine("A acquired, fence " + a.Fence);
        Console.WriteLine(locks.TryAcquire("invoice-42", ttl) == null ? "B: busy" : "B acquired");

        clock.Now = clock.Now.AddSeconds(31);   // A is paused (a long GC); its lock expires
        var b = locks.TryAcquire("invoice-42", ttl);
        Console.WriteLine("B acquired, fence " + b.Fence);
        Console.WriteLine("write by B: " + storage.Write(b.Fence, "B"));
        Console.WriteLine("write by A: " + storage.Write(a.Fence, "A"));
        Console.WriteLine("release by A: " + locks.Release(a));
        Console.WriteLine("release by B: " + locks.Release(b));
        var c = locks.TryAcquire("invoice-42", ttl);
        Console.WriteLine("C acquired, fence " + c.Fence + ", data " + storage.Data);
        Console.WriteLine("other resource: fence " + locks.TryAcquire("invoice-43", ttl).Fence);`;

export const distributedLockPractice = practice("distributed-lock", "A distributed lock with fencing tokens", "Розподілене блокування з fencing-токенами", {
  starter: PROGRAM_WITH(lockTypes(stub, stub, stub), lockMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    lockTypes(
      `        string token = Guid.NewGuid().ToString("N");
        if (!redis.SetIfAbsent("lock:" + resource, token, ttl)) return null;
        return new LockHandle { Resource = resource, Token = token, Fence = redis.Increment("fence:" + resource) };`,
      `        return redis.DeleteIfEquals("lock:" + handle.Resource, handle.Token);`,
      `        if (fence < highestFence) return "rejected (stale fence " + fence + ")";
        highestFence = fence;
        Data = data;
        return "ok";`,
    ),
    lockMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "A acquired, fence 1\nB: busy\nB acquired, fence 2\nwrite by B: ok\nwrite by A: rejected (stale fence 1)\nrelease by A: False\nrelease by B: True\nC acquired, fence 3, data B\nother resource: fence 1\n",
});

/* ---------- Section: microservices and Azure (Q157–168) ---------- */

export const seniorResilienceLecture = lecture("senior-resilience-messaging", "Resilience and messaging in code: Polly, sagas, Service Bus", "Стійкість і обмін повідомленнями в коді: Polly, саги, Service Bus");

export const seniorMicroservicesQuiz2 = quiz("senior-microservices-azure-quiz-2", "Microservices and Azure, part 2", "Мікросервіси та Azure, частина 2", [
  question(
    "microservice-cost",
    ["Which are real costs of moving from a monolith to microservices?", "Які з цього — реальна ціна переходу від моноліту до мікросервісів?"],
    [
      ["Network failures and latency between calls", "Збої мережі й затримки між викликами"],
      ["Eventual consistency and distributed transactions", "Кінцева узгодженість і розподілені транзакції"],
      ["More infrastructure: CI/CD per service, observability, versioned contracts", "Більше інфраструктури: CI/CD для кожного сервісу, спостережуваність, версіоновані контракти"],
      ["Code can no longer be unit tested", "Код більше не можна покрити модульними тестами"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "grpc-when",
    ["When is gRPC a good choice between services?", "Коли gRPC — добрий вибір між сервісами?"],
    [
      ["Internal, low-latency, high-volume calls with a strict contract, including streaming", "Внутрішні виклики з малою затримкою й великим обсягом зі строгим контрактом, зокрема потокові"],
      ["Public APIs consumed directly by browsers without a proxy", "Публічні API, які браузери споживають напряму без проксі"],
      ["When you want human-readable payloads", "Коли потрібні дані, що їх легко читає людина"],
      ["Never", "Ніколи"],
    ],
    "a",
  ),
  question(
    "orchestration-choreography",
    ["Saga orchestration vs choreography — which is true?", "Оркестрація чи хореографія саги — що правда?"],
    [
      ["Orchestration: a coordinator sends commands and tracks state — easier to follow; choreography: services react to events — less coupling to a central component but the flow is harder to see", "Оркестрація: координатор надсилає команди й стежить за станом — легше простежити; хореографія: сервіси реагують на події — менше залежності від центрального компонента, але потік важче побачити"],
      ["Choreography requires 2PC", "Хореографія вимагає 2PC"],
      ["Orchestration can't compensate", "Оркестрація не вміє компенсувати"],
      ["They are the same", "Це одне й те саме"],
    ],
    "a",
  ),
  question(
    "retry-jitter",
    ["Why add jitter to exponential backoff?", "Навіщо додавати jitter до експоненційної затримки?"],
    [
      ["So many clients that failed at the same moment don't all retry at the same moment and overload the service again", "Щоб багато клієнтів, які впали одночасно, не повторювали теж одночасно й знову не перевантажили сервіс"],
      ["To make retries faster", "Щоб повтори були швидшими"],
      ["To encrypt retries", "Щоб шифрувати повтори"],
      ["It's required by HTTP", "Цього вимагає HTTP"],
    ],
    "a",
  ),
  question(
    "bulkhead",
    ["What is the Bulkhead pattern?", "Що таке патерн Bulkhead?"],
    [
      ["Isolating resources (thread pools, connection pools, concurrency limits) per dependency so one slow dependency can't exhaust everything", "Ізоляція ресурсів (пули потоків, пули з'єднань, обмеження паралелізму) для кожної залежності, щоб одна повільна залежність не вичерпала все"],
      ["Retrying forever", "Нескінченні повтори"],
      ["Caching all responses", "Кешування всіх відповідей"],
      ["A database backup strategy", "Стратегія резервного копіювання бази"],
    ],
    "a",
  ),
  question(
    "correlation",
    ["What is propagated between services so logs from one request can be joined?", "Що передається між сервісами, щоб логи одного запиту можна було зв'язати?"],
    [
      ["A trace/correlation id (W3C `traceparent`), included in every log entry", "Trace/correlation id (W3C `traceparent`), що входить у кожен запис логу"],
      ["The user's password", "Пароль користувача"],
      ["The database connection string", "Рядок підключення до бази"],
      ["Nothing; timestamps are enough", "Нічого; достатньо часових міток"],
    ],
    "a",
  ),
  question(
    "dlq",
    ["What is a dead-letter queue for?", "Для чого dead-letter-черга?"],
    [
      ["Messages that repeatedly fail or expire are moved there for inspection and replay instead of blocking the main queue", "Повідомлення, що постійно падають чи прострочуються, переносяться туди для аналізу й повторного відтворення, а не блокують основну чергу"],
      ["Deleting all old messages", "Видалення всіх старих повідомлень"],
      ["High-priority messages", "Повідомлення з високим пріоритетом"],
      ["Encrypting messages", "Шифрування повідомлень"],
    ],
    "a",
  ),
  question(
    "sessions",
    ["How do you get FIFO processing per customer in Azure Service Bus?", "Як отримати обробку FIFO для кожного клієнта в Azure Service Bus?"],
    [
      ["Message sessions: set `SessionId` = customer id; one receiver locks a session and gets its messages in order", "Сесії повідомлень: `SessionId` = id клієнта; один отримувач блокує сесію й отримує її повідомлення по порядку"],
      ["Use a topic", "Використати топік"],
      ["Set a higher prefetch", "Збільшити prefetch"],
      ["It is impossible", "Це неможливо"],
    ],
    "a",
  ),
  question(
    "partition-key",
    ["In Azure Table Storage, what happens if all entities share one PartitionKey?", "Що буде в Azure Table Storage, якщо всі сутності мають один PartitionKey?"],
    [
      ["One hot partition limits throughput; but batch transactions across those entities are possible", "Одна «гаряча» партиція обмежує пропускну здатність; зате пакетні транзакції між цими сутностями можливі"],
      ["Unlimited scale", "Необмежене масштабування"],
      ["Inserts fail", "Вставлення падають"],
      ["Queries become impossible", "Запити стають неможливими"],
    ],
    "a",
  ),
  question(
    "functions-isolated",
    ["Which Azure Functions model is recommended for new .NET apps?", "Яку модель Azure Functions рекомендують для нових .NET-застосунків?"],
    [
      ["The isolated worker model: your code runs in its own process with full control of dependencies and middleware", "Isolated worker: ваш код працює у власному процесі з повним контролем залежностей і middleware"],
      ["The in-process model", "In-process модель"],
      ["WebJobs SDK 1.x", "WebJobs SDK 1.x"],
      ["Classic cloud services", "Класичні cloud services"],
    ],
    "a",
  ),
]);

const breakerTypes = (state: string, execute: string) => `class FakeClock { public DateTime Now = new DateTime(2026, 1, 1); }

class CircuitOpenException : Exception { }

class CircuitBreaker
{
    private readonly FakeClock clock;
    private readonly int failureThreshold;
    private readonly TimeSpan breakDuration;
${state}
    public CircuitBreaker(FakeClock clock, int failureThreshold, TimeSpan breakDuration)
    {
        this.clock = clock;
        this.failureThreshold = failureThreshold;
        this.breakDuration = breakDuration;
    }

    // "Closed", "Open" or "HalfOpen".
    public string State { get; private set; } = "Closed";

    // Closed: call the action; a success resets the failure count; reaching failureThreshold consecutive failures opens the circuit.
    // Open: until breakDuration has passed since opening, throw CircuitOpenException WITHOUT calling the action;
    //       after that, switch to HalfOpen and let this call through as a trial.
    // HalfOpen: a successful trial closes the circuit; a failed one opens it again (the break starts over).
    // The action's own exception is always rethrown to the caller.
    public T Execute<T>(Func<T> action)
    {
${execute}
    }
}`;

const breakerMain = `        var clock = new FakeClock();
        var breaker = new CircuitBreaker(clock, 2, TimeSpan.FromSeconds(10));
        var script = new Queue<bool>(new[] { true, false, false, false, true, true });
        int calls = 0;
        Func<string> service = () =>
        {
            calls++;
            if (!script.Dequeue()) throw new TimeoutException();
            return "ok";
        };
        Action attempt = () =>
        {
            try { Console.WriteLine(breaker.Execute(service) + " (" + breaker.State + ")"); }
            catch (CircuitOpenException) { Console.WriteLine("rejected (" + breaker.State + ")"); }
            catch (TimeoutException) { Console.WriteLine("error (" + breaker.State + ")"); }
        };

        attempt(); attempt(); attempt(); attempt();
        clock.Now = clock.Now.AddSeconds(5); attempt();
        clock.Now = clock.Now.AddSeconds(6); attempt(); attempt();
        clock.Now = clock.Now.AddSeconds(10); attempt(); attempt();
        Console.WriteLine("service calls: " + calls);`;

export const circuitBreakerPractice = practice("circuit-breaker", "A circuit breaker", "Circuit breaker", {
  starter: PROGRAM_WITH(breakerTypes("", stub), breakerMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    breakerTypes(
      "    private int failures;\n    private DateTime openedAt;\n",
      `        if (State == "Open")
        {
            if (clock.Now - openedAt < breakDuration) throw new CircuitOpenException();
            State = "HalfOpen";
        }
        try
        {
            T result = action();
            failures = 0;
            State = "Closed";
            return result;
        }
        catch
        {
            failures++;
            if (State == "HalfOpen" || failures >= failureThreshold)
            {
                State = "Open";
                openedAt = clock.Now;
            }
            throw;
        }`,
    ),
    breakerMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "ok (Closed)\nerror (Closed)\nerror (Open)\nrejected (Open)\nrejected (Open)\nerror (Open)\nrejected (Open)\nok (Closed)\nok (Closed)\nservice calls: 6\n",
});

const sagaTypes = (run: string) => `class SagaStep
{
    public string Name;
    public Action Execute;
    public Action Compensate;
    public SagaStep(string name, Action execute, Action compensate) { Name = name; Execute = execute; Compensate = compensate; }
}

static class Saga
{
    // Runs the steps in order. If a step throws: log "failed: <name>", then run Compensate of every step
    // that already completed, in REVERSE order, and return false. A compensation that throws is logged as
    // "compensation failed: <name>" and the remaining compensations still run. Returns true if all steps succeed.
    public static bool Run(List<SagaStep> steps, List<string> log)
    {
${run}
    }
}`;

const sagaMain = `        foreach (var failing in new[] { "", "create shipment", "charge payment" })
        {
            var log = new List<string>();
            Func<string, Action> act = name => () =>
            {
                if (name == failing) throw new InvalidOperationException(name);
                log.Add("done: " + name);
            };
            var steps = new List<SagaStep>
            {
                new SagaStep("reserve stock", act("reserve stock"), () =>
                {
                    if (failing == "charge payment") throw new TimeoutException();
                    log.Add("undo: reserve stock");
                }),
                new SagaStep("charge payment", act("charge payment"), () => log.Add("undo: charge payment")),
                new SagaStep("create shipment", act("create shipment"), () => log.Add("undo: create shipment")),
            };
            bool ok = Saga.Run(steps, log);
            Console.WriteLine((ok ? "completed" : "rolled back") + ": " + string.Join(", ", log));
        }`;

export const sagaPractice = practice("saga-compensation", "A saga with compensating actions", "Сага з компенсувальними діями", {
  starter: PROGRAM_WITH(sagaTypes(stub), sagaMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    sagaTypes(`        var completed = new Stack<SagaStep>();
        foreach (var step in steps)
        {
            try
            {
                step.Execute();
                completed.Push(step);
            }
            catch (Exception)
            {
                log.Add("failed: " + step.Name);
                while (completed.Count > 0)
                {
                    var done = completed.Pop();
                    try { done.Compensate(); }
                    catch (Exception) { log.Add("compensation failed: " + done.Name); }
                }
                return false;
            }
        }
        return true;`),
    sagaMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "completed: done: reserve stock, done: charge payment, done: create shipment\nrolled back: done: reserve stock, done: charge payment, failed: create shipment, undo: charge payment, undo: reserve stock\nrolled back: done: reserve stock, failed: charge payment, compensation failed: reserve stock\n",
});

/* ---------- Practical tasks ---------- */

const bidTypes = (apply: string, count: string) => `class PartnerEvent
{
    public string Id;
    public int BidId, PartnerId;
    public bool Added;     // true: partner added to the bid, false: removed
    public long Version;   // increases with every change of this (bid, partner) pair in the partners service
    public PartnerEvent(string id, int bid, int partner, bool added, long version)
    {
        Id = id; BidId = bid; PartnerId = partner; Added = added; Version = version;
    }
}

// The bidding service's local read model of "how many partners does each bid have".
class BidReadModel
{
    public int Ignored;

    // Delivery is at-least-once and unordered:
    //  - an event whose Id was already applied is ignored (count it in Ignored);
    //  - for each (bid, partner) pair, an event older than (or as old as) the newest one applied is ignored (count it too);
    //  - otherwise remember the pair's state and version.
    public void Apply(PartnerEvent e)
    {
${apply}
    }

    // The number of partners currently added to the bid.
    public int PartnersCount(int bidId)
    {
${count}
    }
}`;

const bidMain = `        var model = new BidReadModel();
        var events = new[]
        {
            new PartnerEvent("e1", 1, 101, true, 1),
            new PartnerEvent("e2", 1, 102, true, 1),
            new PartnerEvent("e3", 1, 101, false, 2),
            new PartnerEvent("e1", 1, 101, true, 1),
            new PartnerEvent("e5", 2, 201, false, 2),
            new PartnerEvent("e4", 2, 201, true, 1),
            new PartnerEvent("e6", 2, 203, true, 1),
            new PartnerEvent("e7", 1, 103, true, 1),
            new PartnerEvent("e8", 1, 101, true, 3),
        };
        foreach (var e in events)
        {
            model.Apply(e);
            Console.WriteLine(e.Id + " -> bid 1: " + model.PartnersCount(1) + ", bid 2: " + model.PartnersCount(2));
        }
        Console.WriteLine("bid 3: " + model.PartnersCount(3) + ", ignored: " + model.Ignored);`;

export const bidCounterPractice = practice("bid-partner-counter", "A partner counter fed by events", "Лічильник партнерів, що живиться подіями", {
  starter: PROGRAM_WITH(bidTypes(stub, stub), bidMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    bidTypes(
      `        if (!processed.Add(e.Id)) { Ignored++; return; }
        var key = Tuple.Create(e.BidId, e.PartnerId);
        Tuple<long, bool> current;
        if (pairs.TryGetValue(key, out current) && current.Item1 >= e.Version) { Ignored++; return; }
        pairs[key] = Tuple.Create(e.Version, e.Added);
    }

    private readonly HashSet<string> processed = new HashSet<string>();
    private readonly Dictionary<Tuple<int, int>, Tuple<long, bool>> pairs = new Dictionary<Tuple<int, int>, Tuple<long, bool>>();

    private void Unused()
    {`,
      `        return pairs.Count(p => p.Key.Item1 == bidId && p.Value.Item2);`,
    ),
    bidMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput:
    "e1 -> bid 1: 1, bid 2: 0\ne2 -> bid 1: 2, bid 2: 0\ne3 -> bid 1: 1, bid 2: 0\ne1 -> bid 1: 1, bid 2: 0\ne5 -> bid 1: 1, bid 2: 0\ne4 -> bid 1: 1, bid 2: 0\ne6 -> bid 1: 1, bid 2: 1\ne7 -> bid 1: 2, bid 2: 1\ne8 -> bid 1: 3, bid 2: 1\nbid 3: 0, ignored: 2\n",
});
