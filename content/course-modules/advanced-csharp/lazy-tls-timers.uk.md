## Лінива ініціалізація

Створюйте дорогий об'єкт лише тоді, коли він уперше знадобився, рівно один раз, навіть за конкурентного доступу:

```csharp
private readonly Lazy<ProductCatalog> _catalog = new(() => ProductCatalog.LoadFromDisk());

public ProductCatalog Catalog => _catalog.Value;   // перший доступ виконує фабрику; наступні повторно використовують результат
```

Режими потокобезпечності (`LazyThreadSafetyMode`):

| Режим | Поведінка |
| --- | --- |
| `ExecutionAndPublication` (за замовчуванням) | фабрика виконується раз; інші потоки на неї чекають |
| `PublicationOnly` | фабрику можуть виконати кілька потоків; перемагає перший результат |
| `None` | без потокобезпечності: найшвидше, для однопотокового використання |

Якщо фабрика кидає виняток, режим за замовчуванням кешує **виняток** і кидає його знову на кожен доступ; якщо має бути можлива повторна спроба, беріть `PublicationOnly`.

`LazyInitializer.EnsureInitialized(ref _field, () => new X())` робить те саме, не створюючи об'єкта `Lazy<T>`.

Класичне **блокування з подвійною перевіркою**, яке замінює `Lazy<T>`:

```csharp
private volatile Expensive? _instance;
private readonly object _gate = new();
public Expensive Instance
{
    get
    {
        if (_instance == null)
            lock (_gate)
                _instance ??= new Expensive();
        return _instance;
    }
}
```

## Локальне сховище потоку

Іноді кожному потоку потрібна **власна** копія значення (непотокобезпечний `Random` у старшому .NET, буфер, лічильник на потік):

```csharp
[ThreadStatic] private static StringBuilder? _buffer;          // ініціалізуйте ліниво: ініціалізатори полів виконуються лише раз
private static StringBuilder Buffer => _buffer ??= new StringBuilder();

private static readonly ThreadLocal<Random> _rnd = new(() => new Random(Guid.NewGuid().GetHashCode()));
int roll = _rnd.Value!.Next(1, 7);
```

Пастки: потоки пулу повторно використовуються, тож значення, локальні для потоку, **просочуються** між непов'язаними робочими елементами, якщо їх не скидати; а після `await` код може продовжитися в іншому потоці з іншим значенням.

### AsyncLocal<T>

Для даних, що мають іти за **логічним потоком виконання** через await (ідентифікатори кореляції, поточний користувач, навколишня транзакція), використовуйте `AsyncLocal<T>`:

```csharp
private static readonly AsyncLocal<string?> _correlationId = new();

public async Task HandleAsync(Request r)
{
    _correlationId.Value = r.Id;
    await Step1Async();                   // усередині _correlationId.Value досі r.Id, хоч би який потік виконував код
}
```

Значення течуть униз у викликані асинхронні методи, але зміни, зроблені всередині дочірнього, назад угору не течуть. На цьому побудовані `Activity.Current` і `IHttpContextAccessor`.

## Таймери

| Таймер | Колбек виконується в | Для чого |
| --- | --- | --- |
| `System.Threading.Timer` | пулі потоків | прості фонові такти |
| `System.Timers.Timer` | пулі потоків (або об'єкті синхронізації) | обгортка-компонент з подією `Elapsed` |
| `PeriodicTimer` (.NET 6) | очікується у вашому асинхронному циклі | сучасна асинхронна періодична робота |
| `DispatcherTimer` у WinForms/WPF | потоці UI | оновлення UI |

```csharp
using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
while (await timer.WaitForNextTickAsync(stoppingToken))
    await RefreshCacheAsync(stoppingToken);   // такти ніколи не перекриваються: наступний чекає на цей
```

Із `System.Threading.Timer` колбеки можуть **перекриватися**, якщо один триває довше за період, а таймер, на який посилається лише локальна змінна, може бути зібраний GC і перестати спрацьовувати. Тримайте посилання й звільняйте його, коли закінчили.

## Що сказати на співбесіді

- `Lazy<T>` = потокобезпечна одноразова ініціалізація; пам'ятайте, що за замовчуванням вона кешує винятки.
- `ThreadLocal<T>`/`[ThreadStatic]` = для кожного потоку; `AsyncLocal<T>` = для кожного асинхронного потоку виконання.
- Для асинхронної періодичної роботи — `PeriodicTimer`; таймери пулу потоків можуть перекриватися й мусять лишатися досяжними.
