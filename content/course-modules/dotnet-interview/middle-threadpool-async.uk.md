## Класичне взаємне блокування sync-over-async (П119)

```csharp
// WinForms / WPF / класичний ASP.NET (у них є SynchronizationContext)
private void Button_Click(object sender, EventArgs e)
{
    var text = LoadAsync().Result;      // 1. блокує UI-потік, чекаючи на задачу
}

private async Task<string> LoadAsync()
{
    var s = await http.GetStringAsync(url);   // 2. коли завантаження завершиться, продовження
    return s.ToUpper();                        //    має виконатися в UI-потоці — а він заблокований → deadlock
}
```

Два виправлення: асинхронність до кінця (`private async void Button_Click(...) { var text = await LoadAsync(); }`) і в коді бібліотек `await http.GetStringAsync(url).ConfigureAwait(false)`, щоб продовженню не був потрібен захоплений контекст. В ASP.NET Core немає `SynchronizationContext`, тож саме такого взаємного блокування там не буває — але блокування однаково марнує потоки.

`ConfigureAwait(false)` стосується одного `await`; код після нього може виконуватися на потоці пулу, тож не чіпайте там UI-контроли. У .NET 8 з'явився `ConfigureAwaitOptions` (наприклад, `SuppressThrowing`, `ForceYielding`).

## Голодування пулу потоків (П120)

```csharp
// Блокуюче: кожен запит тримає потік протягом усього виклику до БД
[HttpGet] public Order Get(int id) => _db.Orders.Find(id);                       // або ...Async().Result

// Асинхронне: потік повертається в пул, поки працює база
[HttpGet] public async Task<Order?> Get(int id) => await _db.Orders.FindAsync(id);
```

З 16 потоками й запитом на 200 мс блокуюча версія обслуговує щонайбільше 16 / 0,2 = **80 запитів на секунду**, а решта чекає в черзі; пул додає потоки повільно (приблизно один-два на секунду понад мінімум), тож під сплеском затримка вибухає. Асинхронна версія не тримає жодного потоку протягом цих 200 мс; пропускну здатність обмежує база, а не потоки.

Симптоми голодування: затримка росте, а CPU низький; зростає `ThreadPool.PendingWorkItemCount` / «ThreadPool Queue Length» у `dotnet-counters`; у дампі багато потоків, заблокованих у `Task.Wait` / `.Result`. Виправляйте блокуючі виклики; збільшення `SetMinThreads` лише виграє час.

## Усередині ThreadPool (П121)

```text
            ┌──────────── глобальна черга (FIFO) ◄── Task.Run / QueueUserWorkItem з потоків поза пулом
worker 1 ── локальна черга (LIFO) ◄── задачі, створені кодом, що працює на worker 1
worker 2 ── локальна черга        ── вільний потік краде з хвоста чужих черг
worker N ── ...
Завершення I/O: ОС сигналізує про завершену асинхронну операцію → її продовження стає в чергу пулу
```

Життєвий цикл задачі: поставити в чергу → вільний робочий потік її забирає (спершу зі своєї локальної черги, потім із глобальної, потім краде) → виконує делегат до кінця на цьому потоці → потік повертається по наступну роботу. Потоки не «повертаються» — вони просто завершують делегат і беруть наступну задачу. Вільні потоки з часом завершуються.

Додавання потоків: пул тримає щонайменше `MinThreads` (за замовчуванням = кількість ядер) і використовує алгоритм **hill climbing**, щоб додавати потоки, коли пропускна здатність росте; коли задачі блокуються, детектор голодування додає приблизно один потік на секунду (у нових версіях .NET швидше для блокуючих очікувань на задачі).

Довга CPU-робота не повинна хвилинами сидіти на потоках пулу: використовуйте `Task.Factory.StartNew(…, TaskCreationOptions.LongRunning)` (окремий потік) або `BackgroundService`.

## Асинхронність і паралелізм ще раз

```csharp
// Обмежене I/O: конкурентність без потоків
var pages = await Task.WhenAll(urls.Select(u => http.GetStringAsync(u)));

// Обмежене процесором: паралелізм на кількох ядрах
Parallel.ForEach(images, new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount }, Resize);

// Обидва: обмежити конкурентність асинхронної роботи
await Parallel.ForEachAsync(urls, new ParallelOptions { MaxDegreeOfParallelism = 8 }, async (u, ct) => await DownloadAsync(u, ct));
```
