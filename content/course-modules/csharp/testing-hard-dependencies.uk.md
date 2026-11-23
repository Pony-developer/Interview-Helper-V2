Деякий код важко тестувати не тому, що він складний, а тому, що він читає щось, чого тест не контролює: поточний час, випадкове число, мережу, файлову систему. Ліки завжди однакові: **зробити прихований вхід явною залежністю** і дати тесту дублера, яким він керує.

## Час

```csharp
public bool IsExpired(Subscription s)
{
    return s.EndsAt < DateTime.UtcNow;       // прихований вхід
}
```

Тест цього методу дає різні відповіді залежно від того, коли він запущений, і не може перевірити «що буде завтра», не дочекавшись завтра. Починаючи з .NET 8 у BCL є абстракція саме для цього — абстрактний клас **`TimeProvider`**:

```csharp
public class SubscriptionChecker
{
    private readonly TimeProvider time;
    public SubscriptionChecker(TimeProvider time) { this.time = time; }

    public bool IsExpired(Subscription s) => s.EndsAt < time.GetUtcNow();
}

// Продакшн: services.AddSingleton(TimeProvider.System);
```

Пакет `Microsoft.Extensions.TimeProvider.Testing` містить **`FakeTimeProvider`** — годинник, що стоїть, доки тест його не посуне:

```csharp
var time = new FakeTimeProvider(new DateTimeOffset(2025, 3, 1, 12, 0, 0, TimeSpan.Zero));
var checker = new SubscriptionChecker(time);
var sub = new Subscription { EndsAt = time.GetUtcNow().AddDays(1) };

Assert.False(checker.IsExpired(sub));
time.Advance(TimeSpan.FromDays(2));
Assert.True(checker.IsExpired(sub));
```

`TimeProvider` також створює таймери, а `Task.Delay` має перевантаження, що приймає його, тож код із затримками й тайм-аутами стає тестованим: `FakeTimeProvider.Advance` запускає таймери, чий час настав, і тест «повторити через 30 секунд» виконується за мілісекунду. На старіших версіях .NET класичне рішення — власний інтерфейс `IClock` з однією властивістю, саме те, що ви збудуєте в наступній практиці.

Та сама ідея стосується **випадкових чисел** (впровадити `Random` із фіксованим зерном або `IRandom`) та **ідентифікаторів** (`IIdGenerator` замість `Guid.NewGuid()` посеред логіки).

## Асинхронний код

```csharp
[Fact]
public async Task Import_BadFile_Throws()
{
    var ex = await Assert.ThrowsAsync<FormatException>(() => importer.ImportAsync("bad.csv"));
    Assert.Equal("Line 3: missing price", ex.Message);
}
```

Правила:

- Тест — `async Task`. Не `async void`: фреймворк не може його дочекатися.
- Ставте `await` перед кожним викликом і кожним `Assert.ThrowsAsync`. Забутий `await` дає тест, який нічого не перевіряє.
- Жодних `.Result` чи `.Wait()`: вони блокують потік і можуть спричинити взаємне блокування.
- Не чекайте на фонову роботу через `Thread.Sleep(500)` чи `Task.Delay`. Пів секунди — забагато на вашому ноутбуці і замало на завантаженому сервері збирання. Це найчастіше джерело **нестабільних (flaky) тестів**. Чекайте натомість на сигнал: `TaskCompletionSource`, який завершує фейк, `SemaphoreSlim` або цикл, що перевіряє умову з щедрим тайм-аутом.
- Тестуйте скасування явно: передайте скасований токен і очікуйте `OperationCanceledException` (`Assert.ThrowsAnyAsync`, бо `TaskCanceledException` — його підклас).

## HttpClient

`HttpClient` — не інтерфейс, і мокати його методи — крихко. Але кожен запит проходить через **`HttpMessageHandler`**, а його можна підмінити:

```csharp
class StubHandler : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, HttpResponseMessage> respond;
    public readonly List<HttpRequestMessage> Requests = new List<HttpRequestMessage>();

    public StubHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) { this.respond = respond; }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Requests.Add(request);
        return Task.FromResult(respond(request));
    }
}

[Fact]
public async Task GetRate_ReadsTheJson()
{
    var handler = new StubHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
    {
        Content = new StringContent("{\"rate\":0.92}")
    });
    var client = new HttpClient(handler) { BaseAddress = new Uri("https://rates.test/") };
    var rates = new RatesClient(client);

    decimal rate = await rates.GetRateAsync("USD", "EUR");

    Assert.Equal(0.92m, rate);
    Assert.Equal("/rates?from=USD&to=EUR", handler.Requests[0].RequestUri.PathAndQuery);
}
```

Тест перевіряє справжній код `RatesClient`: побудову URL, розбір JSON і що станеться при 500 чи тайм-ауті (нехай стаб це поверне або кине). Бібліотеки на кшталт RichardSzalay.MockHttp і WireMock.Net дають для того самого зручний API; WireMock.Net запускає справжній локальний HTTP-сервер, що корисно для інтеграційних тестів.

## Файли, логи й конфігурація

- **Файли.** Код, що приймає `Stream` чи `TextReader` замість шляху, легко тестувати: передайте `MemoryStream` чи `StringReader`. Для коду, що справді працює з каталогами, пакет `System.IO.Abstractions` пропонує `IFileSystem` і `MockFileSystem` у пам'яті.
- **Логування.** Передайте `NullLogger<T>.Instance`, коли тесту байдуже. Коли запис у лозі *і є* поведінкою (попередження аудиту), використайте `FakeLogger<T>` з `Microsoft.Extensions.Diagnostics.Testing` і перевірте зібрані ним записи.
- **Опції.** `Options.Create(new SmtpOptions { Host = "localhost" })` дає `IOptions<T>` без жодних конфігураційних файлів.

## Де межа

Робити все впроваджуваним теж коштує. Не загортайте `Math.Max` чи `string.Join` в інтерфейси: вони швидкі й детерміновані. Впроваджуйте те, що **недетерміноване, повільне або зовнішнє**. Якщо класу потрібні годинник, генератор випадкових чисел, три репозиторії і HTTP-клієнт, тести кажуть вам, що він робить забагато.
