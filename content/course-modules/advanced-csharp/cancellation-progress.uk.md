## Кооперативне скасування

.NET ніколи не вбиває операцію ззовні. Скасування **кооперативне**: викликач подає запит, а операція перевіряє його у зручних точках і акуратно зупиняється.

```csharp
using var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;          // передайте токен операції

Task work = ProcessAsync(token);
cts.Cancel();                                 // попросити скасування (кнопка Cancel, завершення роботи...)
cts.CancelAfter(TimeSpan.FromSeconds(30));    // або автоматично після тайм-ауту

async Task ProcessAsync(CancellationToken ct)
{
    foreach (var file in files)
    {
        ct.ThrowIfCancellationRequested();     // перевірка на межах циклу
        await _store.UploadAsync(file, ct);    // і передача токена вниз кожному асинхронному API
    }
}
```

- `ThrowIfCancellationRequested` кидає `OperationCanceledException`; задача завершується в стані **Canceled**, а `await` кидає виняток знову (`TaskCanceledException` походить від нього, тож ловіть `OperationCanceledException`).
- Передавайте токен **кожному** асинхронному виклику, що його приймає: `HttpClient`, EF Core, потоки, `Task.Delay`.
- Приймайте токен **останнім параметром**, зазвичай зі значенням за замовчуванням: `CancellationToken ct = default`.
- ASP.NET Core дає `HttpContext.RequestAborted` (або параметр дії `CancellationToken`), що спрацьовує, коли клієнт відʼєднався.

## Зв'язування та реєстрація

```csharp
// скасувати, коли АБО викликач скасував, АБО спрацював наш власний тайм-аут
using var linked = CancellationTokenSource.CreateLinkedTokenSource(callerToken);
linked.CancelAfter(TimeSpan.FromSeconds(10));

// виконати колбек при скасуванні (наприклад, щоб скасувати API, що не знає про токени)
using CancellationTokenRegistration reg = token.Register(() => legacyClient.Abort());
```

Звільняйте створені вами `CancellationTokenSource` (особливо з таймерами) і реєстрації.

## Тайм-аути

```csharp
var data = await GetAsync(url).WaitAsync(TimeSpan.FromSeconds(5));          // .NET 6
var winner = await Task.WhenAny(GetAsync(url), Task.Delay(5000));          // класичний спосіб
if (winner is not Task<string> t) throw new TimeoutException();
```

`WaitAsync` і трюк з `WhenAny` перестають **чекати**, але операція продовжує виконуватися у фоні. Щоб справді її зупинити, використовуйте токен з `CancelAfter`.

## Звіт про прогрес

```csharp
public async Task ImportAsync(IReadOnlyList<string> files, IProgress<int>? progress, CancellationToken ct)
{
    for (int i = 0; i < files.Count; i++)
    {
        ct.ThrowIfCancellationRequested();
        await ImportFileAsync(files[i], ct);
        progress?.Report((i + 1) * 100 / files.Count);
    }
}

// викликач (UI): Progress<T> захоплює SynchronizationContext, тож колбек виконується в потоці UI
var progress = new Progress<int>(p => ProgressBar.Value = p);
await ImportAsync(files, progress, cts.Token);
```

`Progress<T>` надсилає кожен звіт у контекст, захоплений під час його **створення**. У консольному застосунку (контексту немає) звіти виконуються в потоках пулу, можливо, не по порядку; для впорядкованого консольного виводу реалізуйте `IProgress<T>` синхронно, як у практиці.

## Task-based Asynchronous Pattern (TAP)

Домовленості, яких дотримуються асинхронні API .NET:

- назва методу закінчується на `Async`, повертає `Task`/`Task<T>`/`ValueTask`;
- повертає «гарячу» (уже запущену) задачу;
- приймає необов'язкові `CancellationToken` і/або `IProgress<T>`;
- кидає винятки аргументів синхронно, коли можливо (перевіряйте до першого `await`);
- не блокує викликача й повертається швидко.

## Що сказати на співбесіді

- Скасування кооперативне: передавайте `CancellationToken` скрізь і перевіряйте в безпечних точках.
- `OperationCanceledException` позначає задачу як Canceled; зв'язані джерела поєднують токени; `CancelAfter` додає тайм-аути.
- `IProgress<T>`/`Progress<T>` звітують про прогрес, автоматично повертаючись у потік UI.
