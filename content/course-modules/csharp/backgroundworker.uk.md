`BackgroundWorker` (у `System.ComponentModel`) — старіший компонент для застосунків з графічним інтерфейсом. Він виконує метод у потоці з пулу і повідомляє прогрес та результат потоку UI через події, тож форма оновлюється безпечно:

```csharp
// WinForms, ілюстрація. Налаштовується в конструкторі форми або в дизайнері.
var worker = new BackgroundWorker();
worker.WorkerReportsProgress = true;

worker.DoWork += (s, e) =>                 // виконується у фоновому потоці: тут немає UI
{
    for (int i = 1; i <= 10; i++)
    {
        Thread.Sleep(200);
        worker.ReportProgress(i * 10);     // надсилаємо відсоток у UI
    }
    e.Result = "finished";
};

worker.ProgressChanged += (s, e) =>        // виконується в потоці UI: мітку можна оновлювати
{
    progressLabel.Text = e.ProgressPercentage + "%";
};

worker.RunWorkerCompleted += (s, e) =>     // також у потоці UI
{
    resultLabel.Text = (string)e.Result;
};

worker.RunWorkerAsync();                   // запускає DoWork
```

## Три події

- `DoWork`: фонова робота. Вона не має торкатися елементів керування.
- `ProgressChanged`: прогрес, про який повідомив `ReportProgress`, доставляється в потік UI.
- `RunWorkerCompleted`: фінальний результат або виняток, доставляється в потік UI.

## Де він стоїть сьогодні

`BackgroundWorker` розв'язує ту саму задачу, що `Task` з `ContinueWith` і `async/await` в останньому модулі. Він ще з'являється в старому коді й підручниках. Для нового коду звичний вибір — `async/await` з `IProgress<T>`, бо потрібно менше коду, а хід методу лишається в одному місці.
