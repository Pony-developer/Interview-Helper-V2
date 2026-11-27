import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const tcsTypes = (body: string) => `// A legacy callback-based API (think of an old SDK). It completes on another thread.
class LegacyGeocoder
{
    public void Lookup(string city, Action<double, double> onSuccess, Action<string> onError)
    {
        ThreadPool.QueueUserWorkItem(_ =>
        {
            Thread.Sleep(20);
            if (city == "Kyiv") onSuccess(50.45, 30.52);
            else if (city == "Lviv") onSuccess(49.84, 24.03);
            else onError("Unknown city: " + city);
        });
    }
}

class GeocodeException : Exception { public GeocodeException(string m) : base(m) { } }

static class GeocoderExtensions
{
    // Wraps the callback API in a Task: success sets the result, an error faults the task with GeocodeException.
    public static Task<Tuple<double, double>> LookupAsync(this LegacyGeocoder geocoder, string city)
    {
${body}
    }
}`;

const tcsSolution = `        var tcs = new TaskCompletionSource<Tuple<double, double>>(TaskCreationOptions.RunContinuationsAsynchronously);
        geocoder.Lookup(city,
            (lat, lon) => tcs.TrySetResult(Tuple.Create(lat, lon)),
            error => tcs.TrySetException(new GeocodeException(error)));
        return tcs.Task;`;

const tcsMain = `        var geo = new LegacyGeocoder();
        var kyiv = geo.LookupAsync("Kyiv").Result;
        Console.WriteLine("Kyiv: " + kyiv.Item1 + ", " + kyiv.Item2);

        Task<Tuple<double, double>>[] both = { geo.LookupAsync("Lviv"), geo.LookupAsync("Atlantis") };
        try { Task.WaitAll(both); }
        catch (AggregateException e)
        {
            foreach (var inner in e.InnerExceptions) Console.WriteLine(inner.GetType().Name + ": " + inner.Message);
        }
        Console.WriteLine("Lviv: " + both[0].Status + " " + both[0].Result.Item1);
        Console.WriteLine("Atlantis: " + both[1].Status);

        var cont = geo.LookupAsync("Kyiv").ContinueWith(t => "lat " + t.Result.Item1);
        Console.WriteLine(cont.Result);`;

const throttleTypes = (body: string) => `static class Throttle
{
    // Runs 'work' for every item with at most 'maxParallel' running at once.
    // Returns the results in the SAME order as the input items.
    public static async Task<TResult[]> ForEachAsync<T, TResult>(IList<T> items, int maxParallel, Func<T, Task<TResult>> work)
    {
${body}
    }
}`;

const throttleSolution = `        var gate = new SemaphoreSlim(maxParallel);
        var tasks = new Task<TResult>[items.Count];
        for (int i = 0; i < items.Count; i++)
        {
            T item = items[i];
            tasks[i] = RunOne(item, gate, work);
        }
        return await Task.WhenAll(tasks);
    }

    private static async Task<TResult> RunOne<T, TResult>(T item, SemaphoreSlim gate, Func<T, Task<TResult>> work)
    {
        await gate.WaitAsync();
        try { return await work(item); }
        finally { gate.Release(); }`;

const throttleMain = `        int running = 0, maxSeen = 0;
        var gateLock = new object();
        var ids = new List<int> { 5, 3, 8, 1, 9, 2, 7 };
        int[] squares = Throttle.ForEachAsync(ids, 3, async id =>
        {
            lock (gateLock) { running++; if (running > maxSeen) maxSeen = running; }
            await Task.Delay(30 + id * 5);
            lock (gateLock) running--;
            return id * id;
        }).Result;
        Console.WriteLine(string.Join(",", squares));
        Console.WriteLine("max parallel <= 3: " + (maxSeen <= 3));
        Console.WriteLine("ran in parallel: " + (maxSeen > 1));
        var empty = Throttle.ForEachAsync(new List<int>(), 2, x => Task.FromResult(x)).Result;
        Console.WriteLine("empty: " + empty.Length);`;

