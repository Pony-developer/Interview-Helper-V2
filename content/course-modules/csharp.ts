import type { ModuleDef } from "./types";

const PROGRAM = (body: string, extraUsings = "") =>
  `using System;\n${extraUsings ? `${extraUsings}\n` : ""}\nclass Program\n{\n${body}\n}\n`;

const EMPTY_MAIN = PROGRAM(`    static void Main()
    {
        // Write your code here
    }`);

/** The C# course. Modules 2–8 start with a lecture and a practice each; module 1 is complete. */
export const csharpModules: ModuleDef[] = [
  {
    slug: "first-steps",
    title: { en: "First steps in C#", uk: "Перше знайомство з C#" },
    slides: [
      { kind: "lecture", slug: "before-you-start", title: { en: "Before you start", uk: "Коротка довідка перед початком" } },
      { kind: "lecture", slug: "hello-world", title: { en: "Hello, world", uk: "Hello, world" } },
      {
        kind: "quiz",
        slug: "terminology",
        title: { en: "Terminology", uk: "Термінологія" },
        questions: [
          {
            id: "main",
            mode: "single",
            prompt: { en: "What is `Main` in a C# program?", uk: "Що таке `Main` у програмі на C#?" },
            options: [
              { id: "a", text: { en: "The method where the program starts running", uk: "Метод, з якого починається виконання програми" } },
              { id: "b", text: { en: "A namespace with console helpers", uk: "Простір імен із засобами для консолі" } },
              { id: "c", text: { en: "A keyword that prints text", uk: "Ключове слово, яке друкує текст" } },
              { id: "d", text: { en: "The name of the compiler", uk: "Назва компілятора" } },
            ],
            correct: ["a"],
          },
          {
            id: "compiler",
            mode: "single",
            prompt: { en: "What does the compiler do?", uk: "Що робить компілятор?" },
            options: [
              {
                id: "a",
                text: {
                  en: "Checks the source code and turns it into a program the runtime can execute",
                  uk: "Перевіряє вихідний код і перетворює його на програму, яку може виконати середовище",
                },
              },
              { id: "b", text: { en: "Runs the code line by line without checking it first", uk: "Виконує код рядок за рядком без попередньої перевірки" } },
              { id: "c", text: { en: "Only formats the code so it is easier to read", uk: "Лише форматує код, щоб його було легше читати" } },
            ],
            correct: ["a"],
          },
          {
            id: "keywords",
            mode: "multi",
            prompt: { en: "Which of these are C# keywords?", uk: "Що з наведеного є ключовими словами C#?" },
            options: [
              { id: "a", text: { en: "`class`", uk: "`class`" } },
              { id: "b", text: { en: "`static`", uk: "`static`" } },
              { id: "c", text: { en: "`Console`", uk: "`Console`" } },
              { id: "d", text: { en: "`void`", uk: "`void`" } },
              { id: "e", text: { en: "`WriteLine`", uk: "`WriteLine`" } },
            ],
            correct: ["a", "b", "d"],
          },
          {
            id: "write",
            mode: "single",
            prompt: {
              en: "How is `Console.Write` different from `Console.WriteLine`?",
              uk: "Чим `Console.Write` відрізняється від `Console.WriteLine`?",
            },
            options: [
              { id: "a", text: { en: "It does not move to a new line after the text", uk: "Він не переходить на новий рядок після тексту" } },
              { id: "b", text: { en: "It writes to a file instead of the console", uk: "Він пише у файл, а не в консоль" } },
              { id: "c", text: { en: "It prints the text twice", uk: "Він друкує текст двічі" } },
            ],
            correct: ["a"],
          },
          {
            id: "compile-error",
            mode: "single",
            prompt: {
              en: "What happens when a program has a compile error?",
              uk: "Що відбувається, коли в програмі є помилка компіляції?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "The program does not run at all, and the compiler reports the error with its line number",
                  uk: "Програма взагалі не запускається, а компілятор повідомляє про помилку та номер рядка",
                },
              },
              { id: "b", text: { en: "The program runs until it reaches the broken line", uk: "Програма виконується, доки не дійде до зламаного рядка" } },
              { id: "c", text: { en: "The broken line is skipped and the rest runs", uk: "Зламаний рядок пропускається, а решта виконується" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "first-step",
        title: { en: "First step", uk: "Перший крок" },
        language: "csharp",
        starter: EMPTY_MAIN,
        solution: PROGRAM(`    static void Main()
    {
        Console.WriteLine("Hello, Assay!");
        Console.WriteLine("C# is ready.");
    }`),
        expectedOutput: "Hello, Assay!\nC# is ready.\n",
      },
      { kind: "lecture", slug: "sources", title: { en: "Where to look things up", uk: "Джерела інформації" } },
      { kind: "lecture", slug: "variables", title: { en: "Variables", uk: "Змінні" } },
      {
        kind: "quiz",
        slug: "variables-quiz",
        title: { en: "Variables quiz", uk: "Тест: змінні" },
        questions: [
          {
            id: "declaration",
            mode: "single",
            prompt: { en: "Which declaration is correct?", uk: "Яке оголошення правильне?" },
            options: [
              { id: "a", text: { en: "`int 2count = 5;`", uk: "`int 2count = 5;`" } },
              { id: "b", text: { en: "`int count = 5;`", uk: "`int count = 5;`" } },
              { id: "c", text: { en: "`int class = 5;`", uk: "`int class = 5;`" } },
              { id: "d", text: { en: "`int my-count = 5;`", uk: "`int my-count = 5;`" } },
            ],
            correct: ["b"],
          },
          {
            id: "names",
            mode: "multi",
            prompt: { en: "Which of these are valid variable names in C#?", uk: "Які з цих імен є коректними іменами змінних у C#?" },
            options: [
              { id: "a", text: { en: "`total`", uk: "`total`" } },
              { id: "b", text: { en: "`_index`", uk: "`_index`" } },
              { id: "c", text: { en: "`2nd`", uk: "`2nd`" } },
              { id: "d", text: { en: "`userName`", uk: "`userName`" } },
              { id: "e", text: { en: "`my score`", uk: "`my score`" } },
            ],
            correct: ["a", "b", "d"],
          },
          {
            id: "copy",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nint a = 5;\nint b = a;\na = 10;\nConsole.WriteLine(b);\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nint a = 5;\nint b = a;\na = 10;\nConsole.WriteLine(b);\n```",
            },
            options: [
              { id: "a", text: { en: "5", uk: "5" } },
              { id: "b", text: { en: "10", uk: "10" } },
              { id: "c", text: { en: "15", uk: "15" } },
              { id: "d", text: { en: "Nothing, it does not compile", uk: "Нічого, вона не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "unassigned",
            mode: "single",
            prompt: {
              en: "What happens with this code?\n\n```csharp\nint x;\nConsole.WriteLine(x);\n```",
              uk: "Що станеться з цим кодом?\n\n```csharp\nint x;\nConsole.WriteLine(x);\n```",
            },
            options: [
              { id: "a", text: { en: "It prints 0", uk: "Він надрукує 0" } },
              {
                id: "b",
                text: {
                  en: "It does not compile: the variable is used before it is assigned",
                  uk: "Він не компілюється: змінну використано до того, як їй присвоєно значення",
                },
              },
              { id: "c", text: { en: "It prints an empty line", uk: "Він надрукує порожній рядок" } },
              { id: "d", text: { en: "It compiles and crashes while running", uk: "Він компілюється, але аварійно завершується під час виконання" } },
            ],
            correct: ["b"],
          },
          {
            id: "const",
            mode: "single",
            prompt: { en: "What does `const` do in `const int Max = 10;`?", uk: "Що робить `const` у `const int Max = 10;`?" },
            options: [
              {
                id: "a",
                text: {
                  en: "The value can never be changed; assigning to `Max` later is a compile error",
                  uk: "Значення ніколи не можна змінити; пізніше присвоєння `Max` — помилка компіляції",
                },
              },
              { id: "b", text: { en: "The variable can only be read once", uk: "Змінну можна прочитати лише один раз" } },
              { id: "c", text: { en: "The variable is deleted after the first use", uk: "Змінна видаляється після першого використання" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "swap-values",
        title: { en: "Swap two values", uk: "Обмін значень" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        int a = 3;
        int b = 8;

        // Swap the values of a and b using a third variable

        Console.WriteLine("a = " + a);
        Console.WriteLine("b = " + b);
    }`),
        solution: PROGRAM(`    static void Main()
    {
        int a = 3;
        int b = 8;

        int temp = a;
        a = b;
        b = temp;

        Console.WriteLine("a = " + a);
        Console.WriteLine("b = " + b);
    }`),
        expectedOutput: "a = 8\nb = 3\n",
      },
      { kind: "lecture", slug: "numeric-types", title: { en: "Numeric types", uk: "Числові типи даних" } },
      {
        kind: "practice",
        slug: "wrong-type",
        title: { en: "Wrong data type", uk: "Неправильний тип даних" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        int price = 12.5;
        int count = 4;
        int total = price * count;
        string average = total / count;
        Console.WriteLine(total);
        Console.WriteLine(average);
    }`),
        solution: PROGRAM(`    static void Main()
    {
        double price = 12.5;
        int count = 4;
        double total = price * count;
        double average = total / count;
        Console.WriteLine(total);
        Console.WriteLine(average);
    }`),
        expectedOutput: "50\n12.5\n",
      },
      {
        kind: "practice",
        slug: "conversion-errors",
        title: { en: "Type conversion errors", uk: "Помилки перетворення типів" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        double celsius = 36.6;
        long secondsInDay = 86400L;
        int fahrenheit = celsius * 9 / 5 + 32;
        int roundedFahrenheit = fahrenheit;
        int secondsInCentury = secondsInDay * 365 * 100;
        Console.WriteLine(Math.Round(fahrenheit, 1));
        Console.WriteLine(roundedFahrenheit);
        Console.WriteLine(secondsInCentury);
    }`),
        solution: PROGRAM(`    static void Main()
    {
        double celsius = 36.6;
        long secondsInDay = 86400L;
        double fahrenheit = celsius * 9 / 5 + 32;
        int roundedFahrenheit = (int)Math.Round(fahrenheit);
        long secondsInCentury = secondsInDay * 365 * 100;
        Console.WriteLine(Math.Round(fahrenheit, 1));
        Console.WriteLine(roundedFahrenheit);
        Console.WriteLine(secondsInCentury);
    }`),
        expectedOutput: "97.9\n98\n3153600000\n",
      },
      { kind: "lecture", slug: "arithmetic", title: { en: "Arithmetic and comparisons", uk: "Арифметика та порівняння" } },
      {
        kind: "quiz",
        slug: "arithmetic-quiz",
        title: { en: "Arithmetic quiz", uk: "Тест: арифметика" },
        questions: [
          {
            id: "division",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(17 / 5);` print?", uk: "Що надрукує `Console.WriteLine(17 / 5);`?" },
            options: [
              { id: "a", text: { en: "3", uk: "3" } },
              { id: "b", text: { en: "3.4", uk: "3.4" } },
              { id: "c", text: { en: "4", uk: "4" } },
              { id: "d", text: { en: "2", uk: "2" } },
            ],
            correct: ["a"],
          },
          {
            id: "remainder",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(17 % 5);` print?", uk: "Що надрукує `Console.WriteLine(17 % 5);`?" },
            options: [
              { id: "a", text: { en: "3", uk: "3" } },
              { id: "b", text: { en: "2", uk: "2" } },
              { id: "c", text: { en: "0.4", uk: "0.4" } },
              { id: "d", text: { en: "12", uk: "12" } },
            ],
            correct: ["b"],
          },
          {
            id: "precedence",
            mode: "single",
            prompt: { en: "What is the value of `2 + 3 * 4 - 1`?", uk: "Чому дорівнює значення `2 + 3 * 4 - 1`?" },
            options: [
              { id: "a", text: { en: "19", uk: "19" } },
              { id: "b", text: { en: "13", uk: "13" } },
              { id: "c", text: { en: "15", uk: "15" } },
              { id: "d", text: { en: "9", uk: "9" } },
            ],
            correct: ["b"],
          },
          {
            id: "compound",
            mode: "single",
            prompt: {
              en: "What is `n` after this code?\n\n```csharp\nint n = 5;\nn *= 2 + 1;\n```",
              uk: "Чому дорівнює `n` після цього коду?\n\n```csharp\nint n = 5;\nn *= 2 + 1;\n```",
            },
            options: [
              { id: "a", text: { en: "11", uk: "11" } },
              { id: "b", text: { en: "15", uk: "15" } },
              { id: "c", text: { en: "10", uk: "10" } },
              { id: "d", text: { en: "13", uk: "13" } },
            ],
            correct: ["b"],
          },
          {
            id: "mixed",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(10 / 4 * 2.0);` print?", uk: "Що надрукує `Console.WriteLine(10 / 4 * 2.0);`?" },
            options: [
              { id: "a", text: { en: "5", uk: "5" } },
              { id: "b", text: { en: "4", uk: "4" } },
              { id: "c", text: { en: "4.5", uk: "4.5" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "equals-two",
            mode: "multi",
            prompt: { en: "Which expressions are equal to 2?", uk: "Які з виразів дорівнюють 2?" },
            options: [
              { id: "a", text: { en: "`7 / 3`", uk: "`7 / 3`" } },
              { id: "b", text: { en: "`8 % 3`", uk: "`8 % 3`" } },
              { id: "c", text: { en: "`5 / 2.0`", uk: "`5 / 2.0`" } },
              { id: "d", text: { en: "`Math.Round(2.5)`", uk: "`Math.Round(2.5)`" } },
              { id: "e", text: { en: "`Math.Round(3.5)`", uk: "`Math.Round(3.5)`" } },
            ],
            correct: ["a", "b", "d"],
          },
          {
            id: "comparison",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(10 % 3 == 1);` print?", uk: "Що надрукує `Console.WriteLine(10 % 3 == 1);`?" },
            options: [
              { id: "a", text: { en: "True", uk: "True" } },
              { id: "b", text: { en: "False", uk: "False" } },
              { id: "c", text: { en: "1", uk: "1" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "time-converter",
        title: { en: "Time converter", uk: "Конвертер часу" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        int totalSeconds = 98765;

        // Calculate the hours, minutes and seconds
        // and print them as "27h 26m 5s"
    }`),
        solution: PROGRAM(`    static void Main()
    {
        int totalSeconds = 98765;

        int hours = totalSeconds / 3600;
        int minutes = totalSeconds % 3600 / 60;
        int seconds = totalSeconds % 60;

        Console.WriteLine(hours + "h " + minutes + "m " + seconds + "s");
    }`),
        expectedOutput: "27h 26m 5s\n",
      },
      {
        kind: "practice",
        slug: "circle-area",
        title: { en: "Circle", uk: "Коло" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        double radius = 5;

        // Print the area and the circumference of the circle,
        // each rounded to 2 decimal places
    }`),
        solution: PROGRAM(`    static void Main()
    {
        double radius = 5;

        double area = Math.Round(Math.PI * radius * radius, 2);
        double circumference = Math.Round(2 * Math.PI * radius, 2);

        Console.WriteLine("Area: " + area);
        Console.WriteLine("Circumference: " + circumference);
    }`),
        expectedOutput: "Area: 78.54\nCircumference: 31.42\n",
      },
      { kind: "lecture", slug: "var", title: { en: "Implicit typing with var", uk: "Неявна типізація: var" } },
      {
        kind: "practice",
        slug: "using-var",
        title: { en: "Using var", uk: "Використання var" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        var count;
        count = 3;

        var title = null;
        title = "Total: ";

        var price = 4;
        price = 2.5;

        Console.WriteLine(title + count * price);
    }`),
        solution: PROGRAM(`    static void Main()
    {
        var count = 3;

        var title = "Total: ";

        var price = 2.5;

        Console.WriteLine(title + count * price);
    }`),
        expectedOutput: "Total: 7.5\n",
      },
      { kind: "lecture", slug: "strings", title: { en: "Strings", uk: "Рядки" } },
      {
        kind: "quiz",
        slug: "strings-quiz",
        title: { en: "Strings quiz", uk: "Тест: рядки" },
        questions: [
          {
            id: "length",
            mode: "single",
            prompt: { en: "What is the value of `\"Hello\".Length`?", uk: "Чому дорівнює `\"Hello\".Length`?" },
            options: [
              { id: "a", text: { en: "4", uk: "4" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "6", uk: "6" } },
            ],
            correct: ["b"],
          },
          {
            id: "index",
            mode: "single",
            prompt: { en: "What is the value of `\"Hello\"[1]`?", uk: "Чому дорівнює `\"Hello\"[1]`?" },
            options: [
              { id: "a", text: { en: "`'H'`", uk: "`'H'`" } },
              { id: "b", text: { en: "`'e'`", uk: "`'e'`" } },
              { id: "c", text: { en: "`'l'`", uk: "`'l'`" } },
              { id: "d", text: { en: "A compile error", uk: "Помилка компіляції" } },
            ],
            correct: ["b"],
          },
          {
            id: "concat",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(1 + 2 + \"3\");` print?", uk: "Що надрукує `Console.WriteLine(1 + 2 + \"3\");`?" },
            options: [
              { id: "a", text: { en: "123", uk: "123" } },
              { id: "b", text: { en: "33", uk: "33" } },
              { id: "c", text: { en: "6", uk: "6" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "immutable",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nstring s = \"hello\";\ns.ToUpper();\nConsole.WriteLine(s);\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nstring s = \"hello\";\ns.ToUpper();\nConsole.WriteLine(s);\n```",
            },
            options: [
              { id: "a", text: { en: "HELLO", uk: "HELLO" } },
              { id: "b", text: { en: "hello", uk: "hello" } },
              { id: "c", text: { en: "Hello", uk: "Hello" } },
              { id: "d", text: { en: "It does not compile", uk: "Вона не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "quotes",
            mode: "multi",
            prompt: {
              en: "Which lines print exactly `He said \"hi\"`?",
              uk: "Які рядки друкують рівно `He said \"hi\"`?",
            },
            options: [
              { id: "a", text: { en: "`Console.WriteLine(\"He said \\\"hi\\\"\");`", uk: "`Console.WriteLine(\"He said \\\"hi\\\"\");`" } },
              { id: "b", text: { en: "`Console.WriteLine(\"He said \"hi\"\");`", uk: "`Console.WriteLine(\"He said \"hi\"\");`" } },
              { id: "c", text: { en: "`Console.WriteLine(@\"He said \"\"hi\"\"\");`", uk: "`Console.WriteLine(@\"He said \"\"hi\"\"\");`" } },
              { id: "d", text: { en: "`Console.WriteLine('He said \"hi\"');`", uk: "`Console.WriteLine('He said \"hi\"');`" } },
            ],
            correct: ["a", "c"],
          },
          {
            id: "substring",
            mode: "single",
            prompt: { en: "What is the value of `\"Assay\".Substring(1, 3)`?", uk: "Чому дорівнює `\"Assay\".Substring(1, 3)`?" },
            options: [
              { id: "a", text: { en: "`ssa`", uk: "`ssa`" } },
              { id: "b", text: { en: "`Ass`", uk: "`Ass`" } },
              { id: "c", text: { en: "`ssay`", uk: "`ssay`" } },
              { id: "d", text: { en: "`say`", uk: "`say`" } },
            ],
            correct: ["a"],
          },
          {
            id: "interpolation",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nint n = 3;\nConsole.WriteLine($\"n = {n + 1}\");\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nint n = 3;\nConsole.WriteLine($\"n = {n + 1}\");\n```",
            },
            options: [
              { id: "a", text: { en: "`n = 3`", uk: "`n = 3`" } },
              { id: "b", text: { en: "`n = 4`", uk: "`n = 4`" } },
              { id: "c", text: { en: "`n = {n + 1}`", uk: "`n = {n + 1}`" } },
              { id: "d", text: { en: "It does not compile", uk: "Вона не компілюється" } },
            ],
            correct: ["b"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "name-tag",
        title: { en: "Name tag", uk: "Бейдж" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        string firstName = "  aDA ";
        string lastName = "LOVELACE";
        int birthYear = 1815;

        // Clean up the names and print the name tag:
        // Name: Ada Lovelace
        // Initials: A.L.
        // Length: 12
        // Born: 1815
    }`),
        solution: PROGRAM(`    static void Main()
    {
        string firstName = "  aDA ";
        string lastName = "LOVELACE";
        int birthYear = 1815;

        string first = firstName.Trim();
        first = first.Substring(0, 1).ToUpper() + first.Substring(1).ToLower();
        string last = lastName.Substring(0, 1).ToUpper() + lastName.Substring(1).ToLower();
        string fullName = first + " " + last;

        Console.WriteLine("Name: " + fullName);
        Console.WriteLine("Initials: " + first[0] + "." + last[0] + ".");
        Console.WriteLine("Length: " + fullName.Length);
        Console.WriteLine($"Born: {birthYear}");
    }`),
        expectedOutput: "Name: Ada Lovelace\nInitials: A.L.\nLength: 12\nBorn: 1815\n",
      },
      { kind: "lecture", slug: "parsing", title: { en: "Converting strings to numbers", uk: "Перетворення рядка на число" } },
      {
        kind: "practice",
        slug: "parse-numbers",
        title: { en: "Parsing numbers", uk: "Перетворення рядків на числа" },
        language: "csharp",
        starter: PROGRAM(
          `    static void Main()
    {
        string width = "12";
        string height = "5";
        string rate = "0.5";

        // 1. Print the area (width * height) as a whole number
        // 2. Print the area multiplied by rate
    }`,
          "using System.Globalization;",
        ),
        solution: PROGRAM(
          `    static void Main()
    {
        string width = "12";
        string height = "5";
        string rate = "0.5";

        int area = int.Parse(width) * int.Parse(height);
        double scaled = area * double.Parse(rate, CultureInfo.InvariantCulture);

        Console.WriteLine(area);
        Console.WriteLine(scaled);
    }`,
          "using System.Globalization;",
        ),
        expectedOutput: "60\n30\n",
      },
      {
        kind: "practice",
        slug: "try-parse",
        title: { en: "Safe parsing", uk: "Безпечне перетворення" },
        language: "csharp",
        starter: PROGRAM(`    // Return the number doubled, as text, when text is a valid int.
    // Otherwise return "invalid".
    static string DoubleIt(string text)
    {
        // Write your code here
        return "invalid";
    }

    static void Main()
    {
        Console.WriteLine(DoubleIt("42"));
        Console.WriteLine(DoubleIt("abc"));
        Console.WriteLine(DoubleIt("3.5"));
        Console.WriteLine(DoubleIt("-15"));
        Console.WriteLine(DoubleIt("99999999999"));
        Console.WriteLine(DoubleIt(""));
    }`),
        solution: PROGRAM(`    // Return the number doubled, as text, when text is a valid int.
    // Otherwise return "invalid".
    static string DoubleIt(string text)
    {
        if (int.TryParse(text, out int number))
        {
            return (number * 2).ToString();
        }
        return "invalid";
    }

    static void Main()
    {
        Console.WriteLine(DoubleIt("42"));
        Console.WriteLine(DoubleIt("abc"));
        Console.WriteLine(DoubleIt("3.5"));
        Console.WriteLine(DoubleIt("-15"));
        Console.WriteLine(DoubleIt("99999999999"));
        Console.WriteLine(DoubleIt(""));
    }`),
        expectedOutput: "84\ninvalid\ninvalid\n-30\ninvalid\ninvalid\n",
      },
      { kind: "lecture", slug: "methods", title: { en: "Methods", uk: "Методи" } },
      {
        kind: "quiz",
        slug: "methods-quiz",
        title: { en: "Methods quiz", uk: "Тест: методи" },
        questions: [
          {
            id: "return-type",
            mode: "single",
            prompt: {
              en: "Which part of `static int Square(int x)` is the return type?",
              uk: "Яка частина `static int Square(int x)` є типом значення, що повертається?",
            },
            options: [
              { id: "a", text: { en: "The first `int`", uk: "Перший `int`" } },
              { id: "b", text: { en: "The second `int`", uk: "Другий `int`" } },
              { id: "c", text: { en: "`static`", uk: "`static`" } },
              { id: "d", text: { en: "`x`", uk: "`x`" } },
            ],
            correct: ["a"],
          },
          {
            id: "void",
            mode: "single",
            prompt: { en: "What does `void` mean in a method declaration?", uk: "Що означає `void` в оголошенні методу?" },
            options: [
              { id: "a", text: { en: "The method returns no value", uk: "Метод не повертає значення" } },
              { id: "b", text: { en: "The method has no parameters", uk: "Метод не має параметрів" } },
              { id: "c", text: { en: "The method can never be called", uk: "Метод неможливо викликати" } },
              { id: "d", text: { en: "The method returns 0", uk: "Метод повертає 0" } },
            ],
            correct: ["a"],
          },
          {
            id: "nested-call",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nstatic int Triple(int x)\n{\n    return x * 3;\n}\n\nstatic void Main()\n{\n    Console.WriteLine(Triple(Triple(2)));\n}\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nstatic int Triple(int x)\n{\n    return x * 3;\n}\n\nstatic void Main()\n{\n    Console.WriteLine(Triple(Triple(2)));\n}\n```",
            },
            options: [
              { id: "a", text: { en: "6", uk: "6" } },
              { id: "b", text: { en: "9", uk: "9" } },
              { id: "c", text: { en: "18", uk: "18" } },
              { id: "d", text: { en: "12", uk: "12" } },
            ],
            correct: ["c"],
          },
          {
            id: "by-value",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nstatic void Reset(int x)\n{\n    x = 0;\n}\n\nstatic void Main()\n{\n    int n = 7;\n    Reset(n);\n    Console.WriteLine(n);\n}\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nstatic void Reset(int x)\n{\n    x = 0;\n}\n\nstatic void Main()\n{\n    int n = 7;\n    Reset(n);\n    Console.WriteLine(n);\n}\n```",
            },
            options: [
              { id: "a", text: { en: "0", uk: "0" } },
              { id: "b", text: { en: "7", uk: "7" } },
              { id: "c", text: { en: "Nothing, it does not compile", uk: "Нічого, вона не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "valid-calls",
            mode: "multi",
            prompt: {
              en: "The method is `static double Average(double a, double b)`. Which calls are valid?",
              uk: "Метод оголошено як `static double Average(double a, double b)`. Які виклики коректні?",
            },
            options: [
              { id: "a", text: { en: "`Average(2, 3)`", uk: "`Average(2, 3)`" } },
              { id: "b", text: { en: "`Average(2.5, 4)`", uk: "`Average(2.5, 4)`" } },
              { id: "c", text: { en: "`Average(\"2\", \"3\")`", uk: "`Average(\"2\", \"3\")`" } },
              { id: "d", text: { en: "`Average(2)`", uk: "`Average(2)`" } },
              { id: "e", text: { en: "`Average(1.5, 2.5)`", uk: "`Average(1.5, 2.5)`" } },
            ],
            correct: ["a", "b", "e"],
          },
          {
            id: "missing-return",
            mode: "single",
            prompt: {
              en: "What happens with this method?\n\n```csharp\nstatic int Twice(int x)\n{\n    int result = x * 2;\n}\n```",
              uk: "Що станеться з цим методом?\n\n```csharp\nstatic int Twice(int x)\n{\n    int result = x * 2;\n}\n```",
            },
            options: [
              { id: "a", text: { en: "It returns 0", uk: "Він повертає 0" } },
              { id: "b", text: { en: "It returns `x`", uk: "Він повертає `x`" } },
              {
                id: "c",
                text: {
                  en: "It does not compile: not all code paths return a value",
                  uk: "Він не компілюється: не всі шляхи виконання повертають значення",
                },
              },
              { id: "d", text: { en: "It compiles and crashes while running", uk: "Він компілюється, але аварійно завершується під час виконання" } },
            ],
            correct: ["c"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "wanted-methods",
        title: { en: "Wanted: methods!", uk: "Розшукуються методи!" },
        language: "csharp",
        starter: PROGRAM(`    static int Square(int x)
    {
        // Write your code here
        return 0;
    }

    static bool IsEven(int n)
    {
        // Write your code here
        return false;
    }

    static int Max3(int a, int b, int c)
    {
        // Write your code here
        return 0;
    }

    static string Greeting(string name)
    {
        // Write your code here
        return "";
    }

    static void Main()
    {
        Console.WriteLine(Square(7));
        Console.WriteLine(IsEven(10));
        Console.WriteLine(IsEven(7));
        Console.WriteLine(Max3(4, 19, 8));
        Console.WriteLine(Max3(-5, -2, -9));
        Console.WriteLine(Greeting("Ann"));
    }`),
        solution: PROGRAM(`    static int Square(int x)
    {
        return x * x;
    }

    static bool IsEven(int n)
    {
        return n % 2 == 0;
    }

    static int Max3(int a, int b, int c)
    {
        return Math.Max(a, Math.Max(b, c));
    }

    static string Greeting(string name)
    {
        return "Hello, " + name + "!";
    }

    static void Main()
    {
        Console.WriteLine(Square(7));
        Console.WriteLine(IsEven(10));
        Console.WriteLine(IsEven(7));
        Console.WriteLine(Max3(4, 19, 8));
        Console.WriteLine(Max3(-5, -2, -9));
        Console.WriteLine(Greeting("Ann"));
    }`),
        expectedOutput: "49\nTrue\nFalse\n19\n-2\nHello, Ann!\n",
      },
      {
        kind: "practice",
        slug: "kind-employer",
        title: { en: "A kind employer", uk: "Добрий роботодавець" },
        language: "csharp",
        starter: PROGRAM(`    // The salary increased by the given percent
    static int Raise(int salary, int percent)
    {
        return salary + salary * (percent / 100);
    }

    // Twelve monthly salaries plus the bonus
    static int YearlyIncome(int monthlySalary, int bonus)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        int salary = 2000;
        int raised = Raise(salary, 15);
        Console.WriteLine("New salary: " + raised);
        Console.WriteLine("Per year: " + YearlyIncome(raised, 500));
    }`),
        solution: PROGRAM(`    // The salary increased by the given percent
    static int Raise(int salary, int percent)
    {
        return salary + salary * percent / 100;
    }

    // Twelve monthly salaries plus the bonus
    static int YearlyIncome(int monthlySalary, int bonus)
    {
        return monthlySalary * 12 + bonus;
    }

    static void Main()
    {
        int salary = 2000;
        int raised = Raise(salary, 15);
        Console.WriteLine("New salary: " + raised);
        Console.WriteLine("Per year: " + YearlyIncome(raised, 500));
    }`),
        expectedOutput: "New salary: 2300\nPer year: 28100\n",
      },
      {
        kind: "quiz",
        slug: "first-steps-review",
        title: { en: "Module review", uk: "Підсумковий тест" },
        questions: [
          {
            id: "var-division",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nvar x = 7 / 2;\nConsole.WriteLine(x);\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nvar x = 7 / 2;\nConsole.WriteLine(x);\n```",
            },
            options: [
              { id: "a", text: { en: "3.5", uk: "3.5" } },
              { id: "b", text: { en: "3", uk: "3" } },
              { id: "c", text: { en: "4", uk: "4" } },
              { id: "d", text: { en: "It does not compile", uk: "Вона не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "cast",
            mode: "single",
            prompt: { en: "What is the value of `(int)3.99`?", uk: "Чому дорівнює `(int)3.99`?" },
            options: [
              { id: "a", text: { en: "3", uk: "3" } },
              { id: "b", text: { en: "4", uk: "4" } },
              { id: "c", text: { en: "3.99", uk: "3.99" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "text-plus",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(\"12\" + \"30\");` print?", uk: "Що надрукує `Console.WriteLine(\"12\" + \"30\");`?" },
            options: [
              { id: "a", text: { en: "42", uk: "42" } },
              { id: "b", text: { en: "1230", uk: "1230" } },
              { id: "c", text: { en: "12 30", uk: "12 30" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "string-length",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nstring s = \"abc\";\ns = s + \"d\";\nConsole.WriteLine(s.Length);\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nstring s = \"abc\";\ns = s + \"d\";\nConsole.WriteLine(s.Length);\n```",
            },
            options: [
              { id: "a", text: { en: "3", uk: "3" } },
              { id: "b", text: { en: "4", uk: "4" } },
              { id: "c", text: { en: "abcd", uk: "abcd" } },
            ],
            correct: ["b"],
          },
          {
            id: "var-facts",
            mode: "single",
            prompt: { en: "Which statement about `var` is true?", uk: "Яке твердження про `var` правильне?" },
            options: [
              {
                id: "a",
                text: {
                  en: "The compiler fixes the type from the initial value, and it never changes",
                  uk: "Компілятор визначає тип за початковим значенням, і він більше не змінюється",
                },
              },
              { id: "b", text: { en: "The type can change while the program runs", uk: "Тип може змінюватися під час виконання програми" } },
              { id: "c", text: { en: "A `var` variable can be declared without a value", uk: "Змінну `var` можна оголосити без значення" } },
              { id: "d", text: { en: "`var` makes the program slower than an explicit type", uk: "`var` робить програму повільнішою за явний тип" } },
            ],
            correct: ["a"],
          },
          {
            id: "safe-parse",
            mode: "single",
            prompt: {
              en: "Text typed by a user may be invalid. Which call turns it into an `int` without risking an exception?",
              uk: "Текст, який ввів користувач, може бути хибним. Який виклик перетворює його на `int` без ризику винятку?",
            },
            options: [
              { id: "a", text: { en: "`int.Parse(text)`", uk: "`int.Parse(text)`" } },
              { id: "b", text: { en: "`Convert.ToInt32(text)`", uk: "`Convert.ToInt32(text)`" } },
              { id: "c", text: { en: "`int.TryParse(text, out int n)`", uk: "`int.TryParse(text, out int n)`" } },
              { id: "d", text: { en: "`(int)text`", uk: "`(int)text`" } },
            ],
            correct: ["c"],
          },
        ],
      },
    ],
  },
  {
    slug: "errors",
    title: { en: "Errors", uk: "Помилки" },
    slides: [
      { kind: "lecture", slug: "kinds-of-errors", title: { en: "Three kinds of errors", uk: "Три види помилок" } },
      {
        kind: "practice",
        slug: "fix-the-bugs",
        title: { en: "Fix the bugs", uk: "Виправте помилки" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        int a = 4, b = 8, c = 9
        double average = a + b + c / 3;
        Console.WriteLine(average);

        int width = 5, height = 8;
        int perimeter = 2 * width + height;
        Console.WriteLine(perimeter);
    }`),
        solution: PROGRAM(`    static void Main()
    {
        int a = 4, b = 8, c = 9;
        double average = (a + b + c) / 3.0;
        Console.WriteLine(average);

        int width = 5, height = 8;
        int perimeter = 2 * (width + height);
        Console.WriteLine(perimeter);
    }`),
        expectedOutput: "7\n26\n",
      },
    ],
  },
  {
    slug: "branching",
    title: { en: "Branching", uk: "Розгалуження" },
    slides: [
      { kind: "lecture", slug: "if-else", title: { en: "if, else and switch", uk: "if, else та switch" } },
      {
        kind: "practice",
        slug: "leap-year",
        title: { en: "Leap year", uk: "Високосний рік" },
        language: "csharp",
        starter: PROGRAM(`    static bool IsLeapYear(int year)
    {
        // Write your code here
        return false;
    }

    static void Main()
    {
        Console.WriteLine(IsLeapYear(1900));
        Console.WriteLine(IsLeapYear(2000));
        Console.WriteLine(IsLeapYear(2024));
        Console.WriteLine(IsLeapYear(2023));
    }`),
        solution: PROGRAM(`    static bool IsLeapYear(int year)
    {
        return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    }

    static void Main()
    {
        Console.WriteLine(IsLeapYear(1900));
        Console.WriteLine(IsLeapYear(2000));
        Console.WriteLine(IsLeapYear(2024));
        Console.WriteLine(IsLeapYear(2023));
    }`),
        expectedOutput: "False\nTrue\nTrue\nFalse\n",
      },
    ],
  },
  {
    slug: "loops",
    title: { en: "Loops", uk: "Цикли" },
    slides: [
      { kind: "lecture", slug: "while-and-for", title: { en: "while and for", uk: "while та for" } },
      {
        kind: "practice",
        slug: "fizzbuzz",
        title: { en: "FizzBuzz", uk: "FizzBuzz" },
        language: "csharp",
        starter: EMPTY_MAIN,
        solution: PROGRAM(`    static void Main()
    {
        for (var i = 1; i <= 15; i++)
        {
            if (i % 15 == 0) Console.WriteLine("FizzBuzz");
            else if (i % 3 == 0) Console.WriteLine("Fizz");
            else if (i % 5 == 0) Console.WriteLine("Buzz");
            else Console.WriteLine(i);
        }
    }`),
        expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n",
      },
    ],
  },
  {
    slug: "arrays",
    title: { en: "Arrays", uk: "Масиви" },
    slides: [
      { kind: "lecture", slug: "arrays-basics", title: { en: "Working with arrays", uk: "Робота з масивами" } },
      {
        kind: "practice",
        slug: "index-of-max",
        title: { en: "Index of the maximum", uk: "Індекс максимуму" },
        language: "csharp",
        starter: PROGRAM(`    static int IndexOfMax(int[] numbers)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        Console.WriteLine(IndexOfMax(new[] { 3, 17, -4, 17, 9 }));
        Console.WriteLine(IndexOfMax(new[] { -5, -2, -9 }));
        Console.WriteLine(IndexOfMax(new[] { 42 }));
        Console.WriteLine(IndexOfMax(new int[0]));
    }`),
        solution: PROGRAM(`    static int IndexOfMax(int[] numbers)
    {
        if (numbers.Length == 0) return -1;
        var best = 0;
        for (var i = 1; i < numbers.Length; i++)
            if (numbers[i] > numbers[best]) best = i;
        return best;
    }

    static void Main()
    {
        Console.WriteLine(IndexOfMax(new[] { 3, 17, -4, 17, 9 }));
        Console.WriteLine(IndexOfMax(new[] { -5, -2, -9 }));
        Console.WriteLine(IndexOfMax(new[] { 42 }));
        Console.WriteLine(IndexOfMax(new int[0]));
    }`),
        expectedOutput: "1\n1\n0\n-1\n",
      },
    ],
  },
  {
    slug: "collections-strings-files",
    title: { en: "Collections, strings, files", uk: "Колекції, рядки, файли" },
    slides: [
      { kind: "lecture", slug: "lists-dictionaries-strings", title: { en: "Lists, dictionaries and strings", uk: "Списки, словники та рядки" } },
      {
        kind: "practice",
        slug: "word-frequency",
        title: { en: "Word frequency", uk: "Частота слів" },
        language: "csharp",
        starter: PROGRAM(
          `    static void Main()
    {
        var text = "The cat and the dog and THE bird";
        // Print every word in lower case with its count,
        // in the order the words first appear: "the: 3"
    }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM(
          `    static void Main()
    {
        var text = "The cat and the dog and THE bird";
        var counts = new Dictionary<string, int>();
        var order = new List<string>();
        foreach (var raw in text.Split(' '))
        {
            var word = raw.ToLower();
            if (!counts.ContainsKey(word))
            {
                counts[word] = 0;
                order.Add(word);
            }
            counts[word]++;
        }
        foreach (var word in order)
            Console.WriteLine(word + ": " + counts[word]);
    }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "the: 3\ncat: 1\nand: 2\ndog: 1\nbird: 1\n",
      },
    ],
  },
  {
    slug: "testing",
    title: { en: "Testing", uk: "Тестування" },
    slides: [
      { kind: "lecture", slug: "why-test", title: { en: "Checking your code with tests", uk: "Перевірка коду тестами" } },
      {
        kind: "practice",
        slug: "capitalize",
        title: { en: "Make the tests pass", uk: "Зробіть тести зеленими" },
        language: "csharp",
        starter: PROGRAM(`    static string Capitalize(string s)
    {
        return s.Substring(0, 1).ToUpper() + s.Substring(1);
    }

    static void Check(string input, string expected)
    {
        string actual;
        try { actual = Capitalize(input); }
        catch (Exception e) { actual = e.GetType().Name; }
        var status = actual == expected ? "ok" : "FAIL";
        Console.WriteLine(status + ": \\"" + input + "\\" -> \\"" + actual + "\\"");
    }

    static void Main()
    {
        Check("hello", "Hello");
        Check("a", "A");
        Check("Already", "Already");
        Check("", "");
    }`),
        solution: PROGRAM(`    static string Capitalize(string s)
    {
        if (s.Length == 0) return s;
        return s.Substring(0, 1).ToUpper() + s.Substring(1);
    }

    static void Check(string input, string expected)
    {
        string actual;
        try { actual = Capitalize(input); }
        catch (Exception e) { actual = e.GetType().Name; }
        var status = actual == expected ? "ok" : "FAIL";
        Console.WriteLine(status + ": \\"" + input + "\\" -> \\"" + actual + "\\"");
    }

    static void Main()
    {
        Check("hello", "Hello");
        Check("a", "A");
        Check("Already", "Already");
        Check("", "");
    }`),
        expectedOutput: 'ok: "hello" -> "Hello"\nok: "a" -> "A"\nok: "Already" -> "Already"\nok: "" -> ""\n',
      },
    ],
  },
  {
    slug: "complexity",
    title: { en: "Algorithm complexity", uk: "Складність алгоритмів" },
    slides: [
      { kind: "lecture", slug: "big-o", title: { en: "Counting the work: Big O", uk: "Рахуємо роботу: O-нотація" } },
      {
        kind: "practice",
        slug: "binary-search",
        title: { en: "Binary search", uk: "Бінарний пошук" },
        language: "csharp",
        starter: PROGRAM(`    // Return the index of value in the sorted array, or -1 if it is not there.
    // Aim for O(log n): halve the search range on every step.
    static int BinarySearch(int[] sorted, int value)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        var numbers = new[] { 1, 3, 5, 7, 9, 11, 13 };
        foreach (var value in new[] { 7, 1, 13, 4, 20 })
            Console.WriteLine(value + " -> " + BinarySearch(numbers, value));
    }`),
        solution: PROGRAM(`    // Return the index of value in the sorted array, or -1 if it is not there.
    // Aim for O(log n): halve the search range on every step.
    static int BinarySearch(int[] sorted, int value)
    {
        int left = 0, right = sorted.Length - 1;
        while (left <= right)
        {
            var middle = left + (right - left) / 2;
            if (sorted[middle] == value) return middle;
            if (sorted[middle] < value) left = middle + 1;
            else right = middle - 1;
        }
        return -1;
    }

    static void Main()
    {
        var numbers = new[] { 1, 3, 5, 7, 9, 11, 13 };
        foreach (var value in new[] { 7, 1, 13, 4, 20 })
            Console.WriteLine(value + " -> " + BinarySearch(numbers, value));
    }`),
        expectedOutput: "7 -> 3\n1 -> 0\n13 -> 6\n4 -> -1\n20 -> -1\n",
      },
    ],
  },
];
