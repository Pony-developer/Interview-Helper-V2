## Ієрархія винятків

```text
System.Exception
├── SystemException
│   ├── ArgumentException → ArgumentNullException, ArgumentOutOfRangeException
│   ├── InvalidOperationException → ObjectDisposedException
│   ├── NullReferenceException, IndexOutOfRangeException, InvalidCastException
│   ├── FormatException, NotSupportedException, NotImplementedException
│   ├── IOException → FileNotFoundException, DirectoryNotFoundException
│   ├── OperationCanceledException → TaskCanceledException
│   └── OutOfMemoryException, StackOverflowException
├── AggregateException          (кілька винятків із задач / Parallel)
└── ваші власні: OrderNotFoundException, ...
```

Кидайте найконкретніший вбудований тип, що підходить (`ArgumentNullException` для null-аргументу, `InvalidOperationException`, коли об'єкт у неправильному стані). Створюйте власний, коли викликачам треба перехоплювати його окремо:

```csharp
public sealed class InsufficientFundsException : Exception
{
    public decimal Missing { get; }
    public InsufficientFundsException(decimal missing)
        : base($"Not enough money: {missing} missing") => Missing = missing;
}
```

## catch, фільтри й порядок

```csharp
try { await client.SendAsync(request); }
catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
{
    // сюди потрапить лише 429; інші HttpRequestException шукатимуть обробник далі
}
catch (TaskCanceledException) when (!ct.IsCancellationRequested)
{
    // тайм-аут, а не скасування користувачем
}
```

- Блоки catch перевіряються **згори донизу**; найконкретніші ставте першими (компілятор відхиляє недосяжний блок).
- **Фільтр** винятку (`when`) обчислюється *до* розкручування стеку, тож якщо він повертає false, початковий стек не зачеплено — чудово для логування й налагодження.
- Перехоплюйте лише те, що можете обробити. Пропустити виняток до глобального обробника (ASP.NET Core `UseExceptionHandler`, `ProblemDetails`) зазвичай краще, ніж поглинути його.

## Що відбувається, коли кидають виняток

1. Рантайм створює об'єкт винятку, фіксує стек і шукає вгору стеком викликів відповідний обробник (виконуючи фільтри).
2. Знайшовши його, рантайм **розкручує** стек: кожен `finally` (і `Dispose` від `using`) між місцем кидка й обробником виконується, від найглибшого.
3. Виконується блок `catch`; далі виконання продовжується після інструкції `try`.
4. Якщо нічого не підійшло, процес завершується з «необробленим винятком».

```text
A() { try { B(); } catch { log("caught"); } }
B() { try { C(); } finally { log("B finally"); } }
C() { throw new Exception(); }
→ "B finally", потім "caught"
```

## Стек викликів (П15)

У кожного потоку свій стек. Виклик методу кладе **кадр** (адреса повернення, аргументи, локальні змінні, збережені регістри); повернення знімає його. Вікно *Call Stack* у відладчику та `Exception.StackTrace` / `Environment.StackTrace` показують стек. Пов'язані ключові слова: `throw`, `try`/`catch`/`finally`, `return`, `stackalloc` (виділяє буфер у стеку), `ref`-локальні змінні та `Span<T>` (типи лише для стеку). Стек за замовчуванням ≈1 МБ, тому неконтрольована рекурсія закінчується `StackOverflowException`, що вбиває процес.

## Винятки й асинхронний код

Винятки в `async`-методі зберігаються в поверненому `Task` і перекидаються на `await`. `Task.WhenAll` на `await` кидає перший виняток, а властивість `Exception` задачі містить `AggregateException` з усіма. `.Wait()` і `.Result` обгортають винятки в `AggregateException`; `GetAwaiter().GetResult()` — ні.

## Добрі практики

- Не використовуйте винятки для звичайного керування потоком (для цього є `TryParse`, `TryGetValue`).
- Ніколи не пишіть мовчазний `catch (Exception) { }`.
- Обгортаючи, зберігайте початковий виняток як `InnerException`.
- Перекидайте через `throw;`, а якщо треба перекинути пізніше й деінде — `ExceptionDispatchInfo.Capture(ex).Throw()`.
- Перевіряйте аргументи на початку: `ArgumentNullException.ThrowIfNull(order);`.
