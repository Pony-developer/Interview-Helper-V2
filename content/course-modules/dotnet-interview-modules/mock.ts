import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, quiz } from "../advanced-csharp-modules/shared";

/** A closing module: scripted mock interviews per level and a mixed exam after each. */
export const mockInterviewsModule: ModuleDef = {
  slug: "mock-interviews",
  title: { en: "Mock interviews and final exams", uk: "Пробні співбесіди та підсумкові іспити" },
  slides: [
    lecture("mock-interview-format", "How a .NET interview is structured", "Як побудована .NET-співбесіда"),
    lecture("mock-junior", "Mock interview: Junior", "Пробна співбесіда: Junior"),
    quiz("exam-junior", "Final exam: Junior", "Підсумковий іспит: Junior", [
      question(
        "j-pillars-example",
        ["`Shape s = new Circle(2); s.Area();` calls `Circle.Area`. Which principle is that?", "`Shape s = new Circle(2); s.Area();` викликає `Circle.Area`. Який це принцип?"],
        [["Polymorphism", "Поліморфізм"], ["Encapsulation", "Інкапсуляція"], ["Abstraction only", "Лише абстракція"], ["Recursion", "Рекурсія"]],
        "a",
      ),
      question(
        "j-finally",
        ["Which statements about `finally` are true?", "Які твердження про `finally` правильні?"],
        [
          ["It runs after `return` inside `try`", "Він виконується після `return` усередині `try`"],
          ["It runs when an exception is caught or not", "Він виконується, коли виняток перехоплено чи ні"],
          ["It doesn't run after `Environment.FailFast`", "Він не виконується після `Environment.FailFast`"],
          ["It runs only when there was no exception", "Він виконується, лише коли винятку не було"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "j-value-ref",
        ["`int[] a = {1}; int[] b = a; b[0] = 5;` — `a[0]` is…", "`int[] a = {1}; int[] b = a; b[0] = 5;` — `a[0]` дорівнює…"],
        [["5: arrays are reference types", "5: масиви — типи посилань"], ["1", "1"], ["0", "0"], ["Compile error", "Помилка компіляції"]],
        "a",
      ),
      question(
        "j-boxing",
        ["Which line boxes?", "Який рядок упаковує?"],
        [["`object o = 3.14;`", "`object o = 3.14;`"], ["`double d = 3;`", "`double d = 3;`"], ["`var l = new List<double>();`", "`var l = new List<double>();`"], ["`string s = \"3\";`", "`string s = \"3\";`"]],
        "a",
      ),
      question(
        "j-dictionary",
        ["Average complexity of `Dictionary.TryGetValue`?", "Середня складність `Dictionary.TryGetValue`?"],
        [["O(1)", "O(1)"], ["O(log n)", "O(log n)"], ["O(n)", "O(n)"], ["O(n log n)", "O(n log n)"]],
        "a",
      ),
      question(
        "j-interface",
        ["A class can…", "Клас може…"],
        [["implement many interfaces", "реалізовувати багато інтерфейсів"], ["inherit from one class", "успадковувати один клас"], ["inherit from two classes", "успадковувати два класи"], ["inherit from a struct", "успадковувати структуру"]],
        ["a", "b"],
      ),
      question(
        "j-override-new",
        ["`Base b = new Derived(); b.Show();` — `Show` is virtual in Base and declared with `new` in Derived. Which runs?", "`Base b = new Derived(); b.Show();` — `Show` віртуальний у Base й оголошений з `new` у Derived. Що виконається?"],
        [["Base.Show", "Base.Show"], ["Derived.Show", "Derived.Show"], ["Both", "Обидва"], ["Compile error", "Помилка компіляції"]],
        "a",
      ),
      question(
        "j-await",
        ["What is the main benefit of `await` for I/O in a web app?", "Яка головна перевага `await` для I/O у вебзастосунку?"],
        [["The thread returns to the pool while waiting, so the server handles more requests", "Потік повертається в пул під час очікування, тож сервер обслуговує більше запитів"], ["The query runs faster in the database", "Запит у базі виконується швидше"], ["It creates a thread per request", "Створює потік на кожен запит"], ["It caches the result", "Кешує результат"]],
        "a",
      ),
      question(
        "j-left-join",
        ["Which JOIN keeps customers that have no orders?", "Який JOIN зберігає клієнтів без замовлень?"],
        [["`customers LEFT JOIN orders`", "`customers LEFT JOIN orders`"], ["`customers INNER JOIN orders`", "`customers INNER JOIN orders`"], ["`customers CROSS JOIN orders`", "`customers CROSS JOIN orders`"], ["`orders LEFT JOIN customers`", "`orders LEFT JOIN customers`"]],
        "a",
      ),
      question(
        "j-aaa",
        ["A unit test consists of…", "Модульний тест складається з…"],
        [["Arrange, Act, Assert", "Arrange, Act, Assert"], ["Build, Deploy, Run", "Build, Deploy, Run"], ["Given, Deploy, Check", "Given, Deploy, Check"], ["Setup, Sleep, Verify", "Setup, Sleep, Verify"]],
        "a",
      ),
    ]),
    lecture("mock-middle", "Mock interview: Middle", "Пробна співбесіда: Middle"),
    quiz("exam-middle", "Final exam: Middle", "Підсумковий іспит: Middle", [
      question(
        "m-solid",
        ["A class that \"saves orders and sends emails and generates PDFs\" violates…", "Клас, що «зберігає замовлення, надсилає листи й генерує PDF», порушує…"],
        [["SRP", "SRP"], ["LSP", "LSP"], ["ISP", "ISP"], ["Nothing", "Нічого"]],
        "a",
      ),
      question(
        "m-lifetime",
        ["Which lifetime fits a `DbContext` in ASP.NET Core?", "Який час життя підходить для `DbContext` в ASP.NET Core?"],
        [["Scoped", "Scoped"], ["Singleton", "Singleton"], ["Transient always", "Завжди Transient"], ["Static", "Static"]],
        "a",
      ),
      question(
        "m-deferred",
        ["Which LINQ calls execute immediately?", "Які виклики LINQ виконуються негайно?"],
        [["`ToList()`", "`ToList()`"], ["`Count()`", "`Count()`"], ["`Where()`", "`Where()`"], ["`First()`", "`First()`"]],
        ["a", "b", "d"],
      ),
      question(
        "m-loh",
        ["Objects of 100 KB go to…", "Об'єкти розміром 100 КБ потрапляють у…"],
        [["The Large Object Heap", "Large Object Heap"], ["Gen 0", "Gen 0"], ["The stack", "Стек"], ["The finalization queue", "Чергу фіналізації"]],
        "a",
      ),
      question(
        "m-hash-contract",
        ["If `a.Equals(b)` is true, then…", "Якщо `a.Equals(b)` дорівнює true, то…"],
        [["`a.GetHashCode() == b.GetHashCode()` must be true", "`a.GetHashCode() == b.GetHashCode()` мусить бути true"], ["the hash codes must differ", "хеш-коди мусять відрізнятися"], ["`ReferenceEquals(a, b)` is true", "`ReferenceEquals(a, b)` дорівнює true"], ["nothing follows", "нічого не випливає"]],
        "a",
      ),
      question(
        "m-iqueryable",
        ["`IQueryable<T>` lambdas are…", "Лямбди в `IQueryable<T>` — це…"],
        [["expression trees translated by a provider", "дерева виразів, які перекладає провайдер"], ["compiled delegates run in memory", "скомпільовані делегати, що виконуються в пам'яті"], ["strings", "рядки"], ["SQL", "SQL"]],
        "a",
      ),
      question(
        "m-isolation",
        ["Which isolation level prevents dirty reads but allows non-repeatable reads?", "Який рівень ізоляції запобігає брудному читанню, але допускає неповторюване?"],
        [["Read Committed", "Read Committed"], ["Read Uncommitted", "Read Uncommitted"], ["Serializable", "Serializable"], ["Snapshot", "Snapshot"]],
        "a",
      ),
      question(
        "m-configureawait",
        ["Where does `ConfigureAwait(false)` matter most?", "Де `ConfigureAwait(false)` важить найбільше?"],
        [["In library code used by UI or classic ASP.NET apps", "У коді бібліотек, які використовують UI- або класичні ASP.NET-застосунки"], ["In ASP.NET Core controllers", "У контролерах ASP.NET Core"], ["In console apps only", "Лише в консольних застосунках"], ["In SQL", "У SQL"]],
        "a",
      ),
      question(
        "m-outbox",
        ["How do you save an order and publish an event without losing either?", "Як зберегти замовлення й опублікувати подію, не втративши жодного?"],
        [["Transactional outbox: write the event to an outbox table in the same transaction, publish it later with a relay", "Transactional outbox: записати подію в таблицю outbox у тій самій транзакції, опублікувати пізніше ретранслятором"], ["Publish first, then save", "Спершу опублікувати, потім зберегти"], ["Save, then publish without retries", "Зберегти, потім опублікувати без повторів"], ["Use two threads", "Використати два потоки"]],
        "a",
      ),
      question(
        "m-idempotent-consumer",
        ["Why must message consumers be idempotent?", "Чому споживачі повідомлень мають бути ідемпотентними?"],
        [["Brokers deliver at least once, so the same message can arrive twice", "Брокери доставляють щонайменше раз, тож те саме повідомлення може прийти двічі"], ["To be faster", "Щоб бути швидшими"], ["Because messages are encrypted", "Бо повідомлення зашифровані"], ["They don't have to be", "Не мусять"]],
        "a",
      ),
    ]),
    lecture("mock-senior", "Mock interview: Senior", "Пробна співбесіда: Senior"),
    quiz("exam-senior", "Final exam: Senior", "Підсумковий іспит: Senior", [
      question(
        "s-async-alloc",
        ["An async method whose awaited tasks are already completed…", "Асинхронний метод, чиї задачі вже завершені на момент await…"],
        [["runs synchronously and its state machine is not boxed to the heap", "виконується синхронно, і його автомат не упаковується в купу"], ["always allocates a new thread", "завжди виділяє новий потік"], ["deadlocks", "спричиняє взаємне блокування"], ["throws", "кидає виняток"]],
        "a",
      ),
      question(
        "s-lock-struct",
        ["Why can't you `lock` on a struct?", "Чому не можна робити `lock` на структурі?"],
        [["It would be boxed into a new object each time, so no two threads would share the lock (the compiler forbids it)", "Вона щоразу упаковувалася б у новий об'єкт, тож жодні два потоки не ділили б блокування (компілятор забороняє)"], ["Structs are immutable", "Структури незмінні"], ["Structs live in the LOH", "Структури живуть у LOH"], ["You can", "Можна"]],
        "a",
      ),
      question(
        "s-generations",
        ["Why is Gen 1 useful?", "Чим корисне Gen 1?"],
        [["It buffers objects that survive one collection, so mid-lived objects don't get promoted to the expensive Gen 2 too early", "Воно буферизує об'єкти, що пережили одне збирання, щоб об'єкти середнього віку не потрапляли надто рано в дороге Gen 2"], ["It stores large objects", "Воно зберігає великі об'єкти"], ["It holds static fields", "Воно містить статичні поля"], ["It isn't", "Ні чим"]],
        "a",
      ),
      question(
        "s-saga",
        ["A saga's failed step at position 3 triggers…", "Невдалий крок саги на позиції 3 запускає…"],
        [["compensations of steps 2 and 1, in that order", "компенсації кроків 2 і 1 у такому порядку"], ["compensation of step 3 only", "лише компенсацію кроку 3"], ["a two-phase commit", "двофазний коміт"], ["nothing", "нічого"]],
        "a",
      ),
      question(
        "s-circuit",
        ["In the Open state, a circuit breaker…", "У стані Open circuit breaker…"],
        [["fails calls fast without calling the dependency until the break time passes", "швидко відхиляє виклики, не звертаючись до залежності, доки не мине пауза"], ["retries every call", "повторює кожен виклик"], ["queues calls", "ставить виклики в чергу"], ["calls a backup database", "звертається до резервної бази"]],
        "a",
      ),
      question(
        "s-fencing",
        ["What protects storage from a client whose distributed lock already expired?", "Що захищає сховище від клієнта, чиє розподілене блокування вже спливло?"],
        [["A fencing token checked by the storage on every write", "Fencing-токен, який сховище перевіряє на кожному записі"], ["A longer TTL", "Довший TTL"], ["A plain DEL on release", "Простий DEL під час звільнення"], ["Nothing can", "Ніщо"]],
        "a",
      ),
      question(
        "s-exactly-once",
        ["\"Exactly-once\" processing in practice is achieved by…", "Обробку «рівно раз» на практиці досягають через…"],
        [["at-least-once delivery + idempotent processing", "доставку at-least-once + ідемпотентну обробку"], ["at-most-once delivery", "доставку at-most-once"], ["HTTP/3", "HTTP/3"], ["Bigger servers", "Потужніші сервери"]],
        "a",
      ),
      question(
        "s-keyset",
        ["Which pagination stays fast on page 10,000?", "Яка пагінація лишається швидкою на сторінці 10 000?"],
        [["Keyset (`WHERE (created_at, id) < (@c, @id) ORDER BY … LIMIT 20`)", "Keyset (`WHERE (created_at, id) < (@c, @id) ORDER BY … LIMIT 20`)"], ["`OFFSET 200000 LIMIT 20`", "`OFFSET 200000 LIMIT 20`"], ["Loading all rows and paging in memory", "Завантажити всі рядки й ділити на сторінки в пам'яті"], ["`SELECT TOP 20` without ORDER BY", "`SELECT TOP 20` без ORDER BY"]],
        "a",
      ),
      question(
        "s-queue-topic",
        ["Several services must each react to `OrderPlaced`. In Azure Service Bus use…", "Кілька сервісів мають кожен реагувати на `OrderPlaced`. В Azure Service Bus використайте…"],
        [["A topic with one subscription per service", "Топік з окремою підпискою для кожного сервісу"], ["One queue shared by all services", "Одну чергу для всіх сервісів"], ["Table Storage", "Table Storage"], ["A blob lease", "Оренду blob"]],
        "a",
      ),
      question(
        "s-cold-start",
        ["Which reduce Azure Functions cold starts?", "Що зменшує холодні старти Azure Functions?"],
        [["Premium / Flex Consumption with always-ready instances", "Premium / Flex Consumption з постійно готовими екземплярами"], ["A Dedicated plan with Always On", "Dedicated-план з Always On"], ["Smaller deployment packages and lighter startup", "Менші пакети розгортання й легший старт"], ["More logging", "Більше логування"]],
        ["a", "b", "c"],
      ),
    ]),
  ],
};
