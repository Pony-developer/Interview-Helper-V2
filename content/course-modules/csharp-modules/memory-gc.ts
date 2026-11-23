import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const CONNECTION_TYPES = (query: string, dispose: string) => `// A fake database connection that must be closed exactly once
class Connection : IDisposable
{
    public static int ClosedCount;

    private readonly string name;
    private bool disposed;

    public Connection(string name)
    {
        this.name = name;
        Console.WriteLine("open " + name);
    }

    // "<name>: <sql>"; throws ObjectDisposedException after Dispose
    public string Query(string sql)
    {
${query}
    }

    // Prints "close <name>" and counts the closing, only the first time
    public void Dispose()
    {
${dispose}
    }
}`;

const CONNECTION_MAIN = `        using (var db = new Connection("main"))
        {
            Console.WriteLine(db.Query("select 1"));
        }

        var temp = new Connection("temp");
        temp.Dispose();
        temp.Dispose();
        try
        {
            temp.Query("select 2");
        }
        catch (ObjectDisposedException)
        {
            Console.WriteLine("temp is disposed");
        }

        try
        {
            using (var db = new Connection("report"))
            {
                Console.WriteLine(db.Query("select 3"));
                throw new InvalidOperationException("report failed");
            }
        }
        catch (InvalidOperationException e)
        {
            Console.WriteLine(e.Message);
        }

        Console.WriteLine("Total closed: " + Connection.ClosedCount);`;

const LEAK_TYPES = (dispose: string) => `// Lives for the whole program and publishes prices
class PriceFeed
{
    public event Action<decimal> PriceChanged;

    public int SubscriberCount
    {
        get { return PriceChanged == null ? 0 : PriceChanged.GetInvocationList().Length; }
    }

    public void Publish(decimal price)
    {
        var handler = PriceChanged;
        if (handler != null)
        {
            handler(price);
        }
    }
}

// Shows prices while it is open
class PriceWindow : IDisposable
{
    private readonly PriceFeed feed;
    private readonly string title;

    public PriceWindow(PriceFeed feed, string title)
    {
        this.feed = feed;
        this.title = title;
        feed.PriceChanged += OnPriceChanged;
    }

    private void OnPriceChanged(decimal price)
    {
        Console.WriteLine(title + " shows " + price);
    }

    public void Dispose()
    {
${dispose}
    }
}`;

const LEAK_MAIN = `        var feed = new PriceFeed();
        using (var first = new PriceWindow(feed, "Window 1"))
        {
            feed.Publish(10);
            using (var second = new PriceWindow(feed, "Window 2"))
            {
                feed.Publish(11);
            }
            feed.Publish(12);
        }
        feed.Publish(13);
        Console.WriteLine("Subscribers left: " + feed.SubscriberCount);`;

