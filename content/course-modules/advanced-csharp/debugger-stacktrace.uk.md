## Спілкування з налагоджувачем

```csharp
if (Debugger.IsAttached) Console.WriteLine("running under a debugger");
Debugger.Break();          // як точка зупинки в коді; пропонує під'єднати налагоджувач, якщо його немає
Debugger.Launch();         // попросити під'єднати (Windows)
```

Атрибути, що формують досвід налагодження, не змінюючи поведінки:

| Атрибут | Ефект |
| --- | --- |
| `[DebuggerDisplay("{Id}: {Name}")]` | однорядковий підсумок у вікнах спостереження й підказках |
| `[DebuggerBrowsable(DebuggerBrowsableState.Never)]` | приховати член; `RootHidden` показує елементи колекції напряму |
| `[DebuggerTypeProxy(typeof(MyView))]` | показати в налагоджувачі інший, зручніший об'єкт |
| `[DebuggerStepThrough]` | переступати метод, а не заходити в нього |
| `[DebuggerHidden]` / `[DebuggerNonUserCode]` | ховати фреймворкоподібний код від покрокового виконання й стеку викликів |

```csharp
[DebuggerDisplay("Order {Id} ({Lines.Count} lines, {Total,nq})")]
public class Order { /* ... */ }
```

## Процеси

`System.Diagnostics.Process` досліджує та керує процесами ОС:

```csharp
var me = Process.GetCurrentProcess();
Console.WriteLine($"{me.ProcessName} pid={me.Id} ws={me.WorkingSet64 / 1024 / 1024} MB threads={me.Threads.Count}");
Console.WriteLine(me.TotalProcessorTime);

foreach (var p in Process.GetProcessesByName("dotnet")) Console.WriteLine(p.Id);

using var child = Process.Start(new ProcessStartInfo("dotnet", "--version")
{
    RedirectStandardOutput = true,
    UseShellExecute = false,
})!;
Console.WriteLine(await child.StandardOutput.ReadToEndAsync());
await child.WaitForExitAsync();   // .NET 5
```

`Process.Threads` повертає **потоки ОС** (`ProcessThread`), а не ті самі об'єкти, що керовані `Thread`.

## StackTrace і StackFrame

```csharp
var trace = new StackTrace(fNeedFileInfo: true);
foreach (StackFrame frame in trace.GetFrames())
{
    MethodBase? m = frame.GetMethod();
    Console.WriteLine($"{m?.DeclaringType?.Name}.{m?.Name} at line {frame.GetFileLineNumber()}");
}

var fromException = new StackTrace(exception, true);
```

- Збирання стеку викликів **повільне** (проходить стек і розв'язує метадані). Не робіть цього на кожному виклику в гарячих місцях.
- Файли й номери рядків потребують PDB-файлів поруч зі збіркою (або вбудованих).
- Вбудовування (inlining) та оптимізації в Release можуть прибрати чи злити кадри.
- Для «хто мене викликав» у логуванні `[CallerMemberName]`, `[CallerFilePath]`, `[CallerLineNumber]` працюють під час компіляції й безкоштовні.

`Exception.StackTrace` збирається, поки виняток поширюється; це той рядок, що ви бачите в логах. З .NET Core 2.1 асинхронні стеки викликів набагато читабельніші (кадри машин станів прибрано).

## Діагностика лише для Windows

- **Журнали подій**: `EventLog.WriteEntry(source, message, EventLogEntryType.Error)` пише в журнал подій Windows (створення джерела потребує прав адміністратора). У .NET 6 це пакет лише для Windows.
- **Лічильники продуктивності** (`PerformanceCounter`): система PerfMon у Windows. Кросплатформний код натомість використовує **EventCounters** і `System.Diagnostics.Metrics` (наступна лекція).

## Що сказати на співбесіді

- `DebuggerDisplay` та компанія покращують налагодження, не змінюючи поведінку під час виконання.
- `Process` досліджує й запускає процеси; для перенаправлення виводу потрібен `UseShellExecute = false`.
- `StackTrace` дорогий; для дешевих даних про місце виклику — атрибути інформації про викликача.
