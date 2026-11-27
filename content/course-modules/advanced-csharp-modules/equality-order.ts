import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const semverTypes = (body: string) => `// A semantic version "major.minor.patch" with an optional pre-release tag: "2.1.0-beta".
// Ordering: by major, minor, patch; a pre-release is LOWER than the same version without a tag;
// two pre-release tags compare ordinally. Equality must agree with ordering.
sealed class SemVer : IEquatable<SemVer>, IComparable<SemVer>
{
    public int Major { get; private set; }
    public int Minor { get; private set; }
    public int Patch { get; private set; }
    public string Tag { get; private set; }   // null when there is no tag

    public SemVer(int major, int minor, int patch, string tag = null)
    {
        Major = major; Minor = minor; Patch = patch; Tag = tag;
    }

    public static SemVer Parse(string text)
    {
        string tag = null;
        int dash = text.IndexOf('-');
        if (dash >= 0) { tag = text.Substring(dash + 1); text = text.Substring(0, dash); }
        var p = text.Split('.');
        return new SemVer(int.Parse(p[0]), int.Parse(p[1]), int.Parse(p[2]), tag);
    }

    public override string ToString() { return Major + "." + Minor + "." + Patch + (Tag == null ? "" : "-" + Tag); }

${body}
}`;

const semverStarter = `    public int CompareTo(SemVer other) { throw new NotImplementedException(); }
    public bool Equals(SemVer other) { throw new NotImplementedException(); }`;

const semverSolution = `    public int CompareTo(SemVer other)
    {
        if (ReferenceEquals(other, null)) return 1;
        int c = Major.CompareTo(other.Major);
        if (c != 0) return c;
        c = Minor.CompareTo(other.Minor);
        if (c != 0) return c;
        c = Patch.CompareTo(other.Patch);
        if (c != 0) return c;
        if (Tag == null) return other.Tag == null ? 0 : 1;
        if (other.Tag == null) return -1;
        return string.CompareOrdinal(Tag, other.Tag);
    }

    public bool Equals(SemVer other) { return CompareTo(other) == 0; }
    public override bool Equals(object obj) { return Equals(obj as SemVer); }
    public override int GetHashCode()
    {
        unchecked { return ((Major * 397 ^ Minor) * 397 ^ Patch) * 397 ^ (Tag == null ? 0 : Tag.GetHashCode()); }
    }

    public static bool operator <(SemVer a, SemVer b) { return a.CompareTo(b) < 0; }
    public static bool operator >(SemVer a, SemVer b) { return a.CompareTo(b) > 0; }`;

const semverMain = `        var list = new List<SemVer>();
        foreach (var s in new[] { "1.10.0", "1.2.0", "2.0.0-beta", "2.0.0", "1.2.0-alpha", "2.0.0-alpha", "0.9.12" })
            list.Add(SemVer.Parse(s));
        list.Sort();
        Console.WriteLine(string.Join(" < ", list));
        Console.WriteLine(SemVer.Parse("1.2.0").Equals(SemVer.Parse("1.2.0")));
        Console.WriteLine(SemVer.Parse("2.0.0-beta").Equals(SemVer.Parse("2.0.0")));
        var set = new HashSet<SemVer> { SemVer.Parse("3.1.4"), SemVer.Parse("3.1.4"), SemVer.Parse("3.1.4-rc") };
        Console.WriteLine(set.Count);

        // A custom IComparer: newest first, ignoring pre-release versions
        list.RemoveAll(v => v.Tag != null);
        list.Sort(Comparer<SemVer>.Create((a, b) => b.CompareTo(a)));
        Console.WriteLine(string.Join(", ", list));`;

const bitsTypes = (body: string) => `static class Bits
{
    // Number of 1 bits, e.g. PopCount(0b1011) == 3.
    public static int PopCount(uint value) { ${body.split("@@")[0]} }

    // True for 1, 2, 4, 8, ...; false for 0.
    public static bool IsPowerOfTwo(uint value) { ${body.split("@@")[1]} }

    // Smallest power of two >= value (value between 1 and 2^31). RoundUpToPowerOf2(5) == 8.
    public static uint RoundUpToPowerOf2(uint value) { ${body.split("@@")[2]} }

    // Index of the highest set bit: Log2(1) == 0, Log2(1000) == 9. value > 0.
    public static int Log2(uint value) { ${body.split("@@")[3]} }
}`;

