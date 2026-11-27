import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";
import {
  callStackPractice,
  fileSystemPractice,
  hashTasksPractice,
  juniorAsyncDbQuiz2,
  juniorClassesLecture,
  juniorClassesQuiz,
  juniorCollectionsLecture,
  juniorCollectionsQuiz,
  juniorDelegatesLinqLecture,
  juniorExceptionsLecture,
  juniorGeneralQuiz2,
  juniorMemoryLecture,
  juniorOopLecture,
  juniorPlatformQuiz2,
  juniorSqlJoinsLecture,
  juniorUnitTestingLecture,
  juniorWebDockerLecture,
  paymentsPractice,
  primesPractice,
  projectsSqlPractice,
} from "./junior-more";

const stub = "        throw new NotImplementedException();";

const romanTypes = (toRoman: string, fromRoman: string, calc: string) => `static class Roman
{
    // 1..3999 -> Roman numeral; throws ArgumentOutOfRangeException outside that range.
    public static string ToRoman(int value)
    {
${toRoman}
    }

    // Roman numeral -> int (subtractive notation: IV = 4, XC = 90, CM = 900).
    public static int FromRoman(string roman)
    {
${fromRoman}
    }

    // "XIV + IX" -> "XXIII". Operators: + - * / (integer division). Operands and operator are separated by spaces.
    public static string Calculate(string expression)
    {
${calc}
    }
}`;

const romanMain = `        Console.WriteLine(Roman.ToRoman(1994) + " " + Roman.ToRoman(4) + " " + Roman.ToRoman(3999));
        Console.WriteLine(Roman.FromRoman("MCMXCIV") + " " + Roman.FromRoman("XLII"));
        foreach (var e in new[] { "XIV + IX", "C - I", "XII * XII", "X / III", "V - X" })
        {
            try { Console.WriteLine(e + " = " + Roman.Calculate(e)); }
            catch (ArgumentOutOfRangeException) { Console.WriteLine(e + " = out of range"); }
        }`;

