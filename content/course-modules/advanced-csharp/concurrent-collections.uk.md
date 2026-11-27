## Конкурентні колекції

`System.Collections.Concurrent` дає колекції, якими можуть одночасно користуватися багато потоків без зовнішніх блокувань:

| Тип | Аналог | Примітки |
| --- | --- | --- |
| `ConcurrentDictionary<K,V>` | `Dictionary` | дрібнозернисті блокування для запису, читання без блокувань |
| `ConcurrentQueue<T>` | `Queue` | FIFO без блокувань |
| `ConcurrentStack<T>` | `Stack` | LIFO без блокувань |
| `ConcurrentBag<T>` | невпорядкована колекція | у кожного потоку власний локальний список; найшвидше, коли той самий потік додає й забирає |
| `BlockingCollection<T>` | обгортка | додає блокування й обмеження розміру поверх перелічених |

Це **не** універсальне прискорення: звичайний `Dictionary` під `lock` може бути швидшим при низькій конкуренції. Використовуйте їх, коли багато потоків справді ділять колекцію.

## ConcurrentDictionary: мисліть атомарними операціями

```csharp
var hits = new ConcurrentDictionary<string, int>();
hits.AddOrUpdate(url, 1, (_, count) => count + 1);           // атомарне «збільшити або вставити»
Product p = cache.GetOrAdd(sku, key => LoadProduct(key));     // отримати або створити й зберегти
bool added = sessions.TryAdd(id, session);
bool removed = sessions.TryRemove(id, out var old);
bool swapped = prices.TryUpdate(sku, newPrice, comparisonValue: oldPrice);   // compare-and-swap
```

- Не пишіть `if (!d.ContainsKey(k)) d[k] = v;`: інший потік може вставити між перевіркою й записом.
- Фабрики, передані в `GetOrAdd`/`AddOrUpdate`, виконуються **поза** внутрішнім блокуванням і під конкуренцією можуть виконатися **більше одного разу** (зберігається лише один результат). Якщо створення дороге чи має побічні ефекти, зберігайте `Lazy<T>`: `GetOrAdd(key, k => new Lazy<Product>(() => Load(k))).Value`.
- Перелічення дає приблизно миттєвий знімок; воно не кидає винятку, якщо словник одночасно змінюється.

## BlockingCollection: виробник/споживач

```csharp
using var queue = new BlockingCollection<Job>(boundedCapacity: 100);

var consumers = Enumerable.Range(0, 4).Select(_ => Task.Run(() =>
{
    foreach (Job job in queue.GetConsumingEnumerable())   // блокується, коли порожньо, закінчується після CompleteAdding
        Process(job);
})).ToArray();

foreach (var job in LoadJobs()) queue.Add(job);           // блокується, коли чекають 100 елементів (протитиск)
queue.CompleteAdding();
Task.WaitAll(consumers);
```

`BlockingCollection` блокує **потоки**, що нормально для окремих робочих потоків, але марнотратно в асинхронному коді.

## Канали: асинхронний виробник/споживач

```csharp
var channel = Channel.CreateBounded<Job>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait,
    SingleReader = false,
});

var consumer = Task.Run(async () =>
{
    await foreach (Job job in channel.Reader.ReadAllAsync(ct))
        await ProcessAsync(job, ct);
});

foreach (var job in jobs) await channel.Writer.WriteAsync(job, ct);   // чекає (await), коли повно: жодного заблокованого потоку
channel.Writer.Complete();
await consumer;
```

`System.Threading.Channels` — сучасний вибір для конвеєрів і фонових черг в ASP.NET Core (наприклад, hosted service, що вичерпує канал).

## Що сказати на співбесіді

- На `ConcurrentDictionary` використовуйте атомарні методи (`GetOrAdd`, `AddOrUpdate`, `TryUpdate`); фабрики можуть виконатися кілька разів.
- `BlockingCollection<T>` = обмежений блокуючий виробник/споживач для потоків.
- `Channel<T>` = асинхронний відповідник; віддавайте йому перевагу в асинхронному й серверному коді.
