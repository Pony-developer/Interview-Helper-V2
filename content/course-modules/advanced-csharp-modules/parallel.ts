import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const primesTypes = (body: string) => `static class Primes
{
    public static bool IsPrime(int n)
    {
        if (n < 2) return false;
        for (int d = 2; (long)d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }

    // Counts primes in [from, to) with Parallel.For using THREAD-LOCAL subtotals
    // (localInit / body / localFinally), adding each subtotal to the result with Interlocked.
    public static long CountParallel(int from, int to)
    {
${body.split("@@")[0]}
    }

    // Returns the first 'count' primes >= 'start' IN ORDER, computed with PLINQ (AsParallel + AsOrdered).
    public static List<int> FirstPrimes(int start, int count)
    {
${body.split("@@")[1]}
    }
}`;

const primesSolution = `        long total = 0;
        Parallel.For(from, to,
            () => 0L,
            (i, state, local) => IsPrime(i) ? local + 1 : local,
            local => Interlocked.Add(ref total, local));
        return total;@@        return Enumerable.Range(start, int.MaxValue - start)
            .AsParallel()
            .AsOrdered()
            .Where(IsPrime)
            .Take(count)
            .ToList();`;

const primesMain = `        long sequential = Enumerable.Range(1, 200000).Count(Primes.IsPrime);
        long parallel = Primes.CountParallel(1, 200001);
        Console.WriteLine("primes up to 200000: " + parallel + " (sequential " + sequential + ")");
        Console.WriteLine(string.Join(", ", Primes.FirstPrimes(1000000, 5)));`;

const wordTypes = (body: string) => `static class WordCount
{
    // Counts words (lower-cased, split on non-letters) across all documents IN PARALLEL,
    // using a ConcurrentDictionary and AddOrUpdate. Returns the top N as "word=count",
    // ordered by count descending, then by word.
    public static List<string> Top(IList<string> documents, int n)
    {
${body}
    }
}`;

const wordSolution = `        var counts = new ConcurrentDictionary<string, int>();
        Parallel.ForEach(documents, doc =>
        {
            var word = new StringBuilder();
            foreach (char ch in doc + " ")
            {
                if (char.IsLetter(ch)) { word.Append(char.ToLowerInvariant(ch)); continue; }
                if (word.Length == 0) continue;
                counts.AddOrUpdate(word.ToString(), 1, (_, c) => c + 1);
                word.Clear();
            }
        });
        return counts
            .OrderByDescending(kv => kv.Value)
            .ThenBy(kv => kv.Key, StringComparer.Ordinal)
            .Take(n)
            .Select(kv => kv.Key + "=" + kv.Value)
            .ToList();`;

const wordMain = `        var docs = new List<string>();
        for (int i = 0; i < 400; i++)
        {
            docs.Add("The quick brown fox jumps over the lazy dog.");
            docs.Add("A lazy afternoon: the dog sleeps, the fox waits!");
            if (i % 4 == 0) docs.Add("Quick, quick: QUICK thinking.");
        }
        foreach (var line in WordCount.Top(docs, 5)) Console.WriteLine(line);`;

