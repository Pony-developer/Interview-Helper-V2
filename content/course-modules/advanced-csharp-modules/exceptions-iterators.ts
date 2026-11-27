import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

// ---------- Retry with exception filters ----------

const retryTypes = (body: string) => `class TransientException : Exception
{
    public TransientException(string message) : base(message) { }
}

static class Retry
{
    // Calls 'action' up to maxAttempts times. A TransientException means "try again":
    // print "attempt N failed: <message>" and retry, unless it was the last attempt,
    // in which case the exception must propagate. Any other exception propagates at once.
    public static T Run<T>(Func<int, T> action, int maxAttempts)
    {
${body}
    }
}`;

const retryMain = `        string result = Retry.Run(attempt =>
        {
            if (attempt < 3) throw new TransientException("timeout #" + attempt);
            return "ok on attempt " + attempt;
        }, 5);
        Console.WriteLine(result);

        try
        {
            Retry.Run<int>(attempt => { throw new TransientException("still down"); }, 2);
        }
        catch (TransientException e)
        {
            Console.WriteLine("gave up: " + e.Message);
        }

        try
        {
            Retry.Run<int>(attempt => { throw new InvalidOperationException("bad input"); }, 5);
        }
        catch (InvalidOperationException e)
        {
            Console.WriteLine("not retried: " + e.Message);
        }`;

const retrySolution = `        for (int attempt = 1; ; attempt++)
        {
            try
            {
                return action(attempt);
            }
            catch (TransientException e) when (attempt < maxAttempts)
            {
                Console.WriteLine("attempt " + attempt + " failed: " + e.Message);
            }
        }`;

// ---------- Iterators ----------

const iterTypes = (batch: string, primes: string) => `static class Seq
{
    // Splits a sequence into lists of 'size' items; the last batch may be shorter.
    // Throws ArgumentOutOfRangeException right away (not when enumerated) if size < 1.
    public static IEnumerable<List<T>> Batch<T>(IEnumerable<T> source, int size)
    {
${batch}
    }

    // An infinite sequence of prime numbers: 2, 3, 5, 7, 11, ...
    public static IEnumerable<int> Primes()
    {
${primes}
    }
}`;

const iterMain = `        foreach (var batch in Seq.Batch(new[] { 1, 2, 3, 4, 5, 6, 7 }, 3))
            Console.WriteLine(string.Join(",", batch));

        IEnumerable<List<int>> lazy = null;
        try
        {
            lazy = Seq.Batch(new[] { 1 }, 0);
            Console.WriteLine("created");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("rejected eagerly");
        }

        int count = 0;
        foreach (int p in Seq.Primes())
        {
            if (count++ == 10) break;
            Console.Write(p + " ");
        }
        Console.WriteLine();`;

const batchSolution = `        if (size < 1) throw new ArgumentOutOfRangeException("size");
        return BatchIterator(source, size);
    }

    private static IEnumerable<List<T>> BatchIterator<T>(IEnumerable<T> source, int size)
    {
        var current = new List<T>(size);
        foreach (var item in source)
        {
            current.Add(item);
            if (current.Count == size)
            {
                yield return current;
                current = new List<T>(size);
            }
        }
        if (current.Count > 0) yield return current;`;

const primesSolution = `        for (int n = 2; ; n++)
        {
            bool prime = true;
            for (int d = 2; d * d <= n; d++)
                if (n % d == 0) { prime = false; break; }
            if (prime) yield return n;
        }`;