export const memoryGcModule: ModuleDef = {
  slug: "memory-gc",
  title: { en: "Memory and garbage collection", uk: "Пам'ять і збирання сміття" },
  slides: [
    { kind: "lecture", slug: "managed-heap", title: { en: "The managed heap", uk: "Керована купа" } },
    { kind: "lecture", slug: "gc-generations", title: { en: "Generations", uk: "Покоління" } },
    {
      kind: "quiz",
      slug: "gc-quiz",
      title: { en: "How the GC works", uk: "Як працює GC" },
      questions: [
        {
          id: "eligible",
          mode: "single",
          prompt: { en: "When can the GC collect an object?", uk: "Коли GC може зібрати об'єкт?" },
          options: [
            { id: "a", text: { en: "When no chain of references from a root (a local variable, a static field) leads to it", uk: "Коли до нього не веде жоден ланцюжок посилань від кореня (локальної змінної, статичного поля)" } },
            { id: "b", text: { en: "When nobody references it at all, counting other garbage objects too", uk: "Коли на нього взагалі ніхто не посилається, враховуючи інші об'єкти-сміття" } },
            { id: "c", text: { en: "Right after the method that created it ends", uk: "Одразу після завершення методу, що його створив" } },
          ],
          correct: ["a"],
        },
        {
          id: "cycle",
          mode: "single",
          prompt: { en: "Two objects reference each other, and nothing else references either of them. What happens?", uk: "Два об'єкти посилаються один на одного, і більше ніщо не посилається на жоден із них. Що станеться?" },
          options: [
            { id: "a", text: { en: "Both are collected: a tracing GC handles cycles", uk: "Обидва буде зібрано: трасувальний GC справляється з циклами" } },
            { id: "b", text: { en: "They leak forever, because each has a reference", uk: "Вони витікають назавжди, бо кожен має посилання" } },
            { id: "c", text: { en: "The program crashes", uk: "Програма падає" } },
          ],
          correct: ["a"],
        },
        {
          id: "new-object-gen",
          mode: "single",
          prompt: { en: "Where does a new small object start its life?", uk: "Де починає життя новий малий об'єкт?" },
          options: [
            { id: "a", text: { en: "In generation 0", uk: "У поколінні 0" } },
            { id: "b", text: { en: "In generation 2", uk: "У поколінні 2" } },
            { id: "c", text: { en: "On the stack", uk: "На стеку" } },
          ],
          correct: ["a"],
        },
        {
          id: "loh",
          mode: "single",
          prompt: { en: "Where does `new byte[100_000]` go?", uk: "Куди потрапляє `new byte[100_000]`?" },
          options: [
            { id: "a", text: { en: "To the Large Object Heap: it is 85,000 bytes or more", uk: "У купу великих об'єктів: розмір 85 000 байтів або більше" } },
            { id: "b", text: { en: "To generation 0, like any new object", uk: "У покоління 0, як будь-який новий об'єкт" } },
            { id: "c", text: { en: "To the stack", uk: "На стек" } },
          ],
          correct: ["a"],
        },
        {
          id: "gc-collect",
          mode: "single",
          prompt: { en: "Should application code call `GC.Collect()` to \"clean up memory\"?", uk: "Чи варто прикладному коду викликати `GC.Collect()`, щоб «прибрати пам'ять»?" },
          options: [
            { id: "a", text: { en: "Almost never: it promotes live objects and usually makes performance worse", uk: "Майже ніколи: це переводить живі об'єкти в старші покоління і зазвичай погіршує продуктивність" } },
            { id: "b", text: { en: "Yes, after every request", uk: "Так, після кожного запиту" } },
            { id: "c", text: { en: "Yes, otherwise memory is never freed", uk: "Так, інакше пам'ять ніколи не звільняється" } },
          ],
          correct: ["a"],
        },
      ],
    },
    { kind: "lecture", slug: "idisposable-using", title: { en: "IDisposable and using", uk: "IDisposable і using" } },
    {
      kind: "practice",
      slug: "disposable-resource",
      title: { en: "Practice: Connection", uk: "Практика «З'єднання»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        CONNECTION_TYPES(
          `        // Write your code here
        return name + ": " + sql;`,
          `        // Write your code here`,
        ),
        CONNECTION_MAIN,
      ),
      solution: PROGRAM_WITH(
        CONNECTION_TYPES(
          `        if (disposed)
        {
            throw new ObjectDisposedException(name);
        }
        return name + ": " + sql;`,
          `        if (disposed)
        {
            return;
        }
        disposed = true;
        ClosedCount++;
        Console.WriteLine("close " + name);`,
        ),
        CONNECTION_MAIN,
      ),
      expectedOutput:
        "open main\nmain: select 1\nclose main\nopen temp\nclose temp\ntemp is disposed\nopen report\nreport: select 3\nclose report\nreport failed\nTotal closed: 3\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "dispose-pattern", title: { en: "Finalizers and the Dispose pattern", uk: "Фіналізатори та патерн Dispose" } },
    { kind: "lecture", slug: "memory-leaks", title: { en: "Memory leaks in managed code", uk: "Витоки пам'яті в керованому коді" } },
    {
      kind: "practice",
      slug: "event-leak",
      title: { en: "Practice: The leaking window", uk: "Практика «Вікно, що витікає»" },
      language: "csharp",
      starter: PROGRAM_WITH(LEAK_TYPES(`        // Write your code here`), LEAK_MAIN),
      solution: PROGRAM_WITH(LEAK_TYPES(`        feed.PriceChanged -= OnPriceChanged;`), LEAK_MAIN),
      expectedOutput: "Window 1 shows 10\nWindow 1 shows 11\nWindow 2 shows 11\nWindow 1 shows 12\nSubscribers left: 0\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "span-and-memory", title: { en: "Span and Memory", uk: "Span і Memory" } },
    {
      kind: "quiz",
      slug: "memory-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "why-dispose",
          mode: "single",
          prompt: { en: "Why is `IDisposable` needed if .NET has a garbage collector?", uk: "Навіщо `IDisposable`, якщо в .NET є збирач сміття?" },
          options: [
            { id: "a", text: { en: "The GC frees only memory, and at an unknown moment; files, sockets and connections need release right away", uk: "GC звільняє лише пам'ять і в невідомий момент; файли, сокети та з'єднання треба звільняти одразу" } },
            { id: "b", text: { en: "`Dispose` frees the object's memory immediately", uk: "`Dispose` негайно звільняє пам'ять об'єкта" } },
            { id: "c", text: { en: "Without `Dispose` the object is never collected", uk: "Без `Dispose` об'єкт ніколи не буде зібрано" } },
          ],
          correct: ["a"],
        },
        {
          id: "using-compiles",
          mode: "single",
          prompt: { en: "What does a `using (var x = ...) { ... }` statement compile into?", uk: "У що компілюється інструкція `using (var x = ...) { ... }`?" },
          options: [
            { id: "a", text: { en: "A `try`/`finally` that calls `x.Dispose()` in `finally`", uk: "У `try`/`finally`, що викликає `x.Dispose()` у `finally`" } },
            { id: "b", text: { en: "A `try`/`catch` that swallows exceptions", uk: "У `try`/`catch`, що ковтає винятки" } },
            { id: "c", text: { en: "A call to `GC.Collect()`", uk: "У виклик `GC.Collect()`" } },
          ],
          correct: ["a"],
        },
        {
          id: "suppress-finalize",
          mode: "single",
          prompt: { en: "Why does `Dispose()` call `GC.SuppressFinalize(this)`?", uk: "Навіщо `Dispose()` викликає `GC.SuppressFinalize(this)`?" },
          options: [
            { id: "a", text: { en: "The resources are already released, so the finalizer is not needed, and the object can be collected in one pass", uk: "Ресурси вже звільнено, тож фіналізатор не потрібен, і об'єкт можна зібрати за один прохід" } },
            { id: "b", text: { en: "It deletes the object from memory at once", uk: "Він одразу видаляє об'єкт із пам'яті" } },
            { id: "c", text: { en: "It stops the GC for the whole program", uk: "Він зупиняє GC для всієї програми" } },
          ],
          correct: ["a"],
        },
        {
          id: "disposing-false",
          mode: "single",
          prompt: { en: "In `Dispose(bool disposing)`, why must the `disposing == false` path not touch other managed objects?", uk: "Чому в `Dispose(bool disposing)` гілка `disposing == false` не має чіпати інших керованих об'єктів?" },
          options: [
            { id: "a", text: { en: "It runs from the finalizer, when those objects may already be finalized", uk: "Вона виконується з фіналізатора, коли ці об'єкти вже могли бути фіналізовані" } },
            { id: "b", text: { en: "Managed objects cannot be disposed at all", uk: "Керовані об'єкти взагалі не можна звільняти" } },
            { id: "c", text: { en: "It is just a naming convention", uk: "Це лише домовленість про назви" } },
          ],
          correct: ["a"],
        },
        {
          id: "leak-causes",
          mode: "multi",
          prompt: { en: "Which of these can cause a memory leak in managed code?", uk: "Що з переліченого може спричинити витік пам'яті в керованому коді?" },
          options: [
            { id: "a", text: { en: "A short-lived object subscribed to an event of a long-lived service, never unsubscribed", uk: "Короткоживучий об'єкт, підписаний на подію довгоживучого сервісу, який ніколи не відписується" } },
            { id: "b", text: { en: "A static dictionary used as a cache with no removal", uk: "Статичний словник, що слугує кешем без видалення" } },
            { id: "c", text: { en: "A running timer that is never disposed", uk: "Запущений таймер, який ніколи не звільняють" } },
            { id: "d", text: { en: "A local list that a method creates and does not return", uk: "Локальний список, який метод створює і не повертає" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "span-field",
          mode: "single",
          prompt: { en: "Why can `Span<T>` not be a field of a class or be used across `await`?", uk: "Чому `Span<T>` не може бути полем класу чи жити через `await`?" },
          options: [
            { id: "a", text: { en: "It is a `ref struct` that may point to stack memory, so it must not outlive the method", uk: "Це `ref struct`, що може вказувати на пам'ять стека, тож він не має пережити метод" } },
            { id: "b", text: { en: "It is too large", uk: "Він завеликий" } },
            { id: "c", text: { en: "It is a reference type", uk: "Це посилальний тип" } },
          ],
          correct: ["a"],
        },
        {
          id: "httpclient",
          mode: "single",
          prompt: { en: "What is wrong with `using (var client = new HttpClient()) { ... }` around every request?", uk: "Що не так із `using (var client = new HttpClient()) { ... }` навколо кожного запиту?" },
          options: [
            { id: "a", text: { en: "It can exhaust the sockets: share one client or use `IHttpClientFactory`", uk: "Це може вичерпати сокети: використовуйте один спільний клієнт або `IHttpClientFactory`" } },
            { id: "b", text: { en: "Nothing, this is the recommended way", uk: "Нічого, це рекомендований спосіб" } },
            { id: "c", text: { en: "`HttpClient` is not disposable, so it does not compile", uk: "`HttpClient` не є disposable, тож це не компілюється" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
