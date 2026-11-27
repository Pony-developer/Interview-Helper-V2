## Спершу виміряйте (П126)

```csharp
[MemoryDiagnoser]
public class JoinBenchmarks
{
    private readonly string[] _words = Enumerable.Range(0, 1000).Select(i => "w" + i).ToArray();

    [Benchmark(Baseline = true)]
    public string Concat() { var s = ""; foreach (var w in _words) s += w; return s; }

    [Benchmark]
    public string Builder() { var sb = new StringBuilder(); foreach (var w in _words) sb.Append(w); return sb.ToString(); }

    [Benchmark]
    public string Join() => string.Join("", _words);
}
// dotnet run -c Release  →  таблиця з Mean, Error, Allocated для кожного методу
```

BenchmarkDotNet запускає Release-збірку в окремому процесі, прогріває, чекає, доки багаторівневий JIT дійде до оптимізованого коду, виконує багато ітерацій і звітує статистику та виділення пам'яті. `Stopwatch` навколо одного виклику в Debug переважно вимірює JIT.

Чи впливає вимірювання на продуктивність? Так: інструментувальні профайлери додають накладні витрати до кожного виклику; семплювальні — менше, але вони статистичні; трасування подій має ціну; навіть логування часу виділяє пам'ять. Міряйте в умовах, близьких до продакшну (Release, реальні обсяги даних, реалістична конкурентність), і підтверджуйте в продакшні метриками з малими накладними витратами (`dotnet-counters`, OpenTelemetry).

## Куди йде час? (П128)

| Симптом | Імовірне вузьке місце | Інструмент |
|---|---|---|
| Високий CPU, повільно | алгоритм, гарячі цикли, regex, серіалізація, LINQ у тісних циклах | `dotnet-trace` / PerfView / профайлер VS (семплювання CPU) |
| Низький CPU, повільно | очікування: БД, HTTP, блокування, голодування пулу потоків | розподілене трасування, `dotnet-counters` (черга пулу), дампи |
| Пам'ять стабільно росте | витік: статичні кеші, події, таймери, захоплені замикання | `dotnet-gcdump` / dotMemory, порівняння двох знімків |
| Високий % GC / багато Gen 2 | швидкість виділень, «текучка» в LOH, об'єкти середнього віку | `dotnet-counters` (`gc-heap-size`, `alloc-rate`, `time-in-gc`), профайлер виділень |
| Стрибки затримки | паузи GC, конкуренція за блокування, холодні старти, «шумні сусіди» | трейси з подіями GC і конкуренції |

## Менше пам'яті й менше трафіку пам'яті

```csharp
// 1. Не виділяйте непотрібного
int count = line.AsSpan().Count(',');                     // замість line.Split(',').Length - 1
if (int.TryParse(span.Slice(3, 4), out var year)) { }     // розбір зрізу без підрядка

// 2. Перевикористовуйте буфери
byte[] buffer = ArrayPool<byte>.Shared.Rent(64 * 1024);
try { /* використати buffer */ } finally { ArrayPool<byte>.Shared.Return(buffer); }

// 3. Потоково замість завантаження всього
await foreach (var row in db.Orders.AsAsyncEnumerable()) { … }
await JsonSerializer.SerializeAsync(response.Body, items);

// 4. Задавайте розмір колекцій
var map = new Dictionary<int, Customer>(customers.Count);

// 5. Уникайте прихованих виділень
static int Twice(int x) => x * 2;              // статичні лямбди / групи методів: без замикання
string s = $"{id}:{name}";                     // сучасні обробники інтерполяції: id не упаковується
foreach (var x in list) { }                    // структурний енумератор List<T>, без виділення (на відміну від IEnumerable<T>)
```

Інші важелі: `struct`/`readonly struct` для малих гарячих даних, `stackalloc` для малих тимчасових буферів, `string.Create`, пул `StringBuilder`, `RecyclableMemoryStream`, кешування обчислених результатів з обмеженням розміру (`MemoryCache` з `SizeLimit`), `FrozenDictionary` для пошуку переважно на читання, налаштування Server GC / `GCHeapAffinitizeMask` / DATAS для сервісів.

## Витоки пам'яті в керованому коді

GC не може звільнити те, на що досі посилаються:
- статичні колекції, що лише ростуть (кеші без витіснення);
- обробники подій на довгоживучих видавцях (`static event`, `INotifyPropertyChanged` на singleton-ах);
- колбеки `Timer`, що захоплюють `this`;
- `HttpClient`, створений на кожен запит (вичерпання сокетів — використовуйте `IHttpClientFactory` або один статичний екземпляр);
- captive dependencies у DI (scoped `DbContext`, утримуваний singleton-ом, тримає живими всі відстежувані сутності);
- незвільнені `IDisposable`, що тримають нативну пам'ять чи дескриптори ОС.

Як їх знайти: зробіть два знімки купи з інтервалом у кілька хвилин під навантаженням і порівняйте їх (dotMemory, VS, `dotnet-gcdump`), подивіться, які типи ростуть, і пройдіть їхні **шляхи утримання** (хто їх тримає) до кореня.
