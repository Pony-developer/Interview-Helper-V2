import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";
import {
  bidCounterPractice,
  circuitBreakerPractice,
  claimJobsPractice,
  distributedLockPractice,
  expressionFilterPractice,
  hateoasPractice,
  ownStackPractice,
  sagaPractice,
  seniorAsyncInternalsLecture,
  seniorDbConcurrencyLecture,
  seniorDbQuiz2,
  seniorEngineeringQuiz2,
  seniorGenericsLecture,
  seniorMicroservicesQuiz2,
  seniorPerformanceLecture,
  seniorResilienceLecture,
  seniorRuntimeQuiz2,
  testableRenewalsPractice,
} from "./senior-more";

const stub = "        throw new NotImplementedException();";

const sudokuTypes = (body: string) => `static class Sudoku
{
    // True if the 9x9 grid is completely and correctly filled:
    // every row, every column and every 3x3 box contains each of the digits 1..9 exactly once.
    public static bool IsValid(int[,] grid)
    {
${body}
    }
}`;

const sudokuMain = `        var grid = new int[9, 9];
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++)
                grid[r, c] = (r * 3 + r / 3 + c) % 9 + 1;
        Console.WriteLine("valid: " + Sudoku.IsValid(grid));

        var swapped = (int[,])grid.Clone();
        int tmp = swapped[0, 0]; swapped[0, 0] = swapped[0, 1]; swapped[0, 1] = tmp;
        Console.WriteLine("swapped in a row: " + Sudoku.IsValid(swapped));

        var zero = (int[,])grid.Clone();
        zero[4, 4] = 0;
        Console.WriteLine("with a zero: " + Sudoku.IsValid(zero));

        var latin = new int[9, 9];
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++)
                latin[r, c] = (r + c) % 9 + 1;
        Console.WriteLine("rows and columns only: " + Sudoku.IsValid(latin));`;

const linqTypes = (select: string, where: string, selectMany: string) => `static class MyLinq
{
    public static IEnumerable<TResult> MySelect<TSource, TResult>(this IEnumerable<TSource> source, Func<TSource, TResult> selector)
    {
${select}
    }

    public static IEnumerable<TSource> MyWhere<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)
    {
${where}
    }

    public static IEnumerable<TResult> MySelectMany<TSource, TResult>(this IEnumerable<TSource> source, Func<TSource, IEnumerable<TResult>> selector)
    {
${selectMany}
    }
}`;

const linqMembers = `    static IEnumerable<int> Numbers(List<string> log)
    {
        for (int i = 1; i <= 4; i++)
        {
            log.Add("yield " + i);
            yield return i;
        }
    }

    static void CheckThrows(string name, Func<object> call)
    {
        try
        {
            call();
            Console.WriteLine(name + ": not thrown");
        }
        catch (ArgumentNullException)
        {
            Console.WriteLine(name + ": ArgumentNullException");
        }
    }`;

const linqMain = `        var log = new List<string>();
        var query = Numbers(log).MyWhere(x => x % 2 == 0).MySelect(x => x * 10);
        Console.WriteLine("after building the query: " + log.Count + " items produced");
        foreach (var x in query) log.Add("got " + x);
        Console.WriteLine(string.Join(", ", log));

        var words = new[] { "ab", "cde" };
        Console.WriteLine(string.Join(" ", words.MySelectMany(w => w.ToCharArray())));

        int[] none = null;
        CheckThrows("Select, null source", () => none.MySelect(x => x));
        CheckThrows("Where, null predicate", () => new[] { 1 }.MyWhere(null));
        CheckThrows("SelectMany, null selector", () => new[] { 1 }.MySelectMany<int, int>(null));`;

const filterTypes = (filter: string, words: string) => `static class Tasks
{
    // The elements divisible by n without a remainder, from largest to smallest.
    // Throws ArgumentException when n is 0.
    public static List<int> Filter(IEnumerable<int> collection, int n)
    {
${filter}
    }

    // The distinct words of the text (letters a-z only, case-insensitive, returned in lower case),
    // ordered by length, then alphabetically.
    public static List<string> UniqueWords(string text)
    {
${words}
    }
}`;

