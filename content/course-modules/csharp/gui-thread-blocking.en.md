The UI thread has one job that must never stop: it processes messages from the user (clicks, typing, painting the window). If it runs a long operation, it cannot process these messages, and the window **freezes**: it does not repaint, does not respond, and Windows may show "Not responding".

```csharp
// WinForms button handler. This code does not run in the console.
private void calculateButton_Click(object sender, EventArgs e)
{
    Thread.Sleep(5000);                     // the window is frozen for five seconds
    resultLabel.Text = "done";
}
```

## What happens during the freeze

- the window stops repainting, so moving another window over it leaves a blank area;
- clicks and key presses queue up, and then all run at once when the thread is free again;
- the user thinks the program has crashed.

## The naive fix does not work

Moving the work to a background thread, and then writing the result directly into `resultLabel.Text`, is wrong: only the UI thread may touch the label. The next lectures show the correct ways: `BeginInvoke` for marshalling, `BackgroundWorker` for work with progress, and `async/await` for the modern style.

## The rule

Keep the UI thread free. Every operation longer than about 50 milliseconds should run elsewhere, and its result should come back to the UI thread through a safe channel.
