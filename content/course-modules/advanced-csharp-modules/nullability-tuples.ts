import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const extTypes = (truncate: string, minMax: string, average: string) => `static class TextExtensions
{
    // Cuts the text to maxLength characters, ending with "..." when it was cut.
    // null stays null; maxLength < 3 throws ArgumentOutOfRangeException.
    public static string Truncate(this string text, int maxLength)
    {
${truncate}
    }
}

static class NumberExtensions
{
    // Smallest and largest value in one pass. Throws InvalidOperationException for an empty list.
    public static (int Min, int Max) MinMax(this IEnumerable<int> values)
    {
${minMax}
    }

    // Average of the values that are not null; null when there are none.
    public static double? AverageOrNull(this IEnumerable<int?> values)
    {
${average}
    }
}`;

const extMain = `        Console.WriteLine("Hello, extension methods".Truncate(12));
        Console.WriteLine("short".Truncate(10));
        string nothing = null;
        Console.WriteLine(nothing.Truncate(5) ?? "(null)");

        var (min, max) = new[] { 4, -2, 9, 0 }.MinMax();
        Console.WriteLine("min=" + min + " max=" + max);
        var range = new List<int> { 7 }.MinMax();
        Console.WriteLine(range.Min + ".." + range.Max + " " + range);

        try { new int[0].MinMax(); }
        catch (InvalidOperationException e) { Console.WriteLine(e.Message); }

        Console.WriteLine(new int?[] { 3, null, 5 }.AverageOrNull());
        double? none = new int?[] { null, null }.AverageOrNull();
        Console.WriteLine(none.HasValue ? none.Value.ToString() : "no data");
        Console.WriteLine((none ?? -1).ToString());`;

const stub = "        throw new NotImplementedException();";

