import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const salesData = `class Customer { public int Id; public string Name; public string City; }
class Order { public int Id; public int CustomerId; public DateTime Date; public List<Line> Lines; }
class Line { public string Product; public int Qty; public decimal Price; }

static class Data
{
    public static List<Customer> Customers = new List<Customer>
    {
        new Customer { Id = 1, Name = "Ann", City = "Kyiv" },
        new Customer { Id = 2, Name = "Bob", City = "Lviv" },
        new Customer { Id = 3, Name = "Cid", City = "Kyiv" },
        new Customer { Id = 4, Name = "Dee", City = "Odesa" },
    };

    public static List<Order> Orders = new List<Order>
    {
        new Order { Id = 10, CustomerId = 1, Date = new DateTime(2024, 1, 5), Lines = new List<Line> {
            new Line { Product = "Pen", Qty = 10, Price = 1.5m }, new Line { Product = "Ink", Qty = 2, Price = 7m } } },
        new Order { Id = 11, CustomerId = 2, Date = new DateTime(2024, 1, 9), Lines = new List<Line> {
            new Line { Product = "Pad", Qty = 3, Price = 4m } } },
        new Order { Id = 12, CustomerId = 1, Date = new DateTime(2024, 2, 1), Lines = new List<Line> {
            new Line { Product = "Pen", Qty = 5, Price = 1.5m }, new Line { Product = "Pad", Qty = 1, Price = 4m } } },
        new Order { Id = 13, CustomerId = 3, Date = new DateTime(2024, 2, 14), Lines = new List<Line> {
            new Line { Product = "Ink", Qty = 6, Price = 7m } } },
    };
}`;

const reportTypes = (body: string) => `${salesData}

static class Report
{
    // 1. Total revenue (sum of Qty * Price over all lines of all orders).
    public static decimal TotalRevenue() { ${body.split("@@")[0]} }

    // 2. Revenue per city, highest first, as "City: amount". Cities without orders are left out.
    public static IEnumerable<string> RevenueByCity() { ${body.split("@@")[1]} }

    // 3. Quantity sold per product, ordered by product name, as "Product x Qty".
    public static IEnumerable<string> UnitsPerProduct() { ${body.split("@@")[2]} }

    // 4. Every customer with their number of orders (0 included), ordered by name, as "Name: N".
    public static IEnumerable<string> OrdersPerCustomer() { ${body.split("@@")[3]} }

    // 5. Months (yyyy-MM) in which some customer from Kyiv placed an order, distinct, ascending.
    public static IEnumerable<string> KyivMonths() { ${body.split("@@")[4]} }
}`;

const reportSolution = [
  "return Data.Orders.SelectMany(o => o.Lines).Sum(l => l.Qty * l.Price);",
  `return Data.Orders
            .Join(Data.Customers, o => o.CustomerId, c => c.Id, (o, c) => new { c.City, Total = o.Lines.Sum(l => l.Qty * l.Price) })
            .GroupBy(x => x.City)
            .Select(g => new { City = g.Key, Total = g.Sum(x => x.Total) })
            .OrderByDescending(x => x.Total)
            .Select(x => x.City + ": " + x.Total);`,
  `return Data.Orders
            .SelectMany(o => o.Lines)
            .GroupBy(l => l.Product)
            .OrderBy(g => g.Key)
            .Select(g => g.Key + " x " + g.Sum(l => l.Qty));`,
  `return Data.Customers
            .GroupJoin(Data.Orders, c => c.Id, o => o.CustomerId, (c, orders) => new { c.Name, Count = orders.Count() })
            .OrderBy(x => x.Name)
            .Select(x => x.Name + ": " + x.Count);`,
  `var kyiv = new HashSet<int>(Data.Customers.Where(c => c.City == "Kyiv").Select(c => c.Id));
        return Data.Orders
            .Where(o => kyiv.Contains(o.CustomerId))
            .Select(o => o.Date.ToString("yyyy-MM"))
            .Distinct()
            .OrderBy(m => m);`,
].join("@@");

const ni = "throw new NotImplementedException();";
const reportMain = `        Console.WriteLine("Total: " + Report.TotalRevenue());
        foreach (var s in Report.RevenueByCity()) Console.WriteLine(s);
        Console.WriteLine(string.Join(", ", Report.UnitsPerProduct()));
        Console.WriteLine(string.Join(", ", Report.OrdersPerCustomer()));
        Console.WriteLine(string.Join(", ", Report.KyivMonths()));`;

