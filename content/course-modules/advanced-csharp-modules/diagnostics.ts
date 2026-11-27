import { PROGRAM_WITH } from "../csharp-code";
import { question } from "../frontend-interview-modules/quiz";
import type { ModuleDef } from "../types";
import { lecture, practice, quiz, TODO } from "./shared";

const metricsTypes = (body: string) => `// A clock abstraction so timing code can be tested deterministically.
interface IClock { long ElapsedMilliseconds { get; } }

class FakeClock : IClock
{
    public long ElapsedMilliseconds { get; private set; }
    public void Advance(long ms) { ElapsedMilliseconds += ms; }
}

// Records durations per operation name and reports statistics.
class Metrics
{
    private readonly IClock _clock;
    private readonly Dictionary<string, List<long>> _samples = new Dictionary<string, List<long>>();

    public Metrics(IClock clock) { _clock = clock; }

    // Returns a scope: the time between Measure(...) and Dispose() is recorded under 'name'.
    public IDisposable Measure(string name)
    {
${body.split("@@")[0]}
    }

    public void Record(string name, long ms)
    {
        List<long> list;
        if (!_samples.TryGetValue(name, out list)) _samples[name] = list = new List<long>();
        list.Add(ms);
    }

    // One line per operation, sorted by name: "name: n=3 min=10 max=40 avg=20 p50=10".
    // avg is rounded down; p50 is the element at index (n - 1) / 2 of the sorted samples.
    public IEnumerable<string> Report()
    {
${body.split("@@")[1]}
    }
}`;

const metricsSolution = `        return new Scope(this, name, _clock);
    }

    private sealed class Scope : IDisposable
    {
        private readonly Metrics _owner;
        private readonly string _name;
        private readonly IClock _clock;
        private readonly long _start;
        private bool _done;

        public Scope(Metrics owner, string name, IClock clock)
        {
            _owner = owner; _name = name; _clock = clock; _start = clock.ElapsedMilliseconds;
        }

        public void Dispose()
        {
            if (_done) return;
            _done = true;
            _owner.Record(_name, _clock.ElapsedMilliseconds - _start);
        }@@        foreach (var name in _samples.Keys.OrderBy(k => k, StringComparer.Ordinal))
        {
            var s = _samples[name].OrderBy(x => x).ToList();
            yield return name + ": n=" + s.Count + " min=" + s[0] + " max=" + s[s.Count - 1]
                + " avg=" + (s.Sum() / s.Count) + " p50=" + s[(s.Count - 1) / 2];
        }`;

const metricsMain = `        var clock = new FakeClock();
        var metrics = new Metrics(clock);
        foreach (var ms in new long[] { 40, 10, 10 })
        {
            using (metrics.Measure("db.query")) clock.Advance(ms);
        }
        using (metrics.Measure("http.get"))
        {
            clock.Advance(100);
            using (metrics.Measure("json.parse")) clock.Advance(5);
            clock.Advance(20);
        }
        var scope = metrics.Measure("cache.get");
        clock.Advance(1);
        scope.Dispose();
        clock.Advance(50);
        scope.Dispose();                 // a second Dispose must not record again
        foreach (var line in metrics.Report()) Console.WriteLine(line);`;

