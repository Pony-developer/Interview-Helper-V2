## Guid

`Guid` — 128-бітне значення, що практично глобально унікальне без жодної координації.

```csharp
Guid id = Guid.NewGuid();                  // випадковий (версія 4)
string text = id.ToString();               // "3f2504e0-4f89-11d3-9a0c-0305e82c3301"
id.ToString("N");                          // без дефісів
Guid parsed = Guid.Parse(text);
bool ok = Guid.TryParse(input, out var g);
Guid.Empty;                                // усі нулі
```

- Це **структура** (16 байтів) з рівністю за значенням.
- Випадкові GUID — погані **кластеризовані** ключі в базі: вставки потрапляють у різні місця індексу, спричиняючи розщеплення сторінок. Коли важлива швидкість вставки, беріть послідовні GUID (`NEWSEQUENTIALID()` у SQL Server чи впорядковані за часом GUID «версії 7») або цілі ключі.
- GUID унікальний, але не секретний: не використовуйте його як токен безпеки. Для цього є `RandomNumberGenerator`.

## Допоміжні методи enum

```csharp
Enum.GetValues<DayOfWeek>();                   // узагальнене перевантаження .NET 5+
Enum.GetNames<DayOfWeek>();
Enum.IsDefined(typeof(DayOfWeek), 7);          // False
Enum.Parse<DayOfWeek>("friday", ignoreCase: true);
Enum.TryParse("Monday, Sunday", out DayOfWeek d);   // розбір у стилі прапорців
DayOfWeek.Friday.ToString("D");                // "5"
Convert.ToInt32(DayOfWeek.Friday);             // 5
Enum.GetUnderlyingType(typeof(DayOfWeek));     // System.Int32
```

Enum — це структури, що походять від `System.Enum`. В узагальненому коді `where T : struct, Enum` (C# 7.3) обмежує `T` типами enum.

## Console

```csharp
Console.Write("Name: ");
string? name = Console.ReadLine();
Console.ForegroundColor = ConsoleColor.Green;
Console.Error.WriteLine("errors go to stderr");
Console.SetOut(new StringWriter());            // перенаправити вивід (корисно в тестах)
```

`Console.Out` і `Console.Error` — це `TextWriter`, тож усе, що пише в `TextWriter`, може писати в консоль.

## Environment

```csharp
Environment.MachineName;
Environment.ProcessorCount;
Environment.OSVersion;
Environment.Is64BitProcess;
Environment.NewLine;                            // "\r\n" у Windows, "\n" у Linux
Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
Environment.CurrentDirectory;
Environment.ExitCode = 2;                       // код виходу, коли Main повертає void
Environment.TickCount64;                        // мс від запуску: дешевий майже монотонний годинник
```

`RuntimeInformation` (`System.Runtime.InteropServices`) повідомляє ОС і рантайм: `RuntimeInformation.IsOSPlatform(OSPlatform.Linux)`, `RuntimeInformation.FrameworkDescription`. У .NET 5+ простіше `OperatingSystem.IsWindows()`.

## Process

```csharp
var psi = new ProcessStartInfo("git", "status --short")
{
    RedirectStandardOutput = true,
    UseShellExecute = false,      // обов'язково для перенаправлення виводу
};
using var p = Process.Start(psi)!;
string output = p.StandardOutput.ReadToEnd();
p.WaitForExit();
Console.WriteLine($"exit {p.ExitCode}: {output}");
```

Коли перенаправляєте і stdout, і stderr, читайте їх асинхронно (чи паралельно через `ReadToEndAsync`): якщо буфер одного каналу заповниться, поки ви заблоковані на читанні іншого, дочірній процес зависне.

## AppContext

`AppContext.BaseDirectory` — тека, з якої запущено застосунок (надійніше за поточну теку). `AppContext.SetSwitch` / `TryGetSwitch` перемикають режими сумісності рантайму.

## Що сказати на співбесіді

- `Guid` — структура на 16 байтів; випадкові GUID фрагментують кластеризовані індекси.
- `Environment`, `RuntimeInformation`, `OperatingSystem` описують, де виконується код.
- `Process` з перенаправленим виводом потребує `UseShellExecute = false` і обережності, щоб уникнути взаємоблокування каналів.
