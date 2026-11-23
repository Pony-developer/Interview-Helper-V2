import { PROGRAM, PROGRAM_WITH } from "../csharp-code";
import type { ModuleDef } from "../types";

const TYPE_NAMES = (aliases: string, body: string) => `    // C# keywords are aliases for CLR types
    static readonly Dictionary<Type, string> Aliases = new Dictionary<Type, string>
    {
${aliases}
    };

    // The C# name of a type: int for System.Int32, double[] for System.Double[],
    // List<int> for List\`1 with an int argument, int? for Nullable\`1 with an int argument
    static string CSharpName(Type type)
    {
${body}
    }

    static void Main()
    {
        Type[] types =
        {
            typeof(int),
            typeof(string),
            typeof(bool),
            typeof(object),
            typeof(DateTime),
            typeof(double[]),
            typeof(List<int>),
            typeof(Dictionary<string, List<long>>),
            typeof(int?),
            typeof(KeyValuePair<char, decimal>[]),
        };
        foreach (var type in types)
        {
            Console.WriteLine(type.Name + " -> " + CSharpName(type));
        }
    }`;

const TFM_TYPES = `// A parsed target framework moniker (TFM), such as net8.0, net48 or netstandard2.0
class Tfm
{
    // "framework" (.NET Framework), "core" (.NET Core and .NET 5+) or "standard" (.NET Standard)
    public readonly string Family;
    public readonly Version Version;

    private Tfm(string family, Version version)
    {
        Family = family;
        Version = version;
    }

    public static Tfm Parse(string moniker)
    {
        if (moniker.StartsWith("netstandard"))
        {
            return new Tfm("standard", Version.Parse(moniker.Substring("netstandard".Length)));
        }
        if (moniker.StartsWith("netcoreapp"))
        {
            return new Tfm("core", Version.Parse(moniker.Substring("netcoreapp".Length)));
        }
        string digits = moniker.Substring("net".Length);
        if (digits.Contains("."))
        {
            // net5.0 and later continue the .NET Core line
            return new Tfm("core", Version.Parse(digits));
        }
        // .NET Framework: net472 is 4.7.2, net48 is 4.8
        string version = digits[0].ToString();
        for (int i = 1; i < digits.Length; i++)
        {
            version += "." + digits[i];
        }
        return new Tfm("framework", Version.Parse(version));
    }
}`;

const TFM_MAIN = `        string[,] pairs =
        {
            { "net8.0", "net6.0" },
            { "net6.0", "net8.0" },
            { "net10.0", "netcoreapp3.1" },
            { "net8.0", "netstandard2.0" },
            { "net8.0", "netstandard2.1" },
            { "netcoreapp2.1", "netstandard2.1" },
            { "netcoreapp3.1", "netstandard2.1" },
            { "net48", "netstandard2.0" },
            { "net461", "netstandard2.0" },
            { "net452", "netstandard2.0" },
            { "net472", "netstandard2.1" },
            { "net48", "net472" },
            { "net472", "net48" },
            { "net48", "net8.0" },
            { "net8.0", "net48" },
            { "netstandard2.1", "netstandard2.0" },
            { "netstandard2.0", "netstandard2.1" },
            { "netstandard2.0", "net8.0" },
            { "netstandard2.0", "net48" },
        };
        for (int i = 0; i < pairs.GetLength(0); i++)
        {
            Console.WriteLine(pairs[i, 0] + " -> " + pairs[i, 1] + ": " + Check(pairs[i, 0], pairs[i, 1]));
        }`;

const TFM_CHECK = (body: string) => `    // Can a project that targets \`project\` reference a library built for \`library\`?
    // Returns "yes", "no" or "warning"
    static string Check(string project, string library)
    {
        Tfm app = Tfm.Parse(project);
        Tfm lib = Tfm.Parse(library);
${body}
    }`;

