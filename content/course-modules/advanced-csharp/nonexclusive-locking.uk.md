## Семафори: обмеження конкурентності

Семафор тримає певну кількість **дозволів**. `Wait` бере один (блокуючись, якщо їх не лишилося), `Release` повертає один. З N дозволами всередині одночасно щонайбільше N потоків.

```csharp
private static readonly SemaphoreSlim Gate = new(initialCount: 3, maxCount: 3);

public async Task<string> FetchAsync(string url, CancellationToken ct)
{
    await Gate.WaitAsync(ct);          // очікування, дружнє до async
    try
    {
        return await _http.GetStringAsync(url, ct);
    }
    finally
    {
        Gate.Release();                // завжди звільняти у finally
    }
}
```

| Тип | Примітки |
| --- | --- |
| `SemaphoreSlim` | легкий, у межах процесу, підтримує `WaitAsync`: вибір за замовчуванням |
| `Semaphore` | об'єкт ядра; може бути **іменованим**, щоб працювати між процесами; без підтримки async |

Семафор **не має власника**: звільнити його може будь-який потік. `SemaphoreSlim(1, 1)` — стандартне **асинхронне блокування**, бо `lock` не може містити `await`:

```csharp
private readonly SemaphoreSlim _mutex = new(1, 1);
public async Task SaveAsync()
{
    await _mutex.WaitAsync();
    try { await File.WriteAllTextAsync(path, Serialize()); }
    finally { _mutex.Release(); }
}
```

(Він не повторно входимий: подвійне очікування з того самого потоку виконання дає взаємоблокування.)

## Блокування читачів/писачів

Коли дані читають набагато частіше, ніж пишуть, ексклюзивне блокування змушує читачів марно стояти в черзі. `ReaderWriterLockSlim` дозволяє **багато одночасних читачів** або **одного писача**:

```csharp
private readonly ReaderWriterLockSlim _rw = new();
private readonly Dictionary<string, Product> _catalog = new();

public Product? Find(string sku)
{
    _rw.EnterReadLock();
    try { return _catalog.TryGetValue(sku, out var p) ? p : null; }
    finally { _rw.ExitReadLock(); }
}

public void Upsert(Product p)
{
    _rw.EnterWriteLock();
    try { _catalog[p.Sku] = p; }
    finally { _rw.ExitWriteLock(); }
}
```

- `EnterUpgradeableReadLock` дозволяє одному читачу згодом стати писачем, не звільняючи блокування (лише один такий читач одночасно, щоб уникнути взаємоблокувань при підвищенні).
- Рекурсія за замовчуванням вимкнена (`LockRecursionPolicy.NoRecursion`).
- На одну операцію він повільніший за `lock`, тож виграє лише тоді, коли читання довгі чи дуже часті, а записи рідкісні. Вимірюйте. Часто **незмінний знімок**, що замінюється через `Interlocked.Exchange`, або `ConcurrentDictionary` простіші й швидші.

## Конкурентні колекції замість блокувань

| Потреба | Тип |
| --- | --- |
| потокобезпечний словник | `ConcurrentDictionary<K,V>` (дрібнозернисте блокування, читання без блокувань) |
| черга виробник/споживач | `ConcurrentQueue<T>`, `BlockingCollection<T>`, `Channel<T>` (async) |
| невпорядкований мішок на потік | `ConcurrentBag<T>` |
| стек | `ConcurrentStack<T>` |

Про них — у модулі про паралельне програмування.

## Що сказати на співбесіді

- `SemaphoreSlim` обмежує конкурентність до N і працює з `await`; `SemaphoreSlim(1,1)` — асинхронне блокування.
- `ReaderWriterLockSlim` = багато читачів або один писач; виправданий лише при переважанні читань.
- Конкурентні колекції та незмінні знімки часто кращі за саморобні блокування.
