## Broadcaster and subscribers

An event lets an object (the **broadcaster**) notify any number of **subscribers** that something happened, without knowing who they are. It's the Observer pattern built into the language.

```csharp
public class Thermostat
{
    public event EventHandler<TemperatureChangedEventArgs> TemperatureChanged;
}

thermostat.TemperatureChanged += OnTemperatureChanged;   // subscribe
thermostat.TemperatureChanged -= OnTemperatureChanged;   // unsubscribe
```

## Why `event` and not a public delegate field

With a plain public delegate field, any code could:

- replace everyone's handlers: `thermostat.Changed = myHandler;`
- clear them: `thermostat.Changed = null;`
- raise the event itself: `thermostat.Changed(...)`.

The `event` keyword restricts outside code to `+=` and `-=`. Only the declaring class can invoke the event or reset it.

## The standard event pattern

.NET has a convention, and following it makes your events work with every tool and framework:

```csharp
// 1. Event data derives from EventArgs (or is EventArgs.Empty when there's no data)
public class TemperatureChangedEventArgs : EventArgs
{
    public double Old { get; }
    public double New { get; }
    public TemperatureChangedEventArgs(double oldValue, double newValue) { Old = oldValue; New = newValue; }
}

public class Thermostat
{
    private double _current;

    // 2. The event uses EventHandler<TEventArgs>: void (object sender, TEventArgs e)
    public event EventHandler<TemperatureChangedEventArgs> TemperatureChanged;

    // 3. A protected virtual On<EventName> method raises it
    protected virtual void OnTemperatureChanged(TemperatureChangedEventArgs e)
        => TemperatureChanged?.Invoke(this, e);

    public double Current
    {
        get => _current;
        set
        {
            if (_current == value) return;
            var old = _current;
            _current = value;
            OnTemperatureChanged(new TemperatureChangedEventArgs(old, value));
        }
    }
}
```

- `sender` is the broadcaster, so one handler can serve several objects.
- `?.Invoke` reads the delegate once, which avoids a race if another thread unsubscribes between the null check and the call.
- The `protected virtual` method lets subclasses react to or suppress the event.

## Event accessors

The compiler turns `public event EventHandler X;` into a private delegate field plus `add` and `remove` accessors (thread-safe, using `Interlocked.CompareExchange`). You can write them yourself:

```csharp
private EventHandler _changed;
public event EventHandler Changed
{
    add    { _changed += value; Console.WriteLine("subscribed"); }
    remove { _changed -= value; }
}
```

Useful when you want to store handlers elsewhere (for example, in a dictionary when a class has dozens of rarely used events, the way WinForms controls do), or forward subscriptions to another object.

## Event pitfalls

- **Memory leaks**: a subscriber stays alive as long as the broadcaster does. Always unsubscribe from long-lived publishers (static events, app-wide services).
- **Exceptions**: if one handler throws, later handlers don't run and the exception goes to whoever raised the event.
- **Thread**: handlers run synchronously on the thread that raised the event. A UI subscriber may need to marshal back to the UI thread.

## Interview takeaways

- `event` = delegate + encapsulation: outsiders can only subscribe and unsubscribe.
- Standard pattern: `EventArgs` subclass, `EventHandler<T>`, `protected virtual OnX`, `?.Invoke(this, e)`.
- Forgetting to unsubscribe is a classic managed memory leak.