export const parallelModule: ModuleDef = {
  slug: "parallel",
  title: { en: "Parallel programming", uk: "Паралельне програмування" },
  slides: [
    lecture("pfx-plinq", "Why PFX, and PLINQ", "Навіщо PFX, і PLINQ"),
    lecture("parallel-class", "The Parallel class", "Клас Parallel"),
    lecture("task-parallelism", "Task parallelism and AggregateException", "Паралелізм задач і AggregateException"),
    lecture("concurrent-collections", "Concurrent collections, BlockingCollection and channels", "Конкурентні колекції, BlockingCollection і канали"),
    quiz("parallel-quiz", "Parallel programming", "Паралельне програмування", [
      question(
        "when-parallel",
        ["When does data parallelism (Parallel.For, PLINQ) pay off?", "Коли паралелізм даних (Parallel.For, PLINQ) окупається?"],
        [
          ["For CPU-bound work that can be split into independent pieces, each big enough to outweigh the coordination overhead", "Для роботи, обмеженої CPU, яку можна поділити на незалежні шматки, кожен достатньо великий, щоб переважити накладні витрати на координацію"],
          ["For waiting on HTTP calls", "Для очікування HTTP-викликів"],
          ["For tiny loops with a few items", "Для крихітних циклів із кількома елементами"],
          ["Always", "Завжди"],
        ],
        "a",
      ),
      question(
        "plinq-order",
        ["Does `list.AsParallel().Select(f)` keep the original order?", "Чи зберігає `list.AsParallel().Select(f)` початковий порядок?"],
        [
          ["Yes, always", "Так, завжди"],
          ["Only for arrays", "Лише для масивів"],
          ["No; add `.AsOrdered()` if you need it (at some cost)", "Ні; додайте `.AsOrdered()`, якщо потрібно (за певну ціну)"],
          ["Order doesn't exist in LINQ", "У LINQ порядку не існує"],
        ],
        "c",
      ),
      question(
        "shared-state",
        ["Inside `Parallel.For(0, n, i => total += Compute(i));` what is wrong?", "Що не так у `Parallel.For(0, n, i => total += Compute(i));`?"],
        [
          ["Nothing", "Нічого"],
          ["`total += ...` from many threads is a race; use thread-local subtotals (localInit/localFinally) or Interlocked", "`total += ...` з багатьох потоків — гонка; використайте локальні для потоку проміжні суми (localInit/localFinally) або Interlocked"],
          ["Parallel.For can't return values", "Parallel.For не може повертати значення"],
          ["`i` is shared", "`i` спільна"],
        ],
        "b",
      ),
      question(
        "break-stop",
        ["What is the difference between `ParallelLoopState.Break()` and `Stop()`?", "Чим відрізняються `ParallelLoopState.Break()` і `Stop()`?"],
        [
          ["None", "Нічим"],
          ["Stop is faster", "Stop швидший"],
          ["Break throws an exception", "Break кидає виняток"],
          ["Break still completes all iterations before the current index (like a sequential break); Stop ends as soon as possible", "Break усе одно завершує всі ітерації до поточного індексу (як послідовний break); Stop завершує якнайшвидше"],
        ],
        "d",
      ),
      question(
        "aggregate",
        ["Two tasks in `Parallel.Invoke` throw. What does the caller get?", "Дві задачі в `Parallel.Invoke` кидають винятки. Що отримує викликач?"],
        [
          ["Only the first exception", "Лише перший виняток"],
          ["An AggregateException containing both; use `Flatten()` and `Handle()` to process them", "AggregateException, що містить обидва; обробляйте їх через `Flatten()` і `Handle()`"],
          ["Nothing, exceptions are swallowed", "Нічого, винятки ковтаються"],
          ["The process crashes", "Процес аварійно завершується"],
        ],
        "b",
      ),
      question(
        "concurrent-dict",
        ["Which are true about `ConcurrentDictionary`?", "Що правда про `ConcurrentDictionary`?"],
        [
          ["`AddOrUpdate` and `GetOrAdd` are atomic compound operations", "`AddOrUpdate` і `GetOrAdd` — атомарні складені операції"],
          ["The value factory passed to `GetOrAdd` may run more than once for the same key under contention", "Фабрика значення, передана в `GetOrAdd`, під конкуренцією може виконатися кілька разів для того самого ключа"],
          ["Reads don't take locks", "Читання не беруть блокувань"],
          ["It keeps keys sorted", "Він тримає ключі відсортованими"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "blocking-collection",
        ["What does `BlockingCollection<T>` add on top of `ConcurrentQueue<T>`?", "Що `BlockingCollection<T>` додає поверх `ConcurrentQueue<T>`?"],
        [
          ["Sorting", "Сортування"],
          ["Async methods", "Асинхронні методи"],
          ["Blocking Take when empty, an optional bounded capacity that blocks Add, and CompleteAdding/GetConsumingEnumerable", "Блокуючий Take, коли порожньо, необов'язкову обмежену місткість, що блокує Add, і CompleteAdding/GetConsumingEnumerable"],
          ["Persistence to disk", "Збереження на диск"],
        ],
        "c",
      ),
      question(
        "channels",
        ["Why are `System.Threading.Channels` preferred over BlockingCollection in async code?", "Чому в асинхронному коді `System.Threading.Channels` кращі за BlockingCollection?"],
        [
          ["They're faster at sorting", "Вони швидше сортують"],
          ["Producers and consumers `await` (WriteAsync/ReadAllAsync) instead of blocking threads", "Виробники й споживачі використовують `await` (WriteAsync/ReadAllAsync) замість блокування потоків"],
          ["They work across processes", "Вони працюють між процесами"],
          ["They don't need disposal", "Їх не треба звільняти"],
        ],
        "b",
      ),
    ]),
    practice("parallel-primes-practice", "Parallel.For with thread-local state and PLINQ", "Parallel.For з локальним станом потоку та PLINQ", {
      starter: PROGRAM_WITH(primesTypes(`${TODO}@@${TODO}`), primesMain, "using System.Collections.Generic;\nusing System.Linq;\nusing System.Threading;\nusing System.Threading.Tasks;"),
      solution: PROGRAM_WITH(primesTypes(primesSolution), primesMain, "using System.Collections.Generic;\nusing System.Linq;\nusing System.Threading;\nusing System.Threading.Tasks;"),
      expectedOutput: "primes up to 200000: 17984 (sequential 17984)\n1000003, 1000033, 1000037, 1000039, 1000081\n",
    }),
    practice("parallel-word-count-practice", "Parallel word count with ConcurrentDictionary", "Паралельний підрахунок слів через ConcurrentDictionary", {
      starter: PROGRAM_WITH(wordTypes(TODO), wordMain, "using System.Collections.Concurrent;\nusing System.Collections.Generic;\nusing System.Linq;\nusing System.Text;\nusing System.Threading.Tasks;"),
      solution: PROGRAM_WITH(wordTypes(wordSolution), wordMain, "using System.Collections.Concurrent;\nusing System.Collections.Generic;\nusing System.Linq;\nusing System.Text;\nusing System.Threading.Tasks;"),
      expectedOutput: "the=1600\ndog=800\nfox=800\nlazy=800\nquick=700\n",
    }),
  ],
};
