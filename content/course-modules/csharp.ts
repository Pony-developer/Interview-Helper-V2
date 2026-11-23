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
        slug: "even-array",
        title: { en: "Even array", uk: "Парний масив" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[] numbers)
    {
        for (int i = 0; i < numbers.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(numbers[i]);
        }
        Console.WriteLine();
    }

    // The first count positive even numbers: 2, 4, 6, ...
    static int[] EvenNumbers(int count)
    {
        // Write your code here
        return new int[0];
    }

    // True when every element is even (an empty array gives true)
    static bool AllEven(int[] numbers)
    {
        // Write your code here
        return false;
    }

    static void Main()
    {
        Show(EvenNumbers(5));
        Show(EvenNumbers(1));
        Show(EvenNumbers(0));
        Show(EvenNumbers(8));
        Console.WriteLine(AllEven(new[] { 2, 4, 6 }));
        Console.WriteLine(AllEven(new[] { 2, 3 }));
        Console.WriteLine(AllEven(new int[0]));
    }`),
        solution: PROGRAM(`    static void Show(int[] numbers)
    {
        for (int i = 0; i < numbers.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(numbers[i]);
        }
        Console.WriteLine();
    }

    // The first count positive even numbers: 2, 4, 6, ...
    static int[] EvenNumbers(int count)
    {
        int[] result = new int[count];
        for (int i = 0; i < count; i++)
        {
            result[i] = 2 * (i + 1);
        }
        return result;
    }

    // True when every element is even (an empty array gives true)
    static bool AllEven(int[] numbers)
    {
        foreach (int n in numbers)
        {
            if (n % 2 != 0) return false;
        }
        return true;
    }

    static void Main()
    {
        Show(EvenNumbers(5));
        Show(EvenNumbers(1));
        Show(EvenNumbers(0));
        Show(EvenNumbers(8));
        Console.WriteLine(AllEven(new[] { 2, 4, 6 }));
        Console.WriteLine(AllEven(new[] { 2, 3 }));
        Console.WriteLine(AllEven(new int[0]));
    }`),
        expectedOutput: "2 4 6 8 10\n2\n\n2 4 6 8 10 12 14 16\nTrue\nFalse\nTrue\n",
      },
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
      {
        kind: "practice",
        slug: "count-matches",
        title: { en: "Counting", uk: "Підрахунок" },
        language: "csharp",
        starter: PROGRAM(`    // How many elements are less than zero
    static int CountNegative(int[] numbers)
    {
        // Write your code here
        return -1;
    }

    // How many elements are equal to value
    static int CountValue(int[] numbers, int value)
    {
        // Write your code here
        return -1;
    }

    // How many elements are between low and high, both ends included
    static int CountInRange(int[] numbers, int low, int high)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        int[] data = { 5, -3, 8, 5, 0, -1, 5, 12 };
        Console.WriteLine(CountNegative(data));
        Console.WriteLine(CountValue(data, 5));
        Console.WriteLine(CountValue(data, 7));
        Console.WriteLine(CountInRange(data, 0, 8));
        Console.WriteLine(CountInRange(new int[0], 0, 8));
    }`),
        solution: PROGRAM(`    // How many elements are less than zero
    static int CountNegative(int[] numbers)
    {
        int count = 0;
        foreach (int n in numbers)
        {
            if (n < 0) count++;
        }
        return count;
    }

    // How many elements are equal to value
    static int CountValue(int[] numbers, int value)
    {
        int count = 0;
        foreach (int n in numbers)
        {
            if (n == value) count++;
        }
        return count;
    }

    // How many elements are between low and high, both ends included
    static int CountInRange(int[] numbers, int low, int high)
    {
        int count = 0;
        foreach (int n in numbers)
        {
            if (n >= low && n <= high) count++;
        }
        return count;
    }

    static void Main()
    {
        int[] data = { 5, -3, 8, 5, 0, -1, 5, 12 };
        Console.WriteLine(CountNegative(data));
        Console.WriteLine(CountValue(data, 5));
        Console.WriteLine(CountValue(data, 7));
        Console.WriteLine(CountInRange(data, 0, 8));
        Console.WriteLine(CountInRange(new int[0], 0, 8));
    }`),
        expectedOutput: "2\n3\n0\n5\n0\n",
      },
      {
        kind: "practice",
        slug: "find-subarray",
        title: { en: "Finding an array in an array", uk: "Пошук масиву в масиві" },
        language: "csharp",
        starter: PROGRAM(`    // The index where the first occurrence of the whole sequence part starts,
    // or -1 if it does not occur. An empty part is found at index 0.
    static int IndexOfSub(int[] numbers, int[] part)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        int[] a = { 1, 2, 3, 2, 3, 4, 2, 3, 4, 5 };
        Console.WriteLine(IndexOfSub(a, new[] { 2, 3, 4 }));
        Console.WriteLine(IndexOfSub(a, new[] { 4, 5 }));
        Console.WriteLine(IndexOfSub(a, new[] { 5, 6 }));
        Console.WriteLine(IndexOfSub(a, new[] { 1 }));
        Console.WriteLine(IndexOfSub(a, new int[0]));
        Console.WriteLine(IndexOfSub(new[] { 1, 2 }, new[] { 1, 2, 3 }));
        Console.WriteLine(IndexOfSub(a, new[] { 3, 2, 3 }));
    }`),
        solution: PROGRAM(`    // The index where the first occurrence of the whole sequence part starts,
    // or -1 if it does not occur. An empty part is found at index 0.
    static int IndexOfSub(int[] numbers, int[] part)
    {
        for (int start = 0; start <= numbers.Length - part.Length; start++)
        {
            bool match = true;
            for (int k = 0; k < part.Length; k++)
            {
                if (numbers[start + k] != part[k])
                {
                    match = false;
                    break;
                }
            }
            if (match) return start;
        }
        return -1;
    }

    static void Main()
    {
        int[] a = { 1, 2, 3, 2, 3, 4, 2, 3, 4, 5 };
        Console.WriteLine(IndexOfSub(a, new[] { 2, 3, 4 }));
        Console.WriteLine(IndexOfSub(a, new[] { 4, 5 }));
        Console.WriteLine(IndexOfSub(a, new[] { 5, 6 }));
        Console.WriteLine(IndexOfSub(a, new[] { 1 }));
        Console.WriteLine(IndexOfSub(a, new int[0]));
        Console.WriteLine(IndexOfSub(new[] { 1, 2 }, new[] { 1, 2, 3 }));
        Console.WriteLine(IndexOfSub(a, new[] { 3, 2, 3 }));
    }`),
        expectedOutput: "3\n8\n-1\n0\n0\n-1\n2\n",
      },
      { kind: "lecture", slug: "array-notation", title: { en: "Short forms of array notation", uk: "Короткі форми запису масивів" } },
      {
        kind: "practice",
        slug: "tarot",
        title: { en: "Tarot cards", uk: "Карти Таро" },
        language: "csharp",
        starter: PROGRAM(`    static string[] GetDeck()
    {
        return new[]
        {
            "The Fool", "The Magician", "The High Priestess", "The Empress",
            "The Emperor", "The Hierophant", "The Lovers", "The Chariot",
            "Strength", "The Hermit", "Wheel of Fortune", "Justice",
            "The Hanged Man", "Death", "Temperance", "The Devil",
            "The Tower", "The Star", "The Moon", "The Sun",
            "Judgement", "The World",
        };
    }

    // Three cards for the number n: indexes n % 22, n * 7 % 22 and n * n % 22
    static string[] Spread(int n)
    {
        // Write your code here
        return new string[3];
    }

    static void Main()
    {
        foreach (int n in new[] { 5, 10, 21 })
        {
            string[] cards = Spread(n);
            Console.WriteLine(n + ": " + cards[0] + " | " + cards[1] + " | " + cards[2]);
        }
    }`),
        solution: PROGRAM(`    static string[] GetDeck()
    {
        return new[]
        {
            "The Fool", "The Magician", "The High Priestess", "The Empress",
            "The Emperor", "The Hierophant", "The Lovers", "The Chariot",
            "Strength", "The Hermit", "Wheel of Fortune", "Justice",
            "The Hanged Man", "Death", "Temperance", "The Devil",
            "The Tower", "The Star", "The Moon", "The Sun",
            "Judgement", "The World",
        };
    }

    // Three cards for the number n: indexes n % 22, n * 7 % 22 and n * n % 22
    static string[] Spread(int n)
    {
        string[] deck = GetDeck();
        return new[]
        {
            deck[n % deck.Length],
            deck[n * 7 % deck.Length],
            deck[n * n % deck.Length],
        };
    }

    static void Main()
    {
        foreach (int n in new[] { 5, 10, 21 })
        {
            string[] cards = Spread(n);
            Console.WriteLine(n + ": " + cards[0] + " | " + cards[1] + " | " + cards[2]);
        }
    }`),
        expectedOutput:
          "5: The Hierophant | Death | The Empress\n10: Wheel of Fortune | The Emperor | The Hanged Man\n21: The World | The Devil | The Magician\n",
      },
      { kind: "lecture", slug: "reference-vs-value", title: { en: "Reference types and value types", uk: "Посилальні та значеннєві типи" } },
      { kind: "lecture", slug: "passing-arrays", title: { en: "Passing an array to a method", uk: "Передача масиву в метод" } },
      { kind: "lecture", slug: "array-class", title: { en: "The Array class", uk: "Клас Array" } },
      {
        kind: "practice",
        slug: "power-array",
        title: { en: "Raise an array to a power", uk: "Піднести масив до степеня" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[] numbers)
    {
        for (int i = 0; i < numbers.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(numbers[i]);
        }
        Console.WriteLine();
    }

    // Raises every element to the given power, IN PLACE (power 0 gives 1)
    static void RaiseToPower(int[] numbers, int power)
    {
        // Write your code here
    }

    // Returns a NEW array of the powers; the original stays unchanged
    static int[] Powers(int[] numbers, int power)
    {
        // Write your code here
        return numbers;
    }

    static void Main()
    {
        int[] a = { 1, 2, 3, 4 };
        RaiseToPower(a, 3);
        Show(a);

        int[] b = { 2, -3, 0, 5 };
        RaiseToPower(b, 2);
        Show(b);

        int[] c = { 7, 8 };
        RaiseToPower(c, 0);
        Show(c);

        int[] d = new int[0];
        RaiseToPower(d, 5);
        Show(d);

        int[] original = { 2, 3 };
        int[] cubes = Powers(original, 3);
        Show(original);
        Show(cubes);
    }`),
        solution: PROGRAM(`    static void Show(int[] numbers)
    {
        for (int i = 0; i < numbers.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(numbers[i]);
        }
        Console.WriteLine();
    }

    // Raises every element to the given power, IN PLACE (power 0 gives 1)
    static void RaiseToPower(int[] numbers, int power)
    {
        for (int i = 0; i < numbers.Length; i++)
        {
            int result = 1;
            for (int k = 0; k < power; k++)
            {
                result *= numbers[i];
            }
            numbers[i] = result;
        }
    }

    // Returns a NEW array of the powers; the original stays unchanged
    static int[] Powers(int[] numbers, int power)
    {
        int[] copy = (int[])numbers.Clone();
        RaiseToPower(copy, power);
        return copy;
    }

    static void Main()
    {
        int[] a = { 1, 2, 3, 4 };
        RaiseToPower(a, 3);
        Show(a);

        int[] b = { 2, -3, 0, 5 };
        RaiseToPower(b, 2);
        Show(b);

        int[] c = { 7, 8 };
        RaiseToPower(c, 0);
        Show(c);

        int[] d = new int[0];
        RaiseToPower(d, 5);
        Show(d);

        int[] original = { 2, 3 };
        int[] cubes = Powers(original, 3);
        Show(original);
        Show(cubes);
    }`),
        expectedOutput: "1 8 27 64\n4 9 0 25\n1 1\n\n2 3\n8 27\n",
      },
      { kind: "lecture", slug: "multidim", title: { en: "Multidimensional arrays", uk: "Багатовимірні масиви" } },
      { kind: "lecture", slug: "jagged", title: { en: "Arrays of arrays", uk: "Масиви масивів" } },
      {
        kind: "quiz",
        slug: "arrays-quiz",
        title: { en: "Arrays quiz", uk: "Тест: масиви" },
        questions: [
          {
            id: "default",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nint[] a = new int[4];\nConsole.WriteLine(a[3]);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nint[] a = new int[4];\nConsole.WriteLine(a[3]);\n```",
            },
            options: [
              { id: "a", text: { en: "0", uk: "0" } },
              { id: "b", text: { en: "4", uk: "4" } },
              { id: "c", text: { en: "Nothing: the array has no values yet", uk: "Нічого: у масиві ще немає значень" } },
              { id: "d", text: { en: "It crashes with `IndexOutOfRangeException`", uk: "Він аварійно завершується з `IndexOutOfRangeException`" } },
            ],
            correct: ["a"],
          },
          {
            id: "out-of-range",
            mode: "single",
            prompt: {
              en: "What happens with this code?\n\n```csharp\nint[] a = { 1, 2, 3 };\nConsole.WriteLine(a[a.Length]);\n```",
              uk: "Що станеться з цим кодом?\n\n```csharp\nint[] a = { 1, 2, 3 };\nConsole.WriteLine(a[a.Length]);\n```",
            },
            options: [
              { id: "a", text: { en: "It prints 3", uk: "Він надрукує 3" } },
              { id: "b", text: { en: "It prints 0", uk: "Він надрукує 0" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
              { id: "d", text: { en: "It crashes with `IndexOutOfRangeException`", uk: "Він аварійно завершується з `IndexOutOfRangeException`" } },
            ],
            correct: ["d"],
          },
          {
            id: "alias",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nint[] a = { 1, 2, 3 };\nint[] b = a;\nb[0] = 9;\nConsole.WriteLine(a[0]);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nint[] a = { 1, 2, 3 };\nint[] b = a;\nb[0] = 9;\nConsole.WriteLine(a[0]);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "9", uk: "9" } },
              { id: "c", text: { en: "0", uk: "0" } },
            ],
            correct: ["b"],
          },
          {
            id: "equals",
            mode: "single",
            prompt: {
              en: "What does `Console.WriteLine(new[] { 1, 2 } == new[] { 1, 2 });` print?",
              uk: "Що друкує `Console.WriteLine(new[] { 1, 2 } == new[] { 1, 2 });`?",
            },
            options: [
              { id: "a", text: { en: "True, because the contents are equal", uk: "True, бо вміст однаковий" } },
              { id: "b", text: { en: "False, because they are two different arrays", uk: "False, бо це два різні масиви" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "reassign",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nstatic void Change(int[] x)\n{\n    x = new int[] { 9 };\n}\n\nstatic void Main()\n{\n    int[] a = { 1 };\n    Change(a);\n    Console.WriteLine(a[0]);\n}\n```",
              uk: "Що друкує ця програма?\n\n```csharp\nstatic void Change(int[] x)\n{\n    x = new int[] { 9 };\n}\n\nstatic void Main()\n{\n    int[] a = { 1 };\n    Change(a);\n    Console.WriteLine(a[0]);\n}\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "9", uk: "9" } },
              { id: "c", text: { en: "0", uk: "0" } },
            ],
            correct: ["a"],
          },
          {
            id: "length-2d",
            mode: "single",
            prompt: {
              en: "What is the value of `m.Length` for `int[,] m = new int[3, 4];`?",
              uk: "Чому дорівнює `m.Length` для `int[,] m = new int[3, 4];`?",
            },
            options: [
              { id: "a", text: { en: "3", uk: "3" } },
              { id: "b", text: { en: "4", uk: "4" } },
              { id: "c", text: { en: "7", uk: "7" } },
              { id: "d", text: { en: "12", uk: "12" } },
            ],
            correct: ["d"],
          },
          {
            id: "valid-declarations",
            mode: "multi",
            prompt: { en: "Which declarations compile?", uk: "Які оголошення компілюються?" },
            options: [
              { id: "a", text: { en: "`int[] a = { 1, 2, 3 };`", uk: "`int[] a = { 1, 2, 3 };`" } },
              { id: "b", text: { en: "`var a = new[] { 1, 2, 3 };`", uk: "`var a = new[] { 1, 2, 3 };`" } },
              { id: "c", text: { en: "`int[] a; a = { 1, 2, 3 };`", uk: "`int[] a; a = { 1, 2, 3 };`" } },
              { id: "d", text: { en: "`int[] a = new int[3] { 1, 2, 3 };`", uk: "`int[] a = new int[3] { 1, 2, 3 };`" } },
              { id: "e", text: { en: "`int[] a = new int[2] { 1, 2, 3 };`", uk: "`int[] a = new int[2] { 1, 2, 3 };`" } },
            ],
            correct: ["a", "b", "d"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "tic-tac-toe",
        title: { en: "* Tic-tac-toe", uk: "* Хрестики-нулики" },
        language: "csharp",
        starter: PROGRAM(`    // Builds the board from text such as "XXX/OO./..." ('.' is an empty cell)
    static char[,] Parse(string text)
    {
        char[,] board = new char[3, 3];
        for (int r = 0; r < 3; r++)
        {
            for (int c = 0; c < 3; c++)
            {
                board[r, c] = text[r * 4 + c];
            }
        }
        return board;
    }

    // 'X' or 'O' if that player has three in a row, otherwise '-'
    static char Winner(char[,] board)
    {
        // Write your code here
        return '-';
    }

    static void Main()
    {
        Console.WriteLine(Winner(Parse("XXX/OO./...")));
        Console.WriteLine(Winner(Parse("XO./XO./.O.")));
        Console.WriteLine(Winner(Parse("XOO/OXO/OOX")));
        Console.WriteLine(Winner(Parse("OOX/OXO/XOO")));
        Console.WriteLine(Winner(Parse("XOX/XOO/OXX")));
        Console.WriteLine(Winner(Parse("XO./.X./..O")));
        Console.WriteLine(Winner(Parse("OOO/XX./X..")));
    }`),
        solution: PROGRAM(`    // Builds the board from text such as "XXX/OO./..." ('.' is an empty cell)
    static char[,] Parse(string text)
    {
        char[,] board = new char[3, 3];
        for (int r = 0; r < 3; r++)
        {
            for (int c = 0; c < 3; c++)
            {
                board[r, c] = text[r * 4 + c];
            }
        }
        return board;
    }

    // 'X' or 'O' if that player has three in a row, otherwise '-'
    static char Winner(char[,] board)
    {
        for (int i = 0; i < 3; i++)
        {
            if (board[i, 0] != '.' && board[i, 0] == board[i, 1] && board[i, 1] == board[i, 2])
            {
                return board[i, 0];
            }
            if (board[0, i] != '.' && board[0, i] == board[1, i] && board[1, i] == board[2, i])
            {
                return board[0, i];
            }
        }
        if (board[1, 1] != '.')
        {
            bool mainDiagonal = board[0, 0] == board[1, 1] && board[1, 1] == board[2, 2];
            bool otherDiagonal = board[0, 2] == board[1, 1] && board[1, 1] == board[2, 0];
            if (mainDiagonal || otherDiagonal)
            {
                return board[1, 1];
            }
        }
        return '-';
    }

    static void Main()
    {
        Console.WriteLine(Winner(Parse("XXX/OO./...")));
        Console.WriteLine(Winner(Parse("XO./XO./.O.")));
        Console.WriteLine(Winner(Parse("XOO/OXO/OOX")));
        Console.WriteLine(Winner(Parse("OOX/OXO/XOO")));
        Console.WriteLine(Winner(Parse("XOX/XOO/OXX")));
        Console.WriteLine(Winner(Parse("XO./.X./..O")));
        Console.WriteLine(Winner(Parse("OOO/XX./X..")));
    }`),
        expectedOutput: "X\nO\nX\nX\n-\n-\nO\n",
      },
      {
        kind: "quiz",
        slug: "arrays-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "jagged-null",
            mode: "single",
            prompt: {
              en: "What is `rows[0]` right after `int[][] rows = new int[3][];`?",
              uk: "Чому дорівнює `rows[0]` одразу після `int[][] rows = new int[3][];`?",
            },
            options: [
              { id: "a", text: { en: "An empty array", uk: "Порожній масив" } },
              { id: "b", text: { en: "An array of three zeros", uk: "Масив із трьох нулів" } },
              { id: "c", text: { en: "`null`", uk: "`null`" } },
              { id: "d", text: { en: "The code does not compile", uk: "Код не компілюється" } },
            ],
            correct: ["c"],
          },
          {
            id: "reference-types",
            mode: "multi",
            prompt: { en: "Which of these are reference types?", uk: "Які з цих типів є посилальними?" },
            options: [
              { id: "a", text: { en: "`int`", uk: "`int`" } },
              { id: "b", text: { en: "`int[]`", uk: "`int[]`" } },
              { id: "c", text: { en: "`string`", uk: "`string`" } },
              { id: "d", text: { en: "`double`", uk: "`double`" } },
              { id: "e", text: { en: "`char`", uk: "`char`" } },
            ],
            correct: ["b", "c"],
          },
          {
            id: "sort",
            mode: "single",
            prompt: { en: "What does `Array.Sort(a)` do?", uk: "Що робить `Array.Sort(a)`?" },
            options: [
              { id: "a", text: { en: "Sorts the array `a` in place and returns nothing", uk: "Сортує масив `a` на місці й нічого не повертає" } },
              { id: "b", text: { en: "Returns a new sorted array and leaves `a` unchanged", uk: "Повертає новий відсортований масив і лишає `a` без змін" } },
              { id: "c", text: { en: "Only checks whether `a` is sorted", uk: "Лише перевіряє, чи `a` відсортований" } },
            ],
            correct: ["a"],
          },
          {
            id: "indexof",
            mode: "single",
            prompt: {
              en: "What does `Array.IndexOf(a, 7)` return if the array contains no 7?",
              uk: "Що повертає `Array.IndexOf(a, 7)`, якщо в масиві немає 7?",
            },
            options: [
              { id: "a", text: { en: "0", uk: "0" } },
              { id: "b", text: { en: "-1", uk: "-1" } },
              { id: "c", text: { en: "`null`", uk: "`null`" } },
              { id: "d", text: { en: "It throws an exception", uk: "Він кидає виняток" } },
            ],
            correct: ["b"],
          },
          {
            id: "params",
            mode: "single",
            prompt: {
              en: "The method adds up all its arguments: `static int Sum(params int[] numbers)`. What does `Sum()` return?",
              uk: "Метод додає всі свої аргументи: `static int Sum(params int[] numbers)`. Що повертає `Sum()`?",
            },
            options: [
              { id: "a", text: { en: "0, because `numbers` is an empty array", uk: "0, бо `numbers` — порожній масив" } },
              { id: "b", text: { en: "`null`", uk: "`null`" } },
              { id: "c", text: { en: "Nothing: the call does not compile", uk: "Нічого: виклик не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "read-2d",
            mode: "single",
            prompt: {
              en: "Which expression reads the element in row 1 and column 2 of the rectangular array `int[,] m`?",
              uk: "Який вираз читає елемент у рядку 1 і стовпчику 2 прямокутного масиву `int[,] m`?",
            },
            options: [
              { id: "a", text: { en: "`m[1][2]`", uk: "`m[1][2]`" } },
              { id: "b", text: { en: "`m[1, 2]`", uk: "`m[1, 2]`" } },
              { id: "c", text: { en: "`m(1, 2)`", uk: "`m(1, 2)`" } },
              { id: "d", text: { en: "`m[2, 1]`", uk: "`m[2, 1]`" } },
            ],
            correct: ["b"],
          },
          {
            id: "jagged-when",
            mode: "single",
            prompt: {
              en: "When is an array of arrays (`int[][]`) a better choice than a rectangular array (`int[,]`)?",
              uk: "Коли масив масивів (`int[][]`) краще за прямокутний масив (`int[,]`)?",
            },
            options: [
              { id: "a", text: { en: "When the rows have different lengths", uk: "Коли рядки мають різну довжину" } },
              { id: "b", text: { en: "When all the rows are the same length", uk: "Коли всі рядки однакової довжини" } },
              { id: "c", text: { en: "When there are exactly two rows", uk: "Коли рядків рівно два" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "histogram",
        title: { en: "Practice: Histogram", uk: "Практика «Гістограма»" },
        language: "csharp",
        starter: PROGRAM(`    // Draws vertical bars for digits 0..9, then a line of '-' and the values themselves
    static void PrintHistogram(int[] values)
    {
        // Write your code here
    }

    static void Main()
    {
        PrintHistogram(new[] { 3, 1, 4, 2 });
        Console.WriteLine("===");
        PrintHistogram(new[] { 5, 0, 2 });
    }`),
        solution: PROGRAM(`    // Draws vertical bars for digits 0..9, then a line of '-' and the values themselves
    static void PrintHistogram(int[] values)
    {
        int max = 0;
        for (int i = 0; i < values.Length; i++)
        {
            if (values[i] > max) max = values[i];
        }

        for (int level = max; level >= 1; level--)
        {
            for (int i = 0; i < values.Length; i++)
            {
                Console.Write(values[i] >= level ? "#" : ".");
            }
            Console.WriteLine();
        }

        for (int i = 0; i < values.Length; i++)
        {
            Console.Write("-");
        }
        Console.WriteLine();

        for (int i = 0; i < values.Length; i++)
        {
            Console.Write(values[i]);
        }
        Console.WriteLine();
    }

    static void Main()
    {
        PrintHistogram(new[] { 3, 1, 4, 2 });
        Console.WriteLine("===");
        PrintHistogram(new[] { 5, 0, 2 });
    }`),
        expectedOutput: "..#.\n#.#.\n#.##\n####\n----\n3142\n===\n#..\n#..\n#..\n#.#\n#.#\n---\n502\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "heat-map",
        title: { en: "Practice: Heat map", uk: "Практика «Теплова карта»" },
        language: "csharp",
        starter: PROGRAM(`    const string Ramp = ".:-=+*#%@X";

    // Prints one text line per row; every cell becomes the Ramp symbol of its value
    static void Render(int[,] grid)
    {
        // Write your code here
    }

    // The position "row,column" of the largest value (the first one in reading order)
    static string Hottest(int[,] grid)
    {
        // Write your code here
        return "";
    }

    static void Main()
    {
        int[,] grid =
        {
            { 0, 1, 2, 1, 0 },
            { 1, 3, 5, 3, 1 },
            { 2, 5, 9, 5, 2 },
            { 1, 3, 5, 3, 1 },
        };
        Render(grid);
        Console.WriteLine(Hottest(grid));

        int[,] ties = { { 9, 0 }, { 0, 9 } };
        Render(ties);
        Console.WriteLine(Hottest(ties));
    }`),
        solution: PROGRAM(`    const string Ramp = ".:-=+*#%@X";

    // Prints one text line per row; every cell becomes the Ramp symbol of its value
    static void Render(int[,] grid)
    {
        for (int row = 0; row < grid.GetLength(0); row++)
        {
            for (int col = 0; col < grid.GetLength(1); col++)
            {
                Console.Write(Ramp[grid[row, col]]);
            }
            Console.WriteLine();
        }
    }

    // The position "row,column" of the largest value (the first one in reading order)
    static string Hottest(int[,] grid)
    {
        int bestRow = 0;
        int bestCol = 0;
        for (int row = 0; row < grid.GetLength(0); row++)
        {
            for (int col = 0; col < grid.GetLength(1); col++)
            {
                if (grid[row, col] > grid[bestRow, bestCol])
                {
                    bestRow = row;
                    bestCol = col;
                }
            }
        }
        return bestRow + "," + bestCol;
    }

    static void Main()
    {
        int[,] grid =
        {
            { 0, 1, 2, 1, 0 },
            { 1, 3, 5, 3, 1 },
            { 2, 5, 9, 5, 2 },
            { 1, 3, 5, 3, 1 },
        };
        Render(grid);
        Console.WriteLine(Hottest(grid));

        int[,] ties = { { 9, 0 }, { 0, 9 } };
        Render(ties);
        Console.WriteLine(Hottest(ties));
    }`),
        expectedOutput: ".:-:.\n:=*=:\n-*X*-\n:=*=:\n2,2\nX.\n.X\n0,0\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "names-facts",
        title: { en: "Practice: Facts about names", uk: "Практика «Цікаве про імена»" },
        language: "csharp",
        starter: PROGRAM(`    // The longest name (the first one if several tie); "" for an empty array
    static string Longest(string[] names)
    {
        // Write your code here
        return "";
    }

    // How many names end with the given letter (an exact match)
    static int CountEndingWith(string[] names, char letter)
    {
        // Write your code here
        return -1;
    }

    // The average length of a name; 0 for an empty array
    static double AverageLength(string[] names)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        string[] names = { "Olena", "Bohdan", "Iryna", "Taras", "Oksana", "Andriy", "Maryna" };
        Console.WriteLine(Longest(names));
        Console.WriteLine(CountEndingWith(names, 'a'));
        Console.WriteLine(CountEndingWith(names, 'y'));
        Console.WriteLine(Math.Round(AverageLength(names), 2));
        Console.WriteLine("[" + Longest(new string[0]) + "]");
        Console.WriteLine(Math.Round(AverageLength(new string[0]), 2));
    }`),
        solution: PROGRAM(`    // The longest name (the first one if several tie); "" for an empty array
    static string Longest(string[] names)
    {
        string best = "";
        foreach (string name in names)
        {
            if (name.Length > best.Length) best = name;
        }
        return best;
    }

    // How many names end with the given letter (an exact match)
    static int CountEndingWith(string[] names, char letter)
    {
        int count = 0;
        foreach (string name in names)
        {
            if (name.Length > 0 && name[name.Length - 1] == letter) count++;
        }
        return count;
    }

    // The average length of a name; 0 for an empty array
    static double AverageLength(string[] names)
    {
        if (names.Length == 0) return 0;
        int total = 0;
        foreach (string name in names)
        {
            total += name.Length;
        }
        return (double)total / names.Length;
    }

    static void Main()
    {
        string[] names = { "Olena", "Bohdan", "Iryna", "Taras", "Oksana", "Andriy", "Maryna" };
        Console.WriteLine(Longest(names));
        Console.WriteLine(CountEndingWith(names, 'a'));
        Console.WriteLine(CountEndingWith(names, 'y'));
        Console.WriteLine(Math.Round(AverageLength(names), 2));
        Console.WriteLine("[" + Longest(new string[0]) + "]");
        Console.WriteLine(Math.Round(AverageLength(new string[0]), 2));
    }`),
        expectedOutput: "Bohdan\n4\n1\n5.57\n[]\n0\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "collections-strings-files",
    title: { en: "Collections, strings, files", uk: "Колекції, рядки, файли" },
    slides: [
      { kind: "lecture", slug: "lists-dictionaries-strings", title: { en: "Lists, dictionaries and strings", uk: "Списки, словники та рядки" } },
      { kind: "lecture", slug: "lists", title: { en: "Lists", uk: "Списки" } },
      {
        kind: "practice",
        slug: "stranger-cipher",
        title: { en: "The stranger's cipher", uk: "Шифр незнайомки" },
        language: "csharp",
        starter: PROGRAM(`    // Moves every English letter forward by shift places (wrapping around),
    // keeps the case, and leaves all other characters unchanged
    static string Encrypt(string text, int shift)
    {
        // Write your code here
        return text;
    }

    // Undoes Encrypt with the same shift
    static string Decrypt(string text, int shift)
    {
        // Write your code here
        return text;
    }

    static void Main()
    {
        Console.WriteLine(Encrypt("Hello, World!", 3));
        Console.WriteLine(Encrypt("xyz", 3));
        Console.WriteLine(Encrypt("Abc", -1));
        Console.WriteLine(Encrypt("Test", 29));
        Console.WriteLine(Decrypt("Khoor, Zruog!", 3));
        Console.WriteLine(Decrypt(Encrypt("Attack at dawn", 7), 7));
    }`),
        solution: PROGRAM(`    static char ShiftLetter(char c, int shift)
    {
        if (c >= 'a' && c <= 'z')
        {
            return (char)('a' + ((c - 'a' + shift) % 26 + 26) % 26);
        }
        if (c >= 'A' && c <= 'Z')
        {
            return (char)('A' + ((c - 'A' + shift) % 26 + 26) % 26);
        }
        return c;
    }

    // Moves every English letter forward by shift places (wrapping around),
    // keeps the case, and leaves all other characters unchanged
    static string Encrypt(string text, int shift)
    {
        string result = "";
        foreach (char c in text)
        {
            result += ShiftLetter(c, shift);
        }
        return result;
    }

    // Undoes Encrypt with the same shift
    static string Decrypt(string text, int shift)
    {
        return Encrypt(text, -shift);
    }

    static void Main()
    {
        Console.WriteLine(Encrypt("Hello, World!", 3));
        Console.WriteLine(Encrypt("xyz", 3));
        Console.WriteLine(Encrypt("Abc", -1));
        Console.WriteLine(Encrypt("Test", 29));
        Console.WriteLine(Decrypt("Khoor, Zruog!", 3));
        Console.WriteLine(Decrypt(Encrypt("Attack at dawn", 7), 7));
    }`),
        expectedOutput: "Khoor, Zruog!\nabc\nZab\nWhvw\nHello, World!\nAttack at dawn\n",
      },
      { kind: "lecture", slug: "dictionaries", title: { en: "Dictionaries", uk: "Словники" } },
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
      {
        kind: "practice",
        slug: "contacts",
        title: { en: "Useful acquaintances", uk: "Корисні знайомства" },
        language: "csharp",
        starter: PROGRAM(
          `    // A dictionary from a name to a phone. If a name repeats, the last phone wins.
    static Dictionary<string, string> BuildBook(string[] names, string[] phones)
    {
        // Write your code here
        return new Dictionary<string, string>();
    }

    // The phone of the name, or "unknown"
    static string Lookup(Dictionary<string, string> book, string name)
    {
        // Write your code here
        return "";
    }

    // Moves an entry to a new name. false (and no change) if oldName is missing
    // or newName is already taken.
    static bool Rename(Dictionary<string, string> book, string oldName, string newName)
    {
        // Write your code here
        return false;
    }

    static void Main()
    {
        var book = BuildBook(new[] { "Ann", "Bo", "Cy", "Ann" }, new[] { "111", "222", "333", "444" });
        Console.WriteLine(Lookup(book, "Ann"));
        Console.WriteLine(Lookup(book, "Dan"));
        Console.WriteLine(Rename(book, "Bo", "Bob"));
        Console.WriteLine(Lookup(book, "Bo"));
        Console.WriteLine(Lookup(book, "Bob"));
        Console.WriteLine(Rename(book, "Zed", "Z"));
        Console.WriteLine(Rename(book, "Ann", "Cy"));
        Console.WriteLine(book.Count);
    }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM(
          `    // A dictionary from a name to a phone. If a name repeats, the last phone wins.
    static Dictionary<string, string> BuildBook(string[] names, string[] phones)
    {
        var book = new Dictionary<string, string>();
        for (int i = 0; i < names.Length; i++)
        {
            book[names[i]] = phones[i];
        }
        return book;
    }

    // The phone of the name, or "unknown"
    static string Lookup(Dictionary<string, string> book, string name)
    {
        string phone;
        if (book.TryGetValue(name, out phone))
        {
            return phone;
        }
        return "unknown";
    }

    // Moves an entry to a new name. false (and no change) if oldName is missing
    // or newName is already taken.
    static bool Rename(Dictionary<string, string> book, string oldName, string newName)
    {
        if (!book.ContainsKey(oldName) || book.ContainsKey(newName))
        {
            return false;
        }
        string phone = book[oldName];
        book.Remove(oldName);
        book[newName] = phone;
        return true;
    }

    static void Main()
    {
        var book = BuildBook(new[] { "Ann", "Bo", "Cy", "Ann" }, new[] { "111", "222", "333", "444" });
        Console.WriteLine(Lookup(book, "Ann"));
        Console.WriteLine(Lookup(book, "Dan"));
        Console.WriteLine(Rename(book, "Bo", "Bob"));
        Console.WriteLine(Lookup(book, "Bo"));
        Console.WriteLine(Lookup(book, "Bob"));
        Console.WriteLine(Rename(book, "Zed", "Z"));
        Console.WriteLine(Rename(book, "Ann", "Cy"));
        Console.WriteLine(book.Count);
    }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "444\nunknown\nTrue\nunknown\n222\nFalse\nFalse\n3\n",
      },
      { kind: "lecture", slug: "strings-vs-arrays", title: { en: "Comparing strings and arrays", uk: "Порівняння рядків і масивів" } },
      {
        kind: "practice",
        slug: "anagrams",
        title: { en: "Anagrams", uk: "Анаграми" },
        language: "csharp",
        starter: PROGRAM(`    // True when both texts have the same letters in the same quantities.
    // The case and the spaces are ignored.
    static bool AreAnagrams(string a, string b)
    {
        // Write your code here
        return false;
    }

    static void Main()
    {
        Console.WriteLine(AreAnagrams("Listen", "Silent"));
        Console.WriteLine(AreAnagrams("Dormitory", "Dirty room"));
        Console.WriteLine(AreAnagrams("abc", "abd"));
        Console.WriteLine(AreAnagrams("", ""));
        Console.WriteLine(AreAnagrams("a gentleman", "elegant man"));
        Console.WriteLine(AreAnagrams("Hello", "World"));
        Console.WriteLine(AreAnagrams("aab", "abb"));
    }`),
        solution: PROGRAM(`    static string SortedLetters(string text)
    {
        char[] letters = text.Replace(" ", "").ToLower().ToCharArray();
        Array.Sort(letters);
        return new string(letters);
    }

    // True when both texts have the same letters in the same quantities.
    // The case and the spaces are ignored.
    static bool AreAnagrams(string a, string b)
    {
        return SortedLetters(a) == SortedLetters(b);
    }

    static void Main()
    {
        Console.WriteLine(AreAnagrams("Listen", "Silent"));
        Console.WriteLine(AreAnagrams("Dormitory", "Dirty room"));
        Console.WriteLine(AreAnagrams("abc", "abd"));
        Console.WriteLine(AreAnagrams("", ""));
        Console.WriteLine(AreAnagrams("a gentleman", "elegant man"));
        Console.WriteLine(AreAnagrams("Hello", "World"));
        Console.WriteLine(AreAnagrams("aab", "abb"));
    }`),
        expectedOutput: "True\nTrue\nFalse\nTrue\nTrue\nFalse\nFalse\n",
      },
      {
        kind: "quiz",
        slug: "memory-maps",
        title: { en: "Memory maps", uk: "Карти пам'яті" },
        questions: [
          {
            id: "list-alias",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nvar a = new List<int> { 1, 2 };\nvar b = a;\nb.Add(3);\nConsole.WriteLine(a.Count);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nvar a = new List<int> { 1, 2 };\nvar b = a;\nb.Add(3);\nConsole.WriteLine(a.Count);\n```",
            },
            options: [
              { id: "a", text: { en: "2", uk: "2" } },
              { id: "b", text: { en: "3", uk: "3" } },
              { id: "c", text: { en: "1", uk: "1" } },
            ],
            correct: ["b"],
          },
          {
            id: "string-copy",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nstring s1 = \"ab\";\nstring s2 = s1;\ns2 += \"c\";\nConsole.WriteLine(s1);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstring s1 = \"ab\";\nstring s2 = s1;\ns2 += \"c\";\nConsole.WriteLine(s1);\n```",
            },
            options: [
              { id: "a", text: { en: "`abc`", uk: "`abc`" } },
              { id: "b", text: { en: "`ab`", uk: "`ab`" } },
              { id: "c", text: { en: "`c`", uk: "`c`" } },
            ],
            correct: ["b"],
          },
          {
            id: "dictionary-alias",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nvar d = new Dictionary<string, int> { { \"a\", 1 } };\nvar e = d;\ne[\"a\"] = 5;\nConsole.WriteLine(d[\"a\"]);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nvar d = new Dictionary<string, int> { { \"a\", 1 } };\nvar e = d;\ne[\"a\"] = 5;\nConsole.WriteLine(d[\"a\"]);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "It throws `KeyNotFoundException`", uk: "Він кидає `KeyNotFoundException`" } },
            ],
            correct: ["b"],
          },
          {
            id: "clone",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nint[] x = { 1, 2, 3 };\nint[] y = (int[])x.Clone();\ny[0] = 9;\nConsole.WriteLine(x[0]);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nint[] x = { 1, 2, 3 };\nint[] y = (int[])x.Clone();\ny[0] = 9;\nConsole.WriteLine(x[0]);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "9", uk: "9" } },
              { id: "c", text: { en: "0", uk: "0" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "benford",
        title: { en: "Benford's law", uk: "Закон Бенфорда" },
        language: "csharp",
        starter: PROGRAM(`    // The first count Fibonacci numbers: 1, 1, 2, 3, 5, ...
    static long[] Fibonacci(int count)
    {
        // Write your code here
        return new long[0];
    }

    // The first digit of a positive number
    static int FirstDigit(long n)
    {
        // Write your code here
        return -1;
    }

    // counts[d] is how many numbers start with the digit d (counts[0] stays 0)
    static int[] CountFirstDigits(long[] numbers)
    {
        // Write your code here
        return new int[10];
    }

    static void Main()
    {
        long[] fib = Fibonacci(50);
        int[] counts = CountFirstDigits(fib);
        for (int d = 1; d <= 9; d++)
        {
            Console.WriteLine(d + ": " + counts[d]);
        }
    }`),
        solution: PROGRAM(`    // The first count Fibonacci numbers: 1, 1, 2, 3, 5, ...
    static long[] Fibonacci(int count)
    {
        long[] result = new long[count];
        for (int i = 0; i < count; i++)
        {
            result[i] = i < 2 ? 1 : result[i - 1] + result[i - 2];
        }
        return result;
    }

    // The first digit of a positive number
    static int FirstDigit(long n)
    {
        while (n >= 10)
        {
            n /= 10;
        }
        return (int)n;
    }

    // counts[d] is how many numbers start with the digit d (counts[0] stays 0)
    static int[] CountFirstDigits(long[] numbers)
    {
        int[] counts = new int[10];
        foreach (long n in numbers)
        {
            counts[FirstDigit(n)]++;
        }
        return counts;
    }

    static void Main()
    {
        long[] fib = Fibonacci(50);
        int[] counts = CountFirstDigits(fib);
        for (int d = 1; d <= 9; d++)
        {
            Console.WriteLine(d + ": " + counts[d]);
        }
    }`),
        expectedOutput: "1: 16\n2: 9\n3: 6\n4: 4\n5: 4\n6: 3\n7: 3\n8: 3\n9: 2\n",
      },
      {
        kind: "practice",
        slug: "split-join",
        title: { en: "Split and Join", uk: "Split і Join" },
        language: "csharp",
        starter: PROGRAM(`    // The words in the reverse order, separated by single spaces
    static string ReverseWords(string text)
    {
        // Write your code here
        return "";
    }

    // The first letters of the words, in capitals
    static string Acronym(string phrase)
    {
        // Write your code here
        return "";
    }

    // The number of words, however many spaces separate them
    static int CountWords(string text)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        Console.WriteLine("[" + ReverseWords("the quick brown fox") + "]");
        Console.WriteLine("[" + ReverseWords("  hello   world ") + "]");
        Console.WriteLine("[" + ReverseWords("") + "]");
        Console.WriteLine(Acronym("portable network graphics"));
        Console.WriteLine(Acronym("as soon as possible"));
        Console.WriteLine(CountWords("  many   spaces  here "));
        Console.WriteLine(CountWords(""));
    }`),
        solution: PROGRAM(`    static string[] SplitWords(string text)
    {
        return text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
    }

    // The words in the reverse order, separated by single spaces
    static string ReverseWords(string text)
    {
        string[] words = SplitWords(text);
        Array.Reverse(words);
        return string.Join(" ", words);
    }

    // The first letters of the words, in capitals
    static string Acronym(string phrase)
    {
        string result = "";
        foreach (string word in SplitWords(phrase))
        {
            result += char.ToUpper(word[0]);
        }
        return result;
    }

    // The number of words, however many spaces separate them
    static int CountWords(string text)
    {
        return SplitWords(text).Length;
    }

    static void Main()
    {
        Console.WriteLine("[" + ReverseWords("the quick brown fox") + "]");
        Console.WriteLine("[" + ReverseWords("  hello   world ") + "]");
        Console.WriteLine("[" + ReverseWords("") + "]");
        Console.WriteLine(Acronym("portable network graphics"));
        Console.WriteLine(Acronym("as soon as possible"));
        Console.WriteLine(CountWords("  many   spaces  here "));
        Console.WriteLine(CountWords(""));
    }`),
        expectedOutput: "[fox brown quick the]\n[world hello]\n[]\nPNG\nASAP\n3\n0\n",
      },
      { kind: "lecture", slug: "stringbuilder", title: { en: "StringBuilder", uk: "StringBuilder" } },
      {
        kind: "practice",
        slug: "stranger-again",
        title: { en: "The stranger again", uk: "Знову незнайомка" },
        language: "csharp",
        starter: PROGRAM(
          `    // Vigenere cipher for capital letters. Other characters are copied unchanged
    // and do not use up a letter of the key. Build the result with a StringBuilder.
    static string Encrypt(string text, string key)
    {
        // Write your code here
        return text;
    }

    static string Decrypt(string text, string key)
    {
        // Write your code here
        return text;
    }

    static void Main()
    {
        Console.WriteLine(Encrypt("ATTACK AT DAWN", "LEMON"));
        Console.WriteLine(Decrypt("LXFOPV EF RNHR", "LEMON"));
        Console.WriteLine(Encrypt("HELLO", "A"));
        Console.WriteLine(Encrypt("HELLO", "B"));
        Console.WriteLine(Decrypt("IFMMP", "B"));
    }`,
          "using System.Text;",
        ),
        solution: PROGRAM(
          `    // direction is 1 to encrypt and -1 to decrypt
    static string Crypt(string text, string key, int direction)
    {
        var sb = new StringBuilder();
        int k = 0;
        foreach (char c in text)
        {
            if (c >= 'A' && c <= 'Z')
            {
                int shift = key[k % key.Length] - 'A';
                int position = ((c - 'A' + direction * shift) % 26 + 26) % 26;
                sb.Append((char)('A' + position));
                k++;
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }

    // Vigenere cipher for capital letters. Other characters are copied unchanged
    // and do not use up a letter of the key. Build the result with a StringBuilder.
    static string Encrypt(string text, string key)
    {
        return Crypt(text, key, 1);
    }

    static string Decrypt(string text, string key)
    {
        return Crypt(text, key, -1);
    }

    static void Main()
    {
        Console.WriteLine(Encrypt("ATTACK AT DAWN", "LEMON"));
        Console.WriteLine(Decrypt("LXFOPV EF RNHR", "LEMON"));
        Console.WriteLine(Encrypt("HELLO", "A"));
        Console.WriteLine(Encrypt("HELLO", "B"));
        Console.WriteLine(Decrypt("IFMMP", "B"));
    }`,
          "using System.Text;",
        ),
        expectedOutput: "LXFOPV EF RNHR\nATTACK AT DAWN\nHELLO\nIFMMP\nHELLO\n",
      },
      { kind: "lecture", slug: "special-chars", title: { en: "Special characters", uk: "Спеціальні символи" } },
      { kind: "lecture", slug: "formatted-output", title: { en: "Formatted output", uk: "Форматований вивід" } },
      {
        kind: "practice",
        slug: "receipt",
        title: { en: "Text generation: a receipt", uk: "Генерація текстів: чек" },
        language: "csharp",
        starter: PROGRAM(
          `    // One line per item: {name,-10}{quantity,3} x {price,7:F2} = {total,8:F2}
    // then 34 hyphens, then "TOTAL" left-aligned in 26 characters and the grand total in 8.
    // The lines are separated by \\n, with no line break at the end.
    static string Receipt(string[] names, int[] quantities, double[] prices)
    {
        // Write your code here
        return "";
    }

    static void Main()
    {
        string[] names = { "Tea", "Coffee", "Cake" };
        int[] quantities = { 2, 1, 3 };
        double[] prices = { 3.5, 4.25, 12.9 };
        Console.WriteLine(Receipt(names, quantities, prices));
    }`,
          "using System.Collections.Generic;\nusing System.Globalization;",
        ),
        solution: PROGRAM(
          `    // One line per item: {name,-10}{quantity,3} x {price,7:F2} = {total,8:F2}
    // then 34 hyphens, then "TOTAL" left-aligned in 26 characters and the grand total in 8.
    // The lines are separated by \\n, with no line break at the end.
    static string Receipt(string[] names, int[] quantities, double[] prices)
    {
        var lines = new List<string>();
        double grand = 0;
        for (int i = 0; i < names.Length; i++)
        {
            double total = quantities[i] * prices[i];
            grand += total;
            lines.Add(string.Format(CultureInfo.InvariantCulture,
                "{0,-10}{1,3} x {2,7:F2} = {3,8:F2}", names[i], quantities[i], prices[i], total));
        }
        lines.Add(new string('-', 34));
        lines.Add(string.Format(CultureInfo.InvariantCulture, "{0,-26}{1,8:F2}", "TOTAL", grand));
        return string.Join("\\n", lines);
    }

    static void Main()
    {
        string[] names = { "Tea", "Coffee", "Cake" };
        int[] quantities = { 2, 1, 3 };
        double[] prices = { 3.5, 4.25, 12.9 };
        Console.WriteLine(Receipt(names, quantities, prices));
    }`,
          "using System.Collections.Generic;\nusing System.Globalization;",
        ),
        expectedOutput:
          "Tea         2 x    3.50 =     7.00\nCoffee      1 x    4.25 =     4.25\nCake        3 x   12.90 =    38.70\n----------------------------------\nTOTAL                        49.95\n",
      },
      {
        kind: "quiz",
        slug: "strings-work-quiz",
        title: { en: "Working with strings", uk: "Робота зі рядками" },
        questions: [
          {
            id: "split-count",
            mode: "single",
            prompt: {
              en: "What is the value of `\"a,b,,c\".Split(',').Length`?",
              uk: "Чому дорівнює `\"a,b,,c\".Split(',').Length`?",
            },
            options: [
              { id: "a", text: { en: "3", uk: "3" } },
              { id: "b", text: { en: "4", uk: "4" } },
              { id: "c", text: { en: "5", uk: "5" } },
              { id: "d", text: { en: "2", uk: "2" } },
            ],
            correct: ["b"],
          },
          {
            id: "join",
            mode: "single",
            prompt: {
              en: "What does `string.Join(\"-\", new[] { \"a\", \"b\", \"c\" })` return?",
              uk: "Що повертає `string.Join(\"-\", new[] { \"a\", \"b\", \"c\" })`?",
            },
            options: [
              { id: "a", text: { en: "`a-b-c`", uk: "`a-b-c`" } },
              { id: "b", text: { en: "`-a-b-c-`", uk: "`-a-b-c-`" } },
              { id: "c", text: { en: "`abc-`", uk: "`abc-`" } },
              { id: "d", text: { en: "`a b c`", uk: "`a b c`" } },
            ],
            correct: ["a"],
          },
          {
            id: "builder",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nvar sb = new StringBuilder();\nsb.Append(\"ab\").Append(1);\nConsole.WriteLine(sb.ToString());\n```",
              uk: "Що друкує цей код?\n\n```csharp\nvar sb = new StringBuilder();\nsb.Append(\"ab\").Append(1);\nConsole.WriteLine(sb.ToString());\n```",
            },
            options: [
              { id: "a", text: { en: "`ab1`", uk: "`ab1`" } },
              { id: "b", text: { en: "`1ab`", uk: "`1ab`" } },
              { id: "c", text: { en: "`ab`", uk: "`ab`" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "alignment",
            mode: "single",
            prompt: {
              en: "What does `Console.WriteLine($\"[{42,6}]\");` print between the brackets?",
              uk: "Що друкує `Console.WriteLine($\"[{42,6}]\");` між дужками?",
            },
            options: [
              { id: "a", text: { en: "The number 42 right-aligned in a field 6 characters wide", uk: "Число 42, вирівняне праворуч у полі шириною 6 символів" } },
              { id: "b", text: { en: "The number 42 left-aligned in a field 6 characters wide", uk: "Число 42, вирівняне ліворуч у полі шириною 6 символів" } },
              { id: "c", text: { en: "The number 42 with leading zeros: 000042", uk: "Число 42 з ведучими нулями: 000042" } },
              { id: "d", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "char-arithmetic",
            mode: "single",
            prompt: { en: "What is the value of `(char)('a' + 2)`?", uk: "Чому дорівнює `(char)('a' + 2)`?" },
            options: [
              { id: "a", text: { en: "`'c'`", uk: "`'c'`" } },
              { id: "b", text: { en: "`99`", uk: "`99`" } },
              { id: "c", text: { en: "`\"a2\"`", uk: "`\"a2\"`" } },
              { id: "d", text: { en: "`'b'`", uk: "`'b'`" } },
            ],
            correct: ["a"],
          },
          {
            id: "equality",
            mode: "multi",
            prompt: { en: "Which expressions are `true`?", uk: "Які вирази істинні?" },
            options: [
              { id: "a", text: { en: "`\"abc\" == \"abc\"`", uk: "`\"abc\" == \"abc\"`" } },
              { id: "b", text: { en: "`\"abc\" == \"ABC\"`", uk: "`\"abc\" == \"ABC\"`" } },
              { id: "c", text: { en: "`string.Equals(\"abc\", \"ABC\", StringComparison.OrdinalIgnoreCase)`", uk: "`string.Equals(\"abc\", \"ABC\", StringComparison.OrdinalIgnoreCase)`" } },
              { id: "d", text: { en: "`\"abc\".Equals(\"ABC\")`", uk: "`\"abc\".Equals(\"ABC\")`" } },
              { id: "e", text: { en: "`\"abc\" != \"abd\"`", uk: "`\"abc\" != \"abd\"`" } },
            ],
            correct: ["a", "c", "e"],
          },
        ],
      },
      { kind: "lecture", slug: "files-and-dirs", title: { en: "Files and directories", uk: "Файли та каталоги" } },
      { kind: "lecture", slug: "encoding-files", title: { en: "Encodings and working with files", uk: "Кодування та робота з файлами" } },
      {
        kind: "quiz",
        slug: "files-quiz",
        title: { en: "Working with files", uk: "Робота з файлами" },
        questions: [
          {
            id: "read-all",
            mode: "single",
            prompt: {
              en: "Which call reads a whole small text file into one string?",
              uk: "Який виклик читає цілий невеликий текстовий файл в один рядок?",
            },
            options: [
              { id: "a", text: { en: "`File.ReadAllText(path)`", uk: "`File.ReadAllText(path)`" } },
              { id: "b", text: { en: "`Path.ReadAllText(path)`", uk: "`Path.ReadAllText(path)`" } },
              { id: "c", text: { en: "`Directory.ReadAllText(path)`", uk: "`Directory.ReadAllText(path)`" } },
              { id: "d", text: { en: "`File.Exists(path)`", uk: "`File.Exists(path)`" } },
            ],
            correct: ["a"],
          },
          {
            id: "path-combine",
            mode: "single",
            prompt: {
              en: "Why is `Path.Combine(\"data\", \"a.txt\")` better than `\"data\" + \"/\" + \"a.txt\"`?",
              uk: "Чому `Path.Combine(\"data\", \"a.txt\")` краще за `\"data\" + \"/\" + \"a.txt\"`?",
            },
            options: [
              { id: "a", text: { en: "It uses the separator of the current system and avoids a doubled separator", uk: "Він використовує роздільник поточної системи й уникає подвоєного роздільника" } },
              { id: "b", text: { en: "It checks that the file exists", uk: "Він перевіряє, що файл існує" } },
              { id: "c", text: { en: "It creates the file", uk: "Він створює файл" } },
            ],
            correct: ["a"],
          },
          {
            id: "extension",
            mode: "single",
            prompt: {
              en: "What does `Path.GetExtension(\"report.final.pdf\")` return?",
              uk: "Що повертає `Path.GetExtension(\"report.final.pdf\")`?",
            },
            options: [
              { id: "a", text: { en: "`.pdf`", uk: "`.pdf`" } },
              { id: "b", text: { en: "`pdf`", uk: "`pdf`" } },
              { id: "c", text: { en: "`.final.pdf`", uk: "`.final.pdf`" } },
              { id: "d", text: { en: "`report`", uk: "`report`" } },
            ],
            correct: ["a"],
          },
          {
            id: "missing-file",
            mode: "single",
            prompt: {
              en: "Which exception does `File.ReadAllText` throw when the file does not exist?",
              uk: "Який виняток кидає `File.ReadAllText`, коли файлу не існує?",
            },
            options: [
              { id: "a", text: { en: "`FormatException`", uk: "`FormatException`" } },
              { id: "b", text: { en: "`FileNotFoundException`", uk: "`FileNotFoundException`" } },
              { id: "c", text: { en: "`NullReferenceException`", uk: "`NullReferenceException`" } },
              { id: "d", text: { en: "None: it returns an empty string", uk: "Жодного: він повертає порожній рядок" } },
            ],
            correct: ["b"],
          },
          {
            id: "utf8-bytes",
            mode: "single",
            prompt: {
              en: "How many bytes does `Encoding.UTF8.GetBytes(\"Привіт\")` return?",
              uk: "Скільки байтів повертає `Encoding.UTF8.GetBytes(\"Привіт\")`?",
            },
            options: [
              { id: "a", text: { en: "6", uk: "6" } },
              { id: "b", text: { en: "12", uk: "12" } },
              { id: "c", text: { en: "24", uk: "24" } },
              { id: "d", text: { en: "3", uk: "3" } },
            ],
            correct: ["b"],
          },
          {
            id: "using",
            mode: "single",
            prompt: {
              en: "What does `using (var reader = new StreamReader(path)) { ... }` guarantee?",
              uk: "Що гарантує `using (var reader = new StreamReader(path)) { ... }`?",
            },
            options: [
              { id: "a", text: { en: "The file is closed when the block ends, even if an exception occurs", uk: "Файл закривається, коли блок завершується, навіть якщо виникає виняток" } },
              { id: "b", text: { en: "The file is created if it is missing", uk: "Файл створюється, якщо його немає" } },
              { id: "c", text: { en: "The file is deleted afterwards", uk: "Файл видаляється після цього" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "quiz",
        slug: "collections-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "modify-foreach",
            mode: "single",
            prompt: {
              en: "What happens when you add an element to a `List<T>` inside a `foreach` over that same list?",
              uk: "Що станеться, коли додати елемент до `List<T>` всередині `foreach` по тому самому списку?",
            },
            options: [
              { id: "a", text: { en: "It throws `InvalidOperationException`", uk: "Він кидає `InvalidOperationException`" } },
              { id: "b", text: { en: "The new element is visited too", uk: "Новий елемент теж буде відвідано" } },
              { id: "c", text: { en: "The new element is ignored", uk: "Новий елемент ігнорується" } },
            ],
            correct: ["a"],
          },
          {
            id: "missing-key",
            mode: "single",
            prompt: {
              en: "What happens when you read `d[\"x\"]` and the dictionary has no key `\"x\"`?",
              uk: "Що станеться, коли прочитати `d[\"x\"]`, а ключа `\"x\"` у словнику немає?",
            },
            options: [
              { id: "a", text: { en: "It returns `null`", uk: "Він повертає `null`" } },
              { id: "b", text: { en: "It returns 0", uk: "Він повертає 0" } },
              { id: "c", text: { en: "It throws `KeyNotFoundException`", uk: "Він кидає `KeyNotFoundException`" } },
            ],
            correct: ["c"],
          },
          {
            id: "try-get",
            mode: "single",
            prompt: {
              en: "What does `d.TryGetValue(\"x\", out int v)` do when the key `\"x\"` is missing in a `Dictionary<string, int>`?",
              uk: "Що робить `d.TryGetValue(\"x\", out int v)`, коли ключа `\"x\"` немає в `Dictionary<string, int>`?",
            },
            options: [
              { id: "a", text: { en: "It returns `false`, and `v` is 0", uk: "Він повертає `false`, а `v` дорівнює 0" } },
              { id: "b", text: { en: "It throws an exception", uk: "Він кидає виняток" } },
              { id: "c", text: { en: "It returns `true` and adds the key", uk: "Він повертає `true` і додає ключ" } },
            ],
            correct: ["a"],
          },
          {
            id: "which-structure",
            mode: "single",
            prompt: {
              en: "You often have to find a value by its name among thousands of pairs. Which structure fits best?",
              uk: "Вам часто потрібно знаходити значення за іменем серед тисяч пар. Яка структура підходить найкраще?",
            },
            options: [
              { id: "a", text: { en: "`Dictionary<string, T>`", uk: "`Dictionary<string, T>`" } },
              { id: "b", text: { en: "A `List<T>` that you scan from the start every time", uk: "`List<T>`, який щоразу переглядають із початку" } },
              { id: "c", text: { en: "A `string` that holds all the pairs as text", uk: "`string`, що містить усі пари як текст" } },
            ],
            correct: ["a"],
          },
          {
            id: "concat-loop",
            mode: "single",
            prompt: {
              en: "You build a long text from 100 000 small pieces in a loop. What is the right tool?",
              uk: "Ви складаєте довгий текст зі 100 000 дрібних шматків у циклі. Який інструмент правильний?",
            },
            options: [
              { id: "a", text: { en: "`StringBuilder`", uk: "`StringBuilder`" } },
              { id: "b", text: { en: "`+=` on a `string`", uk: "`+=` для `string`" } },
              { id: "c", text: { en: "`Split`", uk: "`Split`" } },
            ],
            correct: ["a"],
          },
          {
            id: "reverse-string",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nchar[] letters = \"abc\".ToCharArray();\nArray.Reverse(letters);\nConsole.WriteLine(new string(letters));\n```",
              uk: "Що друкує цей код?\n\n```csharp\nchar[] letters = \"abc\".ToCharArray();\nArray.Reverse(letters);\nConsole.WriteLine(new string(letters));\n```",
            },
            options: [
              { id: "a", text: { en: "`cba`", uk: "`cba`" } },
              { id: "b", text: { en: "`abc`", uk: "`abc`" } },
              { id: "c", text: { en: "`System.Char[]`", uk: "`System.Char[]`" } },
            ],
            correct: ["a"],
          },
          {
            id: "read-all-lines",
            mode: "single",
            prompt: {
              en: "What type does `File.ReadAllLines(path)` return?",
              uk: "Який тип повертає `File.ReadAllLines(path)`?",
            },
            options: [
              { id: "a", text: { en: "`string`", uk: "`string`" } },
              { id: "b", text: { en: "`string[]`", uk: "`string[]`" } },
              { id: "c", text: { en: "`char[]`", uk: "`char[]`" } },
              { id: "d", text: { en: "`Dictionary<int, string>`", uk: "`Dictionary<int, string>`" } },
            ],
            correct: ["b"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "ini-parser",
        title: { en: "Practice: Parser", uk: "Практика «Парсер»" },
        language: "csharp",
        starter: PROGRAM(
          `    // Reads INI-style text line by line and returns the settings.
    // Keys inside a [section] are stored as "section.key".
    static Dictionary<string, string> Parse(string text)
    {
        // Write your code here
        return new Dictionary<string, string>();
    }

    static void Main()
    {
        string text = "# settings\\n" +
                      "name = Assay\\n" +
                      "[server]\\n" +
                      "host = localhost\\n" +
                      "port = 8080\\n" +
                      "\\n" +
                      "[user]\\n" +
                      "name = Ann\\n" +
                      "; a comment\\n" +
                      " lang = uk \\n" +
                      "oops, this line has no equals sign\\n" +
                      "[links]\\n" +
                      "url = http://x.org/?a=b\\n";

        var settings = Parse(text);
        var keys = new List<string>(settings.Keys);
        keys.Sort(StringComparer.Ordinal);
        foreach (string key in keys)
        {
            Console.WriteLine(key + " = " + settings[key]);
        }
    }`,
          "using System.Collections.Generic;\nusing System.IO;",
        ),
        solution: PROGRAM(
          `    // Reads INI-style text line by line and returns the settings.
    // Keys inside a [section] are stored as "section.key".
    static Dictionary<string, string> Parse(string text)
    {
        var settings = new Dictionary<string, string>();
        string section = "";
        var reader = new StringReader(text);
        string line;
        while ((line = reader.ReadLine()) != null)
        {
            line = line.Trim();
            if (line.Length == 0 || line.StartsWith("#") || line.StartsWith(";"))
            {
                continue;
            }
            if (line.StartsWith("[") && line.EndsWith("]"))
            {
                section = line.Substring(1, line.Length - 2).Trim();
                continue;
            }
            int equals = line.IndexOf('=');
            if (equals < 0)
            {
                continue;
            }
            string key = line.Substring(0, equals).Trim();
            string value = line.Substring(equals + 1).Trim();
            if (section.Length > 0)
            {
                key = section + "." + key;
            }
            settings[key] = value;
        }
        return settings;
    }

    static void Main()
    {
        string text = "# settings\\n" +
                      "name = Assay\\n" +
                      "[server]\\n" +
                      "host = localhost\\n" +
                      "port = 8080\\n" +
                      "\\n" +
                      "[user]\\n" +
                      "name = Ann\\n" +
                      "; a comment\\n" +
                      " lang = uk \\n" +
                      "oops, this line has no equals sign\\n" +
                      "[links]\\n" +
                      "url = http://x.org/?a=b\\n";

        var settings = Parse(text);
        var keys = new List<string>(settings.Keys);
        keys.Sort(StringComparer.Ordinal);
        foreach (string key in keys)
        {
            Console.WriteLine(key + " = " + settings[key]);
        }
    }`,
          "using System.Collections.Generic;\nusing System.IO;",
        ),
        expectedOutput:
          "links.url = http://x.org/?a=b\nname = Assay\nserver.host = localhost\nserver.port = 8080\nuser.lang = uk\nuser.name = Ann\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "testing",
    title: { en: "Testing", uk: "Тестування" },
    slides: [
      { kind: "lecture", slug: "why-test", title: { en: "Checking your code with tests", uk: "Перевірка коду тестами" } },
      {
        kind: "quiz",
        slug: "testing-quiz",
        title: { en: "Testing", uk: "Тестування" },
        questions: [
          {
            id: "what-is-test",
            mode: "single",
            prompt: { en: "What is a test?", uk: "Що таке тест?" },
            options: [
              {
                id: "a",
                text: {
                  en: "Code that runs your code with a known input and checks the result",
                  uk: "Код, що запускає ваш код зі відомими вхідними даними й перевіряє результат",
                },
              },
              { id: "b", text: { en: "A comment that explains what the code does", uk: "Коментар, що пояснює, що робить код" } },
              { id: "c", text: { en: "A compiler warning", uk: "Попередження компілятора" } },
            ],
            correct: ["a"],
          },
          {
            id: "red-green",
            mode: "single",
            prompt: {
              en: "You have found a bug. What is the best first step in the \"red, then green\" approach?",
              uk: "Ви знайшли помилку. Який найкращий перший крок у підході «спершу червоний, потім зелений»?",
            },
            options: [
              { id: "a", text: { en: "Fix the code right away", uk: "Одразу виправити код" } },
              { id: "b", text: { en: "Write a test that reproduces the bug and fails", uk: "Написати тест, що відтворює помилку й падає" } },
              { id: "c", text: { en: "Delete the code that looks wrong", uk: "Видалити код, який виглядає хибним" } },
            ],
            correct: ["b"],
          },
        ],
      },
      { kind: "lecture", slug: "test-libraries", title: { en: "Test libraries", uk: "Бібліотеки для тестування" } },
      { kind: "lecture", slug: "unit-tests", title: { en: "Unit tests", uk: "Модульні тести" } },
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
      {
        kind: "practice",
        slug: "slugify",
        title: { en: "Make the tests green: slugs", uk: "Зробіть тести зеленими: слаги" },
        language: "csharp",
        starter: PROGRAM(`    static void Check(string name, string actual, string expected)
    {
        if (actual == expected)
        {
            Console.WriteLine("ok: " + name);
        }
        else
        {
            Console.WriteLine("FAIL: " + name + " (expected \\"" + expected + "\\", got \\"" + actual + "\\")");
        }
    }

    // Lower case; every run of characters that are not letters or digits becomes
    // a single '-'; no '-' at the start or at the end.
    static string Slugify(string title)
    {
        // Write your code here
        return title;
    }

    static void Main()
    {
        Check("simple", Slugify("Hello World"), "hello-world");
        Check("punctuation", Slugify("Hello, World!"), "hello-world");
        Check("many spaces", Slugify("  a   b  "), "a-b");
        Check("digits", Slugify("C# 7.0 rocks"), "c-7-0-rocks");
        Check("empty", Slugify(""), "");
        Check("only symbols", Slugify("!!!"), "");
        Check("already a slug", Slugify("already-a-slug"), "already-a-slug");
    }`),
        solution: PROGRAM(`    static void Check(string name, string actual, string expected)
    {
        if (actual == expected)
        {
            Console.WriteLine("ok: " + name);
        }
        else
        {
            Console.WriteLine("FAIL: " + name + " (expected \\"" + expected + "\\", got \\"" + actual + "\\")");
        }
    }

    // Lower case; every run of characters that are not letters or digits becomes
    // a single '-'; no '-' at the start or at the end.
    static string Slugify(string title)
    {
        string result = "";
        bool separatorWaiting = false;
        foreach (char c in title)
        {
            if (char.IsLetterOrDigit(c))
            {
                if (separatorWaiting && result.Length > 0)
                {
                    result += "-";
                }
                separatorWaiting = false;
                result += char.ToLower(c);
            }
            else
            {
                separatorWaiting = true;
            }
        }
        return result;
    }

    static void Main()
    {
        Check("simple", Slugify("Hello World"), "hello-world");
        Check("punctuation", Slugify("Hello, World!"), "hello-world");
        Check("many spaces", Slugify("  a   b  "), "a-b");
        Check("digits", Slugify("C# 7.0 rocks"), "c-7-0-rocks");
        Check("empty", Slugify(""), "");
        Check("only symbols", Slugify("!!!"), "");
        Check("already a slug", Slugify("already-a-slug"), "already-a-slug");
    }`),
        expectedOutput:
          "ok: simple\nok: punctuation\nok: many spaces\nok: digits\nok: empty\nok: only symbols\nok: already a slug\n",
      },
      { kind: "lecture", slug: "more-tests", title: { en: "More tests!", uk: "Більше тестів!" } },
      {
        kind: "quiz",
        slug: "unit-tests-quiz",
        title: { en: "Unit tests", uk: "Модульні тести" },
        questions: [
          {
            id: "act",
            mode: "single",
            prompt: {
              en: "In the \"Arrange, Act, Assert\" structure, which step calls the method under test?",
              uk: "У структурі «Arrange, Act, Assert» який крок викликає метод, що тестується?",
            },
            options: [
              { id: "a", text: { en: "Arrange", uk: "Arrange" } },
              { id: "b", text: { en: "Act", uk: "Act" } },
              { id: "c", text: { en: "Assert", uk: "Assert" } },
            ],
            correct: ["b"],
          },
          {
            id: "expected-first",
            mode: "single",
            prompt: {
              en: "In `Assert.Equal(5, result)` of xUnit, which argument is the expected value?",
              uk: "В `Assert.Equal(5, result)` з xUnit який аргумент є очікуваним значенням?",
            },
            options: [
              { id: "a", text: { en: "The first one, `5`", uk: "Перший, `5`" } },
              { id: "b", text: { en: "The second one, `result`", uk: "Другий, `result`" } },
              { id: "c", text: { en: "Neither: both are equal", uk: "Жоден: обидва рівні" } },
            ],
            correct: ["a"],
          },
          {
            id: "not-first",
            mode: "single",
            prompt: {
              en: "Which of these is NOT a property of a good unit test?",
              uk: "Що з наведеного НЕ є властивістю доброго модульного тесту?",
            },
            options: [
              { id: "a", text: { en: "It is fast", uk: "Він швидкий" } },
              { id: "b", text: { en: "It does not depend on other tests", uk: "Він не залежить від інших тестів" } },
              { id: "c", text: { en: "It only passes when another test has run before it", uk: "Він проходить, лише якщо перед ним виконався інший тест" } },
              { id: "d", text: { en: "It gives the same result every time", uk: "Він дає однаковий результат щоразу" } },
            ],
            correct: ["c"],
          },
          {
            id: "datetime-now",
            mode: "single",
            prompt: {
              en: "Why is a method that reads `DateTime.Now` inside hard to test?",
              uk: "Чому метод, що всередині читає `DateTime.Now`, важко тестувати?",
            },
            options: [
              { id: "a", text: { en: "The result changes with the time, so the test is not repeatable", uk: "Результат змінюється з часом, тож тест не відтворюваний" } },
              { id: "b", text: { en: "`DateTime` cannot be used in tests", uk: "`DateTime` не можна використовувати в тестах" } },
              { id: "c", text: { en: "It is too slow", uk: "Він занадто повільний" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "median",
        title: { en: "Fix the failing tests: median", uk: "Виправте тести, що падають: медіана" },
        language: "csharp",
        starter: PROGRAM(`    static void Check(string name, double actual, double expected)
    {
        Console.WriteLine((Math.Abs(actual - expected) < 1e-9 ? "ok" : "FAIL") + ": " + name);
    }

    static string Text(int[] numbers)
    {
        string text = "";
        for (int i = 0; i < numbers.Length; i++)
        {
            if (i > 0) text += ",";
            text += numbers[i];
        }
        return text;
    }

    // The middle value of the sorted numbers; for an even count, the average of the two
    // middle ones; 0 for an empty array. The array that is passed in must not be changed.
    static double Median(int[] numbers)
    {
        Array.Sort(numbers);
        return numbers[numbers.Length / 2];
    }

    static void Main()
    {
        Check("odd length", Median(new[] { 3, 1, 2 }), 2);
        Check("even length", Median(new[] { 4, 1, 3, 2 }), 2.5);
        Check("one element", Median(new[] { 7 }), 7);
        Check("negative numbers", Median(new[] { -5, -1, -3 }), -3);
        Check("duplicates", Median(new[] { 5, 5, 1, 1 }), 3);

        int[] original = { 3, 1, 2 };
        Median(original);
        Console.WriteLine((Text(original) == "3,1,2" ? "ok" : "FAIL") + ": input unchanged");

        Check("empty array", Median(new int[0]), 0);
    }`),
        solution: PROGRAM(`    static void Check(string name, double actual, double expected)
    {
        Console.WriteLine((Math.Abs(actual - expected) < 1e-9 ? "ok" : "FAIL") + ": " + name);
    }

    static string Text(int[] numbers)
    {
        string text = "";
        for (int i = 0; i < numbers.Length; i++)
        {
            if (i > 0) text += ",";
            text += numbers[i];
        }
        return text;
    }

    // The middle value of the sorted numbers; for an even count, the average of the two
    // middle ones; 0 for an empty array. The array that is passed in must not be changed.
    static double Median(int[] numbers)
    {
        if (numbers.Length == 0)
        {
            return 0;
        }
        int[] sorted = (int[])numbers.Clone();
        Array.Sort(sorted);
        int middle = sorted.Length / 2;
        if (sorted.Length % 2 == 1)
        {
            return sorted[middle];
        }
        return (sorted[middle - 1] + sorted[middle]) / 2.0;
    }

    static void Main()
    {
        Check("odd length", Median(new[] { 3, 1, 2 }), 2);
        Check("even length", Median(new[] { 4, 1, 3, 2 }), 2.5);
        Check("one element", Median(new[] { 7 }), 7);
        Check("negative numbers", Median(new[] { -5, -1, -3 }), -3);
        Check("duplicates", Median(new[] { 5, 5, 1, 1 }), 3);

        int[] original = { 3, 1, 2 };
        Median(original);
        Console.WriteLine((Text(original) == "3,1,2" ? "ok" : "FAIL") + ": input unchanged");

        Check("empty array", Median(new int[0]), 0);
    }`),
        expectedOutput:
          "ok: odd length\nok: even length\nok: one element\nok: negative numbers\nok: duplicates\nok: input unchanged\nok: empty array\n",
      },
      { kind: "lecture", slug: "test-coverage", title: { en: "Test coverage", uk: "Покриття тестами" } },
      { kind: "lecture", slug: "functional-testing", title: { en: "Functional testing", uk: "Функціональне тестування" } },
      { kind: "lecture", slug: "value-of-testing", title: { en: "The value of testing", uk: "Значення тестування" } },
      { kind: "lecture", slug: "introducing-tests", title: { en: "Introducing tests", uk: "Впровадження тестів" } },
      { kind: "lecture", slug: "running-tests", title: { en: "Tutorial: running tests", uk: "Туторіал із запуску тестів" } },
      {
        kind: "quiz",
        slug: "unit-tests-2-quiz",
        title: { en: "Unit tests 2", uk: "Модульні тести 2" },
        questions: [
          {
            id: "boundary",
            mode: "single",
            prompt: {
              en: "Which pair of inputs checks the border of the condition `age >= 18` best?",
              uk: "Яка пара вхідних даних найкраще перевіряє межу умови `age >= 18`?",
            },
            options: [
              { id: "a", text: { en: "`5` and `50`", uk: "`5` та `50`" } },
              { id: "b", text: { en: "`17` and `18`", uk: "`17` та `18`" } },
              { id: "c", text: { en: "`18` and `19`", uk: "`18` та `19`" } },
              { id: "d", text: { en: "`0` and `100`", uk: "`0` та `100`" } },
            ],
            correct: ["b"],
          },
          {
            id: "coverage-meaning",
            mode: "single",
            prompt: {
              en: "What does 100% line coverage mean?",
              uk: "Що означає 100% покриття рядків?",
            },
            options: [
              { id: "a", text: { en: "Every line of code ran during the tests, which does not mean that the results were checked", uk: "Кожен рядок коду виконався під час тестів, що не означає, що результати перевірено" } },
              { id: "b", text: { en: "The program has no bugs", uk: "У програмі немає помилок" } },
              { id: "c", text: { en: "Every possible input has been tried", uk: "Перепробувано всі можливі вхідні дані" } },
            ],
            correct: ["a"],
          },
          {
            id: "no-assert",
            mode: "single",
            prompt: {
              en: "A test calls `Calculator.Add(2, 3)` and has no assertion. What does a pass prove?",
              uk: "Тест викликає `Calculator.Add(2, 3)` і не має жодної перевірки. Що доводить його успіх?",
            },
            options: [
              { id: "a", text: { en: "That `Add` returns 5", uk: "Що `Add` повертає 5" } },
              { id: "b", text: { en: "Only that the call does not throw an exception", uk: "Лише те, що виклик не кидає виняток" } },
              { id: "c", text: { en: "That `Add` is correct for all inputs", uk: "Що `Add` правильний для всіх вхідних даних" } },
            ],
            correct: ["b"],
          },
          {
            id: "mutant",
            mode: "single",
            prompt: {
              en: "In mutation testing, a mutant survived: all the tests still passed after the code was changed. What does it mean?",
              uk: "У мутаційному тестуванні мутант вижив: усі тести й далі проходили після зміни коду. Що це означає?",
            },
            options: [
              { id: "a", text: { en: "The tests do not notice this kind of change", uk: "Тести не помічають такої зміни" } },
              { id: "b", text: { en: "The code is perfect", uk: "Код ідеальний" } },
              { id: "c", text: { en: "The tests are too slow", uk: "Тести занадто повільні" } },
            ],
            correct: ["a"],
          },
          {
            id: "pyramid",
            mode: "single",
            prompt: {
              en: "According to the test pyramid, which kind of test should be the most numerous?",
              uk: "За пірамідою тестування, яких тестів має бути найбільше?",
            },
            options: [
              { id: "a", text: { en: "End-to-end tests", uk: "Наскрізних тестів" } },
              { id: "b", text: { en: "Integration tests", uk: "Інтеграційних тестів" } },
              { id: "c", text: { en: "Unit tests", uk: "Модульних тестів" } },
            ],
            correct: ["c"],
          },
          {
            id: "flaky",
            mode: "multi",
            prompt: {
              en: "Which of these can make a test flaky (sometimes passing and sometimes failing with the same code)?",
              uk: "Що з наведеного може зробити тест нестабільним (то проходить, то падає з тим самим кодом)?",
            },
            options: [
              { id: "a", text: { en: "Random numbers without a fixed seed", uk: "Випадкові числа без фіксованого зерна" } },
              { id: "b", text: { en: "A call to a real web service", uk: "Виклик справжнього вебсервісу" } },
              { id: "c", text: { en: "A dependence on the current time", uk: "Залежність від поточного часу" } },
              { id: "d", text: { en: "A fixed input and an exact expected value", uk: "Фіксовані вхідні дані та точне очікуване значення" } },
            ],
            correct: ["a", "b", "c"],
          },
        ],
      },
      {
        kind: "quiz",
        slug: "testing-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "characterization",
            mode: "single",
            prompt: {
              en: "What is the purpose of a characterization test for old code?",
              uk: "Яка мета характеризаційного тесту для старого коду?",
            },
            options: [
              { id: "a", text: { en: "To record what the code does now, so that you can refactor safely", uk: "Зафіксувати, що код робить зараз, щоб безпечно рефакторити" } },
              { id: "b", text: { en: "To prove that the code is correct", uk: "Довести, що код правильний" } },
              { id: "c", text: { en: "To measure how fast the code is", uk: "Виміряти, наскільки код швидкий" } },
            ],
            correct: ["a"],
          },
          {
            id: "black-box",
            mode: "single",
            prompt: {
              en: "A tester checks the program only through its inputs and outputs, without reading the code. What is this called?",
              uk: "Тестувальник перевіряє програму лише через її входи та виходи, не читаючи код. Як це називається?",
            },
            options: [
              { id: "a", text: { en: "White-box testing", uk: "Тестування білої скриньки" } },
              { id: "b", text: { en: "Black-box testing", uk: "Тестування чорної скриньки" } },
              { id: "c", text: { en: "Mutation testing", uk: "Мутаційне тестування" } },
            ],
            correct: ["b"],
          },
          {
            id: "regression",
            mode: "single",
            prompt: { en: "What does a regression test check?", uk: "Що перевіряє регресійний тест?" },
            options: [
              { id: "a", text: { en: "That something that used to work still works after a change", uk: "Що те, що працювало, працює й після зміни" } },
              { id: "b", text: { en: "That the program starts at all", uk: "Що програма взагалі запускається" } },
              { id: "c", text: { en: "How many users the program can serve", uk: "Скільком користувачам може слугувати програма" } },
            ],
            correct: ["a"],
          },
          {
            id: "smoke",
            mode: "single",
            prompt: { en: "What is a smoke test?", uk: "Що таке димовий тест?" },
            options: [
              { id: "a", text: { en: "A minimal check that the program starts and the main path works", uk: "Мінімальна перевірка, що програма запускається й основний шлях працює" } },
              { id: "b", text: { en: "A test of how the program behaves under heavy load", uk: "Тест того, як програма поводиться під великим навантаженням" } },
              { id: "c", text: { en: "A test that checks every line of code", uk: "Тест, що перевіряє кожен рядок коду" } },
            ],
            correct: ["a"],
          },
          {
            id: "tdd-order",
            mode: "single",
            prompt: { en: "What is the order of the TDD cycle?", uk: "Який порядок у циклі TDD?" },
            options: [
              { id: "a", text: { en: "Green, red, refactor", uk: "Зелений, червоний, рефакторинг" } },
              { id: "b", text: { en: "Red, green, refactor", uk: "Червоний, зелений, рефакторинг" } },
              { id: "c", text: { en: "Refactor, red, green", uk: "Рефакторинг, червоний, зелений" } },
            ],
            correct: ["b"],
          },
          {
            id: "test-names",
            mode: "single",
            prompt: {
              en: "Why do names such as `IsLeapYear_Year1900_ReturnsFalse` help?",
              uk: "Чим допомагають назви на кшталт `IsLeapYear_Year1900_ReturnsFalse`?",
            },
            options: [
              { id: "a", text: { en: "A failing test tells what broke before anyone opens the code", uk: "Тест, що падає, повідомляє, що зламалося, ще до того, як хтось відкриє код" } },
              { id: "b", text: { en: "The framework requires long names", uk: "Фреймворк вимагає довгих назв" } },
              { id: "c", text: { en: "They make the tests run faster", uk: "Вони прискорюють виконання тестів" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "quoted-fields",
        title: { en: "Practice: Quoted fields", uk: "Практика «Поля в лапках»" },
        language: "csharp",
        starter: PROGRAM(
          `    // Splits a CSV line into fields. A field that starts with a quote may contain commas,
    // and "" inside it means one quote. The quotes around a field are not part of it.
    static List<string> SplitCsv(string line)
    {
        // The simple version below does not understand quotes yet
        return new List<string>(line.Split(','));
    }

    static void Show(string line)
    {
        List<string> fields = SplitCsv(line);
        Console.WriteLine(fields.Count + ": [" + string.Join("|", fields) + "]");
    }

    static void Main()
    {
        Show("a,b,c");
        Show("\\"a,b\\",c");
        Show("\\"say \\"\\"hi\\"\\"\\",x");
        Show(",,");
        Show("");
        Show("\\"\\",a");
        Show(" a , b ");
        Show("\\"x\\"");
    }`,
          "using System.Collections.Generic;\nusing System.Text;",
        ),
        solution: PROGRAM(
          `    // Splits a CSV line into fields. A field that starts with a quote may contain commas,
    // and "" inside it means one quote. The quotes around a field are not part of it.
    static List<string> SplitCsv(string line)
    {
        var fields = new List<string>();
        var field = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        field.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = false;
                    }
                }
                else
                {
                    field.Append(c);
                }
            }
            else if (c == '"' && field.Length == 0)
            {
                inQuotes = true;
            }
            else if (c == ',')
            {
                fields.Add(field.ToString());
                field.Clear();
            }
            else
            {
                field.Append(c);
            }
        }
        fields.Add(field.ToString());
        return fields;
    }

    static void Show(string line)
    {
        List<string> fields = SplitCsv(line);
        Console.WriteLine(fields.Count + ": [" + string.Join("|", fields) + "]");
    }

    static void Main()
    {
        Show("a,b,c");
        Show("\\"a,b\\",c");
        Show("\\"say \\"\\"hi\\"\\"\\",x");
        Show(",,");
        Show("");
        Show("\\"\\",a");
        Show(" a , b ");
        Show("\\"x\\"");
    }`,
          "using System.Collections.Generic;\nusing System.Text;",
        ),
        expectedOutput: '3: [a|b|c]\n2: [a,b|c]\n2: [say "hi"|x]\n3: [||]\n1: []\n2: [|a]\n2: [ a | b ]\n1: [x]\n',
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "clamp-tests",
        title: { en: "Practice: Testing", uk: "Практика «Тестування»" },
        language: "csharp",
        starter: PROGRAM(`    static int ClampCorrect(int value, int min, int max)
    {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    static int NoLowerBound(int value, int min, int max)
    {
        if (value > max) return max;
        return value;
    }

    static int NoUpperBound(int value, int min, int max)
    {
        if (value < min) return min;
        return value;
    }

    static int ExclusiveMax(int value, int min, int max)
    {
        if (value >= max) return max - 1;
        if (value < min) return min;
        return value;
    }

    static int SwappedBounds(int value, int min, int max)
    {
        if (value < min) return max;
        if (value > max) return min;
        return value;
    }

    static int ReturnsMinInside(int value, int min, int max)
    {
        if (value < min) return min;
        if (value > max) return max;
        return min;
    }

    static int WrongLowerValue(int value, int min, int max)
    {
        if (value < min) return min + 1;
        if (value > max) return max;
        return value;
    }

    // Runs YOUR tests on the given implementation of Clamp.
    // Returns true if all of them pass, and false as soon as one fails.
    static bool TestsAccept(Func<int, int, int, int> clamp)
    {
        // Write your tests here. For example:
        // if (clamp(5, 0, 10) != 5) return false;
        return true;
    }

    static void Report(string name, Func<int, int, int, int> implementation)
    {
        Console.WriteLine(name + ": " + (TestsAccept(implementation) ? "accepted" : "rejected"));
    }

    static void Main()
    {
        Report("ClampCorrect", ClampCorrect);
        Report("NoLowerBound", NoLowerBound);
        Report("NoUpperBound", NoUpperBound);
        Report("ExclusiveMax", ExclusiveMax);
        Report("SwappedBounds", SwappedBounds);
        Report("ReturnsMinInside", ReturnsMinInside);
        Report("WrongLowerValue", WrongLowerValue);
    }`),
        solution: PROGRAM(`    static int ClampCorrect(int value, int min, int max)
    {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    static int NoLowerBound(int value, int min, int max)
    {
        if (value > max) return max;
        return value;
    }

    static int NoUpperBound(int value, int min, int max)
    {
        if (value < min) return min;
        return value;
    }

    static int ExclusiveMax(int value, int min, int max)
    {
        if (value >= max) return max - 1;
        if (value < min) return min;
        return value;
    }

    static int SwappedBounds(int value, int min, int max)
    {
        if (value < min) return max;
        if (value > max) return min;
        return value;
    }

    static int ReturnsMinInside(int value, int min, int max)
    {
        if (value < min) return min;
        if (value > max) return max;
        return min;
    }

    static int WrongLowerValue(int value, int min, int max)
    {
        if (value < min) return min + 1;
        if (value > max) return max;
        return value;
    }

    // Runs YOUR tests on the given implementation of Clamp.
    // Returns true if all of them pass, and false as soon as one fails.
    static bool TestsAccept(Func<int, int, int, int> clamp)
    {
        if (clamp(5, 0, 10) != 5) return false;     // inside the range
        if (clamp(-3, 0, 10) != 0) return false;    // below the range
        if (clamp(15, 0, 10) != 10) return false;   // above the range
        if (clamp(0, 0, 10) != 0) return false;     // exactly at min
        if (clamp(10, 0, 10) != 10) return false;   // exactly at max
        return true;
    }

    static void Report(string name, Func<int, int, int, int> implementation)
    {
        Console.WriteLine(name + ": " + (TestsAccept(implementation) ? "accepted" : "rejected"));
    }

    static void Main()
    {
        Report("ClampCorrect", ClampCorrect);
        Report("NoLowerBound", NoLowerBound);
        Report("NoUpperBound", NoUpperBound);
        Report("ExclusiveMax", ExclusiveMax);
        Report("SwappedBounds", SwappedBounds);
        Report("ReturnsMinInside", ReturnsMinInside);
        Report("WrongLowerValue", WrongLowerValue);
    }`),
        expectedOutput:
          "ClampCorrect: accepted\nNoLowerBound: rejected\nNoUpperBound: rejected\nExclusiveMax: rejected\nSwappedBounds: rejected\nReturnsMinInside: rejected\nWrongLowerValue: rejected\n",
        maxScore: 20,
      },
      {
        kind: "practice",
        slug: "field-parser",
        title: { en: "Practice: Field parser", uk: "Практика «Парсер полів»" },
        language: "csharp",
        starter: PROGRAM(
          `    // Parses "name,age,score". Checks, in this order:
    //  1. exactly 3 fields                  -> "error: expected 3 fields"
    //  2. the name is not empty             -> "error: empty name"
    //  3. the age is an int from 0 to 150   -> "error: bad age"
    //  4. the score is a number 0 to 100    -> "error: bad score"
    // Success: "OK: <name> (<age>) <score with one decimal>"
    static string ParseRecord(string line)
    {
        // Write your code here
        return "";
    }

    static void Main()
    {
        Console.WriteLine(ParseRecord("Ann,31,87.5"));
        Console.WriteLine(ParseRecord(" Bo , 25 , 90 "));
        Console.WriteLine(ParseRecord("Cy,40"));
        Console.WriteLine(ParseRecord("Dan,1,2,3"));
        Console.WriteLine(ParseRecord(",20,50"));
        Console.WriteLine(ParseRecord("Eve,abc,50"));
        Console.WriteLine(ParseRecord("Fay,-1,50"));
        Console.WriteLine(ParseRecord("Gus,151,50"));
        Console.WriteLine(ParseRecord("Hal,30,100.5"));
        Console.WriteLine(ParseRecord("Ian,30,x"));
        Console.WriteLine(ParseRecord("Jo,0,0"));
        Console.WriteLine(ParseRecord("Kim,150,100"));
        Console.WriteLine(ParseRecord("  ,30,50"));
    }`,
          "using System.Globalization;",
        ),
        solution: PROGRAM(
          `    // Parses "name,age,score". Checks, in this order:
    //  1. exactly 3 fields                  -> "error: expected 3 fields"
    //  2. the name is not empty             -> "error: empty name"
    //  3. the age is an int from 0 to 150   -> "error: bad age"
    //  4. the score is a number 0 to 100    -> "error: bad score"
    // Success: "OK: <name> (<age>) <score with one decimal>"
    static string ParseRecord(string line)
    {
        string[] fields = line.Split(',');
        if (fields.Length != 3)
        {
            return "error: expected 3 fields";
        }

        string name = fields[0].Trim();
        if (name.Length == 0)
        {
            return "error: empty name";
        }

        int age;
        if (!int.TryParse(fields[1].Trim(), out age) || age < 0 || age > 150)
        {
            return "error: bad age";
        }

        double score;
        bool parsed = double.TryParse(fields[2].Trim(), NumberStyles.Float, CultureInfo.InvariantCulture, out score);
        if (!parsed || !(score >= 0 && score <= 100))
        {
            return "error: bad score";
        }

        return "OK: " + name + " (" + age + ") " + score.ToString("F1", CultureInfo.InvariantCulture);
    }

    static void Main()
    {
        Console.WriteLine(ParseRecord("Ann,31,87.5"));
        Console.WriteLine(ParseRecord(" Bo , 25 , 90 "));
        Console.WriteLine(ParseRecord("Cy,40"));
        Console.WriteLine(ParseRecord("Dan,1,2,3"));
        Console.WriteLine(ParseRecord(",20,50"));
        Console.WriteLine(ParseRecord("Eve,abc,50"));
        Console.WriteLine(ParseRecord("Fay,-1,50"));
        Console.WriteLine(ParseRecord("Gus,151,50"));
        Console.WriteLine(ParseRecord("Hal,30,100.5"));
        Console.WriteLine(ParseRecord("Ian,30,x"));
        Console.WriteLine(ParseRecord("Jo,0,0"));
        Console.WriteLine(ParseRecord("Kim,150,100"));
        Console.WriteLine(ParseRecord("  ,30,50"));
    }`,
          "using System.Globalization;",
        ),
        expectedOutput:
          "OK: Ann (31) 87.5\nOK: Bo (25) 90.0\nerror: expected 3 fields\nerror: expected 3 fields\nerror: empty name\nerror: bad age\nerror: bad age\nerror: bad age\nerror: bad score\nerror: bad score\nOK: Jo (0) 0.0\nOK: Kim (150) 100.0\nerror: empty name\n",
        maxScore: 20,
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
