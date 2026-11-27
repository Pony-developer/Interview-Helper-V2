import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const logTypes = (body: string) => `class LogEntry
{
    public DateTime Time;
    public string Level;
    public string Source;
    public string Message;
    public int? DurationMs;
}

static class LogParser
{
    // Lines look like:  2024-03-05 14:30:05 [WARN] (Billing) Payment retried took 350ms
    // Write ONE regex with named groups: date+time, level (INFO|WARN|ERROR), source in parentheses,
    // and the message. If the message ends with "took <n>ms", also capture n as DurationMs.
    // Lines that don't match return null.
    private static readonly Regex Line = new Regex(
${body.split("@@")[0]});

    public static LogEntry Parse(string line)
    {
${body.split("@@")[1]}
    }
}`;

const logSolution = `        @"^(?<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(?<level>INFO|WARN|ERROR)\\] \\((?<source>[^)]+)\\) (?<message>.*?)(?: took (?<ms>\\d+)ms)?$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant@@        Match m = Line.Match(line);
        if (!m.Success) return null;
        return new LogEntry
        {
            Time = DateTime.ParseExact(m.Groups["time"].Value, "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
            Level = m.Groups["level"].Value,
            Source = m.Groups["source"].Value,
            Message = m.Groups["message"].Value,
            DurationMs = m.Groups["ms"].Success ? int.Parse(m.Groups["ms"].Value) : (int?)null,
        };`;

const logStarter = `        "TODO", RegexOptions.None@@        // Write your code here
        throw new NotImplementedException();`;

const logMain = `        var lines = new[]
        {
            "2024-03-05 14:30:05 [WARN] (Billing) Payment retried took 350ms",
            "2024-03-05 14:30:06 [INFO] (Web) GET /orders/42",
            "2024-03-05 14:31:00 [ERROR] (Sql Server) Deadlock detected took 1200ms",
            "garbage line",
            "2024-03-05 14:31:01 [DEBUG] (Web) not a known level",
        };
        foreach (var l in lines)
        {
            LogEntry e = LogParser.Parse(l);
            if (e == null) { Console.WriteLine("skipped: " + l); continue; }
            Console.WriteLine(e.Time.ToString("HH:mm:ss") + " | " + e.Level + " | " + e.Source + " | " + e.Message
                + (e.DurationMs.HasValue ? " | " + e.DurationMs + " ms" : ""));
        }`;

const maskTypes = (body: string) => `static class Privacy
{
    // 1. Masks e-mail addresses: keep the first letter of the user part and the whole domain:
    //    "anna.k@shop.test" -> "a***@shop.test".
    public static string MaskEmails(string text) { ${body.split("@@")[0]} }

    // 2. Masks card numbers of 16 digits, optionally grouped by spaces or dashes in fours,
    //    keeping only the last 4 digits: "4111 1111 1111 1234" -> "**** **** **** 1234".
    public static string MaskCards(string text) { ${body.split("@@")[1]} }

    // 3. Converts dates from dd.MM.yyyy to ISO yyyy-MM-dd using a replacement pattern with named groups.
    public static string IsoDates(string text) { ${body.split("@@")[2]} }

    // 4. Splits on commas or semicolons with optional surrounding spaces; empty items removed.
    public static string[] SplitList(string text) { ${body.split("@@")[3]} }
}`;

const maskSolution = [
  `return Regex.Replace(text, @"\\b([A-Za-z0-9])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})\\b", "$1***@$2");`,
  `return Regex.Replace(text, @"\\b(?:\\d{4}[ -]?){3}(\\d{4})\\b", m => "**** **** **** " + m.Groups[1].Value);`,
  `return Regex.Replace(text, @"\\b(?<d>\\d{2})\\.(?<m>\\d{2})\\.(?<y>\\d{4})\\b", "\${y}-\${m}-\${d}");`,
  `return Regex.Split(text.Trim(), @"\\s*[,;]\\s*").Where(s => s.Length > 0).ToArray();`,
].join("@@");

const maskMain = `        string note = "Contact anna.k@shop.test or BOB@Example.org; card 4111 1111 1111 1234, backup 5500-0000-0000-0004. Order 1234567890 is fine.";
        string masked = Privacy.MaskCards(Privacy.MaskEmails(note));
        Console.WriteLine(masked);
        Console.WriteLine(Privacy.IsoDates("Shipped 05.03.2024, delivered 07.03.2024; invoice 1.2.2024 stays."));
        Console.WriteLine(string.Join("|", Privacy.SplitList(" pens , ink;; pads ;  ")));`;

