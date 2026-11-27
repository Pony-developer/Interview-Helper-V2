import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

// ---------- Hand-written "record" ----------

const recordTypes = (body: string) => `// What 'public record Money(decimal Amount, string Currency);' generates, written by hand (C# 7.3).
sealed class Money : IEquatable<Money>
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

${body}
}`;

const recordMain = `        var a = new Money(10m, "EUR");
        var b = new Money(10m, "EUR");
        var c = a.WithAmount(25m);
        Console.WriteLine(a);
        Console.WriteLine(c);
        Console.WriteLine("a == b: " + (a == b) + ", same object: " + ReferenceEquals(a, b));
        Console.WriteLine("a.Equals(c): " + a.Equals(c) + ", a != c: " + (a != c));
        Console.WriteLine("hash equal: " + (a.GetHashCode() == b.GetHashCode()));
        Money none = null;
        Console.WriteLine("null == null: " + (none == null) + ", a == null: " + (a == null));
        var set = new System.Collections.Generic.HashSet<Money> { a, b, c };
        Console.WriteLine("distinct: " + set.Count);
        decimal amount; string currency;
        c.Deconstruct(out amount, out currency);
        Console.WriteLine(currency + " " + amount);`;

const recordSolution = `    public Money WithAmount(decimal amount) { return new Money(amount, Currency); }

    public void Deconstruct(out decimal amount, out string currency)
    {
        amount = Amount;
        currency = Currency;
    }

    public bool Equals(Money other)
    {
        if (ReferenceEquals(other, null)) return false;
        if (ReferenceEquals(this, other)) return true;
        return Amount == other.Amount && Currency == other.Currency;
    }

    public override bool Equals(object obj) { return Equals(obj as Money); }

    public override int GetHashCode()
    {
        unchecked { return Amount.GetHashCode() * 397 ^ (Currency == null ? 0 : Currency.GetHashCode()); }
    }

    public static bool operator ==(Money left, Money right)
    {
        if (ReferenceEquals(left, null)) return ReferenceEquals(right, null);
        return left.Equals(right);
    }

    public static bool operator !=(Money left, Money right) { return !(left == right); }

    public override string ToString() { return "Money { Amount = " + Amount + ", Currency = " + Currency + " }"; }`;

const recordStarter = `    // Write WithAmount, Deconstruct, Equals (both), GetHashCode, == and != and ToString here
    public Money WithAmount(decimal amount) { throw new NotImplementedException(); }
    public void Deconstruct(out decimal amount, out string currency) { throw new NotImplementedException(); }
    public bool Equals(Money other) { throw new NotImplementedException(); }`;

// ---------- Pattern-based pricing ----------

const patternTypes = (body: string) => `abstract class Item { public decimal BasePrice; }
class Book : Item { public bool IsEbook; }
class Food : Item { public int DaysToExpiry; }
class Gadget : Item { public string Brand; }
class GiftCard : Item { }

static class Pricing
{
    // Books: ebooks 10% off, paper books full price.
    // Food: expiring today or already expired (DaysToExpiry <= 0) is free, 1-2 days left is half price, otherwise full.
    // Gadgets: brand "Acme" costs 15 more; others full price.
    // Gift cards and anything else: full price. null: throw ArgumentNullException.
    public static decimal Price(Item item)
    {
${body}
    }
}`;

const patternMain = `        var items = new Item[]
        {
            new Book { BasePrice = 20m, IsEbook = true },
            new Book { BasePrice = 20m },
            new Food { BasePrice = 8m, DaysToExpiry = 0 },
            new Food { BasePrice = 8m, DaysToExpiry = 2 },
            new Food { BasePrice = 8m, DaysToExpiry = 10 },
            new Gadget { BasePrice = 100m, Brand = "Acme" },
            new Gadget { BasePrice = 100m, Brand = "Other" },
            new GiftCard { BasePrice = 50m },
        };
        foreach (var item in items)
            Console.WriteLine(item.GetType().Name + ": " + Pricing.Price(item).ToString("0.00"));
        try { Pricing.Price(null); }
        catch (ArgumentNullException) { Console.WriteLine("null rejected"); }`;

