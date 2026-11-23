import { PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const CUSTOM_MAIN = `        string[] lines = { "Ann;34", "Bob;abc", "Eve;200" };
        foreach (string line in lines)
        {
            try
            {
                Console.WriteLine("Loaded age " + LoadUser(line));
            }
            catch (LoadException e)
            {
                var cause = (ValidationException)e.InnerException;
                Console.WriteLine(e.Message + " -> " + cause.Field + " " + cause.Message);
            }
        }`;

const RETRY_TYPES = `// A failure that may go away if we try again
class TransientException : Exception
{
    public TransientException(int attempt) : base("Temporary failure on attempt " + attempt) { }
}

// A fake service: fails the first \`failures\` calls, then answers
class FlakyService
{
    private readonly int failures;
    private int calls;

    public FlakyService(int failures) { this.failures = failures; }

    public string Call()
    {
        calls++;
        Console.WriteLine("  call " + calls);
        if (calls <= failures)
        {
            throw new TransientException(calls);
        }
        return "ok after " + calls + " calls";
    }
}`;

const RETRY_MAIN = `        Console.WriteLine("Service A:");
        Console.WriteLine(Retry(new FlakyService(2).Call, 3));

        Console.WriteLine("Service B:");
        try
        {
            Retry(new FlakyService(5).Call, 3);
        }
        catch (TransientException e)
        {
            Console.WriteLine("gave up: " + e.Message);
        }

        Console.WriteLine("Service C:");
        try
        {
            Retry(() => { throw new InvalidOperationException("broken"); }, 3);
        }
        catch (InvalidOperationException e)
        {
            Console.WriteLine("not retried: " + e.Message);
        }`;

export const exceptionsAdvancedModule: ModuleDef = {
  slug: "exceptions-advanced",
  title: { en: "Exceptions in depth", uk: "Винятки поглиблено" },
  slides: [
    { kind: "lecture", slug: "exception-hierarchy", title: { en: "The exception hierarchy", uk: "Ієрархія винятків" } },
    { kind: "lecture", slug: "custom-exceptions", title: { en: "Custom exceptions", uk: "Власні винятки" } },
    {
      kind: "practice",
      slug: "custom-exception",
      title: { en: "Practice: Validation errors", uk: "Практика «Помилки валідації»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        `// The value of one field is wrong
class ValidationException : Exception
{
    public string Field { get; private set; }

    public ValidationException(string field, string message)
    {
        // Write your code here
    }
}

// A whole line cannot be loaded; keeps the cause
class LoadException : Exception
{
    public LoadException(string message, Exception inner)
    {
        // Write your code here
    }
}`,
        CUSTOM_MAIN,
        "",
        `    // The age from the text; throws ValidationException for a wrong value
    static int ParseAge(string text)
    {
        // Write your code here
        return 0;
    }

    // "name;age" -> age; wraps a ValidationException into a LoadException
    static int LoadUser(string line)
    {
        // Write your code here
        return 0;
    }`,
      ),
      solution: PROGRAM_WITH(
        `// The value of one field is wrong
class ValidationException : Exception
{
    public string Field { get; private set; }

    public ValidationException(string field, string message) : base(message)
    {
        Field = field;
    }
}

// A whole line cannot be loaded; keeps the cause
class LoadException : Exception
{
    public LoadException(string message, Exception inner) : base(message, inner)
    {
    }
}`,
        CUSTOM_MAIN,
        "",
        `    // The age from the text; throws ValidationException for a wrong value
    static int ParseAge(string text)
    {
        int age;
        if (!int.TryParse(text, out age))
        {
            throw new ValidationException("age", "is not a number");
        }
        if (age < 0 || age > 150)
        {
            throw new ValidationException("age", "must be between 0 and 150");
        }
        return age;
    }

    // "name;age" -> age; wraps a ValidationException into a LoadException
    static int LoadUser(string line)
    {
        string[] parts = line.Split(';');
        try
        {
            return ParseAge(parts[1]);
        }
        catch (ValidationException e)
        {
            throw new LoadException("Cannot load '" + line + "'", e);
        }
    }`,
      ),
      expectedOutput: "Loaded age 34\nCannot load 'Bob;abc' -> age is not a number\nCannot load 'Eve;200' -> age must be between 0 and 150\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "rethrow-and-wrap", title: { en: "Rethrowing and wrapping", uk: "Повторне кидання й обгортання" } },
    {
      kind: "quiz",
      slug: "exceptions-quiz",
      title: { en: "Throwing the right exception", uk: "Правильний виняток" },
      questions: [
        {
          id: "throw-vs-throw-ex",
          mode: "single",
          prompt: { en: "What is the difference between `throw;` and `throw ex;` inside a `catch (Exception ex)` block?", uk: "У чому різниця між `throw;` і `throw ex;` усередині блоку `catch (Exception ex)`?" },
          options: [
            { id: "a", text: { en: "`throw ex;` resets the stack trace to the current line; `throw;` keeps the original one", uk: "`throw ex;` скидає стек викликів до поточного рядка; `throw;` зберігає початковий" } },
            { id: "b", text: { en: "There is no difference", uk: "Різниці немає" } },
            { id: "c", text: { en: "`throw;` creates a new exception object", uk: "`throw;` створює новий об'єкт винятку" } },
            { id: "d", text: { en: "`throw ex;` does not compile", uk: "`throw ex;` не компілюється" } },
          ],
          correct: ["a"],
        },
        {
          id: "null-argument",
          mode: "single",
          prompt: { en: "A public method receives `null` for a parameter that must not be null. What should it throw?", uk: "Публічний метод отримав `null` у параметрі, що не може бути null. Що він має кинути?" },
          options: [
            { id: "a", text: { en: "`ArgumentNullException`", uk: "`ArgumentNullException`" } },
            { id: "b", text: { en: "`NullReferenceException`", uk: "`NullReferenceException`" } },
            { id: "c", text: { en: "`Exception`", uk: "`Exception`" } },
          ],
          correct: ["a"],
        },
        {
          id: "wrong-state",
          mode: "single",
          prompt: { en: "`Pop()` is called on an empty stack. Which exception fits best?", uk: "`Pop()` викликано для порожнього стека. Який виняток пасує найкраще?" },
          options: [
            { id: "a", text: { en: "`InvalidOperationException`: the object is in a state where the call makes no sense", uk: "`InvalidOperationException`: об'єкт у стані, в якому виклик не має сенсу" } },
            { id: "b", text: { en: "`ArgumentException`", uk: "`ArgumentException`" } },
            { id: "c", text: { en: "`IndexOutOfRangeException`", uk: "`IndexOutOfRangeException`" } },
          ],
          correct: ["a"],
        },
        {
          id: "never-throw",
          mode: "multi",
          prompt: { en: "Which exceptions should your code never throw itself?", uk: "Які винятки ваш код ніколи не має кидати сам?" },
          options: [
            { id: "a", text: { en: "`NullReferenceException`", uk: "`NullReferenceException`" } },
            { id: "b", text: { en: "`Exception`", uk: "`Exception`" } },
            { id: "c", text: { en: "`IndexOutOfRangeException`", uk: "`IndexOutOfRangeException`" } },
            { id: "d", text: { en: "`ArgumentOutOfRangeException`", uk: "`ArgumentOutOfRangeException`" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "inner-why",
          mode: "single",
          prompt: { en: "Why pass the original exception as `inner` when you wrap it?", uk: "Навіщо передавати початковий виняток як `inner`, коли ви його обгортаєте?" },
          options: [
            { id: "a", text: { en: "To keep the real cause and its stack trace; `ToString()` prints the whole chain", uk: "Щоб зберегти справжню причину та її стек викликів; `ToString()` друкує весь ланцюжок" } },
            { id: "b", text: { en: "It makes the exception faster", uk: "Так виняток стає швидшим" } },
            { id: "c", text: { en: "Without it the new exception cannot be thrown", uk: "Без нього новий виняток не можна кинути" } },
          ],
          correct: ["a"],
        },
        {
          id: "custom-when",
          mode: "single",
          prompt: { en: "When is a custom exception class worth creating?", uk: "Коли варто створювати власний клас винятку?" },
          options: [
            { id: "a", text: { en: "When callers will catch it separately or read extra data from it", uk: "Коли викликаючі перехоплюватимуть його окремо або читатимуть із нього додаткові дані" } },
            { id: "b", text: { en: "For every method that can fail", uk: "Для кожного методу, що може не вдатися" } },
            { id: "c", text: { en: "Never: only standard exceptions are allowed", uk: "Ніколи: дозволені лише стандартні винятки" } },
          ],
          correct: ["a"],
        },
      ],
    },
    { kind: "lecture", slug: "filters-and-finally", title: { en: "Filters and finally", uk: "Фільтри та finally" } },
    {
      kind: "practice",
      slug: "retry-filter",
      title: { en: "Practice: Retry", uk: "Практика «Повторні спроби»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        RETRY_TYPES,
        RETRY_MAIN,
        "",
        `    // Calls action; retries a TransientException until maxAttempts; prints a line after each attempt
    static string Retry(Func<string> action, int maxAttempts)
    {
        // Write your code here
        return action();
    }`,
      ),
      solution: PROGRAM_WITH(
        RETRY_TYPES,
        RETRY_MAIN,
        "",
        `    // Calls action; retries a TransientException until maxAttempts; prints a line after each attempt
    static string Retry(Func<string> action, int maxAttempts)
    {
        for (int attempt = 1; ; attempt++)
        {
            try
            {
                return action();
            }
            catch (TransientException) when (attempt < maxAttempts)
            {
                Console.WriteLine("  retrying");
            }
            finally
            {
                Console.WriteLine("  attempt " + attempt + " finished");
            }
        }
    }`,
      ),
      expectedOutput:
        "Service A:\n  call 1\n  retrying\n  attempt 1 finished\n  call 2\n  retrying\n  attempt 2 finished\n  call 3\n  attempt 3 finished\nok after 3 calls\n" +
        "Service B:\n  call 1\n  retrying\n  attempt 1 finished\n  call 2\n  retrying\n  attempt 2 finished\n  call 3\n  attempt 3 finished\ngave up: Temporary failure on attempt 3\n" +
        "Service C:\n  attempt 1 finished\nnot retried: broken\n",
      maxScore: 10,
    },
    { kind: "lecture", slug: "exceptions-design", title: { en: "Designing with exceptions", uk: "Проєктування з винятками" } },
    {
      kind: "quiz",
      slug: "exceptions-advanced-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "finally-return",
          mode: "single",
          prompt: {
            en: "`static int F() { int x = 1; try { return x; } finally { x = 2; } }` What does `F()` return?",
            uk: "`static int F() { int x = 1; try { return x; } finally { x = 2; } }` Що повертає `F()`?",
          },
          options: [
            { id: "a", text: { en: "1: the return value is saved before `finally` runs", uk: "1: значення для повернення збережено до виконання `finally`" } },
            { id: "b", text: { en: "2", uk: "2" } },
            { id: "c", text: { en: "It does not compile", uk: "Це не компілюється" } },
          ],
          correct: ["a"],
        },
        {
          id: "filter-false",
          mode: "single",
          prompt: { en: "What happens when the filter of `catch (IOException e) when (Check(e))` returns `false`?", uk: "Що відбувається, коли фільтр у `catch (IOException e) when (Check(e))` повертає `false`?" },
          options: [
            { id: "a", text: { en: "The exception continues as if this `catch` did not exist", uk: "Виняток іде далі так, ніби цього `catch` не було" } },
            { id: "b", text: { en: "The exception is swallowed", uk: "Виняток проковтнуто" } },
            { id: "c", text: { en: "The `catch` block runs anyway", uk: "Блок `catch` однаково виконується" } },
          ],
          correct: ["a"],
        },
        {
          id: "finally-skipped",
          mode: "multi",
          prompt: { en: "In which cases does a `finally` block NOT run?", uk: "У яких випадках блок `finally` НЕ виконується?" },
          options: [
            { id: "a", text: { en: "The process is ended by `Environment.FailFast`", uk: "Процес завершено через `Environment.FailFast`" } },
            { id: "b", text: { en: "A `StackOverflowException` happens", uk: "Стався `StackOverflowException`" } },
            { id: "c", text: { en: "The `try` block executes `return`", uk: "Блок `try` виконує `return`" } },
            { id: "d", text: { en: "The `try` block throws an exception that nobody catches in this method", uk: "Блок `try` кидає виняток, який у цьому методі ніхто не перехоплює" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "throw-in-finally",
          mode: "single",
          prompt: { en: "The `try` block throws exception A, and then `finally` throws exception B. What does the caller get?", uk: "Блок `try` кидає виняток A, а потім `finally` кидає виняток B. Що отримає викликаючий?" },
          options: [
            { id: "a", text: { en: "Only B: A is lost", uk: "Лише B: A втрачено" } },
            { id: "b", text: { en: "Only A", uk: "Лише A" } },
            { id: "c", text: { en: "An `AggregateException` with both", uk: "`AggregateException` з обома" } },
          ],
          correct: ["a"],
        },
        {
          id: "control-flow",
          mode: "single",
          prompt: { en: "Why should exceptions not be used for ordinary control flow, such as signalling \"not found\" in a hot loop?", uk: "Чому винятки не варто використовувати для звичайного керування потоком, як-от сигналу «не знайдено» в гарячому циклі?" },
          options: [
            { id: "a", text: { en: "Throwing is very expensive, and it hides the normal logic; use the Try pattern instead", uk: "Кидання винятку дуже дороге і ховає звичайну логіку; краще Try-патерн" } },
            { id: "b", text: { en: "Exceptions cannot be thrown inside loops", uk: "Винятки не можна кидати всередині циклів" } },
            { id: "c", text: { en: "Exceptions are always ignored in loops", uk: "У циклах винятки завжди ігноруються" } },
          ],
          correct: ["a"],
        },
        {
          id: "where-catch",
          mode: "single",
          prompt: { en: "Where should an exception that the code cannot handle be caught?", uk: "Де варто перехоплювати виняток, який код не вміє обробити?" },
          options: [
            { id: "a", text: { en: "At an application boundary (Main, a UI event handler, an HTTP middleware), where it is logged once", uk: "На межі застосунку (Main, обробник події UI, HTTP-middleware), де його один раз записують у лог" } },
            { id: "b", text: { en: "In every method, with an empty `catch`", uk: "У кожному методі, порожнім `catch`" } },
            { id: "c", text: { en: "Nowhere: the program should always crash", uk: "Ніде: програма завжди має падати" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
