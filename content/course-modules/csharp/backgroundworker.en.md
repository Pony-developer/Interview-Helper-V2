`BackgroundWorker` (in `System.ComponentModel`) is an older component for GUI applications. It runs a method on a thread from the pool, and it reports progress and the result to the UI thread through events, so that the form is updated safely:

```csharp
// WinForms, illustrative. Set up in the form's constructor or in the designer.
var worker = new BackgroundWorker();
worker.WorkerReportsProgress = true;

worker.DoWork += (s, e) =>                 // runs on a background thread: no UI here
{
    for (int i = 1; i <= 10; i++)
    {
        Thread.Sleep(200);
        worker.ReportProgress(i * 10);     // send a percentage to the UI
    }
    e.Result = "finished";
};

worker.ProgressChanged += (s, e) =>        // runs on the UI thread: the label may be updated
{
    progressLabel.Text = e.ProgressPercentage + "%";
};

worker.RunWorkerCompleted += (s, e) =>     // also on the UI thread
{
    resultLabel.Text = (string)e.Result;
};

worker.RunWorkerAsync();                   // starts DoWork
```

## The three events

- `DoWork`: the background work. It must not touch the controls.
- `ProgressChanged`: the progress reported by `ReportProgress`, delivered on the UI thread.
- `RunWorkerCompleted`: the final result or the exception, delivered on the UI thread.

## Where it fits today

`BackgroundWorker` solves the same problem as `Task` with `ContinueWith`, and as `async/await` in the last module. It still appears in older code and in tutorials. For new code, `async/await` with `IProgress<T>` is the usual choice, because it needs less code and keeps the flow of the method in one place.