const aggTypes = (body: string) => `static class Stats
{
    // Running totals: [3, 1, 4] -> [3, 4, 8]. Use Aggregate or a Select with state; no explicit loops.
    public static IEnumerable<int> RunningTotals(IEnumerable<int> source) { ${body.split("@@")[0]} }

    // Pairs each item with the next one: [a, b, c] -> "a-b", "b-c". Hint: Zip with Skip(1).
    public static IEnumerable<string> Pairs(IList<string> items) { ${body.split("@@")[1]} }

    // Words longer than 3 letters, de-duplicated ignoring case, keeping the first spelling, in order.
    public static IEnumerable<string> LongWords(string text) { ${body.split("@@")[2]} }

    // The most frequent character (letters only, ignoring case); ties go to the alphabetically first.
    public static char MostFrequentLetter(string text) { ${body.split("@@")[3]} }
}`;

const aggSolution = [
  `return source.Aggregate(new List<int>(), (acc, x) => { acc.Add((acc.Count == 0 ? 0 : acc[acc.Count - 1]) + x); return acc; });`,
  `return items.Zip(items.Skip(1), (a, b) => a + "-" + b);`,
  `return text.Split(new[] { ' ', ',', '.', '!' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 3)
            .Distinct(StringComparer.OrdinalIgnoreCase);`,
  `return text.Where(char.IsLetter)
            .Select(char.ToLowerInvariant)
            .GroupBy(c => c)
            .OrderByDescending(g => g.Count())
            .ThenBy(g => g.Key)
            .First().Key;`,
].join("@@");

const aggMain = `        Console.WriteLine(string.Join(" ", Stats.RunningTotals(new[] { 3, 1, 4, 1, 5 })));
        Console.WriteLine(string.Join(" ", Stats.Pairs(new[] { "Kyiv", "Lviv", "Odesa", "Dnipro" })));
        Console.WriteLine(string.Join(" ", Stats.LongWords("This code, this CODE and that code. Always TEST tests!")));
        Console.WriteLine(Stats.MostFrequentLetter("Hello, World"));
        Console.WriteLine(Stats.MostFrequentLetter("abba cddc"));
        Console.WriteLine(Enumerable.Range(1, 5).Select(i => i * i).Where(i => i % 2 == 1).Sum());`;

