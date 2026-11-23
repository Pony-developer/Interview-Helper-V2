У .NET є стандартний шаблон подій, щоб кожна подія виглядала однаково для читача:

1. **Дані події** — клас, похідний від `EventArgs`, що несе подробиці (що змінилося, з якого значення на яке).
2. **Делегат** — `EventHandler<TEventArgs>`: метод із сигнатурою `void Handler(object sender, TEventArgs e)`.
3. Видавець піднімає подію з захищеного методу з назвою `OnSomething`, щоб похідні класи могли втрутитися.

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

## Читання підписника

```csharp
var t = new Thermometer();
t.TemperatureChanged += (sender, e) => Console.WriteLine(e.Old + " -> " + e.New);
t.Set(20);            // 0 -> 20
t.Set(20);            // нічого: значення не змінилося
```

## Навіщо кожна частина

- **`sender`** каже обробнику, який об'єкт підняв подію, що важливо, коли один обробник підписаний на кілька видавців.
- **`EventArgs`** несе дані, тож подію можна пізніше розширити (новим полем), не змінюючи сигнатуру обробника.
- **`OnTemperatureChanged`** — місце, де похідний клас може виконати код до або після події, і звичайне місце для виклику `?.Invoke`.

## Стандартний делегат

`EventHandler` без параметра типу — те саме, але з простим `EventArgs`, для подій без даних. `EventHandler<T>` — для всього іншого. Стандартні типи роблять код знайомим кожному програмістові .NET.
