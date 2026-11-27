## Talking to the debugger

```csharp
if (Debugger.IsAttached) Console.WriteLine("running under a debugger");
Debugger.Break();          // like a breakpoint in code; offers to attach a debugger if none is attached
Debugger.Launch();         // ask to attach (Windows)
```

Attributes that shape the debugging experience without changing behavior:

| Attribute | Effect |
| --- | --- |
| `[DebuggerDisplay("{Id}: {Name}")]` | the one-line summary in watch windows and tooltips |
| `[DebuggerBrowsable(DebuggerBrowsableState.Never)]` | hide a member; `RootHidden` shows a collection's items directly |
| `[DebuggerTypeProxy(typeof(MyView))]` | show a different, friendlier object in the debugger |
| `[DebuggerStepThrough]` | step over this method instead of into it |
| `[DebuggerHidden]` / `[DebuggerNonUserCode]` | hide framework-like code from stepping and call stacks |

```csharp
[DebuggerDisplay("Order {Id} ({Lines.Count} lines, {Total,nq})")]
public class Order { /* ... */ }
```

## Processes

`System.Diagnostics.Process` inspects and controls OS processes:

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

`Process.Threads` returns **OS threads** (`ProcessThread`), which aren't the same objects as managed `Thread`s.

## StackTrace and StackFrame

```csharp
var trace = new StackTrace(fNeedFileInfo: true);
foreach (StackFrame frame in trace.GetFrames())
{
    MethodBase? m = frame.GetMethod();
    Console.WriteLine($"{m?.DeclaringType?.Name}.{m?.Name} at line {frame.GetFileLineNumber()}");
}

var fromException = new StackTrace(exception, true);
```

- Capturing a stack trace is **slow** (it walks the stack and resolves metadata). Don't do it per call in hot paths.
- File and line numbers need PDB files next to the assembly (or embedded).
- Inlining and optimizations in Release can drop or merge frames.
- For "who called me" in logging, `[CallerMemberName]`, `[CallerFilePath]`, `[CallerLineNumber]` are compile-time and free.

`Exception.StackTrace` is captured as the exception propagates; it's the string you see in logs. Since .NET Core 2.1 async stack traces are much more readable (state machine frames are cleaned up).

## Windows-only diagnostics

- **Event logs**: `EventLog.WriteEntry(source, message, EventLogEntryType.Error)` writes to the Windows Event Log (creating a source requires admin rights). In .NET 6 it's a Windows-only package.
- **Performance counters** (`PerformanceCounter`): the Windows PerfMon system. Cross-platform code uses **EventCounters** and `System.Diagnostics.Metrics` instead (next lecture).

## Interview takeaways

- `DebuggerDisplay` and friends improve debugging without changing runtime behavior.
- `Process` inspects and launches processes; redirect output with `UseShellExecute = false`.
- `StackTrace` is expensive; use caller-info attributes for cheap call-site data.
