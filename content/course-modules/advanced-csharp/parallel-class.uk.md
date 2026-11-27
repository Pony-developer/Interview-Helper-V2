## Parallel.Invoke

Виконати кілька незалежних дій паралельно й дочекатися всіх:

```csharp
Parallel.Invoke(
    () => RebuildSearchIndex(),
    () => RecalculateStatistics(),
    () => CompressOldLogs());
```

## Parallel.For і Parallel.ForEach

Паралельні версії циклів. Потік, що викликає, блокується, доки не завершиться кожна ітерація.

```csharp
Parallel.For(0, images.Length, i => images[i] = Sharpen(images[i]));

var options = new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount, CancellationToken = ct };
Parallel.ForEach(files, options, file => ProcessFile(file));
```

Ітерації виконуються **без певного порядку**, у потоках пулу (включно з потоком, що викликає). Тіло циклу має бути потокобезпечним.

## Локальний стан потоку: патерн агрегації

Накопичувати в одну спільну змінну з кожної ітерації — гонка, а блокування на кожній ітерації вбиває продуктивність. Перевантаження з **локальним станом** дає кожному робітнику власну проміжну суму й зливає їх один раз наприкінці:

```csharp
long total = 0;
Parallel.For(0, data.Length,
    localInit: () => 0L,                                        // на кожного робітника
    body: (i, loopState, subtotal) => subtotal + Score(data[i]),  // тут без блокувань
    localFinally: subtotal => Interlocked.Add(ref total, subtotal));   // раз на робітника
```

Такий самий патерн є і для `Parallel.ForEach`.

## Дострокове завершення циклу

```csharp
Parallel.ForEach(orders, (order, state) =>
{
    if (order.IsFraudulent) state.Stop();   // зупинитися якнайшвидше
    if (state.ShouldExitCurrentIteration) return;
    Check(order);
});
```

| Виклик | Значення |
| --- | --- |
| `state.Break()` | завершити всі ітерації з **меншим індексом**, ніж поточна (як послідовний `break`), пропустити пізніші |
| `state.Stop()` | зупинити все якнайшвидше |
| `ParallelLoopResult.IsCompleted` / `LowestBreakIteration` | повідомити викликачу, що сталося |

Скасування через `ParallelOptions.CancellationToken` кидає `OperationCanceledException`.

## Parallel.ForEachAsync (.NET 6)

Для **асинхронної** роботи з обмеженням конкурентності, наприклад виклику API для багатьох елементів:

```csharp
await Parallel.ForEachAsync(customerIds,
    new ParallelOptions { MaxDegreeOfParallelism = 8, CancellationToken = ct },
    async (id, token) =>
    {
        var profile = await _api.GetProfileAsync(id, token);
        await _store.SaveAsync(profile, token);
    });
```

У багатьох випадках це замінює саморобне обмеження через `SemaphoreSlim`.

## Розбиття на частини

Для дуже дешевих тіл переважають накладні витрати на кожну ітерацію. Віддавайте кожному робітнику більші шматки:

```csharp
Parallel.ForEach(Partitioner.Create(0, data.Length, rangeSize: 10_000), range =>
{
    for (int i = range.Item1; i < range.Item2; i++) data[i] = Math.Sqrt(data[i]);
});
```

## Що сказати на співбесіді

- `Parallel.Invoke` — для незалежних дій; `For`/`ForEach` — для циклів; `ForEachAsync` — для обмеженої асинхронної роботи.
- Використовуйте `localInit`/`localFinally`, щоб агрегувати без конкуренції.
- `Break` проти `Stop`; дешеву роботу розбивайте на діапазони.
