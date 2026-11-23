A subscription keeps the subscriber alive. The publisher holds a reference to every handler, so as long as the event exists, the subscriber cannot be collected by the garbage collector, even if nothing else uses it. This is the most common event bug, a **memory leak**.

```csharp
class Logger
{
    public Logger(Button button)
    {
        button.Clicked += OnClicked;       // the button now references this logger
    }

    private void OnClicked() { Console.WriteLine("click"); }
}

var button = new Button();                  // a long-lived publisher
for (int i = 0; i < 1000; i++)
{
    var logger = new Logger(button);        // each logger is subscribed and never unsubscribed
}
// 1000 loggers stay in memory, and each one still runs on every click
```

## The fix: unsubscribe

Remove the handler with `-=`, using the same method group:

```csharp
class Logger : IDisposable
{
    private readonly Button button;

    public Logger(Button button)
    {
        this.button = button;
        button.Clicked += OnClicked;
    }

    private void OnClicked() { Console.WriteLine("click"); }

    public void Dispose()
    {
        button.Clicked -= OnClicked;       // the button no longer keeps this logger alive
    }
}
```

The pattern is the same as for other resources: the subscriber is created, used, and then disposed.

## Lambdas cannot be removed by a new lambda

A lambda creates a new delegate object each time it is written, so `-=` with a new lambda removes nothing. Keep a reference to the handler if you may need to unsubscribe:

```csharp
Action handler = () => Console.WriteLine("click");
button.Clicked += handler;
button.Clicked -= handler;                  // works: the same object is removed
```

## Why it matters

A forgotten subscription does three things at once: it leaks memory, it keeps doing work for an object that is no longer used, and it may call a handler that depends on objects that have already been disposed.
