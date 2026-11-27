## Одиниця розгортання

**Збірка** — одиниця, яку .NET розгортає, версіонує й завантажує: зазвичай один `.dll` (бібліотека) або `.dll` за хостом `.exe` застосунку. Кожен скомпільований проєкт створює одну збірку.

Вона містить чотири види речей:

| Частина | Що містить |
| --- | --- |
| **Маніфест** | ідентичність збірки (ім'я, версія, культура, публічний ключ), перелік файлів, збірки, на які вона посилається, атрибути рівня збірки |
| **Метадані типів** | повний опис кожного типу й члена: назви, сигнатури, атрибути, видимість |
| **IL-код** | скомпільовані тіла методів, які JIT перетворює на машинний код |
| **Ресурси** | вбудовані файли: зображення, таблиці рядків `.resx`, JSON, SQL-скрипти |

Оскільки метадані описують усе, збірки **самоописові**: на DLL можна посилатися без заголовкових файлів, рефлексія може її дослідити, а рантайм перевіряє типобезпечність.

## Атрибути рівня збірки

```csharp
[assembly: InternalsVisibleTo("Shop.Core.Tests")]
[assembly: AssemblyMetadata("BuildCommit", "a1b2c3")]
```

У проєктах SDK-стилю більшість із них береться з властивостей проєкту, а не з `AssemblyInfo.cs`:

```xml
<PropertyGroup>
  <AssemblyName>Shop.Core</AssemblyName>
  <Version>2.1.0</Version>                     <!-- за замовчуванням задає версії нижче -->
  <AssemblyVersion>2.0.0.0</AssemblyVersion>
  <FileVersion>2.1.0.734</FileVersion>
  <InformationalVersion>2.1.0+a1b2c3</InformationalVersion>
</PropertyGroup>
```

## Дослідження збірок під час виконання

```csharp
Assembly me = Assembly.GetExecutingAssembly();      // збірка, що містить цей код
Assembly entry = Assembly.GetEntryAssembly()!;      // головна збірка застосунку
Assembly ofType = typeof(Order).Assembly;

Console.WriteLine(me.GetName().Name);
Console.WriteLine(me.GetName().Version);
foreach (AssemblyName r in me.GetReferencedAssemblies()) Console.WriteLine(r.FullName);
string? info = me.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion;
```

## Про багатофайлові збірки та модулі

Технічно збірка може складатися з кількох модулів, але на практиці це завжди один файл. Інструменти на кшталт ILSpy чи `ildasm` показують маніфест, таблиці метаданих і IL усередині.

## Форми розгортання

- **Framework-dependent**: ваші збірки + `.deps.json` (перелік залежностей) + `.runtimeconfig.json` (який рантайм використовувати).
- **Self-contained**: плюс сам рантайм.
- **Single-file** (`<PublishSingleFile>true</PublishSingleFile>`): усе запаковано в один виконуваний файл; деякі API, як-от `Assembly.Location`, повертають порожні рядки.
- **Trimmed** (`<PublishTrimmed>true</PublishTrimmed>`): невикористаний код видаляється; коду з інтенсивною рефлексією потрібні анотації, щоб пережити обрізання.
- **ReadyToRun / Native AOT**: заздалегідь скомпільований нативний код (див. модуль про платформу).

## Що сказати на співбесіді

- Збірка = маніфест + метадані + IL + ресурси; вона самоописова.
- `Assembly.GetExecutingAssembly`, `GetEntryAssembly`, `typeof(T).Assembly` дають об'єкти збірок.
- Розгортання буває framework-dependent, self-contained, single-file, trimmed чи AOT.
