import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz } from "./shared";

const fractionTypes = (body: string) => `// An immutable fraction, always stored in lowest terms with a positive denominator.
struct Fraction : IEquatable<Fraction>
{
    public int Numerator { get; }
    public int Denominator { get; }

    public Fraction(int numerator, int denominator)
    {
        if (denominator == 0) throw new DivideByZeroException();
        if (denominator < 0) { numerator = -numerator; denominator = -denominator; }
        int g = Gcd(Math.Abs(numerator), denominator);
        Numerator = numerator / g;
        Denominator = denominator / g;
    }

    private static int Gcd(int a, int b) { while (b != 0) { int t = a % b; a = b; b = t; } return a == 0 ? 1 : a; }

    public override string ToString() { return Denominator == 1 ? Numerator.ToString() : Numerator + "/" + Denominator; }

${body}
}`;

const fractionMain = `        var half = new Fraction(1, 2);
        var third = new Fraction(1, 3);
        Console.WriteLine(half + third);
        Console.WriteLine(half - third);
        Console.WriteLine(half * third);
        Console.WriteLine(half / third);
        Console.WriteLine(-half);
        Console.WriteLine(new Fraction(2, 4) == half);
        Console.WriteLine(new Fraction(6, -8));
        Fraction three = 3;                 // implicit from int
        Console.WriteLine(three + half);
        double d = (double)third;           // explicit to double
        Console.WriteLine(d.ToString("0.000"));
        Console.WriteLine(half > third);
        Console.WriteLine(half != third);`;

const fractionSolution = `    public static Fraction operator +(Fraction a, Fraction b)
    {
        return new Fraction(a.Numerator * b.Denominator + b.Numerator * a.Denominator, a.Denominator * b.Denominator);
    }
    public static Fraction operator -(Fraction a, Fraction b) { return a + (-b); }
    public static Fraction operator -(Fraction a) { return new Fraction(-a.Numerator, a.Denominator); }
    public static Fraction operator *(Fraction a, Fraction b)
    {
        return new Fraction(a.Numerator * b.Numerator, a.Denominator * b.Denominator);
    }
    public static Fraction operator /(Fraction a, Fraction b)
    {
        return new Fraction(a.Numerator * b.Denominator, a.Denominator * b.Numerator);
    }

    public static bool operator ==(Fraction a, Fraction b) { return a.Equals(b); }
    public static bool operator !=(Fraction a, Fraction b) { return !a.Equals(b); }
    public static bool operator >(Fraction a, Fraction b) { return a.Numerator * b.Denominator > b.Numerator * a.Denominator; }
    public static bool operator <(Fraction a, Fraction b) { return b > a; }

    public static implicit operator Fraction(int value) { return new Fraction(value, 1); }
    public static explicit operator double(Fraction f) { return (double)f.Numerator / f.Denominator; }

    public bool Equals(Fraction other) { return Numerator == other.Numerator && Denominator == other.Denominator; }
    public override bool Equals(object obj) { return obj is Fraction && Equals((Fraction)obj); }
    public override int GetHashCode() { return Numerator * 31 + Denominator; }`;

const fractionStarter = `    // Write the operators, the conversions and the equality members here
    public bool Equals(Fraction other) { throw new NotImplementedException(); }`;

const auditTypes = (body: string) => `[AttributeUsage(AttributeTargets.Method)]
class AuditAttribute : Attribute
{
    public string Category { get; private set; }
    public bool Sensitive { get; set; }
    public AuditAttribute(string category) { Category = category; }
}

class OrderService
{
    [Audit("orders")]
    public void Place() { Log.Write("placing"); }

    [Audit("payments", Sensitive = true)]
    public void Charge() { Log.Write("charging"); }

    public void Ping() { Log.Write("pong"); }
}

static class Startup
{
    public static void Run() { Log.Write("done"); }
}

static class Log
{
    // Prints "[member:line] message". The compiler fills member and line in at the call site.
    public static void Write(string message,
        [CallerMemberName] string member = null,
        [CallerLineNumber] int line = 0)
    {
${body.split("@@")[0]}
    }
}

static class Auditor
{
    // For every public instance method of T declared in T itself (sorted by name),
    // print "Name: category" plus " (sensitive)" when flagged, or "Name: not audited".
    public static void Report(Type type)
    {
${body.split("@@")[1]}
    }
}`;

