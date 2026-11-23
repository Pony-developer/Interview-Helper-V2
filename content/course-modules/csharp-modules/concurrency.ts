import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const DOWNLOADER_TYPES = `// Simulates downloads and remembers how many ran at the same time
class Downloader
{
    private readonly object sync = new object();
    private int running;

    public int MaxRunning { get; private set; }

    public async Task<int> DownloadAsync(int id)
    {
        lock (sync)
        {
            running++;
            if (running > MaxRunning)
            {
                MaxRunning = running;
            }
        }
        await Task.Delay(30);
        lock (sync)
        {
            running--;
        }
        return id * 10;
    }
}`;

const DOWNLOADER_MAIN = `        var first = new Downloader();
        int[] ids = Enumerable.Range(1, 10).ToArray();
        int[] results = DownloadAllAsync(first, ids, 3).Result;
        Console.WriteLine(string.Join(" ", results));
        Console.WriteLine("Max at once: " + first.MaxRunning);

        var second = new Downloader();
        DownloadAllAsync(second, new[] { 1, 2, 3, 4 }, 1).Wait();
        Console.WriteLine("Max at once: " + second.MaxRunning);`;

const ASYNC_USINGS = "using System.Linq;\nusing System.Threading;\nusing System.Threading.Tasks;";

const PRICE_CACHE = (fields: string, body: string) => `// Computes each price once and remembers it
class PriceCache
{
    public static int Computations;
${fields}
    // A slow computation; counts how many times it really runs
    private static int ComputePrice(string product)
    {
        Interlocked.Increment(ref Computations);
        Thread.Sleep(20);
        return product.Length * 100;
    }

    // The price of the product, computed only once per product
    public int GetPrice(string product)
    {
${body}
    }
}`;

const WORDS_MAIN = `        string[] documents = { "the cat sat", "the dog sat", "a cat and a dog" };
        ConcurrentDictionary<string, int> counts = CountWords(documents);
        foreach (var pair in counts.OrderBy(p => p.Key, StringComparer.Ordinal))
        {
            Console.WriteLine(pair.Key + " " + pair.Value);
        }

        var cache = new PriceCache();
        string[] requests = new string[40];
        for (int i = 0; i < requests.Length; i++)
        {
            requests[i] = i % 2 == 0 ? "apple" : "kiwi";
        }
        int total = 0;
        Parallel.ForEach(requests, product => Interlocked.Add(ref total, cache.GetPrice(product)));
        Console.WriteLine("Total: " + total);
        Console.WriteLine("Computations: " + PriceCache.Computations);`;

const WORDS_USINGS = "using System.Collections.Concurrent;\nusing System.Linq;\nusing System.Threading;\nusing System.Threading.Tasks;";

const KITCHEN_MAIN = `        int[] dishes = RunKitchen(new[] { 1, 2, 3, 4, 5, 6, 7, 8 }, 3);
        Console.WriteLine(string.Join(" ", dishes));
        Console.WriteLine("Dishes: " + dishes.Length);`;

const KITCHEN_COOK = `    // Prepares one order (takes a moment)
    static int Cook(int order)
    {
        Thread.Sleep(5);
        return order * 10;
    }`;

