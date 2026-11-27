import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const importTypes = (body: string) => `// Reports progress synchronously on the calling thread (so console output stays ordered).
class SyncProgress<T> : IProgress<T>
{
    private readonly Action<T> _report;
    public SyncProgress(Action<T> report) { _report = report; }
    public void Report(T value) { _report(value); }
}

static class Importer
{
    // Imports every file in order by awaiting 'importOne'. After each file it reports the percentage done
    // (completed * 100 / total). Before starting each file it checks the token and stops with
    // OperationCanceledException if cancellation was requested. Returns the number of rows imported.
    public static async Task<int> ImportAllAsync(IList<string> files, Func<string, CancellationToken, Task<int>> importOne,
        IProgress<int> progress, CancellationToken token)
    {
${body}
    }
}`;

const importSolution = `        int rows = 0;
        for (int i = 0; i < files.Count; i++)
        {
            token.ThrowIfCancellationRequested();
            rows += await importOne(files[i], token);
            if (progress != null) progress.Report((i + 1) * 100 / files.Count);
        }
        return rows;`;

const importMain = `        var files = new List<string> { "a.csv", "b.csv", "c.csv", "d.csv" };
        Func<string, CancellationToken, Task<int>> fake = async (f, ct) => { await Task.Delay(10, ct); return f.Length * 10; };
        var progress = new SyncProgress<int>(p => Console.WriteLine("progress " + p + "%"));

        int rows = Importer.ImportAllAsync(files, fake, progress, CancellationToken.None).Result;
        Console.WriteLine("rows " + rows);

        var cts = new CancellationTokenSource();
        var cancelAfterTwo = new SyncProgress<int>(p => { Console.WriteLine("progress " + p + "%"); if (p >= 50) cts.Cancel(); });
        try
        {
            Importer.ImportAllAsync(files, fake, cancelAfterTwo, cts.Token).GetAwaiter().GetResult();
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("import cancelled");
        }`;

const combTypes = (body: string) => `static class TaskEx
{
    // Completes with the task's result, or throws TimeoutException if it takes longer than 'ms'.
    public static async Task<T> WithTimeout<T>(Task<T> task, int ms)
    {
${body.split("@@")[0]}
    }

    // Starts all sources at once and returns the result of the first one that SUCCEEDS.
    // Failed tasks are ignored; if all of them fail, throws AggregateException with every error.
    public static async Task<T> FirstSuccessful<T>(params Func<Task<T>>[] sources)
    {
${body.split("@@")[1]}
    }
}`;

const combSolution = `        Task finished = await Task.WhenAny(task, Task.Delay(ms));
        if (finished != task) throw new TimeoutException("Timed out after " + ms + " ms");
        return await task;@@        var pending = new List<Task<T>>();
        foreach (var source in sources) pending.Add(source());
        var errors = new List<Exception>();
        while (pending.Count > 0)
        {
            Task<T> done = await Task.WhenAny(pending);
            pending.Remove(done);
            if (done.Status == TaskStatus.RanToCompletion) return done.Result;
            errors.Add(done.Exception.InnerException);
        }
        throw new AggregateException(errors);`;

const combMain = `        Func<int, string, Task<string>> after = async (ms, value) => { await Task.Delay(ms); return value; };
        Func<int, string, Task<string>> failAfter = async (ms, msg) => { await Task.Delay(ms); throw new InvalidOperationException(msg); };

        Console.WriteLine(TaskEx.WithTimeout(after(20, "fast"), 1000).Result);
        try { TaskEx.WithTimeout(after(1000, "slow"), 50).GetAwaiter().GetResult(); }
        catch (TimeoutException e) { Console.WriteLine(e.Message); }

        Console.WriteLine(TaskEx.FirstSuccessful(
            () => failAfter(10, "mirror 1 down"),
            () => after(200, "mirror 2"),
            () => after(60, "mirror 3")).Result);

        try
        {
            TaskEx.FirstSuccessful(() => failAfter(10, "x"), () => failAfter(30, "y")).GetAwaiter().GetResult();
        }
        catch (AggregateException e)
        {
            Console.WriteLine("all failed: " + e.InnerExceptions.Count);
        }`;

