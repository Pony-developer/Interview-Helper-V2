import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

// ---------- Flags enum practice ----------

const flagsTypes = (body: string) => `[Flags]
enum Permission
{
    None = 0,
    Read = 1,
    Write = 2,
    Delete = 4,
    Share = 8,
    Editor = Read | Write,
    Owner = Read | Write | Delete | Share
}

static class Permissions
{
    // Grants extra permissions.
    public static Permission Grant(Permission current, Permission extra) { ${body.split("@@")[0]} }

    // Removes permissions (the others stay).
    public static Permission Revoke(Permission current, Permission removed) { ${body.split("@@")[1]} }

    // True only if ALL the required flags are present.
    public static bool HasAll(Permission current, Permission required) { ${body.split("@@")[2]} }

    // Lists the single-bit flags that are set, e.g. "Read, Delete"; "None" when nothing is set.
    public static string Describe(Permission current) { ${body.split("@@")[3]} }
}`;

const flagsSolutionBody = [
  "return current | extra;",
  "return current & ~removed;",
  "return (current & required) == required;",
  `var names = new System.Collections.Generic.List<string>();
        foreach (Permission p in new[] { Permission.Read, Permission.Write, Permission.Delete, Permission.Share })
            if ((current & p) != 0) names.Add(p.ToString());
        return names.Count == 0 ? "None" : string.Join(", ", names);`,
].join("@@");

const notImpl = "throw new NotImplementedException();";
const flagsMain = `        var p = Permission.Read;
        p = Permissions.Grant(p, Permission.Write | Permission.Share);
        Console.WriteLine(Permissions.Describe(p));
        Console.WriteLine(Permissions.HasAll(p, Permission.Editor));
        Console.WriteLine(Permissions.HasAll(p, Permission.Owner));
        p = Permissions.Revoke(p, Permission.Write);
        Console.WriteLine(Permissions.Describe(p));
        Console.WriteLine(Permissions.Describe(Permissions.Revoke(p, Permission.Owner)));
        Console.WriteLine(Permissions.Describe(Permission.Owner));
        Console.WriteLine(Permission.Editor);`;

// ---------- Generic constraint practice ----------

const genericTypes = (maxBody: string, cacheBody: string) => `interface IEntity
{
    int Id { get; }
}

class Product : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}

class Customer : IEntity
{
    public int Id { get; set; }
    public string Email { get; set; }
}

static class Generic
{
    // Returns the largest item, or default(T) for an empty list. Must work for int, string, DateTime...
    public static T Max<T>(IList<T> items) where T : IComparable<T>
    {
${maxBody}
    }
}

// Keeps one entity per Id. GetOrCreate returns the stored entity or creates one with new T()
// (the factory method 'init' then fills it in) and stores it.
class Registry<T> where T : class, IEntity, new()
{
    private readonly Dictionary<int, T> _items = new Dictionary<int, T>();
    public int Count { get { return _items.Count; } }

    public T GetOrCreate(int id, Func<T, int, T> init)
    {
${cacheBody}
    }
}`;

const genericMain = `        Console.WriteLine(Generic.Max(new List<int> { 3, 17, 5 }));
        Console.WriteLine(Generic.Max(new[] { "pear", "apple", "plum" }));
        Console.WriteLine(Generic.Max(new List<int>()));
        Console.WriteLine(Generic.Max(new[] { new DateTime(2021, 11, 8), new DateTime(2022, 2, 1) }).Year);

        var products = new Registry<Product>();
        var a = products.GetOrCreate(1, (p, id) => { p.Id = id; p.Name = "Pen"; p.Price = 1.5m; return p; });
        var b = products.GetOrCreate(1, (p, id) => { p.Id = id; p.Name = "Other"; return p; });
        Console.WriteLine(a.Name + " " + b.Name + " same=" + ReferenceEquals(a, b) + " count=" + products.Count);

        var customers = new Registry<Customer>();
        customers.GetOrCreate(7, (c, id) => { c.Id = id; c.Email = "x@shop.test"; return c; });
        customers.GetOrCreate(8, (c, id) => { c.Id = id; c.Email = "y@shop.test"; return c; });
        Console.WriteLine("customers=" + customers.Count);`;

