import { PROGRAM_WITH } from "../csharp-code";
import { WRITE_QUERY } from "../databases-data";
import { question } from "../frontend-interview-modules/quiz";
import type { SlideDef } from "../types";
import { lecture, practice, quiz } from "../advanced-csharp-modules/shared";

const stub = "        throw new NotImplementedException();";

/* ---------- Section 1: general (Q1–12) ---------- */

export const juniorOopLecture = lecture("junior-oop-examples", "OOP in code: the four principles with examples", "ООП у коді: чотири принципи на прикладах");
export const juniorWebDockerLecture = lecture("junior-web-docker", "JSON, REST, SPA, Docker and tests in practice", "JSON, REST, SPA, Docker і тести на практиці");

export const juniorGeneralQuiz2 = quiz("junior-general-quiz-2", "General questions, part 2", "Загальні питання, частина 2", [
  question(
    "encapsulation-code",
    ["Which design shows encapsulation best?", "Який дизайн найкраще показує інкапсуляцію?"],
    [
      ["`public decimal Balance;` that any code can set", "`public decimal Balance;`, який будь-хто може змінити"],
      ["`public decimal Balance { get; private set; }` plus `Deposit()` / `Withdraw()` that check the rules", "`public decimal Balance { get; private set; }` плюс `Deposit()` / `Withdraw()`, що перевіряють правила"],
      ["A static global `Balance` variable", "Статична глобальна змінна `Balance`"],
      ["Storing the balance in a public array", "Зберігати баланс у публічному масиві"],
    ],
    "b",
  ),
  question(
    "composition",
    ["`class Car : Engine` — what is wrong?", "`class Car : Engine` — що не так?"],
    [
      ["Nothing", "Нічого"],
      ["A car *has* an engine, it *is not* an engine: use composition (`private readonly Engine _engine`)", "Автомобіль *має* двигун, а не *є* двигуном: використайте композицію (`private readonly Engine _engine`)"],
      ["C# forbids inheriting from classes", "C# забороняє успадкування від класів"],
      ["`Engine` must be an interface", "`Engine` мусить бути інтерфейсом"],
    ],
    "b",
  ),
  question(
    "polymorphism-kinds",
    ["Which are kinds of polymorphism in C#?", "Які види поліморфізму є в C#?"],
    [
      ["Subtype polymorphism: virtual/override and interfaces", "Поліморфізм підтипів: virtual/override та інтерфейси"],
      ["Ad-hoc polymorphism: method and operator overloading", "Ad-hoc поліморфізм: перевантаження методів і операторів"],
      ["Parametric polymorphism: generics", "Параметричний поліморфізм: generics"],
      ["Namespace polymorphism", "Поліморфізм просторів імен"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "tail-recursion",
    ["Does the C# compiler guarantee tail-call optimization for recursive methods?", "Чи гарантує компілятор C# оптимізацію хвостової рекурсії?"],
    [
      ["Yes, always", "Так, завжди"],
      ["No; deep recursion can still overflow the stack, so convert it to a loop when depth is unbounded", "Ні; глибока рекурсія все одно може переповнити стек, тож за необмеженої глибини перепишіть її циклом"],
      ["Only for `static` methods", "Лише для `static`-методів"],
      ["Only in Debug builds", "Лише в Debug-збірках"],
    ],
    "b",
  ),
  question(
    "closure-loop",
    ["`var actions = new List<Action>(); for (int i = 0; i < 3; i++) actions.Add(() => Console.Write(i));` What does running all actions print?", "`var actions = new List<Action>(); for (int i = 0; i < 3; i++) actions.Add(() => Console.Write(i));` Що надрукує запуск усіх дій?"],
    [
      ["012", "012"],
      ["333 — all lambdas capture the same variable `i`", "333 — усі лямбди захоплюють ту саму змінну `i`"],
      ["000", "000"],
      ["It does not compile", "Не скомпілюється"],
    ],
    "b",
  ),
  question(
    "parallel-tools",
    ["You need to process 10,000 images using all CPU cores. Good tools?", "Треба обробити 10 000 зображень на всіх ядрах процесора. Які інструменти підходять?"],
    [
      ["`Parallel.ForEach` with `MaxDegreeOfParallelism`", "`Parallel.ForEach` з `MaxDegreeOfParallelism`"],
      ["PLINQ: `images.AsParallel().Select(Process)`", "PLINQ: `images.AsParallel().Select(Process)`"],
      ["`await Task.Delay` in a loop", "`await Task.Delay` у циклі"],
      ["Creating 10,000 `Thread` objects", "Створити 10 000 об'єктів `Thread`"],
    ],
    ["a", "b"],
  ),
  question(
    "json-types",
    ["Which of these is valid JSON?", "Що з цього — валідний JSON?"],
    [
      ["`{ \"name\": \"Ann\", \"age\": 30, \"tags\": [\"a\", \"b\"], \"manager\": null }`", "`{ \"name\": \"Ann\", \"age\": 30, \"tags\": [\"a\", \"b\"], \"manager\": null }`"],
      ["`{ name: 'Ann' }`", "`{ name: 'Ann' }`"],
      ["`{ \"date\": new Date() }`", "`{ \"date\": new Date() }`"],
      ["`{ \"a\": 1, }`", "`{ \"a\": 1, }`"],
    ],
    "a",
  ),
  question(
    "rest-status",
    ["A REST API created a new order. Which response fits best?", "REST API створив нове замовлення. Яка відповідь пасує найкраще?"],
    [
      ["`200 OK` with an error message in the body", "`200 OK` з повідомленням про помилку в тілі"],
      ["`201 Created` with a `Location: /orders/42` header", "`201 Created` із заголовком `Location: /orders/42`"],
      ["`302 Found`", "`302 Found`"],
      ["`500 Internal Server Error`", "`500 Internal Server Error`"],
    ],
    "b",
  ),
  question(
    "spa-seo",
    ["What is a typical drawback of a pure client-rendered SPA, and the usual remedy?", "Який типовий недолік суто клієнтського SPA і звичний засіб?"],
    [
      ["Slow first paint and weaker SEO; remedy: server-side rendering or prerendering", "Повільний перший рендер і гірше SEO; засіб: серверний рендеринг або пререндеринг"],
      ["It cannot call APIs; remedy: use SOAP", "Він не може викликати API; засіб: SOAP"],
      ["It needs a page reload on each click; remedy: iframes", "Він перезавантажує сторінку на кожен клік; засіб: iframe"],
      ["It cannot use HTTPS", "Він не може використовувати HTTPS"],
    ],
    "a",
  ),
  question(
    "idempotent-verbs",
    ["Which HTTP methods are idempotent by definition?", "Які HTTP-методи ідемпотентні за визначенням?"],
    [
      ["GET", "GET"],
      ["PUT", "PUT"],
      ["DELETE", "DELETE"],
      ["POST", "POST"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "image-container",
    ["Image vs container in Docker?", "Образ і контейнер у Docker — у чому різниця?"],
    [
      ["An image is a read-only template built from a Dockerfile; a container is a running (or stopped) instance of it with a writable layer", "Образ — шаблон лише для читання, зібраний із Dockerfile; контейнер — запущений (або зупинений) його екземпляр із шаром для запису"],
      ["They are synonyms", "Це синоніми"],
      ["A container is a virtual machine; an image is its disk", "Контейнер — це віртуальна машина, а образ — її диск"],
      ["An image runs, a container is stored", "Образ працює, а контейнер зберігається"],
    ],
    "a",
  ),
  question(
    "test-pyramid",
    ["What does the test pyramid recommend?", "Що радить піраміда тестування?"],
    [
      ["Many fast unit tests, fewer integration tests, few end-to-end UI tests", "Багато швидких модульних тестів, менше інтеграційних, мало end-to-end UI-тестів"],
      ["Mostly end-to-end tests", "Переважно end-to-end тести"],
      ["Only manual testing", "Лише ручне тестування"],
      ["Equal numbers of each kind", "Однакову кількість кожного виду"],
    ],
    "a",
  ),
]);

const fsTypes = (size: string, print: string, count: string, find: string) => `abstract class Entry
{
    public string Name { get; private set; }
    protected Entry(string name) { Name = name; }
    public abstract long Size { get; }
    public abstract void Print(List<string> lines, int depth);
}

class FileEntry : Entry
{
    private readonly long size;
    public FileEntry(string name, long size) : base(name) { this.size = size; }
    public override long Size { get { return size; } }
    public override void Print(List<string> lines, int depth)
    {
        lines.Add(new string(' ', depth * 2) + Name + " (" + Size + ")");
    }
}

class Folder : Entry
{
    private readonly List<Entry> children = new List<Entry>();
    public Folder(string name) : base(name) { }
    public Folder Add(Entry entry) { children.Add(entry); return this; }

    // The total size of everything inside, recursively.
    public override long Size
    {
        get
        {
${size}
        }
    }

    // "<indent>Name/ (Size)", then every child one level deeper, in the order they were added.
    public override void Print(List<string> lines, int depth)
    {
${print}
    }

    // The number of files (not folders) inside, recursively.
    public int CountFiles()
    {
${count}
    }

    // Finds an entry by a relative path like "src/Models/User.cs"; null if there is none.
    public Entry Find(string path)
    {
${find}
    }
}`;

const fsMain = `        var root = new Folder("root")
            .Add(new FileEntry("readme.md", 120))
            .Add(new Folder("src")
                .Add(new FileEntry("Program.cs", 2048))
                .Add(new Folder("Models")
                    .Add(new FileEntry("User.cs", 512))
                    .Add(new FileEntry("Order.cs", 768))))
            .Add(new Folder("empty"));

        var lines = new List<string>();
        root.Print(lines, 0);
        foreach (var line in lines) Console.WriteLine(line);
        Console.WriteLine("total: " + root.Size);
        Console.WriteLine("files: " + root.CountFiles());
        var order = root.Find("src/Models/Order.cs");
        Console.WriteLine(order == null ? "not found" : order.Name + " " + order.Size);
        Console.WriteLine(root.Find("src/Nope.cs") == null ? "not found" : "found");
        var models = root.Find("src/Models");
        Console.WriteLine(models.Name + " " + models.Size);`;

export const fileSystemPractice = practice("file-system-tree", "A folder tree (Composite and recursion)", "Дерево папок (Composite і рекурсія)", {
  starter: PROGRAM_WITH(fsTypes(stub, stub, stub, stub), fsMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    fsTypes(
      `            long total = 0;
            foreach (var child in children) total += child.Size;
            return total;`,
      `        lines.Add(new string(' ', depth * 2) + Name + "/ (" + Size + ")");
        foreach (var child in children) child.Print(lines, depth + 1);`,
      `        int count = 0;
        foreach (var child in children)
        {
            var folder = child as Folder;
            count += folder != null ? folder.CountFiles() : 1;
        }
        return count;`,
      `        string[] parts = path.Split(new[] { '/' }, 2);
        foreach (var child in children)
        {
            if (child.Name != parts[0]) continue;
            if (parts.Length == 1) return child;
            var folder = child as Folder;
            return folder == null ? null : folder.Find(parts[1]);
        }
        return null;`,
    ),
    fsMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "root/ (3448)\n  readme.md (120)\n  src/ (3328)\n    Program.cs (2048)\n    Models/ (1280)\n      User.cs (512)\n      Order.cs (768)\n  empty/ (0)\ntotal: 3448\nfiles: 4\nOrder.cs 768\nnot found\nModels 1280\n",
});

/* ---------- Section 2: exceptions and the platform (Q13–24) ---------- */

export const juniorExceptionsLecture = lecture("junior-exceptions-deep", "Exceptions in depth: hierarchy, filters and the call stack", "Винятки докладно: ієрархія, фільтри та стек викликів");
export const juniorDelegatesLinqLecture = lecture("junior-delegates-linq", "Delegates, events and LINQ by example", "Делегати, події та LINQ на прикладах");

export const juniorPlatformQuiz2 = quiz("junior-platform-quiz-2", "Exceptions and the platform, part 2", "Винятки та платформа, частина 2", [
  question(
    "exception-base",
    ["Which class must a custom exception derive from?", "Від якого класу має походити власний виняток?"],
    [
      ["`System.Exception` (directly or through a more specific exception)", "`System.Exception` (напряму або через конкретніший виняток)"],
      ["`System.Object` only", "Лише `System.Object`"],
      ["`System.Error`", "`System.Error`"],
      ["`ApplicationException` is mandatory", "Обов'язково `ApplicationException`"],
    ],
    "a",
  ),
  question(
    "catch-order",
    ["`catch (Exception) {…} catch (IOException) {…}` — what happens?", "`catch (Exception) {…} catch (IOException) {…}` — що станеться?"],
    [
      ["Compile error: the second catch is unreachable; put specific types first", "Помилка компіляції: другий catch недосяжний; конкретні типи ставлять першими"],
      ["`IOException` is handled by the second block", "`IOException` обробить другий блок"],
      ["Both blocks run", "Виконаються обидва блоки"],
      ["A runtime warning", "Попередження під час виконання"],
    ],
    "a",
  ),
  question(
    "finally-return",
    ["`try { return 1; } finally { Console.Write(\"F\"); }` — what happens?", "`try { return 1; } finally { Console.Write(\"F\"); }` — що станеться?"],
    [
      ["The method returns 1 without printing", "Метод повертає 1 без друку"],
      ["\"F\" is printed, then the method returns 1", "Друкується \"F\", потім метод повертає 1"],
      ["Compile error", "Помилка компіляції"],
      ["The method returns null", "Метод повертає null"],
    ],
    "b",
  ),
  question(
    "stack-unwind",
    ["A throws inside method C, called from B, called from A. Only A has a catch; B has a finally. Order?", "Виняток кинуто в C, яку викликала B, яку викликала A. Catch лише в A; у B є finally. Порядок?"],
    [
      ["A's catch, then B's finally", "Catch у A, потім finally в B"],
      ["B's finally runs while the stack unwinds, then A's catch (in practice the runtime first finds the handler, then unwinds)", "Finally в B виконується під час розкручування стеку, потім catch в A (насправді рантайм спершу знаходить обробник, а потім розкручує стек)"],
      ["Only A's catch", "Лише catch в A"],
      ["The process crashes", "Процес падає"],
    ],
    "b",
  ),
  question(
    "aspnet-core-vs-framework",
    ["How does ASP.NET Core differ from classic ASP.NET?", "Чим ASP.NET Core відрізняється від класичного ASP.NET?"],
    [
      ["It is cross-platform and open source", "Він кросплатформений і з відкритим кодом"],
      ["It has built-in DI and a middleware pipeline instead of `System.Web` / IIS modules", "Він має вбудований DI і конвеєр middleware замість `System.Web` / модулів IIS"],
      ["It runs on Kestrel, with or without IIS", "Він працює на Kestrel, з IIS або без нього"],
      ["It only supports Windows", "Він підтримує лише Windows"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "filter-order",
    ["Which ASP.NET Core MVC filter runs first for a request?", "Який фільтр ASP.NET Core MVC виконується для запиту першим?"],
    [
      ["Action filter", "Фільтр дії"],
      ["Authorization filter", "Фільтр авторизації"],
      ["Result filter", "Фільтр результату"],
      ["Exception filter", "Фільтр винятків"],
    ],
    "b",
  ),
  question(
    "soap-rest",
    ["SOAP vs REST web services — which is true?", "Веб-сервіси SOAP і REST — що правда?"],
    [
      ["SOAP uses an XML envelope and a WSDL contract; REST uses HTTP verbs over resources, usually with JSON", "SOAP використовує XML-конверт і контракт WSDL; REST — HTTP-методи над ресурсами, зазвичай із JSON"],
      ["REST requires XML", "REST вимагає XML"],
      ["SOAP cannot run over HTTP", "SOAP не може працювати поверх HTTP"],
      ["They are the same protocol", "Це той самий протокол"],
    ],
    "a",
  ),
  question(
    "il-jit",
    ["What does the C# compiler produce, and who turns it into machine code?", "Що створює компілятор C# і хто перетворює це на машинний код?"],
    [
      ["Native machine code directly", "Одразу нативний машинний код"],
      ["IL (intermediate language) in an assembly; the CLR's JIT compiles it to machine code at run time (or AOT ahead of time)", "IL (проміжна мова) у збірці; JIT у CLR компілює його в машинний код під час виконання (або AOT заздалегідь)"],
      ["JavaScript", "JavaScript"],
      ["Java bytecode", "Байт-код Java"],
    ],
    "b",
  ),
  question(
    "gc-when",
    ["When does the GC run?", "Коли запускається GC?"],
    [
      ["When the Gen 0 allocation budget is exhausted", "Коли вичерпано бюджет виділення Gen 0"],
      ["When the system is low on memory", "Коли в системі мало пам'яті"],
      ["When `GC.Collect()` is called", "Коли викликано `GC.Collect()`"],
      ["Exactly every second", "Рівно щосекунди"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "multicast",
    ["`Action a = A; a += B; a();` — what runs?", "`Action a = A; a += B; a();` — що виконається?"],
    [
      ["Only B", "Лише B"],
      ["A, then B: delegates are multicast", "A, потім B: делегати multicast"],
      ["Only A", "Лише A"],
      ["Compile error", "Помилка компіляції"],
    ],
    "b",
  ),
  question(
    "predicate",
    ["Which delegate type matches a method `bool IsEven(int x)`?", "Який тип делегата відповідає методу `bool IsEven(int x)`?"],
    [
      ["`Func<int, bool>` or `Predicate<int>`", "`Func<int, bool>` або `Predicate<int>`"],
      ["`Action<int, bool>`", "`Action<int, bool>`"],
      ["`Func<bool, int>`", "`Func<bool, int>`"],
      ["`Action<bool>`", "`Action<bool>`"],
    ],
    "a",
  ),
  question(
    "linq-query-syntax",
    ["`from p in people where p.Age > 18 select p.Name` is equivalent to…", "`from p in people where p.Age > 18 select p.Name` еквівалентне…"],
    [
      ["`people.Where(p => p.Age > 18).Select(p => p.Name)`", "`people.Where(p => p.Age > 18).Select(p => p.Name)`"],
      ["`people.Select(p => p.Name).Where(p => p.Age > 18)`", "`people.Select(p => p.Name).Where(p => p.Age > 18)`"],
      ["A SQL query sent to a database", "SQL-запиту, надісланого в базу"],
      ["`people.First(p => p.Age > 18)`", "`people.First(p => p.Age > 18)`"],
    ],
    "a",
  ),
  question(
    "using-alias",
    ["Two libraries both define `Logger`. How do you use both in one file?", "Дві бібліотеки визначають `Logger`. Як використати обидва в одному файлі?"],
    [
      ["Fully qualified names, or aliases: `using AppLogger = MyApp.Logging.Logger;`", "Повні імена або псевдоніми: `using AppLogger = MyApp.Logging.Logger;`"],
      ["Rename one of the DLLs", "Перейменувати одну з DLL"],
      ["It is impossible", "Це неможливо"],
      ["Use `dynamic`", "Використати `dynamic`"],
    ],
    "a",
  ),
]);

const traceTypes = (dive: string, run: string, wrap: string) => `static class Tracer
{
    // Logs "enter <depth>", throws InvalidOperationException("boom at <depth>") when depth == failAt,
    // returns when depth == 5, otherwise calls Dive(depth + 1, ...). Logs "leave <depth>" in a finally block.
    public static void Dive(int depth, int failAt, List<string> log)
    {
${dive}
    }

    // Calls Dive(1, failAt, log). Catches an InvalidOperationException whose message contains "boom"
    // (use an exception filter) and logs "caught: <message>". Always logs "done" at the end.
    public static List<string> Run(int failAt)
    {
${run}
    }

    // Calls Dive(1, failAt, new List<string>()) and, if it throws, wraps the exception:
    // throw new ApplicationException("wrapped", original).
    public static void Wrap(int failAt)
    {
${wrap}
    }
}`;

const traceMain = `        Console.WriteLine(string.Join(", ", Tracer.Run(3)));
        Console.WriteLine(string.Join(", ", Tracer.Run(10)));
        try
        {
            Tracer.Wrap(2);
        }
        catch (ApplicationException ex)
        {
            Console.WriteLine(ex.Message + " <- " + ex.InnerException.Message);
        }`;

export const callStackPractice = practice("call-stack-unwinding", "The call stack, finally and exception filters", "Стек викликів, finally і фільтри винятків", {
  starter: PROGRAM_WITH(traceTypes(stub, stub, stub), traceMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    traceTypes(
      `        log.Add("enter " + depth);
        try
        {
            if (depth == failAt) throw new InvalidOperationException("boom at " + depth);
            if (depth == 5) return;
            Dive(depth + 1, failAt, log);
        }
        finally
        {
            log.Add("leave " + depth);
        }`,
      `        var log = new List<string>();
        try
        {
            Dive(1, failAt, log);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("boom"))
        {
            log.Add("caught: " + ex.Message);
        }
        finally
        {
            log.Add("done");
        }
        return log;`,
      `        try
        {
            Dive(1, failAt, new List<string>());
        }
        catch (Exception ex)
        {
            throw new ApplicationException("wrapped", ex);
        }`,
    ),
    traceMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput:
    "enter 1, enter 2, enter 3, leave 3, leave 2, leave 1, caught: boom at 3, done\nenter 1, enter 2, enter 3, enter 4, enter 5, leave 5, leave 4, leave 3, leave 2, leave 1, done\nwrapped <- boom at 2\n",
});

/* ---------- Section 3: types and collections (Q25–35) ---------- */

export const juniorMemoryLecture = lecture("junior-memory-boxing", "Value vs reference semantics, boxing and strings", "Семантика значень і посилань, упакування та рядки");
export const juniorCollectionsLecture = lecture("junior-collections-deep", "Collections in practice and yield", "Колекції на практиці та yield");

export const juniorCollectionsQuiz = quiz("junior-collections-quiz", "Types and collections, part 2", "Типи та колекції, частина 2", [
  question(
    "int-alias",
    ["What is `int` in C#?", "Що таке `int` у C#?"],
    [
      ["An alias for `System.Int32`, a 32-bit signed struct", "Псевдонім `System.Int32`, 32-бітної знакової структури"],
      ["A 64-bit number on 64-bit machines", "64-бітне число на 64-бітних машинах"],
      ["A class", "Клас"],
      ["An alias for `long`", "Псевдонім `long`"],
    ],
    "a",
  ),
  question(
    "decimal-money",
    ["Which type should hold money amounts?", "Який тип має зберігати грошові суми?"],
    [
      ["`double`", "`double`"],
      ["`float`", "`float`"],
      ["`decimal`", "`decimal`"],
      ["`int` always", "Завжди `int`"],
    ],
    "c",
  ),
  question(
    "nullable-arith",
    ["`int? a = null; int? b = a + 5;` What is `b`?", "`int? a = null; int? b = a + 5;` Чому дорівнює `b`?"],
    [
      ["5", "5"],
      ["null (lifted operators propagate null)", "null (підняті оператори поширюють null)"],
      ["0", "0"],
      ["It throws", "Кидає виняток"],
    ],
    "b",
  ),
  question(
    "class-copy",
    ["`var p2 = p1; p2.Name = \"B\";` where `p1` is a class instance with `Name = \"A\"`. What is `p1.Name`?", "`var p2 = p1; p2.Name = \"B\";`, де `p1` — екземпляр класу з `Name = \"A\"`. Чому дорівнює `p1.Name`?"],
    [
      ["\"A\"", "\"A\""],
      ["\"B\": both variables reference the same object", "\"B\": обидві змінні посилаються на той самий об'єкт"],
      ["null", "null"],
      ["Compile error", "Помилка компіляції"],
    ],
    "b",
  ),
  question(
    "string-equality",
    ["`string a = \"hi\"; string b = new string(new[] {'h','i'});` What is `a == b` and `(object)a == (object)b`?", "`string a = \"hi\"; string b = new string(new[] {'h','i'});` Чому дорівнюють `a == b` і `(object)a == (object)b`?"],
    [
      ["true and false: `==` on strings compares contents; on `object` it compares references", "true і false: `==` для рядків порівнює вміст, а для `object` — посилання"],
      ["true and true", "true і true"],
      ["false and false", "false і false"],
      ["false and true", "false і true"],
    ],
    "a",
  ),
  question(
    "string-immutable",
    ["`string s = \"abc\"; s.ToUpper(); Console.Write(s);` prints…", "`string s = \"abc\"; s.ToUpper(); Console.Write(s);` друкує…"],
    [
      ["ABC", "ABC"],
      ["abc — strings are immutable; `ToUpper` returns a new string that was ignored", "abc — рядки незмінні; `ToUpper` повертає новий рядок, який проігнорували"],
      ["Nothing", "Нічого"],
      ["It throws", "Кидає виняток"],
    ],
    "b",
  ),
  question(
    "generic-benefit",
    ["What do generics give compared to `ArrayList` of `object`?", "Що дають generics порівняно з `ArrayList` з `object`?"],
    [
      ["Compile-time type safety", "Типобезпеку на етапі компіляції"],
      ["No boxing of value types", "Відсутність упакування типів значень"],
      ["No casts when reading", "Відсутність приведень під час читання"],
      ["Automatic thread safety", "Автоматичну потокобезпечність"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "unbox-type",
    ["`object o = 5; long l = (long)o;` What happens?", "`object o = 5; long l = (long)o;` Що станеться?"],
    [
      ["l = 5", "l = 5"],
      ["`InvalidCastException`: you must unbox to the exact type, `(long)(int)o`", "`InvalidCastException`: розпаковувати треба в точний тип, `(long)(int)o`"],
      ["Compile error", "Помилка компіляції"],
      ["l = 0", "l = 0"],
    ],
    "b",
  ),
  question(
    "dictionary-missing",
    ["`dict[\"missing\"]` on a `Dictionary<string,int>` without that key…", "`dict[\"missing\"]` у `Dictionary<string,int>` без такого ключа…"],
    [
      ["returns 0", "повертає 0"],
      ["throws `KeyNotFoundException`; use `TryGetValue` to check", "кидає `KeyNotFoundException`; для перевірки є `TryGetValue`"],
      ["returns null", "повертає null"],
      ["adds the key", "додає ключ"],
    ],
    "b",
  ),
  question(
    "queue-stack",
    ["Which collection fits an undo history (last action undone first)?", "Яка колекція підходить для історії скасувань (останню дію скасовують першою)?"],
    [
      ["`Queue<T>`", "`Queue<T>`"],
      ["`Stack<T>`", "`Stack<T>`"],
      ["`HashSet<T>`", "`HashSet<T>`"],
      ["`SortedSet<T>`", "`SortedSet<T>`"],
    ],
    "b",
  ),
  question(
    "yield-lazy",
    ["An iterator method prints \"start\" as its first statement. When is it printed for `var seq = Numbers();`?", "Метод-ітератор першим рядком друкує \"start\". Коли це надрукується для `var seq = Numbers();`?"],
    [
      ["Immediately at the call", "Одразу під час виклику"],
      ["Only when the sequence is first enumerated (first `MoveNext`)", "Лише під час першого перебору (перший `MoveNext`)"],
      ["Never", "Ніколи"],
      ["When the program ends", "Коли програма завершується"],
    ],
    "b",
  ),
]);

const hashTypes = (twoSum: string, firstUnique: string, intersect: string) => `static class HashTasks
{
    // Indices of the two numbers that add up to target, or null. One pass with a Dictionary, O(n).
    // When several pairs exist, return the one whose second index is smallest.
    public static int[] TwoSum(int[] nums, int target)
    {
${twoSum}
    }

    // The first character that occurs exactly once, or '\\0' if there is none. O(n).
    public static char FirstUnique(string s)
    {
${firstUnique}
    }

    // Values present in both arrays, without duplicates, in the order they first appear in a. O(n + m).
    public static List<int> Intersect(int[] a, int[] b)
    {
${intersect}
    }
}`;

const hashMain = `        foreach (var t in new[] { new { N = new[] { 2, 7, 11, 15 }, T = 9 }, new { N = new[] { 3, 2, 4 }, T = 6 }, new { N = new[] { 3, 3 }, T = 6 }, new { N = new[] { 1, 2 }, T = 7 } })
        {
            var pair = HashTasks.TwoSum(t.N, t.T);
            Console.WriteLine(pair == null ? "none" : pair[0] + " " + pair[1]);
        }
        foreach (var s in new[] { "swiss", "aabb", "leetcode" })
        {
            char c = HashTasks.FirstUnique(s);
            Console.WriteLine(c == '\\0' ? "none" : c.ToString());
        }
        Console.WriteLine(string.Join(" ", HashTasks.Intersect(new[] { 4, 9, 5, 9 }, new[] { 9, 4, 9, 8, 4 })));
        Console.WriteLine("[" + string.Join(" ", HashTasks.Intersect(new[] { 1, 2 }, new[] { 3 })) + "]");`;

export const hashTasksPractice = practice("hashset-dictionary-tasks", "O(n) with HashSet and Dictionary", "O(n) з HashSet і Dictionary", {
  starter: PROGRAM_WITH(hashTypes(stub, stub, stub), hashMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    hashTypes(
      `        var seen = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++)
        {
            int j;
            if (seen.TryGetValue(target - nums[i], out j)) return new[] { j, i };
            if (!seen.ContainsKey(nums[i])) seen.Add(nums[i], i);
        }
        return null;`,
      `        var counts = new Dictionary<char, int>();
        foreach (char c in s)
        {
            int n;
            counts.TryGetValue(c, out n);
            counts[c] = n + 1;
        }
        foreach (char c in s)
            if (counts[c] == 1) return c;
        return '\\0';`,
      `        var inB = new HashSet<int>(b);
        var added = new HashSet<int>();
        var result = new List<int>();
        foreach (int x in a)
            if (inB.Contains(x) && added.Add(x)) result.Add(x);
        return result;`,
    ),
    hashMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput: "0 1\n1 2\n0 1\nnone\nw\nnone\nl\n4 9\n[]\n",
});

/* ---------- Section 4: classes, structs, interfaces (Q36–44) ---------- */

export const juniorClassesLecture = lecture("junior-classes-deep", "Classes, structs and interfaces by example", "Класи, структури та інтерфейси на прикладах");

export const juniorClassesQuiz = quiz("junior-classes-quiz", "Classes, structs and interfaces", "Класи, структури та інтерфейси", [
  question(
    "abstract-instance",
    ["`abstract class Shape { }` — `var s = new Shape();`?", "`abstract class Shape { }` — `var s = new Shape();`?"],
    [
      ["Works", "Працює"],
      ["Compile error: an abstract class cannot be instantiated; `Shape s = new Circle();` is fine", "Помилка компіляції: абстрактний клас не можна створити; `Shape s = new Circle();` — можна"],
      ["Creates a null reference", "Створює null-посилання"],
      ["Runtime exception", "Виняток під час виконання"],
    ],
    "b",
  ),
  question(
    "abstract-ctor",
    ["Can an abstract class have a constructor?", "Чи може абстрактний клас мати конструктор?"],
    [
      ["No", "Ні"],
      ["Yes; derived classes call it through `base(...)` to initialize shared state", "Так; похідні класи викликають його через `base(...)`, щоб ініціалізувати спільний стан"],
      ["Only a static one", "Лише статичний"],
      ["Only a private one", "Лише приватний"],
    ],
    "b",
  ),
  question(
    "interface-default",
    ["Since C# 8, an interface member can have…", "Починаючи з C# 8, член інтерфейсу може мати…"],
    [
      ["A default implementation", "Реалізацію за замовчуванням"],
      ["Instance fields", "Поля екземпляра"],
      ["A constructor", "Конструктор"],
      ["Nothing new", "Нічого нового"],
    ],
    "a",
  ),
  question(
    "protected-internal",
    ["Who can access a `protected internal` member?", "Хто має доступ до члена `protected internal`?"],
    [
      ["Only derived classes in the same assembly", "Лише похідні класи в тій самій збірці"],
      ["Any code in the same assembly, OR derived classes in any assembly", "Будь-який код у тій самій збірці АБО похідні класи в будь-якій збірці"],
      ["Only the class itself", "Лише сам клас"],
      ["Everyone", "Усі"],
    ],
    "b",
  ),
  question(
    "default-access",
    ["What are the default access levels?", "Які рівні доступу за замовчуванням?"],
    [
      ["`internal` for top-level classes, `private` for class members", "`internal` для класів верхнього рівня, `private` для членів класу"],
      ["`public` for everything", "`public` для всього"],
      ["`private` for top-level classes", "`private` для класів верхнього рівня"],
      ["`protected` for members", "`protected` для членів"],
    ],
    "a",
  ),
  question(
    "static-members",
    ["Which can a static class contain?", "Що може містити статичний клас?"],
    [
      ["Static methods and properties", "Статичні методи й властивості"],
      ["A static constructor", "Статичний конструктор"],
      ["Extension methods", "Методи розширення"],
      ["Instance constructors", "Конструктори екземпляра"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "sealed-override",
    ["What does `sealed override` on a method do?", "Що робить `sealed override` на методі?"],
    [
      ["Overrides the base method and stops further overriding in derived classes", "Перевизначає базовий метод і забороняє подальше перевизначення в похідних класах"],
      ["Makes the method private", "Робить метод приватним"],
      ["Hides the base method like `new`", "Приховує базовий метод, як `new`"],
      ["Makes it static", "Робить його статичним"],
    ],
    "a",
  ),
  question(
    "const-versioning",
    ["Library v1 has `public const int Max = 10;`. You ship v2 with `Max = 20` but don't recompile the app. What does the app see?", "Бібліотека v1 має `public const int Max = 10;`. Ви випускаєте v2 з `Max = 20`, але не перекомпільовуєте застосунок. Що бачить застосунок?"],
    [
      ["20", "20"],
      ["10 — the constant was copied into the app at compile time; `static readonly` would give 20", "10 — константу скопійовано в застосунок під час компіляції; зі `static readonly` було б 20"],
      ["0", "0"],
      ["A runtime error", "Помилку під час виконання"],
    ],
    "b",
  ),
  question(
    "struct-when",
    ["When is a struct a good choice?", "Коли структура — добрий вибір?"],
    [
      ["Small (≈16 bytes or less), immutable, value-like data such as a point or money amount", "Невеликі (≈16 байтів і менше), незмінні дані-значення, як-от точка чи грошова сума"],
      ["A large entity with identity, like a Customer", "Велика сутність з ідентичністю, як-от Customer"],
      ["When you need inheritance", "Коли потрібне успадкування"],
      ["When the object will be boxed often", "Коли об'єкт часто упаковуватимуть"],
    ],
    "a",
  ),
  question(
    "struct-list-mutation",
    ["`List<Point> list` of a mutable struct. `list[0].X = 5;`?", "`List<Point> list` зі змінною структурою. `list[0].X = 5;`?"],
    [
      ["Changes the element", "Змінює елемент"],
      ["Compile error: the indexer returns a copy; you'd modify a temporary (that's why structs should be immutable)", "Помилка компіляції: індексатор повертає копію; ви змінили б тимчасове значення (тому структури мають бути незмінними)"],
      ["Changes all elements", "Змінює всі елементи"],
      ["Throws at run time", "Кидає виняток під час виконання"],
    ],
    "b",
  ),
]);

const payTypes = (pay: string, cardFee: string, refund: string, transferFee: string) => `interface IRefundable
{
    // Returns the amount given back to the customer.
    decimal Refund(decimal amount);
}

abstract class PaymentMethod
{
    public const decimal MaxAmount = 1000m;
    public readonly string Owner;

    protected PaymentMethod(string owner) { Owner = owner; }

    protected abstract decimal Fee(decimal amount);

    public virtual string Describe() { return "payment by " + Owner; }

    // "<Describe()>: <amount + fee, formatted 0.00>", or "<Describe()>: rejected" when amount <= 0 or amount > MaxAmount.
    public string Pay(decimal amount)
    {
${pay}
    }
}

class Card : PaymentMethod, IRefundable
{
    public Card(string owner) : base(owner) { }

    // 2% of the amount.
    protected override decimal Fee(decimal amount)
    {
${cardFee}
    }

    public override string Describe() { return "card of " + Owner; }

    // The amount minus a 1.00 processing charge, never below 0.
    public decimal Refund(decimal amount)
    {
${refund}
    }
}

class Transfer : PaymentMethod
{
    public Transfer(string owner) : base(owner) { }

    // A flat 5.00.
    protected override decimal Fee(decimal amount)
    {
${transferFee}
    }

    // Hides (does not override) the base method.
    public new string Describe() { return "bank transfer of " + Owner; }
}`;

const payMain = `        var methods = new List<PaymentMethod> { new Card("Ann"), new Transfer("Bob") };
        foreach (var m in methods)
        {
            Console.WriteLine(m.Pay(100m));
            Console.WriteLine(m.Pay(0m));
            Console.WriteLine(m.Pay(2000m));
        }
        foreach (var m in methods)
        {
            var r = m as IRefundable;
            Console.WriteLine(m.Describe() + (r == null ? " cannot refund" : " refunds " + r.Refund(100m).ToString("0.00", CultureInfo.InvariantCulture)));
        }
        Console.WriteLine(new Transfer("Bob").Describe());
        Console.WriteLine(PaymentMethod.MaxAmount);`;

export const paymentsPractice = practice("payment-methods", "Abstract class, interface, override and new", "Абстрактний клас, інтерфейс, override і new", {
  starter: PROGRAM_WITH(payTypes(stub, stub, stub, stub), payMain, "using System.Collections.Generic;\nusing System.Globalization;"),
  solution: PROGRAM_WITH(
    payTypes(
      `        if (amount <= 0 || amount > MaxAmount) return Describe() + ": rejected";
        return Describe() + ": " + (amount + Fee(amount)).ToString("0.00", CultureInfo.InvariantCulture);`,
      "        return amount * 0.02m;",
      "        return Math.Max(0m, amount - 1m);",
      "        return 5m;",
    ),
    payMain,
    "using System.Collections.Generic;\nusing System.Globalization;",
  ),
  expectedOutput:
    "card of Ann: 102.00\ncard of Ann: rejected\ncard of Ann: rejected\npayment by Bob: 105.00\npayment by Bob: rejected\npayment by Bob: rejected\ncard of Ann refunds 99.00\npayment by Bob cannot refund\nbank transfer of Bob\n1000\n",
});

/* ---------- Section 5: async, databases, testing (Q45–53) ---------- */

export const juniorSqlJoinsLecture = lecture("junior-sql-joins", "SQL JOINs and indexes with examples", "SQL JOIN-и та індекси на прикладах");
export const juniorUnitTestingLecture = lecture("junior-unit-testing", "Writing good unit tests", "Як писати добрі модульні тести");

export const juniorAsyncDbQuiz2 = quiz("junior-async-db-tests-quiz-2", "Async, databases and tests, part 2", "Асинхронність, БД і тести, частина 2", [
  question(
    "async-return-types",
    ["Which return types can an `async` method have?", "Які типи повернення може мати `async`-метод?"],
    [
      ["`Task` and `Task<T>`", "`Task` і `Task<T>`"],
      ["`ValueTask` / `ValueTask<T>`", "`ValueTask` / `ValueTask<T>`"],
      ["`void` (for event handlers only)", "`void` (лише для обробників подій)"],
      ["`int`", "`int`"],
    ],
    ["a", "b", "c"],
  ),
  question(
    "result-deadlock",
    ["Why is `GetDataAsync().Result` dangerous in a UI app?", "Чому `GetDataAsync().Result` небезпечний в UI-застосунку?"],
    [
      ["It blocks the UI thread, while the continuation needs that same thread → deadlock", "Він блокує UI-потік, а продовженню потрібен саме цей потік → взаємне блокування"],
      ["It returns null", "Він повертає null"],
      ["It runs the method twice", "Він виконує метод двічі"],
      ["It is not allowed by the compiler", "Компілятор це забороняє"],
    ],
    "a",
  ),
  question(
    "whenall",
    ["Three independent HTTP calls take 1 s each. How do you make the whole thing take ~1 s?", "Три незалежні HTTP-виклики тривають по 1 с. Як зробити, щоб усе зайняло ~1 с?"],
    [
      ["Start all three tasks, then `await Task.WhenAll(t1, t2, t3)`", "Запустити всі три задачі, потім `await Task.WhenAll(t1, t2, t3)`"],
      ["`await` each call one after another", "`await` кожен виклик один за одним"],
      ["Call `.Wait()` on each", "Викликати `.Wait()` на кожному"],
      ["Use `Thread.Sleep(1000)`", "Використати `Thread.Sleep(1000)`"],
    ],
    "a",
  ),
  question(
    "acid-junior",
    ["Why are relational DBs a good fit for banking transfers?", "Чому реляційні БД добре підходять для банківських переказів?"],
    [
      ["ACID transactions: both the debit and the credit are committed, or neither", "ACID-транзакції: і списання, і зарахування комітяться разом або жодне"],
      ["They store data as JSON", "Вони зберігають дані як JSON"],
      ["They have no schema", "Вони не мають схеми"],
      ["They are always faster than NoSQL", "Вони завжди швидші за NoSQL"],
    ],
    "a",
  ),
  question(
    "clustered-count",
    ["How many clustered indexes can a SQL Server table have?", "Скільки кластерних індексів може мати таблиця SQL Server?"],
    [
      ["One — it defines the physical order of the rows", "Один — він визначає фізичний порядок рядків"],
      ["Unlimited", "Скільки завгодно"],
      ["One per column", "По одному на колонку"],
      ["None", "Жодного"],
    ],
    "a",
  ),
  question(
    "full-join",
    ["Which JOIN returns all rows from both tables, matched where possible?", "Який JOIN повертає всі рядки обох таблиць, зіставлені, де можливо?"],
    [
      ["INNER JOIN", "INNER JOIN"],
      ["FULL OUTER JOIN", "FULL OUTER JOIN"],
      ["LEFT JOIN", "LEFT JOIN"],
      ["CROSS JOIN", "CROSS JOIN"],
    ],
    "b",
  ),
  question(
    "count-left-join",
    ["Employees LEFT JOIN assignments, grouped by employee. Which counts 0 for employees without assignments?", "Employees LEFT JOIN assignments із групуванням за працівником. Що дасть 0 для працівників без призначень?"],
    [
      ["`count(*)`", "`count(*)`"],
      ["`count(a.project_id)` — `count(column)` skips NULLs", "`count(a.project_id)` — `count(колонка)` пропускає NULL"],
      ["`sum(1)`", "`sum(1)`"],
      ["`max(*)`", "`max(*)`"],
    ],
    "b",
  ),
  question(
    "mock",
    ["What is a mock in unit testing?", "Що таке мок у модульному тестуванні?"],
    [
      ["A fake implementation of a dependency that you control and can verify calls on", "Підроблена реалізація залежності, яку ви контролюєте й на якій можна перевірити виклики"],
      ["A production database", "Продакшн-база даних"],
      ["A failing test", "Падаючий тест"],
      ["A code coverage report", "Звіт про покриття коду"],
    ],
    "a",
  ),
  question(
    "good-test",
    ["Which make a good unit test?", "Що робить модульний тест добрим?"],
    [
      ["Fast and independent of other tests", "Швидкий і незалежний від інших тестів"],
      ["Repeatable: no real clock, network or random without a seed", "Відтворюваний: без реального годинника, мережі чи random без seed"],
      ["Checks one behaviour with a clear name", "Перевіряє одну поведінку й має зрозумілу назву"],
      ["Depends on the order tests run in", "Залежить від порядку запуску тестів"],
    ],
    ["a", "b", "c"],
  ),
]);

const STAFF = `CREATE TABLE employees (
    id         integer PRIMARY KEY,
    name       text NOT NULL,
    department text NOT NULL
);

CREATE TABLE projects (
    id    integer PRIMARY KEY,
    title text NOT NULL
);

CREATE TABLE assignments (
    employee_id integer NOT NULL REFERENCES employees (id),
    project_id  integer NOT NULL REFERENCES projects (id),
    PRIMARY KEY (employee_id, project_id)
);

INSERT INTO employees VALUES
    (1, 'Anna', 'Development'), (2, 'Bohdan', 'Development'), (3, 'Daria', 'QA'),
    (4, 'Ivan', 'Operations'), (5, 'Kateryna', 'Management');

INSERT INTO projects VALUES (1, 'Portal'), (2, 'Mobile app'), (3, 'CRM');

INSERT INTO assignments VALUES (1, 1), (1, 2), (1, 3), (2, 1), (3, 1), (3, 2), (5, 3);
`;

export const projectsSqlPractice: SlideDef = {
  kind: "practice",
  slug: "employees-projects",
  title: { en: "Practice: Every employee and their projects", uk: "Практика «Кожен працівник і його проєкти»" },
  language: "sql",
  setup: STAFF,
  starter: WRITE_QUERY,
  solution: `SELECT e.name,
       e.department,
       count(a.project_id) AS projects
FROM employees AS e
LEFT JOIN assignments AS a ON a.employee_id = e.id
GROUP BY e.id, e.name, e.department
ORDER BY projects DESC, e.name;
`,
  expectedOutput: "   name   | department  | projects\n----------+-------------+----------\n Anna     | Development |        3\n Daria    | QA          |        2\n Bohdan   | Development |        1\n Kateryna | Management  |        1\n Ivan     | Operations  |        0\n(5 rows)\n",
  maxScore: 3,
};

/* ---------- Practical tasks ---------- */

const primeTypes = (isPrime: string, sieve: string, factorize: string) => `static class Primes
{
    // True for primes. Numbers below 2 are not prime. Must be fast enough for int.MaxValue.
    public static bool IsPrime(int n)
    {
${isPrime}
    }

    // All primes <= limit, using the sieve of Eratosthenes. Empty for limit < 2.
    public static List<int> Sieve(int limit)
    {
${sieve}
    }

    // Prime factors of n (n >= 2) in ascending order: 360 -> 2 2 2 3 3 5.
    public static List<int> Factorize(int n)
    {
${factorize}
    }
}`;

const primeMain = `        var primes = new List<int>();
        for (int i = -1; i <= 30; i++) if (Primes.IsPrime(i)) primes.Add(i);
        Console.WriteLine(string.Join(" ", primes));
        Console.WriteLine(Primes.IsPrime(97) + " " + Primes.IsPrime(91) + " " + Primes.IsPrime(int.MaxValue));
        var upTo50 = Primes.Sieve(50);
        Console.WriteLine(upTo50.Count + " primes up to 50, last " + upTo50[upTo50.Count - 1]);
        Console.WriteLine("[" + string.Join(" ", Primes.Sieve(1)) + "]");
        Console.WriteLine(string.Join(" ", Primes.Factorize(360)));
        Console.WriteLine(string.Join(" ", Primes.Factorize(97)));
        Console.WriteLine(string.Join(" ", Primes.Factorize(1001)));`;

export const primesPractice = practice("primes-sieve", "Primes: trial division, the sieve and factorization", "Прості числа: перебір дільників, решето й розклад на множники", {
  starter: PROGRAM_WITH(primeTypes(stub, stub, stub), primeMain, "using System.Collections.Generic;"),
  solution: PROGRAM_WITH(
    primeTypes(
      `        if (n < 2) return false;
        if (n % 2 == 0) return n == 2;
        for (long d = 3; d * d <= n; d += 2)
            if (n % d == 0) return false;
        return true;`,
      `        var result = new List<int>();
        if (limit < 2) return result;
        var composite = new bool[limit + 1];
        for (int i = 2; i <= limit; i++)
        {
            if (composite[i]) continue;
            result.Add(i);
            for (long j = (long)i * i; j <= limit; j += i) composite[j] = true;
        }
        return result;`,
      `        var factors = new List<int>();
        for (int d = 2; (long)d * d <= n; d++)
            while (n % d == 0) { factors.Add(d); n /= d; }
        if (n > 1) factors.Add(n);
        return factors;`,
    ),
    primeMain,
    "using System.Collections.Generic;",
  ),
  expectedOutput: "2 3 5 7 11 13 17 19 23 29\nTrue False True\n15 primes up to 50, last 47\n[]\n2 2 2 3 3 5\n97\n7 11 13\n",
});