export const asyncAwaitModule: ModuleDef = {
  slug: "async-await",
  title: { en: "Asynchronous programming", uk: "Асинхронне програмування" },
  slides: [
    lecture("async-principles", "Principles of asynchrony", "Принципи асинхронності"),
    lecture("async-functions", "Asynchronous functions in C#", "Асинхронні функції в C#"),
    lecture("cancellation-progress", "Cancellation, progress and timeouts", "Скасування, прогрес і тайм-аути"),
    lecture("async-combinators-pitfalls", "Combinators, ValueTask, async streams and pitfalls", "Комбінатори, ValueTask, асинхронні потоки та пастки"),
    lecture("obsolete-async-patterns", "Obsolete patterns: APM, EAP and BackgroundWorker", "Застарілі патерни: APM, EAP і BackgroundWorker"),
    quiz("async-await-quiz", "Asynchronous programming", "Асинхронне програмування", [
      question(
        "io-cpu",
        ["What is the main benefit of async I/O on a web server?", "Яка головна перевага асинхронного I/O на веб-сервері?"],
        [
          ["Each request runs faster", "Кожен запит виконується швидше"],
          ["Threads aren't blocked while waiting for I/O, so a few threads can serve many concurrent requests", "Потоки не блокуються під час очікування I/O, тож кілька потоків можуть обслуговувати багато одночасних запитів"],
          ["It uses more CPU cores", "Він використовує більше ядер процесора"],
          ["It removes the need for a database", "Він прибирає потребу в базі даних"],
        ],
        "b",
      ),
      question(
        "await-returns",
        ["When an `async` method hits `await` on a task that hasn't completed, what happens?", "Що відбувається, коли `async`-метод доходить до `await` на незавершеній задачі?"],
        [
          ["It returns to its caller (with an incomplete task) and resumes later when the awaited task completes", "Він повертається до викликача (з незавершеною задачею) і продовжить пізніше, коли очікувана задача завершиться"],
          ["It blocks the thread until the task completes", "Він блокує потік, доки задача не завершиться"],
          ["It starts a new thread", "Він запускає новий потік"],
          ["It throws", "Він кидає виняток"],
        ],
        "a",
      ),
      question(
        "async-void",
        ["Why should `async void` be avoided except for event handlers?", "Чому `async void` слід уникати, крім обробників подій?"],
        [
          ["It's slower", "Він повільніший"],
          ["It can't contain await", "Він не може містити await"],
          ["Callers can't await it or catch its exceptions; an exception goes to the synchronization context and can crash the process", "Викликачі не можуть його очікувати чи ловити його винятки; виняток іде в контекст синхронізації й може обвалити процес"],
          ["It always runs synchronously", "Він завжди виконується синхронно"],
        ],
        "c",
      ),
      question(
        "configureawait",
        ["What does `ConfigureAwait(false)` do?", "Що робить `ConfigureAwait(false)`?"],
        [
          ["Disables the await", "Вимикає await"],
          ["Makes the task run synchronously", "Змушує задачу виконуватися синхронно"],
          ["Cancels the task", "Скасовує задачу"],
          ["Doesn't capture the synchronization context: the continuation may run on any pool thread (useful in library code)", "Не захоплює контекст синхронізації: продовження може виконатися в будь-якому потоці пулу (корисно в бібліотечному коді)"],
        ],
        "d",
      ),
      question(
        "deadlock",
        ["Why can `GetDataAsync().Result` deadlock in a WPF button handler?", "Чому `GetDataAsync().Result` може спричинити взаємоблокування в обробнику кнопки WPF?"],
        [
          ["The UI thread blocks waiting for the task, while the task's continuation waits to run on that same UI thread", "Потік UI блокується в очікуванні задачі, а продовження задачі чекає на виконання в тому самому потоці UI"],
          ["WPF doesn't support tasks", "WPF не підтримує задачі"],
          ["`.Result` is not allowed on UI threads", "`.Result` заборонено в потоках UI"],
          ["Because of the garbage collector", "Через збирач сміття"],
        ],
        "a",
      ),
      question(
        "cancellation",
        ["How does cancellation work in .NET's async APIs?", "Як працює скасування в асинхронних API .NET?"],
        [
          ["The runtime aborts the thread", "Рантайм перериває потік"],
          ["Cooperatively: a CancellationToken is passed down; code checks it or passes it on, and throws OperationCanceledException when cancellation is requested", "Кооперативно: CancellationToken передається вниз; код перевіряє його чи передає далі й кидає OperationCanceledException, коли просять скасування"],
          ["By disposing the task", "Звільненням задачі"],
          ["Tasks can't be cancelled", "Задачі не можна скасувати"],
        ],
        "b",
      ),
      question(
        "whenall-sequential",
        ["Three independent HTTP calls are awaited one after another. How do you make them run concurrently?", "Три незалежні HTTP-виклики очікуються один за одним. Як змусити їх виконуватися одночасно?"],
        [
          ["Wrap each in Task.Run", "Обгорнути кожен у Task.Run"],
          ["Use Parallel.For", "Використати Parallel.For"],
          ["Start all three tasks first, then `await Task.WhenAll(t1, t2, t3)`", "Спершу запустити всі три задачі, потім `await Task.WhenAll(t1, t2, t3)`"],
          ["Add ConfigureAwait(false)", "Додати ConfigureAwait(false)"],
        ],
        "c",
      ),
      question(
        "valuetask",
        ["Which are true about `ValueTask<T>`?", "Що правда про `ValueTask<T>`?"],
        [
          ["It avoids allocating a Task when the result is often available synchronously (e.g. from a cache)", "Він уникає алокації Task, коли результат часто доступний синхронно (наприклад, з кешу)"],
          ["It should be awaited only once", "Його слід очікувати лише раз"],
          ["It should replace Task everywhere", "Він має замінити Task скрізь"],
          ["Convert it with `.AsTask()` if you need to await it several times or use combinators", "Перетворіть його через `.AsTask()`, якщо треба очікувати кілька разів чи використовувати комбінатори"],
        ],
        ["a", "b", "d"],
      ),
    ]),
    practice("cancellation-progress-practice", "Cancellation and progress", "Скасування та прогрес", {
      starter: PROGRAM_WITH(importTypes(TODO), importMain, "using System.Collections.Generic;\nusing System.Threading;\nusing System.Threading.Tasks;"),
      solution: PROGRAM_WITH(importTypes(importSolution), importMain, "using System.Collections.Generic;\nusing System.Threading;\nusing System.Threading.Tasks;"),
      expectedOutput:
        "progress 25%\nprogress 50%\nprogress 75%\nprogress 100%\nrows 200\nprogress 25%\nprogress 50%\nimport cancelled\n",
    }),
    practice("task-combinators-practice", "Timeouts and first-success with WhenAny", "Тайм-аути та «перший успішний» через WhenAny", {
      starter: PROGRAM_WITH(combTypes(`${TODO}@@${TODO}`), combMain, "using System.Collections.Generic;\nusing System.Threading.Tasks;"),
      solution: PROGRAM_WITH(combTypes(combSolution), combMain, "using System.Collections.Generic;\nusing System.Threading.Tasks;"),
      expectedOutput: "fast\nTimed out after 50 ms\nmirror 3\nall failed: 2\n",
    }),
  ],
};