export const linqOperatorsModule: ModuleDef = {
  slug: "linq-operators",
  title: { en: "LINQ operators", uk: "Оператори LINQ" },
  slides: [
    lecture("filtering-projecting", "Filtering and projecting: Where, Select, SelectMany", "Фільтрація та проєкція: Where, Select, SelectMany"),
    lecture("joining-grouping", "Joining and grouping", "З'єднання та групування"),
    lecture("ordering-set-operators", "Ordering and set operators", "Впорядкування та оператори множин"),
    lecture("element-aggregation", "Element, aggregation, quantifier and conversion operators", "Оператори елементів, агрегації, квантифікатори та перетворення"),
    quiz("linq-operators-quiz", "LINQ operators", "Оператори LINQ", [
      question(
        "selectmany",
        ["What does `SelectMany` do?", "Що робить `SelectMany`?"],
        [
          ["Selects several properties at once", "Вибирає кілька властивостей одночасно"],
          ["Projects each element to a sequence and flattens all those sequences into one", "Проєктує кожен елемент у послідовність і сплющує всі ці послідовності в одну"],
          ["Runs Select in parallel", "Виконує Select паралельно"],
          ["Selects distinct elements", "Вибирає унікальні елементи"],
        ],
        "b",
      ),
      question(
        "first-single",
        ["What is the difference between `First()` and `Single()`?", "Чим відрізняються `First()` і `Single()`?"],
        [
          ["None", "Нічим"],
          ["`Single` is faster", "`Single` швидший"],
          ["`First` returns the first match; `Single` also throws if there is more than one, so it asserts uniqueness", "`First` повертає перший збіг; `Single` ще й кидає виняток, якщо збігів більше одного, тож перевіряє унікальність"],
          ["`Single` returns null when empty", "`Single` повертає null, коли порожньо"],
        ],
        "c",
      ),
      question(
        "groupjoin",
        ["You need every customer, including those with no orders, together with their orders. Which operator fits best?", "Потрібні всі клієнти, зокрема ті, що без замовлень, разом з їхніми замовленнями. Який оператор підходить найкраще?"],
        [
          ["`GroupJoin` (a left outer join that produces a sequence of orders per customer)", "`GroupJoin` (лівий зовнішній join, що дає послідовність замовлень для кожного клієнта)"],
          ["`Join`", "`Join`"],
          ["`Zip`", "`Zip`"],
          ["`Concat`", "`Concat`"],
        ],
        "a",
      ),
      question(
        "groupby",
        ["What does `GroupBy` return?", "Що повертає `GroupBy`?"],
        [
          ["A Dictionary", "Dictionary"],
          ["A sorted list", "Відсортований список"],
          ["Only the keys", "Лише ключі"],
          ["A sequence of `IGrouping<TKey, TElement>`: each group is itself a sequence with a `Key`", "Послідовність `IGrouping<TKey, TElement>`: кожна група — сама послідовність із `Key`"],
        ],
        "d",
      ),
      question(
        "thenby",
        ["Why use `ThenBy` instead of a second `OrderBy`?", "Навіщо `ThenBy` замість другого `OrderBy`?"],
        [
          ["`ThenBy` is faster", "`ThenBy` швидший"],
          ["A second `OrderBy` would re-sort everything by the new key and discard the first order; `ThenBy` only breaks ties", "Другий `OrderBy` пересортував би все за новим ключем, відкинувши перший порядок; `ThenBy` лише розв'язує нічиї"],
          ["`OrderBy` can be used only once per query", "`OrderBy` можна використати лише раз на запит"],
          ["There is no difference", "Різниці немає"],
        ],
        "b",
      ),
      question(
        "any-count",
        ["To check whether a sequence has any elements, why prefer `Any()` over `Count() > 0`?", "Щоб перевірити, чи є в послідовності елементи, чому краще `Any()`, ніж `Count() > 0`?"],
        [
          ["`Count()` may enumerate the whole sequence (or run a full COUNT in SQL); `Any()` stops at the first element", "`Count()` може перелічити всю послідовність (чи виконати повний COUNT у SQL); `Any()` зупиняється на першому елементі"],
          ["`Count()` throws on empty sequences", "`Count()` кидає виняток на порожніх послідовностях"],
          ["`Any()` caches the result", "`Any()` кешує результат"],
          ["There is no difference", "Різниці немає"],
        ],
        "a",
      ),
      question(
        "distinctby",
        ["Which operators were added in .NET 6?", "Які оператори додали в .NET 6?"],
        [
          ["`DistinctBy`, `UnionBy`, `ExceptBy`, `IntersectBy`", "`DistinctBy`, `UnionBy`, `ExceptBy`, `IntersectBy`"],
          ["`MinBy` and `MaxBy`", "`MinBy` і `MaxBy`"],
          ["`Chunk`", "`Chunk`"],
          ["`Where` and `Select`", "`Where` і `Select`"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "oftype",
        ["How does `OfType<T>()` differ from `Cast<T>()`?", "Чим `OfType<T>()` відрізняється від `Cast<T>()`?"],
        [
          ["They are identical", "Вони ідентичні"],
          ["`Cast` filters, `OfType` throws", "`Cast` фільтрує, `OfType` кидає виняток"],
          ["`OfType` silently skips elements that aren't T; `Cast` throws InvalidCastException on them", "`OfType` мовчки пропускає елементи, що не є T; `Cast` на них кидає InvalidCastException"],
          ["`OfType` works only for value types", "`OfType` працює лише для типів значень"],
        ],
        "c",
      ),
    ]),
    practice("sales-report-practice", "A sales report with joins and groups", "Звіт продажів зі з'єднаннями та групами", {
      starter: PROGRAM_WITH(reportTypes([ni, ni, ni, ni, ni].join("@@")), reportMain, "using System.Collections.Generic;\nusing System.Linq;"),
      solution: PROGRAM_WITH(reportTypes(reportSolution), reportMain, "using System.Collections.Generic;\nusing System.Linq;"),
      expectedOutput:
        "Total: 94.5\nKyiv: 82.5\nLviv: 12\nInk x 8, Pad x 4, Pen x 15\nAnn: 2, Bob: 1, Cid: 1, Dee: 0\n2024-01, 2024-02\n",
    }),
    practice("linq-aggregate-practice", "Aggregate, Zip and grouping tricks", "Трюки з Aggregate, Zip і групуванням", {
      starter: PROGRAM_WITH(aggTypes([ni, ni, ni, ni].join("@@")), aggMain, "using System.Collections.Generic;\nusing System.Linq;"),
      solution: PROGRAM_WITH(aggTypes(aggSolution), aggMain, "using System.Collections.Generic;\nusing System.Linq;"),
      expectedOutput: "3 4 8 9 14\nKyiv-Lviv Lviv-Odesa Odesa-Dnipro\nThis code that Always TEST tests\nl\na\n35\n",
    }),
  ],
};