export const concurrencyModule: ModuleDef = {
  slug: "concurrency",
  title: { en: "Concurrency: primitives and collections", uk: "Конкурентність: примітиви й колекції" },
  slides: [
    { kind: "lecture", slug: "lock-deep-dive", title: { en: "Locks in depth", uk: "Блокування поглиблено" } },
    { kind: "lecture", slug: "sync-primitives", title: { en: "Synchronization primitives", uk: "Примітиви синхронізації" } },
    {
      kind: "practice",
      slug: "semaphore-limit",
      title: { en: "Practice: Download limiter", uk: "Практика «Обмежувач завантажень»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        DOWNLOADER_TYPES,
        DOWNLOADER_MAIN,
        ASYNC_USINGS,
        `    // Downloads all ids, at most maxParallel at a time; results in the order of ids
    static async Task<int[]> DownloadAllAsync(Downloader downloader, int[] ids, int maxParallel)
    {
        // Write your code here: now every download starts at once
        Task<int>[] tasks = ids.Select(id => downloader.DownloadAsync(id)).ToArray();
        return await Task.WhenAll(tasks);
    }`,
      ),
      solution: PROGRAM_WITH(
        DOWNLOADER_TYPES,
        DOWNLOADER_MAIN,
        ASYNC_USINGS,
        `    // Downloads all ids, at most maxParallel at a time; results in the order of ids
    static async Task<int[]> DownloadAllAsync(Downloader downloader, int[] ids, int maxParallel)
    {
        var slots = new SemaphoreSlim(maxParallel);
        Task<int>[] tasks = ids.Select(async id =>
        {
            await slots.WaitAsync();
            try
            {
                return await downloader.DownloadAsync(id);
            }
            finally
            {
                slots.Release();
            }
        }).ToArray();
        return await Task.WhenAll(tasks);
    }`,
      ),
      expectedOutput: "10 20 30 40 50 60 70 80 90 100\nMax at once: 3\nMax at once: 1\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "concurrent-collections", title: { en: "Concurrent collections", uk: "Конкурентні колекції" } },
    {
      kind: "practice",
      slug: "concurrent-word-count",
      title: { en: "Practice: Parallel counting", uk: "Практика «Паралельний підрахунок»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        PRICE_CACHE(
          `
    // Write your code here: a dictionary of prices
`,
          `        // Write your code here
        return ComputePrice(product);`,
        ),
        WORDS_MAIN,
        WORDS_USINGS,
        `    // How many times each word occurs in all documents, counted in parallel
    static ConcurrentDictionary<string, int> CountWords(string[] documents)
    {
        var counts = new ConcurrentDictionary<string, int>();
        // Write your code here
        return counts;
    }`,
      ),
      solution: PROGRAM_WITH(
        PRICE_CACHE(
          `
    private readonly ConcurrentDictionary<string, Lazy<int>> prices = new ConcurrentDictionary<string, Lazy<int>>();
`,
          `        return prices.GetOrAdd(product, p => new Lazy<int>(() => ComputePrice(p))).Value;`,
        ),
        WORDS_MAIN,
        WORDS_USINGS,
        `    // How many times each word occurs in all documents, counted in parallel
    static ConcurrentDictionary<string, int> CountWords(string[] documents)
    {
        var counts = new ConcurrentDictionary<string, int>();
        Parallel.ForEach(documents, document =>
        {
            foreach (string word in document.Split(' '))
            {
                counts.AddOrUpdate(word, 1, (key, old) => old + 1);
            }
        });
        return counts;
    }`,
      ),
      expectedOutput: "a 2\nand 1\ncat 2\ndog 2\nsat 2\nthe 2\nTotal: 18000\nComputations: 2\n",
      maxScore: 10,
    },
    {
      kind: "quiz",
      slug: "concurrency-quiz",
      title: { en: "Locks and concurrent collections", uk: "Блокування та конкурентні колекції" },
      questions: [
        {
          id: "lock-compiles",
          mode: "single",
          prompt: { en: "What does a `lock (sync) { ... }` statement compile into?", uk: "У що компілюється інструкція `lock (sync) { ... }`?" },
          options: [
            { id: "a", text: { en: "`Monitor.Enter` before the block and `Monitor.Exit` in a `finally`", uk: "`Monitor.Enter` перед блоком і `Monitor.Exit` у `finally`" } },
            { id: "b", text: { en: "A new thread for the block", uk: "Новий потік для блоку" } },
            { id: "c", text: { en: "A `SemaphoreSlim` with one place", uk: "`SemaphoreSlim` з одним місцем" } },
          ],
          correct: ["a"],
        },
        {
          id: "bad-lock-targets",
          mode: "multi",
          prompt: { en: "Which objects are bad choices to lock on?", uk: "На яких об'єктах погано блокуватися?" },
          options: [
            { id: "a", text: { en: "`this`", uk: "`this`" } },
            { id: "b", text: { en: "A string literal such as `\"orders\"`", uk: "Рядковий літерал на кшталт `\"orders\"`" } },
            { id: "c", text: { en: "`typeof(OrderService)`", uk: "`typeof(OrderService)`" } },
            { id: "d", text: { en: "`private readonly object sync = new object();`", uk: "`private readonly object sync = new object();`" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "await-in-lock",
          mode: "single",
          prompt: { en: "Why is `await` not allowed inside a `lock` block?", uk: "Чому `await` заборонено всередині блоку `lock`?" },
          options: [
            { id: "a", text: { en: "A monitor belongs to a thread, and after `await` the method may continue on another thread", uk: "Монітор належить потоку, а після `await` метод може продовжитися в іншому потоці" } },
            { id: "b", text: { en: "`await` is too slow for locks", uk: "`await` надто повільний для блокувань" } },
            { id: "c", text: { en: "It is allowed", uk: "Це дозволено" } },
          ],
          correct: ["a"],
        },
        {
          id: "limit-n",
          mode: "single",
          prompt: { en: "Which tool limits an async operation to at most 5 calls running at once?", uk: "Який інструмент обмежує асинхронну операцію щонайбільше 5 одночасними викликами?" },
          options: [
            { id: "a", text: { en: "`SemaphoreSlim(5)` with `await WaitAsync()` and `Release()` in `finally`", uk: "`SemaphoreSlim(5)` з `await WaitAsync()` і `Release()` у `finally`" } },
            { id: "b", text: { en: "`lock` around the call", uk: "`lock` навколо виклику" } },
            { id: "c", text: { en: "A named `Mutex`", uk: "Іменований `Mutex`" } },
          ],
          correct: ["a"],
        },
        {
          id: "getoradd-factory",
          mode: "single",
          prompt: { en: "Can the factory passed to `ConcurrentDictionary.GetOrAdd` run more than once for the same key?", uk: "Чи може фабрика, передана в `ConcurrentDictionary.GetOrAdd`, виконатися більше одного разу для того самого ключа?" },
          options: [
            { id: "a", text: { en: "Yes, if several threads ask at once; store `Lazy<T>` when it must run once", uk: "Так, якщо кілька потоків просять одночасно; зберігайте `Lazy<T>`, коли вона має виконатися один раз" } },
            { id: "b", text: { en: "No, it always runs exactly once", uk: "Ні, вона завжди виконується рівно один раз" } },
            { id: "c", text: { en: "No, it never runs", uk: "Ні, вона ніколи не виконується" } },
          ],
          correct: ["a"],
        },
        {
          id: "check-then-act",
          mode: "single",
          prompt: { en: "`if (!cache.ContainsKey(k)) cache[k] = Load(k);` on a `ConcurrentDictionary`. Is it safe?", uk: "`if (!cache.ContainsKey(k)) cache[k] = Load(k);` для `ConcurrentDictionary`. Чи це безпечно?" },
          options: [
            { id: "a", text: { en: "No: the two calls are not atomic together; use `GetOrAdd`", uk: "Ні: два виклики разом не атомарні; використовуйте `GetOrAdd`" } },
            { id: "b", text: { en: "Yes: every call on a concurrent collection is safe, so the whole code is safe", uk: "Так: кожен виклик конкурентної колекції безпечний, тож і весь код безпечний" } },
            { id: "c", text: { en: "It does not compile", uk: "Це не компілюється" } },
          ],
          correct: ["a"],
        },
      ],
    },
    { kind: "lecture", slug: "channels", title: { en: "Channels", uk: "Канали" } },
    {
      kind: "practice",
      slug: "producer-consumer",
      title: { en: "Practice: The kitchen", uk: "Практика «Кухня»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        "",
        KITCHEN_MAIN,
        WORDS_USINGS,
        `${KITCHEN_COOK}

    // A producer adds the orders to a bounded queue; several cooks take them; returns the sorted dishes
    static int[] RunKitchen(int[] orders, int cooks)
    {
        // Write your code here
        return new int[0];
    }`,
      ),
      solution: PROGRAM_WITH(
        "",
        KITCHEN_MAIN,
        WORDS_USINGS,
        `${KITCHEN_COOK}

    // A producer adds the orders to a bounded queue; several cooks take them; returns the sorted dishes
    static int[] RunKitchen(int[] orders, int cooks)
    {
        var queue = new BlockingCollection<int>(boundedCapacity: 2);
        var dishes = new ConcurrentBag<int>();

        var workers = new Task[cooks];
        for (int i = 0; i < cooks; i++)
        {
            workers[i] = Task.Run(() =>
            {
                foreach (int order in queue.GetConsumingEnumerable())
                {
                    dishes.Add(Cook(order));
                }
            });
        }

        foreach (int order in orders)
        {
            queue.Add(order);
        }
        queue.CompleteAdding();

        Task.WaitAll(workers);
        return dishes.OrderBy(d => d).ToArray();
    }`,
      ),
      expectedOutput: "10 20 30 40 50 60 70 80\nDishes: 8\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "async-internals", title: { en: "How await works", uk: "Як працює await" } },
    { kind: "lecture", slug: "valuetask-async-streams", title: { en: "ValueTask and async streams", uk: "ValueTask і асинхронні потоки" } },
    {
      kind: "quiz",
      slug: "async-internals-quiz",
      title: { en: "Inside async", uk: "Усередині async" },
      questions: [
        {
          id: "completed-await",
          mode: "single",
          prompt: { en: "What does `await` do when the task is already completed?", uk: "Що робить `await`, коли задача вже завершена?" },
          options: [
            { id: "a", text: { en: "It continues at once, synchronously, on the same thread", uk: "Продовжує одразу, синхронно, у тому самому потоці" } },
            { id: "b", text: { en: "It always switches to a pool thread", uk: "Завжди перемикається в потік пулу" } },
            { id: "c", text: { en: "It throws an exception", uk: "Кидає виняток" } },
          ],
          correct: ["a"],
        },
        {
          id: "ui-deadlock",
          mode: "single",
          prompt: {
            en: "A WPF button handler calls `LoadAsync().Result`, and `LoadAsync` does `await Task.Delay(100)`. Why does the program freeze?",
            uk: "Обробник кнопки у WPF викликає `LoadAsync().Result`, а `LoadAsync` виконує `await Task.Delay(100)`. Чому програма зависає?",
          },
          options: [
            { id: "a", text: { en: "The continuation waits for the UI thread, which is blocked by `.Result` waiting for the task", uk: "Продовження чекає на потік UI, заблокований через `.Result`, що чекає на задачу" } },
            { id: "b", text: { en: "`Task.Delay` never completes in WPF", uk: "`Task.Delay` ніколи не завершується у WPF" } },
            { id: "c", text: { en: "`.Result` is not allowed in event handlers", uk: "`.Result` заборонено в обробниках подій" } },
          ],
          correct: ["a"],
        },
        {
          id: "configureawait",
          mode: "single",
          prompt: { en: "Where is `ConfigureAwait(false)` most useful?", uk: "Де `ConfigureAwait(false)` найкорисніший?" },
          options: [
            { id: "a", text: { en: "In library code that does not need to return to the caller's context", uk: "У коді бібліотек, яким не треба повертатися в контекст викликаючого" } },
            { id: "b", text: { en: "In UI code that updates controls after `await`", uk: "У коді UI, що оновлює елементи керування після `await`" } },
            { id: "c", text: { en: "It makes the task run on a new thread", uk: "Він змушує задачу виконуватися в новому потоці" } },
          ],
          correct: ["a"],
        },
        {
          id: "aspnetcore-context",
          mode: "single",
          prompt: { en: "Which `SynchronizationContext` does ASP.NET Core have?", uk: "Який `SynchronizationContext` має ASP.NET Core?" },
          options: [
            { id: "a", text: { en: "None: continuations run on thread-pool threads", uk: "Жодного: продовження виконуються в потоках пулу" } },
            { id: "b", text: { en: "One per request, like the old ASP.NET", uk: "Один на запит, як у старому ASP.NET" } },
            { id: "c", text: { en: "The UI context", uk: "Контекст UI" } },
          ],
          correct: ["a"],
        },
        {
          id: "valuetask-rule",
          mode: "single",
          prompt: { en: "Which rule applies to a `ValueTask<T>` and not to a `Task<T>`?", uk: "Яке правило стосується `ValueTask<T>`, але не `Task<T>`?" },
          options: [
            { id: "a", text: { en: "It may be awaited only once", uk: "Його можна очікувати лише один раз" } },
            { id: "b", text: { en: "It cannot return a value", uk: "Він не може повертати значення" } },
            { id: "c", text: { en: "It must always complete synchronously", uk: "Він завжди має завершуватися синхронно" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "quiz",
      slug: "concurrency-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "channel-vs-blocking",
          mode: "single",
          prompt: { en: "How does a waiting reader of a `Channel<T>` differ from a waiting consumer of a `BlockingCollection<T>`?", uk: "Чим читач `Channel<T>`, що чекає, відрізняється від споживача `BlockingCollection<T>`, що чекає?" },
          options: [
            { id: "a", text: { en: "The channel reader awaits without occupying a thread; the blocking collection blocks one", uk: "Читач каналу очікує, не займаючи потоку; блокувальна колекція блокує потік" } },
            { id: "b", text: { en: "There is no difference", uk: "Різниці немає" } },
            { id: "c", text: { en: "A channel cannot have several readers", uk: "Канал не може мати кількох читачів" } },
          ],
          correct: ["a"],
        },
        {
          id: "backpressure",
          mode: "single",
          prompt: { en: "What does a bounded channel give that an unbounded one does not?", uk: "Що дає обмежений канал, чого не дає необмежений?" },
          options: [
            { id: "a", text: { en: "Backpressure: a slow consumer makes the producer wait instead of memory growing without limit", uk: "Зворотний тиск: повільний споживач змушує виробника чекати замість необмеженого росту пам'яті" } },
            { id: "b", text: { en: "Faster reads", uk: "Швидше читання" } },
            { id: "c", text: { en: "Items in sorted order", uk: "Елементи в сортованому порядку" } },
          ],
          correct: ["a"],
        },
        {
          id: "complete-adding",
          mode: "single",
          prompt: { en: "What happens if the producer never calls `CompleteAdding()` on a `BlockingCollection`?", uk: "Що станеться, якщо виробник ніколи не викличе `CompleteAdding()` для `BlockingCollection`?" },
          options: [
            { id: "a", text: { en: "The consumers in `GetConsumingEnumerable()` wait for new items forever", uk: "Споживачі в `GetConsumingEnumerable()` вічно чекатимуть нових елементів" } },
            { id: "b", text: { en: "The items are lost", uk: "Елементи втрачаються" } },
            { id: "c", text: { en: "Nothing: the collection completes itself", uk: "Нічого: колекція завершується сама" } },
          ],
          correct: ["a"],
        },
        {
          id: "starvation",
          mode: "single",
          prompt: { en: "What typically causes thread-pool starvation in a server?", uk: "Що зазвичай спричиняє голодування пулу потоків на сервері?" },
          options: [
            { id: "a", text: { en: "Blocking on async code with `.Result` or `.Wait()` under load", uk: "Блокування на асинхронному коді через `.Result` чи `.Wait()` під навантаженням" } },
            { id: "b", text: { en: "Using `await` everywhere", uk: "Використання `await` усюди" } },
            { id: "c", text: { en: "Using `ConcurrentDictionary`", uk: "Використання `ConcurrentDictionary`" } },
          ],
          correct: ["a"],
        },
        {
          id: "async-stream",
          mode: "single",
          prompt: { en: "How is an `IAsyncEnumerable<T>` consumed?", uk: "Як споживають `IAsyncEnumerable<T>`?" },
          options: [
            { id: "a", text: { en: "With `await foreach`", uk: "Через `await foreach`" } },
            { id: "b", text: { en: "With `.Result`", uk: "Через `.Result`" } },
            { id: "c", text: { en: "Only with LINQ `ToList()`", uk: "Лише через LINQ `ToList()`" } },
          ],
          correct: ["a"],
        },
        {
          id: "volatile",
          mode: "single",
          prompt: { en: "Does marking a field `volatile` make `count++` safe for several threads?", uk: "Чи робить позначка `volatile` на полі операцію `count++` безпечною для кількох потоків?" },
          options: [
            { id: "a", text: { en: "No: it makes reads and writes visible, but `++` is still read, add, write; use `Interlocked.Increment`", uk: "Ні: вона робить читання і записи видимими, але `++` і далі читає, додає й записує; використовуйте `Interlocked.Increment`" } },
            { id: "b", text: { en: "Yes, `volatile` makes every operation atomic", uk: "Так, `volatile` робить кожну операцію атомарною" } },
            { id: "c", text: { en: "Yes, but only for `long`", uk: "Так, але лише для `long`" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
