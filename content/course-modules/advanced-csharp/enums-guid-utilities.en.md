## Guid

A `Guid` is a 128-bit value that is, for practical purposes, globally unique without any coordination.

```csharp
Guid id = Guid.NewGuid();                  // random (version 4)
string text = id.ToString();               // "3f2504e0-4f89-11d3-9a0c-0305e82c3301"
id.ToString("N");                          // no dashes
Guid parsed = Guid.Parse(text);
bool ok = Guid.TryParse(input, out var g);
Guid.Empty;                                // all zeros
```

- It's a **struct** (16 bytes) with value equality.
- Random GUIDs make poor **clustered** database keys: inserts land all over the index, causing page splits. Use sequential GUIDs (SQL Server `NEWSEQUENTIALID()`, or time-ordered "version 7" GUIDs) or integer keys when insert performance matters.
- A GUID is unique, not secret: don't use it as a security token. Use `RandomNumberGenerator` for that.

## Enum helpers

```csharp
Enum.GetValues<DayOfWeek>();                   // .NET 5+ generic overload
Enum.GetNames<DayOfWeek>();
Enum.IsDefined(typeof(DayOfWeek), 7);          // False
Enum.Parse<DayOfWeek>("friday", ignoreCase: true);
Enum.TryParse("Monday, Sunday", out DayOfWeek d);   // flags-style parsing
DayOfWeek.Friday.ToString("D");                // "5"
Convert.ToInt32(DayOfWeek.Friday);             // 5
Enum.GetUnderlyingType(typeof(DayOfWeek));     // System.Int32
```

Enums are structs deriving from `System.Enum`. In generic code, `where T : struct, Enum` (C# 7.3) constrains `T` to enum types.

## Console

```csharp
Console.Write("Name: ");
string? name = Console.ReadLine();
Console.ForegroundColor = ConsoleColor.Green;
Console.Error.WriteLine("errors go to stderr");
Console.SetOut(new StringWriter());            // redirect output (useful in tests)
```

`Console.Out` and `Console.Error` are `TextWriter`s, so anything that writes to a `TextWriter` can write to the console.

## Environment

```csharp
Environment.MachineName;
Environment.ProcessorCount;
Environment.OSVersion;
Environment.Is64BitProcess;
Environment.NewLine;                            // "\r\n" on Windows, "\n" on Linux
Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
Environment.CurrentDirectory;
Environment.ExitCode = 2;                       // exit code when Main returns void
Environment.TickCount64;                        // ms since startup: cheap monotonic-ish clock
```

`RuntimeInformation` (`System.Runtime.InteropServices`) tells you the OS and runtime: `RuntimeInformation.IsOSPlatform(OSPlatform.Linux)`, `RuntimeInformation.FrameworkDescription`. In .NET 5+ `OperatingSystem.IsWindows()` is simpler.

## Process

```csharp
var psi = new ProcessStartInfo("git", "status --short")
{
    RedirectStandardOutput = true,
    UseShellExecute = false,      // required to redirect output
};
using var p = Process.Start(psi)!;
string output = p.StandardOutput.ReadToEnd();
p.WaitForExit();
Console.WriteLine($"exit {p.ExitCode}: {output}");
```

When redirecting both stdout and stderr, read them asynchronously (or with `ReadToEndAsync` in parallel): if one pipe's buffer fills up while you're blocked reading the other, the child process deadlocks.

## AppContext

`AppContext.BaseDirectory` is the folder the app runs from (more reliable than the current directory). `AppContext.SetSwitch` / `TryGetSwitch` toggle runtime compatibility behaviors.

## Interview takeaways

- `Guid` is a 16-byte struct; random GUIDs fragment clustered indexes.
- `Environment`, `RuntimeInformation`, `OperatingSystem` describe where the code runs.
- `Process` with redirected output needs `UseShellExecute = false` and care to avoid pipe deadlocks.
