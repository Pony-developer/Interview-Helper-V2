import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const disposeTypes = (body: string) => `class Connection : IDisposable
{
    public string Name { get; private set; }
    public bool FailOnDispose { get; set; }
    private bool _disposed;

    public Connection(string name) { Name = name; Console.WriteLine("open " + name); }

    public void Send(string text)
    {
        if (_disposed) throw new ObjectDisposedException(Name);
        Console.WriteLine(Name + " <- " + text);
    }

    public void Dispose()
    {
        if (_disposed) return;                 // idempotent
        _disposed = true;
        Console.WriteLine("close " + Name);
        if (FailOnDispose) throw new InvalidOperationException(Name + " failed to close");
    }
}

// Owns several disposables and disposes them in REVERSE order of registration.
// Every resource must be disposed even if some throw; then, if any threw, an AggregateException
// with all of their exceptions is thrown. Disposing the scope twice does nothing the second time.
sealed class DisposeScope : IDisposable
{
    private readonly List<IDisposable> _items = new List<IDisposable>();
    private bool _disposed;

    public T Add<T>(T item) where T : IDisposable
    {
${body.split("@@")[0]}
    }

    public void Dispose()
    {
${body.split("@@")[1]}
    }
}`;

const disposeSolution = `        if (_disposed) throw new ObjectDisposedException("DisposeScope");
        _items.Add(item);
        return item;@@        if (_disposed) return;
        _disposed = true;
        List<Exception> errors = null;
        for (int i = _items.Count - 1; i >= 0; i--)
        {
            try { _items[i].Dispose(); }
            catch (Exception e)
            {
                if (errors == null) errors = new List<Exception>();
                errors.Add(e);
            }
        }
        _items.Clear();
        if (errors != null) throw new AggregateException(errors);`;

const disposeMain = `        Connection keep;
        using (var scope = new DisposeScope())
        {
            var db = scope.Add(new Connection("db"));
            keep = scope.Add(new Connection("cache"));
            scope.Add(new Connection("queue"));
            db.Send("hello");
        }
        try { keep.Send("late"); }
        catch (ObjectDisposedException e) { Console.WriteLine("disposed: " + e.ObjectName); }

        var scope2 = new DisposeScope();
        scope2.Add(new Connection("a"));
        scope2.Add(new Connection("b") { FailOnDispose = true });
        scope2.Add(new Connection("c") { FailOnDispose = true });
        try { scope2.Dispose(); }
        catch (AggregateException e)
        {
            foreach (var inner in e.InnerExceptions) Console.WriteLine("error: " + inner.Message);
        }
        scope2.Dispose();
        try { scope2.Add(new Connection("x")); }
        catch (ObjectDisposedException) { Console.WriteLine("scope is closed"); }`;

