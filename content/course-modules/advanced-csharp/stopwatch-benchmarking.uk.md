## Stopwatch

```csharp
var sw = Stopwatch.StartNew();
DoWork();
sw.Stop();
Console.WriteLine($"{sw.ElapsedMilliseconds} ms ({sw.Elapsed.TotalMilliseconds:0.000})");

long start = Stopwatch.GetTimestamp();                 // без алокації
DoWork();
TimeSpan elapsed = Stopwatch.GetElapsedTime(start);    // .NET 7; раніше: (end - start) / Stopwatch.Frequency
```

`Stopwatch` використовує **монотонний** лічильник продуктивності ОС високої роздільності (`Stopwatch.IsHighResolution`, `Stopwatch.Frequency`). На нього не впливають коригування годинника (синхронізація NTP, літній час, користувач, що змінив час), через які віднімання `DateTime.Now` ненадійне для вимірювань.

## Чому одне вимірювання бреше

Одноразове вимірювання методу .NET змішує купу шуму:

- **JIT-компіляцію** під час першого виклику (і багаторівневу перекомпіляцію згодом);
- холодні кеші процесора й передбачувачі переходів;
- **паузи GC**, спричинені алокаціями, можливо, з іншого коду;
- інші процеси, зміну частоти процесора, тротлінг через перегрів;
- Debug-збірки та під'єднаний налагоджувач, що вимикають оптимізації;
- оптимізатор, що прибирає роботу, результат якої ніде не використовується («усунення мертвого коду»).

## Правильний бенчмарк: BenchmarkDotNet

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

// у Main (Release-збірка!): BenchmarkRunner.Run<ConcatBenchmarks>();
```

Він запускає кожен бенчмарк в окремому процесі, прогріває, автоматично добирає кількість ітерацій, прибирає викиди, звітує про середнє/похибку/стандартне відхилення, а з `[MemoryDiagnoser]` — про **виділені байти** і кількість збирань GC на операцію. Повертайте результати з методів бенчмарку, щоб JIT не міг прибрати роботу.

## Вимірювання в продакшні

- Використовуйте **метрики**, а не разові секундоміри: гістограми `System.Diagnostics.Metrics` (.NET 6) або вбудовані в ASP.NET Core метрики тривалості запитів, що експортуються через OpenTelemetry чи `dotnet-counters`.
- Звітуйте **перцентилі** (p50, p95, p99), а не лише середні: середнє 20 мс може ховати p99 у 2 секунди.
- Тримайте код вимірювань тестованим: впроваджуйте годинник (`TimeProvider` у .NET 8 або власний інтерфейс), як у практиці цього модуля.

## Що сказати на співбесіді

- `Stopwatch` = висока роздільність, монотонність; використовуйте його (чи `GetTimestamp`) для вимірювань, ніколи різницю `DateTime.Now`.
- Поодинокі вимірювання тонуть у шумі JIT, GC і кешування; беріть BenchmarkDotNet у Release.
- У продакшні відстежуйте перцентилі через метрики.
