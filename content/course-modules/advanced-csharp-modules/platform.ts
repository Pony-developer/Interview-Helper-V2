import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const tfmTypes = (body: string) => `static class Tfm
{
    // "net6.0" -> ".NET 6.0", "netstandard2.1" -> ".NET Standard 2.1",
    // "netcoreapp3.1" -> ".NET Core 3.1", "net48" -> ".NET Framework 4.8", "net472" -> ".NET Framework 4.7.2"
    // An OS suffix is kept in brackets: "net6.0-windows" -> ".NET 6.0 (windows)". Anything else -> "unknown".
    public static string Describe(string tfm)
    {
${body}
    }
}`;

const tfmMain = `        var tfms = new[] { "net6.0", "netstandard2.0", "netcoreapp3.1", "net48", "net472", "net6.0-windows", "java8" };
        foreach (var tfm in tfms)
            Console.WriteLine(tfm + " => " + Tfm.Describe(tfm));`;

const tfmSolution = `        string platform = "";
        int dash = tfm.IndexOf('-');
        if (dash >= 0)
        {
            platform = " (" + tfm.Substring(dash + 1) + ")";
            tfm = tfm.Substring(0, dash);
        }
        if (tfm.StartsWith("netstandard")) return ".NET Standard " + tfm.Substring(11) + platform;
        if (tfm.StartsWith("netcoreapp")) return ".NET Core " + tfm.Substring(10) + platform;
        if (tfm.StartsWith("net"))
        {
            string v = tfm.Substring(3);
            if (v.Contains(".")) return ".NET " + v + platform;
            if (v.Length > 0 && v.Length <= 3) return ".NET Framework " + string.Join(".", v.ToCharArray()) + platform;
        }
        return "unknown";`;

