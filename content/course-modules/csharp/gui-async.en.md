The fix for a frozen window is to run the long work **asynchronously**: the UI thread starts the work and returns to processing messages at once, and the result comes back later, when it is ready.

The pattern has three parts:

1. The UI thread starts the work on another thread (or the thread pool).
2. The work reports progress or the result.
3. The report is delivered to the UI thread, which updates the controls.

```csharp
// WinForms, illustrative. The work runs on a pool thread, the update runs on the UI thread.
private void calculateButton_Click(object sender, EventArgs e)
{
    resultLabel.Text = "working...";
    Task.Run(() => Compute())                       // start on another thread
        .ContinueWith(t => resultLabel.Text = t.Result.ToString(),
                      TaskScheduler.FromCurrentSynchronizationContext());   // deliver to the UI thread
}

private int Compute()
{
    Thread.Sleep(5000);                             // safe now: the UI thread keeps working
    return 42;
}
```

## The important ideas

- The button handler returns quickly, so the window stays responsive during the five seconds.
- `TaskScheduler.FromCurrentSynchronizationContext()` makes the continuation run on the UI thread, where touching the label is allowed.
- Asynchronous work is also called a **background** operation in the interface: the program keeps showing the window and its progress.

The next lecture shows the same idea written with `async` and `await`, which keeps the code in one readable piece.
