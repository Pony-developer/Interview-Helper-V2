import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const bankTypes = (body: string) => `class Account
{
    public int Id { get; private set; }
    public decimal Balance { get; set; }
    public readonly object Gate = new object();
    public Account(int id, decimal balance) { Id = id; Balance = balance; }
}

static class Bank
{
    public static int Transfers;   // count of successful transfers, updated thread-safely

    // Moves 'amount' from 'from' to 'to' atomically. Returns false (and changes nothing) if funds are insufficient.
    // Must never deadlock, even when two threads transfer A->B and B->A at the same time.
    public static bool Transfer(Account from, Account to, decimal amount)
    {
${body}
    }
}`;

const bankSolution = `        Account first = from.Id < to.Id ? from : to;      // always lock in the same global order
        Account second = from.Id < to.Id ? to : from;
        lock (first.Gate)
        lock (second.Gate)
        {
            if (from.Balance < amount) return false;
            from.Balance -= amount;
            to.Balance += amount;
        }
        Interlocked.Increment(ref Bank.Transfers);
        return true;`;

const bankMain = `        var a = new Account(1, 1000000m);
        var b = new Account(2, 1000000m);
        var c = new Account(3, 0m);
        var threads = new List<Thread>();
        for (int t = 0; t < 4; t++)
        {
            bool forward = t % 2 == 0;
            var thread = new Thread(() =>
            {
                for (int i = 0; i < 10000; i++)
                {
                    if (forward) Bank.Transfer(a, b, 1m); else Bank.Transfer(b, a, 1m);
                    if (i % 100 == 0) Bank.Transfer(forward ? a : b, c, 1m);
                }
            });
            threads.Add(thread);
            thread.Start();
        }
        foreach (var t in threads) t.Join();
        Console.WriteLine("total: " + (a.Balance + b.Balance + c.Balance));
        Console.WriteLine("c: " + c.Balance);
        Console.WriteLine("transfers: " + Bank.Transfers);
        Console.WriteLine("overdraft refused: " + !Bank.Transfer(c, a, 1000m));`;

const queueTypes = (body: string) => `// A bounded blocking queue built on Monitor.Wait / Monitor.Pulse (like a tiny BlockingCollection).
class BoundedQueue<T>
{
    private readonly Queue<T> _items = new Queue<T>();
    private readonly int _capacity;
    private readonly object _sync = new object();
    private bool _completed;

    public BoundedQueue(int capacity) { _capacity = capacity; }

    // Blocks while the queue is full.
    public void Add(T item)
    {
${body.split("@@")[0]}
    }

    // Blocks while the queue is empty; returns false once the queue is completed AND drained.
    public bool TryTake(out T item)
    {
${body.split("@@")[1]}
    }

    // No more items will be added: wakes up every waiting consumer.
    public void CompleteAdding()
    {
${body.split("@@")[2]}
    }
}`;

const queueSolution = [
  `        lock (_sync)
        {
            while (_items.Count >= _capacity) Monitor.Wait(_sync);
            if (_completed) throw new InvalidOperationException("Adding is completed");
            _items.Enqueue(item);
            Monitor.PulseAll(_sync);
        }`,
  `        lock (_sync)
        {
            while (_items.Count == 0 && !_completed) Monitor.Wait(_sync);
            if (_items.Count == 0) { item = default(T); return false; }
            item = _items.Dequeue();
            Monitor.PulseAll(_sync);
            return true;
        }`,
  `        lock (_sync)
        {
            _completed = true;
            Monitor.PulseAll(_sync);
        }`,
].join("@@");

