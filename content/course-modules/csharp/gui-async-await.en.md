The keywords `async` and `await` let the same GUI code read like ordinary sequential code, while it does not block the UI thread:

```csharp
// WinForms, illustrative.
private async void calculateButton_Click(object sender, EventArgs e)
{
    resultLabel.Text = "working...";
    int result = await Task.Run(() => Compute());   // the UI thread is free while Compute runs
    resultLabel.Text = result.ToString();           // back on the UI thread after the await
}
```

## What await does

When execution reaches `await`, the method **returns** to its caller, so the UI thread keeps processing messages. When the awaited task finishes, the rest of the method runs again. In a GUI application, that rest runs on the UI thread, which is why the label may be updated directly.

```text
click handler starts
  resultLabel.Text = "working..."
  await Task.Run(...)      -> returns to the UI loop; the window stays responsive
  ... five seconds later, the task is complete ...
  resultLabel.Text = "42"  -> runs on the UI thread again
```

## The one exception: async void

A button handler is the only common place for `async void`, because the event signature has no return type. Everywhere else, use `async Task` or `async Task<T>`, so that the caller can wait for the result and see exceptions. Exceptions in `async void` cannot be caught by the caller and may crash the program.

## Summary

`await` replaces the `ContinueWith` callbacks of the previous lecture with ordinary code. The last module of the course, about async and tasks, explains the mechanism in detail.