const bitsSolution = [
  `int count = 0;
        while (value != 0) { value &= value - 1; count++; }
        return count;`,
  "return value != 0 && (value & (value - 1)) == 0;",
  `value--;
        value |= value >> 1; value |= value >> 2; value |= value >> 4; value |= value >> 8; value |= value >> 16;
        return value + 1;`,
  `int log = 0;
        while ((value >>= 1) != 0) log++;
        return log;`,
].join("@@");

const ni = "throw new NotImplementedException();";
const bitsMain = `        foreach (uint v in new uint[] { 0, 1, 11, 64, 1000, 0xFFFFFFFF })
            Console.WriteLine(v + ": pop=" + Bits.PopCount(v) + " pow2=" + Bits.IsPowerOfTwo(v));
        foreach (uint v in new uint[] { 1, 5, 64, 1000 })
            Console.WriteLine(v + " -> " + Bits.RoundUpToPowerOf2(v) + ", log2=" + Bits.Log2(v));
        var flags = 0u;
        flags |= 1u << 3;
        flags |= 1u << 0;
        Console.WriteLine(Convert.ToString(flags, 2).PadLeft(8, '0') + " " + ((flags & (1u << 3)) != 0));`;

export const equalityOrderModule: ModuleDef = {
  slug: "equality-order",
  title: { en: "Numbers, equality, ordering and utilities", uk: "Числа, рівність, порядок і утиліти" },
  slides: [
    lecture("working-with-numbers", "Math, BigInteger, Random and bit operations", "Math, BigInteger, Random і бітові операції"),
    lecture("equality-comparison", "Equality: value vs reference, Equals and ==", "Рівність: за значенням і за посиланням, Equals і =="),
    lecture("order-comparison", "Order comparison: IComparable and IComparer", "Порівняння порядку: IComparable та IComparer"),
    lecture("enums-guid-utilities", "Guid, enum helpers and utility classes", "Guid, допоміжні методи enum і утилітні класи"),
    quiz("equality-order-quiz", "Numbers, equality and ordering", "Числа, рівність і порядок", [
      question(
        "eq-hash",
        ["You override `Equals` but not `GetHashCode`. What breaks?", "Ви перевизначили `Equals`, але не `GetHashCode`. Що зламається?"],
        [
          ["Nothing", "Нічого"],
          ["Sorting", "Сортування"],
          ["`ToString`", "`ToString`"],
          ["Dictionaries and HashSets: equal objects may land in different buckets, so lookups fail", "Словники та HashSet: рівні об'єкти можуть потрапити в різні кошики, тож пошук не спрацює"],
        ],
        "d",
      ),
      question(
        "obj-eq",
        ["`object a = 5, b = 5;` What do `a == b` and `a.Equals(b)` return?", "`object a = 5, b = 5;` Що повертають `a == b` і `a.Equals(b)`?"],
        [
          ["True and True", "True і True"],
          ["False and True: `==` on `object` compares references (two boxes), `Equals` is virtual and compares the ints", "False і True: `==` на `object` порівнює посилання (дві різні «коробки»), а `Equals` віртуальний і порівнює int"],
          ["True and False", "True і False"],
          ["False and False", "False і False"],
        ],
        "b",
      ),
      question(
        "nan",
        ["`double x = double.NaN;` What are `x == x` and `x.Equals(x)`?", "`double x = double.NaN;` Чому дорівнюють `x == x` і `x.Equals(x)`?"],
        [
          ["False and True: `==` follows IEEE rules, `Equals` is reflexive so collections can find NaN", "False і True: `==` дотримується правил IEEE, а `Equals` рефлексивний, щоб колекції могли знайти NaN"],
          ["True and True", "True і True"],
          ["False and False", "False і False"],
          ["Both throw", "Обидва кидають виняток"],
        ],
        "a",
      ),
      question(
        "compareto",
        ["What must `a.CompareTo(b)` return when `a` should sort before `b`?", "Що має повернути `a.CompareTo(b)`, коли `a` має йти перед `b`?"],
        [
          ["-1 exactly", "Рівно -1"],
          ["false", "false"],
          ["Any negative number", "Будь-яке від'ємне число"],
          ["0", "0"],
        ],
        "c",
      ),
      question(
        "comparer",
        ["Why would you write an `IComparer<T>` instead of implementing `IComparable<T>`?", "Навіщо писати `IComparer<T>` замість реалізації `IComparable<T>`?"],
        [
          ["To sort a type you don't own, or by a different criterion than its natural order", "Щоб сортувати тип, який вам не належить, або за іншим критерієм, ніж його природний порядок"],
          ["Because `IComparable<T>` is obsolete", "Бо `IComparable<T>` застарів"],
          ["`IComparer<T>` is faster", "`IComparer<T>` швидший"],
          ["Lists can't use `IComparable<T>`", "Списки не можуть використовувати `IComparable<T>`"],
        ],
        "a",
      ),
      question(
        "random",
        ["Which random source should generate password-reset tokens?", "Яке джерело випадковості використати для токенів скидання пароля?"],
        [
          ["`new Random()`", "`new Random()`"],
          ["`Random.Shared`", "`Random.Shared`"],
          ["`Guid.NewGuid().GetHashCode()`", "`Guid.NewGuid().GetHashCode()`"],
          ["`RandomNumberGenerator` (cryptographically secure)", "`RandomNumberGenerator` (криптографічно стійкий)"],
        ],
        "d",
      ),
      question(
        "biginteger",
        ["What is `BigInteger` for?", "Для чого `BigInteger`?"],
        [
          ["Integers of arbitrary size with no overflow, at the cost of speed and allocations", "Цілі числа довільного розміру без переповнення ціною швидкості й алокацій"],
          ["64-bit integers", "64-бітні цілі"],
          ["Fast integer math in loops", "Швидка цілочисельна математика в циклах"],
          ["Decimal fractions", "Десяткові дроби"],
        ],
        "a",
      ),
      question(
        "structural",
        ["Which types compare by value with `Equals` out of the box?", "Які типи «з коробки» порівнюються через `Equals` за значенням?"],
        [
          ["`string`", "`string`"],
          ["Any `struct` (field by field, via reflection if not overridden)", "Будь-яка `struct` (поле за полем, через рефлексію, якщо не перевизначено)"],
          ["`record` classes", "`record`-класи"],
          ["Arrays: `new[] {1} .Equals(new[] {1})`", "Масиви: `new[] {1} .Equals(new[] {1})`"],
        ],
        ["a", "b", "c"],
      ),
    ]),
    practice("semver-practice", "Equality and ordering for versions", "Рівність і порядок для версій", {
      starter: PROGRAM_WITH(semverTypes(semverStarter), semverMain, "using System.Collections.Generic;"),
      solution: PROGRAM_WITH(semverTypes(semverSolution), semverMain, "using System.Collections.Generic;"),
      expectedOutput:
        "0.9.12 < 1.2.0-alpha < 1.2.0 < 1.10.0 < 2.0.0-alpha < 2.0.0-beta < 2.0.0\nTrue\nFalse\n2\n2.0.0, 1.10.0, 1.2.0, 0.9.12\n",
    }),
    practice("bits-practice", "Bit tricks", "Бітові трюки", {
      starter: PROGRAM_WITH(bitsTypes([ni, ni, ni, ni].join("@@")), bitsMain),
      solution: PROGRAM_WITH(bitsTypes(bitsSolution), bitsMain),
      expectedOutput:
        "0: pop=0 pow2=False\n1: pop=1 pow2=True\n11: pop=3 pow2=False\n64: pop=1 pow2=True\n1000: pop=6 pow2=False\n4294967295: pop=32 pow2=False\n1 -> 1, log2=0\n5 -> 8, log2=2\n64 -> 64, log2=6\n1000 -> 1024, log2=9\n00001001 True\n",
    }),
  ],
};
