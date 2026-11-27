## Одночасне виконання

```csharp
// послідовно: загальний час = сума
var user = await GetUserAsync(id);
var orders = await GetOrdersAsync(id);

// одночасно: запустити обидві, потім очікувати; загальний час = максимум
Task<User> userTask = GetUserAsync(id);
Task<List<Order>> ordersTask = GetOrdersAsync(id);
await Task.WhenAll(userTask, ordersTask);
var (user2, orders2) = (userTask.Result, ordersTask.Result);   // безпечно: обидві завершені
```

Задача стартує, коли асинхронний метод **викликають**, а не коли на нього чекають. Тож «запустити кілька, очікувати пізніше» дає конкурентність без жодних додаткових потоків.

Обережно з EF Core: один `DbContext` не підтримує одночасних операцій; використовуйте окремі контексти.

## WhenAll і WhenAny

- `Task.WhenAll(tasks)` завершується, коли завершилися всі задачі; якщо деякі впали, він завершується з помилкою, що містить **усі** їхні винятки (`await` кидає перший; решту дивіться в `task.Exception.InnerExceptions`).
- `Task.WhenAny(tasks)` завершується, коли завершилася **перша** задача (успішно чи ні), і повертає її. Типові застосування: тайм-аути, «перемагає перший», обробка результатів у міру готовності:

```csharp
var pending = urls.Select(u => client.GetStringAsync(u)).ToList();
while (pending.Count > 0)
{
    Task<string> done = await Task.WhenAny(pending);
    pending.Remove(done);
    Console.WriteLine((await done).Length);      // await, щоб спостерегти успіх чи виняток
}
```

## ValueTask<T>

`Task<T>` — клас: кожен асинхронний метод, що його повертає, алокує. `ValueTask<T>` — структура, що обгортає або готовий результат, або задачу, тож метод, що **часто завершується синхронно** (влучання в кеш, дані вже в буфері), уникає алокації:

```csharp
public ValueTask<Product> GetAsync(int id) =>
    _cache.TryGetValue(id, out var p) ? new ValueTask<Product>(p) : new ValueTask<Product>(LoadAsync(id));
```

Правила: очікуйте `ValueTask` **один раз**; не очікуйте одночасно; не викликайте `.Result` до завершення. Якщо потрібно більше, викличте `.AsTask()`. За замовчуванням беріть `Task`, а `ValueTask` — для виміряних гарячих шляхів.

## Асинхронні потоки (C# 8)

```csharp
public async IAsyncEnumerable<Order> StreamOrdersAsync([EnumeratorCancellation] CancellationToken ct = default)
{
    int page = 0;
    while (true)
    {
        var batch = await _api.GetPageAsync(page++, ct);
        if (batch.Count == 0) yield break;
        foreach (var o in batch) yield return o;
    }
}

await foreach (var order in StreamOrdersAsync().WithCancellation(ct))
    Process(order);
```

Вони поєднують ітератори та async: кожен елемент може потребувати очікування. Їх видають `AsAsyncEnumerable()` в EF Core, потоковий gRPC і `Channel<T>.Reader.ReadAllAsync()`.

## Поширені пастки

| Пастка | Виправлення |
| --- | --- |
| `.Result` / `.Wait()` на асинхронному коді | `await`; async до самого верху |
| методи `async void` (крім обробників подій) | повертати `Task` |
| забутий `await` (випадковий «запустив і забув») | очікувати його або свідомо запускати з логуванням помилок |
| `Task.Run` навколо асинхронного I/O на сервері | викликати асинхронний API напряму |
| `CancellationToken` не передається вниз | передавати в кожен виклик |
| `list.ForEach(async x => ...)` | `foreach` з `await` або `Task.WhenAll` |
| необмежений `Task.WhenAll` по тисячах елементів | обмежити через `SemaphoreSlim` або `Parallel.ForEachAsync` (.NET 6) |
| код, прив'язаний до потоку, після `await` (дані thread-local, блокування `Monitor`, що тримаються через await) | не тримати блокування через `await`; використовувати `SemaphoreSlim.WaitAsync` |

## Що сказати на співбесіді

- Щоб виконати задачі одночасно, спершу запускайте, потім очікуйте; `WhenAll` збирає результати й помилки.
- `ValueTask<T>` заощаджує алокації на синхронних швидких шляхах; очікуйте його один раз.
- `IAsyncEnumerable<T>` + `await foreach` асинхронно передають елементи потоком.
