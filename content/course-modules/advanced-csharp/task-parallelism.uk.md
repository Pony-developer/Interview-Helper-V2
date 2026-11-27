## Задачі як одиниці паралельної роботи

`Task.Run` і `Task.Factory.StartNew` планують роботу CPU в пулі потоків; поєднання задач дозволяє виражати паралельні робочі процеси:

```csharp
Task<Stats> statsTask = Task.Run(() => ComputeStats(data));
Task<Image> chartTask = Task.Run(() => RenderChart(data));
await Task.WhenAll(statsTask, chartTask);
Publish(statsTask.Result, chartTask.Result);
```

## Опції створення та дочірні задачі

```csharp
var parent = Task.Factory.StartNew(() =>
{
    Task.Factory.StartNew(() => Step1(), TaskCreationOptions.AttachedToParent);
    Task.Factory.StartNew(() => Step2(), TaskCreationOptions.AttachedToParent);
});
parent.Wait();   // чекає й на приєднані дочірні задачі та збирає їхні винятки
```

- `LongRunning`: окремий потік замість потоку пулу (для довгої блокуючої роботи).
- `PreferFairness`: планувати в порядку FIFO замість локальних LIFO-черг пулу.
- `AttachedToParent`: батьківська задача завершується лише тоді, коли завершилися дочірні. `Task.Run` використовує `DenyChildAttach` — розумне значення за замовчуванням.

## Продовження для конвеєрів

```csharp
Task<string> download = Task.Run(() => Download(url));
Task<int> words = download.ContinueWith(t => CountWords(t.Result), TaskContinuationOptions.OnlyOnRanToCompletion);
Task report = download.ContinueWith(t => Log(t.Exception!), TaskContinuationOptions.OnlyOnFaulted);
```

`Task.WhenAll(...).ContinueWith(...)` і `Task.Factory.ContinueWhenAll` запускають роботу після завершення групи. З `async`/`await` такі конвеєри зазвичай пишуться зрозуміліше.

## Планувальники задач

`TaskScheduler` вирішує, де виконуються задачі. Стандартний використовує пул потоків; `TaskScheduler.FromCurrentSynchronizationContext()` виконує продовження в потоці UI; власні планувальники можуть обмежувати конкурентність чи задавати пріоритети. `ConcurrentExclusiveSchedulerPair` дає пару планувальників у стилі читачі/писач.

## AggregateException

Паралельні операції можуть впасти в кількох місцях одночасно, тож PFX загортає винятки в `AggregateException`:

```csharp
try
{
    Parallel.ForEach(files, Process);
}
catch (AggregateException ae)
{
    ae.Flatten().Handle(ex =>
    {
        if (ex is IOException io) { Log(io); return true; }   // оброблено
        return false;                                         // необроблені кидаються знову в новому AggregateException
    });
}
```

- `InnerExceptions` містить усі; `InnerException` — перший.
- `Flatten()` зливає вкладені `AggregateException` (від дочірніх задач) в один рівень.
- `Handle(predicate)` позначає деякі як оброблені й кидає решту знову.
- `await` кидає лише **перший** внутрішній виняток; щоб побачити всі, дивіться властивість `Exception` задачі.

## Що сказати на співбесіді

- Паралельні робочі процеси виражайте задачами + `WhenAll`/продовженнями; віддавайте перевагу `Task.Run`, а не `StartNew`.
- `LongRunning` — для блокуючої роботи; дочірні задачі потрібні рідко.
- `AggregateException` збирає кілька збоїв: обробляйте через `Flatten()` + `Handle()`.
