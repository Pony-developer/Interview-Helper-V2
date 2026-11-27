import { PROGRAM_WITH } from "../csharp-code";
import { WRITE_QUERY } from "../databases-data";
import { question } from "../frontend-interview-modules/quiz";
import type { SlideDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";

const stub = "        throw new NotImplementedException();";

/* ---------- senior-engineering ---------- */

const mediatorTypes = (send: string, validate: string) => `interface IHandler<TRequest, TResponse> { TResponse Handle(TRequest request); }
interface IBehavior<TRequest, TResponse> { TResponse Handle(TRequest request, Func<TResponse> next); }

class CreateOrder { public string Customer; public decimal Amount; }
class GetOrderCount { }

class OrderStore { public int Count; }

class CreateOrderHandler : IHandler<CreateOrder, int>
{
    private readonly OrderStore store;
    public CreateOrderHandler(OrderStore store) { this.store = store; }
    public int Handle(CreateOrder request)
    {
        Console.WriteLine("handle CreateOrder for " + request.Customer);
        return ++store.Count;
    }
}

class GetOrderCountHandler : IHandler<GetOrderCount, int>
{
    private readonly OrderStore store;
    public GetOrderCountHandler(OrderStore store) { this.store = store; }
    public int Handle(GetOrderCount request) { return store.Count; }
}

class LoggingBehavior<TRequest, TResponse> : IBehavior<TRequest, TResponse>
{
    public TResponse Handle(TRequest request, Func<TResponse> next)
    {
        Console.WriteLine("-> " + typeof(TRequest).Name);
        TResponse response = next();
        Console.WriteLine("<- " + typeof(TRequest).Name + " = " + response);
        return response;
    }
}

class ValidationBehavior : IBehavior<CreateOrder, int>
{
    // Rejects a non-positive amount with ArgumentException("Amount must be positive") WITHOUT calling next;
    // otherwise continues the pipeline.
    public int Handle(CreateOrder request, Func<int> next)
    {
${validate}
    }
}

class Mediator
{
    private readonly Dictionary<Type, object> handlers = new Dictionary<Type, object>();
    private readonly List<object> behaviors = new List<object>();

    public void Register<TRequest, TResponse>(IHandler<TRequest, TResponse> handler) { handlers[typeof(TRequest)] = handler; }
    public void AddBehavior(object behavior) { behaviors.Add(behavior); }

    // Finds the handler for TRequest and wraps it in every registered IBehavior<TRequest, TResponse>,
    // the first registered behavior being the OUTERMOST. Behaviors for other request types are ignored.
    public TResponse Send<TRequest, TResponse>(TRequest request)
    {
${send}
    }
}`;

const mediatorMain = `        var store = new OrderStore();
        var mediator = new Mediator();
        mediator.Register(new CreateOrderHandler(store));
        mediator.Register(new GetOrderCountHandler(store));
        mediator.AddBehavior(new LoggingBehavior<CreateOrder, int>());
        mediator.AddBehavior(new LoggingBehavior<GetOrderCount, int>());
        mediator.AddBehavior(new ValidationBehavior());

        foreach (var order in new[] { new CreateOrder { Customer = "ann", Amount = 10m }, new CreateOrder { Customer = "eve", Amount = 0m }, new CreateOrder { Customer = "bob", Amount = 5m } })
        {
            try { mediator.Send<CreateOrder, int>(order); }
            catch (ArgumentException e) { Console.WriteLine("rejected: " + e.Message); }
        }
        mediator.Send<GetOrderCount, int>(new GetOrderCount());`;

export const mediatorPractice = practice("mediator-pipeline", "Cross-cutting concerns with a mediator pipeline", "Наскрізна функціональність через конвеєр медіатора", {
  starter: PROGRAM_WITH(mediatorTypes(stub, stub), mediatorMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    mediatorTypes(
      `        var handler = (IHandler<TRequest, TResponse>)handlers[typeof(TRequest)];
        Func<TResponse> next = () => handler.Handle(request);
        foreach (var behavior in behaviors.OfType<IBehavior<TRequest, TResponse>>().Reverse())
        {
            var inner = next;
            var current = behavior;
            next = () => current.Handle(request, inner);
        }
        return next();`,
      `        if (request.Amount <= 0) throw new ArgumentException("Amount must be positive");
        return next();`,
    ),
    mediatorMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput:
    "-> CreateOrder\nhandle CreateOrder for ann\n<- CreateOrder = 1\n-> CreateOrder\nrejected: Amount must be positive\n-> CreateOrder\nhandle CreateOrder for bob\n<- CreateOrder = 2\n-> GetOrderCount\n<- GetOrderCount = 2\n",
});

export const seniorEngineeringExtras: SlideDef[] = [
  lecture("senior-architecture-styles", "Architecture styles: layers, clean architecture, DDD, CQRS, vertical slices", "Архітектурні стилі: шари, чиста архітектура, DDD, CQRS, вертикальні зрізи"),
  quiz("senior-engineering-quiz-3", "Engineering practice, part 3", "Інженерна практика, частина 3", [
    question(
      "clean-arch-rule",
      ["What is the dependency rule of Clean/Onion architecture?", "Яке правило залежностей у чистій/«цибулевій» архітектурі?"],
      [
        ["Source dependencies point inward: the domain depends on nothing; infrastructure depends on the domain's abstractions", "Залежності в коді спрямовані всередину: домен ні від чого не залежить; інфраструктура залежить від абстракцій домену"],
        ["The domain references EF Core and ASP.NET", "Домен посилається на EF Core та ASP.NET"],
        ["The UI is in the center", "UI в центрі"],
        ["Every layer references every other layer", "Кожен шар посилається на кожен інший"],
      ],
      "a",
    ),
    question(
      "aggregate",
      ["In DDD, what is an aggregate?", "Що таке агрегат у DDD?"],
      [
        ["A cluster of entities changed together through one root that enforces its invariants; one transaction per aggregate", "Група сутностей, які змінюються разом через один корінь, що гарантує їхні інваріанти; одна транзакція на агрегат"],
        ["A SQL GROUP BY result", "Результат SQL GROUP BY"],
        ["A collection of services", "Колекція сервісів"],
        ["A NuGet package", "Пакет NuGet"],
      ],
      "a",
    ),
    question(
      "cqrs",
      ["What does CQRS separate?", "Що розділяє CQRS?"],
      [
        ["The write model (commands that change state) from the read model (queries optimized for reading)", "Модель запису (команди, що змінюють стан) і модель читання (запити, оптимізовані для читання)"],
        ["Frontend from backend", "Frontend і backend"],
        ["Unit tests from integration tests", "Модульні тести й інтеграційні"],
        ["Classes from interfaces", "Класи й інтерфейси"],
      ],
      "a",
    ),
    question(
      "vertical-slice",
      ["What is vertical slice architecture?", "Що таке архітектура вертикальних зрізів?"],
      [
        ["Code is organized by feature (request + handler + validation + data access together) instead of by technical layer", "Код організовано за функціональністю (запит + обробник + валідація + доступ до даних разом), а не за технічними шарами"],
        ["Each layer is deployed separately", "Кожен шар розгортається окремо"],
        ["A UI layout technique", "Техніка верстки UI"],
        ["Splitting tables vertically", "Вертикальне розділення таблиць"],
      ],
      "a",
    ),
    question(
      "anemic",
      ["What is an anemic domain model?", "Що таке анемічна доменна модель?"],
      [
        ["Entities with only getters/setters and all logic in services — invariants aren't protected by the objects themselves", "Сутності лише з геттерами/сетерами, а вся логіка в сервісах — інваріанти не захищені самими об'єктами"],
        ["A model with too many methods", "Модель із забагатьма методами"],
        ["A model without a database", "Модель без бази даних"],
        ["A performance optimization", "Оптимізація продуктивності"],
      ],
      "a",
    ),
    question(
      "pipeline-order",
      ["Behaviors are registered as Logging, Validation, Transaction. Which runs first for a request?", "Behaviors зареєстровано як Logging, Validation, Transaction. Що виконається першим для запиту?"],
      [
        ["Logging (the outermost), then Validation, then Transaction, then the handler", "Logging (найзовнішній), потім Validation, потім Transaction, потім обробник"],
        ["The handler", "Обробник"],
        ["Transaction", "Transaction"],
        ["The order is random", "Порядок випадковий"],
      ],
      "a",
    ),
    question(
      "adr",
      ["What is an Architecture Decision Record (ADR)?", "Що таке Architecture Decision Record (ADR)?"],
      [
        ["A short document capturing a decision, its context, the options considered and the consequences", "Короткий документ, що фіксує рішення, його контекст, розглянуті варіанти й наслідки"],
        ["A database migration", "Міграція бази даних"],
        ["A code coverage report", "Звіт про покриття коду"],
        ["A deployment log", "Журнал розгортання"],
      ],
      "a",
    ),
    question(
      "tech-debt",
      ["How do you argue for paying down technical debt with a product owner?", "Як аргументувати перед product owner потребу сплатити технічний борг?"],
      [
        ["In business terms: lead time, incident rate, cost of changes — with data, and propose incremental work alongside features", "Бізнесовими термінами: час доставки, частота інцидентів, вартість змін — з даними, і запропонувати поступову роботу поруч із функціоналом"],
        ["Ask for a rewrite from scratch", "Попросити переписати все з нуля"],
        ["Stop delivering features until it's fixed", "Зупинити доставку функцій, доки не виправлено"],
        ["Don't mention it", "Не згадувати про нього"],
      ],
      "a",
    ),
  ]),
  mediatorPractice,
];

/* ---------- senior-runtime ---------- */

const lockFreeTypes = (push: string, pop: string, max: string) => `class LockFreeStack<T>
{
    private class Node
    {
        public T Value;
        public Node Next;
    }

    private Node head;

    // Treiber stack: read the head, link the new node to it, and publish it with
    // Interlocked.CompareExchange(ref head, node, observedHead); retry if another thread got there first.
    public void Push(T value)
    {
${push}
    }

    // The same idea: swing head from the observed node to its Next; false when the stack is empty.
    public bool TryPop(out T value)
    {
${pop}
    }

    // Not thread-safe; for checking results only.
    public int Count
    {
        get { int n = 0; for (var node = head; node != null; node = node.Next) n++; return n; }
    }
}

static class Atomic
{
    // Sets target to value if value is larger, atomically, with a CompareExchange loop (no lock).
    public static void Max(ref int target, int value)
    {
${max}
    }
}`;

const lockFreeMain = `        var stack = new LockFreeStack<int>();
        Parallel.For(0, 10000, i => stack.Push(i));
        Console.WriteLine("pushed: " + stack.Count);

        long sum = 0;
        int pops = 0;
        Parallel.For(0, 4, _ =>
        {
            int value;
            while (stack.TryPop(out value))
            {
                Interlocked.Add(ref sum, value);
                Interlocked.Increment(ref pops);
            }
        });
        int dummy;
        Console.WriteLine("popped: " + pops + ", sum: " + sum + ", empty: " + !stack.TryPop(out dummy));

        int max = int.MinValue;
        Parallel.For(0, 100000, i => Atomic.Max(ref max, (i * 7919) % 100003));
        Console.WriteLine("max: " + max);`;

export const lockFreeStackPractice = practice("lock-free-stack", "Lock-free code with Interlocked.CompareExchange", "Неблокуючий код з Interlocked.CompareExchange", {
  starter: PROGRAM_WITH(lockFreeTypes(stub, stub, stub), lockFreeMain, "using System.Threading;\nusing System.Threading.Tasks;"),
  solution: PROGRAM_WITH(
    lockFreeTypes(
      `        var node = new Node { Value = value };
        while (true)
        {
            Node observed = Volatile.Read(ref head);
            node.Next = observed;
            if (Interlocked.CompareExchange(ref head, node, observed) == observed) return;
        }`,
      `        while (true)
        {
            Node observed = Volatile.Read(ref head);
            if (observed == null) { value = default(T); return false; }
            if (Interlocked.CompareExchange(ref head, observed.Next, observed) == observed)
            {
                value = observed.Value;
                return true;
            }
        }`,
      `        int current = Volatile.Read(ref target);
        while (value > current)
        {
            int seen = Interlocked.CompareExchange(ref target, value, current);
            if (seen == current) return;
            current = seen;
        }`,
    ),
    lockFreeMain,
    "using System.Threading;\nusing System.Threading.Tasks;",
  ),
  expectedOutput: "pushed: 10000\npopped: 10000, sum: 49995000, empty: True\nmax: 100002\n",
});

export const seniorRuntimeExtras: SlideDef[] = [
  lecture("senior-threading-primitives", "Synchronization primitives and the memory model", "Примітиви синхронізації та модель пам'яті"),
  quiz("senior-runtime-quiz-3", "The runtime in depth, part 3", "Рантайм у деталях, частина 3", [
    question(
      "volatile",
      ["What does `volatile` (or `Volatile.Read/Write`) guarantee?", "Що гарантує `volatile` (або `Volatile.Read/Write`)?"],
      [
        ["Reads and writes aren't cached/reordered in ways that hide other threads' writes — but it does NOT make `x++` atomic", "Читання й записи не кешуються й не переставляються так, щоб приховати записи інших потоків — але це НЕ робить `x++` атомарним"],
        ["Full mutual exclusion", "Повне взаємне виключення"],
        ["That the field is on the stack", "Що поле в стеку"],
        ["Atomic increments", "Атомарні інкременти"],
      ],
      "a",
    ),
    question(
      "cas",
      ["`Interlocked.CompareExchange(ref x, newValue, expected)` …", "`Interlocked.CompareExchange(ref x, newValue, expected)` …"],
      [
        ["atomically sets x to newValue only if x equals expected, and returns the original value", "атомарно встановлює x у newValue лише якщо x дорівнює expected і повертає початкове значення"],
        ["always sets x", "завжди встановлює x"],
        ["locks x until released", "блокує x до звільнення"],
        ["compares two strings", "порівнює два рядки"],
      ],
      "a",
    ),
    question(
      "rwlock",
      ["When is `ReaderWriterLockSlim` better than `lock`?", "Коли `ReaderWriterLockSlim` кращий за `lock`?"],
      [
        ["Many concurrent readers, rare writers, and reads that take noticeable time", "Багато одночасних читачів, рідкісні записувачі, і читання займає помітний час"],
        ["Always", "Завжди"],
        ["Only with async code", "Лише з асинхронним кодом"],
        ["When there is only one thread", "Коли є лише один потік"],
      ],
      "a",
    ),
    question(
      "semaphore-mutex",
      ["`Mutex` vs `SemaphoreSlim`?", "`Mutex` чи `SemaphoreSlim`?"],
      [
        ["Mutex is an OS object, can be named and shared across processes, owned by a thread; SemaphoreSlim is in-process, allows N holders and supports `WaitAsync`", "Mutex — об'єкт ОС, може мати ім'я й бути спільним між процесами, ним володіє потік; SemaphoreSlim — у межах процесу, дозволяє N власників і підтримує `WaitAsync`"],
        ["They are the same", "Вони однакові"],
        ["SemaphoreSlim works across machines", "SemaphoreSlim працює між машинами"],
        ["Mutex supports await", "Mutex підтримує await"],
      ],
      "a",
    ),
    question(
      "aba",
      ["What is the ABA problem in lock-free code?", "Що таке проблема ABA в неблокуючому коді?"],
      [
        ["A value changes from A to B and back to A between a read and a CAS, so the CAS wrongly succeeds; the GC largely avoids it for reference-based structures in .NET", "Значення змінюється з A на B і назад на A між читанням і CAS, тож CAS помилково вдається; у .NET GC здебільшого запобігає цьому для структур на посиланнях"],
        ["A deadlock between threads A and B", "Взаємне блокування потоків A і B"],
        ["A naming convention", "Домовленість про імена"],
        ["Two async methods awaiting each other", "Два async-методи, що чекають один на одного"],
      ],
      "a",
    ),
    question(
      "threadlocal",
      ["What does `AsyncLocal<T>` give you that `ThreadLocal<T>` doesn't?", "Що дає `AsyncLocal<T>`, чого немає в `ThreadLocal<T>`?"],
      [
        ["The value flows with the async execution context across awaits, even when the continuation runs on another thread", "Значення переходить разом з асинхронним контекстом виконання через await, навіть коли продовження виконується в іншому потоці"],
        ["Faster access", "Швидший доступ"],
        ["Cross-process sharing", "Спільний доступ між процесами"],
        ["Nothing", "Нічого"],
      ],
      "a",
    ),
    question(
      "concurrent-collections",
      ["Which statements about concurrent collections are true?", "Які твердження про конкурентні колекції правильні?"],
      [
        ["`ConcurrentDictionary` uses fine-grained locks; reads are lock-free", "`ConcurrentDictionary` використовує дрібнозернисті блокування; читання без блокувань"],
        ["`ConcurrentQueue` is lock-free", "`ConcurrentQueue` неблокуючий"],
        ["`Channel<T>` supports async producers/consumers with bounded capacity and backpressure", "`Channel<T>` підтримує асинхронних продюсерів/споживачів з обмеженою місткістю і зворотним тиском"],
        ["A `List<T>` is safe for concurrent writes", "`List<T>` безпечний для одночасних записів"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "lazy-modes",
      ["`new Lazy<T>(factory)` by default is…", "`new Lazy<T>(factory)` за замовчуванням…"],
      [
        ["Thread-safe: `ExecutionAndPublication` — the factory runs once even under contention", "Потокобезпечний: `ExecutionAndPublication` — фабрика виконується раз навіть при конкуренції"],
        ["Not thread-safe", "Не потокобезпечний"],
        ["`PublicationOnly` — the factory may run several times", "`PublicationOnly` — фабрика може виконатися кілька разів"],
        ["Evaluated immediately", "Обчислюється одразу"],
      ],
      "a",
    ),
  ]),
  lockFreeStackPractice,
];

/* ---------- senior-databases ---------- */

export const keysetSqlPractice: SlideDef = {
  kind: "practice",
  slug: "keyset-pagination",
  title: { en: "Practice: Keyset pagination", uk: "Практика «Keyset-пагінація»" },
  language: "sql",
  setup: `CREATE TABLE events (
    id         integer PRIMARY KEY,
    created_at timestamp NOT NULL,
    title      text NOT NULL
);

CREATE INDEX ix_events_created_id ON events (created_at DESC, id DESC);

INSERT INTO events VALUES
    (1, '2026-03-01 09:00', 'deploy v1.0'),
    (2, '2026-03-01 09:00', 'cache warmed'),
    (3, '2026-03-01 10:15', 'alert: CPU'),
    (4, '2026-03-02 08:00', 'deploy v1.1'),
    (5, '2026-03-02 08:00', 'migration run'),
    (6, '2026-03-02 08:00', 'smoke tests passed'),
    (7, '2026-03-02 12:30', 'alert: memory'),
    (8, '2026-03-03 07:45', 'deploy v1.2'),
    (9, '2026-03-03 07:45', 'rollback v1.2'),
    (10, '2026-03-03 11:00', 'incident closed');
`,
  starter: WRITE_QUERY,
  solution: `SELECT id, created_at, title
FROM events
ORDER BY created_at DESC, id DESC
LIMIT 3;

SELECT id, created_at, title
FROM events
WHERE (created_at, id) < ('2026-03-03 07:45', 8)
ORDER BY created_at DESC, id DESC
LIMIT 3;

SELECT id, created_at, title
FROM events
WHERE (created_at, id) < ('2026-03-02 08:00', 5)
ORDER BY created_at DESC, id DESC
LIMIT 3;
`,
  expectedOutput: " id |     created_at      |      title\n----+---------------------+-----------------\n 10 | 2026-03-03 11:00:00 | incident closed\n  9 | 2026-03-03 07:45:00 | rollback v1.2\n  8 | 2026-03-03 07:45:00 | deploy v1.2\n(3 rows)\n\n id |     created_at      |       title\n----+---------------------+--------------------\n  7 | 2026-03-02 12:30:00 | alert: memory\n  6 | 2026-03-02 08:00:00 | smoke tests passed\n  5 | 2026-03-02 08:00:00 | migration run\n(3 rows)\n\n id |     created_at      |    title\n----+---------------------+--------------\n  4 | 2026-03-02 08:00:00 | deploy v1.1\n  3 | 2026-03-01 10:15:00 | alert: CPU\n  2 | 2026-03-01 09:00:00 | cache warmed\n(3 rows)\n",
  maxScore: 3,
};

export const seniorDatabasesExtras: SlideDef[] = [
  lecture("senior-db-scaling", "Scaling databases: replication, partitioning, sharding, CAP", "Масштабування баз: реплікація, партиціювання, шардинг, CAP"),
  quiz("senior-databases-quiz-3", "Databases at Senior level, part 3", "Бази даних на рівні Senior, частина 3", [
    question(
      "replication-lag",
      ["A user saves a profile and immediately reloads it from a read replica — the old data appears. Fixes?", "Користувач зберігає профіль і одразу перечитує його з репліки — бачить старі дані. Як виправити?"],
      [
        ["Read-your-writes: route that user's reads to the primary for a short time after a write", "Read-your-writes: певний час після запису направляти читання цього користувача на primary"],
        ["Return the saved data from the write response instead of re-reading", "Повертати збережені дані у відповіді на запис, замість перечитування"],
        ["Wait for the replica to catch up (session consistency tokens / LSN)", "Чекати, доки репліка наздожене (токени узгодженості сесії / LSN)"],
        ["Disable replication", "Вимкнути реплікацію"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "partition-vs-shard",
      ["Partitioning vs sharding?", "Партиціювання чи шардинг?"],
      [
        ["Partitioning splits a table inside one database server (e.g. by month); sharding spreads data across several servers by a shard key", "Партиціювання ділить таблицю в межах одного сервера (наприклад, за місяцями); шардинг розносить дані по кількох серверах за ключем шарда"],
        ["They are synonyms", "Це синоніми"],
        ["Sharding is only for NoSQL", "Шардинг лише для NoSQL"],
        ["Partitioning requires several servers", "Партиціювання вимагає кількох серверів"],
      ],
      "a",
    ),
    question(
      "shard-key",
      ["What makes a good shard key?", "Який ключ шарда добрий?"],
      [
        ["High cardinality, even distribution, and most queries include it (e.g. tenant id)", "Висока кардинальність, рівномірний розподіл, і більшість запитів його містять (наприклад, id тенанта)"],
        ["A boolean column", "Булева колонка"],
        ["The creation timestamp (all new writes hit one shard)", "Час створення (усі нові записи йдуть в один шард)"],
        ["A random value that no query uses", "Випадкове значення, яке не використовує жоден запит"],
      ],
      "a",
    ),
    question(
      "keyset",
      ["Why is keyset (seek) pagination better than `OFFSET 100000 LIMIT 20` on large tables?", "Чому keyset (seek) пагінація краща за `OFFSET 100000 LIMIT 20` на великих таблицях?"],
      [
        ["The database seeks directly to the cursor via an index instead of reading and discarding 100,000 rows, and pages stay stable when rows are inserted", "База стрибає прямо до курсора через індекс, а не читає й відкидає 100 000 рядків, і сторінки стабільні при вставленні рядків"],
        ["OFFSET is not valid SQL", "OFFSET — не валідний SQL"],
        ["Keyset supports jumping to page 500 directly", "Keyset дозволяє одразу перейти на сторінку 500"],
        ["No difference", "Різниці немає"],
      ],
      "a",
    ),
    question(
      "pacelc",
      ["What does PACELC add to CAP?", "Що PACELC додає до CAP?"],
      [
        ["Even without a partition (Else), a system trades Latency against Consistency", "Навіть без розділення мережі (Else) система обирає між затримкою (Latency) і узгодженістю (Consistency)"],
        ["A fourth guarantee: Performance", "Четверту гарантію: продуктивність"],
        ["Nothing", "Нічого"],
        ["Partition tolerance is optional", "Стійкість до розділення необов'язкова"],
      ],
      "a",
    ),
    question(
      "cosmos-consistency",
      ["Azure Cosmos DB's default consistency level is…", "Рівень узгодженості Azure Cosmos DB за замовчуванням —"],
      [
        ["Session (read-your-writes within a session)", "Session (читання власних записів у межах сесії)"],
        ["Strong", "Strong"],
        ["Eventual", "Eventual"],
        ["None", "Жоден"],
      ],
      "a",
    ),
    question(
      "hot-row",
      ["Thousands of requests per second increment one counter row and lock each other. Fixes?", "Тисячі запитів на секунду інкрементують один рядок-лічильник і блокують один одного. Як виправити?"],
      [
        ["Shard the counter into N rows and sum them on read", "Розбити лічильник на N рядків і сумувати при читанні"],
        ["Buffer increments in memory/Redis and flush periodically", "Буферизувати інкременти в пам'яті/Redis і періодично скидати"],
        ["Send increments as events and aggregate asynchronously", "Надсилати інкременти подіями й агрегувати асинхронно"],
        ["Use SERIALIZABLE", "Використати SERIALIZABLE"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "backup",
      ["RPO vs RTO?", "RPO чи RTO?"],
      [
        ["RPO: how much data (time) you can afford to lose; RTO: how long recovery may take", "RPO: скільки даних (часу) можна дозволити собі втратити; RTO: скільки може тривати відновлення"],
        ["They are the same", "Це одне й те саме"],
        ["RPO is about CPU, RTO about memory", "RPO про CPU, RTO про пам'ять"],
        ["Both are about query speed", "Обидва про швидкість запитів"],
      ],
      "a",
    ),
  ]),
  keysetSqlPractice,
];

/* ---------- senior-microservices-azure ---------- */

const ringTypes = (add: string, remove: string, get: string) => `class HashRing
{
    private readonly int virtualNodes;
    private readonly List<uint> points = new List<uint>();                   // sorted
    private readonly Dictionary<uint, string> owner = new Dictionary<uint, string>();

    public HashRing(int virtualNodes) { this.virtualNodes = virtualNodes; }

    // FNV-1a, 32-bit, plus a final avalanche mix: deterministic across processes (unlike string.GetHashCode())
    // and well spread even for similar keys like "user-1", "user-2".
    public static uint Hash(string s)
    {
        uint h = 2166136261;
        foreach (char c in s) { h ^= c; h *= 16777619; }
        h ^= h >> 16; h *= 0x85ebca6b; h ^= h >> 13; h *= 0xc2b2ae35; h ^= h >> 16;
        return h;
    }

    // Adds virtualNodes points for the node: Hash(node + "#" + i) for i = 0..virtualNodes-1. Keep points sorted.
    public void AddNode(string node)
    {
${add}
    }

    // Removes all the node's points.
    public void RemoveNode(string node)
    {
${remove}
    }

    // The owner of the first point clockwise from Hash(key): the smallest point >= Hash(key),
    // wrapping around to the first point. Use List.BinarySearch (a negative result is ~insertionIndex).
    public string GetNode(string key)
    {
${get}
    }
}`;

const ringMain = `        var ring = new HashRing(100);
        foreach (var n in new[] { "A", "B", "C" }) ring.AddNode(n);
        var keys = Enumerable.Range(0, 3000).Select(i => "user-" + i).ToList();
        var before = keys.ToDictionary(k => k, ring.GetNode);
        Console.WriteLine("3 nodes: " + string.Join(", ", before.Values.GroupBy(v => v).OrderBy(g => g.Key).Select(g => g.Key + "=" + g.Count())));

        ring.AddNode("D");
        int moved = keys.Count(k => ring.GetNode(k) != before[k]);
        int movedToD = keys.Count(k => ring.GetNode(k) != before[k] && ring.GetNode(k) == "D");
        Console.WriteLine("add D: moved " + moved + " of " + keys.Count + ", all to D: " + (moved == movedToD));

        int movedModulo = keys.Count(k => HashRing.Hash(k) % 3 != HashRing.Hash(k) % 4);
        Console.WriteLine("modulo 3 -> 4: moved " + movedModulo);

        ring.RemoveNode("D");
        Console.WriteLine("remove D: back to original " + keys.All(k => ring.GetNode(k) == before[k]));`;

export const consistentHashingPractice = practice("consistent-hashing", "Consistent hashing for partitioning", "Консистентне хешування для партиціювання", {
  starter: PROGRAM_WITH(ringTypes(stub, stub, stub), ringMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    ringTypes(
      `        for (int i = 0; i < virtualNodes; i++)
        {
            uint point = Hash(node + "#" + i);
            if (owner.ContainsKey(point)) continue;
            owner[point] = node;
            int index = points.BinarySearch(point);
            points.Insert(~index, point);
        }`,
      `        foreach (var point in owner.Where(p => p.Value == node).Select(p => p.Key).ToList())
        {
            owner.Remove(point);
            points.Remove(point);
        }`,
      `        uint h = Hash(key);
        int index = points.BinarySearch(h);
        if (index < 0) index = ~index;
        if (index == points.Count) index = 0;
        return owner[points[index]];`,
    ),
    ringMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput: "3 nodes: A=1042, B=1030, C=928\nadd D: moved 744 of 3000, all to D: True\nmodulo 3 -> 4: moved 2226\nremove D: back to original True\n",
});

export const seniorMicroservicesExtras: SlideDef[] = [
  lecture("senior-observability", "Observability: logs, metrics and traces with OpenTelemetry", "Спостережуваність: логи, метрики й трейси з OpenTelemetry"),
  quiz("senior-microservices-azure-quiz-3", "Microservices and Azure, part 3", "Мікросервіси та Azure, частина 3", [
    question(
      "three-pillars",
      ["Which signal answers \"which service made this request slow?\"", "Який сигнал відповідає на «який сервіс зробив цей запит повільним?»"],
      [
        ["A distributed trace (spans with timings across services)", "Розподілений трейс (span-и з часами між сервісами)"],
        ["A CPU metric", "Метрика CPU"],
        ["A single log line", "Один рядок логу"],
        ["A health check", "Health check"],
      ],
      "a",
    ),
    question(
      "red-use",
      ["The RED method for services monitors…", "Метод RED для сервісів відстежує…"],
      [
        ["Rate, Errors, Duration", "Rate, Errors, Duration (частоту, помилки, тривалість)"],
        ["Reads, Exceptions, Disk", "Reads, Exceptions, Disk"],
        ["Requests, Events, Deploys", "Requests, Events, Deploys"],
        ["RAM, Energy, Data", "RAM, Energy, Data"],
      ],
      "a",
    ),
    question(
      "slo",
      ["What is an SLO?", "Що таке SLO?"],
      [
        ["A target for a service level indicator, e.g. 99.9% of requests under 300 ms over 30 days; the gap to 100% is the error budget", "Ціль для показника рівня сервісу, наприклад 99,9% запитів швидше 300 мс за 30 днів; різниця до 100% — бюджет помилок"],
        ["A contract with penalties (that's an SLA)", "Договір зі штрафами (це SLA)"],
        ["A log level", "Рівень логування"],
        ["A deployment slot", "Слот розгортання"],
      ],
      "a",
    ),
    question(
      "sampling",
      ["Why sample traces?", "Навіщо семплювати трейси?"],
      [
        ["Tracing every request at high volume is expensive; head sampling keeps a percentage, tail sampling keeps interesting ones (errors, slow)", "Трасувати кожен запит при великому обсязі дорого; head sampling зберігає відсоток, tail sampling — цікаві (помилки, повільні)"],
        ["Traces are illegal to store", "Трейси заборонено зберігати"],
        ["To make requests faster", "Щоб запити були швидшими"],
        ["It's required by HTTP", "Цього вимагає HTTP"],
      ],
      "a",
    ),
    question(
      "consistent-hash",
      ["Why use consistent hashing instead of `hash(key) % N` to assign keys to cache nodes?", "Чому для розподілу ключів між вузлами кешу використовують консистентне хешування, а не `hash(key) % N`?"],
      [
        ["Adding or removing a node moves only about 1/N of the keys instead of almost all of them", "Додавання чи видалення вузла переміщує лише близько 1/N ключів, а не майже всі"],
        ["It's faster to compute", "Його швидше обчислювати"],
        ["It guarantees no collisions", "Він гарантує відсутність колізій"],
        ["It encrypts the keys", "Він шифрує ключі"],
      ],
      "a",
    ),
    question(
      "event-grid-hubs-bus",
      ["Match: Event Grid, Event Hubs, Service Bus.", "Зіставте: Event Grid, Event Hubs, Service Bus."],
      [
        ["Reactive event routing (notifications); high-throughput event streaming; enterprise messaging with commands and transactions", "Реактивна маршрутизація подій (сповіщення); високопродуктивні потоки подій; корпоративний обмін повідомленнями з командами й транзакціями"],
        ["Three names for the same service", "Три назви одного сервісу"],
        ["Storage; compute; networking", "Сховище; обчислення; мережа"],
        ["Logging; metrics; tracing", "Логування; метрики; трасування"],
      ],
      "a",
    ),
    question(
      "durable-functions",
      ["What do Azure Durable Functions add?", "Що додають Azure Durable Functions?"],
      [
        ["Stateful orchestrations written as code (function chaining, fan-out/fan-in, human interaction, sagas) with automatic checkpointing", "Оркестрації зі станом, написані як код (ланцюжки функцій, fan-out/fan-in, взаємодія з людиною, саги), з автоматичними контрольними точками"],
        ["Faster cold starts", "Швидші холодні старти"],
        ["A SQL database", "SQL-базу даних"],
        ["Kubernetes", "Kubernetes"],
      ],
      "a",
    ),
    question(
      "container-apps",
      ["Which Azure service runs containerized microservices with autoscaling (KEDA) and Dapr without managing Kubernetes?", "Який сервіс Azure запускає контейнеризовані мікросервіси з автомасштабуванням (KEDA) і Dapr без керування Kubernetes?"],
      [
        ["Azure Container Apps", "Azure Container Apps"],
        ["Azure Table Storage", "Azure Table Storage"],
        ["Azure DevOps", "Azure DevOps"],
        ["Azure Key Vault", "Azure Key Vault"],
      ],
      "a",
    ),
  ]),
  consistentHashingPractice,
];

/* ---------- senior-practical ---------- */

const feedTypes = (merge: string) => `class Post
{
    public string Author;
    public int Time;      // larger = newer
    public string Text;
    public Post(string author, int time, string text) { Author = author; Time = time; Text = text; }
}

static class Feed
{
    // Fan-out on read: every followed author's timeline is already sorted newest first.
    // Return the newest \`count\` posts across all timelines that are strictly older than \`before\`
    // (use int.MaxValue for the first page), newest first; equal times are ordered by Author.
    // Do a k-way merge: keep one candidate per timeline in a sorted structure and take the best each step,
    // instead of concatenating and sorting everything.
    public static List<Post> Page(List<List<Post>> timelines, int count, int before)
    {
${merge}
    }
}`;

const feedMain = `        var timelines = new List<List<Post>>
        {
            new List<Post> { new Post("ann", 95, "a3"), new Post("ann", 60, "a2"), new Post("ann", 10, "a1") },
            new List<Post> { new Post("bob", 99, "b4"), new Post("bob", 80, "b3"), new Post("bob", 60, "b2"), new Post("bob", 5, "b1") },
            new List<Post>(),
            new List<Post> { new Post("cat", 97, "c2"), new Post("cat", 20, "c1") },
        };
        int cursor = int.MaxValue;
        for (int page = 1; page <= 4; page++)
        {
            var posts = Feed.Page(timelines, 3, cursor);
            Console.WriteLine("page " + page + ": " + (posts.Count == 0 ? "(end)" : string.Join(", ", posts.Select(p => p.Text + "@" + p.Time))));
            if (posts.Count == 0) break;
            cursor = posts[posts.Count - 1].Time;
        }`;

export const feedMergePractice = practice("feed-merge", "A news feed: k-way merge with cursor pages", "Стрічка новин: k-шляхове злиття зі сторінками за курсором", {
  starter: PROGRAM_WITH(feedTypes(stub), feedMain, "using System.Collections.Generic;\nusing System.Linq;"),
  solution: PROGRAM_WITH(
    feedTypes(`        // (post, timeline index, position) ordered newest first, then by author, then by timeline index
        var heap = new SortedSet<Tuple<Post, int, int>>(Comparer<Tuple<Post, int, int>>.Create((x, y) =>
        {
            int c = y.Item1.Time.CompareTo(x.Item1.Time);
            if (c == 0) c = string.CompareOrdinal(x.Item1.Author, y.Item1.Author);
            if (c == 0) c = x.Item2.CompareTo(y.Item2);
            return c;
        }));
        for (int t = 0; t < timelines.Count; t++)
        {
            int i = 0;
            while (i < timelines[t].Count && timelines[t][i].Time >= before) i++;
            if (i < timelines[t].Count) heap.Add(Tuple.Create(timelines[t][i], t, i));
        }
        var result = new List<Post>();
        while (result.Count < count && heap.Count > 0)
        {
            var best = heap.Min;
            heap.Remove(best);
            result.Add(best.Item1);
            int next = best.Item3 + 1;
            if (next < timelines[best.Item2].Count) heap.Add(Tuple.Create(timelines[best.Item2][next], best.Item2, next));
        }
        return result;`),
    feedMain,
    "using System.Collections.Generic;\nusing System.Linq;",
  ),
  expectedOutput: "page 1: b4@99, c2@97, a3@95\npage 2: b3@80, a2@60, b2@60\npage 3: c1@20, a1@10, b1@5\npage 4: (end)\n",
});

export const seniorPracticalExtras: SlideDef[] = [
  lecture("senior-design-news-feed", "System design at Senior level: a news feed", "Проєктування систем на рівні Senior: стрічка новин"),
  feedMergePractice,
];
