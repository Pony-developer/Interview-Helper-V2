## Задача, яку ви завершуєте самі

Більшість задач створюють `Task.Run` чи async-методи. `TaskCompletionSource<T>` створює задачу, яку завершуєте **ви**, коли й як завгодно:

```csharp
var tcs = new TaskCompletionSource<int>();
Task<int> task = tcs.Task;          // це віддаємо назовні

// пізніше, будь-звідки:
tcs.SetResult(42);                  // або SetException(ex) / SetCanceled()
// версії Try* повертають false замість винятку, якщо задача вже завершена
```

Жодного потоку не задіяно: задача просто чекає, доки хтось не викличе один із методів `Set`. Тому `TaskCompletionSource` — універсальний адаптер, що перетворює **будь-який** сигнал завершення на задачу.

## Обгортання API на колбеках

```csharp
public static Task<Location> LocateAsync(this LegacyGps gps)
{
    var tcs = new TaskCompletionSource<Location>(TaskCreationOptions.RunContinuationsAsynchronously);
    gps.Locate(
        onFix: loc => tcs.TrySetResult(loc),
        onError: err => tcs.TrySetException(new GpsException(err)));
    return tcs.Task;
}

var where = await gps.LocateAsync();
```

## Обгортання події

```csharp
public static Task<string> NextMessageAsync(this ChatClient client)
{
    var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
    EventHandler<string>? handler = null;
    handler = (_, msg) =>
    {
        client.MessageReceived -= handler;    // відписатися: уникнути витоків і подвійного завершення
        tcs.TrySetResult(msg);
    };
    client.MessageReceived += handler;
    return tcs.Task;
}
```

## Навіщо RunContinuationsAsynchronously

За замовчуванням `SetResult` виконує продовження, що очікують, **синхронно, у потоці, який викликав SetResult**. Якщо цей потік тримає блокування чи є потоком колбеку якоїсь бібліотеки, продовження виконається всередині нього, що може спричинити взаємоблокування чи помилки повторного входу. `TaskCreationOptions.RunContinuationsAsynchronously` натомість ставить продовження в чергу. Робіть це значенням за замовчуванням.

## Task.Delay побудовано так само

Концептуально `Task.Delay` — це `TaskCompletionSource` плюс таймер:

```csharp
static Task Delay(int ms)
{
    var tcs = new TaskCompletionSource<object?>();
    var timer = new System.Timers.Timer(ms) { AutoReset = false };
    timer.Elapsed += (_, _) => { timer.Dispose(); tcs.SetResult(null); };
    timer.Start();
    return tcs.Task;
}
```

Тож тисяча одночасних `await Task.Delay(1000)` використовує тисячу таймерів і **нуль** заблокованих потоків, на відміну від тисячі викликів `Thread.Sleep(1000)`. У цьому суть того, чому асинхронне I/O масштабується: очікування не потребує потоку.

## Тайм-аути та скасування з TCS

```csharp
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
using (cts.Token.Register(() => tcs.TrySetCanceled()))
{
    var result = await tcs.Task;   // через 5 с кидає TaskCanceledException
}

// .NET 6: будь-яку задачу можна очікувати з тайм-аутом
var data = await SlowAsync().WaitAsync(TimeSpan.FromSeconds(5));
```

## Що сказати на співбесіді

- `TaskCompletionSource<T>` створює задачу, яку завершують вручну; потік не використовується.
- Він адаптує колбеки, події та інші сигнали до `await`.
- Створюйте його з `RunContinuationsAsynchronously`; використовуйте `TrySet*`, коли її можуть завершити кілька шляхів.