const auditMain = `        var service = new OrderService();
        service.Place();
        service.Charge();
        service.Ping();
        Startup.Run();
        Auditor.Report(typeof(OrderService));`;

const auditSolution = `        Console.WriteLine("[" + member + ":" + line + "] " + message);@@        var methods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);
        Array.Sort(methods, (a, b) => string.CompareOrdinal(a.Name, b.Name));
        foreach (var m in methods)
        {
            var audit = m.GetCustomAttribute<AuditAttribute>();
            if (audit == null) Console.WriteLine(m.Name + ": not audited");
            else Console.WriteLine(m.Name + ": " + audit.Category + (audit.Sensitive ? " (sensitive)" : ""));
        }`;

export const languageExtrasModule: ModuleDef = {
  slug: "language-extras",
  title: { en: "Attributes, dynamic, operators and unsafe code", uk: "Атрибути, dynamic, оператори та unsafe-код" },
  slides: [
    lecture("attributes-deep", "Attributes and caller info", "Атрибути та інформація про викликача"),
    lecture("dynamic-binding", "Dynamic binding", "Динамічне зв'язування"),
    lecture("operator-overloading", "Operator overloading and conversions", "Перевантаження операторів і перетворень"),
    lecture("unsafe-pointers", "Unsafe code and pointers", "Unsafe-код і вказівники"),
    lecture("preprocessor-xmldoc", "Preprocessor directives and XML documentation", "Директиви препроцесора та XML-документація"),
    quiz("language-extras-quiz", "Attributes, dynamic, operators and unsafe code", "Атрибути, dynamic, оператори та unsafe-код", [
      question(
        "attr-what",
        ["What is an attribute, technically?", "Що таке атрибут з технічного погляду?"],
        [
          ["A comment that the compiler ignores", "Коментар, який компілятор ігнорує"],
          ["A class deriving from `System.Attribute` whose instance data is stored in the assembly's metadata and can be read via reflection", "Клас, що походить від `System.Attribute`, дані якого зберігаються в метаданих збірки й читаються через рефлексію"],
          ["A special kind of interface", "Особливий вид інтерфейсу"],
          ["A runtime-only annotation stored on the heap", "Анотація лише часу виконання, що зберігається в купі"],
        ],
        "b",
      ),
      question(
        "caller-info",
        ["How do `[CallerMemberName]`, `[CallerFilePath]` and `[CallerLineNumber]` work?", "Як працюють `[CallerMemberName]`, `[CallerFilePath]` і `[CallerLineNumber]`?"],
        [
          ["They walk the stack at run time", "Вони проходять стек під час виконання"],
          ["They use reflection on every call", "Вони використовують рефлексію на кожному виклику"],
          ["The compiler substitutes the caller's member name, file and line as default argument values at the call site", "Компілятор підставляє ім'я члена, файл і рядок викликача як значення аргументів за замовчуванням у місці виклику"],
          ["They only work in Debug builds", "Вони працюють лише в Debug-збірках"],
        ],
        "c",
      ),
      question(
        "dynamic",
        ["`dynamic d = \"hello\"; d.Foo();` What happens?", "`dynamic d = \"hello\"; d.Foo();` Що станеться?"],
        [
          ["It compiles, and throws `RuntimeBinderException` at run time because string has no Foo", "Компілюється, а під час виконання кидає `RuntimeBinderException`, бо в string немає Foo"],
          ["A compile error", "Помилка компіляції"],
          ["It returns null", "Повертає null"],
          ["It calls `ToString()`", "Викликає `ToString()`"],
        ],
        "a",
      ),
      question(
        "op-pairs",
        ["Which operator overloads must be declared in pairs?", "Які перевантаження операторів мають оголошуватися парами?"],
        [
          ["`+` and `-`", "`+` і `-`"],
          ["`*` and `/`", "`*` і `/`"],
          ["`&&` and `||`", "`&&` і `||`"],
          ["`==` with `!=`, `<` with `>`, `<=` with `>=` (and if you define `==`, override `Equals` and `GetHashCode` too)", "`==` з `!=`, `<` з `>`, `<=` з `>=` (а якщо визначено `==`, перевизначте ще `Equals` і `GetHashCode`)"],
        ],
        "d",
      ),
      question(
        "implicit-explicit",
        ["When should a custom conversion be `implicit` rather than `explicit`?", "Коли власне перетворення має бути `implicit`, а не `explicit`?"],
        [
          ["Always, because it's more convenient", "Завжди, бо так зручніше"],
          ["Only when it can never fail and never loses information", "Лише коли воно ніколи не падає і не втрачає інформацію"],
          ["When the target type is a string", "Коли цільовий тип — рядок"],
          ["When the source is a struct", "Коли джерело — структура"],
        ],
        "b",
      ),
      question(
        "fixed",
        ["Why is the `fixed` statement needed when taking a pointer to an array element?", "Навіщо потрібна інструкція `fixed`, коли беруть вказівник на елемент масиву?"],
        [
          ["To make the array read-only", "Щоб масив став лише для читання"],
          ["To allocate the array on the stack", "Щоб розмістити масив у стеку"],
          ["It pins the array so the garbage collector can't move it while the pointer is in use", "Вона закріплює масив, щоб збирач сміття не перемістив його, поки використовується вказівник"],
          ["To enable bounds checking", "Щоб увімкнути перевірку меж"],
        ],
        "c",
      ),
      question(
        "conditional-attr",
        ["What does `[Conditional(\"DEBUG\")]` on a method do?", "Що робить `[Conditional(\"DEBUG\")]` на методі?"],
        [
          ["Calls to the method are removed by the compiler unless the DEBUG symbol is defined at the call site", "Компілятор видаляє виклики методу, якщо в місці виклику не визначено символ DEBUG"],
          ["The method body is removed", "Видаляється тіло методу"],
          ["The method throws in Release builds", "Метод кидає виняток у Release-збірках"],
          ["The method runs only when a debugger is attached", "Метод виконується, лише коли під'єднано налагоджувач"],
        ],
        "a",
      ),
      question(
        "nullable-directive",
        ["Which are real C# preprocessor directives?", "Які з цього — справжні директиви препроцесора C#?"],
        [
          ["`#if DEBUG` / `#endif`", "`#if DEBUG` / `#endif`"],
          ["`#pragma warning disable CS0618`", "`#pragma warning disable CS0618`"],
          ["`#nullable enable`", "`#nullable enable`"],
          ["`#include \"file.cs\"`", "`#include \"file.cs\"`"],
        ],
        ["a", "b", "c"],
      ),
    ]),
    practice("operators-practice", "A Fraction type with operators", "Тип Fraction з операторами", {
      starter: PROGRAM_WITH(fractionTypes(fractionStarter), "        // Uncomment when the operators exist\n        // " + fractionMain.trim().split("\n").join("\n        // ")),
      solution: PROGRAM_WITH(fractionTypes(fractionSolution), fractionMain),
      expectedOutput: "5/6\n1/6\n1/6\n3/2\n-1/2\nTrue\n-3/4\n7/2\n0.333\nTrue\nTrue\n",
    }),
    practice("attributes-practice", "Caller info and custom attributes", "Інформація про викликача та власні атрибути", {
      starter: PROGRAM_WITH(
        auditTypes("        // Write your code here\n        throw new NotImplementedException();@@        // Write your code here\n        throw new NotImplementedException();"),
        auditMain,
        "using System.Reflection;\nusing System.Runtime.CompilerServices;",
      ),
      solution: PROGRAM_WITH(auditTypes(auditSolution), auditMain, "using System.Reflection;\nusing System.Runtime.CompilerServices;"),
      expectedOutput:
        "[Place:16] placing\n[Charge:19] charging\n[Ping:21] pong\n[Run:26] done\nCharge: payments (sensitive)\nPing: not audited\nPlace: orders\n",
    }),
  ],
};
