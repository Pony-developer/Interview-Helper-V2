import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const paramTypes = (swap: string, tryParse: string, sum: string) => `static class Params
{
    // Swaps the two variables the caller passed in.
    public static void Swap<T>(ref T a, ref T b)
    {
${swap}
    }

    // Parses "x,y" (spaces allowed around the numbers). Returns false and sets x = y = 0 if the text is not valid.
    public static bool TryParsePoint(string text, out int x, out int y)
    {
${tryParse}
    }

    // Adds up any number of values; returns 0 when called with none.
    public static int Sum(params int[] values)
    {
${sum}
    }
}`;

const paramMain = `        int a = 1, b = 2;
        Params.Swap(ref a, ref b);
        Console.WriteLine("a=" + a + " b=" + b);

        string s1 = "left", s2 = "right";
        Params.Swap(ref s1, ref s2);
        Console.WriteLine(s1 + " " + s2);

        foreach (var text in new[] { "3,4", " 10 , -2 ", "7", "x,1" })
        {
            int x, y;
            bool ok = Params.TryParsePoint(text, out x, out y);
            Console.WriteLine("'" + text + "' -> " + ok + " (" + x + ", " + y + ")");
        }

        Console.WriteLine(Params.Sum());
        Console.WriteLine(Params.Sum(5));
        Console.WriteLine(Params.Sum(1, 2, 3, 4));
        Console.WriteLine(Params.Sum(new[] { 10, 20 }));`;

const stub = "        throw new NotImplementedException();";

