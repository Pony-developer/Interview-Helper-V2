## Як рантайм знаходить збірки

Коли код уперше торкається типу зі збірки, на яку посилається, рантайм мусить **розв'язати** це посилання:

1. Він дивиться в `.deps.json` застосунку, де перелічено кожну залежність і де вона лежить (тека застосунку, кеш NuGet для `dotnet run`, пакети рантайму).
2. Збірки фреймворку беруться зі спільної теки фреймворку (або з теки застосунку, якщо він self-contained).
3. Якщо нічого не підійшло, подія `AssemblyLoadContext.Resolving` дає вашому коду останній шанс; інакше ви отримаєте `FileNotFoundException: Could not load file or assembly`.

У .NET Core **немає GAC** і перенаправлень зв'язування; їх замінюють deps-файл і шляхи пошуку.

## AssemblyLoadContext (ALC)

`AssemblyLoadContext` — **область** для завантажених збірок. Кожна збірка живе рівно в одному ALC, і кожен ALC може мати власну версію залежності.

- `AssemblyLoadContext.Default`: куди завантажуються застосунок і його залежності. Збірки звідси ніколи не вивантажуються.
- Власні ALC: для плагінів, скриптів, гарячого перезавантаження модулів.

```csharp
class PluginLoadContext : AssemblyLoadContext
{
    private readonly AssemblyDependencyResolver _resolver;

    public PluginLoadContext(string pluginPath) : base(isCollectible: true)
        => _resolver = new AssemblyDependencyResolver(pluginPath);   // читає .deps.json плагіна

    protected override Assembly? Load(AssemblyName name)
    {
        string? path = _resolver.ResolveAssemblyToPath(name);
        return path != null ? LoadFromAssemblyPath(path) : null;     // null → відкат до Default (спільні контракти)
    }
}

var ctx = new PluginLoadContext(@"plugins\Pricing\Pricing.dll");
Assembly asm = ctx.LoadFromAssemblyPath(Path.GetFullPath(@"plugins\Pricing\Pricing.dll"));
var plugin = (IPricingPlugin)Activator.CreateInstance(asm.GetType("Pricing.DiscountPlugin")!)!;
```

## Спільні типи між хостом і плагіном

Хост і плагін мають домовитися про **той самий** тип `IPricingPlugin`. Якщо контекст плагіна завантажить власну копію збірки контрактів, типи будуть різними (та сама назва, різні ALC), і приведення впаде з `InvalidCastException`. Перевизначений `Load` вище повертає `null` для збірок, яких плагін не постачає, тож спільна збірка контрактів розв'язується з контексту за замовчуванням.

## Вивантаження

Створіть ALC з `isCollectible: true` і викличте `Unload()`. Збірки справді звільняються лише тоді, коли на жоден їхній тип, об'єкт чи делегат більше ніщо не посилається (`WeakReference` на контекст допомагає перевірити це в тестах). Статичні кеші, підписки на події та потоки в плагіні не дають вивантажити його.

## Інші способи завантаження

```csharp
Assembly.Load(new AssemblyName("Shop.Pricing"));      // за ім'ям, через звичайне розв'язання
Assembly.LoadFrom(path);                              // за шляхом у контекст за замовчуванням
Assembly.Load(File.ReadAllBytes(path));               // з байтів: без блокування файлу, без розташування
AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
AppDomain.CurrentDomain.GetAssemblies();              // усе, що вже завантажено
```

Створення `AppDomain` у .NET Core не підтримується; їх замінюють ALC (для ізоляції коду) та окремі процеси (для ізоляції збоїв і безпеки).

## Що сказати на співбесіді

- Рантайм розв'язує посилання через `.deps.json`; у .NET Core немає GAC.
- `AssemblyLoadContext` ізолює плагіни та версії їхніх залежностей; collectible-контексти можна вивантажити.
- Спільні типи-контракти беріть із контексту за замовчуванням, інакше приведення між контекстами впадуть.
