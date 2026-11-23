.NET has a standard pattern for events, so that every event looks the same to the reader:

1. The **event data** is a class derived from `EventArgs`, which carries the details (what changed, from what value to what value).
2. The **delegate** is `EventHandler<TEventArgs>`: a method with the signature `void Handler(object sender, TEventArgs e)`.
3. The publisher raises the event from a protected method named `OnSomething`, so that derived classes can intercept it.

```csharp
class TemperatureEventArgs : EventArgs
{
    public int Old { get; }
    public int New { get; }

    public TemperatureEventArgs(int oldValue, int newValue)
    {
        Old = oldValue;
        New = newValue;
    }
}

class Thermometer
{
    private int current;

    public event EventHandler<TemperatureEventArgs> TemperatureChanged;

    public void Set(int value)
    {
        if (value == current) return;
        int old = current;
        current = value;
        OnTemperatureChanged(new TemperatureEventArgs(old, value));
    }

    protected virtual void OnTemperatureChanged(TemperatureEventArgs e)
    {
        TemperatureChanged?.Invoke(this, e);
    }
}
```

## Reading a subscriber

```csharp
var t = new Thermometer();
t.TemperatureChanged += (sender, e) => Console.WriteLine(e.Old + " -> " + e.New);
t.Set(20);            // 0 -> 20
t.Set(20);            // nothing: the value did not change
```

## Why each piece is there

- **`sender`** tells the handler which object raised the event, which matters when one handler is subscribed to several publishers.
- **`EventArgs`** carries the data, so the event can grow later (a new field) without changing the handler signature.
- **`OnTemperatureChanged`** is the place where a derived class can run code before or after the event, and it is the usual place for the `?.Invoke` call.

## The standard delegate

`EventHandler` without a type parameter is the same, with plain `EventArgs`, for events that carry no data. `EventHandler<T>` is for everything else. Using the standard types makes the code familiar to every .NET programmer.