export const diagnosticsModule: ModuleDef = {
  slug: "diagnostics",
  title: { en: "Diagnostics", uk: "Діагностика" },
  slides: [
    lecture("debug-trace", "Conditional compilation, Debug and Trace", "Умовна компіляція, Debug і Trace"),
    lecture("debugger-stacktrace", "Debugger integration, processes and stack traces", "Інтеграція з налагоджувачем, процеси та стек викликів"),
    lecture("stopwatch-benchmarking", "Measuring time: Stopwatch and benchmarking", "Вимірювання часу: Stopwatch і бенчмарки"),
    lecture("cross-platform-diagnostics", "Cross-platform tools, EventSource and Activity", "Кросплатформні інструменти, EventSource та Activity"),
    quiz("diagnostics-quiz", "Diagnostics", "Діагностика", [
      question(
        "debug-release",
        ["What happens to `Debug.WriteLine(\"x\")` calls in a Release build?", "Що відбувається з викликами `Debug.WriteLine(\"x\")` у Release-збірці?"],
        [
          ["They write to the console", "Вони пишуть у консоль"],
          ["They are removed by the compiler because `Debug` methods are marked `[Conditional(\"DEBUG\")]`", "Компілятор їх видаляє, бо методи `Debug` позначені `[Conditional(\"DEBUG\")]`"],
          ["They throw", "Вони кидають виняток"],
          ["They run but output is buffered", "Вони виконуються, але вивід буферизується"],
        ],
        "b",
      ),
      question(
        "stopwatch",
        ["Why use `Stopwatch` instead of subtracting `DateTime.Now` values?", "Чому для вимірювань `Stopwatch`, а не різниця значень `DateTime.Now`?"],
        [
          ["`Stopwatch` uses a high-resolution monotonic timer unaffected by clock changes; `DateTime.Now` has coarser resolution and can jump", "`Stopwatch` використовує монотонний таймер високої роздільності, на який не впливають зміни годинника; `DateTime.Now` грубіший і може стрибати"],
          ["`DateTime.Now` is not allowed in loops", "`DateTime.Now` заборонено в циклах"],
          ["`Stopwatch` runs on another thread", "`Stopwatch` працює в іншому потоці"],
          ["There is no difference", "Різниці немає"],
        ],
        "a",
      ),
      question(
        "benchmark",
        ["Which are good benchmarking practices?", "Що з цього — добрі практики бенчмаркінгу?"],
        [
          ["Measure a Release build", "Вимірювати Release-збірку"],
          ["Warm up before measuring (JIT, tiered compilation, caches)", "Прогрівати перед вимірюванням (JIT, багаторівнева компіляція, кеші)"],
          ["Run many iterations and look at the distribution, e.g. with BenchmarkDotNet", "Робити багато ітерацій і дивитися на розподіл, наприклад через BenchmarkDotNet"],
          ["Measure once with the debugger attached", "Виміряти один раз під налагоджувачем"],
        ],
        ["a", "b", "c"],
      ),
      question(
        "debuggerdisplay",
        ["What does `[DebuggerDisplay(\"{Id}: {Name}\")]` do?", "Що робить `[DebuggerDisplay(\"{Id}: {Name}\")]`?"],
        [
          ["Logs every access to the object", "Логує кожне звернення до об'єкта"],
          ["Changes `ToString()`", "Змінює `ToString()`"],
          ["Controls how the object is shown in debugger windows, without affecting runtime behavior", "Керує тим, як об'єкт показано у вікнах налагоджувача, не впливаючи на поведінку під час виконання"],
          ["Breaks into the debugger", "Зупиняє виконання в налагоджувачі"],
        ],
        "c",
      ),
      question(
        "dotnet-counters",
        ["You suspect a production .NET 6 service on Linux has a memory leak. Which tool gives a live view of GC heap size and collection counts?", "Ви підозрюєте витік пам'яті в продакшн-сервісі .NET 6 на Linux. Який інструмент покаже наживо розмір купи GC і кількість збирань?"],
        [
          ["Windows Performance Monitor", "Windows Performance Monitor"],
          ["The Windows Event Log", "Журнал подій Windows"],
          ["`Debug.Assert`", "`Debug.Assert`"],
          ["`dotnet-counters monitor`", "`dotnet-counters monitor`"],
        ],
        "d",
      ),
      question(
        "activity",
        ["What is `System.Diagnostics.Activity` used for?", "Для чого `System.Diagnostics.Activity`?"],
        [
          ["Distributed tracing: it carries a trace id and span id across async calls and services (the basis of OpenTelemetry in .NET)", "Розподілене трасування: він несе trace id та span id через асинхронні виклики й сервіси (основа OpenTelemetry у .NET)"],
          ["Starting background threads", "Запуск фонових потоків"],
          ["Measuring CPU temperature", "Вимірювання температури процесора"],
          ["Reading the Windows Event Log", "Читання журналу подій Windows"],
        ],
        "a",
      ),
      question(
        "stacktrace",
        ["How can code find out which method called it?", "Як код може дізнатися, який метод його викликав?"],
        [
          ["Only with a debugger", "Лише з налагоджувачем"],
          ["`new StackTrace().GetFrame(1).GetMethod()` at run time (slow), or `[CallerMemberName]` at compile time (free)", "`new StackTrace().GetFrame(1).GetMethod()` під час виконання (повільно) або `[CallerMemberName]` під час компіляції (безкоштовно)"],
          ["`Environment.CurrentMethod`", "`Environment.CurrentMethod`"],
          ["It's impossible in .NET", "У .NET це неможливо"],
        ],
        "b",
      ),
    ]),
    practice("metrics-practice", "Timing scopes and statistics", "Області вимірювання часу та статистика", {
      starter: PROGRAM_WITH(metricsTypes(`${TODO}@@${TODO}`), metricsMain, "using System.Collections.Generic;\nusing System.Linq;"),
      solution: PROGRAM_WITH(metricsTypes(metricsSolution), metricsMain, "using System.Collections.Generic;\nusing System.Linq;"),
      expectedOutput:
        "cache.get: n=1 min=1 max=1 avg=1 p50=1\ndb.query: n=3 min=10 max=40 avg=20 p50=10\nhttp.get: n=1 min=125 max=125 avg=125 p50=125\njson.parse: n=1 min=5 max=5 avg=5 p50=5\n",
    }),
  ],
};
