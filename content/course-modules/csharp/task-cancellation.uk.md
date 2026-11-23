Скасування в .NET — **кооперативне**: програма просить роботу зупинитися, а робота перевіряє запит і зупиняється сама. Ніщо не вбиває задачу ззовні, бо це залишило б спільні дані в зламаному стані.

Частини:

- `CancellationTokenSource` (джерело) тримає запит. Виклик `Cancel()` надсилає його;
- `CancellationToken` (токен) передають роботі, яка його перевіряє.

```csharp
static async Task<int> CountAsync(CancellationToken token)
{
    int count = 0;
    for (int i = 0; i < 1000; i++)
    {
        token.ThrowIfCancellationRequested();   // зупиняємось тут, якщо хтось попросив
        await Task.Delay(10, token);            // сама затримка також зупиняється при скасуванні
        count++;
    }
    return count;
}

var source = new CancellationTokenSource();
Task<int> work = CountAsync(source.Token);
await Task.Delay(100);
source.Cancel();                                // просимо роботу зупинитися

try
{
    await work;
}
catch (OperationCanceledException)
{
    Console.WriteLine("cancelled");             // звичайний спосіб, яким скасована задача повідомляє про себе
}
```

## Частини

- `ThrowIfCancellationRequested()` кидає `OperationCanceledException`, коли токен скасовано. Викликайте його регулярно всередині довгих циклів.
- Передавайте токен методам, що його приймають (`Task.Delay(ms, token)`, виклики файлів і мережі). Вони зупиняються раніше, коли його скасовано.
- Скасована задача має `IsCanceled`, а її очікування кидає `OperationCanceledException`.

## Таймаути

Таймаут — скасування, що запускається саме: `source.CancelAfter(5000)` скасовує через п'ять секунд. Вживайте його замість ручного таймера.

## Правило

Кожна довга операція має приймати `CancellationToken`, а кожен цикл, що може тривати довго, має його перевіряти. Програма, яку не можна скасувати, змушує користувача чекати роботу, яка йому вже не потрібна.