const juniorGeneralModule: ModuleDef = {
  slug: "junior-general",
  title: { en: "Junior: general questions", uk: "Junior: загальні питання" },
  slides: [
    lecture("junior-questions", "Junior interview questions", "Питання співбесіди Junior"),
    lecture("junior-general", "General questions: OOP, web, Docker, tests", "Загальні питання: ООП, веб, Docker, тести"),
    juniorOopLecture,
    juniorWebDockerLecture,
    quiz("junior-general-quiz", "General questions", "Загальні питання", [
      question(
        "oop-pillars",
        ["Which are the four classic principles of OOP?", "Які чотири класичні принципи ООП?"],
        [
          ["Encapsulation, inheritance, polymorphism, abstraction", "Інкапсуляція, успадкування, поліморфізм, абстракція"],
          ["Compilation, linking, loading, execution", "Компіляція, компонування, завантаження, виконання"],
          ["Classes, structs, enums, interfaces", "Класи, структури, переліки, інтерфейси"],
          ["Single responsibility, open/closed, Liskov, DRY", "Єдина відповідальність, відкритість/закритість, Лісков, DRY"],
        ],
        "a",
      ),
      question(
        "object-base",
        ["Which statements about inheritance in C# are true?", "Які твердження про успадкування в C# правильні?"],
        [
          ["Every type implicitly derives from `System.Object`", "Кожен тип неявно походить від `System.Object`"],
          ["A class can inherit from several base classes", "Клас може успадковувати кілька базових класів"],
          ["A class can implement several interfaces", "Клас може реалізовувати кілька інтерфейсів"],
          ["A struct can inherit from a class", "Структура може успадковувати клас"],
        ],
        ["a", "c"],
      ),
      question(
        "recursion",
        ["What must every recursive method have to avoid a `StackOverflowException`?", "Що обов'язково має бути в рекурсивному методі, щоб уникнути `StackOverflowException`?"],
        [
          ["A `try/catch` block", "Блок `try/catch`"],
          ["A base case that stops the recursion, and progress toward it on every call", "Базовий випадок, що зупиняє рекурсію, і рух до нього на кожному виклику"],
          ["The `static` modifier", "Модифікатор `static`"],
          ["A return type of `void`", "Тип повернення `void`"],
        ],
        "b",
      ),
      question(
        "lambda",
        ["What is `x => x * 2` in C#?", "Що таке `x => x * 2` у C#?"],
        [
          ["A lambda expression: an anonymous function that can be converted to a delegate or an expression tree", "Лямбда-вираз: анонімна функція, яку можна перетворити на делегат або дерево виразів"],
          ["A pointer to a method", "Вказівник на метод"],
          ["A comparison operator", "Оператор порівняння"],
          ["A LINQ keyword", "Ключове слово LINQ"],
        ],
        "a",
      ),
      question(
        "rest",
        ["Which are REST constraints?", "Які з цього є обмеженнями REST?"],
        [
          ["Client-server and a stateless server", "Клієнт-сервер і сервер без стану"],
          ["A uniform interface: resources identified by URIs and manipulated through representations", "Уніфікований інтерфейс: ресурси ідентифікуються URI й змінюються через представлення"],
          ["Cacheable responses", "Відповіді, які можна кешувати"],
          ["Every response must be XML", "Кожна відповідь має бути XML"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "get-post",
        ["Which statements about GET and POST are true?", "Які твердження про GET і POST правильні?"],
        [
          ["GET is safe and idempotent; POST is neither", "GET безпечний та ідемпотентний; POST ні те, ні інше"],
          ["GET parameters go in the URL; POST usually carries data in the body", "Параметри GET ідуть в URL; POST зазвичай передає дані в тілі"],
          ["POST responses can never be cached by default the way GET responses are", "Відповіді на POST за замовчуванням не кешуються так, як відповіді на GET"],
          ["POST is encrypted, GET is not", "POST шифрується, GET ні"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "spa",
        ["What is a Single Page Application?", "Що таке Single Page Application?"],
        [
          ["A site with exactly one page of content", "Сайт рівно з однією сторінкою контенту"],
          ["An app that loads one HTML shell and then renders views in the browser, fetching data (usually JSON) from an API", "Застосунок, що завантажує одну HTML-оболонку, а далі рендерить подання в браузері, отримуючи дані (зазвичай JSON) з API"],
          ["A server that renders every page on each click", "Сервер, що рендерить кожну сторінку на кожен клік"],
          ["A page without JavaScript", "Сторінка без JavaScript"],
        ],
        "b",
      ),
      question(
        "docker",
        ["What problem does Docker mainly solve?", "Яку проблему переважно розв'язує Docker?"],
        [
          ["It makes code run faster than on bare metal", "Робить код швидшим, ніж на «залізі»"],
          ["It packages an app with its dependencies into an image that runs the same way on any host with a container runtime", "Пакує застосунок із залежностями в образ, який однаково запускається на будь-якому хості з контейнерним рантаймом"],
          ["It replaces the need for an operating system", "Усуває потребу в операційній системі"],
          ["It is a full virtual machine with its own kernel", "Це повноцінна віртуальна машина з власним ядром"],
        ],
        "b",
      ),
      question(
        "unit-vs-integration",
        ["How does a unit test differ from an integration test?", "Чим модульний тест відрізняється від інтеграційного?"],
        [
          ["A unit test checks one unit in isolation, with dependencies replaced by fakes; an integration test checks real components working together (DB, HTTP, file system)", "Модульний тест перевіряє одну одиницю ізольовано, із залежностями, заміненими підробками; інтеграційний перевіряє реальні компоненти разом (БД, HTTP, файлова система)"],
          ["Unit tests are written by testers, integration tests by developers", "Модульні тести пишуть тестувальники, інтеграційні розробники"],
          ["There is no difference", "Різниці немає"],
          ["Integration tests are always faster", "Інтеграційні тести завжди швидші"],
        ],
        "a",
      ),
      question(
        "gof",
        ["Which of these are GoF design patterns?", "Які з цього є патернами GoF?"],
        [
          ["Singleton", "Singleton"],
          ["Observer", "Observer"],
          ["Repository", "Repository"],
          ["Decorator", "Decorator"],
        ],
        ["a", "b", "d"],
      ),
    ]),
    juniorGeneralQuiz2,
    fileSystemPractice,
  ],
};

const juniorPlatformModule: ModuleDef = {
  slug: "junior-platform",
  title: { en: "Junior: exceptions and the .NET platform", uk: "Junior: винятки та платформа .NET" },
  slides: [
    lecture("junior-platform", "Exceptions and the .NET platform", "Винятки та платформа .NET"),
    juniorExceptionsLecture,
    juniorDelegatesLinqLecture,
    quiz("junior-platform-quiz", "Exceptions and the platform", "Винятки та платформа", [
      question(
        "finally-skip",
        ["When may a `finally` block NOT run?", "Коли блок `finally` може НЕ виконатися?"],
        [
          ["When the `try` block returns a value", "Коли блок `try` повертає значення"],
          ["When the process is killed, `Environment.FailFast` is called or a `StackOverflowException` happens", "Коли процес примусово завершують, викликано `Environment.FailFast` або стався `StackOverflowException`"],
          ["When the `catch` block rethrows", "Коли блок `catch` перекидає виняток"],
          ["Never; it always runs", "Ніколи; він виконується завжди"],
        ],
        "b",
      ),
      question(
        "call-stack",
        ["What is the call stack?", "Що таке стек викликів?"],
        [
          ["The list of NuGet packages", "Список пакетів NuGet"],
          ["A per-thread stack of frames, one per active method call, holding return addresses, parameters and locals", "Стек кадрів для кожного потоку, по кадру на кожен активний виклик методу, з адресою повернення, параметрами та локальними змінними"],
          ["The managed heap", "Керована купа"],
          ["The history of exceptions", "Історія винятків"],
        ],
        "b",
      ),
      question(
        "clr",
        ["What does the CLR do?", "Що робить CLR?"],
        [
          ["Compiles IL to native code with the JIT", "Компілює IL у нативний код через JIT"],
          ["Manages memory with the garbage collector", "Керує пам'яттю за допомогою збирача сміття"],
          ["Enforces type safety and handles exceptions", "Забезпечує типобезпеку та обробляє винятки"],
          ["Translates SQL to C#", "Перекладає SQL у C#"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "gc-basic",
        ["What does the garbage collector free?", "Що звільняє збирач сміття?"],
        [
          ["Objects on the managed heap that are no longer reachable from any root (static fields, locals, CPU registers)", "Об'єкти в керованій купі, до яких уже не можна дістатися з жодного кореня (статичні поля, локальні змінні, регістри)"],
          ["Every object as soon as a method returns", "Кожен об'єкт одразу після повернення з методу"],
          ["File handles and database connections immediately", "Дескриптори файлів і з'єднання з БД негайно"],
          ["Only value types", "Лише типи значень"],
        ],
        "a",
      ),
      question(
        "delegate-action",
        ["How do `delegate`, `Action` and `Func` relate?", "Як пов'язані `delegate`, `Action` і `Func`?"],
        [
          ["`Action` and `Func` are ready-made generic delegate types; `delegate` declares your own delegate type", "`Action` і `Func` — готові узагальнені типи делегатів; `delegate` оголошує власний тип делегата"],
          ["`Action` returns a value, `Func` doesn't", "`Action` повертає значення, `Func` ні"],
          ["They are unrelated", "Вони ніяк не пов'язані"],
          ["`Action` can only point to static methods", "`Action` може вказувати лише на статичні методи"],
        ],
        "a",
      ),
      question(
        "action-filters",
        ["Which filter types does ASP.NET Core MVC have?", "Які типи фільтрів є в ASP.NET Core MVC?"],
        [
          ["Authorization filters", "Фільтри авторизації"],
          ["Resource and action filters", "Фільтри ресурсів і дій"],
          ["Exception and result filters", "Фільтри винятків і результатів"],
          ["Garbage filters", "Фільтри сміття"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "linq",
        ["What is LINQ?", "Що таке LINQ?"],
        [
          ["A database engine", "Рушій бази даних"],
          ["A set of query operators (Where, Select, OrderBy…) and query syntax that work over any IEnumerable<T> or IQueryable<T>", "Набір операторів запитів (Where, Select, OrderBy…) і синтаксис запитів, що працюють з будь-яким IEnumerable<T> чи IQueryable<T>"],
          ["A logging library", "Бібліотека логування"],
          ["A replacement for SQL Server", "Заміна SQL Server"],
        ],
        "b",
      ),
      question(
        "namespace",
        ["Why are namespaces needed?", "Навіщо потрібні простори імен?"],
        [
          ["To group related types and avoid name clashes between types with the same name", "Щоб групувати пов'язані типи та уникати конфліктів між типами з однаковими іменами"],
          ["To control memory allocation", "Щоб керувати виділенням пам'яті"],
          ["To make types private", "Щоб робити типи приватними"],
          ["They are the same as assemblies", "Це те саме, що збірки"],
        ],
        "a",
      ),
    ]),
    juniorPlatformQuiz2,
    callStackPractice,
  ],
};

const juniorTypesModule: ModuleDef = {
  slug: "junior-types",
  title: { en: "Junior: data types and collections", uk: "Junior: типи даних і колекції" },
  slides: [
    lecture("junior-types", "Types, collections, classes and structs", "Типи, колекції, класи та структури"),
    juniorMemoryLecture,
    juniorCollectionsLecture,
    quiz("junior-types-quiz", "Types and collections", "Типи та колекції", [
      question(
        "string-ref",
        ["Is `string` a value type or a reference type?", "`string` — це тип значення чи тип посилання?"],
        [
          ["Value type, because it compares by value", "Тип значення, бо порівнюється за значенням"],
          ["Reference type that is immutable and overloads `==` to compare contents", "Тип посилання, незмінний, з перевантаженим `==`, що порівнює вміст"],
          ["A struct allocated on the stack", "Структура, що розміщується в стеку"],
          ["A primitive pointer", "Примітивний вказівник"],
        ],
        "b",
      ),
      question(
        "stringbuilder",
        ["Why use `StringBuilder` in a loop that appends 10,000 pieces?", "Навіщо `StringBuilder` у циклі, що додає 10 000 фрагментів?"],
        [
          ["Each `string +` creates a new string and copies everything, O(n²) overall; `StringBuilder` appends into a growable buffer", "Кожен `string +` створює новий рядок і копіює все, разом O(n²); `StringBuilder` дописує в буфер, що росте"],
          ["`string` cannot hold more than 1,000 characters", "`string` не вміщує понад 1000 символів"],
          ["`StringBuilder` is thread-safe", "`StringBuilder` потокобезпечний"],
          ["There is no benefit", "Ніякої користі немає"],
        ],
        "a",
      ),
      question(
        "boxing",
        ["Which line causes boxing?", "Який рядок спричиняє упакування (boxing)?"],
        [
          ["`int x = 5; long y = x;`", "`int x = 5; long y = x;`"],
          ["`int x = 5; object o = x;`", "`int x = 5; object o = x;`"],
          ["`var list = new List<int> { 5 };`", "`var list = new List<int> { 5 };`"],
          ["`string s = \"5\";`", "`string s = \"5\";`"],
        ],
        "b",
      ),
      question(
        "nullable",
        ["What is `int?`?", "Що таке `int?`?"],
        [
          ["`Nullable<int>`: a struct with `HasValue` and `Value`, so a value type can be null", "`Nullable<int>`: структура з `HasValue` і `Value`, щоб тип значення міг бути null"],
          ["A reference to an int", "Посилання на int"],
          ["An int that cannot overflow", "Int, що не може переповнитися"],
          ["A pointer that may be invalid", "Вказівник, що може бути недійсним"],
        ],
        "a",
      ),
      question(
        "complexity",
        ["Which complexities are right (average case)?", "Які складності правильні (у середньому)?"],
        [
          ["`Dictionary` lookup by key: O(1)", "Пошук у `Dictionary` за ключем: O(1)"],
          ["`HashSet.Contains`: O(1)", "`HashSet.Contains`: O(1)"],
          ["`List.Contains`: O(1)", "`List.Contains`: O(1)"],
          ["`List.Add` at the end: amortized O(1); `List.Insert(0, x)`: O(n)", "`List.Add` у кінець: амортизовано O(1); `List.Insert(0, x)`: O(n)"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "yield",
        ["What does `yield return` do?", "Що робить `yield return`?"],
        [
          ["Returns the whole collection at once", "Повертає всю колекцію одразу"],
          ["Turns the method into an iterator: the compiler builds a state machine that produces one element per `MoveNext()`, lazily", "Перетворює метод на ітератор: компілятор будує скінченний автомат, який видає по одному елементу на кожен `MoveNext()`, ліниво"],
          ["Starts a new thread", "Запускає новий потік"],
          ["Pauses the thread like `Thread.Sleep`", "Призупиняє потік, як `Thread.Sleep`"],
        ],
        "b",
      ),
      question(
        "abstract-interface",
        ["Which statements about abstract classes and interfaces are true?", "Які твердження про абстрактні класи та інтерфейси правильні?"],
        [
          ["An abstract class can hold state (fields) and constructors; an interface cannot have instance fields", "Абстрактний клас може мати стан (поля) і конструктори; інтерфейс не може мати полів екземпляра"],
          ["A class can implement many interfaces but derive from only one class", "Клас може реалізовувати багато інтерфейсів, але успадковувати лише один клас"],
          ["You can create an instance of an abstract class with `new`", "Можна створити екземпляр абстрактного класу через `new`"],
          ["Interfaces describe a contract (can-do), abstract classes share a base implementation (is-a)", "Інтерфейси описують контракт (вміє), абстрактні класи — спільну базову реалізацію (є)"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "new-override",
        ["`Base b = new Derived(); b.M();` `M` is `virtual` in Base. Which version runs if Derived declares `new void M()` and which if it declares `override void M()`?", "`Base b = new Derived(); b.M();` `M` у Base віртуальний. Яка версія виконається, якщо Derived оголошує `new void M()`, а яка, якщо `override void M()`?"],
        [
          ["`new`: Base.M; `override`: Derived.M", "`new`: Base.M; `override`: Derived.M"],
          ["Both run Derived.M", "Обидва викликають Derived.M"],
          ["Both run Base.M", "Обидва викликають Base.M"],
          ["`new`: Derived.M; `override`: Base.M", "`new`: Derived.M; `override`: Base.M"],
        ],
        "a",
      ),
      question(
        "const-readonly",
        ["How do `const` and `readonly` differ?", "Чим відрізняються `const` і `readonly`?"],
        [
          ["`const` is a compile-time constant baked into calling code; `readonly` is set at run time, in the declaration or a constructor", "`const` — константа часу компіляції, що вбудовується у код викликача; `readonly` задається під час виконання, в оголошенні чи конструкторі"],
          ["`readonly` can only be used with strings", "`readonly` можна використовувати лише з рядками"],
          ["`const` fields can be changed in the constructor", "Поля `const` можна змінити в конструкторі"],
          ["There is no difference", "Різниці немає"],
        ],
        "a",
      ),
      question(
        "struct-heap",
        ["When does a struct instance end up on the heap?", "Коли екземпляр структури опиняється в купі?"],
        [
          ["When it is a field of a class or an element of an array", "Коли він є полем класу або елементом масиву"],
          ["When it is boxed (assigned to `object` or an interface)", "Коли його упаковано (присвоєно `object` чи інтерфейсу)"],
          ["When it is captured by a lambda or used in an async method / iterator", "Коли його захоплено лямбдою або він використовується в async-методі чи ітераторі"],
          ["Never; structs always live on the stack", "Ніколи; структури завжди живуть у стеку"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "static-class",
        ["What is true about a `static` class?", "Що правда про `static`-клас?"],
        [
          ["It cannot be instantiated or inherited and contains only static members", "Його не можна створити чи успадкувати, і він містить лише статичні члени"],
          ["It can implement interfaces", "Він може реалізовувати інтерфейси"],
          ["It is created anew on every call", "Він створюється заново при кожному виклику"],
          ["It is automatically thread-safe", "Він автоматично потокобезпечний"],
        ],
        "a",
      ),
    ]),
    juniorCollectionsQuiz,
    hashTasksPractice,
  ],
};

const juniorClassesModule: ModuleDef = {
  slug: "junior-classes",
  title: { en: "Junior: classes, structs and interfaces", uk: "Junior: класи, структури та інтерфейси" },
  slides: [juniorClassesLecture, juniorClassesQuiz, paymentsPractice],
};

const juniorAsyncDbTestsModule: ModuleDef = {
  slug: "junior-async-db-tests",
  title: { en: "Junior: async, databases and testing", uk: "Junior: асинхронність, бази даних і тестування" },
  slides: [
    lecture("junior-async-db-tests", "Async, databases and unit tests", "Асинхронність, бази даних і модульні тести"),
    juniorSqlJoinsLecture,
    juniorUnitTestingLecture,
    quiz("junior-async-db-tests-quiz", "Async, databases and tests", "Асинхронність, БД і тести", [
      question(
        "async-vs-threads",
        ["How does asynchrony differ from multithreading?", "Чим асинхронність відрізняється від багатопотоковості?"],
        [
          ["Async is about not blocking a thread while waiting (I/O); multithreading is about running work on several threads at once", "Асинхронність — про те, щоб не блокувати потік під час очікування (I/O); багатопотоковість — про виконання роботи на кількох потоках одночасно"],
          ["`async` always creates a new thread", "`async` завжди створює новий потік"],
          ["They are the same thing", "Це одне й те саме"],
          ["Async code can only run on the UI thread", "Асинхронний код може працювати лише в UI-потоці"],
        ],
        "a",
      ),
      question(
        "await",
        ["What does `await` do when the awaited task is not finished yet?", "Що робить `await`, якщо задача, яку очікують, ще не завершилася?"],
        [
          ["Blocks the current thread until it finishes", "Блокує поточний потік до її завершення"],
          ["Returns control to the caller and schedules the rest of the method as a continuation", "Повертає керування викликачу й планує решту методу як продовження"],
          ["Throws an exception", "Кидає виняток"],
          ["Starts a new thread for the rest of the method", "Запускає новий потік для решти методу"],
        ],
        "b",
      ),
      question(
        "sql-nosql",
        ["Which statements about relational vs NoSQL databases are true?", "Які твердження про реляційні та NoSQL бази правильні?"],
        [
          ["Relational DBs have a fixed schema, joins and strong ACID transactions", "Реляційні БД мають фіксовану схему, з'єднання та строгі ACID-транзакції"],
          ["NoSQL stores (document, key-value, column, graph) usually trade flexible schemas and easy horizontal scaling for weaker joins/consistency", "NoSQL-сховища (документні, ключ-значення, колонкові, графові) зазвичай дають гнучку схему й легке горизонтальне масштабування ціною слабших з'єднань/узгодженості"],
          ["NoSQL databases cannot be queried", "До NoSQL-баз не можна робити запити"],
          ["Relational DBs cannot be replicated", "Реляційні БД не можна реплікувати"],
        ],
        ["a", "b"],
      ),
      question(
        "index",
        ["What does a B-tree index give you, and at what cost?", "Що дає B-tree-індекс і якою ціною?"],
        [
          ["Faster lookups, range scans and sorting on the indexed columns, at the cost of extra storage and slower writes", "Швидший пошук, діапазонне сканування й сортування за проіндексованими колонками ціною додаткового місця й повільніших записів"],
          ["Faster writes and no extra storage", "Швидші записи й жодного додаткового місця"],
          ["Guaranteed uniqueness of all columns", "Гарантовану унікальність усіх колонок"],
          ["Nothing; indexes are only documentation", "Нічого; індекси — це лише документація"],
        ],
        "a",
      ),
      question(
        "joins",
        ["Which JOIN returns all rows of the left table, with NULLs where there is no match on the right?", "Який JOIN повертає всі рядки лівої таблиці з NULL там, де праворуч немає збігу?"],
        [
          ["INNER JOIN", "INNER JOIN"],
          ["LEFT (OUTER) JOIN", "LEFT (OUTER) JOIN"],
          ["CROSS JOIN", "CROSS JOIN"],
          ["RIGHT JOIN", "RIGHT JOIN"],
        ],
        "b",
      ),
      question(
        "aaa",
        ["What are the three logical blocks of a unit test?", "Які три логічні блоки має модульний тест?"],
        [
          ["Arrange, Act, Assert", "Arrange, Act, Assert"],
          ["Setup, Teardown, Dispose", "Setup, Teardown, Dispose"],
          ["Given, When, Deploy", "Given, When, Deploy"],
          ["Build, Run, Ship", "Build, Run, Ship"],
        ],
        "a",
      ),
      question(
        "unit-test-pros-cons",
        ["Which are real benefits of unit tests?", "Які з цього — реальні переваги модульних тестів?"],
        [
          ["Fast feedback and safe refactoring", "Швидкий зворотний зв'язок і безпечний рефакторинг"],
          ["They document how code is meant to be used", "Вони документують, як має використовуватися код"],
          ["They prove the whole system works end to end", "Вони доводять, що вся система працює від початку до кінця"],
          ["They push you toward loosely coupled, testable design", "Вони підштовхують до слабко зв'язаного, тестованого дизайну"],
        ],
        ["a", "b", "d"],
      ),
    ]),
    juniorAsyncDbQuiz2,
    projectsSqlPractice,
  ],
};

const juniorPracticalModule: ModuleDef = {
  slug: "junior-practical",
  title: { en: "Junior: practical tasks", uk: "Junior: практичні задачі" },
  slides: [
    lecture("junior-code-review", "Practical tasks: reading and improving code", "Практичні задачі: читаємо й покращуємо код"),
    primesPractice,
    practice("roman-calculator", "A Roman numeral calculator", "Калькулятор римських чисел", {
      starter: PROGRAM_WITH(romanTypes(stub, stub, stub), romanMain),
      solution: PROGRAM_WITH(
        romanTypes(
          `        if (value < 1 || value > 3999) throw new ArgumentOutOfRangeException("value");
        int[] numbers = { 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 };
        string[] symbols = { "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I" };
        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < numbers.Length; i++)
            while (value >= numbers[i]) { sb.Append(symbols[i]); value -= numbers[i]; }
        return sb.ToString();`,
          `        int total = 0;
        for (int i = 0; i < roman.Length; i++)
        {
            int current = Digit(roman[i]);
            int next = i + 1 < roman.Length ? Digit(roman[i + 1]) : 0;
            total += current < next ? -current : current;
        }
        return total;
    }

    static int Digit(char c)
    {
        switch (c)
        {
            case 'I': return 1;
            case 'V': return 5;
            case 'X': return 10;
            case 'L': return 50;
            case 'C': return 100;
            case 'D': return 500;
            case 'M': return 1000;
            default: throw new FormatException("Not a Roman digit: " + c);
        }`,
          `        string[] parts = expression.Split(' ');
        int a = FromRoman(parts[0]), b = FromRoman(parts[2]);
        int result;
        switch (parts[1])
        {
            case "+": result = a + b; break;
            case "-": result = a - b; break;
            case "*": result = a * b; break;
            case "/": result = a / b; break;
            default: throw new FormatException("Unknown operator " + parts[1]);
        }
        return ToRoman(result);`,
        ),
        romanMain,
      ),
      expectedOutput:
        "MCMXCIV IV MMMCMXCIX\n1994 42\nXIV + IX = XXIII\nC - I = XCIX\nXII * XII = CXLIV\nX / III = III\nV - X = out of range\n",
    }),
  ],
};

export const juniorModules: ModuleDef[] = [
  juniorGeneralModule,
  juniorPlatformModule,
  juniorTypesModule,
  juniorClassesModule,
  juniorAsyncDbTestsModule,
  juniorPracticalModule,
];
