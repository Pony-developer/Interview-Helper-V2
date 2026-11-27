import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const csvTypes = (body: string) => `static class Invoice
{
    // Builds an invariant-culture CSV line: "2024-03-05,ACME Ltd,1234.50,EUR".
    // Text containing a comma or a quote is wrapped in quotes, and quotes inside are doubled.
    public static string ToCsv(DateTime date, string customer, decimal amount, string currency)
    {
${body.split("@@")[0]}
    }

    // Parses an amount typed by a user in the given culture, e.g. "1.234,50" in de-DE or "1,234.50" in en-US.
    // Returns null when the text isn't a valid number.
    public static decimal? ParseAmount(string text, string cultureName)
    {
${body.split("@@")[1]}
    }
}`;

const csvMain = `        CultureInfo.CurrentCulture = new CultureInfo("de-DE");   // a hostile current culture
        var d = new DateTime(2024, 3, 5, 14, 30, 0);
        Console.WriteLine(Invoice.ToCsv(d, "ACME Ltd", 1234.5m, "EUR"));
        Console.WriteLine(Invoice.ToCsv(d, "Smith, John", 99m, "USD"));
        Console.WriteLine(Invoice.ToCsv(d, "The \\"Best\\" Shop", 0.1m, "UAH"));
        Console.WriteLine(Invoice.ParseAmount("1.234,50", "de-DE"));
        Console.WriteLine(Invoice.ParseAmount("1,234.50", "en-US"));
        Console.WriteLine(Invoice.ParseAmount("12abc", "en-US") == null ? "invalid" : "?");
        var sb = new StringBuilder();
        for (int i = 1; i <= 3; i++) sb.Append(i).Append(i < 3 ? ";" : "");
        Console.WriteLine(sb.ToString().ToString(CultureInfo.InvariantCulture));`;

const csvSolution = `        var inv = CultureInfo.InvariantCulture;
        return string.Join(",",
            date.ToString("yyyy-MM-dd", inv),
            Escape(customer),
            amount.ToString("0.00", inv),
            Escape(currency));
    }

    private static string Escape(string value)
    {
        if (value.IndexOf(',') < 0 && value.IndexOf('"') < 0) return value;
        return "\\"" + value.Replace("\\"", "\\"\\"") + "\\"";@@        decimal result;
        return decimal.TryParse(text, NumberStyles.Number, new CultureInfo(cultureName), out result) ? result : (decimal?)null;`;

const durationTypes = (body: string) => `static class Durations
{
    // "1d 2h 30m 15s" (any subset, any order, spaces optional) -> TimeSpan. Unknown units throw FormatException.
    public static TimeSpan Parse(string text)
    {
${body.split("@@")[0]}
    }

    // Formats like "1d 2h 30m 15s", skipping zero parts; TimeSpan.Zero -> "0s".
    public static string Format(TimeSpan t)
    {
${body.split("@@")[1]}
    }
}`;

const durationMain = `        foreach (var s in new[] { "1d 2h 30m 15s", "90m", "45s 1h", "2h0m" })
        {
            TimeSpan t = Durations.Parse(s);
            Console.WriteLine(s + " => " + t + " => " + Durations.Format(t));
        }
        Console.WriteLine(Durations.Format(TimeSpan.Zero));
        try { Durations.Parse("3w"); }
        catch (FormatException e) { Console.WriteLine("error: " + e.Message); }
        var start = new DateTime(2024, 1, 30);
        Console.WriteLine(start.AddMonths(1).ToString("yyyy-MM-dd"));
        Console.WriteLine((new DateTime(2024, 3, 1) - start).TotalDays);`;

