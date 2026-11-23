import type { ModuleDef } from "./types";

const PROGRAM = (body: string, extraUsings = "") =>
  `using System;\n${extraUsings ? `${extraUsings}\n` : ""}\nclass Program\n{\n${body}\n}\n`;

/**
 * A program whose classes sit at the top level (as in a real project), followed by `Program`.
 * `members` go inside Program before Main (static helper methods); `main` is the body of Main.
 */
const PROGRAM_WITH = (types: string, main: string, extraUsings = "", members = "") =>
  `using System;\n${extraUsings ? `${extraUsings}\n` : ""}\n${types}\n\nclass Program\n{\n${members ? `${members}\n\n` : ""}    static void Main()\n    {\n${main}\n    }\n}\n`;

/**
 * The engine of the "Digger" game that the last practices of the Inheritance module build on.
 * `cells` is the code that the student writes (or its solution); `createExtra` is the extra
 * lines of Field.Create that make the cells of the student's classes.
 */
const DIGGER_ENGINE = (cells: string, createExtra: string) => `abstract class Cell
{
    public abstract char Symbol { get; }
    public virtual bool CanEnter { get { return false; } }
    public virtual int Score { get { return 0; } }
    public virtual bool Kills { get { return false; } }

    // Called once per tick for every cell; a cell may change the field
    public virtual void Update(Field field, int row, int col) { }
}

class Wall : Cell
{
    public override char Symbol { get { return '#'; } }
}

class Empty : Cell
{
    public override char Symbol { get { return '_'; } }
    public override bool CanEnter { get { return true; } }
}

class Gold : Cell
{
    public override char Symbol { get { return '$'; } }
    public override bool CanEnter { get { return true; } }
    public override int Score { get { return 10; } }
}

class Terrain : Cell
{
    public override char Symbol { get { return '.'; } }
    public override bool CanEnter { get { return true; } }
    public override int Score { get { return 1; } }
}

class Digger : Cell
{
    public override char Symbol { get { return 'D'; } }
}

${cells}

class Field
{
    private readonly Cell[,] cells;
    private int diggerRow;
    private int diggerCol;

    public int Score { get; private set; }
    public bool Alive { get; private set; }
    public int Rows { get { return cells.GetLength(0); } }
    public int Cols { get { return cells.GetLength(1); } }

    public Field(string[] rows)
    {
        Alive = true;
        cells = new Cell[rows.Length, rows[0].Length];
        for (int r = 0; r < rows.Length; r++)
        {
            for (int c = 0; c < rows[r].Length; c++)
            {
                cells[r, c] = Create(rows[r][c]);
                if (rows[r][c] == 'D')
                {
                    diggerRow = r;
                    diggerCol = c;
                }
            }
        }
    }

    private static Cell Create(char symbol)
    {
        if (symbol == '#') return new Wall();
        if (symbol == '$') return new Gold();
        if (symbol == '.') return new Terrain();
        if (symbol == 'D') return new Digger();
${createExtra}        return new Empty();
    }

    public Cell Get(int row, int col)
    {
        return cells[row, col];
    }

    public void Set(int row, int col, Cell cell)
    {
        cells[row, col] = cell;
    }

    public void Kill()
    {
        Alive = false;
    }

    // Moves the digger by dRow rows and dCol columns. Returns whether the move happened.
    public bool Move(int dRow, int dCol)
    {
        if (!Alive)
        {
            return false;
        }
        int row = diggerRow + dRow;
        int col = diggerCol + dCol;
        if (row < 0 || row >= Rows || col < 0 || col >= Cols)
        {
            return false;
        }
        Cell target = cells[row, col];
        if (!target.CanEnter)
        {
            return false;
        }
        Score += target.Score;
        if (target.Kills)
        {
            Alive = false;
        }
        cells[row, col] = cells[diggerRow, diggerCol];
        cells[diggerRow, diggerCol] = new Empty();
        diggerRow = row;
        diggerCol = col;
        return true;
    }

    // One tick of the game: every cell gets its Update, from the bottom row up.
    // A cell that was moved by another cell during this tick is not updated twice.
    public void Tick()
    {
        Cell[,] snapshot = (Cell[,])cells.Clone();
        for (int r = Rows - 1; r >= 0; r--)
        {
            for (int c = 0; c < Cols; c++)
            {
                if (!Alive)
                {
                    return;
                }
                if (ReferenceEquals(cells[r, c], snapshot[r, c]))
                {
                    snapshot[r, c].Update(this, r, c);
                }
            }
        }
    }

    public override string ToString()
    {
        string text = "";
        for (int r = 0; r < Rows; r++)
        {
            if (r > 0) text += "\\n";
            for (int c = 0; c < Cols; c++)
            {
                text += cells[r, c].Symbol;
            }
        }
        return text;
    }
}`;

const BAG_CLASS = `class Bag : Cell
{
    private int fallen;

    public override char Symbol { get { return 'S'; } }

    public override void Update(Field field, int row, int col)
    {
        if (row + 1 < field.Rows && field.Get(row + 1, col) is Empty)
        {
            fallen++;
            field.Set(row + 1, col, this);
            field.Set(row, col, new Empty());
        }
        else
        {
            if (fallen >= 2)
            {
                field.Set(row, col, new Gold());
            }
            fallen = 0;
        }
    }
}`;

const EMPTY_MAIN = PROGRAM(`    static void Main()
    {
        // Write your code here
    }`);

/** The C# course: twenty-one modules of lectures, quizzes and coding practices. */
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
      { kind: "lecture", slug: "why-algorithms", title: { en: "Why algorithms matter", uk: "Про важливість алгоритмів" } },
      { kind: "lecture", slug: "big-o", title: { en: "Counting the work: Big O", uk: "Рахуємо роботу: O-нотація" } },
      { kind: "lecture", slug: "basic-concepts", title: { en: "Basic concepts", uk: "Базові поняття" } },
      {
        kind: "quiz",
        slug: "basic-concepts-quiz",
        title: { en: "Basic concepts quiz", uk: "Тест: базові поняття" },
        questions: [
          {
            id: "input-size",
            mode: "single",
            prompt: {
              en: "For an algorithm that finds the maximum of an array, what is the size of the input `n`?",
              uk: "Для алгоритму, що знаходить максимум масиву, чим є розмір вхідних даних `n`?",
            },
            options: [
              { id: "a", text: { en: "The number of elements in the array", uk: "Кількістю елементів у масиві" } },
              { id: "b", text: { en: "The value of the largest element", uk: "Значенням найбільшого елемента" } },
              { id: "c", text: { en: "The number of seconds the program takes", uk: "Кількістю секунд роботи програми" } },
            ],
            correct: ["a"],
          },
          {
            id: "worst-case",
            mode: "single",
            prompt: {
              en: "How many comparisons does a linear search make in the worst case, in an unsorted array of `n` elements?",
              uk: "Скільки порівнянь робить лінійний пошук у найгіршому випадку в невідсортованому масиві з `n` елементів?",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "About `n / 2`", uk: "Близько `n / 2`" } },
              { id: "c", text: { en: "`n`", uk: "`n`" } },
              { id: "d", text: { en: "`n²`", uk: "`n²`" } },
            ],
            correct: ["c"],
          },
          {
            id: "space",
            mode: "single",
            prompt: {
              en: "Which term describes how the extra memory used by an algorithm grows with the input?",
              uk: "Який термін описує, як додаткова пам'ять, що її використовує алгоритм, зростає разом із вхідними даними?",
            },
            options: [
              { id: "a", text: { en: "Time complexity", uk: "Часова складність" } },
              { id: "b", text: { en: "Space complexity", uk: "Просторова складність" } },
              { id: "c", text: { en: "Cyclomatic complexity", uk: "Цикломатична складність" } },
            ],
            correct: ["b"],
          },
          {
            id: "why-count",
            mode: "single",
            prompt: {
              en: "Why do we usually count operations instead of measuring seconds?",
              uk: "Чому ми зазвичай рахуємо операції, а не міряємо секунди?",
            },
            options: [
              { id: "a", text: { en: "Seconds depend on the computer, the language and the load, while the count shows how the work grows", uk: "Секунди залежать від комп'ютера, мови та навантаження, а підрахунок показує, як зростає робота" } },
              { id: "b", text: { en: "Computers cannot measure time", uk: "Комп'ютери не вміють міряти час" } },
              { id: "c", text: { en: "Counting is always more precise than a stopwatch for any purpose", uk: "Підрахунок завжди точніший за секундомір для будь-якої мети" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "calculating-complexity", title: { en: "Calculating complexity", uk: "Розрахунок складності" } },
      { kind: "lecture", slug: "growth-scale", title: { en: "The growth scale of functions", uk: "Масштаб зростання функцій" } },
      {
        kind: "quiz",
        slug: "complexity-speed-quiz",
        title: { en: "Complexity and speed", uk: "Складність і швидкість" },
        questions: [
          {
            id: "faster-computer",
            mode: "single",
            prompt: {
              en: "Your computer becomes 100 times faster. About how much larger an input can an O(n²) algorithm handle in the same time?",
              uk: "Ваш комп'ютер став у 100 разів швидшим. Приблизно у скільки разів більші вхідні дані зможе обробити алгоритм O(n²) за той самий час?",
            },
            options: [
              { id: "a", text: { en: "100 times larger", uk: "У 100 разів більші" } },
              { id: "b", text: { en: "10 times larger", uk: "У 10 разів більші" } },
              { id: "c", text: { en: "2 times larger", uk: "У 2 рази більші" } },
              { id: "d", text: { en: "10 000 times larger", uk: "У 10 000 разів більші" } },
            ],
            correct: ["b"],
          },
          {
            id: "linear-vs-quadratic",
            mode: "single",
            prompt: {
              en: "For n = 1 000 000, roughly how many times more steps does an O(n²) algorithm need than an O(n) algorithm with the same constants?",
              uk: "Для n = 1 000 000 приблизно у скільки разів більше кроків потрібно алгоритму O(n²), ніж алгоритму O(n) з тими самими сталими?",
            },
            options: [
              { id: "a", text: { en: "2 times", uk: "У 2 рази" } },
              { id: "b", text: { en: "1 000 times", uk: "У 1 000 разів" } },
              { id: "c", text: { en: "1 000 000 times", uk: "У 1 000 000 разів" } },
            ],
            correct: ["c"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "count-steps",
        title: { en: "Counting the steps", uk: "Рахуємо кроки" },
        language: "csharp",
        starter: PROGRAM(`    // How many elements the linear search looks at (it stops at the first match)
    static int LinearSteps(int[] sorted, int value)
    {
        // Write your code here
        return -1;
    }

    // How many times the body of the binary search loop runs
    static int BinarySteps(int[] sorted, int value)
    {
        // Write your code here
        return -1;
    }

    // The number of pairs (i, j) with i < j among n elements. Use a formula!
    static long PairCount(int n)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        int[] a = new int[1000];
        for (int i = 0; i < a.Length; i++)
        {
            a[i] = i + 1;
        }

        Console.WriteLine(LinearSteps(a, 1));
        Console.WriteLine(LinearSteps(a, 500));
        Console.WriteLine(LinearSteps(a, 1000));
        Console.WriteLine(LinearSteps(a, 5000));
        Console.WriteLine(BinarySteps(a, 500));
        Console.WriteLine(BinarySteps(a, 1));
        Console.WriteLine(BinarySteps(a, 1000));
        Console.WriteLine(BinarySteps(a, 5000));
        Console.WriteLine(PairCount(10));
        Console.WriteLine(PairCount(1000));
        Console.WriteLine(PairCount(100000));
    }`),
        solution: PROGRAM(`    // How many elements the linear search looks at (it stops at the first match)
    static int LinearSteps(int[] sorted, int value)
    {
        int steps = 0;
        for (int i = 0; i < sorted.Length; i++)
        {
            steps++;
            if (sorted[i] == value)
            {
                return steps;
            }
        }
        return steps;
    }

    // How many times the body of the binary search loop runs
    static int BinarySteps(int[] sorted, int value)
    {
        int steps = 0;
        int left = 0, right = sorted.Length - 1;
        while (left <= right)
        {
            steps++;
            int middle = left + (right - left) / 2;
            if (sorted[middle] == value) return steps;
            if (sorted[middle] < value) left = middle + 1;
            else right = middle - 1;
        }
        return steps;
    }

    // The number of pairs (i, j) with i < j among n elements. Use a formula!
    static long PairCount(int n)
    {
        return (long)n * (n - 1) / 2;
    }

    static void Main()
    {
        int[] a = new int[1000];
        for (int i = 0; i < a.Length; i++)
        {
            a[i] = i + 1;
        }

        Console.WriteLine(LinearSteps(a, 1));
        Console.WriteLine(LinearSteps(a, 500));
        Console.WriteLine(LinearSteps(a, 1000));
        Console.WriteLine(LinearSteps(a, 5000));
        Console.WriteLine(BinarySteps(a, 500));
        Console.WriteLine(BinarySteps(a, 1));
        Console.WriteLine(BinarySteps(a, 1000));
        Console.WriteLine(BinarySteps(a, 5000));
        Console.WriteLine(PairCount(10));
        Console.WriteLine(PairCount(1000));
        Console.WriteLine(PairCount(100000));
    }`),
        expectedOutput: "1\n500\n1000\n1000\n1\n9\n10\n10\n45\n499500\n4999950000\n",
      },
      { kind: "lecture", slug: "big-o-notation", title: { en: "Big-O notation", uk: "O-символіка" } },
      {
        kind: "quiz",
        slug: "big-o-quiz",
        title: { en: "Big-O notation quiz", uk: "Тест: O-символіка" },
        questions: [
          {
            id: "polynomial",
            mode: "single",
            prompt: { en: "What is the Big-O class of `3n² + 5n + 2`?", uk: "Який клас O-символіки в `3n² + 5n + 2`?" },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n²)", uk: "O(n²)" } },
              { id: "c", text: { en: "O(3n²)", uk: "O(3n²)" } },
              { id: "d", text: { en: "O(n³)", uk: "O(n³)" } },
            ],
            correct: ["b"],
          },
          {
            id: "n-log-n",
            mode: "single",
            prompt: { en: "What is the Big-O class of `5n · log n + 100n`?", uk: "Який клас O-символіки в `5n · log n + 100n`?" },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n log n)", uk: "O(n log n)" } },
              { id: "c", text: { en: "O(n² log n)", uk: "O(n² log n)" } },
              { id: "d", text: { en: "O(log n)", uk: "O(log n)" } },
            ],
            correct: ["b"],
          },
          {
            id: "upper-bound",
            mode: "single",
            prompt: {
              en: "An algorithm takes exactly `n` steps. Is the statement \"the algorithm is O(n²)\" true?",
              uk: "Алгоритм виконує рівно `n` кроків. Чи правдиве твердження «алгоритм є O(n²)»?",
            },
            options: [
              { id: "a", text: { en: "Yes: O is an upper bound, so it is true, although not the tightest one", uk: "Так: O — верхня межа, тож це правда, хоча й не найточніша" } },
              { id: "b", text: { en: "No: the algorithm is only O(n)", uk: "Ні: алгоритм є лише O(n)" } },
              { id: "c", text: { en: "Only for n > 100", uk: "Лише для n > 100" } },
            ],
            correct: ["a"],
          },
          {
            id: "log-base",
            mode: "single",
            prompt: {
              en: "How do O(log₂ n) and O(log₁₀ n) compare?",
              uk: "Як співвідносяться O(log₂ n) та O(log₁₀ n)?",
            },
            options: [
              { id: "a", text: { en: "They are the same class: the bases differ only by a constant factor", uk: "Це той самий клас: основи відрізняються лише сталим множником" } },
              { id: "b", text: { en: "O(log₂ n) is much faster", uk: "O(log₂ n) значно швидший" } },
              { id: "c", text: { en: "O(log₁₀ n) is much faster", uk: "O(log₁₀ n) значно швидший" } },
            ],
            correct: ["a"],
          },
          {
            id: "sequential",
            mode: "single",
            prompt: {
              en: "A method has an O(n) loop followed by an O(n²) loop, one after the other. What is its complexity?",
              uk: "Метод має цикл O(n), за яким іде цикл O(n²), один за одним. Яка його складність?",
            },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n²)", uk: "O(n²)" } },
              { id: "c", text: { en: "O(n³)", uk: "O(n³)" } },
              { id: "d", text: { en: "O(n + n²) is the final answer and cannot be simplified", uk: "O(n + n²) — остаточна відповідь, її не можна спростити" } },
            ],
            correct: ["b"],
          },
          {
            id: "two-variables",
            mode: "single",
            prompt: {
              en: "What is the complexity of this code?\n\n```csharp\nfor (int i = 0; i < n; i++)\n    for (int j = 0; j < m; j++)\n        Work();\n```",
              uk: "Яка складність цього коду?\n\n```csharp\nfor (int i = 0; i < n; i++)\n    for (int j = 0; j < m; j++)\n        Work();\n```",
            },
            options: [
              { id: "a", text: { en: "O(n + m)", uk: "O(n + m)" } },
              { id: "b", text: { en: "O(n · m)", uk: "O(n · m)" } },
              { id: "c", text: { en: "O(n²)", uk: "O(n²)" } },
            ],
            correct: ["b"],
          },
          {
            id: "theta",
            mode: "single",
            prompt: {
              en: "Which notation expresses a tight bound: both an upper and a lower one?",
              uk: "Яке позначення виражає точну межу: і верхню, і нижню водночас?",
            },
            options: [
              { id: "a", text: { en: "O", uk: "O" } },
              { id: "b", text: { en: "Ω", uk: "Ω" } },
              { id: "c", text: { en: "Θ", uk: "Θ" } },
            ],
            correct: ["c"],
          },
          {
            id: "order",
            mode: "single",
            prompt: {
              en: "Which list is in increasing order of growth?",
              uk: "Який список розташовано за зростанням швидкості зростання?",
            },
            options: [
              { id: "a", text: { en: "`1, n, log n, n², n log n`", uk: "`1, n, log n, n², n log n`" } },
              { id: "b", text: { en: "`1, log n, n, n log n, n²`", uk: "`1, log n, n, n log n, n²`" } },
              { id: "c", text: { en: "`log n, 1, n, n², n log n`", uk: "`log n, 1, n, n², n log n`" } },
              { id: "d", text: { en: "`n, n², n log n, 1, log n`", uk: "`n, n², n log n, 1, log n`" } },
            ],
            correct: ["b"],
          },
          {
            id: "exponential",
            mode: "single",
            prompt: {
              en: "For large n, which function grows faster: `2ⁿ` or `n¹⁰`?",
              uk: "Для великих n яка функція зростає швидше: `2ⁿ` чи `n¹⁰`?",
            },
            options: [
              { id: "a", text: { en: "`n¹⁰`, because the exponent is larger", uk: "`n¹⁰`, бо показник більший" } },
              { id: "b", text: { en: "`2ⁿ`: any exponential eventually overtakes any polynomial", uk: "`2ⁿ`: будь-яка експонента зрештою обганяє будь-який поліном" } },
              { id: "c", text: { en: "They grow equally fast", uk: "Вони зростають однаково швидко" } },
            ],
            correct: ["b"],
          },
        ],
      },
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
      { kind: "lecture", slug: "estimating-complexity", title: { en: "Estimating complexity", uk: "Оцінка складності" } },
      { kind: "lecture", slug: "numbers-complexity", title: { en: "The complexity of algorithms with numbers", uk: "Складність алгоритмів із числами" } },
      {
        kind: "quiz",
        slug: "estimate-quiz",
        title: { en: "Estimating the complexity of an algorithm", uk: "Оцінка складності алгоритму" },
        questions: [
          {
            id: "doubling",
            mode: "single",
            prompt: {
              en: "What is the complexity of this loop?\n\n```csharp\nfor (int i = 1; i < n; i *= 2)\n    Work();\n```",
              uk: "Яка складність цього циклу?\n\n```csharp\nfor (int i = 1; i < n; i *= 2)\n    Work();\n```",
            },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(log n)", uk: "O(log n)" } },
              { id: "c", text: { en: "O(n²)", uk: "O(n²)" } },
              { id: "d", text: { en: "O(1)", uk: "O(1)" } },
            ],
            correct: ["b"],
          },
          {
            id: "contains-in-loop",
            mode: "single",
            prompt: {
              en: "What is the complexity of this code, if both `a` and `list` have about `n` elements?\n\n```csharp\nforeach (int x in a)\n    if (list.Contains(x)) count++;\n```",
              uk: "Яка складність цього коду, якщо і `a`, і `list` мають близько `n` елементів?\n\n```csharp\nforeach (int x in a)\n    if (list.Contains(x)) count++;\n```",
            },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n log n)", uk: "O(n log n)" } },
              { id: "c", text: { en: "O(n²), because `Contains` is itself a loop", uk: "O(n²), бо `Contains` сам є циклом" } },
            ],
            correct: ["c"],
          },
          {
            id: "string-concat",
            mode: "single",
            prompt: {
              en: "What is the complexity of this code?\n\n```csharp\nstring s = \"\";\nfor (int i = 0; i < n; i++)\n    s += \"x\";\n```",
              uk: "Яка складність цього коду?\n\n```csharp\nstring s = \"\";\nfor (int i = 0; i < n; i++)\n    s += \"x\";\n```",
            },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n²), because each `+=` copies the whole string", uk: "O(n²), бо кожен `+=` копіює весь рядок" } },
              { id: "c", text: { en: "O(log n)", uk: "O(log n)" } },
            ],
            correct: ["b"],
          },
        ],
      },
      { kind: "lecture", slug: "complexity-classes", title: { en: "Complexity classes", uk: "Класи складності" } },
      {
        kind: "quiz",
        slug: "big-o-2-quiz",
        title: { en: "Big-O notation 2", uk: "O-символіка 2" },
        questions: [
          {
            id: "np-complete",
            mode: "single",
            prompt: {
              en: "Which of these problems is NP-complete, which means that no fast algorithm is known for it?",
              uk: "Яка з цих задач NP-повна, тобто для неї не відомий швидкий алгоритм?",
            },
            options: [
              { id: "a", text: { en: "Sorting an array", uk: "Сортування масиву" } },
              { id: "b", text: { en: "Finding the maximum of an array", uk: "Знаходження максимуму масиву" } },
              { id: "c", text: { en: "The travelling salesman problem (the decision version)", uk: "Задача комівояжера (розв'язувана версія)" } },
              { id: "d", text: { en: "Binary search", uk: "Двійковий пошук" } },
            ],
            correct: ["c"],
          },
          {
            id: "trial-division",
            mode: "single",
            prompt: {
              en: "Trial division up to √N takes about √N steps. Why is it still considered slow for numbers with hundreds of digits?",
              uk: "Пробне ділення до √N займає близько √N кроків. Чому воно все одно вважається повільним для чисел із сотнями цифр?",
            },
            options: [
              { id: "a", text: { en: "√N is exponential in the number of digits, which is the real size of the input", uk: "√N експоненційне за кількістю цифр, а це справжній розмір входу" } },
              { id: "b", text: { en: "Because the square root is hard to compute", uk: "Бо квадратний корінь важко обчислити" } },
              { id: "c", text: { en: "Because the loop has a division inside", uk: "Бо всередині циклу є ділення" } },
            ],
            correct: ["a"],
          },
          {
            id: "euclid",
            mode: "single",
            prompt: {
              en: "What is the number of steps of Euclid's algorithm for `Gcd(a, b)`?",
              uk: "Скільки кроків робить алгоритм Евкліда для `Gcd(a, b)`?",
            },
            options: [
              { id: "a", text: { en: "O(min(a, b))", uk: "O(min(a, b))" } },
              { id: "b", text: { en: "O(log min(a, b))", uk: "O(log min(a, b))" } },
              { id: "c", text: { en: "O(1)", uk: "O(1)" } },
            ],
            correct: ["b"],
          },
          {
            id: "power",
            mode: "single",
            prompt: {
              en: "How many multiplications does computing `x^p` by repeated squaring need?",
              uk: "Скільки множень потребує обчислення `x^p` через повторне піднесення до квадрата?",
            },
            options: [
              { id: "a", text: { en: "About `p`", uk: "Близько `p`" } },
              { id: "b", text: { en: "About `log₂ p`", uk: "Близько `log₂ p`" } },
              { id: "c", text: { en: "About `p²`", uk: "Близько `p²`" } },
            ],
            correct: ["b"],
          },
        ],
      },
      {
        kind: "quiz",
        slug: "complexity-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "dictionary",
            mode: "single",
            prompt: {
              en: "What is the average complexity of looking up a key in a `Dictionary`?",
              uk: "Яка середня складність пошуку ключа в `Dictionary`?",
            },
            options: [
              { id: "a", text: { en: "O(1)", uk: "O(1)" } },
              { id: "b", text: { en: "O(log n)", uk: "O(log n)" } },
              { id: "c", text: { en: "O(n)", uk: "O(n)" } },
            ],
            correct: ["a"],
          },
          {
            id: "sort",
            mode: "single",
            prompt: {
              en: "What is the complexity of `Array.Sort` for `n` elements?",
              uk: "Яка складність `Array.Sort` для `n` елементів?",
            },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n log n)", uk: "O(n log n)" } },
              { id: "c", text: { en: "O(n²)", uk: "O(n²)" } },
            ],
            correct: ["b"],
          },
          {
            id: "binary-needs-sorted",
            mode: "single",
            prompt: {
              en: "What must be true of an array for binary search to work?",
              uk: "Що має бути правдою щодо масиву, щоб двійковий пошук працював?",
            },
            options: [
              { id: "a", text: { en: "It must be sorted", uk: "Він має бути відсортований" } },
              { id: "b", text: { en: "It must have an even number of elements", uk: "Він має мати парну кількість елементів" } },
              { id: "c", text: { en: "It must contain only positive numbers", uk: "Він має містити лише додатні числа" } },
            ],
            correct: ["a"],
          },
          {
            id: "small-n",
            mode: "single",
            prompt: {
              en: "When can an O(n²) algorithm be faster in practice than an O(n log n) one?",
              uk: "Коли алгоритм O(n²) на практиці може бути швидшим за O(n log n)?",
            },
            options: [
              { id: "a", text: { en: "Never: a smaller class is always faster", uk: "Ніколи: менший клас завжди швидший" } },
              { id: "b", text: { en: "For small inputs, when its constant factors are much smaller", uk: "Для малих вхідних даних, коли його сталі множники значно менші" } },
              { id: "c", text: { en: "Only on very old computers", uk: "Лише на дуже старих комп'ютерах" } },
            ],
            correct: ["b"],
          },
          {
            id: "tsp-brute",
            mode: "single",
            prompt: {
              en: "A brute-force solution of the travelling salesman problem tries all the orders of the `n` cities. What is its complexity?",
              uk: "Розв'язок задачі комівояжера перебором перевіряє всі порядки `n` міст. Яка його складність?",
            },
            options: [
              { id: "a", text: { en: "O(n²)", uk: "O(n²)" } },
              { id: "b", text: { en: "O(2ⁿ)", uk: "O(2ⁿ)" } },
              { id: "c", text: { en: "O(n!)", uk: "O(n!)" } },
            ],
            correct: ["c"],
          },
          {
            id: "pixels",
            mode: "single",
            prompt: {
              en: "A filter visits each pixel of an image of `w × h` pixels a constant number of times. What is its complexity?",
              uk: "Фільтр відвідує кожен піксель зображення `w × h` пікселів сталу кількість разів. Яка його складність?",
            },
            options: [
              { id: "a", text: { en: "O(w + h)", uk: "O(w + h)" } },
              { id: "b", text: { en: "O(w · h)", uk: "O(w · h)" } },
              { id: "c", text: { en: "O(log(w · h))", uk: "O(log(w · h))" } },
            ],
            correct: ["b"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "grayscale",
        title: { en: "Practice: Shades of gray", uk: "Практика «Відтінки сірого»" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // gray = (299 * R + 587 * G + 114 * B) / 1000, integer division
    static int[,] Grayscale(int[,] red, int[,] green, int[,] blue)
    {
        // Write your code here
        return new int[red.GetLength(0), red.GetLength(1)];
    }

    static void Main()
    {
        int[,] red = { { 255, 0, 0 }, { 255, 0, 100 } };
        int[,] green = { { 0, 255, 0 }, { 255, 0, 150 } };
        int[,] blue = { { 0, 0, 255 }, { 255, 0, 200 } };
        Show(Grayscale(red, green, blue));
    }`),
        solution: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // gray = (299 * R + 587 * G + 114 * B) / 1000, integer division
    static int[,] Grayscale(int[,] red, int[,] green, int[,] blue)
    {
        int rows = red.GetLength(0);
        int cols = red.GetLength(1);
        int[,] gray = new int[rows, cols];
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                gray[r, c] = (299 * red[r, c] + 587 * green[r, c] + 114 * blue[r, c]) / 1000;
            }
        }
        return gray;
    }

    static void Main()
    {
        int[,] red = { { 255, 0, 0 }, { 255, 0, 100 } };
        int[,] green = { { 0, 255, 0 }, { 255, 0, 150 } };
        int[,] blue = { { 0, 0, 255 }, { 255, 0, 200 } };
        Show(Grayscale(red, green, blue));
    }`),
        expectedOutput: "76 149 29\n255 0 140\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "threshold",
        title: { en: "Practice: Threshold filter", uk: "Практика «Пороговий фільтр»" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // A NEW image: 255 where the pixel is at least t, otherwise 0
    static int[,] Threshold(int[,] image, int t)
    {
        // Write your code here
        return image;
    }

    // How many pixels equal 255
    static int CountWhite(int[,] image)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        int[,] image =
        {
            { 10, 200, 30, 250 },
            { 128, 127, 129, 0 },
            { 255, 90, 160, 60 },
        };
        int[,] bw = Threshold(image, 128);
        Show(bw);
        Console.WriteLine(CountWhite(bw));
        Console.WriteLine(image[0, 0] + " " + image[0, 1] + " " + image[0, 2] + " " + image[0, 3]);
    }`),
        solution: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // A NEW image: 255 where the pixel is at least t, otherwise 0
    static int[,] Threshold(int[,] image, int t)
    {
        int rows = image.GetLength(0);
        int cols = image.GetLength(1);
        int[,] result = new int[rows, cols];
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                result[r, c] = image[r, c] >= t ? 255 : 0;
            }
        }
        return result;
    }

    // How many pixels equal 255
    static int CountWhite(int[,] image)
    {
        int count = 0;
        foreach (int pixel in image)
        {
            if (pixel == 255) count++;
        }
        return count;
    }

    static void Main()
    {
        int[,] image =
        {
            { 10, 200, 30, 250 },
            { 128, 127, 129, 0 },
            { 255, 90, 160, 60 },
        };
        int[,] bw = Threshold(image, 128);
        Show(bw);
        Console.WriteLine(CountWhite(bw));
        Console.WriteLine(image[0, 0] + " " + image[0, 1] + " " + image[0, 2] + " " + image[0, 3]);
    }`),
        expectedOutput: "0 255 0 255\n255 0 255 0\n255 0 255 0\n6\n10 200 30 250\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "median-filter",
        title: { en: "Practice: Median filter", uk: "Практика «Медіанний фільтр»" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // A NEW image. Every inner pixel becomes the median of its 3 x 3 neighbourhood
    // (read from the original image). The border pixels are copied unchanged.
    static int[,] MedianFilter(int[,] image)
    {
        // Write your code here
        return (int[,])image.Clone();
    }

    static void Main()
    {
        int[,] noisy =
        {
            { 10, 10, 10, 10, 10 },
            { 10, 255, 10, 10, 10 },
            { 10, 10, 10, 0, 10 },
            { 10, 10, 10, 10, 10 },
            { 10, 10, 10, 10, 10 },
        };
        Show(MedianFilter(noisy));
        Console.WriteLine("---");

        int[,] edge =
        {
            { 0, 0, 100, 100, 100 },
            { 0, 0, 100, 100, 100 },
            { 0, 255, 100, 100, 100 },
            { 0, 0, 100, 100, 100 },
            { 0, 0, 100, 100, 100 },
        };
        Show(MedianFilter(edge));
    }`),
        solution: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // A NEW image. Every inner pixel becomes the median of its 3 x 3 neighbourhood
    // (read from the original image). The border pixels are copied unchanged.
    static int[,] MedianFilter(int[,] image)
    {
        int rows = image.GetLength(0);
        int cols = image.GetLength(1);
        int[,] result = (int[,])image.Clone();
        for (int r = 1; r < rows - 1; r++)
        {
            for (int c = 1; c < cols - 1; c++)
            {
                int[] window = new int[9];
                int k = 0;
                for (int dr = -1; dr <= 1; dr++)
                {
                    for (int dc = -1; dc <= 1; dc++)
                    {
                        window[k++] = image[r + dr, c + dc];
                    }
                }
                Array.Sort(window);
                result[r, c] = window[4];
            }
        }
        return result;
    }

    static void Main()
    {
        int[,] noisy =
        {
            { 10, 10, 10, 10, 10 },
            { 10, 255, 10, 10, 10 },
            { 10, 10, 10, 0, 10 },
            { 10, 10, 10, 10, 10 },
            { 10, 10, 10, 10, 10 },
        };
        Show(MedianFilter(noisy));
        Console.WriteLine("---");

        int[,] edge =
        {
            { 0, 0, 100, 100, 100 },
            { 0, 0, 100, 100, 100 },
            { 0, 255, 100, 100, 100 },
            { 0, 0, 100, 100, 100 },
            { 0, 0, 100, 100, 100 },
        };
        Show(MedianFilter(edge));
    }`),
        expectedOutput:
          "10 10 10 10 10\n10 10 10 10 10\n10 10 10 10 10\n10 10 10 10 10\n10 10 10 10 10\n---\n0 0 100 100 100\n0 0 100 100 100\n0 0 100 100 100\n0 0 100 100 100\n0 0 100 100 100\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "sobel",
        title: { en: "Practice: Sobel filter", uk: "Практика «Фільтр Собеля»" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // A NEW image of edge strengths. For an inner pixel with the neighbourhood
    //   a b c
    //   d p e
    //   f g h
    // gx = (c + 2e + h) - (a + 2d + f), gy = (f + 2g + h) - (a + 2b + c),
    // strength = min(255, |gx| + |gy|). The border pixels are 0.
    static int[,] Sobel(int[,] image)
    {
        // Write your code here
        return new int[image.GetLength(0), image.GetLength(1)];
    }

    static void Main()
    {
        int[,] vertical =
        {
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
        };
        Show(Sobel(vertical));
        Console.WriteLine("---");

        int[,] horizontal =
        {
            { 0, 0, 0, 0, 0 },
            { 0, 0, 0, 0, 0 },
            { 100, 100, 100, 100, 100 },
            { 100, 100, 100, 100, 100 },
            { 100, 100, 100, 100, 100 },
        };
        Show(Sobel(horizontal));
    }`),
        solution: PROGRAM(`    static void Show(int[,] image)
    {
        for (int r = 0; r < image.GetLength(0); r++)
        {
            for (int c = 0; c < image.GetLength(1); c++)
            {
                if (c > 0) Console.Write(" ");
                Console.Write(image[r, c]);
            }
            Console.WriteLine();
        }
    }

    // A NEW image of edge strengths. For an inner pixel with the neighbourhood
    //   a b c
    //   d p e
    //   f g h
    // gx = (c + 2e + h) - (a + 2d + f), gy = (f + 2g + h) - (a + 2b + c),
    // strength = min(255, |gx| + |gy|). The border pixels are 0.
    static int[,] Sobel(int[,] image)
    {
        int rows = image.GetLength(0);
        int cols = image.GetLength(1);
        int[,] result = new int[rows, cols];
        for (int r = 1; r < rows - 1; r++)
        {
            for (int col = 1; col < cols - 1; col++)
            {
                int a = image[r - 1, col - 1], b = image[r - 1, col], c = image[r - 1, col + 1];
                int d = image[r, col - 1], e = image[r, col + 1];
                int f = image[r + 1, col - 1], g = image[r + 1, col], h = image[r + 1, col + 1];

                int gx = (c + 2 * e + h) - (a + 2 * d + f);
                int gy = (f + 2 * g + h) - (a + 2 * b + c);
                result[r, col] = Math.Min(255, Math.Abs(gx) + Math.Abs(gy));
            }
        }
        return result;
    }

    static void Main()
    {
        int[,] vertical =
        {
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
            { 0, 0, 10, 10, 10 },
        };
        Show(Sobel(vertical));
        Console.WriteLine("---");

        int[,] horizontal =
        {
            { 0, 0, 0, 0, 0 },
            { 0, 0, 0, 0, 0 },
            { 100, 100, 100, 100, 100 },
            { 100, 100, 100, 100, 100 },
            { 100, 100, 100, 100, 100 },
        };
        Show(Sobel(horizontal));
    }`),
        expectedOutput:
          "0 0 0 0 0\n0 40 40 0 0\n0 40 40 0 0\n0 40 40 0 0\n0 0 0 0 0\n---\n0 0 0 0 0\n0 255 255 255 0\n0 255 255 255 0\n0 0 0 0 0\n0 0 0 0 0\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "recursion",
    title: { en: "Recursive algorithms", uk: "Рекурсивні алгоритми" },
    slides: [
      { kind: "lecture", slug: "recursion", title: { en: "Recursion", uk: "Рекурсія" } },
      {
        kind: "practice",
        slug: "fix-recursion",
        title: { en: "Fix the recursion", uk: "Виправте рекурсію" },
        language: "csharp",
        starter: PROGRAM(`    static void Check(string name, long actual, long expected)
    {
        Console.WriteLine((actual == expected ? "ok" : "FAIL") + ": " + name);
    }

    // n! (0! = 1)
    static long Factorial(int n)
    {
        if (n == 0) return 0;
        return n * Factorial(n - 1);
    }

    // 1 + 2 + ... + n (the sum for 0 is 0)
    static int SumTo(int n)
    {
        if (n == 0) return 1;
        return n + SumTo(n - 1);
    }

    // x to the power p (anything to the power 0 is 1)
    static long Power(long x, int p)
    {
        if (p == 0) return 1;
        return x + Power(x, p - 1);
    }

    // The number of digits of a non-negative number (0 has one digit)
    static int CountDigits(int n)
    {
        if (n < 10) return 0;
        return 1 + CountDigits(n / 10);
    }

    static void Main()
    {
        Check("Factorial(5)", Factorial(5), 120);
        Check("Factorial(0)", Factorial(0), 1);
        Check("SumTo(10)", SumTo(10), 55);
        Check("SumTo(0)", SumTo(0), 0);
        Check("Power(2, 10)", Power(2, 10), 1024);
        Check("Power(5, 0)", Power(5, 0), 1);
        Check("Power(3, 3)", Power(3, 3), 27);
        Check("CountDigits(12345)", CountDigits(12345), 5);
        Check("CountDigits(7)", CountDigits(7), 1);
        Check("CountDigits(0)", CountDigits(0), 1);
    }`),
        solution: PROGRAM(`    static void Check(string name, long actual, long expected)
    {
        Console.WriteLine((actual == expected ? "ok" : "FAIL") + ": " + name);
    }

    // n! (0! = 1)
    static long Factorial(int n)
    {
        if (n == 0) return 1;
        return n * Factorial(n - 1);
    }

    // 1 + 2 + ... + n (the sum for 0 is 0)
    static int SumTo(int n)
    {
        if (n == 0) return 0;
        return n + SumTo(n - 1);
    }

    // x to the power p (anything to the power 0 is 1)
    static long Power(long x, int p)
    {
        if (p == 0) return 1;
        return x * Power(x, p - 1);
    }

    // The number of digits of a non-negative number (0 has one digit)
    static int CountDigits(int n)
    {
        if (n < 10) return 1;
        return 1 + CountDigits(n / 10);
    }

    static void Main()
    {
        Check("Factorial(5)", Factorial(5), 120);
        Check("Factorial(0)", Factorial(0), 1);
        Check("SumTo(10)", SumTo(10), 55);
        Check("SumTo(0)", SumTo(0), 0);
        Check("Power(2, 10)", Power(2, 10), 1024);
        Check("Power(5, 0)", Power(5, 0), 1);
        Check("Power(3, 3)", Power(3, 3), 27);
        Check("CountDigits(12345)", CountDigits(12345), 5);
        Check("CountDigits(7)", CountDigits(7), 1);
        Check("CountDigits(0)", CountDigits(0), 1);
    }`),
        expectedOutput:
          "ok: Factorial(5)\nok: Factorial(0)\nok: SumTo(10)\nok: SumTo(0)\nok: Power(2, 10)\nok: Power(5, 0)\nok: Power(3, 3)\nok: CountDigits(12345)\nok: CountDigits(7)\nok: CountDigits(0)\n",
      },
      { kind: "lecture", slug: "recursion-tree", title: { en: "The recursion tree", uk: "Дерево рекурсії" } },
      { kind: "lecture", slug: "more-recursion", title: { en: "More examples", uk: "Ще приклади" } },
      {
        kind: "quiz",
        slug: "recursion-quiz",
        title: { en: "Understanding recursion", uk: "Розуміння рекурсії" },
        questions: [
          {
            id: "base-case",
            mode: "single",
            prompt: { en: "What is the base case of a recursive method?", uk: "Що таке базовий випадок рекурсивного методу?" },
            options: [
              { id: "a", text: { en: "The input for which the method returns an answer without calling itself", uk: "Вхідні дані, для яких метод повертає відповідь, не викликаючи себе" } },
              { id: "b", text: { en: "The first call of the method in `Main`", uk: "Перший виклик методу в `Main`" } },
              { id: "c", text: { en: "The last line of the method", uk: "Останній рядок методу" } },
            ],
            correct: ["a"],
          },
          {
            id: "no-base-case",
            mode: "single",
            prompt: {
              en: "What happens when a recursive method has no reachable base case?",
              uk: "Що станеться, коли в рекурсивного методу немає досяжного базового випадку?",
            },
            options: [
              { id: "a", text: { en: "It returns 0", uk: "Він повертає 0" } },
              { id: "b", text: { en: "The calls pile up on the stack until a stack overflow ends the program", uk: "Виклики накопичуються на стеку, доки переповнення стека не завершить програму" } },
              { id: "c", text: { en: "The compiler reports an error", uk: "Компілятор повідомляє про помилку" } },
              { id: "d", text: { en: "The method silently stops after 1000 calls", uk: "Метод мовчки зупиняється після 1000 викликів" } },
            ],
            correct: ["b"],
          },
          {
            id: "sum-value",
            mode: "single",
            prompt: {
              en: "What does this program print?\n\n```csharp\nstatic int F(int n) => n == 0 ? 0 : n + F(n - 1);\n\nConsole.WriteLine(F(4));\n```",
              uk: "Що друкує ця програма?\n\n```csharp\nstatic int F(int n) => n == 0 ? 0 : n + F(n - 1);\n\nConsole.WriteLine(F(4));\n```",
            },
            options: [
              { id: "a", text: { en: "4", uk: "4" } },
              { id: "b", text: { en: "10", uk: "10" } },
              { id: "c", text: { en: "24", uk: "24" } },
              { id: "d", text: { en: "0", uk: "0" } },
            ],
            correct: ["b"],
          },
          {
            id: "fib-calls",
            mode: "single",
            prompt: {
              en: "How many calls (counting the first one) does the naive `Fib(5)` make, where `Fib(n) = n < 2 ? n : Fib(n - 1) + Fib(n - 2)`?",
              uk: "Скільки викликів (разом із першим) робить наївний `Fib(5)`, де `Fib(n) = n < 2 ? n : Fib(n - 1) + Fib(n - 2)`?",
            },
            options: [
              { id: "a", text: { en: "5", uk: "5" } },
              { id: "b", text: { en: "8", uk: "8" } },
              { id: "c", text: { en: "15", uk: "15" } },
              { id: "d", text: { en: "25", uk: "25" } },
            ],
            correct: ["c"],
          },
          {
            id: "stack-depth",
            mode: "single",
            prompt: {
              en: "The naive `Fib(40)` makes over 300 million calls. About how deep does the call stack get?",
              uk: "Наївний `Fib(40)` робить понад 300 мільйонів викликів. Наскільки глибоким стає стек викликів?",
            },
            options: [
              { id: "a", text: { en: "About 40 frames: the depth of the tree, not its size", uk: "Близько 40 кадрів: глибина дерева, а не його розмір" } },
              { id: "b", text: { en: "300 million frames", uk: "300 мільйонів кадрів" } },
              { id: "c", text: { en: "2 frames", uk: "2 кадри" } },
            ],
            correct: ["a"],
          },
          {
            id: "memoization",
            mode: "single",
            prompt: {
              en: "What does memoization do to the naive recursive Fibonacci?",
              uk: "Що робить мемоїзація з наївним рекурсивним Фібоначчі?",
            },
            options: [
              { id: "a", text: { en: "It turns the exponential time into linear time, by solving each sub-problem once", uk: "Перетворює експоненційний час на лінійний, розв'язуючи кожну підзадачу один раз" } },
              { id: "b", text: { en: "It removes the base case", uk: "Прибирає базовий випадок" } },
              { id: "c", text: { en: "It makes the recursion deeper", uk: "Робить рекурсію глибшою" } },
            ],
            correct: ["a"],
          },
          {
            id: "true-statements",
            mode: "multi",
            prompt: { en: "Which statements about recursion are true?", uk: "Які твердження про рекурсію правильні?" },
            options: [
              { id: "a", text: { en: "Every recursion can be rewritten with a loop (and, when needed, an explicit stack)", uk: "Будь-яку рекурсію можна переписати циклом (і за потреби явним стеком)" } },
              { id: "b", text: { en: "A recursive solution is always faster than a loop", uk: "Рекурсивний розв'язок завжди швидший за цикл" } },
              { id: "c", text: { en: "Each call uses some stack memory", uk: "Кожен виклик використовує трохи пам'яті стека" } },
              { id: "d", text: { en: "C# guarantees that tail calls never grow the stack", uk: "C# гарантує, що хвостові виклики ніколи не збільшують стек" } },
            ],
            correct: ["a", "c"],
          },
        ],
      },
      { kind: "lecture", slug: "divide-conquer", title: { en: "Divide and conquer", uk: "Розділяй і володарюй" } },
      { kind: "lecture", slug: "subsets", title: { en: "Subsets", uk: "Підмножини" } },
      {
        kind: "practice",
        slug: "password-bruteforce",
        title: { en: "Password brute force", uk: "Перебір паролів" },
        language: "csharp",
        starter: PROGRAM(
          `    // All the strings of exactly "length" characters over the alphabet, in the order of
    // the alphabet (with repetition): "ab", 3 -> aaa aab aba abb baa bab bba bbb
    static List<string> GeneratePasswords(string alphabet, int length)
    {
        // Write your code here
        return new List<string>();
    }

    static void Main()
    {
        List<string> small = GeneratePasswords("ab", 3);
        Console.WriteLine(small.Count);
        Console.WriteLine(string.Join(" ", small));

        List<string> big = GeneratePasswords("abc", 4);
        Console.WriteLine(big.Count);
        Console.WriteLine(big[0] + " " + big[40] + " " + big[80]);
        Console.WriteLine(big.IndexOf("cbca") + 1);

        Console.WriteLine(GeneratePasswords("xyz", 0).Count);
    }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM(
          `    static void Build(string alphabet, int length, string prefix, List<string> result)
    {
        if (prefix.Length == length)
        {
            result.Add(prefix);
            return;
        }
        foreach (char c in alphabet)
        {
            Build(alphabet, length, prefix + c, result);
        }
    }

    // All the strings of exactly "length" characters over the alphabet, in the order of
    // the alphabet (with repetition): "ab", 3 -> aaa aab aba abb baa bab bba bbb
    static List<string> GeneratePasswords(string alphabet, int length)
    {
        var result = new List<string>();
        Build(alphabet, length, "", result);
        return result;
    }

    static void Main()
    {
        List<string> small = GeneratePasswords("ab", 3);
        Console.WriteLine(small.Count);
        Console.WriteLine(string.Join(" ", small));

        List<string> big = GeneratePasswords("abc", 4);
        Console.WriteLine(big.Count);
        Console.WriteLine(big[0] + " " + big[40] + " " + big[80]);
        Console.WriteLine(big.IndexOf("cbca") + 1);

        Console.WriteLine(GeneratePasswords("xyz", 0).Count);
    }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "8\naaa aab aba abb baa bab bba bbb\n81\naaaa bbbb cccc\n70\n1\n",
      },
      { kind: "lecture", slug: "permutations", title: { en: "Permutations", uk: "Перестановки" } },
      {
        kind: "practice",
        slug: "abandoned-code",
        title: { en: "Abandoned code :(", uk: "Покинутий код :(" },
        language: "csharp",
        starter: PROGRAM(
          `    // All the permutations of the letters, in the order that comes from
    // trying the unused letters from left to right at every position.
    static List<string> Permutations(string letters)
    {
        var result = new List<string>();
        var used = new bool[letters.Length];
        Build("", letters, used, result);
        return result;
    }

    // TODO: finish the permutations before the demo :(
    static void Build(string prefix, string letters, bool[] used, List<string> result)
    {
        // TODO: the base case. When the prefix is as long as the letters, record it and return.

        // TODO: the recursive case. For every letter that is not used yet:
        //       mark it as used, call Build with the longer prefix, then unmark it (backtrack).
    }

    static void Main()
    {
        Console.WriteLine(string.Join(" ", Permutations("abc")));
        Console.WriteLine(Permutations("abcd").Count);
        List<string> four = Permutations("abcd");
        Console.WriteLine(four[four.Count - 1]);
        Console.WriteLine(Permutations("a").Count);
        Console.WriteLine(Permutations("").Count);
    }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM(
          `    // All the permutations of the letters, in the order that comes from
    // trying the unused letters from left to right at every position.
    static List<string> Permutations(string letters)
    {
        var result = new List<string>();
        var used = new bool[letters.Length];
        Build("", letters, used, result);
        return result;
    }

    // TODO: finish the permutations before the demo :(
    static void Build(string prefix, string letters, bool[] used, List<string> result)
    {
        if (prefix.Length == letters.Length)
        {
            result.Add(prefix);
            return;
        }

        for (int i = 0; i < letters.Length; i++)
        {
            if (used[i])
            {
                continue;
            }
            used[i] = true;
            Build(prefix + letters[i], letters, used, result);
            used[i] = false;
        }
    }

    static void Main()
    {
        Console.WriteLine(string.Join(" ", Permutations("abc")));
        Console.WriteLine(Permutations("abcd").Count);
        List<string> four = Permutations("abcd");
        Console.WriteLine(four[four.Count - 1]);
        Console.WriteLine(Permutations("a").Count);
        Console.WriteLine(Permutations("").Count);
    }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "abc acb bac bca cab cba\n24\ndcba\n1\n1\n",
      },
      { kind: "lecture", slug: "arrangements", title: { en: "Arrangements and combinations", uk: "Розміщення та комбінації" } },
      {
        kind: "quiz",
        slug: "recursion-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "subsets-count",
            mode: "single",
            prompt: { en: "How many subsets does a set of 5 elements have (counting the empty one)?", uk: "Скільки підмножин має множина з 5 елементів (разом з порожньою)?" },
            options: [
              { id: "a", text: { en: "10", uk: "10" } },
              { id: "b", text: { en: "25", uk: "25" } },
              { id: "c", text: { en: "32", uk: "32" } },
              { id: "d", text: { en: "120", uk: "120" } },
            ],
            correct: ["c"],
          },
          {
            id: "permutations-count",
            mode: "single",
            prompt: { en: "How many permutations do 4 different letters have?", uk: "Скільки перестановок мають 4 різні літери?" },
            options: [
              { id: "a", text: { en: "16", uk: "16" } },
              { id: "b", text: { en: "24", uk: "24" } },
              { id: "c", text: { en: "8", uk: "8" } },
              { id: "d", text: { en: "4", uk: "4" } },
            ],
            correct: ["b"],
          },
          {
            id: "arrangements-count",
            mode: "single",
            prompt: {
              en: "In how many ways can gold, silver and bronze medals go to 3 of 5 runners (order matters, no repeats)?",
              uk: "Скількома способами золоту, срібну й бронзову медалі можна віддати 3 із 5 бігунів (порядок важливий, повторів немає)?",
            },
            options: [
              { id: "a", text: { en: "10", uk: "10" } },
              { id: "b", text: { en: "15", uk: "15" } },
              { id: "c", text: { en: "60", uk: "60" } },
              { id: "d", text: { en: "125", uk: "125" } },
            ],
            correct: ["c"],
          },
          {
            id: "combinations-count",
            mode: "single",
            prompt: {
              en: "In how many ways can a team of 2 be chosen from 5 people (the order does not matter)?",
              uk: "Скількома способами можна обрати команду з 2 людей із 5 (порядок не важливий)?",
            },
            options: [
              { id: "a", text: { en: "10", uk: "10" } },
              { id: "b", text: { en: "20", uk: "20" } },
              { id: "c", text: { en: "25", uk: "25" } },
              { id: "d", text: { en: "32", uk: "32" } },
            ],
            correct: ["a"],
          },
          {
            id: "password-count",
            mode: "single",
            prompt: {
              en: "How many strings of length 4 are there over the alphabet `a`, `b`, `c` (repetition allowed)?",
              uk: "Скільки існує рядків довжини 4 над алфавітом `a`, `b`, `c` (повтори дозволено)?",
            },
            options: [
              { id: "a", text: { en: "12", uk: "12" } },
              { id: "b", text: { en: "24", uk: "24" } },
              { id: "c", text: { en: "64", uk: "64" } },
              { id: "d", text: { en: "81", uk: "81" } },
            ],
            correct: ["d"],
          },
          {
            id: "merge-sort",
            mode: "single",
            prompt: { en: "What is the time complexity of merge sort?", uk: "Яка часова складність сортування злиттям?" },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n log n)", uk: "O(n log n)" } },
              { id: "c", text: { en: "O(n²)", uk: "O(n²)" } },
            ],
            correct: ["b"],
          },
          {
            id: "unmark",
            mode: "single",
            prompt: {
              en: "In a backtracking permutation generator with a shared `used` array, why is `used[i] = false` done after the recursive call?",
              uk: "У генераторі перестановок із поверненням назад зі спільним масивом `used` навіщо `used[i] = false` виконується після рекурсивного виклику?",
            },
            options: [
              { id: "a", text: { en: "So that the element becomes available again for the other branches", uk: "Щоб елемент знову став доступним для інших гілок" } },
              { id: "b", text: { en: "To free memory", uk: "Щоб звільнити пам'ять" } },
              { id: "c", text: { en: "Because the compiler requires it", uk: "Бо цього вимагає компілятор" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "password-bruteforce-2",
        title: { en: "Practice: Password brute force 2", uk: "Практика «Перебір паролів 2»" },
        language: "csharp",
        starter: PROGRAM(
          `    // All the passwords of exactly "length" characters over the alphabet, in the order of
    // the alphabet, such that
    //   1. no two equal characters are next to each other, and
    //   2. there is at least one digit.
    static List<string> ValidPasswords(string alphabet, int length)
    {
        // Write your code here
        return new List<string>();
    }

    static void Main()
    {
        List<string> a = ValidPasswords("ab1", 5);
        Console.WriteLine(a.Count);
        Console.WriteLine(a[0] + " " + a[1] + " " + a[2] + " ... " + a[a.Count - 1]);

        Console.WriteLine(ValidPasswords("ab", 3).Count);

        List<string> b = ValidPasswords("12", 3);
        Console.WriteLine(b.Count + ": " + string.Join(" ", b));
    }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM(
          `    static void Build(string alphabet, int length, string prefix, bool hasDigit, List<string> result)
    {
        if (prefix.Length == length)
        {
            if (hasDigit)
            {
                result.Add(prefix);
            }
            return;
        }
        foreach (char c in alphabet)
        {
            if (prefix.Length > 0 && prefix[prefix.Length - 1] == c)
            {
                continue;
            }
            Build(alphabet, length, prefix + c, hasDigit || char.IsDigit(c), result);
        }
    }

    // All the passwords of exactly "length" characters over the alphabet, in the order of
    // the alphabet, such that
    //   1. no two equal characters are next to each other, and
    //   2. there is at least one digit.
    static List<string> ValidPasswords(string alphabet, int length)
    {
        var result = new List<string>();
        Build(alphabet, length, "", false, result);
        return result;
    }

    static void Main()
    {
        List<string> a = ValidPasswords("ab1", 5);
        Console.WriteLine(a.Count);
        Console.WriteLine(a[0] + " " + a[1] + " " + a[2] + " ... " + a[a.Count - 1]);

        Console.WriteLine(ValidPasswords("ab", 3).Count);

        List<string> b = ValidPasswords("12", 3);
        Console.WriteLine(b.Count + ": " + string.Join(" ", b));
    }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "46\nabab1 aba1a aba1b ... 1b1b1\n0\n2: 121 212\n",
        maxScore: 20,
      },
      {
        kind: "practice",
        slug: "checkpoints",
        title: { en: "Practice: Walking through checkpoints", uk: "Практика «Проходження через контрольні точки»" },
        language: "csharp",
        starter: PROGRAM(`    // The number of paths from (0, 0) to (rows - 1, cols - 1) with steps right or down
    // that visit the checkpoints (checkRows[i], checkCols[i]) in the given order.
    static long CountPaths(int rows, int cols, int[] checkRows, int[] checkCols)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        Console.WriteLine(CountPaths(3, 3, new int[0], new int[0]));
        Console.WriteLine(CountPaths(3, 3, new[] { 1 }, new[] { 1 }));
        Console.WriteLine(CountPaths(5, 5, new[] { 2 }, new[] { 2 }));
        Console.WriteLine(CountPaths(5, 5, new[] { 1, 3 }, new[] { 1, 3 }));
        Console.WriteLine(CountPaths(17, 17, new int[0], new int[0]));
        Console.WriteLine(CountPaths(17, 17, new[] { 8 }, new[] { 8 }));
        Console.WriteLine(CountPaths(5, 5, new[] { 3, 1 }, new[] { 3, 1 }));
        Console.WriteLine(CountPaths(3, 3, new[] { 0 }, new[] { 0 }));
        Console.WriteLine(CountPaths(4, 6, new[] { 1, 2 }, new[] { 2, 4 }));
    }`),
        solution: PROGRAM(`    // The number of paths with "down" steps down and "right" steps right
    static long Paths(int down, int right, long[,] memo)
    {
        if (down == 0 || right == 0)
        {
            return 1;
        }
        if (memo[down, right] != 0)
        {
            return memo[down, right];
        }
        long result = Paths(down - 1, right, memo) + Paths(down, right - 1, memo);
        memo[down, right] = result;
        return result;
    }

    // The number of paths from (r1, c1) to (r2, c2); 0 if (r2, c2) is not reachable
    static long Segment(int r1, int c1, int r2, int c2)
    {
        if (r2 < r1 || c2 < c1)
        {
            return 0;
        }
        int down = r2 - r1;
        int right = c2 - c1;
        return Paths(down, right, new long[down + 1, right + 1]);
    }

    // The number of paths from (0, 0) to (rows - 1, cols - 1) with steps right or down
    // that visit the checkpoints (checkRows[i], checkCols[i]) in the given order.
    static long CountPaths(int rows, int cols, int[] checkRows, int[] checkCols)
    {
        long total = 1;
        int r = 0;
        int c = 0;
        for (int i = 0; i < checkRows.Length; i++)
        {
            total *= Segment(r, c, checkRows[i], checkCols[i]);
            r = checkRows[i];
            c = checkCols[i];
        }
        return total * Segment(r, c, rows - 1, cols - 1);
    }

    static void Main()
    {
        Console.WriteLine(CountPaths(3, 3, new int[0], new int[0]));
        Console.WriteLine(CountPaths(3, 3, new[] { 1 }, new[] { 1 }));
        Console.WriteLine(CountPaths(5, 5, new[] { 2 }, new[] { 2 }));
        Console.WriteLine(CountPaths(5, 5, new[] { 1, 3 }, new[] { 1, 3 }));
        Console.WriteLine(CountPaths(17, 17, new int[0], new int[0]));
        Console.WriteLine(CountPaths(17, 17, new[] { 8 }, new[] { 8 }));
        Console.WriteLine(CountPaths(5, 5, new[] { 3, 1 }, new[] { 3, 1 }));
        Console.WriteLine(CountPaths(3, 3, new[] { 0 }, new[] { 0 }));
        Console.WriteLine(CountPaths(4, 6, new[] { 1, 2 }, new[] { 2, 4 }));
    }`),
        expectedOutput: "6\n4\n36\n24\n601080390\n165636900\n0\n6\n18\n",
        maxScore: 20,
      },
    ],
  },
  {
    slug: "searching-sorting",
    title: { en: "Searching and sorting", uk: "Пошук і сортування" },
    slides: [
      { kind: "lecture", slug: "binary-search-idea", title: { en: "Binary search", uk: "Двійковий пошук" } },
      { kind: "lecture", slug: "linear-search-analysis", title: { en: "Analysis of linear search", uk: "Аналіз лінійного пошуку" } },
      {
        kind: "quiz",
        slug: "algorithm-analysis-quiz",
        title: { en: "Algorithm analysis", uk: "Аналіз алгоритму" },
        questions: [
          {
            id: "linear-average",
            mode: "single",
            prompt: {
              en: "A value is present in an unsorted array of `n` elements, at a random position. About how many comparisons does a linear search make on average?",
              uk: "Значення є в невідсортованому масиві з `n` елементів на випадковій позиції. Скільки порівнянь у середньому робить лінійний пошук?",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "About `n / 2`", uk: "Близько `n / 2`" } },
              { id: "c", text: { en: "About `log₂ n`", uk: "Близько `log₂ n`" } },
              { id: "d", text: { en: "About `n²`", uk: "Близько `n²`" } },
            ],
            correct: ["b"],
          },
          {
            id: "binary-worst",
            mode: "single",
            prompt: {
              en: "About how many elements does binary search examine, in the worst case, in a sorted array of 1000 elements?",
              uk: "Скільки елементів приблизно переглядає двійковий пошук у найгіршому випадку у відсортованому масиві з 1000 елементів?",
            },
            options: [
              { id: "a", text: { en: "10", uk: "10" } },
              { id: "b", text: { en: "100", uk: "100" } },
              { id: "c", text: { en: "500", uk: "500" } },
              { id: "d", text: { en: "1000", uk: "1000" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "binary-search-analysis", title: { en: "Analysis of binary search", uk: "Аналіз двійкового пошуку" } },
      { kind: "lecture", slug: "performance-comparison", title: { en: "Comparing performance", uk: "Порівняння продуктивності" } },
      {
        kind: "practice",
        slug: "recursive-binary-search",
        title: { en: "Recursive binary search", uk: "Рекурсивний двійковий пошук" },
        language: "csharp",
        starter: PROGRAM(`    // The index of value in the sorted array (all values are different), or -1.
    // Write a RECURSIVE helper with the range left..right.
    static int Search(int[] sorted, int value)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        int[] small = { 1, 3, 5, 7, 9, 11, 13 };
        foreach (int v in new[] { 7, 1, 13, 4, 20, 0 })
        {
            Console.WriteLine(v + " -> " + Search(small, v));
        }
        Console.WriteLine(Search(new int[0], 5));

        int[] big = new int[1000000];
        for (int i = 0; i < big.Length; i++)
        {
            big[i] = i * 2;
        }
        Console.WriteLine(Search(big, 1999998));
        Console.WriteLine(Search(big, 1999999));
        Console.WriteLine(Search(big, 0));
    }`),
        solution: PROGRAM(`    static int Find(int[] sorted, int value, int left, int right)
    {
        if (left > right)
        {
            return -1;
        }
        int middle = left + (right - left) / 2;
        if (sorted[middle] == value)
        {
            return middle;
        }
        if (sorted[middle] < value)
        {
            return Find(sorted, value, middle + 1, right);
        }
        return Find(sorted, value, left, middle - 1);
    }

    // The index of value in the sorted array (all values are different), or -1.
    // Write a RECURSIVE helper with the range left..right.
    static int Search(int[] sorted, int value)
    {
        return Find(sorted, value, 0, sorted.Length - 1);
    }

    static void Main()
    {
        int[] small = { 1, 3, 5, 7, 9, 11, 13 };
        foreach (int v in new[] { 7, 1, 13, 4, 20, 0 })
        {
            Console.WriteLine(v + " -> " + Search(small, v));
        }
        Console.WriteLine(Search(new int[0], 5));

        int[] big = new int[1000000];
        for (int i = 0; i < big.Length; i++)
        {
            big[i] = i * 2;
        }
        Console.WriteLine(Search(big, 1999998));
        Console.WriteLine(Search(big, 1999999));
        Console.WriteLine(Search(big, 0));
    }`),
        expectedOutput: "7 -> 3\n1 -> 0\n13 -> 6\n4 -> -1\n20 -> -1\n0 -> -1\n-1\n999999\n-1\n0\n",
      },
      { kind: "lecture", slug: "bubble-sort", title: { en: "Bubble sort", uk: "Сортування бульбашкою" } },
      {
        kind: "practice",
        slug: "sort-range",
        title: { en: "Sorting a range", uk: "Сортування діапазону" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[] a)
    {
        for (int i = 0; i < a.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(a[i]);
        }
        Console.WriteLine();
    }

    // Bubble sort of the elements with the indexes from..to-1 (to is not included), in place.
    // Swap only neighbours, and only when the left one is strictly greater.
    // Returns the number of swaps.
    static int SortRange(int[] a, int from, int to)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        int[] a = { 9, 4, 7, 1, 8, 2, 6, 3 };
        int swaps = SortRange(a, 2, 6);
        Show(a);
        Console.WriteLine(swaps);
        Console.WriteLine(SortRange(a, 0, a.Length));
        Show(a);

        int[] b = { 5, 4, 3, 2, 1 };
        Console.WriteLine(SortRange(b, 3, 3));
        Console.WriteLine(SortRange(b, 1, 2));
        Show(b);
    }`),
        solution: PROGRAM(`    static void Show(int[] a)
    {
        for (int i = 0; i < a.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(a[i]);
        }
        Console.WriteLine();
    }

    // Bubble sort of the elements with the indexes from..to-1 (to is not included), in place.
    // Swap only neighbours, and only when the left one is strictly greater.
    // Returns the number of swaps.
    static int SortRange(int[] a, int from, int to)
    {
        int swaps = 0;
        for (int pass = 0; pass < to - from - 1; pass++)
        {
            bool swapped = false;
            for (int i = from; i < to - 1 - pass; i++)
            {
                if (a[i] > a[i + 1])
                {
                    int temp = a[i];
                    a[i] = a[i + 1];
                    a[i + 1] = temp;
                    swaps++;
                    swapped = true;
                }
            }
            if (!swapped)
            {
                break;
            }
        }
        return swaps;
    }

    static void Main()
    {
        int[] a = { 9, 4, 7, 1, 8, 2, 6, 3 };
        int swaps = SortRange(a, 2, 6);
        Show(a);
        Console.WriteLine(swaps);
        Console.WriteLine(SortRange(a, 0, a.Length));
        Show(a);

        int[] b = { 5, 4, 3, 2, 1 };
        Console.WriteLine(SortRange(b, 3, 3));
        Console.WriteLine(SortRange(b, 1, 2));
        Show(b);
    }`),
        expectedOutput: "9 4 1 2 7 8 6 3\n3\n15\n1 2 3 4 6 7 8 9\n0\n0\n5 4 3 2 1\n",
      },
      { kind: "lecture", slug: "merge-sort", title: { en: "Merge sort", uk: "Сортування злиттям" } },
      {
        kind: "practice",
        slug: "merge-sorted",
        title: { en: "Merging sorted arrays", uk: "Злиття відсортованих масивів" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[] a)
    {
        for (int i = 0; i < a.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(a[i]);
        }
        Console.WriteLine();
    }

    // A NEW sorted array with all the elements of both sorted arrays: one pass, two pointers.
    // On equal values, take the element from left first (a stable merge).
    static int[] Merge(int[] left, int[] right)
    {
        // Write your code here
        return new int[0];
    }

    static void Main()
    {
        Show(Merge(new[] { 1, 4, 9 }, new[] { 2, 3, 10, 11 }));
        Show(Merge(new int[0], new[] { 5 }));
        Show(Merge(new[] { 2, 2 }, new[] { 2 }));
        Show(Merge(new[] { 1 }, new int[0]));
        Show(Merge(new int[0], new int[0]));
    }`),
        solution: PROGRAM(`    static void Show(int[] a)
    {
        for (int i = 0; i < a.Length; i++)
        {
            if (i > 0) Console.Write(" ");
            Console.Write(a[i]);
        }
        Console.WriteLine();
    }

    // A NEW sorted array with all the elements of both sorted arrays: one pass, two pointers.
    // On equal values, take the element from left first (a stable merge).
    static int[] Merge(int[] left, int[] right)
    {
        int[] result = new int[left.Length + right.Length];
        int i = 0, j = 0, k = 0;
        while (i < left.Length && j < right.Length)
        {
            if (left[i] <= right[j])
            {
                result[k++] = left[i++];
            }
            else
            {
                result[k++] = right[j++];
            }
        }
        while (i < left.Length)
        {
            result[k++] = left[i++];
        }
        while (j < right.Length)
        {
            result[k++] = right[j++];
        }
        return result;
    }

    static void Main()
    {
        Show(Merge(new[] { 1, 4, 9 }, new[] { 2, 3, 10, 11 }));
        Show(Merge(new int[0], new[] { 5 }));
        Show(Merge(new[] { 2, 2 }, new[] { 2 }));
        Show(Merge(new[] { 1 }, new int[0]));
        Show(Merge(new int[0], new int[0]));
    }`),
        expectedOutput: "1 2 3 4 9 10 11\n5\n2 2 2\n1\n\n",
      },
      { kind: "lecture", slug: "quick-sort", title: { en: "Quicksort", uk: "Швидке сортування" } },
      {
        kind: "practice",
        slug: "partition",
        title: { en: "Partition", uk: "Розбиття" },
        language: "csharp",
        starter: PROGRAM(`    static string Text(int[] a)
    {
        string text = "";
        for (int i = 0; i < a.Length; i++)
        {
            if (i > 0) text += " ";
            text += a[i];
        }
        return text;
    }

    // Lomuto partition of the range low..high (both included) around the pivot a[high]:
    //   i = low - 1; for j = low .. high - 1: if a[j] <= pivot, then i++ and swap a[i], a[j];
    //   at the end swap a[i + 1] with a[high]. Returns the final index of the pivot, i + 1.
    static int Partition(int[] a, int low, int high)
    {
        // Write your code here
        return -1;
    }

    static void Run(int[] a, int low, int high)
    {
        int p = Partition(a, low, high);
        Console.WriteLine(Text(a) + " -> " + p);
    }

    static void Main()
    {
        Run(new[] { 8, 3, 9, 1, 5, 7, 2, 6 }, 0, 7);
        Run(new[] { 1, 2, 3, 4, 5 }, 0, 4);
        Run(new[] { 5, 4, 3, 2, 1 }, 0, 4);
        Run(new[] { 4, 4, 4, 4 }, 0, 3);
        Run(new[] { 7 }, 0, 0);
        Run(new[] { 8, 3, 9, 1, 5, 7, 2, 6 }, 2, 6);
    }`),
        solution: PROGRAM(`    static string Text(int[] a)
    {
        string text = "";
        for (int i = 0; i < a.Length; i++)
        {
            if (i > 0) text += " ";
            text += a[i];
        }
        return text;
    }

    static void Swap(int[] a, int i, int j)
    {
        int temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }

    // Lomuto partition of the range low..high (both included) around the pivot a[high]:
    //   i = low - 1; for j = low .. high - 1: if a[j] <= pivot, then i++ and swap a[i], a[j];
    //   at the end swap a[i + 1] with a[high]. Returns the final index of the pivot, i + 1.
    static int Partition(int[] a, int low, int high)
    {
        int pivot = a[high];
        int i = low - 1;
        for (int j = low; j < high; j++)
        {
            if (a[j] <= pivot)
            {
                i++;
                Swap(a, i, j);
            }
        }
        Swap(a, i + 1, high);
        return i + 1;
    }

    static void Run(int[] a, int low, int high)
    {
        int p = Partition(a, low, high);
        Console.WriteLine(Text(a) + " -> " + p);
    }

    static void Main()
    {
        Run(new[] { 8, 3, 9, 1, 5, 7, 2, 6 }, 0, 7);
        Run(new[] { 1, 2, 3, 4, 5 }, 0, 4);
        Run(new[] { 5, 4, 3, 2, 1 }, 0, 4);
        Run(new[] { 4, 4, 4, 4 }, 0, 3);
        Run(new[] { 7 }, 0, 0);
        Run(new[] { 8, 3, 9, 1, 5, 7, 2, 6 }, 2, 6);
    }`),
        expectedOutput:
          "3 1 5 2 6 7 8 9 -> 4\n1 2 3 4 5 -> 4\n1 4 3 2 5 -> 0\n4 4 4 4 -> 3\n7 -> 0\n8 3 1 2 5 7 9 6 -> 3\n",
      },
      {
        kind: "quiz",
        slug: "search-sort-quiz",
        title: { en: "Complexity of searching and sorting", uk: "Складність пошуку та сортування" },
        questions: [
          {
            id: "binary-needs-sorted",
            mode: "single",
            prompt: { en: "What must be true of the data for binary search to work?", uk: "Що має бути правдою щодо даних, щоб двійковий пошук працював?" },
            options: [
              { id: "a", text: { en: "It must be sorted and allow access by index", uk: "Вони мають бути відсортовані й давати доступ за індексом" } },
              { id: "b", text: { en: "It must have no duplicates", uk: "У них не має бути дублікатів" } },
              { id: "c", text: { en: "It must contain only numbers", uk: "Вони мають містити лише числа" } },
            ],
            correct: ["a"],
          },
          {
            id: "bubble-worst",
            mode: "single",
            prompt: { en: "What is the worst-case complexity of bubble sort?", uk: "Яка складність сортування бульбашкою в найгіршому випадку?" },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n log n)", uk: "O(n log n)" } },
              { id: "c", text: { en: "O(n²)", uk: "O(n²)" } },
              { id: "d", text: { en: "O(log n)", uk: "O(log n)" } },
            ],
            correct: ["c"],
          },
          {
            id: "merge-memory",
            mode: "single",
            prompt: { en: "How much extra memory does merge sort need?", uk: "Скільки додаткової пам'яті потребує сортування злиттям?" },
            options: [
              { id: "a", text: { en: "O(1)", uk: "O(1)" } },
              { id: "b", text: { en: "O(log n)", uk: "O(log n)" } },
              { id: "c", text: { en: "O(n)", uk: "O(n)" } },
            ],
            correct: ["c"],
          },
          {
            id: "quick-worst",
            mode: "single",
            prompt: {
              en: "When does quicksort with the last element as the pivot take O(n²) time?",
              uk: "Коли швидке сортування з останнім елементом як опорним працює за O(n²)?",
            },
            options: [
              { id: "a", text: { en: "On an already sorted array", uk: "На вже відсортованому масиві" } },
              { id: "b", text: { en: "On a random array", uk: "На випадковому масиві" } },
              { id: "c", text: { en: "Never", uk: "Ніколи" } },
            ],
            correct: ["a"],
          },
          {
            id: "stable",
            mode: "multi",
            prompt: { en: "Which of these sorting algorithms are stable?", uk: "Які із цих алгоритмів сортування стабільні?" },
            options: [
              { id: "a", text: { en: "Merge sort", uk: "Сортування злиттям" } },
              { id: "b", text: { en: "Insertion sort", uk: "Сортування вставками" } },
              { id: "c", text: { en: "Quicksort", uk: "Швидке сортування" } },
              { id: "d", text: { en: "Bubble sort", uk: "Сортування бульбашкою" } },
            ],
            correct: ["a", "b", "d"],
          },
          {
            id: "lower-bound",
            mode: "single",
            prompt: {
              en: "What is the best possible worst-case time of a sorting algorithm that only compares pairs of elements?",
              uk: "Який найкращий можливий час у найгіршому випадку для алгоритму сортування, що лише порівнює пари елементів?",
            },
            options: [
              { id: "a", text: { en: "O(n)", uk: "O(n)" } },
              { id: "b", text: { en: "O(n log n)", uk: "O(n log n)" } },
              { id: "c", text: { en: "O(log n)", uk: "O(log n)" } },
            ],
            correct: ["b"],
          },
        ],
      },
      { kind: "lecture", slug: "sorting-comparison", title: { en: "Comparing sorting algorithms", uk: "Порівняння алгоритмів сортування" } },
      {
        kind: "quiz",
        slug: "searching-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "binary-search-library",
            mode: "single",
            prompt: {
              en: "What does `Array.BinarySearch` return when the value is not in the array?",
              uk: "Що повертає `Array.BinarySearch`, коли значення немає в масиві?",
            },
            options: [
              { id: "a", text: { en: "A negative number: the bitwise complement of the insertion position", uk: "Від'ємне число: побітове доповнення позиції вставки" } },
              { id: "b", text: { en: "Always -1", uk: "Завжди -1" } },
              { id: "c", text: { en: "It throws an exception", uk: "Кидає виняток" } },
            ],
            correct: ["a"],
          },
          {
            id: "bubble-swaps",
            mode: "single",
            prompt: {
              en: "How many swaps does bubble sort make on the array `[3, 2, 1]`?",
              uk: "Скільки обмінів робить сортування бульбашкою для масиву `[3, 2, 1]`?",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "2", uk: "2" } },
              { id: "c", text: { en: "3", uk: "3" } },
              { id: "d", text: { en: "6", uk: "6" } },
            ],
            correct: ["c"],
          },
          {
            id: "middle-formula",
            mode: "single",
            prompt: {
              en: "Why is the middle index written as `left + (right - left) / 2` instead of `(left + right) / 2`?",
              uk: "Чому середній індекс записують як `left + (right - left) / 2`, а не `(left + right) / 2`?",
            },
            options: [
              { id: "a", text: { en: "To avoid an integer overflow for huge arrays", uk: "Щоб уникнути переповнення цілого для величезних масивів" } },
              { id: "b", text: { en: "Because it is faster", uk: "Бо так швидше" } },
              { id: "c", text: { en: "Because the other form rounds down", uk: "Бо інша форма округлює вниз" } },
            ],
            correct: ["a"],
          },
          {
            id: "array-sort",
            mode: "single",
            prompt: {
              en: "Which algorithm does `Array.Sort` in .NET use?",
              uk: "Який алгоритм використовує `Array.Sort` у .NET?",
            },
            options: [
              { id: "a", text: { en: "Bubble sort", uk: "Сортування бульбашкою" } },
              { id: "b", text: { en: "Introsort: quicksort, switching to heapsort and insertion sort", uk: "Introsort: швидке сортування, що перемикається на пірамідальне та вставки" } },
              { id: "c", text: { en: "Counting sort", uk: "Сортування підрахунком" } },
            ],
            correct: ["b"],
          },
          {
            id: "sort-once",
            mode: "single",
            prompt: {
              en: "You have an unsorted array and many search queries. What is the usual best approach?",
              uk: "У вас є невідсортований масив і багато пошукових запитів. Який зазвичай найкращий підхід?",
            },
            options: [
              { id: "a", text: { en: "Sort once, then use binary search for every query", uk: "Відсортувати один раз, потім для кожного запиту використати двійковий пошук" } },
              { id: "b", text: { en: "Sort again before every query", uk: "Сортувати знову перед кожним запитом" } },
              { id: "c", text: { en: "Use linear search every time", uk: "Щоразу використовувати лінійний пошук" } },
            ],
            correct: ["a"],
          },
          {
            id: "lower-bound-def",
            mode: "single",
            prompt: {
              en: "In a sorted array, what is the left (lower) bound of `x`?",
              uk: "Що таке ліва (нижня) межа `x` у відсортованому масиві?",
            },
            options: [
              { id: "a", text: { en: "The smallest index `i` with `a[i] >= x`", uk: "Найменший індекс `i`, для якого `a[i] >= x`" } },
              { id: "b", text: { en: "The largest index `i` with `a[i] <= x`", uk: "Найбільший індекс `i`, для якого `a[i] <= x`" } },
              { id: "c", text: { en: "The index of the middle element", uk: "Індекс середнього елемента" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "left-bound",
        title: { en: "Practice: Left bound", uk: "Практика «Ліва межа»" },
        language: "csharp",
        starter: PROGRAM(`    // The smallest index i with sorted[i] >= x, or sorted.Length if there is none.
    // Use a binary search.
    static int LowerBound(int[] sorted, int x)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        int[] a = { 1, 2, 2, 2, 5, 8, 8, 10 };
        foreach (int x in new[] { 0, 1, 2, 3, 5, 8, 9, 10, 11 })
        {
            Console.WriteLine(x + " -> " + LowerBound(a, x));
        }
        Console.WriteLine(LowerBound(new int[0], 7));
    }`),
        solution: PROGRAM(`    // The smallest index i with sorted[i] >= x, or sorted.Length if there is none.
    // Use a binary search.
    static int LowerBound(int[] sorted, int x)
    {
        int lo = 0;
        int hi = sorted.Length;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (sorted[mid] < x)
            {
                lo = mid + 1;
            }
            else
            {
                hi = mid;
            }
        }
        return lo;
    }

    static void Main()
    {
        int[] a = { 1, 2, 2, 2, 5, 8, 8, 10 };
        foreach (int x in new[] { 0, 1, 2, 3, 5, 8, 9, 10, 11 })
        {
            Console.WriteLine(x + " -> " + LowerBound(a, x));
        }
        Console.WriteLine(LowerBound(new int[0], 7));
    }`),
        expectedOutput: "0 -> 0\n1 -> 0\n2 -> 1\n3 -> 4\n5 -> 4\n8 -> 5\n9 -> 7\n10 -> 7\n11 -> 8\n0\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "right-bound",
        title: { en: "Practice: Right bound", uk: "Практика «Права межа»" },
        language: "csharp",
        starter: PROGRAM(`    // Already written: the smallest index i with sorted[i] >= x
    static int LowerBound(int[] sorted, int x)
    {
        int lo = 0;
        int hi = sorted.Length;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (sorted[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    // The smallest index i with sorted[i] > x (strictly greater), or sorted.Length
    static int UpperBound(int[] sorted, int x)
    {
        // Write your code here
        return -1;
    }

    // How many elements are equal to x
    static int CountOccurrences(int[] sorted, int x)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        int[] a = { 1, 2, 2, 2, 5, 8, 8, 10 };
        foreach (int x in new[] { 0, 1, 2, 3, 5, 8, 9, 10, 11 })
        {
            Console.WriteLine(x + " -> " + UpperBound(a, x));
        }
        Console.WriteLine(CountOccurrences(a, 2));
        Console.WriteLine(CountOccurrences(a, 8));
        Console.WriteLine(CountOccurrences(a, 4));
        Console.WriteLine(CountOccurrences(a, 1));
        Console.WriteLine(CountOccurrences(a, 11));
    }`),
        solution: PROGRAM(`    // Already written: the smallest index i with sorted[i] >= x
    static int LowerBound(int[] sorted, int x)
    {
        int lo = 0;
        int hi = sorted.Length;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (sorted[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    // The smallest index i with sorted[i] > x (strictly greater), or sorted.Length
    static int UpperBound(int[] sorted, int x)
    {
        int lo = 0;
        int hi = sorted.Length;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (sorted[mid] <= x)
            {
                lo = mid + 1;
            }
            else
            {
                hi = mid;
            }
        }
        return lo;
    }

    // How many elements are equal to x
    static int CountOccurrences(int[] sorted, int x)
    {
        return UpperBound(sorted, x) - LowerBound(sorted, x);
    }

    static void Main()
    {
        int[] a = { 1, 2, 2, 2, 5, 8, 8, 10 };
        foreach (int x in new[] { 0, 1, 2, 3, 5, 8, 9, 10, 11 })
        {
            Console.WriteLine(x + " -> " + UpperBound(a, x));
        }
        Console.WriteLine(CountOccurrences(a, 2));
        Console.WriteLine(CountOccurrences(a, 8));
        Console.WriteLine(CountOccurrences(a, 4));
        Console.WriteLine(CountOccurrences(a, 1));
        Console.WriteLine(CountOccurrences(a, 11));
    }`),
        expectedOutput: "0 -> 0\n1 -> 1\n2 -> 4\n3 -> 4\n5 -> 5\n8 -> 7\n9 -> 7\n10 -> 8\n11 -> 8\n3\n2\n0\n1\n0\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "autocomplete",
        title: { en: "Practice: Autocomplete", uk: "Практика «Автодоповнення»" },
        language: "csharp",
        starter: PROGRAM(
          `    // The words are sorted in the ordinal order (string.CompareOrdinal).
    // At most "limit" words that start with the prefix, in the sorted order.
    // Find the first candidate with a binary search, then walk forward.
    static List<string> Suggestions(string[] sortedWords, string prefix, int limit)
    {
        // Write your code here
        return new List<string>();
    }

    // How many words start with the prefix, without walking over them:
    // the difference of the lower bounds of prefix + "\\uffff" and of prefix.
    static int CountWithPrefix(string[] sortedWords, string prefix)
    {
        // Write your code here
        return -1;
    }

    static void Show(string[] words, string prefix, int limit)
    {
        Console.WriteLine("[" + prefix + "] " + CountWithPrefix(words, prefix) + ": " + string.Join(" ", Suggestions(words, prefix, limit)));
    }

    static void Main()
    {
        string[] words =
        {
            "apple", "apply", "apricot", "banana", "band", "bandana", "bar", "bark", "barn", "base",
            "bat", "batch", "bath", "cat", "catalog", "catch", "cattle", "dog", "door", "dot",
        };
        Show(words, "ba", 5);
        Show(words, "bar", 10);
        Show(words, "cat", 2);
        Show(words, "z", 3);
        Show(words, "", 3);
        Show(words, "app", 5);
        Show(words, "bat", 1);
    }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM(
          `    // The smallest index i with words[i] >= key in the ordinal order
    static int LowerBound(string[] words, string key)
    {
        int lo = 0;
        int hi = words.Length;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (string.CompareOrdinal(words[mid], key) < 0)
            {
                lo = mid + 1;
            }
            else
            {
                hi = mid;
            }
        }
        return lo;
    }

    // The words are sorted in the ordinal order (string.CompareOrdinal).
    // At most "limit" words that start with the prefix, in the sorted order.
    // Find the first candidate with a binary search, then walk forward.
    static List<string> Suggestions(string[] sortedWords, string prefix, int limit)
    {
        var result = new List<string>();
        int i = LowerBound(sortedWords, prefix);
        while (i < sortedWords.Length
            && result.Count < limit
            && sortedWords[i].StartsWith(prefix, StringComparison.Ordinal))
        {
            result.Add(sortedWords[i]);
            i++;
        }
        return result;
    }

    // How many words start with the prefix, without walking over them:
    // the difference of the lower bounds of prefix + "\\uffff" and of prefix.
    static int CountWithPrefix(string[] sortedWords, string prefix)
    {
        return LowerBound(sortedWords, prefix + "\\uffff") - LowerBound(sortedWords, prefix);
    }

    static void Show(string[] words, string prefix, int limit)
    {
        Console.WriteLine("[" + prefix + "] " + CountWithPrefix(words, prefix) + ": " + string.Join(" ", Suggestions(words, prefix, limit)));
    }

    static void Main()
    {
        string[] words =
        {
            "apple", "apply", "apricot", "banana", "band", "bandana", "bar", "bark", "barn", "base",
            "bat", "batch", "bath", "cat", "catalog", "catch", "cattle", "dog", "door", "dot",
        };
        Show(words, "ba", 5);
        Show(words, "bar", 10);
        Show(words, "cat", 2);
        Show(words, "z", 3);
        Show(words, "", 3);
        Show(words, "app", 5);
        Show(words, "bat", 1);
    }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput:
          "[ba] 10: banana band bandana bar bark\n[bar] 3: bar bark barn\n[cat] 4: cat catalog\n[z] 0: \n[] 20: apple apply apricot\n[app] 2: apple apply\n[bat] 3: bat\n",
        maxScore: 20,
      },
      { kind: "lecture", slug: "search-sort-tasks", title: { en: "Seminar problems", uk: "Задачі на семінар" } },
    ],
  },
  {
    slug: "oop-basics",
    title: { en: "OOP basics", uk: "Основи ООП" },
    slides: [
      { kind: "lecture", slug: "classes", title: { en: "Classes", uk: "Класи" } },
      {
        kind: "practice",
        slug: "creating-classes",
        title: { en: "Creating classes", uk: "Створення класів" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Write the class Book here`,
          `        var hobbit = new Book("The Hobbit", "J.R.R. Tolkien", 310);
        Console.WriteLine(hobbit.Describe());
        Console.WriteLine(hobbit.IsLong());
        Console.WriteLine(hobbit.ReadingDays(40));

        var poems = new Book("Poems", "Ann", 80);
        Console.WriteLine(poems.Describe());
        Console.WriteLine(poems.IsLong());
        Console.WriteLine(poems.ReadingDays(40));
        Console.WriteLine(poems.ReadingDays(100));`,
        ),
        solution: PROGRAM_WITH(
          `class Book
{
    private readonly string title;
    private readonly string author;
    private readonly int pages;

    public Book(string title, string author, int pages)
    {
        this.title = title;
        this.author = author;
        this.pages = pages;
    }

    public string Describe() => title + " by " + author + " (" + pages + " pages)";

    public bool IsLong() => pages >= 300;

    public int ReadingDays(int pagesPerDay) => (pages + pagesPerDay - 1) / pagesPerDay;
}`,
          `        var hobbit = new Book("The Hobbit", "J.R.R. Tolkien", 310);
        Console.WriteLine(hobbit.Describe());
        Console.WriteLine(hobbit.IsLong());
        Console.WriteLine(hobbit.ReadingDays(40));

        var poems = new Book("Poems", "Ann", 80);
        Console.WriteLine(poems.Describe());
        Console.WriteLine(poems.IsLong());
        Console.WriteLine(poems.ReadingDays(40));
        Console.WriteLine(poems.ReadingDays(100));`,
        ),
        expectedOutput: "The Hobbit by J.R.R. Tolkien (310 pages)\nTrue\n8\nPoems by Ann (80 pages)\nFalse\n2\n1\n",
      },
      { kind: "lecture", slug: "properties", title: { en: "Properties and encapsulation", uk: "Властивості та інкапсуляція" } },
      {
        kind: "practice",
        slug: "short-syntax",
        title: { en: "Shorthand syntax", uk: "Скорочений синтаксис" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Rewrite this class with auto-properties and expression-bodied members
class Person
{
    private string name;
    private int birthYear;

    public Person(string name, int birthYear)
    {
        this.name = name;
        this.birthYear = birthYear;
    }

    public string GetName()
    {
        return name;
    }

    public void SetName(string value)
    {
        name = value;
    }

    public int GetBirthYear()
    {
        return birthYear;
    }

    public string GetGreeting()
    {
        return "Hello, " + name + "!";
    }

    public int GetAgeIn(int year)
    {
        return year - birthYear;
    }
}`,
          `        var p = new Person { Name = "Ann", BirthYear = 1990 };
        Console.WriteLine(p.Greeting);
        Console.WriteLine(p.AgeIn(2026));
        p.Name = "Anna";
        Console.WriteLine(p.Greeting);

        var q = new Person { Name = "Bo" };
        Console.WriteLine(q.BirthYear);
        Console.WriteLine(q.AgeIn(2000));`,
        ),
        solution: PROGRAM_WITH(
          `class Person
{
    public string Name { get; set; }
    public int BirthYear { get; set; }

    public string Greeting => "Hello, " + Name + "!";

    public int AgeIn(int year) => year - BirthYear;
}`,
          `        var p = new Person { Name = "Ann", BirthYear = 1990 };
        Console.WriteLine(p.Greeting);
        Console.WriteLine(p.AgeIn(2026));
        p.Name = "Anna";
        Console.WriteLine(p.Greeting);

        var q = new Person { Name = "Bo" };
        Console.WriteLine(q.BirthYear);
        Console.WriteLine(q.AgeIn(2000));`,
        ),
        expectedOutput: "Hello, Ann!\n36\nHello, Anna!\n0\n2000\n",
      },
      { kind: "lecture", slug: "static-vs-instance", title: { en: "Static and instance members", uk: "Статичне й динамічне" } },
      {
        kind: "quiz",
        slug: "class-fields-quiz",
        title: { en: "Class fields", uk: "Поля класів" },
        questions: [
          {
            id: "default-value",
            mode: "single",
            prompt: {
              en: "What is the value of an `int` field of a class that was never assigned?",
              uk: "Чому дорівнює поле `int` класу, якому ніколи не присвоювали значення?",
            },
            options: [
              { id: "a", text: { en: "0", uk: "0" } },
              { id: "b", text: { en: "`null`", uk: "`null`" } },
              { id: "c", text: { en: "It does not compile until it is assigned", uk: "Не компілюється, доки його не присвоєно" } },
              { id: "d", text: { en: "An undefined value", uk: "Невизначене значення" } },
            ],
            correct: ["a"],
          },
          {
            id: "readonly",
            mode: "single",
            prompt: {
              en: "What does the `readonly` modifier on a field mean?",
              uk: "Що означає модифікатор `readonly` для поля?",
            },
            options: [
              { id: "a", text: { en: "It can be assigned only in its declaration or in a constructor", uk: "Йому можна присвоювати лише в оголошенні або в конструкторі" } },
              { id: "b", text: { en: "It can only be read from outside the class, and never inside it", uk: "Його можна читати лише ззовні класу й ніколи всередині" } },
              { id: "c", text: { en: "It is stored on disk", uk: "Воно зберігається на диску" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "class-methods", title: { en: "Methods of a class", uk: "Методи класу" } },
      {
        kind: "quiz",
        slug: "class-methods-quiz",
        title: { en: "Class methods", uk: "Методи класів" },
        questions: [
          {
            id: "this",
            mode: "single",
            prompt: { en: "What does `this` mean inside an instance method?", uk: "Що означає `this` усередині методу екземпляра?" },
            options: [
              { id: "a", text: { en: "The object on which the method was called", uk: "Об'єкт, на якому викликали метод" } },
              { id: "b", text: { en: "The class itself", uk: "Сам клас" } },
              { id: "c", text: { en: "The previous object that was created", uk: "Попередній створений об'єкт" } },
            ],
            correct: ["a"],
          },
          {
            id: "call-instance",
            mode: "single",
            prompt: {
              en: "`Describe()` is an instance method of `Book`, and `b` is a `Book`. Which call is correct?",
              uk: "`Describe()` — метод екземпляра `Book`, а `b` — це `Book`. Який виклик правильний?",
            },
            options: [
              { id: "a", text: { en: "`b.Describe()`", uk: "`b.Describe()`" } },
              { id: "b", text: { en: "`Book.Describe()`", uk: "`Book.Describe()`" } },
              { id: "c", text: { en: "`Describe(b)`", uk: "`Describe(b)`" } },
            ],
            correct: ["a"],
          },
          {
            id: "overload",
            mode: "single",
            prompt: {
              en: "Can a class have two methods with the same name?",
              uk: "Чи може клас мати два методи з однаковою назвою?",
            },
            options: [
              { id: "a", text: { en: "Yes, if their parameter lists differ (overloading)", uk: "Так, якщо їхні списки параметрів різні (перевантаження)" } },
              { id: "b", text: { en: "Yes, if their return types differ", uk: "Так, якщо різні їхні типи значення, що повертається" } },
              { id: "c", text: { en: "No, never", uk: "Ні, ніколи" } },
            ],
            correct: ["a"],
          },
          {
            id: "constructor",
            mode: "single",
            prompt: { en: "What is true about a constructor?", uk: "Що правильно про конструктор?" },
            options: [
              { id: "a", text: { en: "It has the name of the class and no return type", uk: "Він має назву класу й не має типу значення, що повертається" } },
              { id: "b", text: { en: "It always returns `void`", uk: "Він завжди повертає `void`" } },
              { id: "c", text: { en: "It must be called `Constructor`", uk: "Він має називатися `Constructor`" } },
            ],
            correct: ["a"],
          },
          {
            id: "no-default-ctor",
            mode: "single",
            prompt: {
              en: "A class `Book` has only the constructor `Book(string title)`. What happens with `new Book()`?",
              uk: "Клас `Book` має лише конструктор `Book(string title)`. Що станеться з `new Book()`?",
            },
            options: [
              { id: "a", text: { en: "A compile error: there is no constructor without parameters", uk: "Помилка компіляції: конструктора без параметрів немає" } },
              { id: "b", text: { en: "A book with `title` equal to `null` is created", uk: "Створюється книжка з `title`, що дорівнює `null`" } },
              { id: "c", text: { en: "An exception is thrown at run time", uk: "Під час виконання кидається виняток" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "quiz",
        slug: "oop-memory-maps",
        title: { en: "Memory maps", uk: "Карти пам'яті" },
        questions: [
          {
            id: "class-alias",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nclass P { public int X; }\n\nvar a = new P { X = 1 };\nvar b = a;\nb.X = 5;\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nclass P { public int X; }\n\nvar a = new P { X = 1 };\nvar b = a;\nb.X = 5;\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "0", uk: "0" } },
            ],
            correct: ["b"],
          },
          {
            id: "struct-copy",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nstruct S { public int X; }\n\nvar s1 = new S { X = 1 };\nvar s2 = s1;\ns2.X = 5;\nConsole.WriteLine(s1.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstruct S { public int X; }\n\nvar s1 = new S { X = 1 };\nvar s2 = s1;\ns2.X = 5;\nConsole.WriteLine(s1.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1: a struct is copied on assignment", uk: "1: структура копіюється під час присвоєння" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "modify-through-parameter",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nstatic void Change(P p) { p.X = 9; }\n\nvar a = new P { X = 1 };\nChange(a);\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstatic void Change(P p) { p.X = 9; }\n\nvar a = new P { X = 1 };\nChange(a);\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "9: the method received a reference to the same object", uk: "9: метод отримав посилання на той самий об'єкт" } },
              { id: "c", text: { en: "0", uk: "0" } },
            ],
            correct: ["b"],
          },
          {
            id: "reassign-parameter",
            mode: "single",
            prompt: {
              en: "What does this code print?\n\n```csharp\nstatic void Replace(P p) { p = new P { X = 9 }; }\n\nvar a = new P { X = 1 };\nReplace(a);\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstatic void Replace(P p) { p = new P { X = 9 }; }\n\nvar a = new P { X = 1 };\nReplace(a);\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1: only the method's own copy of the reference was changed", uk: "1: змінено лише власну копію посилання в методі" } },
              { id: "b", text: { en: "9", uk: "9" } },
              { id: "c", text: { en: "0", uk: "0" } },
            ],
            correct: ["a"],
          },
          {
            id: "equality",
            mode: "single",
            prompt: {
              en: "For this class, what does the following print?\n\n```csharp\nclass P { public int X; }\n\nConsole.WriteLine(new P { X = 1 } == new P { X = 1 });\n```",
              uk: "Для цього класу що друкує наведений код?\n\n```csharp\nclass P { public int X; }\n\nConsole.WriteLine(new P { X = 1 } == new P { X = 1 });\n```",
            },
            options: [
              { id: "a", text: { en: "True, because the fields are equal", uk: "True, бо поля рівні" } },
              { id: "b", text: { en: "False, because these are two different objects", uk: "False, бо це два різні об'єкти" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "null-reference",
            mode: "single",
            prompt: {
              en: "What happens here?\n\n```csharp\nP p = null;\nConsole.WriteLine(p.X);\n```",
              uk: "Що станеться тут?\n\n```csharp\nP p = null;\nConsole.WriteLine(p.X);\n```",
            },
            options: [
              { id: "a", text: { en: "It prints 0", uk: "Друкується 0" } },
              { id: "b", text: { en: "A `NullReferenceException` is thrown", uk: "Кидається `NullReferenceException`" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["b"],
          },
        ],
      },
      { kind: "lecture", slug: "extension-methods", title: { en: "Extension methods", uk: "Методи розширення" } },
      {
        kind: "practice",
        slug: "creating-extension-methods",
        title: { en: "Creating extension methods", uk: "Створення методів розширення" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Write the static classes with the extension methods here`,
          `        Console.WriteLine("Level".IsPalindrome());
        Console.WriteLine("hello".IsPalindrome());
        Console.WriteLine("".IsPalindrome());
        Console.WriteLine("  many   spaces here ".WordCount());
        Console.WriteLine("Hello, World!".Truncate(8));
        Console.WriteLine("short".Truncate(10));
        Console.WriteLine("abcdef".Truncate(3));
        Console.WriteLine(new[] { 3, 1, 2 }.Total());
        Console.WriteLine(new[] { 1, 2, 3 }.IsSorted());
        Console.WriteLine(new[] { 1, 3, 2 }.IsSorted());
        Console.WriteLine(new int[0].IsSorted());
        Console.WriteLine(7.IsEven());
        Console.WriteLine(10.IsEven());`,
        ),
        solution: PROGRAM_WITH(
          `static class StringExtensions
{
    public static bool IsPalindrome(this string s)
    {
        string lower = s.ToLower();
        for (int i = 0; i < lower.Length / 2; i++)
        {
            if (lower[i] != lower[lower.Length - 1 - i])
            {
                return false;
            }
        }
        return true;
    }

    public static int WordCount(this string s)
    {
        return s.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    public static string Truncate(this string s, int maxLength)
    {
        if (s.Length <= maxLength)
        {
            return s;
        }
        return s.Substring(0, maxLength - 3) + "...";
    }
}

static class ArrayExtensions
{
    public static int Total(this int[] a)
    {
        int total = 0;
        foreach (int x in a)
        {
            total += x;
        }
        return total;
    }

    public static bool IsSorted(this int[] a)
    {
        for (int i = 1; i < a.Length; i++)
        {
            if (a[i - 1] > a[i])
            {
                return false;
            }
        }
        return true;
    }
}

static class IntExtensions
{
    public static bool IsEven(this int n)
    {
        return n % 2 == 0;
    }
}`,
          `        Console.WriteLine("Level".IsPalindrome());
        Console.WriteLine("hello".IsPalindrome());
        Console.WriteLine("".IsPalindrome());
        Console.WriteLine("  many   spaces here ".WordCount());
        Console.WriteLine("Hello, World!".Truncate(8));
        Console.WriteLine("short".Truncate(10));
        Console.WriteLine("abcdef".Truncate(3));
        Console.WriteLine(new[] { 3, 1, 2 }.Total());
        Console.WriteLine(new[] { 1, 2, 3 }.IsSorted());
        Console.WriteLine(new[] { 1, 3, 2 }.IsSorted());
        Console.WriteLine(new int[0].IsSorted());
        Console.WriteLine(7.IsEven());
        Console.WriteLine(10.IsEven());`,
        ),
        expectedOutput: "True\nFalse\nTrue\n3\nHello...\nshort\n...\n6\nTrue\nFalse\nTrue\nFalse\nTrue\n",
      },
      { kind: "lecture", slug: "directoryinfo-fileinfo", title: { en: "DirectoryInfo and FileInfo", uk: "DirectoryInfo, FileInfo" } },
      {
        kind: "practice",
        slug: "directory-listing",
        title: { en: "Directory listing", uk: "Список директорій" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class VFile
{
    public string Name;
    public long Size;

    public VFile(string name, long size)
    {
        Name = name;
        Size = size;
    }
}

class VDirectory
{
    public string Name;
    public List<VFile> Files = new List<VFile>();
    public List<VDirectory> Directories = new List<VDirectory>();

    public VDirectory(string name)
    {
        Name = name;
    }
}`,
          `        var root = new VDirectory("project");
        root.Files.Add(new VFile("readme.txt", 120));
        root.Files.Add(new VFile("app.exe", 5000));

        var docs = new VDirectory("docs");
        docs.Files.Add(new VFile("guide.txt", 800));
        docs.Files.Add(new VFile("logo.png", 2400));
        var old = new VDirectory("old");
        old.Files.Add(new VFile("notes.txt", 300));
        docs.Directories.Add(old);

        var src = new VDirectory("src");
        src.Files.Add(new VFile("main.cs", 1500));
        src.Files.Add(new VFile("util.cs", 900));

        root.Directories.Add(docs);
        root.Directories.Add(src);
        root.Directories.Add(new VDirectory("empty"));

        Print(root, 0);
        Console.WriteLine("Total: " + TotalSize(root));
        Console.WriteLine("Files: " + CountFiles(root));
        foreach (string ext in new[] { ".txt", ".cs", ".zip" })
        {
            Console.WriteLine(ext + ": " + string.Join(" ", FindByExtension(root, ext)));
        }
        VFile biggest = Largest(root);
        Console.WriteLine("Largest: " + biggest.Name + " (" + biggest.Size + ")");`,
          "using System.Collections.Generic;",
          `    // The folder name with a "/", its files as "name (size)", then its sub-folders,
    // each level indented by two more spaces
    static void Print(VDirectory dir, int level)
    {
        // Write your code here
    }

    // The total size of all the files in the folder and below
    static long TotalSize(VDirectory dir)
    {
        // Write your code here
        return 0;
    }

    // The number of files in the whole tree
    static int CountFiles(VDirectory dir)
    {
        // Write your code here
        return 0;
    }

    // The relative paths (such as docs/old/notes.txt) of the files with this extension
    static List<string> FindByExtension(VDirectory dir, string extension)
    {
        // Write your code here
        return new List<string>();
    }

    // The file with the biggest size in the whole tree
    static VFile Largest(VDirectory dir)
    {
        // Write your code here
        return null;
    }`,
        ),
        solution: PROGRAM_WITH(
          `class VFile
{
    public string Name;
    public long Size;

    public VFile(string name, long size)
    {
        Name = name;
        Size = size;
    }
}

class VDirectory
{
    public string Name;
    public List<VFile> Files = new List<VFile>();
    public List<VDirectory> Directories = new List<VDirectory>();

    public VDirectory(string name)
    {
        Name = name;
    }
}`,
          `        var root = new VDirectory("project");
        root.Files.Add(new VFile("readme.txt", 120));
        root.Files.Add(new VFile("app.exe", 5000));

        var docs = new VDirectory("docs");
        docs.Files.Add(new VFile("guide.txt", 800));
        docs.Files.Add(new VFile("logo.png", 2400));
        var old = new VDirectory("old");
        old.Files.Add(new VFile("notes.txt", 300));
        docs.Directories.Add(old);

        var src = new VDirectory("src");
        src.Files.Add(new VFile("main.cs", 1500));
        src.Files.Add(new VFile("util.cs", 900));

        root.Directories.Add(docs);
        root.Directories.Add(src);
        root.Directories.Add(new VDirectory("empty"));

        Print(root, 0);
        Console.WriteLine("Total: " + TotalSize(root));
        Console.WriteLine("Files: " + CountFiles(root));
        foreach (string ext in new[] { ".txt", ".cs", ".zip" })
        {
            Console.WriteLine(ext + ": " + string.Join(" ", FindByExtension(root, ext)));
        }
        VFile biggest = Largest(root);
        Console.WriteLine("Largest: " + biggest.Name + " (" + biggest.Size + ")");`,
          "using System.Collections.Generic;",
          `    // The folder name with a "/", its files as "name (size)", then its sub-folders,
    // each level indented by two more spaces
    static void Print(VDirectory dir, int level)
    {
        string pad = new string(' ', level * 2);
        Console.WriteLine(pad + dir.Name + "/");
        foreach (VFile file in dir.Files)
        {
            Console.WriteLine(pad + "  " + file.Name + " (" + file.Size + ")");
        }
        foreach (VDirectory sub in dir.Directories)
        {
            Print(sub, level + 1);
        }
    }

    // The total size of all the files in the folder and below
    static long TotalSize(VDirectory dir)
    {
        long total = 0;
        foreach (VFile file in dir.Files)
        {
            total += file.Size;
        }
        foreach (VDirectory sub in dir.Directories)
        {
            total += TotalSize(sub);
        }
        return total;
    }

    // The number of files in the whole tree
    static int CountFiles(VDirectory dir)
    {
        int count = dir.Files.Count;
        foreach (VDirectory sub in dir.Directories)
        {
            count += CountFiles(sub);
        }
        return count;
    }

    // The relative paths (such as docs/old/notes.txt) of the files with this extension
    static List<string> FindByExtension(VDirectory dir, string extension)
    {
        var result = new List<string>();
        Collect(dir, "", extension, result);
        return result;
    }

    static void Collect(VDirectory dir, string prefix, string extension, List<string> result)
    {
        foreach (VFile file in dir.Files)
        {
            if (file.Name.EndsWith(extension, StringComparison.Ordinal))
            {
                result.Add(prefix + file.Name);
            }
        }
        foreach (VDirectory sub in dir.Directories)
        {
            Collect(sub, prefix + sub.Name + "/", extension, result);
        }
    }

    // The file with the biggest size in the whole tree
    static VFile Largest(VDirectory dir)
    {
        VFile best = null;
        foreach (VFile file in dir.Files)
        {
            if (best == null || file.Size > best.Size)
            {
                best = file;
            }
        }
        foreach (VDirectory sub in dir.Directories)
        {
            VFile candidate = Largest(sub);
            if (candidate != null && (best == null || candidate.Size > best.Size))
            {
                best = candidate;
            }
        }
        return best;
    }`,
        ),
        expectedOutput:
          "project/\n  readme.txt (120)\n  app.exe (5000)\n  docs/\n    guide.txt (800)\n    logo.png (2400)\n    old/\n      notes.txt (300)\n  src/\n    main.cs (1500)\n    util.cs (900)\n  empty/\nTotal: 11020\nFiles: 7\n.txt: readme.txt docs/guide.txt docs/old/notes.txt\n.cs: src/main.cs src/util.cs\n.zip: \nLargest: app.exe (5000)\n",
      },
      { kind: "lecture", slug: "static-classes", title: { en: "Static classes", uk: "Статичні класи" } },
      {
        kind: "practice",
        slug: "refactor-static-class",
        title: { en: "Refactoring a static class", uk: "Рефакторинг статичного класу" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// The balance is passed from call to call. Move this logic into a class Account.
static class BankMath
{
    public static decimal Deposit(decimal balance, decimal amount)
    {
        return balance + amount;
    }

    public static decimal Withdraw(decimal balance, decimal amount)
    {
        return balance - amount;
    }
}`,
          `        var acc = new Account("Ann", 100m);
        acc.Deposit(50m);
        Console.WriteLine(acc.Withdraw(30m));
        Console.WriteLine(acc.Balance);
        Console.WriteLine(acc.Withdraw(500m));
        Console.WriteLine(acc.Deposit(-5m));
        Console.WriteLine(acc);

        var other = new Account("Bo", 0m);
        other.Deposit(10m);
        Console.WriteLine(other + " / " + acc);`,
        ),
        solution: PROGRAM_WITH(
          `class Account
{
    private readonly string owner;

    public decimal Balance { get; private set; }

    public Account(string owner, decimal balance)
    {
        this.owner = owner;
        Balance = balance;
    }

    public bool Deposit(decimal amount)
    {
        if (amount <= 0)
        {
            return false;
        }
        Balance += amount;
        return true;
    }

    public bool Withdraw(decimal amount)
    {
        if (amount <= 0 || amount > Balance)
        {
            return false;
        }
        Balance -= amount;
        return true;
    }

    public override string ToString()
    {
        return owner + ": " + Balance;
    }
}`,
          `        var acc = new Account("Ann", 100m);
        acc.Deposit(50m);
        Console.WriteLine(acc.Withdraw(30m));
        Console.WriteLine(acc.Balance);
        Console.WriteLine(acc.Withdraw(500m));
        Console.WriteLine(acc.Deposit(-5m));
        Console.WriteLine(acc);

        var other = new Account("Bo", 0m);
        other.Deposit(10m);
        Console.WriteLine(other + " / " + acc);`,
        ),
        expectedOutput: "True\n120\nFalse\nFalse\nAnn: 120\nBo: 10 / Ann: 120\n",
      },
      {
        kind: "quiz",
        slug: "oop-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "encapsulation",
            mode: "single",
            prompt: { en: "What is encapsulation?", uk: "Що таке інкапсуляція?" },
            options: [
              { id: "a", text: { en: "Hiding the internal data of a class, and offering safe operations on it", uk: "Приховування внутрішніх даних класу й надання безпечних операцій над ними" } },
              { id: "b", text: { en: "Making every member `static`", uk: "Робити кожен член `static`" } },
              { id: "c", text: { en: "Copying an object", uk: "Копіювання об'єкта" } },
            ],
            correct: ["a"],
          },
          {
            id: "private",
            mode: "single",
            prompt: {
              en: "Which access modifier allows a member to be used only inside its own class?",
              uk: "Який модифікатор доступу дозволяє використовувати член лише всередині його власного класу?",
            },
            options: [
              { id: "a", text: { en: "`public`", uk: "`public`" } },
              { id: "b", text: { en: "`private`", uk: "`private`" } },
              { id: "c", text: { en: "`static`", uk: "`static`" } },
            ],
            correct: ["b"],
          },
          {
            id: "property-vs-field",
            mode: "single",
            prompt: {
              en: "Why is a public property better than a public field?",
              uk: "Чим публічна властивість краща за публічне поле?",
            },
            options: [
              { id: "a", text: { en: "The class can validate and control access, and change its internals later without breaking callers", uk: "Клас може перевіряти й контролювати доступ та пізніше змінювати внутрішній устрій, не ламаючи тих, хто викликає" } },
              { id: "b", text: { en: "A property uses no memory", uk: "Властивість не використовує пам'яті" } },
              { id: "c", text: { en: "Fields cannot be public", uk: "Поля не можуть бути публічними" } },
            ],
            correct: ["a"],
          },
          {
            id: "static-member",
            mode: "single",
            prompt: { en: "A `static` member belongs to...", uk: "Член із `static` належить..." },
            options: [
              { id: "a", text: { en: "each object separately", uk: "кожному об'єкту окремо" } },
              { id: "b", text: { en: "the class itself, once for all objects", uk: "самому класу, один раз для всіх об'єктів" } },
              { id: "c", text: { en: "the `Main` method only", uk: "лише методу `Main`" } },
            ],
            correct: ["b"],
          },
          {
            id: "extension-requirements",
            mode: "multi",
            prompt: { en: "What is required of an extension method?", uk: "Що потрібно для методу розширення?" },
            options: [
              { id: "a", text: { en: "It is a `static` method", uk: "Це метод `static`" } },
              { id: "b", text: { en: "It is declared in a non-nested `static` class", uk: "Він оголошений у невкладеному `static` класі" } },
              { id: "c", text: { en: "Its first parameter has the modifier `this`", uk: "Його перший параметр має модифікатор `this`" } },
              { id: "d", text: { en: "It must be in the same class as the type it extends", uk: "Він має бути в тому самому класі, що й тип, який розширює" } },
            ],
            correct: ["a", "b", "c"],
          },
          {
            id: "static-class",
            mode: "single",
            prompt: { en: "What can you do with a `static class`?", uk: "Що можна робити зі `static class`?" },
            options: [
              { id: "a", text: { en: "Call its static members through the class name; you cannot create objects of it", uk: "Викликати його статичні члени через назву класу; створювати його об'єкти не можна" } },
              { id: "b", text: { en: "Create objects with `new`", uk: "Створювати об'єкти через `new`" } },
              { id: "c", text: { en: "Inherit from it", uk: "Успадковувати від нього" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "vector",
        title: { en: "Practice: Vector", uk: "Практика «Вектор»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Write the class Vector here`,
          `        var v = new Vector(3, 4);
        var w = new Vector(1, -2);
        Console.WriteLine(v);
        Console.WriteLine(v.Length);
        Console.WriteLine(v + w);
        Console.WriteLine(v * 2);
        Console.WriteLine(v.Dot(w));
        Console.WriteLine(v.Normalized());
        Console.WriteLine(Vector.Zero);
        Console.WriteLine(v - w);`,
        ),
        solution: PROGRAM_WITH(
          `class Vector
{
    public double X { get; }
    public double Y { get; }

    public Vector(double x, double y)
    {
        X = x;
        Y = y;
    }

    public static Vector Zero => new Vector(0, 0);

    public double Length => Math.Sqrt(X * X + Y * Y);

    public double Dot(Vector other) => X * other.X + Y * other.Y;

    public Vector Normalized() => new Vector(X / Length, Y / Length);

    public static Vector operator +(Vector a, Vector b) => new Vector(a.X + b.X, a.Y + b.Y);

    public static Vector operator -(Vector a, Vector b) => new Vector(a.X - b.X, a.Y - b.Y);

    public static Vector operator *(Vector v, double k) => new Vector(v.X * k, v.Y * k);

    public override string ToString() => "(" + X + ", " + Y + ")";
}`,
          `        var v = new Vector(3, 4);
        var w = new Vector(1, -2);
        Console.WriteLine(v);
        Console.WriteLine(v.Length);
        Console.WriteLine(v + w);
        Console.WriteLine(v * 2);
        Console.WriteLine(v.Dot(w));
        Console.WriteLine(v.Normalized());
        Console.WriteLine(Vector.Zero);
        Console.WriteLine(v - w);`,
        ),
        expectedOutput: "(3, 4)\n5\n(4, 2)\n(6, 8)\n-5\n(0.6, 0.8)\n(0, 0)\n(2, 6)\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "segment",
        title: { en: "Practice: Segment", uk: "Практика «Відрізок»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class Point
{
    public double X { get; }
    public double Y { get; }

    public Point(double x, double y)
    {
        X = x;
        Y = y;
    }

    public override string ToString() => "(" + X + ", " + Y + ")";
}

// Write the class Segment here`,
          `        var s = new Segment(new Point(0, 0), new Point(6, 8));
        Console.WriteLine(s.Length);
        Console.WriteLine(s.Midpoint());
        Console.WriteLine(s.Contains(new Point(3, 4)));
        Console.WriteLine(s.Contains(new Point(3, 5)));
        Console.WriteLine(s.Contains(new Point(9, 12)));
        Console.WriteLine(s.Contains(new Point(0, 0)));

        var t = s.Translate(1, 1);
        Console.WriteLine(t.Midpoint());
        Console.WriteLine(s.Midpoint());

        Console.WriteLine(new Segment(new Point(1, 2), new Point(5, 2)).IsHorizontal);
        Console.WriteLine(s.IsHorizontal);`,
        ),
        solution: PROGRAM_WITH(
          `class Point
{
    public double X { get; }
    public double Y { get; }

    public Point(double x, double y)
    {
        X = x;
        Y = y;
    }

    public override string ToString() => "(" + X + ", " + Y + ")";
}

class Segment
{
    private readonly Point a;
    private readonly Point b;

    public Segment(Point a, Point b)
    {
        this.a = a;
        this.b = b;
    }

    public double Length
    {
        get
        {
            double dx = b.X - a.X;
            double dy = b.Y - a.Y;
            return Math.Sqrt(dx * dx + dy * dy);
        }
    }

    public bool IsHorizontal => a.Y == b.Y;

    public Point Midpoint() => new Point((a.X + b.X) / 2, (a.Y + b.Y) / 2);

    public bool Contains(Point p)
    {
        double cross = (b.X - a.X) * (p.Y - a.Y) - (b.Y - a.Y) * (p.X - a.X);
        if (Math.Abs(cross) > 1e-9)
        {
            return false;
        }
        bool insideX = p.X >= Math.Min(a.X, b.X) - 1e-9 && p.X <= Math.Max(a.X, b.X) + 1e-9;
        bool insideY = p.Y >= Math.Min(a.Y, b.Y) - 1e-9 && p.Y <= Math.Max(a.Y, b.Y) + 1e-9;
        return insideX && insideY;
    }

    public Segment Translate(double dx, double dy)
    {
        return new Segment(new Point(a.X + dx, a.Y + dy), new Point(b.X + dx, b.Y + dy));
    }
}`,
          `        var s = new Segment(new Point(0, 0), new Point(6, 8));
        Console.WriteLine(s.Length);
        Console.WriteLine(s.Midpoint());
        Console.WriteLine(s.Contains(new Point(3, 4)));
        Console.WriteLine(s.Contains(new Point(3, 5)));
        Console.WriteLine(s.Contains(new Point(9, 12)));
        Console.WriteLine(s.Contains(new Point(0, 0)));

        var t = s.Translate(1, 1);
        Console.WriteLine(t.Midpoint());
        Console.WriteLine(s.Midpoint());

        Console.WriteLine(new Segment(new Point(1, 2), new Point(5, 2)).IsHorizontal);
        Console.WriteLine(s.IsHorizontal);`,
        ),
        expectedOutput: "10\n(3, 4)\nTrue\nFalse\nFalse\nTrue\n(4, 5)\n(3, 4)\nTrue\nFalse\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "non-static-methods",
        title: { en: "Practice: Non-static methods", uk: "Практика «Нестатичні методи»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Turn the static operations into instance methods: Plus, Times, IsLessThan,
// and add the property Value and ToString(). Then remove the static methods.
class Fraction
{
    public int Numerator { get; }
    public int Denominator { get; }

    public Fraction(int numerator, int denominator)
    {
        if (denominator < 0)
        {
            numerator = -numerator;
            denominator = -denominator;
        }
        int g = Gcd(Math.Abs(numerator), denominator);
        Numerator = numerator / g;
        Denominator = denominator / g;
    }

    static int Gcd(int a, int b)
    {
        return b == 0 ? a : Gcd(b, a % b);
    }

    public static Fraction Add(Fraction a, Fraction b)
    {
        return new Fraction(a.Numerator * b.Denominator + b.Numerator * a.Denominator, a.Denominator * b.Denominator);
    }

    public static Fraction Multiply(Fraction a, Fraction b)
    {
        return new Fraction(a.Numerator * b.Numerator, a.Denominator * b.Denominator);
    }
}`,
          `        var a = new Fraction(1, 2);
        var b = new Fraction(1, 3);
        Console.WriteLine(a.Plus(b));
        Console.WriteLine(a.Times(b));
        Console.WriteLine(new Fraction(2, 4));
        Console.WriteLine(new Fraction(3, -6));
        Console.WriteLine(a.Plus(a));
        Console.WriteLine(a.IsLessThan(b));
        Console.WriteLine(b.IsLessThan(a));
        Console.WriteLine(new Fraction(3, 4).Value);`,
        ),
        solution: PROGRAM_WITH(
          `class Fraction
{
    public int Numerator { get; }
    public int Denominator { get; }

    public Fraction(int numerator, int denominator)
    {
        if (denominator < 0)
        {
            numerator = -numerator;
            denominator = -denominator;
        }
        int g = Gcd(Math.Abs(numerator), denominator);
        Numerator = numerator / g;
        Denominator = denominator / g;
    }

    static int Gcd(int a, int b)
    {
        return b == 0 ? a : Gcd(b, a % b);
    }

    public Fraction Plus(Fraction other)
    {
        return new Fraction(Numerator * other.Denominator + other.Numerator * Denominator, Denominator * other.Denominator);
    }

    public Fraction Times(Fraction other)
    {
        return new Fraction(Numerator * other.Numerator, Denominator * other.Denominator);
    }

    public bool IsLessThan(Fraction other)
    {
        return Numerator * other.Denominator < other.Numerator * Denominator;
    }

    public double Value => (double)Numerator / Denominator;

    public override string ToString()
    {
        return Denominator == 1 ? Numerator.ToString() : Numerator + "/" + Denominator;
    }
}`,
          `        var a = new Fraction(1, 2);
        var b = new Fraction(1, 3);
        Console.WriteLine(a.Plus(b));
        Console.WriteLine(a.Times(b));
        Console.WriteLine(new Fraction(2, 4));
        Console.WriteLine(new Fraction(3, -6));
        Console.WriteLine(a.Plus(a));
        Console.WriteLine(a.IsLessThan(b));
        Console.WriteLine(b.IsLessThan(a));
        Console.WriteLine(new Fraction(3, 4).Value);`,
        ),
        expectedOutput: "5/6\n1/6\n1/2\n-1/2\n1\nFalse\nTrue\n0.75\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "gray-256",
        title: { en: "Practice: 256 shades", uk: "Практика «256 відтінків»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Write the class GrayImage here`,
          `        var img = new GrayImage(3, 2);
        img.Set(0, 0, 0);
        img.Set(1, 0, 128);
        img.Set(2, 0, 255);
        img.Set(0, 1, 300);
        img.Set(1, 1, -5);
        img.Set(2, 1, 128);
        Console.WriteLine(img.Row(0));
        Console.WriteLine(img.Row(1));

        GrayImage inverted = img.Invert();
        Console.WriteLine(inverted.Row(0));
        Console.WriteLine(img.Row(0));

        int[] h = img.Histogram();
        Console.WriteLine(h[0] + " " + h[128] + " " + h[255] + " " + h.Length);
        Console.WriteLine(Math.Round(img.Average(), 2));`,
        ),
        solution: PROGRAM_WITH(
          `class GrayImage
{
    private readonly int width;
    private readonly int height;
    private readonly int[,] pixels;

    public GrayImage(int width, int height)
    {
        this.width = width;
        this.height = height;
        pixels = new int[height, width];
    }

    public void Set(int x, int y, int value)
    {
        pixels[y, x] = Math.Max(0, Math.Min(255, value));
    }

    public int Get(int x, int y)
    {
        return pixels[y, x];
    }

    public string Row(int y)
    {
        string text = "";
        for (int x = 0; x < width; x++)
        {
            if (x > 0) text += " ";
            text += pixels[y, x];
        }
        return text;
    }

    public GrayImage Invert()
    {
        var result = new GrayImage(width, height);
        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                result.pixels[y, x] = 255 - pixels[y, x];
            }
        }
        return result;
    }

    public int[] Histogram()
    {
        int[] counts = new int[256];
        foreach (int pixel in pixels)
        {
            counts[pixel]++;
        }
        return counts;
    }

    public double Average()
    {
        double sum = 0;
        foreach (int pixel in pixels)
        {
            sum += pixel;
        }
        return sum / pixels.Length;
    }
}`,
          `        var img = new GrayImage(3, 2);
        img.Set(0, 0, 0);
        img.Set(1, 0, 128);
        img.Set(2, 0, 255);
        img.Set(0, 1, 300);
        img.Set(1, 1, -5);
        img.Set(2, 1, 128);
        Console.WriteLine(img.Row(0));
        Console.WriteLine(img.Row(1));

        GrayImage inverted = img.Invert();
        Console.WriteLine(inverted.Row(0));
        Console.WriteLine(img.Row(0));

        int[] h = img.Histogram();
        Console.WriteLine(h[0] + " " + h[128] + " " + h[255] + " " + h.Length);
        Console.WriteLine(Math.Round(img.Average(), 2));`,
        ),
        expectedOutput: "0 128 255\n255 0 128\n255 127 0\n0 128 255\n2 2 2 256\n127.67\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "inheritance",
    title: { en: "Inheritance", uk: "Успадкування" },
    slides: [
      { kind: "lecture", slug: "inheritance-problem", title: { en: "The problem", uk: "Постановка проблеми" } },
      { kind: "lecture", slug: "inheritance", title: { en: "Inheritance", uk: "Успадкування" } },
      {
        kind: "quiz",
        slug: "inheritance-quiz",
        title: { en: "Inheritance", uk: "Успадкування" },
        questions: [
          {
            id: "syntax",
            mode: "single",
            prompt: {
              en: "Which declaration makes `Student` a class derived from `Person`?",
              uk: "Яке оголошення робить `Student` класом, похідним від `Person`?",
            },
            options: [
              { id: "a", text: { en: "`class Student : Person`", uk: "`class Student : Person`" } },
              { id: "b", text: { en: "`class Student extends Person`", uk: "`class Student extends Person`" } },
              { id: "c", text: { en: "`class Student inherits Person`", uk: "`class Student inherits Person`" } },
              { id: "d", text: { en: "`class Student -> Person`", uk: "`class Student -> Person`" } },
            ],
            correct: ["a"],
          },
          {
            id: "accessible",
            mode: "multi",
            prompt: {
              en: "Which members of the base class can the code of a derived class use directly?",
              uk: "Які члени базового класу може напряму вживати код похідного класу?",
            },
            options: [
              { id: "a", text: { en: "`public` members", uk: "Члени `public`" } },
              { id: "b", text: { en: "`protected` members", uk: "Члени `protected`" } },
              { id: "c", text: { en: "`private` members", uk: "Члени `private`" } },
            ],
            correct: ["a", "b"],
          },
          {
            id: "constructor-order",
            mode: "single",
            prompt: {
              en: "`Student` is derived from `Person`. In which order do the constructors run for `new Student(...)`?",
              uk: "`Student` походить від `Person`. У якому порядку виконуються конструктори для `new Student(...)`?",
            },
            options: [
              { id: "a", text: { en: "First the constructor of `Person`, then the constructor of `Student`", uk: "Спершу конструктор `Person`, потім конструктор `Student`" } },
              { id: "b", text: { en: "First the constructor of `Student`, then the constructor of `Person`", uk: "Спершу конструктор `Student`, потім конструктор `Person`" } },
              { id: "c", text: { en: "Only the constructor of `Student`: constructors are inherited", uk: "Лише конструктор `Student`: конструктори успадковуються" } },
            ],
            correct: ["a"],
          },
          {
            id: "is-a",
            mode: "single",
            prompt: {
              en: "For which pair is inheritance the right design?",
              uk: "Для якої пари успадкування — правильне рішення?",
            },
            options: [
              { id: "a", text: { en: "`Dog` and `Animal`: a dog is an animal", uk: "`Dog` і `Animal`: собака є твариною" } },
              { id: "b", text: { en: "`Car` and `Engine`: a car has an engine", uk: "`Car` і `Engine`: автомобіль має двигун" } },
              { id: "c", text: { en: "`Order` and `Customer`: an order refers to a customer", uk: "`Order` і `Customer`: замовлення посилається на клієнта" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "inheritance-hierarchy", title: { en: "Inheritance hierarchy", uk: "Ієрархія успадкування" } },
      {
        kind: "quiz",
        slug: "casts-quiz",
        title: { en: "Casts", uk: "Приведення типів" },
        questions: [
          {
            id: "implicit-down",
            mode: "single",
            prompt: {
              en: "Here `Student` is derived from `Person`. What happens?\n\n```csharp\nPerson p = new Student();\nStudent s = p;\n```",
              uk: "Тут `Student` походить від `Person`. Що станеться?\n\n```csharp\nPerson p = new Student();\nStudent s = p;\n```",
            },
            options: [
              { id: "a", text: { en: "A compile error: a cast down must be written explicitly", uk: "Помилка компіляції: приведення вниз треба писати явно" } },
              { id: "b", text: { en: "It works", uk: "Це працює" } },
              { id: "c", text: { en: "An `InvalidCastException` at run time", uk: "`InvalidCastException` під час виконання" } },
            ],
            correct: ["a"],
          },
          {
            id: "wrong-cast",
            mode: "single",
            prompt: {
              en: "What happens here?\n\n```csharp\nPerson p = new Person();\nStudent s = (Student)p;\n```",
              uk: "Що станеться тут?\n\n```csharp\nPerson p = new Person();\nStudent s = (Student)p;\n```",
            },
            options: [
              { id: "a", text: { en: "An `InvalidCastException` at run time: the object is not a `Student`", uk: "`InvalidCastException` під час виконання: об'єкт не є `Student`" } },
              { id: "b", text: { en: "A compile error", uk: "Помилка компіляції" } },
              { id: "c", text: { en: "`s` becomes `null`", uk: "`s` стає `null`" } },
            ],
            correct: ["a"],
          },
          {
            id: "is-derived",
            mode: "single",
            prompt: {
              en: "`Graduate` is derived from `Student`, and `Student` from `Person`. What does this print?\n\n```csharp\nPerson p = new Graduate();\nConsole.WriteLine(p is Student);\n```",
              uk: "`Graduate` походить від `Student`, а `Student` — від `Person`. Що друкує цей код?\n\n```csharp\nPerson p = new Graduate();\nConsole.WriteLine(p is Student);\n```",
            },
            options: [
              { id: "a", text: { en: "True", uk: "True" } },
              { id: "b", text: { en: "False", uk: "False" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "as-null",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nPerson p = new Person();\nStudent s = p as Student;\nConsole.WriteLine(s == null);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nPerson p = new Person();\nStudent s = p as Student;\nConsole.WriteLine(s == null);\n```",
            },
            options: [
              { id: "a", text: { en: "True: `as` gives `null` when the cast is impossible", uk: "True: `as` дає `null`, коли приведення неможливе" } },
              { id: "b", text: { en: "False", uk: "False" } },
              { id: "c", text: { en: "An `InvalidCastException` is thrown", uk: "Кидається `InvalidCastException`" } },
            ],
            correct: ["a"],
          },
          {
            id: "get-type",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nPerson p = new Graduate();\nConsole.WriteLine(p.GetType().Name);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nPerson p = new Graduate();\nConsole.WriteLine(p.GetType().Name);\n```",
            },
            options: [
              { id: "a", text: { en: "Person", uk: "Person" } },
              { id: "b", text: { en: "Graduate: `GetType` gives the actual type of the object", uk: "Graduate: `GetType` дає справжній тип об'єкта" } },
              { id: "c", text: { en: "Student", uk: "Student" } },
            ],
            correct: ["b"],
          },
          {
            id: "unbox-wrong",
            mode: "single",
            prompt: {
              en: "What happens here?\n\n```csharp\nobject o = \"text\";\nint n = (int)o;\n```",
              uk: "Що станеться тут?\n\n```csharp\nobject o = \"text\";\nint n = (int)o;\n```",
            },
            options: [
              { id: "a", text: { en: "The text is converted to a number", uk: "Текст перетворюється на число" } },
              { id: "b", text: { en: "An `InvalidCastException` at run time", uk: "`InvalidCastException` під час виконання" } },
              { id: "c", text: { en: "A compile error", uk: "Помилка компіляції" } },
            ],
            correct: ["b"],
          },
          {
            id: "static-type",
            mode: "single",
            prompt: {
              en: "`Student` has a field `Course`, and `Person` does not. What happens here?\n\n```csharp\nPerson p = new Student();\nConsole.WriteLine(p.Course);\n```",
              uk: "`Student` має поле `Course`, а `Person` — ні. Що станеться тут?\n\n```csharp\nPerson p = new Student();\nConsole.WriteLine(p.Course);\n```",
            },
            options: [
              { id: "a", text: { en: "A compile error: the static type `Person` has no `Course`", uk: "Помилка компіляції: у статичного типу `Person` немає `Course`" } },
              { id: "b", text: { en: "It prints the course of the student", uk: "Друкується курс студента" } },
              { id: "c", text: { en: "An exception is thrown at run time", uk: "Під час виконання кидається виняток" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "system-array", title: { en: "The Array class", uk: "Клас Array" } },
      {
        kind: "practice",
        slug: "print-all",
        title: { en: "Print them all!", uk: "Друк для всіх!" },
        language: "csharp",
        starter: PROGRAM(`    // Prints all the elements of any array in one line, as [a, b, c]
    static void PrintAll(Array items)
    {
        // Write your code here
    }

    // How many elements of the array are equal to value
    static int CountOf(Array items, object value)
    {
        // Write your code here
        return 0;
    }

    static void Main()
    {
        PrintAll(new[] { 1, 2, 3 });
        PrintAll(new[] { "a", "b" });
        PrintAll(new[] { 'x', 'y' });
        PrintAll(new[] { true, false });
        PrintAll(new int[0]);
        PrintAll(new int[,] { { 1, 2 }, { 3, 4 } });
        PrintAll(new[] { 1.5, 2 });
        Console.WriteLine(CountOf(new[] { 1, 2, 1, 3 }, 1));
        Console.WriteLine(CountOf(new[] { "a", "b", "a" }, "a"));
        Console.WriteLine(CountOf(new int[,] { { 1, 1 }, { 2, 1 } }, 1));
        Console.WriteLine(CountOf(new[] { 1, 2, 3 }, 5));
    }`),
        solution: PROGRAM(`    // Prints all the elements of any array in one line, as [a, b, c]
    static void PrintAll(Array items)
    {
        string text = "";
        bool first = true;
        foreach (object item in items)
        {
            if (!first)
            {
                text += ", ";
            }
            text += item;
            first = false;
        }
        Console.WriteLine("[" + text + "]");
    }

    // How many elements of the array are equal to value
    static int CountOf(Array items, object value)
    {
        int count = 0;
        foreach (object item in items)
        {
            if (item.Equals(value))
            {
                count++;
            }
        }
        return count;
    }

    static void Main()
    {
        PrintAll(new[] { 1, 2, 3 });
        PrintAll(new[] { "a", "b" });
        PrintAll(new[] { 'x', 'y' });
        PrintAll(new[] { true, false });
        PrintAll(new int[0]);
        PrintAll(new int[,] { { 1, 2 }, { 3, 4 } });
        PrintAll(new[] { 1.5, 2 });
        Console.WriteLine(CountOf(new[] { 1, 2, 1, 3 }, 1));
        Console.WriteLine(CountOf(new[] { "a", "b", "a" }, "a"));
        Console.WriteLine(CountOf(new int[,] { { 1, 1 }, { 2, 1 } }, 1));
        Console.WriteLine(CountOf(new[] { 1, 2, 3 }, 5));
    }`),
        expectedOutput: "[1, 2, 3]\n[a, b]\n[x, y]\n[True, False]\n[]\n[1, 2, 3, 4]\n[1.5, 2]\n2\n2\n3\n0\n",
      },
      {
        kind: "practice",
        slug: "concat-arrays",
        title: { en: "Joining arrays", uk: "Склеювання масивів" },
        language: "csharp",
        starter: PROGRAM(`    static void Show(int[] a)
    {
        Console.WriteLine("[" + string.Join(",", a) + "]");
    }

    // All the elements of a, then all the elements of b
    static int[] Concat(int[] a, int[] b)
    {
        // Write your code here
        return new int[0];
    }

    // count elements of a starting at start (fewer if the array ends earlier)
    static int[] Slice(int[] a, int start, int count)
    {
        // Write your code here
        return new int[0];
    }

    // A new array where value is inserted at the position index
    static int[] Insert(int[] a, int index, int value)
    {
        // Write your code here
        return new int[0];
    }

    static void Main()
    {
        int[] a = { 1, 2, 3 };
        int[] b = { 4, 5 };
        int[] all = Concat(a, b);
        Show(all);
        Show(Concat(a, new int[0]));
        Show(Concat(new int[0], b));
        Show(Slice(all, 1, 3));
        Show(Slice(all, 3, 10));
        Show(Slice(all, 9, 2));
        Show(Insert(a, 1, 9));
        Show(Insert(a, 3, 9));
        Show(Insert(a, 0, 9));
        Show(a);
    }`),
        solution: PROGRAM(`    static void Show(int[] a)
    {
        Console.WriteLine("[" + string.Join(",", a) + "]");
    }

    // All the elements of a, then all the elements of b
    static int[] Concat(int[] a, int[] b)
    {
        int[] result = new int[a.Length + b.Length];
        Array.Copy(a, 0, result, 0, a.Length);
        Array.Copy(b, 0, result, a.Length, b.Length);
        return result;
    }

    // count elements of a starting at start (fewer if the array ends earlier)
    static int[] Slice(int[] a, int start, int count)
    {
        int real = Math.Max(0, Math.Min(count, a.Length - start));
        int[] result = new int[real];
        if (real > 0)
        {
            Array.Copy(a, start, result, 0, real);
        }
        return result;
    }

    // A new array where value is inserted at the position index
    static int[] Insert(int[] a, int index, int value)
    {
        int[] result = new int[a.Length + 1];
        Array.Copy(a, 0, result, 0, index);
        result[index] = value;
        Array.Copy(a, index, result, index + 1, a.Length - index);
        return result;
    }

    static void Main()
    {
        int[] a = { 1, 2, 3 };
        int[] b = { 4, 5 };
        int[] all = Concat(a, b);
        Show(all);
        Show(Concat(a, new int[0]));
        Show(Concat(new int[0], b));
        Show(Slice(all, 1, 3));
        Show(Slice(all, 3, 10));
        Show(Slice(all, 9, 2));
        Show(Insert(a, 1, 9));
        Show(Insert(a, 3, 9));
        Show(Insert(a, 0, 9));
        Show(a);
    }`),
        expectedOutput: "[1,2,3,4,5]\n[1,2,3]\n[4,5]\n[2,3,4]\n[4,5]\n[]\n[1,9,2,3]\n[1,2,3,9]\n[9,1,2,3]\n[1,2,3]\n",
      },
      { kind: "lecture", slug: "interfaces", title: { en: "Interfaces", uk: "Інтерфейси" } },
      {
        kind: "quiz",
        slug: "interfaces-quiz",
        title: { en: "Interfaces", uk: "Інтерфейси" },
        questions: [
          {
            id: "contents",
            mode: "multi",
            prompt: {
              en: "What can the declaration of an interface contain?",
              uk: "Що може містити оголошення інтерфейсу?",
            },
            options: [
              { id: "a", text: { en: "Methods without a body", uk: "Методи без тіла" } },
              { id: "b", text: { en: "Properties without an implementation", uk: "Властивості без реалізації" } },
              { id: "c", text: { en: "Instance fields", uk: "Поля екземпляра" } },
              { id: "d", text: { en: "Constructors", uk: "Конструктори" } },
            ],
            correct: ["a", "b"],
          },
          {
            id: "one-base-many-interfaces",
            mode: "single",
            prompt: {
              en: "How many base classes and how many interfaces can one class have?",
              uk: "Скільки базових класів і скільки інтерфейсів може мати один клас?",
            },
            options: [
              { id: "a", text: { en: "One base class and any number of interfaces", uk: "Один базовий клас і будь-яка кількість інтерфейсів" } },
              { id: "b", text: { en: "Any number of both", uk: "Будь-яка кількість обох" } },
              { id: "c", text: { en: "One base class and one interface", uk: "Один базовий клас і один інтерфейс" } },
            ],
            correct: ["a"],
          },
          {
            id: "missing-member",
            mode: "single",
            prompt: {
              en: "A class `Circle : IShape` does not write the method `Area()` that is declared in `IShape`. What happens?",
              uk: "Клас `Circle : IShape` не пише метод `Area()`, оголошений в `IShape`. Що станеться?",
            },
            options: [
              { id: "a", text: { en: "A compile error", uk: "Помилка компіляції" } },
              { id: "b", text: { en: "`Area()` returns 0", uk: "`Area()` повертає 0" } },
              { id: "c", text: { en: "An exception when `Area()` is called", uk: "Виняток під час виклику `Area()`" } },
            ],
            correct: ["a"],
          },
          {
            id: "new-interface",
            mode: "single",
            prompt: {
              en: "What is wrong with `IShape s = new IShape();`?",
              uk: "Що не так із `IShape s = new IShape();`?",
            },
            options: [
              { id: "a", text: { en: "An interface has no code, so its object cannot be created", uk: "Інтерфейс не має коду, тому його об'єкт не можна створити" } },
              { id: "b", text: { en: "Nothing, it is correct", uk: "Нічого, це правильно" } },
              { id: "c", text: { en: "The variable must be called `shape`", uk: "Змінна має називатися `shape`" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "middle-of-three-again",
        title: { en: "Middle of three again", uk: "Знову середнє з трьох" },
        language: "csharp",
        starter: PROGRAM(`    // The middle one of three comparable values of the same type
    static IComparable Middle(IComparable a, IComparable b, IComparable c)
    {
        // Write your code here
        return a;
    }

    static void Main()
    {
        Console.WriteLine(Middle(3, 1, 2));
        Console.WriteLine(Middle("pear", "apple", "mango"));
        Console.WriteLine(Middle(2.5, 9.0, 1.0));
        Console.WriteLine(Middle(5, 5, 1));
        Console.WriteLine(Middle(7, 7, 7));
        Console.WriteLine(Middle('b', 'c', 'a'));
    }`),
        solution: PROGRAM(`    // The middle one of three comparable values of the same type
    static IComparable Middle(IComparable a, IComparable b, IComparable c)
    {
        if ((a.CompareTo(b) >= 0 && a.CompareTo(c) <= 0) || (a.CompareTo(b) <= 0 && a.CompareTo(c) >= 0))
        {
            return a;
        }
        if ((b.CompareTo(a) >= 0 && b.CompareTo(c) <= 0) || (b.CompareTo(a) <= 0 && b.CompareTo(c) >= 0))
        {
            return b;
        }
        return c;
    }

    static void Main()
    {
        Console.WriteLine(Middle(3, 1, 2));
        Console.WriteLine(Middle("pear", "apple", "mango"));
        Console.WriteLine(Middle(2.5, 9.0, 1.0));
        Console.WriteLine(Middle(5, 5, 1));
        Console.WriteLine(Middle(7, 7, 7));
        Console.WriteLine(Middle('b', 'c', 'a'));
    }`),
        expectedOutput: "2\nmango\n2.5\n5\n7\nb\n",
      },
      {
        kind: "practice",
        slug: "find-minimum",
        title: { en: "Finding the minimum", uk: "Пошук мінімуму" },
        language: "csharp",
        starter: PROGRAM(`    // The smallest element, or null for an empty array
    static IComparable Min(IComparable[] items)
    {
        // Write your code here
        return null;
    }

    // The biggest element, or null for an empty array
    static IComparable Max(IComparable[] items)
    {
        // Write your code here
        return null;
    }

    // The index of the first smallest element, or -1 for an empty array
    static int IndexOfMin(IComparable[] items)
    {
        // Write your code here
        return -1;
    }

    static void Main()
    {
        var numbers = new IComparable[] { 5, 3, 8, 3 };
        Console.WriteLine(Min(numbers));
        Console.WriteLine(Max(numbers));
        Console.WriteLine(IndexOfMin(numbers));

        var words = new IComparable[] { "pear", "apple", "mango" };
        Console.WriteLine(Min(words));
        Console.WriteLine(Max(words));

        Console.WriteLine(Min(new IComparable[0]) == null ? "none" : "value");
        Console.WriteLine(IndexOfMin(new IComparable[0]));

        var reals = new IComparable[] { 2.5, -1.5, 0.0 };
        Console.WriteLine(Min(reals));
        Console.WriteLine(Max(reals));
    }`),
        solution: PROGRAM(`    // The smallest element, or null for an empty array
    static IComparable Min(IComparable[] items)
    {
        int index = IndexOfMin(items);
        return index < 0 ? null : items[index];
    }

    // The biggest element, or null for an empty array
    static IComparable Max(IComparable[] items)
    {
        if (items.Length == 0)
        {
            return null;
        }
        IComparable best = items[0];
        for (int i = 1; i < items.Length; i++)
        {
            if (items[i].CompareTo(best) > 0)
            {
                best = items[i];
            }
        }
        return best;
    }

    // The index of the first smallest element, or -1 for an empty array
    static int IndexOfMin(IComparable[] items)
    {
        if (items.Length == 0)
        {
            return -1;
        }
        int best = 0;
        for (int i = 1; i < items.Length; i++)
        {
            if (items[i].CompareTo(items[best]) < 0)
            {
                best = i;
            }
        }
        return best;
    }

    static void Main()
    {
        var numbers = new IComparable[] { 5, 3, 8, 3 };
        Console.WriteLine(Min(numbers));
        Console.WriteLine(Max(numbers));
        Console.WriteLine(IndexOfMin(numbers));

        var words = new IComparable[] { "pear", "apple", "mango" };
        Console.WriteLine(Min(words));
        Console.WriteLine(Max(words));

        Console.WriteLine(Min(new IComparable[0]) == null ? "none" : "value");
        Console.WriteLine(IndexOfMin(new IComparable[0]));

        var reals = new IComparable[] { 2.5, -1.5, 0.0 };
        Console.WriteLine(Min(reals));
        Console.WriteLine(Max(reals));
    }`),
        expectedOutput: "3\n8\n1\napple\npear\nnone\n-1\n-1.5\n2.5\n",
      },
      { kind: "lecture", slug: "implementing-icomparable", title: { en: "Implementing IComparable", uk: "Реалізація IComparable" } },
      {
        kind: "practice",
        slug: "compare-books",
        title: { en: "Comparing books", uk: "Порівняння книжок" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Make Book comparable: by author, then newest year first, then by title
class Book
{
    public string Title { get; }
    public string Author { get; }
    public int Year { get; }

    public Book(string title, string author, int year)
    {
        Title = title;
        Author = author;
        Year = year;
    }
}`,
          `        var dune = new Book("Dune", "Herbert", 1965);
        var emma = new Book("Emma", "Austen", 1815);
        var persuasion = new Book("Persuasion", "Austen", 1817);
        var zorro = new Book("Zorro", "Herbert", 1965);
        var ulysses = new Book("Ulysses", "Joyce", 1922);
        var mansfield = new Book("Mansfield Park", "Austen", 1814);

        Book[] books = { dune, emma, persuasion, zorro, ulysses, mansfield };
        Array.Sort(books);
        foreach (Book b in books)
        {
            Console.WriteLine(b.Author + ": " + b.Title + " (" + b.Year + ")");
        }

        Console.WriteLine(Math.Sign(emma.CompareTo(persuasion)));
        Console.WriteLine(Math.Sign(persuasion.CompareTo(emma)));
        Console.WriteLine(Math.Sign(emma.CompareTo(emma)));
        Console.WriteLine(Math.Sign(dune.CompareTo(zorro)));
        Console.WriteLine(Math.Sign(ulysses.CompareTo(dune)));`,
        ),
        solution: PROGRAM_WITH(
          `// Make Book comparable: by author, then newest year first, then by title
class Book : IComparable<Book>
{
    public string Title { get; }
    public string Author { get; }
    public int Year { get; }

    public Book(string title, string author, int year)
    {
        Title = title;
        Author = author;
        Year = year;
    }

    public int CompareTo(Book other)
    {
        int byAuthor = string.CompareOrdinal(Author, other.Author);
        if (byAuthor != 0)
        {
            return byAuthor;
        }
        int byYear = other.Year.CompareTo(Year);
        if (byYear != 0)
        {
            return byYear;
        }
        return string.CompareOrdinal(Title, other.Title);
    }
}`,
          `        var dune = new Book("Dune", "Herbert", 1965);
        var emma = new Book("Emma", "Austen", 1815);
        var persuasion = new Book("Persuasion", "Austen", 1817);
        var zorro = new Book("Zorro", "Herbert", 1965);
        var ulysses = new Book("Ulysses", "Joyce", 1922);
        var mansfield = new Book("Mansfield Park", "Austen", 1814);

        Book[] books = { dune, emma, persuasion, zorro, ulysses, mansfield };
        Array.Sort(books);
        foreach (Book b in books)
        {
            Console.WriteLine(b.Author + ": " + b.Title + " (" + b.Year + ")");
        }

        Console.WriteLine(Math.Sign(emma.CompareTo(persuasion)));
        Console.WriteLine(Math.Sign(persuasion.CompareTo(emma)));
        Console.WriteLine(Math.Sign(emma.CompareTo(emma)));
        Console.WriteLine(Math.Sign(dune.CompareTo(zorro)));
        Console.WriteLine(Math.Sign(ulysses.CompareTo(dune)));`,
        ),
        expectedOutput:
          "Austen: Persuasion (1817)\nAusten: Emma (1815)\nAusten: Mansfield Park (1814)\nHerbert: Dune (1965)\nHerbert: Zorro (1965)\nJoyce: Ulysses (1922)\n1\n-1\n0\n-1\n1\n",
      },
      { kind: "lecture", slug: "icomparer", title: { en: "The IComparer interface", uk: "Інтерфейс IComparer" } },
      {
        kind: "practice",
        slug: "counter-clockwise",
        title: { en: "Counter-clockwise", uk: "Проти годинникової стрілки" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public override string ToString() => "(" + X + ", " + Y + ")";
}

// Write the class AngleComparer here`,
          `        Point[] points =
        {
            new Point(1, 1), new Point(-1, 1), new Point(-1, -1), new Point(1, -1), new Point(3, 0),
            new Point(1, 0), new Point(0, 2), new Point(0, 5), new Point(-2, 0), new Point(0, -1)
        };
        Array.Sort(points, new AngleComparer());
        Console.WriteLine(string.Join(" ", new List<Point>(points)));

        var cmp = new AngleComparer();
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(1, 0), new Point(0, 1))));
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(0, 1), new Point(1, 0))));
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(1, 0), new Point(1, 0))));
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(1, 0), new Point(3, 0))));`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public override string ToString() => "(" + X + ", " + Y + ")";
}

class AngleComparer : IComparer<Point>
{
    public int Compare(Point a, Point b)
    {
        int byAngle = Angle(a).CompareTo(Angle(b));
        if (byAngle != 0)
        {
            return byAngle;
        }
        return DistanceSquared(a).CompareTo(DistanceSquared(b));
    }

    // From 0 (included) to 2π (excluded), counter-clockwise from the positive direction of x
    static double Angle(Point p)
    {
        double angle = Math.Atan2(p.Y, p.X);
        return angle < 0 ? angle + 2 * Math.PI : angle;
    }

    static int DistanceSquared(Point p)
    {
        return p.X * p.X + p.Y * p.Y;
    }
}`,
          `        Point[] points =
        {
            new Point(1, 1), new Point(-1, 1), new Point(-1, -1), new Point(1, -1), new Point(3, 0),
            new Point(1, 0), new Point(0, 2), new Point(0, 5), new Point(-2, 0), new Point(0, -1)
        };
        Array.Sort(points, new AngleComparer());
        Console.WriteLine(string.Join(" ", new List<Point>(points)));

        var cmp = new AngleComparer();
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(1, 0), new Point(0, 1))));
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(0, 1), new Point(1, 0))));
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(1, 0), new Point(1, 0))));
        Console.WriteLine(Math.Sign(cmp.Compare(new Point(1, 0), new Point(3, 0))));`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "(1, 0) (3, 0) (1, 1) (0, 2) (0, 5) (-1, 1) (-2, 0) (-1, -1) (0, -1) (1, -1)\n-1\n1\n0\n-1\n",
      },
      { kind: "lecture", slug: "polymorphism", title: { en: "Polymorphism", uk: "Поліморфізм" } },
      { kind: "lecture", slug: "virtual-methods", title: { en: "Virtual methods", uk: "Віртуальні методи" } },
      {
        kind: "practice",
        slug: "tostring-method",
        title: { en: "The ToString method", uk: "Метод ToString" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Override ToString() in both classes
class Card
{
    public int Rank { get; }
    public string Suit { get; }

    public Card(int rank, string suit)
    {
        Rank = rank;
        Suit = suit;
    }
}

class Hand
{
    private readonly List<Card> cards = new List<Card>();

    public void Add(Card card)
    {
        cards.Add(card);
    }
}`,
          `        var ace = new Card(1, "Spades");
        var seven = new Card(7, "Hearts");
        var queen = new Card(12, "Diamonds");
        Console.WriteLine(ace);
        Console.WriteLine("You drew: " + queen);
        Console.WriteLine(seven.ToString());

        var hand = new Hand();
        Console.WriteLine(hand);
        hand.Add(ace);
        Console.WriteLine(hand);
        hand.Add(seven);
        hand.Add(queen);
        Console.WriteLine(hand);

        object o = new Card(13, "Clubs");
        Console.WriteLine(o);
        Console.WriteLine(string.Join(" | ", new List<Card> { ace, seven }));`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `// Override ToString() in both classes
class Card
{
    public int Rank { get; }
    public string Suit { get; }

    public Card(int rank, string suit)
    {
        Rank = rank;
        Suit = suit;
    }

    public override string ToString()
    {
        string name;
        if (Rank == 1) name = "Ace";
        else if (Rank == 11) name = "Jack";
        else if (Rank == 12) name = "Queen";
        else if (Rank == 13) name = "King";
        else name = Rank.ToString();
        return name + " of " + Suit;
    }
}

class Hand
{
    private readonly List<Card> cards = new List<Card>();

    public void Add(Card card)
    {
        cards.Add(card);
    }

    public override string ToString()
    {
        string word = cards.Count == 1 ? "card" : "cards";
        return "Hand: [" + string.Join(", ", cards) + "] (" + cards.Count + " " + word + ")";
    }
}`,
          `        var ace = new Card(1, "Spades");
        var seven = new Card(7, "Hearts");
        var queen = new Card(12, "Diamonds");
        Console.WriteLine(ace);
        Console.WriteLine("You drew: " + queen);
        Console.WriteLine(seven.ToString());

        var hand = new Hand();
        Console.WriteLine(hand);
        hand.Add(ace);
        Console.WriteLine(hand);
        hand.Add(seven);
        hand.Add(queen);
        Console.WriteLine(hand);

        object o = new Card(13, "Clubs");
        Console.WriteLine(o);
        Console.WriteLine(string.Join(" | ", new List<Card> { ace, seven }));`,
          "using System.Collections.Generic;",
        ),
        expectedOutput:
          "Ace of Spades\nYou drew: Queen of Diamonds\n7 of Hearts\nHand: [] (0 cards)\nHand: [Ace of Spades] (1 card)\nHand: [Ace of Spades, 7 of Hearts, Queen of Diamonds] (3 cards)\nKing of Clubs\nAce of Spades | 7 of Hearts\n",
      },
      {
        kind: "quiz",
        slug: "inheritance-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "virtual-dispatch",
            mode: "single",
            prompt: {
              en: "`Dog` overrides the `virtual` method `Sound()` of `Animal`. Which version runs here?\n\n```csharp\nAnimal animal = new Dog();\nanimal.Sound();\n```",
              uk: "`Dog` перевизначає `virtual` метод `Sound()` класу `Animal`. Яка версія виконується тут?\n\n```csharp\nAnimal animal = new Dog();\nanimal.Sound();\n```",
            },
            options: [
              { id: "a", text: { en: "The version of `Dog`: the actual type of the object decides", uk: "Версія з `Dog`: вирішує справжній тип об'єкта" } },
              { id: "b", text: { en: "The version of `Animal`: the type of the variable decides", uk: "Версія з `Animal`: вирішує тип змінної" } },
              { id: "c", text: { en: "Both, one after the other", uk: "Обидві, одна за одною" } },
            ],
            correct: ["a"],
          },
          {
            id: "hiding",
            mode: "single",
            prompt: {
              en: "`B` is derived from `A`. `A` has a `virtual` method `Who()`, and `B` declares its own `new string Who()` (without `override`). What does `A x = new B(); x.Who();` run?",
              uk: "`B` походить від `A`. У `A` є `virtual` метод `Who()`, а `B` оголошує власний `new string Who()` (без `override`). Що виконає `A x = new B(); x.Who();`?",
            },
            options: [
              { id: "a", text: { en: "The version of `A`: the method of `B` only hides it", uk: "Версію з `A`: метод `B` лише ховає її" } },
              { id: "b", text: { en: "The version of `B`", uk: "Версію з `B`" } },
              { id: "c", text: { en: "It does not compile", uk: "Це не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "abstract",
            mode: "single",
            prompt: {
              en: "What can you do with an `abstract` class?",
              uk: "Що можна робити з `abstract` класом?",
            },
            options: [
              { id: "a", text: { en: "Derive classes from it, and use it as the type of a variable; but not create its objects with `new`", uk: "Створювати від нього похідні класи й вживати як тип змінної; але не створювати його об'єкти через `new`" } },
              { id: "b", text: { en: "Create its objects with `new`", uk: "Створювати його об'єкти через `new`" } },
              { id: "c", text: { en: "Nothing: it cannot be used at all", uk: "Нічого: його взагалі не можна використовувати" } },
            ],
            correct: ["a"],
          },
          {
            id: "compare-to-sign",
            mode: "single",
            prompt: {
              en: "What does a **negative** result of `a.CompareTo(b)` mean?",
              uk: "Що означає **від'ємний** результат `a.CompareTo(b)`?",
            },
            options: [
              { id: "a", text: { en: "`a` goes before `b` in the order", uk: "`a` іде перед `b` у порядку" } },
              { id: "b", text: { en: "`a` goes after `b`", uk: "`a` іде після `b`" } },
              { id: "c", text: { en: "`a` and `b` are equal", uk: "`a` і `b` рівні" } },
            ],
            correct: ["a"],
          },
          {
            id: "comparer-when",
            mode: "multi",
            prompt: {
              en: "When is `IComparer<T>` a better choice than `IComparable<T>`?",
              uk: "Коли `IComparer<T>` кращий вибір, ніж `IComparable<T>`?",
            },
            options: [
              { id: "a", text: { en: "When the same class has to be sorted in several different orders", uk: "Коли той самий клас треба сортувати в кількох різних порядках" } },
              { id: "b", text: { en: "When the class is not yours and you cannot change it", uk: "Коли клас не ваш і ви не можете його змінити" } },
              { id: "c", text: { en: "When the class has only one natural order", uk: "Коли клас має лише один природний порядок" } },
            ],
            correct: ["a", "b"],
          },
          {
            id: "default-tostring",
            mode: "single",
            prompt: {
              en: "What does `Console.WriteLine(p)` print for an object `p` of a class that does not override `ToString()`?",
              uk: "Що друкує `Console.WriteLine(p)` для об'єкта `p` класу, який не перевизначає `ToString()`?",
            },
            options: [
              { id: "a", text: { en: "The name of the type of the object", uk: "Назву типу об'єкта" } },
              { id: "b", text: { en: "The values of all its fields", uk: "Значення всіх його полів" } },
              { id: "c", text: { en: "An empty line", uk: "Порожній рядок" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "earth-digger",
        title: { en: "Practice: Earth and Digger", uk: "Практика «Земля та Диґер»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `abstract class Cell
{
    public abstract char Symbol { get; }
    public virtual bool CanEnter { get { return false; } }
    public virtual int Score { get { return 0; } }
}

class Wall : Cell
{
    public override char Symbol { get { return '#'; } }
}

class Empty : Cell
{
    public override char Symbol { get { return '_'; } }
    public override bool CanEnter { get { return true; } }
}

class Gold : Cell
{
    public override char Symbol { get { return '$'; } }
    public override bool CanEnter { get { return true; } }
    public override int Score { get { return 10; } }
}

// Write the classes Terrain ('.', enterable, 1 point) and Digger ('D', not enterable) here

class Field
{
    private readonly Cell[,] cells;
    private int diggerRow;
    private int diggerCol;

    public int Score { get; private set; }

    public Field(string[] rows)
    {
        cells = new Cell[rows.Length, rows[0].Length];
        for (int r = 0; r < rows.Length; r++)
        {
            for (int c = 0; c < rows[r].Length; c++)
            {
                cells[r, c] = Create(rows[r][c]);
                if (rows[r][c] == 'D')
                {
                    diggerRow = r;
                    diggerCol = c;
                }
            }
        }
    }

    private static Cell Create(char symbol)
    {
        if (symbol == '#') return new Wall();
        if (symbol == '$') return new Gold();
        if (symbol == '.') return new Terrain();
        if (symbol == 'D') return new Digger();
        return new Empty();
    }

    // Moves the digger by dRow rows and dCol columns. Returns whether the move happened.
    public bool Move(int dRow, int dCol)
    {
        // Write your code here
        return false;
    }

    public override string ToString()
    {
        string text = "";
        for (int r = 0; r < cells.GetLength(0); r++)
        {
            if (r > 0) text += "\\n";
            for (int c = 0; c < cells.GetLength(1); c++)
            {
                text += cells[r, c].Symbol;
            }
        }
        return text;
    }
}`,
          `        var field = new Field(new[] { "#####", "#D..#", "#.$.#", "#####" });
        string result = "";
        foreach (char m in "RRRDLLUU")
        {
            int dRow = 0, dCol = 0;
            if (m == 'R') dCol = 1;
            else if (m == 'L') dCol = -1;
            else if (m == 'D') dRow = 1;
            else dRow = -1;
            result += field.Move(dRow, dCol) ? "T" : "F";
        }
        Console.WriteLine(result);
        Console.WriteLine(field);
        Console.WriteLine("Score: " + field.Score);

        var corridor = new Field(new[] { "D.$" });
        Console.WriteLine(corridor.Move(0, 1) + " " + corridor.Move(0, 1) + " " + corridor.Move(0, 1));
        Console.WriteLine(corridor);
        Console.WriteLine("Score: " + corridor.Score);`,
        ),
        solution: PROGRAM_WITH(
          `abstract class Cell
{
    public abstract char Symbol { get; }
    public virtual bool CanEnter { get { return false; } }
    public virtual int Score { get { return 0; } }
}

class Wall : Cell
{
    public override char Symbol { get { return '#'; } }
}

class Empty : Cell
{
    public override char Symbol { get { return '_'; } }
    public override bool CanEnter { get { return true; } }
}

class Gold : Cell
{
    public override char Symbol { get { return '$'; } }
    public override bool CanEnter { get { return true; } }
    public override int Score { get { return 10; } }
}

class Terrain : Cell
{
    public override char Symbol { get { return '.'; } }
    public override bool CanEnter { get { return true; } }
    public override int Score { get { return 1; } }
}

class Digger : Cell
{
    public override char Symbol { get { return 'D'; } }
}

class Field
{
    private readonly Cell[,] cells;
    private int diggerRow;
    private int diggerCol;

    public int Score { get; private set; }

    public Field(string[] rows)
    {
        cells = new Cell[rows.Length, rows[0].Length];
        for (int r = 0; r < rows.Length; r++)
        {
            for (int c = 0; c < rows[r].Length; c++)
            {
                cells[r, c] = Create(rows[r][c]);
                if (rows[r][c] == 'D')
                {
                    diggerRow = r;
                    diggerCol = c;
                }
            }
        }
    }

    private static Cell Create(char symbol)
    {
        if (symbol == '#') return new Wall();
        if (symbol == '$') return new Gold();
        if (symbol == '.') return new Terrain();
        if (symbol == 'D') return new Digger();
        return new Empty();
    }

    // Moves the digger by dRow rows and dCol columns. Returns whether the move happened.
    public bool Move(int dRow, int dCol)
    {
        int row = diggerRow + dRow;
        int col = diggerCol + dCol;
        if (row < 0 || row >= cells.GetLength(0) || col < 0 || col >= cells.GetLength(1))
        {
            return false;
        }
        Cell target = cells[row, col];
        if (!target.CanEnter)
        {
            return false;
        }
        Score += target.Score;
        cells[row, col] = cells[diggerRow, diggerCol];
        cells[diggerRow, diggerCol] = new Empty();
        diggerRow = row;
        diggerCol = col;
        return true;
    }

    public override string ToString()
    {
        string text = "";
        for (int r = 0; r < cells.GetLength(0); r++)
        {
            if (r > 0) text += "\\n";
            for (int c = 0; c < cells.GetLength(1); c++)
            {
                text += cells[r, c].Symbol;
            }
        }
        return text;
    }
}`,
          `        var field = new Field(new[] { "#####", "#D..#", "#.$.#", "#####" });
        string result = "";
        foreach (char m in "RRRDLLUU")
        {
            int dRow = 0, dCol = 0;
            if (m == 'R') dCol = 1;
            else if (m == 'L') dCol = -1;
            else if (m == 'D') dRow = 1;
            else dRow = -1;
            result += field.Move(dRow, dCol) ? "T" : "F";
        }
        Console.WriteLine(result);
        Console.WriteLine(field);
        Console.WriteLine("Score: " + field.Score);

        var corridor = new Field(new[] { "D.$" });
        Console.WriteLine(corridor.Move(0, 1) + " " + corridor.Move(0, 1) + " " + corridor.Move(0, 1));
        Console.WriteLine(corridor);
        Console.WriteLine("Score: " + corridor.Score);`,
        ),
        expectedOutput: "TTFTTTTF\n#####\n#D__#\n#___#\n#####\nScore: 14\nTrue True False\n__D\nScore: 11\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "bags-and-gold",
        title: { en: "Practice: Bags and Gold", uk: "Практика «Мішки та Золото»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          DIGGER_ENGINE(
            `// Write the class Bag here: a cell 'S' that falls and breaks into gold`,
            `        if (symbol == 'S') return new Bag();\n`,
          ),
          `        var field = new Field(new[]
        {
            "#######",
            "#_S_S_#",
            "#_____#",
            "#D__._#",
            "#_____#",
            "#######"
        });
        Show(field, "Start");

        Tick(field, 4);
        Show(field, "After 4 ticks");

        Walk(field, "RRRR");
        Show(field, "Digger walked right");

        Tick(field, 3);
        Show(field, "After 3 more ticks");

        Walk(field, "DLLL");
        Show(field, "Digger collected the gold");`,
          "",
          `    static void Show(Field field, string title)
    {
        Console.WriteLine(title + ":");
        Console.WriteLine(field);
        Console.WriteLine("Score: " + field.Score);
    }

    static void Tick(Field field, int times)
    {
        for (int i = 0; i < times; i++)
        {
            field.Tick();
        }
    }

    static void Walk(Field field, string moves)
    {
        foreach (char m in moves)
        {
            if (m == 'R') field.Move(0, 1);
            else if (m == 'L') field.Move(0, -1);
            else if (m == 'D') field.Move(1, 0);
            else field.Move(-1, 0);
        }
    }`,
        ),
        solution: PROGRAM_WITH(
          DIGGER_ENGINE(BAG_CLASS, `        if (symbol == 'S') return new Bag();\n`),
          `        var field = new Field(new[]
        {
            "#######",
            "#_S_S_#",
            "#_____#",
            "#D__._#",
            "#_____#",
            "#######"
        });
        Show(field, "Start");

        Tick(field, 4);
        Show(field, "After 4 ticks");

        Walk(field, "RRRR");
        Show(field, "Digger walked right");

        Tick(field, 3);
        Show(field, "After 3 more ticks");

        Walk(field, "DLLL");
        Show(field, "Digger collected the gold");`,
          "",
          `    static void Show(Field field, string title)
    {
        Console.WriteLine(title + ":");
        Console.WriteLine(field);
        Console.WriteLine("Score: " + field.Score);
    }

    static void Tick(Field field, int times)
    {
        for (int i = 0; i < times; i++)
        {
            field.Tick();
        }
    }

    static void Walk(Field field, string moves)
    {
        foreach (char m in moves)
        {
            if (m == 'R') field.Move(0, 1);
            else if (m == 'L') field.Move(0, -1);
            else if (m == 'D') field.Move(1, 0);
            else field.Move(-1, 0);
        }
    }`,
        ),
        expectedOutput:
          "Start:\n#######\n#_S_S_#\n#_____#\n#D__._#\n#_____#\n#######\nScore: 0\nAfter 4 ticks:\n#######\n#_____#\n#___S_#\n#D__._#\n#_$___#\n#######\nScore: 0\nDigger walked right:\n#######\n#_____#\n#___S_#\n#____D#\n#_$___#\n#######\nScore: 1\nAfter 3 more ticks:\n#######\n#_____#\n#_____#\n#____D#\n#_$_$_#\n#######\nScore: 1\nDigger collected the gold:\n#######\n#_____#\n#_____#\n#_____#\n#_D___#\n#######\nScore: 21\n",
        maxScore: 20,
      },
      {
        kind: "practice",
        slug: "monsters",
        title: { en: "Practice: Monsters", uk: "Практика «Монстри»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          DIGGER_ENGINE(
            `${BAG_CLASS}\n\n// Write the class Monster here: a cell 'M' that patrols and kills the digger`,
            `        if (symbol == 'S') return new Bag();\n        if (symbol == 'M') return new Monster();\n`,
          ),
          `        var field = new Field(new[]
        {
            "#########",
            "#M__.__D#",
            "#########"
        });
        Console.WriteLine(field);
        Tick(field, 3);
        Console.WriteLine(field);

        field.Move(0, -1);
        field.Move(0, -1);
        field.Move(0, -1);
        Console.WriteLine(field);
        Console.WriteLine("Score: " + field.Score);

        int ticks = 0;
        while (field.Alive && ticks < 20)
        {
            field.Tick();
            ticks++;
        }
        Console.WriteLine("Alive: " + field.Alive + " after " + ticks + " ticks");

        var trap = new Field(new[] { "#_MD#" });
        Console.WriteLine(trap.Move(0, -1));
        Console.WriteLine("Alive: " + trap.Alive);
        Console.WriteLine(trap.Move(0, 1));

        var chase = new Field(new[] { "#M_D#" });
        chase.Tick();
        Console.WriteLine(chase + " " + chase.Alive);
        chase.Tick();
        Console.WriteLine(chase + " " + chase.Alive);`,
          "",
          `    static void Tick(Field field, int times)
    {
        for (int i = 0; i < times; i++)
        {
            field.Tick();
        }
    }`,
        ),
        solution: PROGRAM_WITH(
          DIGGER_ENGINE(
            `${BAG_CLASS}

class Monster : Cell
{
    private int direction = 1;

    public override char Symbol { get { return 'M'; } }
    public override bool CanEnter { get { return true; } }
    public override bool Kills { get { return true; } }

    public override void Update(Field field, int row, int col)
    {
        int next = col + direction;
        if (next < 0 || next >= field.Cols)
        {
            direction = -direction;
            return;
        }
        Cell target = field.Get(row, next);
        if (target is Digger)
        {
            field.Kill();
        }
        else if (target is Empty)
        {
            field.Set(row, next, this);
            field.Set(row, col, new Empty());
        }
        else
        {
            direction = -direction;
        }
    }
}`,
            `        if (symbol == 'S') return new Bag();\n        if (symbol == 'M') return new Monster();\n`,
          ),
          `        var field = new Field(new[]
        {
            "#########",
            "#M__.__D#",
            "#########"
        });
        Console.WriteLine(field);
        Tick(field, 3);
        Console.WriteLine(field);

        field.Move(0, -1);
        field.Move(0, -1);
        field.Move(0, -1);
        Console.WriteLine(field);
        Console.WriteLine("Score: " + field.Score);

        int ticks = 0;
        while (field.Alive && ticks < 20)
        {
            field.Tick();
            ticks++;
        }
        Console.WriteLine("Alive: " + field.Alive + " after " + ticks + " ticks");

        var trap = new Field(new[] { "#_MD#" });
        Console.WriteLine(trap.Move(0, -1));
        Console.WriteLine("Alive: " + trap.Alive);
        Console.WriteLine(trap.Move(0, 1));

        var chase = new Field(new[] { "#M_D#" });
        chase.Tick();
        Console.WriteLine(chase + " " + chase.Alive);
        chase.Tick();
        Console.WriteLine(chase + " " + chase.Alive);`,
          "",
          `    static void Tick(Field field, int times)
    {
        for (int i = 0; i < times; i++)
        {
            field.Tick();
        }
    }`,
        ),
        expectedOutput:
          "#########\n#M__.__D#\n#########\n#########\n#__M.__D#\n#########\n#########\n#__MD___#\n#########\nScore: 1\nAlive: False after 6 ticks\nTrue\nAlive: False\nFalse\n#_MD# True\n#_MD# False\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "encapsulation",
    title: { en: "Encapsulation", uk: "Інкапсуляція" },
    slides: [
      { kind: "lecture", slug: "data-integrity", title: { en: "Data integrity", uk: "Цілісність даних" } },
      { kind: "lecture", slug: "private-keyword", title: { en: "The private keyword", uk: "Ключове слово private" } },
      {
        kind: "quiz",
        slug: "private-quiz",
        title: { en: "Using private", uk: "Використання private" },
        questions: [
          {
            id: "inaccessible",
            mode: "single",
            prompt: {
              en: "What happens with this code?\n\n```csharp\nclass Account\n{\n    private decimal balance;\n}\n\nclass Program\n{\n    static void Main()\n    {\n        var a = new Account();\n        a.balance = 100;\n    }\n}\n```",
              uk: "Що станеться з цим кодом?\n\n```csharp\nclass Account\n{\n    private decimal balance;\n}\n\nclass Program\n{\n    static void Main()\n    {\n        var a = new Account();\n        a.balance = 100;\n    }\n}\n```",
            },
            options: [
              { id: "a", text: { en: "A compile error: `balance` is inaccessible due to its protection level", uk: "Помилка компіляції: `balance` недоступне через рівень захисту" } },
              { id: "b", text: { en: "It works, and the balance is 100", uk: "Це працює, і баланс дорівнює 100" } },
              { id: "c", text: { en: "An exception at run time", uk: "Виняток під час виконання" } },
              { id: "d", text: { en: "It compiles with a warning", uk: "Компілюється з попередженням" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "deferred-errors", title: { en: "Deferred errors", uk: "Відкладені помилки" } },
      { kind: "lecture", slug: "encapsulation-properties", title: { en: "Properties", uk: "Властивості" } },
      {
        kind: "practice",
        slug: "fail-fast",
        title: { en: "Do not defer errors", uk: "Не відкладати помилки" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Make the class fail fast: validate the name and the target
class Thermostat
{
    public string Name;
    public int Target;

    public Thermostat(string name, int target)
    {
        Name = name;
        Target = target;
    }
}`,
          `        var t = new Thermostat("Hall", 20);
        Console.WriteLine(t.Name + ": " + t.Target);
        SetTarget(t, 40);
        Console.WriteLine(t.Target);
        SetTarget(t, 5);
        SetTarget(t, 4);
        Console.WriteLine(t.Target);
        Warm(t, 10);
        Console.WriteLine(t.Target);
        Warm(t, 30);
        Console.WriteLine(t.Target);
        Create("Attic", 99);
        Create("", 20);
        Create("Attic", 18);`,
          "",
          `    static void SetTarget(Thermostat t, int value)
    {
        try
        {
            t.Target = value;
            Console.WriteLine("target " + value + ": accepted");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("target " + value + ": rejected");
        }
    }

    static void Warm(Thermostat t, int degrees)
    {
        try
        {
            t.Warmer(degrees);
            Console.WriteLine("warmer by " + degrees + ": accepted");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("warmer by " + degrees + ": rejected");
        }
    }

    static void Create(string name, int target)
    {
        try
        {
            var t = new Thermostat(name, target);
            Console.WriteLine("created " + t.Name);
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("bad target " + target);
        }
        catch (ArgumentException)
        {
            Console.WriteLine("bad name");
        }
    }`,
        ),
        solution: PROGRAM_WITH(
          `class Thermostat
{
    private int target;

    public string Name { get; }

    public int Target
    {
        get { return target; }
        set
        {
            if (value < 5 || value > 30)
            {
                throw new ArgumentOutOfRangeException("value", "The target must be from 5 to 30");
            }
            target = value;
        }
    }

    public Thermostat(string name, int target)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("The name is required", "name");
        }
        Name = name;
        Target = target;
    }

    public void Warmer(int degrees)
    {
        Target = target + degrees;
    }
}`,
          `        var t = new Thermostat("Hall", 20);
        Console.WriteLine(t.Name + ": " + t.Target);
        SetTarget(t, 40);
        Console.WriteLine(t.Target);
        SetTarget(t, 5);
        SetTarget(t, 4);
        Console.WriteLine(t.Target);
        Warm(t, 10);
        Console.WriteLine(t.Target);
        Warm(t, 30);
        Console.WriteLine(t.Target);
        Create("Attic", 99);
        Create("", 20);
        Create("Attic", 18);`,
          "",
          `    static void SetTarget(Thermostat t, int value)
    {
        try
        {
            t.Target = value;
            Console.WriteLine("target " + value + ": accepted");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("target " + value + ": rejected");
        }
    }

    static void Warm(Thermostat t, int degrees)
    {
        try
        {
            t.Warmer(degrees);
            Console.WriteLine("warmer by " + degrees + ": accepted");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("warmer by " + degrees + ": rejected");
        }
    }

    static void Create(string name, int target)
    {
        try
        {
            var t = new Thermostat(name, target);
            Console.WriteLine("created " + t.Name);
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("bad target " + target);
        }
        catch (ArgumentException)
        {
            Console.WriteLine("bad name");
        }
    }`,
        ),
        expectedOutput:
          "Hall: 20\ntarget 40: rejected\n20\ntarget 5: accepted\ntarget 4: rejected\n5\nwarmer by 10: accepted\n15\nwarmer by 30: rejected\n15\nbad target 99\nbad name\ncreated Attic\n",
      },
      { kind: "lecture", slug: "more-properties", title: { en: "More about properties", uk: "Більше про властивості" } },
      {
        kind: "practice",
        slug: "property-instead-of-field",
        title: { en: "A property instead of a field", uk: "Властивість замість поля" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// The area is stored, so it gets stale; the sides can be set to nonsense.
// Use properties: validated Width and Height, and computed Area, Perimeter and IsSquare
class Rectangle
{
    public int Width;
    public int Height;
    public int Area;

    public Rectangle(int width, int height)
    {
        Width = width;
        Height = height;
        Area = width * height;
    }
}`,
          `        var r = new Rectangle(3, 4);
        Console.WriteLine(r.Area);
        Console.WriteLine(r.Perimeter);
        r.Width = 10;
        Console.WriteLine(r.Area);
        Console.WriteLine(r.Perimeter);
        try
        {
            r.Height = 0;
            Console.WriteLine("accepted");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("rejected");
        }
        Console.WriteLine(r.Height);
        Console.WriteLine(r.IsSquare);
        r.Height = 10;
        Console.WriteLine(r.IsSquare);
        Console.WriteLine(r.Area);
        try
        {
            new Rectangle(-1, 5);
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("bad rectangle");
        }`,
        ),
        solution: PROGRAM_WITH(
          `class Rectangle
{
    private int width;
    private int height;

    public int Width
    {
        get { return width; }
        set
        {
            if (value <= 0) throw new ArgumentOutOfRangeException("value");
            width = value;
        }
    }

    public int Height
    {
        get { return height; }
        set
        {
            if (value <= 0) throw new ArgumentOutOfRangeException("value");
            height = value;
        }
    }

    public int Area => Width * Height;
    public int Perimeter => 2 * (Width + Height);
    public bool IsSquare => Width == Height;

    public Rectangle(int width, int height)
    {
        Width = width;
        Height = height;
    }
}`,
          `        var r = new Rectangle(3, 4);
        Console.WriteLine(r.Area);
        Console.WriteLine(r.Perimeter);
        r.Width = 10;
        Console.WriteLine(r.Area);
        Console.WriteLine(r.Perimeter);
        try
        {
            r.Height = 0;
            Console.WriteLine("accepted");
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("rejected");
        }
        Console.WriteLine(r.Height);
        Console.WriteLine(r.IsSquare);
        r.Height = 10;
        Console.WriteLine(r.IsSquare);
        Console.WriteLine(r.Area);
        try
        {
            new Rectangle(-1, 5);
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("bad rectangle");
        }`,
        ),
        expectedOutput: "12\n14\n40\n28\nrejected\n4\nFalse\nTrue\n100\nbad rectangle\n",
      },
      { kind: "lecture", slug: "constructors", title: { en: "Constructors", uk: "Конструктори" } },
      {
        kind: "practice",
        slug: "vector-length",
        title: { en: "Vector", uk: "Вектор" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Hide the coordinates, and add the property Length that can be read and set
class Vector
{
    public double X;
    public double Y;

    public Vector(double x, double y)
    {
        X = x;
        Y = y;
    }
}`,
          `        var v = new Vector(3, 4);
        Console.WriteLine(v);
        Console.WriteLine(v.Length);
        v.Length = 10;
        Console.WriteLine(v);
        Console.WriteLine(v.Length);
        Console.WriteLine(new Vector());
        Console.WriteLine(Vector.FromPolar(2, 90));
        Console.WriteLine(Vector.FromPolar(1, 60));
        try
        {
            v.Length = -1;
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("negative length");
        }
        Console.WriteLine(v);

        var zero = new Vector();
        try
        {
            zero.Length = 5;
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("no direction");
        }
        zero.Length = 0;
        Console.WriteLine(zero);`,
        ),
        solution: PROGRAM_WITH(
          `class Vector
{
    private double x;
    private double y;

    public Vector(double x, double y)
    {
        this.x = x;
        this.y = y;
    }

    public Vector() : this(0, 0)
    {
    }

    public static Vector FromPolar(double length, double degrees)
    {
        double radians = degrees * Math.PI / 180;
        return new Vector(length * Math.Cos(radians), length * Math.Sin(radians));
    }

    public double X => x;
    public double Y => y;

    public double Length
    {
        get { return Math.Sqrt(x * x + y * y); }
        set
        {
            if (value < 0)
            {
                throw new ArgumentOutOfRangeException("value");
            }
            double current = Length;
            if (current == 0)
            {
                if (value == 0)
                {
                    return;
                }
                throw new InvalidOperationException("A zero vector has no direction");
            }
            double factor = value / current;
            x *= factor;
            y *= factor;
        }
    }

    public override string ToString()
    {
        return "(" + Math.Round(x, 2) + ", " + Math.Round(y, 2) + ")";
    }
}`,
          `        var v = new Vector(3, 4);
        Console.WriteLine(v);
        Console.WriteLine(v.Length);
        v.Length = 10;
        Console.WriteLine(v);
        Console.WriteLine(v.Length);
        Console.WriteLine(new Vector());
        Console.WriteLine(Vector.FromPolar(2, 90));
        Console.WriteLine(Vector.FromPolar(1, 60));
        try
        {
            v.Length = -1;
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("negative length");
        }
        Console.WriteLine(v);

        var zero = new Vector();
        try
        {
            zero.Length = 5;
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("no direction");
        }
        zero.Length = 0;
        Console.WriteLine(zero);`,
        ),
        expectedOutput: "(3, 4)\n5\n(6, 8)\n10\n(0, 0)\n(0, 2)\n(0.5, 0.87)\nnegative length\n(6, 8)\nno direction\n(0, 0)\n",
      },
      { kind: "lecture", slug: "readonly-fields", title: { en: "The readonly fields", uk: "Поля readonly" } },
      {
        kind: "practice",
        slug: "fraction",
        title: { en: "Fraction", uk: "Дріб" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Make the fraction immutable and always valid: a positive denominator that is never zero,
// and a reduced fraction. Operations return new fractions.
class Fraction
{
    public int Numerator;
    public int Denominator;

    public Fraction(int numerator, int denominator)
    {
        Numerator = numerator;
        Denominator = denominator;
    }
}`,
          `        var a = new Fraction(6, -8);
        var b = new Fraction(1, 2);
        Console.WriteLine(a);
        Console.WriteLine(a.Plus(b));
        Console.WriteLine(a.Times(b));
        Console.WriteLine(a.Inverse());
        Console.WriteLine(b.Inverse());
        Console.WriteLine(new Fraction(0, 5));
        Console.WriteLine(a);
        try
        {
            new Fraction(1, 0);
        }
        catch (ArgumentException e)
        {
            Console.WriteLine(e.GetType().Name);
        }
        try
        {
            new Fraction(0, 3).Inverse();
        }
        catch (DivideByZeroException e)
        {
            Console.WriteLine(e.GetType().Name);
        }
        Console.WriteLine(a.Numerator + " " + a.Denominator);`,
        ),
        solution: PROGRAM_WITH(
          `class Fraction
{
    private readonly int numerator;
    private readonly int denominator;

    public int Numerator => numerator;
    public int Denominator => denominator;

    public Fraction(int numerator, int denominator)
    {
        if (denominator == 0)
        {
            throw new ArgumentException("The denominator cannot be zero", "denominator");
        }
        if (denominator < 0)
        {
            numerator = -numerator;
            denominator = -denominator;
        }
        int g = Gcd(Math.Abs(numerator), denominator);
        this.numerator = numerator / g;
        this.denominator = denominator / g;
    }

    static int Gcd(int a, int b)
    {
        return b == 0 ? a : Gcd(b, a % b);
    }

    public Fraction Plus(Fraction other)
    {
        return new Fraction(numerator * other.denominator + other.numerator * denominator, denominator * other.denominator);
    }

    public Fraction Times(Fraction other)
    {
        return new Fraction(numerator * other.numerator, denominator * other.denominator);
    }

    public Fraction Inverse()
    {
        if (numerator == 0)
        {
            throw new DivideByZeroException("Zero has no inverse");
        }
        return new Fraction(denominator, numerator);
    }

    public override string ToString()
    {
        return denominator == 1 ? numerator.ToString() : numerator + "/" + denominator;
    }
}`,
          `        var a = new Fraction(6, -8);
        var b = new Fraction(1, 2);
        Console.WriteLine(a);
        Console.WriteLine(a.Plus(b));
        Console.WriteLine(a.Times(b));
        Console.WriteLine(a.Inverse());
        Console.WriteLine(b.Inverse());
        Console.WriteLine(new Fraction(0, 5));
        Console.WriteLine(a);
        try
        {
            new Fraction(1, 0);
        }
        catch (ArgumentException e)
        {
            Console.WriteLine(e.GetType().Name);
        }
        try
        {
            new Fraction(0, 3).Inverse();
        }
        catch (DivideByZeroException e)
        {
            Console.WriteLine(e.GetType().Name);
        }
        Console.WriteLine(a.Numerator + " " + a.Denominator);`,
        ),
        expectedOutput: "-3/4\n-1/4\n-3/8\n-4/3\n2\n0\n-3/4\nArgumentException\nDivideByZeroException\n-3 4\n",
      },
      {
        kind: "quiz",
        slug: "encapsulation-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "invariant",
            mode: "single",
            prompt: { en: "What is an invariant of a class?", uk: "Що таке інваріант класу?" },
            options: [
              { id: "a", text: { en: "A rule about the data of an object that must be true at all times", uk: "Правило про дані об'єкта, яке має виконуватися завжди" } },
              { id: "b", text: { en: "A method that is never changed", uk: "Метод, який ніколи не змінюється" } },
              { id: "c", text: { en: "A `static` field", uk: "Поле `static`" } },
            ],
            correct: ["a"],
          },
          {
            id: "default-access",
            mode: "single",
            prompt: {
              en: "What is the access level of a field in a class if you write no modifier?",
              uk: "Який рівень доступу має поле класу, якщо модифікатор не вказано?",
            },
            options: [
              { id: "a", text: { en: "`private`", uk: "`private`" } },
              { id: "b", text: { en: "`public`", uk: "`public`" } },
              { id: "c", text: { en: "`protected`", uk: "`protected`" } },
            ],
            correct: ["a"],
          },
          {
            id: "property-benefit",
            mode: "multi",
            prompt: {
              en: "What is better in a property than in a public field?",
              uk: "Чим властивість краща за публічне поле?",
            },
            options: [
              { id: "a", text: { en: "A check can be added in `set`", uk: "У `set` можна додати перевірку" } },
              { id: "b", text: { en: "The class can change how the value is stored, and the callers do not change", uk: "Клас може змінити спосіб зберігання значення, а код, що викликає, не змінюється" } },
              { id: "c", text: { en: "The value can be computed", uk: "Значення можна обчислювати" } },
              { id: "d", text: { en: "A property uses no memory", uk: "Властивість не використовує пам'яті" } },
            ],
            correct: ["a", "b", "c"],
          },
          {
            id: "private-set",
            mode: "single",
            prompt: {
              en: "What does `public int Count { get; private set; }` mean?",
              uk: "Що означає `public int Count { get; private set; }`?",
            },
            options: [
              { id: "a", text: { en: "Everybody can read it, and only the class itself can change it", uk: "Читати можуть усі, а змінювати — лише сам клас" } },
              { id: "b", text: { en: "Nobody can read it", uk: "Читати не може ніхто" } },
              { id: "c", text: { en: "Everybody can change it, and only the class can read it", uk: "Змінювати можуть усі, а читати — лише клас" } },
            ],
            correct: ["a"],
          },
          {
            id: "readonly",
            mode: "single",
            prompt: {
              en: "Where can a `readonly` field be assigned?",
              uk: "Де можна присвоїти значення полю `readonly`?",
            },
            options: [
              { id: "a", text: { en: "In its declaration and in a constructor of the class", uk: "В його оголошенні та в конструкторі класу" } },
              { id: "b", text: { en: "In any method of the class", uk: "У будь-якому методі класу" } },
              { id: "c", text: { en: "Nowhere: it is always 0", uk: "Ніде: воно завжди 0" } },
            ],
            correct: ["a"],
          },
          {
            id: "validate-first",
            mode: "single",
            prompt: {
              en: "A method has to change two fields and may throw an exception for a bad argument. What is the safe order?",
              uk: "Метод має змінити два поля й може кинути виняток для поганого аргументу. Який порядок безпечний?",
            },
            options: [
              { id: "a", text: { en: "Check all the arguments first, then change the fields", uk: "Спершу перевірити всі аргументи, потім змінити поля" } },
              { id: "b", text: { en: "Change the first field, check, then change the second", uk: "Змінити перше поле, перевірити, потім змінити друге" } },
              { id: "c", text: { en: "The order does not matter", uk: "Порядок не має значення" } },
            ],
            correct: ["a"],
          },
          {
            id: "leaked-list",
            mode: "single",
            prompt: {
              en: "What is wrong with this class?\n\n```csharp\nclass Team\n{\n    private readonly List<string> members = new List<string>();\n    public List<string> Members { get { return members; } }\n}\n```",
              uk: "Що не так із цим класом?\n\n```csharp\nclass Team\n{\n    private readonly List<string> members = new List<string>();\n    public List<string> Members { get { return members; } }\n}\n```",
            },
            options: [
              { id: "a", text: { en: "It gives out the inner list, so the outside code can change it without any checks", uk: "Він віддає внутрішній список, тож зовнішній код може змінювати його без жодних перевірок" } },
              { id: "b", text: { en: "Nothing: `readonly` makes the list immutable", uk: "Нічого: `readonly` робить список незмінним" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "grade-book",
        title: { en: "Practice: Grade book", uk: "Практика «Журнал оцінок»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Hide the list of marks and guard it: validate the marks and never give out the list itself
class GradeBook
{
    public List<int> Marks = new List<int>();
}`,
          `        var book = new GradeBook();
        foreach (int m in new[] { 80, 95, 60, 95 })
        {
            book.Add(m);
        }
        Console.WriteLine(book.Count);
        Console.WriteLine(book.Average);
        Console.WriteLine(book.Best);
        Console.WriteLine(book.CountAtLeast(90));
        try
        {
            book.Add(101);
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("rejected");
        }
        Console.WriteLine(book.Count);

        int[] copy = book.Marks;
        copy[0] = 0;
        Console.WriteLine(book.Marks[0]);

        Console.WriteLine(book.Remove(95));
        Console.WriteLine(book.Remove(10));
        Console.WriteLine(string.Join(" ", book.Marks));

        var empty = new GradeBook();
        Console.WriteLine(empty.Average);
        try
        {
            Console.WriteLine(empty.Best);
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("no marks");
        }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `class GradeBook
{
    private readonly List<int> marks = new List<int>();

    public int Count => marks.Count;

    public int[] Marks => marks.ToArray();

    public double Average
    {
        get
        {
            if (marks.Count == 0)
            {
                return 0;
            }
            double sum = 0;
            foreach (int mark in marks)
            {
                sum += mark;
            }
            return sum / marks.Count;
        }
    }

    public int Best
    {
        get
        {
            if (marks.Count == 0)
            {
                throw new InvalidOperationException("The book has no marks");
            }
            int best = marks[0];
            foreach (int mark in marks)
            {
                if (mark > best)
                {
                    best = mark;
                }
            }
            return best;
        }
    }

    public void Add(int mark)
    {
        if (mark < 0 || mark > 100)
        {
            throw new ArgumentOutOfRangeException("mark", "A mark must be from 0 to 100");
        }
        marks.Add(mark);
    }

    public bool Remove(int mark)
    {
        return marks.Remove(mark);
    }

    public int CountAtLeast(int threshold)
    {
        int count = 0;
        foreach (int mark in marks)
        {
            if (mark >= threshold)
            {
                count++;
            }
        }
        return count;
    }
}`,
          `        var book = new GradeBook();
        foreach (int m in new[] { 80, 95, 60, 95 })
        {
            book.Add(m);
        }
        Console.WriteLine(book.Count);
        Console.WriteLine(book.Average);
        Console.WriteLine(book.Best);
        Console.WriteLine(book.CountAtLeast(90));
        try
        {
            book.Add(101);
        }
        catch (ArgumentOutOfRangeException)
        {
            Console.WriteLine("rejected");
        }
        Console.WriteLine(book.Count);

        int[] copy = book.Marks;
        copy[0] = 0;
        Console.WriteLine(book.Marks[0]);

        Console.WriteLine(book.Remove(95));
        Console.WriteLine(book.Remove(10));
        Console.WriteLine(string.Join(" ", book.Marks));

        var empty = new GradeBook();
        Console.WriteLine(empty.Average);
        try
        {
            Console.WriteLine(empty.Best);
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("no marks");
        }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "4\n82.5\n95\n2\nrejected\n4\n80\nTrue\nFalse\n80 60 95\n0\nno marks\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "abstraction",
    title: { en: "Abstraction", uk: "Абстракція" },
    slides: [
      { kind: "lecture", slug: "what-is-abstraction", title: { en: "What is abstraction", uk: "Що таке абстракція" } },
      { kind: "lecture", slug: "abstract-classes", title: { en: "Abstract classes", uk: "Абстрактні класи" } },
      {
        kind: "quiz",
        slug: "abstract-classes-quiz",
        title: { en: "Abstract classes", uk: "Абстрактні класи" },
        questions: [
          {
            id: "instantiate",
            mode: "single",
            prompt: {
              en: "`Shape` is an abstract class, and `Circle` is derived from it. Which line compiles?",
              uk: "`Shape` — абстрактний клас, а `Circle` походить від нього. Який рядок компілюється?",
            },
            options: [
              { id: "a", text: { en: "`Shape s = new Circle(1);`", uk: "`Shape s = new Circle(1);`" } },
              { id: "b", text: { en: "`Shape s = new Shape();`", uk: "`Shape s = new Shape();`" } },
              { id: "c", text: { en: "Both of them", uk: "Обидва" } },
            ],
            correct: ["a"],
          },
          {
            id: "abstract-member-needs-abstract-class",
            mode: "single",
            prompt: {
              en: "A class declares `public abstract double Area { get; }` but is declared as `class Shape` (without `abstract`). What happens?",
              uk: "Клас оголошує `public abstract double Area { get; }`, але сам оголошений як `class Shape` (без `abstract`). Що станеться?",
            },
            options: [
              { id: "a", text: { en: "A compile error: a class with an abstract member must be abstract", uk: "Помилка компіляції: клас з абстрактним членом мусить бути абстрактним" } },
              { id: "b", text: { en: "It compiles, and `Area` returns 0", uk: "Компілюється, а `Area` повертає 0" } },
              { id: "c", text: { en: "It compiles, and an exception is thrown when `Area` is read", uk: "Компілюється, а під час читання `Area` кидається виняток" } },
            ],
            correct: ["a"],
          },
          {
            id: "forgot-override",
            mode: "single",
            prompt: {
              en: "`Square : Shape` is not abstract and does not override the abstract member `Area`. What happens?",
              uk: "`Square : Shape` не є абстрактним і не перевизначає абстрактний член `Area`. Що станеться?",
            },
            options: [
              { id: "a", text: { en: "A compile error: `Square` does not implement the inherited abstract member", uk: "Помилка компіляції: `Square` не реалізує успадкований абстрактний член" } },
              { id: "b", text: { en: "`Square` silently gets an empty `Area`", uk: "`Square` мовчки отримує порожню `Area`" } },
              { id: "c", text: { en: "An exception at run time when `Area` is used", uk: "Виняток під час виконання, коли `Area` використовують" } },
            ],
            correct: ["a"],
          },
          {
            id: "contents",
            mode: "multi",
            prompt: {
              en: "What can an abstract class contain?",
              uk: "Що може містити абстрактний клас?",
            },
            options: [
              { id: "a", text: { en: "Fields", uk: "Поля" } },
              { id: "b", text: { en: "A constructor", uk: "Конструктор" } },
              { id: "c", text: { en: "Ordinary methods with code", uk: "Звичайні методи з кодом" } },
              { id: "d", text: { en: "Abstract members without a body", uk: "Абстрактні члени без тіла" } },
            ],
            correct: ["a", "b", "c", "d"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "shape-hierarchy",
        title: { en: "Shapes", uk: "Фігури" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `abstract class Shape
{
    public abstract double Area { get; }
    public abstract double Perimeter { get; }
    public abstract string Name { get; }

    public string Describe()
    {
        return Name + ": area " + Math.Round(Area, 2) + ", perimeter " + Math.Round(Perimeter, 2);
    }
}

// Write the classes Rectangle, Circle and Triangle here`,
          `        Shape[] shapes = { new Rectangle(3, 4), new Circle(1), new Triangle(3, 4, 5) };
        foreach (Shape s in shapes)
        {
            Console.WriteLine(s.Describe());
        }
        Console.WriteLine(Largest(shapes).Name);
        try
        {
            new Triangle(1, 2, 10);
        }
        catch (ArgumentException)
        {
            Console.WriteLine("not a triangle");
        }`,
          "",
          `    static Shape Largest(Shape[] shapes)
    {
        Shape best = shapes[0];
        foreach (Shape s in shapes)
        {
            if (s.Area > best.Area)
            {
                best = s;
            }
        }
        return best;
    }`,
        ),
        solution: PROGRAM_WITH(
          `abstract class Shape
{
    public abstract double Area { get; }
    public abstract double Perimeter { get; }
    public abstract string Name { get; }

    public string Describe()
    {
        return Name + ": area " + Math.Round(Area, 2) + ", perimeter " + Math.Round(Perimeter, 2);
    }
}

class Rectangle : Shape
{
    private readonly double width;
    private readonly double height;

    public Rectangle(double width, double height)
    {
        this.width = width;
        this.height = height;
    }

    public override double Area => width * height;
    public override double Perimeter => 2 * (width + height);
    public override string Name => "Rectangle";
}

class Circle : Shape
{
    private readonly double radius;

    public Circle(double radius)
    {
        this.radius = radius;
    }

    public override double Area => Math.PI * radius * radius;
    public override double Perimeter => 2 * Math.PI * radius;
    public override string Name => "Circle";
}

class Triangle : Shape
{
    private readonly double a;
    private readonly double b;
    private readonly double c;

    public Triangle(double a, double b, double c)
    {
        if (a <= 0 || b <= 0 || c <= 0 || a >= b + c || b >= a + c || c >= a + b)
        {
            throw new ArgumentException("These sides cannot form a triangle");
        }
        this.a = a;
        this.b = b;
        this.c = c;
    }

    public override double Area
    {
        get
        {
            double s = Perimeter / 2;
            return Math.Sqrt(s * (s - a) * (s - b) * (s - c));
        }
    }

    public override double Perimeter => a + b + c;
    public override string Name => "Triangle";
}`,
          `        Shape[] shapes = { new Rectangle(3, 4), new Circle(1), new Triangle(3, 4, 5) };
        foreach (Shape s in shapes)
        {
            Console.WriteLine(s.Describe());
        }
        Console.WriteLine(Largest(shapes).Name);
        try
        {
            new Triangle(1, 2, 10);
        }
        catch (ArgumentException)
        {
            Console.WriteLine("not a triangle");
        }`,
          "",
          `    static Shape Largest(Shape[] shapes)
    {
        Shape best = shapes[0];
        foreach (Shape s in shapes)
        {
            if (s.Area > best.Area)
            {
                best = s;
            }
        }
        return best;
    }`,
        ),
        expectedOutput:
          "Rectangle: area 12, perimeter 14\nCircle: area 3.14, perimeter 6.28\nTriangle: area 6, perimeter 12\nRectangle\nnot a triangle\n",
      },
      { kind: "lecture", slug: "programming-to-interfaces", title: { en: "Programming to interfaces", uk: "Програмування до інтерфейсів" } },
      {
        kind: "practice",
        slug: "loggers",
        title: { en: "Loggers", uk: "Журнали" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `interface ILogger
{
    void Log(string message);
}

class ConsoleLogger : ILogger
{
    public void Log(string message)
    {
        Console.WriteLine("console: " + message);
    }
}

class OrderService
{
    private readonly ILogger logger;

    public OrderService(ILogger logger)
    {
        this.logger = logger;
    }

    public void Place(int id)
    {
        logger.Log("Order " + id + " placed");
    }
}

// Write the classes ListLogger, PrefixLogger and MultiLogger here`,
          `        var list = new ListLogger();
        var service = new OrderService(new PrefixLogger(list, "[orders] "));
        service.Place(1);
        service.Place(2);
        Console.WriteLine(list.Count);
        foreach (string line in list.Messages)
        {
            Console.WriteLine(line);
        }

        var archive = new ListLogger();
        var multi = new MultiLogger(new ConsoleLogger(), new PrefixLogger(archive, "ARCHIVE "));
        new OrderService(multi).Place(3);
        Console.WriteLine(archive.Messages[0]);`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `interface ILogger
{
    void Log(string message);
}

class ConsoleLogger : ILogger
{
    public void Log(string message)
    {
        Console.WriteLine("console: " + message);
    }
}

class OrderService
{
    private readonly ILogger logger;

    public OrderService(ILogger logger)
    {
        this.logger = logger;
    }

    public void Place(int id)
    {
        logger.Log("Order " + id + " placed");
    }
}

class ListLogger : ILogger
{
    private readonly List<string> messages = new List<string>();

    public int Count => messages.Count;
    public string[] Messages => messages.ToArray();

    public void Log(string message)
    {
        messages.Add(message);
    }
}

class PrefixLogger : ILogger
{
    private readonly ILogger inner;
    private readonly string prefix;

    public PrefixLogger(ILogger inner, string prefix)
    {
        this.inner = inner;
        this.prefix = prefix;
    }

    public void Log(string message)
    {
        inner.Log(prefix + message);
    }
}

class MultiLogger : ILogger
{
    private readonly ILogger first;
    private readonly ILogger second;

    public MultiLogger(ILogger first, ILogger second)
    {
        this.first = first;
        this.second = second;
    }

    public void Log(string message)
    {
        first.Log(message);
        second.Log(message);
    }
}`,
          `        var list = new ListLogger();
        var service = new OrderService(new PrefixLogger(list, "[orders] "));
        service.Place(1);
        service.Place(2);
        Console.WriteLine(list.Count);
        foreach (string line in list.Messages)
        {
            Console.WriteLine(line);
        }

        var archive = new ListLogger();
        var multi = new MultiLogger(new ConsoleLogger(), new PrefixLogger(archive, "ARCHIVE "));
        new OrderService(multi).Place(3);
        Console.WriteLine(archive.Messages[0]);`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "2\n[orders] Order 1 placed\n[orders] Order 2 placed\nconsole: Order 3 placed\nARCHIVE Order 3 placed\n",
      },
      { kind: "lecture", slug: "template-method", title: { en: "The template method", uk: "Шаблонний метод" } },
      {
        kind: "practice",
        slug: "report-template",
        title: { en: "Report formats", uk: "Формати звітів" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `abstract class Report
{
    private readonly string[] items;

    protected Report(string[] items)
    {
        this.items = items;
    }

    protected int Count => items.Length;

    protected abstract string Header();
    protected abstract string FormatItem(int number, string item);

    protected virtual string Footer()
    {
        return "";
    }

    // The template method: the order of the steps is fixed here
    public string Build()
    {
        string text = Header() + "\\n";
        for (int i = 0; i < items.Length; i++)
        {
            text += FormatItem(i + 1, items[i]) + "\\n";
        }
        string footer = Footer();
        if (footer != "")
        {
            text += footer + "\\n";
        }
        return text;
    }
}

// Write the classes TextReport, CsvReport and MarkdownReport here`,
          `        var fruits = new[] { "apple", "pear", "plum" };
        Console.Write(new TextReport(fruits).Build());
        Console.WriteLine("---");
        Console.Write(new CsvReport(fruits).Build());
        Console.WriteLine("---");
        Console.Write(new MarkdownReport(fruits).Build());
        Console.WriteLine("---");
        Console.Write(new TextReport(new string[0]).Build());`,
        ),
        solution: PROGRAM_WITH(
          `abstract class Report
{
    private readonly string[] items;

    protected Report(string[] items)
    {
        this.items = items;
    }

    protected int Count => items.Length;

    protected abstract string Header();
    protected abstract string FormatItem(int number, string item);

    protected virtual string Footer()
    {
        return "";
    }

    // The template method: the order of the steps is fixed here
    public string Build()
    {
        string text = Header() + "\\n";
        for (int i = 0; i < items.Length; i++)
        {
            text += FormatItem(i + 1, items[i]) + "\\n";
        }
        string footer = Footer();
        if (footer != "")
        {
            text += footer + "\\n";
        }
        return text;
    }
}

class TextReport : Report
{
    public TextReport(string[] items) : base(items) { }

    protected override string Header() { return "REPORT"; }
    protected override string FormatItem(int number, string item) { return number + ". " + item; }
    protected override string Footer() { return "Total: " + Count + " items"; }
}

class CsvReport : Report
{
    public CsvReport(string[] items) : base(items) { }

    protected override string Header() { return "number,item"; }
    protected override string FormatItem(int number, string item) { return number + "," + item; }
}

class MarkdownReport : Report
{
    public MarkdownReport(string[] items) : base(items) { }

    protected override string Header() { return "# Fruits"; }
    protected override string FormatItem(int number, string item) { return "- " + item; }
    protected override string Footer() { return "_" + Count + " items_"; }
}`,
          `        var fruits = new[] { "apple", "pear", "plum" };
        Console.Write(new TextReport(fruits).Build());
        Console.WriteLine("---");
        Console.Write(new CsvReport(fruits).Build());
        Console.WriteLine("---");
        Console.Write(new MarkdownReport(fruits).Build());
        Console.WriteLine("---");
        Console.Write(new TextReport(new string[0]).Build());`,
        ),
        expectedOutput:
          "REPORT\n1. apple\n2. pear\n3. plum\nTotal: 3 items\n---\nnumber,item\n1,apple\n2,pear\n3,plum\n---\n# Fruits\n- apple\n- pear\n- plum\n_3 items_\n---\nREPORT\nTotal: 0 items\n",
      },
      { kind: "lecture", slug: "abstract-vs-interface", title: { en: "Abstract class or interface", uk: "Абстрактний клас чи інтерфейс" } },
      {
        kind: "quiz",
        slug: "abstraction-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "what-is-abstraction",
            mode: "single",
            prompt: { en: "What is abstraction?", uk: "Що таке абстракція?" },
            options: [
              { id: "a", text: { en: "Keeping what is important for the purpose and hiding or ignoring the rest", uk: "Збереження того, що важливе для мети, і приховування чи ігнорування решти" } },
              { id: "b", text: { en: "Making all the fields `private`", uk: "Робити всі поля `private`" } },
              { id: "c", text: { en: "Copying the code of a class into another class", uk: "Копіювання коду одного класу в інший" } },
            ],
            correct: ["a"],
          },
          {
            id: "abstraction-vs-encapsulation",
            mode: "single",
            prompt: {
              en: "Which statement describes the difference between abstraction and encapsulation best?",
              uk: "Яке твердження найкраще описує різницю між абстракцією та інкапсуляцією?",
            },
            options: [
              { id: "a", text: { en: "Abstraction chooses what the user sees, and encapsulation protects the inside so that only that can be reached", uk: "Абстракція вибирає, що бачить користувач, а інкапсуляція захищає середину, щоб дістатися можна було лише до цього" } },
              { id: "b", text: { en: "They are two names for the same thing", uk: "Це дві назви для одного й того самого" } },
              { id: "c", text: { en: "Abstraction is only for interfaces, and encapsulation only for structs", uk: "Абстракція лише для інтерфейсів, а інкапсуляція лише для структур" } },
            ],
            correct: ["a"],
          },
          {
            id: "which-tool",
            mode: "single",
            prompt: {
              en: "`Report`, `Photo` and `Chair` are unrelated classes, and all of them must be printable. What fits best?",
              uk: "`Report`, `Photo` і `Chair` — непов'язані класи, і всі вони мають бути придатними до друку. Що пасує найкраще?",
            },
            options: [
              { id: "a", text: { en: "An interface `IPrintable` that all of them implement", uk: "Інтерфейс `IPrintable`, який реалізують усі" } },
              { id: "b", text: { en: "A base class `Printable` that all of them derive from", uk: "Базовий клас `Printable`, від якого походять усі" } },
              { id: "c", text: { en: "A `static` class with a `Print(object)` method that checks the type", uk: "Статичний клас з методом `Print(object)`, що перевіряє тип" } },
            ],
            correct: ["a"],
          },
          {
            id: "template-fixed",
            mode: "single",
            prompt: {
              en: "In the template method pattern, which part is written in the base class?",
              uk: "У шаблоні шаблонного методу яка частина написана в базовому класі?",
            },
            options: [
              { id: "a", text: { en: "The skeleton of the algorithm: the order of the steps", uk: "Кістяк алгоритму: порядок кроків" } },
              { id: "b", text: { en: "Only the steps that differ", uk: "Лише кроки, що відрізняються" } },
              { id: "c", text: { en: "Nothing: the base class is empty", uk: "Нічого: базовий клас порожній" } },
            ],
            correct: ["a"],
          },
          {
            id: "fake-logger",
            mode: "single",
            prompt: {
              en: "`OrderService` gets an `ILogger` in its constructor. What does it let you do in a test?",
              uk: "`OrderService` отримує `ILogger` у конструкторі. Що це дозволяє зробити в тесті?",
            },
            options: [
              { id: "a", text: { en: "Pass a simple logger that remembers the messages, and check them", uk: "Передати простий журнал, що запам'ятовує повідомлення, і перевірити їх" } },
              { id: "b", text: { en: "Nothing: the real logger is always used", uk: "Нічого: завжди вживається справжній журнал" } },
              { id: "c", text: { en: "Make `Place` run faster", uk: "Прискорити виконання `Place`" } },
            ],
            correct: ["a"],
          },
          {
            id: "stack-list",
            mode: "single",
            prompt: {
              en: "What is the problem with `class Stack : List<int> { }`?",
              uk: "У чому проблема з `class Stack : List<int> { }`?",
            },
            options: [
              { id: "a", text: { en: "A stack inherits all the operations of a list, so anybody can insert into the middle: the class does not control its interface", uk: "Стек успадковує всі операції списку, тож будь-хто може вставляти в середину: клас не контролює свій інтерфейс" } },
              { id: "b", text: { en: "It does not compile", uk: "Це не компілюється" } },
              { id: "c", text: { en: "A stack cannot hold numbers", uk: "Стек не може тримати числа" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "text-pipeline",
        title: { en: "Practice: Text pipeline", uk: "Практика «Конвеєр тексту»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `interface ITextFilter
{
    string Apply(string text);
}

// Write TrimFilter, CollapseSpacesFilter, UpperFilter, RemoveDigitsFilter,
// ReplaceFilter and Pipeline here`,
          `        var clean = new Pipeline();
        clean.Add(new TrimFilter());
        clean.Add(new CollapseSpacesFilter());

        var shout = new Pipeline();
        shout.Add(clean);
        shout.Add(new UpperFilter());
        shout.Add(new ReplaceFilter("HELLO", "BYE"));

        Console.WriteLine("[" + clean.Apply("   hello    big   world  ") + "]");
        Console.WriteLine("[" + shout.Apply("   hello    big   world  ") + "]");
        Console.WriteLine(new RemoveDigitsFilter().Apply("a1b22c333"));
        Console.WriteLine(new Pipeline().Apply("unchanged"));
        Console.WriteLine(shout.Count);

        ITextFilter f = new ReplaceFilter("a", "o");
        Console.WriteLine(f.Apply("banana"));

        var sentence = new Pipeline().Add(new TrimFilter()).Add(new UpperFilter());
        Console.WriteLine(sentence.Apply("  quiet please "));`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `interface ITextFilter
{
    string Apply(string text);
}

class TrimFilter : ITextFilter
{
    public string Apply(string text)
    {
        return text.Trim();
    }
}

class CollapseSpacesFilter : ITextFilter
{
    public string Apply(string text)
    {
        string result = "";
        bool lastWasSpace = false;
        foreach (char c in text)
        {
            if (c == ' ' && lastWasSpace)
            {
                continue;
            }
            result += c;
            lastWasSpace = c == ' ';
        }
        return result;
    }
}

class UpperFilter : ITextFilter
{
    public string Apply(string text)
    {
        return text.ToUpperInvariant();
    }
}

class RemoveDigitsFilter : ITextFilter
{
    public string Apply(string text)
    {
        string result = "";
        foreach (char c in text)
        {
            if (c < '0' || c > '9')
            {
                result += c;
            }
        }
        return result;
    }
}

class ReplaceFilter : ITextFilter
{
    private readonly string from;
    private readonly string to;

    public ReplaceFilter(string from, string to)
    {
        this.from = from;
        this.to = to;
    }

    public string Apply(string text)
    {
        return text.Replace(from, to);
    }
}

class Pipeline : ITextFilter
{
    private readonly List<ITextFilter> filters = new List<ITextFilter>();

    public int Count => filters.Count;

    public Pipeline Add(ITextFilter filter)
    {
        filters.Add(filter);
        return this;
    }

    public string Apply(string text)
    {
        foreach (ITextFilter filter in filters)
        {
            text = filter.Apply(text);
        }
        return text;
    }
}`,
          `        var clean = new Pipeline();
        clean.Add(new TrimFilter());
        clean.Add(new CollapseSpacesFilter());

        var shout = new Pipeline();
        shout.Add(clean);
        shout.Add(new UpperFilter());
        shout.Add(new ReplaceFilter("HELLO", "BYE"));

        Console.WriteLine("[" + clean.Apply("   hello    big   world  ") + "]");
        Console.WriteLine("[" + shout.Apply("   hello    big   world  ") + "]");
        Console.WriteLine(new RemoveDigitsFilter().Apply("a1b22c333"));
        Console.WriteLine(new Pipeline().Apply("unchanged"));
        Console.WriteLine(shout.Count);

        ITextFilter f = new ReplaceFilter("a", "o");
        Console.WriteLine(f.Apply("banana"));

        var sentence = new Pipeline().Add(new TrimFilter()).Add(new UpperFilter());
        Console.WriteLine(sentence.Apply("  quiet please "));`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "[hello big world]\n[BYE BIG WORLD]\nabc\nunchanged\n3\nbonono\nQUIET PLEASE\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "polymorphism",
    title: { en: "Polymorphism", uk: "Поліморфізм" },
    slides: [
      { kind: "lecture", slug: "polymorphism-kinds", title: { en: "Kinds of polymorphism", uk: "Види поліморфізму" } },
      {
        kind: "practice",
        slug: "overloads",
        title: { en: "Overloads", uk: "Перевантаження" },
        language: "csharp",
        starter: PROGRAM(`    // Write the eight overloads of Show here

    static void Main()
    {
        Console.WriteLine(Show(5));
        Console.WriteLine(Show(5.5));
        Console.WriteLine(Show('x'));
        Console.WriteLine(Show(5L));
        Console.WriteLine(Show("hi"));
        Console.WriteLine(Show(true));
        Console.WriteLine(Show(new[] { 1, 2, 3 }));
        object o = "text";
        Console.WriteLine(Show(o));
        Console.WriteLine(Show(1, 2));
        Console.WriteLine(Show("ab", 3));
        Console.WriteLine(Show((object)5));
        string none = null;
        Console.WriteLine(Show(none));
    }`),
        solution: PROGRAM(`    static string Show(int n)
    {
        return "int:" + n;
    }

    static string Show(double d)
    {
        return "double:" + d;
    }

    static string Show(string s)
    {
        return "string:" + s;
    }

    static string Show(bool b)
    {
        return "bool:" + (b ? "yes" : "no");
    }

    static string Show(int[] items)
    {
        return "ints:" + string.Join(",", items);
    }

    static string Show(object o)
    {
        return "object:" + o;
    }

    static string Show(int a, int b)
    {
        return "pair:" + a + "-" + b;
    }

    static string Show(string s, int times)
    {
        string result = "";
        for (int i = 0; i < times; i++)
        {
            result += s;
        }
        return result;
    }

    static void Main()
    {
        Console.WriteLine(Show(5));
        Console.WriteLine(Show(5.5));
        Console.WriteLine(Show('x'));
        Console.WriteLine(Show(5L));
        Console.WriteLine(Show("hi"));
        Console.WriteLine(Show(true));
        Console.WriteLine(Show(new[] { 1, 2, 3 }));
        object o = "text";
        Console.WriteLine(Show(o));
        Console.WriteLine(Show(1, 2));
        Console.WriteLine(Show("ab", 3));
        Console.WriteLine(Show((object)5));
        string none = null;
        Console.WriteLine(Show(none));
    }`),
        expectedOutput: "int:5\ndouble:5.5\nint:120\ndouble:5\nstring:hi\nbool:yes\nints:1,2,3\nobject:text\npair:1-2\nababab\nobject:5\nstring:\n",
      },
      { kind: "lecture", slug: "equals-hashcode", title: { en: "Equals and GetHashCode", uk: "Equals та GetHashCode" } },
      {
        kind: "practice",
        slug: "equals-point",
        title: { en: "Equal points", uk: "Рівні точки" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Make Point a value object: Equals, GetHashCode, == and !=, and ToString
class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}`,
          `        var a = new Point(1, 2);
        var b = new Point(1, 2);
        var c = new Point(2, 1);
        Console.WriteLine(a == b);
        Console.WriteLine(a.Equals(b));
        Console.WriteLine(ReferenceEquals(a, b));
        Console.WriteLine(a != c);
        Console.WriteLine(a.Equals(null));
        Console.WriteLine(a.Equals("(1, 2)"));
        Console.WriteLine(a.GetHashCode() == b.GetHashCode());

        var set = new HashSet<Point> { a, b, c };
        Console.WriteLine(set.Count);
        Console.WriteLine(set.Contains(new Point(2, 1)));

        var names = new Dictionary<Point, string>();
        names[a] = "first";
        names[b] = "second";
        Console.WriteLine(names.Count + " " + names[new Point(1, 2)]);

        var list = new List<Point> { c, a };
        Console.WriteLine(list.IndexOf(new Point(1, 2)));
        Console.WriteLine(a);

        object boxed = b;
        Console.WriteLine(a.Equals(boxed));
        Point none = null;
        Console.WriteLine(none == null);
        Console.WriteLine(a == null);`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public override bool Equals(object obj)
    {
        Point other = obj as Point;
        if (ReferenceEquals(other, null))
        {
            return false;
        }
        return X == other.X && Y == other.Y;
    }

    public override int GetHashCode()
    {
        unchecked
        {
            return X * 31 + Y;
        }
    }

    public static bool operator ==(Point a, Point b)
    {
        if (ReferenceEquals(a, b))
        {
            return true;
        }
        if (ReferenceEquals(a, null) || ReferenceEquals(b, null))
        {
            return false;
        }
        return a.X == b.X && a.Y == b.Y;
    }

    public static bool operator !=(Point a, Point b)
    {
        return !(a == b);
    }

    public override string ToString()
    {
        return "(" + X + ", " + Y + ")";
    }
}`,
          `        var a = new Point(1, 2);
        var b = new Point(1, 2);
        var c = new Point(2, 1);
        Console.WriteLine(a == b);
        Console.WriteLine(a.Equals(b));
        Console.WriteLine(ReferenceEquals(a, b));
        Console.WriteLine(a != c);
        Console.WriteLine(a.Equals(null));
        Console.WriteLine(a.Equals("(1, 2)"));
        Console.WriteLine(a.GetHashCode() == b.GetHashCode());

        var set = new HashSet<Point> { a, b, c };
        Console.WriteLine(set.Count);
        Console.WriteLine(set.Contains(new Point(2, 1)));

        var names = new Dictionary<Point, string>();
        names[a] = "first";
        names[b] = "second";
        Console.WriteLine(names.Count + " " + names[new Point(1, 2)]);

        var list = new List<Point> { c, a };
        Console.WriteLine(list.IndexOf(new Point(1, 2)));
        Console.WriteLine(a);

        object boxed = b;
        Console.WriteLine(a.Equals(boxed));
        Point none = null;
        Console.WriteLine(none == null);
        Console.WriteLine(a == null);`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "True\nTrue\nFalse\nTrue\nFalse\nFalse\nTrue\n2\nTrue\n1 second\n1\n(1, 2)\nTrue\nTrue\nFalse\n",
      },
      { kind: "lecture", slug: "polymorphic-collections", title: { en: "Polymorphic collections", uk: "Поліморфні колекції" } },
      {
        kind: "practice",
        slug: "payroll",
        title: { en: "Payroll", uk: "Нарахування зарплат" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `abstract class Employee
{
    public string Name { get; }

    protected Employee(string name)
    {
        Name = name;
    }

    public abstract int MonthlyPay();

    public virtual string Role { get { return "staff"; } }

    public override string ToString()
    {
        return Name + " (" + Role + "): " + MonthlyPay();
    }
}

class ByPay : IComparer<Employee>
{
    public int Compare(Employee x, Employee y)
    {
        return y.MonthlyPay().CompareTo(x.MonthlyPay());
    }
}

// Write the classes Developer, Manager and Intern here`,
          `        var staff = new List<Employee>
        {
            new Developer("Ann", 3000),
            new Manager("Bob", 4000, 5),
            new Intern("Cy", 80, 15),
            new Developer("Di", 3500)
        };
        foreach (Employee e in staff)
        {
            Console.WriteLine(e);
        }
        Console.WriteLine("Total: " + Total(staff));
        Console.WriteLine("Top: " + Top(staff).Name);

        staff.Sort(new ByPay());
        string names = "";
        foreach (Employee e in staff)
        {
            names += (names == "" ? "" : " ") + e.Name;
        }
        Console.WriteLine(names);`,
          "using System.Collections.Generic;",
          `    static int Total(List<Employee> staff)
    {
        int total = 0;
        foreach (Employee e in staff)
        {
            total += e.MonthlyPay();
        }
        return total;
    }

    static Employee Top(List<Employee> staff)
    {
        Employee best = staff[0];
        foreach (Employee e in staff)
        {
            if (e.MonthlyPay() > best.MonthlyPay())
            {
                best = e;
            }
        }
        return best;
    }`,
        ),
        solution: PROGRAM_WITH(
          `abstract class Employee
{
    public string Name { get; }

    protected Employee(string name)
    {
        Name = name;
    }

    public abstract int MonthlyPay();

    public virtual string Role { get { return "staff"; } }

    public override string ToString()
    {
        return Name + " (" + Role + "): " + MonthlyPay();
    }
}

class ByPay : IComparer<Employee>
{
    public int Compare(Employee x, Employee y)
    {
        return y.MonthlyPay().CompareTo(x.MonthlyPay());
    }
}

class Developer : Employee
{
    private readonly int salary;

    public Developer(string name, int salary) : base(name)
    {
        this.salary = salary;
    }

    public override int MonthlyPay()
    {
        return salary;
    }
}

class Manager : Employee
{
    private readonly int salary;
    private readonly int reports;

    public Manager(string name, int salary, int reports) : base(name)
    {
        this.salary = salary;
        this.reports = reports;
    }

    public override int MonthlyPay()
    {
        return salary + 100 * reports;
    }

    public override string Role { get { return "manager"; } }
}

class Intern : Employee
{
    private readonly int hours;
    private readonly int rate;

    public Intern(string name, int hours, int rate) : base(name)
    {
        this.hours = hours;
        this.rate = rate;
    }

    public override int MonthlyPay()
    {
        return hours * rate;
    }

    public override string Role { get { return "intern"; } }
}`,
          `        var staff = new List<Employee>
        {
            new Developer("Ann", 3000),
            new Manager("Bob", 4000, 5),
            new Intern("Cy", 80, 15),
            new Developer("Di", 3500)
        };
        foreach (Employee e in staff)
        {
            Console.WriteLine(e);
        }
        Console.WriteLine("Total: " + Total(staff));
        Console.WriteLine("Top: " + Top(staff).Name);

        staff.Sort(new ByPay());
        string names = "";
        foreach (Employee e in staff)
        {
            names += (names == "" ? "" : " ") + e.Name;
        }
        Console.WriteLine(names);`,
          "using System.Collections.Generic;",
          `    static int Total(List<Employee> staff)
    {
        int total = 0;
        foreach (Employee e in staff)
        {
            total += e.MonthlyPay();
        }
        return total;
    }

    static Employee Top(List<Employee> staff)
    {
        Employee best = staff[0];
        foreach (Employee e in staff)
        {
            if (e.MonthlyPay() > best.MonthlyPay())
            {
                best = e;
            }
        }
        return best;
    }`,
        ),
        expectedOutput:
          "Ann (staff): 3000\nBob (manager): 4500\nCy (intern): 1200\nDi (staff): 3500\nTotal: 12200\nTop: Bob\nBob Di Ann Cy\n",
      },
      { kind: "lecture", slug: "replace-conditionals", title: { en: "Replacing conditionals", uk: "Заміна умовних конструкцій" } },
      {
        kind: "practice",
        slug: "refactor-type-switch",
        title: { en: "Refactoring a type switch", uk: "Рефакторинг перевірки типу" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class Circle
{
    public double Radius;
    public Circle(double radius) { Radius = radius; }
}

class Square
{
    public double Side;
    public Square(double side) { Side = side; }
}

class Rectangle
{
    public double Width;
    public double Height;
    public Rectangle(double width, double height) { Width = width; Height = height; }
}

// Replace this chain of type checks with polymorphism
static class Geometry
{
    public static double Area(object shape)
    {
        if (shape is Circle c) return Math.PI * c.Radius * c.Radius;
        if (shape is Square s) return s.Side * s.Side;
        if (shape is Rectangle r) return r.Width * r.Height;
        throw new ArgumentException("Unknown shape");
    }

    public static string Name(object shape)
    {
        if (shape is Circle) return "Circle";
        if (shape is Square) return "Square";
        if (shape is Rectangle) return "Rectangle";
        throw new ArgumentException("Unknown shape");
    }
}`,
          `        Shape[] shapes = { new Circle(2), new Square(3), new Rectangle(3, 4), new Triangle(6, 3) };
        foreach (Shape s in shapes)
        {
            Console.WriteLine(s.Name + ": " + Math.Round(s.Area, 2));
        }
        Console.WriteLine("Total: " + Math.Round(TotalArea(shapes), 2));`,
          "",
          `    static double TotalArea(Shape[] shapes)
    {
        double total = 0;
        foreach (Shape s in shapes)
        {
            total += s.Area;
        }
        return total;
    }`,
        ),
        solution: PROGRAM_WITH(
          `abstract class Shape
{
    public abstract double Area { get; }
    public abstract string Name { get; }
}

class Circle : Shape
{
    private readonly double radius;

    public Circle(double radius) { this.radius = radius; }

    public override double Area => Math.PI * radius * radius;
    public override string Name => "Circle";
}

class Square : Shape
{
    private readonly double side;

    public Square(double side) { this.side = side; }

    public override double Area => side * side;
    public override string Name => "Square";
}

class Rectangle : Shape
{
    private readonly double width;
    private readonly double height;

    public Rectangle(double width, double height)
    {
        this.width = width;
        this.height = height;
    }

    public override double Area => width * height;
    public override string Name => "Rectangle";
}

class Triangle : Shape
{
    private readonly double baseLength;
    private readonly double height;

    public Triangle(double baseLength, double height)
    {
        this.baseLength = baseLength;
        this.height = height;
    }

    public override double Area => baseLength * height / 2;
    public override string Name => "Triangle";
}`,
          `        Shape[] shapes = { new Circle(2), new Square(3), new Rectangle(3, 4), new Triangle(6, 3) };
        foreach (Shape s in shapes)
        {
            Console.WriteLine(s.Name + ": " + Math.Round(s.Area, 2));
        }
        Console.WriteLine("Total: " + Math.Round(TotalArea(shapes), 2));`,
          "",
          `    static double TotalArea(Shape[] shapes)
    {
        double total = 0;
        foreach (Shape s in shapes)
        {
            total += s.Area;
        }
        return total;
    }`,
        ),
        expectedOutput: "Circle: 12.57\nSquare: 9\nRectangle: 12\nTriangle: 9\nTotal: 42.57\n",
      },
      {
        kind: "quiz",
        slug: "polymorphism-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "overload-static",
            mode: "single",
            prompt: {
              en: "There are two methods, `Show(object o)` and `Show(string s)`. What does this call choose?\n\n```csharp\nobject o = \"text\";\nShow(o);\n```",
              uk: "Є два методи, `Show(object o)` та `Show(string s)`. Що вибирає цей виклик?\n\n```csharp\nobject o = \"text\";\nShow(o);\n```",
            },
            options: [
              { id: "a", text: { en: "`Show(object)`: the compiler decides by the declared type", uk: "`Show(object)`: компілятор вирішує за оголошеним типом" } },
              { id: "b", text: { en: "`Show(string)`: the object is a string", uk: "`Show(string)`: об'єкт є рядком" } },
              { id: "c", text: { en: "It is a compile error: the call is ambiguous", uk: "Це помилка компіляції: виклик неоднозначний" } },
            ],
            correct: ["a"],
          },
          {
            id: "override-dynamic",
            mode: "single",
            prompt: {
              en: "When is the version of an `override` method chosen?",
              uk: "Коли вибирається версія методу `override`?",
            },
            options: [
              { id: "a", text: { en: "At run time, by the actual type of the object", uk: "Під час виконання, за справжнім типом об'єкта" } },
              { id: "b", text: { en: "At compile time, by the declared type of the variable", uk: "Під час компіляції, за оголошеним типом змінної" } },
              { id: "c", text: { en: "When the program is installed", uk: "Під час установлення програми" } },
            ],
            correct: ["a"],
          },
          {
            id: "default-equality",
            mode: "single",
            prompt: {
              en: "`Point` is a class that does not override `Equals` or `==`. What does this print?\n\n```csharp\nvar a = new Point(1, 2);\nvar b = new Point(1, 2);\nConsole.WriteLine(a == b);\n```",
              uk: "`Point` — клас, що не перевизначає `Equals` чи `==`. Що друкує цей код?\n\n```csharp\nvar a = new Point(1, 2);\nvar b = new Point(1, 2);\nConsole.WriteLine(a == b);\n```",
            },
            options: [
              { id: "a", text: { en: "False: two different objects are compared by reference", uk: "False: два різні об'єкти порівнюються за посиланням" } },
              { id: "b", text: { en: "True: the fields are equal", uk: "True: поля рівні" } },
              { id: "c", text: { en: "It does not compile", uk: "Він не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "gethashcode",
            mode: "single",
            prompt: {
              en: "Why must you override `GetHashCode()` when you override `Equals(object)`?",
              uk: "Чому ви мусите перевизначити `GetHashCode()`, коли перевизначаєте `Equals(object)`?",
            },
            options: [
              { id: "a", text: { en: "Equal objects must have equal hash codes, or `HashSet` and `Dictionary` will not find them", uk: "Рівні об'єкти мусять мати рівні хеш-коди, інакше `HashSet` і `Dictionary` їх не знайдуть" } },
              { id: "b", text: { en: "The compiler cannot compile `Equals` without it", uk: "Компілятор не може скомпілювати `Equals` без нього" } },
              { id: "c", text: { en: "It makes the object smaller in memory", uk: "Це зменшує об'єкт у пам'яті" } },
            ],
            correct: ["a"],
          },
          {
            id: "type-chain",
            mode: "single",
            prompt: {
              en: "A method has a chain `if (x is A) ... else if (x is B) ... else if (x is C) ...`, and it is repeated in five methods. What is the best fix?",
              uk: "У методі є ланцюжок `if (x is A) ... else if (x is B) ... else if (x is C) ...`, і він повторюється в п'яти методах. Яке виправлення найкраще?",
            },
            options: [
              { id: "a", text: { en: "Add a virtual (or abstract) method to the base type, and move each branch to its class", uk: "Додати віртуальний (або абстрактний) метод до базового типу й перенести кожну гілку в її клас" } },
              { id: "b", text: { en: "Replace the `if` chain with a `switch` of the same shape", uk: "Замінити ланцюжок `if` на `switch` такої самої форми" } },
              { id: "c", text: { en: "Copy the chain into a helper method, and call it from the five methods", uk: "Скопіювати ланцюжок у допоміжний метод і викликати його з п'яти методів" } },
            ],
            correct: ["a"],
          },
          {
            id: "list-invariance",
            mode: "single",
            prompt: {
              en: "`Dog` is derived from `Animal`. Which line does **not** compile?",
              uk: "`Dog` походить від `Animal`. Який рядок **не** компілюється?",
            },
            options: [
              { id: "a", text: { en: "`List<Animal> animals = new List<Dog>();`", uk: "`List<Animal> animals = new List<Dog>();`" } },
              { id: "b", text: { en: "`IEnumerable<Animal> animals = new List<Dog>();`", uk: "`IEnumerable<Animal> animals = new List<Dog>();`" } },
              { id: "c", text: { en: "`Animal[] animals = new Dog[3];`", uk: "`Animal[] animals = new Dog[3];`" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "expression-tree",
        title: { en: "Practice: Expression tree", uk: "Практика «Дерево виразу»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `abstract class Expr
{
    public abstract int Evaluate(Dictionary<string, int> variables);
    public abstract int Depth { get; }
    public abstract override string ToString();
}

// Write the classes Number, Variable, Add, Multiply and Negate here`,
          `        var vars = new Dictionary<string, int> { { "x", 4 } };

        Expr e = new Multiply(new Add(new Number(2), new Number(3)), new Variable("x"));
        Console.WriteLine(e);
        Console.WriteLine(e.Evaluate(vars));
        Console.WriteLine(e.Depth);

        Expr n = new Negate(new Add(new Variable("x"), new Number(10)));
        Console.WriteLine(n + " = " + n.Evaluate(vars));
        Console.WriteLine(n.Depth);

        Expr big = new Add(e, n);
        Console.WriteLine(big);
        Console.WriteLine(big.Evaluate(vars));
        Console.WriteLine(big.Depth);

        try
        {
            new Variable("y").Evaluate(vars);
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("unknown variable");
        }`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `abstract class Expr
{
    public abstract int Evaluate(Dictionary<string, int> variables);
    public abstract int Depth { get; }
    public abstract override string ToString();
}

class Number : Expr
{
    private readonly int value;

    public Number(int value) { this.value = value; }

    public override int Evaluate(Dictionary<string, int> variables) { return value; }
    public override int Depth { get { return 1; } }
    public override string ToString() { return value.ToString(); }
}

class Variable : Expr
{
    private readonly string name;

    public Variable(string name) { this.name = name; }

    public override int Evaluate(Dictionary<string, int> variables)
    {
        int value;
        if (!variables.TryGetValue(name, out value))
        {
            throw new InvalidOperationException("Unknown variable " + name);
        }
        return value;
    }

    public override int Depth { get { return 1; } }
    public override string ToString() { return name; }
}

class Add : Expr
{
    private readonly Expr left;
    private readonly Expr right;

    public Add(Expr left, Expr right)
    {
        this.left = left;
        this.right = right;
    }

    public override int Evaluate(Dictionary<string, int> variables)
    {
        return left.Evaluate(variables) + right.Evaluate(variables);
    }

    public override int Depth { get { return 1 + Math.Max(left.Depth, right.Depth); } }
    public override string ToString() { return "(" + left + " + " + right + ")"; }
}

class Multiply : Expr
{
    private readonly Expr left;
    private readonly Expr right;

    public Multiply(Expr left, Expr right)
    {
        this.left = left;
        this.right = right;
    }

    public override int Evaluate(Dictionary<string, int> variables)
    {
        return left.Evaluate(variables) * right.Evaluate(variables);
    }

    public override int Depth { get { return 1 + Math.Max(left.Depth, right.Depth); } }
    public override string ToString() { return "(" + left + " * " + right + ")"; }
}

class Negate : Expr
{
    private readonly Expr inner;

    public Negate(Expr inner) { this.inner = inner; }

    public override int Evaluate(Dictionary<string, int> variables) { return -inner.Evaluate(variables); }
    public override int Depth { get { return 1 + inner.Depth; } }
    public override string ToString() { return "-" + inner; }
}`,
          `        var vars = new Dictionary<string, int> { { "x", 4 } };

        Expr e = new Multiply(new Add(new Number(2), new Number(3)), new Variable("x"));
        Console.WriteLine(e);
        Console.WriteLine(e.Evaluate(vars));
        Console.WriteLine(e.Depth);

        Expr n = new Negate(new Add(new Variable("x"), new Number(10)));
        Console.WriteLine(n + " = " + n.Evaluate(vars));
        Console.WriteLine(n.Depth);

        Expr big = new Add(e, n);
        Console.WriteLine(big);
        Console.WriteLine(big.Evaluate(vars));
        Console.WriteLine(big.Depth);

        try
        {
            new Variable("y").Evaluate(vars);
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("unknown variable");
        }`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "((2 + 3) * x)\n20\n3\n-(x + 10) = -14\n3\n(((2 + 3) * x) + -(x + 10))\n6\n4\nunknown variable\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "structs",
    title: { en: "Structures", uk: "Структури" },
    slides: [
      { kind: "lecture", slug: "struct-declaration", title: { en: "Declaring a struct", uk: "Оголошення структури" } },
      { kind: "lecture", slug: "struct-fields", title: { en: "Initializing struct fields", uk: "Ініціалізація полів структури" } },
      {
        kind: "quiz",
        slug: "struct-or-class",
        title: { en: "Struct or class?", uk: "Структура чи клас?" },
        questions: [
          {
            id: "value-type",
            mode: "single",
            prompt: { en: "Which of these is a value type?", uk: "Який із цих типів є типом-значенням?" },
            options: [
              { id: "a", text: { en: "`struct Point`", uk: "`struct Point`" } },
              { id: "b", text: { en: "`class Point`", uk: "`class Point`" } },
              { id: "c", text: { en: "`string`", uk: "`string`" } },
            ],
            correct: ["a"],
          },
          {
            id: "struct-copy",
            mode: "single",
            prompt: {
              en: "After `S b = a;` and `b.X = 5;`, what is `a.X`? (`S` is a struct)",
              uk: "Після `S b = a;` і `b.X = 5;`, чому дорівнює `a.X`? (`S` — структура)",
            },
            options: [
              { id: "a", text: { en: "Unchanged: the struct was copied", uk: "Не змінилося: структуру скопійовано" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "It does not compile", uk: "Не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "small-value",
            mode: "single",
            prompt: {
              en: "What is usually the best choice for a small immutable value, such as a 2D point?",
              uk: "Що зазвичай найкраще для малого незмінного значення, наприклад двовимірної точки?",
            },
            options: [
              { id: "a", text: { en: "A struct", uk: "Структура" } },
              { id: "b", text: { en: "A class with a public list of objects", uk: "Клас із публічним списком об'єктів" } },
              { id: "c", text: { en: "An interface", uk: "Інтерфейс" } },
            ],
            correct: ["a"],
          },
          {
            id: "struct-limits",
            mode: "single",
            prompt: { en: "Which of these can a struct NOT do?", uk: "Що з цього структура НЕ може?" },
            options: [
              { id: "a", text: { en: "Implement an interface", uk: "Реалізувати інтерфейс" } },
              { id: "b", text: { en: "Have a constructor with parameters", uk: "Мати конструктор з параметрами" } },
              { id: "c", text: { en: "Inherit from a class", uk: "Успадковуватися від класу" } },
            ],
            correct: ["c"],
          },
        ],
      },
      { kind: "lecture", slug: "struct-passing", title: { en: "Passing a struct to a method", uk: "Передача структури в метод" } },
      { kind: "lecture", slug: "ref-keyword", title: { en: "The ref keyword", uk: "Ключове слово ref" } },
      {
        kind: "quiz",
        slug: "struct-memory-maps",
        title: { en: "Memory maps", uk: "Карти пам'яті" },
        questions: [
          {
            id: "struct-assign",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nstruct S { public int X; }\n\nS a = new S { X = 1 };\nS b = a;\nb.X = 5;\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstruct S { public int X; }\n\nS a = new S { X = 1 };\nS b = a;\nb.X = 5;\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "9", uk: "9" } },
            ],
            correct: ["a"],
          },
          {
            id: "class-assign",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nclass C { public int X; }\n\nC a = new C { X = 1 };\nC b = a;\nb.X = 5;\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nclass C { public int X; }\n\nC a = new C { X = 1 };\nC b = a;\nb.X = 5;\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "9", uk: "9" } },
            ],
            correct: ["b"],
          },
          {
            id: "ref-int",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nstatic void Set(ref int n) { n = 9; }\n\nint v = 1;\nSet(ref v);\nConsole.WriteLine(v);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstatic void Set(ref int n) { n = 9; }\n\nint v = 1;\nSet(ref v);\nConsole.WriteLine(v);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "9", uk: "9" } },
            ],
            correct: ["c"],
          },
          {
            id: "value-int",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nstatic void Set(int n) { n = 9; }\n\nint v = 1;\nSet(v);\nConsole.WriteLine(v);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstatic void Set(int n) { n = 9; }\n\nint v = 1;\nSet(v);\nConsole.WriteLine(v);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "9", uk: "9" } },
            ],
            correct: ["a"],
          },
          {
            id: "struct-by-value",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nstruct S { public int X; }\nstatic void Set(S s) { s.X = 9; }\n\nS a = new S { X = 1 };\nSet(a);\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstruct S { public int X; }\nstatic void Set(S s) { s.X = 9; }\n\nS a = new S { X = 1 };\nSet(a);\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "9", uk: "9" } },
            ],
            correct: ["a"],
          },
          {
            id: "class-reassign",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nclass C { public int X; }\nstatic void Replace(C c) { c = new C { X = 9 }; }\n\nC a = new C { X = 1 };\nReplace(a);\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nclass C { public int X; }\nstatic void Replace(C c) { c = new C { X = 9 }; }\n\nC a = new C { X = 1 };\nReplace(a);\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "9", uk: "9" } },
            ],
            correct: ["a"],
          },
          {
            id: "struct-by-ref",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nstruct S { public int X; }\nstatic void Set(ref S s) { s.X = 9; }\n\nS a = new S { X = 1 };\nSet(ref a);\nConsole.WriteLine(a.X);\n```",
              uk: "Що друкує цей код?\n\n```csharp\nstruct S { public int X; }\nstatic void Set(ref S s) { s.X = 9; }\n\nS a = new S { X = 1 };\nSet(ref a);\nConsole.WriteLine(a.X);\n```",
            },
            options: [
              { id: "a", text: { en: "1", uk: "1" } },
              { id: "b", text: { en: "5", uk: "5" } },
              { id: "c", text: { en: "9", uk: "9" } },
            ],
            correct: ["c"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "ref-practice",
        title: { en: "Using ref", uk: "Застосування ref" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `struct Counter
{
    public int Value;

    public void Add(int n)
    {
        Value += n;
    }
}`,
          `        int a = 3, b = 7;
        Swap(ref a, ref b);
        Console.WriteLine(a + " " + b);
        Double(ref a);
        Console.WriteLine(a);

        Counter c = new Counter();
        c.Add(5);
        Reset(ref c);
        Console.WriteLine(c.Value);
        c.Add(2);
        Console.WriteLine(c.Value);

        int x = 1;
        Double(ref x);
        Double(ref x);
        Double(ref x);
        Console.WriteLine(x);
        Swap(ref x, ref x);
        Console.WriteLine(x);`,
          "",
          `    // Exchanges the values of the two variables
    static void Swap(ref int a, ref int b)
    {
        // Write your code here
    }

    // Doubles the value of the variable
    static void Double(ref int x)
    {
        // Write your code here
    }

    // Sets the Value of the counter to 0
    static void Reset(ref Counter counter)
    {
        // Write your code here
    }`,
        ),
        solution: PROGRAM_WITH(
          `struct Counter
{
    public int Value;

    public void Add(int n)
    {
        Value += n;
    }
}`,
          `        int a = 3, b = 7;
        Swap(ref a, ref b);
        Console.WriteLine(a + " " + b);
        Double(ref a);
        Console.WriteLine(a);

        Counter c = new Counter();
        c.Add(5);
        Reset(ref c);
        Console.WriteLine(c.Value);
        c.Add(2);
        Console.WriteLine(c.Value);

        int x = 1;
        Double(ref x);
        Double(ref x);
        Double(ref x);
        Console.WriteLine(x);
        Swap(ref x, ref x);
        Console.WriteLine(x);`,
          "",
          `    // Exchanges the values of the two variables
    static void Swap(ref int a, ref int b)
    {
        int t = a;
        a = b;
        b = t;
    }

    // Doubles the value of the variable
    static void Double(ref int x)
    {
        x = x * 2;
    }

    // Sets the Value of the counter to 0
    static void Reset(ref Counter counter)
    {
        counter.Value = 0;
    }`,
        ),
        expectedOutput: "7 3\n14\n0\n2\n8\n8\n",
      },
      { kind: "lecture", slug: "boxing-unboxing", title: { en: "Boxing / unboxing", uk: "Boxing / unboxing" } },
      {
        kind: "quiz",
        slug: "boxing-quiz",
        title: { en: "Consequences of boxing", uk: "Наслідки boxing" },
        questions: [
          {
            id: "boxing-copy",
            mode: "single",
            prompt: { en: "Which statement about boxing is true?", uk: "Яке твердження про boxing правильне?" },
            options: [
              { id: "a", text: { en: "Assigning an `int` to an `object` creates a new heap object that holds a copy of the value", uk: "Присвоєння `int` змінній `object` створює новий об'єкт у купі, що тримає копію значення" } },
              { id: "b", text: { en: "The `int` variable becomes a reference, and nothing is copied", uk: "Змінна `int` стає посиланням, і нічого не копіюється" } },
              { id: "c", text: { en: "It costs nothing: the compiler removes it", uk: "Це нічого не коштує: компілятор його прибирає" } },
            ],
            correct: ["a"],
          },
          {
            id: "wrong-unbox",
            mode: "single",
            prompt: {
              en: "What happens here?\n\n```csharp\nobject o = 5;\nlong n = (long)o;\n```",
              uk: "Що станеться тут?\n\n```csharp\nobject o = 5;\nlong n = (long)o;\n```",
            },
            options: [
              { id: "a", text: { en: "`n` becomes 5", uk: "`n` стає 5" } },
              { id: "b", text: { en: "It does not compile", uk: "Не компілюється" } },
              { id: "c", text: { en: "An `InvalidCastException` at run time: the box holds an `int`, not a `long`", uk: "`InvalidCastException` під час виконання: у коробці `int`, а не `long`" } },
            ],
            correct: ["c"],
          },
        ],
      },
      { kind: "lecture", slug: "struct-properties", title: { en: "Structs and properties", uk: "Структури і властивості" } },
      { kind: "lecture", slug: "why-structs", title: { en: "Why do we need structs", uk: "Навіщо потрібні структури" } },
      {
        kind: "quiz",
        slug: "structs-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "copy-vs-reference",
            mode: "single",
            prompt: { en: "What is the main difference between a struct and a class?", uk: "У чому головна різниця між структурою і класом?" },
            options: [
              { id: "a", text: { en: "On assignment a struct copies its data, while a class copies a reference", uk: "Під час присвоєння структура копіює свої дані, а клас копіює посилання" } },
              { id: "b", text: { en: "A struct is always faster, and a class is always slower", uk: "Структура завжди швидша, а клас завжди повільніший" } },
              { id: "c", text: { en: "A struct cannot have fields", uk: "Структура не може мати полів" } },
            ],
            correct: ["a"],
          },
          {
            id: "struct-inherit",
            mode: "single",
            prompt: { en: "Can a struct inherit from a class?", uk: "Чи може структура успадковуватися від класу?" },
            options: [
              { id: "a", text: { en: "No", uk: "Ні" } },
              { id: "b", text: { en: "Yes, always", uk: "Так, завжди" } },
              { id: "c", text: { en: "Yes, if the class is `static`", uk: "Так, якщо клас `static`" } },
            ],
            correct: ["a"],
          },
          {
            id: "ref-meaning",
            mode: "single",
            prompt: { en: "What does `ref` mean in a parameter?", uk: "Що означає `ref` у параметрі?" },
            options: [
              { id: "a", text: { en: "The method receives the caller's variable itself, not a copy", uk: "Метод отримує саму змінну викликаючого, а не копію" } },
              { id: "b", text: { en: "The parameter is read-only", uk: "Параметр доступний лише для читання" } },
              { id: "c", text: { en: "The value is sent to another thread", uk: "Значення надсилається в інший потік" } },
            ],
            correct: ["a"],
          },
          {
            id: "out-meaning",
            mode: "single",
            prompt: { en: "Which is true about an `out` parameter?", uk: "Що правильно про параметр `out`?" },
            options: [
              { id: "a", text: { en: "The method must assign it before it returns", uk: "Метод мусить присвоїти його до повернення" } },
              { id: "b", text: { en: "It must have a value before the call", uk: "Перед викликом він мусить мати значення" } },
              { id: "c", text: { en: "It cannot be used with structs", uk: "Його не можна вживати зі структурами" } },
            ],
            correct: ["a"],
          },
          {
            id: "list-of-int",
            mode: "single",
            prompt: { en: "Why is `List<int>` faster than `ArrayList` for numbers?", uk: "Чому `List<int>` швидший за `ArrayList` для чисел?" },
            options: [
              { id: "a", text: { en: "`List<int>` stores plain integers, so there is no boxing", uk: "`List<int>` зберігає прості цілі, тож boxing немає" } },
              { id: "b", text: { en: "`ArrayList` is only a name, it is the same class", uk: "`ArrayList` — лише назва, це той самий клас" } },
              { id: "c", text: { en: "`List<int>` uses fewer digits", uk: "`List<int>` використовує менше цифр" } },
            ],
            correct: ["a"],
          },
        ],
      },
    ],
  },
  {
    slug: "stacks-queues-generics",
    title: { en: "Stacks, queues, generics", uk: "Черги, стеки, дженерики" },
    slides: [
      { kind: "lecture", slug: "stacks-and-queues", title: { en: "Stacks and queues", uk: "Стеки і черги" } },
      { kind: "lecture", slug: "queue-linked-list", title: { en: "A queue on linked lists", uk: "Черга на зв'язних списках" } },
      {
        kind: "quiz",
        slug: "stacks-queues-quiz",
        title: { en: "Stacks and queues", uk: "Стеки і черги" },
        questions: [
          {
            id: "stack-order",
            mode: "single",
            prompt: { en: "In which order does a stack return its items?", uk: "У якому порядку стек повертає елементи?" },
            options: [
              { id: "a", text: { en: "Last in, first out", uk: "Останнім прийшов — першим вийшов" } },
              { id: "b", text: { en: "First in, first out", uk: "Першим прийшов — першим вийшов" } },
              { id: "c", text: { en: "In random order", uk: "У випадковому порядку" } },
            ],
            correct: ["a"],
          },
          {
            id: "queue-dequeue",
            mode: "single",
            prompt: {
              en: "What does this print?\n\n```csharp\nvar q = new Queue<int>();\nq.Enqueue(1);\nq.Enqueue(2);\nConsole.WriteLine(q.Dequeue());\n```",
              uk: "Що друкує цей код?\n\n```csharp\nvar q = new Queue<int>();\nq.Enqueue(1);\nq.Enqueue(2);\nConsole.WriteLine(q.Dequeue());\n```",
            },
            options: [
              { id: "a", text: { en: "2", uk: "2" } },
              { id: "b", text: { en: "1", uk: "1" } },
              { id: "c", text: { en: "It does not compile", uk: "Не компілюється" } },
            ],
            correct: ["b"],
          },
          {
            id: "pop-empty",
            mode: "single",
            prompt: { en: "What happens when you call `Pop()` on an empty stack?", uk: "Що станеться, коли викликати `Pop()` на порожньому стеку?" },
            options: [
              { id: "a", text: { en: "It returns 0", uk: "Повертає 0" } },
              { id: "b", text: { en: "An `InvalidOperationException` is thrown", uk: "Кидається `InvalidOperationException`" } },
              { id: "c", text: { en: "It returns `null` silently", uk: "Мовчки повертає `null`" } },
            ],
            correct: ["b"],
          },
          {
            id: "brackets-structure",
            mode: "single",
            prompt: { en: "Which structure is the natural choice for checking that brackets match?", uk: "Яка структура природно підходить для перевірки відповідності дужок?" },
            options: [
              { id: "a", text: { en: "A stack", uk: "Стек" } },
              { id: "b", text: { en: "A queue", uk: "Черга" } },
              { id: "c", text: { en: "A single integer counter", uk: "Один цілочисельний лічильник" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "universal-queue", title: { en: "A universal queue and downcasts", uk: "Універсальна черга і приведення вниз" } },
      { kind: "lecture", slug: "generic-classes", title: { en: "Generic classes", uk: "Дженерик-класи" } },
      { kind: "lecture", slug: "bracket-stacks", title: { en: "Stacks for checking brackets", uk: "Стеки для аналізу дужкових виразів" } },
      { kind: "lecture", slug: "stack-calculation", title: { en: "Stacks for calculation", uk: "Стеки для обчислень" } },
      { kind: "lecture", slug: "moving-average", title: { en: "A queue for a moving average", uk: "Черга для ковзного середнього" } },
      { kind: "lecture", slug: "generic-sorting", title: { en: "Generics and sorting arrays", uk: "Дженерики і сортування масивів" } },
      {
        kind: "practice",
        slug: "max-in-array",
        title: { en: "Maximum in an array", uk: "Максимум у масиві" },
        language: "csharp",
        starter: PROGRAM(`    // The largest element of the array, for any comparable type
    static T Max<T>(T[] items) where T : IComparable<T>
    {
        // Write your code here
        return default(T);
    }

    static void Main()
    {
        Console.WriteLine(Max(new[] { 3, 9, 2 }));
        Console.WriteLine(Max(new[] { "pear", "apple", "plum" }));
        Console.WriteLine(Max(new[] { 2.5, -1.0, 2.25 }));
        Console.WriteLine(Max(new[] { 'a', 'z', 'm' }));
        Console.WriteLine(Max(new[] { 7 }));
    }`),
        solution: PROGRAM(`    // The largest element of the array, for any comparable type
    static T Max<T>(T[] items) where T : IComparable<T>
    {
        T best = items[0];
        for (int i = 1; i < items.Length; i++)
        {
            if (items[i].CompareTo(best) > 0)
            {
                best = items[i];
            }
        }
        return best;
    }

    static void Main()
    {
        Console.WriteLine(Max(new[] { 3, 9, 2 }));
        Console.WriteLine(Max(new[] { "pear", "apple", "plum" }));
        Console.WriteLine(Max(new[] { 2.5, -1.0, 2.25 }));
        Console.WriteLine(Max(new[] { 'a', 'z', 'm' }));
        Console.WriteLine(Max(new[] { 7 }));
    }`),
        expectedOutput: "9\nplum\n2.5\nz\n7\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "return-value-errors", title: { en: "Returning a value and errors", uk: "Повернення значення і помилки" } },
      { kind: "lecture", slug: "return-multiple", title: { en: "Returning several values", uk: "Повернення кількох значень" } },
      { kind: "lecture", slug: "tuple-class", title: { en: "The Tuple generic class", uk: "Дженерик-клас Tuple" } },
      { kind: "lecture", slug: "nullable-class", title: { en: "The Nullable generic class", uk: "Дженерик-клас Nullable" } },
      {
        kind: "quiz",
        slug: "stacks-queues-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "generic-benefit",
            mode: "single",
            prompt: { en: "Why is a `Queue<int>` better than a queue of `object`?", uk: "Чому `Queue<int>` кращий за чергу з `object`?" },
            options: [
              { id: "a", text: { en: "The compiler checks the types, and there is no boxing or downcast", uk: "Компілятор перевіряє типи, а boxing і приведення вниз не потрібні" } },
              { id: "b", text: { en: "It is always faster to write", uk: "Його завжди швидше писати" } },
              { id: "c", text: { en: "It can hold `null` only", uk: "Він може тримати лише `null`" } },
            ],
            correct: ["a"],
          },
          {
            id: "constraint-meaning",
            mode: "single",
            prompt: { en: "What does the constraint `where T : IComparable<T>` allow?", uk: "Що дозволяє обмеження `where T : IComparable<T>`?" },
            options: [
              { id: "a", text: { en: "Calling `CompareTo` on values of type `T`", uk: "Виклик `CompareTo` для значень типу `T`" } },
              { id: "b", text: { en: "Using `T` only with `int`", uk: "Вживання `T` лише з `int`" } },
              { id: "c", text: { en: "Making `T` a reference type", uk: "Робити `T` посилальним типом" } },
            ],
            correct: ["a"],
          },
          {
            id: "nullable-coalesce",
            mode: "single",
            prompt: {
              en: "What is `y` here?\n\n```csharp\nint? x = null;\nint y = x ?? 5;\n```",
              uk: "Чому дорівнює `y` тут?\n\n```csharp\nint? x = null;\nint y = x ?? 5;\n```",
            },
            options: [
              { id: "a", text: { en: "5", uk: "5" } },
              { id: "b", text: { en: "0", uk: "0" } },
              { id: "c", text: { en: "It does not compile", uk: "Не компілюється" } },
            ],
            correct: ["a"],
          },
          {
            id: "dequeue-empty",
            mode: "single",
            prompt: { en: "What does `Dequeue()` do on an empty queue?", uk: "Що робить `Dequeue()` на порожній черзі?" },
            options: [
              { id: "a", text: { en: "It throws an `InvalidOperationException`", uk: "Кидає `InvalidOperationException`" } },
              { id: "b", text: { en: "It returns the default value silently", uk: "Мовчки повертає типове значення" } },
              { id: "c", text: { en: "It waits until an item arrives", uk: "Чекає, доки прийде елемент" } },
            ],
            correct: ["a"],
          },
          {
            id: "try-pattern",
            mode: "single",
            prompt: { en: "What is the Try pattern?", uk: "Що таке шаблон Try?" },
            options: [
              { id: "a", text: { en: "A method that returns `bool` for success, and gives the result through an `out` parameter", uk: "Метод, що повертає `bool` для успіху, а результат віддає через параметр `out`" } },
              { id: "b", text: { en: "A method that always throws an exception", uk: "Метод, що завжди кидає виняток" } },
              { id: "c", text: { en: "A method with no parameters", uk: "Метод без параметрів" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "limited-size-stack",
        title: { en: "Practice: Limited Size Stack", uk: "Практика «Стек обмеженого розміру»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class LimitedStack<T>
{
    private readonly T[] items;
    private int count;

    public LimitedStack(int capacity)
    {
        items = new T[capacity];
    }

    public int Count => count;

    // Write IsFull, Push, Pop and Peek here
    public bool IsFull => false;

    public void Push(T item)
    {
    }

    public T Pop()
    {
        return default(T);
    }

    public T Peek()
    {
        return default(T);
    }
}`,
          `        var s = new LimitedStack<int>(2);
        s.Push(1);
        s.Push(2);
        Console.WriteLine(s.IsFull);
        try
        {
            s.Push(3);
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("full");
        }
        Console.WriteLine(s.Pop());
        Console.WriteLine(s.Peek());
        Console.WriteLine(s.Count);
        s.Pop();
        try
        {
            s.Pop();
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("empty");
        }
        var names = new LimitedStack<string>(3);
        names.Push("a");
        names.Push("b");
        Console.WriteLine(names.Pop() + names.Pop());`,
        ),
        solution: PROGRAM_WITH(
          `class LimitedStack<T>
{
    private readonly T[] items;
    private int count;

    public LimitedStack(int capacity)
    {
        items = new T[capacity];
    }

    public int Count => count;

    public bool IsFull => count == items.Length;

    public void Push(T item)
    {
        if (IsFull)
        {
            throw new InvalidOperationException("The stack is full");
        }
        items[count] = item;
        count++;
    }

    public T Pop()
    {
        if (count == 0)
        {
            throw new InvalidOperationException("The stack is empty");
        }
        count--;
        T item = items[count];
        items[count] = default(T);
        return item;
    }

    public T Peek()
    {
        if (count == 0)
        {
            throw new InvalidOperationException("The stack is empty");
        }
        return items[count - 1];
    }
}`,
          `        var s = new LimitedStack<int>(2);
        s.Push(1);
        s.Push(2);
        Console.WriteLine(s.IsFull);
        try
        {
            s.Push(3);
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("full");
        }
        Console.WriteLine(s.Pop());
        Console.WriteLine(s.Peek());
        Console.WriteLine(s.Count);
        s.Pop();
        try
        {
            s.Pop();
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("empty");
        }
        var names = new LimitedStack<string>(3);
        names.Push("a");
        names.Push("b");
        Console.WriteLine(names.Pop() + names.Pop());`,
        ),
        expectedOutput: "True\nfull\n2\n1\n1\nempty\nba\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "undo-practice",
        title: { en: "Practice: Undo", uk: "Практика «Скасування»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class TextEditor
{
    private string text = "";
    private readonly Stack<string> history = new Stack<string>();

    public string Text => text;

    // Saves the text, then adds s to the end
    public void Type(string s)
    {
        // Write your code here
    }

    // If the text is not empty: saves the text, then removes the last n characters
    public void Erase(int n)
    {
        // Write your code here
    }

    // Restores the text from the history, if there is any
    public void Undo()
    {
        // Write your code here
    }
}`,
          `        var ed = new TextEditor();
        ed.Type("hello");
        ed.Type(" world");
        Console.WriteLine(ed.Text);
        ed.Erase(6);
        Console.WriteLine(ed.Text);
        ed.Undo();
        Console.WriteLine(ed.Text);
        ed.Undo();
        Console.WriteLine(ed.Text);
        ed.Undo();
        ed.Undo();
        Console.WriteLine("[" + ed.Text + "]");
        ed.Erase(100);
        Console.WriteLine("[" + ed.Text + "]");`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `class TextEditor
{
    private string text = "";
    private readonly Stack<string> history = new Stack<string>();

    public string Text => text;

    // Saves the text, then adds s to the end
    public void Type(string s)
    {
        history.Push(text);
        text += s;
    }

    // If the text is not empty: saves the text, then removes the last n characters
    public void Erase(int n)
    {
        if (text.Length == 0)
        {
            return;
        }
        history.Push(text);
        int remove = Math.Min(n, text.Length);
        text = text.Substring(0, text.Length - remove);
    }

    // Restores the text from the history, if there is any
    public void Undo()
    {
        if (history.Count > 0)
        {
            text = history.Pop();
        }
    }
}`,
          `        var ed = new TextEditor();
        ed.Type("hello");
        ed.Type(" world");
        Console.WriteLine(ed.Text);
        ed.Erase(6);
        Console.WriteLine(ed.Text);
        ed.Undo();
        Console.WriteLine(ed.Text);
        ed.Undo();
        Console.WriteLine(ed.Text);
        ed.Undo();
        ed.Undo();
        Console.WriteLine("[" + ed.Text + "]");
        ed.Erase(100);
        Console.WriteLine("[" + ed.Text + "]");`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "hello world\nhello\nhello world\nhello\n[]\n[]\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "csv-practice",
        title: { en: "Practice: CSV", uk: "Практика «CSV»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          "",
          `        string[] lines =
        {
            "name,age,city",
            "Ann,30,Kyiv",
            "\\"Smith, John\\",45,\\"New \\"\\"York\\"\\"\\"",
            "Bob,,Lviv",
            "x,\\"\\",y"
        };
        foreach (string line in lines)
        {
            List<string> fields = ParseLine(line);
            Console.WriteLine(fields.Count + ": " + string.Join(" | ", fields.ToArray()));
        }`,
          "using System.Collections.Generic;\nusing System.Text;",
          `    // Splits one CSV line into its fields. Quotes protect commas, and "" stands for one quote.
    static List<string> ParseLine(string line)
    {
        // Write your code here
        return new List<string>();
    }`,
        ),
        solution: PROGRAM_WITH(
          "",
          `        string[] lines =
        {
            "name,age,city",
            "Ann,30,Kyiv",
            "\\"Smith, John\\",45,\\"New \\"\\"York\\"\\"\\"",
            "Bob,,Lviv",
            "x,\\"\\",y"
        };
        foreach (string line in lines)
        {
            List<string> fields = ParseLine(line);
            Console.WriteLine(fields.Count + ": " + string.Join(" | ", fields.ToArray()));
        }`,
          "using System.Collections.Generic;\nusing System.Text;",
          `    // Splits one CSV line into its fields. Quotes protect commas, and "" stands for one quote.
    static List<string> ParseLine(string line)
    {
        var fields = new List<string>();
        var current = new StringBuilder();
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
                        current.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = false;
                    }
                }
                else
                {
                    current.Append(c);
                }
            }
            else if (c == '"')
            {
                inQuotes = true;
            }
            else if (c == ',')
            {
                fields.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }
        fields.Add(current.ToString());
        return fields;
    }`,
        ),
        expectedOutput:
          "3: name | age | city\n3: Ann | 30 | Kyiv\n3: Smith, John | 45 | New \"York\"\n3: Bob |  | Lviv\n3: x |  | y\n",
        maxScore: 20,
      },
    ],
  },
  {
    slug: "yield-return",
    title: { en: "yield return", uk: "yield return" },
    slides: [
      { kind: "lecture", slug: "foreach-enumerable", title: { en: "foreach, IEnumerable and IEnumerator", uk: "foreach, IEnumerable і IEnumerator" } },
      { kind: "lecture", slug: "enumerator-implementation", title: { en: "Implementing IEnumerator", uk: "Реалізація IEnumerator" } },
      {
        kind: "quiz",
        slug: "enumerable-quiz",
        title: { en: "foreach, IEnumerable and IEnumerator", uk: "foreach, IEnumerable і IEnumerator" },
        questions: [
          {
            id: "foreach-needs",
            mode: "single",
            prompt: { en: "What must a collection provide for `foreach` to work?", uk: "Що має надавати колекція, щоб працював `foreach`?" },
            options: [
              { id: "a", text: { en: "A `GetEnumerator` method, usually through `IEnumerable`", uk: "Метод `GetEnumerator`, зазвичай через `IEnumerable`" } },
              { id: "b", text: { en: "A `Length` property only", uk: "Лише властивість `Length`" } },
              { id: "c", text: { en: "An array type", uk: "Тип масиву" } },
            ],
            correct: ["a"],
          },
          {
            id: "movenext",
            mode: "single",
            prompt: { en: "What does `MoveNext()` return?", uk: "Що повертає `MoveNext()`?" },
            options: [
              { id: "a", text: { en: "`true` if there is a current item, `false` at the end", uk: "`true`, якщо є поточний елемент, і `false` наприкінці" } },
              { id: "b", text: { en: "The current item", uk: "Поточний елемент" } },
              { id: "c", text: { en: "The number of items", uk: "Кількість елементів" } },
            ],
            correct: ["a"],
          },
          {
            id: "current-property",
            mode: "single",
            prompt: { en: "Which property gives the item where the enumerator stands?", uk: "Яка властивість дає елемент, на якому стоїть перелічувач?" },
            options: [
              { id: "a", text: { en: "`Current`", uk: "`Current`" } },
              { id: "b", text: { en: "`Next`", uk: "`Next`" } },
              { id: "c", text: { en: "`Length`", uk: "`Length`" } },
            ],
            correct: ["a"],
          },
          {
            id: "compiler-generates",
            mode: "single",
            prompt: { en: "What does the compiler generate for a method that uses `yield return`?", uk: "Що генерує компілятор для методу з `yield return`?" },
            options: [
              { id: "a", text: { en: "A hidden class that implements `IEnumerator`", uk: "Прихований клас, що реалізує `IEnumerator`" } },
              { id: "b", text: { en: "A new array with all the items", uk: "Новий масив з усіма елементами" } },
              { id: "c", text: { en: "Nothing: `yield` is only a comment", uk: "Нічого: `yield` — лише коментар" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "iqueryable-ienumerable", title: { en: "IEnumerable and IQueryable", uk: "IEnumerable і IQueryable" } },
      { kind: "lecture", slug: "yield-return", title: { en: "yield return", uk: "yield return" } },
      { kind: "lecture", slug: "lazy-collections", title: { en: "Lazy collections", uk: "Ледачі колекції" } },
      {
        kind: "practice",
        slug: "sequence-generation",
        title: { en: "Sequence generation", uk: "Генерація послідовності" },
        language: "csharp",
        starter: PROGRAM_WITH(
          "",
          `        Print(Evens(10));
        Print(Fibonacci(8));
        Print(Countdown(3));`,
          "using System.Collections.Generic;",
          `    // Prints the items of a sequence on one line, separated by spaces
    static void Print(IEnumerable<int> items)
    {
        string text = "";
        foreach (int item in items)
        {
            text += (text == "" ? "" : " ") + item;
        }
        Console.WriteLine(text);
    }

    // The even numbers from 0 up to limit, inclusive
    static IEnumerable<int> Evens(int limit)
    {
        // Write your code here
        yield break;
    }

    // The first count Fibonacci numbers: 1, 1, 2, 3, 5, ...
    static IEnumerable<int> Fibonacci(int count)
    {
        // Write your code here
        yield break;
    }

    // The numbers from 'from' down to 0, inclusive
    static IEnumerable<int> Countdown(int from)
    {
        // Write your code here
        yield break;
    }`,
        ),
        solution: PROGRAM_WITH(
          "",
          `        Print(Evens(10));
        Print(Fibonacci(8));
        Print(Countdown(3));`,
          "using System.Collections.Generic;",
          `    // Prints the items of a sequence on one line, separated by spaces
    static void Print(IEnumerable<int> items)
    {
        string text = "";
        foreach (int item in items)
        {
            text += (text == "" ? "" : " ") + item;
        }
        Console.WriteLine(text);
    }

    // The even numbers from 0 up to limit, inclusive
    static IEnumerable<int> Evens(int limit)
    {
        for (int i = 0; i <= limit; i += 2)
        {
            yield return i;
        }
    }

    // The first count Fibonacci numbers: 1, 1, 2, 3, 5, ...
    static IEnumerable<int> Fibonacci(int count)
    {
        int a = 1;
        int b = 1;
        for (int i = 0; i < count; i++)
        {
            yield return a;
            int next = a + b;
            a = b;
            b = next;
        }
    }

    // The numbers from 'from' down to 0, inclusive
    static IEnumerable<int> Countdown(int from)
    {
        for (int i = from; i >= 0; i--)
        {
            yield return i;
        }
    }`,
        ),
        expectedOutput: "0 2 4 6 8 10\n1 1 2 3 5 8 13 21\n3 2 1 0\n",
        maxScore: 5,
      },
      {
        kind: "practice",
        slug: "zip-sum",
        title: { en: "ZipSum", uk: "ZipSum" },
        language: "csharp",
        starter: PROGRAM_WITH(
          "",
          `        Print(ZipSum(new[] { 1, 2, 3 }, new[] { 10, 20, 30 }));
        Print(ZipSum(new[] { 1, 2, 3, 4 }, new[] { 5, 6 }));
        Print(ZipSum(new int[0], new[] { 1 }));
        Print(ZipSum(Evens(4), Countdown(2)));`,
          "using System.Collections.Generic;",
          `    // Prints the items of a sequence on one line, separated by spaces
    static void Print(IEnumerable<int> items)
    {
        string text = "";
        foreach (int item in items)
        {
            text += (text == "" ? "" : " ") + item;
        }
        Console.WriteLine(text);
    }

    static IEnumerable<int> Evens(int limit)
    {
        for (int i = 0; i <= limit; i += 2)
        {
            yield return i;
        }
    }

    static IEnumerable<int> Countdown(int from)
    {
        for (int i = from; i >= 0; i--)
        {
            yield return i;
        }
    }

    // The sum of each pair of items; stops at the shorter sequence
    static IEnumerable<int> ZipSum(IEnumerable<int> a, IEnumerable<int> b)
    {
        // Write your code here
        yield break;
    }`,
        ),
        solution: PROGRAM_WITH(
          "",
          `        Print(ZipSum(new[] { 1, 2, 3 }, new[] { 10, 20, 30 }));
        Print(ZipSum(new[] { 1, 2, 3, 4 }, new[] { 5, 6 }));
        Print(ZipSum(new int[0], new[] { 1 }));
        Print(ZipSum(Evens(4), Countdown(2)));`,
          "using System.Collections.Generic;",
          `    // Prints the items of a sequence on one line, separated by spaces
    static void Print(IEnumerable<int> items)
    {
        string text = "";
        foreach (int item in items)
        {
            text += (text == "" ? "" : " ") + item;
        }
        Console.WriteLine(text);
    }

    static IEnumerable<int> Evens(int limit)
    {
        for (int i = 0; i <= limit; i += 2)
        {
            yield return i;
        }
    }

    static IEnumerable<int> Countdown(int from)
    {
        for (int i = from; i >= 0; i--)
        {
            yield return i;
        }
    }

    // The sum of each pair of items; stops at the shorter sequence
    static IEnumerable<int> ZipSum(IEnumerable<int> a, IEnumerable<int> b)
    {
        using (IEnumerator<int> first = a.GetEnumerator())
        using (IEnumerator<int> second = b.GetEnumerator())
        {
            while (first.MoveNext() && second.MoveNext())
            {
                yield return first.Current + second.Current;
            }
        }
    }`,
        ),
        expectedOutput: "11 22 33\n6 8\n\n2 3 4\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "yield-recursive", title: { en: "yield return in recursive methods", uk: "yield return у рекурсивних методах" } },
      {
        kind: "quiz",
        slug: "yield-special-quiz",
        title: { en: "Special cases of yield return", uk: "Особливі випадки yield return" },
        questions: [
          {
            id: "try-catch",
            mode: "single",
            prompt: { en: "Which of these is a compile error inside an iterator method?", uk: "Що з цього є помилкою компіляції всередині ітераторного методу?" },
            options: [
              { id: "a", text: { en: "`yield return` inside a `try` block that has a `catch` clause", uk: "`yield return` у блоці `try`, що має `catch`" } },
              { id: "b", text: { en: "`yield return` inside a `try` block that has only `finally`", uk: "`yield return` у блоці `try`, що має лише `finally`" } },
              { id: "c", text: { en: "`yield break`", uk: "`yield break`" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "quiz",
        slug: "yield-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "iterator-start",
            mode: "single",
            prompt: { en: "When does the body of an iterator method start running?", uk: "Коли починає виконуватися тіло ітераторного методу?" },
            options: [
              { id: "a", text: { en: "When the first `MoveNext()` is called, for example by `foreach`", uk: "Коли вперше викликають `MoveNext()`, наприклад через `foreach`" } },
              { id: "b", text: { en: "At the moment the method is called", uk: "У момент виклику методу" } },
              { id: "c", text: { en: "When the program starts", uk: "Коли програма запускається" } },
            ],
            correct: ["a"],
          },
          {
            id: "yield-break",
            mode: "single",
            prompt: { en: "What does `yield break` do?", uk: "Що робить `yield break`?" },
            options: [
              { id: "a", text: { en: "Ends the sequence", uk: "Завершує послідовність" } },
              { id: "b", text: { en: "Skips one item", uk: "Пропускає один елемент" } },
              { id: "c", text: { en: "Throws an exception", uk: "Кидає виняток" } },
            ],
            correct: ["a"],
          },
          {
            id: "lazy-benefit",
            mode: "single",
            prompt: { en: "Why is lazy evaluation useful?", uk: "Чому корисне ледаче обчислення?" },
            options: [
              { id: "a", text: { en: "Items are computed on demand, and infinite sequences are possible", uk: "Елементи обчислюються на вимогу, і можливі нескінченні послідовності" } },
              { id: "b", text: { en: "The program runs faster on every item", uk: "Програма швидша на кожному елементі" } },
              { id: "c", text: { en: "Each item is saved to disk", uk: "Кожен елемент зберігається на диску" } },
            ],
            correct: ["a"],
          },
          {
            id: "iqueryable-database",
            mode: "single",
            prompt: { en: "Which type lets a provider translate the query into a database query?", uk: "Який тип дозволяє провайдеру перекласти запит у запит до бази даних?" },
            options: [
              { id: "a", text: { en: "`IQueryable<T>`", uk: "`IQueryable<T>`" } },
              { id: "b", text: { en: "`IEnumerable<T>`", uk: "`IEnumerable<T>`" } },
              { id: "c", text: { en: "`List<T>`", uk: "`List<T>`" } },
            ],
            correct: ["a"],
          },
          {
            id: "argument-checks",
            mode: "single",
            prompt: { en: "Why is it a problem to check arguments inside an iterator method?", uk: "Чому перевірка аргументів усередині ітераторного методу — проблема?" },
            options: [
              { id: "a", text: { en: "The checks run only when the sequence is enumerated, so errors appear late", uk: "Перевірки виконуються лише під час перелічування, тож помилки з'являються пізно" } },
              { id: "b", text: { en: "The checks are not allowed at all", uk: "Перевірки взагалі не дозволені" } },
              { id: "c", text: { en: "The checks make the program slower to compile", uk: "Перевірки сповільнюють компіляцію" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "exponential-smoothing",
        title: { en: "Practice: Exponential smoothing", uk: "Практика «Експоненціальне згладжування»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          "",
          `        Print(Smooth(new double[] { 10, 20, 30 }, 0.5));
        Print(FirstN(Smooth(Constant(8), 0.25), 3));
        Print(FirstN(Smooth(Ramp(), 0.5), 4));`,
          "using System.Collections.Generic;",
          `    // Prints the items of a sequence on one line, separated by spaces
    static void Print(IEnumerable<double> items)
    {
        string text = "";
        foreach (double item in items)
        {
            text += (text == "" ? "" : " ") + item;
        }
        Console.WriteLine(text);
    }

    // An infinite sequence of the same value
    static IEnumerable<double> Constant(double value)
    {
        while (true)
        {
            yield return value;
        }
    }

    // An infinite sequence 0, 1, 2, ...
    static IEnumerable<double> Ramp()
    {
        double x = 0;
        while (true)
        {
            yield return x;
            x++;
        }
    }

    // Each output is alpha * value + (1 - alpha) * previous output; the first output is the first value
    static IEnumerable<double> Smooth(IEnumerable<double> values, double alpha)
    {
        // Write your code here
        yield break;
    }

    // The first n items of a sequence; must stop reading after n items
    static List<double> FirstN(IEnumerable<double> items, int n)
    {
        // Write your code here
        return new List<double>();
    }`,
        ),
        solution: PROGRAM_WITH(
          "",
          `        Print(Smooth(new double[] { 10, 20, 30 }, 0.5));
        Print(FirstN(Smooth(Constant(8), 0.25), 3));
        Print(FirstN(Smooth(Ramp(), 0.5), 4));`,
          "using System.Collections.Generic;",
          `    // Prints the items of a sequence on one line, separated by spaces
    static void Print(IEnumerable<double> items)
    {
        string text = "";
        foreach (double item in items)
        {
            text += (text == "" ? "" : " ") + item;
        }
        Console.WriteLine(text);
    }

    // An infinite sequence of the same value
    static IEnumerable<double> Constant(double value)
    {
        while (true)
        {
            yield return value;
        }
    }

    // An infinite sequence 0, 1, 2, ...
    static IEnumerable<double> Ramp()
    {
        double x = 0;
        while (true)
        {
            yield return x;
            x++;
        }
    }

    // Each output is alpha * value + (1 - alpha) * previous output; the first output is the first value
    static IEnumerable<double> Smooth(IEnumerable<double> values, double alpha)
    {
        bool first = true;
        double smoothed = 0;
        foreach (double value in values)
        {
            if (first)
            {
                smoothed = value;
                first = false;
            }
            else
            {
                smoothed = alpha * value + (1 - alpha) * smoothed;
            }
            yield return smoothed;
        }
    }

    // The first n items of a sequence; must stop reading after n items
    static List<double> FirstN(IEnumerable<double> items, int n)
    {
        var result = new List<double>();
        foreach (double item in items)
        {
            result.Add(item);
            if (result.Count == n)
            {
                break;
            }
        }
        return result;
    }`,
        ),
        expectedOutput: "10 15 22.5\n8 8 8\n0 0.5 1.25 2.125\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "lists-and-dictionaries",
    title: { en: "Lists and dictionaries", uk: "Списки і словники" },
    slides: [
      { kind: "lecture", slug: "lists-indexing", title: { en: "Lists and indexing", uk: "Списки і індексація" } },
      { kind: "lecture", slug: "contains-method", title: { en: "The Contains method", uk: "Метод Contains" } },
      { kind: "lecture", slug: "equals-method", title: { en: "The Equals method", uk: "Метод Equals" } },
      {
        kind: "quiz",
        slug: "operation-complexity-quiz",
        title: { en: "Operation complexity", uk: "Складність операцій" },
        questions: [
          {
            id: "dictionary-lookup",
            mode: "single",
            prompt: { en: "What is the average time of looking up a key in a `Dictionary<K, V>`?", uk: "Який середній час пошуку ключа в `Dictionary<K, V>`?" },
            options: [
              { id: "a", text: { en: "O(1)", uk: "O(1)" } },
              { id: "b", text: { en: "O(n)", uk: "O(n)" } },
              { id: "c", text: { en: "O(log n)", uk: "O(log n)" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "operator-overloading", title: { en: "Operator overloading", uk: "Перевантаження операторів" } },
      { kind: "lecture", slug: "when-overload-operators", title: { en: "When to overload operators", uk: "Коли варто перевантажувати оператори" } },
      {
        kind: "quiz",
        slug: "operator-subtleties-quiz",
        title: { en: "Operator subtleties", uk: "Тонкощі операторів" },
        questions: [
          {
            id: "pair-with",
            mode: "single",
            prompt: { en: "If you define `operator ==`, what else must you define?", uk: "Якщо ви визначили `operator ==`, що ще потрібно визначити?" },
            options: [
              { id: "a", text: { en: "`operator !=`", uk: "`operator !=`" } },
              { id: "b", text: { en: "`operator +`", uk: "`operator +`" } },
              { id: "c", text: { en: "Nothing, it is automatic", uk: "Нічого, це автоматично" } },
            ],
            correct: ["a"],
          },
          {
            id: "compound",
            mode: "single",
            prompt: { en: "A class defines `operator +` but not `operator +=`. What does `a += b` do?", uk: "Клас визначає `operator +`, але не `operator +=`. Що робить `a += b`?" },
            options: [
              { id: "a", text: { en: "It computes `a = a + b` with `operator +`", uk: "Обчислює `a = a + b` через `operator +`" } },
              { id: "b", text: { en: "It does not compile", uk: "Не компілюється" } },
              { id: "c", text: { en: "It changes `b`", uk: "Змінює `b`" } },
            ],
            correct: ["a"],
          },
          {
            id: "static-operator",
            mode: "single",
            prompt: { en: "What must every operator declaration have?", uk: "Що мусить мати кожне оголошення оператора?" },
            options: [
              { id: "a", text: { en: "The `static` modifier", uk: "Модифікатор `static`" } },
              { id: "b", text: { en: "The `virtual` modifier", uk: "Модифікатор `virtual`" } },
              { id: "c", text: { en: "A return type of `void`", uk: "Тип значення, що повертається, `void`" } },
            ],
            correct: ["a"],
          },
          {
            id: "null-in-operator",
            mode: "single",
            prompt: { en: "Inside `operator ==`, why is writing `if (a == null)` dangerous?", uk: "Чому всередині `operator ==` написати `if (a == null)` небезпечно?" },
            options: [
              { id: "a", text: { en: "It calls `operator ==` again, which leads to endless recursion", uk: "Воно знову викликає `operator ==`, що веде до нескінченної рекурсії" } },
              { id: "b", text: { en: "It always returns `true`", uk: "Завжди повертає `true`" } },
              { id: "c", text: { en: "`null` cannot be compared at all", uk: "`null` взагалі не можна порівняти" } },
            ],
            correct: ["a"],
          },
          {
            id: "equals-missing",
            mode: "single",
            prompt: { en: "A class defines `operator ==` but not `Equals` and `GetHashCode`. What is the problem?", uk: "Клас визначає `operator ==`, але не `Equals` і `GetHashCode`. У чому проблема?" },
            options: [
              { id: "a", text: { en: "The compiler warns, and dictionaries and lists may behave inconsistently", uk: "Компілятор попереджає, а словники й списки можуть поводитися неузгоджено" } },
              { id: "b", text: { en: "The class cannot be compiled", uk: "Клас не можна скомпілювати" } },
              { id: "c", text: { en: "Nothing: the operator covers everything", uk: "Нічого: оператор покриває все" } },
            ],
            correct: ["a"],
          },
          {
            id: "comparison-pairs",
            mode: "single",
            prompt: { en: "Can `operator <` be defined without `operator >`?", uk: "Чи можна визначити `operator <` без `operator >`?" },
            options: [
              { id: "a", text: { en: "No: comparison operators come in pairs", uk: "Ні: оператори порівняння визначають парами" } },
              { id: "b", text: { en: "Yes, always", uk: "Так, завжди" } },
              { id: "c", text: { en: "Only for structs", uk: "Лише для структур" } },
            ],
            correct: ["a"],
          },
          {
            id: "string-equality",
            mode: "single",
            prompt: { en: "In C#, what is `\"ab\" == \"a\" + \"b\"` for strings?", uk: "Чому дорівнює `\"ab\" == \"a\" + \"b\"` для рядків у C#?" },
            options: [
              { id: "a", text: { en: "True: `string` overloads `==` to compare the contents", uk: "True: `string` перевизначає `==`, щоб порівнювати вміст" } },
              { id: "b", text: { en: "False: strings are compared by reference", uk: "False: рядки порівнюються за посиланням" } },
              { id: "c", text: { en: "It does not compile", uk: "Не компілюється" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "hashing-functions", title: { en: "Hash functions", uk: "Хешуючі функції" } },
      { kind: "lecture", slug: "hashes-security", title: { en: "Hashes in computer security", uk: "Хеші в комп'ютерній безпеці" } },
      { kind: "lecture", slug: "substring-search-1", title: { en: "Substring search in a string - 1", uk: "Пошук підрядка в рядку - 1" } },
      { kind: "lecture", slug: "substring-search-2", title: { en: "Substring search in a string - 2", uk: "Пошук підрядка в рядку - 2" } },
      { kind: "lecture", slug: "dictionary-class", title: { en: "The Dictionary class", uk: "Клас Dictionary" } },
      { kind: "lecture", slug: "gethashcode-method", title: { en: "GetHashCode", uk: "GetHashCode" } },
      {
        kind: "quiz",
        slug: "dictionary-equals-quiz",
        title: { en: "Dictionary, Equals and GetHashCode", uk: "Dictionary, Equals і GetHashCode" },
        questions: [
          {
            id: "bucket",
            mode: "single",
            prompt: { en: "Why must equal keys have equal hash codes?", uk: "Чому рівні ключі мусять мати рівні хеш-коди?" },
            options: [
              { id: "a", text: { en: "A dictionary chooses the bucket by the hash code, so an equal key must go to the same bucket", uk: "Словник вибирає кошик за хеш-кодом, тож рівний ключ мусить потрапити в той самий кошик" } },
              { id: "b", text: { en: "To make the dictionary smaller", uk: "Щоб словник був меншим" } },
              { id: "c", text: { en: "Because `Equals` is never called", uk: "Бо `Equals` ніколи не викликається" } },
            ],
            correct: ["a"],
          },
          {
            id: "mutable-key",
            mode: "single",
            prompt: { en: "What happens if a key's field changes after the key was stored in a `Dictionary`?", uk: "Що станеться, якщо поле ключа змінюється після того, як ключ збережено в `Dictionary`?" },
            options: [
              { id: "a", text: { en: "The item may become impossible to find, because its hash changed", uk: "Елемент може стати неможливо знайти, бо його хеш змінився" } },
              { id: "b", text: { en: "Nothing: the dictionary updates itself", uk: "Нічого: словник оновлюється сам" } },
              { id: "c", text: { en: "An exception is thrown at once", uk: "Одразу кидається виняток" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "quiz",
        slug: "lists-dictionaries-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "contains-uses",
            mode: "single",
            prompt: { en: "What does `List.Contains` use to compare items of your own class?", uk: "Що `List.Contains` використовує для порівняння елементів вашого класу?" },
            options: [
              { id: "a", text: { en: "The `Equals` method", uk: "Метод `Equals`" } },
              { id: "b", text: { en: "The `==` operator only", uk: "Лише оператор `==`" } },
              { id: "c", text: { en: "The memory address only", uk: "Лише адресу в пам'яті" } },
            ],
            correct: ["a"],
          },
          {
            id: "hash-function",
            mode: "single",
            prompt: { en: "What is a hash function?", uk: "Що таке хеш-функція?" },
            options: [
              { id: "a", text: { en: "A function that maps data of any size to a number of fixed size", uk: "Функція, що відображає дані будь-якого розміру на число фіксованого розміру" } },
              { id: "b", text: { en: "A function that sorts data", uk: "Функція, що сортує дані" } },
              { id: "c", text: { en: "A function that encrypts data with a secret key", uk: "Функція, що шифрує дані секретним ключем" } },
            ],
            correct: ["a"],
          },
          {
            id: "password-hash",
            mode: "single",
            prompt: { en: "Which property does a cryptographic hash need for storing passwords?", uk: "Яку властивість має мати криптографічний хеш для зберігання паролів?" },
            options: [
              { id: "a", text: { en: "It is practically impossible to find an input for a given hash", uk: "Практично неможливо знайти вхід за заданим хешем" } },
              { id: "b", text: { en: "It is always short", uk: "Він завжди короткий" } },
              { id: "c", text: { en: "It is the same for all inputs", uk: "Він однаковий для всіх входів" } },
            ],
            correct: ["a"],
          },
          {
            id: "naive-cost",
            mode: "single",
            prompt: { en: "What is the worst-case cost of the naive substring search, for a text of length n and a pattern of length m?", uk: "Яка найгірша вартість наївного пошуку підрядка для тексту довжини n і шаблону довжини m?" },
            options: [
              { id: "a", text: { en: "O(n · m)", uk: "O(n · m)" } },
              { id: "b", text: { en: "O(1)", uk: "O(1)" } },
              { id: "c", text: { en: "O(log n)", uk: "O(log n)" } },
            ],
            correct: ["a"],
          },
          {
            id: "rolling-hash",
            mode: "single",
            prompt: { en: "Why does Rabin–Karp use a rolling hash?", uk: "Навіщо Рабін–Карп використовує ковзний хеш?" },
            options: [
              { id: "a", text: { en: "To update the hash of the window in constant time as it slides", uk: "Щоб оновлювати хеш вікна за сталий час, коли воно зсувається" } },
              { id: "b", text: { en: "To sort the text first", uk: "Щоб спершу відсортувати текст" } },
              { id: "c", text: { en: "To avoid comparing the text at all", uk: "Щоб взагалі не порівнювати текст" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "readonly-bytes",
        title: { en: "Practice: Readonly bytes", uk: "Практика «Readonly bytes»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class ReadonlyBytes
{
    private readonly byte[] data;

    public ReadonlyBytes(byte[] data)
    {
        this.data = (byte[])data.Clone();
    }

    public int Length => data.Length;

    // Write the indexer, Append, Equals, GetHashCode, the operators == and != and ToString here
    public byte this[int index] => 0;

    public ReadonlyBytes Append(ReadonlyBytes other)
    {
        return this;
    }

    public override string ToString()
    {
        return "";
    }
}`,
          `        var a = new ReadonlyBytes(new byte[] { 1, 255, 16 });
        var b = new ReadonlyBytes(new byte[] { 1, 255, 16 });
        var c = a.Append(new ReadonlyBytes(new byte[] { 0 }));
        Console.WriteLine(a);
        Console.WriteLine(a == b);
        Console.WriteLine(a.Equals(b));
        Console.WriteLine(a == c);
        Console.WriteLine(c);
        Console.WriteLine(c.Length);
        Console.WriteLine(a[1]);

        var source = new byte[] { 7 };
        var d = new ReadonlyBytes(source);
        source[0] = 9;
        Console.WriteLine(d);

        var counts = new Dictionary<ReadonlyBytes, int>();
        counts[a] = 1;
        counts[b] = counts[b] + 1;
        Console.WriteLine(counts.Count);
        Console.WriteLine(counts[a]);
        Console.WriteLine(new ReadonlyBytes(new byte[0]).Length);
        Console.WriteLine(a != c);`,
          "using System.Collections.Generic;",
        ),
        solution: PROGRAM_WITH(
          `class ReadonlyBytes
{
    private readonly byte[] data;

    public ReadonlyBytes(byte[] data)
    {
        this.data = (byte[])data.Clone();
    }

    public int Length => data.Length;

    public byte this[int index] => data[index];

    public ReadonlyBytes Append(ReadonlyBytes other)
    {
        var result = new byte[data.Length + other.data.Length];
        Array.Copy(data, 0, result, 0, data.Length);
        Array.Copy(other.data, 0, result, data.Length, other.data.Length);
        return new ReadonlyBytes(result);
    }

    public override bool Equals(object obj)
    {
        ReadonlyBytes other = obj as ReadonlyBytes;
        if (ReferenceEquals(other, null))
        {
            return false;
        }
        if (other.data.Length != data.Length)
        {
            return false;
        }
        for (int i = 0; i < data.Length; i++)
        {
            if (data[i] != other.data[i])
            {
                return false;
            }
        }
        return true;
    }

    public override int GetHashCode()
    {
        unchecked
        {
            int hash = 17;
            foreach (byte b in data)
            {
                hash = hash * 31 + b;
            }
            return hash;
        }
    }

    public static bool operator ==(ReadonlyBytes a, ReadonlyBytes b)
    {
        if (ReferenceEquals(a, b))
        {
            return true;
        }
        if (ReferenceEquals(a, null) || ReferenceEquals(b, null))
        {
            return false;
        }
        return a.Equals(b);
    }

    public static bool operator !=(ReadonlyBytes a, ReadonlyBytes b)
    {
        return !(a == b);
    }

    public override string ToString()
    {
        var parts = new string[data.Length];
        for (int i = 0; i < data.Length; i++)
        {
            parts[i] = data[i].ToString("X2");
        }
        return string.Join(" ", parts);
    }
}`,
          `        var a = new ReadonlyBytes(new byte[] { 1, 255, 16 });
        var b = new ReadonlyBytes(new byte[] { 1, 255, 16 });
        var c = a.Append(new ReadonlyBytes(new byte[] { 0 }));
        Console.WriteLine(a);
        Console.WriteLine(a == b);
        Console.WriteLine(a.Equals(b));
        Console.WriteLine(a == c);
        Console.WriteLine(c);
        Console.WriteLine(c.Length);
        Console.WriteLine(a[1]);

        var source = new byte[] { 7 };
        var d = new ReadonlyBytes(source);
        source[0] = 9;
        Console.WriteLine(d);

        var counts = new Dictionary<ReadonlyBytes, int>();
        counts[a] = 1;
        counts[b] = counts[b] + 1;
        Console.WriteLine(counts.Count);
        Console.WriteLine(counts[a]);
        Console.WriteLine(new ReadonlyBytes(new byte[0]).Length);
        Console.WriteLine(a != c);`,
          "using System.Collections.Generic;",
        ),
        expectedOutput: "01 FF 10\nTrue\nTrue\nFalse\n01 FF 10 00\n4\n255\n07\n1\n2\n0\nTrue\n",
        maxScore: 20,
      },
    ],
  },
  {
    slug: "delegates",
    title: { en: "Delegates", uk: "Делегати" },
    slides: [
      { kind: "lecture", slug: "delegates-problem", title: { en: "Problem statement", uk: "Постановка проблеми" } },
      { kind: "lecture", slug: "delegates-intro", title: { en: "Delegates", uk: "Делегати" } },
      {
        kind: "practice",
        slug: "delegate-syntax",
        title: { en: "Delegate syntax", uk: "Синтаксис делегатів" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Declare the delegate type Operation here: two int parameters, returns an int
// Write Add, Multiply and Apply here`,
          `        Operation op = Add;
        Console.WriteLine(op(2, 3));
        op = Multiply;
        Console.WriteLine(op(2, 3));
        Console.WriteLine(Apply(Add, 10, 4));
        Console.WriteLine(Apply(Multiply, 10, 4));
        Operation[] all = { Add, Multiply };
        foreach (Operation f in all)
        {
            Console.WriteLine(f(3, 3));
        }`,
          "",
          `    static int Add(int a, int b)
    {
        return 0;
    }

    static int Multiply(int a, int b)
    {
        return 0;
    }

    static int Apply(Operation op, int x, int y)
    {
        return 0;
    }`,
        ),
        solution: PROGRAM_WITH(
          `delegate int Operation(int a, int b);`,
          `        Operation op = Add;
        Console.WriteLine(op(2, 3));
        op = Multiply;
        Console.WriteLine(op(2, 3));
        Console.WriteLine(Apply(Add, 10, 4));
        Console.WriteLine(Apply(Multiply, 10, 4));
        Operation[] all = { Add, Multiply };
        foreach (Operation f in all)
        {
            Console.WriteLine(f(3, 3));
        }`,
          "",
          `    static int Add(int a, int b)
    {
        return a + b;
    }

    static int Multiply(int a, int b)
    {
        return a * b;
    }

    static int Apply(Operation op, int x, int y)
    {
        return op(x, y);
    }`,
        ),
        expectedOutput: "5\n6\n14\n40\n6\n9\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "delegates-dynamic", title: { en: "Delegates for dynamic methods", uk: "Делегати для динамічних методів" } },
      { kind: "lecture", slug: "delegates-memory-map", title: { en: "Memory map", uk: "Карта пам'яті" } },
      { kind: "lecture", slug: "generic-delegates", title: { en: "Generic delegates", uk: "Дженерик-делегати" } },
      { kind: "lecture", slug: "func-action", title: { en: "Func and Action", uk: "Func і Action" } },
      {
        kind: "practice",
        slug: "delegate-syntax-2",
        title: { en: "Delegate syntax 2", uk: "Синтаксис делегатів 2" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `// Declare the delegate type Notify here: one string parameter, returns nothing
// Write ConsoleNotify and LogNotify here`,
          `        Notify n = ConsoleNotify;
        n += LogNotify;
        n("saved");
        n -= ConsoleNotify;
        n("loaded");
        Notify empty = null;
        if (empty == null)
        {
            Console.WriteLine("no handlers");
        }`,
          "",
          `    static void ConsoleNotify(string message)
    {
    }

    static void LogNotify(string message)
    {
    }`,
        ),
        solution: PROGRAM_WITH(
          `delegate void Notify(string message);`,
          `        Notify n = ConsoleNotify;
        n += LogNotify;
        n("saved");
        n -= ConsoleNotify;
        n("loaded");
        Notify empty = null;
        if (empty == null)
        {
            Console.WriteLine("no handlers");
        }`,
          "",
          `    static void ConsoleNotify(string message)
    {
        Console.WriteLine("console: " + message);
    }

    static void LogNotify(string message)
    {
        Console.WriteLine("log: " + message);
    }`,
        ),
        expectedOutput: "console: saved\nlog: saved\nlog: loaded\nno handlers\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "anonymous-delegates", title: { en: "Anonymous delegates", uk: "Анонімні делегати" } },
      { kind: "lecture", slug: "lambda-expressions", title: { en: "Lambda expressions", uk: "Лямбда-вирази" } },
      { kind: "lecture", slug: "more-lambdas", title: { en: "More lambdas", uk: "Більше лямбд" } },
      {
        kind: "practice",
        slug: "lambda-syntax",
        title: { en: "Lambda syntax", uk: "Синтаксис лямбд" },
        language: "csharp",
        starter: PROGRAM(`    static void Main()
    {
        Func<int, int> square = null;      // x => x * x
        Func<int, int, int> add = null;    // (a, b) => a + b
        Func<int, bool> isEven = null;     // a block lambda: true for even numbers
        Func<int> answer = null;           // () => 42
        Action<string> shout = null;       // writes the text in upper case

        Console.WriteLine(square(7));
        Console.WriteLine(add(2, 5));
        Console.WriteLine(isEven(10));
        Console.WriteLine(isEven(7));
        Console.WriteLine(answer());
        shout("hi");
    }`),
        solution: PROGRAM(`    static void Main()
    {
        Func<int, int> square = x => x * x;
        Func<int, int, int> add = (a, b) => a + b;
        Func<int, bool> isEven = n =>
        {
            return n % 2 == 0;
        };
        Func<int> answer = () => 42;
        Action<string> shout = s => Console.WriteLine(s.ToUpper());

        Console.WriteLine(square(7));
        Console.WriteLine(add(2, 5));
        Console.WriteLine(isEven(10));
        Console.WriteLine(isEven(7));
        Console.WriteLine(answer());
        shout("hi");
    }`),
        expectedOutput: "49\n7\nTrue\nFalse\n42\nHI\n",
        maxScore: 5,
      },
      {
        kind: "practice",
        slug: "lambda-syntax-2",
        title: { en: "Lambda syntax 2", uk: "Синтаксис лямбд 2" },
        language: "csharp",
        starter: PROGRAM_WITH(
          "",
          `        var numbers = new List<int> { 5, 12, 7, 30, 2 };
        Show(Filter(numbers, null));
        var words = new List<string> { "pear", "fig", "apple", "kiwi" };
        Sort(words, null);
        Show(words);
        Show(Transform<int, int>(numbers, null));
        Show(Transform<string, string>(words, null));`,
          "using System.Collections.Generic;",
          `    static void Show<T>(List<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // Keeps the items for which keep returns true
    static List<T> Filter<T>(List<T> items, Func<T, bool> keep)
    {
        var result = new List<T>();
        foreach (T item in items)
        {
            if (keep(item))
            {
                result.Add(item);
            }
        }
        return result;
    }

    // Sorts the list with the given order
    static void Sort<T>(List<T> items, Comparison<T> order)
    {
        items.Sort(order);
    }

    // Converts every item
    static List<R> Transform<T, R>(List<T> items, Func<T, R> convert)
    {
        var result = new List<R>();
        foreach (T item in items)
        {
            result.Add(convert(item));
        }
        return result;
    }`,
        ),
        solution: PROGRAM_WITH(
          "",
          `        var numbers = new List<int> { 5, 12, 7, 30, 2 };
        Show(Filter(numbers, n => n > 10));
        var words = new List<string> { "pear", "fig", "apple", "kiwi" };
        Sort(words, (a, b) => a.Length != b.Length ? a.Length.CompareTo(b.Length) : string.CompareOrdinal(a, b));
        Show(words);
        Show(Transform<int, int>(numbers, n => n * 2));
        Show(Transform<string, string>(words, w => w.Substring(0, 1)));`,
          "using System.Collections.Generic;",
          `    static void Show<T>(List<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // Keeps the items for which keep returns true
    static List<T> Filter<T>(List<T> items, Func<T, bool> keep)
    {
        var result = new List<T>();
        foreach (T item in items)
        {
            if (keep(item))
            {
                result.Add(item);
            }
        }
        return result;
    }

    // Sorts the list with the given order
    static void Sort<T>(List<T> items, Comparison<T> order)
    {
        items.Sort(order);
    }

    // Converts every item
    static List<R> Transform<T, R>(List<T> items, Func<T, R> convert)
    {
        var result = new List<R>();
        foreach (T item in items)
        {
            result.Add(convert(item));
        }
        return result;
    }`,
        ),
        expectedOutput: "12 30\nfig kiwi pear apple\n10 24 14 60 4\nf k p a\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "closures", title: { en: "Closures", uk: "Замикання" } },
      { kind: "lecture", slug: "closures-memory-map", title: { en: "Memory map", uk: "Карта пам'яті" } },
      { kind: "lecture", slug: "closure-trap", title: { en: "The closure trap", uk: "Пастка замикання" } },
      {
        kind: "quiz",
        slug: "delegates-quiz",
        title: { en: "Delegates", uk: "Делегати" },
        questions: [
          {
            id: "what-is-delegate",
            mode: "single",
            prompt: { en: "What is a delegate?", uk: "Що таке делегат?" },
            options: [
              { id: "a", text: { en: "A type that holds a reference to a method with a given signature", uk: "Тип, що тримає посилання на метод із заданою сигнатурою" } },
              { id: "b", text: { en: "A class with many fields", uk: "Клас з багатьма полями" } },
              { id: "c", text: { en: "A way to write a loop", uk: "Спосіб написати цикл" } },
            ],
            correct: ["a"],
          },
          {
            id: "assign-method",
            mode: "single",
            prompt: { en: "Which line assigns the method `Add` to the delegate variable `op`?", uk: "Який рядок присвоює метод `Add` змінній-делегату `op`?" },
            options: [
              { id: "a", text: { en: "`Operation op = Add;`", uk: "`Operation op = Add;`" } },
              { id: "b", text: { en: "`Operation op = Add();`", uk: "`Operation op = Add();`" } },
              { id: "c", text: { en: "`Operation op = new Add;`", uk: "`Operation op = new Add;`" } },
            ],
            correct: ["a"],
          },
          {
            id: "combine",
            mode: "single",
            prompt: { en: "What does `n += LogNotify;` do when `n` already holds a method?", uk: "Що робить `n += LogNotify;`, коли `n` уже тримає метод?" },
            options: [
              { id: "a", text: { en: "Adds `LogNotify` to the invocation list, so both methods are called", uk: "Додає `LogNotify` до списку викликів, тож викликаються обидва методи" } },
              { id: "b", text: { en: "Replaces the old method", uk: "Замінює старий метод" } },
              { id: "c", text: { en: "Calls `LogNotify` at once", uk: "Одразу викликає `LogNotify`" } },
            ],
            correct: ["a"],
          },
          {
            id: "remove",
            mode: "single",
            prompt: { en: "What does `n -= LogNotify;` do?", uk: "Що робить `n -= LogNotify;`?" },
            options: [
              { id: "a", text: { en: "Removes `LogNotify` from the invocation list", uk: "Видаляє `LogNotify` зі списку викликів" } },
              { id: "b", text: { en: "Deletes the method from the program", uk: "Видаляє метод з програми" } },
              { id: "c", text: { en: "Calls it once", uk: "Викликає його один раз" } },
            ],
            correct: ["a"],
          },
          {
            id: "unassigned",
            mode: "single",
            prompt: { en: "What is the value of a delegate variable that was never assigned?", uk: "Яке значення має змінна-делегат, якій ніколи не присвоювали значення?" },
            options: [
              { id: "a", text: { en: "`null`", uk: "`null`" } },
              { id: "b", text: { en: "An empty method", uk: "Порожній метод" } },
              { id: "c", text: { en: "`0`", uk: "`0`" } },
            ],
            correct: ["a"],
          },
          {
            id: "func-signature",
            mode: "single",
            prompt: { en: "Which signature does `Func<int, int, bool>` describe?", uk: "Яку сигнатуру описує `Func<int, int, bool>`?" },
            options: [
              { id: "a", text: { en: "A method that takes two `int` values and returns a `bool`", uk: "Метод, що приймає два значення `int` і повертає `bool`" } },
              { id: "b", text: { en: "A method that takes a `bool` and returns two `int` values", uk: "Метод, що приймає `bool` і повертає два значення `int`" } },
              { id: "c", text: { en: "A method that takes three `int` values", uk: "Метод, що приймає три значення `int`" } },
            ],
            correct: ["a"],
          },
        ],
      },
      { kind: "lecture", slug: "delegates-summary", title: { en: "Summary", uk: "Саммарі" } },
      {
        kind: "quiz",
        slug: "delegates-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "func-vs-action",
            mode: "single",
            prompt: { en: "What is the difference between `Func` and `Action`?", uk: "У чому різниця між `Func` і `Action`?" },
            options: [
              { id: "a", text: { en: "`Func` returns a value, and `Action` returns nothing", uk: "`Func` повертає значення, а `Action` нічого не повертає" } },
              { id: "b", text: { en: "`Action` is always faster", uk: "`Action` завжди швидший" } },
              { id: "c", text: { en: "`Func` cannot have parameters", uk: "`Func` не може мати параметрів" } },
            ],
            correct: ["a"],
          },
          {
            id: "lambda-double",
            mode: "single",
            prompt: { en: "Which lambda multiplies its parameter by two?", uk: "Яка лямбда множить свій параметр на два?" },
            options: [
              { id: "a", text: { en: "`x => x * 2`", uk: "`x => x * 2`" } },
              { id: "b", text: { en: "`x => x = 2`", uk: "`x => x = 2`" } },
              { id: "c", text: { en: "`x * 2 => x`", uk: "`x * 2 => x`" } },
            ],
            correct: ["a"],
          },
          {
            id: "closure-meaning",
            mode: "single",
            prompt: { en: "What is a closure?", uk: "Що таке замикання?" },
            options: [
              { id: "a", text: { en: "A lambda that uses a local variable from its surroundings and keeps it alive", uk: "Лямбда, що використовує локальну змінну з оточення і утримує її живою" } },
              { id: "b", text: { en: "A method that closes a file", uk: "Метод, що закриває файл" } },
              { id: "c", text: { en: "A delegate with no methods", uk: "Делегат без методів" } },
            ],
            correct: ["a"],
          },
          {
            id: "loop-trap",
            mode: "single",
            prompt: {
              en: "After this loop, what does each action print when it runs?\n\n```csharp\nvar actions = new List<Action>();\nfor (int i = 0; i < 3; i++)\n{\n    actions.Add(() => Console.Write(i));\n}\n```",
              uk: "Що друкує кожна дія, коли її виконують після цього циклу?\n\n```csharp\nvar actions = new List<Action>();\nfor (int i = 0; i < 3; i++)\n{\n    actions.Add(() => Console.Write(i));\n}\n```",
            },
            options: [
              { id: "a", text: { en: "The final value of `i`, which is the same for all of them", uk: "Кінцеве значення `i`, однакове для всіх" } },
              { id: "b", text: { en: "`0`, `1`, `2` in order", uk: "`0`, `1`, `2` по порядку" } },
              { id: "c", text: { en: "Nothing", uk: "Нічого" } },
            ],
            correct: ["a"],
          },
          {
            id: "anonymous-today",
            mode: "single",
            prompt: { en: "Why are anonymous methods (`delegate { }`) less common today?", uk: "Чому анонімні методи (`delegate { }`) сьогодні зустрічаються рідше?" },
            options: [
              { id: "a", text: { en: "Lambda expressions are shorter and do the same job", uk: "Лямбда-вирази коротші й роблять те саме" } },
              { id: "b", text: { en: "They are not allowed in C#", uk: "Вони не дозволені в C#" } },
              { id: "c", text: { en: "They cannot use local variables", uk: "Вони не можуть використовувати локальні змінні" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "brainfuck-vm",
        title: { en: "Practice: Brainfuck virtual machine", uk: "Практика «Віртуальна машина Brainfuck»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          "",
          `        Console.Write(Run("++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.", ""));
        Console.WriteLine(Run("++++++++[>++++++++<-]>+.", ""));
        Console.WriteLine(Run(",+.", "A"));`,
          "using System.Collections.Generic;\nusing System.Text;",
          `    // Runs a Brainfuck program and returns the text it writes
    static string Run(string program, string input)
    {
        // Write your code here
        return "";
    }`,
        ),
        solution: PROGRAM_WITH(
          "",
          `        Console.Write(Run("++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.", ""));
        Console.WriteLine(Run("++++++++[>++++++++<-]>+.", ""));
        Console.WriteLine(Run(",+.", "A"));`,
          "using System.Collections.Generic;\nusing System.Text;",
          `    // Runs a Brainfuck program and returns the text it writes
    static string Run(string program, string input)
    {
        byte[] tape = new byte[30000];
        int pointer = 0;
        int inputPos = 0;
        var output = new StringBuilder();

        // Pair up the brackets once: jump[i] is the position of the matching bracket
        var jump = new int[program.Length];
        var open = new Stack<int>();
        for (int i = 0; i < program.Length; i++)
        {
            if (program[i] == '[')
            {
                open.Push(i);
            }
            else if (program[i] == ']')
            {
                int start = open.Pop();
                jump[start] = i;
                jump[i] = start;
            }
        }

        for (int pc = 0; pc < program.Length; pc++)
        {
            switch (program[pc])
            {
                case '>':
                    pointer++;
                    break;
                case '<':
                    pointer--;
                    break;
                case '+':
                    tape[pointer]++;
                    break;
                case '-':
                    tape[pointer]--;
                    break;
                case '.':
                    output.Append((char)tape[pointer]);
                    break;
                case ',':
                    tape[pointer] = inputPos < input.Length ? (byte)input[inputPos++] : (byte)0;
                    break;
                case '[':
                    if (tape[pointer] == 0)
                    {
                        pc = jump[pc];
                    }
                    break;
                case ']':
                    if (tape[pointer] != 0)
                    {
                        pc = jump[pc];
                    }
                    break;
            }
        }
        return output.ToString();
    }`,
        ),
        expectedOutput: "Hello World!\nA\nB\n",
        maxScore: 10,
      },
    ],
  },
  {
    slug: "linq",
    title: { en: "LINQ", uk: "LINQ" },
    slides: [
      { kind: "lecture", slug: "linq-introduction", title: { en: "Introduction", uk: "Вступ" } },
      { kind: "lecture", slug: "linq-filter-transform", title: { en: "Filtering and transforming", uk: "Фільтрація та перетворення" } },
      { kind: "lecture", slug: "linq-take-skip", title: { en: "Take, Skip, ToArray, ToList", uk: "Take, Skip, ToArray, ToList" } },
      { kind: "lecture", slug: "linq-method-chaining", title: { en: "Method chaining", uk: "Ланцюжки методів" } },
      {
        kind: "practice",
        slug: "linq-read-numbers",
        title: { en: "Reading an array of numbers", uk: "Читання масиву чисел" },
        language: "csharp",
        starter: PROGRAM(`    // Prints a sequence of numbers on one line, separated by spaces
    static void Show(IEnumerable<int> values)
    {
        var parts = new List<string>();
        foreach (int v in values)
        {
            parts.Add(v.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // How many numbers are even
    static int CountEven(int[] numbers)
    {
        // Write your code here
        return 0;
    }

    // The sum of the odd numbers
    static int SumOdd(int[] numbers)
    {
        // Write your code here
        return 0;
    }

    // The squares of the numbers greater than 5, in the original order
    static int[] SquaresAboveFive(int[] numbers)
    {
        // Write your code here
        return new int[0];
    }

    static void Main()
    {
        int[] numbers = { 3, 8, 5, 10, 1, 6 };
        Console.WriteLine(CountEven(numbers));
        Console.WriteLine(SumOdd(numbers));
        Show(SquaresAboveFive(numbers));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Prints a sequence of numbers on one line, separated by spaces
    static void Show(IEnumerable<int> values)
    {
        var parts = new List<string>();
        foreach (int v in values)
        {
            parts.Add(v.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // How many numbers are even
    static int CountEven(int[] numbers)
    {
        return numbers.Count(n => n % 2 == 0);
    }

    // The sum of the odd numbers
    static int SumOdd(int[] numbers)
    {
        return numbers.Where(n => n % 2 != 0).Sum();
    }

    // The squares of the numbers greater than 5, in the original order
    static int[] SquaresAboveFive(int[] numbers)
    {
        return numbers.Where(n => n > 5).Select(n => n * n).ToArray();
    }

    static void Main()
    {
        int[] numbers = { 3, 8, 5, 10, 1, 6 };
        Console.WriteLine(CountEven(numbers));
        Console.WriteLine(SumOdd(numbers));
        Show(SquaresAboveFive(numbers));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "3\n9\n64 100 36\n",
        maxScore: 5,
      },
      {
        kind: "practice",
        slug: "linq-read-points",
        title: { en: "Reading a list of points", uk: "Читання списку точок" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public override string ToString() => "(" + X + ", " + Y + ")";
}`,
          `        var points = new List<Point> { new Point(1, 2), new Point(3, 4), new Point(-5, 0), new Point(2, 2) };
        ShowAll(Outside(points, 3));
        Console.WriteLine(AverageX(points));
        ShowAll(YsDescending(points));`,
          "using System.Collections.Generic;\nusing System.Linq;",
          `    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The points whose squared distance from the origin is greater than radius * radius
    static List<Point> Outside(List<Point> points, int radius)
    {
        // Write your code here
        return new List<Point>();
    }

    // The average of the X coordinates
    static double AverageX(List<Point> points)
    {
        // Write your code here
        return 0;
    }

    // The Y coordinates, from the largest to the smallest
    static List<int> YsDescending(List<Point> points)
    {
        // Write your code here
        return new List<int>();
    }`,
        ),
        solution: PROGRAM_WITH(
          `class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public override string ToString() => "(" + X + ", " + Y + ")";
}`,
          `        var points = new List<Point> { new Point(1, 2), new Point(3, 4), new Point(-5, 0), new Point(2, 2) };
        ShowAll(Outside(points, 3));
        Console.WriteLine(AverageX(points));
        ShowAll(YsDescending(points));`,
          "using System.Collections.Generic;\nusing System.Linq;",
          `    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The points whose squared distance from the origin is greater than radius * radius
    static List<Point> Outside(List<Point> points, int radius)
    {
        return points.Where(p => p.X * p.X + p.Y * p.Y > radius * radius).ToList();
    }

    // The average of the X coordinates
    static double AverageX(List<Point> points)
    {
        return points.Average(p => p.X);
    }

    // The Y coordinates, from the largest to the smallest
    static List<int> YsDescending(List<Point> points)
    {
        return points.Select(p => p.Y).OrderByDescending(y => y).ToList();
    }`,
        ),
        expectedOutput: "(3, 4) (-5, 0)\n0.25\n4 2 2 0\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "linq-selectmany", title: { en: "SelectMany", uk: "SelectMany" } },
      {
        kind: "practice",
        slug: "linq-union",
        title: { en: "Joining collections", uk: "Об'єднання колекцій" },
        language: "csharp",
        starter: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // All numbers of a, then all numbers of b (duplicates kept)
    static IEnumerable<int> AllValues(int[] a, int[] b)
    {
        // Write your code here
        return new int[0];
    }

    // The distinct numbers of both arrays, in the order of first appearance
    static IEnumerable<int> UniqueValues(int[] a, int[] b)
    {
        // Write your code here
        return new int[0];
    }

    // The distinct numbers that are in both arrays, in the order of a
    static IEnumerable<int> Common(int[] a, int[] b)
    {
        // Write your code here
        return new int[0];
    }

    // The distinct numbers of a that are not in b
    static IEnumerable<int> OnlyInFirst(int[] a, int[] b)
    {
        // Write your code here
        return new int[0];
    }

    static void Main()
    {
        int[] a = { 1, 2, 3, 2 };
        int[] b = { 2, 4, 3 };
        ShowAll(AllValues(a, b));
        ShowAll(UniqueValues(a, b));
        ShowAll(Common(a, b));
        ShowAll(OnlyInFirst(a, b));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // All numbers of a, then all numbers of b (duplicates kept)
    static IEnumerable<int> AllValues(int[] a, int[] b)
    {
        return a.Concat(b);
    }

    // The distinct numbers of both arrays, in the order of first appearance
    static IEnumerable<int> UniqueValues(int[] a, int[] b)
    {
        return a.Union(b);
    }

    // The distinct numbers that are in both arrays, in the order of a
    static IEnumerable<int> Common(int[] a, int[] b)
    {
        return a.Intersect(b);
    }

    // The distinct numbers of a that are not in b
    static IEnumerable<int> OnlyInFirst(int[] a, int[] b)
    {
        return a.Except(b);
    }

    static void Main()
    {
        int[] a = { 1, 2, 3, 2 };
        int[] b = { 2, 4, 3 };
        ShowAll(AllValues(a, b));
        ShowAll(UniqueValues(a, b));
        ShowAll(Common(a, b));
        ShowAll(OnlyInFirst(a, b));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "1 2 3 2 2 4 3\n1 2 3 4\n2 3\n1\n",
        maxScore: 5,
      },
      {
        kind: "practice",
        slug: "linq-cartesian",
        title: { en: "Cartesian product", uk: "Декартів добуток" },
        language: "csharp",
        starter: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The names of all squares: each letter with each number, the letters outer
    static IEnumerable<string> Board(char[] letters, int[] numbers)
    {
        // Write your code here
        return new string[0];
    }

    // The sum of every pair, with the items of a in the outer loop
    static IEnumerable<int> Sums(int[] a, int[] b)
    {
        // Write your code here
        return new int[0];
    }

    static void Main()
    {
        ShowAll(Board(new[] { 'A', 'B' }, new[] { 1, 2 }));
        ShowAll(Sums(new[] { 1, 2 }, new[] { 10, 20 }));
        Console.WriteLine(Sums(new[] { 1, 2 }, new[] { 10, 20 }).Count());
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The names of all squares: each letter with each number, the letters outer
    static IEnumerable<string> Board(char[] letters, int[] numbers)
    {
        return letters.SelectMany(l => numbers.Select(n => l.ToString() + n));
    }

    // The sum of every pair, with the items of a in the outer loop
    static IEnumerable<int> Sums(int[] a, int[] b)
    {
        return a.SelectMany(x => b.Select(y => x + y));
    }

    static void Main()
    {
        ShowAll(Board(new[] { 'A', 'B' }, new[] { 1, 2 }));
        ShowAll(Sums(new[] { 1, 2 }, new[] { 10, 20 }));
        Console.WriteLine(Sums(new[] { 1, 2 }, new[] { 10, 20 }).Count());
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "A1 A2 B1 B2\n11 21 12 22\n4\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "linq-orderby-distinct", title: { en: "OrderBy and Distinct", uk: "OrderBy і Distinct" } },
      {
        kind: "practice",
        slug: "linq-build-dictionary",
        title: { en: "Building a dictionary", uk: "Складання словника" },
        language: "csharp",
        starter: PROGRAM(`    // Maps each distinct word to its length
    static Dictionary<string, int> LengthIndex(string[] words)
    {
        // Write your code here
        return new Dictionary<string, int>();
    }

    // True if the word is a key of the index
    static bool HasWord(Dictionary<string, int> index, string word)
    {
        // Write your code here
        return false;
    }

    static void Main()
    {
        var index = LengthIndex(new[] { "pear", "fig", "apple", "pear" });
        Console.WriteLine(index.Count);
        Console.WriteLine(index["apple"]);
        Console.WriteLine(index["fig"]);
        Console.WriteLine(HasWord(index, "pear"));
        Console.WriteLine(HasWord(index, "kiwi"));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Maps each distinct word to its length
    static Dictionary<string, int> LengthIndex(string[] words)
    {
        return words.Distinct().ToDictionary(w => w, w => w.Length);
    }

    // True if the word is a key of the index
    static bool HasWord(Dictionary<string, int> index, string word)
    {
        return index.ContainsKey(word);
    }

    static void Main()
    {
        var index = LengthIndex(new[] { "pear", "fig", "apple", "pear" });
        Console.WriteLine(index.Count);
        Console.WriteLine(index["apple"]);
        Console.WriteLine(index["fig"]);
        Console.WriteLine(HasWord(index, "pear"));
        Console.WriteLine(HasWord(index, "kiwi"));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "3\n5\n3\nTrue\nFalse\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "linq-tuples", title: { en: "Working with tuples", uk: "Робота з кортежами" } },
      {
        kind: "practice",
        slug: "linq-tuple-sort",
        title: { en: "Sorting tuples", uk: "Сортування кортежів" },
        language: "csharp",
        starter: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The players by score, highest first; equal scores by name
    static List<Tuple<string, int>> ByScoreDescending(List<Tuple<string, int>> items)
    {
        // Write your code here
        return items;
    }

    // The players sorted by name
    static IEnumerable<Tuple<string, int>> ByName(List<Tuple<string, int>> items)
    {
        // Write your code here
        return items;
    }

    // The player with the highest score; equal scores: the alphabetically first name
    static Tuple<string, int> Best(List<Tuple<string, int>> items)
    {
        // Write your code here
        return items[0];
    }

    static void Main()
    {
        var items = new List<Tuple<string, int>>
        {
            Tuple.Create("Ann", 70),
            Tuple.Create("Bob", 90),
            Tuple.Create("Cy", 70),
            Tuple.Create("Dan", 85)
        };
        foreach (var t in ByScoreDescending(items))
        {
            Console.WriteLine(t.Item1 + " " + t.Item2);
        }
        Console.WriteLine(Best(items).Item1 + " " + Best(items).Item2);
        ShowAll(ByName(items).Select(t => t.Item1));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The players by score, highest first; equal scores by name
    static List<Tuple<string, int>> ByScoreDescending(List<Tuple<string, int>> items)
    {
        return items.OrderByDescending(t => t.Item2).ThenBy(t => t.Item1).ToList();
    }

    // The players sorted by name
    static IEnumerable<Tuple<string, int>> ByName(List<Tuple<string, int>> items)
    {
        return items.OrderBy(t => t.Item1);
    }

    // The player with the highest score; equal scores: the alphabetically first name
    static Tuple<string, int> Best(List<Tuple<string, int>> items)
    {
        return ByScoreDescending(items).First();
    }

    static void Main()
    {
        var items = new List<Tuple<string, int>>
        {
            Tuple.Create("Ann", 70),
            Tuple.Create("Bob", 90),
            Tuple.Create("Cy", 70),
            Tuple.Create("Dan", 85)
        };
        foreach (var t in ByScoreDescending(items))
        {
            Console.WriteLine(t.Item1 + " " + t.Item2);
        }
        Console.WriteLine(Best(items).Item1 + " " + Best(items).Item2);
        ShowAll(ByName(items).Select(t => t.Item1));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "Bob 90\nDan 85\nAnn 70\nCy 70\nBob 90\nAnn Bob Cy Dan\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "linq-aggregates", title: { en: "Aggregate functions", uk: "Функції агрегування" } },
      {
        kind: "practice",
        slug: "linq-longest-word",
        title: { en: "Finding the longest word", uk: "Пошук найдовшого слова" },
        language: "csharp",
        starter: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The longest word; for a tie, the first one in the text
    static string Longest(string text)
    {
        // Write your code here
        return "";
    }

    // The length of the longest word
    static int LongestLength(string text)
    {
        // Write your code here
        return 0;
    }

    // The words of at least min letters, in the original order
    static IEnumerable<string> LongWords(string text, int min)
    {
        // Write your code here
        return new string[0];
    }

    static void Main()
    {
        string text = "the quick brown fox jumped over lazy dogs";
        Console.WriteLine(Longest(text));
        Console.WriteLine(LongestLength(text));
        ShowAll(LongWords(text, 5));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The longest word; for a tie, the first one in the text
    static string Longest(string text)
    {
        return text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)
                   .OrderByDescending(w => w.Length)
                   .First();
    }

    // The length of the longest word
    static int LongestLength(string text)
    {
        return text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Max(w => w.Length);
    }

    // The words of at least min letters, in the original order
    static IEnumerable<string> LongWords(string text, int min)
    {
        return text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length >= min);
    }

    static void Main()
    {
        string text = "the quick brown fox jumped over lazy dogs";
        Console.WriteLine(Longest(text));
        Console.WriteLine(LongestLength(text));
        ShowAll(LongWords(text, 5));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "jumped\n6\nquick brown jumped\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "linq-grouping", title: { en: "Grouping", uk: "Групування" } },
      {
        kind: "practice",
        slug: "linq-frequency",
        title: { en: "Building a frequency dictionary", uk: "Створення частотного словника" },
        language: "csharp",
        starter: PROGRAM(`    // Maps each word to the number of times it appears
    static Dictionary<string, int> Frequency(string[] words)
    {
        // Write your code here
        return new Dictionary<string, int>();
    }

    // The word that appears most often; for a tie, the alphabetically first word
    static string MostCommon(string[] words)
    {
        // Write your code here
        return "";
    }

    static void Main()
    {
        string[] words = { "a", "b", "a", "c", "a", "b" };
        var freq = Frequency(words);
        Console.WriteLine(freq["a"]);
        Console.WriteLine(freq["b"]);
        Console.WriteLine(freq.Count);
        Console.WriteLine(MostCommon(words));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Maps each word to the number of times it appears
    static Dictionary<string, int> Frequency(string[] words)
    {
        return words.GroupBy(w => w).ToDictionary(g => g.Key, g => g.Count());
    }

    // The word that appears most often; for a tie, the alphabetically first word
    static string MostCommon(string[] words)
    {
        return Frequency(words).OrderByDescending(kv => kv.Value).ThenBy(kv => kv.Key).First().Key;
    }

    static void Main()
    {
        string[] words = { "a", "b", "a", "c", "a", "b" };
        var freq = Frequency(words);
        Console.WriteLine(freq["a"]);
        Console.WriteLine(freq["b"]);
        Console.WriteLine(freq.Count);
        Console.WriteLine(MostCommon(words));
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "3\n2\n3\na\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "linq-todictionary-tolookup", title: { en: "ToDictionary and ToLookup", uk: "ToDictionary і ToLookup" } },
      {
        kind: "practice",
        slug: "linq-reverse-index",
        title: { en: "Building a reverse index", uk: "Створення оберненого індексу" },
        language: "csharp",
        starter: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // Maps each word to the numbers of the documents (from 1) that contain it
    static ILookup<string, int> BuildIndex(string[] docs)
    {
        // Write your code here
        return new int[0].ToLookup(x => "", x => x);
    }

    static void Main()
    {
        string[] docs = { "cat dog", "dog bird", "cat fish cat" };
        var index = BuildIndex(docs);
        ShowAll(index["cat"]);
        ShowAll(index["dog"]);
        ShowAll(index["fish"]);
        Console.WriteLine(index["zebra"].Count());
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // Maps each word to the numbers of the documents (from 1) that contain it
    static ILookup<string, int> BuildIndex(string[] docs)
    {
        return docs.SelectMany((text, i) => text.Split(' ').Distinct()
                                              .Select(w => new KeyValuePair<string, int>(w, i + 1)))
                   .ToLookup(p => p.Key, p => p.Value);
    }

    static void Main()
    {
        string[] docs = { "cat dog", "dog bird", "cat fish cat" };
        var index = BuildIndex(docs);
        ShowAll(index["cat"]);
        ShowAll(index["dog"]);
        ShowAll(index["fish"]);
        Console.WriteLine(index["zebra"].Count());
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "1 3\n1 2\n3\n0\n",
        maxScore: 5,
      },
      { kind: "lecture", slug: "linq-behind-scenes", title: { en: "What is left behind the scenes", uk: "Що залишилось за кадром" } },
      {
        kind: "quiz",
        slug: "linq-review",
        title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
        questions: [
          {
            id: "select-or-where",
            mode: "single",
            prompt: { en: "Which method turns each item into a new value?", uk: "Який метод перетворює кожен елемент на нове значення?" },
            options: [
              { id: "a", text: { en: "`Select`", uk: "`Select`" } },
              { id: "b", text: { en: "`Where`", uk: "`Where`" } },
              { id: "c", text: { en: "`Take`", uk: "`Take`" } },
            ],
            correct: ["a"],
          },
          {
            id: "selectmany-meaning",
            mode: "single",
            prompt: { en: "Which method gives all the results of several sequences as one flat sequence?", uk: "Який метод дає всі результати кількох послідовностей однією плоскою послідовністю?" },
            options: [
              { id: "a", text: { en: "`SelectMany`", uk: "`SelectMany`" } },
              { id: "b", text: { en: "`Select`", uk: "`Select`" } },
              { id: "c", text: { en: "`Aggregate`", uk: "`Aggregate`" } },
            ],
            correct: ["a"],
          },
          {
            id: "orderby-stable",
            mode: "single",
            prompt: { en: "What does `OrderBy` do with items that have equal keys?", uk: "Що робить `OrderBy` з елементами з однаковими ключами?" },
            options: [
              { id: "a", text: { en: "Keeps their original order: the sort is stable", uk: "Зберігає їхній початковий порядок: сортування стабільне" } },
              { id: "b", text: { en: "Removes them", uk: "Видаляє їх" } },
              { id: "c", text: { en: "Puts them in random order", uk: "Ставить їх у випадковому порядку" } },
            ],
            correct: ["a"],
          },
          {
            id: "todictionary-duplicates",
            mode: "single",
            prompt: { en: "What happens with `ToDictionary` when the same key appears twice?", uk: "Що станеться з `ToDictionary`, коли той самий ключ трапляється двічі?" },
            options: [
              { id: "a", text: { en: "An `ArgumentException` is thrown", uk: "Кидається `ArgumentException`" } },
              { id: "b", text: { en: "The second value is silently ignored", uk: "Друге значення мовчки ігнорується" } },
              { id: "c", text: { en: "Both values are stored under one key", uk: "Обидва значення зберігаються під одним ключем" } },
            ],
            correct: ["a"],
          },
          {
            id: "when-executed",
            mode: "single",
            prompt: { en: "When is a LINQ query actually executed?", uk: "Коли насправді виконується запит LINQ?" },
            options: [
              { id: "a", text: { en: "When its result is read, for example by `ToList`, `foreach` or `Count`", uk: "Коли читають його результат, наприклад через `ToList`, `foreach` або `Count`" } },
              { id: "b", text: { en: "At the moment the query is written", uk: "У момент, коли запит написано" } },
              { id: "c", text: { en: "When the program starts", uk: "Коли програма запускається" } },
            ],
            correct: ["a"],
          },
        ],
      },
      {
        kind: "practice",
        slug: "linq-median-bigrams",
        title: { en: "Practice: Median & Bigrams", uk: "Практика «Median & Bigrams»" },
        language: "csharp",
        starter: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The median of the values; 0 for no values
    static double Median(IEnumerable<double> values)
    {
        // Write your code here
        return 0;
    }

    // The bigrams of the text: every two adjacent characters
    static IEnumerable<string> Bigrams(string text)
    {
        // Write your code here
        return new string[0];
    }

    static void Main()
    {
        Console.WriteLine(Median(new double[] { 5, 1, 9, 3 }));
        Console.WriteLine(Median(new double[] { 2, 7, 4, 10 }));
        ShowAll(Bigrams("hello"));
        ShowAll(Bigrams("a"));
        Console.WriteLine(Bigrams("abcabc").Distinct().Count());
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        solution: PROGRAM(`    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The median of the values; 0 for no values
    static double Median(IEnumerable<double> values)
    {
        List<double> sorted = values.OrderBy(v => v).ToList();
        int n = sorted.Count;
        if (n == 0)
        {
            return 0;
        }
        if (n % 2 == 1)
        {
            return sorted[n / 2];
        }
        return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    }

    // The bigrams of the text: every two adjacent characters
    static IEnumerable<string> Bigrams(string text)
    {
        return Enumerable.Range(0, Math.Max(0, text.Length - 1)).Select(i => text.Substring(i, 2));
    }

    static void Main()
    {
        Console.WriteLine(Median(new double[] { 5, 1, 9, 3 }));
        Console.WriteLine(Median(new double[] { 2, 7, 4, 10 }));
        ShowAll(Bigrams("hello"));
        ShowAll(Bigrams("a"));
        Console.WriteLine(Bigrams("abcabc").Distinct().Count());
    }`, "using System.Collections.Generic;\nusing System.Linq;"),
        expectedOutput: "4\n5.5\nhe el ll lo\n\n3\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "linq-read-file",
        title: { en: "Practice: Reading a file", uk: "Практика «Читання файлу»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class Record
{
    public string Name;
    public int Value;
}`,
          `        string[] file =
        {
            "# sales",
            "apple;10",
            "",
            "pear;x",
            "plum;25",
            "fig;7",
            "  kiwi ; 40  "
        };
        var records = ParseRecords(file).ToList();
        Console.WriteLine(records.Count);
        Console.WriteLine(Total(records));
        ShowAll(NamesOver(records, 20));
        Console.WriteLine(records[0].Name);`,
          "using System.Collections.Generic;\nusing System.Linq;",
          `    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // One Record per valid line, in the file order (use yield return)
    static IEnumerable<Record> ParseRecords(IEnumerable<string> lines)
    {
        // Write your code here
        return new Record[0];
    }

    // The sum of the values
    static int Total(IEnumerable<Record> records)
    {
        // Write your code here
        return 0;
    }

    // The names of the records whose value is greater than limit, in the file order
    static IEnumerable<string> NamesOver(IEnumerable<Record> records, int limit)
    {
        // Write your code here
        return new string[0];
    }`,
        ),
        solution: PROGRAM_WITH(
          `class Record
{
    public string Name;
    public int Value;
}`,
          `        string[] file =
        {
            "# sales",
            "apple;10",
            "",
            "pear;x",
            "plum;25",
            "fig;7",
            "  kiwi ; 40  "
        };
        var records = ParseRecords(file).ToList();
        Console.WriteLine(records.Count);
        Console.WriteLine(Total(records));
        ShowAll(NamesOver(records, 20));
        Console.WriteLine(records[0].Name);`,
          "using System.Collections.Generic;\nusing System.Linq;",
          `    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // One Record per valid line, in the file order (use yield return)
    static IEnumerable<Record> ParseRecords(IEnumerable<string> lines)
    {
        foreach (string raw in lines)
        {
            string line = raw.Trim();
            if (line == "" || line.StartsWith("#"))
            {
                continue;
            }
            string[] parts = line.Split(';');
            if (parts.Length != 2)
            {
                continue;
            }
            int value;
            if (int.TryParse(parts[1].Trim(), out value))
            {
                yield return new Record { Name = parts[0].Trim(), Value = value };
            }
        }
    }

    // The sum of the values
    static int Total(IEnumerable<Record> records)
    {
        return records.Sum(r => r.Value);
    }

    // The names of the records whose value is greater than limit, in the file order
    static IEnumerable<string> NamesOver(IEnumerable<Record> records, int limit)
    {
        return records.Where(r => r.Value > limit).Select(r => r.Name);
    }`,
          ),
        expectedOutput: "4\n82\nplum kiwi\napple\n",
        maxScore: 10,
      },
      {
        kind: "practice",
        slug: "linq-statistics",
        title: { en: "Practice: Statistics", uk: "Практика «Статистика»" },
        language: "csharp",
        starter: PROGRAM_WITH(
          `class Sale
{
    public string Product;
    public int Quantity;
    public decimal Price;

    public Sale(string product, int quantity, decimal price)
    {
        Product = product;
        Quantity = quantity;
        Price = price;
    }
}`,
          `        string[] lines =
        {
            "product,quantity,price",
            "apple,3,1.5",
            "pear,2,2.25",
            "apple,1,1.5",
            "fig,x,4",
            "kiwi,4,0.75",
            "pear,1,2.25",
            "bad line"
        };
        var sales = ReadSales(lines);
        Console.WriteLine(sales.Count);
        Console.WriteLine(Revenue(sales));
        Console.WriteLine(TopProduct(sales));
        ShowAll(ProductsBySales(sales));`,
          "using System.Collections.Generic;\nusing System.Globalization;\nusing System.Linq;",
          `    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The valid rows: exactly three fields, a whole quantity and a decimal price
    static List<Sale> ReadSales(string[] lines)
    {
        // Write your code here
        return new List<Sale>();
    }

    // The sum of Quantity * Price over all sales
    static decimal Revenue(List<Sale> sales)
    {
        // Write your code here
        return 0m;
    }

    // The product with the highest revenue; for a tie, the alphabetically first
    static string TopProduct(List<Sale> sales)
    {
        // Write your code here
        return "";
    }

    // The distinct products by total quantity, highest first; for a tie, alphabetically
    static IEnumerable<string> ProductsBySales(List<Sale> sales)
    {
        // Write your code here
        return new string[0];
    }`,
        ),
        solution: PROGRAM_WITH(
          `class Sale
{
    public string Product;
    public int Quantity;
    public decimal Price;

    public Sale(string product, int quantity, decimal price)
    {
        Product = product;
        Quantity = quantity;
        Price = price;
    }
}`,
          `        string[] lines =
        {
            "product,quantity,price",
            "apple,3,1.5",
            "pear,2,2.25",
            "apple,1,1.5",
            "fig,x,4",
            "kiwi,4,0.75",
            "pear,1,2.25",
            "bad line"
        };
        var sales = ReadSales(lines);
        Console.WriteLine(sales.Count);
        Console.WriteLine(Revenue(sales));
        Console.WriteLine(TopProduct(sales));
        ShowAll(ProductsBySales(sales));`,
          "using System.Collections.Generic;\nusing System.Globalization;\nusing System.Linq;",
          `    // Prints any sequence on one line, separated by spaces
    static void ShowAll<T>(IEnumerable<T> items)
    {
        var parts = new List<string>();
        foreach (T item in items)
        {
            parts.Add(item.ToString());
        }
        Console.WriteLine(string.Join(" ", parts.ToArray()));
    }

    // The valid rows: exactly three fields, a whole quantity and a decimal price
    static List<Sale> ReadSales(string[] lines)
    {
        var sales = new List<Sale>();
        foreach (string line in lines)
        {
            string[] parts = line.Split(',');
            if (parts.Length != 3)
            {
                continue;
            }
            int quantity;
            decimal price;
            if (int.TryParse(parts[1], out quantity)
                && decimal.TryParse(parts[2], NumberStyles.Number, CultureInfo.InvariantCulture, out price))
            {
                sales.Add(new Sale(parts[0], quantity, price));
            }
        }
        return sales;
    }

    // The sum of Quantity * Price over all sales
    static decimal Revenue(List<Sale> sales)
    {
        return sales.Sum(s => s.Quantity * s.Price);
    }

    // The product with the highest revenue; for a tie, the alphabetically first
    static string TopProduct(List<Sale> sales)
    {
        return sales.GroupBy(s => s.Product)
                    .Select(g => new { Product = g.Key, Revenue = g.Sum(s => s.Quantity * s.Price) })
                    .OrderByDescending(x => x.Revenue)
                    .ThenBy(x => x.Product)
                    .First().Product;
    }

    // The distinct products by total quantity, highest first; for a tie, alphabetically
    static IEnumerable<string> ProductsBySales(List<Sale> sales)
    {
        return sales.GroupBy(s => s.Product)
                    .OrderByDescending(g => g.Sum(s => s.Quantity))
                    .ThenBy(g => g.Key)
                    .Select(g => g.Key);
    }`,
        ),
        expectedOutput: "5\n15.75\npear\napple kiwi pear\n",
        maxScore: 20,
      },
    ],
  },
];
