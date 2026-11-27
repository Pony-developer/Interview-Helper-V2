import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const resourceTypes = (body: string) => `// A tiny ResourceManager: resources are stored per culture name ("" = invariant / neutral).
class Resources
{
    private readonly Dictionary<string, Dictionary<string, string>> _byCulture =
        new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase);

    public void Add(string culture, string key, string value)
    {
        Dictionary<string, string> table;
        if (!_byCulture.TryGetValue(culture, out table)) _byCulture[culture] = table = new Dictionary<string, string>();
        table[key] = value;
    }

    // Looks up 'key' for 'culture', falling back through parent cultures (uk-UA -> uk -> invariant),
    // exactly like satellite assemblies do. Returns "[key]" when nothing is found.
    public string Get(string key, CultureInfo culture)
    {
${body}
    }
}`;

const resourceSolution = `        for (CultureInfo c = culture; ; c = c.Parent)
        {
            Dictionary<string, string> table;
            string value;
            if (_byCulture.TryGetValue(c.Name, out table) && table.TryGetValue(key, out value)) return value;
            if (c.Name.Length == 0) break;
        }
        return "[" + key + "]";`;

const resourceMain = `        Console.OutputEncoding = new UTF8Encoding(false);   // print non-ASCII text correctly
        var res = new Resources();
        res.Add("", "Greeting", "Hello");
        res.Add("", "Cart", "Cart");
        res.Add("", "Checkout", "Checkout");
        res.Add("uk", "Greeting", "Привіт");
        res.Add("uk", "Cart", "Кошик");
        res.Add("uk-UA", "Greeting", "Вітаємо");
        res.Add("de", "Cart", "Warenkorb");

        foreach (var name in new[] { "uk-UA", "uk", "de-AT", "fr-FR" })
        {
            var culture = new CultureInfo(name);
            Console.WriteLine(name + ": " + res.Get("Greeting", culture) + " / " + res.Get("Cart", culture)
                + " / " + res.Get("Checkout", culture) + " / " + res.Get("Missing", culture));
        }

        var asm = new AssemblyName("Shop.Core, Version=2.1.0.7, Culture=neutral, PublicKeyToken=null");
        Console.WriteLine(asm.Name + " " + asm.Version + " major=" + asm.Version.Major
            + " culture='" + asm.CultureName + "'");`;

