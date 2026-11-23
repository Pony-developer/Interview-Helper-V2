In a GUI application (WinForms, WPF) there is one special thread: the **UI thread**. Only this thread may touch the controls: buttons, labels, text boxes. If a background thread writes to a label directly, the program fails with an exception, or behaves in a random way.

The background thread must hand the work back to the UI thread. This is called **marshalling**, and the methods are `Invoke` (waits for the UI thread) and `BeginInvoke` (does not wait).

```csharp
// WinForms, inside a form class. This code does not run in the console.
void ShowProgress(int percent)
{
    if (label.InvokeRequired)                       // are we on a different thread?
    {
        label.BeginInvoke(new Action(() => ShowProgress(percent)));   // ask the UI thread to run this again
        return;
    }
    label.Text = percent + "%";                     // now we are on the UI thread: safe to touch the label
}
```

## Invoke and BeginInvoke

- `Invoke` sends the action to the UI thread and **waits** until it is done. It is simple, but the background thread is blocked during the wait.
- `BeginInvoke` sends the action and **continues at once**. The UI thread runs it later. Use it when the background thread has other work to do.

## The old delegate BeginInvoke

`BeginInvoke` is also a method that every delegate had in old .NET Framework versions, for asynchronous calls of the delegate itself. Modern .NET removed it. In new code, use `Task` and `async/await` for that purpose, as the last module shows.

## Why `InvokeRequired`

The check `InvokeRequired` tells the code whether it runs on the UI thread. The same method can then be called from both places, and the marshalling happens only when needed.
