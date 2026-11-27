## Мовник і підписники

Подія дозволяє об'єкту (**мовнику**) повідомити будь-яку кількість **підписників**, що щось сталося, не знаючи, хто вони. Це патерн Observer, вбудований у мову.

```csharp
public class Thermostat
{
    public event EventHandler<TemperatureChangedEventArgs> TemperatureChanged;
}

thermostat.TemperatureChanged += OnTemperatureChanged;   // підписатися
thermostat.TemperatureChanged -= OnTemperatureChanged;   // відписатися
```

## Чому `event`, а не публічне поле-делегат

З публічним полем-делегатом будь-який код міг би:

- замінити обробники всіх: `thermostat.Changed = myHandler;`
- стерти їх: `thermostat.Changed = null;`
- сам викликати подію: `thermostat.Changed(...)`.

Ключове слово `event` обмежує зовнішній код операціями `+=` і `-=`. Лише клас, що оголосив подію, може її викликати чи скинути.

## Стандартний патерн подій

У .NET є домовленість, і якщо її дотримуватися, ваші події працюватимуть з усіма інструментами та фреймворками:

```csharp
// 1. Дані події походять від EventArgs (або це EventArgs.Empty, коли даних немає)
public class TemperatureChangedEventArgs : EventArgs
{
    public double Old { get; }
    public double New { get; }
    public TemperatureChangedEventArgs(double oldValue, double newValue) { Old = oldValue; New = newValue; }
}

public class Thermostat
{
    private double _current;

    // 2. Подія використовує EventHandler<TEventArgs>: void (object sender, TEventArgs e)
    public event EventHandler<TemperatureChangedEventArgs> TemperatureChanged;

    // 3. Захищений віртуальний метод On<НазваПодії> її викликає
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

- `sender` — це мовник, тож один обробник може обслуговувати кілька об'єктів.
- `?.Invoke` читає делегат один раз, що прибирає гонку, якщо інший потік відписується між перевіркою на null і викликом.
- Метод `protected virtual` дає підкласам змогу реагувати на подію чи пригнічувати її.

## Аксесори подій

Компілятор перетворює `public event EventHandler X;` на приватне поле-делегат плюс аксесори `add` і `remove` (потокобезпечні, через `Interlocked.CompareExchange`). Їх можна написати самому:

```csharp
private EventHandler _changed;
public event EventHandler Changed
{
    add    { _changed += value; Console.WriteLine("subscribed"); }
    remove { _changed -= value; }
}
```

Корисно, коли обробники треба зберігати деінде (наприклад, у словнику, коли клас має десятки рідко використовуваних подій, як елементи керування WinForms) або перенаправляти підписки іншому об'єкту.

## Пастки подій

- **Витоки пам'яті**: підписник живе стільки, скільки мовник. Завжди відписуйтеся від довгоживучих видавців (статичні події, сервіси на весь застосунок).
- **Винятки**: якщо один обробник кидає виняток, наступні не виконуються, а виняток отримує той, хто викликав подію.
- **Потік**: обробники виконуються синхронно в потоці, що викликав подію. UI-підписнику може знадобитися повернутися в потік UI.

## Що сказати на співбесіді

- `event` = делегат + інкапсуляція: сторонній код може лише підписуватися й відписуватися.
- Стандартний патерн: підклас `EventArgs`, `EventHandler<T>`, `protected virtual OnX`, `?.Invoke(this, e)`.
- Забута відписка — класичний витік керованої пам'яті.
