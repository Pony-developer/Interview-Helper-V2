## Навіщо вивчати мертві патерни?

До задач (.NET 4) і async/await (C# 5) у .NET було ще два асинхронні патерни. Ви досі зустрінете їх у старому коді, старих бібліотеках і на співбесідах, і треба вміти обгортати їх у задачі.

## APM: Asynchronous Programming Model (.NET 1.0)

Пара методів `BeginXxx`/`EndXxx` з `IAsyncResult`:

```csharp
IAsyncResult ar = stream.BeginRead(buffer, 0, buffer.Length, callback: OnReadDone, state: stream);

void OnReadDone(IAsyncResult ar)
{
    var s = (Stream)ar.AsyncState!;
    int bytes = s.EndRead(ar);              // отримує результат або кидає виняток знову
}
```

- Колбек виконується в потоці пулу, коли операція завершилася.
- `EndXxx` треба викликати рівно один раз, інакше ресурси витікають.
- Ланцюжок кількох операцій означає вкладені колбеки: важко читати, важко обробляти помилки.

Обгортання APM у задачу:

```csharp
Task<int> readTask = Task.Factory.FromAsync(stream.BeginRead, stream.EndRead, buffer, 0, buffer.Length, null);
```

## EAP: Event-based Asynchronous Pattern (.NET 2.0)

Метод `XxxAsync` плюс подія `XxxCompleted`, а часто ще метод `CancelAsync` і подія `ProgressChanged`. Його створили для UI-коду: події викликаються в захопленому `SynchronizationContext`, тож обробники можуть чіпати елементи керування.

```csharp
var wc = new WebClient();
wc.DownloadStringCompleted += (s, e) =>
{
    if (e.Error != null) Show(e.Error.Message);
    else if (e.Cancelled) Show("cancelled");
    else Show(e.Result);
};
wc.DownloadStringAsync(new Uri(url));
```

Зверніть увагу на конфлікт назв: методи EAP закінчуються на `Async`, але повертають `void`. Обгортайте EAP через `TaskCompletionSource`, підписавшись на подію завершення й викликаючи `SetResult`/`SetException`/`SetCanceled`.

## BackgroundWorker

Компонент епохи WinForms, що реалізує EAP для виконання роботи у фоні з прогресом і скасуванням:

```csharp
var worker = new BackgroundWorker { WorkerReportsProgress = true, WorkerSupportsCancellation = true };
worker.DoWork += (s, e) =>
{
    for (int i = 1; i <= 100; i++)
    {
        if (worker.CancellationPending) { e.Cancel = true; return; }
        Thread.Sleep(20);
        worker.ReportProgress(i);
    }
};
worker.ProgressChanged += (s, e) => progressBar.Value = e.ProgressPercentage;   // потік UI
worker.RunWorkerCompleted += (s, e) => status.Text = e.Cancelled ? "Cancelled" : "Done";
worker.RunWorkerAsync();
```

## Сучасні відповідники

| Старе | Сучасне |
| --- | --- |
| `BeginRead`/`EndRead` | `await stream.ReadAsync(buffer, ct)` |
| `DownloadStringAsync` + подія `Completed` | `await httpClient.GetStringAsync(url, ct)` |
| `BackgroundWorker.DoWork` | `await Task.Run(() => Work(progress, ct))` |
| `CancelAsync` / `CancellationPending` | `CancellationToken` |
| `ReportProgress` + `ProgressChanged` | `IProgress<T>` / `Progress<T>` |

## Що сказати на співбесіді

- APM: `Begin`/`End` + `IAsyncResult`; обгортається через `Task.Factory.FromAsync`.
- EAP: `XxxAsync` (void) + подія `XxxCompleted`; обгортається через `TaskCompletionSource`.
- `BackgroundWorker` → `Task.Run` + `IProgress<T>` + `CancellationToken`.