const patternSolution = `        switch (item)
        {
            case null:
                throw new ArgumentNullException("item");
            case Book b:
                return b.IsEbook ? b.BasePrice * 0.9m : b.BasePrice;
            case Food f:
                if (f.DaysToExpiry <= 0) return 0m;
                if (f.DaysToExpiry <= 2) return f.BasePrice / 2;
                return f.BasePrice;
            case Gadget g:
                return g.Brand == "Acme" ? g.BasePrice + 15m : g.BasePrice;
            default:
                return item.BasePrice;
        }`;

export const recordsPatternsModule: ModuleDef = {
  slug: "records-patterns",
  title: { en: "Records and pattern matching", uk: "Record і зіставлення зі зразком" },
  slides: [
    lecture("records-deep", "Records: immutable data with value equality", "Record: незмінні дані з рівністю за значенням"),
    lecture("records-under-the-hood", "What the compiler generates for a record", "Що компілятор генерує для record"),
    lecture("patterns-deep", "Patterns: type, constant, relational and logical", "Патерни: типу, константи, реляційні та логічні"),
    lecture("property-positional-patterns", "Property, positional patterns and switch expressions", "Патерни властивостей, позиційні патерни та switch-вирази"),
    quiz("records-patterns-quiz", "Records and pattern matching", "Record і зіставлення зі зразком", [
      question(
        "record-eq",
        ["`record Point(int X, int Y);` What does `new Point(1, 2) == new Point(1, 2)` return?", "`record Point(int X, int Y);` Що поверне `new Point(1, 2) == new Point(1, 2)`?"],
        [
          ["False, they are different objects", "False, це різні об'єкти"],
          ["True: records compare by value", "True: record порівнюються за значенням"],
          ["It doesn't compile", "Не скомпілюється"],
          ["It throws", "Кидає виняток"],
        ],
        "b",
      ),
      question(
        "with",
        ["What does `var p2 = p1 with { Y = 5 };` do?", "Що робить `var p2 = p1 with { Y = 5 };`?"],
        [
          ["Changes `p1.Y` to 5", "Змінює `p1.Y` на 5"],
          ["Creates a reference to `p1`", "Створює посилання на `p1`"],
          ["Creates a copy of `p1` (via the generated clone method) with `Y` set to 5", "Створює копію `p1` (через згенерований метод клонування) з `Y`, рівним 5"],
          ["Compares `p1.Y` to 5", "Порівнює `p1.Y` з 5"],
        ],
        "c",
      ),
      question(
        "record-struct",
        ["How does `record struct` (C# 10) differ from `record` / `record class`?", "Чим `record struct` (C# 10) відрізняється від `record` / `record class`?"],
        [
          ["It's a value type; positional properties are mutable unless declared `readonly record struct`", "Це тип значення; позиційні властивості змінні, якщо не оголошено `readonly record struct`"],
          ["It's a reference type", "Це тип посилання"],
          ["It has no value equality", "Він не має рівності за значенням"],
          ["It can't have methods", "Він не може мати методів"],
        ],
        "a",
      ),
      question(
        "record-inherit",
        ["`record Person(string Name); record Student(string Name, int Year) : Person(Name);` Is `new Person(\"Ann\")` equal to `new Student(\"Ann\", 1)`?", "`record Person(string Name); record Student(string Name, int Year) : Person(Name);` Чи рівні `new Person(\"Ann\")` і `new Student(\"Ann\", 1)`?"],
        [
          ["Yes, the names match", "Так, імена збігаються"],
          ["Only if `Year` is 0", "Лише якщо `Year` дорівнює 0"],
          ["It doesn't compile", "Не скомпілюється"],
          ["No: record equality also requires the same runtime type (checked through `EqualityContract`)", "Ні: рівність record вимагає ще й однакового типу під час виконання (перевіряється через `EqualityContract`)"],
        ],
        "d",
      ),
      question(
        "relational",
        ["Which pattern matches an `int` from 1 to 9 inclusive (C# 9)?", "Який патерн підходить для `int` від 1 до 9 включно (C# 9)?"],
        [
          ["`is 1..9`", "`is 1..9`"],
          ["`is >= 1 and <= 9`", "`is >= 1 and <= 9`"],
          ["`is between 1, 9`", "`is between 1, 9`"],
          ["`is (1 or 9)`", "`is (1 or 9)`"],
        ],
        "b",
      ),
      question(
        "not-null",
        ["Why is `if (x is not null)` preferred over `if (x != null)` in some code?", "Чому в деякому коді `if (x is not null)` кращий за `if (x != null)`?"],
        [
          ["It is always faster", "Він завжди швидший"],
          ["It checks the type too", "Він ще й перевіряє тип"],
          ["It can't be affected by a user-defined `!=` operator overload", "На нього не може вплинути перевантажений користувачем оператор `!=`"],
          ["It works only with strings", "Він працює лише з рядками"],
        ],
        "c",
      ),
      question(
        "property-pattern",
        ["What does `order is { Status: OrderStatus.Paid, Total: > 100 }` check?", "Що перевіряє `order is { Status: OrderStatus.Paid, Total: > 100 }`?"],
        [
          ["`order` isn't null, its Status is Paid and its Total is greater than 100", "`order` не null, його Status — Paid, а Total більший за 100"],
          ["That the order has exactly two properties", "Що замовлення має рівно дві властивості"],
          ["It assigns Status and Total", "Присвоює Status і Total"],
          ["Only that Total > 100", "Лише те, що Total > 100"],
        ],
        "a",
      ),
      question(
        "order-arms",
        ["In a `switch` expression, why does the compiler reject `_ => 0` placed before `> 10 => 1`?", "Чому у `switch`-виразі компілятор відхиляє `_ => 0`, поставлене перед `> 10 => 1`?"],
        [
          ["`_` isn't allowed in switch expressions", "`_` не дозволено у switch-виразах"],
          ["Arms must be sorted by value", "Гілки мають бути відсортовані за значенням"],
          ["Arms are evaluated in parallel", "Гілки обчислюються паралельно"],
          ["Arms are tried in order and the discard matches everything, so the later arm is unreachable (error CS8510)", "Гілки перевіряються по черзі, а відкидання підходить для всього, тож наступна гілка недосяжна (помилка CS8510)"],
        ],
        "d",
      ),
    ]),
    practice("record-by-hand-practice", "A record by hand", "Record власноруч", {
      starter: PROGRAM_WITH(recordTypes(recordStarter), recordMain),
      solution: PROGRAM_WITH(recordTypes(recordSolution), recordMain),
      expectedOutput:
        "Money { Amount = 10, Currency = EUR }\nMoney { Amount = 25, Currency = EUR }\na == b: True, same object: False\na.Equals(c): False, a != c: True\nhash equal: True\nnull == null: True, a == null: False\ndistinct: 2\nEUR 25\n",
    }),
    practice("patterns-practice", "Pricing with type patterns", "Ціни з патернами типів", {
      starter: PROGRAM_WITH(patternTypes("        // Write your code here\n        throw new NotImplementedException();"), patternMain),
      solution: PROGRAM_WITH(patternTypes(patternSolution), patternMain),
      expectedOutput:
        "Book: 18.00\nBook: 20.00\nFood: 0.00\nFood: 4.00\nFood: 8.00\nGadget: 115.00\nGadget: 100.00\nGiftCard: 50.00\nnull rejected\n",
    }),
  ],
};
