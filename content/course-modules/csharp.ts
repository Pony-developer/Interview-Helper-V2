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
