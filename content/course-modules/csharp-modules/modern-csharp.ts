import { PROGRAM, PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const SHAPE_TYPES = `class Circle
{
    public double Radius;
    public Circle(double radius) { Radius = radius; }
}

class Rectangle
{
    public double Width;
    public double Height;
    public Rectangle(double width, double height) { Width = width; Height = height; }
}`;

const SHAPE_MAIN = `        object[] items =
        {
            new Circle(1), new Circle(0), new Rectangle(2, 2), new Rectangle(2, 3),
            42, -5, "hello", null, 3.5,
        };
        foreach (object item in items)
        {
            Console.WriteLine(Describe(item));
        }`;

const TUPLES_MAIN = `    static void Main()
    {
        var (min, max, average) = Stats(new[] { 4, 8, 15, 16, 23, 42 });
        Console.WriteLine(min + " " + max + " " + average);

        var stats = Stats(new[] { 7 });
        Console.WriteLine(stats.Min + " " + stats.Max + " " + stats.Average);

        var (first, last) = SplitName("Ada Lovelace");
        Console.WriteLine(last + ", " + first);

        var (onlyFirst, noLast) = SplitName("Plato");
        Console.WriteLine("[" + onlyFirst + "] [" + noLast + "]");

        try
        {
            Stats(new int[0]);
        }
        catch (ArgumentException e)
        {
            Console.WriteLine(e.Message);
        }
    }`;

export const modernCsharpModule: ModuleDef = {
  slug: "modern-csharp",
  title: { en: "Modern C#", uk: "Сучасний C#" },
  slides: [
    { kind: "lecture", slug: "csharp-versions", title: { en: "C# versions", uk: "Версії C#" } },
    { kind: "lecture", slug: "pattern-matching", title: { en: "Pattern matching", uk: "Зіставлення зі зразком" } },
    {
      kind: "practice",
      slug: "type-patterns",
      title: { en: "Practice: Describe anything", uk: "Практика «Опиши що завгодно»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        SHAPE_TYPES,
        SHAPE_MAIN,
        "",
        `    // A description of any object, chosen with type patterns
    static string Describe(object item)
    {
        // Write your code here
        return "?";
    }`,
      ),
      solution: PROGRAM_WITH(
        SHAPE_TYPES,
        SHAPE_MAIN,
        "",
        `    // A description of any object, chosen with type patterns
    static string Describe(object item)
    {
        if (item == null)
        {
            return "nothing";
        }
        if (item is Circle c)
        {
            return c.Radius == 0 ? "a point" : "circle with radius " + c.Radius;
        }
        if (item is Rectangle r)
        {
            return r.Width == r.Height ? "square with side " + r.Width : "rectangle " + r.Width + " x " + r.Height;
        }
        if (item is int n)
        {
            return n < 0 ? "negative number" : "number " + n;
        }
        if (item is string s)
        {
            return "text of length " + s.Length;
        }
        return "unknown: " + item.GetType().Name;
    }`,
      ),
      expectedOutput:
        "circle with radius 1\na point\nsquare with side 2\nrectangle 2 x 3\nnumber 42\nnegative number\ntext of length 5\nnothing\nunknown: Double\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "pattern-matching-quiz",
      title: { en: "Patterns", uk: "Шаблони" },
      questions: [
        {
          id: "no-arm",
          mode: "single",
          prompt: { en: "What happens when no arm of a switch expression matches the value?", uk: "Що станеться, коли жодна гілка switch-виразу не підійшла до значення?" },
          options: [
            { id: "a", text: { en: "A `SwitchExpressionException` is thrown at run time (and the compiler warns in advance when it can)", uk: "Під час виконання кидається `SwitchExpressionException` (а компілятор заздалегідь попереджає, коли може)" } },
            { id: "b", text: { en: "It returns `default`", uk: "Він повертає `default`" } },
            { id: "c", text: { en: "It returns `null`", uk: "Він повертає `null`" } },
          ],
          correct: ["a"],
        },
        {
          id: "relational",
          mode: "multi",
          prompt: { en: "For which values of `age` is `age is >= 18 and < 65` true?", uk: "Для яких значень `age` вираз `age is >= 18 and < 65` істинний?" },
          options: [
            { id: "a", text: { en: "18", uk: "18" } },
            { id: "b", text: { en: "40", uk: "40" } },
            { id: "c", text: { en: "65", uk: "65" } },
            { id: "d", text: { en: "17", uk: "17" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "is-not-null",
          mode: "single",
          prompt: { en: "How does `x is not null` differ from `x != null`?", uk: "Чим `x is not null` відрізняється від `x != null`?" },
          options: [
            { id: "a", text: { en: "A pattern ignores an overloaded `!=` operator and always checks the reference itself", uk: "Шаблон ігнорує перевантажений оператор `!=` і завжди перевіряє саме посилання" } },
            { id: "b", text: { en: "`is not null` also checks for empty strings", uk: "`is not null` також перевіряє порожні рядки" } },
            { id: "c", text: { en: "There is no difference at all", uk: "Різниці немає зовсім" } },
          ],
          correct: ["a"],
        },
        {
          id: "property-pattern",
          mode: "single",
          prompt: { en: "Which values match the pattern `string { Length: 0 }`?", uk: "Які значення підходять під шаблон `string { Length: 0 }`?" },
          options: [
            { id: "a", text: { en: "Only the empty string: `null` does not match a property pattern", uk: "Лише порожній рядок: `null` не підходить під шаблон властивості" } },
            { id: "b", text: { en: "The empty string and `null`", uk: "Порожній рядок і `null`" } },
            { id: "c", text: { en: "Any string", uk: "Будь-який рядок" } },
          ],
          correct: ["a"],
        },
        {
          id: "list-pattern",
          mode: "multi",
          prompt: { en: "Which arrays match the list pattern `[1, .., 9]`?", uk: "Які масиви підходять під шаблон списку `[1, .., 9]`?" },
          options: [
            { id: "a", text: { en: "`{ 1, 9 }`", uk: "`{ 1, 9 }`" } },
            { id: "b", text: { en: "`{ 1, 5, 7, 9 }`", uk: "`{ 1, 5, 7, 9 }`" } },
            { id: "c", text: { en: "`{ 9, 1 }`", uk: "`{ 9, 1 }`" } },
            { id: "d", text: { en: "`{ 1 }`", uk: "`{ 1 }`" } },
          ],
          correct: ["a", "b"],
        },
      ],
    },
    { kind: "lecture", slug: "records", title: { en: "Records", uk: "Records" } },
    { kind: "lecture", slug: "init-required", title: { en: "init, required and primary constructors", uk: "init, required і первинні конструктори" } },
    { kind: "lecture", slug: "nullable-reference-types", title: { en: "Nullable reference types", uk: "Nullable reference types" } },
    {
      kind: "quiz",
      slug: "records-quiz",
      title: { en: "Records and nullability", uk: "Records і null" },
      questions: [
        {
          id: "record-equality",
          mode: "single",
          prompt: { en: "`record Point(int X, int Y);` What is `new Point(1, 2) == new Point(1, 2)`?", uk: "`record Point(int X, int Y);` Чому дорівнює `new Point(1, 2) == new Point(1, 2)`?" },
          options: [
            { id: "a", text: { en: "`true`: records compare their values", uk: "`true`: records порівнюють значення" } },
            { id: "b", text: { en: "`false`: these are two different objects", uk: "`false`: це два різні об'єкти" } },
            { id: "c", text: { en: "It does not compile", uk: "Це не компілюється" } },
          ],
          correct: ["a"],
        },
        {
          id: "with",
          mode: "single",
          prompt: { en: "What does `var b = a with { Age = 31 };` do for a record `a`?", uk: "Що робить `var b = a with { Age = 31 };` для record `a`?" },
          options: [
            { id: "a", text: { en: "Creates a copy of `a` with `Age` changed; `a` stays the same", uk: "Створює копію `a` зі зміненим `Age`; `a` лишається таким самим" } },
            { id: "b", text: { en: "Changes `a.Age` and returns `a`", uk: "Змінює `a.Age` і повертає `a`" } },
            { id: "c", text: { en: "Compares `a` with an object whose `Age` is 31", uk: "Порівнює `a` з об'єктом, у якого `Age` дорівнює 31" } },
          ],
          correct: ["a"],
        },
        {
          id: "record-list",
          mode: "single",
          prompt: {
            en: "`record Order(int Id, List<string> Items);` Two orders have the same `Id` and two different lists with the same items. Are they equal?",
            uk: "`record Order(int Id, List<string> Items);` Два замовлення мають однаковий `Id` і два різні списки з однаковими товарами. Чи рівні вони?",
          },
          options: [
            { id: "a", text: { en: "No: `List<string>` compares by reference", uk: "Ні: `List<string>` порівнюється за посиланням" } },
            { id: "b", text: { en: "Yes: records compare collections item by item", uk: "Так: records порівнюють колекції поелементно" } },
          ],
          correct: ["a"],
        },
        {
          id: "init-meaning",
          mode: "single",
          prompt: { en: "When can a property `public string Name { get; init; }` be assigned?", uk: "Коли можна присвоїти властивість `public string Name { get; init; }`?" },
          options: [
            { id: "a", text: { en: "Only during creation: in a constructor or an object initializer", uk: "Лише під час створення: у конструкторі або ініціалізаторі об'єкта" } },
            { id: "b", text: { en: "At any time", uk: "Будь-коли" } },
            { id: "c", text: { en: "Never: it is always `null`", uk: "Ніколи: вона завжди `null`" } },
          ],
          correct: ["a"],
        },
        {
          id: "nullable-runtime",
          mode: "single",
          prompt: { en: "With nullable reference types enabled, what stops a `null` from getting into a `string` parameter at run time?", uk: "Що з увімкненими nullable reference types не дає `null` потрапити в параметр `string` під час виконання?" },
          options: [
            { id: "a", text: { en: "Nothing: the feature only gives compile-time warnings, so public methods still validate arguments", uk: "Ніщо: можливість дає лише попередження під час компіляції, тож публічні методи все одно перевіряють аргументи" } },
            { id: "b", text: { en: "The runtime throws `ArgumentNullException` automatically", uk: "Середовище виконання автоматично кидає `ArgumentNullException`" } },
            { id: "c", text: { en: "`string` and `string?` are different types at run time", uk: "`string` і `string?` — різні типи під час виконання" } },
          ],
          correct: ["a"],
        },
        {
          id: "required",
          mode: "single",
          prompt: { en: "What does the `required` modifier on a property do?", uk: "Що робить модифікатор `required` на властивості?" },
          options: [
            { id: "a", text: { en: "The compiler reports an error if an object is created without setting it", uk: "Компілятор повідомляє про помилку, якщо об'єкт створено без її задання" } },
            { id: "b", text: { en: "It checks for `null` at run time", uk: "Перевіряє `null` під час виконання" } },
            { id: "c", text: { en: "It makes the property static", uk: "Робить властивість статичною" } },
          ],
          correct: ["a"],
        },
      ],
    },
    { kind: "lecture", slug: "modern-syntax", title: { en: "Smaller modern features", uk: "Менші сучасні можливості" } },
    {
      kind: "practice",
      slug: "tuples-deconstruction",
      title: { en: "Practice: Tuples", uk: "Практика «Кортежі»" },
      language: "csharp",
      starter: PROGRAM(`    // The minimum, the maximum and the average; throws ArgumentException for an empty array
    static (int Min, int Max, double Average) Stats(int[] values)
    {
        // Write your code here
        return (0, 0, 0);
    }

    // The part before the first space and the part after it
    static (string First, string Last) SplitName(string fullName)
    {
        // Write your code here
        return ("", "");
    }

${TUPLES_MAIN}`),
      solution: PROGRAM(`    // The minimum, the maximum and the average; throws ArgumentException for an empty array
    static (int Min, int Max, double Average) Stats(int[] values)
    {
        if (values.Length == 0)
        {
            throw new ArgumentException("The array is empty");
        }

        int min = int.MaxValue;
        int max = int.MinValue;
        int sum = 0;
        foreach (int value in values)
        {
            if (value < min) min = value;
            if (value > max) max = value;
            sum += value;
        }
        return (min, max, (double)sum / values.Length);
    }

    // The part before the first space and the part after it
    static (string First, string Last) SplitName(string fullName)
    {
        int space = fullName.IndexOf(' ');
        if (space < 0)
        {
            return (fullName, "");
        }
        return (fullName.Substring(0, space), fullName.Substring(space + 1));
    }

${TUPLES_MAIN}`),
      expectedOutput: "4 42 18\n7 7 7\nLovelace, Ada\n[Plato] []\nThe array is empty\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "modern-csharp-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "records-version",
          mode: "single",
          prompt: { en: "In which C# version did records appear?", uk: "У якій версії C# з'явилися records?" },
          options: [
            { id: "a", text: { en: "C# 9", uk: "C# 9" } },
            { id: "b", text: { en: "C# 7", uk: "C# 7" } },
            { id: "c", text: { en: "C# 12", uk: "C# 12" } },
          ],
          correct: ["a"],
        },
        {
          id: "hat-index",
          mode: "single",
          prompt: { en: "What is `items[^1]`?", uk: "Що таке `items[^1]`?" },
          options: [
            { id: "a", text: { en: "The last element", uk: "Останній елемент" } },
            { id: "b", text: { en: "The second element", uk: "Другий елемент" } },
            { id: "c", text: { en: "The element at index −1, which throws", uk: "Елемент з індексом −1, що кидає виняток" } },
          ],
          correct: ["a"],
        },
        {
          id: "primary-ctor",
          mode: "single",
          prompt: {
            en: "`class OrderService(IRepository repository) { ... }`. Is `repository` a public property of `OrderService`?",
            uk: "`class OrderService(IRepository repository) { ... }`. Чи є `repository` публічною властивістю `OrderService`?",
          },
          options: [
            { id: "a", text: { en: "No: in a class it is a parameter visible inside the class, and it is not readonly", uk: "Ні: у класі це параметр, видимий усередині класу, і він не readonly" } },
            { id: "b", text: { en: "Yes, like in a record", uk: "Так, як у record" } },
            { id: "c", text: { en: "Yes, and it is readonly", uk: "Так, і вона readonly" } },
          ],
          correct: ["a"],
        },
        {
          id: "nullable-types",
          mode: "single",
          prompt: { en: "How do `int?` and `string?` differ at run time?", uk: "Чим відрізняються `int?` і `string?` під час виконання?" },
          options: [
            { id: "a", text: { en: "`int?` is the real type `Nullable<int>`; `string?` is just `string` with an annotation for the compiler", uk: "`int?` — справжній тип `Nullable<int>`; `string?` — просто `string` з анотацією для компілятора" } },
            { id: "b", text: { en: "Both are `Nullable<T>`", uk: "Обидва — `Nullable<T>`" } },
            { id: "c", text: { en: "They do not differ: both are only annotations", uk: "Не відрізняються: обидва — лише анотації" } },
          ],
          correct: ["a"],
        },
        {
          id: "bang",
          mode: "single",
          prompt: { en: "What does the `!` in `string name = FindName()!;` do?", uk: "Що робить `!` у `string name = FindName()!;`?" },
          options: [
            { id: "a", text: { en: "Only silences the nullable warning; nothing is checked at run time", uk: "Лише вимикає попередження про null; під час виконання нічого не перевіряється" } },
            { id: "b", text: { en: "Throws if the value is `null`", uk: "Кидає виняток, якщо значення `null`" } },
            { id: "c", text: { en: "Negates the result", uk: "Заперечує результат" } },
          ],
          correct: ["a"],
        },
        {
          id: "deconstruct",
          mode: "single",
          prompt: { en: "What does a class need so that `var (x, y) = point;` compiles?", uk: "Що потрібно класу, щоб `var (x, y) = point;` компілювалося?" },
          options: [
            { id: "a", text: { en: "A `Deconstruct(out ..., out ...)` method", uk: "Метод `Deconstruct(out ..., out ...)`" } },
            { id: "b", text: { en: "To implement `IEnumerable`", uk: "Реалізувати `IEnumerable`" } },
            { id: "c", text: { en: "Nothing: any class can be deconstructed", uk: "Нічого: будь-який клас можна деконструювати" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