export const exceptionsIteratorsModule: ModuleDef = {
  slug: "exceptions-iterators",
  title: { en: "Exceptions and iterators", uk: "Винятки та ітератори" },
  slides: [
    lecture("try-catch-finally", "try, catch, finally and exception filters", "try, catch, finally і фільтри винятків"),
    lecture("throwing-exceptions", "Throwing, rethrowing and designing exceptions", "Кидання, повторне кидання та проєктування винятків"),
    lecture("enumeration-deep", "Enumeration: IEnumerable and IEnumerator", "Перелічення: IEnumerable та IEnumerator"),
    lecture("iterators-yield", "Iterators and yield return", "Ітератори та yield return"),
    quiz("exceptions-iterators-quiz", "Exceptions and iterators", "Винятки та ітератори", [
      question(
        "throw-vs-throw-ex",
        ["Inside a `catch (Exception ex)` block, what is the difference between `throw;` and `throw ex;`?", "Чим у блоці `catch (Exception ex)` відрізняються `throw;` і `throw ex;`?"],
        [
          ["None", "Нічим"],
          ["`throw;` rethrows and keeps the original stack trace; `throw ex;` resets the stack trace to the current line", "`throw;` кидає повторно й зберігає початковий стек викликів; `throw ex;` скидає стек до поточного рядка"],
          ["`throw ex;` is required to rethrow", "`throw ex;` обов'язковий для повторного кидання"],
          ["`throw;` swallows the exception", "`throw;` ковтає виняток"],
        ],
        "b",
      ),
      question(
        "filter",
        ["What is special about an exception filter `catch (HttpRequestException e) when (e.StatusCode == 503)`?", "Що особливого у фільтрі винятків `catch (HttpRequestException e) when (e.StatusCode == 503)`?"],
        [
          ["The condition is evaluated before the stack unwinds; if it's false, the catch is skipped as if it weren't there", "Умова обчислюється до розкручування стеку; якщо вона хибна, catch пропускається, ніби його немає"],
          ["It runs after `finally`", "Він виконується після `finally`"],
          ["It catches only exceptions thrown on another thread", "Він ловить лише винятки з інших потоків"],
          ["It's only for logging", "Він лише для логування"],
        ],
        "a",
      ),
      question(
        "finally-return",
        ["Does a `finally` block run if the `try` block executes `return`?", "Чи виконується `finally`, якщо в блоці `try` виконано `return`?"],
        [
          ["No", "Ні"],
          ["Only in Debug builds", "Лише в Debug-збірках"],
          ["Yes; `finally` runs on return, break, continue and exceptions (but not if the process is killed or on a stack overflow)", "Так; `finally` виконується при return, break, continue та винятках (але не при вбитому процесі чи переповненні стеку)"],
          ["Only if there is a `catch` block", "Лише якщо є блок `catch`"],
        ],
        "c",
      ),
      question(
        "order",
        ["Why must `catch (Exception)` come after `catch (IOException)`?", "Чому `catch (Exception)` має стояти після `catch (IOException)`?"],
        [
          ["It doesn't matter", "Це не має значення"],
          ["Catch blocks run in parallel", "Блоки catch виконуються паралельно"],
          ["`IOException` is not an exception", "`IOException` — не виняток"],
          ["Catch blocks are tested in order, and the general one would catch everything first; the compiler reports an error", "Блоки catch перевіряються по черзі, і загальний перехопив би все першим; компілятор видає помилку"],
        ],
        "d",
      ),
      question(
        "tryparse",
        ["When should you prefer a `TryXxx` method (like `int.TryParse`) over catching an exception?", "Коли краще брати метод `TryXxx` (як `int.TryParse`), а не ловити виняток?"],
        [
          ["When failure is a normal, expected outcome, such as bad user input", "Коли невдача — нормальний очікуваний результат, як-от некоректне введення користувача"],
          ["Never", "Ніколи"],
          ["Only in async code", "Лише в асинхронному коді"],
          ["Only for numbers", "Лише для чисел"],
        ],
        "a",
      ),
      question(
        "deferred",
        ["An iterator method starts with `if (x == null) throw ...;` then uses `yield return`. When is the exception thrown?", "Метод-ітератор починається з `if (x == null) throw ...;`, а далі використовує `yield return`. Коли кидається виняток?"],
        [
          ["When the method is called", "Коли метод викликано"],
          ["On the first `MoveNext()`, i.e. when enumeration starts, because the whole body is deferred", "На першому `MoveNext()`, тобто коли починається перелічення, бо все тіло відкладене"],
          ["Never", "Ніколи"],
          ["At compile time", "Під час компіляції"],
        ],
        "b",
      ),
      question(
        "yield-try",
        ["Which are allowed in an iterator method?", "Що дозволено в методі-ітераторі?"],
        [
          ["`yield return` inside a `try` block that has a `finally`", "`yield return` у блоці `try`, що має `finally`"],
          ["`yield break` to end the sequence early", "`yield break`, щоб завершити послідовність достроково"],
          ["`yield return` inside a `catch` block", "`yield return` у блоці `catch`"],
          ["`ref` or `out` parameters", "Параметри `ref` або `out`"],
        ],
        ["a", "b"],
      ),
      question(
        "foreach-dispose",
        ["Why does `foreach` call `Dispose()` on the enumerator?", "Навіщо `foreach` викликає `Dispose()` на енумераторі?"],
        [
          ["To free the collection", "Щоб звільнити колекцію"],
          ["It doesn't", "Він цього не робить"],
          ["So that `finally` blocks inside an iterator run even if the loop exits early with `break`", "Щоб блоки `finally` в ітераторі виконалися, навіть якщо цикл завершився достроково через `break`"],
          ["To reset the enumerator", "Щоб скинути енумератор"],
        ],
        "c",
      ),
    ]),
    practice("retry-practice", "Retry with exception filters", "Повтор із фільтрами винятків", {
      starter: PROGRAM_WITH(retryTypes(TODO), retryMain),
      solution: PROGRAM_WITH(retryTypes(retrySolution), retryMain),
      expectedOutput:
        "attempt 1 failed: timeout #1\nattempt 2 failed: timeout #2\nok on attempt 3\nattempt 1 failed: still down\ngave up: still down\nnot retried: bad input\n",
    }),
    practice("iterators-practice", "Writing iterators", "Пишемо ітератори", {
      starter: PROGRAM_WITH(iterTypes(TODO, TODO), iterMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(iterTypes(batchSolution, primesSolution), iterMain, "using System.Collections.Generic;"),
      expectedOutput: "1,2,3\n4,5,6\n7\nrejected eagerly\n2 3 5 7 11 13 17 19 23 29 \n",
    }),
  ],
};