const filterMain = `        Console.WriteLine(string.Join(" ", Tasks.Filter(new[] { 1, 2, 3, 4, 5, 6, 9, 12, 15 }, 3)));
        Console.WriteLine(string.Join(" ", Tasks.Filter(new[] { -4, 7, -2, 0, 2 }, 2)));
        Console.WriteLine("[" + string.Join(" ", Tasks.Filter(new int[0], 5)) + "]");
        try
        {
            Tasks.Filter(new[] { 1 }, 0);
            Console.WriteLine("no exception");
        }
        catch (ArgumentException)
        {
            Console.WriteLine("ArgumentException");
        }
        Console.WriteLine(string.Join(" ", Tasks.UniqueWords("The quick brown fox jumps over the lazy dog. The DOG sleeps!")));`;

const seniorEngineeringModule: ModuleDef = {
  slug: "senior-engineering",
  title: { en: "Senior: engineering practice", uk: "Senior: інженерна практика" },
  slides: [
    lecture("senior-questions", "Senior interview questions", "Питання співбесіди Senior"),
    lecture("senior-engineering", "Engineering practice: coupling, performance, async in depth", "Інженерна практика: зчеплення, продуктивність, async у деталях"),
    seniorAsyncInternalsLecture,
    seniorPerformanceLecture,
    quiz("senior-engineering-quiz", "Engineering practice", "Інженерна практика", [
      question(
        "static-coupling",
        ["Does calling static classes from your code increase or decrease coupling?", "Виклики статичних класів у коді збільшують чи зменшують зчеплення?"],
        [
          ["Increase: the caller is hard-wired to a concrete implementation that cannot be substituted or mocked", "Збільшують: викликач жорстко прив'язаний до конкретної реалізації, яку не можна підмінити чи замокати"],
          ["Decrease: there are no instances", "Зменшують: немає екземплярів"],
          ["No effect", "Не впливають"],
          ["Only for extension methods", "Лише для методів розширення"],
        ],
        "a",
      ),
      question(
        "benchmark",
        ["Which statements about measuring performance are true?", "Які твердження про вимірювання продуктивності правильні?"],
        [
          ["BenchmarkDotNet handles warm-up, JIT tiers and statistics that a naive Stopwatch loop gets wrong", "BenchmarkDotNet враховує прогрів, рівні JIT і статистику, які наївний цикл зі Stopwatch рахує неправильно"],
          ["Profilers and tracing add overhead, so measurement can change what is measured (observer effect)", "Профайлери й трасування додають накладні витрати, тож вимірювання може змінити те, що вимірюють (ефект спостерігача)"],
          ["Debug builds give representative numbers", "Debug-збірки дають репрезентативні результати"],
          ["Measure in production-like conditions and look at allocations, not only time", "Вимірюйте в умовах, близьких до продакшну, і дивіться на виділення пам'яті, а не лише на час"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "multistage",
        ["What does a multi-stage Docker build give you for a .NET service?", "Що дає multi-stage збірка Docker для .NET-сервісу?"],
        [
          ["Build with the big `sdk` image, copy only the published output into the small `aspnet` runtime image", "Збираємо у великому образі `sdk`, у маленький образ рантайму `aspnet` копіюємо лише опублікований результат"],
          ["A smaller final image without compilers and source code", "Менший фінальний образ без компіляторів і вихідного коду"],
          ["Better layer caching, e.g. restoring packages before copying the source", "Краще кешування шарів, наприклад відновлення пакетів до копіювання коду"],
          ["Several containers running in one image", "Кілька контейнерів, що працюють в одному образі"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "cross-cutting",
        ["Good ways to implement logging, validation or transactions as cross-cutting concerns in .NET?", "Добрі способи реалізувати логування, валідацію чи транзакції як наскрізну функціональність у .NET?"],
        [
          ["ASP.NET Core middleware and filters", "Middleware і фільтри ASP.NET Core"],
          ["Decorators over interfaces (e.g. registered with Scrutor) or MediatR pipeline behaviors", "Декоратори над інтерфейсами (наприклад, через Scrutor) або pipeline behaviors у MediatR"],
          ["Copy-pasting try/catch and logging into every method", "Копіювати try/catch і логування в кожен метод"],
          ["`DelegatingHandler`s for outgoing HttpClient calls", "`DelegatingHandler`-и для вихідних викликів HttpClient"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "richardson",
        ["In the Richardson REST maturity model, what does level 3 add?", "Що додає рівень 3 у моделі зрілості REST Річардсона?"],
        [
          ["Using HTTP verbs and status codes", "Використання HTTP-методів і кодів статусу"],
          ["Separate URIs per resource", "Окремі URI для кожного ресурсу"],
          ["Hypermedia controls (HATEOAS): responses contain links to the next possible actions", "Гіпермедіа (HATEOAS): відповіді містять посилання на можливі наступні дії"],
          ["One endpoint for everything (RPC over HTTP)", "Одна кінцева точка для всього (RPC поверх HTTP)"],
        ],
        "c",
      ),
      question(
        "cpu-io",
        ["Which work is IO-bound?", "Яка робота обмежена I/O?"],
        [
          ["Waiting for a database query", "Очікування запиту до бази даних"],
          ["Calling an external HTTP API", "Виклик зовнішнього HTTP API"],
          ["Resizing a large image in memory", "Зміна розміру великого зображення в пам'яті"],
          ["Reading a file from disk", "Читання файлу з диска"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "async-void",
        ["Why should you avoid `async void` methods (except event handlers)?", "Чому слід уникати методів `async void` (крім обробників подій)?"],
        [
          ["The caller cannot await them or know when they finish", "Викликач не може їх дочекатися чи дізнатися, коли вони завершилися"],
          ["An exception inside goes to the SynchronizationContext / thread pool and can crash the process", "Виняток усередині потрапляє в SynchronizationContext / пул потоків і може обвалити процес"],
          ["They are hard to test", "Їх важко тестувати"],
          ["They run synchronously", "Вони виконуються синхронно"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "marshalling",
        ["What is marshalling?", "Що таке маршалінг?"],
        [
          ["Converting data between managed and unmanaged representations when calling native code (P/Invoke, COM) or crossing boundaries", "Перетворення даних між керованим і некерованим представленням під час виклику нативного коду (P/Invoke, COM) або перетину меж"],
          ["Sorting a collection", "Сортування колекції"],
          ["Starting a Docker container", "Запуск Docker-контейнера"],
          ["Compiling IL", "Компіляція IL"],
        ],
        "a",
      ),
    ]),
    seniorEngineeringQuiz2,
    hateoasPractice,
    testableRenewalsPractice,
  ],
};

const seniorRuntimeModule: ModuleDef = {
  slug: "senior-runtime",
  title: { en: "Senior: the .NET runtime and data structures", uk: "Senior: рантайм .NET і структури даних" },
  slides: [
    lecture("senior-runtime", "The runtime in depth: lock, GC, generics, expression trees", "Рантайм у деталях: lock, GC, generics, дерева виразів"),
    seniorGenericsLecture,
    quiz("senior-runtime-quiz", "The runtime in depth", "Рантайм у деталях", [
      question(
        "lock-struct",
        ["Can you use a struct in `lock (x)`?", "Чи можна використати структуру в `lock (x)`?"],
        [
          ["Yes, it is copied safely", "Так, вона безпечно копіюється"],
          ["No: `lock` needs a reference type; boxing would create a new object each time, so nothing would be locked (the compiler refuses it)", "Ні: `lock` потребує типу посилання; упакування щоразу створювало б новий об'єкт, тож нічого б не блокувалося (компілятор це забороняє)"],
          ["Only `readonly struct`", "Лише `readonly struct`"],
          ["Only in unsafe code", "Лише в unsafe-коді"],
        ],
        "b",
      ),
      question(
        "lock-impl",
        ["What does `lock (obj) { … }` compile to?", "У що компілюється `lock (obj) { … }`?"],
        [
          ["`Monitor.Enter(obj, ref taken)` / `try { … } finally { if (taken) Monitor.Exit(obj); }`", "`Monitor.Enter(obj, ref taken)` / `try { … } finally { if (taken) Monitor.Exit(obj); }`"],
          ["A `Mutex` from the operating system", "У `Mutex` операційної системи"],
          ["`Interlocked.Increment`", "`Interlocked.Increment`"],
          ["Nothing; it is just a hint", "Ні в що; це лише підказка"],
        ],
        "a",
      ),
      question(
        "expression-tree",
        ["What is an expression tree?", "Що таке дерево виразів?"],
        [
          ["Code represented as a data structure (`Expression<TDelegate>`) that can be inspected, translated (EF → SQL) or compiled at run time", "Код, поданий як структура даних (`Expression<TDelegate>`), яку можна досліджувати, перекладати (EF → SQL) чи компілювати під час виконання"],
          ["A balanced binary tree", "Збалансоване двійкове дерево"],
          ["The call stack", "Стек викликів"],
          ["A Roslyn syntax tree of the whole project", "Синтаксичне дерево Roslyn для всього проєкту"],
        ],
        "a",
      ),
      question(
        "three-gens",
        ["Why three GC generations, not two or ten?", "Чому три покоління GC, а не два чи десять?"],
        [
          ["It is an engineering trade-off: Gen 0 catches short-lived objects, Gen 1 buffers objects that live through one collection, Gen 2 holds long-lived ones; more generations add bookkeeping (card tables, promotion) for diminishing returns", "Це інженерний компроміс: Gen 0 ловить короткоживучі об'єкти, Gen 1 буферизує ті, що пережили одне збирання, Gen 2 тримає довгоживучі; більше поколінь додає обліку (card tables, підвищення) з дедалі меншою віддачею"],
          ["Because the CPU has three cache levels", "Бо процесор має три рівні кешу"],
          ["It is required by the C# specification", "Цього вимагає специфікація C#"],
          ["Each generation runs on its own thread", "Кожне покоління працює у своєму потоці"],
        ],
        "a",
      ),
      question(
        "secrets",
        ["Where should a production connection string live in a .NET service?", "Де має зберігатися продакшн-рядок підключення в .NET-сервісі?"],
        [
          ["In `appsettings.json` committed to git", "В `appsettings.json`, закоміченому в git"],
          ["In Azure Key Vault (or another secret store) accessed with a managed identity, or in environment variables injected by the platform", "В Azure Key Vault (чи іншому сховищі секретів) з доступом через managed identity або в змінних середовища, які впроваджує платформа"],
          ["Hard-coded in a constant", "Захардкоджено в константі"],
          ["In User Secrets", "В User Secrets"],
        ],
        "b",
      ),
      question(
        "cors",
        ["How do you enable CORS in ASP.NET Core?", "Як увімкнути CORS в ASP.NET Core?"],
        [
          ["`builder.Services.AddCors(o => o.AddPolicy(\"web\", p => p.WithOrigins(\"https://app.example.com\")…))` and `app.UseCors(\"web\")` in the right place of the pipeline", "`builder.Services.AddCors(o => o.AddPolicy(\"web\", p => p.WithOrigins(\"https://app.example.com\")…))` і `app.UseCors(\"web\")` у правильному місці конвеєра"],
          ["Disable HTTPS", "Вимкнути HTTPS"],
          ["Add the header in JavaScript on the client", "Додати заголовок у JavaScript на клієнті"],
          ["CORS is configured only in the browser settings", "CORS налаштовується лише в налаштуваннях браузера"],
        ],
        "a",
      ),
      question(
        "stack-algo",
        ["How is `Stack<T>` implemented in .NET?", "Як реалізовано `Stack<T>` у .NET?"],
        [
          ["As an array that grows (doubles) when full; Push/Pop are amortized O(1) at the end of the array", "Як масив, що росте (подвоюється), коли заповнений; Push/Pop — амортизовано O(1) у кінці масиву"],
          ["As a linked list of nodes", "Як зв'язний список вузлів"],
          ["As a red-black tree", "Як червоно-чорне дерево"],
          ["As a hash table", "Як хеш-таблиця"],
        ],
        "a",
      ),
      question(
        "struct-ctor",
        ["Why historically couldn't a struct declare a parameterless constructor?", "Чому історично структура не могла оголосити конструктор без параметрів?"],
        [
          ["`default(T)`, array elements and fields are zero-initialized without calling any constructor, so a custom parameterless constructor would not run reliably; C# 10 allows one but `default` still skips it", "`default(T)`, елементи масивів і поля ініціалізуються нулями без виклику конструктора, тож власний конструктор без параметрів не викликався б надійно; C# 10 його дозволяє, але `default` усе одно його пропускає"],
          ["Structs have no constructors at all", "У структур взагалі немає конструкторів"],
          ["The GC forbids it", "GC це забороняє"],
          ["Because structs live on the stack", "Бо структури живуть у стеку"],
        ],
        "a",
      ),
    ]),
    seniorRuntimeQuiz2,
    expressionFilterPractice,
    ownStackPractice,
  ],
};

const seniorDatabasesModule: ModuleDef = {
  slug: "senior-databases",
  title: { en: "Senior: databases", uk: "Senior: бази даних" },
  slides: [
    lecture("senior-databases", "Databases at Senior level", "Бази даних на рівні Senior"),
    seniorDbConcurrencyLecture,
    quiz("senior-databases-quiz", "Databases at Senior level", "Бази даних на рівні Senior", [
      question(
        "storage",
        ["How does SQL Server physically store table data?", "Як SQL Server фізично зберігає дані таблиці?"],
        [
          ["In 8 KB pages grouped into 64 KB extents; a clustered table is a B+-tree whose leaf pages hold the rows", "У сторінках по 8 КБ, згрупованих в екстенти по 64 КБ; кластерна таблиця — це B+-дерево, листові сторінки якого містять рядки"],
          ["In one CSV file per table", "В одному CSV-файлі на таблицю"],
          ["Only in RAM", "Лише в оперативній пам'яті"],
          ["As JSON documents", "Як JSON-документи"],
        ],
        "a",
      ),
      question(
        "denorm",
        ["When is denormalization justified?", "Коли денормалізація виправдана?"],
        [
          ["Read-heavy paths where joins are too expensive (reporting, read models in CQRS, counters)", "На шляхах із переважно читанням, де з'єднання надто дорогі (звітність, read-моделі в CQRS, лічильники)"],
          ["Always, to save disk space", "Завжди, щоб заощадити місце на диску"],
          ["When you have no foreign keys", "Коли у вас немає зовнішніх ключів"],
          ["Never", "Ніколи"],
        ],
        "a",
      ),
      question(
        "acid-impl",
        ["How do RDBMSs implement atomicity and durability?", "Як СУБД реалізують атомарність і довговічність?"],
        [
          ["Write-ahead log: changes are written to the transaction log and flushed on commit before data pages; crash recovery redoes committed and undoes uncommitted work", "Журнал попереднього запису: зміни пишуться в журнал транзакцій і скидаються на диск під час коміту раніше за сторінки даних; відновлення після збою повторює закомічене й відкочує незакомічене"],
          ["By copying the whole database on every commit", "Копіюючи всю базу під час кожного коміту"],
          ["Through the application's try/catch", "Через try/catch застосунку"],
          ["By disabling concurrency", "Вимикаючи конкурентність"],
        ],
        "a",
      ),
      question(
        "concurrency-problems",
        ["Which problems arise from concurrent database access?", "Які проблеми виникають через конкурентний доступ до бази?"],
        [
          ["Lost updates", "Втрачені оновлення"],
          ["Dirty, non-repeatable and phantom reads", "Брудне, неповторюване й фантомне читання"],
          ["Deadlocks and lock escalation / blocking", "Взаємні блокування та ескалація блокувань / очікування"],
          ["Stack overflows", "Переповнення стеку"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "distributed-lock",
        ["Which is a sound way to build a distributed lock?", "Який спосіб побудувати розподілене блокування коректний?"],
        [
          ["Redis `SET key token NX PX 30000` with a unique token, releasing only if the token matches, plus a fencing token for writes", "Redis `SET key token NX PX 30000` з унікальним токеном, звільнення лише якщо токен збігається, плюс fencing-токен для записів"],
          ["A SQL Server application lock (`sp_getapplock`) or a PostgreSQL advisory lock", "Application lock у SQL Server (`sp_getapplock`) або advisory lock у PostgreSQL"],
          ["A static `lock` object in each service instance", "Статичний об'єкт `lock` у кожному екземплярі сервісу"],
          ["A file on the local disk of one server", "Файл на локальному диску одного сервера"],
        ],
        ["a", "b"],
      ),
      question(
        "isolation-senior",
        ["Two transactions read a balance and both withdraw, leaving it negative. Which fixes this?", "Дві транзакції читають баланс і обидві знімають кошти, лишаючи його від'ємним. Що це виправить?"],
        [
          ["`UPDATE … SET balance = balance - @x WHERE id = @id AND balance >= @x` (atomic conditional update)", "`UPDATE … SET balance = balance - @x WHERE id = @id AND balance >= @x` (атомарне умовне оновлення)"],
          ["Optimistic concurrency with a rowversion column", "Оптимістична конкурентність із колонкою rowversion"],
          ["`SELECT … WITH (UPDLOCK)` / `SELECT … FOR UPDATE` or the Serializable level", "`SELECT … WITH (UPDLOCK)` / `SELECT … FOR UPDATE` або рівень Serializable"],
          ["`READ UNCOMMITTED`", "`READ UNCOMMITTED`"],
        ],
        ["a", "b", "c"],
      ),
    ]),
    seniorDbQuiz2,
    claimJobsPractice,
    distributedLockPractice,
  ],
};

const seniorMicroservicesModule: ModuleDef = {
  slug: "senior-microservices-azure",
  title: { en: "Senior: microservices and Azure", uk: "Senior: мікросервіси та Azure" },
  slides: [
    lecture("senior-microservices-azure", "Microservices, messaging and Azure", "Мікросервіси, обмін повідомленнями та Azure"),
    seniorResilienceLecture,
    quiz("senior-microservices-azure-quiz", "Microservices and Azure", "Мікросервіси та Azure", [
      question(
        "circuit-breaker",
        ["What does a circuit breaker do?", "Що робить circuit breaker?"],
        [
          ["After repeated failures it 'opens' and fails calls fast for a while, then lets a trial call through (half-open) before closing again", "Після повторних збоїв він «розмикається» й деякий час одразу відхиляє виклики, потім пропускає пробний виклик (напіввідкритий стан), перш ніж знову замкнутися"],
          ["It retries forever", "Він повторює виклики вічно"],
          ["It encrypts traffic", "Він шифрує трафік"],
          ["It balances load between instances", "Він балансує навантаження між екземплярами"],
        ],
        "a",
      ),
      question(
        "saga",
        ["Which are ways to keep data consistent across microservices without a distributed ACID transaction?", "Які способи підтримувати узгодженість даних між мікросервісами без розподіленої ACID-транзакції?"],
        [
          ["Saga with compensating actions (orchestration or choreography)", "Сага з компенсувальними діями (оркестрація чи хореографія)"],
          ["Transactional outbox + idempotent consumers", "Transactional outbox + ідемпотентні споживачі"],
          ["Two-phase commit (possible but rarely practical)", "Двофазний коміт (можливий, але рідко практичний)"],
          ["Sharing one database table between all services", "Спільна таблиця бази для всіх сервісів"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "tracing",
        ["How do you trace one request across many microservices?", "Як простежити один запит через багато мікросервісів?"],
        [
          ["Distributed tracing with OpenTelemetry: a trace id propagated in the W3C `traceparent` header, spans exported to Jaeger / Zipkin / Application Insights", "Розподілене трасування з OpenTelemetry: trace id передається в заголовку W3C `traceparent`, span-и експортуються в Jaeger / Zipkin / Application Insights"],
          ["Grep each service's log file by timestamp", "Шукати в лог-файлі кожного сервісу за часом"],
          ["Attach a debugger to every service", "Підключити відладчик до кожного сервісу"],
          ["It is impossible", "Це неможливо"],
        ],
        "a",
      ),
      question(
        "exactly-once",
        ["Which statements about delivery semantics are true?", "Які твердження про семантику доставки правильні?"],
        [
          ["At-most-once: ack before processing; a crash loses the message", "At-most-once: підтвердження до обробки; падіння губить повідомлення"],
          ["At-least-once: ack after processing; a crash causes redelivery, so handlers must be idempotent", "At-least-once: підтвердження після обробки; падіння спричиняє повторну доставку, тож обробники мають бути ідемпотентними"],
          ["Kafka transactions give exactly-once only within Kafka (read-process-write); with external side effects you still need idempotency", "Транзакції Kafka дають exactly-once лише в межах Kafka (read-process-write); із зовнішніми побічними ефектами ідемпотентність усе одно потрібна"],
          ["Every broker guarantees exactly-once end to end", "Кожен брокер гарантує exactly-once від початку до кінця"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "queue-topic",
        ["Azure Service Bus: queue vs topic?", "Azure Service Bus: черга чи топік?"],
        [
          ["A queue delivers each message to one competing consumer; a topic delivers a copy to every subscription (publish/subscribe), with optional filters", "Черга доставляє кожне повідомлення одному з конкурентних споживачів; топік доставляє копію в кожну підписку (publish/subscribe) з необов'язковими фільтрами"],
          ["Topics are faster queues", "Топіки — це швидші черги"],
          ["Queues support only JSON", "Черги підтримують лише JSON"],
          ["There is no difference", "Різниці немає"],
        ],
        "a",
      ),
      question(
        "cold-start",
        ["How do you reduce cold starts in Azure Functions?", "Як зменшити холодні старти в Azure Functions?"],
        [
          ["Use the Premium (Elastic Premium) or Flex Consumption plan with always-ready / pre-warmed instances, or a Dedicated plan with Always On", "Використати план Premium (Elastic Premium) чи Flex Consumption з постійно готовими / прогрітими екземплярами або Dedicated-план з Always On"],
          ["Keep the deployment small, avoid heavy startup work, use ReadyToRun / isolated worker optimizations", "Тримати пакет розгортання малим, уникати важкої роботи під час старту, використати ReadyToRun / оптимізації isolated worker"],
          ["Ping the function with a timer trigger (a workaround)", "«Пінгувати» функцію тригером за таймером (обхідний шлях)"],
          ["Increase the function timeout", "Збільшити тайм-аут функції"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "table-storage",
        ["Which are real limitations of Azure Table Storage?", "Які з цього — реальні обмеження Azure Table Storage?"],
        [
          ["Queries are efficient only by PartitionKey and RowKey; no secondary indexes", "Запити ефективні лише за PartitionKey і RowKey; вторинних індексів немає"],
          ["Batch transactions only within one partition (up to 100 operations)", "Пакетні транзакції лише в межах однієї партиції (до 100 операцій)"],
          ["Entity size limit of 1 MB, no joins", "Обмеження розміру сутності 1 МБ, жодних з'єднань"],
          ["It cannot store more than 1,000 rows", "Вона не може зберігати понад 1000 рядків"],
        ],
        ["a", "b", "c"],
      ),
    ]),
    seniorMicroservicesQuiz2,
    circuitBreakerPractice,
    sagaPractice,
  ],
};

const seniorPracticalModule: ModuleDef = {
  slug: "senior-practical",
  title: { en: "Senior: practical tasks", uk: "Senior: практичні задачі" },
  slides: [
    lecture("senior-system-design", "Practical tasks: system design", "Практичні задачі: проєктування систем"),
    bidCounterPractice,
    practice("sudoku-validator", "Sudoku validator", "Перевірка судоку", {
      starter: PROGRAM_WITH(sudokuTypes(stub), sudokuMain),
      solution: PROGRAM_WITH(
        sudokuTypes(`        for (int i = 0; i < 9; i++)
        {
            var row = new bool[10];
            var column = new bool[10];
            var box = new bool[10];
            for (int j = 0; j < 9; j++)
            {
                if (!Mark(row, grid[i, j])) return false;
                if (!Mark(column, grid[j, i])) return false;
                int r = (i / 3) * 3 + j / 3, c = (i % 3) * 3 + j % 3;
                if (!Mark(box, grid[r, c])) return false;
            }
        }
        return true;
    }

    // Marks a digit as seen; false if it is out of range or was already seen.
    static bool Mark(bool[] seen, int digit)
    {
        if (digit < 1 || digit > 9 || seen[digit]) return false;
        seen[digit] = true;
        return true;`),
        sudokuMain,
      ),
      expectedOutput: "valid: True\nswapped in a row: False\nwith a zero: False\nrows and columns only: False\n",
    }),
    practice("custom-linq", "Your own Select, Where and SelectMany", "Власні Select, Where і SelectMany", {
      starter: PROGRAM_WITH(linqTypes(stub, stub, stub), linqMain, "using System.Collections.Generic;", linqMembers),
      solution: PROGRAM_WITH(
        linqTypes(
          `        if (source == null) throw new ArgumentNullException("source");
        if (selector == null) throw new ArgumentNullException("selector");
        return SelectIterator(source, selector);
    }

    static IEnumerable<TResult> SelectIterator<TSource, TResult>(IEnumerable<TSource> source, Func<TSource, TResult> selector)
    {
        foreach (var item in source) yield return selector(item);`,
          `        if (source == null) throw new ArgumentNullException("source");
        if (predicate == null) throw new ArgumentNullException("predicate");
        return WhereIterator(source, predicate);
    }

    static IEnumerable<TSource> WhereIterator<TSource>(IEnumerable<TSource> source, Func<TSource, bool> predicate)
    {
        foreach (var item in source)
            if (predicate(item)) yield return item;`,
          `        if (source == null) throw new ArgumentNullException("source");
        if (selector == null) throw new ArgumentNullException("selector");
        return SelectManyIterator(source, selector);
    }

    static IEnumerable<TResult> SelectManyIterator<TSource, TResult>(IEnumerable<TSource> source, Func<TSource, IEnumerable<TResult>> selector)
    {
        foreach (var item in source)
            foreach (var inner in selector(item))
                yield return inner;`,
        ),
        linqMain,
        "using System.Collections.Generic;",
        linqMembers,
      ),
      expectedOutput:
        "after building the query: 0 items produced\nyield 1, yield 2, got 20, yield 3, yield 4, got 40\na b c d e\nSelect, null source: ArgumentNullException\nWhere, null predicate: ArgumentNullException\nSelectMany, null selector: ArgumentNullException\n",
    }),
    practice("linq-filter", "LINQ tasks", "Задачі на LINQ", {
      starter: PROGRAM_WITH(filterTypes(stub, stub), filterMain, "using System.Collections.Generic;\nusing System.Linq;\nusing System.Text.RegularExpressions;"),
      solution: PROGRAM_WITH(
        filterTypes(
          `        if (n == 0) throw new ArgumentException("n must not be 0.", "n");
        return collection.Where(x => x % n == 0).OrderByDescending(x => x).ToList();`,
          `        return Regex.Split(text.ToLowerInvariant(), "[^a-z]+")
            .Where(w => w.Length > 0)
            .Distinct()
            .OrderBy(w => w.Length)
            .ThenBy(w => w, StringComparer.Ordinal)
            .ToList();`,
        ),
        filterMain,
        "using System.Collections.Generic;\nusing System.Linq;\nusing System.Text.RegularExpressions;",
      ),
      expectedOutput: "15 12 9 6 3\n2 0 -2 -4\n[]\nArgumentException\ndog fox the lazy over brown jumps quick sleeps\n",
    }),
  ],
};

export const seniorModules: ModuleDef[] = [
  seniorEngineeringModule,
  seniorRuntimeModule,
  seniorDatabasesModule,
  seniorMicroservicesModule,
  seniorPracticalModule,
];