export const disposalGcModule: ModuleDef = {
  slug: "disposal-gc",
  title: { en: "Disposal and garbage collection", uk: "Звільнення ресурсів і збирання сміття" },
  slides: [
    lecture("idisposable-pattern", "IDisposable, using and the dispose pattern", "IDisposable, using і патерн Dispose"),
    lecture("gc-internals", "How the garbage collector works", "Як працює збирач сміття"),
    lecture("finalizers", "Finalizers and SafeHandle", "Фіналізатори та SafeHandle"),
    lecture("memory-leaks-weak-references", "Managed memory leaks and weak references", "Витоки керованої пам'яті та слабкі посилання"),
    quiz("disposal-gc-quiz", "Disposal and garbage collection", "Звільнення ресурсів і збирання сміття", [
      question(
        "dispose-vs-gc",
        ["What is the relationship between `Dispose` and garbage collection?", "Який зв'язок між `Dispose` і збиранням сміття?"],
        [
          ["`Dispose` frees the object's memory immediately", "`Dispose` одразу звільняє пам'ять об'єкта"],
          ["They are independent: `Dispose` releases resources (handles, connections) deterministically; the GC reclaims memory later", "Вони незалежні: `Dispose` детерміновано звільняє ресурси (дескриптори, з'єднання); GC пізніше забирає пам'ять"],
          ["The GC calls `Dispose` automatically", "GC автоматично викликає `Dispose`"],
          ["`Dispose` triggers a garbage collection", "`Dispose` запускає збирання сміття"],
        ],
        "b",
      ),
      question(
        "generations",
        ["Why does the .NET GC use generations?", "Навіщо GC у .NET використовує покоління?"],
        [
          ["Most objects die young, so collecting gen 0 often and gen 2 rarely is cheap and effective", "Більшість об'єктів помирає молодими, тож часто збирати gen 0 і рідко gen 2 — дешево й ефективно"],
          ["To support multiple CPUs", "Щоб підтримати кілька процесорів"],
          ["To separate value and reference types", "Щоб розділити типи значень і посилань"],
          ["Generations are only used for strings", "Покоління використовуються лише для рядків"],
        ],
        "a",
      ),
      question(
        "loh",
        ["What happens to an 100 KB array?", "Що відбувається з масивом на 100 КБ?"],
        [
          ["It's allocated on the stack", "Він виділяється в стеку"],
          ["It's never collected", "Його ніколи не збирають"],
          ["It goes to the Large Object Heap (objects ≥ 85,000 bytes), which is collected with gen 2 and not compacted by default", "Він потрапляє в Large Object Heap (об'єкти ≥ 85 000 байтів), яку збирають разом із gen 2 і за замовчуванням не ущільнюють"],
          ["It's split into small chunks", "Його розбивають на маленькі шматки"],
        ],
        "c",
      ),
      question(
        "finalizer",
        ["Which statements about finalizers are true?", "Які твердження про фіналізатори правдиві?"],
        [
          ["They run on a dedicated finalizer thread at an unpredictable time", "Вони виконуються в окремому потоці фіналізатора в непередбачуваний час"],
          ["Objects with finalizers survive at least one extra collection, which costs performance", "Об'єкти з фіналізаторами переживають щонайменше одне зайве збирання, що коштує продуктивності"],
          ["`GC.SuppressFinalize(this)` in Dispose skips the finalizer when cleanup already happened", "`GC.SuppressFinalize(this)` у Dispose пропускає фіналізатор, коли прибирання вже відбулося"],
          ["They are the right place to close database connections", "Це правильне місце, щоб закривати з'єднання з базою"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "leak",
        ["Which is a classic managed memory leak?", "Що з цього — класичний витік керованої пам'яті?"],
        [
          ["Creating many short-lived strings", "Створення багатьох короткоживучих рядків"],
          ["Forgetting to call `GC.Collect()`", "Забути викликати `GC.Collect()`"],
          ["Using `using` statements", "Використання інструкцій `using`"],
          ["Subscribing short-lived objects to a static event and never unsubscribing", "Підписка короткоживучих об'єктів на статичну подію без відписки"],
        ],
        "d",
      ),
      question(
        "weakref",
        ["What is a `WeakReference<T>` for?", "Для чого `WeakReference<T>`?"],
        [
          ["Referencing an object without keeping it alive, e.g. for caches or listeners that shouldn't prevent collection", "Посилатися на об'єкт, не тримаючи його живим, наприклад для кешів чи слухачів, що не мають заважати збиранню"],
          ["Making a reference read-only", "Зробити посилання лише для читання"],
          ["Faster access to objects", "Швидший доступ до об'єктів"],
          ["Referencing objects on other machines", "Посилатися на об'єкти на інших машинах"],
        ],
        "a",
      ),
      question(
        "gc-collect",
        ["Should application code call `GC.Collect()`?", "Чи має прикладний код викликати `GC.Collect()`?"],
        [
          ["Yes, after every request", "Так, після кожного запиту"],
          ["Rarely if ever: the GC tunes itself, and forced collections usually hurt performance (promoting objects to older generations)", "Рідко або ніколи: GC налаштовує себе сам, а примусові збирання зазвичай шкодять продуктивності (переводять об'єкти в старші покоління)"],
          ["Yes, in every Dispose method", "Так, у кожному методі Dispose"],
          ["Only in constructors", "Лише в конструкторах"],
        ],
        "b",
      ),
      question(
        "server-gc",
        ["What does Server GC change compared with Workstation GC?", "Що змінює Server GC порівняно з Workstation GC?"],
        [
          ["It disables garbage collection", "Вимикає збирання сміття"],
          ["It collects only on the UI thread", "Збирає лише в потоці UI"],
          ["It uses a heap and a GC thread per core: higher throughput and more memory, the default for ASP.NET Core", "Використовує купу й потік GC на кожне ядро: вища пропускна здатність і більше пам'яті, стандарт для ASP.NET Core"],
          ["It makes objects live forever", "Робить об'єкти вічними"],
        ],
        "c",
      ),
    ]),
    practice("dispose-scope-practice", "A dispose scope", "Область звільнення ресурсів", {
      starter: PROGRAM_WITH(disposeTypes(`${TODO}@@${TODO}`), disposeMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(disposeTypes(disposeSolution), disposeMain, "using System.Collections.Generic;"),
      expectedOutput:
        "open db\nopen cache\nopen queue\ndb <- hello\nclose queue\nclose cache\nclose db\ndisposed: cache\nopen a\nopen b\nopen c\nclose c\nclose b\nclose a\nerror: c failed to close\nerror: b failed to close\nopen x\nscope is closed\n",
    }),
  ],
};