export const threadingTasksModule: ModuleDef = {
  slug: "threading-tasks",
  title: { en: "Threads and tasks", uk: "Потоки та задачі" },
  slides: [
    lecture("threads-basics", "Threads: creation, join, shared state", "Потоки: створення, join, спільний стан"),
    lecture("thread-pool", "The thread pool", "Пул потоків"),
    lecture("tasks-deep", "Tasks: results, exceptions and continuations", "Задачі: результати, винятки та продовження"),
    lecture("task-completion-source", "TaskCompletionSource and Task.Delay", "TaskCompletionSource і Task.Delay"),
    quiz("threading-tasks-quiz", "Threads and tasks", "Потоки та задачі", [
      question(
        "background",
        ["What happens to a background thread (`IsBackground = true`) when all foreground threads finish?", "Що відбувається з фоновим потоком (`IsBackground = true`), коли всі основні потоки завершилися?"],
        [
          ["The process waits for it", "Процес його чекає"],
          ["It is terminated abruptly with the process, without running its finally blocks", "Він різко припиняється разом із процесом, без виконання своїх блоків finally"],
          ["It becomes a foreground thread", "Він стає основним потоком"],
          ["It throws ThreadAbortException", "Він кидає ThreadAbortException"],
        ],
        "b",
      ),
      question(
        "unhandled-thread",
        ["An exception is thrown and not caught inside a `new Thread(...)` body. What happens?", "У тілі `new Thread(...)` кинуто виняток і його не перехоплено. Що станеться?"],
        [
          ["It's rethrown in the thread that called Start", "Він повторно кидається в потоці, що викликав Start"],
          ["It's silently ignored", "Його мовчки ігнорують"],
          ["The whole process crashes", "Увесь процес аварійно завершується"],
          ["Only that thread stops; nothing else happens", "Зупиняється лише цей потік; більше нічого"],
        ],
        "c",
      ),
      question(
        "task-exception",
        ["How does an exception thrown inside `Task.Run` reach the caller?", "Як виняток, кинутий усередині `Task.Run`, доходить до викликача?"],
        [
          ["It's stored in the task; `await` rethrows it directly, `.Wait()`/`.Result` wrap it in an AggregateException", "Він зберігається в задачі; `await` кидає його напряму, `.Wait()`/`.Result` обгортають в AggregateException"],
          ["It crashes the process immediately", "Він одразу обвалює процес"],
          ["It's printed to the console and lost", "Він друкується в консоль і губиться"],
          ["It's thrown on the thread pool thread and can't be observed", "Він кидається в потоці пулу і його неможливо спостерігати"],
        ],
        "a",
      ),
      question(
        "thread-pool",
        ["Why is running a long blocking operation on thread-pool threads a problem?", "Чому виконувати довгу блокуючу операцію в потоках пулу — проблема?"],
        [
          ["Pool threads have less memory", "Потоки пулу мають менше пам'яті"],
          ["Pool threads can't do I/O", "Потоки пулу не можуть виконувати I/O"],
          ["It's not a problem", "Це не проблема"],
          ["It ties up pool threads; the pool injects new threads slowly, so other work queues up (thread-pool starvation)", "Вона займає потоки пулу; пул додає нові потоки повільно, тож інша робота стає в чергу (голодування пулу)"],
        ],
        "d",
      ),
      question(
        "tcs",
        ["What is `TaskCompletionSource<T>` for?", "Для чого `TaskCompletionSource<T>`?"],
        [
          ["Creating a task that runs code on a new thread", "Створити задачу, що виконує код у новому потоці"],
          ["Creating a task you complete manually (SetResult/SetException/SetCanceled), e.g. to wrap callback- or event-based APIs", "Створити задачу, яку ви завершуєте вручну (SetResult/SetException/SetCanceled), наприклад, щоб обгорнути API на колбеках чи подіях"],
          ["Cancelling running tasks", "Скасувати задачі, що виконуються"],
          ["Measuring task duration", "Виміряти тривалість задачі"],
        ],
        "b",
      ),
      question(
        "delay",
        ["How does `await Task.Delay(1000)` differ from `Thread.Sleep(1000)`?", "Чим `await Task.Delay(1000)` відрізняється від `Thread.Sleep(1000)`?"],
        [
          ["No difference", "Нічим"],
          ["Task.Delay is less precise", "Task.Delay менш точний"],
          ["Task.Delay uses a timer and frees the thread while waiting; Thread.Sleep blocks the thread", "Task.Delay використовує таймер і звільняє потік на час очікування; Thread.Sleep блокує потік"],
          ["Thread.Sleep can be cancelled", "Thread.Sleep можна скасувати"],
        ],
        "c",
      ),
      question(
        "longrunning",
        ["When is `TaskCreationOptions.LongRunning` appropriate?", "Коли доречний `TaskCreationOptions.LongRunning`?"],
        [
          ["For a task that blocks for a long time (e.g. a dedicated loop reading a blocking queue): it gets its own thread instead of a pool thread", "Для задачі, що довго блокується (наприклад, окремий цикл читання блокуючої черги): вона отримує власний потік замість потоку пулу"],
          ["For any async I/O", "Для будь-якого асинхронного I/O"],
          ["To make a task run faster", "Щоб задача виконувалася швидше"],
          ["For tasks that return large results", "Для задач, що повертають великі результати"],
        ],
        "a",
      ),
      question(
        "local-shared",
        ["Two threads run the same method that uses a local variable `int count = 0;`. Do they share it?", "Два потоки виконують той самий метод з локальною змінною `int count = 0;`. Чи ділять вони її?"],
        [
          ["Yes, local variables are shared", "Так, локальні змінні спільні"],
          ["Only if the method is static", "Лише якщо метод статичний"],
          ["No: each thread has its own stack, so each call gets its own local (unless a lambda captures it)", "Ні: кожен потік має власний стек, тож кожен виклик має власну локальну змінну (якщо її не захопила лямбда)"],
          ["Only on multi-core machines", "Лише на багатоядерних машинах"],
        ],
        "c",
      ),
    ]),
    practice("tcs-practice", "Wrap a callback API in a Task", "Обгорніть API на колбеках у Task", {
      starter: PROGRAM_WITH(tcsTypes(TODO), tcsMain, "using System.Threading;\nusing System.Threading.Tasks;"),
      solution: PROGRAM_WITH(tcsTypes(tcsSolution), tcsMain, "using System.Threading;\nusing System.Threading.Tasks;"),
      expectedOutput:
        "Kyiv: 50.45, 30.52\nGeocodeException: Unknown city: Atlantis\nLviv: RanToCompletion 49.84\nAtlantis: Faulted\nlat 50.45\n",
    }),
    practice("throttle-practice", "Limit parallelism with SemaphoreSlim", "Обмеження паралелізму через SemaphoreSlim", {
      starter: PROGRAM_WITH(throttleTypes(TODO), throttleMain, "using System.Collections.Generic;\nusing System.Threading;\nusing System.Threading.Tasks;"),
      solution: PROGRAM_WITH(throttleTypes(throttleSolution), throttleMain, "using System.Collections.Generic;\nusing System.Threading;\nusing System.Threading.Tasks;"),
      expectedOutput: "25,9,64,1,81,4,49\nmax parallel <= 3: True\nran in parallel: True\nempty: 0\n",
    }),
  ],
};
