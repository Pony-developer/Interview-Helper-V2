## Stopwatch

```csharp
var sw = Stopwatch.StartNew();
DoWork();
sw.Stop();
Console.WriteLine($"{sw.ElapsedMilliseconds} ms ({sw.Elapsed.TotalMilliseconds:0.000})");

long start = Stopwatch.GetTimestamp();                 // no allocation
DoWork();
TimeSpan elapsed = Stopwatch.GetElapsedTime(start);    // .NET 7; earlier: (end - start) / Stopwatch.Frequency
```

`Stopwatch` uses the OS high-resolution, **monotonic** performance counter (`Stopwatch.IsHighResolution`, `Stopwatch.Frequency`). It's unaffected by clock adjustments (NTP sync, DST, a user changing the time), which makes `DateTime.Now` subtraction unreliable for measuring.

## Why one measurement lies

A single timing of a .NET method mixes in lots of noise:

- **JIT compilation** on the first call (and tiered recompilation later);
- cold CPU caches and branch predictors;
- **GC pauses** triggered by allocations, possibly from other code;
- other processes, CPU frequency scaling, thermal throttling;
- Debug builds and an attached debugger disabling optimizations;
- the optimizer removing work whose result is never used ("dead code elimination").

## Benchmark properly: BenchmarkDotNet

```csharp
[MemoryDiagnoser]
public class ConcatBenchmarks
{
    [Params(10, 1000)] public int N;

    [Benchmark(Baseline = true)]
    public string PlusOperator() { string s = ""; for (int i = 0; i < N; i++) s += i; return s; }

    [Benchmark]
    public string Builder() { var sb = new StringBuilder(); for (int i = 0; i < N; i++) sb.Append(i); return sb.ToString(); }
}

// in Main (Release build!): BenchmarkRunner.Run<ConcatBenchmarks>();
```

It runs each benchmark in a separate process, warms up, picks iteration counts automatically, removes outliers, reports mean/error/standard deviation, and with `[MemoryDiagnoser]` the **bytes allocated** and GC counts per operation. Return results from benchmark methods so the JIT can't eliminate the work.

## Measuring in production

- Use **metrics**, not ad-hoc stopwatches: `System.Diagnostics.Metrics` (.NET 6) histograms or the ASP.NET Core built-in request duration metrics, exported via OpenTelemetry or `dotnet-counters`.
- Report **percentiles** (p50, p95, p99), not just averages: a mean of 20 ms can hide a p99 of 2 seconds.
- Keep the measuring code testable: inject a clock (`TimeProvider` in .NET 8, or your own interface), as the practice in this module does.

## Interview takeaways

- `Stopwatch` = high-resolution, monotonic; use it (or `GetTimestamp`) for timing, never `DateTime.Now` differences.
- Single measurements are dominated by JIT, GC and caching noise; use BenchmarkDotNet in Release.
- In production, track percentiles with metrics.