const queueMain = `        var queue = new BoundedQueue<int>(5);
        long total = 0;
        int consumed = 0;
        var consumers = new List<Thread>();
        for (int c = 0; c < 3; c++)
        {
            var t = new Thread(() =>
            {
                int item;
                while (queue.TryTake(out item))
                {
                    Interlocked.Add(ref total, item);
                    Interlocked.Increment(ref consumed);
                }
            });
            consumers.Add(t);
            t.Start();
        }
        var producers = new List<Thread>();
        for (int p = 0; p < 2; p++)
        {
            int start = p * 1000 + 1;
            var t = new Thread(() => { for (int i = start; i < start + 1000; i++) queue.Add(i); });
            producers.Add(t);
            t.Start();
        }
        foreach (var t in producers) t.Join();
        queue.CompleteAdding();
        foreach (var t in consumers) t.Join();
        Console.WriteLine("consumed: " + consumed);
        Console.WriteLine("total: " + total);
        try { queue.Add(1); } catch (InvalidOperationException e) { Console.WriteLine(e.Message); }`;

export const advancedThreadingModule: ModuleDef = {
  slug: "advanced-threading",
  title: { en: "Advanced threading and synchronization", uk: "Просунуті потоки та синхронізація" },
  slides: [
    lecture("exclusive-locking", "Exclusive locking: lock, Monitor, Mutex and deadlocks", "Ексклюзивне блокування: lock, Monitor, Mutex і взаємоблокування"),
    lecture("thread-safety", "Thread safety, Interlocked and memory barriers", "Потокобезпечність, Interlocked і бар'єри пам'яті"),
    lecture("nonexclusive-locking", "Semaphores and reader/writer locks", "Семафори та блокування читачів/писачів"),
    lecture("signaling", "Signaling: wait handles, Wait/Pulse, Barrier", "Сигналізація: wait handles, Wait/Pulse, Barrier"),
    lecture("lazy-tls-timers", "Lazy initialization, thread-local storage and timers", "Лінива ініціалізація, локальне сховище потоку та таймери"),
    quiz("advanced-threading-quiz", "Advanced threading", "Просунуті потоки", [
      question(
        "lock-object",
        ["Why should you lock on a private `readonly object` rather than on `this` or a string?", "Чому блокувати слід на приватному `readonly object`, а не на `this` чи рядку?"],
        [
          ["It's faster", "Це швидше"],
          ["Outside code can't lock on a private object, so it can't cause deadlocks or contention with your lock; interned strings are shared across the whole process", "Сторонній код не може блокуватися на приватному об'єкті, тож не спричинить взаємоблокувань чи конкуренції з вашим lock; інтерновані рядки спільні для всього процесу"],
          ["`lock(this)` doesn't compile", "`lock(this)` не компілюється"],
          ["Strings can't be locked", "Рядки не можна блокувати"],
        ],
        "b",
      ),
      question(
        "deadlock",
        ["Thread 1 locks A then B; thread 2 locks B then A. What can happen and how do you prevent it?", "Потік 1 блокує A, потім B; потік 2 — B, потім A. Що може статися і як цьому запобігти?"],
        [
          ["Nothing; locks are reentrant", "Нічого; блокування повторно входимі"],
          ["A race condition; use volatile", "Стан гонитви; використати volatile"],
          ["A deadlock; acquire locks in one consistent global order (or use timeouts)", "Взаємоблокування; захоплювати блокування в одному узгодженому глобальному порядку (або з тайм-аутами)"],
          ["An exception; catch it", "Виняток; перехопити його"],
        ],
        "c",
      ),
      question(
        "interlocked",
        ["`count++` on a shared int from many threads loses updates. What is the cheapest correct fix?", "`count++` на спільному int з багатьох потоків губить оновлення. Яке найдешевше правильне виправлення?"],
        [
          ["`Interlocked.Increment(ref count)`", "`Interlocked.Increment(ref count)`"],
          ["Mark it `volatile`", "Позначити `volatile`"],
          ["Use `Thread.Sleep`", "Використати `Thread.Sleep`"],
          ["Make it a `long`", "Зробити його `long`"],
        ],
        "a",
      ),
      question(
        "await-lock",
        ["Why can't you `await` inside a `lock` block, and what do you use instead?", "Чому не можна `await` усередині блоку `lock` і що використати натомість?"],
        [
          ["You can; it just warns", "Можна; лише попередження"],
          ["Because locks are slow; use Mutex", "Бо блокування повільні; використати Mutex"],
          ["Because await is CPU-bound; use Task.Run", "Бо await обмежений CPU; використати Task.Run"],
          ["Monitor locks are thread-affine and the code may resume on another thread; use `SemaphoreSlim.WaitAsync`", "Блокування Monitor прив'язані до потоку, а код може продовжитися в іншому потоці; використати `SemaphoreSlim.WaitAsync`"],
        ],
        "d",
      ),
      question(
        "rwlock",
        ["When does `ReaderWriterLockSlim` help?", "Коли допомагає `ReaderWriterLockSlim`?"],
        [
          ["When data is read very often and written rarely: many readers can hold the lock at once", "Коли дані дуже часто читають і рідко пишуть: багато читачів можуть тримати блокування одночасно"],
          ["When writes are frequent", "Коли записи часті"],
          ["Across processes", "Між процесами"],
          ["Always instead of lock", "Завжди замість lock"],
        ],
        "a",
      ),
      question(
        "mutex",
        ["What can a named `Mutex` do that `lock` can't?", "Що може іменований `Mutex`, чого не може `lock`?"],
        [
          ["Be faster", "Бути швидшим"],
          ["Synchronize across processes, e.g. allow only one instance of an app", "Синхронізувати між процесами, наприклад дозволити лише один екземпляр застосунку"],
          ["Work with async code", "Працювати з асинхронним кодом"],
          ["Lock value types", "Блокувати типи значень"],
        ],
        "b",
      ),
      question(
        "lazy",
        ["What does `Lazy<T>` (default mode) guarantee?", "Що гарантує `Lazy<T>` (режим за замовчуванням)?"],
        [
          ["The value is created at startup", "Значення створюється під час старту"],
          ["The value is created on first access, exactly once even when many threads access it at the same time", "Значення створюється при першому доступі, рівно один раз, навіть коли до нього одночасно звертається багато потоків"],
          ["The value is recreated on every access", "Значення перестворюється на кожен доступ"],
          ["The value is stored per thread", "Значення зберігається окремо для кожного потоку"],
        ],
        "b",
      ),
      question(
        "asynclocal",
        ["Which are true about per-thread and per-flow storage?", "Що правда про сховища для потоку й для асинхронного потоку виконання?"],
        [
          ["`[ThreadStatic]` and `ThreadLocal<T>` give each thread its own value", "`[ThreadStatic]` і `ThreadLocal<T>` дають кожному потоку власне значення"],
          ["`AsyncLocal<T>` flows with the async execution context across awaits", "`AsyncLocal<T>` іде разом з асинхронним контекстом виконання через await"],
          ["`ThreadLocal<T>` values survive an await that resumes on another thread", "Значення `ThreadLocal<T>` переживають await, що продовжується в іншому потоці"],
          ["Thread-pool threads are reused, so thread-static values can leak between work items", "Потоки пулу повторно використовуються, тож значення thread-static можуть просочуватися між робочими елементами"],
        ],
        ["a", "b", "d"],
      ),
    ]),
    practice("deadlock-free-transfer-practice", "Deadlock-free bank transfers", "Банківські перекази без взаємоблокувань", {
      starter: PROGRAM_WITH(bankTypes(TODO), bankMain, "using System.Collections.Generic;\nusing System.Threading;"),
      solution: PROGRAM_WITH(bankTypes(bankSolution), bankMain, "using System.Collections.Generic;\nusing System.Threading;"),
      expectedOutput: "total: 2000000\nc: 400\ntransfers: 40400\noverdraft refused: True\n",
    }),
    practice("blocking-queue-practice", "A blocking queue with Monitor.Wait and Pulse", "Блокуюча черга на Monitor.Wait і Pulse", {
      starter: PROGRAM_WITH(queueTypes(`${TODO}@@${TODO}@@${TODO}`), queueMain, "using System.Collections.Generic;\nusing System.Threading;"),
      solution: PROGRAM_WITH(queueTypes(queueSolution), queueMain, "using System.Collections.Generic;\nusing System.Threading;"),
      expectedOutput: "consumed: 2000\ntotal: 2001000\nAdding is completed\n",
    }),
  ],
};