export const dotnetPlatformModule: ModuleDef = {
  slug: "dotnet-platform",
  title: { en: "The .NET platform: CLR, BCL, SDK", uk: "Платформа .NET: CLR, BCL, SDK" },
  slides: [
    { kind: "lecture", slug: "dotnet-landscape", title: { en: ".NET Framework, .NET Core and modern .NET", uk: ".NET Framework, .NET Core і сучасний .NET" } },
    { kind: "lecture", slug: "compilation-il-jit", title: { en: "From C# to machine code: IL, JIT, AOT", uk: "Від C# до машинного коду: IL, JIT, AOT" } },
    { kind: "lecture", slug: "clr-and-cts", title: { en: "The CLR and the common type system", uk: "CLR і спільна система типів" } },
    {
      kind: "quiz",
      slug: "platform-quiz",
      title: { en: "How .NET runs your code", uk: "Як .NET виконує ваш код" },
      questions: [
        {
          id: "framework-vs-core",
          mode: "single",
          prompt: { en: "What is the main difference between .NET Framework and .NET Core (.NET 5+)?", uk: "Яка головна відмінність між .NET Framework і .NET Core (.NET 5+)?" },
          options: [
            { id: "a", text: { en: ".NET Framework runs only on Windows and is installed machine-wide; .NET Core is cross-platform, open source and installs side by side", uk: ".NET Framework працює лише на Windows і встановлюється на всю машину; .NET Core кросплатформний, відкритий і встановлюється пліч-о-пліч" } },
            { id: "b", text: { en: ".NET Core cannot run C#, only F#", uk: ".NET Core не вміє виконувати C#, лише F#" } },
            { id: "c", text: { en: "They are two names of the same product", uk: "Це дві назви одного продукту" } },
          ],
          correct: ["a"],
        },
        {
          id: "compiler-output",
          mode: "single",
          prompt: { en: "What does the C# compiler put into `MyApp.dll`?", uk: "Що компілятор C# кладе в `MyApp.dll`?" },
          options: [
            { id: "a", text: { en: "IL code plus metadata that describes every type and member", uk: "IL-код і метадані, що описують кожен тип і член" } },
            { id: "b", text: { en: "Native x64 machine code only", uk: "Лише нативний машинний код x64" } },
            { id: "c", text: { en: "The C# source code, compressed", uk: "Стиснений вихідний код C#" } },
          ],
          correct: ["a"],
        },
        {
          id: "jit-when",
          mode: "single",
          prompt: { en: "When does the JIT compile a method (without ReadyToRun or Native AOT)?", uk: "Коли JIT компілює метод (без ReadyToRun і Native AOT)?" },
          options: [
            { id: "a", text: { en: "Right before its first call; later calls reuse the native code", uk: "Перед його першим викликом; наступні виклики використовують готовий нативний код" } },
            { id: "b", text: { en: "Every time the method is called", uk: "Щоразу, коли метод викликають" } },
            { id: "c", text: { en: "All methods at once, when the program starts", uk: "Усі методи одразу, коли програма стартує" } },
          ],
          correct: ["a"],
        },
        {
          id: "int-alias",
          mode: "single",
          prompt: { en: "What is the difference between `int` and `System.Int32`?", uk: "Яка різниця між `int` і `System.Int32`?" },
          options: [
            { id: "a", text: { en: "None: `int` is the C# keyword alias for the CTS type `System.Int32`", uk: "Жодної: `int` — це ключове слово-псевдонім C# для типу CTS `System.Int32`" } },
            { id: "b", text: { en: "`int` is a value type, `System.Int32` is a reference type", uk: "`int` — значущий тип, а `System.Int32` — посилальний" } },
            { id: "c", text: { en: "`int` is 32 bits on x86 and 64 bits on x64", uk: "`int` має 32 біти на x86 і 64 біти на x64" } },
          ],
          correct: ["a"],
        },
        {
          id: "reified-generics",
          mode: "single",
          prompt: { en: "Is `typeof(List<int>) == typeof(List<string>)` true in .NET?", uk: "Чи `typeof(List<int>) == typeof(List<string>)` дає true у .NET?" },
          options: [
            { id: "a", text: { en: "No: generics are real in the runtime, and each instantiation is its own type", uk: "Ні: узагальнення реальні в середовищі виконання, і кожне закриття — окремий тип" } },
            { id: "b", text: { en: "Yes: type arguments are erased after compilation, as in Java", uk: "Так: аргументи типу стираються після компіляції, як у Java" } },
            { id: "c", text: { en: "It does not compile", uk: "Це не компілюється" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "clr-type-names",
      title: { en: "Practice: C# names for CLR types", uk: "Практика «C#-імена для типів CLR»" },
      language: "csharp",
      starter: PROGRAM(
        TYPE_NAMES(
          `        { typeof(int), "int" },
        { typeof(string), "string" },
        // Add the other keywords that Main needs`,
          `        // Write your code here
        return type.Name;`,
        ),
        "using System.Collections.Generic;",
      ),
      solution: PROGRAM(
        TYPE_NAMES(
          `        { typeof(int), "int" },
        { typeof(string), "string" },
        { typeof(bool), "bool" },
        { typeof(object), "object" },
        { typeof(double), "double" },
        { typeof(long), "long" },
        { typeof(char), "char" },
        { typeof(decimal), "decimal" },`,
          `        if (Aliases.ContainsKey(type))
        {
            return Aliases[type];
        }
        if (type.IsArray)
        {
            return CSharpName(type.GetElementType()) + "[]";
        }
        if (type.IsGenericType)
        {
            Type[] args = type.GetGenericArguments();
            if (type.GetGenericTypeDefinition() == typeof(Nullable<>))
            {
                return CSharpName(args[0]) + "?";
            }
            var names = new string[args.Length];
            for (int i = 0; i < args.Length; i++)
            {
                names[i] = CSharpName(args[i]);
            }
            string name = type.Name.Substring(0, type.Name.IndexOf('\`'));
            return name + "<" + string.Join(", ", names) + ">";
        }
        return type.Name;`,
        ),
        "using System.Collections.Generic;",
      ),
      expectedOutput:
        "Int32 -> int\nString -> string\nBoolean -> bool\nObject -> object\nDateTime -> DateTime\nDouble[] -> double[]\nList`1 -> List<int>\nDictionary`2 -> Dictionary<string, List<long>>\nNullable`1 -> int?\nKeyValuePair`2[] -> KeyValuePair<char, decimal>[]\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "bcl-nuget-tfm", title: { en: "BCL, shared frameworks and NuGet", uk: "BCL, спільні фреймворки і NuGet" } },
    {
      kind: "practice",
      slug: "tfm-compatibility",
      title: { en: "Practice: Can I reference this library?", uk: "Практика «Чи можна підключити цю бібліотеку?»" },
      language: "csharp",
      starter: PROGRAM_WITH(
        TFM_TYPES,
        TFM_MAIN,
        "",
        TFM_CHECK(`        // Write your code here
        return "no";`),
      ),
      solution: PROGRAM_WITH(
        TFM_TYPES,
        TFM_MAIN,
        "",
        TFM_CHECK(`        if (lib.Family == "framework")
        {
            if (app.Family == "core")
            {
                return "warning";
            }
            return app.Family == "framework" && lib.Version <= app.Version ? "yes" : "no";
        }
        if (lib.Family == "core")
        {
            return app.Family == "core" && lib.Version <= app.Version ? "yes" : "no";
        }
        // A .NET Standard library
        bool ok;
        if (app.Family == "standard")
        {
            ok = lib.Version <= app.Version;
        }
        else if (app.Family == "core")
        {
            ok = app.Version >= (lib.Version >= new Version(2, 1) ? new Version(3, 0) : new Version(2, 0));
        }
        else
        {
            ok = lib.Version < new Version(2, 1) && app.Version >= new Version(4, 6, 1);
        }
        return ok ? "yes" : "no";`),
      ),
      expectedOutput:
        "net8.0 -> net6.0: yes\nnet6.0 -> net8.0: no\nnet10.0 -> netcoreapp3.1: yes\nnet8.0 -> netstandard2.0: yes\nnet8.0 -> netstandard2.1: yes\nnetcoreapp2.1 -> netstandard2.1: no\nnetcoreapp3.1 -> netstandard2.1: yes\nnet48 -> netstandard2.0: yes\nnet461 -> netstandard2.0: yes\nnet452 -> netstandard2.0: no\nnet472 -> netstandard2.1: no\nnet48 -> net472: yes\nnet472 -> net48: no\nnet48 -> net8.0: no\nnet8.0 -> net48: warning\nnetstandard2.1 -> netstandard2.0: yes\nnetstandard2.0 -> netstandard2.1: no\nnetstandard2.0 -> net8.0: no\nnetstandard2.0 -> net48: no\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "sdk-build-deploy", title: { en: "SDK, build and deployment", uk: "SDK, збирання і розгортання" } },
    {
      kind: "quiz",
      slug: "platform-review",
      title: { en: "Self-check questions", uk: "Питання для самоперевірки" },
      questions: [
        {
          id: "lts",
          mode: "single",
          prompt: { en: "Which .NET releases are LTS (long-term support)?", uk: "Які випуски .NET мають LTS (довгострокову підтримку)?" },
          options: [
            { id: "a", text: { en: "Even-numbered ones (.NET 8, .NET 10): three years of support", uk: "Парні (.NET 8, .NET 10): три роки підтримки" } },
            { id: "b", text: { en: "Odd-numbered ones (.NET 7, .NET 9)", uk: "Непарні (.NET 7, .NET 9)" } },
            { id: "c", text: { en: "Every release is supported for ten years", uk: "Кожен випуск підтримується десять років" } },
          ],
          correct: ["a"],
        },
        {
          id: "tiered",
          mode: "single",
          prompt: { en: "Why does a .NET service often get faster after the first minute of work?", uk: "Чому .NET-сервіс часто стає швидшим після першої хвилини роботи?" },
          options: [
            { id: "a", text: { en: "Tiered compilation: hot methods are recompiled with full optimizations, using the profile collected at tier 0", uk: "Багаторівнева компіляція: гарячі методи перекомпільовуються з повною оптимізацією, з урахуванням профілю, зібраного на рівні 0" } },
            { id: "b", text: { en: "The GC deletes the IL after it is compiled", uk: "GC видаляє IL після компіляції" } },
            { id: "c", text: { en: "The CPU learns the C# syntax", uk: "Процесор вивчає синтаксис C#" } },
          ],
          correct: ["a"],
        },
        {
          id: "netstandard",
          mode: "single",
          prompt: { en: "What is .NET Standard?", uk: "Що таке .NET Standard?" },
          options: [
            { id: "a", text: { en: "A specification: a set of APIs that several .NET implementations promise to have", uk: "Специфікація: набір API, які обіцяють мати кілька реалізацій .NET" } },
            { id: "b", text: { en: "A runtime that you install on a server", uk: "Середовище виконання, яке встановлюють на сервер" } },
            { id: "c", text: { en: "The newest version of .NET Framework", uk: "Найновіша версія .NET Framework" } },
          ],
          correct: ["a"],
        },
        {
          id: "new-library-tfm",
          mode: "single",
          prompt: {
            en: "Your new library must work in a .NET 10 service and in an old .NET Framework 4.8 app. What should it target?",
            uk: "Ваша нова бібліотека має працювати і в сервісі на .NET 10, і в старому застосунку на .NET Framework 4.8. Під що її збирати?",
          },
          options: [
            { id: "a", text: { en: "`netstandard2.0` (or multi-target `netstandard2.0;net10.0`)", uk: "`netstandard2.0` (або кілька цілей: `netstandard2.0;net10.0`)" } },
            { id: "b", text: { en: "`netstandard2.1`", uk: "`netstandard2.1`" } },
            { id: "c", text: { en: "`net10.0` only", uk: "Лише `net10.0`" } },
          ],
          correct: ["a"],
        },
        {
          id: "bcl",
          mode: "multi",
          prompt: { en: "Which of these ship with .NET itself (the BCL), with no NuGet package?", uk: "Що з переліченого постачається разом із .NET (BCL), без пакета NuGet?" },
          options: [
            { id: "a", text: { en: "`System.Collections.Generic`", uk: "`System.Collections.Generic`" } },
            { id: "b", text: { en: "`System.Text.Json`", uk: "`System.Text.Json`" } },
            { id: "c", text: { en: "`System.Net.Http.HttpClient`", uk: "`System.Net.Http.HttpClient`" } },
            { id: "d", text: { en: "`Newtonsoft.Json`", uk: "`Newtonsoft.Json`" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "server-needs",
          mode: "single",
          prompt: { en: "What must be installed on a server to run a framework-dependent ASP.NET Core app?", uk: "Що має бути встановлено на сервері, щоб запустити framework-dependent застосунок ASP.NET Core?" },
          options: [
            { id: "a", text: { en: "The ASP.NET Core runtime of a matching major version; the SDK is not needed", uk: "Середовище виконання ASP.NET Core відповідної мажорної версії; SDK не потрібен" } },
            { id: "b", text: { en: "The full .NET SDK and Visual Studio", uk: "Повний .NET SDK і Visual Studio" } },
            { id: "c", text: { en: "Nothing: every .NET app is self-contained", uk: "Нічого: кожен .NET-застосунок самодостатній" } },
          ],
          correct: ["a"],
        },
        {
          id: "native-aot",
          mode: "multi",
          prompt: { en: "What is true about Native AOT?", uk: "Що правда про Native AOT?" },
          options: [
            { id: "a", text: { en: "The app starts fast and uses less memory, because there is no JIT at run time", uk: "Застосунок швидко стартує й використовує менше пам'яті, бо під час виконання немає JIT" } },
            { id: "b", text: { en: "Code that generates or loads code at run time (`Reflection.Emit`, `Assembly.LoadFrom`) does not work", uk: "Код, що генерує чи завантажує код під час виконання (`Reflection.Emit`, `Assembly.LoadFrom`), не працює" } },
            { id: "c", text: { en: "You publish a separate executable for each OS and CPU (runtime identifier)", uk: "Для кожної ОС і процесора (runtime identifier) публікується окремий виконуваний файл" } },
            { id: "d", text: { en: "The same output file runs on Windows, Linux and macOS", uk: "Один і той самий вихідний файл працює на Windows, Linux і macOS" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "cls",
          mode: "single",
          prompt: { en: "A public method of a library takes a `uint`. Why does `[assembly: CLSCompliant(true)]` warn about it?", uk: "Публічний метод бібліотеки приймає `uint`. Чому `[assembly: CLSCompliant(true)]` попереджає про це?" },
          options: [
            { id: "a", text: { en: "Unsigned integers are not in the CLS, so some .NET languages may be unable to call the method", uk: "Беззнакових цілих немає в CLS, тож деякі мови .NET можуть не змогти викликати цей метод" } },
            { id: "b", text: { en: "`uint` is slower than `int`", uk: "`uint` повільніший за `int`" } },
            { id: "c", text: { en: "`uint` does not exist in the CTS", uk: "`uint` не існує в CTS" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