export const nullabilityTuplesModule: ModuleDef = {
  slug: "nullability-tuples",
  title: { en: "Nullability, extension methods and tuples", uk: "Nullable, методи розширення та кортежі" },
  slides: [
    lecture("nullable-value-types", "Nullable value types", "Nullable-типи значень"),
    lecture("nullable-reference-types", "Nullable reference types", "Nullable-типи посилань"),
    lecture("extension-methods", "Extension methods", "Методи розширення"),
    lecture("anonymous-types-tuples", "Anonymous types and tuples", "Анонімні типи та кортежі"),
    quiz("nullability-tuples-quiz", "Nullability, extension methods and tuples", "Nullable, методи розширення та кортежі", [
      question(
        "nullable-struct",
        ["What is `int?` really?", "Чим насправді є `int?`?"],
        [
          ["A reference to a boxed int", "Посиланням на запаковане int"],
          ["A `Nullable<int>` struct holding a value and a `HasValue` flag", "Структурою `Nullable<int>` зі значенням і прапорцем `HasValue`"],
          ["An `int` that uses -1 for null", "`int`, що використовує -1 як null"],
          ["A class", "Класом"],
        ],
        "b",
      ),
      question(
        "lifted",
        ["`int? a = 5; int? b = null;` What are `a + b` and `a > b`?", "`int? a = 5; int? b = null;` Чому дорівнюють `a + b` та `a > b`?"],
        [
          ["5 and true", "5 і true"],
          ["0 and false", "0 і false"],
          ["null and false: lifted arithmetic returns null, lifted comparisons return false when either side is null", "null і false: піднята арифметика повертає null, підняті порівняння дають false, якщо хоч один бік null"],
          ["It throws", "Кидає виняток"],
        ],
        "c",
      ),
      question(
        "nrt",
        ["What do nullable reference types (C# 8) change at run time?", "Що змінюють nullable-типи посилань (C# 8) під час виконання?"],
        [
          ["Nothing: they're compile-time annotations that produce warnings; `string` and `string?` are the same runtime type", "Нічого: це анотації для компілятора, що дають попередження; `string` і `string?` — один тип під час виконання"],
          ["Null references can't exist any more", "Null-посилання більше не можуть існувати"],
          ["Strings become value types", "Рядки стають типами значень"],
          ["Every method checks its arguments automatically", "Кожен метод автоматично перевіряє аргументи"],
        ],
        "a",
      ),
      question(
        "bang",
        ["What does the null-forgiving operator `!` in `name!.Length` do?", "Що робить оператор `!` (null-forgiving) у `name!.Length`?"],
        [
          ["Throws if `name` is null", "Кидає виняток, якщо `name` null"],
          ["Converts null to an empty string", "Перетворює null на порожній рядок"],
          ["Negates the value", "Заперечує значення"],
          ["Only silences the compiler warning; it has no effect at run time", "Лише вимикає попередження компілятора; під час виконання нічого не робить"],
        ],
        "d",
      ),
      question(
        "ext-priority",
        ["A class has an instance method `Print()` and there is also an extension method `Print(this MyClass x)`. Which does `obj.Print()` call?", "Клас має метод екземпляра `Print()`, а ще є метод розширення `Print(this MyClass x)`. Що викличе `obj.Print()`?"],
        [
          ["The instance method: instance methods always win over extension methods", "Метод екземпляра: методи екземпляра завжди мають перевагу над методами розширення"],
          ["The extension method", "Метод розширення"],
          ["It is ambiguous, so it doesn't compile", "Неоднозначність, тож не скомпілюється"],
          ["Both", "Обидва"],
        ],
        "a",
      ),
      question(
        "ext-null",
        ["`string s = null; s.IsBlank();` where `IsBlank` is an extension method that handles null. What happens?", "`string s = null; s.IsBlank();`, де `IsBlank` — метод розширення, що обробляє null. Що станеться?"],
        [
          ["`NullReferenceException`", "`NullReferenceException`"],
          ["It works: an extension call is just a static call `Ext.IsBlank(s)`, so null is passed as the argument", "Працює: виклик розширення — це просто статичний виклик `Ext.IsBlank(s)`, тож null передається аргументом"],
          ["A compile error", "Помилка компіляції"],
          ["It returns null", "Повертає null"],
        ],
        "b",
      ),
      question(
        "tuple-equality",
        ["Which are true about value tuples `(int, string)`?", "Що правда про кортежі-значення `(int, string)`?"],
        [
          ["They are mutable value types (`System.ValueTuple`)", "Це змінні типи значень (`System.ValueTuple`)"],
          ["Element names exist only at compile time; at run time the fields are `Item1`, `Item2`", "Назви елементів існують лише під час компіляції; під час виконання поля — це `Item1`, `Item2`"],
          ["`==` compares them element by element (C# 7.3)", "`==` порівнює їх поелементно (C# 7.3)"],
          ["They are immutable reference types", "Це незмінні типи посилань"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "anonymous",
        ["What is true about an anonymous type `new { Name = \"Ann\", Age = 30 }`?", "Що правда про анонімний тип `new { Name = \"Ann\", Age = 30 }`?"],
        [
          ["It is a struct", "Це структура"],
          ["Its properties can be changed", "Його властивості можна змінювати"],
          ["It is an immutable class generated by the compiler, with value-based `Equals` and a readable `ToString`", "Це незмінний клас, згенерований компілятором, з `Equals` за значенням і зручним `ToString`"],
          ["It can be returned from a public method with its real type", "Його можна повернути з публічного методу з його справжнім типом"],
        ],
        "c",
      ),
    ]),
    practice("extensions-practice", "Extension methods and tuples", "Методи розширення та кортежі", {
      starter: PROGRAM_WITH(extTypes(stub, stub, stub), extMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(
        extTypes(
          `        if (maxLength < 3) throw new ArgumentOutOfRangeException("maxLength");
        if (text == null || text.Length <= maxLength) return text;
        return text.Substring(0, maxLength - 3) + "...";`,
          `        bool any = false;
        int min = 0, max = 0;
        foreach (int v in values)
        {
            if (!any) { min = max = v; any = true; continue; }
            if (v < min) min = v;
            if (v > max) max = v;
        }
        if (!any) throw new InvalidOperationException("Sequence contains no elements");
        return (min, max);`,
          `        int sum = 0, count = 0;
        foreach (int? v in values)
        {
            if (v.HasValue) { sum += v.Value; count++; }
        }
        if (count == 0) return null;
        return (double)sum / count;`,
        ),
        extMain,
        "using System.Collections.Generic;",
      ),
      expectedOutput: "Hello, ex...\nshort\n(null)\nmin=-2 max=9\n7..7 (7, 7)\nSequence contains no elements\n4\nno data\n-1\n",
    }),
  ],
};
