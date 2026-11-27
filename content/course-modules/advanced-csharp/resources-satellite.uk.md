## Вбудовані ресурси

Будь-який файл можна вбудувати в збірку:

```xml
<ItemGroup>
  <EmbeddedResource Include="Sql\CreateTables.sql" />
</ItemGroup>
```

```csharp
Assembly asm = typeof(Program).Assembly;
foreach (string n in asm.GetManifestResourceNames()) Console.WriteLine(n);   // "Shop.Core.Sql.CreateTables.sql"
using Stream s = asm.GetManifestResourceStream("Shop.Core.Sql.CreateTables.sql")!;
using var reader = new StreamReader(s);
string sql = reader.ReadToEnd();
```

Ім'я ресурсу — `<простір імен за замовчуванням>.<шлях до теки через крапки>.<ім'я файлу>`. Перелік імен — найшвидший спосіб розібратися, чому потік `null`.

## Файли .resx і ResourceManager

Для рядків, що локалізуються, використовуйте файли `.resx`: XML-таблиці пар ключ/значення, що компілюються в блоби `.resources`.

```
Resources/Strings.resx          ← нейтральні (запасні) рядки, в основній збірці
Resources/Strings.uk.resx       ← українська
Resources/Strings.uk-UA.resx    ← українська, перевизначення специфічні для України
Resources/Strings.de.resx       ← німецька
```

Visual Studio генерує строго типізований клас (`Strings.Greeting`), або ви використовуєте `ResourceManager` напряму:

```csharp
var rm = new ResourceManager("Shop.Core.Resources.Strings", typeof(Program).Assembly);
string text = rm.GetString("Greeting", new CultureInfo("uk-UA"))!;
```

## Сателітні збірки

Файли `.resx` для конкретних культур компілюються в **сателітні збірки**: DLL лише з ресурсами, розміщені в підтеках з назвами культур:

```
bin/Shop.Core.dll
bin/uk/Shop.Core.resources.dll
bin/uk-UA/Shop.Core.resources.dll
bin/de/Shop.Core.resources.dll
```

Додати чи оновити мову можна, постачивши нову сателітну збірку, без перекомпіляції основної.

## Ланцюжок відкату

`ResourceManager` шукає ключ уздовж **ланцюжка батьківських культур** `CultureInfo.CurrentUICulture` (або переданої культури):

```
uk-UA  →  uk  →  інваріантна (нейтральні ресурси в основній збірці)
```

Тож перекладати треба лише відмінності: більшість українських рядків покладіть в `uk`, а в `uk-UA` — лише специфічні для України. `[assembly: NeutralResourcesLanguage("en")]` каже рантайму, що нейтральні ресурси англійські, тож він не шукатиме сателітну збірку `en`.

## Локалізація в ASP.NET Core

ASP.NET Core загортає це в `IStringLocalizer<T>`, а middleware культури запиту обирає культуру з URL, cookie чи заголовка `Accept-Language`:

```csharp
builder.Services.AddLocalization(o => o.ResourcesPath = "Resources");
app.UseRequestLocalization("en", "uk", "de");

public class HomeController(IStringLocalizer<HomeController> t) { public string Hi() => t["Greeting"]; }
```

Пам'ятайте різницю: `CurrentUICulture` обирає **ресурси** (мову), `CurrentCulture` — **форматування** (числа, дати).

## Що сказати на співбесіді

- Вбудовані ресурси читаються через `GetManifestResourceStream`; ім'я включає простір імен і теки.
- Локалізовані файли `.resx` компілюються в сателітні збірки в теках з назвами культур.
- Пошук відкочується від конкретних культур до нейтральних і зрештою до основної збірки.