export const languageBasicsModule: ModuleDef = {
  slug: "language-basics",
  title: { en: "Language fundamentals in depth", uk: "Основи мови в глибину" },
  slides: [
    lecture("value-reference-types", "Value types, reference types and memory", "Типи значень, типи посилань і пам'ять"),
    lecture("numeric-types-deep", "Numeric types: overflow, precision and conversions", "Числові типи: переповнення, точність і перетворення"),
    lecture("strings-arrays-deep", "Strings, characters and arrays", "Рядки, символи та масиви"),
    lecture("parameters-deep", "Variables and parameters: ref, out, in, params", "Змінні та параметри: ref, out, in, params"),
    lecture("null-operators-statements", "Null operators, switch and namespaces", "Null-оператори, switch і простори імен"),
    quiz("language-basics-quiz", "Language fundamentals", "Основи мови", [
      question(
        "assign-struct",
        ["`Point` is a struct. After `var p2 = p1; p2.X = 9;` what is `p1.X` if it was 1?", "`Point` — структура. Після `var p2 = p1; p2.X = 9;` чому дорівнює `p1.X`, якщо було 1?"],
        [
          ["9, because both variables point to the same object", "9, бо обидві змінні вказують на той самий об'єкт"],
          ["1, because assigning a value type copies the whole value", "1, бо присвоєння типу значення копіює все значення"],
          ["It does not compile", "Не скомпілюється"],
          ["0", "0"],
        ],
        "b",
      ),
      question(
        "overflow",
        ["What does `int x = int.MaxValue; x++;` do by default?", "Що робить `int x = int.MaxValue; x++;` за замовчуванням?"],
        [
          ["Throws `OverflowException`", "Кидає `OverflowException`"],
          ["Leaves `x` at `int.MaxValue`", "Залишає `x` рівним `int.MaxValue`"],
          ["Silently wraps around to `int.MinValue`; use `checked` to get an exception", "Тихо перекочується в `int.MinValue`; щоб отримати виняток, потрібен `checked`"],
          ["Promotes `x` to `long`", "Перетворює `x` на `long`"],
        ],
        "c",
      ),
      question(
        "decimal",
        ["Why does `0.1 + 0.2 == 0.3` evaluate to `false` for `double` but `true` for `decimal`?", "Чому `0.1 + 0.2 == 0.3` дає `false` для `double`, але `true` для `decimal`?"],
        [
          ["`double` is base-2 and can't represent 0.1 exactly; `decimal` is base-10 and can", "`double` двійковий і не може точно подати 0.1; `decimal` десятковий і може"],
          ["`decimal` is a 128-bit integer", "`decimal` — це 128-бітне ціле"],
          ["`double` rounds to 2 decimal places", "`double` округлює до 2 знаків"],
          ["It is a compiler bug", "Це помилка компілятора"],
        ],
        "a",
      ),
      question(
        "jagged",
        ["What is the difference between `int[,]` and `int[][]`?", "Чим відрізняються `int[,]` та `int[][]`?"],
        [
          ["There is none", "Нічим"],
          ["`int[,]` is a single rectangular block; `int[][]` is an array of separate arrays whose lengths may differ", "`int[,]` — один прямокутний блок; `int[][]` — масив окремих масивів, довжини яких можуть відрізнятися"],
          ["`int[][]` cannot be indexed", "`int[][]` не можна індексувати"],
          ["`int[,]` is stored on the stack", "`int[,]` зберігається в стеку"],
        ],
        "b",
      ),
      question(
        "out-in",
        ["Which statements about parameter modifiers are true?", "Які твердження про модифікатори параметрів правдиві?"],
        [
          ["An `out` argument must be assigned by the method before it returns", "Метод мусить присвоїти `out`-аргумент до повернення"],
          ["A `ref` argument must be definitely assigned before the call", "`ref`-аргумент має бути присвоєний до виклику"],
          ["An `in` parameter is passed by reference but cannot be modified", "Параметр `in` передається за посиланням, але його не можна змінювати"],
          ["`params` can appear anywhere in the parameter list", "`params` може стояти будь-де у списку параметрів"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "null-coalescing",
        ["What does `name ??= \"guest\";` do?", "Що робить `name ??= \"guest\";`?"],
        [
          ["Always sets `name` to \"guest\"", "Завжди присвоює `name` значення \"guest\""],
          ["Throws if `name` is null", "Кидає виняток, якщо `name` дорівнює null"],
          ["Compares `name` to \"guest\"", "Порівнює `name` з \"guest\""],
          ["Assigns \"guest\" only when `name` is null", "Присвоює \"guest\" лише тоді, коли `name` дорівнює null"],
        ],
        "d",
      ),
      question(
        "conditional",
        ["`string s = null;` What is the type and value of `s?.Length`?", "`string s = null;` Який тип і значення має `s?.Length`?"],
        [
          ["`int`, 0", "`int`, 0"],
          ["`int?`, null", "`int?`, null"],
          ["It throws `NullReferenceException`", "Кидає `NullReferenceException`"],
          ["`object`, null", "`object`, null"],
        ],
        "b",
      ),
      question(
        "switch-expr",
        ["What happens when no arm of a `switch` expression matches?", "Що станеться, якщо жодна гілка `switch`-виразу не підійшла?"],
        [
          ["It returns `default`", "Повертає `default`"],
          ["It returns null", "Повертає null"],
          ["A `SwitchExpressionException` is thrown at run time (and the compiler warns that the switch is not exhaustive)", "Під час виконання кидається `SwitchExpressionException` (а компілятор попереджає, що switch не вичерпний)"],
          ["The first arm is used", "Використовується перша гілка"],
        ],
        "c",
      ),
      question(
        "file-scoped",
        ["What do `global using` and file-scoped namespaces have in common?", "Що спільного між `global using` і просторами імен на рівні файлу?"],
        [
          ["Both were added in C# 10 to cut boilerplate", "Обидва з'явилися в C# 10, щоб зменшити шаблонний код"],
          ["Both change how code runs", "Обидва змінюють те, як виконується код"],
          ["Both require .NET Framework", "Обидва вимагають .NET Framework"],
          ["Both are only for test projects", "Обидва лише для тестових проєктів"],
        ],
        "a",
      ),
    ]),
    practice("parameters-practice", "ref, out and params", "ref, out і params", {
      starter: PROGRAM_WITH(paramTypes(stub, stub, stub), paramMain),
      solution: PROGRAM_WITH(
        paramTypes(
          `        T tmp = a;
        a = b;
        b = tmp;`,
          `        x = 0;
        y = 0;
        string[] parts = text.Split(',');
        if (parts.Length != 2) return false;
        int px, py;
        if (!int.TryParse(parts[0].Trim(), out px) || !int.TryParse(parts[1].Trim(), out py)) return false;
        x = px;
        y = py;
        return true;`,
          `        int total = 0;
        foreach (int v in values) total += v;
        return total;`,
        ),
        paramMain,
      ),
      expectedOutput:
        "a=2 b=1\nright left\n'3,4' -> True (3, 4)\n' 10 , -2 ' -> True (10, -2)\n'7' -> False (0, 0)\n'x,1' -> False (0, 0)\n0\n5\n10\n30\n",
    }),
  ],
};