const durationSolution = `        var result = TimeSpan.Zero;
        int i = 0;
        string s = text.Replace(" ", "");
        while (i < s.Length)
        {
            int start = i;
            while (i < s.Length && char.IsDigit(s[i])) i++;
            if (start == i || i >= s.Length) throw new FormatException("Bad duration: " + text);
            int n = int.Parse(s.Substring(start, i - start), CultureInfo.InvariantCulture);
            switch (s[i])
            {
                case 'd': result += TimeSpan.FromDays(n); break;
                case 'h': result += TimeSpan.FromHours(n); break;
                case 'm': result += TimeSpan.FromMinutes(n); break;
                case 's': result += TimeSpan.FromSeconds(n); break;
                default: throw new FormatException("Unknown unit '" + s[i] + "'");
            }
            i++;
        }
        return result;@@        if (t == TimeSpan.Zero) return "0s";
        var parts = new List<string>();
        if (t.Days > 0) parts.Add(t.Days + "d");
        if (t.Hours > 0) parts.Add(t.Hours + "h");
        if (t.Minutes > 0) parts.Add(t.Minutes + "m");
        if (t.Seconds > 0) parts.Add(t.Seconds + "s");
        return string.Join(" ", parts);`;

export const textDatesModule: ModuleDef = {
  slug: "text-dates",
  title: { en: "Strings, text, dates and formatting", uk: "Рядки, текст, дати та форматування" },
  slides: [
    lecture("string-api", "The string API and StringBuilder", "API рядків і StringBuilder"),
    lecture("text-encodings", "Text encodings and Unicode", "Кодування тексту та Unicode"),
    lecture("dates-times", "DateTime, DateTimeOffset, DateOnly and TimeOnly", "DateTime, DateTimeOffset, DateOnly і TimeOnly"),
    lecture("time-zones", "Time zones and daylight saving", "Часові пояси та літній час"),
    lecture("formatting-parsing", "Formatting, parsing and culture", "Форматування, розбір і культура"),
    quiz("text-dates-quiz", "Strings, text, dates and formatting", "Рядки, текст, дати та форматування", [
      question(
        "compare",
        ["Which comparison should you use for identifiers, file names and keys like \"SKU-42\"?", "Яке порівняння брати для ідентифікаторів, імен файлів і ключів на кшталт \"SKU-42\"?"],
        [
          ["`StringComparison.CurrentCulture`", "`StringComparison.CurrentCulture`"],
          ["`StringComparison.Ordinal` or `OrdinalIgnoreCase`: byte-wise, fast and the same on every machine", "`StringComparison.Ordinal` або `OrdinalIgnoreCase`: побайтове, швидке й однакове на кожній машині"],
          ["`ToLower()` on both sides and `==`", "`ToLower()` з обох боків і `==`"],
          ["`CompareTo` with the default culture", "`CompareTo` з культурою за замовчуванням"],
        ],
        "b",
      ),
      question(
        "utf8",
        ["How many bytes does the string \"€\" take in UTF-8, and how many `char`s in .NET?", "Скільки байтів займає рядок \"€\" в UTF-8 і скільки `char` у .NET?"],
        [
          ["1 byte, 1 char", "1 байт, 1 char"],
          ["2 bytes, 2 chars", "2 байти, 2 char"],
          ["3 bytes in UTF-8, 1 char (one UTF-16 code unit)", "3 байти в UTF-8, 1 char (одна кодова одиниця UTF-16)"],
          ["4 bytes, 2 chars", "4 байти, 2 char"],
        ],
        "c",
      ),
      question(
        "datetimeoffset",
        ["Why is `DateTimeOffset` often preferred over `DateTime` for timestamps?", "Чому для міток часу `DateTimeOffset` часто кращий за `DateTime`?"],
        [
          ["It stores the offset from UTC, so the instant is unambiguous", "Він зберігає зсув від UTC, тож момент часу однозначний"],
          ["It is smaller", "Він менший"],
          ["It supports time zones with daylight saving rules", "Він підтримує часові пояси з правилами літнього часу"],
          ["It has nanosecond precision", "Він має наносекундну точність"],
        ],
        "a",
      ),
      question(
        "dateonly",
        ["What is `DateOnly` (.NET 6) best for?", "Для чого найкраще підходить `DateOnly` (.NET 6)?"],
        [
          ["Timestamps of events", "Мітки часу подій"],
          ["Measuring durations", "Вимірювання тривалості"],
          ["Storing time zones", "Зберігання часових поясів"],
          ["Calendar dates with no time of day, like a birthday or a due date", "Календарні дати без часу доби, як-от день народження чи термін оплати"],
        ],
        "d",
      ),
      question(
        "invariant",
        ["A program writes `price.ToString()` to a file on a German machine and parses it on a US machine. What goes wrong?", "Програма пише `price.ToString()` у файл на німецькій машині, а розбирає на американській. Що піде не так?"],
        [
          ["Nothing", "Нічого"],
          ["The decimal separator is a comma in de-DE, so \"12,5\" is read as 125 (or fails); machine-readable data should use `CultureInfo.InvariantCulture`", "У de-DE десятковий роздільник — кома, тож \"12,5\" прочитається як 125 (або впаде); машинні дані слід писати з `CultureInfo.InvariantCulture`"],
          ["The file encoding changes", "Змінюється кодування файлу"],
          ["`ToString()` throws", "`ToString()` кидає виняток"],
        ],
        "b",
      ),
      question(
        "format-strings",
        ["Which format strings are standard .NET format strings?", "Які з цих рядків формату — стандартні рядки формату .NET?"],
        [
          ["`\"C\"` currency, `\"N2\"` number with 2 decimals", "`\"C\"` валюта, `\"N2\"` число з 2 знаками"],
          ["`\"o\"` round-trip ISO 8601 date", "`\"o\"` дата ISO 8601 для round-trip"],
          ["`\"P\"` percent", "`\"P\"` відсоток"],
          ["`\"Z9\"` zero-padded to 9 digits", "`\"Z9\"` доповнення нулями до 9 цифр"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "stringbuilder",
        ["Why use `StringBuilder` when concatenating in a loop?", "Навіщо `StringBuilder`, коли рядки склеюють у циклі?"],
        [
          ["It's thread-safe", "Він потокобезпечний"],
          ["It compresses text", "Він стискає текст"],
          ["It appends into a growable buffer, avoiding a new string copy per iteration (O(n) instead of O(n²))", "Він дописує в буфер, що росте, уникаючи нової копії рядка на кожній ітерації (O(n) замість O(n²))"],
          ["Strings can't be concatenated in loops", "Рядки не можна склеювати в циклах"],
        ],
        "c",
      ),
      question(
        "dst",
        ["Adding `TimeSpan.FromHours(24)` to a local `DateTime` the evening before a DST change gives...", "Додавання `TimeSpan.FromHours(24)` до локального `DateTime` увечері перед переходом на літній час дає..."],
        [
          ["Always the same wall-clock time tomorrow", "Завжди той самий час на годиннику завтра"],
          ["A local time that may be an hour off from 'same time tomorrow': DateTime arithmetic ignores DST, so do instant math in UTC", "Локальний час, що може відрізнятися на годину від «того самого часу завтра»: арифметика DateTime ігнорує літній час, тож рахуйте моменти в UTC"],
          ["An exception", "Виняток"],
          ["UTC time", "Час UTC"],
        ],
        "b",
      ),
    ]),
    practice("culture-csv-practice", "Culture-safe CSV and parsing", "CSV і розбір, безпечні щодо культури", {
      starter: PROGRAM_WITH(csvTypes(`${TODO}@@${TODO}`), csvMain, "using System.Globalization;\nusing System.Text;"),
      solution: PROGRAM_WITH(csvTypes(csvSolution), csvMain, "using System.Globalization;\nusing System.Text;"),
      expectedOutput:
        "2024-03-05,ACME Ltd,1234.50,EUR\n2024-03-05,\"Smith, John\",99.00,USD\n2024-03-05,\"The \"\"Best\"\" Shop\",0.10,UAH\n1234,50\n1234,50\ninvalid\n1;2;3\n",
    }),
    practice("durations-practice", "Parsing and formatting durations", "Розбір і форматування тривалостей", {
      starter: PROGRAM_WITH(durationTypes(`${TODO}@@${TODO}`), durationMain, "using System.Collections.Generic;\nusing System.Globalization;"),
      solution: PROGRAM_WITH(durationTypes(durationSolution), durationMain, "using System.Collections.Generic;\nusing System.Globalization;"),
      expectedOutput:
        "1d 2h 30m 15s => 1.02:30:15 => 1d 2h 30m 15s\n90m => 01:30:00 => 1h 30m\n45s 1h => 01:00:45 => 1h 45s\n2h0m => 02:00:00 => 2h\n0s\nerror: Unknown unit 'w'\n2024-02-29\n31\n",
    }),
  ],
};
