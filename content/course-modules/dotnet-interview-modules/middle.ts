import { PROGRAM_WITH } from "../csharp-code";
import { WRITE_QUERY } from "../databases-data";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";
import {
  bstPractice,
  disposePatternPractice,
  hashMapPractice,
  httpParserPractice,
  idempotentConsumerPractice,
  middleAspnetPipelineLecture,
  middleCollectionsQuiz2,
  middleDbQuiz2,
  middleEnumerablesLecture,
  middleGcDisposeLecture,
  middleGeneralQuiz2,
  middleHashTablesLecture,
  middleNormalizationLecture,
  middlePatternsLecture,
  middlePlatformQuiz2,
  middleSolidLecture,
  middleThreadPoolLecture,
  normalizeOrdersPractice,
  outboxPractice,
  responseCachePractice,
} from "./middle-more";

const stub = "        throw new NotImplementedException();";

const seqTypes = (fib: string, dup: string) => `static class Sequences
{
    // The first \`count\` Fibonacci numbers: 0, 1, 1, 2, 3, 5, ...
    // Lazy (uses yield), but a negative count must throw ArgumentOutOfRangeException right at the call.
    public static IEnumerable<long> Fibonacci(int count)
    {
${fib}
    }

    // True if any element occurs more than once. One pass, O(n).
    public static bool HasDuplicates<T>(IEnumerable<T> items)
    {
${dup}
    }
}`;

const seqMain = `        Console.WriteLine(string.Join(" ", Sequences.Fibonacci(10)));
        Console.WriteLine("[" + string.Join(" ", Sequences.Fibonacci(0)) + "]");
        Console.WriteLine(Sequences.Fibonacci(90).Last());
        try
        {
            var lazy = Sequences.Fibonacci(-1);
            Console.WriteLine("not thrown until enumerated");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("thrown at the call");
        }
        Console.WriteLine(Sequences.HasDuplicates(new[] { 1, 2, 3 }));
        Console.WriteLine(Sequences.HasDuplicates(new[] { 1, 2, 1 }));
        Console.WriteLine(Sequences.HasDuplicates(new[] { "a", "A" }));
        Console.WriteLine(Sequences.HasDuplicates(new string[0]));`;

const singletonTypes = (fields: string, instance: string, hit: string) => `sealed class AppSettings
{
    // How many times the constructor ran. Must end up as exactly 1.
    public static int Created;
${fields}
    private int hits;

    private AppSettings()
    {
        Interlocked.Increment(ref Created);
        Thread.Sleep(50); // a slow constructor makes races easy to hit
    }

    // The single, lazily created instance. Safe to call from many threads at once.
    public static AppSettings Instance
    {
        get
        {
${instance}
        }
    }

    public int Hits { get { return hits; } }

    // Counts a hit. Safe to call from many threads at once.
    public void Hit()
    {
${hit}
    }
}`;

const singletonMain = `        Console.WriteLine("before first use: " + AppSettings.Created);
        var seen = new ConcurrentBag<AppSettings>();
        Parallel.For(0, 1000, i =>
        {
            var settings = AppSettings.Instance;
            settings.Hit();
            seen.Add(settings);
        });
        Console.WriteLine("constructor calls: " + AppSettings.Created);
        Console.WriteLine("distinct instances: " + seen.Distinct().Count());
        Console.WriteLine("hits: " + AppSettings.Instance.Hits);`;

const singletonUsings = "using System.Collections.Concurrent;\nusing System.Linq;\nusing System.Threading;\nusing System.Threading.Tasks;";

const CLINIC = `CREATE TABLE doctors (
    id        integer PRIMARY KEY,
    name      text NOT NULL,
    specialty text NOT NULL
);

CREATE TABLE patients (
    id   integer PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE appointments (
    id         integer PRIMARY KEY,
    doctor_id  integer NOT NULL REFERENCES doctors (id),
    patient_id integer NOT NULL REFERENCES patients (id),
    visit_date date NOT NULL
);

INSERT INTO doctors VALUES
    (1, 'Iryna Bondar', 'Cardiology'),
    (2, 'Petro Shevchenko', 'Neurology'),
    (3, 'Olha Tkachenko', 'Pediatrics'),
    (4, 'Andrii Lysenko', 'Dermatology'),
    (5, 'Maria Hnatiuk', 'Surgery'),
    (6, 'Taras Melnyk', 'Oncology');

INSERT INTO patients VALUES
    (1, 'Anna'), (2, 'Bohdan'), (3, 'Daria'), (4, 'Ivan'),
    (5, 'Kateryna'), (6, 'Mykola'), (7, 'Nadiia'), (8, 'Oleh');

INSERT INTO appointments VALUES
    (1, 1, 1, '2026-01-10'), (2, 1, 2, '2026-01-11'), (3, 1, 3, '2026-01-12'),
    (4, 1, 4, '2026-01-13'), (5, 1, 1, '2026-02-10'),
    (6, 2, 1, '2026-01-15'), (7, 2, 1, '2026-02-15'), (8, 2, 2, '2026-03-15'),
    (9, 3, 5, '2026-01-20'), (10, 3, 6, '2026-01-21'), (11, 3, 7, '2026-01-22'), (12, 3, 5, '2026-03-01'),
    (13, 4, 8, '2026-02-02'),
    (14, 5, 2, '2026-02-05'), (15, 5, 3, '2026-02-06'), (16, 5, 8, '2026-02-07');
`;