export const platformModule: ModuleDef = {
  slug: "platform",
  title: { en: "C# and the .NET platform", uk: "C# і платформа .NET" },
  slides: [
    lecture("csharp-at-a-glance", "What makes C# C#", "Що робить C# саме C#"),
    lecture("clr-bcl-runtimes", "CLR, BCL and the runtimes", "CLR, BCL і середовища виконання"),
    lecture("csharp-history", "From C# 1 to C# 10", "Від C# 1 до C# 10"),
    lecture("dotnet-standard-tfm", ".NET Standard, target frameworks and versions", ".NET Standard, цільові фреймворки та версії"),
    lecture("application-layers", "The application layers of .NET", "Прикладні шари .NET"),
    quiz("platform-quiz", "C# and the .NET platform", "C# і платформа .NET", [
      question(
        "unified",
        ["What does a \"unified type system\" mean in C#?", "Що означає «уніфікована система типів» у C#?"],
        [
          ["All types must be classes", "Усі типи мусять бути класами"],
          ["Every type, including `int` and `bool`, ultimately derives from `object` and shares its members", "Кожен тип, зокрема `int` і `bool`, зрештою походить від `object` і має його члени"],
          ["Types are checked only at run time", "Типи перевіряються лише під час виконання"],
          ["All types are stored on the heap", "Усі типи зберігаються в купі"],
        ],
        "b",
      ),
      question(
        "il",
        ["What does the C# compiler produce?", "Що створює компілятор C#?"],
        [
          ["Native machine code for the current CPU", "Нативний машинний код для поточного процесора"],
          ["JavaScript", "JavaScript"],
          ["Intermediate Language (IL) plus metadata, which the CLR's JIT compiler turns into machine code at run time", "Проміжну мову (IL) і метадані, які JIT-компілятор CLR перетворює на машинний код під час виконання"],
          ["Source code for another language", "Вихідний код іншою мовою"],
        ],
        "c",
      ),
      question(
        "bcl",
        ["What is the BCL?", "Що таке BCL?"],
        [
          ["The Base Class Library: core types such as collections, I/O, text, threading and networking that every .NET app can use", "Base Class Library: базові типи на кшталт колекцій, введення-виведення, тексту, потоків і мережі, доступні кожній .NET-програмі"],
          ["A database", "База даних"],
          ["The C# compiler", "Компілятор C#"],
          ["A Windows-only UI framework", "UI-фреймворк лише для Windows"],
        ],
        "a",
      ),
      question(
        "standard",
        ["Why would a library target `netstandard2.0`?", "Навіщо бібліотеці ціль `netstandard2.0`?"],
        [
          ["It runs faster than .NET 6", "Вона працює швидше за .NET 6"],
          ["It is required for ASP.NET Core", "Вона обов'язкова для ASP.NET Core"],
          ["It unlocks C# 10 features", "Вона відкриває можливості C# 10"],
          ["One build can be used by .NET Framework 4.6.1+, .NET Core 2.0+ and .NET 5/6+", "Одну збірку можуть використати .NET Framework 4.6.1+, .NET Core 2.0+ і .NET 5/6+"],
        ],
        "d",
      ),
      question(
        "langversion",
        ["How are the C# language version and the .NET version related?", "Як пов'язані версія мови C# і версія .NET?"],
        [
          ["They are the same number", "Це одне й те саме число"],
          ["By default the compiler picks the language version that matches the target framework (C# 10 for .NET 6); some features also need runtime support", "За замовчуванням компілятор бере версію мови, що відповідає цільовому фреймворку (C# 10 для .NET 6); деякі можливості ще й потребують підтримки рантайму"],
          ["They are completely unrelated", "Вони зовсім не пов'язані"],
          ["The language version is set by Windows", "Версію мови задає Windows"],
        ],
        "b",
      ),
      question(
        "managed",
        ["Which statements about memory management in C# are true?", "Які твердження про керування пам'яттю в C# правдиві?"],
        [
          ["The garbage collector reclaims objects that are no longer reachable", "Збирач сміття звільняє об'єкти, до яких більше немає доступу"],
          ["You must call `delete` for every `new`", "Для кожного `new` треба викликати `delete`"],
          ["Pointers are still available inside `unsafe` blocks", "Вказівники все ще доступні в блоках `unsafe`"],
          ["C# has no way to release unmanaged resources", "У C# немає способу звільнити некеровані ресурси"],
        ],
        ["a", "c"],
      ),
      question(
        "aot",
        ["What does ReadyToRun (or AOT) compilation give you?", "Що дає компіляція ReadyToRun (або AOT)?"],
        [
          ["Smaller source files", "Менші файли з кодом"],
          ["Automatic multithreading", "Автоматичну багатопотоковість"],
          ["Code precompiled to native, so the app starts faster with less JIT work", "Код, заздалегідь скомпільований у нативний, тож програма стартує швидше і менше працює JIT"],
          ["Garbage collection is turned off", "Вимкнене збирання сміття"],
        ],
        "c",
      ),
      question(
        "layers",
        ["Which of these are application layers built on top of the .NET runtime and BCL?", "Що з переліченого — прикладні шари поверх рантайму .NET і BCL?"],
        [
          ["ASP.NET Core", "ASP.NET Core"],
          ["WPF and Windows Forms", "WPF і Windows Forms"],
          ["The x86 instruction set", "Набір інструкцій x86"],
          [".NET MAUI", ".NET MAUI"],
        ],
        ["a", "b", "d"],
      ),
    ]),
    practice("tfm-practice", "Read a target framework moniker", "Розбір моніка цільового фреймворку", {
      starter: PROGRAM_WITH(tfmTypes(TODO), tfmMain),
      solution: PROGRAM_WITH(tfmTypes(tfmSolution), tfmMain),
      expectedOutput:
        "net6.0 => .NET 6.0\nnetstandard2.0 => .NET Standard 2.0\nnetcoreapp3.1 => .NET Core 3.1\nnet48 => .NET Framework 4.8\nnet472 => .NET Framework 4.7.2\nnet6.0-windows => .NET 6.0 (windows)\njava8 => unknown\n",
    }),
  ],
};