export const interfacesGenericsModule: ModuleDef = {
  slug: "interfaces-generics",
  title: { en: "Interfaces, enums and generics", uk: "Інтерфейси, enum та узагальнення" },
  slides: [
    lecture("interfaces-deep", "Interfaces: explicit and default implementations", "Інтерфейси: явна реалізація та реалізація за замовчуванням"),
    lecture("enums-deep", "Enums and flags", "Enum і прапорці"),
    lecture("nested-types", "Nested types", "Вкладені типи"),
    lecture("generics-deep", "Generics: type parameters and constraints", "Узагальнення: параметри типу та обмеження"),
    lecture("generic-variance", "Covariance and contravariance", "Коваріантність і контраваріантність"),
    quiz("interfaces-generics-quiz", "Interfaces, enums and generics", "Інтерфейси, enum та узагальнення", [
      question(
        "explicit",
        ["A class implements `ISaver.Save()` explicitly. How can you call it?", "Клас реалізує `ISaver.Save()` явно. Як його викликати?"],
        [
          ["`obj.Save()`", "`obj.Save()`"],
          ["Only through a variable of type `ISaver`, e.g. `((ISaver)obj).Save()`", "Лише через змінну типу `ISaver`, наприклад `((ISaver)obj).Save()`"],
          ["It can't be called", "Його не можна викликати"],
          ["Only from inside the class", "Лише зсередини класу"],
        ],
        "b",
      ),
      question(
        "default-member",
        ["What problem do default interface members (C# 8) solve?", "Яку проблему розв'язують члени інтерфейсу за замовчуванням (C# 8)?"],
        [
          ["Adding a member to a published interface without breaking every class that already implements it", "Додати член до вже опублікованого інтерфейсу, не зламавши всі класи, що його реалізують"],
          ["Multiple inheritance of state", "Множинне успадкування стану"],
          ["Making interfaces faster", "Пришвидшити інтерфейси"],
          ["Allowing fields in interfaces", "Дозволити поля в інтерфейсах"],
        ],
        "a",
      ),
      question(
        "flags",
        ["`[Flags] enum P { Read = 1, Write = 2, Delete = 4 }`. How do you check that `p` contains Write?", "`[Flags] enum P { Read = 1, Write = 2, Delete = 4 }`. Як перевірити, що `p` містить Write?"],
        [
          ["`p == P.Write`", "`p == P.Write`"],
          ["`p > P.Write`", "`p > P.Write`"],
          ["`(p & P.Write) != 0` or `p.HasFlag(P.Write)`", "`(p & P.Write) != 0` або `p.HasFlag(P.Write)`"],
          ["`p.Contains(P.Write)`", "`p.Contains(P.Write)`"],
        ],
        "c",
      ),
      question(
        "enum-cast",
        ["`var c = (Color)42;` where `Color` defines only 0, 1 and 2. What happens?", "`var c = (Color)42;`, де `Color` визначає лише 0, 1 і 2. Що станеться?"],
        [
          ["`InvalidCastException`", "`InvalidCastException`"],
          ["A compile error", "Помилка компіляції"],
          ["`c` becomes 0", "`c` стане 0"],
          ["It works: `c` holds 42, so validate with `Enum.IsDefined` when the value comes from outside", "Працює: `c` містить 42, тож перевіряйте через `Enum.IsDefined`, коли значення приходить ззовні"],
        ],
        "d",
      ),
      question(
        "constraints",
        ["Which constraint lets you write `new T()` inside a generic method?", "Яке обмеження дозволяє писати `new T()` в узагальненому методі?"],
        [
          ["`where T : class`", "`where T : class`"],
          ["`where T : new()`", "`where T : new()`"],
          ["`where T : struct`", "`where T : struct`"],
          ["`where T : IDisposable`", "`where T : IDisposable`"],
        ],
        "b",
      ),
      question(
        "static-fields",
        ["`class Counter<T> { public static int Count; }`. How many `Count` fields exist after using `Counter<int>` and `Counter<string>`?", "`class Counter<T> { public static int Count; }`. Скільки полів `Count` існує після використання `Counter<int>` і `Counter<string>`?"],
        [
          ["Two: each closed generic type has its own static fields", "Два: кожен закритий узагальнений тип має власні статичні поля"],
          ["One, shared by all", "Одне, спільне для всіх"],
          ["None until an instance is created", "Жодного, доки не створено екземпляр"],
          ["It does not compile", "Не скомпілюється"],
        ],
        "a",
      ),
      question(
        "covariance",
        ["Why does `IEnumerable<object> x = new List<string>();` compile while `List<object> y = new List<string>();` doesn't?", "Чому `IEnumerable<object> x = new List<string>();` компілюється, а `List<object> y = new List<string>();` — ні?"],
        [
          ["`List<T>` is a class, and classes can't be generic", "`List<T>` — клас, а класи не можуть бути узагальненими"],
          ["It is a compiler bug", "Це помилка компілятора"],
          ["`IEnumerable<out T>` is covariant because it only returns T; `List<T>` also accepts T (Add), so it must be invariant", "`IEnumerable<out T>` коваріантний, бо лише повертає T; `List<T>` ще й приймає T (Add), тож мусить бути інваріантним"],
          ["`string` doesn't derive from `object`", "`string` не походить від `object`"],
        ],
        "c",
      ),
      question(
        "contravariance",
        ["Which assignments compile?", "Які присвоєння компілюються?"],
        [
          ["`Action<object> a1 = o => {}; Action<string> a2 = a1;`", "`Action<object> a1 = o => {}; Action<string> a2 = a1;`"],
          ["`Func<string> f1 = () => \"\"; Func<object> f2 = f1;`", "`Func<string> f1 = () => \"\"; Func<object> f2 = f1;`"],
          ["`Action<string> a3 = s => {}; Action<object> a4 = a3;`", "`Action<string> a3 = s => {}; Action<object> a4 = a3;`"],
          ["`IComparer<object> c1 = null; IComparer<string> c2 = c1;`", "`IComparer<object> c1 = null; IComparer<string> c2 = c1;`"],
        ],
        ["a", "b", "d"],
      ),
      question(
        "nested",
        ["What can a nested type do that a top-level type can't?", "Що може вкладений тип, чого не може тип верхнього рівня?"],
        [
          ["Inherit from two classes", "Наслідуватися від двох класів"],
          ["Access the private members of its enclosing type, and be declared `private` itself", "Мати доступ до приватних членів охопного типу і сам бути оголошеним `private`"],
          ["Skip the garbage collector", "Обходити збирач сміття"],
          ["Be used without a namespace", "Використовуватися без простору імен"],
        ],
        "b",
      ),
    ]),
    practice("flags-practice", "Permissions with a flags enum", "Дозволи на enum-прапорцях", {
      starter: PROGRAM_WITH(flagsTypes([notImpl, notImpl, notImpl, notImpl].join("@@")), flagsMain),
      solution: PROGRAM_WITH(flagsTypes(flagsSolutionBody), flagsMain),
      expectedOutput: "Read, Write, Share\nTrue\nFalse\nRead, Share\nNone\nRead, Write, Delete, Share\nEditor\n",
    }),
    practice("generic-constraints-practice", "Generic constraints", "Обмеження узагальнень", {
      starter: PROGRAM_WITH(
        genericTypes("        // Write your code here\n        throw new NotImplementedException();", "        // Write your code here\n        throw new NotImplementedException();"),
        genericMain,
        "using System.Collections.Generic;",
      ),
      solution: PROGRAM_WITH(
        genericTypes(
          `        if (items.Count == 0) return default(T);
        T best = items[0];
        for (int i = 1; i < items.Count; i++)
            if (items[i].CompareTo(best) > 0) best = items[i];
        return best;`,
          `        T existing;
        if (_items.TryGetValue(id, out existing)) return existing;
        T created = init(new T(), id);
        _items[id] = created;
        return created;`,
        ),
        genericMain,
        "using System.Collections.Generic;",
      ),
      expectedOutput: "17\nplum\n0\n2022\nPen Pen same=True count=1\ncustomers=2\n",
    }),
  ],
};