const ni = "throw new NotImplementedException();";

export const regexModule: ModuleDef = {
  slug: "regex",
  title: { en: "Regular expressions", uk: "Регулярні вирази" },
  slides: [
    lecture("regex-basics", "Regular expression basics", "Основи регулярних виразів"),
    lecture("regex-quantifiers-assertions", "Quantifiers and zero-width assertions", "Квантифікатори та твердження нульової ширини"),
    lecture("regex-groups-replace", "Groups, replacing and splitting", "Групи, заміна та розбиття"),
    lecture("regex-performance-security", "Options, performance and ReDoS", "Опції, продуктивність і ReDoS"),
    quiz("regex-quiz", "Regular expressions", "Регулярні вирази", [
      question(
        "anchors",
        ["Why does `Regex.IsMatch(input, @\"\\d{4}\")` accept \"abc12345xyz\" when you wanted exactly four digits?", "Чому `Regex.IsMatch(input, @\"\\d{4}\")` приймає \"abc12345xyz\", коли хотіли рівно чотири цифри?"],
        [
          ["`\\d` matches letters", "`\\d` збігається з літерами"],
          ["IsMatch searches for the pattern anywhere; anchor it as `^\\d{4}$` (or `\\A...\\z`) to match the whole input", "IsMatch шукає патерн будь-де; закріпіть його як `^\\d{4}$` (або `\\A...\\z`), щоб збігався весь вхід"],
          ["`{4}` means \"at least 4\"", "`{4}` означає «щонайменше 4»"],
          ["It's a .NET bug", "Це помилка .NET"],
        ],
        "b",
      ),
      question(
        "lazy",
        ["On `<b>one</b><b>two</b>`, what does `<b>.*</b>` match versus `<b>.*?</b>`?", "Що на `<b>one</b><b>two</b>` збігається з `<b>.*</b>`, а що з `<b>.*?</b>`?"],
        [
          ["The same thing", "Те саме"],
          ["`.*` matches nothing", "`.*` нічого не збігає"],
          ["Greedy `.*` takes the whole string up to the last `</b>`; lazy `.*?` stops at the first `</b>`", "Жадібний `.*` бере весь рядок до останнього `</b>`; лінивий `.*?` зупиняється на першому `</b>`"],
          ["`.*?` is invalid", "`.*?` невалідний"],
        ],
        "c",
      ),
      question(
        "verbatim",
        ["Why are regex patterns usually written as verbatim strings `@\"...\"`?", "Чому патерни регулярних виразів зазвичай пишуть дослівними рядками `@\"...\"`?"],
        [
          ["Verbatim strings are faster", "Дослівні рядки швидші"],
          ["So backslashes reach the regex engine as written; otherwise `\\d` must be typed `\\\\d`", "Щоб зворотні скісні доходили до рушія регулярних виразів як написано; інакше `\\d` довелося б писати `\\\\d`"],
          ["Regex requires them", "Regex цього вимагає"],
          ["To enable multiline mode", "Щоб увімкнути багаторядковий режим"],
        ],
        "b",
      ),
      question(
        "named-groups",
        ["How do you refer to a named group `(?<year>\\d{4})` in a replacement pattern?", "Як посилатися на іменовану групу `(?<year>\\d{4})` у шаблоні заміни?"],
        [
          ["`${year}`", "`${year}`"],
          ["`\\year`", "`\\year`"],
          ["`{year}`", "`{year}`"],
          ["`%year%`", "`%year%`"],
        ],
        "a",
      ),
      question(
        "lookahead",
        ["What does `^(?=.*\\d)(?=.*[A-Z]).{8,}$` check?", "Що перевіряє `^(?=.*\\d)(?=.*[A-Z]).{8,}$`?"],
        [
          ["Exactly 8 digits", "Рівно 8 цифр"],
          ["A string starting with a digit and a capital letter", "Рядок, що починається з цифри й великої літери"],
          ["It doesn't compile", "Не компілюється"],
          ["At least 8 characters containing at least one digit and one uppercase letter (lookaheads check without consuming)", "Щонайменше 8 символів, серед яких хоча б одна цифра й одна велика літера (lookahead перевіряють, не поглинаючи)"],
        ],
        "d",
      ),
      question(
        "redos",
        ["What is ReDoS and how do you defend against it?", "Що таке ReDoS і як від нього захиститися?"],
        [
          ["A regex that's too long; split it", "Задовгий регулярний вираз; розбити його"],
          ["Catastrophic backtracking on crafted input (e.g. nested quantifiers like `(a+)+$`) that burns CPU; use a match timeout, avoid ambiguous nested quantifiers, or use RegexOptions.NonBacktracking (.NET 7)", "Катастрофічний бектрекінг на спеціально підібраному вході (наприклад, вкладені квантифікатори на кшталт `(a+)+$`), що спалює CPU; використовуйте тайм-аут збігу, уникайте неоднозначних вкладених квантифікаторів або RegexOptions.NonBacktracking (.NET 7)"],
          ["A denial of the regex license", "Відмова в ліцензії на регулярні вирази"],
          ["Too many Regex objects; use static methods", "Забагато об'єктів Regex; використовуйте статичні методи"],
        ],
        "b",
      ),
      question(
        "compiled",
        ["Which are true about regex performance in .NET?", "Що правда про продуктивність регулярних виразів у .NET?"],
        [
          ["Static `Regex.IsMatch(input, pattern)` calls cache recently used patterns", "Статичні виклики `Regex.IsMatch(input, pattern)` кешують нещодавно використані патерни"],
          ["`RegexOptions.Compiled` generates IL: slower to construct, faster to run; reuse the instance", "`RegexOptions.Compiled` генерує IL: повільніше створюється, швидше виконується; повторно використовуйте екземпляр"],
          ["`[GeneratedRegex]` (.NET 7) generates the matcher as C# at build time", "`[GeneratedRegex]` (.NET 7) генерує зіставляч як C# під час збирання"],
          ["Creating a new Regex for every call is the fastest approach", "Створення нового Regex на кожен виклик — найшвидший підхід"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "word-boundary",
        ["What does `\\bcat\\b` match in \"cat concatenate cat.\"?", "З чим збігається `\\bcat\\b` у \"cat concatenate cat.\"?"],
        [
          ["Three times, including inside \"concatenate\"", "Тричі, зокрема всередині \"concatenate\""],
          ["Once", "Один раз"],
          ["Twice: only the whole words \"cat\" (\\b is the boundary between a word character and a non-word character)", "Двічі: лише цілі слова \"cat\" (\\b — межа між символом слова й не-символом слова)"],
          ["Never", "Ніколи"],
        ],
        "c",
      ),
    ]),
    practice("log-regex-practice", "Parse log lines with named groups", "Розбір рядків логу з іменованими групами", {
      starter: PROGRAM_WITH(logTypes(logStarter), logMain, "using System.Globalization;\nusing System.Text.RegularExpressions;"),
      solution: PROGRAM_WITH(logTypes(logSolution), logMain, "using System.Globalization;\nusing System.Text.RegularExpressions;"),
      expectedOutput:
        "14:30:05 | WARN | Billing | Payment retried | 350 ms\n14:30:06 | INFO | Web | GET /orders/42\n14:31:00 | ERROR | Sql Server | Deadlock detected | 1200 ms\nskipped: garbage line\nskipped: 2024-03-05 14:31:01 [DEBUG] (Web) not a known level\n",
    }),
    practice("regex-replace-practice", "Masking and transforming text with Regex.Replace", "Маскування та перетворення тексту через Regex.Replace", {
      starter: PROGRAM_WITH(maskTypes([ni, ni, ni, ni].join("@@")), maskMain, "using System.Linq;\nusing System.Text.RegularExpressions;"),
      solution: PROGRAM_WITH(maskTypes(maskSolution), maskMain, "using System.Linq;\nusing System.Text.RegularExpressions;"),
      expectedOutput:
        "Contact a***@shop.test or B***@Example.org; card **** **** **** 1234, backup **** **** **** 0004. Order 1234567890 is fine.\nShipped 2024-03-05, delivered 2024-03-07; invoice 1.2.2024 stays.\npens|ink|pads\n",
    }),
  ],
};
