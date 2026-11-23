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
      { kind: "lecture", slug: "compile-errors", title: { en: "Compile errors", uk: "Помилки компіляції" } },
      {
        kind: "quiz",
        slug: "compile-errors-quiz",
        title: { en: "Compile errors quiz", uk: "Тест: помилки компіляції" },
        questions: [
          {
            id: "semicolon",
            mode: "single",
            prompt: {
              en: "The compiler reports `error CS1002: ; expected`. What is the most likely cause?",
              uk: "Компілятор повідомляє `error CS1002: ; expected`. Яка найімовірніша причина?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "A semicolon is missing, often at the end of the previous line",
                  uk: "Пропущено крапку з комою, часто наприкінці попереднього рядка",
                },
              },
              { id: "b", text: { en: "The program divided by zero", uk: "Програма поділила на нуль" } },
              { id: "c", text: { en: "The computer ran out of memory", uk: "У комп'ютера закінчилася пам'ять" } },
              { id: "d", text: { en: "The result of the calculation is wrong", uk: "Результат обчислення хибний" } },
            ],
            correct: ["a"],
          },
          {
            id: "first-error",
            mode: "single",
            prompt: {
              en: "The compiler lists 12 errors. Where should you start?",
              uk: "Компілятор перелічив 12 помилок. З чого почати?",
            },
            options: [
              { id: "a", text: { en: "With the last one", uk: "З останньої" } },
              { id: "b", text: { en: "With the first one, then recompile", uk: "З першої, а потім перекомпілювати" } },
              { id: "c", text: { en: "With the one that looks the hardest", uk: "З тієї, що здається найскладнішою" } },
              { id: "d", text: { en: "Ignore them: most are not real", uk: "Ігнорувати їх: більшість несправжні" } },
            ],
            correct: ["b"],
          },
          {
            id: "which-compile",
            mode: "multi",
            prompt: { en: "Which of these are compile errors?", uk: "Які з наведеного є помилками компіляції?" },
            options: [
              { id: "a", text: { en: "`int x = \"5\";`", uk: "`int x = \"5\";`" } },
              { id: "b", text: { en: "`Console.Writeline(\"hi\");`", uk: "`Console.Writeline(\"hi\");`" } },
              { id: "c", text: { en: "`int n = int.Parse(\"abc\");`", uk: "`int n = int.Parse(\"abc\");`" } },
              { id: "d", text: { en: "`double average = a + b / 2;`", uk: "`double average = a + b / 2;`" } },
              { id: "e", text: { en: "`int y; Console.WriteLine(y);`", uk: "`int y; Console.WriteLine(y);`" } },
            ],
            correct: ["a", "b", "e"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "typos",
        title: { en: "Typos", uk: "Одруківки" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        strng course = "Assay";
        Console.Writeline("Welcome to " + Course);
        int year = 2026
        Console.WriteLine("Year: " + year);
        Console.WriteLine("Done!";
    }`),
        solution: PROGRAM(`    static void Main()
    {
        string course = "Assay";
        Console.WriteLine("Welcome to " + course);
        int year = 2026;
        Console.WriteLine("Year: " + year);
        Console.WriteLine("Done!");
    }`),
        expectedOutput: "Welcome to Assay\nYear: 2026\nDone!\n",
      },
      { kind: "lecture", slug: "runtime-errors", title: { en: "Runtime errors and exceptions", uk: "Помилки виконання та винятки" } },
      {
        kind: "quiz",
        slug: "runtime-errors-quiz",
        title: { en: "Exceptions quiz", uk: "Тест: винятки" },
        questions: [
          {
            id: "format",
            mode: "single",
            prompt: { en: "Which exception does `int.Parse(\"4.5\")` throw?", uk: "Який виняток кидає `int.Parse(\"4.5\")`?" },
            options: [
              { id: "a", text: { en: "`DivideByZeroException`", uk: "`DivideByZeroException`" } },
              { id: "b", text: { en: "`FormatException`", uk: "`FormatException`" } },
              { id: "c", text: { en: "`NullReferenceException`", uk: "`NullReferenceException`" } },
              { id: "d", text: { en: "`IndexOutOfRangeException`", uk: "`IndexOutOfRangeException`" } },
            ],
            correct: ["b"],
          },
          {
            id: "null",
            mode: "single",
            prompt: {
              en: "Which exception does this code throw?\n\n```csharp\nstring s = null;\nConsole.WriteLine(s.Length);\n```",
              uk: "Який виняток кидає цей код?\n\n```csharp\nstring s = null;\nConsole.WriteLine(s.Length);\n```",
            },
            options: [
              { id: "a", text: { en: "`FormatException`", uk: "`FormatException`" } },
              { id: "b", text: { en: "`OverflowException`", uk: "`OverflowException`" } },
              { id: "c", text: { en: "`NullReferenceException`", uk: "`NullReferenceException`" } },
              { id: "d", text: { en: "None: it prints 0", uk: "Жодного: він друкує 0" } },
            ],
            correct: ["c"],
          },
          {
            id: "finally",
            mode: "single",
            prompt: { en: "When does the `finally` block run?", uk: "Коли виконується блок `finally`?" },
            options: [
              { id: "a", text: { en: "Only when an exception was thrown", uk: "Лише коли було кинуто виняток" } },
              { id: "b", text: { en: "Only when no exception was thrown", uk: "Лише коли виняток не було кинуто" } },
              { id: "c", text: { en: "Both when an exception was thrown and when it was not", uk: "І коли виняток було кинуто, і коли ні" } },
              { id: "d", text: { en: "Never, it is only a comment", uk: "Ніколи, це лише коментар" } },
            ],
            correct: ["c"],
          },
          {
            id: "expected-bad-input",
            mode: "single",
            prompt: {
              en: "Users often type text that is not a number. What is the best way to deal with that?",
              uk: "Користувачі часто вводять текст, що не є числом. Як найкраще з цим упоратися?",
            },
            options: [
              { id: "a", text: { en: "Use `int.TryParse` and check the result", uk: "Використати `int.TryParse` і перевірити результат" } },
              { id: "b", text: { en: "Wrap everything in `catch (Exception) { }` with an empty body", uk: "Обгорнути все в `catch (Exception) { }` з порожнім тілом" } },
              { id: "c", text: { en: "Hope that nobody does it", uk: "Сподіватися, що ніхто так не зробить" } },
            ],
            correct: ["a"],
          },
          {
            id: "stack-trace",
            mode: "single",
            prompt: {
              en: "Where do you usually look first in a stack trace?",
              uk: "Куди зазвичай дивляться першим у трасуванні стека?",
            },
            options: [
              { id: "a", text: { en: "At the last line", uk: "На останній рядок" } },
              { id: "b", text: { en: "At the first line that points into your own code", uk: "На перший рядок, що вказує на ваш власний код" } },
              { id: "c", text: { en: "At the exception's name in the middle", uk: "На назву винятку посередині" } },
            ],
            correct: ["b"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "catch-exceptions",
        title: { en: "Catch the exceptions", uk: "Перехопіть винятки" },
        language: "csharp",
        starter: PROGRAM(`    static string Divide(string a, string b)
    {
        int result = int.Parse(a) / int.Parse(b);
        return "Result: " + result;
    }

    static void Main()
    {
        Console.WriteLine(Divide("20", "4"));
        Console.WriteLine(Divide("20", "0"));
        Console.WriteLine(Divide("20", "x"));
        Console.WriteLine(Divide("99999999999", "1"));
        Console.WriteLine("Done");
    }`),
        solution: PROGRAM(`    static string Divide(string a, string b)
    {
        try
        {
            int result = int.Parse(a) / int.Parse(b);
            return "Result: " + result;
        }
        catch (DivideByZeroException)
        {
            return "Cannot divide by zero";
        }
        catch (FormatException)
        {
            return "Not a number";
        }
        catch (OverflowException)
        {
            return "Number is too big";
        }
    }

    static void Main()
    {
        Console.WriteLine(Divide("20", "4"));
        Console.WriteLine(Divide("20", "0"));
        Console.WriteLine(Divide("20", "x"));
        Console.WriteLine(Divide("99999999999", "1"));
        Console.WriteLine("Done");
    }`),
        expectedOutput: "Result: 5\nCannot divide by zero\nNot a number\nNumber is too big\nDone\n",
      },
      { kind: "lecture", slug: "logic-errors", title: { en: "Logic errors", uk: "Логічні помилки" } },
      {
        kind: "practice",
        slug: "bug-hunt",
        title: { en: "Bug hunt", uk: "Полювання на баги" },
        language: "csharp",
        starter: PROGRAM(`    static double Average(int a, int b)
    {
        return (a + b) / 2;
    }

    static double ToFahrenheit(double c)
    {
        return c * (9 / 5) + 32;
    }

    static double Percent(int part, int total)
    {
        return part / total * 100;
    }

    static int Perimeter(int w, int h)
    {
        return 2 * w + h;
    }

    static void Main()
    {
        Console.WriteLine(Average(1, 2));
        Console.WriteLine(ToFahrenheit(100));
        Console.WriteLine(Percent(1, 4));
        Console.WriteLine(Perimeter(3, 4));
    }`),
        solution: PROGRAM(`    static double Average(int a, int b)
    {
        return (a + b) / 2.0;
    }

    static double ToFahrenheit(double c)
    {
        return c * 9 / 5 + 32;
    }

    static double Percent(int part, int total)
    {
        return (double)part / total * 100;
    }

    static int Perimeter(int w, int h)
    {
        return 2 * (w + h);
    }

    static void Main()
    {
        Console.WriteLine(Average(1, 2));
        Console.WriteLine(ToFahrenheit(100));
        Console.WriteLine(Percent(1, 4));
        Console.WriteLine(Perimeter(3, 4));
    }`),
        expectedOutput: "1.5\n212\n25\n14\n",
      },
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
      { kind: "lecture", slug: "debugging", title: { en: "Debugging", uk: "Налагодження" } },
      {
        kind: "quiz",
        slug: "debugging-quiz",
        title: { en: "Debugging quiz", uk: "Тест: налагодження" },
        questions: [
          {
            id: "start-key",
            mode: "single",
            prompt: {
              en: "Which key starts the program with debugging in Visual Studio and VS Code?",
              uk: "Яка клавіша запускає програму з налагодженням у Visual Studio та VS Code?",
            },
            options: [
              { id: "a", text: { en: "`F5`", uk: "`F5`" } },
              { id: "b", text: { en: "`F10`", uk: "`F10`" } },
              { id: "c", text: { en: "`Shift+F11`", uk: "`Shift+F11`" } },
              { id: "d", text: { en: "`Ctrl+S`", uk: "`Ctrl+S`" } },
            ],
            correct: ["a"],
          },
          {
            id: "step-into",
            mode: "single",
            prompt: {
              en: "The current line calls a method. Which key goes **inside** that method?",
              uk: "Поточний рядок викликає метод. Яка клавіша заходить **усередину** цього методу?",
            },
            options: [
              { id: "a", text: { en: "`F10` (step over)", uk: "`F10` (крок з обходом)" } },
              { id: "b", text: { en: "`F11` (step into)", uk: "`F11` (крок із заходом)" } },
              { id: "c", text: { en: "`Shift+F11` (step out)", uk: "`Shift+F11` (вийти з методу)" } },
              { id: "d", text: { en: "`F9` (breakpoint)", uk: "`F9` (точка зупину)" } },
            ],
            correct: ["b"],
          },
          {
            id: "breakpoint",
            mode: "single",
            prompt: {
              en: "When the program stops at a breakpoint, has the line with the breakpoint already been executed?",
              uk: "Коли програма зупиняється на точці зупину, чи вже виконано рядок із цією точкою?",
            },
            options: [
              { id: "a", text: { en: "No, it stops before running that line", uk: "Ні, вона зупиняється до виконання цього рядка" } },
              { id: "b", text: { en: "Yes, it stops right after running that line", uk: "Так, вона зупиняється одразу після виконання цього рядка" } },
            ],
            correct: ["a"],
          },
          {
            id: "inspect",
            mode: "multi",
            prompt: {
              en: "Which of these let you see the current value of a variable while the program is paused?",
              uk: "Що з наведеного дає змогу побачити поточне значення змінної, поки програму призупинено?",
            },
            options: [
              { id: "a", text: { en: "The Locals window", uk: "Вікно Locals" } },
              { id: "b", text: { en: "The Watch window", uk: "Вікно Watch" } },
              { id: "c", text: { en: "Hovering over the variable in the editor", uk: "Наведення курсора на змінну в редакторі" } },
              { id: "d", text: { en: "The window with the list of project files", uk: "Вікно зі списком файлів проєкту" } },
            ],
            correct: ["a", "b", "c"],
          },
          {
            id: "one-change",
            mode: "single",
            prompt: {
              en: "You have a hypothesis about a bug. What is the best way to test it?",
              uk: "У вас є гіпотеза щодо помилки. Як найкраще її перевірити?",
            },
            options: [
              { id: "a", text: { en: "Change one thing and run the program again", uk: "Змінити щось одне й запустити програму знову" } },
              { id: "b", text: { en: "Change everything that looks suspicious at once", uk: "Змінити одразу все, що здається підозрілим" } },
              { id: "c", text: { en: "Rewrite the program from scratch", uk: "Переписати програму з нуля" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "style", title: { en: "Style and readability", uk: "Стиль і читабельність" } },
      { kind: "lecture", slug: "refactoring", title: { en: "Refactoring", uk: "Рефакторинг" } },
      { kind: "lecture", slug: "constants-and-enums", title: { en: "Constants and enums", uk: "Константи та enum" } },
      {
        kind: "quiz",
        slug: "design-quiz",
        title: { en: "Code design quiz", uk: "Тест: дизайн коду" },
        questions: [
          {
            id: "method-name",
            mode: "single",
            prompt: {
              en: "Which is the best name for a method that checks whether a number is even?",
              uk: "Яка назва найкраща для методу, що перевіряє, чи число парне?",
            },
            options: [
              { id: "a", text: { en: "`Check`", uk: "`Check`" } },
              { id: "b", text: { en: "`IsEven`", uk: "`IsEven`" } },
              { id: "c", text: { en: "`DoIt`", uk: "`DoIt`" } },
              { id: "d", text: { en: "`even1`", uk: "`even1`" } },
            ],
            correct: ["b"],
          },
          {
            id: "magic-number",
            mode: "single",
            prompt: {
              en: "What is a \"magic number\"?",
              uk: "Що таке «магічне число»?",
            },
            options: [
              { id: "a", text: { en: "A literal in the code whose meaning is not obvious, such as the `0.2` in `price * 0.2`", uk: "Літерал у коді, сенс якого неочевидний, як-от `0.2` у `price * 0.2`" } },
              { id: "b", text: { en: "A number that is always prime", uk: "Число, яке завжди просте" } },
              { id: "c", text: { en: "The result of `Random.Next()`", uk: "Результат `Random.Next()`" } },
            ],
            correct: ["a"],
          },
          {
            id: "refactoring-def",
            mode: "single",
            prompt: { en: "What does refactoring mean?", uk: "Що означає рефакторинг?" },
            options: [
              { id: "a", text: { en: "Changing the structure of code without changing its behavior", uk: "Зміна структури коду без зміни його поведінки" } },
              { id: "b", text: { en: "Adding a new feature to the program", uk: "Додавання нової функції до програми" } },
              { id: "c", text: { en: "Fixing a bug", uk: "Виправлення помилки" } },
              { id: "d", text: { en: "Making the program run faster", uk: "Прискорення роботи програми" } },
            ],
            correct: ["a"],
          },
          {
            id: "extract-why",
            mode: "multi",
            prompt: { en: "Which are good reasons to extract a method?", uk: "Які причини виділити метод добрі?" },
            options: [
              { id: "a", text: { en: "The same code is copied in several places", uk: "Той самий код скопійовано в кількох місцях" } },
              { id: "b", text: { en: "A block of code deserves a descriptive name", uk: "Блок коду заслуговує на промовисте ім'я" } },
              { id: "c", text: { en: "To change what the program prints", uk: "Щоб змінити те, що друкує програма" } },
              { id: "d", text: { en: "To make the code longer", uk: "Щоб зробити код довшим" } },
            ],
            correct: ["a", "b"],
          },
          {
            id: "enum-value",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nenum Level { Low, Medium, High }\n\nConsole.WriteLine((int)Level.High);\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nenum Level { Low, Medium, High }\n\nConsole.WriteLine((int)Level.High);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "2", uk: "2" } },
              { id: "c", text: { en: "3", uk: "3" } },
              { id: "d", text: { en: "High", uk: "High" } },
            ],
            correct: ["b"],
          },
          {
            id: "comments",
            mode: "single",
            prompt: { en: "Which comment is the most useful?", uk: "Який коментар найкорисніший?" },
            options: [
              { id: "a", text: { en: "`// add one to i` above `i++;`", uk: "`// add one to i` над `i++;`" } },
              { id: "b", text: { en: "`// the API counts pages from 1, not from 0` above `page = index + 1;`", uk: "`// the API counts pages from 1, not from 0` над `page = index + 1;`" } },
              { id: "c", text: { en: "`// TODO` with nothing else", uk: "`// TODO` без жодних пояснень" } },
            ],
            correct: ["b"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "copy-paste-bug",
        title: { en: "The copy-paste bug", uk: "Помилка копіювання" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        int priceA = 100;
        int vatA = priceA * 20 / 100;
        Console.WriteLine("Laptop: " + priceA + " + VAT " + vatA + " = " + (priceA + vatA));

        int priceB = 40;
        int vatB = priceB * 20 / 100;
        Console.WriteLine("Mouse: " + priceB + " + VAT " + vatB + " = " + (priceB + vatB));

        int priceC = 15;
        int vatC = priceC * 2 / 100;
        Console.WriteLine("Cable: " + priceC + " + VAT " + vatC + " = " + (priceC + vatC));
    }`),
        solution: PROGRAM(`    const int VatPercent = 20;

    static void PrintWithVat(string name, int price)
    {
        int vat = price * VatPercent / 100;
        Console.WriteLine(name + ": " + price + " + VAT " + vat + " = " + (price + vat));
    }

    static void Main()
    {
        PrintWithVat("Laptop", 100);
        PrintWithVat("Mouse", 40);
        PrintWithVat("Cable", 15);
    }`),
        expectedOutput: "Laptop: 100 + VAT 20 = 120\nMouse: 40 + VAT 8 = 48\nCable: 15 + VAT 3 = 18\n",
      },
      {
        kind: "practice",
        slug: "weekday-enum",
        title: { en: "Days of the week", uk: "Дні тижня" },
        language: "csharp",
        starter: PROGRAM(`    // Declare the enum Weekday here

    static void Main()
    {
        Console.WriteLine(Weekday.Friday);
        Console.WriteLine((int)Weekday.Friday);
        Console.WriteLine((Weekday)7);
        Console.WriteLine((int)Weekday.Sunday - (int)Weekday.Monday);
    }`),
        solution: PROGRAM(`    enum Weekday
    {
        Monday = 1,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
        Saturday,
        Sunday
    }

    static void Main()
    {
        Console.WriteLine(Weekday.Friday);
        Console.WriteLine((int)Weekday.Friday);
        Console.WriteLine((Weekday)7);
        Console.WriteLine((int)Weekday.Sunday - (int)Weekday.Monday);
    }`),
        expectedOutput: "Friday\n5\nSunday\n6\n",
      },
      {
        kind: "practice",
        slug: "guess-the-formula",
        title: { en: "Guess the formula", uk: "Вгадай формулу" },
        language: "csharp",
        starter: PROGRAM(`    static int F(int n)
    {
        // Write your code here
        return 0;
    }

    static int G(int n)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        Console.WriteLine(F(0));
        Console.WriteLine(F(1));
        Console.WriteLine(F(2));
        Console.WriteLine(F(10));
        Console.WriteLine(F(-3));
        Console.WriteLine(F(50));
        Console.WriteLine(G(7));
        Console.WriteLine(G(10));
        Console.WriteLine(G(25));
        Console.WriteLine(G(13));
        Console.WriteLine(G(99));
        Console.WriteLine(G(1000));
    }`),
        solution: PROGRAM(`    static int F(int n)
    {
        return 2 * n + 3;
    }

    static int G(int n)
    {
        return n % 5;
    }

    static void Main()
    {
        Console.WriteLine(F(0));
        Console.WriteLine(F(1));
        Console.WriteLine(F(2));
        Console.WriteLine(F(10));
        Console.WriteLine(F(-3));
        Console.WriteLine(F(50));
        Console.WriteLine(G(7));
        Console.WriteLine(G(10));
        Console.WriteLine(G(25));
        Console.WriteLine(G(13));
        Console.WriteLine(G(99));
        Console.WriteLine(G(1000));
    }`),
        expectedOutput: "3\n5\n7\n23\n-3\n103\n2\n0\n0\n3\n4\n0\n",
      },
      {
        kind: "quiz",
        slug: "errors-review",
        title: { en: "Module review", uk: "Підсумковий тест" },
        questions: [
          {
            id: "which-kind",
            mode: "single",
            prompt: {
              en: "A program compiles and finishes without any message, but prints 5 where 6 is expected. What kind of error is it?",
              uk: "Програма компілюється й завершується без жодних повідомлень, але друкує 5 замість очікуваних 6. Який це різновид помилки?",
            },
            options: [
              { id: "a", text: { en: "A compile error", uk: "Помилка компіляції" } },
              { id: "b", text: { en: "A runtime error (an exception)", uk: "Помилка виконання (виняток)" } },
              { id: "c", text: { en: "A logic error", uk: "Логічна помилка" } },
            ],
            correct: ["c"],
          },
          {
            id: "before-running",
            mode: "single",
            prompt: {
              en: "Which kind of error does the compiler report before the program starts?",
              uk: "Який різновид помилок компілятор повідомляє до запуску програми?",
            },
            options: [
              { id: "a", text: { en: "Compile errors", uk: "Помилки компіляції" } },
              { id: "b", text: { en: "Runtime errors", uk: "Помилки виконання" } },
              { id: "c", text: { en: "Logic errors", uk: "Логічні помилки" } },
            ],
            correct: ["a"],
          },
          {
            id: "empty-catch",
            mode: "single",
            prompt: {
              en: "What is the main danger of an empty `catch (Exception) { }` block?",
              uk: "У чому головна небезпека порожнього блоку `catch (Exception) { }`?",
            },
            options: [
              { id: "a", text: { en: "It makes the program slower", uk: "Він сповільнює програму" } },
              { id: "b", text: { en: "It hides every error, including bugs, so the program silently goes wrong", uk: "Він приховує всі помилки, зокрема баги, тож програма мовчки працює хибно" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "const-assign",
            mode: "single",
            prompt: {
              en: "What happens with this code?\n\n```csharp\nconst int Max = 10;\nMax = 20;\n```",
              uk: "Що станеться з цим кодом?\n\n```csharp\nconst int Max = 10;\nMax = 20;\n```",
            },
            options: [
              { id: "a", text: { en: "A compile error", uk: "Помилка компіляції" } },
              { id: "b", text: { en: "An exception while running", uk: "Виняток під час виконання" } },
              { id: "c", text: { en: "`Max` becomes 20", uk: "`Max` стає 20" } },
            ],
            correct: ["a"],
          },
          {
            id: "enum-print",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nenum Color { Red, Green, Blue }\n\nConsole.WriteLine(Color.Green);\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nenum Color { Red, Green, Blue }\n\nConsole.WriteLine(Color.Green);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "Green", uk: "Green" } },
              { id: "c", text: { en: "Color.Green", uk: "Color.Green" } },
              { id: "d", text: { en: "It does not compile", uk: "Вона не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "first-step",
            mode: "single",
            prompt: {
              en: "A bug was reported. What should you do first?",
              uk: "Повідомили про помилку. Що слід зробити першим?",
            },
            options: [
              { id: "a", text: { en: "Reproduce it and work out what the correct result should be", uk: "Відтворити її та з'ясувати, яким має бути правильний результат" } },
              { id: "b", text: { en: "Rewrite the module that seems to be responsible", uk: "Переписати модуль, який, схоже, відповідає" } },
              { id: "c", text: { en: "Add `try / catch` around everything", uk: "Обгорнути все в `try / catch`" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "cannon",
        title: { en: "Practice: Cannon", uk: "Практика «Гармата»" },
        language: "csharp",
        starter: PROGRAM(`    const double Gravity = 9.8;

    // Degrees -> radians
    static double ToRadians(double degrees)
    {
        // Write your code here
        return 0;
    }

    // v^2 * sin(2 * angle) / g
    static double Range(double speed, double angleDegrees)
    {
        // Write your code here
        return 0;
    }

    // 2 * v * sin(angle) / g
    static double FlightTime(double speed, double angleDegrees)
    {
        // Write your code here
        return 0;
    }

    // (v * sin(angle))^2 / (2 * g)
    static double MaxHeight(double speed, double angleDegrees)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        double speed = 20;
        double angle = 45;
        Console.WriteLine("Range: " + Math.Round(Range(speed, angle), 2));
        Console.WriteLine("Time: " + Math.Round(FlightTime(speed, angle), 2));
        Console.WriteLine("Height: " + Math.Round(MaxHeight(speed, angle), 2));
    }`),
        solution: PROGRAM(`    const double Gravity = 9.8;

    // Degrees -> radians
    static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }

    // v^2 * sin(2 * angle) / g
    static double Range(double speed, double angleDegrees)
    {
        return speed * speed * Math.Sin(2 * ToRadians(angleDegrees)) / Gravity;
    }

    // 2 * v * sin(angle) / g
    static double FlightTime(double speed, double angleDegrees)
    {
        return 2 * speed * Math.Sin(ToRadians(angleDegrees)) / Gravity;
    }

    // (v * sin(angle))^2 / (2 * g)
    static double MaxHeight(double speed, double angleDegrees)
    {
        double vertical = speed * Math.Sin(ToRadians(angleDegrees));
        return vertical * vertical / (2 * Gravity);
    }

    static void Main()
    {
        double speed = 20;
        double angle = 45;
        Console.WriteLine("Range: " + Math.Round(Range(speed, angle), 2));
        Console.WriteLine("Time: " + Math.Round(FlightTime(speed, angle), 2));
        Console.WriteLine("Height: " + Math.Round(MaxHeight(speed, angle), 2));
    }`),
        expectedOutput: "Range: 40.82\nTime: 2.89\nHeight: 10.2\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "billiards",
        title: { en: "Practice: Billiards", uk: "Практика «Більярд»" },
        language: "csharp",
        starter: PROGRAM(`    const double CueSpeed = 2.5;

    // Straight-line distance between two points
    static double Distance(double x1, double y1, double x2, double y2)
    {
        // Write your code here
        return 0;
    }

    // Direction from point 1 to point 2 in degrees, measured from the x axis
    static double AngleDegrees(double x1, double y1, double x2, double y2)
    {
        // Write your code here
        return 0;
    }

    // Time to cover the distance at a constant speed
    static double TravelTime(double distance, double speed)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        double distance = Distance(1, 2, 4, 6);
        Console.WriteLine("Distance: " + Math.Round(distance, 2));
        Console.WriteLine("Angle: " + Math.Round(AngleDegrees(1, 2, 4, 6), 2));
        Console.WriteLine("Time: " + Math.Round(TravelTime(distance, CueSpeed), 2));
    }`),
        solution: PROGRAM(`    const double CueSpeed = 2.5;

    // Straight-line distance between two points
    static double Distance(double x1, double y1, double x2, double y2)
    {
        double dx = x2 - x1;
        double dy = y2 - y1;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    // Direction from point 1 to point 2 in degrees, measured from the x axis
    static double AngleDegrees(double x1, double y1, double x2, double y2)
    {
        return Math.Atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }

    // Time to cover the distance at a constant speed
    static double TravelTime(double distance, double speed)
    {
        return distance / speed;
    }

    static void Main()
    {
        double distance = Distance(1, 2, 4, 6);
        Console.WriteLine("Distance: " + Math.Round(distance, 2));
        Console.WriteLine("Angle: " + Math.Round(AngleDegrees(1, 2, 4, 6), 2));
        Console.WriteLine("Time: " + Math.Round(TravelTime(distance, CueSpeed), 2));
    }`),
        expectedOutput: "Distance: 5\nAngle: 53.13\nTime: 2\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "branching",
    title: { en: "Branching", uk: "Розгалуження" },
    slides: [
      { kind: "lecture", slug: "booleans", title: { en: "Comparison and the bool type", uk: "Порівняння та логічний тип" } },
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
      { kind: "lecture", slug: "float-comparison", title: { en: "Comparing floating-point numbers", uk: "Порівняння чисел з плаваючою комою" } },
      { kind: "lecture", slug: "short-circuit", title: { en: "Full and short-circuit operators", uk: "Повні та скорочені оператори" } },
      {
        kind: "practice",
        slug: "queens-move",
        title: { en: "The queen's move", uk: "Хід ферзя" },
        language: "csharp",
        starter: PROGRAM(`    // A queen moves along a row, a column or a diagonal.
    // Squares are (column, row), each from 1 to 8.
    static bool CanQueenMove(int fromX, int fromY, int toX, int toY)
    {
        // Write your code here
        return false;
    }

    static void Main()
    {
        Console.WriteLine(CanQueenMove(1, 1, 1, 8));
        Console.WriteLine(CanQueenMove(1, 1, 8, 1));
        Console.WriteLine(CanQueenMove(1, 1, 8, 8));
        Console.WriteLine(CanQueenMove(3, 5, 6, 2));
        Console.WriteLine(CanQueenMove(1, 1, 2, 3));
        Console.WriteLine(CanQueenMove(4, 4, 4, 4));
        Console.WriteLine(CanQueenMove(2, 7, 5, 8));
        Console.WriteLine(CanQueenMove(8, 1, 1, 8));
    }`),
        solution: PROGRAM(`    // A queen moves along a row, a column or a diagonal.
    // Squares are (column, row), each from 1 to 8.
    static bool CanQueenMove(int fromX, int fromY, int toX, int toY)
    {
        if (fromX == toX && fromY == toY)
        {
            return false;
        }
        return fromX == toX
            || fromY == toY
            || Math.Abs(toX - fromX) == Math.Abs(toY - fromY);
    }

    static void Main()
    {
        Console.WriteLine(CanQueenMove(1, 1, 1, 8));
        Console.WriteLine(CanQueenMove(1, 1, 8, 1));
        Console.WriteLine(CanQueenMove(1, 1, 8, 8));
        Console.WriteLine(CanQueenMove(3, 5, 6, 2));
        Console.WriteLine(CanQueenMove(1, 1, 2, 3));
        Console.WriteLine(CanQueenMove(4, 4, 4, 4));
        Console.WriteLine(CanQueenMove(2, 7, 5, 8));
        Console.WriteLine(CanQueenMove(8, 1, 1, 8));
    }`),
        expectedOutput: "True\nTrue\nTrue\nTrue\nFalse\nFalse\nFalse\nTrue\n",
      },
      {
        kind: "practice",
        slug: "middle-of-three",
        title: { en: "Middle of three", uk: "Середнє з трьох" },
        language: "csharp",
        starter: PROGRAM(`    // Return the number that would be second if the three were sorted
    static int Middle(int a, int b, int c)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        Console.WriteLine(Middle(1, 2, 3));
        Console.WriteLine(Middle(3, 1, 2));
        Console.WriteLine(Middle(5, 5, 1));
        Console.WriteLine(Middle(-1, -5, -3));
        Console.WriteLine(Middle(7, 7, 7));
        Console.WriteLine(Middle(2, 9, 4));
        Console.WriteLine(Middle(10, 3, 10));
    }`),
        solution: PROGRAM(`    // Return the number that would be second if the three were sorted
    static int Middle(int a, int b, int c)
    {
        if ((a >= b && a <= c) || (a <= b && a >= c))
        {
            return a;
        }
        if ((b >= a && b <= c) || (b <= a && b >= c))
        {
            return b;
        }
        return c;
    }

    static void Main()
    {
        Console.WriteLine(Middle(1, 2, 3));
        Console.WriteLine(Middle(3, 1, 2));
        Console.WriteLine(Middle(5, 5, 1));
        Console.WriteLine(Middle(-1, -5, -3));
        Console.WriteLine(Middle(7, 7, 7));
        Console.WriteLine(Middle(2, 9, 4));
        Console.WriteLine(Middle(10, 3, 10));
    }`),
        expectedOutput: "2\n2\n5\n-3\n7\n4\n10\n",
      },
      { kind: "lecture", slug: "branching-mistakes", title: { en: "Typical branching errors", uk: "Типові помилки розгалужень" } },
      {
        kind: "quiz",
        slug: "conditions-quiz",
        title: { en: "Logical expressions and conditions", uk: "Логічні вирази та умови" },
        questions: [
          {
            id: "and",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(5 > 3 && 2 > 4);` print?", uk: "Що надрукує `Console.WriteLine(5 > 3 && 2 > 4);`?" },
            options: [
              { id: "a", text: { en: "True", uk: "True" } },
              { id: "b", text: { en: "False", uk: "False" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "not",
            mode: "single",
            prompt: { en: "What is the value of `!(true && false)`?", uk: "Чому дорівнює `!(true && false)`?" },
            options: [
              { id: "a", text: { en: "True", uk: "True" } },
              { id: "b", text: { en: "False", uk: "False" } },
            ],
            correct: ["a"],
          },
          {
            id: "precedence",
            mode: "single",
            prompt: { en: "What is the value of `true || false && false`?", uk: "Чому дорівнює `true || false && false`?" },
            options: [
              { id: "a", text: { en: "True, because `&&` is evaluated before `||`", uk: "True, бо `&&` виконується раніше за `||`" } },
              { id: "b", text: { en: "False, because the expression is evaluated strictly left to right", uk: "False, бо вираз обчислюється суворо зліва направо" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "de-morgan",
            mode: "single",
            prompt: { en: "Which expression is equal to `!(a && b)`?", uk: "Який вираз дорівнює `!(a && b)`?" },
            options: [
              { id: "a", text: { en: "`!a && !b`", uk: "`!a && !b`" } },
              { id: "b", text: { en: "`!a || !b`", uk: "`!a || !b`" } },
              { id: "c", text: { en: "`a || b`", uk: "`a || b`" } },
              { id: "d", text: { en: "`!a == b`", uk: "`!a == b`" } },
            ],
            correct: ["b"],
          },
          {
            id: "doubles",
            mode: "single",
            prompt: { en: "What does `Console.WriteLine(0.1 + 0.2 == 0.3);` print?", uk: "Що надрукує `Console.WriteLine(0.1 + 0.2 == 0.3);`?" },
            options: [
              { id: "a", text: { en: "True", uk: "True" } },
              { id: "b", text: { en: "False", uk: "False" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "assign-in-if",
            mode: "single",
            prompt: {
              en: "What happens with this code?\n\n```csharp\nint x = 5;\nif (x = 10)\n{\n    Console.WriteLine(\"ten\");\n}\n```",
              uk: "Що станеться з цим кодом?\n\n```csharp\nint x = 5;\nif (x = 10)\n{\n    Console.WriteLine(\"ten\");\n}\n```",
            },
            options: [
              { id: "a", text: { en: "It prints `ten`", uk: "Він надрукує `ten`" } },
              { id: "b", text: { en: "It prints nothing", uk: "Він нічого не надрукує" } },
              { id: "c", text: { en: "It does not compile: an `int` is not a condition", uk: "Він не компілюється: `int` не є умовою" } },
            ],
            correct: ["c"],
          },
          {
            id: "true-for-seven",
            mode: "multi",
            prompt: { en: "Which conditions are true when `x` is `7`?", uk: "Які умови істинні, коли `x` дорівнює `7`?" },
            options: [
              { id: "a", text: { en: "`x % 2 == 1`", uk: "`x % 2 == 1`" } },
              { id: "b", text: { en: "`x > 5 && x < 10`", uk: "`x > 5 && x < 10`" } },
              { id: "c", text: { en: "`x < 3 || x > 10`", uk: "`x < 3 || x > 10`" } },
              { id: "d", text: { en: "`!(x == 7)`", uk: "`!(x == 7)`" } },
              { id: "e", text: { en: "`x >= 7`", uk: "`x >= 7`" } },
            ],
            correct: ["a", "b", "e"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "robot-control",
        title: { en: "Robot control", uk: "Керування роботом" },
        language: "csharp",
        starter: PROGRAM(`    // Carries out ONE command and returns the new state as "x y direction".
    // Directions: N (y grows), E (x grows), S, W.
    // Commands: L - turn left, R - turn right, F - step forward, B - step backward.
    // Any other command changes nothing.
    static string Execute(int x, int y, string direction, string command)
    {
        // Write your code here
        return x + " " + y + " " + direction;
    }

    static void Main()
    {
        Console.WriteLine(Execute(0, 0, "N", "F"));
        Console.WriteLine(Execute(0, 0, "N", "R"));
        Console.WriteLine(Execute(2, 3, "E", "F"));
        Console.WriteLine(Execute(2, 3, "S", "F"));
        Console.WriteLine(Execute(2, 3, "W", "L"));
        Console.WriteLine(Execute(0, 0, "N", "L"));
        Console.WriteLine(Execute(1, 1, "W", "B"));
        Console.WriteLine(Execute(1, 1, "N", "B"));
        Console.WriteLine(Execute(1, 1, "N", "X"));
    }`),
        solution: PROGRAM(`    static string TurnLeft(string direction)
    {
        switch (direction)
        {
            case "N": return "W";
            case "W": return "S";
            case "S": return "E";
            default: return "N";
        }
    }

    static string TurnRight(string direction)
    {
        switch (direction)
        {
            case "N": return "E";
            case "E": return "S";
            case "S": return "W";
            default: return "N";
        }
    }

    // Carries out ONE command and returns the new state as "x y direction".
    // Directions: N (y grows), E (x grows), S, W.
    // Commands: L - turn left, R - turn right, F - step forward, B - step backward.
    // Any other command changes nothing.
    static string Execute(int x, int y, string direction, string command)
    {
        int dx = 0;
        int dy = 0;
        switch (direction)
        {
            case "N": dy = 1; break;
            case "E": dx = 1; break;
            case "S": dy = -1; break;
            case "W": dx = -1; break;
        }

        switch (command)
        {
            case "F":
                x += dx;
                y += dy;
                break;
            case "B":
                x -= dx;
                y -= dy;
                break;
            case "L":
                direction = TurnLeft(direction);
                break;
            case "R":
                direction = TurnRight(direction);
                break;
        }
        return x + " " + y + " " + direction;
    }

    static void Main()
    {
        Console.WriteLine(Execute(0, 0, "N", "F"));
        Console.WriteLine(Execute(0, 0, "N", "R"));
        Console.WriteLine(Execute(2, 3, "E", "F"));
        Console.WriteLine(Execute(2, 3, "S", "F"));
        Console.WriteLine(Execute(2, 3, "W", "L"));
        Console.WriteLine(Execute(0, 0, "N", "L"));
        Console.WriteLine(Execute(1, 1, "W", "B"));
        Console.WriteLine(Execute(1, 1, "N", "B"));
        Console.WriteLine(Execute(1, 1, "N", "X"));
    }`),
        expectedOutput: "0 1 N\n0 0 E\n3 3 E\n2 2 S\n2 3 S\n0 0 W\n2 1 W\n1 0 N\n1 1 N\n",
      },
      {
        kind: "quiz",
        slug: "branching-review",
        title: { en: "Module review", uk: "Підсумковий тест" },
        questions: [
          {
            id: "order",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nint score = 95;\nif (score >= 50) Console.WriteLine(\"pass\");\nelse if (score >= 90) Console.WriteLine(\"excellent\");\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nint score = 95;\nif (score >= 50) Console.WriteLine(\"pass\");\nelse if (score >= 90) Console.WriteLine(\"excellent\");\n```",
            },
            options: [
              { id: "a", text: { en: "`pass`", uk: "`pass`" } },
              { id: "b", text: { en: "`excellent`", uk: "`excellent`" } },
              { id: "c", text: { en: "`pass` and `excellent`", uk: "`pass` та `excellent`" } },
              { id: "d", text: { en: "Nothing", uk: "Нічого" } },
            ],
            correct: ["a"],
          },
          {
            id: "semicolon",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nint x = -1;\nif (x > 0);\n    Console.WriteLine(\"positive\");\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nint x = -1;\nif (x > 0);\n    Console.WriteLine(\"positive\");\n```",
            },
            options: [
              { id: "a", text: { en: "Nothing", uk: "Нічого" } },
              { id: "b", text: { en: "`positive`: the `;` makes the `if` govern an empty statement", uk: "`positive`: через `;` оператор `if` керує порожньою інструкцією" } },
              { id: "c", text: { en: "It does not compile", uk: "Вона не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "ternary",
            mode: "single",
            prompt: {
              en: "What does `int a = 5; Console.WriteLine(a > 3 ? \"big\" : \"small\");` print?",
              uk: "Що надрукує `int a = 5; Console.WriteLine(a > 3 ? \"big\" : \"small\");`?",
            },
            options: [
              { id: "a", text: { en: "big", uk: "big" } },
              { id: "b", text: { en: "small", uk: "small" } },
              { id: "c", text: { en: "True", uk: "True" } },
            ],
            correct: ["a"],
          },
          {
            id: "between",
            mode: "single",
            prompt: {
              en: "Which condition checks that `x` is between 1 and 10 inclusive?",
              uk: "Яка умова перевіряє, що `x` лежить між 1 та 10 включно?",
            },
            options: [
              { id: "a", text: { en: "`1 <= x <= 10`", uk: "`1 <= x <= 10`" } },
              { id: "b", text: { en: "`x >= 1 || x <= 10`", uk: "`x >= 1 || x <= 10`" } },
              { id: "c", text: { en: "`x > 1 && x < 10`", uk: "`x > 1 && x < 10`" } },
              { id: "d", text: { en: "`x >= 1 && x <= 10`", uk: "`x >= 1 && x <= 10`" } },
            ],
            correct: ["d"],
          },
          {
            id: "guard",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nstring s = null;\nConsole.WriteLine(s != null && s.Length > 0);\n```",
              uk: "Що надрукує ця програма?\n\n```csharp\nstring s = null;\nConsole.WriteLine(s != null && s.Length > 0);\n```",
            },
            options: [
              { id: "a", text: { en: "False", uk: "False" } },
              { id: "b", text: { en: "True", uk: "True" } },
              { id: "c", text: { en: "It crashes with `NullReferenceException`", uk: "Вона аварійно завершується з `NullReferenceException`" } },
            ],
            correct: ["a"],
          },
          {
            id: "no-guard",
            mode: "single",
            prompt: {
              en: "And what does this program print? Note the single `&`.\n\n```csharp\nstring s = null;\nConsole.WriteLine(s != null & s.Length > 0);\n```",
              uk: "А що надрукує ця програма? Зверніть увагу на одинарний `&`.\n\n```csharp\nstring s = null;\nConsole.WriteLine(s != null & s.Length > 0);\n```",
            },
            options: [
              { id: "a", text: { en: "False", uk: "False" } },
              { id: "b", text: { en: "True", uk: "True" } },
              { id: "c", text: { en: "It crashes with `NullReferenceException`, since `&` evaluates both sides", uk: "Вона аварійно завершується з `NullReferenceException`, бо `&` обчислює обидві частини" } },
            ],
            correct: ["c"],
          },
          {
            id: "else-pair",
            mode: "single",
            prompt: {
              en: "To which `if` does an `else` belong when there are no braces?",
              uk: "До якого `if` належить `else`, якщо фігурних дужок немає?",
            },
            options: [
              { id: "a", text: { en: "To the first `if` in the code", uk: "До першого `if` у коді" } },
              { id: "b", text: { en: "To the nearest preceding `if` that has no `else` yet", uk: "До найближчого попереднього `if`, у якого ще немає `else`" } },
              { id: "c", text: { en: "To the one that the indentation suggests", uk: "До того, на який вказують відступи" } },
            ],
            correct: ["b"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "hryvnia",
        title: { en: "Practice: Hryvnia", uk: "Практика «Гривня-гривні-гривень»" },
        language: "csharp",
        starter: PROGRAM(`    // Returns the number and the correct form of the word:
    // 1 hryvnia, 2 hryvni, 5 hryven
    static string Hryvnias(int n)
    {
        // Write your code here
        return n + " hryven";
    }

    static void Main()
    {
        Console.WriteLine(Hryvnias(0));
        Console.WriteLine(Hryvnias(1));
        Console.WriteLine(Hryvnias(2));
        Console.WriteLine(Hryvnias(4));
        Console.WriteLine(Hryvnias(5));
        Console.WriteLine(Hryvnias(11));
        Console.WriteLine(Hryvnias(12));
        Console.WriteLine(Hryvnias(14));
        Console.WriteLine(Hryvnias(21));
        Console.WriteLine(Hryvnias(22));
        Console.WriteLine(Hryvnias(25));
        Console.WriteLine(Hryvnias(100));
        Console.WriteLine(Hryvnias(101));
        Console.WriteLine(Hryvnias(111));
        Console.WriteLine(Hryvnias(112));
        Console.WriteLine(Hryvnias(1002));
    }`),
        solution: PROGRAM(`    // Returns the number and the correct form of the word:
    // 1 hryvnia, 2 hryvni, 5 hryven
    static string Hryvnias(int n)
    {
        int lastTwo = n % 100;
        int last = n % 10;

        if (lastTwo >= 11 && lastTwo <= 14)
        {
            return n + " hryven";
        }
        if (last == 1)
        {
            return n + " hryvnia";
        }
        if (last >= 2 && last <= 4)
        {
            return n + " hryvni";
        }
        return n + " hryven";
    }

    static void Main()
    {
        Console.WriteLine(Hryvnias(0));
        Console.WriteLine(Hryvnias(1));
        Console.WriteLine(Hryvnias(2));
        Console.WriteLine(Hryvnias(4));
        Console.WriteLine(Hryvnias(5));
        Console.WriteLine(Hryvnias(11));
        Console.WriteLine(Hryvnias(12));
        Console.WriteLine(Hryvnias(14));
        Console.WriteLine(Hryvnias(21));
        Console.WriteLine(Hryvnias(22));
        Console.WriteLine(Hryvnias(25));
        Console.WriteLine(Hryvnias(100));
        Console.WriteLine(Hryvnias(101));
        Console.WriteLine(Hryvnias(111));
        Console.WriteLine(Hryvnias(112));
        Console.WriteLine(Hryvnias(1002));
    }`),
        expectedOutput:
          "0 hryven\n1 hryvnia\n2 hryvni\n4 hryvni\n5 hryven\n11 hryven\n12 hryven\n14 hryven\n21 hryvnia\n22 hryvni\n25 hryven\n100 hryven\n101 hryvnia\n111 hryven\n112 hryven\n1002 hryvni\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "two-rectangles",
        title: { en: "Practice: Two rectangles", uk: "Практика «Два прямокутники»" },
        language: "csharp",
        starter: PROGRAM(`    // Rectangles A and B have sides parallel to the axes.
    // (x1, y1) is the lower-left corner, (x2, y2) the upper-right one.
    // Returns "disjoint", "touch" or "overlap".
    static string Relation(
        int ax1, int ay1, int ax2, int ay2,
        int bx1, int by1, int bx2, int by2)
    {
        // Write your code here
        return "disjoint";
    }

    static void Main()
    {
        Console.WriteLine(Relation(0, 0, 4, 4, 5, 5, 8, 8));
        Console.WriteLine(Relation(0, 0, 4, 4, 4, 0, 8, 4));
        Console.WriteLine(Relation(0, 0, 4, 4, 4, 4, 8, 8));
        Console.WriteLine(Relation(0, 0, 4, 4, 2, 2, 6, 6));
        Console.WriteLine(Relation(0, 0, 10, 10, 2, 2, 3, 3));
        Console.WriteLine(Relation(0, 0, 4, 4, 5, 0, 8, 4));
        Console.WriteLine(Relation(0, 0, 4, 4, 4, 5, 8, 8));
        Console.WriteLine(Relation(0, 0, 4, 4, 0, 0, 4, 4));
        Console.WriteLine(Relation(0, 0, 4, 4, 1, 4, 3, 9));
    }`),
        solution: PROGRAM(`    // Rectangles A and B have sides parallel to the axes.
    // (x1, y1) is the lower-left corner, (x2, y2) the upper-right one.
    // Returns "disjoint", "touch" or "overlap".
    static string Relation(
        int ax1, int ay1, int ax2, int ay2,
        int bx1, int by1, int bx2, int by2)
    {
        int overlapX = Math.Min(ax2, bx2) - Math.Max(ax1, bx1);
        int overlapY = Math.Min(ay2, by2) - Math.Max(ay1, by1);

        if (overlapX < 0 || overlapY < 0)
        {
            return "disjoint";
        }
        if (overlapX == 0 || overlapY == 0)
        {
            return "touch";
        }
        return "overlap";
    }

    static void Main()
    {
        Console.WriteLine(Relation(0, 0, 4, 4, 5, 5, 8, 8));
        Console.WriteLine(Relation(0, 0, 4, 4, 4, 0, 8, 4));
        Console.WriteLine(Relation(0, 0, 4, 4, 4, 4, 8, 8));
        Console.WriteLine(Relation(0, 0, 4, 4, 2, 2, 6, 6));
        Console.WriteLine(Relation(0, 0, 10, 10, 2, 2, 3, 3));
        Console.WriteLine(Relation(0, 0, 4, 4, 5, 0, 8, 4));
        Console.WriteLine(Relation(0, 0, 4, 4, 4, 5, 8, 8));
        Console.WriteLine(Relation(0, 0, 4, 4, 0, 0, 4, 4));
        Console.WriteLine(Relation(0, 0, 4, 4, 1, 4, 3, 9));
    }`),
        expectedOutput: "disjoint\ntouch\ntouch\noverlap\noverlap\ndisjoint\ndisjoint\noverlap\ntouch\n",
        maxScore: 20,
      },
      {
        kind: "practice",
        slug: "segment-distance",
        title: { en: "Practice: Distance to a segment", uk: "Практика «Відстань до відрізка»" },
        language: "csharp",
        starter: PROGRAM(`    // Distance from the point P to the segment AB
    static double DistanceToSegment(double px, double py, double ax, double ay, double bx, double by)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        Console.WriteLine(Math.Round(DistanceToSegment(2, 3, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(-3, 4, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(7, 4, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(2, 0, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(4, 5, 1, 1, 1, 1), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(1, 1, 0, 0, 2, 2), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(0, 2, 0, 0, 2, 2), 2));
    }`),
        solution: PROGRAM(`    static double Distance(double x1, double y1, double x2, double y2)
    {
        double dx = x2 - x1;
        double dy = y2 - y1;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    // Distance from the point P to the segment AB
    static double DistanceToSegment(double px, double py, double ax, double ay, double bx, double by)
    {
        double dx = bx - ax;
        double dy = by - ay;
        double lengthSquared = dx * dx + dy * dy;
        if (lengthSquared == 0)
        {
            return Distance(px, py, ax, ay);
        }

        double t = ((px - ax) * dx + (py - ay) * dy) / lengthSquared;
        if (t < 0)
        {
            t = 0;
        }
        if (t > 1)
        {
            t = 1;
        }
        return Distance(px, py, ax + t * dx, ay + t * dy);
    }

    static void Main()
    {
        Console.WriteLine(Math.Round(DistanceToSegment(2, 3, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(-3, 4, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(7, 4, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(2, 0, 0, 0, 4, 0), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(4, 5, 1, 1, 1, 1), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(1, 1, 0, 0, 2, 2), 2));
        Console.WriteLine(Math.Round(DistanceToSegment(0, 2, 0, 0, 2, 2), 2));
    }`),
        expectedOutput: "3\n5\n5\n0\n5\n0\n1.41\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "loops",
    title: { en: "Loops", uk: "Цикли" },
    slides: [
      { kind: "lecture", slug: "while-and-for", title: { en: "while and for", uk: "while та for" } },
      { kind: "lecture", slug: "while-loop", title: { en: "The while loop in depth", uk: "Цикл while докладно" } },
      {
        kind: "practice",
        slug: "powers-of-two",
        title: { en: "In search of a power of two", uk: "У пошуках степеня двійки" },
        language: "csharp",
        starter: PROGRAM(`    // Returns "n: 2^k = p", where p = 2^k is the smallest power of two that is >= n
    static string PowerOfTwo(int n)
    {
        // Write your code here
        return "";
    }

    static void Main()
    {
        Console.WriteLine(PowerOfTwo(1));
        Console.WriteLine(PowerOfTwo(5));
        Console.WriteLine(PowerOfTwo(16));
        Console.WriteLine(PowerOfTwo(17));
        Console.WriteLine(PowerOfTwo(1000));
        Console.WriteLine(PowerOfTwo(1000000));
    }`),
        solution: PROGRAM(`    // Returns "n: 2^k = p", where p = 2^k is the smallest power of two that is >= n
    static string PowerOfTwo(int n)
    {
        int power = 1;
        int k = 0;
        while (power < n)
        {
            power *= 2;
            k++;
        }
        return n + ": 2^" + k + " = " + power;
    }

    static void Main()
    {
        Console.WriteLine(PowerOfTwo(1));
        Console.WriteLine(PowerOfTwo(5));
        Console.WriteLine(PowerOfTwo(16));
        Console.WriteLine(PowerOfTwo(17));
        Console.WriteLine(PowerOfTwo(1000));
        Console.WriteLine(PowerOfTwo(1000000));
    }`),
        expectedOutput: "1: 2^0 = 1\n5: 2^3 = 8\n16: 2^4 = 16\n17: 2^5 = 32\n1000: 2^10 = 1024\n1000000: 2^20 = 1048576\n",
      },
      {
        kind: "practice",
        slug: "digits",
        title: { en: "Digits of a number", uk: "Цифри числа" },
        language: "csharp",
        starter: PROGRAM(`    // The sum of the digits of n (n >= 0)
    static int DigitSum(int n)
    {
        // Write your code here
        return -1;
    }

    // The number with its digits in reverse order (n >= 0)
    static int Reverse(int n)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        Console.WriteLine(DigitSum(12345));
        Console.WriteLine(DigitSum(0));
        Console.WriteLine(DigitSum(999));
        Console.WriteLine(DigitSum(1000000));
        Console.WriteLine(Reverse(12345));
        Console.WriteLine(Reverse(1200));
        Console.WriteLine(Reverse(907));
        Console.WriteLine(Reverse(0));
        Console.WriteLine(Reverse(7));
    }`),
        solution: PROGRAM(`    // The sum of the digits of n (n >= 0)
    static int DigitSum(int n)
    {
        int sum = 0;
        while (n > 0)
        {
            sum += n % 10;
            n /= 10;
        }
        return sum;
    }

    // The number with its digits in reverse order (n >= 0)
    static int Reverse(int n)
    {
        int result = 0;
        while (n > 0)
        {
            result = result * 10 + n % 10;
            n /= 10;
        }
        return result;
    }

    static void Main()
    {
        Console.WriteLine(DigitSum(12345));
        Console.WriteLine(DigitSum(0));
        Console.WriteLine(DigitSum(999));
        Console.WriteLine(DigitSum(1000000));
        Console.WriteLine(Reverse(12345));
        Console.WriteLine(Reverse(1200));
        Console.WriteLine(Reverse(907));
        Console.WriteLine(Reverse(0));
        Console.WriteLine(Reverse(7));
    }`),
        expectedOutput: "15\n0\n27\n1\n54321\n21\n709\n0\n7\n",
      },
      { kind: "lecture", slug: "refactoring-while", title: { en: "Refactoring while", uk: "Рефакторинг while" } },
      {
        kind: "practice",
        slug: "remove-spaces",
        title: { en: "Remove the spaces", uk: "Прибрати пробіли" },
        language: "csharp",
        starter: PROGRAM(`    // Returns the text without any space characters.
    // Build the result yourself; do not use Replace, Split or Join.
    static string RemoveSpaces(string text)
    {
        // Write your code here
        return text;
    }

    static void Main()
    {
        Console.WriteLine("[" + RemoveSpaces("a b c") + "]");
        Console.WriteLine("[" + RemoveSpaces("  hello  world ") + "]");
        Console.WriteLine("[" + RemoveSpaces("") + "]");
        Console.WriteLine("[" + RemoveSpaces("nospaces") + "]");
        Console.WriteLine("[" + RemoveSpaces("   ") + "]");
        Console.WriteLine("[" + RemoveSpaces("x  y") + "]");
    }`),
        solution: PROGRAM(`    // Returns the text without any space characters.
    // Build the result yourself; do not use Replace, Split or Join.
    static string RemoveSpaces(string text)
    {
        string result = "";
        for (int i = 0; i < text.Length; i++)
        {
            if (text[i] != ' ')
            {
                result += text[i];
            }
        }
        return result;
    }

    static void Main()
    {
        Console.WriteLine("[" + RemoveSpaces("a b c") + "]");
        Console.WriteLine("[" + RemoveSpaces("  hello  world ") + "]");
        Console.WriteLine("[" + RemoveSpaces("") + "]");
        Console.WriteLine("[" + RemoveSpaces("nospaces") + "]");
        Console.WriteLine("[" + RemoveSpaces("   ") + "]");
        Console.WriteLine("[" + RemoveSpaces("x  y") + "]");
    }`),
        expectedOutput: "[abc]\n[helloworld]\n[]\n[nospaces]\n[]\n[xy]\n",
      },
      { kind: "lecture", slug: "for-loop", title: { en: "for loops in depth", uk: "Цикли for докладно" } },
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
      { kind: "lecture", slug: "nested-loops", title: { en: "Nested loops", uk: "Вкладені цикли" } },
      {
        kind: "practice",
        slug: "frame",
        title: { en: "Frame", uk: "Рамочка" },
        language: "csharp",
        starter: PROGRAM(`    // Prints a frame of '*' with the given size; the inside is spaces
    static void PrintFrame(int width, int height)
    {
        // Write your code here
    }

    static void Main()
    {
        PrintFrame(5, 4);
        Console.WriteLine("---");
        PrintFrame(3, 3);
        Console.WriteLine("---");
        PrintFrame(4, 1);
        Console.WriteLine("---");
        PrintFrame(1, 3);
    }`),
        solution: PROGRAM(`    // Prints a frame of '*' with the given size; the inside is spaces
    static void PrintFrame(int width, int height)
    {
        for (int row = 0; row < height; row++)
        {
            for (int col = 0; col < width; col++)
            {
                bool border = row == 0 || row == height - 1 || col == 0 || col == width - 1;
                Console.Write(border ? "*" : " ");
            }
            Console.WriteLine();
        }
    }

    static void Main()
    {
        PrintFrame(5, 4);
        Console.WriteLine("---");
        PrintFrame(3, 3);
        Console.WriteLine("---");
        PrintFrame(4, 1);
        Console.WriteLine("---");
        PrintFrame(1, 3);
    }`),
        expectedOutput: "*****\n*   *\n*   *\n*****\n---\n***\n* *\n***\n---\n****\n---\n*\n*\n*\n",
      },
      { kind: "lecture", slug: "while-vs-for", title: { en: "Comparing for and while", uk: "Порівняння for і while" } },
      {
        kind: "practice",
        slug: "chessboard",
        title: { en: "* Chessboard", uk: "* Шахівниця" },
        language: "csharp",
        starter: PROGRAM(`    // Prints a size x size board: '#' for dark squares, '.' for light ones.
    // The top-left square is dark.
    static void PrintBoard(int size)
    {
        // Write your code here
    }

    static void Main()
    {
        PrintBoard(8);
        Console.WriteLine("---");
        PrintBoard(3);
    }`),
        solution: PROGRAM(`    // Prints a size x size board: '#' for dark squares, '.' for light ones.
    // The top-left square is dark.
    static void PrintBoard(int size)
    {
        for (int row = 0; row < size; row++)
        {
            for (int col = 0; col < size; col++)
            {
                Console.Write((row + col) % 2 == 0 ? "#" : ".");
            }
            Console.WriteLine();
        }
    }

    static void Main()
    {
        PrintBoard(8);
        Console.WriteLine("---");
        PrintBoard(3);
    }`),
        expectedOutput:
          "#.#.#.#.\n.#.#.#.#\n#.#.#.#.\n.#.#.#.#\n#.#.#.#.\n.#.#.#.#\n#.#.#.#.\n.#.#.#.#\n---\n#.#\n.#.\n#.#\n",
      },
      {
        kind: "quiz",
        slug: "loops-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "step",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nfor (int i = 1; i <= 10; i += 3)\n{\n    Console.Write(i + \" \");\n}\n```",
              uk: "Що друкує цей код?\n\n```csharp\nfor (int i = 1; i <= 10; i += 3)\n{\n    Console.Write(i + \" \");\n}\n```",
            },
            options: [
              { id: "a", text: { en: "`1 4 7 10`", uk: "`1 4 7 10`" } },
              { id: "b", text: { en: "`1 4 7`", uk: "`1 4 7`" } },
              { id: "c", text: { en: "`4 7 10`", uk: "`4 7 10`" } },
              { id: "d", text: { en: "`1 3 6 9`", uk: "`1 3 6 9`" } },
            ],
            correct: ["a"],
          },
          {
            id: "counter-after",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nint i;\nfor (i = 0; i < 5; i++)\n{\n}\nConsole.WriteLine(i);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nint i;\nfor (i = 0; i < 5; i++)\n{\n}\nConsole.WriteLine(i);\n```",
            },
            options: [
              { id: "a", text: { en: "4", uk: "4" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "6", uk: "6" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "nested-count",
            mode: "single",
            prompt: {
              en: "How many times does `count++` run?\n\n```csharp\nint count = 0;\nfor (int i = 0; i < 3; i++)\n{\n    for (int j = 0; j < 4; j++)\n    {\n        count++;\n    }\n}\n```",
              uk: "Скільки разів виконається `count++`?\n\n```csharp\nint count = 0;\nfor (int i = 0; i < 3; i++)\n{\n    for (int j = 0; j < 4; j++)\n    {\n        count++;\n    }\n}\n```",
            },
            options: [
              { id: "a", text: { en: "7", uk: "7" } },
              { id: "b", text: { en: "12", uk: "12" } },
              { id: "c", text: { en: "3", uk: "3" } },
              { id: "d", text: { en: "4", uk: "4" } },
            ],
            correct: ["b"],
          },
          {
            id: "continue",
            mode: "single",
            prompt: {
              en: "What is `sum` after this code?\n\n```csharp\nint sum = 0;\nfor (int i = 1; i <= 5; i++)\n{\n    if (i == 3) continue;\n    sum += i;\n}\n```",
              uk: "Чому дорівнює `sum` після цього коду?\n\n```csharp\nint sum = 0;\nfor (int i = 1; i <= 5; i++)\n{\n    if (i == 3) continue;\n    sum += i;\n}\n```",
            },
            options: [
              { id: "a", text: { en: "15", uk: "15" } },
              { id: "b", text: { en: "12", uk: "12" } },
              { id: "c", text: { en: "3", uk: "3" } },
              { id: "d", text: { en: "9", uk: "9" } },
            ],
            correct: ["b"],
          },
          {
            id: "break",
            mode: "single",
            prompt: {
              en: "And what is `sum` if `continue` is replaced by `break`?\n\n```csharp\nint sum = 0;\nfor (int i = 1; i <= 5; i++)\n{\n    if (i == 3) break;\n    sum += i;\n}\n```",
              uk: "А чому дорівнює `sum`, якщо `continue` замінити на `break`?\n\n```csharp\nint sum = 0;\nfor (int i = 1; i <= 5; i++)\n{\n    if (i == 3) break;\n    sum += i;\n}\n```",
            },
            options: [
              { id: "a", text: { en: "12", uk: "12" } },
              { id: "b", text: { en: "6", uk: "6" } },
              { id: "c", text: { en: "3", uk: "3" } },
              { id: "d", text: { en: "15", uk: "15" } },
            ],
            correct: ["c"],
          },
          {
            id: "do-while",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nint x = 10;\ndo\n{\n    x++;\n}\nwhile (x < 5);\nConsole.WriteLine(x);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nint x = 10;\ndo\n{\n    x++;\n}\nwhile (x < 5);\nConsole.WriteLine(x);\n```",
            },
            options: [
              { id: "a", text: { en: "10", uk: "10" } },
              { id: "b", text: { en: "11", uk: "11" } },
              { id: "c", text: { en: "5", uk: "5" } },
              { id: "d", text: { en: "Nothing: the loop never runs", uk: "Нічого: цикл ніколи не виконується" } },
            ],
            correct: ["b"],
          },
          {
            id: "endless",
            mode: "single",
            prompt: { en: "Which loop never ends?", uk: "Який цикл ніколи не завершується?" },
            options: [
              {
                id: "a",
                text: {
                  en: "`int i = 0; while (i < 5) { Console.WriteLine(i); }`",
                  uk: "`int i = 0; while (i < 5) { Console.WriteLine(i); }`",
                },
              },
              { id: "b", text: { en: "`for (int i = 0; i < 5; i++) { }`", uk: "`for (int i = 0; i < 5; i++) { }`" } },
              { id: "c", text: { en: "`int i = 5; while (i > 0) { i--; }`", uk: "`int i = 5; while (i > 0) { i--; }`" } },
              { id: "d", text: { en: "`do { } while (false);`", uk: "`do { } while (false);`" } },
            ],
            correct: ["a"],
          },
          {
            id: "choose",
            mode: "multi",
            prompt: {
              en: "Which pairs of situation and loop are a good match?",
              uk: "Які пари «ситуація й цикл» підібрано добре?",
            },
            options: [
              { id: "a", text: { en: "Print 10 squares: `for`", uk: "Надрукувати 10 квадратів: `for`" } },
              { id: "b", text: { en: "Repeat until the data runs out, the length being unknown: `while`", uk: "Повторювати, доки закінчаться дані, довжина невідома: `while`" } },
              { id: "c", text: { en: "The body must run at least once: `do-while`", uk: "Тіло має виконатися принаймні раз: `do-while`" } },
              { id: "d", text: { en: "Go through every character of a string and only read it: `while (true)` without `break`", uk: "Пройтися по кожному символу рядка й лише прочитати його: `while (true)` без `break`" } },
            ],
            correct: ["a", "b", "c"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "empty-maze",
        title: { en: "Practice: Empty maze", uk: "Практика «Порожній лабіринт»" },
        language: "csharp",
        starter: PROGRAM(`    // Prints an empty maze: walls around the edge, start S and exit E inside
    static void PrintMaze(int width, int height)
    {
        // Write your code here
    }

    static void Main()
    {
        PrintMaze(7, 5);
        Console.WriteLine("---");
        PrintMaze(4, 4);
    }`),
        solution: PROGRAM(`    // Prints an empty maze: walls around the edge, start S and exit E inside
    static void PrintMaze(int width, int height)
    {
        for (int row = 0; row < height; row++)
        {
            for (int col = 0; col < width; col++)
            {
                if (row == 0 || row == height - 1 || col == 0 || col == width - 1)
                {
                    Console.Write("#");
                }
                else if (row == 1 && col == 1)
                {
                    Console.Write("S");
                }
                else if (row == height - 2 && col == width - 2)
                {
                    Console.Write("E");
                }
                else
                {
                    Console.Write(".");
                }
            }
            Console.WriteLine();
        }
    }

    static void Main()
    {
        PrintMaze(7, 5);
        Console.WriteLine("---");
        PrintMaze(4, 4);
    }`),
        expectedOutput: "#######\n#S....#\n#.....#\n#....E#\n#######\n---\n####\n#S.#\n#.E#\n####\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "snake-maze",
        title: { en: "Practice: Snake maze", uk: "Практика «Лабіринт змійка»" },
        language: "csharp",
        starter: PROGRAM(`    // Prints a snake maze. width and height are odd, both at least 5.
    static void PrintSnake(int width, int height)
    {
        // Write your code here
    }

    static void Main()
    {
        PrintSnake(7, 7);
        Console.WriteLine("---");
        PrintSnake(9, 5);
    }`),
        solution: PROGRAM(`    // Prints a snake maze. width and height are odd, both at least 5.
    static void PrintSnake(int width, int height)
    {
        for (int row = 0; row < height; row++)
        {
            for (int col = 0; col < width; col++)
            {
                bool wall;
                if (row == 0 || row == height - 1 || col == 0 || col == width - 1)
                {
                    wall = true;
                }
                else if (row % 2 == 1)
                {
                    wall = false;
                }
                else if (row % 4 == 2)
                {
                    wall = col != width - 2;
                }
                else
                {
                    wall = col != 1;
                }
                Console.Write(wall ? "#" : ".");
            }
            Console.WriteLine();
        }
    }

    static void Main()
    {
        PrintSnake(7, 7);
        Console.WriteLine("---");
        PrintSnake(9, 5);
    }`),
        expectedOutput:
          "#######\n#.....#\n#####.#\n#.....#\n#.#####\n#.....#\n#######\n---\n#########\n#.......#\n#######.#\n#.......#\n#########\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "diagonals",
        title: { en: "Practice: Diagonals", uk: "Практика «Діагоналі»" },
        language: "csharp",
        starter: PROGRAM(`    // Prints a size x size square with both diagonals drawn as '*' and '.' elsewhere
    static void PrintX(int size)
    {
        // Write your code here
    }

    static void Main()
    {
        PrintX(7);
        Console.WriteLine("---");
        PrintX(4);
    }`),
        solution: PROGRAM(`    // Prints a size x size square with both diagonals drawn as '*' and '.' elsewhere
    static void PrintX(int size)
    {
        for (int row = 0; row < size; row++)
        {
            for (int col = 0; col < size; col++)
            {
                bool onDiagonal = row == col || row + col == size - 1;
                Console.Write(onDiagonal ? "*" : ".");
            }
            Console.WriteLine();
        }
    }

    static void Main()
    {
        PrintX(7);
        Console.WriteLine("---");
        PrintX(4);
    }`),
        expectedOutput: "*.....*\n.*...*.\n..*.*..\n...*...\n..*.*..\n.*...*.\n*.....*\n---\n*..*\n.**.\n.**.\n*..*\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "dragon-curve",
        title: { en: "Practice: Dragon curve", uk: "Практика «Dragon curve»" },
        language: "csharp",
        starter: PROGRAM(`    // Dragon(1) = "R"
    // Dragon(n) = Dragon(n - 1) + "R" + the reversed and flipped copy of Dragon(n - 1)
    // (flipped: every L becomes R and every R becomes L)
    static string Dragon(int n)
    {
        // Write your code here
        return "";
    }

    static void Main()
    {
        Console.WriteLine(Dragon(1));
        Console.WriteLine(Dragon(2));
        Console.WriteLine(Dragon(3));
        Console.WriteLine(Dragon(4));
        Console.WriteLine(Dragon(5));
        Console.WriteLine(Dragon(10).Length);
    }`),
        solution: PROGRAM(`    // Dragon(1) = "R"
    // Dragon(n) = Dragon(n - 1) + "R" + the reversed and flipped copy of Dragon(n - 1)
    // (flipped: every L becomes R and every R becomes L)
    static string Dragon(int n)
    {
        string s = "R";
        for (int step = 2; step <= n; step++)
        {
            string flipped = "";
            for (int i = s.Length - 1; i >= 0; i--)
            {
                flipped += s[i] == 'R' ? 'L' : 'R';
            }
            s = s + "R" + flipped;
        }
        return s;
    }

    static void Main()
    {
        Console.WriteLine(Dragon(1));
        Console.WriteLine(Dragon(2));
        Console.WriteLine(Dragon(3));
        Console.WriteLine(Dragon(4));
        Console.WriteLine(Dragon(5));
        Console.WriteLine(Dragon(10).Length);
    }`),
        expectedOutput: "R\nRRL\nRRLRRLL\nRRLRRLLRRRLLRLL\nRRLRRLLRRRLLRLLRRRLRRLLLRRLLRLL\n1023\n",
        maxScore: 10,
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