export const assembliesModule: ModuleDef = {
  slug: "assemblies",
  title: { en: "Assemblies", uk: "Збірки" },
  slides: [
    lecture("assembly-contents", "What's in an assembly: manifest, metadata, IL", "Що всередині збірки: маніфест, метадані, IL"),
    lecture("assembly-names-signing", "Assembly names, versions, strong naming and signing", "Імена збірок, версії, строгі імена та підписування"),
    lecture("resources-satellite", "Resources and satellite assemblies", "Ресурси та сателітні збірки"),
    lecture("assembly-loading", "Loading, resolving and isolating assemblies", "Завантаження, розв'язання та ізоляція збірок"),
    quiz("assemblies-quiz", "Assemblies", "Збірки", [
      question(
        "contents",
        ["What does a .NET assembly contain?", "Що містить збірка .NET?"],
        [
          ["A manifest (name, version, references), type metadata, IL code, and optionally resources", "Маніфест (ім'я, версія, посилання), метадані типів, IL-код і, за потреби, ресурси"],
          ["Only native machine code", "Лише нативний машинний код"],
          ["Only source code", "Лише вихідний код"],
          ["A copy of the .NET runtime", "Копію рантайму .NET"],
        ],
        "a",
      ),
      question(
        "versions",
        ["Which version number does the runtime use for binding to a referenced strong-named assembly?", "Який номер версії рантайм використовує, щоб прив'язатися до збірки зі строгим іменем, на яку посилаються?"],
        [
          ["`AssemblyInformationalVersion`", "`AssemblyInformationalVersion`"],
          ["`AssemblyFileVersion`", "`AssemblyFileVersion`"],
          ["`AssemblyVersion`", "`AssemblyVersion`"],
          ["The NuGet package version", "Версію NuGet-пакета"],
        ],
        "c",
      ),
      question(
        "strong-name",
        ["What does a strong name give an assembly?", "Що дає збірці строге ім'я?"],
        [
          ["Protection against reverse engineering", "Захист від реверс-інжинірингу"],
          ["A unique identity (name + version + culture + public key token) and tamper detection; it is not a statement of trust about the publisher", "Унікальну ідентичність (ім'я + версія + культура + токен публічного ключа) і виявлення підробок; це не заява про довіру до видавця"],
          ["Faster loading", "Швидше завантаження"],
          ["Encryption of the IL", "Шифрування IL"],
        ],
        "b",
      ),
      question(
        "satellite",
        ["The UI culture is `uk-UA`. Where does the ResourceManager look for a string?", "Культура UI — `uk-UA`. Де ResourceManager шукає рядок?"],
        [
          ["Only in the main assembly", "Лише в основній збірці"],
          ["In uk-UA, then uk, then the neutral resources in the main assembly", "У uk-UA, потім uk, потім нейтральні ресурси в основній збірці"],
          ["In en-US first", "Спершу в en-US"],
          ["In a random satellite", "У випадковій сателітній збірці"],
        ],
        "b",
      ),
      question(
        "alc",
        ["What is `AssemblyLoadContext` used for in .NET Core / .NET 5+?", "Для чого `AssemblyLoadContext` у .NET Core / .NET 5+?"],
        [
          ["Compiling C# at run time", "Компіляції C# під час виконання"],
          ["Signing assemblies", "Підписування збірок"],
          ["Isolating groups of assemblies (e.g. plug-ins with their own dependency versions) and unloading them when collectible", "Ізоляції груп збірок (наприклад, плагінів з власними версіями залежностей) і їх вивантаження, коли контекст collectible"],
          ["Loading assemblies from the GAC", "Завантаження збірок з GAC"],
        ],
        "c",
      ),
      question(
        "loadfrom",
        ["Which are true about loading assemblies at run time?", "Що правда про завантаження збірок під час виконання?"],
        [
          ["An assembly can't be unloaded from the default load context", "Збірку не можна вивантажити з контексту завантаження за замовчуванням"],
          ["`AssemblyLoadContext.Resolving` lets you supply an assembly the runtime couldn't find", "`AssemblyLoadContext.Resolving` дозволяє надати збірку, яку рантайм не знайшов"],
          ["`AssemblyDependencyResolver` reads a plug-in's .deps.json to find its dependencies", "`AssemblyDependencyResolver` читає .deps.json плагіна, щоб знайти його залежності"],
          ["The GAC is used by .NET 6", "GAC використовується в .NET 6"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "authenticode",
        ["What is Authenticode signing for?", "Для чого підписування Authenticode?"],
        [
          ["Proving who published a file, using a certificate from a trusted authority, so Windows and users can trust it", "Довести, хто опублікував файл, за допомогою сертифіката від довіреного центру, щоб Windows і користувачі могли йому довіряти"],
          ["Giving the assembly a unique identity for binding", "Надати збірці унікальну ідентичність для зв'язування"],
          ["Compressing the assembly", "Стиснути збірку"],
          ["Making the assembly cross-platform", "Зробити збірку кросплатформною"],
        ],
        "a",
      ),
      question(
        "single-file",
        ["What does `PublishSingleFile` do?", "Що робить `PublishSingleFile`?"],
        [
          ["Merges all source files into one", "Зливає всі файли з кодом в один"],
          ["Bundles the app and its dependencies (and optionally the runtime) into one executable file", "Пакує застосунок і його залежності (і за бажанням рантайм) в один виконуваний файл"],
          ["Compiles to JavaScript", "Компілює в JavaScript"],
          ["Removes all resources", "Видаляє всі ресурси"],
        ],
        "b",
      ),
    ]),
    practice("resource-fallback-practice", "Culture fallback like a ResourceManager", "Відкат культур, як у ResourceManager", {
      starter: PROGRAM_WITH(resourceTypes(TODO), resourceMain, "using System.Collections.Generic;\nusing System.Globalization;\nusing System.Reflection;\nusing System.Text;"),
      solution: PROGRAM_WITH(resourceTypes(resourceSolution), resourceMain, "using System.Collections.Generic;\nusing System.Globalization;\nusing System.Reflection;\nusing System.Text;"),
      expectedOutput:
        "uk-UA: Вітаємо / Кошик / Checkout / [Missing]\nuk: Привіт / Кошик / Checkout / [Missing]\nde-AT: Hello / Warenkorb / Checkout / [Missing]\nfr-FR: Hello / Cart / Checkout / [Missing]\nShop.Core 2.1.0.7 major=2 culture=''\n",
    }),
  ],
};