const middleGeneralModule: ModuleDef = {
  slug: "middle-general",
  title: { en: "Middle: general questions and distributed systems", uk: "Middle: загальні питання та розподілені системи" },
  slides: [
    lecture("middle-questions", "Middle interview questions", "Питання співбесіди Middle"),
    lecture("middle-architecture", "HTTP, SOLID, DI and distributed systems", "HTTP, SOLID, DI і розподілені системи"),
    middleSolidLecture,
    middlePatternsLecture,
    quiz("middle-architecture-quiz", "HTTP, SOLID and distributed systems", "HTTP, SOLID і розподілені системи", [
      question(
        "https",
        ["What does the TLS handshake in HTTPS achieve?", "Чого досягає TLS-рукостискання в HTTPS?"],
        [
          ["The client verifies the server's certificate chain against trusted CAs", "Клієнт перевіряє ланцюжок сертифікатів сервера через довірені CA"],
          ["Both sides agree on a symmetric session key (via asymmetric crypto / Diffie-Hellman)", "Сторони домовляються про симетричний сеансовий ключ (через асиметричну криптографію / Діффі-Геллмана)"],
          ["The whole conversation is then encrypted with the server's private key", "Далі вся розмова шифрується приватним ключем сервера"],
          ["It hides the server's IP address", "Воно приховує IP-адресу сервера"],
        ],
        ["a", "b"],
      ),
      question(
        "solid-d",
        ["What does the D in SOLID say?", "Що стверджує D у SOLID?"],
        [
          ["Use dependency injection containers everywhere", "Використовуйте DI-контейнери всюди"],
          ["High-level modules should not depend on low-level modules; both should depend on abstractions", "Модулі верхнього рівня не повинні залежати від модулів нижнього рівня; обидва мають залежати від абстракцій"],
          ["Don't repeat yourself", "Не повторюйся"],
          ["Derived classes must be substitutable for their base classes", "Похідні класи мають бути замінними на базові"],
        ],
        "b",
      ),
      question(
        "solid-l",
        ["`Square : Rectangle` where setting `Width` also changes `Height` breaks code that expects a rectangle. Which principle is violated?", "`Square : Rectangle`, де присвоєння `Width` змінює й `Height`, ламає код, що очікує прямокутник. Який принцип порушено?"],
        [
          ["Single responsibility", "Єдиної відповідальності"],
          ["Interface segregation", "Розділення інтерфейсів"],
          ["Liskov substitution", "Підстановки Лісков"],
          ["Open/closed", "Відкритості/закритості"],
        ],
        "c",
      ),
      question(
        "pure",
        ["Which statements about pure functions are true?", "Які твердження про чисті функції правильні?"],
        [
          ["Same input always gives the same output", "Той самий вхід завжди дає той самий результат"],
          ["They have no side effects (no I/O, no mutation of shared state)", "Вони не мають побічних ефектів (ні I/O, ні зміни спільного стану)"],
          ["They are trivial to test, cache and run in parallel", "Їх легко тестувати, кешувати й запускати паралельно"],
          ["`DateTime.Now.Hour > 12` is a pure expression", "`DateTime.Now.Hour > 12` — чистий вираз"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "coupling",
        ["What do we aim for with cohesion and coupling?", "До чого прагнемо щодо зв'язності (cohesion) і зчеплення (coupling)?"],
        [
          ["High cohesion inside a module, low coupling between modules", "Висока зв'язність усередині модуля, низьке зчеплення між модулями"],
          ["Low cohesion, high coupling", "Низька зв'язність, високе зчеплення"],
          ["Both as high as possible", "Обидва якомога вищі"],
          ["They don't matter in C#", "У C# вони неважливі"],
        ],
        "a",
      ),
      question(
        "iaas",
        ["An Azure App Service web app, where you deploy code and Azure runs the OS and runtime, is an example of…", "Веб-застосунок Azure App Service, куди ви деплоїте код, а Azure керує ОС і рантаймом, — це приклад…"],
        [
          ["IaaS", "IaaS"],
          ["PaaS", "PaaS"],
          ["SaaS", "SaaS"],
          ["On-premises", "On-premises"],
        ],
        "b",
      ),
      question(
        "singleton-anti",
        ["Why is Singleton often called an anti-pattern?", "Чому Singleton часто називають антипатерном?"],
        [
          ["It is global mutable state hidden behind a static accessor", "Це глобальний змінний стан, захований за статичним доступом"],
          ["It hides dependencies and makes unit tests hard to isolate", "Він приховує залежності й ускладнює ізоляцію модульних тестів"],
          ["It is impossible to make thread-safe", "Його неможливо зробити потокобезпечним"],
          ["It couples callers to a concrete class", "Він прив'язує викликачів до конкретного класу"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "bus-duplicates",
        ["Why can a message broker deliver the same message twice?", "Чому брокер повідомлень може доставити те саме повідомлення двічі?"],
        [
          ["Brokers usually give at-least-once delivery: if the consumer crashes or the ack is lost after processing, the message is redelivered", "Брокери зазвичай дають доставку «щонайменше раз»: якщо споживач упав або підтвердження загубилося після обробки, повідомлення доставляється знову"],
          ["Because of a bug that all brokers have", "Через помилку, яка є в усіх брокерах"],
          ["Only when the queue is empty", "Лише коли черга порожня"],
          ["Duplicates are impossible with HTTPS", "Із HTTPS дублікати неможливі"],
        ],
        "a",
      ),
      question(
        "idempotency",
        ["How do you make a message handler idempotent?", "Як зробити обробник повідомлень ідемпотентним?"],
        [
          ["Store processed message ids (in the same transaction as the change) and skip ones already seen", "Зберігати id оброблених повідомлень (у тій самій транзакції, що й зміну) й пропускати вже бачені"],
          ["Use natural idempotent operations: `SET status = 'paid'` instead of `balance = balance + 10`", "Використовувати природно ідемпотентні операції: `SET status = 'paid'` замість `balance = balance + 10`"],
          ["Use upserts with a unique business key", "Використовувати upsert з унікальним бізнес-ключем"],
          ["Retry faster", "Швидше повторювати"],
        ],
        ["a", "b", "c"],
      ),
    ]),
    middleGeneralQuiz2,
    httpParserPractice,
    idempotentConsumerPractice,
  ],
};

const middlePlatformModule: ModuleDef = {
  slug: "middle-platform",
  title: { en: "Middle: ASP.NET Core and memory management", uk: "Middle: ASP.NET Core і керування пам'яттю" },
  slides: [
    lecture("middle-aspnet-memory", "ASP.NET Core, LINQ and memory management", "ASP.NET Core, LINQ і керування пам'яттю"),
    middleAspnetPipelineLecture,
    middleGcDisposeLecture,
    quiz("middle-aspnet-memory-quiz", "ASP.NET Core and memory", "ASP.NET Core і пам'ять", [
      question(
        "uncatchable",
        ["Which exception cannot be caught by a `catch` block in modern .NET?", "Який виняток не можна перехопити блоком `catch` у сучасному .NET?"],
        [
          ["`StackOverflowException`", "`StackOverflowException`"],
          ["`OutOfMemoryException`", "`OutOfMemoryException`"],
          ["`NullReferenceException`", "`NullReferenceException`"],
          ["`TaskCanceledException`", "`TaskCanceledException`"],
        ],
        "a",
      ),
      question(
        "thread-abort",
        ["What happens with `ThreadAbortException` (in .NET Framework) after your `catch` block ends?", "Що відбувається з `ThreadAbortException` (у .NET Framework) після завершення вашого блоку `catch`?"],
        [
          ["It is swallowed like any other exception", "Його поглинає, як будь-який інший виняток"],
          ["The runtime automatically rethrows it unless `Thread.ResetAbort()` is called", "Рантайм автоматично кидає його знову, якщо не викликано `Thread.ResetAbort()`"],
          ["The process exits", "Процес завершується"],
          ["It turns into a `TaskCanceledException`", "Він перетворюється на `TaskCanceledException`"],
        ],
        "b",
      ),
      question(
        "deferred",
        ["`var q = list.Where(x => x > 2); list.Add(5);` When is the filter executed, and does `q` contain 5?", "`var q = list.Where(x => x > 2); list.Add(5);` Коли виконується фільтр і чи містить `q` число 5?"],
        [
          ["Immediately at `Where`; no", "Одразу у `Where`; ні"],
          ["When `q` is enumerated (deferred execution); yes", "Коли `q` перебирають (відкладене виконання); так"],
          ["Never; `Where` needs `ToList()`", "Ніколи; `Where` потребує `ToList()`"],
          ["At `list.Add`; yes", "У `list.Add`; так"],
        ],
        "b",
      ),
      question(
        "lifetimes",
        ["Which statements about ASP.NET Core service lifetimes are true?", "Які твердження про час життя сервісів в ASP.NET Core правильні?"],
        [
          ["Transient: a new instance every time it is resolved", "Transient: новий екземпляр щоразу, коли його запитують"],
          ["Scoped: one instance per HTTP request (per scope)", "Scoped: один екземпляр на HTTP-запит (на область)"],
          ["Singleton: one instance for the app's lifetime", "Singleton: один екземпляр на весь час життя застосунку"],
          ["Injecting a scoped `DbContext` into a singleton is safe", "Впроваджувати scoped `DbContext` у singleton безпечно"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "kestrel",
        ["What is Kestrel?", "Що таке Kestrel?"],
        [
          ["The cross-platform HTTP server built into ASP.NET Core", "Кросплатформений HTTP-сервер, вбудований в ASP.NET Core"],
          ["A logging framework", "Фреймворк логування"],
          ["A DI container", "DI-контейнер"],
          ["The IIS management console", "Консоль керування IIS"],
        ],
        "a",
      ),
      question(
        "using-dispose",
        ["Why does C# have `using`/`IDisposable` if the GC manages memory?", "Навіщо в C# `using`/`IDisposable`, якщо пам'яттю керує GC?"],
        [
          ["The GC only reclaims managed memory, and at an unpredictable time; files, sockets, DB connections and handles must be released deterministically", "GC звільняє лише керовану пам'ять і в непередбачуваний момент; файли, сокети, з'єднання з БД і дескриптори треба звільняти детерміновано"],
          ["`using` makes the GC run immediately", "`using` змушує GC запуститися негайно"],
          ["It is only for COM objects", "Це лише для COM-об'єктів"],
          ["It frees stack memory", "Це звільняє пам'ять стеку"],
        ],
        "a",
      ),
      question(
        "loh",
        ["Which statements about the Large Object Heap are true?", "Які твердження про Large Object Heap правильні?"],
        [
          ["Objects of 85,000 bytes or more go there", "Туди потрапляють об'єкти розміром від 85 000 байтів"],
          ["It is collected only together with Gen 2", "Його збирають лише разом із Gen 2"],
          ["It is not compacted by default, so it can fragment", "За замовчуванням він не ущільнюється, тож може фрагментуватися"],
          ["Small strings are allocated there", "Короткі рядки виділяються там"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "gc-gen",
        ["Why is the GC generational?", "Чому GC поколіннєвий?"],
        [
          ["Most objects die young, so collecting only Gen 0 is cheap and frees most garbage", "Більшість об'єктів помирає молодими, тож збирати лише Gen 0 дешево і звільняє більшість сміття"],
          ["To support multiple CPUs", "Щоб підтримувати кілька процесорів"],
          ["Because the stack has three parts", "Бо стек має три частини"],
          ["To avoid using finalizers", "Щоб не використовувати фіналізатори"],
        ],
        "a",
      ),
    ]),
    middlePlatformQuiz2,
    responseCachePractice,
    disposePatternPractice,
  ],
};

const middleCollectionsModule: ModuleDef = {
  slug: "middle-collections",
  title: { en: "Middle: data types, collections and data structures", uk: "Middle: типи даних, колекції та структури даних" },
  slides: [
    lecture("middle-collections", "Generics, reflection, collections and hashing", "Generics, рефлексія, колекції та хешування"),
    middleHashTablesLecture,
    middleEnumerablesLecture,
    quiz("middle-collections-quiz", "Collections and hashing", "Колекції та хешування", [
      question(
        "generic-runtime",
        ["When is the concrete type `List<int>` created?", "Коли створюється конкретний тип `List<int>`?"],
        [
          ["At compile time, as a copy of the source code (like C++ templates)", "Під час компіляції, як копія вихідного коду (як шаблони C++)"],
          ["At run time: IL contains the open generic; the JIT creates a specialized version per value type and shares one version for all reference types", "Під час виконання: IL містить відкритий generic; JIT створює окрему версію для кожного типу значення й одну спільну для всіх типів посилань"],
          ["Never; generics are erased like in Java", "Ніколи; generics стираються, як у Java"],
          ["When the NuGet package is restored", "Коли відновлюється пакет NuGet"],
        ],
        "b",
      ),
      question(
        "linkedlist",
        ["When is `LinkedList<T>` a better fit than `List<T>`?", "Коли `LinkedList<T>` кращий за `List<T>`?"],
        [
          ["When you often insert/remove in the middle at a node you already hold", "Коли часто вставляєте/видаляєте всередині біля вузла, який уже маєте"],
          ["When you need fast access by index", "Коли потрібен швидкий доступ за індексом"],
          ["When you want the best cache locality", "Коли потрібна найкраща локальність кешу"],
          ["When memory per element must be minimal", "Коли пам'ять на елемент має бути мінімальною"],
        ],
        "a",
      ),
      question(
        "immutable",
        ["How do you make a class immutable?", "Як зробити клас незмінним?"],
        [
          ["Only `readonly` fields / get-only or `init` properties, set in the constructor", "Лише `readonly`-поля / властивості лише з get або `init`, задані в конструкторі"],
          ["Don't expose mutable inner objects (copy or use immutable collections)", "Не відкривати змінні внутрішні об'єкти (копіювати або використовувати незмінні колекції)"],
          ["\"Change\" methods return a new instance (`with` for records)", "Методи «зміни» повертають новий екземпляр (`with` для record)"],
          ["Mark the class `static`", "Позначити клас `static`"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "hash-good",
        ["Which properties should a good hash function for a hash table have?", "Які властивості має мати хороша хеш-функція для хеш-таблиці?"],
        [
          ["Deterministic: equal keys give equal hashes", "Детермінованість: рівні ключі дають рівні хеші"],
          ["Uniform distribution across buckets", "Рівномірний розподіл по кошиках"],
          ["Fast to compute", "Швидке обчислення"],
          ["Different keys must always give different hashes", "Різні ключі завжди мають давати різні хеші"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "collisions",
        ["How does `Dictionary<TKey,TValue>` handle collisions?", "Як `Dictionary<TKey,TValue>` обробляє колізії?"],
        [
          ["Chaining: entries with the same bucket are linked in a chain and compared with `Equals`", "Ланцюжками: записи з одного кошика зв'язані в ланцюжок і порівнюються через `Equals`"],
          ["It throws an exception", "Кидає виняток"],
          ["It overwrites the older value", "Перезаписує старіше значення"],
          ["It ignores the new key", "Ігнорує новий ключ"],
        ],
        "a",
      ),
      question(
        "mutable-key",
        ["You put an object in a `HashSet`, then change a field used in its `GetHashCode`. What happens?", "Ви додали об'єкт у `HashSet`, а потім змінили поле, що використовується в його `GetHashCode`. Що станеться?"],
        [
          ["The set rehashes automatically", "Множина автоматично перехешується"],
          ["`Contains` may no longer find it, because it is stored in the bucket of the old hash", "`Contains` може його більше не знайти, бо він лежить у кошику старого хешу"],
          ["A compile error", "Помилка компіляції"],
          ["Nothing; hashes are cached by the object", "Нічого; хеші кешуються в об'єкті"],
        ],
        "b",
      ),
      question(
        "ienumerable-iqueryable",
        ["`IQueryable<T>` vs `IEnumerable<T>` with EF Core: which is true?", "`IQueryable<T>` чи `IEnumerable<T>` з EF Core: що правда?"],
        [
          ["`IQueryable` builds an expression tree that the provider translates to SQL, so `Where` runs in the database", "`IQueryable` будує дерево виразів, яке провайдер перекладає в SQL, тож `Where` виконується в базі"],
          ["Calling `AsEnumerable()` before `Where` makes the filter run in memory after loading the rows", "Виклик `AsEnumerable()` перед `Where` змушує фільтр виконуватися в пам'яті після завантаження рядків"],
          ["They behave identically", "Вони поводяться однаково"],
          ["`IEnumerable` is always faster", "`IEnumerable` завжди швидший"],
        ],
        ["a", "b"],
      ),
      question(
        "push-pull",
        ["`IEnumerable<T>`, `IObservable<T>` and `IAsyncEnumerable<T>` — which model is which?", "`IEnumerable<T>`, `IObservable<T>` і `IAsyncEnumerable<T>` — яка модель у кожного?"],
        [
          ["Pull (sync); push; pull (async)", "Pull (синхронний); push; pull (асинхронний)"],
          ["Push; pull; push", "Push; pull; push"],
          ["All three are push", "Усі три — push"],
          ["All three are pull", "Усі три — pull"],
        ],
        "a",
      ),
      question(
        "flags",
        ["`[Flags] enum Perm { Read = 1, Write = 2, Exec = 4 }`. How do you check that `p` has `Write`?", "`[Flags] enum Perm { Read = 1, Write = 2, Exec = 4 }`. Як перевірити, що `p` має `Write`?"],
        [
          ["`p == Perm.Write`", "`p == Perm.Write`"],
          ["`(p & Perm.Write) != 0` or `p.HasFlag(Perm.Write)`", "`(p & Perm.Write) != 0` або `p.HasFlag(Perm.Write)`"],
          ["`p > Perm.Read`", "`p > Perm.Read`"],
          ["`p | Perm.Write`", "`p | Perm.Write`"],
        ],
        "b",
      ),
    ]),
    middleCollectionsQuiz2,
    hashMapPractice,
    bstPractice,
  ],
};

const middleDbModule: ModuleDef = {
  slug: "middle-db-parallelism",
  title: { en: "Middle: databases and parallelism", uk: "Middle: бази даних і паралелізм" },
  slides: [
    lecture("middle-db-parallelism", "Databases, EF Core and the thread pool", "Бази даних, EF Core і пул потоків"),
    middleNormalizationLecture,
    middleThreadPoolLecture,
    quiz("middle-db-parallelism-quiz", "Databases and parallelism", "Бази даних і паралелізм", [
      question(
        "acid",
        ["What does ACID stand for?", "Що означає ACID?"],
        [
          ["Atomicity, Consistency, Isolation, Durability", "Atomicity, Consistency, Isolation, Durability (атомарність, узгодженість, ізольованість, довговічність)"],
          ["Availability, Consistency, Integrity, Distribution", "Availability, Consistency, Integrity, Distribution"],
          ["Asynchrony, Concurrency, Indexing, Durability", "Asynchrony, Concurrency, Indexing, Durability"],
          ["Atomicity, Caching, Isolation, Denormalization", "Atomicity, Caching, Isolation, Denormalization"],
        ],
        "a",
      ),
      question(
        "isolation",
        ["Which isolation level prevents dirty reads but still allows non-repeatable reads?", "Який рівень ізоляції запобігає брудному читанню, але допускає неповторюване читання?"],
        [
          ["Read Uncommitted", "Read Uncommitted"],
          ["Read Committed", "Read Committed"],
          ["Repeatable Read", "Repeatable Read"],
          ["Serializable", "Serializable"],
        ],
        "b",
      ),
      question(
        "normal-forms",
        ["A table `Orders(Id, CustomerId, CustomerName, …)` stores the customer's name in every order. Which normal form does that violate?", "Таблиця `Orders(Id, CustomerId, CustomerName, …)` зберігає ім'я клієнта в кожному замовленні. Яку нормальну форму це порушує?"],
        [
          ["1NF", "1НФ"],
          ["3NF: `CustomerName` depends on `CustomerId`, not on the key", "3НФ: `CustomerName` залежить від `CustomerId`, а не від ключа"],
          ["None", "Жодну"],
          ["BCNF only", "Лише НФБК"],
        ],
        "b",
      ),
      question(
        "index-cons",
        ["When is adding an index a bad idea?", "Коли додавати індекс — погана ідея?"],
        [
          ["On a write-heavy table where the column is rarely filtered on", "На таблиці з інтенсивним записом, де за колонкою рідко фільтрують"],
          ["On a column with very low selectivity (e.g. a boolean) used alone", "На колонці з дуже низькою селективністю (наприклад, boolean) самостійно"],
          ["On a foreign key column used in joins", "На колонці зовнішнього ключа, яку використовують у з'єднаннях"],
          ["On a tiny lookup table", "На крихітній довідковій таблиці"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "slow-query",
        ["A query got slow. Reasonable first steps?", "Запит став повільним. Розумні перші кроки?"],
        [
          ["Look at the actual execution plan (scans, key lookups, estimated vs actual rows)", "Подивитися фактичний план виконання (скани, key lookup, оцінені й фактичні рядки)"],
          ["Check indexes and outdated statistics", "Перевірити індекси й застарілу статистику"],
          ["Check for blocking/locks and parameter sniffing", "Перевірити блокування й parameter sniffing"],
          ["Add `NOLOCK` to every query", "Додати `NOLOCK` до кожного запиту"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "ef-translate",
        ["How does EF Core turn `db.Users.Where(u => u.Age > 18)` into SQL?", "Як EF Core перетворює `db.Users.Where(u => u.Age > 18)` на SQL?"],
        [
          ["The lambda is compiled into an expression tree; the provider's query translator walks it and generates SQL", "Лямбда компілюється в дерево виразів; транслятор запитів провайдера обходить його й генерує SQL"],
          ["It decompiles the IL of the lambda at run time", "Він декомпілює IL лямбди під час виконання"],
          ["It loads all users and filters in memory", "Він завантажує всіх користувачів і фільтрує в пам'яті"],
          ["Through regular expressions over the C# source", "Через регулярні вирази над кодом C#"],
        ],
        "a",
      ),
      question(
        "configureawait",
        ["What does `ConfigureAwait(false)` do?", "Що робить `ConfigureAwait(false)`?"],
        [
          ["The continuation does not need to return to the captured SynchronizationContext (UI thread / old ASP.NET request context)", "Продовженню не потрібно повертатися в захоплений SynchronizationContext (UI-потік / контекст запиту старого ASP.NET)"],
          ["It makes the task run synchronously", "Змушує задачу виконуватися синхронно"],
          ["It cancels the task", "Скасовує задачу"],
          ["It is required in ASP.NET Core to avoid deadlocks", "Він обов'язковий в ASP.NET Core, щоб уникнути взаємних блокувань"],
        ],
        "a",
      ),
      question(
        "sixteen-threads",
        ["A server has 16 threads and each request blocks one while waiting for the database. What helps most?", "Сервер має 16 потоків, і кожен запит блокує один, чекаючи на базу. Що допоможе найбільше?"],
        [
          ["Use async I/O (`await ToListAsync()`): threads go back to the pool while waiting, so far more requests are served", "Асинхронне I/O (`await ToListAsync()`): потоки повертаються в пул під час очікування, тож обслуговується значно більше запитів"],
          ["Wrap each DB call in `Task.Run`", "Обгорнути кожен виклик до БД у `Task.Run`"],
          ["Call `.Result` on async methods", "Викликати `.Result` на асинхронних методах"],
          ["Add `Thread.Sleep` between requests", "Додати `Thread.Sleep` між запитами"],
        ],
        "a",
      ),
      question(
        "threadpool",
        ["Which statements about the ThreadPool are true?", "Які твердження про ThreadPool правильні?"],
        [
          ["It reuses a set of worker threads instead of creating a thread per work item", "Він перевикористовує набір робочих потоків замість створення потоку на кожну задачу"],
          ["Work items wait in a global queue and per-thread local queues with work stealing", "Задачі чекають у глобальній черзі та локальних чергах потоків із «крадіжкою роботи»"],
          ["When threads are blocked, it injects new ones slowly (hill climbing), so blocking code causes thread starvation", "Коли потоки заблоковані, він додає нові повільно (hill climbing), тож блокуючий код спричиняє голодування потоків"],
          ["Each `await` creates a new pool thread", "Кожен `await` створює новий потік пулу"],
        ],
        ["a", "b", "c"],
      ),
    ]),
    middleDbQuiz2,
    {
      kind: "practice",
      slug: "doctors-patients",
      title: { en: "Practice: Doctors with many patients", uk: "Практика «Лікарі з багатьма пацієнтами»" },
      language: "sql",
      setup: CLINIC,
      starter: WRITE_QUERY,
      solution: `SELECT d.name,
       d.specialty,
       count(DISTINCT a.patient_id) AS patients
FROM doctors AS d
JOIN appointments AS a ON a.doctor_id = d.id
GROUP BY d.id, d.name, d.specialty
HAVING count(DISTINCT a.patient_id) > 2
ORDER BY patients DESC, d.name;
`,
      expectedOutput: "      name      | specialty  | patients\n----------------+------------+----------\n Iryna Bondar   | Cardiology |        4\n Maria Hnatiuk  | Surgery    |        3\n Olha Tkachenko | Pediatrics |        3\n(3 rows)\n",
      maxScore: 3,
    },
    normalizeOrdersPractice,
  ],
};

const middlePracticalModule: ModuleDef = {
  slug: "middle-practical",
  title: { en: "Middle: practical tasks", uk: "Middle: практичні задачі" },
  slides: [
    lecture("middle-code-review", "Practical tasks: what is wrong with this code?", "Практичні задачі: що не так із цим кодом?"),
    quiz("middle-code-review-quiz", "Code review", "Рев'ю коду", [
      question(
        "throw-e",
        ["`catch (Exception e) { Log(e.Message); throw e; }` — what is the main problem?", "`catch (Exception e) { Log(e.Message); throw e; }` — у чому головна проблема?"],
        [
          ["`throw e;` resets the stack trace to this line; use `throw;`", "`throw e;` скидає стек викликів до цього рядка; використовуйте `throw;`"],
          ["It does not compile", "Не скомпілюється"],
          ["`Log` swallows the exception", "`Log` поглинає виняток"],
          ["Nothing is wrong", "Усе гаразд"],
        ],
        "a",
      ),
      question(
        "null-extension",
        ["`SomeClass c = null; c.SomeMethod();` does not throw. How is that possible?", "`SomeClass c = null; c.SomeMethod();` не кидає виняток. Як таке можливо?"],
        [
          ["`SomeMethod` is an extension method: a static call `Ext.SomeMethod(c)` that receives null as an argument", "`SomeMethod` — метод розширення: статичний виклик `Ext.SomeMethod(c)`, який отримує null як аргумент"],
          ["The CLR creates the object automatically", "CLR створює об'єкт автоматично"],
          ["Null objects have default methods", "Null-об'єкти мають методи за замовчуванням"],
          ["It is impossible; it always throws", "Неможливо; завжди буде виняток"],
        ],
        "a",
      ),
      question(
        "using-return",
        ["A method creates an object in `using (var t = new Table()) { return t; }`; the caller then calls `t.Draw()`. What is wrong?", "Метод створює об'єкт у `using (var t = new Table()) { return t; }`, а викликач потім викликає `t.Draw()`. Що не так?"],
        [
          ["The object is disposed when the method returns, so the caller uses a disposed object", "Об'єкт звільняється під час виходу з методу, тож викликач використовує вже звільнений об'єкт"],
          ["`using` cannot contain `return`", "У `using` не можна писати `return`"],
          ["The object is garbage-collected immediately", "Об'єкт негайно збирає GC"],
          ["Nothing", "Нічого"],
        ],
        "a",
      ),
      question(
        "is-cast",
        ["What is a better form of `if (shape is Circle) Console.WriteLine(((Circle)shape).Radius);`?", "Яка форма краща за `if (shape is Circle) Console.WriteLine(((Circle)shape).Radius);`?"],
        [
          ["`if (shape is Circle c) Console.WriteLine(c.Radius);` — one type check, no second cast", "`if (shape is Circle c) Console.WriteLine(c.Radius);` — одна перевірка типу, без другого приведення"],
          ["`Console.WriteLine(((Circle)shape).Radius);` without the check", "`Console.WriteLine(((Circle)shape).Radius);` без перевірки"],
          ["`if (shape.GetType().Name == \"Circle\")`", "`if (shape.GetType().Name == \"Circle\")`"],
          ["Wrap it in try/catch", "Обгорнути в try/catch"],
        ],
        "a",
      ),
      question(
        "parse-catch",
        ["A getter does `try { return int.Parse(TxtQuantity.Text); } catch { return 0; }`. Better?", "Геттер робить `try { return int.Parse(TxtQuantity.Text); } catch { return 0; }`. Як краще?"],
        [
          ["`return int.TryParse(TxtQuantity.Text, out var q) ? q : 0;` — no exceptions for expected bad input", "`return int.TryParse(TxtQuantity.Text, out var q) ? q : 0;` — без винятків для очікувано поганого вводу"],
          ["Catch `Exception` and rethrow", "Перехопити `Exception` і кинути знову"],
          ["Use `Convert.ToInt32` inside the same try/catch", "Використати `Convert.ToInt32` у тому самому try/catch"],
          ["It is already optimal", "Це вже оптимально"],
        ],
        "a",
      ),
    ]),
    lecture("middle-reliable-messaging", "Practical tasks: not losing data between services", "Практичні задачі: не губимо дані між сервісами"),
    outboxPractice,
    practice("fibonacci-duplicates", "Fibonacci and duplicates", "Фібоначчі та дублікати", {
      starter: PROGRAM_WITH(seqTypes(stub, stub), seqMain, "using System.Collections.Generic;\nusing System.Linq;"),
      solution: PROGRAM_WITH(
        seqTypes(
          `        if (count < 0) throw new ArgumentOutOfRangeException("count");
        return FibonacciIterator(count);
    }

    static IEnumerable<long> FibonacciIterator(int count)
    {
        long a = 0, b = 1;
        for (int i = 0; i < count; i++)
        {
            yield return a;
            long next = a + b;
            a = b;
            b = next;
        }`,
          `        var seen = new HashSet<T>();
        foreach (var item in items)
            if (!seen.Add(item)) return true;
        return false;`,
        ),
        seqMain,
        "using System.Collections.Generic;\nusing System.Linq;",
      ),
      expectedOutput:
        "0 1 1 2 3 5 8 13 21 34\n[]\n1779979416004714189\nthrown at the call\nFalse\nTrue\nFalse\nFalse\n",
    }),
    practice("thread-safe-singleton", "A thread-safe Singleton", "Потокобезпечний Singleton", {
      starter: PROGRAM_WITH(singletonTypes("", stub, stub), singletonMain, singletonUsings),
      solution: PROGRAM_WITH(
        singletonTypes(
          "    private static readonly Lazy<AppSettings> lazy = new Lazy<AppSettings>(() => new AppSettings());",
          "            return lazy.Value;",
          "        Interlocked.Increment(ref hits);",
        ),
        singletonMain,
        singletonUsings,
      ),
      expectedOutput: "before first use: 0\nconstructor calls: 1\ndistinct instances: 1\nhits: 1000\n",
    }),
  ],
};

export const middleModules: ModuleDef[] = [
  middleGeneralModule,
  middlePlatformModule,
  middleCollectionsModule,
  middleDbModule,
  middlePracticalModule,
];
