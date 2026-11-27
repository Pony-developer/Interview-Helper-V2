## Embedded resources

Any file can be embedded into an assembly:

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

The resource name is `<default namespace>.<folder path with dots>.<file name>`. Listing the names is the quickest way to debug a `null` stream.

## .resx files and ResourceManager

For localizable strings, use `.resx` files: XML tables of key/value pairs that compile into `.resources` blobs.

```
Resources/Strings.resx          ← neutral (fallback) strings, in the main assembly
Resources/Strings.uk.resx       ← Ukrainian
Resources/Strings.uk-UA.resx    ← Ukrainian, Ukraine-specific overrides
Resources/Strings.de.resx       ← German
```

Visual Studio generates a strongly typed class (`Strings.Greeting`), or you use `ResourceManager` directly:

```csharp
var rm = new ResourceManager("Shop.Core.Resources.Strings", typeof(Program).Assembly);
string text = rm.GetString("Greeting", new CultureInfo("uk-UA"))!;
```

## Satellite assemblies

Culture-specific `.resx` files compile into **satellite assemblies**: resource-only DLLs placed in subfolders named after the culture:

```
bin/Shop.Core.dll
bin/uk/Shop.Core.resources.dll
bin/uk-UA/Shop.Core.resources.dll
bin/de/Shop.Core.resources.dll
```

You can add or update a language by shipping a new satellite, without recompiling the main assembly.

## The fallback chain

`ResourceManager` looks for a key along the **parent culture chain** of `CultureInfo.CurrentUICulture` (or the culture you pass):

```
uk-UA  →  uk  →  invariant (the neutral resources in the main assembly)
```

So you only translate what differs: put most Ukrainian strings in `uk` and only Ukraine-specific ones in `uk-UA`. `[assembly: NeutralResourcesLanguage("en")]` tells the runtime the neutral resources are English, so it doesn't look for an `en` satellite.

## ASP.NET Core localization

ASP.NET Core wraps this in `IStringLocalizer<T>`, with request-culture middleware choosing the culture from the URL, a cookie or the `Accept-Language` header:

```csharp
builder.Services.AddLocalization(o => o.ResourcesPath = "Resources");
app.UseRequestLocalization("en", "uk", "de");

public class HomeController(IStringLocalizer<HomeController> t) { public string Hi() => t["Greeting"]; }
```

Remember the distinction: `CurrentUICulture` picks **resources** (language), `CurrentCulture` picks **formatting** (numbers, dates).

## Interview takeaways

- Embedded resources are read with `GetManifestResourceStream`; the name includes the namespace and folders.
- Localized `.resx` files compile into satellite assemblies in culture-named folders.
- Lookups fall back from specific to neutral cultures and finally to the main assembly.
